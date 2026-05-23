import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Target, RefreshCw } from "lucide-react";
import { api } from "../services/api";

type Screen = "home" | "chat" | "vision";

interface Props {
  onNavigate: (s: Screen) => void;
  activeGoal: { id: string; text: string } | null;
  tasks: any[];
  setTasks: React.Dispatch<React.SetStateAction<any[]>>;
  refreshGoal: () => Promise<void>;
}

export function VisionBoardScreen({ onNavigate, activeGoal, tasks, setTasks, refreshGoal }: Props) {
  const [updating, setUpdating] = useState(false);

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const toggleTask = async (id: string, currentlyCompleted: boolean) => {
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !currentlyCompleted } : t));

    try {
      await api.toggleTask(id, !currentlyCompleted);
      // Fetch latest states from database to sync
      await refreshGoal();
    } catch (err) {
      alert("فشل تحديث حالة المهمة في الخادم");
      // Revert optimistic update
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: currentlyCompleted } : t));
      console.error(err);
    }
  };

  const handleRefresh = async () => {
    setUpdating(true);
    try {
      await refreshGoal();
    } finally {
      setUpdating(false);
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
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Cairo', sans-serif",
      }}
    >
      {/* Header */}
      <div style={{
        background: "#FFFFFF",
        padding: "11px 16px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
        flexShrink: 0,
      }}>
        <button style={{
          width: 40, height: 40, borderRadius: 12,
          background: "#F5F3FF", border: "none",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>
          <Target size={18} color="#6C5CE7" />
        </button>

        <span style={{ fontSize: 16, fontWeight: 700, color: "#2D3436" }}>لوحة الأهداف</span>

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

      {/* Scrollable content */}
      <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "14px 16px 110px" }}>
        {activeGoal ? (
          <>
            {/* Goal Card */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                background: "linear-gradient(135deg, #6C5CE7 0%, #9B8EEF 55%, #A29BFE 100%)",
                borderRadius: 20,
                padding: "20px 20px",
                marginBottom: 18,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute", top: -32, left: -22,
                width: 130, height: 130, borderRadius: "50%",
                background: "rgba(255,255,255,0.07)",
              }} />
              <div style={{
                position: "absolute", bottom: -24, right: 40,
                width: 90, height: 90, borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
              }} />

              {/* Title */}
              <div style={{ position: "relative", marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.76)", fontWeight: 600, letterSpacing: 0.3 }}>
                  🎯 هدفي الرئيسي
                </p>
                <h2 style={{
                  margin: "5px 0 0", fontSize: 17, fontWeight: 800,
                  color: "#FFFFFF", lineHeight: 1.5,
                }}>
                  {activeGoal.text}
                </h2>
              </div>

              {/* Progress bar */}
              <div style={{ position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.78)" }}>
                    {completedCount}/{tasks.length} مهام مكتملة
                  </span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: "#FFFFFF" }}>
                    {Math.round(progress)}%
                  </span>
                </div>
                <div style={{
                  height: 10, background: "rgba(255,255,255,0.22)",
                  borderRadius: 5, overflow: "hidden",
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{
                      height: "100%", background: "#FFFFFF",
                      borderRadius: 5,
                      boxShadow: "0 0 10px rgba(255,255,255,0.45)",
                    }}
                  />
                </div>
                <p style={{ margin: "6px 0 0", fontSize: 11, color: "rgba(255,255,255,0.68)", textAlign: "left" }}>
                  ⏳ خطة دراسية نشطة
                </p>
              </div>
            </motion.div>

            {/* Section header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 13 }}>
              <span style={{
                fontSize: 12, color: "#6C5CE7", fontWeight: 700,
                background: "#EDE9FF", padding: "4px 12px", borderRadius: 20,
              }}>
                {tasks.length} مهام
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#2D3436" }}>المهام المقررة</span>
            </div>

            {/* Task cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {tasks.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4, ease: "easeOut" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleTask(task.id, task.completed)}
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 16,
                    padding: "14px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    cursor: "pointer",
                    boxShadow: task.completed
                      ? "0 4px 12px rgba(0,184,148,0.1)"
                      : "0 4px 12px rgba(0,0,0,0.05)",
                    border: task.completed
                      ? "1.5px solid rgba(0,184,148,0.22)"
                      : "1.5px solid rgba(0,0,0,0.04)",
                    transition: "border 0.25s ease, box-shadow 0.25s ease",
                  }}
                >
                  {/* Text block */}
                  <div style={{ flex: 1 }}>
                    <p style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 500,
                      color: task.completed ? "#A0A0A0" : "#2D3436",
                      textDecoration: task.completed ? "line-through" : "none",
                      textDecorationColor: "#636E72",
                      lineHeight: 1.55,
                      textAlign: "right",
                      transition: "color 0.25s ease",
                    }}>
                      ⚡ {task.text}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6, marginTop: 5 }}>
                      <AnimatePresence mode="wait">
                        {task.completed ? (
                          <motion.span
                            key="done"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            style={{
                              fontSize: 11, color: "#00B894", fontWeight: 700,
                              background: "rgba(0,184,148,0.1)",
                              padding: "3px 9px", borderRadius: 20,
                            }}
                          >
                            ✓ مكتمل
                          </motion.span>
                        ) : (
                          <motion.span
                            key="pending"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ fontSize: 11, color: "#636E72" }}
                          >
                            📅 اليوم
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Circular checkbox */}
                  <div
                    style={{
                      width: 30, height: 30, borderRadius: "50%",
                      border: task.completed ? "2.5px solid #00B894" : "2.5px solid #D1D5DB",
                      background: task.completed ? "#00B894" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.25s ease",
                    }}
                  >
                    {task.completed && (
                      <motion.svg
                        key="check"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        width="14" height="10" viewBox="0 0 14 10" fill="none"
                      >
                        <path
                          d="M1 5L5 9L13 1"
                          stroke="white"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </motion.svg>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div style={{
            textAlign: "center", padding: "40px 24px", background: "#FFFFFF",
            borderRadius: 20, border: "1.5px dashed rgba(108,92,231,0.2)",
            color: "#636E72", marginTop: 40,
          }}>
            <p style={{ fontSize: 24 }}>🎯</p>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2D3436", margin: "10px 0 6px" }}>لوحة أهدافك فارغة</h3>
            <p style={{ fontSize: 13, margin: 0, lineHeight: 1.6 }}>تفضل بالانتقال إلى المحادثة للتحدث مع مساعدك الذكي ووضع هدفك وخطة مهامك الأولى!</p>
          </div>
        )}
      </div>

      {/* FAB overlay */}
      {activeGoal && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "20px 16px 18px",
          background: "linear-gradient(to top, #FAFAFB 65%, rgba(250,250,251,0))",
        }}>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleRefresh}
            disabled={updating}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)",
              color: "white",
              border: "none",
              borderRadius: 16,
              padding: "15px 20px",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              fontFamily: "'Cairo', sans-serif",
              boxShadow: "0 8px 26px rgba(108,92,231,0.38)",
            }}
          >
            <RefreshCw size={18} color="white" className={updating ? "animate-spin" : ""} />
            <span>{updating ? "جاري تحديث البيانات..." : "تحديث المهام"}</span>
          </motion.button>
        </div>
      )}
    </div>
  );
}
