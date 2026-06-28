import { storage, PLAN_LIMITS, type PlanType } from "../storage";
import type { AuthContext } from "./context";
import { conflict } from "./errors";

export interface MeterParams {
  /** The authenticated API-key principal performing the action. */
  ctx: AuthContext;
  /** Stable action name recorded in the audit ledger, e.g. "consent.record", "site.scan". */
  action: string;
  /** Website the action targets, if any (kept for audit/analytics; nullable). */
  websiteId?: string | null;
  /**
   * View-equivalent billable units. Each unit increments the monthly view counter
   * exactly like one embed-script `banner_shown` event, so API volume lands in the
   * same billing-driving counter. 0 = a non-billable action (audited but not metered).
   * MUST be computed server-side — never taken from the client (see DoD: Tampering).
   */
  billableUnits?: number;
  /** Idempotency-Key for billable retries; replays de-dupe on (apiKeyId, idempotencyKey). */
  idempotencyKey?: string | null;
}

export interface MeterResult {
  /** True when this was an idempotent replay — no new metering was applied. */
  deduped: boolean;
  /** True when the user is over their monthly-view grace limit (mirrors the embed's `limited`). */
  limited: boolean;
}

/**
 * Record an API action in the `api_usage_events` ledger and, for view-equivalent
 * units, enforce plan limits through the SAME `incrementMonthlyViewCounter` +
 * `PLAN_LIMITS` × 1.1 grace path the embed script uses.
 *
 *  - Replays (same apiKeyId + Idempotency-Key + action) are de-duplicated and never
 *    double-meter; they return `{ deduped: true, limited: false }`.
 *  - Reusing an Idempotency-Key for a DIFFERENT action throws a 409 conflict.
 */
export async function meterApiUsage(params: MeterParams): Promise<MeterResult> {
  const { ctx, action } = params;
  if (!ctx.apiKeyId) {
    // Metering is only meaningful for API-key principals; absence is a wiring bug.
    throw new Error("meterApiUsage requires an API-key AuthContext (apiKeyId missing)");
  }

  const units = Math.max(0, Math.floor(params.billableUnits ?? 0));

  const { deduped, conflict: isConflict } = await storage.recordApiUsageEvent({
    apiKeyId: ctx.apiKeyId,
    userId: ctx.userId,
    websiteId: params.websiteId ?? null,
    action,
    billableUnits: units,
    idempotencyKey: params.idempotencyKey ?? null,
    status: "ok",
  });

  if (isConflict) {
    throw conflict(
      "Idempotency-Key already used for a different request",
      "Use a unique Idempotency-Key for each distinct operation.",
    );
  }

  // Idempotent replay: the original call already metered any units — do not re-meter.
  if (deduped) {
    return { deduped: true, limited: false };
  }

  let limited = false;
  if (units > 0) {
    const user = await storage.getUser(ctx.userId);
    if (user) {
      const plan = (user.plan || "solo") as PlanType;
      const limits = PLAN_LIMITS[plan];
      if (limits && limits.monthlyViews > 0) {
        const gracePeriodLimit = Math.ceil(limits.monthlyViews * 1.1);
        // Increment once per view-equivalent unit; the final atomic count drives the
        // grace check. We accept the embed's documented 1-unit overshoot at the cap.
        let count = 0;
        for (let i = 0; i < units; i++) {
          count = await storage.incrementMonthlyViewCounter(ctx.userId);
        }
        if (count > gracePeriodLimit) limited = true;
      }
    }
  }

  return { deduped: false, limited };
}
