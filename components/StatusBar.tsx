"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Wifi, WifiOff, Battery, Signal } from "lucide-react";

interface StatusBarProps {
  isOnline?: boolean;
  batteryLevel?: number;
}

export default function StatusBar({ isOnline = true, batteryLevel = 85 }: StatusBarProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="flex items-center justify-between px-6 py-3"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Shield size={16} style={{ color: "var(--cyan-accent)" }} />
        <span
          className="text-sm font-bold tracking-widest"
          style={{ fontFamily: "Orbitron, monospace", color: "var(--cyan-accent)", fontSize: "12px" }}
        >
          SERA
        </span>
      </div>

      {/* Time */}
      <span
        className="text-sm font-semibold tabular-nums"
        style={{ fontFamily: "Orbitron, monospace", color: "var(--text-primary)", fontSize: "13px" }}
      >
        {time}
      </span>

      {/* Status icons */}
      <div className="flex items-center gap-2">
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ background: "rgba(255,152,0,0.15)", border: "1px solid rgba(255,152,0,0.4)" }}
            >
              <WifiOff size={10} style={{ color: "#ff9800" }} />
              <span className="text-xs" style={{ color: "#ff9800", fontSize: "10px" }}>OFFLINE</span>
            </motion.div>
          )}
        </AnimatePresence>
        <Signal size={14} style={{ color: "var(--text-secondary)" }} />
        <Wifi size={14} style={{ color: isOnline ? "var(--cyan-accent)" : "var(--text-muted)" }} />
        <div
          className="flex items-center gap-1 text-xs"
          style={{ color: batteryLevel > 20 ? "var(--safe-green)" : "var(--emergency-red)" }}
        >
          <Battery size={14} />
          <span className="tabular-nums" style={{ fontSize: "11px" }}>{batteryLevel}%</span>
        </div>
      </div>
    </div>
  );
}
