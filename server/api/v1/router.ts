import { Router } from "express";
import { z } from "zod";
import {
  storage,
  PLAN_LIMITS,
  isUnlimited,
  type PlanType,
} from "../../storage";
import { apiKeyAuth, requireScope } from "../../middleware/apiKeyAuth";
import { apiV1IpLimiter, apiV1RateLimiter } from "../../rateLimiter";
import { generatePublicId, runCookieScan } from "../../routes";
import { insertWebsiteSchema, insertCookieSchema, type Website } from "@shared/schema";
import {
  asyncHandler,
  badRequest,
  notFound,
  forbidden,
  conflict,
  rateLimited,
  sendApiError,
  requireAuthContext,
  authorizeWebsiteAccess,
  parsePagination,
  buildPage,
  decodeCursor,
  meterApiUsage,
  parseIdempotencyKey,
  type Page,
} from "..";

// Scopes enforced on the /api/v1 surface. A key carrying "*" satisfies all of them
// (see requireScope). The dashboard key-management UI (Connect Phase-1) mints keys
// with subsets of these strings.
export const V1_SCOPES = {
  sitesRead: "sites:read",
  sitesWrite: "sites:write",
  sitesScan: "sites:scan",
  consentWrite: "consent:write",
} as const;

// Parse a body/params with a Zod schema, mapping validation failures to the public
// 400 contract (asyncHandler would otherwise turn a raw ZodError into an opaque 500).
function parseOrBadRequest<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw badRequest(result.error.errors[0]?.message ?? "Invalid request body");
  }
  return result.data;
}

// In-memory cursor pagination over a fully-fetched list, ordered by
// (createdAt desc, id asc) to match the cursor contract in ../pagination. Lists are
// owner-scoped and bounded in practice (sites per account, cookies per site), so we
// page in memory rather than push offset/limit into every storage query.
function paginateByCreatedAt<T extends { id: string; createdAt: Date | null }>(
  all: T[],
  params: { limit: number; cursor: string | null },
): Page<T> {
  const sorted = [...all].sort((a, b) => {
    const at = a.createdAt ? a.createdAt.getTime() : 0;
    const bt = b.createdAt ? b.createdAt.getTime() : 0;
    if (at !== bt) return bt - at; // createdAt desc
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; // id asc (stable tiebreaker)
  });

  let startIdx = 0;
  if (params.cursor) {
    const c = decodeCursor(params.cursor);
    const cTime = new Date(c.createdAt).getTime();
    startIdx = sorted.findIndex((row) => {
      const t = row.createdAt ? row.createdAt.getTime() : 0;
      if (t !== cTime) return t < cTime; // strictly later in desc order
      return row.id > c.id;
    });
    if (startIdx === -1) startIdx = sorted.length; // cursor was the last row
  }

  const slice = sorted.slice(startIdx, startIdx + params.limit + 1);
  return buildPage(slice, params.limit, (row) => ({
    createdAt: (row.createdAt ?? new Date(0)).toISOString(),
    id: row.id,
  }));
}

// All websites the principal may access: the ones they own plus, for agency owners,
// their clients' sites. This mirrors canUserAccessWebsite exactly, so GET /sites
// returns precisely the set that authorizeWebsiteAccess would individually allow.
async function listAccessibleWebsites(userId: string): Promise<Website[]> {
  const owned = await storage.getWebsitesByUserId(userId);
  const agency = await storage.getAgencyByOwnerId(userId);
  if (!agency) return owned;

  const byId = new Map<string, Website>(owned.map((w) => [w.id, w]));
  const clients = await storage.getAgencyClients(agency.id);
  for (const client of clients) {
    const clientSites = await storage.getWebsitesByUserId(client.userId);
    for (const site of clientSites) byId.set(site.id, site);
  }
  return Array.from(byId.values());
}

