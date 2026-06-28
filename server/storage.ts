import { users, websites, bannerConfigs, analyticsEvents, passwordResetTokens, emailVerificationTokens, cookieCategories, cookies, consentLogs, diagnosticScans, webVitalsMetrics, agencies, agencyClients, agencyMembers, agencyInvites, policies, policyPurchases, policyGenerationLogs, contactSubmissions, monthlyViewCounters, type User, type InsertUser, type Website, type InsertWebsite, type BannerConfig, type InsertBannerConfig, type AnalyticsEvent, type InsertAnalyticsEvent, type PasswordResetToken, type EmailVerificationToken, type CookieCategory, type InsertCookieCategory, type Cookie, type InsertCookie, type ConsentLog, type InsertConsentLog, type DiagnosticScan, type InsertDiagnosticScan, type WebVitalsMetric, type InsertWebVitalsMetric, type Agency, type InsertAgency, type AgencyClient, type InsertAgencyClient, type AgencyMember, type InsertAgencyMember, type AgencyInvite, type InsertAgencyInvite, type Policy, type InsertPolicy, type PolicyPurchase, type InsertPolicyPurchase, type PolicyGenerationLog, type InsertPolicyGenerationLog, type ContactSubmission, type InsertContactSubmission, apiKeys, apiUsageEvents, type ApiKey, type ApiUsageEvent, type PublicApiKey } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, sql, count, ilike, like, isNotNull, isNull } from "drizzle-orm";

// Plan limits configuration
// Using -1 to represent unlimited for JSON serialization
export const PLAN_LIMITS = {
  starter: { websites: 1, monthlyViews: 10000, policyGenerations: 0, dailyCookieScans: 1, dailyDiagnosticScans: 1 },
  solo: { websites: 1, monthlyViews: 25000, policyGenerations: 0, dailyCookieScans: 3, dailyDiagnosticScans: 2 },
  premium: { websites: 1, monthlyViews: 100000, policyGenerations: 0, dailyCookieScans: 5, dailyDiagnosticScans: 3 },
  pro: { websites: 5, monthlyViews: 250000, policyGenerations: 0, dailyCookieScans: 10, dailyDiagnosticScans: 5 },
  business: { websites: 10, monthlyViews: 1000000, policyGenerations: 0, dailyCookieScans: 20, dailyDiagnosticScans: 10 },
  agency: { websites: 25, monthlyViews: 2500000, policyGenerations: 25, dailyCookieScans: 50, dailyDiagnosticScans: 25 },
  agency_pro: { websites: 100, monthlyViews: 10000000, policyGenerations: 100, dailyCookieScans: 100, dailyDiagnosticScans: 50 },
} as const;

export function isUnlimited(limit: number): boolean {
  return limit === -1;
}

export type PlanType = keyof typeof PLAN_LIMITS;

export interface ConsentLogFilters {
  dateFrom?: Date;
  dateTo?: Date;
  action?: string;
  search?: string;
}

export interface ConsentLogStats {
  totalRecords: number;
  acceptCount: number;
  rejectCount: number;
  customCount: number;
  dismissedCount: number;
  acceptRate: number;
  rejectRate: number;
  mostCommonAction: string;
  previousPeriodAcceptRate: number | null;
  previousPeriodRejectRate: number | null;
  trendAcceptRate: number | null;
  trendRejectRate: number | null;
}

export interface CreateApiKeyParams {
  userId: string;
  name: string;
  keyId: string;
  keyPrefix: string;
  secretHash: string;
  scopes?: string[];
  rateTier?: string;
  expiresAt?: Date | null;
  rotatedFromKeyId?: string | null;
}

export interface RotateApiKeyParams {
  // DB id (not keyId) of the existing key being rotated, scoped to its owner.
  id: string;
  userId: string;
  // Freshly minted material for the replacement key (mintApiKey() is called at the
  // route layer, which alone ever sees the plaintext). The new key inherits the old
  // key's name, scopes, and rateTier so rotation is transparent to callers.
  keyId: string;
  keyPrefix: string;
  secretHash: string;
  // Grace window the OLD key stays valid before it auto-expires. Omit for the default.
  graceMs?: number;
  // Hard ceiling on simultaneously-valid (non-revoked, non-expired) keys for this
  // owner. Enforced INSIDE the rotation transaction so repeated rotations cannot
  // stack unbounded grace-window keys and bypass the create-path cap.
  maxValidKeys: number;
}

