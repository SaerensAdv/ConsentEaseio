---
name: Installing deps for an isolated sub-package
description: How to give a nested npm package (e.g. mcp-server/) its own node_modules without polluting the root manifest.
---

When a nested package (e.g. `mcp-server/`) needs its own dependencies that must NOT go into the root app's `package.json`:

- The `bash` tool **blocks `npm install`** outright ("use the packager tool").
- The packager tool (`installLanguagePackages`) targets the **root** `package.json` only — wrong for a self-contained sub-package, and the root manifest is off-limits here anyway.
- **Solution:** `pnpm`, `yarn`, and `bun` are available via Nix and are NOT blocked by the bash guard. Use pnpm scoped to the subdir so it reads that dir's own `package.json` and writes only that dir's `node_modules`:
  - `pnpm --dir mcp-server install`
  - `pnpm --dir mcp-server run build`
  - `pnpm --dir mcp-server exec tsx scripts/foo.ts`
- Do NOT `cd` first (sandbox guidance); use pnpm's `--dir`/`-C` flag instead.

**Why:** keeps a distributable sub-package fully self-contained and leaves the app's root `package.json` untouched, as required.
**How to apply:** any time you build a sibling tool/package inside this repo that ships its own deps.

Side note: an MCP tool handler's return object must include an index signature (`[key: string]: unknown`) to satisfy the SDK's `CallToolResult` type; returning `structuredContent` is allowed without declaring an `outputSchema`.
