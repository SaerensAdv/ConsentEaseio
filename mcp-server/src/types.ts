/** A ConsentEase website ("site"). */
export interface Site {
  id: string;
  userId: string;
  publicId: string;
  domain: string;
  status: string;
  lastScan: string | null;
  cookiesFound: number;
  scriptsFound: number;
  subscriptionType: string;
  createdAt: string;
}

/** Cursor-paginated list envelope returned by list endpoints. */
export interface Paginated<T> {
  data: T[];
  nextCursor: string | null;
}

/** A cookie in a site's inventory. */
export interface Cookie {
  id: string;
  websiteId: string;
  categoryId: string;
  name: string;
  provider: string | null;
  purpose: string;
  expiry: string | null;
  type: string;
  isAutoDetected: boolean;
  sourceUrl: string | null;
  createdAt: string;
}

/** Embed snippet payload for installing the banner on a site. */
export interface EmbedSnippet {
  publicId: string;
  scriptUrl: string;
  snippet: string;
}

/** Operational compliance snapshot (not legal advice). */
export interface ComplianceReport {
  websiteId: string;
  domain: string;
  status: string;
  lastScan: string | null;
  bannerConfigured: boolean;
  scan: { cookiesFound: number; scriptsFound: number };
  cookies: { total: number };
  categories: { total: number; enabled: number };
}

/** Result of recording a consent decision. */
export interface ConsentResult {
  success: boolean;
  deduped: boolean;
  limited?: boolean;
}

/** Result of triggering a scan. */
export interface ScanResult {
  status: string;
}

/** Body for adding a cookie to a site. */
export interface AddCookieBody {
  name: string;
  purpose: string;
  categoryId: string;
  provider?: string;
  expiry?: string;
  type?: string;
}

/** Body for recording a consent decision. */
export interface RecordConsentBody {
  siteId: string;
  visitorId: string;
  action: "accept_all" | "reject_all" | "custom";
  consentChoices: string | Record<string, unknown>;
  bannerVersion?: string;
  policyVersion?: string | null;
  userAgent?: string;
  country?: string;
  region?: string;
}