function buildEmbedSnippet(scriptUrl: string): string {
  return `<!-- ConsentEase: Set default consent BEFORE Google Tag Manager -->
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied',
  'functionality_storage': 'denied',
  'personalization_storage': 'denied',
  'security_storage': 'granted',
  'wait_for_update': 500
});
gtag('set', 'ads_data_redaction', true);
gtag('set', 'url_passthrough', true);
</script>
<!-- ConsentEase: Load consent banner -->
<script src="${scriptUrl}" async></script>`;
}

const consentChoiceShape = z.union([
  z.string().max(8192),
  z.record(z.string().max(64), z.union([z.boolean(), z.string().max(64), z.number()])),
]);

const v1ConsentSchema = z.object({
  siteId: z.string().min(1).max(128),
  visitorId: z.string().min(1).max(128),
  action: z.enum(["accept_all", "reject_all", "custom"]),
  consentChoices: consentChoiceShape,
  bannerVersion: z.string().max(32).optional(),
  policyVersion: z.string().max(64).nullable().optional(),
  userAgent: z.string().max(512).optional(),
  country: z.string().max(8).optional(),
  region: z.string().max(64).optional(),
});

export const apiV1Router = Router();

// Two-stage rate limiting bracketing authentication: an IP-keyed pre-auth limiter
// (so unauthenticated floods can't reach key verification), then per-key limiting
// once the principal is known. apiKeyAuth attaches req.authContext between them.
apiV1Router.use(apiV1IpLimiter);
apiV1Router.use(apiKeyAuth);
apiV1Router.use(apiV1RateLimiter);

// Validate the :id path param once for every resource route before it reaches
// storage (threat_model.md, Tampering: all params Zod-validated). A malformed id
// becomes a clean 400 rather than silently falling through to a 404 lookup.
const idParamSchema = z.string().trim().min(1).max(128);
apiV1Router.param("id", (req, res, next, value) => {
  if (!idParamSchema.safeParse(value).success) {
    return sendApiError(res, badRequest("Invalid resource id"));
  }
  next();
});

// GET /sites — list accessible websites (owner + agency clients), paginated.
apiV1Router.get(
  "/sites",
  requireScope(V1_SCOPES.sitesRead),
  asyncHandler(async (req, res) => {
    const ctx = requireAuthContext(req);
    const params = parsePagination(req.query as unknown as Record<string, unknown>);
    const all = await listAccessibleWebsites(ctx.userId);
    res.json(paginateByCreatedAt(all, params));
  }),
);

// POST /sites — create a website (banner config + default categories + background
// scan), enforcing the owner's plan website limit server-side. Not idempotent in
// Phase 1: a retried create may produce a duplicate site. Only the billable /consent
// write participates in idempotency (full create-replay caching is future work).
apiV1Router.post(
  "/sites",
  requireScope(V1_SCOPES.sitesWrite),
  asyncHandler(async (req, res) => {
    const ctx = requireAuthContext(req);

    const user = await storage.getUser(ctx.userId);
    if (!user) throw notFound("User not found");

    const plan = (user.plan || "solo") as PlanType;
    const limits = PLAN_LIMITS[plan];
    const currentCount = await storage.countWebsitesByUserId(ctx.userId);
    if (!isUnlimited(limits.websites) && currentCount >= limits.websites) {
      throw forbidden(
        `Your ${plan} plan allows ${limits.websites} website${limits.websites === 1 ? "" : "s"}.`,
        "Upgrade your plan to add more sites.",
      );
    }

    // Only `domain` is taken from the client; userId/publicId/status are set
    // server-side so a caller can never assign a site to another owner.
    const validated = parseOrBadRequest(insertWebsiteSchema, {
      domain: (req.body ?? {}).domain,
      userId: ctx.userId,
      publicId: generatePublicId(),
      status: "scanning",
    });

    const website = await storage.createWebsite(validated);
    await storage.createBannerConfig({ websiteId: website.id });
    await storage.createDefaultCategoriesForWebsite(website.id);
    runCookieScan(website.id, website.domain).catch((err) =>
      console.error("[api/v1] background scan error:", err),
    );

    await meterApiUsage({ ctx, action: "site.create", websiteId: website.id, billableUnits: 0 });
    res.status(201).json(website);
  }),
);

