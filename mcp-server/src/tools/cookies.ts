import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ConsentEaseClient } from "../services/apiClient.js";
import { errorResult, successResult } from "./helpers.js";

const siteId = z
  .string()
  .min(1)
  .describe('The ConsentEase site id (UUID) the cookie belongs to.');

export function registerCookieTools(server: McpServer, client: ConsentEaseClient): void {
  server.registerTool(
    "consentease_list_cookies",
    {
      title: "List a site's cookies",
      description: `List the cookie inventory for a site. Cursor-paginated, newest first.

Args:
  - id (string): The site id.
  - limit (number, optional): Page size, 1–100 (default 20 on the server).
  - cursor (string, optional): Opaque cursor from a previous page's "nextCursor".

Returns JSON: { "data": Cookie[], "nextCursor": string | null }. Each cookie has name, provider, purpose, expiry, type, categoryId, and isAutoDetected. Requires scope: sites:read.`,
      inputSchema: {
        id: siteId,
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
    async ({ id, limit, cursor }) => {
      try {
        return successResult(await client.listCookies(id, { limit, cursor }));
      } catch (err) {
        return errorResult(err);
      }
    },
  );

  server.registerTool(
    "consentease_add_cookie",
    {
      title: "Add a cookie to a site",
      description: `Manually add a cookie to a site's inventory (for cookies the scanner cannot auto-detect).

Args:
  - id (string): The site id.
  - name (string): Cookie name, e.g. "_ga".
  - purpose (string): What the cookie does.
  - categoryId (string): A cookie-category id that belongs to THIS site. Compliance categories are created per-site; use a categoryId from this site (e.g. from the compliance report) — a categoryId from another site is rejected.
  - provider (string, optional): e.g. "Google Analytics".
  - expiry (string, optional): e.g. "2 years", "Session".
  - type ("first-party" | "third-party", optional): Defaults to "first-party".

Returns JSON: the created Cookie object. Returns bad_request if categoryId is missing or does not belong to this site. NOTE: not idempotent — calling twice adds two cookies. Requires scope: sites:write.`,
      inputSchema: {
        id: siteId,
        name: z.string().min(1).describe('Cookie name, e.g. "_ga".'),
        purpose: z.string().min(1).describe("What the cookie is used for."),
        categoryId: z
          .string()
          .min(1)
          .describe("A cookie-category id that belongs to THIS site."),
        provider: z.string().optional().describe('Optional provider, e.g. "Google Analytics".'),
        expiry: z.string().optional().describe('Optional expiry, e.g. "2 years" or "Session".'),
        type: z
          .enum(["first-party", "third-party"])
          .optional()
          .describe('Cookie type; defaults to "first-party".'),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ id, name, purpose, categoryId, provider, expiry, type }) => {
      try {
        return successResult(
          await client.addCookie(id, { name, purpose, categoryId, provider, expiry, type }),
        );
      } catch (err) {
        return errorResult(err);
      }
    },
  );
}
