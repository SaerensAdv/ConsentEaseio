# Analytics Pipeline — Weekend Stappenplan

**Datum opgesteld:** 30 april 2026
**Doel:** Alle bevindingen uit (1) de pipeline-breakdown en (2) de consent-ratio wiskunde-analyse omzetten naar een concreet, uitvoerbaar weekend-plan.
**Scope:** ConsentEase analytics pipeline (banner → ingestion → DB → dashboard).
**Niet in scope:** Iris chatbot, Stripe, websites-pagina, branding.

---

## Inhoudsopgave

1. [Compleet overzicht van alle bugs en risico's](#1-compleet-overzicht)
2. [Prioriteit-matrix](#2-prioriteit-matrix)
3. [Detail-implementatieplan per item](#3-detail-implementatieplan)
4. [Volgorde voor het weekend](#4-volgorde-voor-het-weekend)
5. [Per-item verificatie](#5-verificatie-checklist)
6. [Rollback-plan](#6-rollback-plan)
7. [Definition of Done](#7-definition-of-done)

---

## 1. Compleet overzicht

### 1.1 Pipeline-bugs (uit eerste breakdown)

| ID | Bug | Severity | Bron |
|----|-----|----------|------|
| B1 | Geen rate limiting op `/api/analytics/event` & `/api/analytics/vitals` | KRITIEK | server/routes.ts:1480, 1571 |
| B2 | Host-check is bypassbaar (origin én referer ontbreken → request geaccepteerd) | KRITIEK | server/routes.ts:1503-1506 |
| B3 | `IP_HASH_SALT` valt terug op random bytes als `SESSION_SECRET` ontbreekt | KRITIEK | server/routes.ts:306 |
| B4 | `country` wordt door client meegestuurd en blind opgeslagen (spoofbaar) | HOOG | server/routes.ts:1492, 1537 |
| B5 | Race condition rond maandlimiet (count-then-check is niet atomair) | HOOG | server/routes.ts:1508-1521 |
| B6 | Read-time aggregatie schaalt niet (laadt alle rauwe events in JS-memory) | HOOG | server/storage.ts:455-672 |
| B7 | Web Vitals worden dubbel verzonden (visibilitychange + 60s timeout) | HOOG | server/banner-script.ts:603-609 |
| B8 | Tijdzone-inconsistentie (daily=UTC, monthly=server-local) | MIDDEL | server/storage.ts:386, 432-435 |
| B9 | `details` payload wordt server-side weggegooid | MIDDEL | server/routes.ts:1492 |
| B10 | Geen Zod-validatie + geen eventType allowlist | MIDDEL | server/routes.ts:1480-1553 |
| B11 | ~~Dubbele `banner_dismissed` op close-button~~ — **NIET BEVESTIGD** na verificatie (close-btn roept `closeBanner()`, niet `hideBanner()`) | — | n.v.t. |
| B12 | `consent_logs.userAgent` wordt rauw opgeslagen (GDPR-grijs) | LAAG | shared/schema.ts:218-237 |
| B13 | Geen cleanup-job voor expired `consent_logs` | LAAG | n.v.t. |
| B14 | `countryCodes` map hardcoded, slechts 24 landen, anders `'XX'` | LAAG | server/storage.ts:485-510 |
| B15 | UA parsing op elke request zonder cap/validation | LAAG | server/routes.ts:1525-1532 |

### 1.2 Consent-ratio wiskunde-bugs (uit tweede breakdown)

| ID | Bug | Severity | Bron |
|----|-----|----------|------|
| M1 | `Math.max(0, totalViews - totalActions)` clamp verbergt data-onbalans | HOOG | server/storage.ts:382 |
| M2 | Ratio's zijn per impression, niet per visitor — dashboard suggereert het tegendeel | HOOG | dashboard label "Consent Rate" |
| M3 | Funnel `interactions` mist `dismissed` én bevat fantoom `settings_click` | MIDDEL | server/storage.ts:535 |
| M4 | Trend-`change` clamp ontbreekt: ÷0 wordt 0 (fout), wilde percentages mogelijk | MIDDEL | server/storage.ts:529 |
| M5 | Afronden op 1 decimaal vóór pie chart → som ≠ 100% in tooltip | LAAG | client/.../analytics.tsx:139-144 |
| M6 | "Total Sessions" label = banner-impressions ≠ aantal bezoekers (returning users met cached consent tellen niet mee) | LAAG | dashboard label |
| M7 | "Alles aangevinkt + save" telt als `customRate` i.p.v. effectief accept → onderschat acceptRate | LAAG | server/banner-script.ts:1132-1148 |
| M8 | `consent_updated` events worden in geen enkele bucket meegerekend (onzichtbaar) | LAAG | server/storage.ts:361-421 |

---

## 2. Prioriteit-matrix

```
KRITIEK (security/data-integriteit blocker, deze weekend AF):
  B1, B2, B3

HOOG (klant-impact, deze weekend AF):
  B4, B5, B7, M1, M2, M3

MIDDEL (kwaliteit, deze weekend ALS TIJD):
  B6, B8, B9, B10, M4

LAAG (volgende sprint, documenteren):
  B12, B13, B14, B15, M5, M6, M7, M8
```

**Geschatte totale tijd:**
- KRITIEK: 1u15
- HOOG: 4u30
- MIDDEL: 1 dag
- LAAG: 0,5 dag

---

## 3. Detail-implementatieplan

### KRITIEK

---

#### **STAP 1 — B1: Rate limiting op public analytics endpoints**

**Tijd:** 30 min
**Files:** `server/rateLimiter.ts`, `server/routes.ts`

**Wat:**
Voeg twee rate limiters toe aan `/api/analytics/event` en `/api/analytics/vitals`:
- Per-IP: 60 requests/minuut
- Per-publicId: 1000 events/minuut (tegen billing-fraude)

**Hoe:**
1. Open `server/rateLimiter.ts` en voeg toe (indien niet bestaand):
```ts
export const analyticsEventLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  keyGenerator: (req) =>
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'unknown',
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests' },
});

export const analyticsPublicIdLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  keyGenerator: (req) => req.body?.websiteId || 'no-id',
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many events for this site' },
});
```
2. In `server/routes.ts` voor regel 1480 en 1571:
```ts
app.post("/api/analytics/event", analyticsEventLimiter, analyticsPublicIdLimiter, async (req, res) => {
```
3. **Belangrijk:** zorg dat `app.set('trust proxy', 1)` actief is (Replit zit achter proxy) — anders leest rate-limit altijd dezelfde IP.

**Verificatie:** zie sectie 5.1.

---

#### **STAP 2 — B3: SESSION_SECRET verplicht maken in production**

**Tijd:** 15 min
**Files:** `server/index.ts` (of waar startup gebeurt), `server/routes.ts:306`

**Wat:**
Fail-fast bij startup als `SESSION_SECRET` ontbreekt en `NODE_ENV === 'production'`. Voorkomt de "elke restart nieuwe IP-hash" bug die de juridische audit trail breekt.

**Hoe:**
1. In `server/index.ts` bovenaan (vóór routes):
```ts
if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  console.error('FATAL: SESSION_SECRET is required in production for stable IP hashing.');
  process.exit(1);
}
```
2. In `server/routes.ts:306` vervangen door:
```ts
const IP_HASH_SALT: string =
  process.env.IP_HASH_SALT ||
  process.env.SESSION_SECRET ||
  (process.env.NODE_ENV === 'production'
    ? (() => { throw new Error('IP_HASH_SALT or SESSION_SECRET required in production'); })()
    : crypto.randomBytes(32).toString('hex'));
```
3. Verifieer in production env: `SESSION_SECRET` is gezet (check via Replit secrets UI).

**Verificatie:** zie sectie 5.2.

---

#### **STAP 3 — B2: Host-check verplicht maken in production**

**Tijd:** 30 min
**Files:** `server/routes.ts:1503-1506` en `1594-1597`

**Wat:**
Maak de host-check verplicht: in production wordt een request zonder Origin én Referer geweigerd. Voorkomt dat aanvallers via `curl` zonder die headers de check omzeilen.

**Hoe:**
Vervang in `routes.ts` op regel 1503 (en symmetrisch op 1594):
```ts
const requestHost = getRequestHost({
  origin: req.headers.origin,
  referer: req.headers.referer as string,
});

const isProduction = process.env.NODE_ENV === 'production';

if (!requestHost) {
  if (isProduction) {
    return res.status(403).json({ error: 'Origin or Referer required' });
  }
  // dev: log warning, allow through
  console.warn('[analytics] missing origin/referer — allowed in dev');
} else if (!isLocalhostOrDev(requestHost) &&
           !isDomainAllowed(requestHost, website.domain, website.allowedDomains)) {
  return res.status(403).json({ error: 'Domain not authorized' });
}
```

**Edge cases:**
- Server-side rendering met no-cors fetch → blokkeren is gewenst.
- Klanten met strict CSP `referrer-policy: no-referrer` zullen breken — communiceer dit en documenteer dat ze `strict-origin-when-cross-origin` (de default) moeten gebruiken.

**Verificatie:** zie sectie 5.3.

---

### HOOG

---

#### **STAP 4 — B4: Country server-side bepalen i.p.v. uit body**

**Tijd:** 30 min
**Files:** `server/routes.ts:1480-1553`, `server/banner-script.ts:617-628`

**Wat:**
Negeer `country` uit de request body. Bepaal het server-side via dezelfde geo-cache (`server/geolocation.ts`) op basis van het echte IP. Voorkomt spoofing van geo-stats.

**Hoe:**
1. In `server/routes.ts` na regel 1492 (`const { websiteId, eventType } = req.body;`):
```ts
const clientIp =
  (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
  (req.headers['x-real-ip'] as string) ||
  req.ip ||
  '';
const geoData = await getCountryFromIp(clientIp); // uit server/geolocation.ts
const serverCountry = geoData?.countryCode || null;
```
2. Vervang `country: country || null` (regel 1537) door `country: serverCountry`.
3. Gebruik dezelfde 24u cache uit `geolocation.ts` (al aanwezig). Voor banner_shown: dit is acceptabel overhead omdat geo gecached is.
4. **Performance-tip:** als `getCountryFromIp` cache miss → spawn de fetch async en sla `null` op voor dit event (geo komt voor volgende events).
5. Eventueel: `country` veld uit banner-script verwijderen in volgende release (backwards compatible — server negeert het nu toch).

**Verificatie:** zie sectie 5.4.

---

#### **STAP 5 — B7: Web Vitals dedupe + sendBeacon**

**Tijd:** 1u
**Files:** `server/banner-script.ts:511-610`

**Wat:**
- Vitals worden 1× per page-load verstuurd (niet bij elke tab-switch).
- Gebruik `navigator.sendBeacon()` zodat de POST ook bij page-unload betrouwbaar vertrekt.
- Fix de comment "10 seconds" → moet "60 seconds" zijn.

**Hoe:**
1. Voeg een module-level flag toe in banner-script:
```js
var vitalsReported = false;

function reportWebVitals() {
  if (vitalsReported) return;
  if (!vitalsData.lcp && !vitalsData.cls && !vitalsData.inp) return;
  vitalsReported = true;

  var payload = JSON.stringify({
    websiteId: CONFIG.publicId,
    lcp: vitalsData.lcp,
    cls: vitalsData.cls,
    inp: vitalsData.inp,
    fcp: vitalsData.fcp,
    ttfb: vitalsData.ttfb,
    bannerDelay: vitalsData.bannerDelay,
  });

  // sendBeacon werkt ook tijdens unload
  if (navigator.sendBeacon) {
    var blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon(API_BASE + '/api/analytics/vitals', blob);
  } else {
    fetch(API_BASE + '/api/analytics/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(function(){});
  }
}
```
2. Vervang `setTimeout(reportWebVitals, 60000)` door `pagehide` listener:
```js
window.addEventListener('pagehide', reportWebVitals);
window.addEventListener('beforeunload', reportWebVitals);
// fallback voor langlopende sessies
setTimeout(reportWebVitals, 60000);
```
3. Verwijder of corrigeer comment "10 seconds" → "60 seconds fallback".
4. Country wordt sowieso door server bepaald (na STAP 4) — uit payload halen.

**Verificatie:** zie sectie 5.5.

---

#### **STAP 6 — B5: Atomische maandlimiet-counter**

**Tijd:** 2u
**Files:** `shared/schema.ts`, `server/storage.ts`, `server/routes.ts:1508-1521`, migratie

**Wat:**
Vervang count-then-check (race condition) door een atomische upsert in een dedicated `monthly_view_counters` tabel. Bonus: O(1) read i.p.v. full-table count.

**Hoe:**

1. **Schema** (`shared/schema.ts`):
```ts
export const monthlyViewCounters = pgTable("monthly_view_counters", {
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  yearMonth: text("year_month").notNull(), // bv. "2026-04"
  count: integer("count").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.yearMonth] }),
}));
```

2. **Migratie:** `npm run db:push` (Drizzle).

3. **Backfill** (eenmalig, in een script of admin endpoint):
```sql
INSERT INTO monthly_view_counters (user_id, year_month, count, updated_at)
SELECT
  w.user_id,
  TO_CHAR(ae.timestamp, 'YYYY-MM') as year_month,
  COUNT(*) as count,
  NOW()
FROM analytics_events ae
JOIN websites w ON w.id = ae.website_id
WHERE ae.event_type = 'banner_shown'
GROUP BY w.user_id, year_month
ON CONFLICT (user_id, year_month) DO UPDATE SET count = EXCLUDED.count;
```

4. **Storage methods** (`server/storage.ts`):
```ts
async incrementMonthlyViewCounter(userId: string): Promise<number> {
  const yearMonth = new Date().toISOString().slice(0, 7); // UTC: "2026-04"
  const result = await db.execute(sql`
    INSERT INTO monthly_view_counters (user_id, year_month, count, updated_at)
    VALUES (${userId}, ${yearMonth}, 1, NOW())
    ON CONFLICT (user_id, year_month)
    DO UPDATE SET count = monthly_view_counters.count + 1, updated_at = NOW()
    RETURNING count
  `);
  return Number(result.rows[0].count);
}

async getMonthlyViewsForUser(userId: string): Promise<number> {
  const yearMonth = new Date().toISOString().slice(0, 7);
  const [row] = await db
    .select({ count: monthlyViewCounters.count })
    .from(monthlyViewCounters)
    .where(and(
      eq(monthlyViewCounters.userId, userId),
      eq(monthlyViewCounters.yearMonth, yearMonth),
    ));
  return row?.count || 0;
}
```

5. **Route** (`server/routes.ts:1508-1521`) — nu atomair:
```ts
if (eventType === 'banner_shown') {
  const user = await storage.getUser(website.userId);
  if (user) {
    const plan = (user.plan || 'solo') as keyof typeof PLAN_LIMITS;
    const limits = PLAN_LIMITS[plan];
    if (limits && limits.monthlyViews > 0) {
      const newCount = await storage.incrementMonthlyViewCounter(user.id);
      const gracePeriodLimit = Math.ceil(limits.monthlyViews * 1.1);
      if (newCount > gracePeriodLimit) {
        return res.json({ success: true, limited: true });
      }
    }
  }
}
```
**Let op:** increment gebeurt nu vóór de event-insert. Als event-insert faalt zit je 1 te hoog. Acceptabel voor billing maar documenteer dit, of wrap in transactie.

6. **Tijdzone:** counter gebruikt UTC `YYYY-MM` (consistent met daily charts) — fixt B8 deels.

**Verificatie:** zie sectie 5.6.

---

#### **STAP 7 — M1 + M3: Funnel fixes + data-integriteit waarschuwing**

**Tijd:** 1u
**Files:** `server/storage.ts:361-421, 455-672`, `client/src/pages/dashboard/analytics.tsx`

**Wat:**
- Verwijder fantoom `settings_click` uit funnel.
- Voeg `dismissed` toe aan `interactions` (of definieer 2 separate metrics).
- Geef terug of `totalActions > totalViews` (data-onbalans signaal).

**Hoe:**

1. In `getAnalyticsSummary` (regel 411-420), voeg veld toe:
```ts
return {
  totalViews,
  acceptRate: ...,
  ...
  noActionRate: ...,
  dailyStats,
  countryBreakdown,
  dataIntegrity: totalActions > totalViews
    ? { warning: 'overcount', actions: totalActions, views: totalViews, delta: totalActions - totalViews }
    : null,
};
```

2. In `getAdvancedAnalytics` regel 533-541:
```ts
const funnel = {
  impressions: currentEvents.filter(e => e.eventType === 'banner_shown').length,
  activeInteractions: currentEvents.filter(e =>
    ['accept', 'reject', 'preferences_saved'].includes(e.eventType)
  ).length,
  passiveDismissals: currentEvents.filter(e => e.eventType === 'banner_dismissed').length,
  accepts: currentEvents.filter(e => e.eventType === 'accept').length,
  rejects: currentEvents.filter(e => e.eventType === 'reject').length,
  customSaves: currentEvents.filter(e => e.eventType === 'preferences_saved').length,
  dismissed: currentEvents.filter(e => e.eventType === 'banner_dismissed').length,
};
// settings_click verwijderd
// settingsClicks veld weghalen of expliciet 0 met deprecation comment
```

3. Dashboard `client/src/pages/dashboard/analytics.tsx`: voeg een `<Alert>` toe boven de pie chart als `analytics?.dataIntegrity` aanwezig is:
```tsx
{analytics?.dataIntegrity && (
  <Alert className="mb-4 border-amber-500/50">
    <Info size={16} />
    <AlertTitle>Mogelijke afwijking in cijfers</AlertTitle>
    <AlertDescription>
      Er zijn meer geregistreerde acties ({analytics.dataIntegrity.actions}) dan banner-impressies
      ({analytics.dataIntegrity.views}). Dit kan voorkomen bij ad-blockers, herhaalde keuzes of
      cross-period acties. Opt-in% is mogelijk overschat.
    </AlertDescription>
  </Alert>
)}
```

4. TypeScript types updaten in summary return type (regel 361-369) en client query type.

**Verificatie:** zie sectie 5.7.

---

#### **STAP 8 — M2: "Per impression" vs "per visitor" labels**

**Tijd:** 30 min
**Files:** `client/src/pages/dashboard/analytics.tsx`

**Wat:**
Maak in de UI duidelijk dat de getoonde percentages **per impression** zijn, niet per unieke bezoeker. Dat voorkomt verwarring bij klanten zonder dat we nu een hele dedup-laag bouwen.

**Hoe:**
1. Wijzig kaart-titels:
   - `"Total Sessions"` → `"Banner Impressions"`
   - `"Consent Rate"` → `"Accept Rate (per impression)"`
   - `"Rejection Rate"` → `"Reject Rate (per impression)"`
2. Voeg een `<Tooltip>` info-icoon toe naast elke ratio-card:
```tsx
<HoverCard>
  <HoverCardTrigger><Info size={14} className="opacity-60" /></HoverCardTrigger>
  <HoverCardContent>
    Berekend als (events / banner_shown × 100). Eén bezoeker met meerdere sessies telt meerdere keren.
  </HoverCardContent>
</HoverCard>
```
3. Update de kopregel-paragraaf onder de page-titel:
   `"Monitor your consent rates and compliance metrics."` →
   `"Monitor your consent rates per banner impression. Per-visitor metrics komen binnenkort."`

**Verificatie:** zie sectie 5.8.

---

### MIDDEL

---

#### **STAP 9 — M4: Trend-change clamp + minimum-volume gating**

**Tijd:** 20 min
**Files:** `server/storage.ts:529-531`, `client/src/pages/dashboard/analytics.tsx:166`

**Hoe:**
```ts
// server/storage.ts
const MIN_SAMPLE = 50;
let change: number | null;
if (currentPeriod.views < MIN_SAMPLE || previousPeriod.views < MIN_SAMPLE) {
  change = null; // dashboard toont "—"
} else if (previousPeriod.rate === 0) {
  change = currentPeriod.rate > 0 ? 999 : 0; // clamp at +999%
} else {
  change = Math.max(-100, Math.min(999, ((currentPeriod.rate - previousPeriod.rate) / previousPeriod.rate) * 100));
}
```
Dashboard regel 166: `const trendChange = advancedAnalytics?.trends?.change;` (kan nu `null` zijn — render "—" als null).

---

#### **STAP 10 — B8: Tijdzone uniformiseren naar UTC**

**Tijd:** 30 min
**Files:** `server/storage.ts:432-435`

**Wat:** STAP 6 fixt al de monthly counter (gebruikt UTC `YYYY-MM`). Verifieer dat de oude `getMonthlyViewsForUser` (die `setHours(0,0,0,0)` deed) helemaal vervangen is.

Daarnaast: voeg een opmerking toe in dashboard onder date-range: `"Alle tijdstempels in UTC."`

---

#### **STAP 11 — B9: `details` payload wel of niet weggooien**

**Tijd:** 20 min
**Files:** `server/banner-script.ts:617-628` óf `server/routes.ts:1492`

**Beslissing:** `categoryBreakdown` haalt zijn data uit `consent_logs.consentChoices` (regel 636-648 in storage.ts) — dat werkt. Het `details` veld in `analytics_events` is dood gewicht.

**Hoe:**
Verwijder `details` uit de POST body in banner-script (regel 624). Bespaart bytes. Geen server-side wijziging nodig — die leest het toch al niet.

---

#### **STAP 12 — B10: Zod-validatie + eventType allowlist**

**Tijd:** 20 min
**Files:** `server/routes.ts:1478-1553`

**Hoe:**
```ts
import { z } from 'zod';

const ANALYTICS_EVENT_TYPES = [
  'banner_shown', 'accept', 'reject',
  'preferences_saved', 'banner_dismissed', 'consent_updated',
] as const;

const analyticsEventSchema = z.object({
  websiteId: z.string().uuid(),
  eventType: z.enum(ANALYTICS_EVENT_TYPES),
});

// in handler:
const parsed = analyticsEventSchema.safeParse(req.body);
if (!parsed.success) {
  return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
}
const { websiteId: publicId, eventType } = parsed.data;
```

Symmetrisch voor vitals (cap LCP/CLS/INP/etc op redelijke max).

---

#### **STAP 13 — B6: Daily rollup tabel (FUNDAMENTEEL — alleen als tijd over dit weekend)**

**Tijd:** halve dag
**Files:** `shared/schema.ts`, `server/storage.ts`, nieuwe cron of insert-trigger

**Wat:**
Pre-aggregeer events naar een `analytics_daily_rollup` tabel zodat dashboard-queries niet meer rauwe events moeten scannen. Schaalt naar miljoenen events.

**Schema:**
```ts
export const analyticsDailyRollup = pgTable("analytics_daily_rollup", {
  websiteId: varchar("website_id").notNull().references(() => websites.id, { onDelete: 'cascade' }),
  date: text("date").notNull(), // UTC YYYY-MM-DD
  eventType: text("event_type").notNull(),
  country: text("country"),
  deviceType: text("device_type"),
  browser: text("browser"),
  count: integer("count").notNull().default(0),
}, (table) => ({
  pk: primaryKey({ columns: [table.websiteId, table.date, table.eventType, table.country, table.deviceType, table.browser] }),
  websiteDateIdx: index("rollup_website_date_idx").on(table.websiteId, table.date),
}));
```

**Update strategie (kies één):**
- **A. Live upsert** in `createAnalyticsEvent`: extra DB-write per event maar real-time accuraat.
- **B. Cron elke 5 min**: `INSERT INTO rollup ... SELECT ... FROM events WHERE timestamp > last_rollup ON CONFLICT DO UPDATE`. Eenvoudiger maar 5 min lag.

**Aanbeveling voor dit weekend:** **B** — minder code-impact, geen race conditions, makkelijk uit te zetten als het problemen geeft.

**Refactor:** `getAnalyticsSummary` en `getAdvancedAnalytics` lezen uit rollup-tabel met `GROUP BY` queries i.p.v. JS-aggregatie.

**Acceptatie:** dashboard-response tijd <200ms voor 90 dagen op een site met 1M events.

> **TIP:** Als je dit niet haalt dit weekend, sla over en plan voor volgend weekend. Alle hogere prioriteits-items moeten eerst.

---

### LAAG (documenteren, niet uitvoeren dit weekend)

| ID | Wat | Volgende sprint actie |
|---|---|---|
| B12 | Hash UA in `consent_logs` | Schrijf migratie + storage update |
| B13 | Cleanup expired consent logs | Cron job: `DELETE WHERE expiresAt < NOW()` |
| B14 | Hardcoded country map | Vervang door volledige ISO-3166 lib (`i18n-iso-countries`) |
| B15 | UA parsing rate-limit | Cap UA-string lengte op 512 chars vóór parser |
| M5 | Pie chart afronding | Stuur 4-decimal floats, formatter rondt visueel |
| M6 | Returning visitors zonder banner_shown | Apart "Active consent base" metric |
| M7 | "Alles aangevinkt + save" telt als custom | `effectiveAcceptRate = accepts + customSavesAllTrue` |
| M8 | `consent_updated` events onzichtbaar | Eigen "Re-consent" bucket op dashboard |

---

## 4. Volgorde voor het weekend

### Zaterdag-ochtend (3u) — KRITIEK
1. STAP 1 (B1 rate limit) — 30 min
2. STAP 2 (B3 SESSION_SECRET) — 15 min
3. STAP 3 (B2 host-check) — 30 min
4. **TUSSENTIJDSE DEPLOY + smoke test** — 30 min
5. STAP 4 (B4 server-side country) — 30 min
6. STAP 5 (B7 vitals dedupe) — 1u

### Zaterdag-middag (3u) — HOOG
7. STAP 6 (B5 atomic counter) — 2u
8. STAP 7 (M1 + M3 funnel fixes + integrity warning) — 1u

### Zaterdag-avond (1u) — review + deploy
9. **DEPLOY** alle KRITIEK + HOOG fixes
10. Productie smoke test (sectie 5)

### Zondag-ochtend (2u) — UI & MIDDEL
11. STAP 8 (M2 labels + tooltips) — 30 min
12. STAP 9 (M4 trend clamp) — 20 min
13. STAP 10 (B8 tijdzone) — 30 min
14. STAP 11 (B9 details cleanup) — 20 min
15. STAP 12 (B10 Zod validatie) — 20 min

### Zondag-middag (4u) — FUNDAMENTEEL of buffer
16. **STAP 13 (B6 daily rollup)** — als alle bovenstaande klaar én getest. Anders skip naar volgend weekend.

### Zondag-avond — final deploy + retrospective
17. **FINAL DEPLOY**
18. Documenteer LAAG-items in een follow-up issue.

---

## 5. Verificatie checklist

### 5.1 B1 Rate limiting
```bash
# Verwacht: 60 OK, daarna 429
for i in {1..70}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST https://consentease.io/api/analytics/event \
    -H "Content-Type: application/json" \
    -H "Origin: https://consentease.io" \
    -d '{"websiteId":"00000000-0000-0000-0000-000000000000","eventType":"banner_shown"}'
done | sort | uniq -c
```
Resultaat: ongeveer 60× `404` (geldige rate, ongeldige website) en 10× `429`.

### 5.2 B3 SESSION_SECRET
- Stop server lokaal, unset `SESSION_SECRET`, set `NODE_ENV=production`, start → moet meteen exit met error code 1.
- In prod: confirm via Replit secrets dat `SESSION_SECRET` gezet is. Restart deployment 2× — verifieer dat `consent_logs.ipHash` voor dezelfde test-IP **identiek** blijft.

### 5.3 B2 Host-check
```bash
# Production: zonder origin/referer = 403
curl -i -X POST https://consentease.io/api/analytics/event \
  -H "Content-Type: application/json" \
  -d '{"websiteId":"<bestaande-publicId>","eventType":"banner_shown"}'
# Verwacht: HTTP/1.1 403
```

### 5.4 B4 Server country
- Open banner in Chrome DevTools, edit response van `/api/geo` om `countryCode: 'XX'` te returnen.
- Klik accept.
- Check `analytics_events` row: `country` moet werkelijke landcode zijn (gebaseerd op IP), niet 'XX'.

### 5.5 B7 Web Vitals dedupe
- Open page in Chrome.
- Open Network-tab, filter `/api/analytics/vitals`.
- Tab wisselen 5×, terug komen.
- Wacht 90s.
- Verwacht: **exact 1** POST request (op pagehide of timeout, whichever first).

### 5.6 B5 Atomic counter
```sql
-- Voor en na een banner_shown:
SELECT count FROM monthly_view_counters
WHERE user_id = '<test-user>' AND year_month = '2026-04';

-- Stress test (concurrente requests):
ab -n 100 -c 20 -p body.json -T application/json \
  https://consentease.io/api/analytics/event
-- Verwacht: counter = oude + 100 (geen race-loss)
```

### 5.7 M1 + M3 funnel fixes
- Insert handmatig in dev: 5× `banner_shown`, 6× `accept` (forceer overcount).
- Hit `/api/websites/:id/analytics?days=14`.
- Response moet `dataIntegrity: { warning: 'overcount', actions: 6, views: 5, delta: 1 }` bevatten.
- Dashboard toont gele alert.
- `/api/websites/:id/analytics/advanced`: `funnel.activeInteractions` aanwezig, `settingsClicks` weg.

### 5.8 M2 Labels
- Bezoek `/dashboard/analytics`.
- Visuele check: kaart-titels gewijzigd, hover-tooltip op info-icoon werkt, kopregel aangepast.

### 5.13 B6 Daily rollup (als gedaan)
- Insert 10.000 events in dev DB.
- Time `getAnalyticsSummary(websiteId, 90)` voor en na refactor.
- Verwacht: van >2s naar <100ms.

---

## 6. Rollback-plan

**Per stap een afzonderlijke commit** zodat we per item kunnen reverten.

### Snelle rollback per categorie

| Probleem na deploy | Revert |
|---|---|
| Rate limit blokkeert legitime klanten | `git revert <stap-1-commit>` of zet `max` tijdelijk hoger |
| SESSION_SECRET fail-fast crasht prod | Zet env var, redeploy. NIET reverten. |
| Host-check blokkeert klanten | `git revert <stap-3>` óf zet `isProduction = false` als kill-switch |
| Server-country geeft `null` voor iedereen | Check `getCountryFromIp` errors. Tijdelijk: re-enable client country als fallback. |
| Vitals dedupe breekt vitals heelmaal | Revert STAP 5 |
| Counter blijft hangen op 0 | Check `incrementMonthlyViewCounter` returns. Backfill SQL opnieuw draaien. |
| Funnel fields breken dashboard | Revert STAP 7. Dashboard gebruikt oude shape. |
| Daily rollup geeft verkeerde getallen | Feature flag: dashboard valt terug op `getAnalyticsByWebsiteId` |

**Database migraties:** STAP 6 en STAP 13 voegen tabellen toe — dat is non-destructief, hoeft niet terug. Maar zet ze NIET als enige bron tot je 24u stabiele werking hebt gezien.

---

## 7. Definition of Done

Een stap is **DONE** wanneer:
- ✅ Code geschreven én gecommit als aparte commit met duidelijke message `analytics: <Bxx> short description`
- ✅ Verificatie uit sectie 5 succesvol uitgevoerd in dev
- ✅ Geen LSP/TypeScript errors
- ✅ Geen regressie in andere endpoints (run de bestaande integratie-checks)
- ✅ Op productie gedeployd én smoke-tested (sectie 5 maar tegen prod URL)
- ✅ `replit.md` bijgewerkt met de wijziging onder een nieuw kopje "## Analytics hardening (april 2026)"
- ✅ Eventuele follow-ups als TODO in deze plan-doc onderaan toegevoegd

**Het hele weekend is DONE wanneer:**
- ✅ Alle KRITIEK + HOOG items zijn DONE op productie
- ✅ Productie metrics 24u draaien zonder errors in deployment logs
- ✅ Dashboard toont nieuwe labels + tooltips
- ✅ `consent_logs.ipHash` voor dezelfde IP blijft consistent over restart
- ✅ Geen rate-limit-false-positives in support inbox

---

## 8. Open vragen / beslissingen voor zaterdag-ochtend

1. **`SESSION_SECRET` aanwezig in production?** — Verifieer in Replit secrets vóór STAP 2. Zo niet: genereer en zet eerst, anders crasht prod na deploy.
2. **Klanten met `referrer-policy: no-referrer`?** — Check support tickets, anders kan STAP 3 hen breken.
3. **Backfill timing voor STAP 6** — Doe dit in een maintenance window of off-peak (zondagochtend 06:00 UTC?). De UPSERT is goedkoop maar het is veel rijen.
4. **STAP 13 wel of niet dit weekend?** — Beslissen na zaterdag-avond review op basis van resterende tijd.

---

## 9. Bestanden die aangepast worden (overzicht)

```
server/
  banner-script.ts                  # B7, B9, M7
  rateLimiter.ts                    # B1
  routes.ts                         # B1, B2, B3, B4, B5, B10, M1, M3
  storage.ts                        # B5, B6, B8, M1, M3, M4
  geolocation.ts                    # B4 (mogelijk extend)
  index.ts                          # B3 fail-fast

shared/
  schema.ts                         # B5, B6 (nieuwe tabellen)

client/src/pages/dashboard/
  analytics.tsx                     # M1, M2, M4

docs/plans/
  analytics-weekend-plan.md         # dit document

replit.md                           # changelog
```

---

**Einde plan. Schrijf wijzigingen direct hieronder bij in een changelog-sectie tijdens uitvoering.**

## Changelog tijdens uitvoering

_(vul aan tijdens het weekend)_

- [x] STAP 1 B1 — 2026-05-02 — `server/rateLimiter.ts` factory uitgebreid met optionele `keyGenerator`; vier nieuwe limiters (`analyticsEventIpLimiter` 60/min/IP, `analyticsEventPublicIdLimiter` 1000/min/publicId, `analyticsVitalsIpLimiter` 30/min/IP, `analyticsVitalsPublicIdLimiter` 1000/min/publicId) toegepast op `/api/analytics/event` en `/api/analytics/vitals`.
- [x] STAP 2 B3 — 2026-05-02 — Boot-time fail-fast in `server/index.ts` als `SESSION_SECRET` ontbreekt in productie (`process.exit(1)`). `server/auth.ts` throwt nu in productie; in dev een warn + dev-only fallback. `IS_PRODUCTION` constant toegevoegd.
- [x] STAP 3 B2 — 2026-05-02 — Host-check verplicht in productie op `/api/analytics/event`, `/api/analytics/vitals`, `/api/consent/log`. Geen origin/referer in productie → 403. Random-bytes fallback voor `IP_HASH_SALT` in `server/routes.ts` throwt nu in productie.
- [x] STAP 4 B4 — 2026-05-02 — `getGeoLocation()` levert country aan server-side voor zowel events als vitals; client-`country` veld genegeerd. Banner-script stuurt het veld niet meer mee.
- [x] STAP 5 B7 — 2026-05-02 — `vitalsReported` dedupe-guard in `server/banner-script.ts`; `navigator.sendBeacon` (Blob, text/plain) met `fetch+keepalive` fallback; `pagehide` listener naast `visibilitychange`. Vitals-endpoint accepteert `text/plain` body.
- [x] STAP 6 B5 — 2026-05-02 — `monthly_view_counters` tabel toegevoegd (`shared/schema.ts`); `incrementMonthlyViewCounter()` in `server/storage.ts` doet `INSERT…ON CONFLICT DO UPDATE…RETURNING count`. `getMonthlyViewsForUser()` herschreven naar counter-lookup. Banner_shown-handler in `server/routes.ts` gebruikt atomic increment. UTC `YYYY-MM` key. `npm run db:push` gedraaid.
- [x] STAP 7 M1+M3 — 2026-05-02 — `settings_click` verwijderd uit `funnel.interactions` (nooit geëmit door live banner); `banner_dismissed` toegevoegd. `getAnalyticsSummary()` levert `dataIntegrity: { overcount, totalActions, totalViews, ratio }` wanneer acties > impressions. Dashboard rendert amber alert.
- [x] STAP 8 M2 — 2026-05-02 — Dashboard tile "Total Sessions" → "Banner Impressions"; rate-cards hebben nu duidelijke "per impression" labels en `title=` tooltips met formule (`accepts ÷ banner impressions` enz.).
- [x] STAP 9 M4 — 2026-05-02 — `trends.change` is nu `number | null`. Null wanneer vorige periode < 50 impressions OF previous rate = 0; anders geclampd naar `[-100, 999]`. Dashboard rendert "— vs prev (insufficient data)".
- [ ] STAP 10 B8 — niet gedaan (uit scope dit weekend).
- [x] STAP 11 B9 — 2026-05-02 — `details` veld verwijderd uit banner-script `trackEvent()` POST body (server persisteerde het nooit; was potentiële payload-pollution).
- [x] STAP 12 B10 — 2026-05-02 — Zod schemas `analyticsEventSchema` (eventType allowlist: banner_shown, banner_dismissed, accept, reject, preferences_saved, consent_updated) en `vitalsPayloadSchema` (per-metric range caps: lcp/inp/fcp/ttfb/bannerDelay 0..60000, cls 0..10) op beide public endpoints. Curl smoke test: `eventType=DROP_TABLE` → 400, `cls=99` → 400, geldige payload → 201.
- [ ] STAP 13 B6 — niet gedaan (optioneel, uit scope).

### Architect code-review follow-ups (2026-05-02)
- [x] **Vitals limiter publicId-key fix** — `extractWebsiteIdKey()` helper in `server/rateLimiter.ts` parseert nu zowel object- als text/plain-bodies (sendBeacon stuurt text/plain, waardoor de oude `req.body?.websiteId` op een string-body altijd `no-id` opleverde → alle beacon traffic deelde één globale bucket). Per-tenant isolatie hersteld.
- [x] **Counter drift compensation** — `decrementMonthlyViewCounter()` toegevoegd aan `IStorage` + `DatabaseStorage` (`GREATEST(count - 1, 0)`); banner_shown handler in `server/routes.ts` wraps `createAnalyticsEvent` in try/catch en doet compensating decrement bij INSERT-fout zodat de billing-counter niet boven het werkelijke event-aantal uit drift.
- [x] **Zod voor /api/consent/log** — `consentLogPayloadSchema` met `consentLogActionEnum` (accept_all, reject_all, custom, updated, banner_dismissed) en bounded `consentChoices` shape (string max 8KB OF flat record). Vervangt de losse `if (!a || !b)` check.
- [x] **Vitals dedupe drop fix** — `webVitals.lcp == null && cls == null && inp == null` check (i.p.v. `!value`) zodat legitieme `cls=0` (perfect score) en `inp=0` samples niet langer stilletjes worden weggegooid.
- Smoke tests post-fix: bad consent action → 400, valid consent → 201, vitals via text/plain → 201, vitals met alleen cls=0 → 201 recorded:true, banner_shown event → 201.
