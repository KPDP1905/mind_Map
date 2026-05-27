import { useEffect, useRef, useState } from "react";
import { 
  useGetDailyAffirmation, 
  useListGratitudeEntries, 
  useCreateGratitudeEntry,
  getListGratitudeEntriesQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Wind, Heart, Star, Timer, Droplets, CheckCircle2, Circle, Play, Pause, RotateCcw, ChevronRight, ChevronLeft } from "lucide-react";

/* ─── tiny localStorage hook ──────────────────────────────────────────────── */
function useLS<T>(key: string, def: T) {
  const [v, setV] = useState<T>(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def; } catch { return def; }
  });
  const set = (x: T) => { setV(x); localStorage.setItem(key, JSON.stringify(x)); };
  return [v, set] as const;
}

/* ─── daily reset helper ───────────────────────────────────────────────────── */
function useDailyReset<T>(key: string, def: T) {
  const todayKey = `${key}_date`;
  const [v, setV] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      const storedDate = localStorage.getItem(todayKey);
      const today = new Date().toDateString();
      if (storedDate === today && stored) return JSON.parse(stored);
      return def;
    } catch { return def; }
  });
  const set = (x: T) => {
    setV(x);
    localStorage.setItem(key, JSON.stringify(x));
    localStorage.setItem(todayKey, new Date().toDateString());
  };
  return [v, set] as const;
}

/* ─── Body scan steps ──────────────────────────────────────────────────────── */
const BODY_SCAN = [
  { area: "Feet & toes", instruction: "Bring your attention to your feet. Notice any sensations — warmth, tingling, or pressure. Breathe in, and as you breathe out, let them relax completely." },
  { area: "Calves & shins", instruction: "Move your awareness up to your lower legs. Notice any tightness. Gently inhale and, on the exhale, let every muscle soften." },
  { area: "Knees & thighs", instruction: "Feel your knees and thighs. Notice where they contact the surface beneath you. Breathe out any tension held here." },
  { area: "Hips & lower back", instruction: "Bring awareness to your hips. This is a common place to hold stress. Let your lower back drop with each exhale." },
  { area: "Belly & chest", instruction: "Notice your belly rising and falling with each breath. Let your chest expand fully on the inhale and fully release on the exhale." },
  { area: "Hands & arms", instruction: "Feel your hands — fingers, palms, wrists. Let a wave of relaxation travel from your fingertips all the way up your arms." },
  { area: "Shoulders & neck", instruction: "Many of us carry tension here. Roll your shoulders back slightly, breathe in, and let everything drop as you breathe out." },
  { area: "Face & jaw", instruction: "Soften your jaw. Let your tongue rest gently. Feel the tiny muscles around your eyes and forehead release. You are safe and relaxed." },
];

const WELLNESS_HABITS = [
  { id: "move", emoji: "🏃", label: "Move your body (15 min)" },
  { id: "water", emoji: "💧", label: "Drink enough water" },
  { id: "sleep", emoji: "😴", label: "Sleep 7-8 hours" },
  { id: "meditate", emoji: "🧘", label: "Meditate or breathe mindfully" },
  { id: "meal", emoji: "🥗", label: "Eat a nutritious meal" },
  { id: "nature", emoji: "🌳", label: "Spend time outdoors" },
  { id: "social", emoji: "🤝", label: "Connect with someone you love" },
  { id: "screens", emoji: "📵", label: "1 hour screen-free" },
];

/* ═══════════════════════════════════════════════════════════════════════════ */

