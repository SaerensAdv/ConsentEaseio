# Project Autopilot — ConsentEase Connect

> **Compliance-as-Code for the AI-built web.**
> The agent-native consent layer that ConsentEase runs alongside (and eventually around) its current CMP.

---

Version: 1.2
Last updated: 2026-06-27
Status: Approved — Phase 1 confirmed
Owner: Founder (Driver)
Document type: Product Concept / PR-FAQ (Amazon "Working Backwards")

### Changelog
| Version | Date | Author | Change summary |
|---------|------------|--------|----------------|
| 1.0 | 2026-06-27 | Founder + Agent | Initial concept draft |
| 1.1 | 2026-06-27 | Founder + Agent | Resolved open questions; added real production baseline; locked sub-brand, global launch, 3–4 h/week ceiling |
| 1.2 | 2026-06-27 | Founder + Agent | Bootstrapped budget (build + non-paid marketing, no ad spend); external legal deferred & revenue-funded; Phase 1 scope (two P0s) confirmed |

---

## 0. How to read this document

This is a **concept document**, not a build spec. It exists to enable one decision:

> **Go / no-go on building ConsentEase Connect as a serious product, and the phased repositioning of ConsentEase around it.**

It is written in the **Amazon "Working Backwards" PR/FAQ** format — we write the launch announcement *before* we build, because if the announcement is boring or we can't articulate the customer benefit, the product probably isn't worth building. The PR/FAQ is followed by the strategy, architecture, operating model, pricing, go-to-market, roadmap, metrics, risks and an explicit list of open questions.

**Founder inputs captured (2026-06-27):**
- Ambition level: **Serious bet** — build as a real product/platform, accept more upfront work.
- Investment: **Willing to invest** if the business case holds (envelope TBD).
- Relationship to current CMP: **To be decided in this document** → see §6, recommendation is **phased repositioning**.
- Ultimate goal: **maximize passive income** + genuinely help people, as a **one-man company** that pays well monthly **without "too much" ongoing work**, supported by **autonomous agents** for maintenance, improvement, customer support, and global consent-news tracking.

**Resolved (v1.1–v1.2):**
- **Time ceiling:** 3–4 hours/week on ops + approvals. This is a hard constraint — the automation must absorb everything else (see §7).
- **Geographic scope:** **global launch** (compliance *claims* sequenced EU + US-GPC first — §10).
- **Brand:** **ConsentEase Connect is a sub-brand** — a distinct dev/agent-facing identity under the ConsentEase parent.
- **Budget:** **bootstrapped** — pay for *building* + producing *non-paid (organic/owned) marketing material* only. **No paid advertising / acquisition.** This fits the strategy: our distribution is free listings + content + partnerships, not ad spend (§13).
- **Legal advisor:** the proposed review is **3rd-party (external, on-call)**, not an internal hire. No budget to engage now → **deferred and revenue-funded** (engage once Connect revenue can pay for it, or at the first non-EU/US jurisdiction-specific claim — whichever first). Bridge in the meantime: conservative claim wording + compliance-watch agent + founder approval (§7).
- **Phase 1 scope:** **confirmed** — start with the two P0s (API-key auth + `/api/v1`, then the MCP server) before anything else (§13).
- **Baseline data:** pulled from the production database — see §9.

---

## 1. The one-line strategy

We are **not** building "another CMP with an API." Every major CMP already has one. We are building **the consent layer that AI website builders and coding agents install automatically** — because the sites they generate today ship with fake cookie banners that are silently illegal, and that legal risk currently lands on nobody and everybody.

Our wedge is **distribution through the AI-build stack**, our moat is **verifiable, self-proving compliance + the data record**, and our business model is **usage-based revenue that scales with the volume our agent-native distribution brings in**.

---

# PART A — PRESS RELEASE (Working Backwards)

*Written as if it is launch day. Strict 1 page.*

## ConsentEase announces **Connect**: make any AI-built website truly GDPR-compliant in one command

**Subhead:** Connect gives AI website builders and coding agents a single API and MCP server to install real consent — script-blocking, audit-grade consent records, and Google Consent Mode v2 — on any site, in seconds, with proof.

**Ghent, Belgium — [launch date].** Today ConsentEase launched **Connect**, an agent-native consent layer for the new generation of websites built by AI tools like Replit, Lovable, Cursor, v0 and Bolt.

