import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWebsiteSchema, insertBannerConfigSchema, insertAnalyticsEventSchema } from "@shared/schema";
import { z } from "zod";
import { generateBannerScript } from "./banner-script";
import { stripeService } from "./stripeService";
import { getStripePublishableKey } from "./stripeClient";

// Helper to generate random public IDs
function generatePublicId(): string {
  return Array.from({ length: 12 }, () => 
    Math.random().toString(36).substring(2)
  ).join('').substring(0, 12);
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
      
      const validated = insertWebsiteSchema.parse({
        ...req.body,
        userId: req.user.id,
        publicId: generatePublicId(),
        status: "scanning", // Start with scanning status
      });
      
      const website = await storage.createWebsite(validated);
      
      // Create default banner config for the website (uses schema defaults)
      await storage.createBannerConfig({ websiteId: website.id });
      
      // Simulate scanning completion after a delay (in production, this would be a background job)
      setTimeout(async () => {
        await storage.updateWebsite(website.id, {
          status: "compliant",
          lastScan: new Date(),
          cookiesFound: Math.floor(Math.random() * 15) + 5,
          scriptsFound: Math.floor(Math.random() * 8) + 3,
        });
      }, 3000);
      
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
      
      const script = generateBannerScript(config, website.publicId);
      res.type('application/javascript').send(script);
    } catch (error) {
      console.error('Error generating banner script:', error);
      res.status(500).type('application/javascript').send('// ConsentEase: Error loading banner script');
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
        `${baseUrl}/dashboard/settings?success=true`,
        `${baseUrl}/dashboard/settings?canceled=true`
      );

      res.json({ url: session.url });
    } catch (error) {
      console.error("Checkout error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
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

  return httpServer;
}
