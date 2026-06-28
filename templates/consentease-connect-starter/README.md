# ConsentEase Connect — MCP Starter

A ready-to-run project wired to **ConsentEase Connect**. It connects to the
ConsentEase MCP server and calls its tools so you (or your coding agent) can manage
real GDPR/CCPA consent on any website in seconds — and prove it.

> **AI builds your site in minutes. ConsentEase makes it truly GDPR-compliant in
> seconds — and proves it.**

## Run it

1. **Get an API key.** In your [ConsentEase](https://consentease.io) dashboard, go to
   **Settings → API Keys** and create one. The full `ce_live_…` key is shown once —
   copy it.
2. **Add the key.** Open the **Secrets** pane (Tools → Secrets) and add:
   - `CONSENTEASE_API_KEY` = your `ce_live_…` key

   (Outside Replit: copy `.env.example` to `.env` and fill it in.)
3. **Press Run.** You should see the available tools and a live `list_sites` call
   against the production API.

## What this does

`index.js` spawns the published [`@consentease/mcp-server`](https://www.npmjs.com/package/@consentease/mcp-server)
over stdio, lists the tools, and makes one read-only call (`consentease_list_sites`).
It is intentionally small — use it as the seed for your own integration.

The server talks to the live ConsentEase API (`https://consentease.io`) by default.
Set `CONSENTEASE_API_URL` only if you need to point at a local/dev server.

## Use it from a coding agent

This project also ships an `mcp.json` you can hand to an MCP-aware agent (Cursor,
Claude, Windsurf, VS Code). It runs the same server via `npx` and reads your key from
the `CONSENTEASE_API_KEY` environment variable.

## Available tools

| Tool                                  | What it does                                  |
| ------------------------------------- | --------------------------------------------- |
| `consentease_list_sites`              | List your websites (paginated).               |
| `consentease_get_site`                | Fetch one website.                            |
| `consentease_create_site`             | Add a website (banner + categories + scan).   |
| `consentease_scan_site`               | Detect a site's trackers/cookies.             |
| `consentease_get_embed_snippet`       | Get the `<head>` install snippet.             |
| `consentease_get_compliance_report`   | Operational status (not legal advice).        |
| `consentease_list_cookies`            | List a site's cookies (paginated).            |
| `consentease_add_cookie`              | Add a cookie to the inventory.                |
| `consentease_record_consent`          | Record a consent decision (idempotent).       |

## Notes

- Compliance output reflects operational configuration only; it is **not legal advice**
  and **not a determination of GDPR/CCPA compliance**.
- The MCP server inherits exactly your API key's access and scopes — nothing more.
