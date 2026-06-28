import type { Request, Response, NextFunction } from "express";
import { parseApiKey, verifySecret } from "../services/apiKeyService";
import { storage } from "../storage";
import type { AuthContext } from "../api/context";
import { unauthorized, forbidden, sendApiError } from "../api/errors";

// A fixed, well-formed dummy hash (32 bytes of zero as hex). When a presented key
// is malformed or its keyId is unknown, we still run a constant-time compare against
// this so attackers cannot use response latency to probe which keyIds exist.
const DUMMY_SECRET_HASH = "0".repeat(64);
const DUMMY_SECRET = "0".repeat(64);

// Throttle lastUsedAt writes: at most one DB update per key per interval, so a
// high-QPS key does not generate one UPDATE per request.
const TOUCH_INTERVAL_MS = 60_000;
const lastTouchedAt = new Map<string, number>();

function extractPresentedKey(req: Request): string | null {
  const header = req.header("authorization");
  if (header) {
    const m = /^Bearer\s+(.+)$/i.exec(header.trim());
    if (m) return m[1].trim();
  }
  const xKey = req.header("x-api-key");
  if (xKey && xKey.trim().length > 0) return xKey.trim();
  return null;
}

/**
 * Authenticate a request via API key (`Authorization: Bearer <key>` or `X-API-Key`).
 * On success, attaches a fully-resolved AuthContext to `req` and calls next().
 * On any failure, responds with the standard { error, code, hint } contract (401).
 *
 * Security posture (see threat_model.md, Spoofing/Information Disclosure):
 *  - secrets are HMAC-verified in constant time;
 *  - malformed / unknown keys are rejected indistinguishably (dummy compare);
 *  - revoked/expired status is disclosed ONLY after a valid secret, so the status
 *    of a key is never revealed to someone who does not already hold it.
 */
export async function apiKeyAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const presented = extractPresentedKey(req);
    if (!presented) {
      throw unauthorized(
        "Missing API key",
        "Send your key as `Authorization: Bearer <key>` or in the `X-API-Key` header.",
      );
    }

    const parsed = parseApiKey(presented);
    if (!parsed) {
      verifySecret(DUMMY_SECRET, DUMMY_SECRET_HASH);
      throw unauthorized("Invalid API key", "Check that the key was copied in full and not truncated.");
    }

    const row = await storage.getApiKeyByKeyId(parsed.keyId);
    if (!row) {
      verifySecret(parsed.secret, DUMMY_SECRET_HASH);
      throw unauthorized("Invalid API key");
    }

    if (!verifySecret(parsed.secret, row.secretHash)) {
      throw unauthorized("Invalid API key");
    }

    // Secret is valid → the caller legitimately holds this key, so it is safe to
    // disclose lifecycle status to help them self-diagnose.
    if (row.revokedAt) {
      throw unauthorized("This API key has been revoked", "Create a new key in your dashboard settings.");
    }
    if (row.expiresAt && row.expiresAt.getTime() <= Date.now()) {
      throw unauthorized("This API key has expired", "Rotate or create a new key in your dashboard settings.");
    }

    const ctx: AuthContext = {
      principalType: "apiKey",
      userId: row.userId,
      apiKeyId: row.id,
      scopes: row.scopes ?? [],
      rateTier: row.rateTier,
    };
    req.authContext = ctx;

    // Throttled, fire-and-forget last-used update — never block or fail the request on it.
    const now = Date.now();
    const last = lastTouchedAt.get(row.id) ?? 0;
    if (now - last >= TOUCH_INTERVAL_MS) {
      lastTouchedAt.set(row.id, now);
      void storage.touchApiKeyLastUsed(row.id).catch((err) => {
        console.error("[apiKeyAuth] touchApiKeyLastUsed failed:", err);
      });
    }

    next();
  } catch (err) {
    sendApiError(res, err);
  }
}

/**
 * Guard requiring a specific scope on the authenticated key. Must run AFTER apiKeyAuth.
 * A key carrying the "*" scope satisfies any requirement.
 */
export function requireScope(scope: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ctx = req.authContext;
    if (!ctx) {
      sendApiError(res, unauthorized("Authentication required"));
      return;
    }
    if (ctx.scopes.includes("*") || ctx.scopes.includes(scope)) {
      next();
      return;
    }
    sendApiError(
      res,
      forbidden(
        `This API key is missing the required scope: ${scope}`,
        "Create a key that includes the needed scopes in your dashboard settings.",
      ),
    );
  };
}
