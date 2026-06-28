import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal, index, uniqueIndex } from "drizzle-orm/pg-core";
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
  pendingEmail: text("pending_email"), // New email awaiting verification
  pendingEmailToken: text("pending_email_token"), // Token for email change verification
  pendingEmailExpires: timestamp("pending_email_expires"), // Expiry for pending email token
  trialEndsAt: timestamp("trial_ends_at"), // When trial period ends (7 days after registration for solo plan)
  trialReminderSent: boolean("trial_reminder_sent").default(false), // Whether trial expiry reminder was sent
  billingInterval: text("billing_interval"), // monthly, yearly — current subscription billing interval
  pastDueSince: timestamp("past_due_since"), // When subscription first entered past_due status (for auto-downgrade after grace period)
  paymentFailureEmailSent: boolean("payment_failure_email_sent").default(false), // Whether payment failure notification was sent
  companyName: text("company_name"),
  vatNumber: text("vat_number"),
  billingCountry: text("billing_country"),
  isDemo: boolean("is_demo").notNull().default(false), // Throwaway account from public /demo entry
  demoExpiresAt: timestamp("demo_expires_at"), // When this demo account is eligible for cleanup
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
  subscriptionType: text("subscription_type").default("free"), // free, monthly, yearly, lifetime, upgrade_needed
  subscriptionEndDate: timestamp("subscription_end_date"), // For yearly/monthly subscriptions
  excludedPaths: text("excluded_paths").array(), // Paths/subdomains to exclude from analytics (e.g., ["/admin", "/wp-admin", "staging."])
  allowedDomains: text("allowed_domains").array(), // Extra allowed domains beyond the primary domain (e.g., ["staging.example.com", "dev.example.com"])
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWebsiteSchema = createInsertSchema(websites, {
  domain: z.string()
    .min(1, "Domain is required")
    .transform(val => val.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0])
    .refine(val => {
      if (val.includes("://")) return false;
      return /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,63}$/.test(val);
    }, {
      message: "Please enter domain without protocol (e.g., 'example.com' instead of 'https://example.com')"
    }),
}).omit({ id: true, createdAt: true });
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
  // Layout options
  buttonLayout: text("button_layout").default("auto"),
  headingFontSize: text("heading_font_size").default("medium"),
  descriptionFontSize: text("description_font_size").default("medium"),
  fontWeight: text("font_weight").default("medium"),
  // Multi-language
  language: text("language").default("en"),
  autoDetectLanguage: boolean("auto_detect_language").default(false),
  translations: text("translations"),
  excludedPaths: text("excluded_paths").array().default([]),
  showRevisitButton: boolean("show_revisit_button").default(true),
  revisitButtonPosition: text("revisit_button_position").default("bottom-left"),
  revisitButtonColor: text("revisit_button_color"),
  revisitButtonLogoUrl: text("revisit_button_logo_url"),
  revisitButtonShape: text("revisit_button_shape").default("circle"),
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
  sourceUrl: text("source_url"), // URL where cookie was detected during scan
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  websiteIdx: index("cookies_website_idx").on(t.websiteId),
  categoryIdx: index("cookies_category_idx").on(t.categoryId),
}));

export const insertCookieSchema = createInsertSchema(cookies).omit({ id: true, createdAt: true });
export type InsertCookie = z.infer<typeof insertCookieSchema>;
export type Cookie = typeof cookies.$inferSelect;

// Analytics events table
export const analyticsEvents = pgTable("analytics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  websiteId: varchar("website_id").notNull().references(() => websites.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(), // banner_shown, accept, reject, settings_click
  country: text("country"),
  deviceType: text("device_type"), // desktop, mobile, tablet
  browser: text("browser"), // Chrome, Firefox, Safari, Edge, etc.
  timestamp: timestamp("timestamp").notNull().defaultNow(),
}, (t) => ({
  websiteTimestampIdx: index("analytics_events_website_timestamp_idx")
    .on(t.websiteId, t.timestamp.desc()),
  websiteEventIdx: index("analytics_events_website_event_idx")
    .on(t.websiteId, t.eventType),
}));

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({ id: true, timestamp: true });
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;

