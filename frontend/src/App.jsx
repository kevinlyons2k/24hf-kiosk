import { useState, useRef, useEffect } from "react";

// ── API URL: /api/chat hits our backend proxy ─────────────────────────────────
// In dev: Vite proxies /api → localhost:3001
// In production: same domain as frontend, or set VITE_API_URL env var
const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/chat`
  : "/api/chat";

// ── Markdown / content renderer ───────────────────────────────────────────────
function renderContent(text) {
  return text.split("\n").map((line, i) => {
    const t = line.trim();
    if (!t) return <div key={i} style={{ height: 4 }} />;
    if (t === "---") return <hr key={i} style={{ border: "none", borderTop: "1px solid rgba(245,200,66,0.2)", margin: "10px 0" }} />;
    if (/^\*\*[^*]+\*\*$/.test(t))
      return <div key={i} style={{ color: "#f5c842", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 12, marginBottom: 2 }}>{t.slice(2, -2)}</div>;
    if (t.startsWith("📍"))
      return <div key={i} style={{ color: "#f5c842", fontWeight: 600, fontSize: 13, marginTop: 6 }}>{t}</div>;
    if (t.startsWith("•"))
      return (
        <div key={i} style={{ display: "flex", gap: 7, marginTop: 3 }}>
          <span style={{ color: "#f5c842", flexShrink: 0 }}>▸</span>
          <span style={{ color: "#ccc", fontSize: 13, lineHeight: 1.55 }}>{t.slice(1).trim()}</span>
        </div>
      );
    if (/^[A-Z][A-Z\s()]+$/.test(t) && t.length > 3)
      return <div key={i} style={{ color: "#f5c842", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 14, marginBottom: 4, borderBottom: "1px solid rgba(245,200,66,0.15)", paddingBottom: 4 }}>{t}</div>;
    return (
      <div key={i} style={{ color: "#ddd", fontSize: 14, lineHeight: 1.65, marginTop: 2 }}>
        {t.split(/(\*\*[^*]+\*\*)/).map((p, j) =>
          /^\*\*[^*]+\*\*$/.test(p)
            ? <strong key={j} style={{ color: "#fff" }}>{p.slice(2, -2)}</strong>
            : p
        )}
      </div>
    );
  });
}

// ── Main component ────────────────────────────────────────────────────────────
export default function App() {
  const WELCOME = "Hi! Thanks for starting your journey to a happier, healthier you with 24 Hour Fitness! 👋 I'm **Max**, your Virtual Assistant. I'll collect your information and build your fitness profile today.\n\nWhat's your first name?";

  // displayMessages: everything shown in the chat UI
  // Starts with the welcome message (display only — never sent to API)
  const [displayMessages, setDisplayMessages] = useState([
    { role: "assistant", content: WELCOME, id: "welcome" }
  ]);

  // apiRef: the real conversation sent to the backend
  // Starts EMPTY — first entry is always the user's first reply
  const apiRef = useRef([]);

  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayMessages, loading]);

  async function send(text) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput("");
    setError(null);
    setLoading(true);

    // Append user message to conversation ref (synchronous — no stale state)
    apiRef.current = [...apiRef.current, { role: "user", content: trimmed }];

    // Show it immediately in the UI
    setDisplayMessages(prev => [...prev, {
      role: "user", content: trimmed, id: Date.now()
    }]);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiRef.current }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server error ${res.status}`);
      }

      const reply = data.reply;

      // Append assistant reply to conversation ref
      apiRef.current = [...apiRef.current, { role: "assistant", content: reply }];

      setDisplayMessages(prev => [...prev, {
        role: "assistant", content: reply, id: Date.now() + 1
      }]);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function resetChat() {
    apiRef.current = [];
    setDisplayMessages([{ role: "assistant", content: WELCOME, id: Date.now() }]);
    setInput("");
    setError(null);
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0a0a0a" }}>

      {/* ── Header ── */}
      <div style={{ background: "#111", borderBottom: "1px solid #1e1e1e", padding: "12px 20px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <img
          src="https://www.24hourfitness.com/favicon.ico"
          alt="24HF"
          style={{ width: 34, height: 34, borderRadius: 8, background: "#fff", padding: 3, objectFit: "contain", flexShrink: 0 }}
          onError={e => { e.target.style.display = "none"; }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>24 Hour Fitness</div>
          <div style={{ color: "#555", fontSize: 12 }}>Max — Virtual Assistant</div>
        </div>
        <button
          onClick={resetChat}
          style={{ background: "transparent", border: "1px solid #2a2a2a", borderRadius: 8, color: "#666", padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#f5c842"; e.currentTarget.style.color = "#f5c842"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#666"; }}
        >
          New Guest
        </button>
      </div>

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {displayMessages.map(msg => (
          <div key={msg.id} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 10, maxWidth: 720, margin: "0 auto", width: "100%" }}>
            {msg.role === "assistant" && (
              <div style={{ width: 36, height: 36, borderRadius: 12, flexShrink: 0, background: "linear-gradient(135deg,#f5c842,#e07820)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, color: "#000", marginBottom: 2 }}>
                M
              </div>
            )}
            <div style={{
              maxWidth: "82%",
              background: msg.role === "user" ? "linear-gradient(135deg,#f5c842,#e07820)" : "#1a1a1a",
              color: msg.role === "user" ? "#000" : "#ddd",
              borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "4px 20px 20px 20px",
              padding: "14px 18px",
              border: msg.role === "user" ? "none" : "1px solid #252525",
              fontWeight: msg.role === "user" ? 600 : 400,
              fontSize: 15,
              lineHeight: 1.6,
            }}>
              {msg.role === "user" ? msg.content : renderContent(msg.content)}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, maxWidth: 720, margin: "0 auto", width: "100%" }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: "linear-gradient(135deg,#f5c842,#e07820)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 15, color: "#000" }}>M</div>
            <div style={{ background: "#1a1a1a", border: "1px solid #252525", borderRadius: "4px 20px 20px 20px", padding: "16px 20px", display: "flex", gap: 6, alignItems: "center" }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#f5c842", opacity: 0.5, animation: "bob 1.2s infinite ease-in-out", animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div style={{ maxWidth: 720, margin: "0 auto", width: "100%", background: "#2a1010", border: "1px solid #5a2020", borderRadius: 12, padding: "12px 16px", color: "#ff8080", fontSize: 13 }}>
            ⚠️ {error} — please try again.
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div style={{ padding: "16px 20px 24px", background: "#111", borderTop: "1px solid #1e1e1e", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 10, maxWidth: 720, margin: "0 auto" }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Type your answer..."
            disabled={loading}
            autoFocus
            style={{ flex: 1, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 16, padding: "16px 20px", color: "#fff", fontSize: 15, fontFamily: "inherit", outline: "none", transition: "border-color 0.2s" }}
            onFocus={e => e.target.style.borderColor = "#f5c842"}
            onBlur={e => e.target.style.borderColor = "#2a2a2a"}
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            style={{ background: !loading && input.trim() ? "linear-gradient(135deg,#f5c842,#e07820)" : "#1e1e1e", border: "none", borderRadius: 16, width: 56, height: 56, flexShrink: 0, cursor: !loading && input.trim() ? "pointer" : "default", color: !loading && input.trim() ? "#000" : "#333", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
            ➤
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bob { 0%,100%{transform:translateY(0);opacity:0.5} 50%{transform:translateY(-6px);opacity:1} }
        input::placeholder { color: #444; }
      `}</style>
    </div>
  );
}
