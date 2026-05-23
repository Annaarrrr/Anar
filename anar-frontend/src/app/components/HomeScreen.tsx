import { motion } from "motion/react";
import { Bell, ChevronLeft, Plus, ArrowLeft, LogOut } from "lucide-react";

type Screen = "home" | "chat" | "vision";
interface Props {
  onNavigate: (s: Screen) => void;
  activeGoal: { id: string; text: string } | null;
  tasks: any[];
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

export function HomeScreen({ onNavigate, activeGoal, tasks, onLogout }: Props) {
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
    { icon: "🔥", value: totalCount > 0 ? "1 يوم" : "0 يوم", color: "#E17055", bg: "#FFF3F0" },
    { icon: "✅", value: `${completedCount} من ${totalCount}`, color: "#00B894", bg: "#EDFFF8" },
    { icon: "⏰", value: `${(totalCount - completedCount) * 15} دق`, color: "#6C5CE7", bg: "#F0EEFF" },
  ];

  return (
    <div dir="rtl" className="no-scrollbar" style={{
      height: "100%", background: "#FAFAFB",
      display: "flex", flexDirection: "column",
      fontFamily: "'Cairo', sans-serif", overflow: "hidden",
    }}>

      {/* ── Header ── */}
      <div style={{ padding: "16px 24px 14px", flexShrink: 0 }}>

        {/* Row 1: bell / greeting / avatar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onLogout}
              title="تسجيل الخروج"
              style={{
                width: 40, height: 40, borderRadius: 13,
                background: "#FFFFFF", border: "1px solid rgba(214, 48, 49, 0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(214, 48, 49, 0.05)",
              }}
            >
              <LogOut size={16} color="#D63031" />
            </button>
            <button style={{
              width: 40, height: 40, borderRadius: 13,
              background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", position: "relative",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}>
              <Bell size={17} color="#2D3436" />
              <div style={{
                position: "absolute", top: 8, right: 8,
                width: 8, height: 8, borderRadius: "50%",
                background: "#6C5CE7", border: "2px solid #FAFAFB",
              }} />
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: 11, color: "#636E72", lineHeight: 1.4 }}>اليوم</p>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#2D3436", lineHeight: 1.4 }}>أهلاً بك 👋</p>
            </div>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 19, fontWeight: 800, color: "white",
              boxShadow: "0 4px 14px rgba(108,92,231,0.32)",
            }}>م</div>
          </div>
        </div>

        {/* Row 2: inline stat pills */}
        <div style={{ display: "flex", gap: 7, justifyContent: "flex-end" }}>
          {headerStats.map((s, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 4,
              background: s.bg, padding: "5px 11px", borderRadius: 20,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: 12 }}>{s.icon}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "0 24px 20px" }}>

