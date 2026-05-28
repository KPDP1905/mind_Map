import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, affirmationsTable, wellnessExercisesTable, gratitudeTable, moodsTable, journalTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { CreateGratitudeEntryBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/wellness/affirmations", async (_req, res): Promise<void> => {
  const items = await db.select().from(affirmationsTable).orderBy(affirmationsTable.id);
  res.json(items);
});

router.get("/wellness/affirmations/daily", async (_req, res): Promise<void> => {
  const items = await db.select().from(affirmationsTable);
  if (!items.length) {
    res.json({ id: 0, text: "You are enough.", category: "general", createdAt: new Date().toISOString() });
    return;
  }
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const affirmation = items[dayOfYear % items.length];
  res.json(affirmation);
});

router.get("/wellness/exercises", async (req, res): Promise<void> => {
  const type = req.query.type as string | undefined;
  const query = db.select().from(wellnessExercisesTable);
  const exercises = type
    ? await db.select().from(wellnessExercisesTable).where(eq(wellnessExercisesTable.type, type))
    : await db.select().from(wellnessExercisesTable);
  res.json(exercises);
});

router.get("/wellness/gratitude", requireAuth, async (req: any, res): Promise<void> => {
  const entries = await db.select().from(gratitudeTable).where(eq(gratitudeTable.userId, req.userId)).orderBy(desc(gratitudeTable.createdAt));
  res.json(entries);
});

router.post("/wellness/gratitude", requireAuth, async (req: any, res): Promise<void> => {
  const parsed = CreateGratitudeEntryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [entry] = await db.insert(gratitudeTable).values({ ...parsed.data, userId: req.userId }).returning();
  res.status(201).json(entry);
});

router.get("/wellness/score", requireAuth, async (req: any, res): Promise<void> => {
  const userId: string = req.userId;
  const today = new Date().toISOString().split("T")[0];

  const [moodToday, journalToday, gratitudeToday] = await Promise.all([
    db.select().from(moodsTable).where(eq(moodsTable.userId, userId)),
    db.select().from(journalTable).where(eq(journalTable.userId, userId)),
    db.select().from(gratitudeTable).where(eq(gratitudeTable.userId, userId)),
  ]);

  const todayMoods = moodToday.filter((m) => m.date === today);
  const moodScore = todayMoods.length ? Math.round((todayMoods.reduce((a, b) => a + b.score, 0) / todayMoods.length) * 10) : 0;
  const journalScore = journalToday.some((j) => j.createdAt.toISOString().startsWith(today)) ? 25 : 0;
  const gratitudeScore = gratitudeToday.some((g) => g.createdAt.toISOString().startsWith(today)) ? 25 : 0;
  const exerciseScore = 0; // future: track exercise completions

  const score = Math.min(100, moodScore + journalScore + gratitudeScore + exerciseScore);

  res.json({
    score,
    components: { moodScore, journalScore, gratitudeScore, exerciseScore },
    date: today,
  });
});

export default router;
