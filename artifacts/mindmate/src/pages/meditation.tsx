import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageTheme } from "@/hooks/use-page-theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, Wind, Brain, Moon, Zap, Heart, Flame, Volume2, VolumeX } from "lucide-react";

function useLS<T>(key: string, def: T) {
  const [v, setV] = useState<T>(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def; } catch { return def; }
  });
  const set = (x: T) => { setV(x); localStorage.setItem(key, JSON.stringify(x)); };
  return [v, set] as const;
}

const CATEGORIES = [
  { id: "sleep",    label: "Sleep",         emoji: "😴", icon: Moon,   color: "from-indigo-500 to-purple-600",  bg: "bg-indigo-50 dark:bg-indigo-950/30",  text: "text-indigo-600 dark:text-indigo-400",  desc: "Wind down and fall asleep faster",   ytId: "q76bMs-NwRk" },
  { id: "stress",   label: "Stress Relief", emoji: "🌊", icon: Heart,  color: "from-blue-500 to-cyan-500",      bg: "bg-blue-50 dark:bg-blue-950/30",      text: "text-blue-600 dark:text-blue-400",      desc: "Release tension and find calm",       ytId: "mPZkdNFkNps" },
  { id: "anxiety",  label: "Anxiety",       emoji: "🌿", icon: Wind,   color: "from-green-500 to-teal-500",     bg: "bg-green-50 dark:bg-green-950/30",    text: "text-green-600 dark:text-green-400",    desc: "Ground yourself in the present",      ytId: "wzjWIxXBs_s" },
  { id: "focus",    label: "Focus",         emoji: "🎯", icon: Brain,  color: "from-amber-500 to-orange-500",   bg: "bg-amber-50 dark:bg-amber-950/30",    text: "text-amber-600 dark:text-amber-400",    desc: "Sharpen attention and clarity",       ytId: "WPni755-Krg" },
  { id: "breathing",label: "Breathing",     emoji: "💨", icon: Zap,    color: "from-rose-500 to-pink-500",      bg: "bg-rose-50 dark:bg-rose-950/30",      text: "text-rose-600 dark:text-rose-400",      desc: "Control breath to calm the mind",     ytId: "1ZYbU82GVz4" },
  { id: "energy",   label: "Energy Boost",  emoji: "⚡", icon: Flame,  color: "from-yellow-500 to-amber-500",   bg: "bg-yellow-50 dark:bg-yellow-950/30",  text: "text-yellow-600 dark:text-yellow-400",  desc: "Revitalize and re-energize",          ytId: "5qap5aO4i9A" },
];

