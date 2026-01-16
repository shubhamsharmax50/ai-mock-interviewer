"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

// enum for call status
enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface AgentProps {
  userName: string;
}

export default function Agent({ userName }: AgentProps) {

  const isSpeaking = true;
  const messages =[
    "What's your name?",
    "My name is John Doe,nice to meet you!",
  ];
  const lastMessage = messages[messages.length -1];

  // ✅ state (unchanged)
  const [callStatus, setCallStatus] = useState<CallStatus>(
    CallStatus.INACTIVE
  );

  return (
    <>
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="vapi"
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
              width={540}
              height={540}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>
        {messages.length > 0 && (
        <div className="transcript-border">
            <div className="transcript">
                <p key={lastMessage} className="">
                    {lastMessage}
                </p>
                </div>
        </div>
      )}
            

      <div className="w-full flex justify-center">
        {callStatus !== CallStatus.ACTIVE ? (
          <button className="relative btn-connect">
            {/* ✅ FIX 1: condition inverted so ping shows ONLY when CONNECTING */}
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== CallStatus.CONNECTING && "hidden"
              )}
            />

            <span>
              {/* ✅ FIX 2: enum comparison (already correct, just kept clean) */}
              {callStatus === CallStatus.INACTIVE ||
              callStatus === CallStatus.FINISHED
                ? "Call"
                : "..."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect">
            End
          </button>
        )}
      </div>
    </>
  );
}
