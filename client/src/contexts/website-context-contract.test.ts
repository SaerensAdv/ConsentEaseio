import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migratedPages = [
  "client/src/pages/dashboard/overview/use-overview-data.ts",
  "client/src/pages/dashboard/diagnostics.tsx",
  "client/src/pages/dashboard/consent-logs.tsx",
];

async function source(path: string): Promise<string> {
  return readFile(path, "utf8");
}

test("migrated dashboard pages consume the global website context", async () => {
  for (const path of migratedPages) {
    const contents = await source(path);
    assert.match(contents, /useWebsite/, `${path} must consume the global website context`);
    assert.doesNotMatch(
      contents,
      /useState<[^>]*>\([^)]*websiteId|setSelectedWebsite|data-testid=["'`]select-website/,
      `${path} must not recreate a local website selector`,
    );
  }
});

test("dashboard layout renders exactly one global selector", async () => {
  const contents = await source("client/src/pages/dashboard/layout.tsx");
  const occurrences = contents.match(/<GlobalWebsiteSelector\s*\/>/g) || [];
  assert.equal(occurrences.length, 1);
});

test("website context preserves selection in URL and local storage", async () => {
  const contents = await source("client/src/contexts/WebsiteContext.tsx");
  assert.match(contents, /localStorage\.setItem\(STORAGE_KEY, selectedWebsiteId\)/);
  assert.match(contents, /searchParams\.set\(["']websiteId["'], selectedWebsiteId\)/);
  assert.match(contents, /replaceState/);
});

test("website switches gate page content until context and URL agree", async () => {
  const context = await source("client/src/contexts/WebsiteContext.tsx");
  const layout = await source("client/src/pages/dashboard/layout.tsx");

  assert.match(context, /setSelectionReady\(false\)/);
  assert.match(context, /setSelectionReady\(true\)/);
  assert.match(layout, /selectionReady\s*\?/);
  assert.match(layout, /Switching website/);
});
