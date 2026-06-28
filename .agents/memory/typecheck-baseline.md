---
name: Typecheck baseline
description: How to typecheck this repo and interpret its large pre-existing tsc error baseline.
---

- The typecheck command is `npm run check` (runs `tsc`). There is no `typecheck` script.
- `tsc` reports a large set of pre-existing errors across unrelated parts of the repo. A fully-clean `tsc` is NOT achievable today, so the overall exit code / total error count cannot tell you whether your own change is clean.

**Why:** The run always fails on unrelated pre-existing errors; judging your change by the global result is misleading.

**How to apply:** After edits, run `npm run check` and filter the output for the specific files you touched (e.g. `npm run check 2>&1 | rg "yourfile\.ts"`). Zero matches for your files means your change is clean. Match the full path — e.g. the real storage layer is `server/storage.ts`, distinct from `server/replit_integrations/chat/storage.ts`, which has its own pre-existing errors.