        {/* ━━ PRIORITY ━━ */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{
            fontSize: 11, color: "#E17055", fontWeight: 700,
            background: "#FFF3F0", padding: "3px 10px", borderRadius: 20,
          }}>🔥 مهمة الآن</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#2D3436" }}>أولوية اليوم</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.38 }}
          style={{
            background: "linear-gradient(138deg, #6C5CE7 0%, #7D6FF0 55%, #A29BFE 100%)",
            borderRadius: 22, padding: "20px 20px 16px",
            marginBottom: 22, position: "relative", overflow: "hidden",
          }}
        >
          {/* bg bubbles */}
          <div style={{ position: "absolute", top: -34, left: -24, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
          <div style={{ position: "absolute", bottom: -28, right: -12, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

          {/* goal tag */}
          <div style={{ marginBottom: 14, position: "relative" }}>
            <span style={{
              fontSize: 12, color: "rgba(255,255,255,0.85)",
              background: "rgba(255,255,255,0.15)",
              padding: "4px 12px", borderRadius: 20, fontWeight: 600,
            }}>🎯 {todayTask.goal}</span>
          </div>

          {/* task + emoji */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16, position: "relative" }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.55 }}>
                {todayTask.text}
              </p>
            </div>
            <div style={{
              width: 54, height: 54, borderRadius: 18, flexShrink: 0,
              background: "rgba(255,255,255,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28,
            }}>{todayTask.emoji}</div>
          </div>

          {/* time tag */}
          <div style={{ marginBottom: 16, position: "relative" }}>
            <span style={{
              fontSize: 12, color: "rgba(255,255,255,0.85)",
              background: "rgba(255,255,255,0.13)",
              padding: "4px 12px", borderRadius: 20, fontWeight: 600,
            }}>⏱ {todayTask.est}</span>
          </div>

          {/* CTA row */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.18)",
            paddingTop: 14, position: "relative",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            {activeGoal ? (
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => onNavigate("vision")}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "#FFFFFF",
                  border: "none", borderRadius: 30,
                  padding: "9px 18px",
                  fontSize: 13, fontWeight: 800, color: "#6C5CE7",
                  cursor: "pointer", fontFamily: "'Cairo', sans-serif",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                }}
              >
                <ArrowLeft size={14} color="#6C5CE7" />
                <span>عرض المهام</span>
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => onNavigate("chat")}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "#FFFFFF",
                  border: "none", borderRadius: 30,
                  padding: "9px 18px",
                  fontSize: 13, fontWeight: 800, color: "#6C5CE7",
                  cursor: "pointer", fontFamily: "'Cairo', sans-serif",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                }}
              >
                <Plus size={14} color="#6C5CE7" />
                <span>أنشئ هدفًا</span>
              </motion.button>
            )}
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
              {todayTask.doneOf} مهام اليوم
            </span>
          </div>
        </motion.div>

        {/* ━━ ACTIVE GOALS ━━ */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <button
            onClick={() => onNavigate(activeGoal ? "vision" : "chat")}
            style={{
              fontSize: 12, color: "#6C5CE7", fontWeight: 700,
              background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 2,
              fontFamily: "'Cairo', sans-serif", padding: 0,
            }}
          >
            <span>{activeGoal ? "تفاصيل الهدف" : "أنشئ هدفًا جديدًا"}</span>
            <ChevronLeft size={14} color="#6C5CE7" />
          </button>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#2D3436" }}>أهدافي النشطة</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
          {activeGoal ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.34 }}
              whileTap={{ scale: 0.982 }}
              onClick={() => onNavigate("vision")}
              style={{
                background: "#FFFFFF",
                borderRadius: 16, padding: "13px 16px",
                cursor: "pointer",
                boxShadow: "0 3px 12px rgba(0,0,0,0.05)",
                border: "1.5px solid rgba(108,92,231,0.13)",
                display: "flex", alignItems: "center", gap: 14,
              }}
            >
              {/* Emoji icon */}
              <div style={{
                width: 42, height: 42, borderRadius: 14, flexShrink: 0,
                background: "#EDE9FF",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 21,
              }}>🎯</div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, color: "#636E72" }}>{completedCount}/{totalCount} مهام</span>
                    <span style={{ fontSize: 11, color: "#6C5CE7", fontWeight: 700, background: "#EDE9FF", padding: "2px 7px", borderRadius: 20 }}>
                      نشط
                    </span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#2D3436", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {activeGoal.text}
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#6C5CE7", flexShrink: 0 }}>{progressPercent}%</span>
                  <div style={{ flex: 1, height: 5, background: "#F0EFF4", borderRadius: 3, overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.85, ease: "easeOut" }}
                      style={{ height: "100%", background: "#6C5CE7", borderRadius: 3 }}
                    />
                  </div>
                </div>
              </div>

              <ChevronLeft size={16} color="#C0BAD4" style={{ flexShrink: 0 }} />
            </motion.div>
          ) : (
            <div style={{
              textAlign: "center", padding: "24px 16px", background: "#FFFFFF",
              borderRadius: 16, border: "1.5px dashed rgba(108,92,231,0.2)",
              color: "#636E72", fontSize: 13,
            }}>
              لا توجد أهداف نشطة حاليًا. ابدأ بالحديث مع مساعدك الذكي لإنشاء هدفك الأول! ✨
            </div>
          )}
        </div>

        {/* ━━ QUICK START ━━ */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 11 }}>
          <button
            onClick={() => onNavigate("chat")}
            style={{
              width: 26, height: 26, borderRadius: 8,
              background: "#EDE9FF", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Plus size={13} color="#6C5CE7" />
          </button>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#2D3436" }}>هدف جديد؟</span>
        </div>

        <div style={{
          display: "flex", gap: 8,
          flexDirection: "row-reverse",
          overflowX: "auto", paddingBottom: 2,
          scrollbarWidth: "none",
        }}>
          {quickChips.map((chip, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.26 }}
              whileTap={{ scale: 0.91 }}
              onClick={() => onNavigate("chat")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "#FFFFFF",
                border: "1.5px solid rgba(108,92,231,0.11)",
                borderRadius: 30, padding: "8px 14px",
                cursor: "pointer",
                fontFamily: "'Cairo', sans-serif",
                fontSize: 13, fontWeight: 600, color: "#2D3436",
                flexShrink: 0, whiteSpace: "nowrap",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <span>{chip.emoji}</span>
              <span>{chip.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
