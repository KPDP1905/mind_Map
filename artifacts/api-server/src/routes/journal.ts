import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, journalTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { CreateJournalEntryBody, UpdateJournalEntryBody, UpdateJournalEntryParams, GetJournalEntryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/journal", requireAuth, async (req: any, res): Promise<void> => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
  const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
  const entries = await db
    .select()
    .from(journalTable)
    .where(eq(journalTable.userId, req.userId))
    .orderBy(desc(journalTable.createdAt))
    .limit(limit)
    .offset(offset);
  res.json(entries);
});

router.post("/journal", requireAuth, async (req: any, res): Promise<void> => {
  const parsed = CreateJournalEntryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const now = new Date();
  const [entry] = await db.insert(journalTable).values({ ...parsed.data, userId: req.userId, updatedAt: now }).returning();
  res.status(201).json(entry);
});

router.get("/journal/:id", requireAuth, async (req: any, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [entry] = await db.select().from(journalTable).where(and(eq(journalTable.id, id), eq(journalTable.userId, req.userId)));
  if (!entry) { res.status(404).json({ error: "Not found" }); return; }
  res.json(entry);
});

router.patch("/journal/:id", requireAuth, async (req: any, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const parsed = UpdateJournalEntryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [entry] = await db.update(journalTable).set({ ...parsed.data, updatedAt: new Date() }).where(and(eq(journalTable.id, id), eq(journalTable.userId, req.userId))).returning();
  if (!entry) { res.status(404).json({ error: "Not found" }); return; }
  res.json(entry);
});

router.delete("/journal/:id", requireAuth, async (req: any, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [entry] = await db.delete(journalTable).where(and(eq(journalTable.id, id), eq(journalTable.userId, req.userId))).returning();
  if (!entry) { res.status(404).json({ error: "Not found" }); return; }
  res.sendStatus(204);
});

export default router;
