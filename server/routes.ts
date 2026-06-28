import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import multer from "multer";
import sharp from "sharp";
import { storage, PLAN_LIMITS, type PlanType, isUnlimited, type ConsentLogFilters } from "./storage";
import { insertWebsiteSchema, insertBannerConfigSchema, insertAnalyticsEventSchema, insertCookieCategorySchema, insertCookieSchema } from "@shared/schema";
import { z } from "zod";
import { generateBannerScript } from "./banner-script";
import { stripeService } from "./stripeService";
import { getStripePublishableKey } from "./stripeClient";
import { scanWebsite, isChromiumAvailable, findChromiumPath as findChromiumExecutable, type ClassifiedCookie, type ScanResult } from "./cookie-scanner";
import { getGeoLocation, getJurisdictionConfig } from "./geolocation";
import { translations, supportedLanguages, getTranslation } from "@shared/translations";
import { generatePrivacyPolicy, generateCookiePolicy } from "./policyTemplates";
import { getRequestHost, isDomainAllowed, isLocalhostOrDev } from "@shared/domain-utils";
import {
  analyticsEventIpLimiter,
  analyticsEventPublicIdLimiter,
  analyticsVitalsIpLimiter,
  analyticsVitalsPublicIdLimiter,
} from "./rateLimiter";
import { UAParser } from "ua-parser-js";
import { clickup } from "./clickup-service";
import { registerIrisRoutes } from "./iris";
import { canUserAccessWebsite } from "./api/authz";
import { mintApiKey, toPublicApiKey } from "./services/apiKeyService";
import { isApiScope } from "@shared/api-scopes";

const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
const MAX_LOGO_SIZE = 512 * 1024;
const MAX_LOGO_DIMENSION = 200;

const logoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_LOGO_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_LOGO_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG, JPG, WebP, and SVG files are allowed'));
    }
  },
});

// Store WebSocket connections per website for real-time analytics
const analyticsConnections = new Map<string, Set<WebSocket>>();

function broadcastAnalyticsEvent(websiteId: string, event: any) {
  const connections = analyticsConnections.get(websiteId);
  if (connections) {
    const message = JSON.stringify({ type: 'analytics_event', data: event });
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }
}

// Delegates to the shared canonical gate in server/api/authz.ts so the dashboard
// and the /api/v1 surface can never drift to different website-access rules.
async function canAccessWebsite(userId: string, website: { userId: string }): Promise<boolean> {
  return canUserAccessWebsite(userId, website);
}

// Helper to generate random public IDs
export function generatePublicId(): string {
  return Array.from({ length: 12 }, () => 
    Math.random().toString(36).substring(2)
  ).join('').substring(0, 12);
}

const scanProgressMap = new Map<string, { phase: string; pagesScanned: number; totalPages: number; currentUrl?: string }>();

// Helper to run cookie scan and store results
function classifyScanError(errorMsg: string): { errorType: string; userMessage: string; suggestions: string[] } {
  if (errorMsg.includes('not found') || errorMsg.includes('ENOTFOUND') || errorMsg.includes('getaddrinfo')) {
    return {
      errorType: 'domain_not_found',
      userMessage: 'This website could not be found. The domain name may be incorrect or the DNS is not configured.',
      suggestions: [
        'Check if the domain name is spelled correctly',
        'Make sure the website is published and accessible online',
        'Try visiting the website in your browser first',
      ],
    };
  }
  if (errorMsg.includes('ECONNREFUSED') || errorMsg.includes('Connection refused')) {
    return {
      errorType: 'connection_refused',
      userMessage: 'The website refused the connection. It may be offline or blocking automated access.',
      suggestions: [
        'Check if your website is currently online',
        'Your server may be blocking automated requests — contact your hosting provider',
        'Try again in a few minutes',
      ],
    };
  }
  if (errorMsg.includes('hosting provider is blocking') || errorMsg.includes('sgcaptcha') || errorMsg.includes('security challenge') || errorMsg.includes('manually add your cookies')) {
    return {
      errorType: 'security_block',
      userMessage: errorMsg,
      suggestions: [
        'Contact your hosting provider (e.g. SiteGround, Cloudflare) and ask them to whitelist the ConsentEase scanner IP: 34.61.219.128',
        'As a workaround, you can add your cookies manually using the "Add Cookie" button below',
        'Once the IP is whitelisted, run the scan again',
      ],
    };
  }
  if (errorMsg.includes('timed out') || errorMsg.includes('ETIMEDOUT') || errorMsg.includes('Timed out') || errorMsg.includes('took too long')) {
    return {
      errorType: 'timeout',
      userMessage: 'The scan timed out because the website took too long to respond.',
      suggestions: [
        'Your website may be experiencing slow loading times — check its performance',
        'The website might be blocking automated requests',
        'Try scanning again during off-peak hours',
      ],
    };
  }
  if (errorMsg.includes('HTTP 4') || errorMsg.includes('HTTP 5') || errorMsg.includes('returned HTTP')) {
    return {
      errorType: 'http_error',
      userMessage: 'The website returned an error when we tried to access it.',
      suggestions: [
        'Check if your website is accessible by visiting it in your browser',
        'Make sure the homepage is not password-protected or behind a login',
        'If your website uses a CDN or firewall, automated requests may be blocked',
      ],
    };
  }
  if (errorMsg.includes('scanner could not start') || errorMsg.includes('Browser') || errorMsg.includes('browser')) {
    return {
      errorType: 'server_issue',
      userMessage: 'The scanner is temporarily unavailable due to a server issue.',
      suggestions: [
        'This is not an issue with your website',
        'Please try again in a few minutes',
        'If the problem persists, contact support',
      ],
    };
  }
  return {
    errorType: 'unknown',
    userMessage: 'An unexpected error occurred during the scan.',
    suggestions: [
      'Try scanning again in a few minutes',
      'Make sure your website is online and accessible',
      'If the problem persists, contact support',
    ],
  };
}

export async function runCookieScan(websiteId: string, domain: string): Promise<void> {
  try {
    console.log(`Starting cookie scan for ${domain}...`);
    
    scanProgressMap.set(websiteId, { phase: 'Launching browser', pagesScanned: 0, totalPages: 0 });
    
    const result = await scanWebsite(domain, (progress) => {
      scanProgressMap.set(websiteId, progress);
    });
    
    scanProgressMap.set(websiteId, { phase: 'Classifying cookies', pagesScanned: result.scannedUrls?.length || 0, totalPages: result.scannedUrls?.length || 0 });
    
    if (!result.success) {
      console.error(`Scan failed for ${domain}:`, result.error);
      const classified = classifyScanError(result.error || 'Unknown error');
      scanProgressMap.set(websiteId, { 
        phase: `Scan failed: ${classified.userMessage}`, 
        pagesScanned: 0, 
        totalPages: 0,
        ...(classified as any),
      });
      await storage.updateWebsite(websiteId, {
        status: "attention",
        lastScan: new Date(),
        cookiesFound: 0,
      });
      setTimeout(() => scanProgressMap.delete(websiteId), 30000);
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
        sourceUrl: cookie.sourceUrl || null,
      }));
    
    // Update progress to saving
    scanProgressMap.set(websiteId, { phase: 'Saving results', pagesScanned: result.scannedUrls?.length || 0, totalPages: result.scannedUrls?.length || 0 });
    
    // Use atomic operation to delete old and insert new cookies
    await storage.replaceAutoDetectedCookies(websiteId, cookiesToInsert);
    
    // Update website status after successful cookie storage
    await storage.updateWebsite(websiteId, {
      status: "compliant",
      lastScan: new Date(),
      cookiesFound: result.cookies.length,
    });
    
    console.log(`Scan completed for ${domain}: ${result.cookies.length} cookies found`);

    clickup.syncCookieScanResult({
      domain,
      cookiesFound: result.cookies.length,
      scanMode: result.scanMode || "full",
      userId: 0,
      websiteId,
    });

    scanProgressMap.delete(websiteId);
  } catch (error) {
    console.error(`Scan error for ${domain}:`, error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    const classified = classifyScanError(errorMsg);
    scanProgressMap.set(websiteId, {
      phase: `Scan failed: ${classified.userMessage}`,
      pagesScanned: 0,
      totalPages: 0,
      ...(classified as any),
    });
    await storage.updateWebsite(websiteId, {
      status: "attention",
      lastScan: new Date(),
    });
    setTimeout(() => scanProgressMap.delete(websiteId), 30000);
  }
}

