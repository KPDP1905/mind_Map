import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePageTheme } from "@/hooks/use-page-theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { format, addDays, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Calendar, TrendingUp, Droplets, Activity } from "lucide-react";

function useLS<T>(key: string, def: T) {
  const [v, setV] = useState<T>(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def; } catch { return def; }
  });
  const set = (x: T) => { setV(x); localStorage.setItem(key, JSON.stringify(x)); };
  return [v, set] as const;
}

interface CycleEntry {
  id: string;
  startDate: string;
  endDate: string;
  cycleLength: number;
  periodLength: number;
  symptoms: string[];
  notes: string;
}

const SYMPTOMS = [
  { id: "cramps",   emoji: "😣", label: "Cramps" },
  { id: "mood",     emoji: "😢", label: "Mood swings" },
  { id: "headache", emoji: "🤕", label: "Headache" },
  { id: "energy",   emoji: "😴", label: "Low energy" },
  { id: "bloating", emoji: "🌊", label: "Bloating" },
  { id: "backpain", emoji: "🔴", label: "Back pain" },
  { id: "nausea",   emoji: "🤢", label: "Nausea" },
  { id: "sleep",    emoji: "💤", label: "Sleep issues" },
];

function getDayType(
  date: Date,
  entries: CycleEntry[]
): "period" | "ovulation" | "fertile" | "predicted-period" | "predicted-ovulation" | null {
  if (entries.length === 0) return null;

  const sorted = [...entries].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  const latest = sorted[0];
  const avgCycle = sorted.reduce((s, e) => s + e.cycleLength, 0) / sorted.length;
  const avgPeriod = sorted.reduce((s, e) => s + e.periodLength, 0) / sorted.length;

  for (const entry of entries) {
    const start = new Date(entry.startDate);
    const end = new Date(entry.endDate);
    if (isWithinInterval(date, { start, end: addDays(start, Math.round(avgPeriod) - 1) })) return "period";
  }

  const latestStart = new Date(latest.startDate);
  const predictedStart = addDays(latestStart, Math.round(avgCycle));
  const predictedOvulation = addDays(latestStart, Math.round(avgCycle) - 14);
  const fertileStart = addDays(predictedOvulation, -5);
  const fertileEnd = addDays(predictedOvulation, 1);

  if (isWithinInterval(date, { start: predictedStart, end: addDays(predictedStart, Math.round(avgPeriod) - 1) })) return "predicted-period";
  if (isSameDay(date, predictedOvulation)) return "predicted-ovulation";
  if (isWithinInterval(date, { start: fertileStart, end: fertileEnd })) return "fertile";

  return null;
}

