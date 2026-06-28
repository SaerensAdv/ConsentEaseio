# ConsentEase — Live Demo Call Script

**Audience:** Agencies, freelance web devs, end-customer SMBs
**Length target:** 20–30 minutes total
**Goal of every call:** Either (a) start a free trial today, or (b) book a follow-up with a clear next step

This is a **default script**. Adapt the order if the prospect drives the conversation a different way — but make sure every section gets covered before the close.

---

## 0 · Pre-call prep (5 min before the call)

Do this every time, no exceptions. It's the difference between a good demo and a forgettable one.

**Research the prospect:**
- Visit their website in an incognito window
- Note their current consent banner (if any) — provider, look, behaviour
- Note their stack from the page source (WordPress, Shopify, custom, Webflow, etc.)
- If they're an agency: scan 1–2 of their client sites too

**Have these tabs open in this exact order (left → right):**
1. Their website (incognito, devtools open on Application → Cookies)
2. `https://consentease.io/scan` — scanner ready, **don't run it yet**
3. `https://consentease.io/demo` — demo logged in and on `/dashboard/banner`
4. `https://consentease.io/pricing` — for the close
5. Your CRM / note doc

**Mute your notifications.** Slack, email, phone, all of it. Nothing kills a demo like a ping mid-screen-share.

**Audio check.** 1-min self-check before joining. Bad audio = lost deal.

---

## 1 · Opening (30–60 sec)

Keep it short and respectful of their time.

> "Hey [name], thanks for taking the time. I've got 25 minutes blocked — does that still work for you?"
>
> "Quick agenda: I'd like to ask a couple of questions about your setup so I show you the right things, then I'll do a live audit of your site, walk you through how ConsentEase fixes what we find, talk pricing, and answer anything you've got. Sound good?"

**Why this works:** Time-checks the meeting, sets expectations, and earns permission to drive the agenda.

---

## 2 · Discovery (3–5 min)

Ask, then **listen**. Take notes. Don't pitch yet.

| # | Question | What you're really learning |
|---|---|---|
| 1 | "Tell me about your business — how many websites does this involve?" | Single site? Agency with 50 clients? Pricing tier match. |
| 2 | "What are you using for cookie consent today?" | Cookiebot? OneTrust? Nothing? Custom dev job? Tells you the competitor and what they hate about it. |
| 3 | "What made you start looking around?" | The pain point. Listen for: cost, complexity, missed audit, agency client demands, GDPR fine fear. |
| 4 | "Who handles privacy compliance internally — you, a developer, a legal team?" | Tells you the buyer. If it's the dev, lean technical. If it's the founder, lean simplicity + price. |
| 5 | "Any specific deadline driving this?" | Audit coming up? New EU client? Tells you urgency and timeline. |
| 6 | *(Agency only)* "How are you currently billing your clients for consent management?" | Reveals if they want white-label / reseller. |
| 7 | "If we got this sorted today, what would success look like for you in 30 days?" | Get them to articulate the win. You'll close on this exact phrase later. |

**Rules:**
- One question at a time. Wait for the answer.
- After the answer, paraphrase back: *"So if I'm hearing you right, the main thing is X — yes?"*
- Never interrupt to pitch. The discovery answers tell you *which* features to emphasise next.

---

## 3 · Live audit — the "wow" moment (2–3 min)

This is where you stop talking about ConsentEase and *show* a problem they didn't know they had.

**Action:**
1. Share screen. Open the `/scan` tab.
2. Type their domain. Hit Scan.
3. While it loads (~5–15 sec), say:
   > *"This is the same free scanner anyone can use on our homepage — it loads your site like a real visitor would, with no consent given, and shows what's happening behind the scenes."*

**When the result lands, walk it in this order:**
1. **The grade** (A–F) — "So [domain] gets a [grade] today. Let me show you why."
2. **The CMP detection** — "We can see you're [using Cookiebot / not using a CMP]." If competitor: note their pricing for comparison later.
3. **Confirmed violations card** (red) — read the items aloud. Say: *"These are cookies that got dropped on the visitor's machine before they clicked anything. That's the part that's actually a GDPR problem."*
4. **Needs verification card** (amber) — *"These are scripts that loaded but didn't necessarily set cookies. Some of them might be using Google Consent Mode v2 properly, some might not. Worth checking."*
5. **The tracking scripts list** — point at familiar names (Meta Pixel, GA4, TikTok). Say: *"Most site owners don't realise this much is firing pre-consent."*

**Bridge line into product walkthrough:**
> *"OK so that's the audit. Now let me show you exactly how we fix this — it takes about two minutes."*

**If they got an "A":** Don't backpedal. Say: *"Great — your site looks clean today. So the conversation here is more about making sure it stays that way as you add new tools, and giving you the dashboard to prove it to clients/auditors."* Pivot to the agency/multi-site or audit-trail value.

---

## 4 · Product walkthrough (5–7 min)