// Simple in-memory rate limiter for public endpoints
const publicScanRateLimit = new Map<string, { count: number; resetAt: number }>();
const MAX_SCANS_PER_IP = 30;
const SCAN_RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function checkPublicScanRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = publicScanRateLimit.get(ip);
  
  if (!record || now > record.resetAt) {
    publicScanRateLimit.set(ip, { count: 1, resetAt: now + SCAN_RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= MAX_SCANS_PER_IP) {
    return false;
  }
  
  record.count++;
  return true;
}

const contactRateLimit = new Map<string, { count: number; resetAt: number }>();
const MAX_CONTACT_PER_IP = 3;
const CONTACT_RATE_LIMIT_WINDOW = 60 * 60 * 1000;

function checkContactRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = contactRateLimit.get(ip);

  if (!record || now > record.resetAt) {
    contactRateLimit.set(ip, { count: 1, resetAt: now + CONTACT_RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= MAX_CONTACT_PER_IP) {
    return false;
  }

  record.count++;
  return true;
}

// Domain validation - block internal/private IPs
export function isValidPublicDomain(domain: string): boolean {
  const lower = domain.toLowerCase();
  
  // Block localhost and internal domains
  if (lower === 'localhost' || lower.endsWith('.local') || lower.endsWith('.internal')) {
    return false;
  }
  
  // Block IP addresses (simple check)
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(lower)) {
    return false;
  }
  
  // Block common internal ranges
  if (lower.startsWith('10.') || lower.startsWith('192.168.') || lower.startsWith('172.')) {
    return false;
  }
  
  // Must have at least one dot (valid domain)
  if (!lower.includes('.')) {
    return false;
  }
  
  return true;
}

// ==========================================
// GDPR-COMPLIANT IP HASHING FOR CONSENT LOGS
// ==========================================

// Salt for HMAC-SHA256 pseudonymisation of visitor IPs in consent_logs.
// CRITICAL: must be stable across restarts so the same visitor produces the same
// pseudonymous ID within a day-bucket. A random per-process fallback would rotate
// every redeploy, breaking analytics continuity AND making consent logs
// unauditable. server/auth.ts already enforces SESSION_SECRET in production at
// boot, so by the time this module is imported the env var is guaranteed.
const IS_PRODUCTION = process.env.NODE_ENV === "production" || process.env.REPLIT_DEPLOYMENT === "1";
const SESSION_SECRET_FOR_HASH = process.env.SESSION_SECRET;
if (!SESSION_SECRET_FOR_HASH && IS_PRODUCTION) {
  throw new Error("SESSION_SECRET is required in production for IP hashing.");
}
const IP_HASH_SALT: string = SESSION_SECRET_FOR_HASH
  || (() => {
       console.warn("[routes] SESSION_SECRET not set — generating an EPHEMERAL IP-hash salt. Visitor IDs will rotate on every restart. DO NOT deploy without setting SESSION_SECRET.");
       return crypto.randomBytes(32).toString('hex');
     })();

// B10: Public analytics-event payload contract. The eventType allowlist is
// derived from what the live banner actually emits (see server/banner-script.ts:
// banner_shown, banner_dismissed, accept, reject, preferences_saved,
// consent_updated). Anything else is a 400 — keeps the analytics_events table
// clean of typos, malicious strings, or accidental rebrands that would silently
// break funnel filters.
const ALLOWED_EVENT_TYPES = [
  "banner_shown",
  "banner_dismissed",
  "accept",
  "reject",
  "preferences_saved",
  "consent_updated",
] as const;
const analyticsEventSchema = z.object({
  websiteId: z.string().min(1).max(128),
  eventType: z.enum(ALLOWED_EVENT_TYPES),
}).strict().passthrough(); // tolerate unknown future fields rather than break old banners

// B10: Web Vitals payload contract. Each metric is optional but, when present,
// must be a finite number in a sane range. Caps stop a malicious POST from
// stuffing Number.MAX_SAFE_INTEGER into the metrics tables.
const optionalMetric = (max: number) =>
  z.union([z.number(), z.null(), z.undefined()])
    .transform(v => (v == null ? null : v))
    .refine(v => v === null || (Number.isFinite(v) && v >= 0 && v <= max), {
      message: `must be 0..${max}`,
    });
const vitalsPayloadSchema = z.object({
  websiteId: z.string().min(1).max(128),
  lcp: optionalMetric(60_000),
  cls: z.union([z.number(), z.string(), z.null(), z.undefined()])
    .transform(v => {
      if (v == null) return null;
      const n = typeof v === "string" ? Number(v) : v;
      return Number.isFinite(n) ? n : null;
    })
    .refine(v => v === null || (v >= 0 && v <= 10), { message: "cls must be 0..10" }),
  inp: optionalMetric(60_000),
  fcp: optionalMetric(60_000),
  ttfb: optionalMetric(60_000),
  bannerDelay: optionalMetric(60_000),
}).passthrough();

// /api/consent/log payload contract. The route is unauthenticated and
// publicly callable from any embed; the previous "if (!a || !b)" check let
// arbitrary-shape payloads through (e.g. consentChoices as a giant nested
// object would still hit the DB as a stringified blob). action is a tight
// allowlist that mirrors what the banner script actually emits.
const consentLogActionEnum = z.enum([
  'accept_all',
  'reject_all',
  'custom',
  'updated',
  'banner_dismissed',
]);
const consentChoiceShape = z.union([
  z.string().max(8192),
  z.record(z.string().max(64), z.union([z.boolean(), z.string().max(64), z.number()])),
]);
const consentLogPayloadSchema = z.object({
  websiteId: z.string().min(1).max(128),
  visitorId: z.string().min(1).max(128),
  action: consentLogActionEnum,
  consentChoices: consentChoiceShape,
  bannerVersion: z.string().max(32).optional(),
  policyVersion: z.string().max(64).nullable().optional(),
}).passthrough();

// Rate limiting for consent log submissions (abuse detection)
const consentLogRateLimit = new Map<string, { count: number; resetAt: number; flagged: boolean }>();
const MAX_CONSENT_LOGS_PER_IP = 50; // Max logs per IP hash per window
const CONSENT_LOG_RATE_WINDOW = 5 * 60 * 1000; // 5 minutes

// Generate GDPR-compliant pseudonymized IP hash
// Uses HMAC-SHA256 with day-bucket timestamp to prevent rainbow table attacks
function generateGdprIpHash(ip: string): string {
  // Use day-level granularity for timestamp component
  // This means the same IP will produce different hashes on different days
  // but consistent hashes within the same day (useful for analytics)
  const dayBucket = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
  
  // Combine IP with day bucket for the data to hash
  const dataToHash = `${ip}:${dayBucket}`;
  
  // Use HMAC-SHA256 for proper keyed hashing (more secure than plain hash + salt)
  const hmac = crypto.createHmac('sha256', IP_HASH_SALT);
  hmac.update(dataToHash);
  
  // Truncate to 16 chars for storage efficiency while maintaining uniqueness
  return hmac.digest('hex').substring(0, 16);
}

// Check rate limit and track potential abuse for consent logging
function checkConsentLogRateLimit(ipHash: string): { allowed: boolean; flagged: boolean } {
  const now = Date.now();
  const record = consentLogRateLimit.get(ipHash);
  
  if (!record || now > record.resetAt) {
    consentLogRateLimit.set(ipHash, { 
      count: 1, 
      resetAt: now + CONSENT_LOG_RATE_WINDOW,
      flagged: false 
    });
    return { allowed: true, flagged: false };
  }
  
  record.count++;
  
  // Flag as potential abuse if approaching limit
  if (record.count > MAX_CONSENT_LOGS_PER_IP * 0.8) {
    record.flagged = true;
  }
  
  if (record.count > MAX_CONSENT_LOGS_PER_IP) {
    return { allowed: false, flagged: true };
  }
  
  return { allowed: true, flagged: record.flagged };
}

// Clean up old rate limit entries periodically (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(consentLogRateLimit.entries());
  for (const [key, value] of entries) {
    if (now > value.resetAt) {
      consentLogRateLimit.delete(key);
    }
  }
}, 10 * 60 * 1000);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const express = (await import('express')).default;
  app.use('/uploads', express.static(uploadsDir, {
    maxAge: '7d',
    etag: true,
  }));

  // ==========================================
  // WEBSOCKET SERVER FOR REAL-TIME ANALYTICS
  // ==========================================
  const wss = new WebSocketServer({ server: httpServer, path: '/ws/analytics' });
  
  wss.on('connection', (ws, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const websiteId = url.searchParams.get('websiteId');
    
    if (!websiteId) {
      ws.close(1008, 'Missing websiteId');
      return;
    }
    
    if (!analyticsConnections.has(websiteId)) {
      analyticsConnections.set(websiteId, new Set());
    }
    analyticsConnections.get(websiteId)!.add(ws);
    
    console.log(`WebSocket connected for website: ${websiteId}`);
    
    ws.on('close', () => {
      const connections = analyticsConnections.get(websiteId);
      if (connections) {
        connections.delete(ws);
        if (connections.size === 0) {
          analyticsConnections.delete(websiteId);
        }
      }
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  // ==========================================
  // SEO ENDPOINTS (No auth required)
  // ==========================================

  // "Alternative to" 301 redirects → /compare/* (SEO-friendly canonical redirect)
  app.get("/alternative/:slug", (req, res) => {
    const { slug } = req.params;
    const validSlugs = ["onetrust", "cookiebot", "usercentrics", "complianz", "iubenda", "cookiefirst", "cookie-script", "cookieyes", "axeptio"];
    if (validSlugs.includes(slug)) {
      return res.redirect(301, `/compare/${slug}`);
    }
    return res.redirect(301, "/compare");
  });

  // XML Sitemap for SEO
  app.get("/sitemap.xml", (req, res) => {
    const baseUrl = "https://consentease.io";
    
    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "weekly", lastmod: "2025-03-15" },
      { url: "/pricing", priority: "0.9", changefreq: "monthly", lastmod: "2025-03-10" },
      { url: "/features", priority: "0.8", changefreq: "monthly", lastmod: "2025-02-20" },
      { url: "/compare", priority: "0.8", changefreq: "monthly", lastmod: "2025-03-01" },
      { url: "/compare/onetrust", priority: "0.7", changefreq: "monthly", lastmod: "2025-03-01" },
      { url: "/compare/cookiebot", priority: "0.7", changefreq: "monthly", lastmod: "2025-03-01" },
      { url: "/compare/usercentrics", priority: "0.7", changefreq: "monthly", lastmod: "2025-03-01" },
      { url: "/compare/complianz", priority: "0.7", changefreq: "monthly", lastmod: "2025-03-01" },
      { url: "/compare/iubenda", priority: "0.7", changefreq: "monthly", lastmod: "2025-03-01" },
      { url: "/compare/cookiefirst", priority: "0.7", changefreq: "monthly", lastmod: "2025-03-01" },
      { url: "/compare/cookie-script", priority: "0.7", changefreq: "monthly", lastmod: "2025-03-01" },
      { url: "/compare/cookieyes", priority: "0.7", changefreq: "monthly", lastmod: "2025-03-01" },
      { url: "/compare/axeptio", priority: "0.7", changefreq: "monthly", lastmod: "2025-03-01" },
      { url: "/about", priority: "0.6", changefreq: "monthly", lastmod: "2025-02-01" },
      { url: "/contact", priority: "0.6", changefreq: "monthly", lastmod: "2025-02-01" },
      { url: "/faq", priority: "0.6", changefreq: "monthly", lastmod: "2025-02-15" },
      { url: "/docs", priority: "0.6", changefreq: "weekly", lastmod: "2025-03-10" },
      { url: "/blog", priority: "0.7", changefreq: "weekly", lastmod: "2025-03-15" },
      { url: "/privacy", priority: "0.4", changefreq: "yearly", lastmod: "2025-01-01" },
      { url: "/terms", priority: "0.4", changefreq: "yearly", lastmod: "2025-01-01" },
      { url: "/cookies", priority: "0.4", changefreq: "yearly", lastmod: "2025-01-01" },
      { url: "/dpa", priority: "0.4", changefreq: "yearly", lastmod: "2025-01-01" },
      { url: "/demo", priority: "0.7", changefreq: "monthly", lastmod: "2025-03-01" },
      { url: "/roadmap", priority: "0.5", changefreq: "monthly", lastmod: "2025-02-15" },
      { url: "/scan", priority: "0.8", changefreq: "monthly", lastmod: "2025-03-10" },
      { url: "/powered-by", priority: "0.6", changefreq: "monthly", lastmod: "2025-02-20" },
      { url: "/solutions", priority: "0.8", changefreq: "monthly", lastmod: "2025-03-05" },
      { url: "/solutions/wordpress", priority: "0.7", changefreq: "monthly", lastmod: "2025-03-05" },
      { url: "/solutions/shopify", priority: "0.7", changefreq: "monthly", lastmod: "2025-03-05" },
      { url: "/solutions/wix", priority: "0.7", changefreq: "monthly", lastmod: "2025-03-05" },
      { url: "/solutions/webflow", priority: "0.7", changefreq: "monthly", lastmod: "2025-03-05" },
      { url: "/solutions/squarespace", priority: "0.7", changefreq: "monthly", lastmod: "2025-03-05" },
      { url: "/solutions/nextjs", priority: "0.7", changefreq: "monthly", lastmod: "2025-03-05" },
      { url: "/solutions/custom-html", priority: "0.7", changefreq: "monthly", lastmod: "2025-03-05" },
      { url: "/compliance/belgium", priority: "0.7", changefreq: "monthly", lastmod: "2025-03-05" },
      { url: "/compliance/netherlands", priority: "0.7", changefreq: "monthly", lastmod: "2025-03-05" },
      { url: "/compliance/germany", priority: "0.7", changefreq: "monthly", lastmod: "2025-03-05" },
      { url: "/compliance/france", priority: "0.7", changefreq: "monthly", lastmod: "2025-03-05" },
      { url: "/compliance/united-kingdom", priority: "0.7", changefreq: "monthly", lastmod: "2025-03-05" },
      { url: "/compliance/spain", priority: "0.7", changefreq: "monthly", lastmod: "2025-03-05" },
      { url: "/compliance/italy", priority: "0.7", changefreq: "monthly", lastmod: "2025-03-05" },
      { url: "/compliance/austria", priority: "0.7", changefreq: "monthly", lastmod: "2025-03-05" },
      { url: "/business", priority: "0.8", changefreq: "monthly", lastmod: "2025-03-01" },
      { url: "/blog/what-is-gdpr-simple-guide", priority: "0.6", changefreq: "monthly", lastmod: "2025-01-15" },
      { url: "/blog/google-consent-mode-v2-explained", priority: "0.6", changefreq: "monthly", lastmod: "2025-01-10" },
      { url: "/blog/cookie-consent-best-practices", priority: "0.6", changefreq: "monthly", lastmod: "2025-01-05" },
      { url: "/blog/ccpa-vs-gdpr-differences", priority: "0.6", changefreq: "monthly", lastmod: "2024-12-20" },
      { url: "/blog/why-cookie-consent-matters-seo", priority: "0.6", changefreq: "monthly", lastmod: "2024-12-15" },
      { url: "/blog/how-to-audit-website-cookies", priority: "0.6", changefreq: "monthly", lastmod: "2024-12-10" },
      { url: "/brand", priority: "0.3", changefreq: "yearly", lastmod: "2025-01-01" },
    ];
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
    
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  });
  
  // ==========================================
  // PUBLIC ONBOARDING ENDPOINTS (No auth required)
  // ==========================================
  
  // Public scan endpoint - runs scanner without creating account
  app.post("/api/public/scan", async (req, res) => {
    try {
      // Rate limiting by IP
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      if (!checkPublicScanRateLimit(clientIp)) {
        return res.status(429).json({ 
          error: "Too many scan requests. Please try again later.",
          retryAfter: 3600 
        });
      }
      
      const { domain } = req.body;
      
      if (!domain || typeof domain !== "string") {
        return res.status(400).json({ error: "Domain is required" });
      }
      
      // Clean domain
      let cleanDomain = domain.trim().toLowerCase();
      cleanDomain = cleanDomain.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
      
      // Validate domain
      if (!isValidPublicDomain(cleanDomain)) {
        return res.status(400).json({ error: "Please enter a valid public domain name" });
      }
      
      console.log(`Public scan starting for ${cleanDomain}...`);
      
      // Run the actual scan
      const result = await scanWebsite(cleanDomain);
      
      if (!result.success) {
        return res.status(400).json({ 
          success: false, 
          error: result.error || "Failed to scan website" 
        });
      }
      
      clickup.syncPublicScan({
        domain: cleanDomain,
        cookiesFound: result.cookies.length,
      });

      res.json({
        success: true,
        domain: cleanDomain,
        cookies: result.cookies,
        cookiesFound: result.cookies.length,
        scanMode: result.scanMode || 'full',
        trackingScripts: result.trackingScripts || [],
      });
    } catch (error) {
      console.error("Public scan error:", error);
      res.status(500).json({ error: "Failed to scan website" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const clientIp = req.ip || req.socket.remoteAddress || "unknown";
      if (!checkContactRateLimit(clientIp)) {
        return res.status(429).json({ error: "Too many messages. Please try again later." });
      }

      const { name, email, subject, message } = req.body;

      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const safeName = String(name).slice(0, 100);
      const safeEmail = String(email).slice(0, 254);
      const safeSubject = String(subject).slice(0, 200);
      const safeMessage = String(message).slice(0, 5000);

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(safeEmail)) {
        return res.status(400).json({ error: "Please enter a valid email address" });
      }

      const clickupResult = await clickup.createSupportTicket({
        name: safeName,
        email: safeEmail,
        subject: safeSubject,
        message: safeMessage,
        source: "contact-form",
      });

      const submission = await storage.createContactSubmission({
        name: safeName,
        email: safeEmail,
        subject: safeSubject,
        message: safeMessage,
        source: "contact-form",
        clickupTaskId: clickupResult.taskId || null,
        ipAddress: clientIp,
      });

      if (!clickupResult.success) {
        console.warn("ClickUp ticket failed but submission saved to DB:", submission.id);
      }

      res.json({ success: true, ticketId: clickupResult.taskId || null });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({ error: "Failed to submit message" });
    }
  });

  app.post("/api/support/ticket", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { subject, message, priority } = req.body;

      if (!subject || !message) {
        return res.status(400).json({ error: "Subject and message are required" });
      }

      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const result = await clickup.createSupportTicket({
        name: user.email,
        email: user.email,
        subject: String(subject).slice(0, 200),
        message: String(message).slice(0, 5000),
        userId: user.id,
        source: "dashboard",
      });

      if (!result.success) {
        return res.status(502).json({ error: "Failed to create support ticket. Please try again." });
      }

      res.json({ success: true, ticketId: result.taskId || null });
    } catch (error) {
      console.error("Support ticket error:", error);
      res.status(500).json({ error: "Failed to create support ticket" });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { title, description, type } = req.body;

      if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required" });
      }

      const validTypes = ["feedback", "feature-request", "improvement"];
      const feedbackType = validTypes.includes(type) ? type : "feedback";

      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const result = await clickup.createFeedbackRequest({
        title: String(title).slice(0, 200),
        description: String(description).slice(0, 5000),
        type: feedbackType,
        email: user.email,
        userId: user.id,
      });

      if (!result.success) {
        return res.status(502).json({ error: "Failed to submit feedback. Please try again." });
      }

      res.json({ success: true, taskId: result.taskId || null });
    } catch (error) {
      console.error("Feedback error:", error);
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  });

  // Onboarding registration - creates account + website + stores scan results
  app.post("/api/onboarding/register", async (req, res) => {
    try {
      const { email, password, domain, cookies, referralAgency, inviteId } = req.body;
      
      // Input validation
      if (!email || !password || !domain) {
        return res.status(400).json({ error: "Email, password, and domain are required" });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Please enter a valid email address" });
      }
      
      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      
      // Clean and validate domain
      let cleanDomain = domain.trim().toLowerCase();
      cleanDomain = cleanDomain.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
      
      if (!isValidPublicDomain(cleanDomain)) {
        return res.status(400).json({ error: "Please enter a valid public domain name" });
      }
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email.toLowerCase().trim());
      if (existingUser) {
        return res.status(400).json({ error: "An account with this email already exists" });
      }
      
      // Import bcrypt for password hashing
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        plan: "solo",
      });
      
      // Create website
      const website = await storage.createWebsite({
        userId: user.id,
        domain: cleanDomain,
        publicId: generatePublicId(),
        status: "compliant",
      });
      
      // Create default banner config
      await storage.createBannerConfig({ websiteId: website.id });
      
      // Create default cookie categories
      await storage.createDefaultCategoriesForWebsite(website.id);
      
      // If scan results were provided, store the cookies (with limits)
      if (cookies && Array.isArray(cookies) && cookies.length > 0) {
        // Limit to 100 cookies max to prevent abuse
        const limitedCookies = cookies.slice(0, 100);
        const categories = await storage.getCookieCategoriesByWebsiteId(website.id);
        const categoryMap = new Map(categories.map(c => [c.name, c.id]));
        const validCategories = ["necessary", "functional", "analytics", "marketing"];
        
        const cookiesToInsert = limitedCookies
          .filter((cookie: ClassifiedCookie) => 
            categoryMap.has(cookie.category) && 
            validCategories.includes(cookie.category) &&
            typeof cookie.name === "string" && cookie.name.length <= 100
          )
          .map((cookie: ClassifiedCookie) => ({
            websiteId: website.id,
            categoryId: categoryMap.get(cookie.category)!,
            name: String(cookie.name).substring(0, 100),
            provider: String(cookie.provider || "Unknown").substring(0, 100),
            purpose: String(cookie.purpose || "").substring(0, 500),
            expiry: String(cookie.expiry || "Session").substring(0, 50),
            type: cookie.type === "first-party" ? "first-party" : "third-party",
            isAutoDetected: true,
            sourceUrl: cookie.sourceUrl ? String(cookie.sourceUrl).substring(0, 500) : null,
          }));
        
        if (cookiesToInsert.length > 0) {
          await storage.replaceAutoDetectedCookies(website.id, cookiesToInsert);
        }
        
        // Update website with cookie count
        await storage.updateWebsite(website.id, {
          cookiesFound: cookiesToInsert.length,
          lastScan: new Date(),
        });
      }
      
      // Link user to agency if referralAgency is provided
      if (referralAgency) {
        try {
          const agency = await storage.getAgencyBySlug(referralAgency);
          if (agency) {
            const existingClients = await storage.getAgencyClients(agency.id);
            const alreadyLinked = existingClients.some((c: any) => c.userId === user.id);
            if (!alreadyLinked) {
              await storage.createAgencyClient({
                agencyId: agency.id,
                userId: user.id,
                clientName: user.email,
                relationshipType: 'managed',
              });
            }
            
            if (inviteId) {
              const invite = await storage.getAgencyInviteById(inviteId);
              if (invite && invite.agencyId === agency.id && invite.email.toLowerCase() === user.email.toLowerCase()) {
                await storage.updateAgencyInvite(invite.id, { status: 'accepted' });
              }
            }
          }
        } catch (agencyError) {
          console.error('Failed to link user to agency:', agencyError);
        }
      }
      
      clickup.syncNewCustomer({
        email: user.email,
        domain: cleanDomain,
        plan: user.plan || "solo",
        userId: user.id,
      });

      // Send verification email
      try {
        const crypto = await import("crypto");
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await storage.createEmailVerificationToken(user.id, token, expiresAt);
        
        const { getBaseUrl, sendVerificationEmail } = await import('./email');
        const verifyUrl = `${getBaseUrl()}/verify-email?token=${token}`;
        await sendVerificationEmail(user.email, token, verifyUrl);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't block registration if email fails
      }
      
      // Create Stripe customer and checkout session for Solo plan with 7-day trial
      let checkoutUrl: string | null = null;
      try {
        const customer = await stripeService.createAndSyncCustomer(user.email, user.id, user.companyName || undefined, user.vatNumber);
        await storage.updateUserStripeInfo(user.id, { stripeCustomerId: customer.id });
        
        const { getPriceId } = await import('@shared/stripe-plans');
        const soloPriceId = getPriceId('solo', 'monthly');
        
        if (soloPriceId) {
          const baseUrl = process.env.NODE_ENV === 'production' 
            ? 'https://consentease.io' 
            : `${req.protocol}://${req.get('host')}`;
          const session = await stripeService.createCheckoutSession(
            customer.id,
            soloPriceId,
            `${baseUrl}/dashboard/banner?success=true&plan=solo`,
            `${baseUrl}/onboarding?canceled=true`,
            { trialDays: 7 }
          );
          checkoutUrl = session.url;
        }
      } catch (stripeError) {
        console.error('Failed to create Stripe checkout:', stripeError);
        // Continue without checkout - user can upgrade later
      }
      
      // Log the user in automatically
      req.login(user, (err) => {
        if (err) {
          console.error("Auto-login error:", err);
          return res.status(201).json({ 
            success: true, 
            message: "Account created. Please log in.",
            redirect: "/login"
          });
        }
        
        // If we have a checkout URL, redirect to Stripe for payment
        if (checkoutUrl) {
          res.status(201).json({
            success: true,
            user: { id: user.id, email: user.email, plan: user.plan },
            website: { id: website.id, domain: website.domain },
            checkoutUrl: checkoutUrl,
            redirect: checkoutUrl
          });
        } else {
          // Fallback to dashboard if Stripe checkout failed
          res.status(201).json({
            success: true,
            user: { id: user.id, email: user.email, plan: user.plan },
            website: { id: website.id, domain: website.domain },
            redirect: "/dashboard/banner"
          });
        }
      });
    } catch (error) {
      console.error("Onboarding registration error:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });
  
  // ==========================================
  // API Keys (ConsentEase Connect — dashboard management)
  // Session-authenticated CRUD for a user's own /api/v1 keys. The plaintext secret is
  // minted here (the only place it is ever produced) and returned exactly once on
  // create/rotate — it is hashed at rest and can never be retrieved again.
  // ==========================================
  const createApiKeyBodySchema = z.object({
    name: z.string().trim().min(1, "A name is required").max(100, "Name is too long"),
    scopes: z
      .array(z.string())
      .min(1, "Select at least one scope")
      .refine((arr) => arr.every(isApiScope), "Unknown scope requested"),
  });

  const MAX_ACTIVE_API_KEYS = 25;

  app.get("/api/api-keys", async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      // listApiKeysByUserId projects out secretHash, so secrets can never leak here.
      const keys = await storage.listApiKeysByUserId(req.user.id);
      res.json(keys);
    } catch (error) {
      console.error("[api-keys] list failed:", error);
      res.status(500).json({ error: "Failed to list API keys" });
    }
  });

  app.post("/api/api-keys", async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const parsed = createApiKeyBodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid request" });
      }

      const existing = await storage.listApiKeysByUserId(req.user.id);
      const now = Date.now();
      const activeCount = existing.filter(
        (k) => !k.revokedAt && (!k.expiresAt || new Date(k.expiresAt).getTime() > now),
      ).length;
      if (activeCount >= MAX_ACTIVE_API_KEYS) {
        return res.status(403).json({
          error: `You can have at most ${MAX_ACTIVE_API_KEYS} active API keys. Revoke one before creating another.`,
        });
      }

      const minted = mintApiKey();
      const created = await storage.createApiKey({
        userId: req.user.id,
        name: parsed.data.name,
        keyId: minted.keyId,
        keyPrefix: minted.keyPrefix,
        secretHash: minted.secretHash,
        scopes: parsed.data.scopes,
      });
      res.status(201).json({ apiKey: toPublicApiKey(created), plaintext: minted.plaintext });
    } catch (error) {
      console.error("[api-keys] create failed:", error);
      res.status(500).json({ error: "Failed to create API key" });
    }
  });

  app.post("/api/api-keys/:id/rotate", async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const minted = mintApiKey();
      const result = await storage.rotateApiKey({
        id: req.params.id,
        userId: req.user.id,
        keyId: minted.keyId,
        keyPrefix: minted.keyPrefix,
        secretHash: minted.secretHash,
        maxValidKeys: MAX_ACTIVE_API_KEYS,
      });
      if (!result.ok) {
        if (result.reason === "cap_exceeded") {
          return res.status(403).json({
            error: `You can have at most ${MAX_ACTIVE_API_KEYS} active API keys. Revoke one before rotating another.`,
          });
        }
        return res.status(404).json({ error: "API key not found or already revoked" });
      }
      res.json({ apiKey: toPublicApiKey(result.newKey), plaintext: minted.plaintext });
    } catch (error) {
      console.error("[api-keys] rotate failed:", error);
      res.status(500).json({ error: "Failed to rotate API key" });
    }
  });

  app.post("/api/api-keys/:id/revoke", async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const revoked = await storage.revokeApiKey(req.params.id, req.user.id);
      if (!revoked) {
        return res.status(404).json({ error: "API key not found or already revoked" });
      }
      res.json({ apiKey: toPublicApiKey(revoked) });
    } catch (error) {
      console.error("[api-keys] revoke failed:", error);
      res.status(500).json({ error: "Failed to revoke API key" });
    }
  });

  // ==========================================
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

  app.get("/api/websites/summaries", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const websites = await storage.getWebsitesByUserId(req.user.id);
      const summaries: Record<string, { totalViews: number; acceptRate: number; rejectRate: number; totalLogs: number }> = {};
      
      await Promise.all(websites.map(async (site) => {
        try {
          const [analytics, logCount] = await Promise.all([
            storage.getAnalyticsSummary(site.id, 30),
            storage.getConsentLogsCount(site.id),
          ]);
          summaries[site.id] = {
            totalViews: analytics.totalViews,
            acceptRate: analytics.acceptRate,
            rejectRate: analytics.rejectRate,
            totalLogs: logCount,
          };
        } catch {
          summaries[site.id] = { totalViews: 0, acceptRate: 0, rejectRate: 0, totalLogs: 0 };
        }
      }));
      
      res.json(summaries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch summaries" });
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
        return res.status(400).json({ error: error.errors[0].message });
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
      if (!website || !(await canAccessWebsite(req.user.id, website))) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      // If domain is being updated, validate it
      if (req.body.domain) {
        const result = insertWebsiteSchema.safeParse({ ...website, ...req.body });
        if (!result.success) {
          return res.status(400).json({ 
            error: result.error.errors[0].message 
          });
        }
        req.body.domain = result.data.domain;
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
      if (!website || !(await canAccessWebsite(req.user.id, website))) {
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
      if (!website || !(await canAccessWebsite(req.user.id, website))) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      // Check daily scan limit
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      const plan = (user.plan || 'solo') as PlanType;
      const limits = PLAN_LIMITS[plan];
      const dailyScans = await storage.getDailyCookieScanCount(req.user.id);

      if (!isUnlimited(limits.dailyCookieScans) && dailyScans >= limits.dailyCookieScans) {
        const nextPlan = plan === 'starter' ? 'Solo' : plan === 'solo' ? 'Premium' : plan === 'premium' ? 'Pro' : plan === 'pro' ? 'Business' : plan === 'business' ? 'Agency' : null;
        return res.status(429).json({
          error: "Daily scan limit reached",
          message: `You've used all ${limits.dailyCookieScans} cookie scan${limits.dailyCookieScans === 1 ? '' : 's'} available on your ${plan} plan today.${nextPlan ? ` Upgrade to ${nextPlan} for more scans.` : ''}`,
          dailyScans,
          limit: limits.dailyCookieScans,
          plan,
          canUpgrade: !!nextPlan,
          upgradePlan: nextPlan,
        });
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

  app.get("/api/websites/:id/scan-progress", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const website = await storage.getWebsiteById(req.params.id);
      if (!website || !(await canAccessWebsite(req.user.id, website))) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      const progress = scanProgressMap.get(req.params.id) as any;
      if (!progress) {
        return res.json({ scanning: false });
      }
      
      const isFailed = progress.phase.startsWith('Scan failed:');
      return res.json({ 
        scanning: !isFailed, 
        failed: isFailed,
        error: isFailed ? progress.phase.replace('Scan failed: ', '') : undefined,
        errorType: isFailed ? (progress.errorType || 'unknown') : undefined,
        suggestions: isFailed ? (progress.suggestions || []) : undefined,
        ...progress,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scan progress" });
    }
  });

  app.get("/api/scanner-status", async (req, res) => {
    res.json({
      chromiumAvailable: isChromiumAvailable(),
      scanMode: isChromiumAvailable() ? 'full' : 'lightweight',
    });
  });

  // Get scan usage for current user
  app.get("/api/scan-usage", async (req, res) => {
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
      const cookieScanCount = await storage.getDailyCookieScanCount(req.user.id);
      const diagnosticScanCount = await storage.getDailyDiagnosticScanCount(req.user.id);
      
      res.json({
        cookieScans: {
          used: cookieScanCount,
          limit: limits.dailyCookieScans,
          unlimited: isUnlimited(limits.dailyCookieScans),
        },
        diagnosticScans: {
          used: diagnosticScanCount,
          limit: limits.dailyDiagnosticScans,
          unlimited: isUnlimited(limits.dailyDiagnosticScans),
        },
        plan,
      });
    } catch (error) {
      console.error("Error fetching scan usage:", error);
      res.status(500).json({ error: "Failed to fetch scan usage" });
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
      if (!website || !(await canAccessWebsite(req.user.id, website))) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      let config = await storage.getBannerConfigByWebsiteId(req.params.id);
      
      // Auto-create banner config if it doesn't exist (for legacy websites)
      if (!config) {
        config = await storage.createBannerConfig({ websiteId: req.params.id });
      }
      
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
      if (!website || !(await canAccessWebsite(req.user.id, website))) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      // Check if banner config exists, create if not (upsert pattern)
      let existingConfig = await storage.getBannerConfigByWebsiteId(req.params.id);
      
      let updated;
      if (!existingConfig) {
        // Create new config with the provided values
        updated = await storage.createBannerConfig({ 
          websiteId: req.params.id,
          ...req.body 
        });
      } else {
        // Update existing config
        updated = await storage.updateBannerConfig(req.params.id, req.body);
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update banner config" });
    }
  });

  app.post("/api/websites/:id/logo", logoUpload.single('logo'), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const website = await storage.getWebsiteById(req.params.id);
      if (!website || !(await canAccessWebsite(req.user.id, website))) {
        return res.status(404).json({ error: "Website not found" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const target = (req.query.target as string) || 'banner';
      if (!['banner', 'revisit'].includes(target)) {
        return res.status(400).json({ error: "Invalid target. Use 'banner' or 'revisit'" });
      }

      let processedBuffer: Buffer;
      const isSvg = req.file.mimetype === 'image/svg+xml';

      if (isSvg) {
        processedBuffer = req.file.buffer;
      } else {
        const metadata = await sharp(req.file.buffer).metadata();
        if (metadata.width && metadata.height &&
            (metadata.width > MAX_LOGO_DIMENSION || metadata.height > MAX_LOGO_DIMENSION)) {
          processedBuffer = await sharp(req.file.buffer)
            .resize(MAX_LOGO_DIMENSION, MAX_LOGO_DIMENSION, { fit: 'inside', withoutEnlargement: true })
            .png()
            .toBuffer();
        } else {
          processedBuffer = await sharp(req.file.buffer).png().toBuffer();
        }
      }

      const uploadsDir = path.join(process.cwd(), 'uploads', 'logos');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const ext = isSvg ? 'svg' : 'png';
      const filename = `${req.params.id}-${target}-${Date.now()}.${ext}`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, processedBuffer);

      const logoUrl = `/uploads/logos/${filename}`;

      const updateField = target === 'revisit' ? 'revisitButtonLogoUrl' : 'logoUrl';
      
      const existingConfig = await storage.getBannerConfigByWebsiteId(req.params.id);
      if (existingConfig) {
        const oldUrl = target === 'revisit' ? existingConfig.revisitButtonLogoUrl : existingConfig.logoUrl;
        if (oldUrl && oldUrl.startsWith('/uploads/')) {
          const oldPath = path.join(process.cwd(), oldUrl);
          if (fs.existsSync(oldPath)) {
            try { fs.unlinkSync(oldPath); } catch {}
          }
        }
      }

      await storage.updateBannerConfig(req.params.id, { [updateField]: logoUrl });

      res.json({ url: logoUrl, target });
    } catch (error: any) {
      if (error.message?.includes('Only PNG')) {
        return res.status(400).json({ error: error.message });
      }
      console.error("Logo upload error:", error);
      res.status(500).json({ error: "Failed to upload logo" });
    }
  });

  app.delete("/api/websites/:id/logo", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const website = await storage.getWebsiteById(req.params.id);
      if (!website || !(await canAccessWebsite(req.user.id, website))) {
        return res.status(404).json({ error: "Website not found" });
      }

      const target = (req.query.target as string) || 'banner';
      if (!['banner', 'revisit'].includes(target)) {
        return res.status(400).json({ error: "Invalid target" });
      }

      const config = await storage.getBannerConfigByWebsiteId(req.params.id);
      if (config) {
        const urlField = target === 'revisit' ? config.revisitButtonLogoUrl : config.logoUrl;
        if (urlField && urlField.startsWith('/uploads/')) {
          const filepath = path.join(process.cwd(), urlField);
          if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
          }
        }
      }

      const updateField = target === 'revisit' ? 'revisitButtonLogoUrl' : 'logoUrl';
      await storage.updateBannerConfig(req.params.id, { [updateField]: null });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete logo" });
    }
  });

  // Analytics endpoints
  app.get("/api/websites/:id/analytics", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const website = await storage.getWebsiteById(req.params.id);
      if (!website || !(await canAccessWebsite(req.user.id, website))) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      const daysBack = parseInt(req.query.days as string) || 14;
      const summary = await storage.getAnalyticsSummary(req.params.id, daysBack);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/websites/:id/analytics/advanced", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const website = await storage.getWebsiteById(req.params.id);
      if (!website || !(await canAccessWebsite(req.user.id, website))) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      const daysBack = parseInt(req.query.days as string) || 14;
      const advanced = await storage.getAdvancedAnalytics(req.params.id, daysBack);
      res.json(advanced);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch advanced analytics" });
    }
  });

  app.get("/api/websites/:id/analytics/export", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const website = await storage.getWebsiteById(req.params.id);
      if (!website || !(await canAccessWebsite(req.user.id, website))) {
        return res.status(404).json({ error: "Website not found" });
      }
      const daysBack = parseInt(req.query.days as string) || 14;
      const events = await storage.getAnalyticsByWebsiteId(req.params.id, daysBack);

      function csvEscape(value: string): string {
        let safe = value;
        if (/^[=+\-@\t\r]/.test(safe)) {
          safe = "'" + safe;
        }
        if (safe.includes('"') || safe.includes(',') || safe.includes('\n') || safe.includes('\r')) {
          safe = '"' + safe.replace(/"/g, '""') + '"';
        }
        return safe;
      }

      const csvRows = ['Date,Event Type,Country,Device,Browser'];
      events.forEach(e => {
        const date = e.timestamp.toISOString();
        const eventType = csvEscape(e.eventType || '');
        const country = csvEscape(e.country || '');
        const device = csvEscape(e.deviceType || '');
        const browser = csvEscape(e.browser || '');
        csvRows.push(`${date},${eventType},${country},${device},${browser}`);
      });

      const csv = csvRows.join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${website.domain}-${daysBack}d.csv"`);
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: "Failed to export analytics" });
    }
  });

  // CORS preflight for analytics endpoint
  app.options("/api/analytics/event", (req, res) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.status(204).send();
  });

  // Public endpoint for recording consent events (no auth needed)
  // Accepts publicId and resolves to internal websiteId.
  // Rate limited per-IP (60/min) AND per-publicId (1000/min) to prevent abuse.
  app.post("/api/analytics/event", analyticsEventIpLimiter, analyticsEventPublicIdLimiter, async (req, res) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    try {
      // B10: Zod validates the public payload. We allowlist eventType strings
      // explicitly — anything outside the set is a 400, not a silent insert.
      // This stops "eventType=DROP TABLE" curiosities from getting into the
      // analytics_events table where they'd then poison every funnel filter
      // and dashboard query.
      const parsed = analyticsEventSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid payload" });
      }
      const { websiteId: publicId, eventType } = parsed.data;

      const website = await storage.getWebsiteByPublicId(publicId);
      if (!website) {
        return res.status(404).json({ error: "Website not found" });
      }

      // Mandatory host-check in production: a request without origin OR referer
      // can't be a legitimate browser banner POST (browsers always send at least
      // one for cross-origin XHR). Refuse rather than counting it.
      const requestHost = getRequestHost({ origin: req.headers.origin, referer: req.headers.referer as string });
      if (!requestHost) {
        if (IS_PRODUCTION) {
          return res.status(403).json({ error: "Missing origin/referer" });
        }
      } else if (!isLocalhostOrDev(requestHost) && !isDomainAllowed(requestHost, website.domain, website.allowedDomains)) {
        return res.status(403).json({ error: "Domain not authorized" });
      }
      
      // Track whether we incremented the counter so we can compensate (B5
      // follow-up): if the counter increment succeeds but the analytics_events
      // INSERT below fails, we'd otherwise drift the billing-driving counter
      // above what's actually recorded.
      let incrementedCounterForUser: string | null = null;

      if (eventType === 'banner_shown') {
        const user = await storage.getUser(website.userId);
        if (user) {
          const plan = (user.plan || 'solo') as keyof typeof PLAN_LIMITS;
          const limits = PLAN_LIMITS[plan];
          if (limits && limits.monthlyViews > 0) {
            // B5: atomic INSERT…ON CONFLICT on the dedicated counter table.
            // The previous "read getMonthlyViewsForUser → compare → write
            // analytics_events" pattern raced under burst load — two parallel
            // banner_shown POSTs at the cap could both observe `currentViews
            // < limit` and both pass through. Atomic increment-and-return
            // closes that window. We intentionally accept a 1-event overshoot
            // (the call that crosses the line still gets counted) so the
            // counter accurately reflects "the cap was hit".
            const updatedCount = await storage.incrementMonthlyViewCounter(user.id);
            incrementedCounterForUser = user.id;
            const gracePeriodLimit = Math.ceil(limits.monthlyViews * 1.1);
            if (updatedCount > gracePeriodLimit) {
              return res.json({ success: true, limited: true });
            }
          }
        }
      }
      
      let deviceType: string | null = null;
      let browserName: string | null = null;
      const ua = req.headers['user-agent'];
      if (ua) {
        const parser = new UAParser(ua);
        const device = parser.getDevice();
        const browser = parser.getBrowser();
        deviceType = device.type === 'mobile' ? 'mobile' : device.type === 'tablet' ? 'tablet' : 'desktop';
        browserName = browser.name || null;
      }

      // Server-side country derivation from IP. Never trust the client-sent
      // `country` field — anyone calling the public endpoint can spoof it,
      // poisoning the geo breakdown. We resolve it from the request IP via the
      // same helper used elsewhere (cached per-IP for 24h, so the overhead is
      // a single Map lookup for repeat visitors).
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
        || req.headers['x-real-ip'] as string
        || req.ip
        || req.socket.remoteAddress
        || '';
      let resolvedCountry: string | null = null;
      try {
        const geo = await getGeoLocation(clientIp);
        resolvedCountry = geo?.countryCode && geo.countryCode !== 'XX' ? geo.countryCode : null;
      } catch {
        resolvedCountry = null;
      }

      let event;
      try {
        event = await storage.createAnalyticsEvent({
          websiteId: website.id,
          eventType,
          country: resolvedCountry,
          deviceType,
          browser: browserName,
        });
      } catch (insertErr) {
        // Compensate B5 counter drift: we already incremented above. Without
        // this rollback the monthly view counter (which gates plan limits and
        // therefore billing decisions) would over-report relative to the
        // actual analytics_events row count.
        if (incrementedCounterForUser) {
          try {
            await storage.decrementMonthlyViewCounter(incrementedCounterForUser);
          } catch (rollbackErr) {
            console.error('Failed to rollback monthly view counter after event insert failure:', rollbackErr);
          }
        }
        throw insertErr;
      }

      broadcastAnalyticsEvent(website.id, {
        id: event.id,
        eventType,
        country: resolvedCountry,
        timestamp: new Date().toISOString(),
      });
      
      res.status(201).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  // CORS preflight for web vitals endpoint
  app.options("/api/analytics/vitals", (req, res) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.status(204).send();
  });

  // Public endpoint for recording web vitals (no auth needed).
  // Rate limited per-IP (30/min) AND per-publicId (1000/min).
  // sendBeacon delivers POSTs as text/plain, so we accept both JSON and
  // text bodies and re-parse if needed.
  app.post(
    "/api/analytics/vitals",
    express.text({ type: ['text/plain', 'application/json'], limit: '8kb' }),
    analyticsVitalsIpLimiter,
    analyticsVitalsPublicIdLimiter,
    async (req, res) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
      // express.text() leaves req.body as a string; express.json() leaves it as
      // an object. Normalise to an object either way.
      let payload: any = req.body;
      if (typeof payload === 'string') {
        try {
          payload = payload.length > 0 ? JSON.parse(payload) : {};
        } catch {
          return res.status(400).json({ error: "Invalid JSON body" });
        }
      }
      // B10: same shape contract as analytics events — coerce numerics, cap
      // ranges so a malicious POST can't insert lcp=Number.MAX_SAFE_INTEGER.
      const parsed = vitalsPayloadSchema.safeParse(payload);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid payload" });
      }
      const { websiteId: publicId, lcp, cls, inp, fcp, ttfb, bannerDelay } = parsed.data;

      const website = await storage.getWebsiteByPublicId(publicId);
      if (!website) {
        return res.status(404).json({ error: "Website not found" });
      }

      const requestHost = getRequestHost({ origin: req.headers.origin, referer: req.headers.referer as string });
      if (!requestHost) {
        if (IS_PRODUCTION) {
          return res.status(403).json({ error: "Missing origin/referer" });
        }
      } else if (!isLocalhostOrDev(requestHost) && !isDomainAllowed(requestHost, website.domain, website.allowedDomains)) {
        return res.status(403).json({ error: "Domain not authorized" });
      }
      
      // Only record if we have meaningful data
      if (lcp === null && cls === null && inp === null) {
        return res.status(200).json({ success: true, recorded: false });
      }
      
      const safeRound = (v: any) => {
        if (v == null) return null;
        const n = Number(v);
        return Number.isFinite(n) ? Math.round(n) : null;
      };

      // Server-side country (same reasoning as /api/analytics/event).
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
        || req.headers['x-real-ip'] as string
        || req.ip
        || req.socket.remoteAddress
        || '';
      let resolvedCountry: string | null = null;
      try {
        const geo = await getGeoLocation(clientIp);
        resolvedCountry = geo?.countryCode && geo.countryCode !== 'XX' ? geo.countryCode : null;
      } catch {
        resolvedCountry = null;
      }

      await storage.createWebVitalsMetric({
        websiteId: website.id,
        lcp: safeRound(lcp),
        cls: cls?.toString() || null,
        inp: safeRound(inp),
        fcp: safeRound(fcp),
        ttfb: safeRound(ttfb),
        bannerDelay: safeRound(bannerDelay),
        country: resolvedCountry,
      });
      
      res.status(201).json({ success: true, recorded: true });
    } catch (error) {
      console.error("Web vitals error:", error);
      res.status(500).json({ error: "Failed to record vitals" });
    }
  });

  // Get web vitals summary for a website
  app.get("/api/websites/:id/vitals", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const website = await storage.getWebsiteById(req.params.id);
      if (!website || !(await canAccessWebsite(req.user.id, website))) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      const daysBack = parseInt(req.query.days as string) || 7;
      const summary = await storage.getWebVitalsSummary(req.params.id, daysBack);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch web vitals" });
    }
  });

  // Public geolocation endpoint for banner script
  app.options("/api/geo", (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send();
  });

  app.get("/api/geo", async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    
    try {
      // Get client IP from various headers (for proxies) or socket
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() 
        || req.headers['x-real-ip'] as string
        || req.ip 
        || req.socket.remoteAddress 
        || '127.0.0.1';
      
      const geo = await getGeoLocation(clientIp);
      
      if (!geo) {
        // Default to GDPR if we can't determine location (safer default)
        return res.json({
          jurisdiction: 'gdpr',
          country: 'Unknown',
          countryCode: 'XX',
          config: getJurisdictionConfig('gdpr')
        });
      }
      
      res.json({
        jurisdiction: geo.jurisdiction,
        country: geo.country,
        countryCode: geo.countryCode,
        region: geo.region,
        isEU: geo.isEU,
        isCalifornia: geo.isCalifornia,
        flag: geo.flag,
        languages: geo.languages,
        currency: geo.currency,
        config: getJurisdictionConfig(geo.jurisdiction)
      });
    } catch (error) {
      console.error('Geolocation error:', error);
      // Default to GDPR on error
      res.json({
        jurisdiction: 'gdpr',
        country: 'Unknown',
        countryCode: 'XX',
        config: getJurisdictionConfig('gdpr')
      });
    }
  });

  // Public endpoint to get translations for banner
  app.options("/api/translations", (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send();
  });

  app.get("/api/translations", (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    const lang = req.query.lang as string || 'en';
    const translation = getTranslation(lang);
    
    res.json({
      translation,
      languages: supportedLanguages,
    });
  });

  app.get("/api/translations/all", (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    res.json({
      translations,
      languages: supportedLanguages,
    });
  });

  // CORS preflight for consent script
  app.options("/api/consent/:publicId/script.js", (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.status(204).send();
  });

  // Public endpoint to serve the consent banner script
  app.get("/api/consent/:publicId/script.js", async (req, res) => {
    // Allow cross-origin requests for the banner script
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, nosnippet');
    // Short cache with revalidation - query param ?v= can bust cache on config changes
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    
    try {
      const website = await storage.getWebsiteByPublicId(req.params.publicId);
      if (!website) {
        return res.status(404).type('application/javascript').send('// ConsentEase: Website not found. Please check your publicId.');
      }
      
      // Auto-create banner config if it doesn't exist (for legacy websites)
      let config = await storage.getBannerConfigByWebsiteId(website.id);
      if (!config) {
        config = await storage.createBannerConfig({ websiteId: website.id });
      }
      
      // Add ETag based on config updatedAt for proper cache validation
      const etag = `"${website.publicId}-${config.updatedAt.getTime()}"`;
      res.setHeader('ETag', etag);
      
      // Check if client has fresh version
      if (req.headers['if-none-match'] === etag) {
        return res.status(304).end();
      }
      
      // Check user's plan to determine if branding should be shown
      const user = await storage.getUser(website.userId);
      const showBranding = !user || ['starter', 'solo'].includes(user.plan); // Starter/Solo show branding, Premium/Pro+ can hide it
      
      const mergedExcludedPaths = [...new Set([...(config.excludedPaths || []), ...(website.excludedPaths || [])])].filter(Boolean);
      const script = generateBannerScript(config, website.publicId, showBranding, website.clarityProjectId, mergedExcludedPaths.length > 0 ? mergedExcludedPaths : null, website.domain, website.allowedDomains);
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
      if (!website || !(await canAccessWebsite(req.user.id, website))) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      let categories = await storage.getCookieCategoriesByWebsiteId(website.id);
      
      // Auto-create default cookie categories if they don't exist (for legacy websites)
      if (categories.length === 0) {
        await storage.createDefaultCategoriesForWebsite(website.id);
        categories = await storage.getCookieCategoriesByWebsiteId(website.id);
      }
      
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
      if (!website || !(await canAccessWebsite(req.user.id, website))) {
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
      if (!website || !(await canAccessWebsite(req.user.id, website))) {
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
      if (!website || !(await canAccessWebsite(req.user.id, website))) {
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
      if (!website || !(await canAccessWebsite(req.user.id, website))) {
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
      if (!website || !(await canAccessWebsite(req.user.id, website))) {
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
      if (!website || !(await canAccessWebsite(req.user.id, website))) {
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
      if (!website || !(await canAccessWebsite(req.user.id, website))) {
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
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    
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
      const { isValidPlanId, getPriceId, isValidPriceId, getPlanByPriceId, getPlanAmount } = await import('@shared/stripe-plans');
      
      console.log("[Checkout] Request received:", { planId: req.body.planId, priceId: req.body.priceId, userId: req.user?.id });
      
      if (!req.user) {
        console.log("[Checkout] Unauthorized - no user");
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { planId, priceId, billingInterval } = req.body;
      
      if (!planId || !isValidPlanId(planId)) {
        return res.status(400).json({ error: "Invalid plan" });
      }

      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripeService.createAndSyncCustomer(user.email, user.id, user.companyName || undefined, user.vatNumber);
        await storage.updateUserStripeInfo(user.id, { stripeCustomerId: customer.id });
        customerId = customer.id;
      }

      const interval = billingInterval === 'yearly' ? 'yearly' as const : 'monthly' as const;
      let finalPriceId = priceId;
      
      if (finalPriceId) {
        if (!isValidPriceId(finalPriceId)) {
          console.log("[Checkout] Rejected invalid priceId:", finalPriceId);
          return res.status(400).json({ error: "Invalid price" });
        }
        const resolved = getPlanByPriceId(finalPriceId);
        if (resolved && resolved.planId !== planId) {
          console.log("[Checkout] Price/plan mismatch:", { priceId: finalPriceId, expectedPlan: planId, actualPlan: resolved.planId });
          return res.status(400).json({ error: "Price does not match selected plan" });
        }
      } else {
        finalPriceId = getPriceId(planId, interval);
      }
      
      if (!finalPriceId) {
        console.log("[Checkout] No price found for plan:", planId);
        return res.status(400).json({ error: "No valid price found for this plan" });
      }
      
      console.log("[Checkout] Using price:", finalPriceId, "for plan:", planId);

      if (user.stripeSubscriptionId && user.subscriptionStatus && ['active', 'trialing', 'past_due'].includes(user.subscriptionStatus)) {
        const currentInterval = user.billingInterval === 'yearly' ? 'yearly' as const : 'monthly' as const;
        const currentAmount = isValidPlanId(user.plan) ? getPlanAmount(user.plan, currentInterval) : 0;
        const newAmount = getPlanAmount(planId, interval);
        const isDowngrade = newAmount < currentAmount;

        console.log("[Checkout] Updating existing subscription:", { from: user.plan, to: planId, isDowngrade });
        await stripeService.updateSubscriptionPlan(user.stripeSubscriptionId, finalPriceId, isDowngrade);

        await storage.updateUser(user.id, { plan: planId, billingInterval: interval });

        return res.json({ updated: true, plan: planId });
      }

      // Anchor the trial to the user's existing trialEndsAt (set at signup) so
      // that converting to a paid plan mid-trial does NOT extend the trial
      // window beyond the original 7 days. Falls back to a fresh 7-day trial
      // if the user has no existing anchor (e.g. legacy accounts).
      const nowSec = Math.floor(Date.now() / 1000);
      const trialEndSec = user.trialEndsAt
        ? Math.floor(user.trialEndsAt.getTime() / 1000)
        : null;
      const trialOptions = trialEndSec && trialEndSec > nowSec
        ? { trialEnd: trialEndSec }
        : { trialDays: 7 };

      const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://consentease.io'
        : `${req.protocol}://${req.get('host')}`;
      const session = await stripeService.createCheckoutSession(
        customerId,
        finalPriceId,
        `${baseUrl}/dashboard/settings?success=true&plan=${planId}`,
        `${baseUrl}/dashboard/settings?canceled=true`,
        trialOptions
      );

      res.json({ url: session.url });
    } catch (error) {
      console.error("Checkout error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  app.post("/api/stripe/sync-plan", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { SubscriptionHandler } = await import('./subscriptionHandler');
      const result = await SubscriptionHandler.syncUserSubscription(req.user.id);
      
      if (!result) {
        return res.status(403).json({ error: "No payment method found. Please complete checkout." });
      }

      res.json({ success: true, plan: result.plan, status: result.status });
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

      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://consentease.io' 
        : `${req.protocol}://${req.get('host')}`;
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

  app.post("/api/stripe/cancel", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await storage.getUser(req.user.id);
      if (!user?.stripeSubscriptionId) {
        return res.status(400).json({ error: "No active subscription found" });
      }

      const details = await stripeService.getSubscriptionDetails(user.stripeSubscriptionId);

      if (details.cancelAtPeriodEnd) {
        return res.status(409).json({ error: "Subscription is already scheduled for cancellation." });
      }
      if (details.status === 'canceled' || details.status === 'incomplete_expired') {
        return res.status(400).json({ error: "This subscription is no longer active and cannot be canceled." });
      }

      const sub = await stripeService.cancelSubscriptionAtPeriodEnd(user.stripeSubscriptionId);
      const periodEnd = sub.current_period_end;

      await storage.updateUser(user.id, {
        subscriptionEndDate: new Date(periodEnd * 1000),
      });

      res.json({ 
        success: true, 
        cancelAt: periodEnd,
        message: "Subscription will be canceled at the end of the current billing period." 
      });
    } catch (error: any) {
      console.error("Cancel subscription error:", error);
      if (error?.type === 'StripeInvalidRequestError') {
        return res.status(400).json({ error: error.message || "Stripe could not process this request." });
      }
      res.status(500).json({ error: "Failed to cancel subscription. Please try again later." });
    }
  });

  app.post("/api/stripe/reactivate", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await storage.getUser(req.user.id);
      if (!user?.stripeSubscriptionId) {
        return res.status(400).json({ error: "No subscription found" });
      }

      const details = await stripeService.getSubscriptionDetails(user.stripeSubscriptionId);

      if (!details.cancelAtPeriodEnd) {
        return res.status(409).json({ error: "Subscription is not scheduled for cancellation." });
      }
      if (details.status === 'canceled' || details.status === 'incomplete_expired') {
        return res.status(400).json({ error: "This subscription has already ended and cannot be reactivated. Please start a new subscription." });
      }

      await stripeService.reactivateSubscription(user.stripeSubscriptionId);

      await storage.updateUser(user.id, {
        subscriptionEndDate: null,
      });

      res.json({ 
        success: true, 
        message: "Subscription has been reactivated." 
      });
    } catch (error: any) {
      console.error("Reactivate subscription error:", error);
      if (error?.type === 'StripeInvalidRequestError') {
        return res.status(400).json({ error: error.message || "Stripe could not process this request." });
      }
      res.status(500).json({ error: "Failed to reactivate subscription. Please try again later." });
    }
  });

  app.get("/api/stripe/invoices", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const user = await storage.getUser(req.user.id);
      if (!user?.stripeCustomerId) {
        return res.json({ invoices: [] });
      }
      const invoices = await stripeService.listCustomerInvoices(user.stripeCustomerId);
      res.json({ invoices });
    } catch (error) {
      console.error("Invoices error:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  app.get("/api/stripe/payment-method", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const user = await storage.getUser(req.user.id);
      if (!user?.stripeCustomerId) {
        return res.json({ paymentMethod: null });
      }
      const paymentMethod = await stripeService.getCustomerPaymentMethod(user.stripeCustomerId);
      res.json({ paymentMethod });
    } catch (error) {
      console.error("Payment method error:", error);
      res.status(500).json({ error: "Failed to fetch payment method" });
    }
  });

  app.get("/api/stripe/subscription-details", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const user = await storage.getUser(req.user.id);
      if (!user?.stripeSubscriptionId) {
        return res.json({ details: null });
      }
      const details = await stripeService.getSubscriptionDetails(user.stripeSubscriptionId);
      res.json({ details });
    } catch (error) {
      console.error("Subscription details error:", error);
      res.status(500).json({ error: "Failed to fetch subscription details" });
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

  app.post("/api/stripe/sync-invoice-fields", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await storage.getUser(req.user.id);
      if (!user || !user.stripeCustomerId) {
        return res.status(400).json({ error: "No Stripe customer found" });
      }

      await stripeService.updateCustomer(user.stripeCustomerId, {
        name: user.companyName || null,
        email: user.email,
      });

      await stripeService.syncCustomerTaxId(user.stripeCustomerId, user.vatNumber || null);

      res.json({ success: true, message: "Invoice fields synced to Stripe" });
    } catch (error) {
      console.error("Sync invoice fields error:", error);
      res.status(500).json({ error: "Failed to sync invoice fields" });
    }
  });

  // ==========================================
  // CONSENT PROOF LOGGING ENDPOINTS
  // ==========================================
  
  // CORS preflight for consent logging
  app.options("/api/consent/log", (req, res) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.status(204).send();
  });

  // Public endpoint for logging consent decisions (called from banner script)
  app.post("/api/consent/log", async (req, res) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    try {
      const parsed = consentLogPayloadSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid payload" });
      }
      const {
        websiteId: publicId,
        visitorId,
        action,
        consentChoices,
        bannerVersion,
        policyVersion,
      } = parsed.data;

      const website = await storage.getWebsiteByPublicId(publicId);
      if (!website) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      const requestHost = getRequestHost({ origin: req.headers.origin, referer: req.headers.referer as string });
      if (!requestHost) {
        if (IS_PRODUCTION) {
          return res.status(403).json({ error: "Missing origin/referer" });
        }
      } else if (!isLocalhostOrDev(requestHost) && !isDomainAllowed(requestHost, website.domain, website.allowedDomains)) {
        return res.status(403).json({ error: "Domain not authorized" });
      }
      
      // Generate GDPR-compliant pseudonymized IP hash
      const clientIp = req.ip || req.socket.remoteAddress || '';
      const ipHash = generateGdprIpHash(clientIp);
      
      // Check rate limiting for abuse detection
      const rateLimitCheck = checkConsentLogRateLimit(ipHash);
      if (!rateLimitCheck.allowed) {
        console.warn(`Consent log rate limit exceeded for IP hash: ${ipHash}`);
        return res.status(429).json({ error: "Too many requests. Please try again later." });
      }
      
      // Log potential abuse for monitoring (but still allow request)
      if (rateLimitCheck.flagged) {
        console.warn(`High volume consent logging detected for IP hash: ${ipHash}`);
      }
      
      // Calculate expiry (1 year from now)
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      
      await storage.createConsentLog({
        websiteId: website.id,
        visitorId,
        action,
        ipHash,
        userAgent: req.headers['user-agent'] || null,
        country: req.body.country || null,
        region: req.body.region || null,
        consentChoices: typeof consentChoices === 'string' ? consentChoices : JSON.stringify(consentChoices),
        bannerVersion: bannerVersion || '1.0',
        policyVersion: policyVersion || null,
        expiresAt,
      });
      
      res.status(201).json({ success: true });
    } catch (error) {
      console.error('Error logging consent:', error);
      res.status(500).json({ error: "Failed to log consent" });
    }
  });

  // Get consent logs for a website (authenticated)
  app.get("/api/websites/:id/consent-logs", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const website = await storage.getWebsiteById(req.params.id);
      if (!website || !(await canAccessWebsite(req.user.id, website))) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;

      const filters: ConsentLogFilters = {};
      if (req.query.dateFrom) {
        const d = new Date(req.query.dateFrom as string);
        if (!isNaN(d.getTime())) filters.dateFrom = d;
      }
      if (req.query.dateTo) {
        const d = new Date(req.query.dateTo as string);
        if (!isNaN(d.getTime())) filters.dateTo = d;
      }
      if (req.query.action && typeof req.query.action === 'string') {
        filters.action = req.query.action;
      }
      if (req.query.search && typeof req.query.search === 'string') {
        filters.search = req.query.search;
      }
      
      const [logs, total, stats] = await Promise.all([
        storage.getConsentLogsByWebsiteId(website.id, limit, offset, filters),
        storage.getConsentLogsCount(website.id, filters),
        storage.getConsentLogStats(website.id, filters),
      ]);
      
      res.json({ logs, total, limit, offset, stats });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch consent logs" });
    }
  });

  // Export consent logs as CSV
  app.get("/api/websites/:id/consent-logs/export", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const website = await storage.getWebsiteById(req.params.id);
      if (!website || !(await canAccessWebsite(req.user.id, website))) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      // Get date range from query params
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
      
      const logs = await storage.getConsentLogsByDateRange(website.id, startDate, endDate);
      
      // Generate CSV
      const csvHeader = 'Timestamp,Visitor ID,Action,IP Hash,User Agent,Country,Region,Consent Choices,Banner Version,Policy Version,Expires At\n';
      const csvRows = logs.map(log => {
        const choices = log.consentChoices.replace(/"/g, '""');
        const userAgent = (log.userAgent || '').replace(/"/g, '""');
        return `"${log.timestamp.toISOString()}","${log.visitorId}","${log.action}","${log.ipHash || ''}","${userAgent}","${log.country || ''}","${log.region || ''}","${choices}","${log.bannerVersion || ''}","${log.policyVersion || ''}","${log.expiresAt?.toISOString() || ''}"`;
      }).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="consent-logs-${website.domain}-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvHeader + csvRows);
    } catch (error) {
      res.status(500).json({ error: "Failed to export consent logs" });
    }
  });

  // ==========================================
  // DIAGNOSTIC SCAN ENDPOINTS
  // ==========================================
  
  // Run a diagnostic scan for a website
  app.post("/api/websites/:id/diagnostic-scan", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const website = await storage.getWebsiteById(req.params.id);
      if (!website || !(await canAccessWebsite(req.user.id, website))) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      // Check daily diagnostic scan limit
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      const plan = (user.plan || 'solo') as PlanType;
      const limits = PLAN_LIMITS[plan];
      const dailyDiagScans = await storage.getDailyDiagnosticScanCount(req.user.id);

      if (!isUnlimited(limits.dailyDiagnosticScans) && dailyDiagScans >= limits.dailyDiagnosticScans) {
        return res.status(429).json({
          error: "Daily diagnostic scan limit reached",
          message: `Your ${plan} plan allows ${limits.dailyDiagnosticScans} diagnostic scan${limits.dailyDiagnosticScans === 1 ? '' : 's'} per day. Please upgrade for more scans.`,
          dailyScans: dailyDiagScans,
          limit: limits.dailyDiagnosticScans,
          plan,
        });
      }
      
      // Create pending scan record
      const scan = await storage.createDiagnosticScan({
        websiteId: website.id,
        status: 'running',
      });
      
      // Run diagnostic scan in background
      runDiagnosticScan(scan.id, website).catch(err => {
        console.error('Diagnostic scan error:', err);
      });
      
      res.status(201).json({ scanId: scan.id, status: 'running' });
    } catch (error) {
      res.status(500).json({ error: "Failed to start diagnostic scan" });
    }
  });

  // Get diagnostic scans for a website
  app.get("/api/websites/:id/diagnostic-scans", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const website = await storage.getWebsiteById(req.params.id);
      if (!website || !(await canAccessWebsite(req.user.id, website))) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      const scans = await storage.getDiagnosticScansByWebsiteId(website.id);
      res.json(scans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch diagnostic scans" });
    }
  });

  // Get latest diagnostic scan for a website
  app.get("/api/websites/:id/diagnostic-scan/latest", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const website = await storage.getWebsiteById(req.params.id);
      if (!website || !(await canAccessWebsite(req.user.id, website))) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      const scan = await storage.getLatestDiagnosticScan(website.id);
      res.json(scan || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch diagnostic scan" });
    }
  });

  // ========================================
  // AGENCY MANAGEMENT ROUTES
  // ========================================

  // Get current user's agency (if they own one)
  app.get("/api/agency", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const agency = await storage.getAgencyByOwnerId(req.user.id);
      if (!agency) {
        return res.status(404).json({ error: "Agency not found" });
      }
      
      res.json(agency);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agency" });
    }
  });

  // Get featured agencies (public - for landing page spotlight)
  app.get("/api/agencies/featured", async (req, res) => {
    try {
      const agencies = await storage.getFeaturedAgencies();
      res.json(agencies.map((a: any) => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
        description: a.description,
        logoUrl: a.logoUrl,
        websiteUrl: a.websiteUrl,
        heroText: a.heroText,
      })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured agencies" });
    }
  });

  // Get agency by slug (public)
  app.get("/api/agencies/:slug", async (req, res) => {
    try {
      const agency = await storage.getAgencyBySlug(req.params.slug);
      if (!agency || !agency.isActive) {
        return res.status(404).json({ error: "Agency not found" });
      }
      
      // Return public info only
      res.json({
        id: agency.id,
        name: agency.name,
        slug: agency.slug,
        description: agency.description,
        logoUrl: agency.logoUrl,
        websiteUrl: agency.websiteUrl,
        heroText: agency.heroText,
        isFeatured: agency.isFeatured,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agency" });
    }
  });

  // Create agency (only for users with agency plan)
  app.post("/api/agency", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      if (req.user.plan !== 'agency' && req.user.plan !== 'agency_pro') {
        return res.status(403).json({ error: "Agency or Agency Pro plan required" });
      }
      
      // Check if user already has an agency
      const existing = await storage.getAgencyByOwnerId(req.user.id);
      if (existing) {
        return res.status(400).json({ error: "You already have an agency" });
      }
      
      const { name, slug, description, logoUrl, websiteUrl, contactEmail, heroText } = req.body;
      
      if (!name || !slug) {
        return res.status(400).json({ error: "Name and slug are required" });
      }
      
      // Check slug uniqueness
      const slugExists = await storage.getAgencyBySlug(slug);
      if (slugExists) {
        return res.status(400).json({ error: "Slug already taken" });
      }
      
      const agency = await storage.createAgency({
        name,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
        description,
        logoUrl,
        websiteUrl,
        contactEmail,
        heroText,
        ownerId: req.user.id,
      });
      
      // Add owner as agency member with owner role
      await storage.createAgencyMember({
        agencyId: agency.id,
        userId: req.user.id,
        role: 'owner',
        acceptedAt: new Date(),
      });
      
      res.status(201).json(agency);
    } catch (error) {
      console.error('Failed to create agency:', error);
      res.status(500).json({ error: "Failed to create agency" });
    }
  });

  // Update agency
  app.patch("/api/agency", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const agency = await storage.getAgencyByOwnerId(req.user.id);
      if (!agency) {
        return res.status(404).json({ error: "Agency not found" });
      }
      
      const { name, description, logoUrl, websiteUrl, contactEmail, heroText } = req.body;
      
      const updated = await storage.updateAgency(agency.id, {
        name: name ?? agency.name,
        description: description ?? agency.description,
        logoUrl: logoUrl ?? agency.logoUrl,
        websiteUrl: websiteUrl ?? agency.websiteUrl,
        contactEmail: contactEmail ?? agency.contactEmail,
        heroText: heroText ?? agency.heroText,
      });
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update agency" });
    }
  });

  // Get agency clients
  app.get("/api/agency/clients", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const agency = await storage.getAgencyByOwnerId(req.user.id);
      if (!agency) {
        return res.status(404).json({ error: "Agency not found" });
      }
      
      const clients = await storage.getAgencyClients(agency.id);
      
      // Enrich with website counts
      const enrichedClients = await Promise.all(clients.map(async (client: any) => {
        const websiteCount = await storage.countWebsitesByUserId(client.userId);
        return {
          ...client,
          websiteCount,
        };
      }));
      
      res.json(enrichedClients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  // Add client to agency (link existing account by email)
  app.post("/api/agency/clients", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const agency = await storage.getAgencyByOwnerId(req.user.id);
      if (!agency) {
        return res.status(404).json({ error: "Agency not found" });
      }
      
      const { email, clientName, notes, relationshipType } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "No user found with this email. They need to create an account first." });
      }
      
      // Check if already a client
      const existingClients = await storage.getAgencyClients(agency.id);
      if (existingClients.some((c: any) => c.userId === user.id)) {
        return res.status(400).json({ error: "This user is already a client" });
      }
      
      const client = await storage.createAgencyClient({
        agencyId: agency.id,
        userId: user.id,
        clientName: clientName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        notes,
        relationshipType: relationshipType || 'managed',
      });
      
      res.status(201).json(client);
    } catch (error) {
      console.error('Failed to add client:', error);
      res.status(500).json({ error: "Failed to add client" });
    }
  });

  // Update agency client
  app.patch("/api/agency/clients/:id", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const agency = await storage.getAgencyByOwnerId(req.user.id);
      if (!agency) {
        return res.status(404).json({ error: "Agency not found" });
      }
      
      const client = await storage.getAgencyClientById(req.params.id);
      if (!client || client.agencyId !== agency.id) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      const { clientName, notes, status, relationshipType } = req.body;
      
      const updated = await storage.updateAgencyClient(client.id, {
        clientName: clientName ?? client.clientName,
        notes: notes ?? client.notes,
        status: status ?? client.status,
        relationshipType: relationshipType ?? client.relationshipType,
      });
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update client" });
    }
  });

  // Remove client from agency
  app.delete("/api/agency/clients/:id", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const agency = await storage.getAgencyByOwnerId(req.user.id);
      if (!agency) {
        return res.status(404).json({ error: "Agency not found" });
      }
      
      const client = await storage.getAgencyClientById(req.params.id);
      if (!client || client.agencyId !== agency.id) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      await storage.deleteAgencyClient(client.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove client" });
    }
  });

  // Get all websites for agency (across all clients)
  app.get("/api/agency/websites", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const agency = await storage.getAgencyByOwnerId(req.user.id);
      if (!agency) {
        return res.status(404).json({ error: "Agency not found" });
      }
      
      const clients = await storage.getAgencyClients(agency.id);
      
      // Get websites for each client
      const allWebsites: any[] = [];
      for (const client of clients) {
        const websites = await storage.getWebsitesByUserId(client.userId);
        allWebsites.push(...websites.map((w: any) => ({
          ...w,
          clientId: client.id,
          clientName: client.clientName,
          clientEmail: client.user.email,
        })));
      }
      
      res.json(allWebsites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch websites" });
    }
  });

  // Check if current user is linked to any agency
  app.get("/api/user/agency-link", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const links = await storage.getClientsByUserId(req.user.id);
      res.json(links);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agency links" });
    }
  });

  // Send client invite email
  app.post("/api/agency/invites", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const agency = await storage.getAgencyByOwnerId(req.user.id);
      if (!agency) {
        return res.status(404).json({ error: "Agency not found" });
      }
      
      const { email, message } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      // Create invite record
      const token = crypto.randomBytes(32).toString('hex');
      const invite = await storage.createAgencyInvite({
        agencyId: agency.id,
        email,
        token,
        inviteType: 'client',
        invitedBy: req.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
      
      // Send invite email
      const { sendAgencyClientInviteEmail, getBaseUrl } = await import('./email');
      const inviteUrl = `${getBaseUrl()}/agency/${agency.slug}?invite=${invite.id}`;
      
      await sendAgencyClientInviteEmail(email, agency.name, inviteUrl, message);
      
      res.status(201).json({ success: true, inviteId: invite.id });
    } catch (error) {
      console.error('Failed to send invite:', error);
      res.status(500).json({ error: "Failed to send invite" });
    }
  });

  // Accept an agency invite (for existing/logged-in users)
  app.post("/api/agency/invites/:id/accept", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const invite = await storage.getAgencyInviteById(req.params.id);
      if (!invite) {
        return res.status(404).json({ error: "Invitation not found" });
      }
      
      if (invite.email.toLowerCase() !== req.user.email.toLowerCase()) {
        return res.status(403).json({ error: "This invitation was sent to a different email address" });
      }
      
      if (invite.status === 'accepted') {
        return res.status(400).json({ error: "This invitation has already been accepted" });
      }
      
      if (new Date(invite.expiresAt) < new Date()) {
        await storage.updateAgencyInvite(invite.id, { status: 'expired' });
        return res.status(400).json({ error: "This invitation has expired" });
      }
      
      const agency = await storage.getAgencyById(invite.agencyId);
      if (!agency) {
        return res.status(404).json({ error: "Agency not found" });
      }
      
      const existingClients = await storage.getAgencyClients(agency.id);
      const alreadyLinked = existingClients.some((c: any) => c.userId === req.user!.id);
      
      if (!alreadyLinked) {
        await storage.createAgencyClient({
          agencyId: agency.id,
          userId: req.user.id,
          clientName: req.user.email,
          relationshipType: 'managed',
        });
      }
      
      await storage.updateAgencyInvite(invite.id, { status: 'accepted' });
      
      res.json({ success: true, agencyName: agency.name });
    } catch (error) {
      console.error('Failed to accept invite:', error);
      res.status(500).json({ error: "Failed to accept invitation" });
    }
  });

  // Get pending invites for agency
  app.get("/api/agency/invites", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const agency = await storage.getAgencyByOwnerId(req.user.id);
      if (!agency) {
        return res.status(404).json({ error: "Agency not found" });
      }
      
      const invites = await storage.getAgencyInvitesByAgencyId(agency.id);
      res.json(invites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invites" });
    }
  });

  // Get aggregate analytics for all agency clients
  app.get("/api/agency/analytics", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const agency = await storage.getAgencyByOwnerId(req.user.id);
      if (!agency) {
        return res.status(404).json({ error: "Agency not found" });
      }
      
      const clients = await storage.getAgencyClients(agency.id);
      
      // Get all website IDs across clients
      const allWebsiteIds: string[] = [];
      for (const client of clients) {
        const websites = await storage.getWebsitesByUserId(client.userId);
        allWebsiteIds.push(...websites.map((w: any) => w.id));
      }
      
      if (allWebsiteIds.length === 0) {
        return res.json({
          totalImpressions: 0,
          totalAccepts: 0,
          totalRejects: 0,
          totalCustomizes: 0,
          acceptanceRate: 0,
          websiteCount: 0,
          clientCount: clients.length,
          byClient: [],
        });
      }
      
      // Aggregate analytics across all websites
      let totalImpressions = 0;
      let totalAccepts = 0;
      let totalRejects = 0;
      let totalCustomizes = 0;
      
      const byClient: any[] = [];
      
      for (const client of clients) {
        const websites = await storage.getWebsitesByUserId(client.userId);
        let clientImpressions = 0;
        let clientAccepts = 0;
        let clientRejects = 0;
        
        for (const website of websites) {
          const events = await storage.getAnalyticsByWebsiteId(website.id, 365);
          const impressions = events.filter((e: any) => e.eventType === 'impression').length;
          const accepts = events.filter((e: any) => e.eventType === 'accept_all' || e.eventType === 'accept').length;
          const rejects = events.filter((e: any) => e.eventType === 'reject_all' || e.eventType === 'reject').length;
          const customizes = events.filter((e: any) => e.eventType === 'customize' || e.eventType === 'save_preferences').length;
          
          totalImpressions += impressions;
          totalAccepts += accepts;
          totalRejects += rejects;
          totalCustomizes += customizes;
          
          clientImpressions += impressions;
          clientAccepts += accepts;
          clientRejects += rejects;
        }
        
        byClient.push({
          clientId: client.id,
          clientName: client.clientName,
          websiteCount: websites.length,
          impressions: clientImpressions,
          accepts: clientAccepts,
          rejects: clientRejects,
          acceptanceRate: clientImpressions > 0 ? Math.round((clientAccepts / clientImpressions) * 100) : 0,
        });
      }
      
      const acceptanceRate = totalImpressions > 0 
        ? Math.round((totalAccepts / totalImpressions) * 100) 
        : 0;
      
      res.json({
        totalImpressions,
        totalAccepts,
        totalRejects,
        totalCustomizes,
        acceptanceRate,
        websiteCount: allWebsiteIds.length,
        clientCount: clients.length,
        byClient,
      });
    } catch (error) {
      console.error('Failed to fetch agency analytics:', error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Bulk update banner config across multiple websites
  app.post("/api/agency/bulk-update", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const agency = await storage.getAgencyByOwnerId(req.user.id);
      if (!agency) {
        return res.status(404).json({ error: "Agency not found" });
      }
      
      const { websiteIds, updates } = req.body;
      
      if (!websiteIds || !Array.isArray(websiteIds) || websiteIds.length === 0) {
        return res.status(400).json({ error: "Website IDs are required" });
      }
      
      if (!updates || typeof updates !== 'object') {
        return res.status(400).json({ error: "Updates object is required" });
      }
      
      // Verify all websites belong to agency clients
      const clients = await storage.getAgencyClients(agency.id);
      const clientUserIds = clients.map((c: any) => c.userId);
      
      const results: any[] = [];
      for (const websiteId of websiteIds) {
        const website = await storage.getWebsiteById(websiteId);
        if (!website || !clientUserIds.includes(website.userId)) {
          results.push({ websiteId, success: false, error: "Not authorized" });
          continue;
        }
        
        try {
          // Get existing config
          const existingConfig = await storage.getBannerConfigByWebsiteId(websiteId);
          if (existingConfig) {
            await storage.updateBannerConfig(existingConfig.id, updates);
            results.push({ websiteId, success: true });
          } else {
            results.push({ websiteId, success: false, error: "No banner config" });
          }
        } catch (err) {
          results.push({ websiteId, success: false, error: "Update failed" });
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      res.json({ 
        success: true, 
        updated: successCount, 
        failed: results.length - successCount,
        results 
      });
    } catch (error) {
      console.error('Failed to bulk update:', error);
      res.status(500).json({ error: "Failed to bulk update" });
    }
  });

  // PARTNER BADGE WIDGET ROUTES
  
  // Verify partner status (public API)
  app.get("/api/partner-badge/:slug/verify", async (req, res) => {
    try {
      const agency = await storage.getAgencyBySlug(req.params.slug);
      if (!agency || !agency.isActive) {
        return res.json({ verified: false, reason: "Partner not found or inactive" });
      }
      
      res.json({
        verified: true,
        partner: {
          name: agency.name,
          slug: agency.slug,
          logoUrl: agency.logoUrl,
          isFeatured: agency.isFeatured,
        }
      });
    } catch (error) {
      res.json({ verified: false, reason: "Verification failed" });
    }
  });

  // Partner badge SVG (embeddable image)
  app.get("/api/partner-badge/:slug/badge.svg", async (req, res) => {
    try {
      const agency = await storage.getAgencyBySlug(req.params.slug);
      const theme = req.query.theme === 'dark' ? 'dark' : 'light';
      const size = req.query.size === 'small' ? 'small' : req.query.size === 'large' ? 'large' : 'medium';
      const aspect = req.query.aspect === 'square' ? 'square' : 'wide';
      
      const colors = theme === 'dark' 
        ? { bg: '#2D1F4E', cardBg: 'rgba(114,108,234,0.12)', border: 'rgba(114,108,234,0.3)', text: '#ffffff', subtext: '#c4b5fd', accent: '#726CEA', checkBg: '#726CEA', checkFg: '#ffffff' }
        : { bg: '#ffffff', cardBg: 'rgba(114,108,234,0.06)', border: 'rgba(114,108,234,0.15)', text: '#2D1F4E', subtext: '#71717a', accent: '#726CEA', checkBg: '#726CEA', checkFg: '#ffffff' };
      
      const isVerified = agency && agency.isActive;
      const statusText = isVerified ? 'Verified Partner' : 'Not Verified';
      
      const logoPath = path.join(process.cwd(), 'client', 'public', 'consentease-badge-logo.png');
      let logoDataUrl = '';
      try {
        const logoBuffer = fs.readFileSync(logoPath);
        logoDataUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      } catch (e) {
        console.error('Failed to load badge logo:', e);
      }

      const checkIcon = isVerified
        ? `<circle cx="0" cy="0" r="CHECKR" fill="${colors.checkBg}"/><path d="M-CHECKP1,-CHECKP2 L-CHECKP3,CHECKP4 LCHECKP5,-CHECKP6" fill="none" stroke="${colors.checkFg}" stroke-width="CHECKSW" stroke-linecap="round" stroke-linejoin="round"/>`
        : `<circle cx="0" cy="0" r="CHECKR" fill="#ef4444"/><path d="M-CHECKP1,-CHECKP1 LCHECKP1,CHECKP1 M-CHECKP1,CHECKP1 LCHECKP1,-CHECKP1" fill="none" stroke="#fff" stroke-width="CHECKSW" stroke-linecap="round"/>`;
      
      let svg: string;
      
      if (aspect === 'square') {
        const sizes = {
          small: { size: 110, logoSize: 36, fontSize: 10, statusFontSize: 8, checkR: 6, checkP: 2.5, checkSW: 1.5, radius: 12 },
          medium: { size: 140, logoSize: 46, fontSize: 12, statusFontSize: 10, checkR: 7, checkP: 3, checkSW: 1.8, radius: 14 },
          large: { size: 180, logoSize: 58, fontSize: 15, statusFontSize: 12, checkR: 9, checkP: 3.5, checkSW: 2, radius: 16 }
        };
        const s = sizes[size];
        const cx = s.size / 2;
        const logoX = cx - s.logoSize / 2;
        const logoY = s.size * 0.14;
        const titleY = logoY + s.logoSize + s.fontSize + 6;
        const statusY = titleY + s.statusFontSize + 6;
        const checkX = cx;
        const checkY = statusY + s.checkR + 6;
        
        const renderedCheck = checkIcon
          .replace(/CHECKR/g, String(s.checkR))
          .replace(/CHECKP1/g, String(s.checkP))
          .replace(/CHECKP2/g, String(s.checkP * 0.4))
          .replace(/CHECKP3/g, String(s.checkP * 0.3))
          .replace(/CHECKP4/g, String(s.checkP * 0.8))
          .replace(/CHECKP5/g, String(s.checkP * 1.2))
          .replace(/CHECKP6/g, String(s.checkP * 1.1))
          .replace(/CHECKSW/g, String(s.checkSW));
        
        svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${s.size}" height="${s.size}" viewBox="0 0 ${s.size} ${s.size}">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(114,108,234,0.15)"/>
    </filter>
  </defs>
  <rect width="${s.size}" height="${s.size}" rx="${s.radius}" fill="${colors.bg}" filter="url(#shadow)" stroke="${colors.border}" stroke-width="1"/>
  <image x="${logoX}" y="${logoY}" width="${s.logoSize}" height="${s.logoSize}" href="${logoDataUrl}" preserveAspectRatio="xMidYMid meet"/>
  <text x="${cx}" y="${titleY}" text-anchor="middle" font-family="'Plus Jakarta Sans',system-ui,sans-serif" font-size="${s.fontSize}" font-weight="700" fill="${colors.text}">ConsentEase</text>
  <g transform="translate(${cx},${statusY})">
    <g transform="translate(${-(s.checkR + 2 + s.statusFontSize * statusText.length * 0.28)},${-s.statusFontSize * 0.35})">
      ${renderedCheck}
    </g>
    <text x="${-(s.statusFontSize * statusText.length * 0.28 - s.checkR - 2)}" y="0" font-family="'Inter',system-ui,sans-serif" font-size="${s.statusFontSize}" font-weight="600" fill="${isVerified ? colors.accent : '#ef4444'}">${statusText}</text>
  </g>
</svg>`;
      } else {
        const sizes = {
          small: { width: 230, height: 56, fontSize: 14, statusFontSize: 10, logoSize: 32, padding: 14, checkR: 6, checkP: 2.5, checkSW: 1.5, radius: 10 },
          medium: { width: 280, height: 68, fontSize: 17, statusFontSize: 11, logoSize: 40, padding: 16, checkR: 7, checkP: 3, checkSW: 1.8, radius: 12 },
          large: { width: 350, height: 84, fontSize: 21, statusFontSize: 13, logoSize: 50, padding: 20, checkR: 8, checkP: 3.5, checkSW: 2, radius: 14 }
        };
        const s = sizes[size];
        const logoX = s.padding;
        const logoY = (s.height - s.logoSize) / 2;
        const textX = logoX + s.logoSize + 12;
        const lineGap = 5;
        const totalTextH = s.fontSize + lineGap + s.statusFontSize;
        const titleY = (s.height - totalTextH) / 2 + s.fontSize;
        const statusBaseY = titleY + lineGap + s.statusFontSize;
        
        const renderedCheck = checkIcon
          .replace(/CHECKR/g, String(s.checkR))
          .replace(/CHECKP1/g, String(s.checkP))
          .replace(/CHECKP2/g, String(s.checkP * 0.4))
          .replace(/CHECKP3/g, String(s.checkP * 0.3))
          .replace(/CHECKP4/g, String(s.checkP * 0.8))
          .replace(/CHECKP5/g, String(s.checkP * 1.2))
          .replace(/CHECKP6/g, String(s.checkP * 1.1))
          .replace(/CHECKSW/g, String(s.checkSW));
        
        svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${s.width}" height="${s.height}" viewBox="0 0 ${s.width} ${s.height}">
  <defs>
    <filter id="shadow" x="-5%" y="-10%" width="110%" height="130%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="rgba(114,108,234,0.12)"/>
    </filter>
  </defs>
  <rect width="${s.width}" height="${s.height}" rx="${s.radius}" fill="${colors.bg}" filter="url(#shadow)" stroke="${colors.border}" stroke-width="1"/>
  <image x="${logoX}" y="${logoY}" width="${s.logoSize}" height="${s.logoSize}" href="${logoDataUrl}" preserveAspectRatio="xMidYMid meet"/>
  <text x="${textX}" y="${titleY}" font-family="'Plus Jakarta Sans',system-ui,sans-serif" font-size="${s.fontSize}" font-weight="700" fill="${colors.text}">ConsentEase</text>
  <g transform="translate(${textX},${statusBaseY})">
    <g transform="translate(0,${-s.statusFontSize * 0.35})">
      ${renderedCheck}
    </g>
    <text x="${s.checkR * 2 + 4}" y="0" font-family="'Inter',system-ui,sans-serif" font-size="${s.statusFontSize}" font-weight="600" fill="${isVerified ? colors.accent : '#ef4444'}">${statusText}</text>
  </g>
</svg>`;
      }

      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(svg);
    } catch (error) {
      res.status(500).send('Failed to generate badge');
    }
  });

  // Partner badge embed script (JavaScript widget)
  app.get("/api/partner-badge/:slug/script.js", async (req, res) => {
    try {
      const slug = req.params.slug;
      
      // Validate slug format: only allow alphanumeric and hyphens
      if (!/^[a-zA-Z0-9-]+$/.test(slug)) {
        res.status(400).send('// Invalid partner slug');
        return;
      }
      
      // Verify the agency exists and is active
      const agency = await storage.getAgencyBySlug(slug);
      if (!agency || !agency.isActive) {
        res.status(404).send('// Partner not found');
        return;
      }
      
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://consentease.io' 
        : `${req.protocol}://${req.get('host')}`;
      
      // Use JSON.stringify for safe string escaping
      const safeSlug = JSON.stringify(agency.slug);
      const safeBaseUrl = JSON.stringify(baseUrl);
      
      const script = `(function() {
  var slug = ${safeSlug};
  var baseUrl = ${safeBaseUrl};
  var container = document.currentScript && document.currentScript.parentElement ? document.currentScript.parentElement : document.body;
  var theme = document.currentScript.getAttribute('data-theme') || 'light';
  var size = document.currentScript.getAttribute('data-size') || 'medium';
  var aspect = document.currentScript.getAttribute('data-aspect') || 'wide';
  
  var wrapper = document.createElement('a');
  wrapper.href = baseUrl + "/partner/" + slug;
  wrapper.target = "_blank";
  wrapper.rel = "noopener noreferrer";
  wrapper.style.display = "inline-block";
  wrapper.style.textDecoration = "none";
  wrapper.title = "ConsentEase Verified Partner";
  
  var img = document.createElement('img');
  img.src = baseUrl + "/api/partner-badge/" + slug + "/badge.svg?theme=" + theme + "&size=" + size + "&aspect=" + aspect;
  img.alt = "ConsentEase Partner Badge";
  img.style.display = "block";
  img.style.border = "none";
  
  wrapper.appendChild(img);
  container.appendChild(wrapper);
})();`;

      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(script);
    } catch (error) {
      res.status(500).send('// Failed to load partner badge');
    }
  });

  // Partner badge HTML snippet (for easy copy/paste)
  app.get("/api/partner-badge/:slug/embed-code", async (req, res) => {
    try {
      const agency = await storage.getAgencyBySlug(req.params.slug);
      if (!agency || !agency.isActive) {
        return res.status(404).json({ error: "Partner not found" });
      }
      
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://consentease.io' 
        : `${req.protocol}://${req.get('host')}`;
      
      const embedCodes = {
        script: `<!-- ConsentEase Partner Badge -->
<div id="consentease-partner-badge">
  <script src="${baseUrl}/api/partner-badge/${agency.slug}/script.js" data-theme="light" data-size="medium"></script>
</div>`,
        scriptDark: `<!-- ConsentEase Partner Badge (Dark) -->
<div id="consentease-partner-badge">
  <script src="${baseUrl}/api/partner-badge/${agency.slug}/script.js" data-theme="dark" data-size="medium"></script>
</div>`,
        image: `<!-- ConsentEase Partner Badge (Image Only) -->
<a href="${baseUrl}/partner/${agency.slug}" target="_blank" rel="noopener noreferrer" title="ConsentEase Verified Partner">
  <img src="${baseUrl}/api/partner-badge/${agency.slug}/badge.svg?theme=light&size=medium" alt="ConsentEase Partner Badge" />
</a>`,
        imageDark: `<!-- ConsentEase Partner Badge (Image Only - Dark) -->
<a href="${baseUrl}/partner/${agency.slug}" target="_blank" rel="noopener noreferrer" title="ConsentEase Verified Partner">
  <img src="${baseUrl}/api/partner-badge/${agency.slug}/badge.svg?theme=dark&size=medium" alt="ConsentEase Partner Badge" />
</a>`
      };
      
      res.json({
        partner: {
          name: agency.name,
          slug: agency.slug,
        },
        embedCodes,
        previewUrls: {
          light: `${baseUrl}/api/partner-badge/${agency.slug}/badge.svg?theme=light&size=medium`,
          dark: `${baseUrl}/api/partner-badge/${agency.slug}/badge.svg?theme=dark&size=medium`,
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate embed code" });
    }
  });

  // ==========================================
  // POLICY GENERATOR API ROUTES
  // ==========================================

  // GET /api/policies/access - Check user's policy access (MUST be before :websiteId route)
  app.get("/api/policies/access", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const isAgency = user.plan === 'agency' || user.plan === 'agency_pro';
      const isAgencyPro = user.plan === 'agency_pro';
      
      // Check purchase access
      const hasPrivacyPurchase = await storage.hasPolicyAccess(req.user.id, 'privacy');
      const hasCookiePurchase = await storage.hasPolicyAccess(req.user.id, 'cookie');
      
      // For agency plans, they have full access
      const hasPrivacyAccess = hasPrivacyPurchase || isAgency;
      const hasCookieAccess = hasCookiePurchase || isAgency;
      
      // Get quota info for agency users
      let quota = { used: 0, limit: 0, unlimited: false };
      if (isAgency) {
        const used = await storage.getMonthlyPolicyGenerations(req.user.id);
        const limit = PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS]?.policyGenerations || 0;
        quota = {
          used,
          limit: isUnlimited(limit) ? 0 : limit,
          unlimited: isUnlimited(limit),
        };
      }
      
      res.json({
        privacy: hasPrivacyAccess,
        cookie: hasCookieAccess,
        isAgency,
        isAgencyPro,
        quota,
      });
    } catch (error) {
      console.error("Error checking policy access:", error);
      res.status(500).json({ error: "Failed to check access" });
    }
  });

  // 1. GET /api/policies/:websiteId - Get all policies for a website
  app.get("/api/policies/:websiteId", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const { websiteId } = req.params;
      const website = await storage.getWebsiteById(websiteId);
      
      if (!website || !(await canAccessWebsite(req.user.id, website))) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      const policies = await storage.getPoliciesByWebsiteId(websiteId);
      res.json(policies);
    } catch (error) {
      console.error("Error fetching policies:", error);
      res.status(500).json({ error: "Failed to fetch policies" });
    }
  });

  // 2. GET /api/policy/:id - Get single policy by ID
  app.get("/api/policy/:id", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const { id } = req.params;
      const policy = await storage.getPolicyById(id);
      
      if (!policy) {
        return res.status(404).json({ error: "Policy not found" });
      }
      
      if (policy.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(policy);
    } catch (error) {
      console.error("Error fetching policy:", error);
      res.status(500).json({ error: "Failed to fetch policy" });
    }
  });

  // 3. POST /api/policies/generate - Generate a new policy
  app.post("/api/policies/generate", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const { 
        websiteId, 
        type, 
        language = 'en', 
        jurisdiction = 'gdpr',
        businessName,
        businessAddress,
        businessCountry,
        businessEmail,
        businessPhone,
        businessWebsite,
        vatNumber,
        dpoName,
        dpoEmail,
        dataCollected,
        dataUsagePurposes,
        thirdPartyServices,
        dataRetentionPeriod,
        allowsDataExport = true,
        allowsDataDeletion = true,
        hasMinors = false,
        sellsData = false,
      } = req.body;
      
      // Validate required fields
      if (!websiteId || !type || !businessName || !businessEmail) {
        return res.status(400).json({ error: "Missing required fields: websiteId, type, businessName, businessEmail" });
      }
      
      if (!['privacy', 'cookie'].includes(type)) {
        return res.status(400).json({ error: "Type must be 'privacy' or 'cookie'" });
      }
      
      // Verify user owns the website
      const website = await storage.getWebsiteById(websiteId);
      if (!website || !(await canAccessWebsite(req.user.id, website))) {
        return res.status(404).json({ error: "Website not found" });
      }
      
      // Check access: hasPolicyAccess OR agency/agency_pro plan
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const isAgencyPlan = user.plan === 'agency' || user.plan === 'agency_pro';
      const hasPurchaseAccess = await storage.hasPolicyAccess(req.user.id, type as 'privacy' | 'cookie');
      
      if (!hasPurchaseAccess && !isAgencyPlan) {
        return res.status(403).json({ error: "Policy generator access required. Purchase access or upgrade to agency plan." });
      }
      
      // For agency users (not agency_pro), check monthly quota
      if (user.plan === 'agency') {
        const monthlyGenerations = await storage.getMonthlyPolicyGenerations(req.user.id);
        const limit = PLAN_LIMITS.agency.policyGenerations;
        
        if (monthlyGenerations >= limit) {
          return res.status(403).json({ 
            error: "Monthly policy generation limit reached", 
            quota: { used: monthlyGenerations, limit } 
          });
        }
      }
      
      // For cookie policy, require cookie scan first
      if (type === 'cookie') {
        const cookies = await storage.getCookiesByWebsiteId(websiteId);
        if (cookies.length === 0) {
          return res.status(400).json({ 
            error: "Cookie scan required before generating cookie policy. Please scan your website for cookies first." 
          });
        }
      }
      
      // Prepare context for policy generation
      const categories = await storage.getCookieCategoriesByWebsiteId(websiteId);
      const cookies = await storage.getCookiesByWebsiteId(websiteId);
      
      const context = {
        businessName,
        businessAddress,
        businessCountry,
        businessEmail,
        businessPhone,
        businessWebsite: businessWebsite || website.domain,
        vatNumber,
        dpoName,
        dpoEmail,
        dataCollected: Array.isArray(dataCollected) ? dataCollected : JSON.parse(dataCollected || '[]'),
        dataUsagePurposes: Array.isArray(dataUsagePurposes) ? dataUsagePurposes : JSON.parse(dataUsagePurposes || '[]'),
        thirdPartyServices: Array.isArray(thirdPartyServices) ? thirdPartyServices : JSON.parse(thirdPartyServices || '[]'),
        dataRetentionPeriod,
        allowsDataExport,
        allowsDataDeletion,
        hasMinors,
        sellsData,
        jurisdiction: jurisdiction as 'gdpr' | 'ccpa' | 'lgpd' | 'all',
        language,
        lastUpdated: new Date().toISOString().split('T')[0],
        cookies: cookies.map(c => ({
          name: c.name,
          provider: c.provider || undefined,
          purpose: c.purpose || '',
          expiry: c.expiry || undefined,
          type: c.type || 'http',
          category: categories.find(cat => cat.id === c.categoryId)?.name || 'analytics',
        })),
        cookieCategories: categories.map(c => ({
          name: c.name,
          displayName: c.displayName,
          description: c.description,
          isRequired: c.isRequired,
        })),
      };
      
      // Generate the policy
      const generated = type === 'privacy' 
        ? generatePrivacyPolicy(context)
        : generateCookiePolicy(context);
      
      // Create policy in database
      const policy = await storage.createPolicy({
        websiteId,
        userId: req.user.id,
        type,
        status: 'draft',
        language,
        jurisdiction,
        businessName,
        businessAddress,
        businessCountry,
        businessEmail,
        businessPhone,
        businessWebsite: businessWebsite || website.domain,
        vatNumber,
        dpoName,
        dpoEmail,
        dataCollected: JSON.stringify(context.dataCollected),
        dataUsagePurposes: JSON.stringify(context.dataUsagePurposes),
        thirdPartyServices: JSON.stringify(context.thirdPartyServices),
        dataRetentionPeriod,
        allowsDataExport,
        allowsDataDeletion,
        hasMinors,
        sellsData,
        content: generated.html,
        contentMarkdown: generated.markdown,
        templateVersion: '1.0',
        version: 1,
      });
      
      // Log generation
      await storage.createPolicyGenerationLog({
        userId: req.user.id,
        agencyId: undefined,
        websiteId,
        policyId: policy.id,
        type,
        action: 'generate',
      });
      
      res.status(201).json(policy);
    } catch (error) {
      console.error("Error generating policy:", error);
      res.status(500).json({ error: "Failed to generate policy" });
    }
  });

  // 4. PUT /api/policies/:id - Update policy intake data and regenerate
  app.put("/api/policies/:id", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const { id } = req.params;
      const policy = await storage.getPolicyById(id);
      
      if (!policy) {
        return res.status(404).json({ error: "Policy not found" });
      }
      
      if (policy.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const {
        language,
        jurisdiction,
        businessName,
        businessAddress,
        businessCountry,
        businessEmail,
        businessPhone,
        businessWebsite,
        vatNumber,
        dpoName,
        dpoEmail,
        dataCollected,
        dataUsagePurposes,
        thirdPartyServices,
        dataRetentionPeriod,
        allowsDataExport,
        allowsDataDeletion,
        hasMinors,
        sellsData,
      } = req.body;
      
      // Get website for cookies/categories
      const website = await storage.getWebsiteById(policy.websiteId);
      const categories = await storage.getCookieCategoriesByWebsiteId(policy.websiteId);
      const cookies = await storage.getCookiesByWebsiteId(policy.websiteId);
      
      // Build updated context
      const context = {
        businessName: businessName || policy.businessName,
        businessAddress: businessAddress ?? policy.businessAddress,
        businessCountry: businessCountry ?? policy.businessCountry,
        businessEmail: businessEmail || policy.businessEmail,
        businessPhone: businessPhone ?? policy.businessPhone,
        businessWebsite: businessWebsite ?? policy.businessWebsite ?? website?.domain,
        vatNumber: vatNumber ?? policy.vatNumber,
        dpoName: dpoName ?? policy.dpoName,
        dpoEmail: dpoEmail ?? policy.dpoEmail,
        dataCollected: dataCollected 
          ? (Array.isArray(dataCollected) ? dataCollected : JSON.parse(dataCollected))
          : JSON.parse(policy.dataCollected || '[]'),
        dataUsagePurposes: dataUsagePurposes 
          ? (Array.isArray(dataUsagePurposes) ? dataUsagePurposes : JSON.parse(dataUsagePurposes))
          : JSON.parse(policy.dataUsagePurposes || '[]'),
        thirdPartyServices: thirdPartyServices 
          ? (Array.isArray(thirdPartyServices) ? thirdPartyServices : JSON.parse(thirdPartyServices))
          : JSON.parse(policy.thirdPartyServices || '[]'),
        dataRetentionPeriod: dataRetentionPeriod ?? policy.dataRetentionPeriod,
        allowsDataExport: allowsDataExport ?? policy.allowsDataExport ?? true,
        allowsDataDeletion: allowsDataDeletion ?? policy.allowsDataDeletion ?? true,
        hasMinors: hasMinors ?? policy.hasMinors ?? false,
        sellsData: sellsData ?? policy.sellsData ?? false,
        jurisdiction: (jurisdiction || policy.jurisdiction) as 'gdpr' | 'ccpa' | 'lgpd' | 'all',
        language: language || policy.language,
        lastUpdated: new Date().toISOString().split('T')[0],
        cookies: cookies.map(c => ({
          name: c.name,
          provider: c.provider || undefined,
          purpose: c.purpose || '',
          expiry: c.expiry || undefined,
          type: c.type || 'http',
          category: categories.find(cat => cat.id === c.categoryId)?.name || 'analytics',
        })),
        cookieCategories: categories.map(c => ({
          name: c.name,
          displayName: c.displayName,
          description: c.description,
          isRequired: c.isRequired,
        })),
      };
      
      // Regenerate the policy
      const generated = policy.type === 'privacy' 
        ? generatePrivacyPolicy(context)
        : generateCookiePolicy(context);
      
      // Update policy
      const updatedPolicy = await storage.updatePolicy(id, {
        language: context.language,
        jurisdiction: context.jurisdiction,
        businessName: context.businessName,
        businessAddress: context.businessAddress,
        businessCountry: context.businessCountry,
        businessEmail: context.businessEmail,
        businessPhone: context.businessPhone,
        businessWebsite: context.businessWebsite,
        vatNumber: context.vatNumber,
        dpoName: context.dpoName,
        dpoEmail: context.dpoEmail,
        dataCollected: JSON.stringify(context.dataCollected),
        dataUsagePurposes: JSON.stringify(context.dataUsagePurposes),
        thirdPartyServices: JSON.stringify(context.thirdPartyServices),
        dataRetentionPeriod: context.dataRetentionPeriod,
        allowsDataExport: context.allowsDataExport,
        allowsDataDeletion: context.allowsDataDeletion,
        hasMinors: context.hasMinors,
        sellsData: context.sellsData,
        content: generated.html,
        contentMarkdown: generated.markdown,
        version: policy.version + 1,
        lastEditedAt: new Date(),
      });
      
      // Log regeneration
      await storage.createPolicyGenerationLog({
        userId: req.user.id,
        websiteId: policy.websiteId,
        policyId: policy.id,
        type: policy.type,
        action: 'regenerate',
      });
      
      res.json(updatedPolicy);
    } catch (error) {
      console.error("Error updating policy:", error);
      res.status(500).json({ error: "Failed to update policy" });
    }
  });

  // 5. POST /api/policies/:id/publish - Publish a policy
  app.post("/api/policies/:id/publish", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const { id } = req.params;
      const policy = await storage.getPolicyById(id);
      
      if (!policy) {
        return res.status(404).json({ error: "Policy not found" });
      }
      
      if (policy.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const updatedPolicy = await storage.updatePolicy(id, {
        status: 'published',
        publishedAt: new Date(),
      });
      
      res.json(updatedPolicy);
    } catch (error) {
      console.error("Error publishing policy:", error);
      res.status(500).json({ error: "Failed to publish policy" });
    }
  });

  // 6. DELETE /api/policies/:id - Delete a policy
  app.delete("/api/policies/:id", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const { id } = req.params;
      const policy = await storage.getPolicyById(id);
      
      if (!policy) {
        return res.status(404).json({ error: "Policy not found" });
      }
      
      if (policy.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      await storage.deletePolicy(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting policy:", error);
      res.status(500).json({ error: "Failed to delete policy" });
    }
  });

  // 7. GET /api/policies/hosted/:websitePublicId/:type - Public hosted policy URL
  app.get("/api/policies/hosted/:websitePublicId/:type", async (req, res) => {
    try {
      const { websitePublicId, type } = req.params;
      
      if (!['privacy', 'cookie'].includes(type)) {
        return res.status(400).json({ error: "Invalid policy type" });
      }
      
      const website = await storage.getWebsiteByPublicId(websitePublicId);
      if (!website) {
        return res.status(404).send("Website not found");
      }
      
      const policy = await storage.getPolicyByWebsiteAndType(website.id, type);
      if (!policy || policy.status !== 'published') {
        return res.status(404).send("Policy not found or not published");
      }
      
      // Return HTML content with proper headers
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(policy.content || '');
    } catch (error) {
      console.error("Error fetching hosted policy:", error);
      res.status(500).send("Failed to load policy");
    }
  });

  // 8. POST /api/policies/purchase - Create checkout session for policy purchase
  app.post("/api/policies/purchase", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const { type } = req.body;
      
      if (!['privacy', 'cookie', 'bundle'].includes(type)) {
        return res.status(400).json({ error: "Invalid purchase type. Must be 'privacy', 'cookie', or 'bundle'" });
      }
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Check if user already has access
      if (type === 'bundle') {
        const hasPrivacy = await storage.hasPolicyAccess(req.user.id, 'privacy');
        const hasCookie = await storage.hasPolicyAccess(req.user.id, 'cookie');
        if (hasPrivacy && hasCookie) {
          return res.status(400).json({ error: "You already have access to both policy generators" });
        }
      } else {
        const hasAccess = await storage.hasPolicyAccess(req.user.id, type as 'privacy' | 'cookie');
        if (hasAccess) {
          return res.status(400).json({ error: `You already have access to the ${type} policy generator` });
        }
      }
      
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripeService.createAndSyncCustomer(user.email, user.id, user.companyName || undefined, user.vatNumber);
        await storage.updateUser(user.id, { stripeCustomerId: customer.id });
        customerId = customer.id;
      }
      
      // Set prices
      const prices: Record<string, number> = {
        privacy: 900,
        cookie: 900,
        bundle: 1500,
      };
      
      const productNames: Record<string, string> = {
        privacy: 'Privacy Policy Generator',
        cookie: 'Cookie Policy Generator',
        bundle: 'Policy Generator Bundle (Privacy + Cookie)',
      };
      
      const productDescriptions: Record<string, string> = {
        privacy: 'Generate unlimited privacy policies for your websites',
        cookie: 'Generate unlimited cookie policies for your websites',
        bundle: 'Generate unlimited privacy and cookie policies for your websites',
      };
      
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://consentease.io' 
        : `${req.protocol}://${req.get('host')}`;
      
      const session = await stripeService.createOneTimeCheckoutSession(
        customerId,
        prices[type],
        'eur',
        productNames[type],
        productDescriptions[type],
        `${baseUrl}/dashboard/settings?purchase_verified=true&type=${type}&session_id={CHECKOUT_SESSION_ID}`,
        `${baseUrl}/dashboard/settings?purchase_cancelled=true`,
        { purchaseType: type, userId: req.user.id }
      );
      
      // Create pending purchase record
      await storage.createPolicyPurchase({
        userId: req.user.id,
        type,
        stripeSessionId: session.id,
        amount: prices[type],
        currency: 'eur',
        status: 'pending',
      });
      
      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating policy purchase session:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // 9. GET /api/policies/purchase/verify - Verify purchase after Stripe redirect
  app.get("/api/policies/purchase/verify", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const sessionId = req.query.session_id as string;
      if (!sessionId) {
        return res.status(400).json({ error: "Missing session_id" });
      }
      
      // Retrieve the Stripe session
      const session = await stripeService.getCheckoutSession(sessionId);
      
      if (session.payment_status !== 'paid') {
        return res.status(400).json({ error: "Payment not completed" });
      }
      
      // Find the purchase record
      const purchases = await storage.getPolicyPurchasesByUserId(req.user.id);
      const purchase = purchases.find(p => p.stripeSessionId === sessionId);
      
      if (!purchase) {
        return res.status(404).json({ error: "Purchase record not found" });
      }
      
      if (purchase.status === 'completed') {
        return res.json({ success: true, message: "Purchase already verified" });
      }
      
      // Update purchase status
      await storage.updatePolicyPurchase(purchase.id, {
        status: 'completed',
        stripePaymentIntentId: session.payment_intent as string,
      });
      
      // If bundle, create individual purchase records for privacy and cookie
      if (purchase.type === 'bundle') {
        const privacyPurchase = purchases.find(p => p.type === 'privacy' && p.status === 'completed');
        const cookiePurchase = purchases.find(p => p.type === 'cookie' && p.status === 'completed');
        
        if (!privacyPurchase) {
          await storage.createPolicyPurchase({
            userId: req.user.id,
            type: 'privacy',
            stripePaymentIntentId: session.payment_intent as string,
            amount: 0,
            currency: 'eur',
            status: 'completed',
          });
        }
        
        if (!cookiePurchase) {
          await storage.createPolicyPurchase({
            userId: req.user.id,
            type: 'cookie',
            stripePaymentIntentId: session.payment_intent as string,
            amount: 0,
            currency: 'eur',
            status: 'completed',
          });
        }
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error verifying policy purchase:", error);
      res.status(500).json({ error: "Failed to verify purchase" });
    }
  });

  // Test endpoint to send all email types - DEVELOPMENT ONLY
  app.post("/api/test/send-all-emails", async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: "This endpoint is only available in development" });
    }
    
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email address required" });
    }
    
    const results: { type: string; success: boolean; error?: string }[] = [];
    const baseUrl = process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
      : 'http://localhost:5000';
    
    try {
      const { 
        sendPasswordResetEmail, 
        sendVerificationEmail, 
        sendEmailChangeVerification,
        sendAgencyClientInviteEmail,
        sendTrialExpiringEmail,
        sendTrialExpiredEmail 
      } = await import('./email');
      
      // Helper to delay between emails (Resend rate limit: 2/sec)
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      // 1. Password Reset Email
      try {
        await sendPasswordResetEmail(email, 'test-token-123', `${baseUrl}/reset-password?token=test-token-123`);
        results.push({ type: 'Password Reset', success: true });
      } catch (e: any) {
        results.push({ type: 'Password Reset', success: false, error: e.message });
      }
      
      await delay(600); // Wait 600ms between emails
      
      // 2. Email Verification
      try {
        await sendVerificationEmail(email, 'verify-token-123', `${baseUrl}/verify-email?token=verify-token-123`);
        results.push({ type: 'Email Verification', success: true });
      } catch (e: any) {
        results.push({ type: 'Email Verification', success: false, error: e.message });
      }
      
      await delay(600);
      
      // 3. Email Change Verification
      try {
        await sendEmailChangeVerification('old@example.com', email, `${baseUrl}/verify-email-change?token=change-token-123`);
        results.push({ type: 'Email Change Verification', success: true });
      } catch (e: any) {
        results.push({ type: 'Email Change Verification', success: false, error: e.message });
      }
      
      await delay(600);
      
      // 4. Agency Client Invite
      try {
        await sendAgencyClientInviteEmail(email, 'Saerens Advertising', `${baseUrl}/invite/test-invite-123`, 'Welcome! We would love to help you with GDPR compliance.');
        results.push({ type: 'Agency Client Invite', success: true });
      } catch (e: any) {
        results.push({ type: 'Agency Client Invite', success: false, error: e.message });
      }
      
      await delay(600);
      
      // 5. Trial Expiring (2 days)
      try {
        await sendTrialExpiringEmail(email, 'Axel', 2);
        results.push({ type: 'Trial Expiring (2 days)', success: true });
      } catch (e: any) {
        results.push({ type: 'Trial Expiring (2 days)', success: false, error: e.message });
      }
      
      await delay(600);
      
      // 6. Trial Expired
      try {
        await sendTrialExpiredEmail(email, 'Axel');
        results.push({ type: 'Trial Expired', success: true });
      } catch (e: any) {
        results.push({ type: 'Trial Expired', success: false, error: e.message });
      }
      
      const successCount = results.filter(r => r.success).length;
      res.json({ 
        message: `Sent ${successCount}/${results.length} emails to ${email}`,
        results 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Iris — public AI assistant chatbot endpoint
  registerIrisRoutes(app);

  return httpServer;
}

async function runDiagnosticScanWithBrowser(scanId: string, website: { id: string; domain: string; publicId: string }): Promise<void> {
  const puppeteer = await import('puppeteer-core');
  const chromiumPath = findChromiumExecutable();
  const browser = await puppeteer.default.launch({
    headless: true,
    executablePath: chromiumPath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-extensions', '--disable-background-networking'],
  });

  try {
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1920, height: 1080 });

  const issues: string[] = [];
  const recommendations: string[] = [];
  const rawData: Record<string, any> = {};

  let consentModeDetected = false;
  let consentModeVersion: string | null = null;
  let defaultConsentSet = false;
  let updateConsentCalled = false;
  let gtmDetected = false;
  let gtagDetected = false;
  let bannerScriptDetected = false;
  let bannerScriptVersion: string | null = null;

  const consoleMessages: string[] = [];
  const scriptRequests: string[] = [];

  const client = await page.createCDPSession();
  await client.send('Network.enable');
  await client.send('Runtime.enable');

  client.on('Network.requestWillBeSent', (params: any) => {
    if (params.type === 'Script') {
      scriptRequests.push(params.request.url);
    }
  });

  client.on('Runtime.consoleAPICalled', (params: any) => {
    const text = params.args?.map((a: any) => a.value || a.description || '').join(' ') || '';
    if (text) consoleMessages.push(text);
  });

  try {
    const url = website.domain.startsWith('http') ? website.domain : `https://${website.domain}`;
    await page.goto(url, { timeout: 30000, waitUntil: 'domcontentloaded' });

    await new Promise(r => setTimeout(r, 3000));

    bannerScriptDetected = scriptRequests.some(u =>
      u.includes('consentease') ||
      u.includes(`/api/consent/${website.publicId}/script.js`)
    );

    gtmDetected = scriptRequests.some(u =>
      u.includes('googletagmanager.com/gtm.js') ||
      u.includes('googletagmanager.com/gtag/js')
    );

    gtagDetected = scriptRequests.some(u =>
      u.includes('googletagmanager.com/gtag/js')
    );

    const pageAnalysis = await page.evaluate(() => {
      const result: Record<string, any> = {
        hasDataLayer: typeof (window as any).dataLayer !== 'undefined',
        hasGtag: typeof (window as any).gtag === 'function',
        dataLayerContents: [],
        consentDefaultFound: false,
        consentUpdateFound: false,
      };

      if (result.hasDataLayer) {
        const dataLayer = (window as any).dataLayer;
        result.dataLayerContents = dataLayer.slice(0, 20).map((item: any) => {
          if (typeof item === 'object') {
            return JSON.stringify(item).substring(0, 200);
          }
          return String(item);
        });

        for (const item of dataLayer) {
          if (Array.isArray(item) && item[0] === 'consent') {
            if (item[1] === 'default') result.consentDefaultFound = true;
            if (item[1] === 'update') result.consentUpdateFound = true;
          }
          if (typeof item === 'object' && item['0'] === 'consent') {
            if (item['1'] === 'default') result.consentDefaultFound = true;
            if (item['1'] === 'update') result.consentUpdateFound = true;
          }
        }
      }

      const bannerSelectors = [
        '[data-consentease]',
        '#consentease-banner',
        '.consent-banner',
        '#cookie-consent',
        '.cookie-banner',
      ];
      result.bannerElementFound = bannerSelectors.some(sel => document.querySelector(sel) !== null);

      return result;
    });

    rawData.pageAnalysis = pageAnalysis;
    rawData.scriptRequests = scriptRequests.slice(0, 50);
    rawData.consoleMessages = consoleMessages.slice(0, 20);

    consentModeDetected = pageAnalysis.hasGtag || pageAnalysis.hasDataLayer;
    defaultConsentSet = pageAnalysis.consentDefaultFound;
    updateConsentCalled = pageAnalysis.consentUpdateFound;

    if (pageAnalysis.hasDataLayer && pageAnalysis.consentDefaultFound) {
      consentModeVersion = 'v2';
    } else if (pageAnalysis.hasDataLayer) {
      consentModeVersion = 'v1';
    }

    if (!bannerScriptDetected) {
      issues.push('ConsentEase banner script not detected on the page');
      recommendations.push('Add the ConsentEase embed script to your website. Copy it from the Embed Code section in your dashboard.');
    }

    if (!gtmDetected && !gtagDetected) {
      issues.push('Google Tag Manager or gtag.js not detected');
      recommendations.push('If you use Google Analytics or other Google services, make sure GTM or gtag.js is installed.');
    }

    if (gtmDetected && !defaultConsentSet) {
      issues.push('Google Consent Mode default values not set before GTM loads');
      recommendations.push('Ensure the ConsentEase script loads BEFORE Google Tag Manager to properly initialize consent defaults.');
    }

    if (consentModeDetected && !defaultConsentSet) {
      issues.push('Consent Mode detected but default consent state not set');
      recommendations.push('The consent default should be set before any Google tags fire. Check your script loading order.');
    }

    if (defaultConsentSet && !updateConsentCalled && !pageAnalysis.bannerElementFound) {
      recommendations.push('Consent defaults are set, but no consent update was detected. Make sure users can interact with the banner.');
    }

    if (issues.length === 0 && bannerScriptDetected && defaultConsentSet) {
      recommendations.push('Your Consent Mode implementation looks good! Users will see proper consent signals sent to Google.');
    }

  } catch (navError: any) {
    issues.push(`Could not load website: ${navError.message}`);
    recommendations.push('Make sure your website is publicly accessible and the domain is correct.');
  }

  await client.detach().catch(() => {});

  await storage.updateDiagnosticScan(scanId, {
    status: 'completed',
    consentModeDetected,
    consentModeVersion,
    defaultConsentSet,
    updateConsentCalled,
    gtmDetected,
    gtagDetected,
    bannerScriptDetected,
    bannerScriptVersion,
    issues: JSON.stringify(issues),
    recommendations: JSON.stringify(recommendations),
    rawData: JSON.stringify(rawData),
  });
  } finally {
    await browser.close().catch(() => {});
  }
}

