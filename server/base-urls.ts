// Explicit, intentional base URLs for the two-hostname deployment.
//
//   consentease.io      -> public marketing site         (PUBLIC_BASE_URL)
//   app.consentease.io  -> dashboard / auth / onboarding  (APP_BASE_URL)
//   consentease.io      -> Stripe managed webhook host     (WEBHOOK_BASE_URL)
//
// These deliberately do NOT read REPLIT_DOMAINS[0] for production URLs, so the
// hostnames used for emails, Stripe returns, and the managed webhook are always
// intentional rather than dependent on domain ordering. Each value can be
// overridden with a Replit Secret of the same name. Outside production (local
// dev) every value falls back to the Replit dev domain (or localhost) so links
// and the managed webhook keep resolving to this same workspace/origin.

const IS_PRODUCTION =
  process.env.NODE_ENV === "production" || process.env.REPLIT_DEPLOYMENT === "1";

const PROD_PUBLIC_BASE_URL = "https://consentease.io";
const PROD_APP_BASE_URL = "https://app.consentease.io";
const PROD_WEBHOOK_BASE_URL = "https://consentease.io";

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

// Same-origin fallback used only outside production. Mirrors the legacy
// getBaseUrl() dev behaviour so this workspace keeps working unchanged.
function devBaseUrl(): string {
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  return "http://localhost:5000";
}

function resolve(envValue: string | undefined, prodDefault: string): string {
  const override = envValue?.trim();
  if (override) {
    return stripTrailingSlash(override);
  }
  return IS_PRODUCTION ? prodDefault : devBaseUrl();
}

export const PUBLIC_BASE_URL = resolve(process.env.PUBLIC_BASE_URL, PROD_PUBLIC_BASE_URL);
export const APP_BASE_URL = resolve(process.env.APP_BASE_URL, PROD_APP_BASE_URL);
export const WEBHOOK_BASE_URL = resolve(process.env.WEBHOOK_BASE_URL, PROD_WEBHOOK_BASE_URL);

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

// Bare hostnames (no scheme/port) used for host-aware routing decisions.
export const PUBLIC_HOST = hostnameOf(PUBLIC_BASE_URL);
export const APP_HOST = hostnameOf(APP_BASE_URL);

function parseBool(value: string | undefined): boolean {
  const normalized = (value ?? "").trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on";
}

// Master switch for production host redirects. Disabled by default so nothing
// changes live until it is explicitly turned on with ENABLE_HOST_REDIRECTS.
export const HOST_REDIRECTS_ENABLED = parseBool(process.env.ENABLE_HOST_REDIRECTS);
