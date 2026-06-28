# ConsentEase Connect — Phase 1 Build Sequence

> Concrete, codebase-accurate build plan for the two Phase-1 P0s:
> **(1) API-key auth + `/api/v1`** and **(2) the MCP server.**
> Companion to `docs/concept/consentease-connect-concept.md` (v1.2, §13).

---

Version: 1.1
Last updated: 2026-06-27
Status: In progress — architect plan review (G1) complete; schema approval (G2) pending
Owner: Founder (Driver)
Build aid: the installed `mcp-builder` skill (`.agents/skills/mcp-builder/`) governs all MCP work.

**Changelog**
- v1.1 — incorporated architect plan review: keyId + HMAC(`API_KEY_PEPPER`) key scheme (not raw sha-256); add `api_usage_events` with idempotency now (not later); dedicated `AuthContext` + `authorizeWebsiteAccess()` instead of reusing `domain-utils`; error contract + pagination + idempotency moved earlier; key rotation/reveal-once added.
- v1.0 — initial sequence.

---

## 0. Scope & guiding principle

**In scope (Phase 1):** a versioned public REST API authenticated by API keys, and an MCP server that wraps the same capabilities for coding agents.

**Out of scope (later phases):** autonomous-ops agents, GPC/server-side enforcement, headless mobile SDKs, formal partnerships. (See concept §13.)

**Governing principle — one engine, three entrypoints.** We do **not** fork business logic. Everything routes through the existing singleton `storage` (the `IStorage` implementation `DatabaseStorage` in `server/storage.ts`). The dashboard (session auth) is entrypoint #1; the new API key surface is #2; the MCP server is #3. New code is thin: auth middleware, a `/api/v1` router, and an MCP package — all calling existing `storage` methods.

```
  Dashboard (express-session + Passport) ─┐
  API key (Authorization: Bearer …)  ─────┼──▶  storage: IStorage  ──▶  PostgreSQL (Drizzle)
  MCP server (thin client over /api/v1) ──┘     (scan, consent, embed, metering, plan limits)
```

**Access model decision (v1.1):** an API key inherits **exactly the website access its owner has in the dashboard** — no more, no less. For a solo user that's their own sites; for an agency that's the client sites under their account. This avoids a second authz model. Encoded in `authorizeWebsiteAccess()` (T003).

---

## 1. Definition of Done — applies to EVERY ticket

"Properly in order from the start" means none of these are optional:

- **Validation:** every request body/params validated with a Zod schema (extend the `drizzle-zod` insert schemas in `shared/schema.ts`, mirroring `insertWebsiteSchema`/`insertCookieSchema`) **before** touching `storage`.
- **Authorization, not just authentication:** every `/api/v1` resource access goes through `authorizeWebsiteAccess(ctx, website, action)`. An authenticated key must never read/write a website its owner can't access.
- **Idempotency for billable writes:** state-changing/billable POSTs (esp. `/api/v1/consent`) accept an `Idempotency-Key`; replays are de-duplicated via the `(apiKeyId, idempotencyKey)` unique constraint and never double-meter.
- **Pagination from day one:** list endpoints return bounded, paginated responses (`limit`/`cursor`) — MCP clients must not get unbounded payloads.
- **Safe data access:** all DB access via Drizzle / `storage` (parameterized). No string-built SQL.
- **Secrets:** API keys are **never stored in plaintext** — store `keyId` (lookup) + `secretHash = HMAC-SHA256(API_KEY_PEPPER, secret)`; show the plaintext once. No secret is logged. Env read server-side only.
- **Rate limiting:** every keyed endpoint sits behind a per-key limiter (extend `server/rateLimiter.ts`).
- **Metering & plan limits:** API-driven billable units flow through `incrementMonthlyViewCounter` + `PLAN_LIMITS` (same path as the embed script) **and** are logged to `api_usage_events`.
- **Error contract:** consistent JSON shape `{ error, code, hint? }` with actionable messages (mirrors mcp-builder guidance).
- **Tests:** each backend ticket ships with integration/E2E coverage via the `testing` skill (`runTest()`); auth, scoping, rate-limit, idempotency, and metering paths must be exercised.
- **No forbidden edits:** never edit the app's root `package.json` (use the package manager tool); never touch `drizzle.config.ts`, `vite.config.ts`, `server/vite.ts`, `clickup-automation.config.json`, or `scripts/clickup-cli.ts`.
- **Schema-change gate (replit.md preference):** new tables = a DB schema change → **explicit founder approval before `npm run db:push`**, every time.

