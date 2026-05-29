import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageTheme } from "@/hooks/use-page-theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun, Clock, TrendingUp, Star, Zap, AlertCircle } from "lucide-react";

const SLEEP_TIPS = [
  { emoji: "📵", title: "No screens 1 hour before bed", desc: "Blue light from phones suppresses melatonin, making it harder to fall asleep." },
  { emoji: "🌡️", title: "Cool your room to 65–68°F (18–20°C)", desc: "Your core body temperature drops during sleep. A cool room speeds this up." },
  { emoji: "⏰", title: "Wake up at the same time every day", desc: "A consistent wake time anchors your circadian rhythm, even on weekends." },
  { emoji: "☀️", title: "Get sunlight within 30 min of waking", desc: "Morning light sets your body clock and improves alertness throughout the day." },
  { emoji: "🍵", title: "No caffeine after 2 PM", desc: "Caffeine has a half-life of ~5 hours. That 3pm coffee may still be active at midnight." },
  { emoji: "🧘", title: "4-7-8 breathing before sleep", desc: "Breathe in 4s, hold 7s, exhale 8s. Activates parasympathetic nervous system." },
  { emoji: "📝", title: "Write a tomorrow list", desc: "Brain dump your worries and to-dos before bed to quiet a racing mind." },
  { emoji: "🛏️", title: "Use your bed only for sleep", desc: "Strong mental association between bed and sleep helps you fall asleep faster." },
];

const QUALITY_LABELS = ["😴 Very Poor", "😕 Poor", "😐 Fair", "🙂 Good", "😄 Excellent"];

function getToday() { return new Date().toDateString(); }
function getWeekKey(i: number) {
  const d = new Date();
  d.setDate(d.getDate() - i);
  return d.toDateString();
}

interface SleepEntry { bedtime: string; wakeTime: string; quality: number; duration: number; date: string; }

function useSleepHistory() {
  const [history, setHistory] = useState<SleepEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem("calmora_sleep_history") || "[]"); } catch { return []; }
  });
  const add = (entry: SleepEntry) => {
    const next = [entry, ...history.filter(e => e.date !== entry.date)].slice(0, 30);
    setHistory(next);
    localStorage.setItem("calmora_sleep_history", JSON.stringify(next));
  };
  return [history, add] as const;
}

function calcDuration(bedtime: string, wakeTime: string): number {
  const [bh, bm] = bedtime.split(":").map(Number);
  const [wh, wm] = wakeTime.split(":").map(Number);
  let mins = (wh * 60 + wm) - (bh * 60 + bm);
  if (mins < 0) mins += 24 * 60;
  return Math.round(mins / 60 * 10) / 10;
}

