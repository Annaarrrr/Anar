import { useState, useEffect } from "react";
import { ArrowLeft, Target, RefreshCw } from "lucide-react";
import { api } from "../services/api";
import { Screen, Goal, Task } from "../types";

interface Props {
  onNavigate: (s: Screen) => void;
  activeGoal: Goal | null;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  refreshGoal: () => Promise<void>;
}


export function VisionBoardScreen({ onNavigate, activeGoal, tasks, setTasks, refreshGoal }: Props) {
  const [updating, setUpdating] = useState(false);

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  // Animate progress bar from 0 on mount
  const [displayProgress, setDisplayProgress] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setDisplayProgress(progress), 150);
    return () => clearTimeout(t);
  }, [progress]);

  const toggleTask = async (id: string, currentlyCompleted: boolean) => {
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !currentlyCompleted } : t));

    try {
      await api.toggleTask(id, !currentlyCompleted);
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
        borderBottom: "1px solid #E2E8F0",
        flexShrink: 0,
      }}>
        <button style={{
          width: 36, height: 36, borderRadius: 10,
          background: "#F8FAFC", border: "1px solid #E2E8F0",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>
          <Target size={16} color="#4F46E5" />
        </button>

        <span style={{ fontSize: 14, fontWeight: 700, color: "#1E293B" }}>لوحة الأهداف</span>

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

      {/* Scrollable content */}
      <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "16px 16px 110px" }}>
        {activeGoal ? (
          <>
            {/* Goal Card */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 14,
                padding: "16px 18px",
                marginBottom: 16,
                border: "1px solid #E2E8F0",
              }}
            >
              {/* Title */}
              <div style={{ marginBottom: 12 }}>
                <p style={{ margin: 0, fontSize: 10, color: "#64748B", fontWeight: 600 }}>
                  🎯 الهدف النشط
                </p>
                <h2 style={{
                  margin: "4px 0 0", fontSize: 14, fontWeight: 700,
                  color: "#1E293B", lineHeight: 1.5,
                }}>
                  {activeGoal.text}
                </h2>
              </div>

              {/* Progress bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "#64748B" }}>
                    {completedCount}/{tasks.length} مهام مكتملة
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#4F46E5" }}>
                    {Math.round(progress)}%
                  </span>
                </div>
                <div style={{
                  height: 5, background: "#F1F5F9",
                  borderRadius: 3, overflow: "hidden",
                  border: "1px solid #E2E8F0",
                }}>
                  <div
                    style={{
                      height: "100%", width: `${displayProgress}%`,
                      background: "#4F46E5",
                      borderRadius: 3,
                      transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Section header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{
                fontSize: 10, color: "#4F46E5",
                background: "#EEF2FF", padding: "2px 8px", borderRadius: 6, fontWeight: 700,
              }}>
                {tasks.length} مهام
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>المهام المقررة</span>
            </div>

            {/* Task list (checklist style) */}
            <div style={{ display: "flex", flexDirection: "column", background: "#FFFFFF", borderRadius: 12, border: "1px solid #E2E8F0", overflow: "hidden" }}>
              {tasks.map((task, i) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id, task.completed)}
                  className="fade-slide-up"
                  style={{
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    cursor: "pointer",
                    borderBottom: "1px solid #F1F5F9",
                    opacity: task.completed ? 0.5 : 1,
                    transition: "opacity 0.2s ease",
                    animationDelay: `${i * 50}ms`,
                  }}
                >
                  {/* Left: Circular checkbox */}
                  <div
                    style={{
                      width: 20, height: 20, borderRadius: "50%",
                      border: task.completed ? "2px solid #10B981" : "2px solid #CBD5E1",
                      background: task.completed ? "#10B981" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {task.completed && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4.5L3.5 7L9 1"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Right: Text block */}
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <p style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#334155",
                      textDecoration: task.completed ? "line-through" : "none",
                      lineHeight: 1.5,
                    }}>
                      {task.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{
            textAlign: "center", padding: "40px 24px", background: "#FFFFFF",
            borderRadius: 14, border: "1px dashed #CBD5E1",
            color: "#64748B", marginTop: 40,
          }}>
            <p style={{ fontSize: 24, margin: 0 }}>🎯</p>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1E293B", margin: "10px 0 6px" }}>لوحة أهدافك فارغة</h3>
            <p style={{ fontSize: 12, margin: 0, lineHeight: 1.6 }}>تفضل بالانتقال إلى المحادثة للتحدث مع مساعدك الذكي ووضع هدفك وخطة مهامك الأولى!</p>
          </div>
        )}
      </div>

      {/* Action overlay at the bottom */}
      {activeGoal && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "14px 16px 16px",
          background: "#FFFFFF",
          borderTop: "1px solid #E2E8F0",
        }}>
          <button
            onClick={handleRefresh}
            disabled={updating}
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: "'Cairo', sans-serif",
            }}
          >
            <RefreshCw size={14} color="white" className={updating ? "animate-spin" : ""} />
            <span>{updating ? "جاري تحديث البيانات..." : "تحديث المهام"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
