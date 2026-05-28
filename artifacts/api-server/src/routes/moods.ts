import { Router, type IRouter } from "express";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { db, moodsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import {
  CreateMoodBody,
  UpdateMoodBody,
  UpdateMoodParams,
  GetMoodParams,
  DeleteMoodParams,
  ListMoodsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/moods", requireAuth, async (req: any, res): Promise<void> => {
  const parsed = ListMoodsQueryParams.safeParse(req.query);
  const userId: string = req.userId;

  const conditions = [eq(moodsTable.userId, userId)];
  if (parsed.success) {
    if (parsed.data.startDate) conditions.push(gte(moodsTable.date, parsed.data.startDate));
    if (parsed.data.endDate) conditions.push(lte(moodsTable.date, parsed.data.endDate));
  }

  const moods = await db
    .select()
    .from(moodsTable)
    .where(and(...conditions))
    .orderBy(desc(moodsTable.createdAt))
    .limit(parsed.success && parsed.data.limit ? parsed.data.limit : 100)
    .offset(parsed.success && parsed.data.offset ? parsed.data.offset : 0);

  res.json(moods);
});

router.post("/moods", requireAuth, async (req: any, res): Promise<void> => {
  const parsed = CreateMoodBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { date, ...rest } = parsed.data;
  const [mood] = await db
    .insert(moodsTable)
    .values({
      ...rest,
      date: date instanceof Date ? date.toISOString().split("T")[0] : (date as string),
      userId: req.userId,
    })
    .returning();

  res.status(201).json(mood);
});

router.get("/moods/analytics/weekly", requireAuth, async (req: any, res): Promise<void> => {
  const userId: string = req.userId;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const startDate = sevenDaysAgo.toISOString().split("T")[0];

  const entries = await db
    .select()
    .from(moodsTable)
    .where(and(eq(moodsTable.userId, userId), gte(moodsTable.date, startDate)))
    .orderBy(moodsTable.date);

  // Build 7-day map
  const days: Record<string, { scores: number[]; mood: string | null; emoji: string | null }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    days[dateStr] = { scores: [], mood: null, emoji: null };
  }

  for (const entry of entries) {
    const d = entry.date;
    if (days[d]) {
      days[d].scores.push(entry.score);
      days[d].mood = entry.mood;
      days[d].emoji = entry.emoji;
    }
  }

  const dayResults = Object.entries(days).map(([date, data]) => ({
    date,
    averageScore: data.scores.length ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length : 0,
    mood: data.mood,
    emoji: data.emoji,
  }));

  const allScores = entries.map((e) => e.score);
  const averageScore = allScores.length ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;

  // Most frequent mood
  const moodCounts: Record<string, number> = {};
  for (const e of entries) {
    moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
  }
  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  res.json({ days: dayResults, averageScore, dominantMood, totalEntries: entries.length });
});

router.get("/moods/analytics/streak", requireAuth, async (req: any, res): Promise<void> => {
  const userId: string = req.userId;

  const entries = await db
    .select({ date: moodsTable.date })
    .from(moodsTable)
    .where(eq(moodsTable.userId, userId))
    .orderBy(desc(moodsTable.date));

  if (!entries.length) {
    res.json({ currentStreak: 0, longestStreak: 0, lastLoggedDate: null });
    return;
  }

  const uniqueDates = [...new Set(entries.map((e) => e.date))].sort().reverse();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 0;
  let prev: Date | null = null;

  for (const dateStr of uniqueDates) {
    const d = new Date(dateStr);
    if (!prev) {
      streak = 1;
      if (dateStr === today || dateStr === yesterday) currentStreak = 1;
    } else {
      const diff = (prev.getTime() - d.getTime()) / 86400000;
      if (diff === 1) {
        streak++;
        if (currentStreak > 0) currentStreak++;
      } else {
        streak = 1;
        if (currentStreak > 0) break;
      }
    }
    prev = d;
    if (streak > longestStreak) longestStreak = streak;
  }

  res.json({ currentStreak, longestStreak, lastLoggedDate: uniqueDates[0] ?? null });
});

router.get("/moods/:id", requireAuth, async (req: any, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [mood] = await db.select().from(moodsTable).where(and(eq(moodsTable.id, id), eq(moodsTable.userId, req.userId)));
  if (!mood) { res.status(404).json({ error: "Not found" }); return; }
  res.json(mood);
});

router.patch("/moods/:id", requireAuth, async (req: any, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const parsed = UpdateMoodBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [mood] = await db.update(moodsTable).set(parsed.data).where(and(eq(moodsTable.id, id), eq(moodsTable.userId, req.userId))).returning();
  if (!mood) { res.status(404).json({ error: "Not found" }); return; }
  res.json(mood);
});

router.delete("/moods/:id", requireAuth, async (req: any, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [mood] = await db.delete(moodsTable).where(and(eq(moodsTable.id, id), eq(moodsTable.userId, req.userId))).returning();
  if (!mood) { res.status(404).json({ error: "Not found" }); return; }
  res.sendStatus(204);
});

export default router;
