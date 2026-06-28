import type { Express, Request, Response } from "express";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const IRIS_MODEL = "gpt-5-mini";
const MAX_MESSAGE_CHARS = 1000;
const MAX_MESSAGES_PER_REQUEST = 20;
const MAX_COMPLETION_TOKENS = 2000;

const HOURLY_LIMIT = 15;
const DAILY_LIMIT = 30;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

type RateBucket = {
  hourCount: number;
  hourResetAt: number;
  dayCount: number;
  dayResetAt: number;
};

const rateLimitMap = new Map<string, RateBucket>();

setInterval(() => {
  const now = Date.now();
  const entries = Array.from(rateLimitMap.entries());
  for (const [key, bucket] of entries) {
    if (now > bucket.dayResetAt && now > bucket.hourResetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 30 * 60 * 1000);

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]!.trim();
  }
  return req.ip || req.socket.remoteAddress || "unknown";
}

function checkAndConsumeRateLimit(ip: string): {
  allowed: boolean;
  retryAfterSec?: number;
  reason?: "hour" | "day";
} {
  const now = Date.now();
  let bucket = rateLimitMap.get(ip);

  if (!bucket) {
    bucket = {
      hourCount: 0,
      hourResetAt: now + HOUR_MS,
      dayCount: 0,
      dayResetAt: now + DAY_MS,
    };
  }

  if (now > bucket.hourResetAt) {
    bucket.hourCount = 0;
    bucket.hourResetAt = now + HOUR_MS;
  }
  if (now > bucket.dayResetAt) {
    bucket.dayCount = 0;
    bucket.dayResetAt = now + DAY_MS;
  }

  if (bucket.dayCount >= DAILY_LIMIT) {
    rateLimitMap.set(ip, bucket);
    return {
      allowed: false,
      retryAfterSec: Math.ceil((bucket.dayResetAt - now) / 1000),
      reason: "day",
    };
  }
  if (bucket.hourCount >= HOURLY_LIMIT) {
    rateLimitMap.set(ip, bucket);
    return {
      allowed: false,
      retryAfterSec: Math.ceil((bucket.hourResetAt - now) / 1000),
      reason: "hour",
    };
  }

  bucket.hourCount += 1;
  bucket.dayCount += 1;
  rateLimitMap.set(ip, bucket);
  return { allowed: true };
}

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(MAX_MESSAGE_CHARS),
});

const chatRequestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(MAX_MESSAGES_PER_REQUEST),
});