The problem: AI tools now build a professional website from a single prompt in minutes — but they don't build *compliance*. They generate a cookie banner that looks right but does nothing: analytics, advertising and social scripts fire **before** the visitor consents, which violates the EU ePrivacy Directive and GDPR. The result is millions of new sites that are silently non-compliant, with the legal exposure sitting unseen on the site owner — and, by association, on the platform that built it.

Existing consent tools were built for a human who logs into a dashboard and clicks through a wizard. That model breaks when the *builder is an AI agent*. There was no clean way for an agent to install and configure real consent as part of generating a site.

ConsentEase Connect fixes this. Through one API call — or one MCP tool the coding agent calls on its own — Connect scans the site for trackers, blocks non-essential scripts until consent, wires up Google Consent Mode v2, records each consent choice with a tamper-evident timestamp, and honors browser-level privacy signals (GPC). When a regulator or auditor asks "prove it," the site owner has a real record instead of a screenshot of a banner.

"I shipped a client site with Lovable in an afternoon and forgot consent entirely until Connect flagged it and fixed it in one command," said an early agency user. "I went from 'probably illegal' to 'auditable' without opening a dashboard."

Connect is **free to install and discover** — it is listed in the major MCP registries and works as a Lovable connector and a Replit template — and **priced on usage** (monthly views / consent events), so cost scales with the value delivered, not with the number of times an agent calls it.

"AI can build your website. Until now it couldn't manage your consent," said the ConsentEase founder. "Connect makes compliance something an agent just *does*, like wiring up a database — and it proves it afterward."

**Get started:** add the ConsentEase MCP server to your coding agent, install the npm package, or call the REST API. Free to start at `consentease.com/connect`.

---

# PART B — INTERNAL FAQ

*Every hard question a serious investor or co-founder would ask.*

**Q: Why won't Usercentrics, Cookiebot or Iubenda just crush this? They already have APIs.**
They have APIs aimed at *enterprises and agencies integrating a CMP into existing products* — a human-operated, dashboard-first world. None of them is positioned as "the thing your AI builder installs for you." Usercentrics has moved on the *AI-governance* angle (it acquired **MCP Manager** in Jan 2026 — a gateway that governs how enterprise AI agents access data), which is a **different problem**: governing AI access to data, not installing consent on a generated site. The SMB / indie / agency builder who ships via Replit/Lovable/Bolt is **unserved** by all of them. Incumbents are structurally slow here because their whole product and sales motion is built around the GUI install. That's our window — but it is a window, not a fortress, so speed matters (see Risks).

**Q: Isn't "the cookie banner" a dying asset? The EU Digital Omnibus wants to kill banners.**
Yes — and that is *why we deliberately do not bet on the banner*. The November 2025 Digital Omnibus explicitly targets "consent fatigue and the proliferation of cookie banners," pushing toward **browser-level consent signals** (the specific Article 88b was dropped from the Council position on 18 June 2026, but the direction of travel is clear). Meanwhile **Global Privacy Control (GPC)** is already legally binding in 12+ US states. Our product is built around **consent signals, enforcement and proof** — honoring GPC/browser signals and enforcing server-side — so as banners shrink, we are on the correct side of the regulation, not the wrong one. The banner is just one renderer of a consent decision; the value is the decision, the enforcement and the record.

**Q: What is the bill of materials / what do we actually build?**
~80% of the primitives already exist in the current ConsentEase codebase:
- Public, `publicId`-based ingestion endpoints (today: analytics events, consent logs) — already a de-facto public write path.
- Atomic usage metering (`monthly_view_counters`) — the meter usage-based pricing needs.
- Plan-limit enforcement, scanning, embed-script generation, Google Consent Mode v2.
- An OpenAI client + the Iris assistant (no tool-calling yet).
What is genuinely **new**: (1) programmatic auth (API keys/tokens — the real missing piece, there is none today), (2) a clean public API surface over the existing business layer, (3) an **MCP server** wrapping that same layer, (4) per-key rate limiting + usage records, (5) headless consent recording with preserved audit integrity.

**Q: Can a genuine one-man company actually operate this?**
Yes — *if* the operating model is designed for it from day one (see §7). The plan is an **autonomous-operations layer**: agents handle support triage, monitoring, dependency/security maintenance, marketing content, and global consent-news watching. The non-negotiable exception is **legal/compliance sign-off**: an agent may *draft* a regulatory update or a new cookie classification, but a human must *approve* anything that changes what we tell customers is compliant. That keeps liability sane while keeping day-to-day effort low. Honest caveat: "passive" here means "low recurring effort," not "zero effort" — compliance is a trust business and trust needs a human name behind it.

