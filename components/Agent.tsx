"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

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

export default function Agent({ userName }: AgentProps) {
  // you may use userId/type later (auth, logs, analytics, etc.)
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [callStatus, setCallStatus] = useState<CallStatus>(
    CallStatus.INACTIVE
  );
const [messages, setMessages] = useState<SavedMessage[]>([]);
    const lastMessage = messages[messages.length - 1];

    useEffect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const onCallStart = () => {
        setCallStatus(CallStatus.ACTIVE);
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const onCallEnd = () => {
        setCallStatus(CallStatus.FINISHED);
      };

      interface VapiMessage {
        type: string;
        transcriptType?: string;
        role: string;
        transcript: string;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const onMessage = (message: VapiMessage) => {
        if (message.type === "transcript" && message.transcriptType === "final") {
          const newMessage: SavedMessage = {
            role: message.role as "user" | "system" | "assistant",
            content: message.transcript,
          };
          setMessages((prev) => [...prev, newMessage]);
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const onSpeechStart = () => setIsSpeaking(true);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const onSpeechEnd = () => setIsSpeaking(false);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const onError = (error: Error) => {
        console.error("Error:", error);
      };

      // Note: These handlers need to be connected to your Vapi client
      // Example: vapiClient.on("call-start", onCallStart);
      // vapiClient.on("call-end", onCallEnd);
      // vapiClient.on("message", onMessage);
      // vapiClient.on("speech-start", onSpeechStart);
      // vapiClient.on("speech-end", onSpeechEnd);
      // vapiClient.on("error", onError);

      return () => {
        // Cleanup listeners here if needed
      };
    }, []);

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
          <button className="relative btn-connect">
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
          <button className="btn-disconnect">End</button>
        )}
      </div>
    </>
  );
}