// GET /sites/:id — fetch one website (404s on no-access to avoid IDOR enumeration).
apiV1Router.get(
  "/sites/:id",
  requireScope(V1_SCOPES.sitesRead),
  asyncHandler(async (req, res) => {
    const ctx = requireAuthContext(req);
    const website = await storage.getWebsiteById(req.params.id);
    await authorizeWebsiteAccess(ctx, website);
    res.json(website);
  }),
);

// POST /sites/:id/scan — trigger a background cookie rescan, bounded by the owner's
// daily scan limit (a resource-intensive op, gated by its own scope + plan cap).
apiV1Router.post(
  "/sites/:id/scan",
  requireScope(V1_SCOPES.sitesScan),
  asyncHandler(async (req, res) => {
    const ctx = requireAuthContext(req);
    const website = await storage.getWebsiteById(req.params.id);
    await authorizeWebsiteAccess(ctx, website, "write");
    const site = website!;

    const user = await storage.getUser(ctx.userId);
    if (!user) throw notFound("User not found");
    const plan = (user.plan || "solo") as PlanType;
    const limits = PLAN_LIMITS[plan];
    const dailyScans = await storage.getDailyCookieScanCount(ctx.userId);
    if (!isUnlimited(limits.dailyCookieScans) && dailyScans >= limits.dailyCookieScans) {
      throw rateLimited(
        `Daily scan limit reached for your ${plan} plan (${limits.dailyCookieScans}/day).`,
        "Upgrade your plan or try again tomorrow.",
      );
    }

    await storage.updateWebsite(site.id, { status: "scanning" });
    runCookieScan(site.id, site.domain).catch((err) => console.error("[api/v1] rescan error:", err));

    await meterApiUsage({ ctx, action: "site.scan", websiteId: site.id, billableUnits: 0 });
    res.status(202).json({ status: "scanning" });
  }),
);

// GET /sites/:id/embed — the copy-paste embed snippet + script URL for this site.
apiV1Router.get(
  "/sites/:id/embed",
  requireScope(V1_SCOPES.sitesRead),
  asyncHandler(async (req, res) => {
    const ctx = requireAuthContext(req);
    const website = await storage.getWebsiteById(req.params.id);
    await authorizeWebsiteAccess(ctx, website);
    const site = website!;

    const base = `${req.protocol}://${req.get("host")}`;
    const scriptUrl = `${base}/api/consent/${site.publicId}/script.js`;
    res.json({ publicId: site.publicId, scriptUrl, snippet: buildEmbedSnippet(scriptUrl) });
  }),
);

// GET /sites/:id/cookies — paginated cookie inventory for a site.
apiV1Router.get(
  "/sites/:id/cookies",
  requireScope(V1_SCOPES.sitesRead),
  asyncHandler(async (req, res) => {
    const ctx = requireAuthContext(req);
    const params = parsePagination(req.query as unknown as Record<string, unknown>);
    const website = await storage.getWebsiteById(req.params.id);
    await authorizeWebsiteAccess(ctx, website);
    const all = await storage.getCookiesByWebsiteId(req.params.id);
    res.json(paginateByCreatedAt(all, params));
  }),
);

