import { users, websites, bannerConfigs, analyticsEvents, passwordResetTokens, emailVerificationTokens, cookieCategories, cookies, consentLogs, diagnosticScans, webVitalsMetrics, type User, type InsertUser, type Website, type InsertWebsite, type BannerConfig, type InsertBannerConfig, type AnalyticsEvent, type InsertAnalyticsEvent, type PasswordResetToken, type EmailVerificationToken, type CookieCategory, type InsertCookieCategory, type Cookie, type InsertCookie, type ConsentLog, type InsertConsentLog, type DiagnosticScan, type InsertDiagnosticScan, type WebVitalsMetric, type InsertWebVitalsMetric } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, desc, sql, count } from "drizzle-orm";

// Plan limits configuration
// Using -1 to represent unlimited for JSON serialization
export const PLAN_LIMITS = {
  solo: { websites: 1, monthlyViews: 10000 },
  pro: { websites: 5, monthlyViews: 100000 },
  agency: { websites: -1, monthlyViews: 1000000 }, // -1 = unlimited
} as const;

export function isUnlimited(limit: number): boolean {
  return limit === -1;
}

export type PlanType = keyof typeof PLAN_LIMITS;

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByStripeCustomerId(customerId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  updateSubscriptionStatus(userId: string, status: string, endDate?: Date): Promise<User>;
  
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
  getAnalyticsSummary(websiteId: string, daysBack: number): Promise<{
    totalViews: number;
    acceptRate: number;
    rejectRate: number;
    dailyStats: Array<{ date: string; views: number; accepts: number; rejects: number }>;
    countryBreakdown: Array<{ country: string; count: number }>;
  }>;
  getMonthlyViewsForUser(userId: string): Promise<number>;
  
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
  getConsentLogsByWebsiteId(websiteId: string, limit?: number, offset?: number): Promise<ConsentLog[]>;
  getConsentLogsCount(websiteId: string): Promise<number>;
  getConsentLogsByDateRange(websiteId: string, startDate: Date, endDate: Date): Promise<ConsentLog[]>;
  
  // Diagnostic scan methods
  createDiagnosticScan(scan: InsertDiagnosticScan): Promise<DiagnosticScan>;
  getDiagnosticScansByWebsiteId(websiteId: string): Promise<DiagnosticScan[]>;
  getLatestDiagnosticScan(websiteId: string): Promise<DiagnosticScan | undefined>;
  updateDiagnosticScan(id: string, updates: Partial<DiagnosticScan>): Promise<DiagnosticScan>;
  
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
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
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
    dailyStats: Array<{ date: string; views: number; accepts: number; rejects: number }>;
    countryBreakdown: Array<{ country: string; count: number }>;
  }> {
    const since = new Date();
    since.setDate(since.getDate() - daysBack);

    const events = await this.getAnalyticsByWebsiteId(websiteId, daysBack);

    const totalViews = events.filter(e => e.eventType === 'banner_shown').length;
    const accepts = events.filter(e => e.eventType === 'accept').length;
    const rejects = events.filter(e => e.eventType === 'reject').length;

    // Daily stats
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

    // Country breakdown
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
      dailyStats,
      countryBreakdown,
    };
  }

  async updateUserStripeInfo(userId: string, stripeInfo: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  }): Promise<User> {
    const [updated] = await db.update(users).set(stripeInfo).where(eq(users.id, userId)).returning();
    return updated;
  }

  async getMonthlyViewsForUser(userId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const userWebsites = await this.getWebsitesByUserId(userId);
    if (userWebsites.length === 0) return 0;

    const websiteIds = userWebsites.map(w => w.id);
    
    const result = await db
      .select({ count: count() })
      .from(analyticsEvents)
      .where(
        and(
          sql`${analyticsEvents.websiteId} = ANY(ARRAY[${sql.raw(websiteIds.map(id => `'${id}'`).join(','))}]::varchar[])`,
          eq(analyticsEvents.eventType, 'banner_shown'),
          gte(analyticsEvents.timestamp, startOfMonth)
        )
      );
    
    return result[0]?.count || 0;
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

  async getConsentLogsByWebsiteId(websiteId: string, limit = 100, offset = 0): Promise<ConsentLog[]> {
    return await db.select().from(consentLogs)
      .where(eq(consentLogs.websiteId, websiteId))
      .orderBy(desc(consentLogs.timestamp))
      .limit(limit)
      .offset(offset);
  }

  async getConsentLogsCount(websiteId: string): Promise<number> {
    const result = await db.select({ count: count() }).from(consentLogs)
      .where(eq(consentLogs.websiteId, websiteId));
    return result[0]?.count || 0;
  }

  async getConsentLogsByDateRange(websiteId: string, startDate: Date, endDate: Date): Promise<ConsentLog[]> {
    return await db.select().from(consentLogs)
      .where(and(
        eq(consentLogs.websiteId, websiteId),
        gte(consentLogs.timestamp, startDate),
        sql`${consentLogs.timestamp} <= ${endDate}`
      ))
      .orderBy(desc(consentLogs.timestamp));
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
}

export const storage = new DatabaseStorage();