Open the `/demo` tab. Walk it in this exact order — it tells a story (problem → fix → prove → scale).

### 4a · Banner builder — "Make it look like yours" (90 sec)
- On `/dashboard/banner`, change the heading text live
- Switch the position (bottom-left → centre modal)
- Toggle dark mode
- Change the primary colour to roughly match their brand
- Say: *"Everything you see updating live — that's what your visitors will see. No deploy needed, the changes push to your site instantly."*

### 4b · Cookie categories — "Granular consent, the right way" (60 sec)
- Open `/dashboard/cookies`
- Show auto-detected cookies sorted into Necessary / Analytics / Marketing / Functional
- Say: *"We auto-detect and categorise from a knowledge base of [N] tracking technologies. You can override anything, but most customers don't have to."*

### 4c · The embed code — "One line, you're done" (60 sec)
- Open `/dashboard/embed`
- Show the single `<script>` tag
- Say: *"This is the entire integration. Paste it once in your `<head>`, and the banner respects everything you set up. No SDK, no npm install, no deploy pipeline — works on WordPress, Shopify, Webflow, custom, doesn't matter."*

### 4d · Analytics — "Prove it works, optimise consent rates" (60 sec)
- Open `/dashboard/analytics`
- Show consent rate by country, accept/reject split
- Say: *"You'll see your real consent rate broken down by country and device. Most customers see acceptance rates jump 10–20% once they've A/B tested the banner copy with this data."*

### 4e · *(Agency only)* Multi-site dashboard (60 sec)
- Show the websites list
- Say: *"Each client site is one publicId. You can manage 50 sites from a single account, white-label the banner with the client's branding, and we have a separate agency portal for reseller billing."*

**Bridge into pricing:**
> *"Any questions on what you've seen so far before I get into pricing?"*

Pause. Let them ask. The questions here are gold — they tell you exactly what to address.

---

## 5 · Differentiation (2 min)

Only spend time here if they asked or if they mentioned a competitor in discovery. Otherwise skip.

| Concern | Talking point |
|---|---|
| **Cookiebot is the standard** | "Cookiebot starts at €11/month for 100 subpages and €39/month for 500. We start at €2.50/month with no page limit. Same auto-detection, same Google-certified CMP standard, but built for SMBs and agencies, not enterprise." |
| **OneTrust is more complete** | "OneTrust starts around €1,200/month and is built for Fortune 500 legal teams. If that's you, they're a fine choice. If you're a small agency or 1–10 person business, you'd be paying for 90% of features you'll never touch." |
| **EU data residency** | "All consent records and analytics are stored in EU data centres. Schrems II compliant out of the box, no transfer mechanisms required for EU customers." |
| **Open source / self-hosted** | "We're not open source today. The trade-off is you don't have to run your own infrastructure — banner CDN, consent storage, dashboard — that's all on us, included in the €2.50/month." |
| **AI / GPT scrapers stealing content** | Acknowledge — but stay focused. "Different problem. We handle consent compliance specifically. If you want bot-blocking, that's Cloudflare territory." |

---

## 6 · Pricing (2 min)

Open the `/pricing` tab. Walk top-down.

> *"You said you have [N sites]. That puts you on our [Tier] plan at [€X/month]. There's a free 7-day trial — no card needed to explore — and you can switch up or down anytime."*

**Anchor the value, not the price:**
> *"For context — you mentioned you're currently spending [Y hours/month] on this. At your hourly rate, this pays for itself in the first week."*

**For agencies:**
> *"On the agency tier, you'd be billing your clients [€X/site] and your cost is [€Y/site] — so you keep the margin and get a managed banner you don't have to maintain."*

**Don't apologise for the price.** It's already 5–10× cheaper than competitors. If they push for a discount, hold the line — offer to extend the trial or include a custom-branded banner setup instead.

---

## 7 · Objection handling — quick reference

Memorise the bolded responses.

| Objection | Response |
|---|---|
| *"We already have Cookiebot/OneTrust."* | **"Got it. What's working well about it, and what would you change?"** Then map their pain to your strengths. Never trash the competitor. |
| *"Our developer can build this in a weekend."* | **"They probably can. The question is do you want to pay them to maintain the cookie knowledge base, the country-by-country compliance updates, and the consent log retention for 13 months? €2.50 a month buys you back that weekend, every weekend, forever."** |
| *"Is it really compliant?"* | **"Yes — IAB TCF v2.2 certified, GDPR + CCPA + LGPD support, full audit trail with consent logs retained for 13 months. We have a DPA you can sign and a list of supervisory authorities we've cleared with."** Show the trust page. |
| *"It's almost too cheap to be good."* | **"Fair concern. The reason is we built this for SMBs and agencies first — same tech as enterprise CMPs, but without the enterprise sales overhead. We make money on volume, not per-seat licensing."** |
| *"What about US/CCPA?"* | **"Fully supported. The banner detects visitor location and serves the correct legal mode — opt-in for EU, opt-out for California, etc. One config, all jurisdictions."** |
| *"What if we have multiple sites?"* | **"Per-site pricing on lower tiers, unlimited sites on the agency tier from €X/month. Each site is one publicId, all managed from one dashboard."** |
| *"Can we white-label the banner?"* | **"Yes — agency tier removes the 'Powered by ConsentEase' link and lets you set custom branding per client."** |
| *"How do we migrate from Cookiebot?"* | **"Swap one script tag for ours. We'll preserve your existing categories. Most migrations take under 10 minutes."** |
| *"What if we cancel?"* | **"Month to month, no contract. Your consent logs stay accessible for 30 days after cancellation so you can export them."** |
| *"I need to talk to my partner / dev / legal."* | **"Of course. Can I send you a one-page summary you can forward, and book a 15-min follow-up for [specific date] so we can answer their questions together?"** Lock the next step before the call ends. |

