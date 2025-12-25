import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWebsiteSchema, insertBannerConfigSchema, insertAnalyticsEventSchema } from "@shared/schema";
import { z } from "zod";

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

  // Public endpoint for recording consent events (no auth needed)
  app.post("/api/analytics/event", async (req, res) => {
    try {
      const validated = insertAnalyticsEventSchema.parse(req.body);
      const event = await storage.createAnalyticsEvent(validated);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create event" });
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

  return httpServer;
}
