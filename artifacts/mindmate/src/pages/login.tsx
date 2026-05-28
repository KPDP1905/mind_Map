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
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-gradient-to-br from-[#e8f0fe] via-[#f0ebff] to-[#fce4f0] dark:from-[#0d1117] dark:via-[#131b2e] dark:to-[#1a1025] px-4">
      {/* Soft background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl dark:bg-blue-900/20" />
        <div className="absolute top-1/2 -right-24 h-72 w-72 rounded-full bg-purple-300/30 blur-3xl dark:bg-purple-900/20" />
        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-pink-300/25 blur-3xl dark:bg-pink-900/20" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="rounded-3xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-2xl shadow-blue-100/40 dark:border-white/10 dark:bg-gray-900/80 dark:shadow-black/40 px-8 py-10">
          {/* Logo / Brand */}
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"
            >
              <span className="text-3xl">🧠</span>
            </motion.div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Mind Mitra
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Your personal wellness companion
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800/70 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                  className="w-full rounded-xl border border-gray-200 bg-white/70 px-4 py-3 pr-11 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800/70 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200/50 transition-all hover:from-blue-600 hover:to-purple-700 hover:shadow-lg disabled:opacity-60 dark:shadow-blue-900/30"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <LogIn size={18} />
              )}
              {loading ? "Signing in…" : "Sign In"}
            </motion.button>
          </form>

          {/* Default creds hint */}
          <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/40">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Default test account:</p>
            <p className="text-xs text-gray-600 dark:text-gray-300">Username: <span className="font-mono font-semibold">admin</span></p>
            <p className="text-xs text-gray-600 dark:text-gray-300">Password: <span className="font-mono font-semibold">MindMitra@123</span></p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-600">
          Mind Mitra — AI Wellness Companion
        </p>
      </motion.div>
    </div>
  );
}
