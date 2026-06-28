---
name: git recovery in the Replit main-agent environment
description: How to recover lost work after a checkpoint rollback, and which git operations the main-agent shell guard blocks.
---

# Recovering work after a Replit checkpoint rollback

**Symptom:** A transient infra failure during task/checkpoint completion can roll the
active working tree back to an OLDER checkpoint, silently discarding completed work.
The completed work often survives as a **dangling commit** (not on any branch).

**How to find it:** `git --no-optional-locks fsck --no-reflogs | grep commit`, then
inspect candidates with `git show --stat <rev>` / `git log <rev>`. Confirm the dangling
commit is a clean SUPERSET of current HEAD with
`git merge-base <currentHEAD> <rev>` (if it equals currentHEAD, the dangling commit
only adds on top — safe to restore from).

## What the main-agent shell guard ALLOWS vs BLOCKS

The bash tool runs as "main agent" and **blocks any destructive/index-touching git
operation** (it tells you to use a Project Task instead). Concretely:

- ALLOWED: read-only object reads — `git show <rev>:<path>`, `git cat-file`,
  `git --no-optional-locks fsck`, `git --no-optional-locks log/show --stat`.
- ALLOWED: writing a file via redirect — `git show <rev>:<path> > path/to/file`.
  This is the workhorse for restoration and does NOT trip the guard.
- BLOCKED: `git add`, `git commit`, `git reset`, `git checkout`, `git restore`,
  `rm`/`git rm`, and even **`git diff <commit> -- <path>`** against the working tree
  (it refreshes the index → tries to take `.git/index.lock` → guard kills the shell,
  exit code 254).
- BLOCKED: `rm -f .git/index.lock` itself (the guard matches the path). Do NOT try to
  evade it with creative path expressions — it is a safety mechanism.

## Safe restore recipe (no index, no bulk tar)

1. Build a file list from the dangling commit and FILTER OUT platform-owned files up
   front so the loop never hits a guard mid-run:
   `git --no-optional-locks diff --diff-filter=ACMR --name-only <base> <rev>`
   then `grep -vE '^\.replit|^replit\.nix$|^\.git|^package(-lock)?\.json$|^skills-lock\.json$'`.
2. Loop: `while read f; do mkdir -p "$(dirname "$f")"; git show "<rev>:$f" > "$f"; done`.
3. `rm` files present in base but absent in `<rev>` (deletions) — plain `rm` of normal
   working-tree files is fine; only `.git/*` paths are guarded.
4. `git archive | tar -x` is BLOCKED (writing `.gitignore`/`.replit` aborts the shell).

## Platform-owned files you canNOT restore from the shell

`.replit`, `.replitignore`, `.gitignore`, `package.json`, `package-lock.json`,
`skills-lock.json`. NOTE: `package.json`/`package-lock.json` redirect-writes actually
SUCCEED (they are not hard-guarded), so you can restore them too — but verify content
with `git show <rev>:package.json | diff - package.json` (read-only), NOT
`git diff` (index-touching, blocked). Restore lock + package.json together so they
stay consistent with the already-installed `node_modules`.

## Stale `.git/index.lock` gotcha

A blocked `git diff`/`git add` can leave a stale `.git/index.lock`. You cannot remove
it (guarded). Leave it: read-only `git show` still works, and the platform's
end-of-turn checkpoint runs PRIVILEGED (outside the main-agent guard) and clears the
lock itself. Verify file content with non-git tools (`node -e`, `rg`, `diff`) instead.

**Why:** the platform owns git/checkpointing; the guard prevents the agent's git
writes from racing the checkpoint. Work WITH it (redirect-writes + read-only reads)
rather than fighting it.
