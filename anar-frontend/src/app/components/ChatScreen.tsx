import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Mic, Send, MoreVertical } from "lucide-react";
import { api } from "../services/api";

type Screen = "home" | "chat" | "vision";

interface Props {
  onNavigate: (s: Screen) => void;
  refreshGoal: () => Promise<void>;
}

const initialMessages = [
  { id: 1, role: "user", text: "أريد الاستعداد لاختبارات نهاية الفصل الدراسي", time: "9:41 ص" },
  {
    id: 2,
    role: "ai",
    text: "رائع! سأساعدك في وضع خطة دراسية مخصصة 📚\n\nما هو موضوع هدفك الدراسي بالتحديد؟ اكتب أي تفاصيل أو مواد ترغب في إضافتها.",
    time: "9:41 ص",
  },
];

export function ChatScreen({ onNavigate, refreshGoal }: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [creating, setCreating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (!inputVal.trim()) return;
    const userMsg = {
      id: Date.now(),
      role: "user",
      text: inputVal,
      time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      const aiMsg = {
        id: Date.now() + 1,
        role: "ai",
        text: `لقد فهمت ذلك! سأقوم بتسجيل تفاصيل هدفك: "${userMsg.text}". اضغط على الزر أدناه لإنشاء خطة المهام وجدولتها في لوحة الأهداف.`,
        time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1200);
  };

  const handleCreateVisionBoard = async () => {
    // Get the user's last message or the last user message text
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    const goalText = lastUserMessage ? lastUserMessage.text : "الاستعداد لاختبارات نهاية الفصل الدراسي";

    setCreating(true);
    try {
      await api.createGoal(goalText);
      await refreshGoal();
      onNavigate("vision");
    } catch (err) {
      alert("فشل إنشاء الهدف، يرجى المحاولة مرة أخرى.");
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      dir="rtl"
      style={{
        height: "100%",
        background: "#FAFAFB",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Cairo', sans-serif",
      }}
    >
      {/* Top bar */}
      <div style={{
        background: "#FFFFFF",
        padding: "11px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        flexShrink: 0,
      }}>
        {/* Options */}
        <button style={{
          width: 40, height: 40, borderRadius: 12,
          background: "#F5F3FF", border: "none",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>
          <MoreVertical size={18} color="#6C5CE7" />
        </button>

        {/* Center AI identity */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>✨</div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#2D3436" }}>أنار AI</span>
          <span style={{ fontSize: 11, color: "#00B894", fontWeight: 600 }}>● متصل الآن</span>
        </div>

        {/* Back */}
        <button
          onClick={() => onNavigate("home")}
          style={{
            width: 40, height: 40, borderRadius: 12,
            background: "#F5F3FF", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}
        >
          <ArrowLeft size={18} color="#6C5CE7" style={{ transform: "scaleX(-1)" }} />
        </button>
      </div>

      {/* Messages */}
      <div className="no-scrollbar" style={{
        flex: 1, overflowY: "auto",
        padding: "14px 16px",
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        {/* Date label */}
        <div style={{ textAlign: "center" }}>
          <span style={{
            fontSize: 11, color: "#636E72",
            background: "rgba(0,0,0,0.05)",
            padding: "3px 12px", borderRadius: 20,
          }}>اليوم</span>
        </div>

        {messages.map((msg, i) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: "easeOut" }}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-start" : "flex-end",
            }}
          >
            <div style={{
              maxWidth: "78%",
              padding: "12px 14px",
              borderRadius: msg.role === "user"
                ? "4px 16px 16px 16px"
                : "16px 4px 16px 16px",
              background: msg.role === "user"
                ? "linear-gradient(135deg, #6C5CE7 0%, #8B7DF0 100%)"
                : "linear-gradient(135deg, #FFFFFF 0%, #F7F5FF 100%)",
              color: msg.role === "user" ? "#FFFFFF" : "#2D3436",
              fontSize: 14,
              lineHeight: 1.75,
              textAlign: "right",
              whiteSpace: "pre-line",
              boxShadow: msg.role === "ai"
                ? "0 4px 14px rgba(0,0,0,0.06)"
                : "0 4px 14px rgba(108,92,231,0.22)",
              border: msg.role === "ai" ? "1px solid rgba(162,155,254,0.18)" : "none",
            }}>
              {msg.text}
              <div style={{
                fontSize: 11,
                color: msg.role === "user" ? "rgba(255,255,255,0.6)" : "#636E72",
                marginTop: 5,
                textAlign: "left",
                direction: "ltr",
              }}>{msg.time}</div>
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: "flex", justifyContent: "flex-end" }}
          >
            <div style={{
              padding: "14px 18px",
              borderRadius: "16px 4px 16px 16px",
              background: "linear-gradient(135deg, #FFFFFF 0%, #F7F5FF 100%)",
              border: "1px solid rgba(162,155,254,0.18)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
              display: "flex", gap: 5, alignItems: "center",
            }}>
              {[0, 1, 2].map(j => (
                <motion.div
                  key={j}
                  animate={{ y: [0, -6, 0], scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.75, delay: j * 0.16, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    width: 7, height: 7,
                    borderRadius: "50%",
                    background: "#A29BFE",
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />

        {/* CTA → Vision Board */}
        <motion.button
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleCreateVisionBoard}
          disabled={creating}
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)",
            color: "white",
            border: "none",
            borderRadius: 16,
            padding: "14px 20px",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Cairo', sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 4,
            boxShadow: "0 8px 22px rgba(108,92,231,0.38)",
          }}
        >
          <span>✨</span>
          <span>{creating ? "جاري إنشاء الأهداف..." : "إنشاء لوحة الأهداف الدراسية"}</span>
        </motion.button>
      </div>

      {/* Input bar */}
      <div style={{ padding: "10px 16px 18px", flexShrink: 0 }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{
            background: "#FFFFFF",
            borderRadius: 20,
            padding: "8px 8px 8px 14px",
            display: "flex", alignItems: "center", gap: 8,
            boxShadow: "0 4px 20px rgba(108,92,231,0.1)",
            border: "1.5px solid rgba(108,92,231,0.1)",
          }}
        >
          <motion.button
            whileTap={{ scale: 0.88 }}
            type="submit"
            style={{
              width: 40, height: 40, borderRadius: 14,
              background: "linear-gradient(135deg, #6C5CE7, #A29BFE)",
              border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}
          >
            <Send size={15} color="white" style={{ transform: "scaleX(-1)" }} />
          </motion.button>
          <input
            placeholder="اكتب رسالتك..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            dir="rtl"
            style={{
              flex: 1, border: "none", outline: "none",
              background: "transparent", fontSize: 14, color: "#2D3436",
              textAlign: "right", fontFamily: "'Cairo', sans-serif",
            }}
          />
          <button type="button" style={{
            width: 40, height: 40, borderRadius: 14,
            background: "#F5F3FF", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
          }}>
            <Mic size={16} color="#6C5CE7" />
          </button>
        </form>
      </div>
    </div>
  );
}
