"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";
import { vapi } from '@/lib/vapi.sdk';
import { useRouter } from "next/navigation";
import { saveInterview } from "@/lib/actions/auth.action";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";

// enum for call status
enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

export default function Agent({ userName, userId, type, interviewId, questions }: AgentProps) {
  const router = useRouter();
  // you may use userId/type later (auth, logs, analytics, etc.)
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [callStatus, setCallStatus] = useState<CallStatus>(
    CallStatus.INACTIVE
  );
const [messages, setMessages] = useState<SavedMessage[]>([]);
    const lastMessage = messages[messages.length - 1];

    useEffect(() => {
      const onCallStart = () => {
        console.log("✅ Call started event received");
        setCallStatus(CallStatus.ACTIVE);
      };

      const onCallEnd = () => {
        console.log("✅ Call ended event received");
        setCallStatus(CallStatus.FINISHED);
      };

      interface VapiMessage {
        type: string;
        transcriptType?: string;
        role: string;
        transcript: string;
      }

      const onMessage = (message: VapiMessage) => {
        console.log("📨 Message received:", message);
        if (message.type === "transcript" && message.transcriptType === "final") {
          const newMessage: SavedMessage = {
            role: message.role as "user" | "system" | "assistant",
            content: message.transcript,
          };
          setMessages((prev) => [...prev, newMessage]);
          console.log("💬 Transcript added:", newMessage);
        }
      };

      const onSpeechStart = () => {
        console.log("🎤 User speaking started");
        setIsSpeaking(true);
      };

      const onSpeechEnd = () => {
        console.log("🔇 User speaking ended");
        setIsSpeaking(false);
      };

      const onError = (error: Error) => {
        console.error("❌ Vapi Error:", error);
        console.error("❌ Error details:", {
          message: error?.message,
          name: error?.name,
          stack: error?.stack,
          toString: error?.toString()
        });
        setCallStatus(CallStatus.INACTIVE);
      };

      const onVolumeLevel = (level: number) => {
        console.log("🔊 Volume level:", level);
      };

      vapi.on("call-start", onCallStart);
      vapi.on("call-end", onCallEnd);
      vapi.on("message", onMessage);
      vapi.on("speech-start", onSpeechStart);
      vapi.on("speech-end", onSpeechEnd);
      vapi.on("error", onError);
      vapi.on("volume-level", onVolumeLevel);

      return () => {
        vapi.off("call-start", onCallStart);
        vapi.off("call-end", onCallEnd);
        vapi.off("message", onMessage);
        vapi.off("speech-start", onSpeechStart);
        vapi.off("speech-end", onSpeechEnd);
        vapi.off("error", onError);
        vapi.off("volume-level", onVolumeLevel);
      };
    }, []);

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("Generating feedback here");
      //todo:create a server action tahat fgenerate feedback

      const {success , feedbackId : id} = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
      });
      if(success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      }else {
        console.error("Error saving feedback");
        router.push('/');
      }
    };

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      if(type === "generate") {
        router.push("/");
        return;
      }else {
        handleGenerateFeedback(messages);
      }
    }
  }, [callStatus, messages, type, userId, router, handleGenerateFeedback]);

  const handleCall = async () => {
    try {
      setCallStatus(CallStatus.CONNECTING);
      
      // Validate required environment variables and props
      if (!process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN) {
        console.error("❌ NEXT_PUBLIC_VAPI_WEB_TOKEN is not set");
        setCallStatus(CallStatus.INACTIVE);
        return;
      }

      if(type === 'generate'){
        if (!process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID) {
          console.error("❌ NEXT_PUBLIC_VAPI_WORKFLOW_ID is not set");
          setCallStatus(CallStatus.INACTIVE);
          return;
        }
        
        console.log("📞 Starting Vapi call with Workflow ID:", process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID);
        console.log("📊 Variable Values:", { username: userName, userid: userId });
        
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID, {
          variableValues: {
            username: userName, 
            userid: userId,
          }
        })
      }else{
        console.log("📞 Starting Vapi call with Assistant ID: interviewer");
        
        let formattedQuestions = ' ';
        if(questions){
          formattedQuestions = questions
          .map((question) => `${question}`)
          .join('\n');
        }
        
        console.log("📊 Variable Values:", { question: formattedQuestions.substring(0, 100) + "..." });
        
        await vapi.start('interviewer', {
          variableValues: {
            question: formattedQuestions,
          }
        })
      }
    } catch (error) {
      console.error("❌ Error starting call:", error);
      console.error("❌ Error type:", typeof error);
      console.error("❌ Error keys:", error ? Object.keys(error) : "null");
      if (error instanceof Error) {
        console.error("❌ Error message:", error.message);
        console.error("❌ Error stack:", error.stack);
      }
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = async () => {
    try {
      setCallStatus(CallStatus.FINISHED);
      await vapi.stop();
      console.log("Vapi call ended");
    } catch (error) {
      console.error("Error stopping Vapi call:", error);
    }
  };

  return (
    <>
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="AI interviewer"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>

        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="user avatar"
              width={120}
              height={120}
              className="rounded-full object-cover"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={messages.length - 1}
              className={cn(
                "transcript-opacity",
                "duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage?.content}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== CallStatus.ACTIVE ? (
          <button onClick={handleCall} className="relative btn-connect">
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== CallStatus.CONNECTING && "hidden"
              )}
            />
            <span>
              {callStatus === CallStatus.INACTIVE ||
              callStatus === CallStatus.FINISHED
                ? "Call"
                : "..."}
            </span>
          </button>
        ) : (
          <button onClick={handleDisconnect} className="btn-disconnect">End</button>
        )}
      </div>
    </>
  );
}
