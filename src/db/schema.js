import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const requestLogs = pgTable("request_logs", {
  id: serial("id").primaryKey(),
  method: text("method").notNull(),
  url: text("url").notNull(),
  ip: text("ip").notNull(),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