---

## 2. Pre-flight gates

| Gate | What | Status |
|---|---|---|
| **G1 — Architect plan review** | `architect(responsibility:"plan")` over this sequence + relevant files. | ✅ Done (2026-06-27) — recommendations folded into v1.1. |
| **G3 — Threat model sketch** | `threat_modeling` over the new surface (key leakage, scope escalation, public-ingest abuse, MCP misuse) → `threat_model.md`. | ⏳ Next, before G2. |
| **G2 — Schema approval** | Present exact `api_keys` / `api_usage_events` schema + the new `API_KEY_PEPPER` secret to the founder; get a yes before `db:push`. | ⏳ Pending founder approval. |

**New required env var:** `API_KEY_PEPPER` (high-entropy, distinct from `SESSION_SECRET`). Provisioned via the secrets workflow before T004.

---

## 3. Build sequence

Two epics. Epic A (REST API) is the foundation; Epic B (MCP) is a thin client on top. Critical path: **T001 → T002 → T004 → T005 → T008 → T012 → T013**.

### Epic A — Public REST API with API-key auth

---

#### T001 — Finalize data model + architect plan review ✅
- **Blocked by:** none
- **Outcome (agreed model):**
  - `api_keys`: `id`, `userId` (FK → users, cascade), `name`, `keyId` (public lookup id, **unique-indexed**), `keyPrefix` (shown in UI), `secretHash` (HMAC-SHA256 of secret under `API_KEY_PEPPER`), `scopes` (`text().array()`), `rateTier`, `lastUsedAt`, `expiresAt` (nullable), `revokedAt` (nullable), `rotatedFromKeyId` (nullable), `createdAt`.
  - `api_usage_events`: `id`, `apiKeyId` (FK), `userId`, `websiteId` (nullable), `action`, `billableUnits` (int), `idempotencyKey` (nullable), `status`, `createdAt`; **unique `(apiKeyId, idempotencyKey)` where idempotencyKey is not null.**
  - Billable "view-equivalent" units still increment `monthly_view_counters`; `api_usage_events` is the audit/analytics/idempotency ledger.
- **Acceptance:** model approved by architect (done) → proceed to G3 then G2.

#### T002 — Schema: `api_keys` + `api_usage_events`
- **Blocked by:** T001, **G3**, **G2 (schema approval)**
- **Details:** add both tables to `shared/schema.ts` per existing pattern (`pgTable`, `.array()` as a method, `createInsertSchema(...).omit({...})`, `export type … = $inferSelect` / `z.infer<…>`). Unique index on `keyId`; partial unique on `(apiKeyId, idempotencyKey)`. `npm run typecheck`, then `npm run db:push` **only after G2**.
- **Acceptance:** compiles, types exported, `db:push` clean, both uniqueness constraints present.

