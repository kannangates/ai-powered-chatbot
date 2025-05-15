import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Chatbot related schemas

export type Message = {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: Date;
};

export type WebContent = {
  url: string;
  content: string;
  title: string;
  timestamp: Date;
};

export type ContentVector = {
  id: string;
  content: string;
  url: string;
  title: string;
  vector: number[];
};

export type ChatSettings = {
  apiProvider: "openai" | "gemini";
  apiKey: string;
  websiteUrl: string;
  modelName?: string;
};

export const chatMessageSchema = z.object({
  content: z.string(),
  role: z.enum(["user", "assistant", "system"]),
});

export type ChatMessageRequest = z.infer<typeof chatMessageSchema>;

export const chatSettingsSchema = z.object({
  apiProvider: z.enum(["openai", "gemini"]),
  apiKey: z.string(),
  websiteUrl: z.string().url(),
  modelName: z.string().optional(),
});

export const scrapeRequestSchema = z.object({
  url: z.string().url(),
});
