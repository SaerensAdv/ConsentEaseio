import type { Request } from "express";
import { badRequest } from "./errors";

export const IDEMPOTENCY_HEADER = "idempotency-key";
const MAX_IDEMPOTENCY_KEY_LEN = 255;
const IDEMPOTENCY_KEY_RE = /^[A-Za-z0-9_.:-]{1,255}$/;

/**
 * Extract & validate the Idempotency-Key request header. Returns null when absent.
 *
 * This helper only normalizes input. The actual replay de-duplication for billable
 * writes is enforced at the storage layer by the unique (apiKeyId, idempotencyKey)
 * constraint exercised in `storage.recordApiUsageEvent` (see threat_model.md,
 * Repudiation), which also flags `conflict` when a key is reused for a different action.
 */
export function parseIdempotencyKey(req: Request): string | null {
  const raw = req.header(IDEMPOTENCY_HEADER);
  if (raw === undefined) return null;
  const key = raw.trim();
  if (key.length === 0) return null;
  if (key.length > MAX_IDEMPOTENCY_KEY_LEN || !IDEMPOTENCY_KEY_RE.test(key)) {
    throw badRequest(
      "Invalid Idempotency-Key header",
      "Use 1–255 characters from the set [A-Za-z0-9_.:-].",
    );
  }
  return key;
}
