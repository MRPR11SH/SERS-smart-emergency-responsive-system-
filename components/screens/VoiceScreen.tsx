"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

const DISTRESS_KEYWORDS = ["help", "emergency", "danger", "stop", "fire", "sos"];

export default function VoiceScreen() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [detected, setDetected] = useState(false);
  const [waveHeights, setWaveHeights] = useState(Array(20).fill(4));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate waveform animation when listening
  useEffect(() => {
    if (isListening) {
      intervalRef.current = setInterval(() => {
        setWaveHeights(Array(20).fill(0).map(() =>
          Math.random() > 0.3 ? Math.random() * 40 + 6 : Math.random() * 10 + 4
        ));
      }, 150);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setWaveHeights(Array(20).fill(4));
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isListening]);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      setTranscript("");
      setDetected(false);
      toast("Voice detection paused.", { icon: "⏸️" });
    } else {
      setIsListening(true);
      setDetected(false);
      toast.success("🎤 Listening for distress signals...");

      // Simulate keyword detection after 3 seconds
      setTimeout(() => {
        if (!isListening) return;
        const simulatedWord = "help";
        setTranscript(`"${simulatedWord}"...`);
        setTimeout(() => {
          setDetected(true);
          setTranscript(`Detected: "${simulatedWord}" — Emergency keyword!`);
          toast.error("⚠️ Distress keyword detected! Alerting contacts...");
        }, 800);
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 pb-4 px-4">
      {/* Header card */}
      <motion.div
        className="glass w-full p-4 text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "var(--text-muted)" }}>AI Voice Monitor</p>
        <p className="font-bold" style={{ color: "var(--text-primary)" }}>Passive Distress Detection</p>
        <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
          Monitors for keywords: {DISTRESS_KEYWORDS.join(", ")}
        </p>
      </motion.div>

      {/* Mic visualization */}
      <div className="relative flex flex-col items-center">
        {/* Outer glow ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 220, height: 220,
            border: `1px solid ${isListening ? "rgba(0,212,255,0.3)" : "rgba(255,255,255,0.05)"}`,
          }}
          animate={isListening ? { scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Waveform ring */}
        <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
          {/* Background circle */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 160, height: 160,
              background: isListening
                ? "radial-gradient(circle, rgba(0,212,255,0.08) 0%, rgba(0,0,0,0) 70%)"
                : "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
              border: `2px solid ${isListening ? "rgba(0,212,255,0.3)" : "rgba(255,255,255,0.06)"}`,
              boxShadow: isListening ? "0 0 40px rgba(0,212,255,0.2)" : "none",
            }}
            animate={isListening ? { scale: [1, 1.04, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          />

          {/* Mic icon */}
          <motion.button
            id="voice-toggle-btn"
            className="relative z-10 rounded-full flex items-center justify-center cursor-pointer"
            style={{
              width: 100, height: 100,
              background: isListening
                ? "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,212,255,0.05))"
                : "rgba(255,255,255,0.04)",
              border: `2px solid ${isListening ? "rgba(0,212,255,0.6)" : "rgba(255,255,255,0.1)"}`,
              boxShadow: isListening ? "0 0 30px rgba(0,212,255,0.3)" : "none",
            }}
            onClick={toggleListening}
            whileTap={{ scale: 0.92 }}
          >
            <AnimatePresence mode="wait">
              {isListening ? (
                <motion.div
                  key="mic-on"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Mic size={36} style={{ color: "var(--cyan-accent)", filter: "drop-shadow(0 0 10px rgba(0,212,255,0.7))" }} />
                </motion.div>
              ) : (
                <motion.div
                  key="mic-off"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <MicOff size={36} style={{ color: "var(--text-muted)" }} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Waveform bars */}
        <div className="flex items-center gap-1 mt-4" style={{ height: 50 }}>
          {waveHeights.map((h, i) => (
            <motion.div
              key={i}
              className="wave-bar rounded-full"
              style={{
                width: 3,
                height: isListening ? h : 4,
                background: detected
                  ? `rgba(255,59,59,${0.4 + (h / 50) * 0.6})`
                  : `rgba(0,212,255,${0.3 + (h / 50) * 0.7})`,
                boxShadow: isListening
                  ? `0 0 ${h / 6}px ${detected ? "rgba(255,59,59,0.5)" : "rgba(0,212,255,0.4)"}`
                  : "none",
                transition: "height 0.15s ease, background 0.3s ease",
              }}
            />
          ))}
        </div>
      </div>

      {/* Status feedback */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isListening ? (detected ? "detected" : "listening") : "idle"}
          className="glass w-full p-4 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          style={{
            borderColor: detected
              ? "rgba(255,59,59,0.4)"
              : isListening
              ? "rgba(0,212,255,0.3)"
              : "rgba(255,255,255,0.08)",
            boxShadow: detected
              ? "0 0 20px rgba(255,59,59,0.15)"
              : isListening
              ? "0 0 20px rgba(0,212,255,0.1)"
              : "none",
          }}
        >
          {detected ? (
            <>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                <AlertTriangle size={28} style={{ color: "var(--emergency-red)", margin: "0 auto 8px" }} />
              </motion.div>
              <p className="font-bold text-neon-red">DISTRESS DETECTED</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{transcript}</p>
            </>
          ) : isListening ? (
            <>
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Volume2 size={24} style={{ color: "var(--cyan-accent)", margin: "0 auto 8px", filter: "drop-shadow(0 0 8px rgba(0,212,255,0.6))" }} />
              </motion.div>
              <p className="font-semibold text-neon-cyan">Listening for distress...</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>Speak naturally — AI monitors in background</p>
              {transcript && (
                <p className="text-xs mt-2 italic" style={{ color: "var(--text-secondary)" }}>{transcript}</p>
              )}
            </>
          ) : (
            <>
              <MicOff size={24} style={{ color: "var(--text-muted)", margin: "0 auto 8px" }} />
              <p className="font-semibold" style={{ color: "var(--text-secondary)" }}>Voice detection off</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Tap the mic to start monitoring</p>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Sensitivity */}
      <div className="glass w-full p-4">
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
            Detection Sensitivity
          </p>
          <span className="text-xs" style={{ color: "var(--cyan-accent)" }}>HIGH</span>
        </div>
        <div className="relative h-2 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{
              width: "75%",
              background: "linear-gradient(90deg, rgba(0,212,255,0.5), rgba(0,212,255,1))",
              boxShadow: "0 0 10px rgba(0,212,255,0.5)",
            }}
            initial={{ width: 0 }}
            animate={{ width: "75%" }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