#### T003 — Cross-cutting API foundations
- **Blocked by:** T002
- **Details:**
  - Error contract helper → `{ error, code, hint? }` + status mapping.
  - `AuthContext { principalType: "session"|"apiKey", userId, apiKeyId?, scopes }` type.
  - `authorizeWebsiteAccess(ctx, website, action)` — single ownership/authz gate encoding the access-model decision above. **Not** `shared/domain-utils.ts` (that's host/domain logic).
  - Pagination/filtering conventions (`limit`/`cursor`) + an idempotency helper keyed on `(apiKeyId, idempotencyKey)`.
- **Acceptance:** helpers unit-tested; cross-owner access denied by `authorizeWebsiteAccess`; pagination + idempotency helpers behave on replay.

#### T004 — API-key storage methods (IStorage)
- **Blocked by:** T002 (needs `API_KEY_PEPPER` provisioned)
- **Details:** add to `IStorage` + `DatabaseStorage`:
  - `createApiKey(userId, name, scopes)` → mints `ce_live_<keyId>_<secret>`, stores `keyId` + HMAC `secretHash` + prefix, **returns plaintext once**.
  - `verifyApiKey(plaintext)` → parse `keyId`, look up by `keyId`, HMAC the secret, **timing-safe compare**, reject revoked/expired.
  - `listApiKeysForUser(userId)` (prefix + metadata only — never the secret/hash).
  - `revokeApiKey(id, userId)`, `rotateApiKey(id, userId)` (mints new, links `rotatedFromKeyId`, revokes old after grace), `touchApiKeyLastUsed(keyId)` (throttled).
- **Acceptance:** created key verifies; revoked/expired fails; rotation works with grace; lists never leak secrets.

#### T005 — API-key auth middleware
- **Blocked by:** T004, T003
- **Details:** `server/middleware/apiKeyAuth.ts` — read `Authorization: Bearer`/`X-API-Key`, `verifyApiKey`, build `AuthContext`, attach to `req`, `touchApiKeyLastUsed`. Failures → standard error contract, 401, actionable hint. `requireScope(scope)` guard.
- **Acceptance:** valid → 200 path; missing/invalid/revoked/expired → 401 with correct codes; `AuthContext` populated.

#### T006 — Per-key rate limiting
- **Blocked by:** T005
- **Details:** extend `createRateLimiter` to key on `req.authContext.apiKeyId` (fallback IP), tiers from `rateTier`; apply to all `/api/v1`. (Note: current limiter is in-memory — fine for first launch, not horizontally scalable; revisit at scale.)
- **Acceptance:** over-tier → 429 + `Retry-After`; keys isolated.

#### T007 — Usage metering, idempotency & plan-limit enforcement
- **Blocked by:** T005, T002
- **Details:** billable API actions write an `api_usage_events` row (idempotent on `(apiKeyId, idempotencyKey)`) and, for view-equivalent units, call `incrementMonthlyViewCounter(userId)` honoring `PLAN_LIMITS` + 1.1× grace. Guard against double-counting vs the embed script.
- **Acceptance:** API volume appears in the same counters; replays don't double-meter; over-limit returns the same `limited: true` semantics.

#### T008 — Versioned `/api/v1` surface ✅
- **Blocked by:** T005, T006, T007, T003
- **Details:** `server/api/v1/` router under `/api/v1`, behind `apiKeyAuth` + per-key limiter; every route Zod-validated, paginated where applicable, and gated by `authorizeWebsiteAccess`:
  - `GET /sites` (paginated), `POST /sites`, `GET /sites/:id`
  - `POST /sites/:id/scan`
  - `GET /sites/:id/embed`
  - `GET /sites/:id/cookies` (paginated), `POST /sites/:id/cookies`
  - `POST /consent` (idempotent; reuse `consent/log` validation)
  - `GET /sites/:id/compliance`
- **Acceptance:** each endpoint works against a real key, refuses cross-owner access, validates input, paginates, is rate-limited + metered, and `/consent` is idempotent.

#### T009 — Error contract docs + API reference ✅
- **Blocked by:** T008
- **Details:** developer docs (OpenAPI or clean README): auth, every endpoint, pagination, idempotency, errors, rate limits. Conservative compliance wording (concept §7/§10).
- **Acceptance:** docs cover the full surface; error shape consistent.

#### T010 — Dashboard UI: API-key management
- **Blocked by:** T004
- **Details:** settings page (React + wouter + shadcn `Form`/`useForm`, TanStack Query): create (reveal-once), list (prefix only), revoke, rotate. `data-testid` on every interactive/display element.
- **Acceptance:** user self-serves, rotates, and revokes keys; revoked keys stop working immediately.

#### T011 — Integration/E2E tests for the API
- **Blocked by:** T008
- **Details:** via `testing` skill — auth success/failure, scope/ownership, rate limiting, idempotency replay, metering/plan limits, and each endpoint's happy + validation-error paths.
- **Acceptance:** suite green; scoping, rate-limit, and idempotency cases explicitly asserted.

---

### Epic B — MCP server (thin client over `/api/v1`)

**Design decision (architect-endorsed):** separate `mcp-server/` package (its own `package.json` — never touch the app's root), a **thin client over hosted `/api/v1`**, authenticated by `CONSENTEASE_API_KEY`. One source of truth (the API), trivial `npx` distribution, inherits all auth/scoping/metering from Epic A. Built per the `mcp-builder` skill (TypeScript SDK; stdio for local agent install, streamable HTTP optional later).

---

#### T012 — MCP server scaffold
- **Blocked by:** T008
- **Details:** new `mcp-server/` package, TS MCP SDK, stdio transport, config via `CONSENTEASE_API_KEY`. Follow mcp-builder Phase 1–2; read `.agents/skills/mcp-builder/reference/node_mcp_server.md` first.
- **Acceptance:** server starts, lists tools, authenticates to `/api/v1`.

#### T013 — MCP tools
- **Blocked by:** T012
- **Details:** tools mapping to v1 with Zod in/out schemas, annotations (`readOnlyHint`/`destructiveHint`/`idempotentHint`), actionable errors: `scan_site`, `enable_consent`, `configure_banner`, `get_embed_snippet` (read-only), `get_compliance_report` (read-only), `record_consent` (idempotent).
- **Acceptance:** an agent can drive a site from "no consent" → "scanned + consent enabled + embed returned"; annotations correct.

#### T014 — Packaging & one-command install
- **Blocked by:** T013
- **Details:** `npx`-runnable, one-line install docs for Cursor/Claude/etc., MCP-registry listing metadata (owned/earned distribution, no ad spend — concept §13).
- **Acceptance:** fresh machine installs + connects with only an API key; listing metadata ready.

#### T015 — MCP evaluations
- **Blocked by:** T013
- **Details:** mcp-builder harness (`scripts/evaluation.py`) — author 10 read-only, verifiable evals and run. **Needs `ANTHROPIC_API_KEY` (incurs cost) — confirm before running.**
- **Acceptance:** ≥10 evals authored; agent passes the read-only set.

#### T016 — Security pass over the new surface
- **Blocked by:** T008, T013
- **Details:** `security_scan` (SAST/deps) + finalize `threat_model.md` (key leakage, scope escalation, public-ingest abuse, MCP misuse). Fix criticals before launch.
- **Acceptance:** no unresolved critical/high findings; threat model complete.

---

## 4. Dependency graph (critical path in bold)

```
T001 ─▶ T002 ─┬─▶ T003 ─┐
              └─▶ T004 ─▶ T005 ─┬─▶ T006 ─┐
                                ├─▶ T007 ─┤
                                │         ▼
                                │        T008 ─▶ T009
                                │         │  └▶ T011
                                │         └▶ T012 ─▶ T013 ─▶ T014
                                │                     ├▶ T015
                                │                     └▶ T016
                                └▶ (T010 dashboard, parallel after T004)
```
**Critical path:** T001 → T002 → T004 → T005 → T008 → T012 → T013.

## 5. Risks specific to this build

| Risk | Mitigation |
|---|---|
| API key leaks in logs/responses | Store `keyId` + HMAC `secretHash` only; never log secrets; lists return prefix only; timing-safe compare |
| Session rotation invalidates API keys | Separate `API_KEY_PEPPER`, never reuse `SESSION_SECRET` |
| Authenticated key reads another user's data | `authorizeWebsiteAccess()` on every resource; tested explicitly (T011) |
| Billable POST retried → double charge | `Idempotency-Key` + unique `(apiKeyId, idempotencyKey)`; metering de-duped (T007) |
| API traffic bypasses plan limits | Route metering through `incrementMonthlyViewCounter` + `PLAN_LIMITS` (T007) |
| Unbounded list payloads to agents | Pagination in the v1 contract from day one (T003/T008) |
| Editing the app's `package.json` for MCP deps | MCP lives in its own `mcp-server/` package |
| In-memory rate limiter not horizontally scalable | Acceptable for first launch; revisit (shared store) at scale |
| Schema change surprises the founder | G2 approval gate before every `db:push` |
| Over-claiming compliance globally | Conservative wording in API docs/tool outputs (concept §7/§10) |

## 6. Immediate next steps

1. **G3 — threat model sketch** of the new surface → `threat_model.md`.
2. **G2 — present exact schema + `API_KEY_PEPPER`** to founder for approval.
3. On approval: T002 (schema + `db:push`) → T003/T004 → onward.