// Per-user, per-month banner-view counter. We previously COUNT(*)'d analytics_events
// every banner_shown — at 160k+ rows that's a hot scan AND it races: two concurrent
// banner_shown inserts can both see "currentViews < limit" and both succeed past the
// cap. This dedicated counter table lets us atomically INSERT…ON CONFLICT DO UPDATE
// and read the post-increment value in one round-trip.
//
// `monthKey` is UTC YYYY-MM so the cycle is the same for every customer and matches
// our billing month. Reset = no-op (a new row gets created on the first event of the
// new month).
export const monthlyViewCounters = pgTable("monthly_view_counters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  monthKey: text("month_key").notNull(), // "YYYY-MM" in UTC
  count: integer("count").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  // Composite uniqueness drives the ON CONFLICT target.
  userMonthIdx: uniqueIndex("monthly_view_counters_user_month_unique")
    .on(t.userId, t.monthKey),
}));

export type MonthlyViewCounter = typeof monthlyViewCounters.$inferSelect;

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
}, (t) => ({
  websiteTimestampIdx: index("consent_logs_website_timestamp_idx")
    .on(t.websiteId, t.timestamp.desc()),
  visitorIdx: index("consent_logs_visitor_idx").on(t.visitorId),
}));

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
}, (t) => ({
  websiteTimestampIdx: index("web_vitals_website_timestamp_idx")
    .on(t.websiteId, t.timestamp.desc()),
}));

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
  status: text("status").notNull().default("pending"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAgencyInviteSchema = createInsertSchema(agencyInvites).omit({ id: true, createdAt: true });
export type InsertAgencyInvite = z.infer<typeof insertAgencyInviteSchema>;
export type AgencyInvite = typeof agencyInvites.$inferSelect;

// Policy purchases table - One-time purchases for policy generators
export const policyPurchases = pgTable("policy_purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // privacy, cookie, bundle
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeSessionId: text("stripe_session_id"),
  amount: integer("amount").notNull(), // in cents (900 = €9)
  currency: text("currency").notNull().default("eur"),
  status: text("status").notNull().default("pending"), // pending, completed, failed, refunded
  purchasedAt: timestamp("purchased_at").notNull().defaultNow(),
});

export const insertPolicyPurchaseSchema = createInsertSchema(policyPurchases).omit({ id: true, purchasedAt: true });
export type InsertPolicyPurchase = z.infer<typeof insertPolicyPurchaseSchema>;
export type PolicyPurchase = typeof policyPurchases.$inferSelect;

