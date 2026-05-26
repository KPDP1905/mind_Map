import { Router, type IRouter } from "express";
import { eq, and, gte, desc } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { db, moodsTable, journalTable, gratitudeTable, conversations } from "@workspace/db";

const router: IRouter = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  req.userId = auth.userId;
  next();
};

router.get("/dashboard/summary", requireAuth, async (req: any, res): Promise<void> => {
  const userId: string = req.userId;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const startDate = sevenDaysAgo.toISOString().split("T")[0];
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const [weekMoods, allMoods, journalEntries, convos] = await Promise.all([
    db.select().from(moodsTable).where(and(eq(moodsTable.userId, userId), gte(moodsTable.date, startDate))),
    db.select({ date: moodsTable.date }).from(moodsTable).where(eq(moodsTable.userId, userId)).orderBy(desc(moodsTable.date)),
    db.select().from(journalTable).where(eq(journalTable.userId, userId)),
    db.select().from(conversations).where(eq(conversations.userId, userId)),
  ]);

  const weeklyAverageMood = weekMoods.length
    ? weekMoods.reduce((a, b) => a + b.score, 0) / weekMoods.length
    : 0;

  // Streak calculation
  const uniqueDates = [...new Set(allMoods.map((m) => m.date))].sort().reverse();
  let currentStreak = 0;
  let prev: Date | null = null;
  for (const dateStr of uniqueDates) {
    const d = new Date(dateStr);
    if (!prev) {
      if (dateStr === today || dateStr === yesterday) { currentStreak = 1; prev = d; }
      else break;
    } else {
      const diff = (prev.getTime() - d.getTime()) / 86400000;
      if (diff === 1) { currentStreak++; prev = d; }
      else break;
    }
  }

  // Wellness score for today
  const todayMoods = weekMoods.filter((m) => m.date === today);
  const moodScore = todayMoods.length ? Math.round((todayMoods.reduce((a, b) => a + b.score, 0) / todayMoods.length) * 10) : 0;
  const hasJournal = journalEntries.some((j) => j.createdAt.toISOString().startsWith(today));
  const wellnessScore = Math.min(100, moodScore + (hasJournal ? 25 : 0));

  // Top mood this week
  const moodCounts: Record<string, { count: number; emoji: string }> = {};
  for (const m of weekMoods) {
    if (!moodCounts[m.mood]) moodCounts[m.mood] = { count: 0, emoji: m.emoji };
    moodCounts[m.mood].count++;
  }
  const topMoodEntry = Object.entries(moodCounts).sort((a, b) => b[1].count - a[1].count)[0];

  res.json({
    weeklyAverageMood: Math.round(weeklyAverageMood * 10) / 10,
    currentStreak,
    journalCount: journalEntries.length,
    wellnessScore,
    conversationCount: convos.length,
    topMood: topMoodEntry?.[0] ?? null,
    topEmoji: topMoodEntry?.[1].emoji ?? null,
  });
});

router.get("/dashboard/activity", requireAuth, async (req: any, res): Promise<void> => {
  const userId: string = req.userId;

  const [recentMoods, recentJournal] = await Promise.all([
    db.select().from(moodsTable).where(eq(moodsTable.userId, userId)).orderBy(desc(moodsTable.createdAt)).limit(5),
    db.select().from(journalTable).where(eq(journalTable.userId, userId)).orderBy(desc(journalTable.createdAt)).limit(5),
  ]);

  const activity = [
    ...recentMoods.map((m) => ({
      id: `mood-${m.id}`,
      type: "mood",
      description: `Logged mood: ${m.mood}`,
      timestamp: m.createdAt.toISOString(),
      emoji: m.emoji,
    })),
    ...recentJournal.map((j) => ({
      id: `journal-${j.id}`,
      type: "journal",
      description: `Journal: ${j.title}`,
      timestamp: j.createdAt.toISOString(),
      emoji: "📝",
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  res.json(activity);
});

export default router;
