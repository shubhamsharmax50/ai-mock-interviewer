import Vapi from "@vapi-ai/web";

// Initialize Vapi client with the public token and enable audio output
const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN || "");

// Enable audio output - Initialize Web Audio API context
if (typeof window !== "undefined") {
  const initAudioContext = async () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioContext.state === "suspended") {
        await audioContext.resume();
        console.log("✅ Web Audio Context resumed");
      }
      console.log("✅ Web Audio Context initialized");
    } catch (error) {
      console.error("❌ Failed to initialize Web Audio Context:", error);
    }
  };

  // Try to initialize on first user interaction
  const resumeAudioContext = () => {
    initAudioContext();
    document.removeEventListener("click", resumeAudioContext);
    document.removeEventListener("touchstart", resumeAudioContext);
  };

  document.addEventListener("click", resumeAudioContext);
  document.addEventListener("touchstart", resumeAudioContext);
}

// Log initialization for debugging
console.log("🔧 Vapi SDK initialized with publicKey:", process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN ? "✅ SET" : "❌ NOT SET");

export { vapi };
