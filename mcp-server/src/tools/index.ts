import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ConsentEaseClient } from "../services/apiClient.js";
import { registerSiteTools } from "./sites.js";
import { registerCookieTools } from "./cookies.js";
import { registerConsentTools } from "./consent.js";

/** Register every ConsentEase tool on the MCP server. */
export function registerAllTools(server: McpServer, client: ConsentEaseClient): void {
  registerSiteTools(server, client);
  registerCookieTools(server, client);
  registerConsentTools(server, client);
}
