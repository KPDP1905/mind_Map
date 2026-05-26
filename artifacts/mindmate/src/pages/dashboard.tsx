import { useGetDashboardSummary, useGetDashboardActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Activity, Flame, Heart, Brain, Calendar } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export default function DashboardPage() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: activity, isLoading: loadingActivity } = useGetDashboardActivity();

  // Mock chart data if not provided directly
  const chartData = [
    { day: "Mon", score: 6 },
    { day: "Tue", score: 8 },
    { day: "Wed", score: 7 },
    { day: "Thu", score: 5 },
    { day: "Fri", score: 8 },
    { day: "Sat", score: 9 },
    { day: "Sun", score: summary?.weeklyAverageMood || 0 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
        <p className="text-muted-foreground mt-1 text-lg">Here is a gentle overview of your recent wellbeing.</p>
      </div>

      {loadingSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-border/50 shadow-sm bg-primary/5 border-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
                <Heart className="w-4 h-4" /> Avg Mood
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{summary.weeklyAverageMood.toFixed(1)} <span className="text-xl text-muted-foreground font-normal">/10</span></div>
              <p className="text-xs text-muted-foreground mt-1">This week</p>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-500 flex items-center gap-2">
                <Flame className="w-4 h-4" /> Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{summary.currentStreak} <span className="text-xl text-muted-foreground font-normal">days</span></div>
              <p className="text-xs text-muted-foreground mt-1">Keep it up!</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-500 flex items-center gap-2">
                <Activity className="text-purple-500 w-4 h-4" /> Wellness Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{summary.wellnessScore}</div>
              <p className="text-xs text-muted-foreground mt-1">Out of 100</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-500 flex items-center gap-2">
                <Brain className="w-4 h-4" /> AI Chats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{summary.conversationCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Total sessions</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="col-span-1 lg:col-span-2 rounded-3xl border-border/50 shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle>Mood Trend</CardTitle>
            <CardDescription>Your mood variations over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 rounded-3xl border-border/50 shadow-sm overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {loadingActivity ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : activity && activity.length > 0 ? (
              <div className="space-y-6">
                {activity.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-lg flex-shrink-0">
                      {item.emoji || <Calendar className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(item.timestamp), "MMM d, h:mm a")}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                  <Activity className="w-5 h-5 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">No recent activity.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}