**Q: What's the failure mode?**
Three:
1. **Agents don't reach for us.** Listing ≠ adoption. If coding agents don't actually choose our MCP tool, distribution dies. Mitigation: be the *highest-quality, best-described, security-scanned* listing, seed it in real templates, and make the one-command experience flawless.
2. **A platform builds basic consent itself.** They can build a banner; they won't want compliance *liability*. We lean into "we remove your liability." Still a real risk if they partner with an incumbent first → move fast on listings before formal partnerships.
3. **Headless audit integrity erodes trust.** If customers post their own consents via API, we are no longer the observer of the banner interaction — weakening proof value. Mitigation: cryptographically signed, append-only records + a verifiable "ConsentEase-observed" tier vs. a "customer-attested" tier.

**Q: How does this run alongside the current CMP without forking the product?**
One business layer (`IStorage`), three entrypoints: the existing **dashboard session**, the new **API key**, and the new **MCP server**. No second implementation, no drift. See §5.

**Q: Why now?**
The AI-website-builder market was ~$3.17B in 2023 and is projected at ~$31.5B by 2030 (~27% CAGR); AI builders' share of the website-builder market roughly doubled (≈11% → ≈23.6%) between 2022 and 2024. The MCP ecosystem crossed ~9,400 servers by April 2026 with ~97M monthly SDK downloads. The distribution rails (MCP registries, Lovable connectors, Replit Partner Program, Vercel Marketplace) exist *now*, and the "AI builds illegal sites" narrative is being written by competitors *right now* (iubenda, kukie). The window is open and dated.

**Q: What does success look like in 12 months?**
See §9 (metrics). Headline: a meaningful share of new Connect-managed sites arriving through agent/MCP channels, recurring usage-based revenue covering full autonomous-ops cost with margin, and at least one formal platform partnership in motion.

---

# PART C — STRATEGY & DESIGN

## 2. Market & "why now" (evidence)

| Signal | Implication for us |
|---|---|
| AI builders ship banners that don't block scripts (iubenda, kukie, 2026) | The core pain is real, public, and **named by competitors** — we don't have to educate the market on the problem. |
| EU Digital Omnibus (Nov 2025) → browser-level signals; GPC legally binding in 12+ US states | Bet on **signals + enforcement + proof**, not on the banner UI. |
| 3rd-party cookies gone from Chrome; adblockers intercept 40%+ of sessions | Value shifts to **server-side consent enforcement** + first-party data. |
| MCP ecosystem ~9,400 servers, ~97M monthly SDK downloads (Apr 2026); "the bottleneck is discovery, not the protocol" | Listing is free and open; **quality + discoverability** is the work. |
| Usercentrics acquired MCP Manager (Jan 2026) | Enterprise AI-governance is taken; **SMB/indie agent-native install is open**. |

## 3. Alternatives & competitive landscape

| Alternative | How users solve consent today | Key weakness we exploit |
|---|---|---|
| **Cookiebot / Usercentrics** | Dashboard wizard; API for enterprise/agency integration; priced by subpages/sessions | Built for human GUI install; not the thing an *agent* reaches for; SMB-unfriendly pricing/complexity |
| **Iubenda / Termly / CookieYes / Osano** | Drop-in script + dashboard; some APIs | Same human-first model; "compliance" stops at the banner, weak on agent-native install + proof |
| **Open-source (Klaro, Segment, ConsentStack)** | Self-hosted npm banner | No managed scanning, no audit record, no consent-mode mgmt, no support — a component, not a system |
| **AI builders' own banners (Lovable/Bolt/Wix AI…)** | Generated banner component | Doesn't block scripts, no records, no signaling — **silently non-compliant** |
| **Status quo (do nothing)** | Ship the fake banner, hope | Legal exposure under ePrivacy/GDPR; no proof in an audit |

**White space:** *agent-native install + self-proving compliance for the SMB/indie/agency AI-build segment.* No incumbent owns it.

## 4. The product: ConsentEase Connect

Three surfaces over one consent engine:

