# ConsentEase — 0-meting (baseline)

> Datum: 23 april 2026.
> Doel: harde nulmeting voordat we wijzigingen doorvoeren, zodat we de impact van elk verbeterproject objectief kunnen meten.

---

## 1. Productiedatabase — schaal & groei

Read-only snapshot van de productiedatabase.

### Volumes

| Metriek | Waarde |
| --- | --- |
| Gebruikers | **17** (12 actieve abonnementen, 0 in trial, 4 zonder abonnement) |
| Websites | **59** |
| Cookies (gedetecteerd/handmatig) | 246 |
| Diagnostic scans | 6 |
| Contact form submissions | 0 |
| Analytics events | **160.086** rows · 34 MB |
| Consent logs | **29.430** rows · 14 MB |
| Web vitals metrics | **102.482** rows · 22 MB |

> Gemiddeld ~2.700 events per website. Dit is geen "leeg testproject" — het is echte productiedata.

### Indexen op de drie zware tabellen

| Tabel | Aantal indexen | Welke |
| --- | --- | --- |
| `analytics_events` | 1 | alleen `analytics_events_pkey` |
| `consent_logs` | 1 | alleen `consent_logs_pkey` |
| `web_vitals_metrics` | 1 | alleen `web_vitals_metrics_pkey` |

**Conclusie:** elke dashboard-query op deze tabellen (group-by website, range op timestamp, filter op event_type) doet nu een **full table scan**. Bij de huidige volumes nog werkbaar, maar de groei is exponentieel zodra trials in betalend omslaan. Dit is de duidelijkste quick-win voor performance.

**Concreet ontbrekende indexen (aanbevolen):**

```sql
-- analytics_events
CREATE INDEX CONCURRENTLY analytics_events_website_id_timestamp_idx
  ON analytics_events (website_id, timestamp DESC);
CREATE INDEX CONCURRENTLY analytics_events_website_event_idx
  ON analytics_events (website_id, event_type);

-- consent_logs
CREATE INDEX CONCURRENTLY consent_logs_website_created_idx
  ON consent_logs (website_id, created_at DESC);
CREATE INDEX CONCURRENTLY consent_logs_visitor_idx
  ON consent_logs (visitor_id);

-- web_vitals_metrics
CREATE INDEX CONCURRENTLY web_vitals_website_created_idx
  ON web_vitals_metrics (website_id, created_at DESC);
```

Deze gebruiken `CONCURRENTLY` zodat ze geen lock houden tijdens runtime.

### Andere observaties

- `agency_invites` tabel bestaat maar bevat 0 rijen → flow recent gefixt, nog niet in actief gebruik.
- Stripe-tabellen (`stripe.invoices`, `stripe.subscriptions`, etc.) zijn aanwezig en gevuld — sync werkt.

---

## 2. Security scans

Drie scanners parallel gedraaid (dependency audit, SAST, privacy-dataflow).

### Dependency vulnerabilities

| Severity | Aantal | Waar |
| --- | --- | --- |
| Critical | 0 | — |
| High | 4 | 3× PyPI `mcp` (niet in productieapp), 1× **`lodash@4.17.21`** |
| Moderate | 4 | `lodash` (2×), `esbuild@0.18.20` (transitive, dev-only), `uuid@13` |

Detail per package:

- **`lodash@4.17.21`** — 1 high (CVE-2026-4800: code injection via `_.template`), 2 moderate (prototype pollution). Fix: upgraden naar `4.18.0` (minor).
  - Direct gedeclareerd in `package.json` als `^4.17.21`, **maar geen enkele import gevonden** in `client/`, `server/` of `shared/`. Twee opties: (a) verwijderen uit `package.json` als hij echt nergens gebruikt wordt — schone oplossing; (b) upgraden naar 4.18.0.
- **`esbuild@0.18.20`** — moderate, dev-server vulnerability. `package.json` wijst naar `^0.27.3`, dus de oude versie zit transitief in een dev-tool. Lockfile-rebuild nodig om hem eruit te krijgen.
- **`uuid@13.0.0`** — moderate, missing buffer bounds check in v3/v5/v6. Fix: `14.0.0` (major, breaking).
- **`PyPI/mcp@1.1.0`** — 3× high. Wordt **niet** door de productieapp gebruikt; alleen door skill-tooling (`.agents/skills/mcp-builder`). Geen actie nodig voor productie, eventueel pinnen als de tooling lokaal wordt gedraaid.

### SAST (Semgrep)

88 findings totaal: **5 HIGH, 69 MEDIUM, 14 LOW.**

Alle 5 HIGH-findings zitten **buiten de productiecode**:

| Path | Type |
| --- | --- |
| `.agents/skills/mcp-builder/scripts/evaluation.py` | Python XXE (defusedxml) |
| `.agents/skills/skill-creator/scripts/improve_description.py` | subprocess-injection-audit |
| `.agents/skills/skill-creator/scripts/run_eval.py` | subprocess-injection-audit |
| `script/deploy-build.cjs` | child_process zonder static string |

De skill-scripts zijn lokale dev-tools, geen productiepad. `script/deploy-build.cjs` wordt door deploy uitgevoerd op static input — laag risico maar het verdient een review.

### HoundDog (privacy-dataflow)

27 findings, **allemaal LOW.** Geen kritieke privacy-leaks gedetecteerd.

### Security headers (live site)

`curl -I https://consentease.io/` levert:

