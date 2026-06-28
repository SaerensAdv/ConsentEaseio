import { Request, Response, NextFunction } from 'express';
import { rateLimited, sendApiError } from './api/errors';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
  name: string;
  keyGenerator?: (req: Request) => string;
}

function getClientIp(req: Request): string {
  // Use Express's proxy-aware req.ip (app.set('trust proxy', 1) is set in
  // server/index.ts), NOT the raw X-Forwarded-For header. The leftmost XFF value is
  // attacker-controlled — the upstream proxy appends the real client IP rather than
  // replacing the header — so parsing XFF[0] would let a caller rotate spoofed IPs to
  // bypass every limiter keyed on this helper, including the pre-auth /api/v1 guard
  // that protects API-key lookups from random-key floods (threat_model.md, DoS).
  return req.ip || req.socket.remoteAddress || 'unknown';
}

const allStores: Map<string, RateLimitEntry>[] = [];

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, maxRequests, message = 'Too many requests, please try again later.', name, keyGenerator } = options;
  const store = new Map<string, RateLimitEntry>();
  allStores.push(store);

  const keyFn = keyGenerator || ((req: Request) => getClientIp(req));

  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${name}:${keyFn(req)}`;
    const now = Date.now();
    
    const entry = store.get(key);
    
    if (!entry || now > entry.resetTime) {
      store.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({ error: message });
    }
    
    entry.count++;
    next();
  };
}

export const authRateLimiter = createRateLimiter({
  name: 'auth',
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 50, // 50 attempts per 15 minutes (increased for testing)
  message: 'Too many authentication attempts. Please wait 15 minutes before trying again.'
});

export const passwordResetRateLimiter = createRateLimiter({
  name: 'passwordReset',
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5, // 5 requests per hour
  message: 'Too many password reset requests. Please wait before trying again.'
});

export const apiRateLimiter = createRateLimiter({
  name: 'api',
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  message: 'Too many requests. Please slow down.'
});

// /api/v1 rate limiting. Two-stage by design (see threat_model.md, Denial of Service):
// a cheap IP guard runs BEFORE apiKeyAuth to bound the unauthenticated attack surface
// (well-formed-random-key floods hitting storage.getApiKeyByKeyId), and a per-key tier
// limiter runs AFTER auth for true per-key fairness. Both emit the v1 { error, code,
// hint } contract + Retry-After. NOTE: in-memory only — not horizontally consistent;
// acceptable for first launch, revisit with a shared store at scale.
const API_V1_RATE_WINDOW_MS = 60 * 1000;
const API_V1_RATE_TIERS: Record<string, number> = {
  standard: 120, // requests per minute, per key
  high: 600,
};
const API_V1_DEFAULT_TIER = 'standard';
// Pre-auth per-IP ceiling. Deliberately ABOVE the highest per-key tier so a single
// legitimate high-tier client (behind one IP) is never throttled at this stage — it
// exists only to cap abusive unauthenticated floods of key lookups.
const API_V1_IP_MAX_PER_MIN = 1000;

interface V1RateLimiterOptions {
  windowMs: number;
  keyFn: (req: Request) => string;
  limitFn: (req: Request) => number;
}

function createV1RateLimiter(opts: V1RateLimiterOptions) {
  const store = new Map<string, RateLimitEntry>();
  allStores.push(store);

  return (req: Request, res: Response, next: NextFunction) => {
    const key = opts.keyFn(req);
    const maxRequests = opts.limitFn(req);
    const now = Date.now();

    const entry = store.get(key);
    if (!entry || now > entry.resetTime) {
      store.set(key, { count: 1, resetTime: now + opts.windowMs });
      return next();
    }

    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      return sendApiError(
        res,
        rateLimited('Rate limit exceeded', `Retry after ${retryAfter}s, or request a higher rate tier.`),
      );
    }

    entry.count++;
    next();
  };
}

// Stage 1 — mount BEFORE apiKeyAuth. Keys strictly on client IP.
export const apiV1IpLimiter = createV1RateLimiter({
  windowMs: API_V1_RATE_WINDOW_MS,
  keyFn: (req) => `apiV1:ip:${getClientIp(req)}`,
  limitFn: () => API_V1_IP_MAX_PER_MIN,
});

// Stage 2 — mount AFTER apiKeyAuth. Keys on the acting API key (IP fallback only if
// somehow unauthenticated) and selects the request budget from the key's rateTier.
export const apiV1RateLimiter = createV1RateLimiter({
  windowMs: API_V1_RATE_WINDOW_MS,
  keyFn: (req) => {
    const ctx = req.authContext;
    return ctx?.apiKeyId ? `apiV1:key:${ctx.apiKeyId}` : `apiV1:ip:${getClientIp(req)}`;
  },
  limitFn: (req) => {
    const ctx = req.authContext;
    const tier = ctx?.rateTier && API_V1_RATE_TIERS[ctx.rateTier] ? ctx.rateTier : API_V1_DEFAULT_TIER;
    return API_V1_RATE_TIERS[tier];
  },
});

export const contactRateLimiter = createRateLimiter({
  name: 'contact',
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5, // 5 contact form submissions per hour
  message: 'Too many contact form submissions. Please wait before trying again.'
});

// Public analytics ingestion: per-IP guard against bots flooding from one origin.
// 60/min/IP is generous for normal browsing (banner_shown + banner_action + ~5 prefs)
// but stops scripted floods well before they hit the DB.
export const analyticsEventIpLimiter = createRateLimiter({
  name: 'analyticsEventIp',
  windowMs: 60 * 1000,
  maxRequests: 60,
  message: 'Too many analytics events from this client. Please slow down.'
});

// Extract websiteId from either an already-parsed JSON body (req.body is an
// object) OR a raw text body (req.body is a string when the route uses
// express.text — sendBeacon delivers POSTs as text/plain). Without this the
// per-publicId limiter would fall back to 'no-id' for every beacon request and
// effectively become a single global bucket, defeating per-tenant isolation.
function extractWebsiteIdKey(req: Request): string {
  let body: any = req.body;
  if (typeof body === 'string') {
    if (body.length === 0 || body.length > 8192) return 'no-id';
    try {
      body = JSON.parse(body);
    } catch {
      return 'no-id';
    }
  }
  const id = body?.websiteId;
  return typeof id === 'string' && id.length > 0 && id.length < 200 ? id : 'no-id';
}

// Public analytics ingestion: per-publicId guard against a single site being
// abused as an amplification vector (or a runaway script on the customer site).
// 1000/min/site = ~16 events/sec sustained, enough for high-traffic customers.
export const analyticsEventPublicIdLimiter = createRateLimiter({
  name: 'analyticsEventPublicId',
  windowMs: 60 * 1000,
  maxRequests: 1000,
  message: 'Too many analytics events for this site. Please slow down.',
  keyGenerator: extractWebsiteIdKey,
});

// Web vitals are reported at most once per page load, so the per-IP budget can
// be tighter than the event endpoint. Per-site we keep the same 1000/min ceiling.
export const analyticsVitalsIpLimiter = createRateLimiter({
  name: 'analyticsVitalsIp',
  windowMs: 60 * 1000,
  maxRequests: 30,
  message: 'Too many vitals reports from this client. Please slow down.'
});

export const analyticsVitalsPublicIdLimiter = createRateLimiter({
  name: 'analyticsVitalsPublicId',
  windowMs: 60 * 1000,
  maxRequests: 1000,
  message: 'Too many vitals reports for this site. Please slow down.',
  keyGenerator: extractWebsiteIdKey,
});

setInterval(() => {
  const now = Date.now();
  for (let i = 0; i < allStores.length; i++) {
    const store = allStores[i];
    const entries = Array.from(store.entries());
    for (let j = 0; j < entries.length; j++) {
      const [key, entry] = entries[j];
      if (now > entry.resetTime) {
        store.delete(key);
      }
    }
  }
}, 60 * 1000);
