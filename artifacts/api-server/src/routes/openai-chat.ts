import { Router, type IRouter } from "express";
import { eq, and, asc } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { db, conversations, messages } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  CreateOpenaiConversationBody,
  SendOpenaiMessageBody,
  GetOpenaiConversationParams,
  DeleteOpenaiConversationParams,
  ListOpenaiMessagesParams,
  SendOpenaiMessageParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  if (!auth?.userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  req.userId = auth.userId;
  next();
};

const SYSTEM_PROMPT = `You are Mind Mitra, a compassionate and empathetic AI psychology support assistant designed for students and young adults. Your role is to:
- Listen actively and validate feelings without judgment
- Offer supportive, evidence-based coping strategies (CBT, mindfulness, breathing)
- Help users reflect on their emotions and thought patterns
- Encourage healthy habits and self-care
- Always respond with warmth, understanding, and encouragement

IMPORTANT DISCLAIMER: You are a supportive tool, not a replacement for professional mental health care. If a user expresses thoughts of self-harm, crisis, or severe distress, always encourage them to contact a mental health professional, call a crisis hotline (like 988 in the US), or reach emergency services immediately.

Keep responses concise (2-4 paragraphs max), warm, and actionable.`;

router.get("/openai/conversations", requireAuth, async (req: any, res): Promise<void> => {
  const convos = await db.select().from(conversations).where(eq(conversations.userId, req.userId));
  res.json(convos);
});

router.post("/openai/conversations", requireAuth, async (req: any, res): Promise<void> => {
  const parsed = CreateOpenaiConversationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [convo] = await db.insert(conversations).values({ title: parsed.data.title, userId: req.userId }).returning();
  res.status(201).json(convo);
});

router.get("/openai/conversations/:id", requireAuth, async (req: any, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [convo] = await db.select().from(conversations).where(and(eq(conversations.id, id), eq(conversations.userId, req.userId)));
  if (!convo) { res.status(404).json({ error: "Not found" }); return; }
  const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(asc(messages.createdAt));
  res.json({ ...convo, messages: msgs });
});

router.delete("/openai/conversations/:id", requireAuth, async (req: any, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [convo] = await db.delete(conversations).where(and(eq(conversations.id, id), eq(conversations.userId, req.userId))).returning();
  if (!convo) { res.status(404).json({ error: "Not found" }); return; }
  res.sendStatus(204);
});

router.get("/openai/conversations/:id/messages", requireAuth, async (req: any, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const [convo] = await db.select().from(conversations).where(and(eq(conversations.id, id), eq(conversations.userId, req.userId)));
  if (!convo) { res.status(404).json({ error: "Not found" }); return; }
  const msgs = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(asc(messages.createdAt));
  res.json(msgs);
});

router.post("/openai/conversations/:id/messages", requireAuth, async (req: any, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const parsed = SendOpenaiMessageBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [convo] = await db.select().from(conversations).where(and(eq(conversations.id, id), eq(conversations.userId, req.userId)));
  if (!convo) { res.status(404).json({ error: "Not found" }); return; }

  // Save user message
  await db.insert(messages).values({ conversationId: id, role: "user", content: parsed.data.content });

  // Get conversation history
  const history = await db.select().from(messages).where(eq(messages.conversationId, id)).orderBy(asc(messages.createdAt));
  const chatMessages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 8192,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // Save assistant message
    await db.insert(messages).values({ conversationId: id, role: "assistant", content: fullResponse });
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: "AI service error" })}\n\n`);
  }

  res.end();
});

export default router;
