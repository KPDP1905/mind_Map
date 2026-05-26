import { pgTable, serial, text, integer, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const moodsTable = pgTable("moods", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  mood: text("mood").notNull(),
  emoji: text("emoji").notNull(),
  score: integer("score").notNull(),
  note: text("note"),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMoodSchema = createInsertSchema(moodsTable).omit({ id: true, createdAt: true });
export type InsertMood = z.infer<typeof insertMoodSchema>;
export type Mood = typeof moodsTable.$inferSelect;
