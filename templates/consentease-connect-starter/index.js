/**
 * ConsentEase Connect — MCP starter.
 *
 * Spawns the published ConsentEase MCP server over stdio, lists the available
 * tools, and makes one live read-only call (consentease_list_sites) so you can
 * confirm everything is wired up. Use this as the starting point for your own
 * agent integration.
 *
 * Setup:
 *   1. Add your ce_live_… key in the Secrets pane as CONSENTEASE_API_KEY.
 *   2. Press Run.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const apiKey = process.env.CONSENTEASE_API_KEY?.trim();
if (!apiKey) {
  console.error(
    "Missing CONSENTEASE_API_KEY.\n" +
      "Create a key in your ConsentEase dashboard (Settings → API Keys), then add\n" +
      "it in the Secrets pane (Tools → Secrets) as CONSENTEASE_API_KEY.",
  );
  process.exit(1);
}

function textOf(result) {
  return (result?.content ?? [])
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join("\n");
}

function dataOf(result) {
  if (result?.structuredContent) return result.structuredContent;
  try {
    return JSON.parse(textOf(result));
  } catch {
    return undefined;
  }
}

async function main() {
  // The MCP server defaults to the live API (https://consentease.io); set
  // CONSENTEASE_API_URL to point at a local/dev server instead.
  const env = { CONSENTEASE_API_KEY: apiKey };
  if (process.env.CONSENTEASE_API_URL) {
    env.CONSENTEASE_API_URL = process.env.CONSENTEASE_API_URL;
  }

  const transport = new StdioClientTransport({
    command: "npx",
    args: ["-y", "@consentease/mcp-server"],
    env,
  });
  const client = new Client({ name: "consentease-connect-starter", version: "1.0.0" });

  console.log("→ Connecting to the ConsentEase MCP server…");
  await client.connect(transport);

  try {
    const { tools } = await client.listTools();
    console.log(`\n✅ Connected. ${tools.length} tools available:`);
    for (const t of tools) console.log(`   • ${t.name}`);

    console.log("\n→ Calling consentease_list_sites…");
    const result = await client.callTool({
      name: "consentease_list_sites",
      arguments: {},
    });

    if (result.isError) {
      console.error("\n❌ The API rejected the call:");
      console.error(textOf(result));
      console.error(
        "\nCheck that CONSENTEASE_API_KEY is a valid ce_live_… key with the sites:read scope.",
      );
      process.exitCode = 1;
      return;
    }

    const sites = dataOf(result)?.data ?? [];
    if (sites.length === 0) {
      console.log(
        "\nNo sites yet. Create one with the consentease_create_site tool, then\n" +
          "grab its install snippet with consentease_get_embed_snippet.",
      );
    } else {
      console.log(`\nYour sites (${sites.length}):`);
      for (const s of sites) {
        console.log(`   • ${s.domain ?? s.id}  —  ${s.id}`);
      }
    }

    console.log("\nNext steps:");
    console.log("   • consentease_create_site        → add a website");
    console.log("   • consentease_scan_site          → detect its trackers");
    console.log("   • consentease_get_embed_snippet  → get the <head> install snippet");
    console.log("   • consentease_get_compliance_report → check operational status");
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("Starter failed:", err);
  process.exit(1);
});
