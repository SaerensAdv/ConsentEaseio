import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, PLAN_LIMITS, type PlanType, isUnlimited } from "./storage";
import { insertWebsiteSchema, insertBannerConfigSchema, insertAnalyticsEventSchema, insertCookieCategorySchema, insertCookieSchema } from "@shared/schema";
import { z } from "zod";
import { generateBannerScript } from "./banner-script";
import { stripeService } from "./stripeService";
import { getStripePublishableKey } from "./stripeClient";
import { scanWebsite, type ClassifiedCookie } from "./cookie-scanner";

// Helper to generate random public IDs
function generatePublicId(): string {
  return Array.from({ length: 12 }, () => 
    Math.random().toString(36).substring(2)
  ).join('').substring(0, 12);
}

// Helper to run cookie scan and store results
async function runCookieScan(websiteId: string, domain: string): Promise<void> {
  try {
    console.log(`Starting cookie scan for ${domain}...`);
    const result = await scanWebsite(domain);
    
    if (!result.success) {
      console.error(`Scan failed for ${domain}:`, result.error);
      await storage.updateWebsite(websiteId, {
        status: "attention",
        lastScan: new Date(),
        cookiesFound: 0,
      });
      return;
    }
    
    // Get categories for this website
    const categories = await storage.getCookieCategoriesByWebsiteId(websiteId);
    const categoryMap = new Map(categories.map(c => [c.name, c.id]));
    
    // Prepare cookies to insert
    const cookiesToInsert = result.cookies
      .filter(cookie => categoryMap.has(cookie.category))
      .map(cookie => ({
        websiteId,
        categoryId: categoryMap.get(cookie.category)!,
        name: cookie.name,
        provider: cookie.provider,
        purpose: cookie.purpose,
        expiry: cookie.expiry,
        type: cookie.type,
        isAutoDetected: true,
      }));
    
    // Use atomic operation to delete old and insert new cookies
    await storage.replaceAutoDetectedCookies(websiteId, cookiesToInsert);
    
    // Update website status after successful cookie storage
    await storage.updateWebsite(websiteId, {
      status: "compliant",
      lastScan: new Date(),
      cookiesFound: result.cookies.length,
    });
    
    console.log(`Scan completed for ${domain}: ${result.cookies.length} cookies found`);
  } catch (error) {
    console.error(`Scan error for ${domain}:`, error);
    await storage.updateWebsite(websiteId, {
      status: "attention",
      lastScan: new Date(),
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Websites endpoints
  app.get("/api/websites", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const websites = await storage.getWebsitesByUserId(req.user.id);
      res.json(websites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch websites" });
    }
  });

  app.post("/api/websites", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Check plan limits
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      
      const plan = (user.plan || 'solo') as PlanType;
      const limits = PLAN_LIMITS[plan];
      const currentCount = await storage.countWebsitesByUserId(req.user.id);
      
      if (!isUnlimited(limits.websites) && currentCount >= limits.websites) {
        return res.status(403).json({ 
          error: "Website limit reached",
          message: `Your ${plan} plan allows ${limits.websites} website${limits.websites === 1 ? '' : 's'}. Please upgrade to add more.`,
          currentCount,
          limit: limits.websites,
          plan 
        });
      }
      
      const validated = insertWebsiteSchema.parse({
        ...req.body,
        userId: req.user.id,
        publicId: generatePublicId(),
        status: "scanning", // Start with scanning status
      });
      
      const website = await storage.createWebsite(validated);
      
      // Create default banner config for the website (uses schema defaults)
      await storage.createBannerConfig({ websiteId: website.id });
      
      // Create default cookie categories for the website
      await storage.createDefaultCategoriesForWebsite(website.id);
      
      // Run cookie scan in background
      runCookieScan(website.id, website.domain).catch(err => {
        console.error('Background scan error:', err);
      });
      
      res.status(201).json(website);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create website" });
    }
  });

  app.patch("/api/websites/:id", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const website = await storage.getWebsiteById(req.params.id);
      if (!website || website.userId !== req.user.id) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      const updated = await storage.updateWebsite(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update website" });
    }
  });

  app.delete("/api/websites/:id", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const website = await storage.getWebsiteById(req.params.id);
      if (!website || website.userId !== req.user.id) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      await storage.deleteWebsite(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete website" });
    }
  });

  // Rescan website cookies
  app.post("/api/websites/:id/scan", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const website = await storage.getWebsiteById(req.params.id);
      if (!website || website.userId !== req.user.id) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      // Set status to scanning
      await storage.updateWebsite(website.id, { status: "scanning" });
      
      // Run scan in background
      runCookieScan(website.id, website.domain).catch(err => {
        console.error('Rescan error:', err);
      });
      
      res.json({ message: "Scan started", status: "scanning" });
    } catch (error) {
      res.status(500).json({ error: "Failed to start scan" });
    }
  });

  // Usage endpoint - shows current plan usage
  app.get("/api/usage", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      
      const plan = (user.plan || 'solo') as PlanType;
      const limits = PLAN_LIMITS[plan];
      const websiteCount = await storage.countWebsitesByUserId(req.user.id);
      const monthlyViews = await storage.getMonthlyViewsForUser(req.user.id);
      
      const websitesUnlimited = isUnlimited(limits.websites);
      
      res.json({
        plan,
        websites: {
          used: websiteCount,
          limit: websitesUnlimited ? 'unlimited' : limits.websites,
          remaining: websitesUnlimited ? 'unlimited' : Math.max(0, limits.websites - websiteCount),
          unlimited: websitesUnlimited,
        },
        views: {
          used: monthlyViews,
          limit: limits.monthlyViews,
          remaining: Math.max(0, limits.monthlyViews - monthlyViews),
          percentUsed: limits.monthlyViews > 0 ? Math.round((monthlyViews / limits.monthlyViews) * 100) : 0,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch usage" });
    }
  });

  // Banner config endpoints
  app.get("/api/websites/:id/banner", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const website = await storage.getWebsiteById(req.params.id);
      if (!website || website.userId !== req.user.id) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      const config = await storage.getBannerConfigByWebsiteId(req.params.id);
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch banner config" });
    }
  });

  app.patch("/api/websites/:id/banner", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const website = await storage.getWebsiteById(req.params.id);
      if (!website || website.userId !== req.user.id) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      const updated = await storage.updateBannerConfig(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update banner config" });
    }
  });

  // Analytics endpoints
  app.get("/api/websites/:id/analytics", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const website = await storage.getWebsiteById(req.params.id);
      if (!website || website.userId !== req.user.id) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      const daysBack = parseInt(req.query.days as string) || 14;
      const summary = await storage.getAnalyticsSummary(req.params.id, daysBack);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // CORS preflight for analytics endpoint
  app.options("/api/analytics/event", (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send();
  });

  // Public endpoint for recording consent events (no auth needed)
  // Accepts publicId and resolves to internal websiteId
  app.post("/api/analytics/event", async (req, res) => {
    // Allow cross-origin requests for analytics tracking
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    try {
      const { websiteId: publicId, eventType, country } = req.body;
      
      if (!publicId || !eventType) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      // Resolve publicId to internal websiteId
      const website = await storage.getWebsiteByPublicId(publicId);
      if (!website) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      const event = await storage.createAnalyticsEvent({
        websiteId: website.id,
        eventType,
        country: country || null,
      });
      
      res.status(201).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  // Public endpoint to serve the consent banner script
  app.get("/api/consent/:publicId/script.js", async (req, res) => {
    // Allow cross-origin requests for the banner script
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    
    try {
      const website = await storage.getWebsiteByPublicId(req.params.publicId);
      if (!website) {
        return res.status(404).type('application/javascript').send('// ConsentEase: Website not found. Please check your publicId.');
      }
      
      const config = await storage.getBannerConfigByWebsiteId(website.id);
      if (!config) {
        return res.status(404).type('application/javascript').send('// ConsentEase: Banner config not found. Please configure your banner first.');
      }
      
      // Check user's plan to determine if branding should be shown
      const user = await storage.getUser(website.userId);
      const showBranding = !user || user.plan === 'solo'; // Solo shows branding, Pro/Agency can hide it
      
      const script = generateBannerScript(config, website.publicId, showBranding);
      res.type('application/javascript').send(script);
    } catch (error) {
      console.error('Error generating banner script:', error);
      res.status(500).type('application/javascript').send('// ConsentEase: Error loading banner script');
    }
  });

  // Cookie category endpoints
  app.get("/api/websites/:id/cookie-categories", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const website = await storage.getWebsiteById(req.params.id);
      if (!website || website.userId !== req.user.id) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      const categories = await storage.getCookieCategoriesByWebsiteId(website.id);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cookie categories" });
    }
  });

  app.post("/api/websites/:id/cookie-categories", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const website = await storage.getWebsiteById(req.params.id);
      if (!website || website.userId !== req.user.id) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      const validated = insertCookieCategorySchema.parse({
        ...req.body,
        websiteId: website.id,
      });
      
      const category = await storage.createCookieCategory(validated);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create cookie category" });
    }
  });

  app.patch("/api/cookie-categories/:id", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const category = await storage.getCookieCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      const website = await storage.getWebsiteById(category.websiteId);
      if (!website || website.userId !== req.user.id) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      // Prevent modifying required status for necessary cookies
      if (category.name === 'necessary' && req.body.isRequired === false) {
        return res.status(400).json({ error: "Necessary cookies cannot be made optional" });
      }
      
      const updated = await storage.updateCookieCategory(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update cookie category" });
    }
  });

  app.delete("/api/cookie-categories/:id", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const category = await storage.getCookieCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      const website = await storage.getWebsiteById(category.websiteId);
      if (!website || website.userId !== req.user.id) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      // Prevent deleting default categories
      if (['necessary', 'functional', 'analytics', 'marketing'].includes(category.name)) {
        return res.status(400).json({ error: "Cannot delete default cookie categories" });
      }
      
      await storage.deleteCookieCategory(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete cookie category" });
    }
  });

  // Cookie endpoints
  app.get("/api/websites/:id/cookies", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const website = await storage.getWebsiteById(req.params.id);
      if (!website || website.userId !== req.user.id) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      const cookies = await storage.getCookiesByWebsiteId(website.id);
      res.json(cookies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cookies" });
    }
  });

  app.post("/api/websites/:id/cookies", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const website = await storage.getWebsiteById(req.params.id);
      if (!website || website.userId !== req.user.id) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      // Verify the category belongs to this website
      const category = await storage.getCookieCategoryById(req.body.categoryId);
      if (!category || category.websiteId !== website.id) {
        return res.status(400).json({ error: "Invalid category" });
      }
      
      const validated = insertCookieSchema.parse({
        ...req.body,
        websiteId: website.id,
      });
      
      const cookie = await storage.createCookie(validated);
      res.status(201).json(cookie);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create cookie" });
    }
  });

  app.patch("/api/cookies/:id", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const cookie = await storage.getCookieById(req.params.id);
      if (!cookie) {
        return res.status(404).json({ error: "Cookie not found" });
      }
      
      const website = await storage.getWebsiteById(cookie.websiteId);
      if (!website || website.userId !== req.user.id) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      // If changing category, verify the new category belongs to this website
      if (req.body.categoryId) {
        const category = await storage.getCookieCategoryById(req.body.categoryId);
        if (!category || category.websiteId !== website.id) {
          return res.status(400).json({ error: "Invalid category" });
        }
      }
      
      const updated = await storage.updateCookie(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update cookie" });
    }
  });

  app.delete("/api/cookies/:id", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const cookie = await storage.getCookieById(req.params.id);
      if (!cookie) {
        return res.status(404).json({ error: "Cookie not found" });
      }
      
      const website = await storage.getWebsiteById(cookie.websiteId);
      if (!website || website.userId !== req.user.id) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      await storage.deleteCookie(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete cookie" });
    }
  });

  // Public endpoint to get cookie categories and cookies for consent modal
  app.get("/api/consent/:publicId/categories", async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    
    try {
      const website = await storage.getWebsiteByPublicId(req.params.publicId);
      if (!website) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      const categories = await storage.getCookieCategoriesByWebsiteId(website.id);
      const cookies = await storage.getCookiesByWebsiteId(website.id);
      
      // Group cookies by category
      const categoriesWithCookies = categories.map(cat => ({
        ...cat,
        cookies: cookies.filter(c => c.categoryId === cat.id),
      }));
      
      res.json(categoriesWithCookies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch consent data" });
    }
  });

  // User profile endpoint
  app.get("/api/user/profile", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Don't send password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  });

  // Stripe endpoints
  app.get("/api/stripe/config", async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      res.status(500).json({ error: "Failed to get Stripe config" });
    }
  });

  app.get("/api/stripe/products", async (req, res) => {
    try {
      const rows = await stripeService.listProductsWithPrices();
      
      const productsMap = new Map();
      for (const row of rows as any[]) {
        if (!productsMap.has(row.product_id)) {
          productsMap.set(row.product_id, {
            id: row.product_id,
            name: row.product_name,
            description: row.product_description,
            active: row.product_active,
            metadata: row.product_metadata,
            prices: []
          });
        }
        if (row.price_id) {
          productsMap.get(row.product_id).prices.push({
            id: row.price_id,
            unit_amount: row.unit_amount,
            currency: row.currency,
            recurring: row.recurring,
            active: row.price_active,
          });
        }
      }

      res.json({ data: Array.from(productsMap.values()) });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/stripe/checkout", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { planId, priceId } = req.body;
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripeService.createCustomer(user.email, user.id);
        await storage.updateUserStripeInfo(user.id, { stripeCustomerId: customer.id });
        customerId = customer.id;
      }

      let finalPriceId = priceId;
      
      if (!finalPriceId && planId) {
        const planPrices: Record<string, number> = {
          solo: 500,
          pro: 1200,
          agency: 3900,
        };
        const targetAmount = planPrices[planId];
        
        if (targetAmount) {
          const stripe = await import('./stripeClient').then(m => m.getStripeClient());
          const prices = await stripe.prices.list({ active: true, limit: 100 });
          const matchingPrice = prices.data.find(
            p => p.unit_amount === targetAmount && p.currency === 'eur' && p.recurring?.interval === 'month'
          );
          finalPriceId = matchingPrice?.id;
        }
      }
      
      if (!finalPriceId) {
        return res.status(400).json({ error: "No valid price found for this plan" });
      }

      const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
      const session = await stripeService.createCheckoutSession(
        customerId,
        finalPriceId,
        `${baseUrl}/dashboard/settings?success=true&plan=${planId || 'pro'}`,
        `${baseUrl}/dashboard/settings?canceled=true`
      );

      res.json({ url: session.url });
    } catch (error) {
      console.error("Checkout error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Sync plan after successful checkout - verifies with Stripe
  app.post("/api/stripe/sync-plan", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { plan } = req.body;
      if (!plan || !['solo', 'pro', 'agency'].includes(plan)) {
        return res.status(400).json({ error: "Invalid plan" });
      }

      // Verify user has a valid Stripe subscription before allowing plan update
      const user = await storage.getUser(req.user.id);
      if (!user?.stripeCustomerId) {
        return res.status(403).json({ error: "No payment method found. Please complete checkout." });
      }

      // Verify with Stripe that customer has active subscription
      const stripe = await import('./stripeClient').then(m => m.getStripeClient());
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: 'active',
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        return res.status(403).json({ error: "No active subscription found" });
      }

      // Get the price from the subscription to verify the plan matches
      const subscription = subscriptions.data[0];
      const priceId = subscription.items.data[0]?.price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;

      // Map amount to expected plan
      const amountToPlan: Record<number, string> = {
        500: 'solo',
        1200: 'pro',
        3900: 'agency',
      };
      const expectedPlan = amountToPlan[amount];

      if (expectedPlan && expectedPlan !== plan) {
        // Update to the actual plan from Stripe
        await storage.updateUser(req.user.id, { plan: expectedPlan });
        return res.json({ success: true, plan: expectedPlan });
      }

      await storage.updateUser(req.user.id, { plan });
      res.json({ success: true, plan });
    } catch (error) {
      console.error("Sync plan error:", error);
      res.status(500).json({ error: "Failed to sync plan" });
    }
  });

  app.post("/api/stripe/portal", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await storage.getUser(req.user.id);
      if (!user?.stripeCustomerId) {
        return res.status(400).json({ error: "No subscription found" });
      }

      const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`;
      const session = await stripeService.createCustomerPortalSession(
        user.stripeCustomerId,
        `${baseUrl}/dashboard/settings`
      );

      res.json({ url: session.url });
    } catch (error) {
      console.error("Portal error:", error);
      res.status(500).json({ error: "Failed to create portal session" });
    }
  });

  app.get("/api/stripe/subscription", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await storage.getUser(req.user.id);
      if (!user?.stripeSubscriptionId) {
        return res.json({ subscription: null });
      }

      const subscription = await stripeService.getSubscription(user.stripeSubscriptionId);
      res.json({ subscription });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subscription" });
    }
  });

  // Sync subscription status from Stripe (manual refresh)
  app.post("/api/stripe/sync-subscription", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { SubscriptionHandler } = await import('./subscriptionHandler');
      const result = await SubscriptionHandler.syncUserSubscription(req.user.id);
      
      if (!result) {
        return res.json({ synced: false, message: "No Stripe customer found" });
      }

      res.json({ synced: true, status: result.status, plan: result.plan });
    } catch (error) {
      console.error("Sync subscription error:", error);
      res.status(500).json({ error: "Failed to sync subscription" });
    }
  });

  return httpServer;
}
