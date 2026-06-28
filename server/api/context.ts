import type { Request } from "express";

// The principal behind a request. The dashboard authenticates via express-session +
// Passport ("session"); the public REST API authenticates via an API key ("apiKey").
// Both resolve to a single AuthContext so downstream authz/metering is uniform.
export type ApiPrincipalType = "session" | "apiKey";

export interface AuthContext {
  principalType: ApiPrincipalType;
  /** The owning user's id — the subject all access is scoped to. */
  userId: string;
  /** Present only for API-key principals; identifies the acting key for metering/audit. */
  apiKeyId?: string;
  /** Scopes granted to this principal (empty array = no scoped permissions). */
  scopes: string[];
  /** Rate-limit tier for API-key principals (e.g. "standard", "high"). */
  rateTier?: string;
}

declare global {
  namespace Express {
    interface Request {
      authContext?: AuthContext;
    }
  }
}

/** Read the AuthContext attached by the auth middleware. Absence is a wiring bug, not a client error. */
export function requireAuthContext(req: Request): AuthContext {
  if (!req.authContext) {
    throw new Error("authContext missing — auth middleware was not applied to this route");
  }
  return req.authContext;
}