const SESSIONS: Record<string, Array<{ title: string; duration: number; guide: string[] }>> = {
  sleep: [
    { title: "4-7-8 Sleep Breathing", duration: 5,
      guide: ["Find a comfortable position lying down.", "Breathe in through your nose for 4 counts.", "Hold your breath for 7 counts.", "Exhale completely through your mouth for 8 counts.", "Repeat this cycle. Feel your body sink deeper with each exhale.", "Let every breath carry you closer to restful sleep."] },
    { title: "Body Scan for Sleep", duration: 10,
      guide: ["Close your eyes and take three deep breaths.", "Start at your feet — let them go completely heavy.", "Move up to your calves, thighs... let them melt.", "Release your hips, lower back, and belly.", "Let your chest, shoulders, and arms become weightless.", "Soften your face, jaw, and forehead. Sleep comes now."] },
  ],
  stress: [
    { title: "5-Minute Calm Reset", duration: 5,
      guide: ["Sit comfortably and close your eyes.", "Take a slow breath in for 4 counts.", "Hold gently for 2 counts.", "Release slowly for 6 counts.", "With each exhale, imagine stress leaving your body as grey smoke.", "You are safe. You are present. You are calm."] },
    { title: "Progressive Relaxation", duration: 8,
      guide: ["Tense your fists tightly for 5 seconds, then release.", "Tense your shoulders up to your ears — hold — release.", "Scrunch your face tightly — hold — release.", "Take a deep breath in, tense your whole body — hold — release.", "Let the wave of relaxation wash over you completely.", "Rest in this stillness. You are deeply relaxed."] },
  ],
  anxiety: [
    { title: "Grounding Breath", duration: 5,
      guide: ["Look around and name 5 things you can see.", "Notice 4 things you can physically feel.", "Listen for 3 things you can hear.", "Acknowledge 2 things you can smell.", "Take a long, slow breath in — hold — exhale fully.", "You are here. You are safe. This moment is all that exists."] },
    { title: "Box Breathing Calm", duration: 6,
      guide: ["Breathe in slowly for 4 counts.", "Hold gently for 4 counts.", "Exhale fully for 4 counts.", "Hold empty for 4 counts.", "This square of breath anchors you to the present.", "Continue this pattern. Anxiety softens with each cycle."] },
  ],
  focus: [
    { title: "Clarity Meditation", duration: 7,
      guide: ["Sit upright and let your eyes softly close.", "Breathe naturally and observe your thoughts like clouds passing.", "When a distraction arises, gently return to your breath.", "Imagine your mind as a still, clear lake.", "Each breath ripples outward, then settles.", "Open your eyes. Your focus is sharp and ready."] },
    { title: "Candle Focus", duration: 5,
      guide: ["Imagine a small, steady flame at the center of your mind.", "Keep your attention on the flame — notice its warmth and glow.", "When thoughts arise, they are just wind — the flame stays still.", "Breathe slowly. The flame represents your focused attention.", "Feel it grow brighter with each breath.", "Carry this focused clarity into your work."] },
  ],
  breathing: [
    { title: "4-4-4 Box Breathing", duration: 4,
      guide: ["Breathe in through your nose for 4 counts.", "Hold your breath for 4 counts.", "Exhale through your mouth for 4 counts.", "Hold empty for 4 counts.", "This completes one cycle. Repeat continuously.", "Your nervous system is resetting with every cycle."] },
    { title: "Diaphragm Breathing", duration: 6,
      guide: ["Place one hand on your chest, one on your belly.", "Breathe in deeply — your belly should rise, not your chest.", "Hold for 2 counts.", "Exhale slowly — feel your belly fall.", "This activates your parasympathetic nervous system.", "Continue this deep, calming breath pattern."] },
  ],
  energy: [
    { title: "Energizing Morning Breath", duration: 3,
      guide: ["Sit up straight and take 3 deep, rapid breaths through the nose.", "Exhale sharply through the mouth each time.", "Now take one deep, long inhale and hold for 5 counts.", "Release slowly and feel the buzz of oxygen in your body.", "Roll your shoulders back and open your chest wide.", "You are energized, awake, and ready for the day."] },
    { title: "Bellows Breath (Bhastrika)", duration: 4,
      guide: ["Inhale deeply through your nose, filling your lungs completely.", "Exhale forcefully through the nose.", "Repeat this at a steady, pumping rhythm for 20 rounds.", "After 20 rounds, take a deep breath and hold.", "Release and rest in the energized stillness.", "Feel the warmth and clarity spreading through your body."] },
  ],
};

function BreathingAnimation({ phase }: { phase: string }) {
  const isInhale = phase === "Inhale";
  const isHold = phase === "Hold";

  return (
    <div className="relative w-48 h-48 flex items-center justify-center mx-auto">
      <motion.div
        className="absolute rounded-full bg-gradient-to-tr from-primary/30 to-secondary/30 blur-2xl"
        animate={{ scale: isInhale ? 2.2 : isHold ? 2.2 : 1, opacity: isHold ? 0.8 : 0.4 }}
        transition={{ duration: isInhale ? 4 : isHold ? 0.1 : 4, ease: "easeInOut" }}
        style={{ width: 80, height: 80 }}
      />
      <motion.div
        className="absolute rounded-full bg-gradient-to-tr from-primary to-secondary shadow-2xl flex items-center justify-center text-white font-semibold text-sm tracking-wide"
        animate={{ scale: isInhale ? 1.7 : isHold ? 1.7 : 1 }}
        transition={{ duration: isInhale ? 4 : isHold ? 0.1 : 4, ease: "easeInOut" }}
        style={{ width: 100, height: 100 }}
      >
        {phase}
      </motion.div>
    </div>
  );
}