export default function PeriodTrackerPage() {
  usePageTheme("linear-gradient(135deg, #fde8f0 0%, #f8d8e8 30%, #fce0ee 65%, #f5e0f5 100%)");
  const [cycles, setCycles] = useLS<CycleEntry[]>("mm_period_cycles", []);
  const [calMonth, setCalMonth] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newCycleLen, setNewCycleLen] = useState(28);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const sorted = [...cycles].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  const avgCycle = sorted.length ? sorted.reduce((s, e) => s + e.cycleLength, 0) / sorted.length : 28;
  const avgPeriod = sorted.length ? sorted.reduce((s, e) => s + e.periodLength, 0) / sorted.length : 5;

  const latest = sorted[0];
  const nextPeriodDate = latest ? addDays(new Date(latest.startDate), Math.round(avgCycle)) : null;
  const nextOvulation = latest ? addDays(new Date(latest.startDate), Math.round(avgCycle) - 14) : null;
  const fertileStart = nextOvulation ? addDays(nextOvulation, -5) : null;
  const fertileEnd = nextOvulation ? addDays(nextOvulation, 1) : null;
  const daysUntilNext = nextPeriodDate ? differenceInDays(nextPeriodDate, new Date()) : null;
  const currentCycleDay = latest ? differenceInDays(new Date(), new Date(latest.startDate)) + 1 : null;

  const monthStart = startOfMonth(calMonth);
  const monthEnd = endOfMonth(calMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = monthStart.getDay();

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const addCycle = () => {
    if (!newStart || !newEnd) return;
    const start = new Date(newStart);
    const end = new Date(newEnd);
    const periodLen = differenceInDays(end, start) + 1;
    const entry: CycleEntry = {
      id: Date.now().toString(),
      startDate: newStart,
      endDate: newEnd,
      cycleLength: newCycleLen,
      periodLength: periodLen,
      symptoms: selectedSymptoms,
      notes,
    };
    setCycles([...cycles, entry]);
    setNewStart(""); setNewEnd(""); setSelectedSymptoms([]); setNotes("");
    setShowAdd(false);
  };

  const deleteCycle = (id: string) => setCycles(cycles.filter(c => c.id !== id));

  const dayColor = (type: string | null): string => {
    if (type === "period") return "bg-rose-400 text-white";
    if (type === "predicted-period") return "bg-rose-200 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-2 border-dashed border-rose-400";
    if (type === "ovulation" || type === "predicted-ovulation") return "bg-purple-400 text-white";
    if (type === "fertile") return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    return "";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Period Tracker</h1>
          <p className="text-muted-foreground mt-1 text-lg">Track your cycle with care and clarity.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="rounded-full">
          <Plus className="w-4 h-4 mr-2" /> Log Period
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-rose-500 mb-1 flex items-center gap-1"><Droplets className="w-3 h-3" /> Next Period</p>
            <p className="text-xl font-bold text-foreground">
              {daysUntilNext !== null ? (daysUntilNext <= 0 ? "Today!" : `${daysUntilNext}d`) : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{nextPeriodDate ? format(nextPeriodDate, "MMM d") : "Log a cycle"}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Cycle Day</p>
            <p className="text-xl font-bold text-foreground">{currentCycleDay ?? "—"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">of {Math.round(avgCycle)} day cycle</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-purple-200 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-950/20 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-purple-500 mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Ovulation</p>
            <p className="text-xl font-bold text-foreground">{nextOvulation ? format(nextOvulation, "MMM d") : "—"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{fertileStart && fertileEnd ? `Fertile: ${format(fertileStart, "MMM d")}–${format(fertileEnd, "MMM d")}` : "Predicted"}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> Avg Cycle</p>
            <p className="text-xl font-bold text-foreground">{Math.round(avgCycle)}<span className="text-sm font-normal text-muted-foreground">d</span></p>
            <p className="text-xs text-muted-foreground mt-0.5">Avg period: {Math.round(avgPeriod)}d</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{format(calMonth, "MMMM yyyy")}</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setCalMonth(m => addDays(startOfMonth(m), -1))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setCalMonth(m => addDays(endOfMonth(m), 1))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground mt-2">
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d}>{d}</div>)}
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
            {daysInMonth.map(day => {
              const type = getDayType(day, cycles);
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  className={`aspect-square flex items-center justify-center text-sm rounded-full transition-all ${dayColor(type)} ${isToday ? "ring-2 ring-primary ring-offset-1" : ""} ${!type ? "text-foreground hover:bg-muted/40" : ""}`}
                >
                  {format(day, "d")}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-400 inline-block" /> Period</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-200 border border-dashed border-rose-400 inline-block" /> Predicted</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-400 inline-block" /> Ovulation</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-100 inline-block" /> Fertile window</span>
          </div>
        </CardContent>
      </Card>

      {/* Cycle History */}
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4">Cycle History</h2>
        {sorted.length === 0 ? (
          <div className="text-center p-12 border border-dashed rounded-3xl bg-muted/10">
            <p className="text-4xl mb-3">🌸</p>
            <p className="font-semibold text-foreground mb-1">No cycles logged yet</p>
            <p className="text-sm text-muted-foreground mb-4">Start tracking to see predictions and insights.</p>
            <Button className="rounded-full" onClick={() => setShowAdd(true)}>Log your first period</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((cycle, i) => (
              <Card key={cycle.id} className="rounded-2xl border-border/50 shadow-sm">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center text-rose-500 flex-shrink-0 text-lg">🌸</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-foreground">
                        {format(new Date(cycle.startDate), "MMM d")} – {format(new Date(cycle.endDate), "MMM d, yyyy")}
                      </p>
                      <button onClick={() => deleteCycle(cycle.id)} className="text-muted-foreground/50 hover:text-destructive text-xs transition-colors flex-shrink-0">✕</button>
                    </div>
                    <p className="text-sm text-muted-foreground">{cycle.periodLength} day period · {cycle.cycleLength} day cycle</p>
                    {cycle.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {cycle.symptoms.map(s => {
                          const sym = SYMPTOMS.find(x => x.id === s);
                          return sym ? (
                            <span key={s} className="text-xs bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full border border-rose-100 dark:border-rose-900/50">
                              {sym.emoji} {sym.label}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                    {cycle.notes && <p className="text-sm text-muted-foreground mt-1 italic">"{cycle.notes}"</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Cycle Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowAdd(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-card rounded-3xl p-6 w-full max-w-md shadow-2xl border border-border/50 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-foreground mb-5">Log Period</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Start Date</label>
                  <input type="date" value={newStart} onChange={e => setNewStart(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">End Date</label>
                  <input type="date" value={newEnd} onChange={e => setNewEnd(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Cycle Length: <span className="text-primary">{newCycleLen} days</span></label>
                  <input type="range" min={21} max={45} value={newCycleLen} onChange={e => setNewCycleLen(+e.target.value)} className="w-full accent-rose-400" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>21 days</span><span>45 days</span></div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Symptoms</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SYMPTOMS.map(s => (
                      <button
                        key={s.id}
                        onClick={() => toggleSymptom(s.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm text-left transition-all ${
                          selectedSymptoms.includes(s.id)
                            ? "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300"
                            : "bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        <span>{s.emoji}</span>
                        <span className="font-medium">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Notes (optional)</label>
                  <textarea
                    value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="How are you feeling? Any observations..."
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none h-20"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="ghost" className="flex-1 rounded-full" onClick={() => setShowAdd(false)}>Cancel</Button>
                  <Button className="flex-1 rounded-full bg-rose-500 hover:bg-rose-600 text-white" onClick={addCycle} disabled={!newStart || !newEnd}>Save</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
