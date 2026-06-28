// Canonical API-key scopes for ConsentEase Connect (the public /api/v1 surface).
// Single source of truth shared by the dashboard key-management UI (client) and the
// create/validate routes (server). These string values MUST stay in lockstep with
// V1_SCOPES in server/api/v1/router.ts — that map is what requireScope() enforces.
export const API_SCOPES = [
  "sites:read",
  "sites:write",
  "sites:scan",
  "consent:write",
] as const;

export type ApiScope = (typeof API_SCOPES)[number];

// Human-readable, end-user-facing descriptions for each scope, used to label the
// checkboxes when a user mints a key. Keep these plain-language (the dashboard is
// used by non-developers configuring agent access).
export const API_SCOPE_DESCRIPTIONS: Record<ApiScope, string> = {
  "sites:read": "Read your websites, cookies, and consent records",
  "sites:write": "Create and update websites and cookie entries",
  "sites:scan": "Trigger cookie scans on your websites",
  "consent:write": "Record consent decisions through the API",
};

export function isApiScope(value: string): value is ApiScope {
  return (API_SCOPES as readonly string[]).includes(value);
}
