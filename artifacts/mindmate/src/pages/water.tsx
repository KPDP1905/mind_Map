import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageTheme } from "@/hooks/use-page-theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Droplets, Plus, Minus, RotateCcw, TrendingUp, Target, Bell } from "lucide-react";

const GOAL = 8;

function getToday() { return new Date().toDateString(); }
function getWeekKey(i: number) {
  const d = new Date();
  d.setDate(d.getDate() - i);
  return d.toDateString();
}

function useWaterHistory() {
  const [history, setHistory] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem("calmora_water_history") || "{}"); } catch { return {}; }
  });
  const set = (date: string, val: number) => {
    const next = { ...history, [date]: val };
    setHistory(next);
    localStorage.setItem("calmora_water_history", JSON.stringify(next));
  };
  return [history, set] as const;
}

const TIPS = [
  "💡 Drink a glass of water first thing in the morning to kickstart your metabolism.",
  "💡 Keep a water bottle on your desk as a visual reminder to hydrate.",
  "💡 Add lemon, cucumber, or mint to make water more enjoyable.",
  "💡 Drink a glass before each meal — it also helps with portion control.",
  "💡 Your urine color tells you a lot — pale yellow means you're well-hydrated.",
  "💡 Feeling hungry? You might just be thirsty. Drink water first and wait 10 minutes.",
  "💡 Set an hourly phone reminder to take a few sips.",
  "💡 Herbal teas and infused waters count toward your daily intake too!",
];

export default function WaterPage() {
  usePageTheme("linear-gradient(135deg, #e8f4fd 0%, #dceef8 40%, #e4f0fb 70%, #eef6fd 100%)");
  const { toast } = useToast();
  const [history, setHistory] = useWaterHistory();
  const [tipIdx] = useState(() => Math.floor(Math.random() * TIPS.length));
  const today = getToday();
  const glasses = history[today] ?? 0;

  const setGlasses = (n: number) => {
    const val = Math.max(0, Math.min(GOAL + 4, n));
    setHistory(today, val);
    if (val === GOAL) {
      toast({ title: "🎉 Daily goal reached!", description: "Amazing! You've had 8 glasses of water today." });
    }
  };

  const add = () => setGlasses(glasses + 1);
  const remove = () => setGlasses(glasses - 1);
  const reset = () => setGlasses(0);

  const pct = Math.min((glasses / GOAL) * 100, 100);

  const weekData = Array.from({ length: 7 }, (_, i) => {
    const key = getWeekKey(6 - i);
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { label: d.toLocaleDateString("en", { weekday: "short" }), val: history[key] ?? 0, isToday: key === today };
  });

  const avgWeek = Math.round(weekData.reduce((a, b) => a + b.val, 0) / 7 * 10) / 10;
  const bestDay = Math.max(...weekData.map(d => d.val));
  const streakDays = (() => {
    let s = 0;
    for (let i = 0; i < 7; i++) {
      const k = getWeekKey(i);
      if ((history[k] ?? 0) >= GOAL) s++;
      else break;
    }
    return s;
  })();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "Georgia, serif", color: "#1a6b9a" }}>
          💧 Water Tracker
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">Stay hydrated — your brain is 75% water!</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "7-Day Avg", value: `${avgWeek}`, unit: "glasses", icon: TrendingUp, color: "#3b82f6" },
          { label: "Best Day", value: `${bestDay}`, unit: "glasses", icon: Target, color: "#8b5cf6" },
          { label: "Goal Streak", value: `${streakDays}`, unit: "days", icon: Bell, color: "#10b981" },
        ].map(({ label, value, unit, icon: Icon, color }) => (
          <Card key={label} className="rounded-3xl border-0 shadow-sm text-center">
            <CardContent className="pt-5 pb-4">
              <Icon className="w-5 h-5 mx-auto mb-2" style={{ color }} />
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              <p className="text-xs text-muted-foreground">{unit}</p>
              <p className="text-xs font-medium text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main tracker */}
      <Card className="rounded-3xl border-0 shadow-lg overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e88c5 0%, #1565a8 100%)" }}>
        <CardContent className="p-8 text-white">
          <div className="flex flex-col items-center gap-6">
            {/* Big water drop visual */}
            <div className="relative w-48 h-48">
              <svg className="w-48 h-48 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
                <motion.circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="white" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  animate={{ strokeDashoffset: `${2 * Math.PI * 50 * (1 - pct / 100)}` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl">💧</span>
                <span className="text-4xl font-bold">{glasses}</span>
                <span className="text-white/70 text-sm">of {GOAL} glasses</span>
              </div>
            </div>

            {/* Drop buttons */}
            <div className="flex gap-2 flex-wrap justify-center">
              {Array.from({ length: Math.max(GOAL, glasses) }).map((_, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => setGlasses(i + 1)}
                  className={`w-10 h-10 rounded-full text-lg transition-all border-2 ${
                    i < glasses
                      ? "bg-white/30 border-white shadow-md"
                      : "bg-white/10 border-white/30 hover:bg-white/20"
                  }`}
                >
                  💧
                </motion.button>
              ))}
            </div>

            {/* Control buttons */}
            <div className="flex gap-3">
              <Button onClick={remove} disabled={glasses <= 0} variant="outline"
                className="rounded-full w-12 h-12 bg-white/10 border-white/30 text-white hover:bg-white/20 p-0">
                <Minus className="w-4 h-4" />
              </Button>
              <Button onClick={add} disabled={glasses >= GOAL + 4}
                className="rounded-full px-8 bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-md">
                <Plus className="w-4 h-4 mr-2" /> Add Glass
              </Button>
              <Button onClick={reset} variant="outline"
                className="rounded-full w-12 h-12 bg-white/10 border-white/30 text-white hover:bg-white/20 p-0">
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            <AnimatePresence>
              {glasses >= GOAL && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <p className="text-xl font-bold">🎉 Daily goal achieved!</p>
                  <p className="text-white/70 text-sm">You're keeping your body beautifully hydrated.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* 7-day history chart */}
      <Card className="rounded-3xl border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            7-Day History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-32 justify-between">
            {weekData.map(({ label, val, isToday }) => (
              <div key={label} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-xs text-muted-foreground font-medium">{val}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(4, (val / GOAL) * 80)}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="w-full rounded-t-xl transition-colors"
                  style={{
                    background: val >= GOAL
                      ? "linear-gradient(to top, #1e88c5, #42a5f5)"
                      : val > 0
                        ? "linear-gradient(to top, #64b5f6, #90caf9)"
                        : "#e2e8f0",
                    maxHeight: 80,
                    minHeight: 4,
                  }}
                />
                <span className={`text-xs ${isToday ? "font-bold text-blue-600" : "text-muted-foreground"}`}>
                  {isToday ? "Today" : label}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-400 inline-block" /> Goal reached</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-200 inline-block" /> Partial</span>
          </div>
        </CardContent>
      </Card>

      {/* Tip of the day */}
      <Card className="rounded-3xl border-blue-100 bg-blue-50/50 shadow-sm">
        <CardContent className="p-6">
          <p className="text-sm text-blue-800 leading-relaxed">{TIPS[tipIdx]}</p>
        </CardContent>
      </Card>
    </div>
  );
}
