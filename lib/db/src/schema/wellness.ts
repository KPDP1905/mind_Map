import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const affirmationsTable = pgTable("affirmations", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  category: text("category").notNull().default("general"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wellnessExercisesTable = pgTable("wellness_exercises", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // breathing | cbt | gratitude
  title: text("title").notNull(),
  description: text("description").notNull(),
  durationSeconds: integer("duration_seconds").notNull().default(60),
  steps: text("steps").notNull(), // JSON string of steps array
});

export const gratitudeTable = pgTable("gratitude_entries", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAffirmationSchema = createInsertSchema(affirmationsTable).omit({ id: true, createdAt: true });
export type InsertAffirmation = z.infer<typeof insertAffirmationSchema>;
export type Affirmation = typeof affirmationsTable.$inferSelect;

export const insertWellnessExerciseSchema = createInsertSchema(wellnessExercisesTable).omit({ id: true });
export type InsertWellnessExercise = z.infer<typeof insertWellnessExerciseSchema>;
export type WellnessExercise = typeof wellnessExercisesTable.$inferSelect;

export const insertGratitudeSchema = createInsertSchema(gratitudeTable).omit({ id: true, createdAt: true });
export type InsertGratitude = z.infer<typeof insertGratitudeSchema>;
export type GratitudeEntry = typeof gratitudeTable.$inferSelect;
