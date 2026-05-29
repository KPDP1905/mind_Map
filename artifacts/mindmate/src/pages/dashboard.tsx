import { useGetDashboardSummary, useGetDashboardActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { Activity, Flame, Heart, Brain, Calendar, CheckCircle2, Circle, Zap } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer, Tooltip, XAxis, YAxis,
  CartesianGrid, BarChart, Bar, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from "recharts";
import { usePageTheme } from "@/hooks/use-page-theme";
import { AdBanner } from "@/components/ad-banner";

function useLS<T>(key: string, def: T) {
  const [v, setV] = useState<T>(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def; } catch { return def; }
  });
  const set = (x: T) => { setV(x); localStorage.setItem(key, JSON.stringify(x)); };
  return [v, set] as const;
}

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

const CHECKLIST_ITEMS = [
  { id: "water",    emoji: "💧", label: "Drink water (8 glasses)" },
  { id: "meditate", emoji: "🧘", label: "Meditate" },
  { id: "exercise", emoji: "🏃", label: "Exercise (15 min)" },
  { id: "sleep",    emoji: "😴", label: "Track sleep" },
  { id: "journal",  emoji: "📔", label: "Journal entry" },
  { id: "mood",     emoji: "😊", label: "Mood check-in" },
  { id: "stretch",  emoji: "🤸", label: "Stretching" },
  { id: "meds",     emoji: "💊", label: "Medication reminder" },
];

function DailyChecklistWidget() {
  const [checked, setChecked] = useDailyReset<Record<string, boolean>>("mm_dashboard_checklist", {});
  const done = CHECKLIST_ITEMS.filter(h => checked[h.id]).length;
  const pct = (done / CHECKLIST_ITEMS.length) * 100;

  const toggle = (id: string) => setChecked({ ...checked, [id]: !checked[id] });

  return (
    <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            Daily Checklist
          </CardTitle>
          <span className="text-sm font-semibold text-muted-foreground">{done}/{CHECKLIST_ITEMS.length}</span>
        </div>
        <Progress value={pct} className="h-1.5 mt-1" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1.5">
          {CHECKLIST_ITEMS.map((item) => (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => toggle(item.id)}
              className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                checked[item.id]
                  ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                  : "bg-muted/20 border-border/50 hover:bg-muted/40"
              }`}
            >
              <span className="text-base">{item.emoji}</span>
              <span className={`text-xs font-medium flex-1 ${checked[item.id] ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {item.label}
              </span>
              {checked[item.id]
                ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                : <Circle className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
              }
            </motion.button>
          ))}
        </div>
        {done === CHECKLIST_ITEMS.length && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-3 text-green-600 dark:text-green-400 font-semibold text-xs"
          >
            🎉 Perfect day! All done!
          </motion.p>
        )}
      </CardContent>
    </Card>
  );
}

function MentalEnergyWidget({ score }: { score: number }) {
  const pct = Math.min(Math.max(score, 0), 100);
  const color = pct >= 70 ? "text-green-500" : pct >= 40 ? "text-yellow-500" : "text-red-500";
  const strokeColor = pct >= 70 ? "#22c55e" : pct >= 40 ? "#eab308" : "#ef4444";
  const label = pct >= 70 ? "Healthy" : pct >= 40 ? "Moderate" : "Low Energy";
  const tip = pct >= 70 ? "You're in great shape! Keep up the momentum." : pct >= 40 ? "Try a short meditation or walk to recharge." : "Rest, hydrate, and be gentle with yourself today.";
  const circumference = 2 * Math.PI * 40;
  const offset = circumference * (1 - pct / 100);

  return (
    <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="w-4 h-4 text-amber-500" />
          Mental Energy
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-5 pb-5">
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
            <circle
              cx="50" cy="50" r="40" fill="none"
              stroke={strokeColor} strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-xl font-bold ${color}`}>{pct}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${color}`}>{label}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tip}</p>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Daily</span>
              <span className={`font-medium ${color}`}>{pct}%</span>
            </div>
            <Progress value={pct} className="h-1.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const MOOD_EMOJIS: Record<number, string> = { 2: "😢", 3: "😔", 4: "😔", 5: "😐", 6: "😐", 7: "🙂", 8: "🙂", 9: "😄", 10: "😄" };
const MOOD_COLORS = ["#e08a8a","#e8a070","#e8c870","#8ec5e0","#7eb87e","#8ec5e0","#a080d0","#c47898"];

function CustomBarTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const score = payload[0].value;
    return (
      <div className="rounded-2xl px-4 py-3 shadow-xl" style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(196,120,138,0.2)", backdropFilter: "blur(12px)" }}>
        <p className="text-xs font-semibold mb-1" style={{ color: "#8b5060" }}>{label}</p>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{MOOD_EMOJIS[Math.round(score)] || "😐"}</span>
          <div>
            <p className="text-lg font-bold" style={{ color: "#6b3a4a" }}>{score}<span className="text-xs font-normal text-gray-400">/10</span></p>
            <p className="text-xs" style={{ color: "#a07080" }}>Mood score</p>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

function CustomBarShape(props: any) {
  const { x, y, width, height, index } = props;
  const color = MOOD_COLORS[index % MOOD_COLORS.length];
  const r = Math.min(8, width / 2);
  return (
    <g>
      <defs>
        <linearGradient id={`bar-grad-${index}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.9} />
          <stop offset="100%" stopColor={color} stopOpacity={0.4} />
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={width} height={height} rx={r} ry={r} fill={`url(#bar-grad-${index})`} />
    </g>
  );
}

export default function DashboardPage() {
  usePageTheme("linear-gradient(135deg, #F8EEEA 0%, #f5e8e4 40%, #f2ecf5 80%, #edf2f8 100%)");
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: activity, isLoading: loadingActivity } = useGetDashboardActivity();

  const weeklyData = [
    { day: "Mon", score: 6 },
    { day: "Tue", score: 8 },
    { day: "Wed", score: 7 },
    { day: "Thu", score: 5 },
    { day: "Fri", score: 8 },
    { day: "Sat", score: 9 },
    { day: "Sun", score: summary?.weeklyAverageMood ? Math.round(summary.weeklyAverageMood) : 7 },
  ];

  const energyScore = summary ? Math.min(Math.round((summary.wellnessScore ?? 70)), 100) : 72;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <AdBanner className="mt-0" />
      {/* Decorative sparkles */}
      <div className="pointer-events-none absolute -top-4 right-0 w-64 h-64 opacity-30" style={{ background: "radial-gradient(circle, rgba(196,120,138,0.3) 0%, transparent 70%)" }} />
      {[...Array(6)].map((_, i) => (
        <motion.div key={i} className="sparkle pointer-events-none absolute text-rose-300/40 select-none"
          style={{ top: `${5 + i * 14}%`, right: `${2 + (i % 3) * 8}%`, animationDelay: `${i * 0.5}s`, fontSize: "1.2rem" }}>
          ✦
        </motion.div>
      ))}

      <div>
        <h1 className="text-3xl font-bold tracking-tight font-serif-heading" style={{ fontFamily: "Georgia, serif", color: "#6b2a3a" }}>Welcome back 🌸</h1>
        <p className="mt-1 text-lg" style={{ color: "#a07080" }}>Here is a gentle overview of your recent wellbeing.</p>
      </div>

      {loadingSummary ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-border/50 shadow-sm bg-primary/5 border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-primary flex items-center gap-2">
                <Heart className="w-3.5 h-3.5" /> Avg Mood
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{summary.weeklyAverageMood.toFixed(1)}<span className="text-base text-muted-foreground font-normal">/10</span></div>
              <p className="text-xs text-muted-foreground mt-1">This week</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-orange-500 flex items-center gap-2">
                <Flame className="w-3.5 h-3.5" /> Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{summary.currentStreak}<span className="text-base text-muted-foreground font-normal"> days</span></div>
              <p className="text-xs text-muted-foreground mt-1">Keep it up!</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-purple-500 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" /> Wellness Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{summary.wellnessScore}</div>
              <p className="text-xs text-muted-foreground mt-1">Out of 100</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-blue-500 flex items-center gap-2">
                <Brain className="w-3.5 h-3.5" /> AI Chats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{summary.conversationCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Total sessions</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 rounded-3xl border-border/50 shadow-sm overflow-hidden"
          style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)", border: "1px solid rgba(196,120,138,0.18)" }}>
          <CardHeader>
            <CardTitle className="font-serif-heading" style={{ fontFamily: "Georgia, serif", color: "#6b2a3a" }}>Mood Trend ✨</CardTitle>
            <CardDescription style={{ color: "#a07080" }}>Your emotional journey this week</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Emoji row above chart */}
            <div className="flex justify-around mb-2 px-2">
              {weeklyData.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <span className="text-base leading-none">{MOOD_EMOJIS[Math.round(d.score)] || "😐"}</span>
                </div>
              ))}
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 4, right: 10, left: -20, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(196,120,138,0.12)" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a07080", fontWeight: 500 }} dy={6} />
                  <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#c0a0a8" }} ticks={[0, 5, 10]} />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: "rgba(196,120,138,0.06)", radius: 8 }} />
                  <Bar dataKey="score" shape={<CustomBarShape />} radius={[8, 8, 0, 0]}>
                    {weeklyData.map((_, i) => (
                      <Cell key={i} fill={MOOD_COLORS[i % MOOD_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Mood legend */}
            <div className="mt-4 pt-4 border-t flex flex-wrap gap-2 justify-center" style={{ borderColor: "rgba(196,120,138,0.15)" }}>
              {[["😢 Terrible",2],["😔 Bad",4],["😐 Okay",6],["🙂 Good",8],["😄 Amazing",10]].map(([label]) => (
                <span key={String(label)} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(196,120,138,0.1)", color: "#8b5060" }}>
                  {String(label)}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="col-span-1 space-y-4">
          <MentalEnergyWidget score={energyScore} />
          <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto pt-0">
              {loadingActivity ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : activity && activity.length > 0 ? (
                <div className="space-y-3">
                  {activity.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-sm flex-shrink-0">
                        {item.emoji || <Calendar className="w-3.5 h-3.5 text-muted-foreground" />}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground leading-snug">{item.description}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(item.timestamp), "MMM d, h:mm a")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-6">
                  <Activity className="w-5 h-5 text-muted-foreground/40 mb-2" />
                  <p className="text-xs text-muted-foreground">No recent activity.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <DailyChecklistWidget />
    </div>
  );
}