---

## 8 · The close (1 min)

You earn the right to close by being concrete. Pick the path that fits what you heard in discovery.

**Path A — Self-serve trial (default for SMBs and devs):**
> *"Easiest next step: I'll drop the trial signup link in the chat right now. You can have the banner live on [their domain] in about 10 minutes. I'll follow up on [day after tomorrow] to see how it went and answer anything that comes up. Sound good?"*

**Path B — Assisted trial (for agencies, complex setups):**
> *"For your setup, the cleanest thing is I send you a personalised trial — pre-configured for [their domain], with the banner styled in [their brand colour]. You'd just paste one line and you're done. Want me to set that up today and follow up tomorrow?"*

**Path C — Procurement / committee buyer (enterprise flavour):**
> *"Sounds like the next step is getting [partner/legal/IT] in the loop. I'll send a one-pager today, plus our DPA and security overview. Can we book 15 minutes for [specific date] to walk them through any questions?"*

**Always end with a calendar action.** Either they signed up live, or you've got a date on the calendar. No dangling "I'll follow up sometime."

---

## 9 · Post-call (immediately, before your next meeting)

**Send the recap email within 30 minutes.** Template:

```
Subject: ConsentEase — recap from our chat

Hi [name],

Thanks for the time today. Quick recap so nothing slips:

What we found on [domain]:
• [Grade] — [N confirmed violations, N scripts loading pre-consent]
• [Specific finding that resonated, e.g. "Meta Pixel firing before consent"]

What ConsentEase fixes for you:
• [Top 2 pain points from discovery, mapped to features]

Next step:
• [Trial link / follow-up call date / proposal delivery date]

Anything I missed, just hit reply.

[your name]
```

**Log the lead** in your CRM with:
- Lead source (Reddit / referral / inbound / outbound)
- Persona (agency / dev / SMB)
- Stack (WordPress / Shopify / custom / etc.)
- Current CMP (or "none")
- Pain points from discovery (verbatim quotes)
- Decision timeline
- Next step + date

---

## Persona quick-swap

The base script works for everyone. These are the lines that change per persona — **swap them in during the relevant section**.

### Agency
- **Discovery extra:** "How many client sites are we talking, and how do you bill them today?"
- **Walkthrough emphasis:** Multi-site dashboard, white-label, agency portal billing
- **Close:** "Want me to put together a 5-site quote with your branding?"

### Solo dev / freelancer
- **Discovery extra:** "Are you the one paying for it, or are you billing it back to clients?"
- **Walkthrough emphasis:** One-line embed, dev mode, no SDK overhead, fast load time
- **Close:** "Trial link in chat — should be live on a test page in 5 minutes."

### End-customer SMB (founder / marketing lead)
- **Discovery extra:** "Who in the team would be touching this day to day?"
- **Walkthrough emphasis:** Set-and-forget, plain-English categories, the legal peace-of-mind angle
- **Close:** "I'll send the trial link plus a 1-pager you can forward to whoever else needs to see it."

---

## Mistakes to avoid

- **Don't pitch in discovery.** Ask questions, then shut up. Every minute you spend pitching before discovery is a minute you'll have to back-pedal.
- **Don't read the dashboard out loud.** Show, don't narrate. Say what it *means* for them, not what's on the screen.
- **Don't skip the live audit.** It's the highest-conversion moment in the call. Even if their site is clean, run it.
- **Don't apologise for the price.** It's a feature, not a weakness.
- **Don't trash competitors.** Map their concerns to your strengths instead.
- **Don't end without a calendar action.** No dangling "talk soon."

---

## Time budget reference

| Section | Target time | Hard cap |
|---|---|---|
| Opening | 1 min | 2 min |
| Discovery | 4 min | 6 min |
| Live audit | 3 min | 4 min |
| Product walkthrough | 6 min | 8 min |
| Differentiation | 2 min | 3 min |
| Pricing | 2 min | 3 min |
| Q&A + objections | 4 min | 6 min |
| Close | 1 min | 2 min |
| **Total** | **23 min** | **34 min** |

If you're past the hard cap on any section, jump forward. You can always send follow-up materials.
