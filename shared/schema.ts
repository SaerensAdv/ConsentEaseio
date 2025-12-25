import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatarUrl: text("avatar_url"),
  plan: text("plan").notNull().default("solo"), // solo, pro, agency
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Websites table
export const websites = pgTable("websites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  publicId: text("public_id").notNull().unique(), // e.g., "83xh5b9n0we3"
  domain: text("domain").notNull(),
  status: text("status").notNull().default("pending"), // pending, scanning, compliant, attention
  lastScan: timestamp("last_scan"),
  cookiesFound: integer("cookies_found").default(0),
  scriptsFound: integer("scripts_found").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWebsiteSchema = createInsertSchema(websites).omit({ id: true, createdAt: true });
export type InsertWebsite = z.infer<typeof insertWebsiteSchema>;
export type Website = typeof websites.$inferSelect;

// Banner configurations table
export const bannerConfigs = pgTable("banner_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  websiteId: varchar("website_id").notNull().references(() => websites.id, { onDelete: "cascade" }),
  heading: text("heading").notNull().default("We value your privacy"),
  description: text("description").notNull(),
  acceptText: text("accept_text").notNull().default("Accept All"),
  rejectText: text("reject_text").notNull().default("Reject All"),
  settingsText: text("settings_text").notNull().default("Preferences"),
  position: text("position").notNull().default("bottom-left"),
  theme: text("theme").notNull().default("light"),
  primaryColor: text("primary_color").notNull().default("#726CEA"),
  backgroundColor: text("background_color").notNull().default("#ffffff"),
  textColor: text("text_color").notNull().default("#1e1e1e"),
  borderRadius: integer("border_radius").notNull().default(12),
  showIcon: boolean("show_icon").notNull().default(true),
  fontFamily: text("font_family").notNull().default("Inter"),
  fontSize: text("font_size").notNull().default("medium"),
  shadow: text("shadow").notNull().default("medium"),
  backdropBlur: boolean("backdrop_blur").notNull().default(true),
  animation: text("animation").notNull().default("slide-up"),
  buttonStyle: text("button_style").notNull().default("filled"),
  buttonShape: text("button_shape").notNull().default("rounded"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBannerConfigSchema = createInsertSchema(bannerConfigs).omit({ id: true, updatedAt: true });
export type InsertBannerConfig = z.infer<typeof insertBannerConfigSchema>;
export type BannerConfig = typeof bannerConfigs.$inferSelect;

// Analytics events table
export const analyticsEvents = pgTable("analytics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  websiteId: varchar("website_id").notNull().references(() => websites.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(), // banner_shown, accept, reject, settings_click
  country: text("country"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({ id: true, timestamp: true });
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