1. **REST API** — programmatic CRUD over sites, banners, cookies; read access to consent records & analytics; consent recording for headless/mobile/custom stacks. Authenticated by **API keys** (the missing primitive).
2. **MCP server** — the same capabilities exposed as tools a coding agent calls autonomously: `scan_site`, `enable_consent`, `configure_banner`, `get_embed_snippet`, `get_compliance_report`, `record_consent`. This is the distribution wedge.
3. **Headless consent** — own-your-UI consent logic + tamper-evident records + GPC/signal honoring + Consent Mode v2, for stacks where there is no script to drop.

**Positioning line:** *"AI builds your site in minutes. We make it truly GDPR-compliant in seconds — and prove it."*

## 5. How it runs alongside the current setup (architecture)

The governing rule: **one business layer, three entrypoints, no forked logic.**

```
                       ┌─────────────────────────────┐
   Dashboard (session) │                             │
   ───────────────────▶│                             │
                       │     IStorage / services      │
   API key  ──────────▶│  (scan, consent engine,      │──▶ PostgreSQL
   (REST)              │   embed gen, consent mode,    │
                       │   usage metering, records)    │
   MCP server ────────▶│                             │
   (agent tools)       │                             │
                       └─────────────────────────────┘
```

- The **existing dashboard CMP keeps working unchanged** — it becomes "the human entrypoint."
- **New** thin layers only: an API-key auth middleware, a versioned `/api/v1/*` surface, and an MCP server — all calling the *same* `IStorage` methods the dashboard already uses.
- **New data:** `api_keys` (hashed, scoped, rate-limited), `usage_records` (reuse the `monthly_view_counters` pattern), and a generalized, signed `consent_records` path for headless attestation.
- **Metering already exists** → usage-based pricing plugs into `monthly_view_counters`.

This means the new product is **additive and low-risk to the current revenue**: nothing in the existing CMP has to break for Connect to ship.

## 6. Recommendation: alongside vs. reposition → **phased repositioning**

You left this open. My recommendation, given "serious bet" + investment-ready:

- **Phase 1 (Now): run strictly alongside.** Connect is an additive product/channel. The current CMP keeps generating cash and de-risks the bet. **Branding decision (locked):** Connect ships as a **sub-brand** — "ConsentEase Connect," a distinct dev/agent-facing identity (own landing page, docs, registry listings, voice) under the ConsentEase parent. This lets us speak "Compliance-as-Code" to developers without confusing the existing SMB dashboard audience, while keeping one company, one engine, one billing relationship.
- **Phase 2 (Next): tilt the identity.** As agent-native distribution proves out, make "Compliance-as-Code for the AI-built web" the *primary* marketing identity. The dashboard CMP becomes "the human-facing view of the same engine."
- **Phase 3 (Later): reposition fully** *if and only if* the flywheel (agent installs → usage revenue → partnerships) outperforms the legacy self-serve CMP. Keep the CMP as a first-class entrypoint; never throw away working revenue to chase a narrative.

**Why phased:** it captures the upside of the serious bet without betting the existing business on an unproven channel, and it matches a one-man operation's risk profile. Decision gates between phases are in §9.

## 7. The autonomous one-man operating model ("Autopilot")

This is how the company pays well monthly without "too much" work. Design principle: **agents propose, the founder approves the high-stakes 5%.**

| Agent role | What it does | Autonomy | Human gate |
|---|---|---|---|
| **Support agent** | Iris + tool-calling: answers users, can act on accounts (re-scan, fix config, explain compliance), triages & escalates | High for info & safe actions | Refunds, account deletion, legal advice → founder |
| **Compliance-watch agent** | Monitors consent/privacy news across continents (EU, US states, LATAM, APAC), drafts updates to cookie DB, banner templates, docs | Draft-only | **Every** change to what we claim is compliant → founder approves |
| **Maintenance/monitoring agent** | Watches errors/logs, dependency & security updates, uptime, runs security scans | High for detection, PR-drafting | Merging prod changes → founder/code-review |
| **Growth agent** | Marketing content, programmatic SEO, partner-outreach drafts, registry-listing upkeep | High for drafts | Publishing & outreach sends → founder |
| **QA / code-review agent** | Reviews changes before merge | High | Final merge → founder |

**Honest constraint:** compliance is a *trust and liability* business. Full automation of legal sign-off is not responsible — a human name must stand behind compliance claims. The founder's ceiling is **3–4 hours/week** for approvals + relationships. That is achievable, but only if the automation is genuinely aggressive and approvals are *batched* (a weekly review session, not a steady drip). Anything that can't be made safe within that budget gets deferred, not half-done.

