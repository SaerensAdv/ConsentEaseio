import { randomBytes, createHmac, timingSafeEqual } from "node:crypto";
import type { ApiKey, PublicApiKey } from "@shared/schema";

// API key format: ce_live_<keyId>_<secret>
//   - keyId:  public lookup id (hex, no underscores) — stored + indexed.
//   - secret: 256-bit random (hex) — NEVER stored; only its HMAC is persisted.
// Both segments are hex so the single separating underscore parses unambiguously.
const KEY_PREFIX = "ce_live_";
const KEY_ID_BYTES = 8; // 16 hex chars
const SECRET_BYTES = 32; // 64 hex chars, 256-bit entropy
const KEY_ID_HEX_LEN = KEY_ID_BYTES * 2; // exact minted keyId length
const SECRET_HEX_LEN = SECRET_BYTES * 2; // exact minted secret length

export interface MintedApiKey {
  /** Full plaintext key — shown to the user exactly once, never stored. */
  plaintext: string;
  /** Public lookup id (the <keyId> segment). Stored and uniquely indexed. */
  keyId: string;
  /** Non-secret display fragment, e.g. "ce_live_a1b2c3d4e5f6a7b8". */
  keyPrefix: string;
  /** HMAC-SHA256(API_KEY_PEPPER, secret), hex. The only key material persisted. */
  secretHash: string;
}

export interface ParsedApiKey {
  keyId: string;
  secret: string;
}

/**
 * Resolve the HMAC pepper, failing closed if it is missing, too weak, or
 * accidentally shared with SESSION_SECRET (rotating one must never silently
 * invalidate the other — see threat_model.md, Spoofing).
 */
function getPepper(): string {
  const pepper = process.env.API_KEY_PEPPER;
  if (!pepper || pepper.length < 16) {
    throw new Error(
      "API_KEY_PEPPER is not configured (or too short). Set a high-entropy secret, e.g. `openssl rand -hex 32`.",
    );
  }
  if (pepper === process.env.SESSION_SECRET) {
    throw new Error(
      "API_KEY_PEPPER must be distinct from SESSION_SECRET so rotating one never invalidates the other.",
    );
  }
  return pepper;
}

function hashSecret(secret: string): string {
  return createHmac("sha256", getPepper()).update(secret).digest("hex");
}

/** Mint a brand-new API key. Returns the plaintext once plus the values to persist. */
export function mintApiKey(): MintedApiKey {
  const keyId = randomBytes(KEY_ID_BYTES).toString("hex");
  const secret = randomBytes(SECRET_BYTES).toString("hex");
  const plaintext = `${KEY_PREFIX}${keyId}_${secret}`;
  return {
    plaintext,
    keyId,
    keyPrefix: `${KEY_PREFIX}${keyId}`,
    secretHash: hashSecret(secret),
  };
}

/** Parse a presented key into its keyId + secret, or null if it is malformed. */
export function parseApiKey(plaintext: unknown): ParsedApiKey | null {
  if (typeof plaintext !== "string" || !plaintext.startsWith(KEY_PREFIX)) {
    return null;
  }
  const body = plaintext.slice(KEY_PREFIX.length);
  const sep = body.indexOf("_");
  if (sep <= 0) return null;
  const keyId = body.slice(0, sep);
  const secret = body.slice(sep + 1);
  if (keyId.length !== KEY_ID_HEX_LEN || secret.length !== SECRET_HEX_LEN) return null;
  if (!/^[0-9a-f]+$/.test(keyId) || !/^[0-9a-f]+$/.test(secret)) return null;
  return { keyId, secret };
}

/** Constant-time verification of a presented secret against the stored HMAC. */
export function verifySecret(secret: string, storedHash: string): boolean {
  let computed: Buffer;
  let stored: Buffer;
  try {
    computed = Buffer.from(hashSecret(secret), "hex");
    stored = Buffer.from(storedHash, "hex");
  } catch {
    return false;
  }
  if (computed.length === 0 || computed.length !== stored.length) return false;
  return timingSafeEqual(computed, stored);
}

/** Strip credential-verifier material (secretHash) before serializing a key to any client. */
export function toPublicApiKey(row: ApiKey): PublicApiKey {
  const copy: Partial<ApiKey> = { ...row };
  delete copy.secretHash;
  return copy as PublicApiKey;
}
