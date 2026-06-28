import { storage } from "../storage";
import type { AuthContext } from "./context";
import { notFound } from "./errors";

export type WebsiteAction = "read" | "write";

/**
 * Canonical website-access rule, shared by the dashboard gate (server/routes.ts
 * `canAccessWebsite`) and the /api/v1 gate below — one implementation so the two
 * surfaces can never drift to different access rules.
 *
 * A user may access a website iff they OWN it, or they are the OWNER of an agency
 * that manages the website's owner as a client. This intentionally mirrors the
 * dashboard's historical behavior: agency *members* are NOT granted access here,
 * so an API key inherits exactly its owner's dashboard access — no more, no less.
 */
export async function canUserAccessWebsite(userId: string, website: { userId: string }): Promise<boolean> {
  if (website.userId === userId) return true;
  const agency = await storage.getAgencyByOwnerId(userId);
  if (!agency) return false;
  const clients = await storage.getAgencyClients(agency.id);
  return clients.some((c) => c.userId === website.userId);
}

/**
 * Single authorization gate for /api/v1 resource access. Throws notFound (404) on
 * deny — we return 404 rather than 403 so guessable resource IDs cannot be used to
 * enumerate the existence of other owners' websites (IDOR hardening; this also
 * matches the dashboard, which 404s on no-access). `action` is accepted for
 * forward-compat / auditing; access is currently binary (owner-equivalent).
 */
export async function authorizeWebsiteAccess(
  ctx: AuthContext,
  website: { userId: string } | undefined,
  _action: WebsiteAction = "read",
): Promise<void> {
  if (!website || !(await canUserAccessWebsite(ctx.userId, website))) {
    throw notFound("Website not found");
  }
}
