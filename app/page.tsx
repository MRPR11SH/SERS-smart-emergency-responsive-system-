"use client";
import { useState, useEffect, useRef } from "react";

type View = "login" | "signup" | "home" | "settings";
type Status = "idle" | "locating" | "sending" | "ready" | "error";

interface LatLng { lat: number; lng: number }

function normalizePhone(raw: string) {
  let n = raw.replace(/[\s\-\+\(\)]/g, "");
  if (/^[6-9]\d{9}$/.test(n)) n = "91" + n;
  return n;
}

/* ── Get location: GPS → IP fallback ── */
async function getLocation(): Promise<LatLng> {
  // Try GPS (5s)
  const gps = await new Promise<LatLng | null>((resolve) => {
    if (!("geolocation" in navigator)) return resolve(null);
    const t = setTimeout(() => resolve(null), 10000);
    navigator.geolocation.getCurrentPosition(
      (p) => { clearTimeout(t); resolve({ lat: p.coords.latitude, lng: p.coords.longitude }); },
      () => { clearTimeout(t); resolve(null); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
  if (gps) return gps;

  // IP fallback
  try {
    const d = await (await fetch("https://ipapi.co/json/")).json() as { latitude?: number; longitude?: number };
    if (d.latitude && d.longitude) return { lat: d.latitude, lng: d.longitude };
  } catch { /* ignore */ }

  try {
    const d = await (await fetch("https://ip-api.com/json/")).json() as { lat?: number; lon?: number; status?: string };
    if (d.status === "success" && d.lat && d.lon) return { lat: d.lat, lng: d.lon };
  } catch { /* ignore */ }

  throw new Error("Could not get location. Please allow GPS or check internet.");
}

const DEFAULT_MSG = "hey dad im in danger please help me";

export default function App() {
  const [view, setView] = useState<View>("home");
  const [contact, setContact] = useState("");
  const [contactInput, setContactInput] = useState("");
  const [sosMsg, setSosMsg] = useState(DEFAULT_MSG);
  const [sosMsgInput, setSosMsgInput] = useState(DEFAULT_MSG);
  const [status, setStatus] = useState<Status>("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [waLink, setWaLink] = useState("");
  const [mapsLink, setMapsLink] = useState("");

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Auth State
  const [userName, setUserName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authName, setAuthName] = useState("");

  useEffect(() => {
    const s = localStorage.getItem("sera_contact") ?? "";
    const m = localStorage.getItem("sera_msg") ?? DEFAULT_MSG;
    const u = localStorage.getItem("sera_user");

    setContact(s); setContactInput(s);
    setSosMsg(m); setSosMsgInput(m);

    if (u) {
      setUserName(u);
    } else {
      setView("login");
    }
  }, []);

  const handleLogin = () => {
    if (!authPhone.trim()) return alert("Enter phone number");
    const name = localStorage.getItem("sera_user_" + authPhone) || "User";
    localStorage.setItem("sera_user", name);
    setUserName(name);
    setView("home");
  };

  const handleSignup = () => {
    if (!authName.trim() || !authPhone.trim()) return alert("Enter full name and phone");
    localStorage.setItem("sera_user_" + authPhone, authName);
    localStorage.setItem("sera_user", authName);
    setUserName(authName);
    setView("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("sera_user");
    setUserName("");
    setAuthPhone("");
    setView("login");
  };

  const saveContact = () => {
    const t = contactInput.trim();
    const m = sosMsgInput.trim() || DEFAULT_MSG;
    if (!t) return;
    localStorage.setItem("sera_contact", t);
    localStorage.setItem("sera_msg", m);
    setContact(t); setSosMsg(m); setView("home");
  };

  /* ── VOICE RECORDING ── */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/mp3" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      alert("Microphone access denied or not available. Please allow microphone permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
    }
  };

  const discardRecording = () => {
    setAudioBlob(null);
    setAudioUrl("");
    audioChunksRef.current = [];
  };

  /* ── SOS: get location → open WhatsApp directly ── */
  const handleSOS = async () => {
    if (!contact) { setView("settings"); return; }
    if (status === "locating" || status === "sending") return;

    setStatus("sending");
    setStatusMsg("Preparing emergency flow...");

    // 1. Share voice note FIRST to preserve the browser's strict "user gesture" requirement.
    // This instantly opens the share sheet. Code execution pauses until the user finishes sharing.
    if (audioBlob) {
      const file = new File([audioBlob], "emergency_audio.mp3", { type: "audio/mp3", lastModified: Date.now() });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "Emergency Audio Attachment",
          });
        } catch (err) {
          console.error("Share failed", err);
        }
      } else {
        // Fallback if sharing is not supported natively
        const a = document.createElement("a");
        a.href = URL.createObjectURL(file);
        a.download = "emergency_audio.mp3";
        a.click();
      }
    }

    // 2. Now fetch the location
    setStatus("locating");
    setStatusMsg("Getting your location...");
    setMapsLink("");

    let loc: LatLng;
    try {
      loc = await getLocation();
    } catch (e) {
      setStatus("error");
      setStatusMsg(String(e));
      return;
    }

    const maps = `https://maps.google.com/?q=${loc.lat},${loc.lng}`;
    const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    // 3. Text message containing only Location, Note, and Date/Time
    let msg =
      `${sosMsg}\n\n` +
      `📍 *My live location:*\n${maps}\n\n` +
      `🕐 ${now}\n_(SERA Emergency App)_`;

    const num = normalizePhone(contact);
    const wa = `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;

    setMapsLink(maps);
    setWaLink(wa);
    setStatus("ready");
    setStatusMsg("SOS triggered! Sending text...");

    // 4. Redirect to WhatsApp with text message
    // Using location.href is safer than window.open after an async operation to avoid popup blockers
    window.location.href = wa;
  };

  const reset = () => {
    setStatus("idle"); setStatusMsg(""); setWaLink(""); setMapsLink("");
    discardRecording();
  };

  const shareAudio = async () => {
    if (!audioBlob) return;
    const file = new File([audioBlob], "emergency_audio.mp3", { type: "audio/mp3", lastModified: Date.now() });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Emergency Audio",
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(file);
      a.download = "emergency_audio.mp3";
      a.click();
    }
  };

  /* ════ SETTINGS ════ */
  if (view === "settings") {
    return (
      <div style={S.page}>
        <button onClick={() => setView("home")} style={S.back}>← Back</button>
        <div style={{ textAlign: "center" }}>
          <h1 style={S.h1}>Settings</h1>
          <p style={S.sub}>
            SOS opens WhatsApp with your message + live location.
          </p>
        </div>
        <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Phone number */}
          <div>
            <label style={S.label}>Emergency Contact Number</label>
            <input
              id="contact-input" type="tel"
              placeholder="9045644116  or  +919045644116"
              value={contactInput}
              onChange={e => setContactInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && saveContact()}
              style={S.input} autoFocus
            />
            {contactInput && (
              <p style={{ fontSize: 12, color: "#00e676", marginTop: 6 }}>
                ✅ Will message: +{normalizePhone(contactInput)}
              </p>
            )}
          </div>

          {/* Custom SOS message */}
          <div>
            <label style={S.label}>SOS Message (what WhatsApp will say)</label>
            <textarea
              id="sos-msg-input"
              value={sosMsgInput}
              onChange={e => setSosMsgInput(e.target.value)}
              rows={3}
              style={{
                ...S.input,
                fontSize: 15,
                lineHeight: 1.5,
                resize: "vertical",
                fontFamily: "Inter, sans-serif",
              }}
              placeholder="hey dad im in danger please help me"
            />
            <p style={{ fontSize: 11, color: "#4a5568", marginTop: 6 }}>
              Your live location link will be added automatically below this message.
            </p>
          </div>

        </div>

        <button id="save-contact" onClick={saveContact} style={S.saveBtn}>
          Save Settings
        </button>
      </div>
    );
  }


  /* ════ AUTH VIEWS ════ */
  if (view === "login" || view === "signup") {
    const isLogin = view === "login";
    return (
      <div style={S.page} className="bg-animated">
        <div className="glass-card" style={{ maxWidth: 380, width: "100%", padding: "40px 30px" }}>
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <div style={{ fontSize: 50, marginBottom: 10 }}>🚨</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#f0f4ff", letterSpacing: 2 }}>SERA</h1>
            <p style={{ color: "#a0aec0", fontSize: 13, marginTop: 4 }}>Smart Emergency Response</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {!isLogin && (
              <div>
                <label style={S.label}>Full Name</label>
                <input style={S.input} placeholder="John Doe" value={authName} onChange={e => setAuthName(e.target.value)} />
              </div>
            )}
            <div>
              <label style={S.label}>Your Phone Number</label>
              <input style={S.input} type="tel" placeholder="+91..." value={authPhone} onChange={e => setAuthPhone(e.target.value)} onKeyDown={e => e.key === "Enter" && (isLogin ? handleLogin() : handleSignup())} />
            </div>

            <button style={{ ...S.saveBtn, marginTop: 10 }} onClick={isLogin ? handleLogin : handleSignup}>
              {isLogin ? "Access Dashboard" : "Create Account"}
            </button>

            <p style={{ textAlign: "center", color: "#a0aec0", fontSize: 13, marginTop: 10, cursor: "pointer", textDecoration: "underline" }} onClick={() => setView(isLogin ? "signup" : "login")}>
              {isLogin ? "New user? Sign up here" : "Already have an account? Log in"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ════ HOME ════ */
  const isLocating = status === "locating";
  const isSending = status === "sending";
  const isWorking = isLocating || isSending;

  return (
    <div style={S.page} className="bg-animated">

      {/* Header */}
      <div style={{ textAlign: "center", position: "relative", width: "100%", maxWidth: 340 }}>
        <button onClick={handleLogout} style={{ position: "absolute", left: 0, top: 4, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#a0aec0", padding: "4px 10px", borderRadius: 8, cursor: "pointer", fontSize: 11 }}>
          Logout
        </button>
        <p style={{ fontSize: 10, letterSpacing: 4, color: "#a0aec0", fontWeight: 700 }}>SERA</p>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#f0f4ff", marginTop: 6 }}>
          Welcome, <span style={{ color: "#ff3b3b" }}>{userName || "User"}</span>
        </h1>
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            background: contact ? "#00e676" : "#ff3b3b",
            boxShadow: contact ? "0 0 8px #00e676" : "0 0 8px #ff3b3b",
          }} />
          <span style={{ fontSize: 13, color: "#4a5568" }}>
            {contact ? `Contact: +${normalizePhone(contact)}` : "⚠️ No contact — tap Settings"}
          </span>
        </div>
      </div>

      {/* Center */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, width: "100%", maxWidth: 340 }}>

        {/* Status */}
        <div style={{ minHeight: 20, textAlign: "center" }}>
          {statusMsg && (
            <p style={{ fontSize: 13, color: status === "error" ? "#ff3b3b" : "#ff9800", lineHeight: 1.6 }}>
              {statusMsg}
            </p>
          )}
        </div>

        {/* Voice Note UI (Only shown before locating) */}
        {status === "idle" && (
          <div style={{ ...S.card, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
            <p style={{ fontSize: 13, color: "#f0f4ff", fontWeight: 600 }}>🎤 Voice Note (Optional)</p>

            {!isRecording && !audioBlob && (
              <button onClick={startRecording} style={{ ...S.smallBtn, borderColor: "#00d4ff", color: "#00d4ff", width: "100%" }}>
                Start Recording
              </button>
            )}

            {isRecording && (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <span style={{ color: "#ff3b3b", fontSize: 12, fontWeight: "bold" }}>Recording... 🔴</span>
                <button onClick={stopRecording} style={{ ...S.smallBtn, borderColor: "#ff3b3b", color: "#ff3b3b", width: "100%" }}>
                  Stop Recording
                </button>
              </div>
            )}

            {audioBlob && !isRecording && (
              <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <audio src={audioUrl} controls style={{ height: 36, width: "100%" }} />
                <button onClick={discardRecording} style={{ ...S.smallBtn, borderColor: "#4a5568", color: "#4a5568", width: "100%" }}>
                  Discard Audio
                </button>
              </div>
            )}
          </div>
        )}

        {/* SOS Button */}
        {(status === "idle" || isWorking || status === "error") && (
          <button
            id="sos-button"
            onClick={handleSOS}
            disabled={isWorking}
            className={`sos-btn-realistic ${status === "idle" ? "sos-pulse" : ""}`}
            aria-label="Send SOS"
            style={{
              width: 240, height: 240, borderRadius: "50%",
              cursor: isWorking ? "wait" : "pointer",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 10,
              ...(status === "error" ? { background: "linear-gradient(145deg, #444, #222)", boxShadow: "none" } : {}),
              ...(isWorking ? { background: "linear-gradient(145deg, #ffb74d, #f57c00)", boxShadow: "0 10px 25px rgba(255,152,0,0.5)" } : {})
            }}
          >
            <span style={{ fontSize: 50, lineHeight: 1, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              {status === "error" ? "⚠️" : isWorking ? (isSending ? "📤" : "📡") : "🆘"}
            </span>
            <span style={{ fontSize: 28, fontWeight: 900, color: "white", letterSpacing: 5, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
              {isWorking ? "..." : status === "error" ? "RETRY" : "SOS"}
            </span>
            {status === "idle" && (
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", letterSpacing: 2, fontWeight: 600 }}>
                TAP TO ALERT
              </span>
            )}
            {isWorking && (
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
                {isSending ? "uploading..." : "locating..."}
              </span>
            )}
          </button>
        )}

        {/* ── READY: WhatsApp opened, show big SEND button ── */}
        {status === "ready" && (
          <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>

            {/* Location card */}
            <div style={S.card}>
              <p style={{ fontSize: 11, color: "#4a5568", letterSpacing: 2, marginBottom: 8 }}>📍 LOCATION READY</p>
              <a href={mapsLink} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, color: "#00d4ff", textDecoration: "underline" }}>
                View on Google Maps ↗
              </a>
            </div>

            {/* Primary action */}
            <a
              id="open-whatsapp"
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: "100%",
                background: "#25D366",
                borderRadius: 16,
                padding: "18px",
                fontSize: 18,
                fontWeight: 800,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                textDecoration: "none",
                boxShadow: "0 0 30px rgba(37,211,102,0.4)",
                letterSpacing: 1,
              }}
            >
              <span style={{ fontSize: 26 }}>💬</span>
              1. SEND ON WHATSAPP
            </a>

            {audioBlob && (
              <button
                onClick={shareAudio}
                style={{
                  width: "100%",
                  background: "#00d4ff",
                  border: "none",
                  borderRadius: 16,
                  padding: "18px",
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#0a0a0f",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  cursor: "pointer",
                  boxShadow: "0 0 30px rgba(0,212,255,0.4)",
                  letterSpacing: 1,
                }}
              >
                <span style={{ fontSize: 26 }}>🎵</span>
                2. SHARE AUDIO FILE
              </button>
            )}

            <p style={{ fontSize: 12, color: "#4a5568", textAlign: "center", padding: "0 10px" }}>
              {statusMsg === "Direct SMS alert sent! ✅" ? (
                <>SMS Sent Automatically! You can also send via WhatsApp below as a backup.</>
              ) : (
                <>WhatsApp opened → press <strong style={{ color: "#f0f4ff" }}>Send</strong> — done ✅</>
              )}
            </p>

            <div style={{ display: "flex", gap: 10, width: "100%" }}>
              <button
                onClick={handleSOS}
                style={{ ...S.smallBtn, flex: 1, borderColor: "#25D366", color: "#25D366" }}>
                🔁 Resend
              </button>
              <button onClick={reset} style={{ ...S.smallBtn, flex: 1, borderColor: "#4a5568", color: "#4a5568" }}>
                ↩ Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Settings */}
      <button id="settings-button" onClick={() => setView("settings")} style={S.settingsBtn}>
        ⚙️ Emergency Contact {contact ? `(+${normalizePhone(contact)})` : "— Not Set"}
      </button>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100dvh", background: "#0a0a0f",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "space-between",
    padding: "48px 24px 36px",
  },
  back: {
    position: "absolute", top: 20, left: 20,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#f0f4ff", borderRadius: 12,
    padding: "8px 16px", fontSize: 14, cursor: "pointer",
  },
  h1: { fontSize: 22, fontWeight: 700, color: "#f0f4ff", marginBottom: 10 },
  sub: { fontSize: 14, color: "#4a5568", lineHeight: 1.6, textAlign: "center", maxWidth: 300 },
  label: { fontSize: 13, color: "#4a5568", fontWeight: 500, display: "block", marginBottom: 8 },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 14, padding: "16px",
    fontSize: 18, color: "#f0f4ff", outline: "none",
  },
  saveBtn: {
    width: "100%", maxWidth: 360,
    background: "#ff3b3b", border: "none",
    borderRadius: 16, padding: "16px",
    fontSize: 16, fontWeight: 700, color: "white", cursor: "pointer",
  },
  card: {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 14, padding: "14px",
  },
  smallBtn: {
    background: "transparent", border: "1px solid",
    borderRadius: 12, padding: "12px",
    fontSize: 14, cursor: "pointer", fontWeight: 600,
    textAlign: "center" as const,
  },
  settingsBtn: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#4a5568", borderRadius: 14,
    padding: "12px 24px", fontSize: 13, cursor: "pointer",
    maxWidth: 340, textAlign: "center" as const,
  },
};
