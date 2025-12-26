import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
  name: string;
}

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

const allStores: Map<string, RateLimitEntry>[] = [];

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, maxRequests, message = 'Too many requests, please try again later.', name } = options;
  const store = new Map<string, RateLimitEntry>();
  allStores.push(store);

  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${name}:${getClientIp(req)}`;
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
  maxRequests: 10, // 10 attempts per 15 minutes
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

export const contactRateLimiter = createRateLimiter({
  name: 'contact',
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5, // 5 contact form submissions per hour
  message: 'Too many contact form submissions. Please wait before trying again.'
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
