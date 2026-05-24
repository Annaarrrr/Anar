import { useState } from "react";
import { motion } from "motion/react";
import { Mail, Lock, LogIn, UserPlus, AlertCircle } from "lucide-react";
import { api } from "../services/api";

interface Props {
  onAuthSuccess: (token: string) => void;
}

export function AuthScreen({ onAuthSuccess }: Props) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("الرجاء إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.login(email, password);
        onAuthSuccess(res.token);
      } else {
        const res = await api.signup(email, password);
        onAuthSuccess(res.token);
      }
    } catch (err: any) {
      setError(err.message || "فشلت العملية، الرجاء التحقق من البيانات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      style={{
        height: "100%",
        background: "linear-gradient(155deg, #F5F3FF 0%, #FAFAFB 50%, #EEF2F6 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 24px",
        fontFamily: "'Cairo', sans-serif",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.75)",
          backdropFilter: "blur(20px)",
          borderRadius: 30,
          padding: "32px 24px",
          border: "1px solid rgba(108, 92, 231, 0.12)",
          boxShadow: "0 20px 40px rgba(108, 92, 231, 0.06)",
          textAlign: "center",
        }}
      >
        {/* App Logo/Icon */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 22,
            background: "linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: 32,
            boxShadow: "0 8px 24px rgba(108, 92, 231, 0.3)",
          }}
        >
          ✨
        </div>

        <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 900, color: "#2D3436" }}>
          {isLogin ? "تسجيل الدخول إلى أنار" : "إنشاء حساب جديد"}
        </h2>
        <p style={{ margin: "0 0 24px", fontSize: 13, color: "#636E72" }}>
          {isLogin ? "أهلاً بك مجدداً! تابع رحلة تحقيق أهدافك" : "ابدأ الآن في التخطيط لأهدافك بذكاء"}
        </p>

        {error && (
          <div
            style={{
              background: "#FFF3F0",
              border: "1.5px solid rgba(225, 112, 85, 0.2)",
              borderRadius: 14,
              padding: "10px 14px",
              marginBottom: 18,
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#D63031",
              fontSize: 12,
              textAlign: "right",
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Email input */}
          <div style={{ position: "relative" }}>
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "13px 44px 13px 16px",
                borderRadius: 16,
                border: "1.5px solid rgba(108, 92, 231, 0.12)",
                background: "#FFFFFF",
                fontSize: 13,
                outline: "none",
                fontFamily: "'Cairo', sans-serif",
                transition: "border 0.2s ease",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#6C5CE7")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(108, 92, 231, 0.12)")}
            />
            <Mail
              size={18}
              color="#A29BFE"
              style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)" }}
            />
          </div>

          {/* Password input */}
          <div style={{ position: "relative" }}>
            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "13px 44px 13px 16px",
                borderRadius: 16,
                border: "1.5px solid rgba(108, 92, 231, 0.12)",
                background: "#FFFFFF",
                fontSize: 13,
                outline: "none",
                fontFamily: "'Cairo', sans-serif",
                transition: "border 0.2s ease",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#6C5CE7")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(108, 92, 231, 0.12)")}
            />
            <Lock
              size={18}
              color="#A29BFE"
              style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)" }}
            />
          </div>

          {/* Submit button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 16,
              padding: "14px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Cairo', sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 8px 20px rgba(108, 92, 231, 0.25)",
              marginTop: 6,
            }}
          >
            {loading ? (
              <span>جاري التحميل...</span>
            ) : isLogin ? (
              <>
                <LogIn size={16} />
                <span>تسجيل الدخول</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>إنشاء حساب</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Toggle option */}
        <div style={{ marginTop: 22 }}>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "#6C5CE7",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Cairo', sans-serif",
            }}
          >
            {isLogin ? "لا تملك حساباً؟ سجل الآن" : "لديك حساب بالفعل؟ سجل دخولك"}
          </button>
        </div>
      </div>
    </div>
  );
}
