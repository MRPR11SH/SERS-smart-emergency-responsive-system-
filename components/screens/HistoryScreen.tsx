"use client";
import { motion } from "framer-motion";
import { MapPin, Clock, AlertTriangle, CheckCircle, Phone, Share2 } from "lucide-react";
import toast from "react-hot-toast";

const ALERTS = [
  {
    id: 1,
    type: "SOS",
    status: "resolved",
    time: "Today, 09:14 AM",
    location: "MG Road, Sector 12",
    coords: "28.6139, 77.2090",
    responders: ["Police", "Ambulance"],
    duration: "12 min response",
  },
  {
    id: 2,
    type: "Voice Detected",
    status: "resolved",
    time: "Yesterday, 11:42 PM",
    location: "Near Metro Station",
    coords: "28.6182, 77.2272",
    responders: ["Police"],
    duration: "8 min response",
  },
  {
    id: 3,
    type: "Auto-Capture",
    status: "pending",
    time: "Yesterday, 08:23 PM",
    location: "Park Street",
    coords: "28.6100, 77.2015",
    responders: [],
    duration: "Under review",
  },
  {
    id: 4,
    type: "SOS",
    status: "resolved",
    time: "Apr 19, 03:05 PM",
    location: "City Mall, Level 2",
    coords: "28.6200, 77.1960",
    responders: ["Security", "Ambulance"],
    duration: "5 min response",
  },
];

export default function HistoryScreen() {
  return (
    <div className="flex flex-col gap-4 pb-4 px-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Alerts", value: "4", color: "var(--emergency-red)", glow: "rgba(255,59,59,0.2)" },
          { label: "Resolved", value: "3", color: "var(--safe-green)", glow: "rgba(0,230,118,0.2)" },
          { label: "Avg Response", value: "8m", color: "var(--cyan-accent)", glow: "rgba(0,212,255,0.2)" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            className="glass rounded-2xl p-3 text-center"
            style={{ boxShadow: `0 0 20px ${stat.glow}` }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p
              className="text-2xl font-black"
              style={{ fontFamily: "Orbitron, monospace", color: stat.color }}
            >
              {stat.value}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div
          className="absolute left-6 top-0 bottom-0 w-0.5 timeline-line"
          style={{ marginLeft: "1px" }}
        />

        <div className="flex flex-col gap-4">
          {ALERTS.map((alert, i) => (
            <motion.div
              key={alert.id}
              className="flex gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {/* Timeline dot */}
              <div className="flex-shrink-0 flex flex-col items-center" style={{ width: 14, marginTop: 4 }}>
                <motion.div
                  className="w-3.5 h-3.5 rounded-full"
                  style={{
                    background: alert.status === "resolved" ? "var(--safe-green)" : "var(--warning-amber)",
                    boxShadow: `0 0 10px ${alert.status === "resolved" ? "rgba(0,230,118,0.5)" : "rgba(255,152,0,0.5)"}`,
                    border: "2px solid var(--bg-primary)",
                  }}
                  animate={alert.status === "pending" ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>

              {/* Alert card */}
              <div
                className="flex-1 glass p-4 rounded-2xl mb-1"
                style={{
                  borderColor: alert.status === "pending" ? "rgba(255,152,0,0.3)" : "rgba(255,255,255,0.08)",
                  boxShadow: alert.status === "pending" ? "0 0 15px rgba(255,152,0,0.1)" : "none",
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="text-sm font-bold"
                        style={{ color: alert.status === "pending" ? "var(--warning-amber)" : "var(--text-primary)" }}
                      >
                        {alert.type}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: alert.status === "resolved" ? "rgba(0,230,118,0.1)" : "rgba(255,152,0,0.1)",
                          border: `1px solid ${alert.status === "resolved" ? "rgba(0,230,118,0.3)" : "rgba(255,152,0,0.3)"}`,
                          color: alert.status === "resolved" ? "var(--safe-green)" : "var(--warning-amber)",
                        }}
                      >
                        {alert.status === "resolved" ? "✓ Resolved" : "⏳ Pending"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={11} style={{ color: "var(--text-muted)" }} />
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{alert.time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={13} style={{ color: "var(--cyan-accent)" }} />
                  <div>
                    <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{alert.location}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "monospace" }}>{alert.coords}</p>
                  </div>
                </div>

                {/* Responders */}
                {alert.responders.length > 0 && (
                  <div className="flex gap-1.5 mb-3">
                    {alert.responders.map((r) => (
                      <span
                        key={r}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(0,212,255,0.08)",
                          border: "1px solid rgba(0,212,255,0.2)",
                          color: "var(--cyan-accent)",
                        }}
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>⚡ {alert.duration}</span>
                  <div className="flex gap-2">
                    <motion.button
                      id={`alert-share-${alert.id}`}
                      className="btn-cyan text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                      onClick={() => toast.success("Report shared")}
                      whileTap={{ scale: 0.94 }}
                    >
                      <Share2 size={11} /> Share
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Clear history */}
      <motion.button
        id="clear-history-btn"
        className="glass py-3 rounded-2xl text-sm font-medium cursor-pointer"
        style={{ color: "var(--text-muted)", borderColor: "rgba(255,255,255,0.06)" }}
        onClick={() => toast("History will be cleared after 30 days automatically.", { icon: "🗑️" })}
        whileTap={{ scale: 0.98 }}
      >
        Clear History
      </motion.button>
    </div>
  );
}
