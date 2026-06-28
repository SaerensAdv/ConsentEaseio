import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ConsentEaseClient } from "../services/apiClient.js";
import { errorResult, successResult } from "./helpers.js";

export function registerConsentTools(server: McpServer, client: ConsentEaseClient): void {
  server.registerTool(
    "consentease_record_consent",
    {
      title: "Record a consent decision",
      description: `Record an end-user's consent decision for a site. This is the billable action (1 view-equivalent unit, counted against the same monthly usage as banner views).

Args:
  - siteId (string): The target site id.
  - visitorId (string): Your anonymized/hashed visitor identifier (do not send raw PII).
  - action ("accept_all" | "reject_all" | "custom"): The decision.
  - consentChoices (object | string): The per-category choices, e.g. { "necessary": true, "analytics": true, "marketing": false }.
  - bannerVersion (string, optional): Version of the banner shown.
  - policyVersion (string, optional): Privacy-policy version at time of consent.
  - userAgent (string, optional): End-user user agent.
  - country (string, optional): Country code.
  - region (string, optional): Region.
  - idempotencyKey (string, REQUIRED): A unique key for THIS consent decision, 1–255 chars from [A-Za-z0-9_.:-] (e.g. a UUID). Because this write is billable and legally meaningful, it must be retry-safe: retrying with the same key after a successful first call does NOT write a second record (returns { deduped: true }); reusing a key for a DIFFERENT operation returns a conflict error. Generate a fresh key per distinct decision.

Returns JSON: { "success": true, "deduped": boolean, "limited"?: boolean }. "limited": true means the record was accepted but the account is over its monthly allowance (a grace cap applies) — treat it as an upgrade signal. Requires scope: consent:write.`,
      inputSchema: {
        siteId: z.string().min(1).describe("The target site id."),
        visitorId: z
          .string()
          .min(1)
          .describe("Anonymized/hashed visitor id — never raw PII."),
        action: z
          .enum(["accept_all", "reject_all", "custom"])
          .describe("The consent decision."),
        consentChoices: z
          .union([z.string(), z.record(z.unknown())])
          .describe('Per-category choices, e.g. { "analytics": true, "marketing": false }.'),
        bannerVersion: z.string().optional().describe("Version of the banner shown."),
        policyVersion: z
          .string()
          .nullable()
          .optional()
          .describe("Privacy-policy version at time of consent."),
        userAgent: z.string().optional().describe("End-user user agent."),
        country: z.string().optional().describe("Country code."),
        region: z.string().optional().describe("Region."),
        idempotencyKey: z
          .string()
          .regex(
            /^[A-Za-z0-9_.:-]{1,255}$/,
            "Idempotency key must be 1–255 chars from [A-Za-z0-9_.:-].",
          )
          .describe(
            "REQUIRED. Unique key for this consent decision (e.g. a UUID) so the billable write is retry-safe.",
          ),
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ idempotencyKey, ...body }) => {
      try {
        return successResult(await client.recordConsent(body, idempotencyKey));
      } catch (err) {
        return errorResult(err);
      }
    },
  );
}
