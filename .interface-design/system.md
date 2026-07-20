# ConsentEase interface design contract

## Intent

ConsentEase is an operational privacy workspace for site owners and agencies. The authenticated product should feel precise like an instrument panel, calm enough for occasional users, and explicit about uncertainty. The primary job is to identify what needs attention for the active website and take the next safe action.

## Product model

- One persistent active website context across all dashboard routes.
- Overview answers: what needs attention, what changed, and what to do next.
- Detail pages diagnose or complete one job; they do not recreate global context.
- Website, account, and agency scope must never be visually ambiguous.
- Database statuses are translated into user-facing language through the canonical website-status model.

## Domain language

Use product-specific terms consistently: website, banner, cookie inventory, consent proof, diagnostic scan, implementation status, policy, banner impression, consent rate, rejection rate, active website.

Avoid vague replacements such as property, asset, health score, compliant, successful, or issue when a precise state is available.

## Visual system

### Palette

- Primary violet: product actions and active context.
- Emerald: confirmed healthy or verified states only.
- Amber: attention, incomplete setup, limits, and uncertain states.
- Red: failed checks, destructive actions, and blocking errors.
- Blue: active scans, processing, and informational states.
- Slate: neutral structure, unavailable data, and secondary text.

Color never carries meaning alone. Pair it with text and, where useful, an icon.

### Depth and surfaces

Use quiet borders and surface shifts as the primary depth strategy. Reserve shadows for overlays, sticky controls, and the banner preview. Inputs read slightly inset; cards remain close to the canvas. Dark mode relies on border and surface contrast rather than heavy shadow.

### Typography

- Display role: page titles and major section titles.
- Body role: instructions, labels, and explanatory copy.
- Data role: tabular numerals for metrics, dates, counts, and percentages.
- Technical role: monospace only for visitor IDs, code, domains when needed, and API values.

Large numbers require period and definition context. Never show a naked KPI.

### Geometry

- Base spacing unit: 4px.
- Controls: 40px default height, smaller only for secondary dense actions.
- Cards: moderate radius, no oversized pill-shaped containers.
- Section rhythm: 24px to 32px.
- Dense internal gaps: 8px to 12px.

## Signature pattern: consent readiness

ConsentEase should repeatedly connect a state to evidence and an action. Apply this pattern in at least these places:

1. Global website selector: domain plus actionable scan state.
2. Overview header: active website and confirmed status.
3. Next actions: evidence, consequence, and destination.
4. Diagnostics: each check states detected, missing, or unknown.
5. Website list: scan state plus relevant action.
6. Empty states: explain what evidence is missing and how to create it.

Do not collapse these signals into an opaque score.

## KPI contracts

### Banner impressions

- Definition: recorded `banner_shown` events for the selected website and period.
- Decision: whether implementation is live and traffic is being observed.
- Caveat: impressions are not unique visitors or sessions.

### Consent rate

- Definition: accepted consent actions divided by banner impressions for the aligned period.
- Decision: monitor visitor response and investigate material shifts.
- Caveat: display missing data as unavailable, never zero.

### Rejection rate

- Definition: rejected consent actions divided by banner impressions for the aligned period.
- Decision: inspect banner clarity and audience response without treating rejection as product failure.

### Usage

- Definition: account-level monthly banner views against the active plan limit.
- Decision: prevent interrupted analytics collection.
- Scope: account-wide, clearly distinguished from selected-website metrics.

## Navigation and context

- Global selector remains in the sticky dashboard header.
- Local page selectors are prohibited unless they control a genuinely different entity.
- Preserve `websiteId` in the URL and local selection for shareability and continuity.
- Sidebar labels describe user jobs, not backend tables.
- Every page shows its job, active domain where relevant, and one obvious primary action.

## States

Every data surface supports:

- Loading: structural skeleton or concise progress state.
- Empty: explain why data is absent and provide the next action.
- Partial: show available evidence and label missing pieces.
- Error: state what failed, preserve unaffected content, and offer retry.
- Success: confirm the completed action without overstating legal compliance.
- Unknown: use neutral language such as “Not verified” or “Status unavailable”.

Never present missing, delayed, estimated, or unverified data as zero or healthy.

## Interaction

- Use existing Radix/shadcn primitives for select, dialog, menu, tabs, and alerts.
- All actions need visible focus and accessible names.
- Destructive actions require explicit consequence copy and confirmation.
- Motion explains transitions only; keep it short and respect reduced motion.
- Website switches block stale page requests until the URL and context agree.

## Responsive behavior

- Preserve active website context and the page’s primary action on narrow screens.
- Reflow controls before hiding them.
- Tables may scroll horizontally only when exact comparison is essential; otherwise provide a compact mobile representation.
- Sticky headers must not obscure focused controls.
- Touch targets remain at least 40px where practical.

## Copy rules

- Prefer “Scan complete” over `compliant`.
- Prefer “Scan needs attention” over `attention`.
- Prefer “Not detected” over “Failed” when evidence is simply absent.
- Say “implementation signals”, not “legal guarantee”.
- Avoid claiming GDPR compliance from a scan alone.
- Use sentence case for product labels and actions.

## Guardrails

- No broad redesign while migration work is active.
- Reuse the current shell, tokens, components, and Phosphor iconography.
- Database, Stripe, and customer embeds stay outside UI PRs unless explicitly required.
- New dashboard pages consume the global website context directly.
- Meaningful new patterns must update this contract or consciously document an exception.
