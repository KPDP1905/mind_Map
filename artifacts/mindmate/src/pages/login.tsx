import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setError("");
    setLoading(true);
    try {
      await login(username.trim(), password);
      setLocation("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4"
      style={{
        background: "linear-gradient(135deg, #f8ece8 0%, #f5e6f0 35%, #ede6f8 65%, #e8eff8 100%)",
      }}
    >
      {/* Soft background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-28 -left-28 h-96 w-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(196,120,138,0.25) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 -right-24 h-80 w-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(160,120,200,0.2) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute -bottom-20 left-1/3 h-72 w-72 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(180,160,220,0.2) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        {/* Sparkles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              top: `${10 + Math.random() * 80}%`,
              left: `${5 + Math.random() * 90}%`,
              background: i % 2 === 0 ? "rgba(196,120,138,0.6)" : "rgba(160,120,200,0.5)",
            }}
            animate={{ y: [0, -15, 0], opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        <div
          className="rounded-3xl px-8 py-10"
          style={{
            background: "rgba(255,255,255,0.80)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(196,120,138,0.2)",
            boxShadow: "0 20px 60px rgba(180,100,120,0.14), 0 4px 16px rgba(0,0,0,0.06)",
          }}
        >
          {/* Logo / Brand */}
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 w-20 h-20 rounded-2xl overflow-hidden shadow-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #c4788a 0%, #a05870 100%)" }}
            >
              <img src="/logo.png" alt="Calmora" className="w-full h-full object-contain p-2.5" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#8b3a52" }}
            >
              Calmora
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="mt-1.5 text-sm"
              style={{ color: "#b07080" }}
            >
              Your Safe Space for Mental Wellness
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: "#7a3a4a" }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                autoComplete="username"
                autoFocus
                className="w-full rounded-xl px-4 py-3 text-sm placeholder-rose-300/70 outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  border: "1.5px solid rgba(196,120,138,0.3)",
                  color: "#5a2a3a",
                }}
                onFocus={(e) => { e.target.style.borderColor = "rgba(196,120,138,0.7)"; e.target.style.boxShadow = "0 0 0 3px rgba(196,120,138,0.12)"; }}
                onBlur={(e) => { e.target.style.borderColor = "rgba(196,120,138,0.3)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: "#7a3a4a" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm placeholder-rose-300/70 outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    border: "1.5px solid rgba(196,120,138,0.3)",
                    color: "#5a2a3a",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(196,120,138,0.7)"; e.target.style.boxShadow = "0 0 0 3px rgba(196,120,138,0.12)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(196,120,138,0.3)"; e.target.style.boxShadow = "none"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#c4788a" }}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="rounded-xl px-4 py-2.5 text-sm"
                  style={{ background: "rgba(240,80,80,0.08)", color: "#c0404a", border: "1px solid rgba(240,80,80,0.2)" }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #c4788a 0%, #a05870 60%, #9060a0 100%)",
                boxShadow: "0 4px 16px rgba(180,100,120,0.35)",
              }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
              {loading ? "Signing in…" : "Sign In"}
            </motion.button>
          </form>

          <div
            className="mt-6 rounded-2xl px-4 py-3"
            style={{
              background: "rgba(196,120,138,0.06)",
              border: "1px dashed rgba(196,120,138,0.3)",
            }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: "#b07080" }}>Default test account:</p>
            <p className="text-xs" style={{ color: "#8b5060" }}>Username: <span className="font-mono font-semibold">admin</span></p>
            <p className="text-xs" style={{ color: "#8b5060" }}>Password: <span className="font-mono font-semibold">MindMitra@123</span></p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: "rgba(176,112,128,0.6)" }}>
          Calmora — AI Wellness Companion
        </p>
      </motion.div>
    </div>
  );
}
