"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AudioPlayer() {
  const searchParams = useSearchParams();
  const file = searchParams.get("file");

  if (!file) {
    return (
      <div style={{ color: "#ff3b3b", fontSize: 18 }}>
        ⚠️ No audio file specified or link is invalid.
      </div>
    );
  }

  return (
    <div style={{
      background: "rgba(255,255,255,0.05)", 
      padding: "40px 20px", 
      borderRadius: 24,
      textAlign: "center", 
      border: "1px solid rgba(255,59,59,0.3)",
      boxShadow: "0 0 60px rgba(255,59,59,0.15)",
      width: "100%",
      maxWidth: 400
    }}>
      <div style={{ fontSize: 50, marginBottom: 16 }}>🚨</div>
      <h1 style={{ color: "#f0f4ff", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
        Emergency Voice Note
      </h1>
      <p style={{ color: "#a0aec0", fontSize: 14, marginBottom: 32, lineHeight: 1.5 }}>
        An emergency alert was triggered. Please listen to the audio message below carefully.
      </p>
      
      <audio 
        controls 
        autoPlay 
        src={`/uploads/${file}`} 
        style={{ width: "100%", height: 54, borderRadius: 30, outline: "none" }} 
      />
    </div>
  );
}

export default function PlayAudioPage() {
  return (
    <div style={{
      minHeight: "100dvh", 
      backgroundColor: "#0a0a0f", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      padding: 24,
      fontFamily: "Inter, sans-serif"
    }}>
      <Suspense fallback={<div style={{ color: "white" }}>Loading audio player...</div>}>
        <AudioPlayer />
      </Suspense>
    </div>
  );
}
