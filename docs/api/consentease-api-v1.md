# ConsentEase REST API — `v1`

The ConsentEase API lets you manage consent banners, cookie inventories, and consent
records programmatically — the same operations available in the dashboard, exposed as a
stable, versioned HTTP surface. It is the single source of truth behind both the
dashboard and the ConsentEase MCP server.

- **Base path:** `/api/v1`
- **Full base URL:** `https://<your-consentease-domain>/api/v1`
- **Content type:** `application/json` for all request and response bodies.
- **Stability:** the `v1` prefix is versioned. Breaking changes ship under a new prefix.

---

## Authentication

Every `/api/v1` request must carry an API key. Send it in **either** header:

```http
Authorization: Bearer ce_live_<keyId>_<secret>
```

```http
X-API-Key: ce_live_<keyId>_<secret>
```

### Key format & handling

- Keys look like `ce_live_<keyId>_<secret>`.
- The full key is shown **once**, at creation time, in the dashboard. It is never
  retrievable again — only a prefix and metadata are listable. Store it in a secret
  manager or environment variable; never commit it to source control.
- A key grants exactly the access its owner has in the dashboard: the owner's own
  websites, plus — for agency accounts — the websites of clients in that account. A key
  never grants more than its owner.
- Lost or leaked a key? **Rotate or revoke it** in the dashboard. Revocation takes
  effect immediately.

### Authentication failures

A missing, malformed, revoked, or expired key returns `401 unauthorized`:

```json
{
  "error": "Missing API key",
  "code": "unauthorized",
  "hint": "Send your key as `Authorization: Bearer <key>` or in the `X-API-Key` header."
}
```

---

## Scopes

Each key is minted with a set of scopes. A request to an endpoint whose required scope
is not held by the key returns `403 forbidden`. A key may hold the wildcard `*`, which
satisfies every scope.

| Scope            | Grants                                              |
| ---------------- | --------------------------------------------------- |
| `sites:read`     | Read sites, cookies, embed snippets, compliance.    |
| `sites:write`    | Create sites and add cookies.                       |
| `sites:scan`     | Trigger cookie rescans.                             |
| `consent:write`  | Record consent decisions.                           |
| `*`              | All of the above.                                   |

---

## Rate limits

Limiting is two-stage. Exceeding either stage returns `429 rate_limited` with a
`Retry-After` header (seconds):

1. **Per-IP (pre-authentication):** a high ceiling that only exists to absorb abusive
   unauthenticated floods. Legitimate single-client traffic never hits it.
2. **Per-key (post-authentication):** your real budget, selected by the key's rate tier:

   | Tier       | Requests / minute / key |
   | ---------- | ----------------------- |
   | `standard` | 120                     |
   | `high`     | 600                     |

```json
{
  "error": "Rate limit exceeded",
  "code": "rate_limited",
  "hint": "Retry after 12s, or request a higher rate tier."
}
```

> Note: rate-limit counters are currently per-instance (in-memory). This is sufficient
> for launch; a shared store will be introduced as the platform scales horizontally.

---

## Pagination

List endpoints (`GET /sites`, `GET /sites/:id/cookies`) are cursor-paginated.

**Query parameters**

| Param    | Type    | Default | Notes                              |
| -------- | ------- | ------- | ---------------------------------- |
| `limit`  | integer | `20`    | 1–`100`. Values above 100 are capped. |
| `cursor` | string  | —       | Opaque cursor from a previous page. |

**Response shape**

```json
{
  "data": [ /* … rows … */ ],
  "nextCursor": "eyJjcmVhdGVkQXQiOiI…"
}
```

Results are ordered newest-first (`createdAt` descending, `id` ascending as a stable
tiebreaker). When `nextCursor` is `null`, you have reached the last page. To fetch the
next page, pass the returned `nextCursor` value back as `?cursor=`.

```http
GET /api/v1/sites?limit=20&cursor=eyJjcmVhdGVkQXQiOiI…
```

---

## Idempotency

`POST /consent` — the only billable, state-changing write — supports safe retries via an
idempotency key:

```http
Idempotency-Key: <unique-key>
```

- **Format:** 1–255 characters from `[A-Za-z0-9_.:-]`. A malformed key returns
  `400 bad_request`.
- **Replay:** retrying with the same key (after a successful first call) does **not**
  write a second consent record. The retry returns `200` with `{ "deduped": true }`.
- **Reuse for a different operation:** sending a key that was already used for a
  *different* action returns `409 conflict`. Always use a fresh, unique key per distinct
  operation.