> ⚠️ **Flagged tension (must resolve before global compliance claims).** Three v1.1 inputs collide: **global launch** + **no legal advisor yet** + **3–4 h/week**. Telling customers worldwide "you are compliant" across many jurisdictions, with sign-off resting solely on a founder who has ~3 h/week, concentrates real legal liability on one person. Two ways to defuse it (not mutually exclusive):
> 1. **Sequence the geography inside the global ambition** — launch the *product* globally, but only make *jurisdiction-specific compliance claims* for EU + US-GPC first (where the rules are clearest), and let the compliance-watch agent expand the claim set jurisdiction-by-jurisdiction as it builds verified coverage. Elsewhere, position as "consent management + records," not "guaranteed compliant."
> 2. **Add on-call/part-time *3rd-party* legal review (revenue-funded), not an internal hire.** There is no budget to engage one now, which is acceptable for Phase 1. The trigger to engage is **revenue-gated**: once Connect's usage revenue can fund it, OR at the first non-EU/US jurisdiction-specific claim — whichever comes first. Until then the bridge is: conservative claim wording (default to "consent management + records," reserve "compliant" for EU/US-GPC), the compliance-watch agent sourcing every claim, and founder sign-off. Revisit at the Phase 1→2 gate, because the claim surface grows fastest exactly when global traffic arrives.

**Governance artifacts to create:** an approval queue (reuse the agent-inbox concept), an audit log of agent actions, and a "compliance change" checklist the watch-agent must fill before a human approves.

## 8. Pricing

- **Model:** usage-based **hybrid** — low base + tiered monthly views / consent events, with overage. *Not* per-API-call (punishes good integration, too small to meter meaningfully).
- **Why it fits:** value scales with traffic/consent volume, which `monthly_view_counters` already measures; predictable enough for SMBs (a pure usage model scares them), elastic enough to capture upside.
- **Connect/MCP layer:** **free to install & discover** — it is the acquisition channel. We monetize the *volume* it brings, not the calls.
- **Tiers (directional, to validate):** Free (low views, ConsentEase badge) → Pro (usage tiers, white-label) → Agency (multi-client, API volume). Validate willingness-to-pay before locking numbers.
- Use the `pricing-strategy` and `monetization`/`stripe` skills to finalize; Stripe is already the billing source of truth.

## 9. Success metrics & decision gates

Trace every initiative to one of these. *(Baseline now filled from production — see below. Remaining ▢ are forward-looking new-channel targets to set once the channel produces its first data.)*

**North-star:** monthly recurring usage revenue from Connect-managed sites.

### Baseline — production data (2026-06-27, real users, demo accounts excluded)

| Dimension | Value | Read |
|---|---|---|
| Real users | 20 | Small but real customer base |
| Active subscriptions | 12 active, 1 trialing, 1 past_due, 6 none | ~13 live paying/trial relationships |
| Plan mix | solo 12 · agency 4 · pro 2 · agency_pro 1 · business 1 | Solo-heavy; agencies already present (good for the agency wedge) |
| Managed websites | 63 across 19 owners (42 compliant, 21 pending) | Real multi-site usage; ~1/3 not yet compliant |
| Monthly views (meter) | May 73.0k · Jun 45.4k (≈6 active view-generating users) | The usage-billing meter already works; volume concentrated in a few accounts |
| Consent events logged | 87.2k total · 25.9k in last 30 days | Genuine consent volume — the audit-record asset is real |
| Banner/event traffic trend | Apr 379k → May 200k → Jun 68k events | **Declining** — the product is effectively idle/flat right now |
| Agencies | 4 active · 6 client relationships | Small agency footprint to lean on |

**What the baseline means for this bet:** the existing business is small and currently *flat-to-declining*. That is the honest case *for* the pivot, not against it — staying the course trends toward zero. But it also means **the existing user base is too small to be the "Reach" for new initiatives.** Reach must come from the new agent/MCP channel. RICE "Reach" below is therefore a forward-looking channel assumption, not an extrapolation of today's 20 users.