function SessionTimer({ session, onComplete }: { session: { title: string; duration: number; guide: string[] }; onComplete: () => void }) {
  const totalSeconds = session.duration * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [breathPhase, setBreathPhase] = useState("Inhale");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breathRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setRunning(false);
            onComplete();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      breathRef.current = setInterval(() => {
        setBreathPhase(p => {
          if (p === "Inhale") return "Hold";
          if (p === "Hold") return "Exhale";
          if (p === "Exhale") return "Rest";
          return "Inhale";
        });
      }, 4000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (breathRef.current) clearInterval(breathRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (breathRef.current) clearInterval(breathRef.current);
    };
  }, [running]);

  const pct = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="space-y-8">
      <BreathingAnimation phase={breathPhase} />

      <div className="text-center space-y-2">
        <div className="text-4xl font-mono font-bold text-foreground">{mins}:{secs}</div>
        <Progress value={pct} className="h-2 w-64 mx-auto" />
      </div>

      <div className="flex justify-center gap-4">
        <Button variant="outline" size="icon" className="rounded-full w-12 h-12" onClick={() => { setRunning(false); setTimeLeft(totalSeconds); setStep(0); }}>
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button size="lg" className="rounded-full px-8" onClick={() => setRunning(r => !r)}>
          {running ? <><Pause className="w-4 h-4 mr-2" /> Pause</> : <><Play className="w-4 h-4 mr-2" /> {timeLeft === totalSeconds ? "Begin" : "Resume"}</>}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="p-5 bg-primary/5 rounded-2xl border border-primary/10 text-center"
        >
          <p className="text-sm text-muted-foreground leading-relaxed">{session.guide[step]}</p>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-2 justify-center">
        {session.guide.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${step === i ? "bg-primary scale-125" : "bg-muted-foreground/30 hover:bg-primary/50"}`}
          />
        ))}
      </div>

      <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setStep(s => (s + 1) % session.guide.length)}>
        Next guidance step →
      </Button>
    </div>
  );
}

export default function MeditationPage() {
  usePageTheme("linear-gradient(135deg, #e8e0f5 0%, #d8d0ee 30%, #e8e4f8 60%, #f0eafa 100%)");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<number | null>(null);
  const [completedSessions, setCompletedSessions] = useLS<number>("mm_meditation_completed", 0);
  const [streak, setStreak] = useLS<number>("mm_meditation_streak", 0);
  const [lastDate, setLastDate] = useLS<string>("mm_meditation_lastdate", "");
  const [showComplete, setShowComplete] = useState(false);
  const [soundOn, setSoundOn] = useState(false);

  const handleComplete = () => {
    const today = new Date().toDateString();
    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const newStreak = lastDate === yesterday.toDateString() ? streak + 1 : 1;
      setStreak(newStreak);
      setLastDate(today);
    }
    setCompletedSessions(completedSessions + 1);
    setShowComplete(true);
    setActiveSession(null);
    setTimeout(() => setShowComplete(false), 3000);
  };

  const cat = CATEGORIES.find(c => c.id === selectedCategory);
  const sessions = selectedCategory ? SESSIONS[selectedCategory] : [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Meditation</h1>
          <p className="text-muted-foreground mt-1 text-lg">Find stillness. Breathe deeply. Be present.</p>
        </div>
        <div className="flex gap-4 text-center">
          <div className="p-3 rounded-2xl bg-primary/10">
            <p className="text-2xl font-bold text-primary">{streak}</p>
            <p className="text-xs text-muted-foreground">day streak</p>
          </div>
          <div className="p-3 rounded-2xl bg-secondary/20">
            <p className="text-2xl font-bold text-foreground">{completedSessions}</p>
            <p className="text-xs text-muted-foreground">sessions</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-6 rounded-3xl bg-gradient-to-r from-green-500 to-teal-500 text-white text-center shadow-lg"
          >
            <p className="text-3xl mb-2">🎉</p>
            <p className="text-xl font-bold">Session Complete!</p>
            <p className="text-white/80 mt-1">Amazing work. You've taken a moment for your mind.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {activeSession !== null && cat ? (
        <Card className="rounded-3xl border-border/50 shadow-md overflow-hidden">
          <CardHeader className={`bg-gradient-to-r ${cat.color} text-white`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">{cat.label}</p>
                <CardTitle className="text-white text-xl">{sessions[activeSession].title}</CardTitle>
                <p className="text-white/70 text-sm mt-1">{sessions[activeSession].duration} minute session</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm"
                  className={`text-white hover:bg-white/20 rounded-full gap-2 ${soundOn ? "bg-white/20" : ""}`}
                  onClick={() => setSoundOn(s => !s)}
                  title={soundOn ? "Stop ambient sound" : "Play ambient sound"}>
                  {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span className="text-xs hidden sm:inline">{soundOn ? "Sound On" : "Sound Off"}</span>
                </Button>
                <Button variant="ghost" className="text-white hover:bg-white/20 rounded-full" onClick={() => { setActiveSession(null); setSoundOn(false); }}>
                  ✕ Close
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <SessionTimer session={sessions[activeSession]} onComplete={handleComplete} />
            {soundOn && (
              <div className="rounded-2xl overflow-hidden border border-border/30 shadow-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 text-xs text-muted-foreground">
                  <Volume2 className="w-3.5 h-3.5" /> Ambient Sound — {cat.label}
                  <span className="ml-auto">via YouTube</span>
                </div>
                <iframe
                  src={`https://www.youtube.com/embed/${cat.ytId}?autoplay=1&mute=0&controls=1&loop=1&playlist=${cat.ytId}`}
                  className="w-full h-24"
                  allow="autoplay; encrypted-media"
                  title={`${cat.label} ambient sound`}
                />
              </div>
            )}
          </CardContent>
        </Card>
      ) : selectedCategory && cat ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="rounded-full" onClick={() => setSelectedCategory(null)}>
              ← Back
            </Button>
            <div>
              <h2 className="text-xl font-bold text-foreground">{cat.emoji} {cat.label}</h2>
              <p className="text-sm text-muted-foreground">{cat.desc}</p>
            </div>
          </div>
          <div className="grid gap-4">
            {sessions.map((session, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card
                  className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
                  onClick={() => setActiveSession(i)}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${cat.bg} flex items-center justify-center text-2xl flex-shrink-0`}>
                      {cat.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground">{session.title}</h3>
                      <p className={`text-sm font-medium ${cat.text}`}>{session.duration} minutes</p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{session.guide[0]}</p>
                    </div>
                    <Button size="icon" className={`rounded-full w-11 h-11 bg-gradient-to-br ${cat.color} text-white border-0 flex-shrink-0`}>
                      <Play className="w-4 h-4 ml-0.5" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Choose a category</h2>
            <p className="text-sm text-muted-foreground">Select what you need right now</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <button
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full p-5 rounded-3xl ${cat.bg} border border-transparent hover:border-current/20 transition-all hover:shadow-md hover:-translate-y-1 text-left group`}
                >
                  <span className="text-4xl block mb-3">{cat.emoji}</span>
                  <p className={`font-bold text-base ${cat.text}`}>{cat.label}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{cat.desc}</p>
                  <p className="text-xs text-muted-foreground/60 mt-2">{SESSIONS[cat.id].length} sessions</p>
                </button>
              </motion.div>
            ))}
          </div>

          <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wind className="w-5 h-5 text-blue-500" />
                Quick Breathing Exercise
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-6">
              <QuickBreather />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function QuickBreather() {
  const phases = ["Inhale", "Hold", "Exhale", "Rest"];
  const durations = [4000, 4000, 4000, 4000];
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const phaseRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    let count = 4;
    setCountdown(4);
    const cdInterval = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(cdInterval);
        phaseRef.current = (phaseRef.current + 1) % 4;
        setPhaseIdx(phaseRef.current);
        count = 4;
        setCountdown(4);
      } else {
        setCountdown(count);
      }
    }, 1000);
    return () => clearInterval(cdInterval);
  }, [running, phaseIdx]);

  return (
    <div className="flex flex-col items-center gap-6">
      <BreathingAnimation phase={running ? phases[phaseIdx] : "Ready"} />
      <div className="text-center">
        <p className="text-lg font-semibold text-foreground">{running ? phases[phaseIdx] : "Box Breathing"}</p>
        {running && <p className="text-muted-foreground text-sm">{countdown}s</p>}
      </div>
      <Button className="rounded-full px-8" onClick={() => { setRunning(r => !r); phaseRef.current = 0; setPhaseIdx(0); }}>
        {running ? <><Pause className="w-4 h-4 mr-2" /> Stop</> : <><Play className="w-4 h-4 mr-2" /> Start</>}
      </Button>
    </div>
  );
}
