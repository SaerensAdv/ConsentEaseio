import { users, websites, bannerConfigs, analyticsEvents, type User, type InsertUser, type Website, type InsertWebsite, type BannerConfig, type InsertBannerConfig, type AnalyticsEvent, type InsertAnalyticsEvent } from "@shared/schema";
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
}

export const storage = new DatabaseStorage();