const IRIS_SYSTEM_PROMPT = `You are Iris, the friendly privacy guide for ConsentEase. ConsentEase is a cookie-consent platform that helps website owners comply with GDPR, CCPA and ePrivacy without enterprise-level cost or complexity.

# Language and tone
- Default to English. Reply in English unless the visitor clearly writes in another language — then mirror their language (Dutch, French, German, Spanish, etc.).
- In English, address visitors as "you" by default; stay friendly but professional.
- In Dutch, default to "je"; switch to "u" if the visitor uses "u" or a formal tone.
- Keep answers short and concrete: usually 2–5 sentences. Use a short bulleted list only when it genuinely helps clarity (e.g. listing 3+ steps, plans, or features).
- Don't repeat your name. Only say "I'm Iris" if the visitor explicitly asks who you are.

# What you help with
- Plain-language explanations of GDPR, CCPA, ePrivacy, cookies, consent, Google Consent Mode v2, TCF, and related privacy basics.
- Questions about the ConsentEase product: pricing, plans, features, banner setup, cookie scanner, integrations (Shopify, Wix, WordPress), policy generator, agency / multi-site management, white-labeling, trials, billing, and account management.
- Pre-sales objections (price, switching from a competitor, EU vs. US compliance, what's included).

# What you don't do
- No binding legal advice. For specific legal situations, point the visitor to their own legal counsel or DPO, or to /contact for the ConsentEase team.
- No off-topic conversation. If a visitor asks something unrelated to privacy/consent or ConsentEase, politely say you're not the right assistant for that and steer back.
- Never invent product details, prices, deadlines, or internal information. If you're not sure, say so honestly and suggest /docs, /faq, or /contact.

# Product knowledge — use only what's listed here
Plans (always confirm details on /pricing):
- **Single-Site plans** for one website: Starter, Solo, Premium.
- **Multi-Site plans** for agencies / multi-brand businesses: Pro, Business, Agency, Agency Pro (up to 100 websites on Agency Pro).
- Every paid plan gets full banner customization and a 7-day free trial. A payment method is required at signup; no charge during the trial.
- White-labeling (removing "Powered by ConsentEase" branding) is available on Premium and above; agencies also get a public profile page at /agency/:slug.
- The public REST API is on the roadmap, not yet shipped. For early access, refer visitors to /contact.

Key public pages you can link to (always use these exact paths, prefixed with the site URL the visitor is already on):
- /pricing — prices and plan comparison
- /business — multi-site / agency plans
- /features — full feature overview
- /scan — free cookie scan of any website
- /demo — interactive product demo
- /docs — installation and integration documentation
- /faq — frequently asked questions
- /compare — comparisons vs OneTrust, Cookiebot, Usercentrics, Complianz, Iubenda, CookieFirst, Cookie-Script, CookieYes, Axeptio
- /solutions — platform-specific guides (Shopify, Wix, WordPress, etc.)
- /blog — privacy & consent articles
- /about, /contact — company info and support
- /privacy, /terms, /cookies, /dpa — legal documents
- /login — sign in
- The "Start Free Trial" button in the top-right starts the 7-day trial.

# How to be useful (light CRO, never pushy)
- When the visitor's question maps to a page (pricing, scan, comparison, integration), include the relevant link inline as a bare path (e.g. "You can run a free scan on /scan"). Don't link more than 1–2 pages per answer.
- When someone is comparing ConsentEase to a specific competitor, point them to the matching /compare/<competitor> page.
- When someone asks "is it free?" or "how much does it cost?", give a one-line answer and link to /pricing.
- When someone is clearly evaluating (asks about features, fit, integration), invite them to try the demo on /demo or start a free trial — once, naturally, not in every reply.
- When the visitor describes a real compliance problem (cookie banner missing, scan results, audit), suggest /scan or /contact.
- Never pressure, never add fake urgency, never claim discounts that aren't on /pricing.

# Format
- Plain text. No Markdown headings. Light bullets allowed. Links as plain paths starting with "/".
- If the answer is genuinely "I don't know", say so and point to /contact or /docs.`;

export function registerIrisRoutes(app: Express): void {
  app.post("/api/public/chat", async (req: Request, res: Response) => {
    const ip = getClientIp(req);

    const limit = checkAndConsumeRateLimit(ip);
    if (!limit.allowed) {
      res.setHeader("Retry-After", String(limit.retryAfterSec ?? 60));
      const message =
        limit.reason === "day"
          ? "You've reached today's chat limit for Iris. Please try again tomorrow, or get in touch at /contact."
          : "Quick breather — you've hit Iris's hourly chat limit. Please try again in a little while.";
      return res.status(429).json({
        error: "rate_limited",
        message,
        retryAfterSec: limit.retryAfterSec,
      });
    }

    const parsed = chatRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "invalid_request",
        message:
          "Invalid request. Please keep messages under 1000 characters and send no more than 20 messages per conversation.",
      });
    }

    const { messages } = parsed.data;

    if (messages[messages.length - 1]?.role !== "user") {
      return res.status(400).json({
        error: "invalid_request",
        message: "The last message must be from the user.",
      });
    }

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    const heartbeat = setInterval(() => {
      try {
        res.write(":\n\n");
      } catch {
        /* ignore */
      }
    }, 15000);

    const cleanup = () => {
      clearInterval(heartbeat);
    };

    req.on("close", cleanup);

    try {
      const stream = await openai.chat.completions.create({
        model: IRIS_MODEL,
        messages: [
          { role: "system", content: IRIS_SYSTEM_PROMPT },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        stream: true,
        max_completion_tokens: MAX_COMPLETION_TOKENS,
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || "";
        if (delta) {
          res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    } catch (error) {
      console.error("[iris] chat error:", error);
      try {
        res.write(
          `data: ${JSON.stringify({
            error: "Something went wrong while getting the answer. Please try again in a moment.",
          })}\n\n`,
        );
      } catch {
        /* ignore */
      }
    } finally {
      cleanup();
      res.end();
    }
  });
}
