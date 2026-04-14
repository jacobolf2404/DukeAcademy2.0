import { useState, useRef, useEffect } from "react";
import api from "../api";

export default function ChatBot({ user }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hi ${user?.name?.split(" ")[0] || "there"}! I'm the DukeAcademy AI assistant. Ask me anything about courses, assignments, grades, or the platform!` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chat", {
        message: input,
        history: messages.map((m) => ({ role: m.role, content: m.content })),
      });
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting. Try again in a moment!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="chatbot-toggle" onClick={() => setOpen(!open)}>
        {open ? "\u2715" : "\uD83D\uDCAC"}
      </button>

      {open && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div>
              <strong>DukeAcademy AI Assistant</strong>
              <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>Powered by Claude</div>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chatbot-msg ${m.role === "user" ? "user" : "bot"}`}>
                <div className="chatbot-bubble">{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="chatbot-msg bot">
                <div className="chatbot-bubble" style={{ opacity: 0.6 }}>Thinking...</div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="chatbot-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask me anything..."
              disabled={loading}
            />
            <button onClick={send} disabled={!input.trim() || loading}>&#10148;</button>
          </div>
        </div>
      )}
    </>
  );
}
