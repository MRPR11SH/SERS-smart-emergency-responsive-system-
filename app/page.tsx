"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "@/components/NavBar";
import StatusBar from "@/components/StatusBar";
import DashboardScreen from "@/components/screens/DashboardScreen";
import MapScreen from "@/components/screens/MapScreen";
import VoiceScreen from "@/components/screens/VoiceScreen";
import CaptureScreen from "@/components/screens/CaptureScreen";
import HistoryScreen from "@/components/screens/HistoryScreen";
import SettingsScreen from "@/components/screens/SettingsScreen";

const SCREEN_META: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: "Emergency Hub", subtitle: "Stay protected, always" },
  map: { title: "Live Radar", subtitle: "Nearby emergency services" },
  voice: { title: "Voice Monitor", subtitle: "AI distress detection" },
  capture: { title: "Evidence Cam", subtitle: "Auto-encrypt & upload" },
  history: { title: "Alert Log", subtitle: "Your incident timeline" },
  settings: { title: "Control Center", subtitle: "Configure your safety" },
};

const pageVariants = {
  enter: { opacity: 0, x: 24, filter: "blur(4px)" },
  center: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: { opacity: 0, x: -24, filter: "blur(4px)" },
};

export default function Home() {
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const meta = SCREEN_META[activeScreen];

  const renderScreen = () => {
    switch (activeScreen) {
      case "dashboard": return <DashboardScreen />;
      case "map": return <MapScreen />;
      case "voice": return <VoiceScreen />;
      case "capture": return <CaptureScreen />;
      case "history": return <HistoryScreen />;
      case "settings": return <SettingsScreen />;
      default: return <DashboardScreen />;
    }
  };

  return (
    <main
      className="min-h-screen flex justify-center"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Mobile frame */}
      <div
        className="relative w-full flex flex-col"
        style={{
          maxWidth: 430,
          minHeight: "100dvh",
          background: "linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)",
        }}
      >
        {/* Status Bar */}
        <StatusBar isOnline={true} batteryLevel={85} />

        {/* Screen Header */}
        <motion.div
          key={activeScreen + "-header"}
          className="px-6 py-4 flex items-end justify-between"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div>
            <h1
              className="text-2xl font-black leading-none"
              style={{ fontFamily: "Orbitron, monospace", color: "var(--text-primary)" }}
            >
              {meta.title}
            </h1>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              {meta.subtitle}
            </p>
          </div>
          {/* Active screen indicator */}
          <div
            className="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider"
            style={{
              background: "rgba(0,212,255,0.08)",
              border: "1px solid rgba(0,212,255,0.2)",
              color: "var(--cyan-accent)",
              fontFamily: "Orbitron, monospace",
              fontSize: "10px",
            }}
          >
            LIVE
          </div>
        </motion.div>

        {/* Divider */}
        <div
          className="mx-6 mb-4 h-px shimmer"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />

        {/* Scrollable screen area */}
        <div className="flex-1 overflow-y-auto pb-28" style={{ scrollbarWidth: "thin" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScreen}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Nav Bar */}
        <NavBar active={activeScreen} onNavigate={setActiveScreen} />
      </div>
    </main>
  );
}
