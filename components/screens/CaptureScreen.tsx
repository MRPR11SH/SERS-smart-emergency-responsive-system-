"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Square, FlipHorizontal, Zap, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function CaptureScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [scanAngle, setScanAngle] = useState(0);

  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRecordingTime(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRecording]);

  useEffect(() => {
    const anim = setInterval(() => {
      setScanAngle(a => (a + 1) % 360);
    }, 30);
    return () => clearInterval(anim);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const toggleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      toast.success(`📹 Recording saved (${formatTime(recordingTime)})`);
    } else {
      setIsRecording(true);
      toast.loading("🔴 Recording started — evidence saved automatically", { id: "recording" });
      setTimeout(() => toast.dismiss("recording"), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-4 px-4">
      {/* Camera viewport */}
      <motion.div
        className="relative rounded-3xl overflow-hidden"
        style={{ height: 380 }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Simulated camera feed */}
        <div
          className="absolute inset-0"
          style={{
            background: isFrontCamera
              ? "linear-gradient(135deg, #0a0f1e 0%, #050a14 50%, #0a1428 100%)"
              : "linear-gradient(135deg, #050a0f 0%, #020508 50%, #0a0f14 100%)",
          }}
        />

        {/* Scan line effect */}
        <motion.div
          className="absolute left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)" }}
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        {/* Targeting crosshair */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <motion.circle
              cx="60" cy="60" r="35"
              fill="none"
              stroke="rgba(0,212,255,0.3)"
              strokeWidth="1"
              strokeDasharray="8 4"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            {/* Corner markers */}
            {[
              [20, 20], [100, 20], [20, 100], [100, 100]
            ].map(([x, y], i) => (
              <g key={i}>
                <line x1={x} y1={y} x2={x + (i % 2 === 0 ? 12 : -12)} y2={y} stroke="rgba(0,212,255,0.6)" strokeWidth="2"/>
                <line x1={x} y1={y} x2={x} y2={y + (i < 2 ? 12 : -12)} stroke="rgba(0,212,255,0.6)" strokeWidth="2"/>
              </g>
            ))}
            <circle cx="60" cy="60" r="3" fill="rgba(255,59,59,0.8)" />
          </svg>
        </div>

        {/* Overlay noise */}
        <div className="absolute inset-0 opacity-5" style={{
          background: `repeating-linear-gradient(
            0deg,
            rgba(0,0,0,0.3) 0px,
            transparent 1px,
            transparent 3px
          )`
        }} />

        {/* Recording indicator */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(255,59,59,0.2)",
                border: "1px solid rgba(255,59,59,0.5)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                className="w-2 h-2 rounded-full rec-blink"
                style={{ background: "var(--emergency-red)", boxShadow: "0 0 6px var(--emergency-red)" }}
              />
              <span className="text-xs font-bold" style={{ color: "var(--emergency-red)", fontFamily: "Orbitron, monospace" }}>
                REC {formatTime(recordingTime)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auto-upload badge */}
        {isRecording && (
          <motion.div
            className="absolute top-4 right-4 px-2 py-1 rounded-lg text-xs flex items-center gap-1"
            style={{
              background: "rgba(0,212,255,0.15)",
              border: "1px solid rgba(0,212,255,0.3)",
              color: "var(--cyan-accent)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{ width: 10, height: 10, border: "1.5px solid var(--cyan-accent)", borderTopColor: "transparent", borderRadius: "50%" }}
            />
            Uploading
          </motion.div>
        )}

        {/* Flash indicator */}
        {flashEnabled && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs flex items-center gap-1"
            style={{ background: "rgba(255,152,0,0.2)", border: "1px solid rgba(255,152,0,0.4)", color: "#ff9800" }}
          >
            <Zap size={10} /> Flash ON
          </div>
        )}

        {/* Bottom overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24"
          style={{ background: "linear-gradient(to top, rgba(2,5,16,0.9), transparent)" }}
        />

        {/* Camera controls overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <motion.button
            id="camera-flash-btn"
            className="glass w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
            onClick={() => {
              setFlashEnabled(f => !f);
              toast(flashEnabled ? "Flash off" : "Flash on", { icon: "⚡" });
            }}
            whileTap={{ scale: 0.9 }}
          >
            <Zap size={16} style={{ color: flashEnabled ? "#ff9800" : "var(--text-muted)" }} />
          </motion.button>

          {/* Record button */}
          <motion.button
            id="record-btn"
            onClick={toggleRecord}
            className="rounded-full flex items-center justify-center cursor-pointer relative"
            style={{ width: 72, height: 72 }}
            whileTap={{ scale: 0.92 }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: "3px solid rgba(255,59,59,0.6)",
                boxShadow: isRecording ? "0 0 20px rgba(255,59,59,0.5)" : "none",
              }}
            />
            <motion.div
              className="rounded-full"
              style={{ background: "var(--emergency-red)" }}
              animate={{
                width: isRecording ? 28 : 52,
                height: isRecording ? 28 : 52,
                borderRadius: isRecording ? "6px" : "50%",
              }}
              transition={{ type: "spring", bounce: 0.3 }}
            />
          </motion.button>

          <motion.button
            id="camera-flip-btn"
            className="glass w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
            onClick={() => {
              setIsFrontCamera(f => !f);
              toast(`Switched to ${isFrontCamera ? "rear" : "front"} camera`, { icon: "🔄" });
            }}
            whileTap={{ scale: 0.9 }}
          >
            <FlipHorizontal size={16} style={{ color: "var(--cyan-accent)" }} />
          </motion.button>
        </div>
      </motion.div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Auto Cloud Backup", value: "Enabled", icon: "☁️", color: "var(--safe-green)" },
          { label: "Evidence Lock", value: "Active", icon: "🔒", color: "var(--cyan-accent)" },
          { label: "Video Quality", value: "4K / 60fps", icon: "🎬", color: "var(--warning-amber)" },
          { label: "Storage Free", value: "12.4 GB", icon: "💾", color: "var(--text-secondary)" },
        ].map((item) => (
          <motion.div
            key={item.label}
            className="glass p-3 rounded-2xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">{item.icon}</span>
              <span className="text-xs" style={{ color: item.color, fontWeight: 600 }}>{item.value}</span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent recordings */}
      <div className="glass p-4">
        <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>
          Recent Recordings
        </p>
        {["Incident #001 — 2m 34s", "Auto-capture #002 — 45s"].map((r, i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <Video size={16} style={{ color: "var(--cyan-accent)" }} />
            <span className="text-sm flex-1" style={{ color: "var(--text-secondary)" }}>{r}</span>
            <Clock size={12} style={{ color: "var(--text-muted)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
