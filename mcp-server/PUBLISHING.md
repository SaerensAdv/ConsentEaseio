# Publishing & Distribution — ConsentEase MCP Server

This is the operator handoff for getting `@consentease/mcp-server` discoverable and
installable. The package, README, registry manifest (`server.json`), and Smithery
config (`smithery.yaml`) are prepared in this folder. The steps below **require your
own accounts** (npm, the MCP registry, Smithery, GitHub), so they are documented for
you to run rather than executed automatically.

## Locked decisions (already baked into the files here)

- **Canonical API origin:** `https://consentease.io` (the published package talks to
  production by default; `CONSENTEASE_API_URL` overrides for local/dev).
- **npm package name:** `@consentease/mcp-server` (scoped, public).
- **Registry server name:** `io.consentease/mcp-server` (domain-based namespace,
  verified via DNS on `consentease.io`).

## ⚠️ Confirm before you publish

- **Repository URL.** `package.json`, `server.json`, and the README currently use
  `https://github.com/consentease/mcp-server`. If the real public repo lives
  elsewhere, update all three to match before publishing. The official registry's
  GitHub auth path also requires this repo to be reachable.
- **License.** Set to `MIT` in `package.json` as the conventional choice for a freely
  distributed MCP client (maximizes adoption, matches the "free to install" thesis).
  Change it if you want a different license.

## 1. Publish to npm

Scoped public packages need the `@consentease` org to exist and you to be a member.

```bash
cd mcp-server
npm login                      # your npm account
npm whoami                     # confirm you are logged in
# If the org does not exist yet, create it at https://www.npmjs.com/org/create
# (name: consentease) or via:  npm org create consentease
npm publish --access public    # publishConfig already sets access=public
```

Verify:

```bash
npm view @consentease/mcp-server version
npx -y @consentease/mcp-server   # should start and wait for stdio (Ctrl-C to exit)
```

## 2. Official MCP registry (registry.modelcontextprotocol.io)

The registry validates that the npm package "owns" its registry name. We use the
**domain-based namespace** `io.consentease/*`, which proves ownership of
`consentease.io` via a DNS TXT record — no GitHub org required.

1. Install the publisher CLI:
   ```bash
   # see https://github.com/modelcontextprotocol/registry for the latest install
   brew install mcp-publisher   # or download a release binary
   ```
2. Authenticate by domain (DNS):
   ```bash
   mcp-publisher login dns --domain consentease.io
   ```
   Add the TXT record it prints to the `consentease.io` DNS zone, then continue.
3. Publish the listing (uses `server.json` in this folder):
   ```bash
   mcp-publisher publish
   ```

Notes:
- `package.json` contains `"mcpName": "io.consentease/mcp-server"`, which the registry
  cross-checks against the npm package — keep the two names in sync.
- The registry is young and its `server.json` schema evolves. If `mcp-publisher`
  reports a schema mismatch, run `mcp-publisher --version` and align `server.json`
  with the schema URL that version expects (the `$schema` field at the top of the file).
- Alternative auth: `mcp-publisher login github` with a `io.github.<org>/<repo>` name
  if you prefer the GitHub-based namespace over the domain one.

## 3. Smithery (smithery.ai)

`smithery.yaml` is ready (stdio runtime, prompts for the API key as config).

1. Sign in at https://smithery.ai with the GitHub account that owns the repo.
2. Add/claim the server pointing at the public repo; Smithery reads `smithery.yaml`.
3. Confirm the config form shows **ConsentEase API Key** (required) and the optional
   **ConsentEase API URL** (defaulting to `https://consentease.io`).

## 4. GitHub-indexed directories (earned, no ad spend)

Once the repo and npm package are public, submit a PR adding the server to the
community indexes that AI builders browse:

- `modelcontextprotocol/servers` (community servers list in the README).
- `punkpeye/awesome-mcp-servers` (and similar "awesome-mcp" lists).

Use the same one-liner description as `server.json` for consistency.

## 5. Sanity check the one-command experience

From a clean machine with only a real key set:

```bash
export CONSENTEASE_API_KEY=ce_live_…
npx -y @consentease/mcp-server      # connects to https://consentease.io by default
```

Then add one of the agent config blocks from `README.md` and confirm the agent can
call `consentease_list_sites`.
