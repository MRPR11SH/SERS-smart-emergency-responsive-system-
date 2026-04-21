"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navigation, Hospital, Shield, Layers, LocateFixed, ZoomIn, ZoomOut } from "lucide-react";
import toast from "react-hot-toast";

const MARKERS = [
  { id: 1, type: "hospital", label: "City General Hospital", x: 62, y: 28, distance: "0.8 km" },
  { id: 2, type: "hospital", label: "St. Mary's Medical", x: 22, y: 68, distance: "1.4 km" },
  { id: 3, type: "police", label: "District Police Station", x: 75, y: 72, distance: "1.1 km" },
  { id: 4, type: "police", label: "Metro Police HQ", x: 38, y: 18, distance: "2.0 km" },
  { id: 5, type: "fire", label: "Fire Station #3", x: 85, y: 44, distance: "1.7 km" },
];

export default function MapScreen() {
  const [activeLayer, setActiveLayer] = useState("all");
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isLocating, setIsLocating] = useState(false);

  const markerColors: Record<string, string> = {
    hospital: "#00e676",
    police: "var(--cyan-accent)",
    fire: "var(--warning-amber)",
  };

  const markerIcons: Record<string, string> = {
    hospital: "🏥",
    police: "🚔",
    fire: "🚒",
  };

  const handleLocate = () => {
    setIsLocating(true);
    toast.loading("Acquiring GPS signal...", { id: "gps" });
    setTimeout(() => {
      setIsLocating(false);
      toast.success("Location acquired!", { id: "gps" });
    }, 1500);
  };

  const visibleMarkers = MARKERS.filter(m =>
    activeLayer === "all" || m.type === activeLayer
  );

  return (
    <div className="flex flex-col gap-4 pb-4">
      {/* Layer Filter */}
      <div className="flex gap-2 mx-4 overflow-x-auto pb-1">
        {["all", "hospital", "police", "fire"].map((layer) => (
          <motion.button
            key={layer}
            id={`map-layer-${layer}`}
            onClick={() => setActiveLayer(layer)}
            className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 cursor-pointer"
            style={{
              background: activeLayer === layer ? "rgba(0,212,255,0.2)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${activeLayer === layer ? "rgba(0,212,255,0.5)" : "rgba(255,255,255,0.08)"}`,
              color: activeLayer === layer ? "var(--cyan-accent)" : "var(--text-secondary)",
              boxShadow: activeLayer === layer ? "0 0 12px rgba(0,212,255,0.2)" : "none",
            }}
            whileTap={{ scale: 0.95 }}
          >
            {layer === "all" ? "All" : markerIcons[layer] + " " + layer.charAt(0).toUpperCase() + layer.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Map Container */}
      <div className="mx-4 relative overflow-hidden rounded-3xl" style={{ height: 340 }}>
        {/* Dark map background */}
        <div
          className="absolute inset-0 map-grid"
          style={{
            background: "linear-gradient(135deg, #020d1a 0%, #010812 50%, #050d1a 100%)",
          }}
        />

        {/* Animated grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,212,255,0.3)" strokeWidth="0.2"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>

        {/* Scan line */}
        <div
          className="scan-line absolute left-0 right-0 h-0.5 pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)" }}
        />

        {/* Road-like lines */}
        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(0,212,255,0.4)" strokeWidth="0.5" strokeDasharray="2,2"/>
          <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(0,212,255,0.4)" strokeWidth="0.5" strokeDasharray="2,2"/>
          <line x1="0" y1="25" x2="100" y2="75" stroke="rgba(255,255,255,0.1)" strokeWidth="0.3"/>
          <line x1="0" y1="75" x2="100" y2="25" stroke="rgba(255,255,255,0.1)" strokeWidth="0.3"/>
          {/* "Routes" */}
          <path d="M 50 50 Q 62 40 62 28" stroke="rgba(0,230,118,0.5)" strokeWidth="0.8" fill="none" strokeDasharray="3,2">
            <animate attributeName="stroke-dashoffset" values="0;-20" dur="2s" repeatCount="indefinite"/>
          </path>
          <path d="M 50 50 Q 55 60 75 72" stroke="rgba(0,212,255,0.5)" strokeWidth="0.8" fill="none" strokeDasharray="3,2">
            <animate attributeName="stroke-dashoffset" values="0;-20" dur="2.5s" repeatCount="indefinite"/>
          </path>
        </svg>

        {/* Emergency markers */}
        {visibleMarkers.map((marker) => (
          <motion.button
            key={marker.id}
            id={`map-marker-${marker.id}`}
            className="absolute cursor-pointer flex flex-col items-center"
            style={{ left: `${marker.x}%`, top: `${marker.y}%`, transform: "translate(-50%, -50%)" }}
            onClick={() => setSelectedMarker(selectedMarker === marker.id ? null : marker.id)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm relative"
              style={{
                background: `${markerColors[marker.type]}20`,
                border: `1.5px solid ${markerColors[marker.type]}`,
                boxShadow: `0 0 12px ${markerColors[marker.type]}50`,
              }}
            >
              <span>{markerIcons[marker.type]}</span>
              {/* Pulse ring on marker */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: `1.5px solid ${markerColors[marker.type]}` }}
                animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
            </div>
            {/* Label on click */}
            {selectedMarker === marker.id && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute bottom-10 glass px-2 py-1 rounded-lg text-xs whitespace-nowrap z-20"
                style={{ color: "var(--text-primary)", minWidth: "120px" }}
              >
                <p className="font-semibold">{marker.label}</p>
                <p style={{ color: markerColors[marker.type] }}>{marker.distance} away</p>
              </motion.div>
            )}
          </motion.button>
        ))}

        {/* User location */}
        <motion.div
          className="absolute"
          style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{
              background: "var(--emergency-red)",
              border: "2px solid white",
              boxShadow: "0 0 20px rgba(255,59,59,0.7)",
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: "2px solid rgba(255,59,59,0.5)" }}
            animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Map Controls */}
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          {[
            { icon: ZoomIn, id: "zoom-in", action: () => setZoom(z => Math.min(z + 0.5, 3)) },
            { icon: ZoomOut, id: "zoom-out", action: () => setZoom(z => Math.max(z - 0.5, 0.5)) },
          ].map(({ icon: Icon, id, action }) => (
            <motion.button
              key={id}
              id={id}
              onClick={action}
              className="w-9 h-9 rounded-xl flex items-center justify-center glass cursor-pointer"
              whileTap={{ scale: 0.9 }}
            >
              <Icon size={16} style={{ color: "var(--cyan-accent)" }} />
            </motion.button>
          ))}
        </div>

        {/* Locate me */}
        <motion.button
          id="locate-me-btn"
          className="absolute left-3 top-3 glass px-3 py-2 rounded-xl flex items-center gap-2 cursor-pointer"
          onClick={handleLocate}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div animate={isLocating ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <LocateFixed size={14} style={{ color: isLocating ? "var(--warning-amber)" : "var(--cyan-accent)" }} />
          </motion.div>
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {isLocating ? "Locating..." : "My Location"}
          </span>
        </motion.button>

        {/* Scale bar */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="h-0.5 w-12" style={{ background: "rgba(0,212,255,0.5)" }} />
          <span className="text-xs" style={{ color: "var(--text-muted)", fontSize: "10px" }}>500m</span>
        </div>
      </div>

      {/* Nearby Services */}
      <div className="mx-4">
        <p className="text-xs font-semibold mb-3 tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
          Nearby Services
        </p>
        <div className="flex flex-col gap-2">
          {MARKERS.slice(0, 3).map((marker) => (
            <motion.div
              key={marker.id}
              className="glass p-3 flex items-center gap-3"
              whileHover={{ x: 4 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: marker.id * 0.1 }}
            >
              <span className="text-xl">{markerIcons[marker.type]}</span>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{marker.label}</p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{marker.distance} away</p>
              </div>
              <motion.button
                className="btn-cyan text-xs px-3 py-1.5 rounded-xl cursor-pointer"
                onClick={() => toast.success(`Navigating to ${marker.label}`)}
                whileTap={{ scale: 0.94 }}
              >
                <Navigation size={12} />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
