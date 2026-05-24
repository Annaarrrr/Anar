import { useEffect, useState } from "react";
import { Bell, ChevronLeft, Plus, ArrowLeft, LogOut } from "lucide-react";
import { Screen, Goal, Task } from "../types";

interface Props {
  onNavigate: (s: Screen) => void;
  activeGoal: Goal | null;
  tasks: Task[];
  onLogout: () => void;
}


const quickChips = [
  { emoji: "🎓", label: "دراسة" },
  { emoji: "💼", label: "عمل" },
  { emoji: "🏃", label: "رياضة" },
  { emoji: "📖", label: "قراءة" },
  { emoji: "🧘", label: "صحة" },
  { emoji: "✍️", label: "آخر" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12)  return { text: "صباح الخير",  emoji: "🌅" };
  if (h >= 12 && h < 17) return { text: "مرحباً",       emoji: "🌤" };
  if (h >= 17 && h < 21) return { text: "مساء الخير",  emoji: "🌆" };
  return                         { text: "مساء النور",  emoji: "🌙" };
}

function getArabicDate() {
  return new Date().toLocaleDateString("ar-EG", {
    weekday: "long", day: "numeric", month: "long",
  });
}

export function HomeScreen({ onNavigate, activeGoal, tasks, onLogout }: Props) {
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Animate progress bar: start at 0, transition to real value after mount
  const [displayProgress, setDisplayProgress] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setDisplayProgress(progressPercent), 120);
    return () => clearTimeout(t);
  }, [progressPercent]);

  const greeting = getGreeting();
  const arabicDate = getArabicDate();

  const firstIncomplete = tasks.find((t) => !t.completed);

  const todayTask = {
    emoji: firstIncomplete ? "⚡" : (totalCount > 0 ? "🎉" : "🎯"),
    text: firstIncomplete
      ? firstIncomplete.text
      : (totalCount > 0 ? "لقد أكملت جميع المهام المحددة! أحسنت عملًا" : "لا يوجد مهام حالياً. قم بإنشاء هدفك الأول بذكاء"),
    goal: activeGoal ? activeGoal.text : "ابدأ بإنشاء هدفك الأول",
    est: firstIncomplete ? "30 دقيقة" : "0 دقيقة",
    doneOf: `${completedCount} من ${totalCount}`,
  };

  const headerStats = [
    { icon: "🔥", value: totalCount > 0 ? "1 يوم" : "0 يوم" },
    { icon: "✅", value: `${completedCount} من ${totalCount}` },
    { icon: "⏰", value: `${(totalCount - completedCount) * 15} دقيقة` },
  ];

  return (
    <div dir="rtl" className="no-scrollbar" style={{
      height: "100%", background: "#FAFAFB",
      display: "flex", flexDirection: "column",
      fontFamily: "'Cairo', sans-serif", overflow: "hidden",
    }}>

      {/* ── Header ── */}
      <div style={{ padding: "16px 20px 14px", flexShrink: 0, borderBottom: "1px solid #F1F5F9", background: "#FFFFFF" }}>

        {/* Row 1: Bell / Logout / Greeting / Avatar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onLogout}
              title="تسجيل الخروج"
              style={{
                width: 38, height: 38, borderRadius: 10,
                background: "#FFFFFF", border: "1px solid #F1F5F9",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <LogOut size={15} color="#D63031" />
            </button>
            <button style={{
              width: 38, height: 38, borderRadius: 10,
              background: "#FFFFFF", border: "1px solid #F1F5F9",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", position: "relative",
            }}>
              <Bell size={16} color="#475569" />
              <div style={{
                position: "absolute", top: 8, right: 8,
                width: 6, height: 6, borderRadius: "50%",
                background: "#4F46E5", border: "1.5px solid #FAFAFB",
              }} />
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: 10, color: "#94A3B8", lineHeight: 1.4 }}>{arabicDate}</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1E293B", lineHeight: 1.4 }}>
                {greeting.text} {greeting.emoji}
              </p>
            </div>
            <div style={{
              width: 38, height: 38, borderRadius: "50%",
              background: "#EEF2FF",
              border: "1px solid #E2E8F0",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 700, color: "#4F46E5",
            }}>م</div>
          </div>
        </div>

        {/* Row 2: Stats Pills */}
        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", marginBottom: 12 }}>
          {headerStats.map((s, i) => (
            <div
              key={i}
              className="fade-slide-up"
              style={{
                display: "flex", alignItems: "center", gap: 4,
                background: "#F8FAFC", padding: "4px 10px", borderRadius: 8,
                border: "1px solid #E2E8F0",
                animationDelay: `${i * 80}ms`,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, color: "#475569" }}>{s.value}</span>
              <span style={{ fontSize: 11 }}>{s.icon}</span>
            </div>
          ))}
        </div>

        {/* Row 3: Integrated Active Goal Progress */}
        {activeGoal && (
          <div style={{
            marginTop: 4,
            padding: "10px 12px",
            background: "#F8FAFC",
            borderRadius: 10,
            border: "1px solid #E2E8F0"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "#64748B" }}>الهدف الحالي</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#1E293B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "70%" }}>
                {activeGoal.text}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#4F46E5", flexShrink: 0 }}>{progressPercent}%</span>
              <div style={{ flex: 1, height: 4, background: "#E2E8F0", borderRadius: 2, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${displayProgress}%`,
                  background: "#4F46E5",
                  borderRadius: 2,
                  transition: "width 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
                }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Scrollable Body ── */}
      <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>

        {/* ━━ PRIORITY ━━ */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{
            fontSize: 10, color: "#D97706", fontWeight: 700,
            background: "#FEF3C7", padding: "2px 8px", borderRadius: 6,
          }}>🔥 مهمة الآن</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>أولوية اليوم</span>
        </div>

        <div style={{
          background: "#FFFFFF",
          borderRadius: 14,
          padding: "14px 16px",
          marginBottom: 20,
          border: "1px solid #E2E8F0",
        }}>
          {/* Goal Label */}
          <div style={{ marginBottom: 10 }}>
            <span style={{
              fontSize: 11, color: "#4F46E5",
              background: "#EEF2FF",
              padding: "2px 8px", borderRadius: 6, fontWeight: 600,
            }}>🎯 {todayTask.goal}</span>
          </div>

          {/* Task Info */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1E293B", lineHeight: 1.5 }}>
                {todayTask.text}
              </p>
            </div>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: "#F8FAFC",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
              border: "1px solid #E2E8F0",
            }}>{todayTask.emoji}</div>
          </div>

          {/* Footer Action Row */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderTop: "1px solid #F1F5F9", paddingTop: 10,
          }}>
            <span style={{ fontSize: 11, color: "#64748B" }}>
              ⏱ {todayTask.est} • {todayTask.doneOf} مهام
            </span>
            {activeGoal ? (
              <button
                onClick={() => onNavigate("vision")}
                style={{
                  background: "none", border: "none",
                  fontSize: 12, fontWeight: 700, color: "#4F46E5",
                  cursor: "pointer", fontFamily: "'Cairo', sans-serif",
                  display: "flex", alignItems: "center", gap: 4,
                  padding: 0,
                }}
              >
                <span>عرض المهام</span>
                <ArrowLeft size={12} color="#4F46E5" />
              </button>
            ) : (
              <button
                onClick={() => onNavigate("chat")}
                style={{
                  background: "none", border: "none",
                  fontSize: 12, fontWeight: 700, color: "#4F46E5",
                  cursor: "pointer", fontFamily: "'Cairo', sans-serif",
                  display: "flex", alignItems: "center", gap: 4,
                  padding: 0,
                }}
              >
                <span>أنشئ هدفًا</span>
                <Plus size={12} color="#4F46E5" />
              </button>
            )}
          </div>
        </div>

        {/* ━━ ACTIVE GOALS ━━ */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <button
            onClick={() => onNavigate(activeGoal ? "vision" : "chat")}
            style={{
              fontSize: 12, color: "#4F46E5", fontWeight: 700,
              background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 2,
              fontFamily: "'Cairo', sans-serif", padding: 0,
            }}
          >
            <span>{activeGoal ? "تفاصيل الهدف" : "أنشئ هدفًا جديدًا"}</span>
            <ChevronLeft size={14} color="#4F46E5" />
          </button>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>أهدافي النشطة</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {activeGoal ? (
            <div
              onClick={() => onNavigate("vision")}
              style={{
                background: "#FFFFFF",
                borderRadius: 12, padding: "12px 14px",
                cursor: "pointer",
                border: "1px solid #E2E8F0",
                display: "flex", alignItems: "center", gap: 12,
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: "#EEF2FF",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
              }}>🎯</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1E293B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "75%" }}>
                    {activeGoal.text}
                  </span>
                  <span style={{ fontSize: 10, color: "#4F46E5", fontWeight: 600, background: "#EEF2FF", padding: "1px 6px", borderRadius: 6 }}>
                    نشط
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#64748B" }}>{completedCount}/{totalCount} مهام</span>
                  <div style={{ flex: 1, height: 4, background: "#F1F5F9", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progressPercent}%`, background: "#4F46E5", borderRadius: 2 }} />
                  </div>
                </div>
              </div>

              <ChevronLeft size={14} color="#94A3B8" style={{ flexShrink: 0 }} />
            </div>
          ) : (
            <div style={{
              textAlign: "center", padding: "20px 14px", background: "#FFFFFF",
              borderRadius: 12, border: "1px dashed #CBD5E1",
              color: "#64748B", fontSize: 12,
            }}>
              لا توجد أهداف نشطة حاليًا. ابدأ بالحديث مع مساعدك الذكي لإنشاء هدفك الأول! ✨
            </div>
          )}
        </div>

        {/* ━━ QUICK START ━━ */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <button
            onClick={() => onNavigate("chat")}
            style={{
              width: 24, height: 24, borderRadius: 6,
              background: "#EEF2FF", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Plus size={12} color="#4F46E5" />
          </button>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#1E293B" }}>هدف جديد؟</span>
        </div>

        <div style={{
          display: "flex", gap: 8,
          flexDirection: "row-reverse",
          overflowX: "auto", paddingBottom: 2,
          scrollbarWidth: "none",
        }} className="no-scrollbar">
          {quickChips.map((chip, i) => (
            <button
              key={i}
              onClick={() => onNavigate("chat")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: 20, padding: "6px 12px",
                cursor: "pointer",
                fontFamily: "'Cairo', sans-serif",
                fontSize: 12, fontWeight: 600, color: "#475569",
                flexShrink: 0, whiteSpace: "nowrap",
              }}
            >
              <span>{chip.emoji}</span>
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
