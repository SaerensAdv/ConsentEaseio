import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const replitConfig = readFileSync(new URL("../.replit", import.meta.url), "utf8");

test("Replit config never registers a post-merge hook", () => {
  assert.doesNotMatch(replitConfig, /^\s*\[postMerge\]\s*$/m);
  assert.doesNotMatch(replitConfig, /post-merge\.sh/);
});

test("automatic post-merge database script stays absent", () => {
  assert.equal(
    existsSync(new URL("./post-merge.sh", import.meta.url)),
    false,
    "scripts/post-merge.sh must not exist; schema changes require explicit approval",
  );
});

test("Replit config never invokes db:push", () => {
  assert.doesNotMatch(replitConfig, /(?:npm\s+run\s+)?db:push/);
});
