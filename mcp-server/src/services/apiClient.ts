import type {
  AddCookieBody,
  Cookie,
  ComplianceReport,
  ConsentResult,
  EmbedSnippet,
  Paginated,
  RecordConsentBody,
  ScanResult,
  Site,
} from "../types.js";

/** Structured error mirroring the API's { error, code, hint } contract. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly hint?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Query = Record<string, string | number | undefined>;

interface RequestOptions {
  body?: unknown;
  query?: Query;
  idempotencyKey?: string;
}

/**
 * Thin client over the ConsentEase `/api/v1` REST surface. Every method
 * authenticates with the configured API key and normalizes failures into
 * {@link ApiError} so tools can surface actionable messages.
 */
export class ConsentEaseClient {
  private readonly base: string;

  constructor(apiOrigin: string, private readonly apiKey: string) {
    this.base = `${apiOrigin.replace(/\/+$/, "")}/api/v1`;
  }

  private async request<T>(
    method: string,
    path: string,
    opts: RequestOptions = {},
  ): Promise<T> {
    const url = new URL(this.base + path);
    if (opts.query) {
      for (const [key, value] of Object.entries(opts.query)) {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: "application/json",
    };
    if (opts.body !== undefined) headers["Content-Type"] = "application/json";
    if (opts.idempotencyKey) headers["Idempotency-Key"] = opts.idempotencyKey;

    let res: Response;
    try {
      res = await fetch(url, {
        method,
        headers,
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      });
    } catch (err) {
      throw new ApiError(
        0,
        "network_error",
        `Could not reach the ConsentEase API at ${this.base}.`,
        "Check the CONSENTEASE_API_URL environment variable and your network connection.",
      );
    }

    const raw = await res.text();
    let parsed: unknown = undefined;
    if (raw) {
      try {
        parsed = JSON.parse(raw);
      } catch {
        /* leave undefined for non-JSON bodies */
      }
    }

    if (!res.ok) {
      const body = (parsed ?? {}) as { error?: string; code?: string; hint?: string };
      throw new ApiError(
        res.status,
        body.code ?? "internal",
        body.error ?? `Request failed with HTTP ${res.status}.`,
        body.hint,
      );
    }

    return parsed as T;
  }

  // --- Sites ---------------------------------------------------------------

  listSites(params: { limit?: number; cursor?: string }): Promise<Paginated<Site>> {
    return this.request("GET", "/sites", {
      query: { limit: params.limit, cursor: params.cursor },
    });
  }

  getSite(id: string): Promise<Site> {
    return this.request("GET", `/sites/${encodeURIComponent(id)}`);
  }

  createSite(domain: string): Promise<Site> {
    return this.request("POST", "/sites", { body: { domain } });
  }

  scanSite(id: string): Promise<ScanResult> {
    return this.request("POST", `/sites/${encodeURIComponent(id)}/scan`);
  }

  getEmbed(id: string): Promise<EmbedSnippet> {
    return this.request("GET", `/sites/${encodeURIComponent(id)}/embed`);
  }

  getCompliance(id: string): Promise<ComplianceReport> {
    return this.request("GET", `/sites/${encodeURIComponent(id)}/compliance`);
  }

  // --- Cookies -------------------------------------------------------------

  listCookies(
    id: string,
    params: { limit?: number; cursor?: string },
  ): Promise<Paginated<Cookie>> {
    return this.request("GET", `/sites/${encodeURIComponent(id)}/cookies`, {
      query: { limit: params.limit, cursor: params.cursor },
    });
  }

  addCookie(id: string, body: AddCookieBody): Promise<Cookie> {
    return this.request("POST", `/sites/${encodeURIComponent(id)}/cookies`, { body });
  }

  // --- Consent -------------------------------------------------------------

  recordConsent(body: RecordConsentBody, idempotencyKey?: string): Promise<ConsentResult> {
    return this.request("POST", "/consent", { body, idempotencyKey });
  }
}
