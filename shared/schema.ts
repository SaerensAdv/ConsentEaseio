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
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status").default("none"), // none, active, past_due, canceled, unpaid, trialing
  subscriptionEndDate: timestamp("subscription_end_date"), // When subscription ends (for canceled subscriptions)
  emailVerified: boolean("email_verified").notNull().default(false),
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
  clarityProjectId: text("clarity_project_id"), // Microsoft Clarity integration
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
  description: text("description").notNull().default("We use cookies to enhance your browsing experience and analyze site traffic. By clicking \"Accept All\", you consent to our use of cookies."),
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
  // New styling options
  borderColor: text("border_color").default("#e5e7eb"),
  borderWidth: integer("border_width").default(1),
  secondaryButtonColor: text("secondary_button_color").default("#6b7280"),
  maxWidth: integer("max_width").default(400),
  showOverlay: boolean("show_overlay").default(false),
  overlayOpacity: integer("overlay_opacity").default(50),
  logoUrl: text("logo_url"),
  // Behavior options
  displayDelay: integer("display_delay").default(0),
  autoHideDelay: integer("auto_hide_delay"),
  showCloseButton: boolean("show_close_button").default(false),
  reconsentDays: integer("reconsent_days").default(365),
  respectDnt: boolean("respect_dnt").default(false),
  // Links & content
  privacyPolicyUrl: text("privacy_policy_url"),
  privacyPolicyText: text("privacy_policy_text").default("Privacy Policy"),
  cookiePolicyUrl: text("cookie_policy_url"),
  cookiePolicyText: text("cookie_policy_text").default("Cookie Policy"),
  customFooter: text("custom_footer"),
  // Multi-language
  language: text("language").default("en"),
  translations: text("translations"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBannerConfigSchema = createInsertSchema(bannerConfigs).omit({ id: true, updatedAt: true });
export type InsertBannerConfig = z.infer<typeof insertBannerConfigSchema>;
export type BannerConfig = typeof bannerConfigs.$inferSelect;

// Password reset tokens table
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;

// Email verification tokens table
export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;

// Cookie categories table
export const cookieCategories = pgTable("cookie_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  websiteId: varchar("website_id").notNull().references(() => websites.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // necessary, functional, analytics, marketing, or custom
  displayName: text("display_name").notNull(), // "Necessary Cookies", "Analytics Cookies", etc.
  description: text("description").notNull(), // Shown to visitors in consent modal
  isRequired: boolean("is_required").notNull().default(false), // true for necessary cookies
  isEnabled: boolean("is_enabled").notNull().default(true), // whether this category is active
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCookieCategorySchema = createInsertSchema(cookieCategories).omit({ id: true, createdAt: true });
export type InsertCookieCategory = z.infer<typeof insertCookieCategorySchema>;
export type CookieCategory = typeof cookieCategories.$inferSelect;

// Cookies table
export const cookies = pgTable("cookies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  websiteId: varchar("website_id").notNull().references(() => websites.id, { onDelete: "cascade" }),
  categoryId: varchar("category_id").notNull().references(() => cookieCategories.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // cookie name, e.g., "_ga"
  provider: text("provider"), // e.g., "Google Analytics"
  purpose: text("purpose").notNull(), // description of what the cookie does
  expiry: text("expiry"), // e.g., "2 years", "Session"
  type: text("type").notNull().default("first-party"), // first-party, third-party
  isAutoDetected: boolean("is_auto_detected").notNull().default(false), // from scanner vs manual
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCookieSchema = createInsertSchema(cookies).omit({ id: true, createdAt: true });
export type InsertCookie = z.infer<typeof insertCookieSchema>;
export type Cookie = typeof cookies.$inferSelect;

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

// Consent proof logs table - for compliance documentation
export const consentLogs = pgTable("consent_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  websiteId: varchar("website_id").notNull().references(() => websites.id, { onDelete: "cascade" }),
  visitorId: text("visitor_id").notNull(), // Anonymized visitor identifier (hashed)
  action: text("action").notNull(), // accept_all, reject_all, custom
  ipHash: text("ip_hash"), // SHA-256 hashed IP for privacy compliance
  userAgent: text("user_agent"),
  country: text("country"),
  region: text("region"),
  consentChoices: text("consent_choices").notNull(), // JSON string: {"necessary":true,"analytics":true,"marketing":false}
  bannerVersion: text("banner_version"), // Version of the banner shown
  policyVersion: text("policy_version"), // Privacy policy version at time of consent
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"), // When this consent expires (typically 1 year)
});

export const insertConsentLogSchema = createInsertSchema(consentLogs).omit({ id: true, timestamp: true });
export type InsertConsentLog = z.infer<typeof insertConsentLogSchema>;
export type ConsentLog = typeof consentLogs.$inferSelect;

// Web Vitals metrics table
export const webVitalsMetrics = pgTable("web_vitals_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  websiteId: varchar("website_id").notNull().references(() => websites.id, { onDelete: "cascade" }),
  lcp: integer("lcp"), // Largest Contentful Paint in ms
  cls: decimal("cls", { precision: 6, scale: 4 }), // Cumulative Layout Shift (0.xxx)
  inp: integer("inp"), // Interaction to Next Paint in ms
  fcp: integer("fcp"), // First Contentful Paint in ms
  ttfb: integer("ttfb"), // Time to First Byte in ms
  bannerDelay: integer("banner_delay"), // Time from banner shown to user interaction in ms
  country: text("country"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertWebVitalsMetricSchema = createInsertSchema(webVitalsMetrics).omit({ id: true, timestamp: true });
export type InsertWebVitalsMetric = z.infer<typeof insertWebVitalsMetricSchema>;
export type WebVitalsMetric = typeof webVitalsMetrics.$inferSelect;

// Diagnostic scans table - for implementation verification
export const diagnosticScans = pgTable("diagnostic_scans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  websiteId: varchar("website_id").notNull().references(() => websites.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"), // pending, running, completed, failed
  consentModeDetected: boolean("consent_mode_detected"),
  consentModeVersion: text("consent_mode_version"), // v1, v2
  defaultConsentSet: boolean("default_consent_set"),
  updateConsentCalled: boolean("update_consent_called"),
  gtmDetected: boolean("gtm_detected"),
  gtagDetected: boolean("gtag_detected"),
  bannerScriptDetected: boolean("banner_script_detected"),
  bannerScriptVersion: text("banner_script_version"),
  issues: text("issues"), // JSON array of issues found
  recommendations: text("recommendations"), // JSON array of recommendations
  rawData: text("raw_data"), // Full diagnostic data as JSON
  scannedAt: timestamp("scanned_at").notNull().defaultNow(),
});

export const insertDiagnosticScanSchema = createInsertSchema(diagnosticScans).omit({ id: true, scannedAt: true });
export type InsertDiagnosticScan = z.infer<typeof insertDiagnosticScanSchema>;
export type DiagnosticScan = typeof diagnosticScans.$inferSelect;

// Agencies table - Partner agencies that manage multiple client accounts
export const agencies = pgTable("agencies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // URL-friendly identifier, e.g., "getlead"
  description: text("description"),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  contactEmail: text("contact_email"),
  // Owner user (agency admin)
  ownerId: varchar("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Spotlight/Featured settings
  isFeatured: boolean("is_featured").default(false),
  featuredOrder: integer("featured_order").default(0),
  heroText: text("hero_text"), // Tagline for spotlight
  // Stats (cached for performance)
  clientCount: integer("client_count").default(0),
  totalWebsites: integer("total_websites").default(0),
  // Status
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAgencySchema = createInsertSchema(agencies).omit({ id: true, createdAt: true, clientCount: true, totalWebsites: true });
export type InsertAgency = z.infer<typeof insertAgencySchema>;
export type Agency = typeof agencies.$inferSelect;

// Agency clients table - Links user accounts to agencies
export const agencyClients = pgTable("agency_clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agencyId: varchar("agency_id").notNull().references(() => agencies.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Client metadata
  clientName: text("client_name"), // Optional display name within agency
  notes: text("notes"), // Internal notes for agency
  // Relationship type
  relationshipType: text("relationship_type").notNull().default("managed"), // managed, lifetime, referred
  // Status
  status: text("status").notNull().default("active"), // active, suspended, churned
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAgencyClientSchema = createInsertSchema(agencyClients).omit({ id: true, createdAt: true });
export type InsertAgencyClient = z.infer<typeof insertAgencyClientSchema>;
export type AgencyClient = typeof agencyClients.$inferSelect;

// Agency team members table - Additional users who can manage agency
export const agencyMembers = pgTable("agency_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agencyId: varchar("agency_id").notNull().references(() => agencies.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"), // owner, admin, member
  invitedBy: varchar("invited_by").references(() => users.id),
  invitedAt: timestamp("invited_at").notNull().defaultNow(),
  acceptedAt: timestamp("accepted_at"),
});

export const insertAgencyMemberSchema = createInsertSchema(agencyMembers).omit({ id: true, invitedAt: true });
export type InsertAgencyMember = z.infer<typeof insertAgencyMemberSchema>;
export type AgencyMember = typeof agencyMembers.$inferSelect;

// Agency invites table - Pending invites for clients or team members
export const agencyInvites = pgTable("agency_invites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agencyId: varchar("agency_id").notNull().references(() => agencies.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  inviteType: text("invite_type").notNull(), // client, team_member
  role: text("role"), // For team members: admin, member
  invitedBy: varchar("invited_by").notNull().references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAgencyInviteSchema = createInsertSchema(agencyInvites).omit({ id: true, createdAt: true });
export type InsertAgencyInvite = z.infer<typeof insertAgencyInviteSchema>;
export type AgencyInvite = typeof agencyInvites.$inferSelect;
