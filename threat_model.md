# Threat Model

## Project Overview

ConsentEase is a GDPR/CCPA consent-banner (CMP) platform: React/TypeScript frontend, Express/TypeScript backend, PostgreSQL via Drizzle ORM, Passport.js (session) auth, Stripe billing, ClickUp CRM sync, and an OpenAI-powered support assistant ("Iris"). It serves an embeddable consent banner to customer websites and ingests consent/analytics events from those sites.

This document covers the existing platform **and** the Phase-1 "Connect" additions (`docs/plans/connect-phase1-build-sequence.md`): a versioned public REST API (`/api/v1`) authenticated by API keys, and an MCP server that is a thin client over that API. The new surface is the primary focus of this revision. The REST API and the MCP server (`mcp-server/`) are now implemented and this document reflects the as-built design (build ticket T016 complete).

## Assets

- **User accounts & sessions** — emails, bcrypt password hashes, `express-session` cookies. Compromise enables impersonation and access to all of a user's websites, analytics, and billing.
- **API keys (NEW)** — long random secrets (`ce_live_<keyId>_<secret>`) granting programmatic access equal to the owner's dashboard access. A leaked key allows reading/writing the owner's sites, generating billable usage, and driving the MCP tools. Stored as `keyId` (lookup) + HMAC `secretHash`, never plaintext.
- **Consent records** — per–end-user consent decisions (categories, timestamp, hashed IP). These are the platform's legal evidence product; integrity and non-repudiation matter more than confidentiality. Tampering or loss undermines the core compliance value.
- **End-user PII** — hashed IPs and user-agent data in consent/analytics logs. Limited but regulated.
- **Business data** — websites, cookie inventories, analytics aggregates, subscription/plan state, monthly view counters.
- **Application secrets** — `DATABASE_URL`, `SESSION_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLICKUP_API_KEY`, OpenAI credentials, and the new `API_KEY_PEPPER` (HMAC pepper for API-key hashing).

## Trust Boundaries

- **Browser ↔ API** — all client requests are untrusted; the API must authenticate and authorize every request server-side.
- **Banner script ↔ public ingest** — `POST /api/analytics/event` and `POST /api/consent/log` are **unauthenticated**, identified only by a website `publicId`. The `publicId` is not a secret (it ships in the embed snippet), so these endpoints are an abuse/DoS and data-pollution surface.
- **API key client ↔ `/api/v1` (NEW)** — programmatic callers authenticate with an API key; the boundary must verify the key, resolve the owner, and authorize each resource.
- **MCP server ↔ `/api/v1` (NEW)** — the MCP server holds a user's `CONSENTEASE_API_KEY` and acts on their behalf; it is just another API-key client, with no extra privilege.
- **API ↔ PostgreSQL** — direct DB access; injection here is catastrophic. All access goes through Drizzle/parameterized queries.
- **API ↔ external services** — Stripe (webhook signature verification required), ClickUp, OpenAI. Outbound key leakage allows third-party abuse.
- **Public ↔ authenticated ↔ agency/admin** — public marketing/ingest, authenticated dashboard, and agency-managed client websites; agency owners can access client sites within their account.

## Scan Anchors

- **Production entry points:** `server/index.ts` (middleware order, helmet/CSP, Stripe raw-body), `server/routes.ts` (route registration), and the planned `server/api/v1/` router.
- **Highest-risk code areas:** the new `server/middleware/apiKeyAuth.ts` (auth), the new `authorizeWebsiteAccess()` authz helper, `server/storage.ts` API-key methods (hashing/verify), `server/rateLimiter.ts` (per-key limiting), the public ingest handlers in `server/routes.ts`, and the Stripe webhook handler.
- **Public (unauthenticated) surfaces:** `POST /api/analytics/event`, `POST /api/consent/log`, the embed script, marketing pages, `POST /api/stripe/webhook`.
- **Authenticated surfaces:** the dashboard `/api/*` routes and the new `/api/v1/*` surface.
- **Dev-only:** Vite dev server wiring in `server/vite.ts` — ignore unless proven reachable in production.

## Threat Categories