// Policies table - Generated privacy and cookie policies
export const policies = pgTable("policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  websiteId: varchar("website_id").notNull().references(() => websites.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // privacy, cookie
  status: text("status").notNull().default("draft"), // draft, published
  language: text("language").notNull().default("en"),
  jurisdiction: text("jurisdiction").notNull().default("gdpr"), // gdpr, ccpa, lgpd, all
  
  // Business information (intake questionnaire data)
  businessName: text("business_name").notNull(),
  businessAddress: text("business_address"),
  businessCountry: text("business_country"),
  businessEmail: text("business_email").notNull(),
  businessPhone: text("business_phone"),
  businessWebsite: text("business_website"),
  vatNumber: text("vat_number"),
  
  // Data protection officer (optional)
  dpoName: text("dpo_name"),
  dpoEmail: text("dpo_email"),
  
  // Data collection practices (JSON arrays)
  dataCollected: text("data_collected"), // JSON: ["email", "name", "payment", "location", ...]
  dataUsagePurposes: text("data_usage_purposes"), // JSON: ["service_delivery", "marketing", "analytics", ...]
  thirdPartyServices: text("third_party_services"), // JSON: ["google_analytics", "stripe", "mailchimp", ...]
  dataRetentionPeriod: text("data_retention_period"), // e.g., "2 years", "until account deletion"
  
  // Rights and processes
  allowsDataExport: boolean("allows_data_export").default(true),
  allowsDataDeletion: boolean("allows_data_deletion").default(true),
  hasMinors: boolean("has_minors").default(false), // Does site target users under 16?
  sellsData: boolean("sells_data").default(false), // For CCPA "Do Not Sell"
  
  // Generated content
  content: text("content"), // HTML content
  contentMarkdown: text("content_markdown"), // Markdown content
  
  // Versioning
  templateVersion: text("template_version").notNull().default("1.0"),
  version: integer("version").notNull().default(1),
  
  // Timestamps
  generatedAt: timestamp("generated_at"),
  publishedAt: timestamp("published_at"),
  lastEditedAt: timestamp("last_edited_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPolicySchema = createInsertSchema(policies).omit({ id: true, createdAt: true, generatedAt: true });
export type InsertPolicy = z.infer<typeof insertPolicySchema>;
export type Policy = typeof policies.$inferSelect;

// Policy generation logs - For agency quota tracking
export const policyGenerationLogs = pgTable("policy_generation_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  agencyId: varchar("agency_id").references(() => agencies.id, { onDelete: "set null" }),
  websiteId: varchar("website_id").notNull().references(() => websites.id, { onDelete: "cascade" }),
  policyId: varchar("policy_id").references(() => policies.id, { onDelete: "set null" }),
  type: text("type").notNull(), // privacy, cookie
  action: text("action").notNull(), // generate, regenerate, edit
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPolicyGenerationLogSchema = createInsertSchema(policyGenerationLogs).omit({ id: true, createdAt: true });
export type InsertPolicyGenerationLog = z.infer<typeof insertPolicyGenerationLogSchema>;
export type PolicyGenerationLog = typeof policyGenerationLogs.$inferSelect;

export const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  source: text("source").notNull().default("contact-form"),
  clickupTaskId: text("clickup_task_id"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({ id: true, createdAt: true });
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

// API keys table - programmatic access to the public REST API (ConsentEase Connect)
// Secret is never stored: keyId is the public lookup id, secretHash is HMAC-SHA256(API_KEY_PEPPER, secret).
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // human label, e.g. "Cursor on my laptop"
  keyId: text("key_id").notNull(), // public lookup id (the <keyId> in ce_live_<keyId>_<secret>)
  keyPrefix: text("key_prefix").notNull(), // shown in UI, e.g. "ce_live_a1b2c3d4"
  secretHash: text("secret_hash").notNull(), // HMAC-SHA256(API_KEY_PEPPER, secret) — never the plaintext
  scopes: text("scopes").array().notNull().default(sql`'{}'::text[]`),
  rateTier: text("rate_tier").notNull().default("standard"), // standard, high, etc.
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"), // nullable = no expiry
  revokedAt: timestamp("revoked_at"), // nullable = active
  rotatedFromKeyId: varchar("rotated_from_key_id"), // links a rotated key back to its predecessor
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  keyIdIdx: uniqueIndex("api_keys_key_id_unique").on(t.keyId),
  userIdx: index("api_keys_user_idx").on(t.userId),
}));

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
  keyId: true,
  keyPrefix: true,
  secretHash: true,
  lastUsedAt: true,
  revokedAt: true,
  rotatedFromKeyId: true,
});
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;
// Safe-to-serialize shape: excludes secretHash (credential-verifier material).
export type PublicApiKey = Omit<ApiKey, "secretHash">;

// API usage events table - audit + metering ledger for the public REST API.
// The unique (apiKeyId, idempotencyKey) index de-duplicates billable retries; NULL idempotencyKeys
// are treated as distinct by Postgres, so non-idempotent events never collide.
export const apiUsageEvents = pgTable("api_usage_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  apiKeyId: varchar("api_key_id").notNull().references(() => apiKeys.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  websiteId: varchar("website_id").references(() => websites.id, { onDelete: "set null" }), // nullable: keep audit row if site deleted
  action: text("action").notNull(), // e.g. "consent.record", "site.scan", "site.create"
  billableUnits: integer("billable_units").notNull().default(0),
  idempotencyKey: text("idempotency_key"), // nullable: only set for idempotent billable writes
  status: text("status").notNull().default("ok"), // ok, error, limited
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  keyIdempotencyIdx: uniqueIndex("api_usage_events_key_idempotency_unique").on(t.apiKeyId, t.idempotencyKey),
  apiKeyIdx: index("api_usage_events_api_key_idx").on(t.apiKeyId),
  userIdx: index("api_usage_events_user_idx").on(t.userId),
}));

export const insertApiUsageEventSchema = createInsertSchema(apiUsageEvents).omit({ id: true, createdAt: true });
export type InsertApiUsageEvent = z.infer<typeof insertApiUsageEventSchema>;
export type ApiUsageEvent = typeof apiUsageEvents.$inferSelect;
