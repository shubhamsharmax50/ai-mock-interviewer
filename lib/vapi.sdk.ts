import Vapi from "@vapi-ai/web";

// Initialize Vapi client with the public token
const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN || "");

// Enable audio output - Initialize and configure Web Audio API
if (typeof window !== "undefined") {
  let audioContext: AudioContext | null = null;

  const initAudioContext = async () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      
      if (!audioContext) {
        audioContext = new AudioContextClass();
        console.log("✅ Web Audio Context created");
      }
      
      if (audioContext.state === "suspended") {
        await audioContext.resume();
        console.log("✅ Web Audio Context resumed");
      }
      
      console.log("✅ Web Audio Context initialized and ready");
      return audioContext;
    } catch (error) {
      console.error("❌ Failed to initialize Web Audio Context:", error);
      return null;
    }
  };

  // Initialize audio context on first user interaction
  const resumeAudioContext = async () => {
    await initAudioContext();
    document.removeEventListener("click", resumeAudioContext);
    document.removeEventListener("touchstart", resumeAudioContext);
  };

  document.addEventListener("click", resumeAudioContext);
  document.addEventListener("touchstart", resumeAudioContext);

  // Also try to initialize immediately if document is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initAudioContext();
    });
  } else {
    initAudioContext();
  }
}

// Log initialization for debugging
console.log("🔧 Vapi SDK initialized");
console.log("   Public Token:", process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN ? "✅ SET" : "❌ NOT SET");
console.log("   Workflow ID:", process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID ? "✅ SET" : "❌ NOT SET");
console.log("   Vapi Instance:", vapi ? "✅ READY" : "❌ FAILED");

// Request microphone permissions on page load
if (typeof window !== "undefined") {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(() => {
      console.log("✅ Microphone permission granted");
    })
    .catch((error) => {
      console.warn("⚠️ Microphone permission denied:", error);
    });
}

export { vapi };
