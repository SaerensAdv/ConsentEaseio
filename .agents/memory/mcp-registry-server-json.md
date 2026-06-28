---
name: MCP registry server.json format
description: Field casing, schema version, and validation source-of-truth for the official MCP registry manifest (server.json).
---

# MCP registry `server.json`

When publishing an MCP server to the **official MCP registry** (registry.modelcontextprotocol.io), the `server.json` manifest format is easy to get wrong because the format has changed over time and LLM advice is often stale.

## Rules (verified against the live registry, not from memory)
- The current published manifests use **camelCase**, not snake_case: `registryType`, `registryBaseUrl`, `environmentVariables`, `isRequired`, `isSecret`, plus `name`, `identifier`, `version`, `transport.type`.
- The `$schema` is versioned by date, e.g. `https://static.modelcontextprotocol.io/schemas/<DATE>/server.schema.json` (the registry was emitting `2025-12-11` when this note was written). The `.../<DATE>/server.json` form 404s — it must end in `server.schema.json`.
- The schema (draft-07, uses `definitions` not `$defs`) caps only a few fields via `maxLength`: top-level `description` = **100**, `name` = 200, `title` = 100, `version` = 255, `Icon.src` = 255. Package-level `environmentVariables[].description` is **uncapped**.

**Why:** an architect/code-review pass once confidently recommended snake_case + the `2025-07-09/server.json` schema URL — both wrong for the then-current registry. Baking that in would have failed registry submission.

**How to apply:** before editing `server.json`, fetch ground truth instead of trusting recalled field names:
- Live examples (definitive casing): `curl -sL "https://registry.modelcontextprotocol.io/v0/servers?limit=40"` and inspect a `packages[]` entry with `environmentVariables`.
- The schema itself: read the `$schema` URL of those live entries and map each `maxLength` to its field.
- Validate the final file with `mcp-publisher` before submitting.
