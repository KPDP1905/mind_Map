import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Heart, Brain, Sparkles, MessageCircle, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#06001a] selection:bg-white/20 selection:text-white">
      {/* Logo-colored aurora glows — teal & purple to match the brand */}
      <div className="aurora-blob" style={{ width: 650, height: 650, background: "radial-gradient(circle, rgba(78,191,191,0.22) 0%, transparent 70%)", top: -180, left: -180 }} />
      <div className="aurora-blob aurora-2" style={{ width: 580, height: 580, background: "radial-gradient(circle, rgba(123,104,200,0.28) 0%, transparent 70%)", top: -80, right: -140 }} />
      <div className="aurora-blob aurora-3" style={{ width: 480, height: 480, background: "radial-gradient(circle, rgba(78,191,191,0.18) 0%, transparent 70%)", bottom: 80, left: 60 }} />
      <div className="aurora-blob aurora-4" style={{ width: 520, height: 520, background: "radial-gradient(circle, rgba(123,104,200,0.18) 0%, transparent 70%)", bottom: -100, right: -80 }} />

      {/* Large logo watermark — the hero backdrop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        {/* Glow ring behind the logo */}
        <div style={{
          width: 560, height: 560,
          background: "radial-gradient(circle, rgba(123,104,200,0.18) 0%, rgba(78,191,191,0.10) 40%, transparent 70%)",
          borderRadius: "50%",
          position: "absolute",
          filter: "blur(30px)",
        }} />
        <img
          src="/logo-transparent.png"
          alt=""
          aria-hidden="true"
          style={{
            width: 520, height: 520, objectFit: "contain",
            opacity: 0.22,
            filter: "brightness(1.4) saturate(1.3)",
          }}
        />
      </div>

      {/* Noise overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }} />

      {/* Nav */}
      <header className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <img src="/logo-transparent.png" alt="Mind Mitra" className="w-7 h-7 object-contain" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Mind Mitra</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full">Log in</Button>
          </Link>
          <Link href="/login">
            <Button className="bg-white text-[#06001a] hover:bg-white/90 rounded-full px-6 font-semibold shadow-lg shadow-white/10">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 pt-36 pb-20 px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/80 text-sm font-medium mb-10"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Your personal emotional sanctuary</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.05] mb-6">
            A quiet space<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7dd3fc] via-[#c084fc] to-[#67e8f9]">
              for your mind.
            </span>
          </h1>

          <p className="text-xl text-white/60 mb-12 leading-relaxed max-w-2xl mx-auto">
            Log your mood, talk things through with your personal AI doctor, and access tools designed to bring you back to center.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto h-14 px-10 bg-white text-[#06001a] hover:bg-white/90 rounded-full text-lg font-semibold shadow-2xl shadow-white/10 hover:-translate-y-0.5 transition-all group">
                Start your journey
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-full text-lg border-white/20 text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm">
                Welcome back
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-28 grid grid-cols-1 md:grid-cols-3 gap-5"
        >
          <GlassCard
            icon={<Heart className="w-6 h-6 text-rose-300" />}
            iconBg="bg-rose-500/15"
            title="Track gently"
            description="Log your daily feelings without judgment. Watch your emotional patterns emerge over time with beautiful charts."
            delay={0}
          />
          <GlassCard
            icon={<MessageCircle className="w-6 h-6 text-sky-300" />}
            iconBg="bg-sky-500/15"
            title="Your Mind's Doctor"
            description="Chat with an AI that listens, understands, and offers evidence-based therapeutic guidance whenever you need it."
            delay={0.1}
          />
          <GlassCard
            icon={<Brain className="w-6 h-6 text-violet-300" />}
            iconBg="bg-violet-500/15"
            title="Breathe & reflect"
            description="Access guided breathing, CBT exercises, affirmations, and gratitude journaling to restore your calm."
            delay={0.2}
          />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-20 flex flex-col sm:flex-row items-center justify-center gap-12 text-center"
        >
          {[
            { value: "100%", label: "Private & secure" },
            { value: "24/7", label: "Always available" },
            { value: "Free", label: "To get started" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-white">{s.value}</p>
              <p className="text-white/50 mt-1 text-sm">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}

function GlassCard({ icon, iconBg, title, description, delay }: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.4 + delay }}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:bg-white/8 transition-colors"
    >
      <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-white/55 leading-relaxed">{description}</p>
    </motion.div>
  );
}
