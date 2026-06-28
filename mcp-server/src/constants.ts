export const SERVER_NAME = "consentease-mcp-server";
export const SERVER_VERSION = "1.0.0";

/**
 * Default API origin used when CONSENTEASE_API_URL is not set.
 * Points at the live ConsentEase production API so the published package works
 * out of the box. Set CONSENTEASE_API_URL to override (e.g. http://localhost:5000
 * when developing against a local server).
 */
export const DEFAULT_API_URL = "https://consentease.io";

/** Maximum characters returned in a single tool response before truncation. */
export const CHARACTER_LIMIT = 25000;

/**
 * Resolve the ConsentEase API origin from the environment.
 * Accepts an origin like "https://consentease.io" (the "/api/v1" path is
 * appended by the client). Trailing slashes are stripped. Falls back to
 * {@link DEFAULT_API_URL} (production) when CONSENTEASE_API_URL is unset.
 */
export function resolveApiUrl(): string {
  const raw = process.env.CONSENTEASE_API_URL?.trim();
  const base = raw && raw.length > 0 ? raw : DEFAULT_API_URL;
  return base.replace(/\/+$/, "");
}
