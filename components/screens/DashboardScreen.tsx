"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MapPin, Share2, AlertTriangle, CheckCircle, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";

type Status = "safe" | "alerting" | "alerted";

export default function DashboardScreen() {
  const [status, setStatus] = useState<Status>("safe");
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [location, setLocation] = useState("Fetching location...");

  const triggerEmergency = () => {
    setStatus("alerting");
    toast.loading("🚨 Sending emergency alert...", { id: "emergency" });

    // Simulate fetching location
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      },
      () => setLocation("Location unavailable")
    );

    setTimeout(() => {
      setStatus("alerted");
      toast.success("✅ Emergency alert sent! Help is on the way.", { id: "emergency" });
    }, 2500);
  };

  const resetStatus = () => {
    setStatus("safe");
    toast("Status reset to Safe.", { icon: "🟢" });
    setLocation("Fetching location...");
  };

  const quickAction = (label: string) => {
    if (label === "Call") {
      toast.success("📞 Calling emergency services: 911");
    } else if (label === "Share") {
      toast.success("📍 Location shared with emergency contacts");
    } else {
      toast.success(`${label} action triggered`);
    }
  };

  const statusConfig = {
    safe: { color: "var(--safe-green)", label: "SECURE", icon: CheckCircle },
    alerting: { color: "var(--warning-amber)", label: "ALERTING...", icon: AlertTriangle },
    alerted: { color: "var(--emergency-red)", label: "ALERT ACTIVE", icon: AlertTriangle },
  };

  const cfg = statusConfig[status];

  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* Status Banner */}
      <motion.div
        className="glass mx-4 p-4 flex items-center justify-between"
        animate={{
          borderColor: status === "safe" ? "rgba(0,230,118,0.2)" : "rgba(255,59,59,0.4)",
          boxShadow: status === "safe"
            ? "0 0 20px rgba(0,230,118,0.1)"
            : "0 0 30px rgba(255,59,59,0.2)",
        }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full status-safe"
            style={{
              background: cfg.color,
              boxShadow: `0 0 10px ${cfg.color}`,
              animation: status === "safe" ? "status-blink 2s ease infinite" : status === "alerting" ? "status-blink 0.5s ease infinite" : "none",
            }}
          />
          <div>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>System Status</p>
            <p
              className="text-sm font-bold tracking-widest"
              style={{ fontFamily: "Orbitron, monospace", color: cfg.color }}
            >
              {cfg.label}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Last Check</p>
          <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>Just now</p>
        </div>
      </motion.div>

      {/* Panic Button Section */}
      <div className="flex flex-col items-center gap-6 py-4">
        <div className="relative flex items-center justify-center">
          {/* Pulse rings */}
          {(status === "safe" || status === "alerting") && (
            <>
              <div
                className="absolute rounded-full pulse-ring"
                style={{
                  width: 220, height: 220,
                  border: `2px solid ${status === "alerting" ? "rgba(255,59,59,0.6)" : "rgba(255,59,59,0.3)"}`,
                }}
              />
              <div
                className="absolute rounded-full pulse-ring-2"
                style={{
                  width: 220, height: 220,
                  border: `2px solid ${status === "alerting" ? "rgba(255,59,59,0.4)" : "rgba(255,59,59,0.2)"}`,
                }}
              />
              <div
                className="absolute rounded-full pulse-ring-3"
                style={{
                  width: 220, height: 220,
                  border: "2px solid rgba(255,59,59,0.1)",
                }}
              />
            </>
          )}

          {/* Main Panic Button */}
          <AnimatePresence mode="wait">
            {status !== "alerted" ? (
              <motion.button
                key="panic"
                id="panic-button"
                className="panic-button rounded-full flex flex-col items-center justify-center gap-2"
                style={{ width: 180, height: 180 }}
                onClick={triggerEmergency}
                whileTap={{ scale: 0.94 }}
                animate={status === "alerting" ? {
                  boxShadow: [
                    "0 0 30px rgba(255,59,59,0.6)",
                    "0 0 70px rgba(255,59,59,0.9)",
                    "0 0 30px rgba(255,59,59,0.6)",
                  ],
                } : {}}
                transition={{ duration: 0.5, repeat: status === "alerting" ? Infinity : 0 }}
                aria-label="Emergency Panic Button"
              >
                <AlertTriangle size={36} color="white" strokeWidth={2.5} />
                <span
                  className="text-white font-black tracking-widest text-center leading-none"
                  style={{ fontFamily: "Orbitron, monospace", fontSize: "16px" }}
                >
                  {status === "alerting" ? "SENDING..." : "SOS"}
                </span>
                <span className="text-white text-xs opacity-70 tracking-wide">TAP TO ALERT</span>
              </motion.button>
            ) : (
              <motion.button
                key="alerted"
                id="reset-alert-button"
                className="rounded-full flex flex-col items-center justify-center gap-2 cursor-pointer"
                style={{
                  width: 180, height: 180,
                  background: "radial-gradient(circle, #1a4a1a, #0a2a0a)",
                  border: "2px solid rgba(0,230,118,0.5)",
                  boxShadow: "0 0 40px rgba(0,230,118,0.3)",
                }}
                onClick={resetStatus}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.4 }}
              >
                <CheckCircle size={36} color="var(--safe-green)" />
                <span
                  className="font-black tracking-widest"
                  style={{ fontFamily: "Orbitron, monospace", color: "var(--safe-green)", fontSize: "13px" }}
                >
                  SENT
                </span>
                <span className="text-xs opacity-70" style={{ color: "var(--safe-green)" }}>TAP TO RESET</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Swipe hint */}
        <motion.div
          className="flex flex-col items-center gap-1 opacity-50"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronUp size={16} style={{ color: "var(--text-secondary)" }} />
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Swipe up to confirm</span>
        </motion.div>
      </div>

      {/* Location Card */}
      <motion.div
        className="glass mx-4 p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}
          >
            <MapPin size={18} style={{ color: "var(--cyan-accent)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>Current Location</p>
            <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
              {location}
            </p>
          </div>
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: "var(--safe-green)",
              boxShadow: "0 0 8px var(--safe-green)",
              animation: "status-blink 2s ease infinite",
            }}
          />
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="mx-4">
        <p className="text-xs font-semibold mb-3 tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
          Quick Actions
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Call 911", icon: Phone, id: "Call" },
            { label: "Share Location", icon: Share2, id: "Share" },
            { label: "Alert Contacts", icon: AlertTriangle, id: "Alert" },
          ].map(({ label, icon: Icon, id }) => (
            <motion.button
              key={id}
              id={`quick-action-${id.toLowerCase()}`}
              className="btn-cyan rounded-2xl p-4 flex flex-col items-center gap-2"
              onClick={() => quickAction(id)}
              whileTap={{ scale: 0.94 }}
              whileHover={{ scale: 1.02 }}
            >
              <Icon size={22} />
              <span className="text-xs text-center font-medium leading-tight" style={{ color: "var(--text-secondary)" }}>
                {label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Threat Level Meter */}
      <div className="glass mx-4 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
            Threat Level
          </p>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{
            background: "rgba(0,230,118,0.1)",
            border: "1px solid rgba(0,230,118,0.3)",
            color: "var(--safe-green)",
          }}>
            LOW
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-full"
              style={{
                height: 6,
                background: i < 2
                  ? "var(--safe-green)"
                  : "rgba(255,255,255,0.07)",
                boxShadow: i < 2 ? "0 0 6px rgba(0,230,118,0.5)" : "none",
              }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.05 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
