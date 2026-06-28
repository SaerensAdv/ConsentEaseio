#!/usr/bin/env node
/**
 * ConsentEase MCP server.
 *
 * A thin client over the ConsentEase Connect REST API (`/api/v1`) that lets
 * coding agents manage consent banners, cookie inventories, and consent
 * records. Authenticates with a single API key (CONSENTEASE_API_KEY) and
 * inherits exactly that key's access and scopes — it grants no extra privilege.
 *
 * Transport: stdio (for local agent installation).
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ConsentEaseClient } from "./services/apiClient.js";
import { registerAllTools } from "./tools/index.js";
import { SERVER_NAME, SERVER_VERSION, resolveApiUrl } from "./constants.js";

async function main(): Promise<void> {
  const apiKey = process.env.CONSENTEASE_API_KEY?.trim();
  if (!apiKey) {
    console.error("ERROR: CONSENTEASE_API_KEY environment variable is required.");
    console.error(
      "Create one in your ConsentEase dashboard (Settings → API Keys), then set it as CONSENTEASE_API_KEY.",
    );
    process.exit(1);
  }

  const apiOrigin = resolveApiUrl();
  const client = new ConsentEaseClient(apiOrigin, apiKey);

  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });
  registerAllTools(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Logs go to stderr so they never corrupt the stdio JSON-RPC stream on stdout.
  console.error(`${SERVER_NAME} v${SERVER_VERSION} running (stdio) → ${apiOrigin}/api/v1`);
}

main().catch((err) => {
  console.error("Fatal error starting consentease-mcp-server:", err);
  process.exit(1);
});
