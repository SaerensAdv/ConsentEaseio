import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ConsentEaseClient } from "../services/apiClient.js";
import { errorResult, successResult } from "./helpers.js";

const siteId = z
  .string()
  .min(1)
  .describe('A ConsentEase site id (UUID), e.g. "bdd8b5d7-3f38-48cf-b1ed-fffa5c3d25d4".');

export function registerSiteTools(server: McpServer, client: ConsentEaseClient): void {
  server.registerTool(
    "consentease_list_sites",
    {
      title: "List ConsentEase sites",
      description: `List every website you can manage in ConsentEase (your own sites, plus — for agency accounts — your clients' sites). Cursor-paginated, newest first.

Args:
  - limit (number, optional): Page size, 1–100 (default 20 on the server).
  - cursor (string, optional): Opaque cursor from a previous page's "nextCursor".

Returns JSON: { "data": Site[], "nextCursor": string | null }. When "nextCursor" is null you have reached the last page; otherwise pass it back as "cursor" to fetch the next page.

Use this first when you need a site's id, domain, or status before calling another tool. Requires scope: sites:read.`,
      inputSchema: {
        limit: z.number().int().min(1).max(100).optional().describe("Page size, 1–100."),
        cursor: z
          .string()
          .optional()
          .describe("Opaque pagination cursor from a previous response's nextCursor."),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ limit, cursor }) => {
      try {
        return successResult(await client.listSites({ limit, cursor }));
      } catch (err) {
        return errorResult(err);
      }
    },
  );

  server.registerTool(
    "consentease_get_site",
    {
      title: "Get a ConsentEase site",
      description: `Fetch a single website by id, including its status, scan counts, and public id.

Args:
  - id (string): The site id.

Returns JSON: a Site object. Returns a not_found error if the site does not exist or your key cannot access it. Requires scope: sites:read.`,
      inputSchema: { id: siteId },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ id }) => {
      try {
        return successResult(await client.getSite(id));
      } catch (err) {
        return errorResult(err);
      }
    },
  );

  server.registerTool(
    "consentease_create_site",
    {
      title: "Create a ConsentEase site",
      description: `Register a new website. This provisions the consent banner: it creates the site, a default banner configuration, default cookie categories, and kicks off a background cookie scan. Subject to your plan's website limit.

Args:
  - domain (string): The bare domain with no protocol and no "www" (e.g. "example.com"). It is normalized server-side.

Returns JSON: the created Site object. publicId, status, and ownership are assigned by the server and cannot be set by the caller.

After creating a site, call consentease_get_embed_snippet to obtain the install snippet. NOTE: this is not idempotent — calling it twice creates two sites. Requires scope: sites:write.`,
      inputSchema: {
        domain: z
          .string()
          .min(1)
          .describe('Bare domain, no protocol or "www" — e.g. "example.com".'),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ domain }) => {
      try {
        return successResult(await client.createSite(domain));
      } catch (err) {
        return errorResult(err);
      }
    },
  );

  server.registerTool(
    "consentease_scan_site",
    {
      title: "Rescan a ConsentEase site for cookies",
      description: `Trigger a background cookie rescan of a site. Scanning detects and classifies cookies/scripts and updates the inventory. Bounded by your plan's daily scan limit.

Args:
  - id (string): The site id.

Returns JSON: { "status": "scanning" } (HTTP 202). Poll consentease_get_site or consentease_get_compliance_report to observe when the scan finishes. Returns rate_limited if the daily scan limit is reached. Requires scope: sites:scan.`,
      inputSchema: { id: siteId },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ id }) => {
      try {
        return successResult(await client.scanSite(id));
      } catch (err) {
        return errorResult(err);
      }
    },
  );

  server.registerTool(
    "consentease_get_embed_snippet",
    {
      title: "Get a site's embed snippet",
      description: `Return the copy-paste install snippet and script URL for a site's consent banner.

Args:
  - id (string): The site id.

Returns JSON: { "publicId", "scriptUrl", "snippet" }. Place "snippet" in the site's <head>, before Google Tag Manager / gtag, so consent defaults are set before tags load. Requires scope: sites:read.`,
      inputSchema: { id: siteId },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ id }) => {
      try {
        return successResult(await client.getEmbed(id));
      } catch (err) {
        return errorResult(err);
      }
    },
  );

  server.registerTool(
    "consentease_get_compliance_report",
    {
      title: "Get a site's compliance snapshot",
      description: `Return an operational snapshot of a site derived from real scan, cookie, and banner state.

Args:
  - id (string): The site id.

Returns JSON: { websiteId, domain, status, lastScan, bannerConfigured, scan:{cookiesFound,scriptsFound}, cookies:{total}, categories:{total,enabled} }.

IMPORTANT: this is operational status only. It is NOT legal advice and NOT a guarantee of GDPR/CCPA compliance — do not present it as one. Requires scope: sites:read.`,
      inputSchema: { id: siteId },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ id }) => {
      try {
        return successResult(await client.getCompliance(id));
      } catch (err) {
        return errorResult(err);
      }
    },
  );
}
