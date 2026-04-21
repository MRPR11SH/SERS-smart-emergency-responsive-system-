"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Phone, User, Mic, Bell, Map, Shield,
  ChevronRight, Volume2, Radio, Info,
} from "lucide-react";
import toast from "react-hot-toast";

interface Contact {
  id: number;
  name: string;
  phone: string;
  relation: string;
}

interface Toggle {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  enabled: boolean;
}

export default function SettingsScreen() {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: 1, name: "Sarah Johnson", phone: "+1 (555) 012-3456", relation: "Sister" },
    { id: 2, name: "Dr. Mike Chen", phone: "+1 (555) 789-0123", relation: "Doctor" },
  ]);

  const [toggles, setToggles] = useState<Toggle[]>([
    { id: "voice", label: "Voice Detection", description: "Passive background listening", icon: Mic, color: "var(--cyan-accent)", enabled: true },
    { id: "auto-alert", label: "Auto Alert", description: "Alert if no response in 5 min", icon: Bell, color: "var(--warning-amber)", enabled: true },
    { id: "location", label: "Live Location Share", description: "Share with emergency contacts", icon: Map, color: "var(--safe-green)", enabled: false },
    { id: "sound", label: "Alarm Sound", description: "Play loud alarm on trigger", icon: Volume2, color: "var(--emergency-red)", enabled: true },
    { id: "broadcast", label: "Network Broadcast", description: "Alert nearby SERA users", icon: Radio, color: "var(--purple-accent)", enabled: false },
    { id: "stealth", label: "Stealth Mode", description: "Silent alerts, no screen flash", icon: Shield, color: "var(--text-secondary)", enabled: false },
  ]);

  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", phone: "", relation: "" });

  const flipToggle = (id: string) => {
    setToggles(prev =>
      prev.map(t => {
        if (t.id !== id) return t;
        const updated = { ...t, enabled: !t.enabled };
        toast(updated.enabled ? `${updated.label} enabled` : `${updated.label} disabled`, {
          icon: updated.enabled ? "✅" : "⭕",
        });
        return updated;
      })
    );
  };

  const addContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast.error("Name and phone are required");
      return;
    }
    setContacts(prev => [...prev, { ...newContact, id: Date.now() }]);
    setNewContact({ name: "", phone: "", relation: "" });
    setShowAddContact(false);
    toast.success("Emergency contact added!");
  };

  const removeContact = (id: number) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    toast("Contact removed", { icon: "🗑️" });
  };

  return (
    <div className="flex flex-col gap-4 pb-4 px-4">
      {/* Emergency Contacts */}
      <div className="glass p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
              Emergency Contacts
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)", fontSize: "10px" }}>
              Notified during SOS events
            </p>
          </div>
          <motion.button
            id="add-contact-btn"
            className="btn-cyan px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            onClick={() => setShowAddContact(s => !s)}
            whileTap={{ scale: 0.94 }}
          >
            <Plus size={14} /> Add
          </motion.button>
        </div>

        {/* Add contact form */}
        <AnimatePresence>
          {showAddContact && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div
                className="p-3 rounded-xl flex flex-col gap-2"
                style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.15)" }}
              >
                {[
                  { key: "name", placeholder: "Full Name", icon: User },
                  { key: "phone", placeholder: "Phone Number", icon: Phone },
                  { key: "relation", placeholder: "Relation (e.g. Sister)", icon: Info },
                ].map(({ key, placeholder, icon: Icon }) => (
                  <div key={key} className="flex items-center gap-2">
                    <Icon size={14} style={{ color: "var(--text-muted)" }} />
                    <input
                      className="flex-1 bg-transparent text-sm outline-none placeholder-gray-600"
                      style={{
                        color: "var(--text-primary)",
                        fontFamily: "Inter, sans-serif",
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        padding: "4px 0",
                      }}
                      placeholder={placeholder}
                      value={(newContact as Record<string, string>)[key]}
                      onChange={e => setNewContact(prev => ({ ...prev, [key]: e.target.value }))}
                    />
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <motion.button
                    id="save-contact-btn"
                    className="flex-1 py-2 rounded-xl text-sm font-semibold cursor-pointer"
                    style={{ background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.4)", color: "var(--cyan-accent)" }}
                    onClick={addContact}
                    whileTap={{ scale: 0.97 }}
                  >
                    Save Contact
                  </motion.button>
                  <motion.button
                    id="cancel-contact-btn"
                    className="px-4 py-2 rounded-xl text-sm cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}
                    onClick={() => setShowAddContact(false)}
                    whileTap={{ scale: 0.97 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contact list */}
        <div className="flex flex-col gap-2">
          {contacts.map((contact, i) => (
            <motion.div
              key={contact.id}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold"
                style={{
                  background: `hsl(${(i * 80 + 200) % 360}, 50%, 20%)`,
                  border: `1.5px solid hsl(${(i * 80 + 200) % 360}, 50%, 40%)`,
                  color: `hsl(${(i * 80 + 200) % 360}, 80%, 70%)`,
                  fontSize: "14px",
                }}
              >
                {contact.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{contact.name}</p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{contact.phone}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)", fontSize: "10px" }}>{contact.relation}</p>
              </div>
              <motion.button
                id={`remove-contact-${contact.id}`}
                onClick={() => removeContact(contact.id)}
                className="w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer"
                style={{ background: "rgba(255,59,59,0.08)", border: "1px solid rgba(255,59,59,0.15)" }}
                whileTap={{ scale: 0.9 }}
              >
                <Trash2 size={13} style={{ color: "var(--emergency-red)" }} />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="glass p-4 rounded-2xl">
        <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--text-muted)" }}>
          Features
        </p>
        <div className="flex flex-col gap-3">
          {toggles.map((toggle) => {
            const Icon = toggle.icon;
            return (
              <motion.div
                key={toggle.id}
                className="flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: toggle.enabled ? `${toggle.color}15` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${toggle.enabled ? `${toggle.color}40` : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  <Icon size={16} style={{ color: toggle.enabled ? toggle.color : "var(--text-muted)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{toggle.label}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{toggle.description}</p>
                </div>
                {/* Toggle switch */}
                <motion.button
                  id={`toggle-${toggle.id}`}
                  onClick={() => flipToggle(toggle.id)}
                  className={`toggle-track relative rounded-full cursor-pointer flex-shrink-0 ${toggle.enabled ? "active" : ""}`}
                  style={{ width: 44, height: 24 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute top-1 w-4 h-4 rounded-full"
                    style={{
                      background: toggle.enabled ? toggle.color : "rgba(255,255,255,0.3)",
                      boxShadow: toggle.enabled ? `0 0 8px ${toggle.color}80` : "none",
                    }}
                    animate={{ left: toggle.enabled ? 24 : 4 }}
                    transition={{ type: "spring", bounce: 0.3, duration: 0.3 }}
                  />
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Danger Zone */}
      <div
        className="p-4 rounded-2xl"
        style={{ background: "rgba(255,59,59,0.04)", border: "1px solid rgba(255,59,59,0.15)" }}
      >
        <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "rgba(255,59,59,0.7)" }}>
          Danger Zone
        </p>
        <motion.button
          id="factory-reset-btn"
          className="w-full py-3 rounded-xl text-sm font-medium cursor-pointer"
          style={{
            background: "rgba(255,59,59,0.08)",
            border: "1px solid rgba(255,59,59,0.2)",
            color: "var(--emergency-red)",
          }}
          onClick={() => toast.error("Factory reset requires biometric confirmation.")}
          whileTap={{ scale: 0.98 }}
        >
          Factory Reset
        </motion.button>
      </div>

      {/* Version info */}
      <div className="text-center">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          SERA v2.4.1 · Built for safety · ©2025
        </p>
      </div>
    </div>
  );
}
