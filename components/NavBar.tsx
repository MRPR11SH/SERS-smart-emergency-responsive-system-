"use client";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Map, Mic, Camera, Settings, Clock,
} from "lucide-react";

const navItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Home" },
  { id: "map", icon: Map, label: "Map" },
  { id: "voice", icon: Mic, label: "Voice" },
  { id: "capture", icon: Camera, label: "Capture" },
  { id: "history", icon: Clock, label: "History" },
  { id: "settings", icon: Settings, label: "Settings" },
];

interface NavBarProps {
  active: string;
  onNavigate: (id: string) => void;
}

export default function NavBar({ active, onNavigate }: NavBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div
        className="glass mx-4 mb-4 px-2 py-2 flex justify-around items-center"
        style={{
          background: "rgba(2, 5, 16, 0.85)",
          backdropFilter: "blur(30px)",
          border: "1px solid rgba(0,212,255,0.15)",
          borderRadius: "24px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.05)",
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <motion.button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl relative cursor-pointer"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: "rgba(0,212,255,0.1)",
                    border: "1px solid rgba(0,212,255,0.3)",
                    boxShadow: "0 0 12px rgba(0,212,255,0.2)",
                  }}
                  transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                />
              )}
              <Icon
                size={20}
                style={{
                  color: isActive ? "var(--cyan-accent)" : "var(--text-muted)",
                  filter: isActive ? "drop-shadow(0 0 6px rgba(0,212,255,0.6))" : "none",
                  transition: "all 0.3s ease",
                }}
              />
              <span
                className="text-xs font-medium relative z-10"
                style={{
                  color: isActive ? "var(--cyan-accent)" : "var(--text-muted)",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
