import type { Request, Response, NextFunction } from "express";
import {
  PUBLIC_BASE_URL,
  APP_BASE_URL,
  PUBLIC_HOST,
  APP_HOST,
  HOST_REDIRECTS_ENABLED,
} from "../base-urls";

// Auth/account pages that live on the app subdomain (exact matches).
const APP_AUTH_PATHS = new Set([
  "/login",
  "/onboarding",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/verify-email-change",
]);

/** True when a page path belongs on the app/dashboard subdomain. */
export function isAppPath(pathname: string): boolean {
  const p = pathname.replace(/\/+$/, "") || "/";
  if (p === "/dashboard" || p.startsWith("/dashboard/")) return true;
  return APP_AUTH_PATHS.has(p);
}

export interface HostRedirectDecision {
  status: number;
  location: string;
  reason: string;
}

export interface HostRoutingConfig {
  publicHost: string;
  appHost: string;
  publicBaseUrl: string;
  appBaseUrl: string;
}

/**
 * Pure decision function: returns the redirect to perform, or null to serve the
 * request as-is. `originalUrl` must include the querystring so tokens are
 * preserved on the target. Never called for /api/*, non-GET, or static files.
 */
export function decideHostRedirect(
  hostname: string,
  pathname: string,
  originalUrl: string,
  cfg: HostRoutingConfig,
): HostRedirectDecision | null {
  const host = hostname.toLowerCase();

  // Single-host environments (e.g. local dev) can't distinguish public vs app.
  if (cfg.publicHost === cfg.appHost) return null;

  // www.consentease.io -> consentease.io (permanent). We intentionally never
  // create www.app.consentease.io, so it is deliberately not handled here.
  if (host === `www.${cfg.publicHost}`) {
    return {
      status: 301,
      location: `${cfg.publicBaseUrl}${originalUrl}`,
      reason: "www->apex",
    };
  }

  // App subdomain: only app/auth/dashboard pages belong here. Everything else
  // is marketing and moves permanently to the public site.
  if (host === cfg.appHost) {
    if (!isAppPath(pathname)) {
      return {
        status: 301,
        location: `${cfg.publicBaseUrl}${originalUrl}`,
        reason: "app-host-marketing->public",
      };
    }
    return null;
  }

  // Public site: app/auth/dashboard pages move to the app subdomain. Use 302 so
  // tokenized auth URLs (reset/verify) are never cached as a permanent redirect.
  if (host === cfg.publicHost) {
    if (isAppPath(pathname)) {
      return {
        status: 302,
        location: `${cfg.appBaseUrl}${originalUrl}`,
        reason: "public-host-app->app",
      };
    }
    return null;
  }

  return null;
}

const CONFIG: HostRoutingConfig = {
  publicHost: PUBLIC_HOST,
  appHost: APP_HOST,
  publicBaseUrl: PUBLIC_BASE_URL,
  appBaseUrl: APP_BASE_URL,
};

/**
 * Host-aware redirect middleware. No-op until ENABLE_HOST_REDIRECTS is turned
 * on. Only affects page navigations — never /api/* (embed script, analytics
 * ingest, consent log, /api/v1, Stripe webhook), non-GET requests, or static
 * files. Preserves path + querystring + tokens on every redirect.
 */
export function hostRedirects(req: Request, res: Response, next: NextFunction) {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  if (req.path === "/api" || req.path.startsWith("/api/")) return next();
  // Static files carry an extension; only extension-less page routes are routed.
  if (/\.[a-z0-9]+$/i.test(req.path)) return next();

  if (!HOST_REDIRECTS_ENABLED) return next();

  const hostname = (req.headers.host || "").split(":")[0];
  const decision = decideHostRedirect(hostname, req.path, req.originalUrl, CONFIG);
  if (!decision) return next();

  // Log host + path + decision only. Never log querystring, tokens, or cookies.
  console.log(`[host-routing] ${hostname}${req.path} -> ${decision.status} ${decision.reason}`);
  res.redirect(decision.status, decision.location);
}