| Header | Waarde | Beoordeling |
| --- | --- | --- |
| `strict-transport-security` | `max-age=63072000; includeSubDomains` | ✅ goed |
| `cache-control` | `no-cache, no-store, must-revalidate` | ⚠️ correct voor SSR-meta, maar geen CDN-cache |
| `content-security-policy` | **ontbreekt** | ❌ aanbevolen toe te voegen |
| `x-frame-options` | **ontbreekt** | ❌ clickjacking-risico op login/dashboard |
| `x-content-type-options` | **ontbreekt** | ❌ aanbevolen `nosniff` |
| `referrer-policy` | **ontbreekt** | ❌ aanbevolen `strict-origin-when-cross-origin` |
| `permissions-policy` | **ontbreekt** | ❌ aanbevolen restrictieve set |

Quick-win: `helmet` middleware aanzetten met sensible defaults; CSP per-route iets soepeler voor pagina's die externe scripts laden (Stripe, fonts).

---

## 3. Live site — eerste indrukken

Live URL: **https://consentease.io** — HTTP 200, response 277 ms, 4.5 KB HTML, served via Google Frontend (Replit autoscale).

### Bevestigde sterke punten
- Server-side meta-tags worden correct geserveerd.
- HSTS aan, HTTP/2, alt-svc voor HTTP/3.
- `noscript`-fallback met content + navigatie aanwezig.
- `gtag("consent", "default", ...)` staat **vóór** GTM — Google Consent Mode v2 correct geïmplementeerd.
- Eigen banner-script wordt geladen via `publicId = "sa003"` — dogfooding bevestigd.
- Robots.txt is netjes opgesteld (Allow voor Googlebot/Bingbot op `/api/consent/`).
- Sitemap.xml bevat **50 URLs** en is geldig XML.

### Gevonden bugs op de live site

#### 🐛 1. Verkeerde domain in OG/Twitter image meta-tags

```html
<meta property="og:image"      content="https://Consentease-saerens.replit.app/opengraph.jpg" />
<meta name="twitter:image"     content="https://Consentease-saerens.replit.app/opengraph.jpg" />
```

Twee problemen:
1. **Domein is `Consentease-saerens.replit.app`** in plaats van `consentease.io`. De afbeelding is op beide bereikbaar, maar social platforms (Slack, X, LinkedIn) tonen het apex-domein bij voorbeeld in previews — `replit.app` ondermijnt branding en vertrouwen.
2. **Hoofdletter in domein** (`Consentease-`). Veel parsers zijn case-sensitive op host-niveau, hostnames horen lowercase.

Quick fix: `og:image` en `twitter:image` URL's vervangen door `https://consentease.io/opengraph.jpg`.

#### 🐛 2. Hardcoded `og:image` naar root, niet per-page

Alle pagina's lijken dezelfde og:image te delen (bevestigen op `/pricing`, `/scan`, `/blog/*`). Voor compare/blog/solutions-pagina's is een dynamic OG-image (Vercel-style of via de aanwezige `vite-plugin-meta-images.ts`) een groot conversie- en CTR-voordeel.

#### 🐛 3. `cache-control: no-cache, no-store, must-revalidate` op alle HTML

Voor SSR-meta-injection nodig om verse meta te garanderen, maar dit verhindert ook edge-caching van publieke pagina's. Suggestie: voor publieke routes een korte `s-maxage=300, stale-while-revalidate=600` toestaan; voor `/login` / `/dashboard/*` no-cache laten.

---

## 4. Wat er niet kon worden gemeten (en waarom)

| Item | Reden |
| --- | --- |
| Volledige squirrelscan website-audit | `squirrel` CLI niet geïnstalleerd in Replit Nix-omgeving. Alternatief: handmatige rule-by-rule audit via curl + browser; of CLI lokaal installeren en toelaten in `.replit` packages. |
| Lighthouse / Core Web Vitals | Vereist headless Chrome met Lighthouse-runner — kan via puppeteer-script lokaal, niet in deze sessie meegenomen. |
| Google Search Console data | Geen toegang tot de Search Console van consentease.io. Voor SEO-prioritering wezenlijk — vraag aan eigenaar of API-token beschikbaar is. |
| Bundle-size analyse frontend | Vergt `npm run build` + visualizer. Niet uitgevoerd om geen wijzigingen te triggeren. |

Aanbeveling: voor een volwaardige tweede 0-meting zouden we (a) Lighthouse via een eigen puppeteer-script draaien, (b) Search Console-toegang regelen, en (c) `npm run build -- --report` draaien.

---

## 5. Top-5 quick wins op basis van deze meting

Gerangschikt op (impact × eenvoud):

1. **OG/Twitter image-URL fixen** — 1 regel server-side, directe verbetering social-share-visibility.
2. **Database-indexen toevoegen** op `analytics_events`, `consent_logs`, `web_vitals_metrics` — enkele `CREATE INDEX CONCURRENTLY` statements, voorkomt slow-down naarmate gebruikers groeien.
3. **`helmet` middleware** met basis CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy — ~10 regels in `server/index.ts`, dekt 4 ontbrekende security-headers.
4. **`lodash` opruimen** — verwijderen uit `package.json` als ongebruikt (geen imports gevonden), of upgraden naar `4.18.0`. Lost 3 CVE-meldingen op.
5. **Cache-control voor publieke routes verfijnen** — `s-maxage` op marketing-pagina's. Nul risico voor SEO, betere TTFB.

---

## 6. Volgende stap

Met deze meting kunnen we de fases uit `PROJECT_REVIEW.md` herprioriteren. Mijn voorstel:

- **Eerst Fase 1 (Foundation hardening)** met de 5 quick wins hierboven als eerste batch — meetbaar, omkeerbaar, lage impact.
- Daarna een opgesplitste Fase 1B: refactor van `routes.ts` en `storage.ts` (groter, meer risico, eigen review).
- Pas dan Fase 2/3 (embed-script kwaliteit, marketing-site).

Wil je dat ik de quick wins uit deze sectie als één werkpakket oppak (in build-mode), of liever eerst per item bevestigen?