function calcIdealBedtime(wakeTime: string): string[] {
  const [h, m] = wakeTime.split(":").map(Number);
  return [7.5, 6, 4.5].map(cycles => {
    let mins = h * 60 + m - Math.round(cycles * 60) - 14;
    if (mins < 0) mins += 24 * 60;
    const hh = String(Math.floor(mins / 60) % 24).padStart(2, "0");
    const mm = String(mins % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  });
}

export default function SleepPage() {
  usePageTheme("linear-gradient(135deg, #1a1a3e 0%, #2d1b69 30%, #1e1b4b 60%, #0f0f2d 100%)");
  const { toast } = useToast();
  const [history, addEntry] = useSleepHistory();

  const [bedtime, setBedtime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [quality, setQuality] = useState(3);
  const [tab, setTab] = useState<"log" | "tips" | "schedule">("log");

  const duration = calcDuration(bedtime, wakeTime);
  const idealBedtimes = calcIdealBedtime(wakeTime);

  const weekEntries = Array.from({ length: 7 }, (_, i) => {
    const key = getWeekKey(6 - i);
    const entry = history.find(e => e.date === key);
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return { label: d.toLocaleDateString("en", { weekday: "short" }), entry, isToday: key === getToday() };
  });

  const avgSleep = history.length > 0
    ? Math.round(history.slice(0, 7).reduce((a, b) => a + b.duration, 0) / Math.min(history.length, 7) * 10) / 10
    : 0;

  const handleLog = () => {
    const dur = calcDuration(bedtime, wakeTime);
    addEntry({ bedtime, wakeTime, quality, duration: dur, date: getToday() });
    toast({ title: "Sleep logged! 🌙", description: `${dur}h sleep tracked. Sleep well tonight!` });
  };

  const isDark = true;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white" style={{ fontFamily: "Georgia, serif" }}>
          🌙 Sleep Schedule
        </h1>
        <p className="text-white/60 mt-1 text-lg">Track your sleep, improve your rest.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Avg Sleep", value: `${avgSleep}h`, icon: Clock, color: "#818cf8" },
          { label: "7-Day Logs", value: `${Math.min(history.length, 7)}`, icon: TrendingUp, color: "#34d399" },
          { label: "Best Night", value: history.length ? `${Math.max(...history.slice(0,7).map(e => e.duration))}h` : "—", icon: Star, color: "#fbbf24" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="rounded-3xl border-white/10 text-center"
            style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
            <CardContent className="pt-5 pb-4">
              <Icon className="w-5 h-5 mx-auto mb-2" style={{ color }} />
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-white/50 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-2xl" style={{ background: "rgba(255,255,255,0.08)" }}>
        {(["log", "schedule", "tips"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              tab === t ? "bg-white text-indigo-900 shadow-sm" : "text-white/60 hover:text-white"
            }`}>
            {t === "log" ? "📊 Log Sleep" : t === "schedule" ? "⏰ Smart Schedule" : "💡 Sleep Tips"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          {tab === "log" && (
            <div className="space-y-5">
              <Card className="rounded-3xl border-white/10" style={{ background: "rgba(255,255,255,0.07)" }}>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
                        <Moon className="w-4 h-4 text-indigo-400" /> Bedtime
                      </label>
                      <input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)}
                        className="w-full p-3 rounded-xl text-white text-lg font-mono font-bold border border-white/20 focus:outline-none focus:border-indigo-400"
                        style={{ background: "rgba(255,255,255,0.1)" }} />
                    </div>
                    <div>
                      <label className="text-white/70 text-sm font-medium mb-2 flex items-center gap-2">
                        <Sun className="w-4 h-4 text-yellow-400" /> Wake Time
                      </label>
                      <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)}
                        className="w-full p-3 rounded-xl text-white text-lg font-mono font-bold border border-white/20 focus:outline-none focus:border-indigo-400"
                        style={{ background: "rgba(255,255,255,0.1)" }} />
                    </div>
                  </div>

                  <div className="text-center p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <p className="text-white/50 text-sm">Sleep Duration</p>
                    <p className={`text-4xl font-bold mt-1 ${duration >= 7 ? "text-green-400" : duration >= 6 ? "text-yellow-400" : "text-red-400"}`}>
                      {duration}h
                    </p>
                    {duration < 7 && <p className="text-white/50 text-xs mt-1 flex items-center justify-center gap-1"><AlertCircle className="w-3 h-3" /> Aim for 7–9 hours</p>}
                    {duration >= 7 && <p className="text-green-400 text-xs mt-1">✓ Great sleep duration!</p>}
                  </div>

                  <div>
                    <p className="text-white/70 text-sm font-medium mb-3">Sleep Quality</p>
                    <div className="flex gap-2">
                      {QUALITY_LABELS.map((label, i) => (
                        <button key={i} onClick={() => setQuality(i + 1)}
                          className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all border ${
                            quality === i + 1
                              ? "bg-indigo-500 border-indigo-400 text-white"
                              : "border-white/20 text-white/50 hover:border-white/40"
                          }`}>
                          {label.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                    <p className="text-white/50 text-xs mt-2 text-center">{QUALITY_LABELS[quality - 1]}</p>
                  </div>

                  <Button onClick={handleLog} className="w-full rounded-full py-3 font-semibold"
                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                    Log Tonight's Sleep
                  </Button>
                </CardContent>
              </Card>

              {/* 7-day chart */}
              <Card className="rounded-3xl border-white/10" style={{ background: "rgba(255,255,255,0.07)" }}>
                <CardHeader><CardTitle className="text-white text-base">7-Day Sleep History</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2 h-28 justify-between">
                    {weekEntries.map(({ label, entry, isToday }) => (
                      <div key={label} className="flex flex-col items-center gap-1 flex-1">
                        <span className="text-xs text-white/50">{entry ? `${entry.duration}h` : ""}</span>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${entry ? Math.min((entry.duration / 10) * 100, 100) : 4}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="w-full rounded-t-xl"
                          style={{
                            background: !entry ? "rgba(255,255,255,0.1)"
                              : entry.duration >= 7 ? "linear-gradient(to top, #6366f1, #818cf8)"
                              : "linear-gradient(to top, #f59e0b, #fbbf24)",
                            minHeight: 4, maxHeight: 100,
                          }}
                        />
                        <span className={`text-xs ${isToday ? "text-indigo-400 font-bold" : "text-white/40"}`}>
                          {isToday ? "Today" : label}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {tab === "schedule" && (
            <Card className="rounded-3xl border-white/10" style={{ background: "rgba(255,255,255,0.07)" }}>
              <CardContent className="p-6 space-y-6">
                <div>
                  <p className="text-white font-semibold mb-1 flex items-center gap-2"><Sun className="w-4 h-4 text-yellow-400" /> Your wake time</p>
                  <input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)}
                    className="p-3 rounded-xl text-white text-xl font-mono font-bold border border-white/20"
                    style={{ background: "rgba(255,255,255,0.1)" }} />
                </div>
                <div>
                  <p className="text-white/70 text-sm mb-3">
                    Ideal bedtimes (complete sleep cycles of 90 min each):
                  </p>
                  <div className="space-y-3">
                    {idealBedtimes.map((time, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-white/10"
                        style={{ background: i === 0 ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.05)" }}>
                        <div className="flex items-center gap-3">
                          <Moon className="w-5 h-5 text-indigo-400" />
                          <div>
                            <p className="text-white font-bold text-lg">{time}</p>
                            <p className="text-white/50 text-xs">{[5, 4, 3][i]} sleep cycles · {[7.5, 6, 4.5][i]}h</p>
                          </div>
                        </div>
                        {i === 0 && <span className="text-xs bg-indigo-500 text-white px-2 py-1 rounded-full font-medium">Best</span>}
                      </div>
                    ))}
                  </div>
                  <p className="text-white/40 text-xs mt-3 text-center">
                    Based on 90-min sleep cycles + 14 min to fall asleep
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {tab === "tips" && (
            <div className="grid gap-4">
              {SLEEP_TIPS.map((tip, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="rounded-2xl border-white/10" style={{ background: "rgba(255,255,255,0.07)" }}>
                    <CardContent className="p-5 flex items-start gap-4">
                      <span className="text-2xl flex-shrink-0">{tip.emoji}</span>
                      <div>
                        <p className="font-semibold text-white">{tip.title}</p>
                        <p className="text-white/60 text-sm mt-1 leading-relaxed">{tip.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