// POST /sites/:id/cookies — add a cookie to a site's inventory. The category must
// belong to the same site (prevents attaching to another owner's category).
apiV1Router.post(
  "/sites/:id/cookies",
  requireScope(V1_SCOPES.sitesWrite),
  asyncHandler(async (req, res) => {
    const ctx = requireAuthContext(req);
    const website = await storage.getWebsiteById(req.params.id);
    await authorizeWebsiteAccess(ctx, website, "write");
    const site = website!;

    const body = (req.body ?? {}) as Record<string, unknown>;
    if (typeof body.categoryId !== "string") throw badRequest("`categoryId` is required");
    const category = await storage.getCookieCategoryById(body.categoryId);
    if (!category || category.websiteId !== site.id) {
      throw badRequest("Invalid category", "Use a categoryId that belongs to this site.");
    }

    const validated = parseOrBadRequest(insertCookieSchema, { ...body, websiteId: site.id });
    const cookie = await storage.createCookie(validated);

    await meterApiUsage({ ctx, action: "cookie.create", websiteId: site.id, billableUnits: 0 });
    res.status(201).json(cookie);
  }),
);

// POST /consent — record a consent decision. This is the billable action (1
// view-equivalent unit). Idempotency is resolved BEFORE the state write: a replay of
// the same key returns the original result without writing a second consent record,
// and (unlike a meter-first approach) a non-replayed request can never lose its
// consent record. Full request-body-hash idempotency is a deliberate future
// enhancement (see threat_model.md, Repudiation).
apiV1Router.post(
  "/consent",
  requireScope(V1_SCOPES.consentWrite),
  asyncHandler(async (req, res) => {
    const ctx = requireAuthContext(req);
    const idempotencyKey = parseIdempotencyKey(req);
    const body = parseOrBadRequest(v1ConsentSchema, req.body ?? {});

    const website = await storage.getWebsiteById(body.siteId);
    await authorizeWebsiteAccess(ctx, website, "write");
    const site = website!;

    if (idempotencyKey) {
      const prior = await storage.getApiUsageEventByIdempotency(ctx.apiKeyId!, idempotencyKey);
      if (prior) {
        if (prior.action !== "consent.record") {
          throw conflict(
            "Idempotency-Key already used for a different request",
            "Use a unique Idempotency-Key for each distinct operation.",
          );
        }
        res.status(200).json({ success: true, deduped: true });
        return;
      }
    }

    const choices =
      typeof body.consentChoices === "string" ? body.consentChoices : JSON.stringify(body.consentChoices);
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    await storage.createConsentLog({
      websiteId: site.id,
      visitorId: body.visitorId,
      action: body.action,
      ipHash: null,
      userAgent: body.userAgent ?? null,
      country: body.country ?? null,
      region: body.region ?? null,
      consentChoices: choices,
      bannerVersion: body.bannerVersion ?? null,
      policyVersion: body.policyVersion ?? null,
      expiresAt,
    });

    const result = await meterApiUsage({
      ctx,
      action: "consent.record",
      websiteId: site.id,
      billableUnits: 1,
      idempotencyKey,
    });
    res.status(201).json({ success: true, deduped: result.deduped, limited: result.limited });
  }),
);

// GET /sites/:id/compliance — honest, derived compliance snapshot from real scan /
// cookie / banner state. No synthetic score is invented.
apiV1Router.get(
  "/sites/:id/compliance",
  requireScope(V1_SCOPES.sitesRead),
  asyncHandler(async (req, res) => {
    const ctx = requireAuthContext(req);
    const website = await storage.getWebsiteById(req.params.id);
    await authorizeWebsiteAccess(ctx, website);
    const site = website!;

    const [cookieList, categories, banner] = await Promise.all([
      storage.getCookiesByWebsiteId(site.id),
      storage.getCookieCategoriesByWebsiteId(site.id),
      storage.getBannerConfigByWebsiteId(site.id),
    ]);

    res.json({
      websiteId: site.id,
      domain: site.domain,
      status: site.status,
      lastScan: site.lastScan,
      bannerConfigured: !!banner,
      scan: {
        cookiesFound: site.cookiesFound ?? 0,
        scriptsFound: site.scriptsFound ?? 0,
      },
      cookies: { total: cookieList.length },
      categories: {
        total: categories.length,
        enabled: categories.filter((c) => c.isEnabled).length,
      },
    });
  }),
);