The other write endpoints (`POST /sites`, `POST /sites/:id/scan`,
`POST /sites/:id/cookies`) are **not** idempotent in `v1`: a retried request may create a
duplicate resource. Guard those with your own client-side retry logic where needed.

---

## Error contract

Every error — for every endpoint — uses the same JSON shape. Stack traces and database
internals are never exposed.

```json
{
  "error": "Human-readable message",
  "code": "machine_readable_code",
  "hint": "Optional actionable suggestion"
}
```

| HTTP | `code`         | Meaning                                                            |
| ---- | -------------- | ----------------------------------------------------------------- |
| 400  | `bad_request`  | Invalid input (body, query param, path id, or idempotency key).   |
| 401  | `unauthorized` | Missing, malformed, revoked, or expired API key.                  |
| 403  | `forbidden`    | Authenticated but missing the required scope, or over a plan limit. |
| 404  | `not_found`    | Resource does not exist **or** is not accessible by this key.†    |
| 409  | `conflict`     | Idempotency-Key reused for a different operation.                  |
| 429  | `rate_limited` | Rate or daily-scan limit exceeded. Honor `Retry-After`.           |
| 500  | `internal`     | Unexpected server error. Safe to retry idempotent reads.          |

> † To prevent resource enumeration (IDOR), requests for a resource you do not own
> return `404`, not `403`.

---

## Endpoints

All paths below are relative to `/api/v1`. The required scope is listed per endpoint.

### `GET /sites` — list sites · scope `sites:read`

Paginated list of every website you can access (owned + agency-client sites).

```http
GET /api/v1/sites?limit=20
Authorization: Bearer ce_live_…
```

`200 OK`

```json
{
  "data": [
    {
      "id": "bdd8b5d7-3f38-48cf-b1ed-fffa5c3d25d4",
      "userId": "029d5168-…",
      "publicId": "2ccaoi1oa88x",
      "domain": "example.com",
      "status": "scanning",
      "lastScan": null,
      "cookiesFound": 0,
      "scriptsFound": 0,
      "subscriptionType": "free",
      "createdAt": "2026-06-27T18:18:55.063Z"
    }
  ],
  "nextCursor": null
}
```

`status` is one of `pending`, `scanning`, `compliant`, `attention`.

---

### `POST /sites` — create a site · scope `sites:write`

Creates a website, its default banner config, and default cookie categories, then kicks
off a background cookie scan. Subject to your plan's website limit.

**Request body**

| Field    | Type   | Required | Notes                                                          |
| -------- | ------ | -------- | -------------------------------------------------------------- |
| `domain` | string | yes      | Bare domain, no protocol/`www` (e.g. `example.com`). Normalized server-side. |

```json
{ "domain": "example.com" }
```

`201 Created` returns the created site object (same shape as the list rows above).
`publicId`, `status`, and ownership are assigned server-side and cannot be set by the
caller.

- `403 forbidden` — plan website limit reached.
- `400 bad_request` — missing/invalid domain (include the bare domain, no `https://`).

---

### `GET /sites/:id` — get one site · scope `sites:read`

`200 OK` returns a single site object. Returns `404 not_found` if the site does not exist
or is not accessible by your key.

---

### `POST /sites/:id/scan` — trigger a rescan · scope `sites:scan`

Starts a background cookie rescan. Bounded by your plan's daily scan limit.

`202 Accepted`

```json
{ "status": "scanning" }
```

- `429 rate_limited` — daily scan limit reached for your plan.
- `404 not_found` — site not accessible.

---

### `GET /sites/:id/embed` — get the embed snippet · scope `sites:read`

Returns the copy-paste install snippet and script URL for the banner.

`200 OK`

```json
{
  "publicId": "2ccaoi1oa88x",
  "scriptUrl": "https://<your-consentease-domain>/api/consent/2ccaoi1oa88x/script.js",
  "snippet": "<!-- ConsentEase: … --><script src=\"…\" async></script>"
}
```

Place the `snippet` in the site's `<head>`, before Google Tag Manager / gtag, so consent
defaults are set before tags load.

---

### `GET /sites/:id/cookies` — list cookies · scope `sites:read`

