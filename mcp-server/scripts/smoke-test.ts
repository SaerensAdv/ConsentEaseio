/**
 * End-to-end smoke test for the ConsentEase MCP server.
 *
 * Mints a real API key against the running dev server (register → create key),
 * then spawns the built MCP server over stdio and exercises the tools.
 *
 * Run from the mcp-server/ directory after `npm run build`:
 *   CONSENTEASE_API_URL=http://localhost:5000 npx tsx scripts/smoke-test.ts
 */
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const API_URL = process.env.CONSENTEASE_API_URL?.replace(/\/+$/, "") ?? "http://localhost:5000";
const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVER_ENTRY = resolve(__dirname, "..", "dist", "index.js");

let passed = 0;
let failed = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  if (ok) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    console.log(`  ❌ ${name}`, detail !== undefined ? JSON.stringify(detail) : "");
  }
}

function textOf(result: any): string {
  return (result?.content ?? [])
    .filter((c: any) => c.type === "text")
    .map((c: any) => c.text)
    .join("\n");
}
function jsonOf(result: any): any {
  if (result?.structuredContent) return result.structuredContent;
  try {
    return JSON.parse(textOf(result));
  } catch {
    return undefined;
  }
}

async function mintApiKey(): Promise<string> {
  const email = `mcp-smoke+${Date.now()}@example.com`;
  const regRes = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "Sm0ke-Test-Pw!", firstName: "MCP", lastName: "Smoke" }),
  });
  if (!regRes.ok) throw new Error(`register failed: ${regRes.status} ${await regRes.text()}`);
  const setCookies = regRes.headers.getSetCookie?.() ?? [];
  const cookie = setCookies.map((c) => c.split(";")[0]).join("; ");
  if (!cookie) throw new Error("no session cookie returned from register");

  const keyRes = await fetch(`${API_URL}/api/api-keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      name: "mcp-smoke-test",
      scopes: ["sites:read", "sites:write", "sites:scan", "consent:write"],
    }),
  });
  if (!keyRes.ok) throw new Error(`create key failed: ${keyRes.status} ${await keyRes.text()}`);
  const body = (await keyRes.json()) as { plaintext?: string };
  if (!body.plaintext) throw new Error("no plaintext key returned");
  return body.plaintext;
}

async function main() {
  console.log(`→ Minting API key against ${API_URL} ...`);
  const apiKey = await mintApiKey();
  console.log(`→ Got key (prefix ${apiKey.slice(0, 16)}…)\n`);

  const env: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) if (v !== undefined) env[k] = v;
  env.CONSENTEASE_API_KEY = apiKey;
  env.CONSENTEASE_API_URL = API_URL;

  const transport = new StdioClientTransport({ command: "node", args: [SERVER_ENTRY], env });
  const client = new Client({ name: "smoke-test", version: "1.0.0" });
  await client.connect(transport);

  try {
    // 1. List tools
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();
    console.log("Tools:", names.join(", "), "\n");
    check("9 tools registered", tools.length === 9, tools.length);
    check(
      "all tools prefixed consentease_",
      tools.every((t) => t.name.startsWith("consentease_")),
    );

    // 2. list_sites (empty)
    const empty = await client.callTool({ name: "consentease_list_sites", arguments: {} });
    const emptyJson = jsonOf(empty);
    check("list_sites returns paginated envelope", Array.isArray(emptyJson?.data), emptyJson);
    check("new account has 0 sites", emptyJson?.data?.length === 0, emptyJson?.data?.length);

    // 3. create_site
    const domain = `smoke-${Date.now()}.example.com`;
    const created = await client.callTool({
      name: "consentease_create_site",
      arguments: { domain },
    });
    const site = jsonOf(created);
    check("create_site returns a site id", typeof site?.id === "string", site);
    check("create_site echoes domain", site?.domain === domain, site?.domain);
    const siteId = site?.id as string;

    // 4. get_embed_snippet
    const embed = await client.callTool({
      name: "consentease_get_embed_snippet",
      arguments: { id: siteId },
    });
    const embedJson = jsonOf(embed);
    check("embed snippet has a script tag", typeof embedJson?.snippet === "string" && embedJson.snippet.includes("<script"), embedJson);

    // 5. get_compliance_report
    const compliance = await client.callTool({
      name: "consentease_get_compliance_report",
      arguments: { id: siteId },
    });
    const compJson = jsonOf(compliance);
    check("compliance report references the site", compJson?.websiteId === siteId, compJson);

    // 6. list_sites again (now 1)
    const after = await client.callTool({ name: "consentease_list_sites", arguments: {} });
    check("list_sites now shows 1 site", jsonOf(after)?.data?.length === 1, jsonOf(after)?.data?.length);

    // 7. list_cookies
    const cookies = await client.callTool({
      name: "consentease_list_cookies",
      arguments: { id: siteId },
    });
    check("list_cookies returns envelope", Array.isArray(jsonOf(cookies)?.data), jsonOf(cookies));

    // 8. record_consent (idempotent)
    const idemKey = `smoke-${Date.now()}`;
    const consent1 = await client.callTool({
      name: "consentease_record_consent",
      arguments: {
        siteId,
        visitorId: "smoke-visitor-1",
        action: "accept_all",
        consentChoices: { necessary: true, analytics: true, marketing: false },
        idempotencyKey: idemKey,
      },
    });
    check("record_consent succeeds", jsonOf(consent1)?.success === true, jsonOf(consent1));
    const consent2 = await client.callTool({
      name: "consentease_record_consent",
      arguments: {
        siteId,
        visitorId: "smoke-visitor-1",
        action: "accept_all",
        consentChoices: { necessary: true, analytics: true, marketing: false },
        idempotencyKey: idemKey,
      },
    });
    check("record_consent dedupes on idempotencyKey replay", jsonOf(consent2)?.deduped === true, jsonOf(consent2));

    // 9. record_consent requires an idempotencyKey (billable write must be retry-safe)
    let consentKeyRequired = false;
    try {
      const missing = await client.callTool({
        name: "consentease_record_consent",
        arguments: {
          siteId,
          visitorId: "smoke-visitor-2",
          action: "accept_all",
          consentChoices: { necessary: true },
        },
      });
      consentKeyRequired = missing.isError === true;
    } catch {
      consentKeyRequired = true; // SDK rejects invalid input as a JSON-RPC error
    }
    check("record_consent rejects a missing idempotencyKey", consentKeyRequired);

    // 10. error contract: invalid site id
    const notFound = await client.callTool({
      name: "consentease_get_site",
      arguments: { id: "00000000-0000-0000-0000-000000000000" },
    });
    check("missing site surfaces an isError tool result", notFound.isError === true, textOf(notFound));
  } finally {
    await client.close();
  }

  console.log(`\n=== ${passed} passed, ${failed} failed ===`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("Smoke test crashed:", err);
  process.exit(1);
});
