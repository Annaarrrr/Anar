import { useState, useRef, useEffect } from "react";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { api } from "../services/api";
import { Screen, Message } from "../types";

interface Props {
  onNavigate: (s: Screen) => void;
  refreshGoal: () => Promise<void>;
}

const initialMessages: Message[] = [
  { id: 1, role: "user", text: "أريد الاستعداد لاختبارات نهاية الفصل الدراسي", time: "9:41 ص" },
  {
    id: 2,
    role: "ai",
    text: "رائع! سأساعدك في وضع خطة دراسية مخصصة 📚\n\nما هو موضوع هدفك الدراسي بالتحديد؟ اكتب أي تفاصيل أو مواد ترغب في إضافتها.",
    time: "9:41 ص",
  },
];

export function ChatScreen({ onNavigate, refreshGoal }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [creating, setCreating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSendMessage = () => {
    if (!inputVal.trim()) return;
    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      text: inputVal,
      time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    // Simulate AI response
    timeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: "ai",
        text: `لقد فهمت ذلك! سأقوم بتسجيل تفاصيل هدفك: "${userMsg.text}". اضغط على الزر أدناه لإنشاء خطة المهام وجدولتها في لوحة الأهداف.`,
        time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1200);
  };

  const handleCreateVisionBoard = async () => {
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
        borderBottom: "1px solid #E2E8F0",
        flexShrink: 0,
      }}>
        {/* Options */}
        <button style={{
          width: 36, height: 36, borderRadius: 10,
          background: "#F8FAFC", border: "1px solid #E2E8F0",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>
          <MoreVertical size={16} color="#475569" />
        </button>

        {/* Center AI identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "#EEF2FF",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
            border: "1px solid #E2E8F0",
          }}>✨</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>أنار AI</span>
            <span style={{ fontSize: 10, color: "#10B981", fontWeight: 600 }} className="online-pulse">● متصل</span>
          </div>
        </div>

        {/* Back */}
        <button
          onClick={() => onNavigate("home")}
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: "#F8FAFC", border: "1px solid #E2E8F0",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}
        >
          <ArrowLeft size={16} color="#475569" style={{ transform: "scaleX(-1)" }} />
        </button>
      </div>

      {/* Messages */}
      <div className="no-scrollbar" style={{
        flex: 1, overflowY: "auto",
        padding: "16px 20px",
        display: "flex", flexDirection: "column", gap: 16,
      }}>

        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className="fade-slide-up"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: msg.role === "user" ? "flex-start" : "flex-end",
              width: "100%",
              paddingBottom: 14,
              borderBottom: "1px solid #F1F5F9",
              animationDelay: `${i * 60}ms`,
            }}
          >
            {/* Identity line */}
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: msg.role === "user" ? "#4F46E5" : "#475569",
              marginBottom: 4,
            }}>
              {msg.role === "user" ? "أنت" : "أنار AI"}
            </span>

            {/* Message content */}
            <p style={{
              margin: 0,
              fontSize: 13,
              lineHeight: 1.6,
              color: "#334155",
              textAlign: msg.role === "user" ? "right" : "left",
              whiteSpace: "pre-line",
              maxWidth: "88%",
            }}>
              {msg.text}
            </p>

            {/* Time label */}
            <span style={{
              fontSize: 9,
              color: "#94A3B8",
              marginTop: 4,
            }}>
              {msg.time}
            </span>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            width: "100%",
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#475569", marginBottom: 6 }}>أنار AI</span>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />

        {/* CTA → Vision Board */}
        <button
          onClick={handleCreateVisionBoard}
          disabled={creating}
          style={{
            width: "100%",
            background: "#4F46E5",
            color: "white",
            border: "none",
            borderRadius: 10,
            padding: "12px 20px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Cairo', sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 8,
          }}
        >
          <span>{creating ? "جاري إنشاء المهام..." : "إنشاء لوحة الأهداف"}</span>
        </button>

      </div>

      {/* Input bar */}
      <div style={{
        padding: "12px 16px 20px",
        background: "#FFFFFF",
        borderTop: "1px solid #E2E8F0",
        flexShrink: 0,
      }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            type="submit"
            style={{
              background: "none",
              border: "none",
              color: "#4F46E5",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Cairo', sans-serif",
              padding: "4px 8px",
            }}
          >
            إرسال
          </button>
          <input
            placeholder="اكتب رسالتك هنا..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            dir="rtl"
            style={{
              flex: 1,
              border: "1px solid #E2E8F0",
              outline: "none",
              background: "#F8FAFC",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 13,
              color: "#1E293B",
              textAlign: "right",
              fontFamily: "'Cairo', sans-serif",
            }}
          />
        </form>
      </div>
    </div>
  );
}
