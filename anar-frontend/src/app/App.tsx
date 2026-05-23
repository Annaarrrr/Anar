import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HomeScreen } from "./components/HomeScreen";
import { ChatScreen } from "./components/ChatScreen";
import { VisionBoardScreen } from "./components/VisionBoardScreen";
import { api } from "./services/api";
import { AuthScreen } from "./components/AuthScreen";

type Screen = "home" | "chat" | "vision";

const tabs: { id: Screen; label: string; icon: string }[] = [
  { id: "home", label: "الرئيسية", icon: "🏠" },
  { id: "chat", label: "المحادثة", icon: "💬" },
  { id: "vision", label: "الأهداف", icon: "🎯" },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [token, setToken] = useState<string | null>(api.getToken());
  const [activeGoal, setActiveGoal] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingGoal, setLoadingGoal] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const fetchActiveGoal = async () => {
    if (!api.getToken()) return;
    setLoadingGoal(true);
    try {
      const data = await api.getGoal();
      if (data) {
        setActiveGoal({ id: data.id, text: data.text });
        setTasks(data.tasks || []);
      } else {
        setActiveGoal(null);
        setTasks([]);
      }
    } catch (err) {
      console.error("Failed to fetch goal:", err);
    } finally {
      setLoadingGoal(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchActiveGoal();
    } else {
      setActiveGoal(null);
      setTasks([]);
    }
  }, [token]);

  const handleAuthSuccess = (newToken: string) => {
    setToken(newToken);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "100vh",
        background: isMobile ? "#FAFAFB" : "linear-gradient(155deg, #EDE9FF 0%, #FAFAFB 45%, #E6FFF7 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Cairo', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Brand header - visible only on desktop */}
      {!isMobile && (
        <div style={{ marginBottom: 16, textAlign: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: "#6C5CE7", fontFamily: "'Cairo', sans-serif" }}>أنار</span>
            <span style={{ fontSize: 28 }}>✨</span>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#636E72", fontFamily: "'Cairo', sans-serif", direction: "rtl" }}>
            مساعدك الذكي لتحقيق أهدافك
          </p>
          {token && (
            <button
              onClick={() => {
                api.setToken(null);
                setToken(null);
              }}
              style={{
                marginTop: 8,
                background: "none",
                border: "none",
                color: "#D63031",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Cairo', sans-serif",
              }}
            >
              تسجيل الخروج
            </button>
          )}
        </div>
      )}

      {/* Main app container */}
      <div
        style={
          isMobile
            ? {
                width: "100%",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                background: "#FAFAFB",
                position: "relative",
              }
            : {
                width: 430,
                height: "min(880px, 92vh)",
                display: "flex",
                flexDirection: "column",
                background: "#FAFAFB",
                borderRadius: 28,
                overflow: "hidden",
                boxShadow: "0 24px 64px rgba(108, 92, 231, 0.16)",
                border: "1px solid rgba(108, 92, 231, 0.12)",
                position: "relative",
              }
        }
      >
        {/* On mobile, show a small header with brand + logout button */}
        {isMobile && token && (
          <div style={{
            height: 56,
            background: "#FFFFFF",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 18px",
            flexShrink: 0,
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
          }}>
            <button
              onClick={() => {
                api.setToken(null);
                setToken(null);
              }}
              style={{
                background: "none",
                border: "none",
                color: "#D63031",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Cairo', sans-serif",
              }}
            >
              تسجيل الخروج
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: "#6C5CE7", fontFamily: "'Cairo', sans-serif" }}>أنار</span>
              <span style={{ fontSize: 16 }}>✨</span>
            </div>
          </div>
        )}

        {/* Screen content */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {!token ? (
            <AuthScreen onAuthSuccess={handleAuthSuccess} />
          ) : (
            <AnimatePresence mode="wait">
              {screen === "home" && (
                <motion.div key="home" style={{ position: "absolute", inset: 0 }}
                  initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.28, ease: "easeInOut" }}
                >
                  <HomeScreen onNavigate={setScreen} activeGoal={activeGoal} tasks={tasks} />
                </motion.div>
              )}
              {screen === "chat" && (
                <motion.div key="chat" style={{ position: "absolute", inset: 0 }}
                  initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.28, ease: "easeInOut" }}
                >
                  <ChatScreen onNavigate={setScreen} refreshGoal={fetchActiveGoal} />
                </motion.div>
              )}
              {screen === "vision" && (
                <motion.div key="vision" style={{ position: "absolute", inset: 0 }}
                  initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.28, ease: "easeInOut" }}
                >
                  <VisionBoardScreen onNavigate={setScreen} activeGoal={activeGoal} tasks={tasks} setTasks={setTasks} refreshGoal={fetchActiveGoal} />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Bottom tab bar */}
        {token && (
          <div
            dir="rtl"
            style={{
              height: isMobile ? 68 : 78,
              flexShrink: 0,
              background: "#FFFFFF",
              borderTop: "1px solid rgba(0,0,0,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              paddingBottom: isMobile ? 10 : 8,
            }}
          >
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setScreen(tab.id)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
                  background: "none", border: "none", cursor: "pointer",
                  padding: "6px 20px",
                  fontFamily: "'Cairo', sans-serif",
                  position: "relative",
                }}
              >
                <span style={{ fontSize: isMobile ? 20 : 22 }}>{tab.icon}</span>
                <span style={{
                  fontSize: 10,
                  fontWeight: screen === tab.id ? 700 : 400,
                  color: screen === tab.id ? "#6C5CE7" : "#636E72",
                  transition: "color 0.2s ease",
                }}>
                  {tab.label}
                </span>
                {screen === tab.id && (
                  <motion.div
                    layoutId="tab-dot"
                    style={{ width: 5, height: 5, borderRadius: "50%", background: "#6C5CE7", marginTop: 2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
