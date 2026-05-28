import { useGetDashboardSummary, useGetDashboardActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { Activity, Flame, Heart, Brain, Calendar, CheckCircle2, Circle, Zap } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
  LineChart, Line, CartesianGrid
} from "recharts";

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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-lg">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-bold text-foreground">{payload[0].value}<span className="text-xs text-muted-foreground font-normal"> /10</span></p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
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

  const monthlyData = [
    { week: "W1", score: 6.5 },
    { week: "W2", score: 7.2 },
    { week: "W3", score: 6.8 },
    { week: "W4", score: summary?.weeklyAverageMood ?? 7.5 },
  ];

  const energyScore = summary ? Math.min(Math.round((summary.wellnessScore ?? 70)), 100) : 72;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
        <p className="text-muted-foreground mt-1 text-lg">Here is a gentle overview of your recent wellbeing.</p>
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
        <Card className="col-span-1 lg:col-span-2 rounded-3xl border-border/50 shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle>Mood Trend</CardTitle>
            <CardDescription>Your emotional journey this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} dy={8} />
                  <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} ticks={[0, 5, 10]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#moodGrad)" dot={{ fill: "hsl(var(--primary))", r: 4, strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-xs font-medium text-muted-foreground mb-2">Monthly Overview</p>
              <div className="h-[100px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--secondary))" strokeWidth={2} dot={{ fill: "hsl(var(--secondary))", r: 3, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
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
