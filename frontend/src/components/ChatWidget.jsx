import { useEffect, useRef, useState } from "react";
import api from "../api/axios.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SUGGESTIONS = [
  "Do you have fonts?",
  "How do I buy?",
  "When will I get my download?",
  "Do you accept card payments?",
  "Any blog guides?",
  "Can I leave a review?",
];

// Stable ids for messages so typing progress persists across panel open/close.
let msgId = 0;
const nextId = () => ++msgId;

const TypingDots = () => (
  <div className="flex items-center gap-1 px-1 py-2">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
);

// Fully controlled by the parent's typing engine — shows the caret only while
// the revealed text is shorter than the full reply. Never re-animates on reopen.
function BotText({ text, value }) {
  const done = value >= text.length;
  return (
    <span className="whitespace-pre-line break-words">
      {text.slice(0, value)}
      {!done && <span className="inline-block w-[2px] h-[1em] align-middle bg-gold animate-pulse" />}
    </span>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState("email"); // "email" | "chat"
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [saving, setSaving] = useState(false);

  const [messages, setMessages] = useState([]);
  const [showHints, setShowHints] = useState(true);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  // How many characters of each bot message have been revealed so far.
  // Lives in this component (always mounted) so closing/reopening the panel
  // never restarts an already-typed reply.
  const [typed, setTyped] = useState({});

  const messagesRef = useRef(null);
  const inputRef = useRef(null);

  // Character-by-character engine — ticks every bot message forward a few chars
  // at a time. Stops updating entries that are already fully revealed.
  useEffect(() => {
    const interval = setInterval(() => {
      setTyped((prev) => {
        let next = null;
        for (const m of messages) {
          if (m.role !== "bot") continue;
          const cur = prev[m.id] || 0;
          if (cur >= m.text.length) continue;
          next = next || { ...prev };
          next[m.id] = Math.min(cur + 3, m.text.length);
        }
        return next || prev;
      });
    }, 18);
    return () => clearInterval(interval);
  }, [messages]);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, open]);

  const start = async (e) => {
    e?.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setEmailError("Please enter a valid email so we can send your order.");
      return;
    }
    setEmailError("");
    setSaving(true);
    try {
      const res = await api.post("/chat/start", { email });
      setMessages([{ id: nextId(), role: "bot", text: res.data.reply }]);
      setPhase("chat");
    } catch {
      setMessages([{ id: nextId(), role: "bot", text: "I could not start the chat right now — please try again in a moment." }]);
      setPhase("chat");
    } finally {
      setSaving(false);
    }
  };

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || typing) return;
    setInput("");
    setShowHints(false);
    setMessages((prev) => [...prev, { id: nextId(), role: "user", text: message }]);

    // Natural "thinking" pause before answering
    setTyping(true);
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));

    try {
      const res = await api.post("/chat/message", { email, message });
      setMessages((prev) => [...prev, { id: nextId(), role: "bot", text: res.data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: "bot", text: "Something went wrong on my end — mind trying that again?" },
      ]);
    } finally {
      setTyping(false);
      inputRef.current?.focus();
    }
  };

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-5 right-5 z-[70] w-12 h-12 rounded-full bg-gold text-ink shadow-[0_8px_25px_rgba(242,184,75,0.45)] hover:brightness-110 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 right-4 left-4 sm:left-auto sm:right-5 sm:w-[380px] z-[70] flex flex-col max-h-[70vh] sm:max-h-[560px] bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl animate-[float-in_0.25s_ease-out]">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-ink border-b border-border">
            <span className="relative flex w-2.5 h-2.5">
              <span className="absolute inline-flex w-full h-full rounded-full bg-teal opacity-60 animate-ping" />
              <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-teal" />
            </span>
            <div className="flex-1">
              <p className="font-display font-700 text-sm leading-none">Vaultly Assistant</p>
              <p className="text-[11px] text-text-faint mt-1">Online — replies instantly</p>
            </div>
          </div>

          {phase === "email" ? (
            /* Step 1 — capture email BEFORE anything else */
            <form onSubmit={start} className="p-5 space-y-4">
              <p className="text-sm text-text-muted leading-relaxed">
                Welcome! Drop your email and I'll be here to help you find products, order them and get your downloads.
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah.mitchell@gmail.com"
                autoFocus
                className="w-full bg-ink border border-border rounded-lg px-4 py-3 text-sm focus:border-gold outline-none"
              />
              {emailError && <p className="text-xs text-red-400">{emailError}</p>}
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-gold text-ink font-semibold text-sm px-4 py-3 rounded-lg hover:brightness-110 transition disabled:opacity-60"
              >
                {saving ? "Starting…" : "Start chat"}
              </button>
              <p className="text-[11px] text-text-faint text-center">
                We only use this to send your order and follow up — no spam, ever.
              </p>
            </form>
          ) : (
            <>
              {/* Messages */}
              <div ref={messagesRef} className="chat-scroll flex-1 overflow-y-auto p-4 space-y-3 bg-ink">
                {messages.map((m) => {
                  const value = m.role === "bot" ? typed[m.id] || 0 : null;
                  return (
                    <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                          m.role === "user"
                            ? "bg-gold text-ink rounded-br-sm"
                            : "bg-surface border border-border text-text-primary rounded-bl-sm"
                        }`}
                      >
                        {m.role === "bot" ? (
                          <BotText text={m.text} value={value} />
                        ) : (
                          <span className="whitespace-pre-line break-words">{m.text}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {typing && (
                  <div className="flex justify-start">
                    <div className="bg-surface border border-border rounded-2xl rounded-bl-sm px-3 py-2">
                      <TypingDots />
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions — only until the client asks their first question */}
              {showHints && (
                <div className="px-3 pt-2 flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      disabled={typing}
                      className="text-xs px-3 py-1.5 rounded-full border border-border bg-surface text-text-muted hover:text-gold hover:border-gold/60 transition disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="p-3 pt-2 flex gap-2 items-center border-t border-border"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question…"
                  className="flex-1 bg-ink border border-border rounded-lg px-4 py-2.5 text-sm focus:border-gold outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || typing}
                  aria-label="Send"
                  className="w-10 h-10 shrink-0 rounded-lg bg-gold text-ink flex items-center justify-center hover:brightness-110 disabled:opacity-50 transition"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}