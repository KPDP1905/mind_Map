import { Router, type IRouter } from "express";
import { eq, and, asc } from "drizzle-orm";
import { db, conversations, messages } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { requireAuth } from "../middlewares/requireAuth";
import {
  CreateOpenaiConversationBody,
  SendOpenaiMessageBody,
  GetOpenaiConversationParams,
  DeleteOpenaiConversationParams,
  ListOpenaiMessagesParams,
  SendOpenaiMessageParams,
} from "@workspace/api-zod";

const router: IRouter = Router();


const SYSTEM_PROMPT = `You are Calmora, a compassionate AI mental wellness companion built for students and young adults. You communicate like a warm, empathetic human friend who happens to have deep knowledge of psychology and mental health.

Your conversation style:
- Talk naturally and conversationally, like a caring friend — not clinical or robotic
- Use "I" statements, ask follow-up questions, show genuine curiosity about the user
- Validate emotions first before offering advice ("That sounds really hard..." / "I completely understand why you'd feel that way...")
- Share relevant coping strategies from CBT, mindfulness, and positive psychology naturally in conversation
- Use occasional emojis to feel warm (not excessive)
- Keep responses focused — 1-3 short paragraphs max, never lecture

Topics you handle:
- Stress, anxiety, depression, loneliness, relationship issues, self-esteem
- Academic pressure, career anxiety, imposter syndrome
- Sleep issues, motivation, procrastination, burnout
- Grief, trauma processing, family conflicts
- Self-care, habit building, mindfulness practices

CRITICAL SAFETY: If someone expresses thoughts of self-harm, suicide, or is in crisis, immediately and compassionately urge them to call iCall (India): 9152987821 or Vandrevala Foundation: 1860-2662-345 (24/7), or go to their nearest emergency room. Say this clearly before anything else.

Remember: You are a supportive companion, not a replacement for professional therapy. Gently recommend professional help when issues seem serious or persistent.`;

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

router.post("/journal/analyze", requireAuth, async (req: any, res): Promise<void> => {
  const { title, content } = req.body;
  if (!content || typeof content !== "string") {
    res.status(400).json({ error: "Content required" });
    return;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `You are Calmora, a compassionate AI mental wellness companion. Analyze the journal entry and respond with a JSON object containing:
- "insight": A warm, empathetic 1-2 sentence reflection on what the person seems to be experiencing emotionally
- "cognitive_patterns": An array of 2-4 cognitive patterns you notice (e.g., "Catastrophizing", "All-or-nothing thinking", "Self-criticism", "Rumination")
- "suggestions": An array of 2-3 practical, gentle suggestions to help the person
- "affirmation": A single warm affirmation sentence tailored to their situation

Respond ONLY with valid JSON. Be compassionate, non-judgmental, and concise.`
        },
        {
          role: "user",
          content: `Journal entry title: "${title}"\n\nContent:\n${content}`
        }
      ],
    });

    const raw = completion.choices[0]?.message?.content || "{}";
    try {
      const parsed = JSON.parse(raw);
      res.json(parsed);
    } catch {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        res.json(JSON.parse(jsonMatch[0]));
      } else {
        res.json({ insight: "Thank you for sharing your thoughts. Keep writing — it's a powerful tool for self-understanding.", cognitive_patterns: [], suggestions: ["Be kind to yourself today", "Take a few deep breaths", "Reach out to someone you trust"], affirmation: "You are doing better than you think. 💛" });
      }
    }
  } catch (err) {
    res.status(500).json({ error: "AI service error" });
  }
});

export default router;