export default function WellnessPage() {
  const { data: affirmation, isLoading: loadingAff } = useGetDailyAffirmation();
  const { data: gratitudeEntries, isLoading: loadingGratitude } = useListGratitudeEntries();
  const createGratitude = useCreateGratitudeEntry();
  const [gratitudeText, setGratitudeText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleGratitudeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gratitudeText.trim()) return;
    createGratitude.mutate(
      { data: { text: gratitudeText } },
      {
        onSuccess: () => {
          toast({ title: "Added to your gratitude journal", description: "Focusing on the good helps rewire your brain." });
          setGratitudeText("");
          queryClient.invalidateQueries({ queryKey: getListGratitudeEntriesQueryKey() });
        }
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Wellness Tools</h1>
        <p className="text-muted-foreground mt-1 text-lg">Your all-in-one toolkit for a calmer, healthier mind.</p>
      </div>

      {/* Daily Affirmation */}
      <section>
        <Card className="rounded-3xl border-0 shadow-lg bg-gradient-to-br from-primary/80 to-secondary/80 overflow-hidden relative text-white">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <CardContent className="p-8 sm:p-12 text-center relative z-10">
            <Sparkles className="w-8 h-8 mx-auto mb-6 text-white/80" />
            <h2 className="text-sm font-medium tracking-widest uppercase mb-4 text-white/80">Daily Affirmation</h2>
            {loadingAff ? (
              <Skeleton className="h-8 w-3/4 mx-auto bg-white/20" />
            ) : (
              <p className="text-2xl sm:text-3xl font-serif leading-tight">
                "{affirmation?.text || "I am exactly where I need to be right now."}"
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Row 1: Breathing + Gratitude */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-3xl border-border/50 shadow-sm h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-blue-500" />
              Box Breathing
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center p-8">
            <BreathingOrb />
            <p className="text-center text-muted-foreground mt-8 text-sm max-w-[200px]">
              Follow the circle. 4s inhale · 4s hold · 4s exhale · 4s hold.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/50 shadow-sm h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              Gratitude Log
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <form onSubmit={handleGratitudeSubmit} className="mb-6 flex gap-2">
              <Input
                placeholder="What are you grateful for today?"
                value={gratitudeText}
                onChange={(e) => setGratitudeText(e.target.value)}
                className="rounded-full bg-muted/30 border-border/50 focus-visible:ring-primary/30"
              />
              <Button type="submit" disabled={!gratitudeText.trim() || createGratitude.isPending} className="rounded-full px-6">
                Add
              </Button>
            </form>
            <div className="flex-1 overflow-y-auto max-h-[260px] pr-2 space-y-3">
              {loadingGratitude ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)
              ) : gratitudeEntries && gratitudeEntries.length > 0 ? (
                gratitudeEntries.map((entry) => (
                  <div key={entry.id} className="p-4 rounded-2xl bg-muted/20 border border-border/50 text-sm">
                    <p className="text-foreground">{entry.text}</p>
                    <span className="text-xs text-muted-foreground mt-2 block">{format(new Date(entry.createdAt), "MMM d, yyyy")}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-sm">No entries yet. Start small.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Pomodoro + Water Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PomodoroTimer />
        <WaterTracker />
      </div>

      {/* Row 3: Daily Wellness Checklist */}
      <DailyChecklist />

      {/* Row 4: Body Scan Meditation */}
      <BodyScan />
    </div>
  );
}

/* ─── Breathing Orb ─────────────────────────────────────────────────────── */
function BreathingOrb() {
  const [phase, setPhase] = useState(0);
  const phases = ["Inhale", "Hold", "Exhale", "Hold"];

  useEffect(() => {
    const cycle = () => {
      setPhase(0);
      setTimeout(() => setPhase(1), 4000);
      setTimeout(() => setPhase(2), 8000);
      setTimeout(() => setPhase(3), 12000);
    };
    cycle();
    const interval = setInterval(cycle, 16000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      <motion.div
        className="absolute w-32 h-32 rounded-full bg-primary/20 blur-md"
        animate={{ scale: [1, 1.8, 1.8, 1, 1], opacity: [0.3, 0.6, 0.6, 0.3, 0.3] }}
        transition={{ duration: 16, repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-secondary shadow-lg flex items-center justify-center"
        animate={{ scale: [1, 1.8, 1.8, 1, 1] }}
        transition={{ duration: 16, repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut" }}
      >
        <span className="text-white font-medium tracking-wide z-10 text-sm">{phases[phase]}</span>
      </motion.div>
    </div>
  );
}

/* ─── Pomodoro Timer ─────────────────────────────────────────────────────── */
function PomodoroTimer() {
  const WORK = 25 * 60;
  const BREAK = 5 * 60;

  const [mode, setMode] = useState<"work" | "break">("work");
  const [timeLeft, setTimeLeft] = useState(WORK);
  const [running, setRunning] = useState(false);
  const [sessions, setSessionsRaw] = useLS("mm_pomodoro_sessions", 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            if (mode === "work") {
              setSessionsRaw(sessions + 1);
              toast({ title: "🍅 Session complete!", description: "Great focus! Take a 5-minute break." });
              setMode("break");
              return BREAK;
            } else {
              toast({ title: "☕ Break over", description: "Ready for your next focus session?" });
              setMode("work");
              return WORK;
            }
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, mode]);

  const reset = () => {
    setRunning(false);
    setMode("work");
    setTimeLeft(WORK);
  };

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  const pct = mode === "work" ? ((WORK - timeLeft) / WORK) * 100 : ((BREAK - timeLeft) / BREAK) * 100;

  return (
    <Card className="rounded-3xl border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-orange-500" />
          Pomodoro Focus
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-5 pb-8">
        <div className={`text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full ${mode === "work" ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"}`}>
          {mode === "work" ? "🍅 Focus Time" : "☕ Break Time"}
        </div>

        <div className="text-6xl font-mono font-bold text-foreground tabular-nums">
          {mins}:{secs}
        </div>

        <Progress value={pct} className="w-full h-2 rounded-full" />

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-12 h-12"
            onClick={reset}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            size="lg"
            className="rounded-full px-8"
            onClick={() => setRunning(r => !r)}
          >
            {running ? <><Pause className="w-4 h-4 mr-2" /> Pause</> : <><Play className="w-4 h-4 mr-2" /> {timeLeft === (mode === "work" ? WORK : BREAK) ? "Start" : "Resume"}</>}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          🍅 Sessions today: <span className="font-semibold text-foreground">{sessions}</span>
        </p>
      </CardContent>
    </Card>
  );
}

/* ─── Water Tracker ──────────────────────────────────────────────────────── */
function WaterTracker() {
  const GOAL = 8;
  const [glasses, setGlasses] = useDailyReset("mm_water", 0);
  const { toast } = useToast();

  const add = () => {
    if (glasses >= GOAL) return;
    const next = glasses + 1;
    setGlasses(next);
    if (next === GOAL) toast({ title: "💧 Daily goal reached!", description: "Amazing! You've had 8 glasses of water today." });
  };

  const pct = Math.min((glasses / GOAL) * 100, 100);

  return (
    <Card className="rounded-3xl border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-500" />
          Water Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-5 pb-8">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/30" />
            <circle
              cx="60" cy="60" r="50" fill="none"
              stroke="currentColor" strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - pct / 100)}`}
              className="text-blue-500 transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl">💧</span>
            <span className="text-lg font-bold text-foreground">{glasses}/{GOAL}</span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          {Array.from({ length: GOAL }).map((_, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.85 }}
              onClick={() => setGlasses(i + 1)}
              className={`w-10 h-10 rounded-full text-lg transition-all border-2 ${
                i < glasses
                  ? "bg-blue-500 border-blue-500 text-white shadow-md"
                  : "bg-muted/30 border-border/50 text-muted-foreground hover:bg-blue-100 dark:hover:bg-blue-950/30"
              }`}
            >
              💧
            </motion.button>
          ))}
        </div>

        <Button
          onClick={add}
          disabled={glasses >= GOAL}
          className="rounded-full px-8 bg-blue-500 hover:bg-blue-600 text-white"
        >
          {glasses >= GOAL ? "🎉 Goal reached!" : "+ Add a glass"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">Tap any drop or the button to log a glass. Resets daily.</p>
      </CardContent>
    </Card>
  );
}

/* ─── Daily Wellness Checklist ───────────────────────────────────────────── */
function DailyChecklist() {
  const [checked, setChecked] = useDailyReset<Record<string, boolean>>("mm_checklist", {});

  const toggle = (id: string) => {
    setChecked({ ...checked, [id]: !checked[id] });
  };

  const done = WELLNESS_HABITS.filter(h => checked[h.id]).length;

  return (
    <Card className="rounded-3xl border-border/50 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Daily Wellness Checklist
          </CardTitle>
          <span className="text-sm font-semibold text-muted-foreground">{done}/{WELLNESS_HABITS.length}</span>
        </div>
        <Progress value={(done / WELLNESS_HABITS.length) * 100} className="h-1.5 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {WELLNESS_HABITS.map(h => (
            <motion.button
              key={h.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => toggle(h.id)}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                checked[h.id]
                  ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                  : "bg-muted/20 border-border/50 hover:bg-muted/40"
              }`}
            >
              <span className="text-xl">{h.emoji}</span>
              <span className={`text-sm font-medium flex-1 ${checked[h.id] ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {h.label}
              </span>
              {checked[h.id]
                ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                : <Circle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
              }
            </motion.button>
          ))}
        </div>
        {done === WELLNESS_HABITS.length && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-4 text-green-600 dark:text-green-400 font-semibold text-sm"
          >
            🎉 Perfect wellness day! You're taking incredible care of yourself.
          </motion.p>
        )}
        <p className="text-xs text-muted-foreground mt-3 text-center">Checklist resets every day at midnight.</p>
      </CardContent>
    </Card>
  );
}

/* ─── Body Scan Meditation ───────────────────────────────────────────────── */
function BodyScan() {
  const [step, setStep] = useState(0);
  const [active, setActive] = useState(false);

  const current = BODY_SCAN[step];

  return (
    <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧘 Body Scan Meditation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {!active ? (
          <div className="text-center py-6 space-y-4">
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              A guided relaxation exercise that moves awareness through each part of your body, releasing tension step by step. Takes about 5–8 minutes.
            </p>
            <Button onClick={() => { setActive(true); setStep(0); }} className="rounded-full px-8">
              Begin Body Scan
            </Button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Step {step + 1} of {BODY_SCAN.length}</span>
                <span>{Math.round(((step + 1) / BODY_SCAN.length) * 100)}% complete</span>
              </div>
              <Progress value={((step + 1) / BODY_SCAN.length) * 100} className="h-1.5" />

              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
                <p className="text-lg font-semibold text-foreground">{current.area}</p>
                <p className="text-muted-foreground leading-relaxed">{current.instruction}</p>
              </div>

              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setStep(s => Math.max(0, s - 1))}
                  disabled={step === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => { setActive(false); setStep(0); }}
                >
                  End session
                </Button>

                {step < BODY_SCAN.length - 1 ? (
                  <Button className="rounded-full" onClick={() => setStep(s => s + 1)}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    className="rounded-full bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => { setActive(false); setStep(0); }}
                  >
                    ✓ Complete
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
}