### Spoofing
- API keys MUST be verified by looking up `keyId`, recomputing `HMAC-SHA256(API_KEY_PEPPER, secret)`, and comparing in **constant time**. Revoked/expired keys MUST be rejected.
- `API_KEY_PEPPER` MUST be distinct from `SESSION_SECRET` so rotating one never silently invalidates the other.
- Stripe webhooks MUST continue to be verified with `STRIPE_WEBHOOK_SECRET`.
- The unauthenticated ingest endpoints identify sites by `publicId`, which is not an authenticator — they MUST NOT be trusted to perform any privileged or owner-scoped action.

### Tampering
- All `/api/v1` request bodies/params MUST be Zod-validated before reaching `storage`.
- Plan limits and billable unit counts MUST be computed server-side; clients MUST NOT be able to set their own usage/limit values.
- Consent records MUST be written through the validated `storage` path; the record's integrity is the product's legal value.

### Repudiation
- Billable and state-changing API actions MUST be recorded in `api_usage_events` (acting `apiKeyId`, `userId`, `action`, `billableUnits`, timestamp).
- Idempotent billable writes MUST de-duplicate on `(apiKeyId, idempotencyKey)` so replays neither double-charge nor create ambiguous audit history.
- API-key lifecycle events (create, rotate, revoke) MUST be attributable to the owner.

### Information Disclosure
- API-key secrets MUST be shown exactly once at creation and NEVER stored in plaintext, returned by list endpoints, or written to logs. Only `keyPrefix` + metadata are listable.
- Every `/api/v1` resource read MUST be scoped via `authorizeWebsiteAccess()`; guessable resource IDs MUST NOT grant cross-owner access (IDOR).
- Error responses MUST use the `{ error, code, hint }` contract without stack traces or DB internals.
- The HMAC `API_KEY_PEPPER` and all third-party secrets MUST stay server-side only.

### Denial of Service
- Every `/api/v1` endpoint MUST sit behind a per-key rate limiter; auth and public ingest MUST keep their existing IP/publicId limiters.
- Resource-intensive operations (e.g. site scans triggered via `POST /api/v1/sites/:id/scan`) MUST be rate-limited and bounded.
- List endpoints MUST be paginated/bounded so a single call cannot exhaust memory or flood an MCP client.
- Note: the current rate limiter is in-memory and not horizontally consistent — acceptable for first launch, revisit with a shared store at scale.

### Elevation of Privilege
- After authentication, EVERY resource access MUST pass an explicit authorization check (`authorizeWebsiteAccess(ctx, website, action)`); authentication alone grants nothing.
- API keys MUST inherit only their owner's existing access (owner-owned and, for agencies, in-account client sites) — never broader.
- Scope checks (`requireScope`) MUST be enforced server-side; the MCP server, holding a user key, MUST NOT be able to exceed that key's scopes.
- All DB queries MUST remain parameterized (Drizzle); no string-built SQL.

## Implementation Status & Security Scan (Phase-1)

The `/api/v1` surface and the `mcp-server/` MCP server are implemented. The MCP server is a thin stdio client that reads its API key only from `CONSENTEASE_API_KEY`, sends it solely in the `Authorization: Bearer` header, logs exclusively to stderr (stdout stays clean for JSON-RPC), and inherits exactly its key's access/scopes — it adds no privilege. Its sole billable write (`consentease_record_consent`) **requires** an `idempotencyKey`, so retries are de-duplicated and cannot double-write a consent record or double-charge.

A `security_scan` pass (dependency audit + SAST + dataflow) found **no critical/high findings in the new application surface** (`mcp-server/`, `server/api/v1/`):
- The `/sites/:id/embed` snippet flags an `html-in-template-string` warning, but the interpolated `scriptUrl` is server-constructed (`<base>/api/consent/<publicId>/script.js`) — no user-controlled HTML — so it is not an injection vector.
- The `unknown-value-with-script-tag` flags are in `mcp-server/scripts/smoke-test.ts`, a dev-only test asserting that a returned snippet contains `<script`; it is not shipped in the package (`files` ships only `dist` + `README.md`).
- All SAST HIGH findings are in unrelated tooling (`.agents/skills/**` scripts, `script/deploy-build.cjs`), not in the Connect surface.
- Dependency vulnerabilities are pre-existing root-app dependencies (build/transitive); none originate from the MCP deps (`@modelcontextprotocol/sdk`, `zod`). Tracked separately from this effort.
