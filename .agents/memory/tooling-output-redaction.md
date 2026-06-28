---
name: Shell-output redaction mangles api-key identifiers
description: bash/grep (rg) output rewrites strings associated with the API_KEY_PEPPER secret; trust the read tool instead
---

# Shell-output redaction can silently rewrite source identifiers

When this repo has `API_KEY_PEPPER` registered as a secret, the tool-output
redaction layer mangles **bash/grep (`rg`) output** for strings it associates
with that secret. Observed: `ApiKey`→`ln`, `apiKeys`→`n`/`lns`,
`PublicApiKey`→`Publicln`, `ApiKeysManager`→`lnsManager`, `/api/api-keys`→`/api/lns`.
The substitution is **inconsistent between calls** (the same token was redacted
in one grep and left intact in another), which makes it look like real source
corruption.

**Why:** the redaction operates on shell/tool *output*, not on the files. The
files on disk are correct.

**How to apply:** Never conclude a file is corrupted based on `bash`/`rg` output
of api-key-related code. Verify with the `read` tool — its output is NOT redacted
the same way and shows the true file content. The `read` tool confirmed
`client/src/components/ApiKeysManager.tsx` correctly imports `PublicApiKey` and
calls `/api/api-keys[...]`, despite grep showing `Publicln`/`/api/lns`.