| Metric | Phase-1 target (directional) | Why it matters |
|---|---|---|
| % of new sites arriving via agent/MCP channel | ≥ 20% | Proves the distribution wedge is real |
| Connect-managed sites (active) | ▢ | Top-of-funnel for usage revenue |
| Activation: site → real consent enabled (scan+block+record) | ≥ 60% | Proves the one-command promise works |
| MRR from usage-based billing | ≥ autonomous-ops cost × 2 | The passive-income test |
| Founder hours/week on ops | ≤ 3–4 h/week | The "without too much work" test |
| MCP listing → install conversion | ▢ | Discoverability quality |

**Gate Phase 1 → 2:** agent channel ≥ 20% of new sites AND activation ≥ 60%.
**Gate Phase 2 → 3:** Connect usage revenue growth > legacy CMP growth for 2 consecutive quarters.

## 10. Non-goals (load-bearing — what we are explicitly NOT building)

- **Not** an enterprise AI-data-governance gateway (that's Usercentrics MCP Manager's game).
- **Not** a per-API-call metered product.
- **Not** a rip-and-replace of the existing dashboard CMP (it stays a first-class entrypoint).
- **Not** a fully-automated legal/compliance sign-off (human gate stays).
- **Not** chasing enterprise procurement/sales motions in Phase 1 (SMB/indie/agency self-serve first).
- **Not** building our own AI website builder.
- **Not** making jurisdiction-specific "guaranteed compliant" claims everywhere at once, despite the global launch. The *product* ships globally; the *compliance claim set* expands jurisdiction-by-jurisdiction (EU + US-GPC first), gated on verified coverage from the compliance-watch agent (see §7 tension).

## 11. Risks & mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| Agents don't choose our MCP tool | High | Best-in-class listing/description, security-scanned, seeded templates, flawless one-command UX |
| Incumbent partners with a platform first | High | Ship listings now (no permission needed); move on partnerships only after traction |
| Platform builds basic consent itself | Med | Position on *liability removal* + proof, not the banner |
| Headless audit integrity / trust erosion | Med | Signed append-only records; "observed" vs "attested" tiers |
| Regulatory whiplash (Omnibus shifts) | Med | Build around signals/enforcement so banner changes don't break the model; compliance-watch agent |
| One-man bottleneck on approvals | Med | Tight approval queue, ruthless automation of the safe 95% |
| Over-reliance on one channel | Med | Multi-registry + multi-builder presence |

## 12. Prioritization (RICE — confidence-weighted)

*Effort = T-shirt. Reach is a forward-looking new-channel assumption — the existing 20-user base (see §9 baseline) is too small to drive these, so Reach reflects the agent/MCP channel we're betting on, not current analytics. Treat as sequencing guidance, not gospel.*

| Initiative | Reach | Impact | Confid. | Effort | Priority |
|---|---|---|---|---|---|
| API-key auth + `/api/v1` surface (the unlock) | High | 3 | 90% | M | **P0** |
| MCP server (PoC → public) wrapping existing engine | High | 3 | 80% | M | **P0** |
| One-command install + registry/Lovable/Replit listings | High | 3 | 70% | M–L | **P1** |
| Usage-based billing wiring (Stripe + counters) | Med | 2 | 85% | M | **P1** |
| Self-proving compliance report + signed records | Med | 3 | 70% | L | **P1** |
| Autonomous-ops layer (support+watch+maint agents) | Med | 2 | 60% | L | **P2** |
| GPC/browser-signal honoring + server-side enforce | Med | 2 | 70% | L | **P2** |
| Headless consent (mobile/custom stacks) | Low–Med | 2 | 60% | L | **P3** |

## 13. Roadmap (Now / Next / Later)

**Theme:** Become the consent layer AI builders install by default.

**Budget & GTM constraint (v1.2):** bootstrapped — spend covers *building* and producing *non-paid marketing material* only; **no paid acquisition.** This is a feature, not a limitation: the entire distribution thesis is *owned/earned* — free MCP-registry listings, a Replit template, Lovable connector, developer docs, SEO/content (growth agent), and partnerships that cost time, not ad budget. If a step in this roadmap secretly depends on paid ads to work, it's the wrong step.

### Now (committed, in flight)
| Initiative | Goal link | Success metric |
|---|---|---|
| API-key auth + `/api/v1` | distribution wedge | external app can manage a site via key |
| MCP server PoC (wraps scan+enable+embed+consent-mode) | distribution wedge | agent makes a site compliant in one command |

