---
name: Empty deploy build logs = treat as transient infra failure
description: How to diagnose a Replit publish/build failure when the captured build log is essentially empty.
---

# Deploy build failed but logs are empty

`getDeploymentBuild()` sometimes returns only the two deployer wrapper lines
(`info: Deployment: <id>` / `info: Build: <id>`) with **none** of the build
script's own stdout — even for a build that ran several minutes. `fetchDeploymentLogs()`
is also empty in this case because the app never reached the serve phase.

## How to rule out the project as the cause (do these before blaming infra)
- Run the real build locally: `npm run build` must exit 0.
- Run the exact production artifact locally and probe the health path:
  `NODE_ENV=production PORT=<free> node dist/index.cjs` then `curl /` must return HTTP 200
  (autoscale promotes on a `GET /` 200 startup probe).
- Scan server **and** client source for bare imports not declared in `package.json`
  (the classic "builds locally, fails in clean cloud build" trap). A successful local
  build already proves there are no unresolved imports, since vite/esbuild fail hard on them.

## Decision
If the build+boot+serve are all healthy locally, there are no undeclared deps, AND
the user also sees nothing in the Publish UI logs → treat it as a **transient
build-infrastructure failure**. Recommend a clean re-publish; if it recurs with still-empty
logs, it's a Replit-side issue → retry again or contact Replit support. Do **not** start
editing code to "fix" an invisible failure.

**Why:** the deploy build runs in Replit's own pipeline; an empty log with a verified-healthy
artifact means the failure is in that pipeline, not the code. Speculative code edits just add risk.

## Do NOT hand-migrate production to "help"
A failed publish leaves prod schema un-applied (e.g. new tables missing). That is expected —
Replit applies the dev→prod schema diff automatically on a *successful* publish. Never run DDL
against prod, never add startup DDL, never put `db:push` in the deploy build command. The fix is
a clean re-publish (see `.local/skills/database/references/database-migrations-on-publish.md`).