async function runDiagnosticScanWithHttp(scanId: string, website: { id: string; domain: string; publicId: string }): Promise<void> {
  const https = await import('https');
  const http = await import('http');

  const url = website.domain.startsWith('http') ? website.domain : `https://${website.domain}`;

  const fetchPage = (targetUrl: string, redirectCount = 0): Promise<string> => {
    if (redirectCount > 5) return Promise.reject(new Error('Too many redirects'));
    return new Promise((resolve, reject) => {
      const protocol = targetUrl.startsWith('https') ? https : http;
      const req = protocol.get(targetUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const resolvedUrl = new URL(res.headers.location, targetUrl).href;
          fetchPage(resolvedUrl, redirectCount + 1).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        let body = '';
        res.on('data', (chunk: any) => body += chunk);
        res.on('end', () => resolve(body));
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
    });
  };

  const issues: string[] = [];
  const recommendations: string[] = [];
  const rawData: Record<string, any> = { scanMode: 'http-fallback' };

  let consentModeDetected = false;
  let consentModeVersion: string | null = null;
  let defaultConsentSet = false;
  let updateConsentCalled = false;
  let gtmDetected = false;
  let gtagDetected = false;
  let bannerScriptDetected = false;
  let bannerScriptVersion: string | null = null;

  try {
    const html = await fetchPage(url);

    const scriptSrcRegex = /<script[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const scriptSrcs: string[] = [];
    let match;
    while ((match = scriptSrcRegex.exec(html)) !== null) {
      try {
        scriptSrcs.push(new URL(match[1], url).href);
      } catch {}
    }

    const inlineScriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    const inlineScripts: string[] = [];
    while ((match = inlineScriptRegex.exec(html)) !== null) {
      if (match[1] && match[1].trim().length > 0) {
        inlineScripts.push(match[1]);
      }
    }

    bannerScriptDetected = scriptSrcs.some(s =>
      s.includes('consentease') ||
      s.includes(`/api/consent/${website.publicId}/script.js`)
    );

    gtmDetected = scriptSrcs.some(s =>
      s.includes('googletagmanager.com/gtm.js') ||
      s.includes('googletagmanager.com/gtag/js')
    );

    gtagDetected = scriptSrcs.some(s =>
      s.includes('googletagmanager.com/gtag/js')
    );

    const allInlineCode = inlineScripts.join('\n');

    if (allInlineCode.includes('dataLayer') || allInlineCode.includes('gtag')) {
      consentModeDetected = true;
    }

    if (/consent['"]\s*,\s*['"]default['"]/.test(allInlineCode) ||
        /gtag\s*\(\s*['"]consent['"]\s*,\s*['"]default['"]/.test(allInlineCode)) {
      defaultConsentSet = true;
      consentModeVersion = 'v2';
    } else if (allInlineCode.includes('dataLayer')) {
      if (consentModeDetected) consentModeVersion = 'v1';
    }

    if (/consent['"]\s*,\s*['"]update['"]/.test(allInlineCode) ||
        /gtag\s*\(\s*['"]consent['"]\s*,\s*['"]update['"]/.test(allInlineCode)) {
      updateConsentCalled = true;
    }

    const bannerElementDetected =
      html.includes('data-consentease') ||
      html.includes('id="consentease-banner"') ||
      html.includes('class="consent-banner"') ||
      html.includes('id="cookie-consent"') ||
      html.includes('class="cookie-banner"');

    rawData.scriptSrcs = scriptSrcs.slice(0, 50);
    rawData.bannerElementDetected = bannerElementDetected;
    rawData.inlineScriptCount = inlineScripts.length;

    if (!bannerScriptDetected) {
      issues.push('ConsentEase banner script not detected on the page');
      recommendations.push('Add the ConsentEase embed script to your website. Copy it from the Embed Code section in your dashboard.');
    }

    if (!gtmDetected && !gtagDetected) {
      issues.push('Google Tag Manager or gtag.js not detected');
      recommendations.push('If you use Google Analytics or other Google services, make sure GTM or gtag.js is installed.');
    }

    if (gtmDetected && !defaultConsentSet) {
      issues.push('Google Consent Mode default values not set before GTM loads');
      recommendations.push('Ensure the ConsentEase script loads BEFORE Google Tag Manager to properly initialize consent defaults.');
    }

    if (consentModeDetected && !defaultConsentSet) {
      issues.push('Consent Mode detected but default consent state not set');
      recommendations.push('The consent default should be set before any Google tags fire. Check your script loading order.');
    }

    if (defaultConsentSet && !updateConsentCalled && !bannerElementDetected) {
      recommendations.push('Consent defaults are set, but no consent update was detected. Make sure users can interact with the banner.');
    }

    if (issues.length === 0 && bannerScriptDetected && defaultConsentSet) {
      recommendations.push('Your Consent Mode implementation looks good! Users will see proper consent signals sent to Google.');
    }

    recommendations.push('Note: This scan used HTTP-only mode (no browser available). Some JavaScript-rendered content may not be detected. For a more thorough scan, ensure Chromium is available on the server.');

  } catch (fetchError: any) {
    issues.push(`Could not load website: ${fetchError.message}`);
    recommendations.push('Make sure your website is publicly accessible and the domain is correct.');
  }

  await storage.updateDiagnosticScan(scanId, {
    status: 'completed',
    consentModeDetected,
    consentModeVersion,
    defaultConsentSet,
    updateConsentCalled,
    gtmDetected,
    gtagDetected,
    bannerScriptDetected,
    bannerScriptVersion,
    issues: JSON.stringify(issues),
    recommendations: JSON.stringify(recommendations),
    rawData: JSON.stringify(rawData),
  });
}

async function runDiagnosticScan(scanId: string, website: { id: string; domain: string; publicId: string }): Promise<void> {
  try {
    const chromiumPath = findChromiumExecutable();
    if (chromiumPath) {
      await runDiagnosticScanWithBrowser(scanId, website);
    } else {
      console.warn('Chromium not available for diagnostic scan, falling back to HTTP-only mode');
      await runDiagnosticScanWithHttp(scanId, website);
    }
  } catch (error: any) {
    console.error('Diagnostic scan failed:', error);
    if (error.message?.includes('browser') || error.message?.includes('launch') || error.message?.includes('Chrome') || error.message?.includes('Chromium') || error.message?.includes('puppeteer')) {
      console.warn('Browser launch failed, retrying with HTTP-only fallback');
      try {
        await runDiagnosticScanWithHttp(scanId, website);
        return;
      } catch (fallbackError: any) {
        console.error('HTTP fallback also failed:', fallbackError);
      }
    }
    await storage.updateDiagnosticScan(scanId, {
      status: 'failed',
      issues: JSON.stringify([`Scan failed: ${error.message}`]),
      recommendations: JSON.stringify(['Please try again. If the problem persists, contact support.']),
    });
  }
}