export interface RecordApiUsageParams {
  apiKeyId: string;
  userId: string;
  websiteId?: string | null;
  action: string;
  billableUnits?: number;
  idempotencyKey?: string | null;
  status?: string;
}

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByStripeCustomerId(customerId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  updateSubscriptionStatus(userId: string, status: string, endDate?: Date): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getExpiredDemoUsers(limit?: number): Promise<User[]>;

  // API key methods (ConsentEase Connect)
  createApiKey(params: CreateApiKeyParams): Promise<ApiKey>;
  getApiKeyByKeyId(keyId: string): Promise<ApiKey | undefined>;
  getApiKeyById(id: string): Promise<ApiKey | undefined>;
  listApiKeysByUserId(userId: string): Promise<PublicApiKey[]>;
  revokeApiKey(id: string, userId: string): Promise<ApiKey | undefined>;
  rotateApiKey(
    params: RotateApiKeyParams,
  ): Promise<{ ok: true; newKey: ApiKey } | { ok: false; reason: "not_found" | "cap_exceeded" }>;
  touchApiKeyLastUsed(id: string): Promise<void>;
  recordApiUsageEvent(params: RecordApiUsageParams): Promise<{ event: ApiUsageEvent; deduped: boolean; conflict: boolean }>;
  getApiUsageEventByIdempotency(apiKeyId: string, idempotencyKey: string): Promise<ApiUsageEvent | undefined>;
  
  // Website methods
  getWebsitesByUserId(userId: string): Promise<Website[]>;
  getWebsiteById(id: string): Promise<Website | undefined>;
  getWebsiteByPublicId(publicId: string): Promise<Website | undefined>;
  createWebsite(website: InsertWebsite): Promise<Website>;
  updateWebsite(id: string, updates: Partial<Website>): Promise<Website>;
  deleteWebsite(id: string): Promise<void>;
  countWebsitesByUserId(userId: string): Promise<number>;
  
  // Banner config methods
  getBannerConfigByWebsiteId(websiteId: string): Promise<BannerConfig | undefined>;
  createBannerConfig(config: InsertBannerConfig): Promise<BannerConfig>;
  updateBannerConfig(websiteId: string, updates: Partial<BannerConfig>): Promise<BannerConfig>;
  
  // Analytics methods
  createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  getAnalyticsByWebsiteId(websiteId: string, daysBack: number): Promise<AnalyticsEvent[]>;
  // (Note: getAnalyticsSummary and getAdvancedAnalytics return types are intentionally
  // declared inline below — they include the dataIntegrity overcount field added in
  // T005 of the analytics weekend plan.)
  getAnalyticsSummary(websiteId: string, daysBack: number): Promise<{
    totalViews: number;
    acceptRate: number;
    rejectRate: number;
    dismissedRate: number;
    customRate: number;
    noActionRate: number;
    dailyStats: Array<{ date: string; views: number; accepts: number; rejects: number }>;
    countryBreakdown: Array<{ country: string; count: number }>;
    dataIntegrity?: {
      overcount: boolean;
      totalActions: number;
      totalViews: number;
      ratio: number;
    };
  }>;
  getMonthlyViewsForUser(userId: string): Promise<number>;
  incrementMonthlyViewCounter(userId: string): Promise<number>;
  decrementMonthlyViewCounter(userId: string): Promise<void>;
  getAdvancedAnalytics(websiteId: string, daysBack: number): Promise<{
    trends: {
      currentPeriod: { views: number; accepts: number; rejects: number; rate: number };
      previousPeriod: { views: number; accepts: number; rejects: number; rate: number };
      // null when previous period had < MIN_SAMPLE_FOR_TREND impressions; UI
      // should render "—" rather than a misleading delta.
      change: number | null;
    };
    funnel: {
      impressions: number;
      interactions: number;
      settingsClicks: number;
      accepts: number;
      rejects: number;
      customSaves: number;
      dismissed: number;
    };
    geographic: Array<{
      country: string;
      countryCode: string;
      flag: string;
      views: number;
      accepts: number;
      rejects: number;
      acceptRate: number;
    }>;
    hourlyDistribution: Array<{ hour: number; count: number }>;
    weeklyTrend: Array<{ week: string; views: number; acceptRate: number }>;
    deviceBreakdown: Array<{ deviceType: string; count: number; acceptRate: number }>;
    browserBreakdown: Array<{ browser: string; count: number; acceptRate: number }>;
    categoryBreakdown: Array<{ category: string; granted: number; denied: number; total: number; grantRate: number }>;
  }>;
  
  // Password reset token methods
  createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  deletePasswordResetToken(token: string): Promise<void>;
  deletePasswordResetTokensByUserId(userId: string): Promise<void>;
  
  // Email verification token methods
  createEmailVerificationToken(userId: string, token: string, expiresAt: Date): Promise<EmailVerificationToken>;
  getEmailVerificationToken(token: string): Promise<EmailVerificationToken | undefined>;
  deleteEmailVerificationToken(token: string): Promise<void>;
  deleteEmailVerificationTokensByUserId(userId: string): Promise<void>;
  
  // Cookie category methods
  getCookieCategoriesByWebsiteId(websiteId: string): Promise<CookieCategory[]>;
  getCookieCategoryById(id: string): Promise<CookieCategory | undefined>;
  createCookieCategory(category: InsertCookieCategory): Promise<CookieCategory>;
  updateCookieCategory(id: string, updates: Partial<CookieCategory>): Promise<CookieCategory>;
  deleteCookieCategory(id: string): Promise<void>;
  createDefaultCategoriesForWebsite(websiteId: string): Promise<CookieCategory[]>;
  
  // Cookie methods
  getCookiesByWebsiteId(websiteId: string): Promise<Cookie[]>;
  getCookiesByCategoryId(categoryId: string): Promise<Cookie[]>;
  getCookieById(id: string): Promise<Cookie | undefined>;
  createCookie(cookie: InsertCookie): Promise<Cookie>;
  updateCookie(id: string, updates: Partial<Cookie>): Promise<Cookie>;
  deleteCookie(id: string): Promise<void>;
  replaceAutoDetectedCookies(websiteId: string, newCookies: InsertCookie[]): Promise<void>;
  
  // Consent log methods
  createConsentLog(log: InsertConsentLog): Promise<ConsentLog>;
  getConsentLogsByWebsiteId(websiteId: string, limit?: number, offset?: number, filters?: ConsentLogFilters): Promise<ConsentLog[]>;
  getConsentLogsCount(websiteId: string, filters?: ConsentLogFilters): Promise<number>;
  getConsentLogsByDateRange(websiteId: string, startDate: Date, endDate: Date): Promise<ConsentLog[]>;
  getConsentLogStats(websiteId: string, filters?: ConsentLogFilters): Promise<ConsentLogStats>;
  
  // Diagnostic scan methods
  createDiagnosticScan(scan: InsertDiagnosticScan): Promise<DiagnosticScan>;
  getDiagnosticScansByWebsiteId(websiteId: string): Promise<DiagnosticScan[]>;
  getLatestDiagnosticScan(websiteId: string): Promise<DiagnosticScan | undefined>;
  updateDiagnosticScan(id: string, updates: Partial<DiagnosticScan>): Promise<DiagnosticScan>;
  
  // Daily scan count methods
  getDailyCookieScanCount(userId: string): Promise<number>;
  getDailyDiagnosticScanCount(userId: string): Promise<number>;
  
  // Web Vitals methods
  createWebVitalsMetric(metric: InsertWebVitalsMetric): Promise<WebVitalsMetric>;
  getWebVitalsByWebsiteId(websiteId: string, daysBack?: number): Promise<WebVitalsMetric[]>;
  getWebVitalsSummary(websiteId: string, daysBack?: number): Promise<{
    avgLcp: number | null;
    avgCls: number | null;
    avgInp: number | null;
    avgFcp: number | null;
    avgTtfb: number | null;
    avgBannerDelay: number | null;
    totalSamples: number;
    p75Lcp: number | null;
    p75Cls: number | null;
    p75Inp: number | null;
  }>;
  
  // Agency methods
  getAgencyById(id: string): Promise<Agency | undefined>;
  getAgencyBySlug(slug: string): Promise<Agency | undefined>;
  getAgencyByOwnerId(ownerId: string): Promise<Agency | undefined>;
  getFeaturedAgencies(): Promise<Agency[]>;
  createAgency(agency: InsertAgency): Promise<Agency>;
  updateAgency(id: string, updates: Partial<Agency>): Promise<Agency>;
  deleteAgency(id: string): Promise<void>;
  
  // Agency client methods
  getAgencyClients(agencyId: string): Promise<(AgencyClient & { user: User })[]>;
  getAgencyClientById(id: string): Promise<AgencyClient | undefined>;
  getClientsByUserId(userId: string): Promise<(AgencyClient & { agency: Agency })[]>;
  createAgencyClient(client: InsertAgencyClient): Promise<AgencyClient>;
  updateAgencyClient(id: string, updates: Partial<AgencyClient>): Promise<AgencyClient>;
  deleteAgencyClient(id: string): Promise<void>;
  
  // Agency member methods
  getAgencyMembers(agencyId: string): Promise<(AgencyMember & { user: User })[]>;
  getAgencyMemberByUserId(agencyId: string, userId: string): Promise<AgencyMember | undefined>;
  createAgencyMember(member: InsertAgencyMember): Promise<AgencyMember>;
  updateAgencyMember(id: string, updates: Partial<AgencyMember>): Promise<AgencyMember>;
  deleteAgencyMember(id: string): Promise<void>;
  
  // Agency invite methods  
  getAgencyInviteById(id: string): Promise<AgencyInvite | undefined>;
  getAgencyInviteByToken(token: string): Promise<AgencyInvite | undefined>;
  getAgencyInvitesByAgencyId(agencyId: string): Promise<AgencyInvite[]>;
  createAgencyInvite(invite: InsertAgencyInvite): Promise<AgencyInvite>;
  updateAgencyInvite(id: string, updates: Partial<AgencyInvite>): Promise<AgencyInvite>;
  deleteAgencyInvite(id: string): Promise<void>;
  deleteExpiredAgencyInvites(agencyId: string): Promise<void>;
  
  // Agency stats
  updateAgencyStats(agencyId: string): Promise<void>;
  
  // Policy purchase methods
  getPolicyPurchasesByUserId(userId: string): Promise<PolicyPurchase[]>;
  getPolicyPurchase(userId: string, type: string): Promise<PolicyPurchase | undefined>;
  createPolicyPurchase(purchase: InsertPolicyPurchase): Promise<PolicyPurchase>;
  updatePolicyPurchase(id: string, updates: Partial<PolicyPurchase>): Promise<PolicyPurchase>;
  hasPolicyAccess(userId: string, type: 'privacy' | 'cookie'): Promise<boolean>;
  
  // Policy methods
  getPoliciesByWebsiteId(websiteId: string): Promise<Policy[]>;
  getPolicyById(id: string): Promise<Policy | undefined>;
  getPolicyByWebsiteAndType(websiteId: string, type: string): Promise<Policy | undefined>;
  createPolicy(policy: InsertPolicy): Promise<Policy>;
  updatePolicy(id: string, updates: Partial<Policy>): Promise<Policy>;
  deletePolicy(id: string): Promise<void>;
  
  // Policy generation log methods (for agency quota)
  getMonthlyPolicyGenerations(userId: string, agencyId?: string): Promise<number>;
  createPolicyGenerationLog(log: InsertPolicyGenerationLog): Promise<PolicyGenerationLog>;

  // Contact submission methods
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(limit?: number, offset?: number): Promise<ContactSubmission[]>;
  getContactSubmissionByEmail(email: string): Promise<ContactSubmission[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(ilike(users.email, email));
    return user || undefined;
  }

  async getUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    // Cascades to websites, banner_configs, cookies, etc. via FK constraints
    await db.delete(users).where(eq(users.id, id));
  }

  async getExpiredDemoUsers(limit = 50): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.isDemo, true),
          isNotNull(users.demoExpiresAt),
          lte(users.demoExpiresAt, new Date()),
        ),
      )
      .limit(limit);
  }

  async updateSubscriptionStatus(userId: string, status: string, endDate?: Date): Promise<User> {
    const updates: Partial<User> = { subscriptionStatus: status };
    if (endDate) {
      updates.subscriptionEndDate = endDate;
    }
    const [updated] = await db.update(users).set(updates).where(eq(users.id, userId)).returning();
    return updated;
  }

  // Website methods
  async getWebsitesByUserId(userId: string): Promise<Website[]> {
    return await db.select().from(websites).where(eq(websites.userId, userId)).orderBy(desc(websites.createdAt));
  }

  async getWebsiteById(id: string): Promise<Website | undefined> {
    const [website] = await db.select().from(websites).where(eq(websites.id, id));
    return website || undefined;
  }

  async getWebsiteByPublicId(publicId: string): Promise<Website | undefined> {
    const [website] = await db.select().from(websites).where(eq(websites.publicId, publicId));
    return website || undefined;
  }

  async createWebsite(website: InsertWebsite): Promise<Website> {
    const [created] = await db.insert(websites).values(website).returning();
    return created;
  }

  async updateWebsite(id: string, updates: Partial<Website>): Promise<Website> {
    const [updated] = await db.update(websites).set(updates).where(eq(websites.id, id)).returning();
    return updated;
  }

  async deleteWebsite(id: string): Promise<void> {
    await db.delete(websites).where(eq(websites.id, id));
  }

  async countWebsitesByUserId(userId: string): Promise<number> {
    const result = await db.select({ count: count() }).from(websites).where(eq(websites.userId, userId));
    return result[0]?.count || 0;
  }

  // Banner config methods
  async getBannerConfigByWebsiteId(websiteId: string): Promise<BannerConfig | undefined> {
    const [config] = await db.select().from(bannerConfigs).where(eq(bannerConfigs.websiteId, websiteId));
    return config || undefined;
  }

  async createBannerConfig(config: InsertBannerConfig): Promise<BannerConfig> {
    const [created] = await db.insert(bannerConfigs).values(config).returning();
    return created;
  }

  async updateBannerConfig(websiteId: string, updates: Partial<BannerConfig>): Promise<BannerConfig> {
    const [updated] = await db
      .update(bannerConfigs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(bannerConfigs.websiteId, websiteId))
      .returning();
    return updated;
  }

  // Analytics methods
  async createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const [created] = await db.insert(analyticsEvents).values(event).returning();
    return created;
  }

  async getAnalyticsByWebsiteId(websiteId: string, daysBack: number): Promise<AnalyticsEvent[]> {
    const since = new Date();
    since.setDate(since.getDate() - daysBack);
    
    return await db
      .select()
      .from(analyticsEvents)
      .where(and(eq(analyticsEvents.websiteId, websiteId), gte(analyticsEvents.timestamp, since)))
      .orderBy(desc(analyticsEvents.timestamp));
  }

  async getAnalyticsSummary(websiteId: string, daysBack: number): Promise<{
    totalViews: number;
    acceptRate: number;
    rejectRate: number;
    dismissedRate: number;
    customRate: number;
    noActionRate: number;
    dailyStats: Array<{ date: string; views: number; accepts: number; rejects: number }>;
    countryBreakdown: Array<{ country: string; count: number }>;
  }> {
    const since = new Date();
    since.setDate(since.getDate() - daysBack);

    const events = await this.getAnalyticsByWebsiteId(websiteId, daysBack);

    const totalViews = events.filter(e => e.eventType === 'banner_shown').length;
    const accepts = events.filter(e => e.eventType === 'accept').length;
    const rejects = events.filter(e => e.eventType === 'reject').length;
    const dismissed = events.filter(e => e.eventType === 'banner_dismissed').length;
    const customSaves = events.filter(e => e.eventType === 'preferences_saved').length;
    const totalActions = accepts + rejects + dismissed + customSaves;
    // Clamp noAction to 0. If actions exceed views (duplicate POSTs, missing
    // banner_shown events, multi-tab interactions), we'd otherwise show
    // negative noAction or > 100% rates. The dataIntegrity flag below tells
    // the dashboard to surface a "data may be inaccurate" warning.
    const noAction = Math.max(0, totalViews - totalActions);
    const dataIntegrity = totalActions > totalViews && totalViews > 0
      ? {
          overcount: true,
          totalActions,
          totalViews,
          ratio: totalActions / totalViews,
        }
      : undefined;

    const dailyMap = new Map<string, { views: number; accepts: number; rejects: number }>();
    events.forEach(event => {
      const dateKey = event.timestamp.toISOString().split('T')[0];
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, { views: 0, accepts: 0, rejects: 0 });
      }
      const stats = dailyMap.get(dateKey)!;
      if (event.eventType === 'banner_shown') stats.views++;
      if (event.eventType === 'accept') stats.accepts++;
      if (event.eventType === 'reject') stats.rejects++;
    });

    const dailyStats = Array.from(dailyMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const countryMap = new Map<string, number>();
    events.forEach(event => {
      if (event.country) {
        countryMap.set(event.country, (countryMap.get(event.country) || 0) + 1);
      }
    });

    const countryBreakdown = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalViews,
      acceptRate: totalViews > 0 ? (accepts / totalViews) * 100 : 0,
      rejectRate: totalViews > 0 ? (rejects / totalViews) * 100 : 0,
      dismissedRate: totalViews > 0 ? (dismissed / totalViews) * 100 : 0,
      customRate: totalViews > 0 ? (customSaves / totalViews) * 100 : 0,
      noActionRate: totalViews > 0 ? (noAction / totalViews) * 100 : 0,
      dailyStats,
      countryBreakdown,
      ...(dataIntegrity ? { dataIntegrity } : {}),
    };
  }

  async updateUserStripeInfo(userId: string, stripeInfo: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  }): Promise<User> {
    const [updated] = await db.update(users).set(stripeInfo).where(eq(users.id, userId)).returning();
    return updated;
  }

  // UTC YYYY-MM key. Stays stable across server timezone changes and matches
  // billing cycles which are also UTC.
  private getCurrentMonthKey(): string {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  async getMonthlyViewsForUser(userId: string): Promise<number> {
    // Read-only path: just look up the counter row. No row = 0 views this month.
    const monthKey = this.getCurrentMonthKey();
    const [row] = await db
      .select({ count: monthlyViewCounters.count })
      .from(monthlyViewCounters)
      .where(and(
        eq(monthlyViewCounters.userId, userId),
        eq(monthlyViewCounters.monthKey, monthKey),
      ));
    return row?.count || 0;
  }

  async incrementMonthlyViewCounter(userId: string): Promise<number> {
    // Atomic INSERT…ON CONFLICT DO UPDATE returning the new count. Two concurrent
    // banner_shown POSTs can no longer both see "below limit" and both pass — the
    // increment and the read happen in the same statement.
    const monthKey = this.getCurrentMonthKey();
    const [row] = await db
      .insert(monthlyViewCounters)
      .values({ userId, monthKey, count: 1 })
      .onConflictDoUpdate({
        target: [monthlyViewCounters.userId, monthlyViewCounters.monthKey],
        set: {
          count: sql`${monthlyViewCounters.count} + 1`,
          updatedAt: new Date(),
        },
      })
      .returning({ count: monthlyViewCounters.count });
    return row?.count || 0;
  }

  async decrementMonthlyViewCounter(userId: string): Promise<void> {
    // Compensating action used by the route handler when the analytics_events
    // INSERT fails after the counter has already been incremented. We never
    // want the billing-driving counter to drift above the actual recorded
    // event count. greatest(count - 1, 0) avoids ever going negative.
    const monthKey = this.getCurrentMonthKey();
    await db
      .update(monthlyViewCounters)
      .set({
        count: sql`GREATEST(${monthlyViewCounters.count} - 1, 0)`,
        updatedAt: new Date(),
      })
      .where(and(
        eq(monthlyViewCounters.userId, userId),
        eq(monthlyViewCounters.monthKey, monthKey),
      ));
  }

  async getAdvancedAnalytics(websiteId: string, daysBack: number): Promise<{
    trends: {
      currentPeriod: { views: number; accepts: number; rejects: number; rate: number };
      previousPeriod: { views: number; accepts: number; rejects: number; rate: number };
      change: number | null;
    };
    funnel: {
      impressions: number;
      interactions: number;
      settingsClicks: number;
      accepts: number;
      rejects: number;
      customSaves: number;
      dismissed: number;
    };
    geographic: Array<{
      country: string;
      countryCode: string;
      flag: string;
      views: number;
      accepts: number;
      rejects: number;
      acceptRate: number;
    }>;
    hourlyDistribution: Array<{ hour: number; count: number }>;
    weeklyTrend: Array<{ week: string; views: number; acceptRate: number }>;
    deviceBreakdown: Array<{ deviceType: string; count: number; acceptRate: number }>;
    browserBreakdown: Array<{ browser: string; count: number; acceptRate: number }>;
    categoryBreakdown: Array<{ category: string; granted: number; denied: number; total: number; grantRate: number }>;
  }> {
    const countryCodes: Record<string, string> = {
      'United States': 'US',
      'United Kingdom': 'GB',
      'Germany': 'DE',
      'France': 'FR',
      'Netherlands': 'NL',
      'Belgium': 'BE',
      'Spain': 'ES',
      'Italy': 'IT',
      'Portugal': 'PT',
      'Poland': 'PL',
      'Canada': 'CA',
      'Australia': 'AU',
      'Japan': 'JP',
      'Brazil': 'BR',
      'India': 'IN',
      'China': 'CN',
      'Mexico': 'MX',
      'Sweden': 'SE',
      'Norway': 'NO',
      'Denmark': 'DK',
      'Finland': 'FI',
      'Ireland': 'IE',
      'Austria': 'AT',
      'Switzerland': 'CH',
    };

    const currentEvents = await this.getAnalyticsByWebsiteId(websiteId, daysBack);
    const previousEvents = await this.getAnalyticsByWebsiteId(websiteId, daysBack * 2);
    
    const currentCutoff = new Date();
    currentCutoff.setDate(currentCutoff.getDate() - daysBack);
    const previousOnlyEvents = previousEvents.filter(e => e.timestamp < currentCutoff);

    const calcStats = (events: AnalyticsEvent[]) => {
      const views = events.filter(e => e.eventType === 'banner_shown').length;
      const accepts = events.filter(e => e.eventType === 'accept').length;
      const rejects = events.filter(e => e.eventType === 'reject').length;
      const rate = views > 0 ? (accepts / views) * 100 : 0;
      return { views, accepts, rejects, rate };
    };

    const currentPeriod = calcStats(currentEvents);
    const previousPeriod = calcStats(previousOnlyEvents);
    // M4: a single banner_shown moving the rate from 0% → 100% used to read as
    // "+infinity% growth" because the divisor was tiny. Require a minimum
    // sample (50 impressions) before reporting a percentage delta, and clamp
    // to a sane range so the dashboard tile doesn't render "+9472.6% vs prev".
    const MIN_SAMPLE_FOR_TREND = 50;
    let change: number | null;
    if (previousPeriod.views < MIN_SAMPLE_FOR_TREND || previousPeriod.rate === 0) {
      change = null;
    } else {
      const raw = ((currentPeriod.rate - previousPeriod.rate) / previousPeriod.rate) * 100;
      change = Math.max(-100, Math.min(999, raw));
    }

    // M1: settings_click is never emitted by the live banner (1.4M-event sample
    // shows zero). Removed from interactions so a future emission won't be
    // silently dropped; banner_dismissed counts as a real (passive) interaction.
    const funnel = {
      impressions: currentEvents.filter(e => e.eventType === 'banner_shown').length,
      interactions: currentEvents.filter(e => ['accept', 'reject', 'preferences_saved', 'banner_dismissed'].includes(e.eventType)).length,
      settingsClicks: currentEvents.filter(e => e.eventType === 'settings_click').length,
      accepts: currentEvents.filter(e => e.eventType === 'accept').length,
      rejects: currentEvents.filter(e => e.eventType === 'reject').length,
      customSaves: currentEvents.filter(e => e.eventType === 'preferences_saved').length,
      dismissed: currentEvents.filter(e => e.eventType === 'banner_dismissed').length,
    };

    const geoMap = new Map<string, { views: number; accepts: number; rejects: number }>();
    currentEvents.forEach(event => {
      const country = event.country || 'Unknown';
      if (!geoMap.has(country)) {
        geoMap.set(country, { views: 0, accepts: 0, rejects: 0 });
      }
      const stats = geoMap.get(country)!;
      if (event.eventType === 'banner_shown') stats.views++;
      if (event.eventType === 'accept') stats.accepts++;
      if (event.eventType === 'reject') stats.rejects++;
    });

    const geographic = Array.from(geoMap.entries())
      .map(([country, stats]) => ({
        country,
        countryCode: countryCodes[country] || 'XX',
        flag: '',
        views: stats.views,
        accepts: stats.accepts,
        rejects: stats.rejects,
        acceptRate: stats.views > 0 ? (stats.accepts / stats.views) * 100 : 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 15);

    const hourlyMap = new Map<number, number>();
    currentEvents.forEach(event => {
      if (event.eventType === 'banner_shown') {
        const hour = event.timestamp.getHours();
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
      }
    });
    const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: hourlyMap.get(hour) || 0,
    }));

    const weeklyMap = new Map<string, { views: number; accepts: number }>();
    currentEvents.forEach(event => {
      const weekStart = new Date(event.timestamp);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, { views: 0, accepts: 0 });
      }
      const stats = weeklyMap.get(weekKey)!;
      if (event.eventType === 'banner_shown') stats.views++;
      if (event.eventType === 'accept') stats.accepts++;
    });

    const weeklyTrend = Array.from(weeklyMap.entries())
      .map(([week, stats]) => ({
        week,
        views: stats.views,
        acceptRate: stats.views > 0 ? (stats.accepts / stats.views) * 100 : 0,
      }))
      .sort((a, b) => a.week.localeCompare(b.week));

    const deviceMap = new Map<string, { views: number; accepts: number }>();
    currentEvents.forEach(event => {
      const dt = event.deviceType || 'unknown';
      if (!deviceMap.has(dt)) deviceMap.set(dt, { views: 0, accepts: 0 });
      const stats = deviceMap.get(dt)!;
      if (event.eventType === 'banner_shown') stats.views++;
      if (event.eventType === 'accept') stats.accepts++;
    });
    const deviceBreakdown = Array.from(deviceMap.entries())
      .map(([deviceType, stats]) => ({
        deviceType,
        count: stats.views,
        acceptRate: stats.views > 0 ? (stats.accepts / stats.views) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const browserMap = new Map<string, { views: number; accepts: number }>();
    currentEvents.forEach(event => {
      const br = event.browser || 'Unknown';
      if (!browserMap.has(br)) browserMap.set(br, { views: 0, accepts: 0 });
      const stats = browserMap.get(br)!;
      if (event.eventType === 'banner_shown') stats.views++;
      if (event.eventType === 'accept') stats.accepts++;
    });
    const browserBreakdown = Array.from(browserMap.entries())
      .map(([browser, stats]) => ({
        browser,
        count: stats.views,
        acceptRate: stats.views > 0 ? (stats.accepts / stats.views) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    const consentLogEvents = await this.getConsentLogsByDateRange(websiteId, startDate, new Date());
    const categoryTotals = new Map<string, { granted: number; denied: number }>();
    consentLogEvents.forEach(log => {
      try {
        const choices = JSON.parse(log.consentChoices);
        Object.entries(choices).forEach(([category, value]) => {
          if (category === 'necessary') return;
          if (!categoryTotals.has(category)) categoryTotals.set(category, { granted: 0, denied: 0 });
          const stats = categoryTotals.get(category)!;
          if (value) stats.granted++;
          else stats.denied++;
        });
      } catch {}
    });
    const categoryBreakdown = Array.from(categoryTotals.entries())
      .map(([category, stats]) => {
        const total = stats.granted + stats.denied;
        return {
          category,
          granted: stats.granted,
          denied: stats.denied,
          total,
          grantRate: total > 0 ? (stats.granted / total) * 100 : 0,
        };
      })
      .sort((a, b) => b.total - a.total);

    return {
      trends: { currentPeriod, previousPeriod, change },
      funnel,
      geographic,
      hourlyDistribution,
      weeklyTrend,
      deviceBreakdown,
      browserBreakdown,
      categoryBreakdown,
    };
  }

  // Password reset token methods
  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken> {
    const [created] = await db.insert(passwordResetTokens).values({
      userId,
      token,
      expiresAt,
    }).returning();
    return created;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [result] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    return result || undefined;
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
  }

  async deletePasswordResetTokensByUserId(userId: string): Promise<void> {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
  }

  // Email verification token methods
  async createEmailVerificationToken(userId: string, token: string, expiresAt: Date): Promise<EmailVerificationToken> {
    const [created] = await db.insert(emailVerificationTokens).values({
      userId,
      token,
      expiresAt,
    }).returning();
    return created;
  }

  async getEmailVerificationToken(token: string): Promise<EmailVerificationToken | undefined> {
    const [result] = await db.select().from(emailVerificationTokens).where(eq(emailVerificationTokens.token, token));
    return result || undefined;
  }

  async deleteEmailVerificationToken(token: string): Promise<void> {
    await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.token, token));
  }

  async deleteEmailVerificationTokensByUserId(userId: string): Promise<void> {
    await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.userId, userId));
  }

  // Cookie category methods
  async getCookieCategoriesByWebsiteId(websiteId: string): Promise<CookieCategory[]> {
    return await db.select().from(cookieCategories)
      .where(eq(cookieCategories.websiteId, websiteId))
      .orderBy(cookieCategories.sortOrder);
  }

  async getCookieCategoryById(id: string): Promise<CookieCategory | undefined> {
    const [category] = await db.select().from(cookieCategories).where(eq(cookieCategories.id, id));
    return category || undefined;
  }

  async createCookieCategory(category: InsertCookieCategory): Promise<CookieCategory> {
    const [created] = await db.insert(cookieCategories).values(category).returning();
    return created;
  }

  async updateCookieCategory(id: string, updates: Partial<CookieCategory>): Promise<CookieCategory> {
    const [updated] = await db.update(cookieCategories).set(updates).where(eq(cookieCategories.id, id)).returning();
    return updated;
  }

  async deleteCookieCategory(id: string): Promise<void> {
    await db.delete(cookieCategories).where(eq(cookieCategories.id, id));
  }

  async createDefaultCategoriesForWebsite(websiteId: string): Promise<CookieCategory[]> {
    const defaults: InsertCookieCategory[] = [
      {
        websiteId,
        name: 'necessary',
        displayName: 'Necessary Cookies',
        description: 'These cookies are essential for the website to function properly. They cannot be disabled.',
        isRequired: true,
        isEnabled: true,
        sortOrder: 0,
      },
      {
        websiteId,
        name: 'functional',
        displayName: 'Functional Cookies',
        description: 'These cookies enable personalized features and remember your preferences.',
        isRequired: false,
        isEnabled: true,
        sortOrder: 1,
      },
      {
        websiteId,
        name: 'analytics',
        displayName: 'Analytics Cookies',
        description: 'These cookies help us understand how visitors interact with our website.',
        isRequired: false,
        isEnabled: true,
        sortOrder: 2,
      },
      {
        websiteId,
        name: 'marketing',
        displayName: 'Marketing Cookies',
        description: 'These cookies are used to deliver personalized advertisements.',
        isRequired: false,
        isEnabled: true,
        sortOrder: 3,
      },
    ];

    const created = await db.insert(cookieCategories).values(defaults).returning();
    return created;
  }

  // Cookie methods
  async getCookiesByWebsiteId(websiteId: string): Promise<Cookie[]> {
    return await db.select().from(cookies).where(eq(cookies.websiteId, websiteId));
  }

  async getCookiesByCategoryId(categoryId: string): Promise<Cookie[]> {
    return await db.select().from(cookies).where(eq(cookies.categoryId, categoryId));
  }

  async getCookieById(id: string): Promise<Cookie | undefined> {
    const [cookie] = await db.select().from(cookies).where(eq(cookies.id, id));
    return cookie || undefined;
  }

  async createCookie(cookie: InsertCookie): Promise<Cookie> {
    const [created] = await db.insert(cookies).values(cookie).returning();
    return created;
  }

  async updateCookie(id: string, updates: Partial<Cookie>): Promise<Cookie> {
    const [updated] = await db.update(cookies).set(updates).where(eq(cookies.id, id)).returning();
    return updated;
  }

  async deleteCookie(id: string): Promise<void> {
    await db.delete(cookies).where(eq(cookies.id, id));
  }

  async deleteAutoDetectedCookies(websiteId: string): Promise<void> {
    await db.delete(cookies).where(
      and(
        eq(cookies.websiteId, websiteId),
        eq(cookies.isAutoDetected, true)
      )
    );
  }

  async replaceAutoDetectedCookies(websiteId: string, newCookies: InsertCookie[]): Promise<void> {
    await db.transaction(async (tx) => {
      // Delete existing auto-detected cookies
      await tx.delete(cookies).where(
        and(
          eq(cookies.websiteId, websiteId),
          eq(cookies.isAutoDetected, true)
        )
      );
      
      // Insert new cookies if any
      if (newCookies.length > 0) {
        await tx.insert(cookies).values(newCookies);
      }
    });
  }

  // Consent log methods
  async createConsentLog(log: InsertConsentLog): Promise<ConsentLog> {
    const [created] = await db.insert(consentLogs).values(log).returning();
    return created;
  }

  private buildConsentLogConditions(websiteId: string, filters?: ConsentLogFilters) {
    const conditions = [eq(consentLogs.websiteId, websiteId)];
    if (filters?.dateFrom) {
      conditions.push(gte(consentLogs.timestamp, filters.dateFrom));
    }
    if (filters?.dateTo) {
      conditions.push(lte(consentLogs.timestamp, filters.dateTo));
    }
    if (filters?.action) {
      conditions.push(eq(consentLogs.action, filters.action));
    }
    if (filters?.search) {
      conditions.push(like(consentLogs.visitorId, `%${filters.search}%`));
    }
    return and(...conditions);
  }

  async getConsentLogsByWebsiteId(websiteId: string, limit = 100, offset = 0, filters?: ConsentLogFilters): Promise<ConsentLog[]> {
    return await db.select().from(consentLogs)
      .where(this.buildConsentLogConditions(websiteId, filters))
      .orderBy(desc(consentLogs.timestamp))
      .limit(limit)
      .offset(offset);
  }

  async getConsentLogsCount(websiteId: string, filters?: ConsentLogFilters): Promise<number> {
    const result = await db.select({ count: count() }).from(consentLogs)
      .where(this.buildConsentLogConditions(websiteId, filters));
    return result[0]?.count || 0;
  }

  async getConsentLogsByDateRange(websiteId: string, startDate: Date, endDate: Date): Promise<ConsentLog[]> {
    return await db.select().from(consentLogs)
      .where(and(
        eq(consentLogs.websiteId, websiteId),
        gte(consentLogs.timestamp, startDate),
        lte(consentLogs.timestamp, endDate)
      ))
      .orderBy(desc(consentLogs.timestamp));
  }

  async getConsentLogStats(websiteId: string, filters?: ConsentLogFilters): Promise<ConsentLogStats> {
    const condition = this.buildConsentLogConditions(websiteId, filters);

    const actionCounts = await db
      .select({
        action: consentLogs.action,
        count: count(),
      })
      .from(consentLogs)
      .where(condition)
      .groupBy(consentLogs.action);

    let totalRecords = 0;
    let acceptCount = 0;
    let rejectCount = 0;
    let customCount = 0;
    let dismissedCount = 0;

    for (const row of actionCounts) {
      const c = row.count;
      totalRecords += c;
      if (row.action === 'accept_all') acceptCount = c;
      else if (row.action === 'reject_all') rejectCount = c;
      else if (row.action === 'custom') customCount = c;
      else if (row.action === 'dismissed') dismissedCount = c;
    }

    const acceptRate = totalRecords > 0 ? (acceptCount / totalRecords) * 100 : 0;
    const rejectRate = totalRecords > 0 ? (rejectCount / totalRecords) * 100 : 0;

    const mostCommonAction = actionCounts.length > 0
      ? actionCounts.reduce((a, b) => (a.count > b.count ? a : b)).action
      : 'none';

    let previousPeriodAcceptRate: number | null = null;
    let previousPeriodRejectRate: number | null = null;
    let trendAcceptRate: number | null = null;
    let trendRejectRate: number | null = null;

    if (filters?.dateFrom && filters?.dateTo) {
      const periodMs = filters.dateTo.getTime() - filters.dateFrom.getTime();
      const prevFrom = new Date(filters.dateFrom.getTime() - periodMs);
      const prevTo = new Date(filters.dateFrom.getTime());

      const prevCounts = await db
        .select({
          action: consentLogs.action,
          count: count(),
        })
        .from(consentLogs)
        .where(and(
          eq(consentLogs.websiteId, websiteId),
          gte(consentLogs.timestamp, prevFrom),
          lte(consentLogs.timestamp, prevTo),
        ))
        .groupBy(consentLogs.action);

      let prevTotal = 0;
      let prevAccept = 0;
      let prevReject = 0;
      for (const row of prevCounts) {
        prevTotal += row.count;
        if (row.action === 'accept_all') prevAccept = row.count;
        else if (row.action === 'reject_all') prevReject = row.count;
      }

      if (prevTotal > 0) {
        previousPeriodAcceptRate = (prevAccept / prevTotal) * 100;
        previousPeriodRejectRate = (prevReject / prevTotal) * 100;
        trendAcceptRate = acceptRate - previousPeriodAcceptRate;
        trendRejectRate = rejectRate - previousPeriodRejectRate;
      }
    }

    return {
      totalRecords,
      acceptCount,
      rejectCount,
      customCount,
      dismissedCount,
      acceptRate,
      rejectRate,
      mostCommonAction,
      previousPeriodAcceptRate,
      previousPeriodRejectRate,
      trendAcceptRate,
      trendRejectRate,
    };
  }

  // Diagnostic scan methods
  async createDiagnosticScan(scan: InsertDiagnosticScan): Promise<DiagnosticScan> {
    const [created] = await db.insert(diagnosticScans).values(scan).returning();
    return created;
  }

  async getDiagnosticScansByWebsiteId(websiteId: string): Promise<DiagnosticScan[]> {
    return await db.select().from(diagnosticScans)
      .where(eq(diagnosticScans.websiteId, websiteId))
      .orderBy(desc(diagnosticScans.scannedAt));
  }

  async getLatestDiagnosticScan(websiteId: string): Promise<DiagnosticScan | undefined> {
    const [scan] = await db.select().from(diagnosticScans)
      .where(eq(diagnosticScans.websiteId, websiteId))
      .orderBy(desc(diagnosticScans.scannedAt))
      .limit(1);
    return scan || undefined;
  }

  async updateDiagnosticScan(id: string, updates: Partial<DiagnosticScan>): Promise<DiagnosticScan> {
    const [updated] = await db.update(diagnosticScans).set(updates).where(eq(diagnosticScans.id, id)).returning();
    return updated;
  }

  // Web Vitals methods
  async createWebVitalsMetric(metric: InsertWebVitalsMetric): Promise<WebVitalsMetric> {
    const [created] = await db.insert(webVitalsMetrics).values(metric).returning();
    return created;
  }

  async getWebVitalsByWebsiteId(websiteId: string, daysBack = 7): Promise<WebVitalsMetric[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    return await db.select().from(webVitalsMetrics)
      .where(and(
        eq(webVitalsMetrics.websiteId, websiteId),
        gte(webVitalsMetrics.timestamp, startDate)
      ))
      .orderBy(desc(webVitalsMetrics.timestamp));
  }

  async getWebVitalsSummary(websiteId: string, daysBack = 7): Promise<{
    avgLcp: number | null;
    avgCls: number | null;
    avgInp: number | null;
    avgFcp: number | null;
    avgTtfb: number | null;
    avgBannerDelay: number | null;
    totalSamples: number;
    p75Lcp: number | null;
    p75Cls: number | null;
    p75Inp: number | null;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    const metrics = await db.select().from(webVitalsMetrics)
      .where(and(
        eq(webVitalsMetrics.websiteId, websiteId),
        gte(webVitalsMetrics.timestamp, startDate)
      ));
    
    if (metrics.length === 0) {
      return {
        avgLcp: null, avgCls: null, avgInp: null, avgFcp: null, avgTtfb: null,
        avgBannerDelay: null, totalSamples: 0, p75Lcp: null, p75Cls: null, p75Inp: null
      };
    }
    
    // Calculate averages
    const lcpValues = metrics.map(m => m.lcp).filter((v): v is number => v !== null);
    const clsValues = metrics.map(m => m.cls).filter((v): v is string => v !== null).map(v => parseFloat(v));
    const inpValues = metrics.map(m => m.inp).filter((v): v is number => v !== null);
    const fcpValues = metrics.map(m => m.fcp).filter((v): v is number => v !== null);
    const ttfbValues = metrics.map(m => m.ttfb).filter((v): v is number => v !== null);
    const delayValues = metrics.map(m => m.bannerDelay).filter((v): v is number => v !== null);
    
    const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;
    const p75 = (arr: number[]) => {
      if (arr.length === 0) return null;
      const sorted = [...arr].sort((a, b) => a - b);
      const index = Math.ceil(sorted.length * 0.75) - 1;
      return Math.round(sorted[index]);
    };
    
    return {
      avgLcp: avg(lcpValues),
      avgCls: clsValues.length > 0 ? Math.round(clsValues.reduce((a, b) => a + b, 0) / clsValues.length * 1000) / 1000 : null,
      avgInp: avg(inpValues),
      avgFcp: avg(fcpValues),
      avgTtfb: avg(ttfbValues),
      avgBannerDelay: avg(delayValues),
      totalSamples: metrics.length,
      p75Lcp: p75(lcpValues),
      p75Cls: clsValues.length > 0 ? Math.round(p75(clsValues.map(v => v * 1000))! / 1000 * 1000) / 1000 : null,
      p75Inp: p75(inpValues)
    };
  }
  
  // Agency methods
  async getAgencyById(id: string): Promise<Agency | undefined> {
    const [agency] = await db.select().from(agencies).where(eq(agencies.id, id));
    return agency || undefined;
  }
  
  async getAgencyBySlug(slug: string): Promise<Agency | undefined> {
    const [agency] = await db.select().from(agencies).where(eq(agencies.slug, slug));
    return agency || undefined;
  }
  
  async getAgencyByOwnerId(ownerId: string): Promise<Agency | undefined> {
    const [agency] = await db.select().from(agencies).where(eq(agencies.ownerId, ownerId));
    return agency || undefined;
  }
  
  async getFeaturedAgencies(): Promise<Agency[]> {
    return await db.select().from(agencies)
      .where(and(eq(agencies.isFeatured, true), eq(agencies.isActive, true)))
      .orderBy(agencies.featuredOrder);
  }
  
  async createAgency(agency: InsertAgency): Promise<Agency> {
    const [created] = await db.insert(agencies).values(agency).returning();
    return created;
  }
  
  async updateAgency(id: string, updates: Partial<Agency>): Promise<Agency> {
    const [updated] = await db.update(agencies).set(updates).where(eq(agencies.id, id)).returning();
    return updated;
  }
  
  async deleteAgency(id: string): Promise<void> {
    await db.delete(agencies).where(eq(agencies.id, id));
  }
  
  // Agency client methods
  async getAgencyClients(agencyId: string): Promise<(AgencyClient & { user: User })[]> {
    const results = await db.select({
      id: agencyClients.id,
      agencyId: agencyClients.agencyId,
      userId: agencyClients.userId,
      clientName: agencyClients.clientName,
      notes: agencyClients.notes,
      relationshipType: agencyClients.relationshipType,
      status: agencyClients.status,
      createdAt: agencyClients.createdAt,
      user: users,
    }).from(agencyClients)
      .innerJoin(users, eq(agencyClients.userId, users.id))
      .where(eq(agencyClients.agencyId, agencyId));
    
    return results;
  }
  
  async getAgencyClientById(id: string): Promise<AgencyClient | undefined> {
    const [client] = await db.select().from(agencyClients).where(eq(agencyClients.id, id));
    return client || undefined;
  }
  
  async getClientsByUserId(userId: string): Promise<(AgencyClient & { agency: Agency })[]> {
    const results = await db.select({
      id: agencyClients.id,
      agencyId: agencyClients.agencyId,
      userId: agencyClients.userId,
      clientName: agencyClients.clientName,
      notes: agencyClients.notes,
      relationshipType: agencyClients.relationshipType,
      status: agencyClients.status,
      createdAt: agencyClients.createdAt,
      agency: agencies,
    }).from(agencyClients)
      .innerJoin(agencies, eq(agencyClients.agencyId, agencies.id))
      .where(eq(agencyClients.userId, userId));
    
    return results;
  }
  
  async createAgencyClient(client: InsertAgencyClient): Promise<AgencyClient> {
    const [created] = await db.insert(agencyClients).values(client).returning();
    // Update agency stats
    await this.updateAgencyStats(client.agencyId);
    return created;
  }
  
  async updateAgencyClient(id: string, updates: Partial<AgencyClient>): Promise<AgencyClient> {
    const [updated] = await db.update(agencyClients).set(updates).where(eq(agencyClients.id, id)).returning();
    return updated;
  }
  
  async deleteAgencyClient(id: string): Promise<void> {
    const [client] = await db.select().from(agencyClients).where(eq(agencyClients.id, id));
    if (client) {
      await db.delete(agencyClients).where(eq(agencyClients.id, id));
      await this.updateAgencyStats(client.agencyId);
    }
  }
  
  // Agency member methods
  async getAgencyMembers(agencyId: string): Promise<(AgencyMember & { user: User })[]> {
    const results = await db.select({
      id: agencyMembers.id,
      agencyId: agencyMembers.agencyId,
      userId: agencyMembers.userId,
      role: agencyMembers.role,
      invitedBy: agencyMembers.invitedBy,
      invitedAt: agencyMembers.invitedAt,
      acceptedAt: agencyMembers.acceptedAt,
      user: users,
    }).from(agencyMembers)
      .innerJoin(users, eq(agencyMembers.userId, users.id))
      .where(eq(agencyMembers.agencyId, agencyId));
    
    return results;
  }
  
  async getAgencyMemberByUserId(agencyId: string, userId: string): Promise<AgencyMember | undefined> {
    const [member] = await db.select().from(agencyMembers)
      .where(and(eq(agencyMembers.agencyId, agencyId), eq(agencyMembers.userId, userId)));
    return member || undefined;
  }
  
  async createAgencyMember(member: InsertAgencyMember): Promise<AgencyMember> {
    const [created] = await db.insert(agencyMembers).values(member).returning();
    return created;
  }
  
  async updateAgencyMember(id: string, updates: Partial<AgencyMember>): Promise<AgencyMember> {
    const [updated] = await db.update(agencyMembers).set(updates).where(eq(agencyMembers.id, id)).returning();
    return updated;
  }
  
  async deleteAgencyMember(id: string): Promise<void> {
    await db.delete(agencyMembers).where(eq(agencyMembers.id, id));
  }
  
  // Agency invite methods
  async getAgencyInviteById(id: string): Promise<AgencyInvite | undefined> {
    const [invite] = await db.select().from(agencyInvites).where(eq(agencyInvites.id, id));
    return invite || undefined;
  }

  async getAgencyInviteByToken(token: string): Promise<AgencyInvite | undefined> {
    const [invite] = await db.select().from(agencyInvites).where(eq(agencyInvites.token, token));
    return invite || undefined;
  }
  
  async getAgencyInvitesByAgencyId(agencyId: string): Promise<AgencyInvite[]> {
    return await db.select().from(agencyInvites)
      .where(eq(agencyInvites.agencyId, agencyId))
      .orderBy(desc(agencyInvites.createdAt));
  }
  
  async createAgencyInvite(invite: InsertAgencyInvite): Promise<AgencyInvite> {
    const [created] = await db.insert(agencyInvites).values(invite).returning();
    return created;
  }
  
  async updateAgencyInvite(id: string, updates: Partial<AgencyInvite>): Promise<AgencyInvite> {
    const [updated] = await db.update(agencyInvites).set(updates).where(eq(agencyInvites.id, id)).returning();
    return updated;
  }

  async deleteAgencyInvite(id: string): Promise<void> {
    await db.delete(agencyInvites).where(eq(agencyInvites.id, id));
  }
  
  async deleteExpiredAgencyInvites(agencyId: string): Promise<void> {
    await db.delete(agencyInvites)
      .where(and(
        eq(agencyInvites.agencyId, agencyId),
        sql`${agencyInvites.expiresAt} < NOW()`
      ));
  }
  
  // Agency stats
  async updateAgencyStats(agencyId: string): Promise<void> {
    // Count clients
    const [clientResult] = await db.select({ count: count() })
      .from(agencyClients)
      .where(and(
        eq(agencyClients.agencyId, agencyId),
        eq(agencyClients.status, 'active')
      ));
    
    // Count websites across all clients
    const clientIds = await db.select({ userId: agencyClients.userId })
      .from(agencyClients)
      .where(eq(agencyClients.agencyId, agencyId));
    
    let totalWebsites = 0;
    for (const client of clientIds) {
      const [websiteResult] = await db.select({ count: count() })
        .from(websites)
        .where(eq(websites.userId, client.userId));
      totalWebsites += websiteResult.count;
    }
    
    await db.update(agencies).set({
      clientCount: clientResult.count,
      totalWebsites: totalWebsites,
    }).where(eq(agencies.id, agencyId));
  }
  
  // Policy purchase methods
  async getPolicyPurchasesByUserId(userId: string): Promise<PolicyPurchase[]> {
    return await db.select().from(policyPurchases)
      .where(eq(policyPurchases.userId, userId))
      .orderBy(desc(policyPurchases.purchasedAt));
  }
  
  async getPolicyPurchase(userId: string, type: string): Promise<PolicyPurchase | undefined> {
    const [purchase] = await db.select().from(policyPurchases)
      .where(and(
        eq(policyPurchases.userId, userId), 
        eq(policyPurchases.type, type),
        eq(policyPurchases.status, 'completed')
      ));
    return purchase || undefined;
  }
  
  async createPolicyPurchase(purchase: InsertPolicyPurchase): Promise<PolicyPurchase> {
    const [created] = await db.insert(policyPurchases).values(purchase).returning();
    return created;
  }
  
  async updatePolicyPurchase(id: string, updates: Partial<PolicyPurchase>): Promise<PolicyPurchase> {
    const [updated] = await db.update(policyPurchases).set(updates).where(eq(policyPurchases.id, id)).returning();
    return updated;
  }
  
  async hasPolicyAccess(userId: string, type: 'privacy' | 'cookie'): Promise<boolean> {
    const purchase = await this.getPolicyPurchase(userId, type);
    return purchase !== undefined;
  }
  
  // Policy methods
  async getPoliciesByWebsiteId(websiteId: string): Promise<Policy[]> {
    return await db.select().from(policies)
      .where(eq(policies.websiteId, websiteId))
      .orderBy(desc(policies.createdAt));
  }
  
  async getPolicyById(id: string): Promise<Policy | undefined> {
    const [policy] = await db.select().from(policies).where(eq(policies.id, id));
    return policy || undefined;
  }
  
  async getPolicyByWebsiteAndType(websiteId: string, type: string): Promise<Policy | undefined> {
    const [policy] = await db.select().from(policies)
      .where(and(eq(policies.websiteId, websiteId), eq(policies.type, type)));
    return policy || undefined;
  }
  
  async createPolicy(policy: InsertPolicy): Promise<Policy> {
    const [created] = await db.insert(policies).values(policy).returning();
    return created;
  }
  
  async updatePolicy(id: string, updates: Partial<Policy>): Promise<Policy> {
    const [updated] = await db.update(policies).set(updates).where(eq(policies.id, id)).returning();
    return updated;
  }
  
  async deletePolicy(id: string): Promise<void> {
    await db.delete(policies).where(eq(policies.id, id));
  }
  
  // Daily scan count methods
  async getDailyCookieScanCount(userId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const result = await db.select({ count: count() }).from(websites)
      .where(and(eq(websites.userId, userId), gte(websites.lastScan, startOfDay)));
    return result[0]?.count || 0;
  }

  async getDailyDiagnosticScanCount(userId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const result = await db.select({ count: count() }).from(diagnosticScans)
      .innerJoin(websites, eq(diagnosticScans.websiteId, websites.id))
      .where(and(eq(websites.userId, userId), gte(diagnosticScans.scannedAt, startOfDay)));
    return result[0]?.count || 0;
  }

  // Policy generation log methods
  async getMonthlyPolicyGenerations(userId: string, agencyId?: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const conditions = [
      eq(policyGenerationLogs.userId, userId),
      gte(policyGenerationLogs.createdAt, startOfMonth)
    ];
    
    if (agencyId) {
      conditions.push(eq(policyGenerationLogs.agencyId, agencyId));
    }
    
    const result = await db.select({ count: count() })
      .from(policyGenerationLogs)
      .where(and(...conditions));
    
    return result[0]?.count || 0;
  }
  
  async createPolicyGenerationLog(log: InsertPolicyGenerationLog): Promise<PolicyGenerationLog> {
    const [created] = await db.insert(policyGenerationLogs).values(log).returning();
    return created;
  }

  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [created] = await db.insert(contactSubmissions).values(submission).returning();
    return created;
  }

  async getContactSubmissions(limit = 50, offset = 0): Promise<ContactSubmission[]> {
    return db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt)).limit(limit).offset(offset);
  }

  async getContactSubmissionByEmail(email: string): Promise<ContactSubmission[]> {
    return db.select().from(contactSubmissions).where(eq(contactSubmissions.email, email)).orderBy(desc(contactSubmissions.createdAt));
  }

  // API key methods (ConsentEase Connect)
  async createApiKey(params: CreateApiKeyParams): Promise<ApiKey> {
    const [created] = await db
      .insert(apiKeys)
      .values({
        userId: params.userId,
        name: params.name,
        keyId: params.keyId,
        keyPrefix: params.keyPrefix,
        secretHash: params.secretHash,
        scopes: params.scopes ?? [],
        rateTier: params.rateTier ?? "standard",
        expiresAt: params.expiresAt ?? null,
        rotatedFromKeyId: params.rotatedFromKeyId ?? null,
      })
      .returning();
    return created;
  }

  async getApiKeyByKeyId(keyId: string): Promise<ApiKey | undefined> {
    const [row] = await db.select().from(apiKeys).where(eq(apiKeys.keyId, keyId));
    return row || undefined;
  }

  async getApiKeyById(id: string): Promise<ApiKey | undefined> {
    const [row] = await db.select().from(apiKeys).where(eq(apiKeys.id, id));
    return row || undefined;
  }

  async listApiKeysByUserId(userId: string): Promise<PublicApiKey[]> {
    // Explicit projection: secretHash is never pulled from the DB for listing, so it
    // cannot leak through route serialization (threat_model.md, Information Disclosure).
    return await db
      .select({
        id: apiKeys.id,
        userId: apiKeys.userId,
        name: apiKeys.name,
        keyId: apiKeys.keyId,
        keyPrefix: apiKeys.keyPrefix,
        scopes: apiKeys.scopes,
        rateTier: apiKeys.rateTier,
        lastUsedAt: apiKeys.lastUsedAt,
        expiresAt: apiKeys.expiresAt,
        revokedAt: apiKeys.revokedAt,
        rotatedFromKeyId: apiKeys.rotatedFromKeyId,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(desc(apiKeys.createdAt));
  }

  async revokeApiKey(id: string, userId: string): Promise<ApiKey | undefined> {
    // Scoped to the owner (userId) so one user can never revoke another's key.
    // isNull(revokedAt) makes revocation idempotent — re-revoking returns undefined.
    const [updated] = await db
      .update(apiKeys)
      .set({ revokedAt: new Date() })
      .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId), isNull(apiKeys.revokedAt)))
      .returning();
    return updated || undefined;
  }

  // Rotate a key: mint a replacement (linked via rotatedFromKeyId) while the old key
  // keeps working for a bounded grace window, then auto-expires. We set the old key's
  // expiresAt = now + grace rather than revokedAt = now so in-flight clients are not
  // broken mid-request; auth rejects it once the window passes (see apiKeyAuth). Both
  // writes run in one transaction so a partial rotation can never leave an orphaned or
  // un-expired old key. Returns undefined if the key is missing, not owned, or already
  // revoked (a revoked key cannot be rotated — create a fresh one instead).
  async rotateApiKey(
    params: RotateApiKeyParams,
  ): Promise<{ ok: true; newKey: ApiKey } | { ok: false; reason: "not_found" | "cap_exceeded" }> {
    const DEFAULT_ROTATION_GRACE_MS = 24 * 60 * 60 * 1000; // 24h
    const graceMs = params.graceMs ?? DEFAULT_ROTATION_GRACE_MS;

    return await db.transaction(async (tx) => {
      // Lock the predecessor row FOR UPDATE so two concurrent rotations (or a
      // double-clicked button) serialize here instead of each minting a replacement
      // key. The second caller blocks until the first commits, then re-reads the
      // now-rotated predecessor and is stopped by the successor check below.
      const [old] = await tx
        .select()
        .from(apiKeys)
        .where(and(eq(apiKeys.id, params.id), eq(apiKeys.userId, params.userId), isNull(apiKeys.revokedAt)))
        .for("update");
      if (!old) return { ok: false, reason: "not_found" };

      // An already-expired key is dead — the caller should mint a fresh one, not rotate.
      if (old.expiresAt && old.expiresAt.getTime() <= Date.now()) return { ok: false, reason: "not_found" };

      // One successor per predecessor: if a non-revoked replacement already exists this
      // key was already rotated, so do not mint another. Combined with the row lock
      // above, this makes rotation idempotent under concurrency.
      const [existingSuccessor] = await tx
        .select({ id: apiKeys.id })
        .from(apiKeys)
        .where(and(eq(apiKeys.rotatedFromKeyId, old.id), isNull(apiKeys.revokedAt)));
      if (existingSuccessor) return { ok: false, reason: "not_found" };

      // Cap enforcement: rotation mints a successor while the predecessor stays valid
      // through its grace window, so it transiently ADDS one valid key. Without this
      // check a user could rotate the newest active key over and over, stacking
      // unbounded still-valid grace keys and bypassing the create-path ceiling. We
      // count currently-valid (non-revoked, non-expired) keys — which includes the
      // predecessor — and reject when adding the successor would exceed the limit,
      // keeping total valid keys <= maxValidKeys even during a grace window.
      const now = Date.now();
      const ownerKeys = await tx
        .select({ expiresAt: apiKeys.expiresAt })
        .from(apiKeys)
        .where(and(eq(apiKeys.userId, params.userId), isNull(apiKeys.revokedAt)));
      const validCount = ownerKeys.filter(
        (k) => !k.expiresAt || k.expiresAt.getTime() > now,
      ).length;
      if (validCount >= params.maxValidKeys) return { ok: false, reason: "cap_exceeded" };

      // Bring the old key's expiry forward to the grace deadline, but never EXTEND an
      // existing sooner expiry (a key already expiring before the window stays as-is).
      const graceExpiry = new Date(Date.now() + graceMs);
      const oldExpiry =
        old.expiresAt && old.expiresAt.getTime() < graceExpiry.getTime() ? old.expiresAt : graceExpiry;
      await tx.update(apiKeys).set({ expiresAt: oldExpiry }).where(eq(apiKeys.id, old.id));

      const [newKey] = await tx
        .insert(apiKeys)
        .values({
          userId: old.userId,
          name: old.name,
          keyId: params.keyId,
          keyPrefix: params.keyPrefix,
          secretHash: params.secretHash,
          scopes: old.scopes ?? [],
          rateTier: old.rateTier,
          expiresAt: null,
          rotatedFromKeyId: old.id,
        })
        .returning();

      return { ok: true, newKey };
    });
  }

  async touchApiKeyLastUsed(id: string): Promise<void> {
    await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, id));
  }

  async recordApiUsageEvent(params: RecordApiUsageParams): Promise<{ event: ApiUsageEvent; deduped: boolean; conflict: boolean }> {
    const values = {
      apiKeyId: params.apiKeyId,
      userId: params.userId,
      websiteId: params.websiteId ?? null,
      action: params.action,
      billableUnits: params.billableUnits ?? 0,
      idempotencyKey: params.idempotencyKey ?? null,
      status: params.status ?? "ok",
    };
    if (values.idempotencyKey) {
      // De-dupe billable retries on (apiKeyId, idempotencyKey). NULL keys are
      // treated as distinct by Postgres, so this path is only taken when a key
      // is supplied (see threat_model.md, Repudiation).
      const [inserted] = await db
        .insert(apiUsageEvents)
        .values(values)
        .onConflictDoNothing({ target: [apiUsageEvents.apiKeyId, apiUsageEvents.idempotencyKey] })
        .returning();
      if (inserted) return { event: inserted, deduped: false, conflict: false };
      // Key already used. conflict=true means it was reused for a DIFFERENT action;
      // a route should reject that (409) rather than silently treat it as a replay.
      const [existing] = await db
        .select()
        .from(apiUsageEvents)
        .where(and(eq(apiUsageEvents.apiKeyId, values.apiKeyId), eq(apiUsageEvents.idempotencyKey, values.idempotencyKey)));
      return { event: existing, deduped: true, conflict: existing ? existing.action !== values.action : false };
    }
    const [created] = await db.insert(apiUsageEvents).values(values).returning();
    return { event: created, deduped: false, conflict: false };
  }

  // Read-only lookup of a prior usage event by its idempotency key. Used by the
  // /api/v1 consent route to detect a replay BEFORE writing the consent record, so
  // a retried request is neither duplicated nor lost (the insert in
  // recordApiUsageEvent only runs on the first, non-replayed call).
  async getApiUsageEventByIdempotency(apiKeyId: string, idempotencyKey: string): Promise<ApiUsageEvent | undefined> {
    const [row] = await db
      .select()
      .from(apiUsageEvents)
      .where(and(eq(apiUsageEvents.apiKeyId, apiKeyId), eq(apiUsageEvents.idempotencyKey, idempotencyKey)))
      .limit(1);
    return row;
  }
}

export const storage = new DatabaseStorage();