Paginated cookie inventory for a site (see [Pagination](#pagination)).

`200 OK`

```json
{
  "data": [
    {
      "id": "…",
      "websiteId": "…",
      "categoryId": "…",
      "name": "_ga",
      "provider": "Google Analytics",
      "purpose": "Used to distinguish users.",
      "expiry": "2 years",
      "type": "first-party",
      "isAutoDetected": true,
      "sourceUrl": null,
      "createdAt": "2026-06-27T18:18:55.063Z"
    }
  ],
  "nextCursor": null
}
```

---

### `POST /sites/:id/cookies` — add a cookie · scope `sites:write`

**Request body**

| Field        | Type   | Required | Notes                                                       |
| ------------ | ------ | -------- | ----------------------------------------------------------- |
| `name`       | string | yes      | Cookie name, e.g. `_ga`.                                    |
| `purpose`    | string | yes      | What the cookie does.                                       |
| `categoryId` | string | yes      | Must be a category that belongs to **this** site.          |
| `provider`   | string | no       | e.g. `Google Analytics`.                                   |
| `expiry`     | string | no       | e.g. `2 years`, `Session`.                                 |
| `type`       | string | no       | `first-party` (default) or `third-party`.                  |

`201 Created` returns the created cookie object.

- `400 bad_request` — missing `categoryId`, or a `categoryId` that does not belong to
  this site.

---

### `POST /consent` — record a consent decision · scope `consent:write`

Records an end-user consent decision. **This is the billable action** (1 view-equivalent
unit, counted against the same monthly usage as banner views). Supports
[idempotency](#idempotency).

**Request body**

| Field            | Type             | Required | Notes                                                  |
| ---------------- | ---------------- | -------- | ------------------------------------------------------ |
| `siteId`         | string           | yes      | The target website id.                                 |
| `visitorId`      | string           | yes      | Your anonymized/hashed visitor identifier.             |
| `action`         | enum             | yes      | `accept_all`, `reject_all`, or `custom`.               |
| `consentChoices` | string or object | yes      | The choices, e.g. `{ "analytics": true, "marketing": false }`. |
| `bannerVersion`  | string           | no       | Version of the banner shown.                           |
| `policyVersion`  | string \| null   | no       | Privacy-policy version at time of consent.             |
| `userAgent`      | string           | no       | End-user user agent.                                   |
| `country`        | string           | no       | Country code.                                          |
| `region`         | string           | no       | Region.                                                |

```http
POST /api/v1/consent
Authorization: Bearer ce_live_…
Idempotency-Key: visitor-42-2026-06-27
Content-Type: application/json

{
  "siteId": "bdd8b5d7-…",
  "visitorId": "v_8f3a…",
  "action": "custom",
  "consentChoices": { "necessary": true, "analytics": true, "marketing": false }
}
```

`201 Created` (first write)

```json
{ "success": true, "deduped": false, "limited": false }
```

`200 OK` (idempotent replay)

```json
{ "success": true, "deduped": true }
```

- `limited: true` indicates the record was accepted but the account is over its monthly
  usage allowance (a soft grace cap applies). Treat it as a signal to upgrade.
- `409 conflict` — the `Idempotency-Key` was already used for a different operation.

---

### `GET /sites/:id/compliance` — compliance snapshot · scope `sites:read`

Returns an honest, operational snapshot derived from real scan, cookie, and banner
state. **No synthetic compliance score is invented.**

`200 OK`

```json
{
  "websiteId": "…",
  "domain": "example.com",
  "status": "scanning",
  "lastScan": null,
  "bannerConfigured": true,
  "scan": { "cookiesFound": 0, "scriptsFound": 0 },
  "cookies": { "total": 4 },
  "categories": { "total": 4, "enabled": 3 }
}
```

> **Compliance disclaimer.** This snapshot reports the operational configuration of your
> ConsentEase banner and cookie inventory. It is **not legal advice** and is **not a
> determination or guarantee of GDPR, CCPA, or other regulatory compliance**.
> Achieving and maintaining compliance depends on factors outside ConsentEase's view
> (your actual data processing, third-party tags, jurisdiction, and policies). Consult
> qualified counsel for a compliance assessment.

---

## Quick start

```bash
# 1. Create a site
curl -s -X POST https://<your-consentease-domain>/api/v1/sites \
  -H "Authorization: Bearer $CONSENTEASE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"domain":"example.com"}'

# 2. Grab the embed snippet (use the id from step 1)
curl -s https://<your-consentease-domain>/api/v1/sites/<SITE_ID>/embed \
  -H "Authorization: Bearer $CONSENTEASE_API_KEY"

# 3. Record a consent decision (safe to retry with the same Idempotency-Key)
curl -s -X POST https://<your-consentease-domain>/api/v1/consent \
  -H "Authorization: Bearer $CONSENTEASE_API_KEY" \
  -H "Idempotency-Key: visitor-42-2026-06-27" \
  -H "Content-Type: application/json" \
  -d '{"siteId":"<SITE_ID>","visitorId":"v_8f3a","action":"accept_all","consentChoices":{"analytics":true}}'
```