### Next (committed, not started)
| Initiative | Why now | Dependency |
|---|---|---|
| Public MCP listings + one-command install + Replit template | discovery is the bottleneck | MCP server PoC |
| Usage-based billing | monetize the channel | API surface |
| Self-proving compliance report | the moat (proof) | consent records |

### Later (directional)
- Autonomous-ops agents (support, compliance-watch, maintenance) → the passive-income engine
- GPC/browser-signal + server-side enforcement → future-proofing
- Formal partnerships (Replit Partner Program, Vercel Marketplace) → after traction
- Headless consent for mobile/custom stacks

## 14. Stakeholders (DACI — solo-adapted)

| Role | Who | Responsibility |
|---|---|---|
| Driver | Founder | Owns this doc, drives decisions |
| Approver | Founder | Final go/no-go (and all compliance sign-off) |
| Contributors | Agent (research/build/ops), future legal advisor, design help | Input, drafts, reviews |
| Informed | Prospective platform partners, early users | Kept in loop |

## 15. Open questions

### Resolved (v1.1, 2026-06-27)
1. ~~Time floor~~ → **3–4 h/week** ceiling (drives the automation aggressiveness in §7).
2. ~~Legal cover~~ → **not yet.** Acceptable for Phase 1; **revisit at the Phase 1→2 gate** (the claim surface grows fastest as global traffic arrives — see §7 tension).
3. ~~Reach numbers~~ → **pulled from production** and folded into the §9 baseline.
4. ~~Geographic scope~~ → **global launch**, with compliance *claims* sequenced EU + US-GPC first (§10 non-goal).
5. ~~Brand~~ → **ConsentEase Connect as a sub-brand** (§6).

### Resolved (v1.2, 2026-06-27)
6. ~~Budget envelope~~ → **bootstrapped**: build costs + non-paid (organic/owned) marketing material only, **no paid acquisition** (§13).
7. ~~Legal-review trigger~~ → **3rd-party, revenue-funded, deferred.** Engage once Connect revenue can fund it, or at the first non-EU/US jurisdiction-specific claim — whichever first; conservative claim wording as the bridge (§7).
8. ~~Phase-1 scope~~ → **confirmed.** Start with the two P0s: API-key auth + `/api/v1`, then the MCP server (§13).

### Still open
*None — all concept-level questions resolved. Next decision is operational: approve a concrete Phase-1 build sequence (tickets) when ready.*

---

# Appendix A — Replit skills & tooling map (skill-finder)

What we'll lean on to build and operate this, by phase:

| Goal | Primary skill(s) | Why |
|---|---|---|
| Build API + MCP + data model | core agent build, `database`, `integrations`, `environment-secrets` | API-key store, schema, secrets |
| Usage-based billing | `monetization` → `stripe`, `pricing-strategy` | Stripe already source of truth |
| Autonomous ops agents | `delegation`, `agent-inbox`, `deep-research`, `web-search` | support/watch/maintenance + approval queue |
| Compliance-news watching | `deep-research`, `web-search` | multi-source, cited, scheduled |
| Go-to-market & content | `content-machine`, `marketing-ideas`, `programmatic-seo`, `seo-audit` | listings, SEO pages, outreach drafts |
| Quality & safety before ship | `testing`, `security_scan`, `threat_modeling`, `code_review`, `validation` | trust/compliance product needs this |
| Deploy & operate | `deployment`, `workflows`, `diagnostics` | publish + monitor |
| Deeper competitive scan | `competitive-analysis`, `deep-research` | feature-by-feature gap map |

# Appendix B — Sources (selected, 2025–2026)

- iubenda — "AI can build your website. It can't manage your consent."
- kukie.io — AI website builders & cookie consent (2026 guide)
- EU Digital Omnibus coverage — Osborne Clarke, Taylor Wessing, iubenda (browser-level signals); Article 88b removed from Council position 18 Jun 2026
- Global Privacy Control — globalprivacycontrol.org; Clym (12+ US states)
- Usercentrics — MCP Manager acquisition (press, Jan 2026)
- MCP registries & discovery — modelcontextprotocol registry, mcp.so, Smithery, cursor.directory; TrueFoundry, RoxyAPI (2026)
- Replit Partner Program — replit.com/partners; Series D / $9B (Mar 2026)
- Lovable integrations (App/Chat connectors, MCP) — docs.lovable.dev
- Vercel Marketplace in v0 — vercel.com/changelog
- Market size — AI website builder ~$3.17B (2023) → ~$31.5B (2030)
