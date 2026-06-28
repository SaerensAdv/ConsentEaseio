# ConsentEase MCP Server

An [MCP](https://modelcontextprotocol.io) server that lets coding agents (Cursor,
Claude, Windsurf, VS Code, and others) manage ConsentEase consent banners, cookie
inventories, and consent records. It is a **thin client over the ConsentEase Connect
REST API** (`/api/v1`) — it holds your API key and inherits exactly that key's access
and scopes, nothing more.

> **AI builds your site in minutes. ConsentEase makes it truly GDPR-compliant in
> seconds — and proves it.**

## Quick start (one command)

You only need a ConsentEase API key. The server runs straight from npm — no clone,
no build:

```bash
npx @consentease/mcp-server
```

Create a key in your dashboard under **Settings → API Keys** (the full `ce_live_…`
key is shown once — store it safely), then add the server to your agent using one of
the copy-paste blocks below.

## Requirements

- Node.js >= 18
- A ConsentEase API key (`ce_live_…`)

## Configuration

The server is configured entirely through environment variables:

| Variable               | Required | Default                  | Description                                                                                  |
| ---------------------- | -------- | ------------------------ | -------------------------------------------------------------------------------------------- |
| `CONSENTEASE_API_KEY`  | yes      | —                        | Your `ce_live_…` API key.                                                                    |
| `CONSENTEASE_API_URL`  | no       | `https://consentease.io` | The ConsentEase origin (no `/api/v1` suffix). Only set this to target a local/dev server.    |

By default the server talks to the live ConsentEase production API, so you do not
need to set `CONSENTEASE_API_URL` at all.

## Add it to your agent

Replace `ce_live_…` with your real key in each example.

### Cursor

Add to `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (per-project):

```json
{
  "mcpServers": {
    "consentease": {
      "command": "npx",
      "args": ["-y", "@consentease/mcp-server"],
      "env": {
        "CONSENTEASE_API_KEY": "ce_live_…"
      }
    }
  }
}
```

### Claude Desktop

Add to `claude_desktop_config.json`
(macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`,
Windows: `%APPDATA%\Claude\claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "consentease": {
      "command": "npx",
      "args": ["-y", "@consentease/mcp-server"],
      "env": {
        "CONSENTEASE_API_KEY": "ce_live_…"
      }
    }
  }
}
```

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "consentease": {
      "command": "npx",
      "args": ["-y", "@consentease/mcp-server"],
      "env": {
        "CONSENTEASE_API_KEY": "ce_live_…"
      }
    }
  }
}
```

### VS Code

Add to `.vscode/mcp.json` (per-project). VS Code prompts for the key on first run
instead of storing it in the file:

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "consentease-api-key",
      "description": "ConsentEase API key (ce_live_…)",
      "password": true
    }
  ],
  "servers": {
    "consentease": {
      "command": "npx",
      "args": ["-y", "@consentease/mcp-server"],
      "env": {
        "CONSENTEASE_API_KEY": "${input:consentease-api-key}"
      }
    }
  }
}
```

## Tools

| Tool                                  | Scope           | Read-only | Notes                                  |
| ------------------------------------- | --------------- | --------- | -------------------------------------- |
| `consentease_list_sites`              | `sites:read`    | ✅        | Cursor-paginated.                      |
| `consentease_get_site`                | `sites:read`    | ✅        |                                        |
| `consentease_create_site`             | `sites:write`   | ❌        | Provisions banner + categories + scan. |
| `consentease_scan_site`               | `sites:scan`    | ❌        | Daily-limited rescan.                  |
| `consentease_get_embed_snippet`       | `sites:read`    | ✅        | Install snippet for the `<head>`.      |
| `consentease_get_compliance_report`   | `sites:read`    | ✅        | Operational status — not legal advice. |
| `consentease_list_cookies`            | `sites:read`    | ✅        | Cursor-paginated.                      |
| `consentease_add_cookie`              | `sites:write`   | ❌        |                                        |
| `consentease_record_consent`          | `consent:write` | ❌        | Billable; requires an `idempotencyKey`.|

## Local development

To run against a local ConsentEase dev server instead of production:

```bash
git clone https://github.com/consentease/mcp-server.git
cd mcp-server
npm install
npm run build
CONSENTEASE_API_KEY=ce_live_… CONSENTEASE_API_URL=http://localhost:5000 npm start
```

Or with live reload:

```bash
CONSENTEASE_API_KEY=ce_live_… CONSENTEASE_API_URL=http://localhost:5000 npm run dev
```

## Notes

- All errors follow the API's `{ error, code, hint }` contract and are surfaced as
  actionable tool errors.
- Compliance output reflects operational configuration only; it is **not legal advice**
  and **not a determination of GDPR/CCPA compliance**.
