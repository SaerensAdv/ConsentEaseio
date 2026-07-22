import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const source = readFileSync(
  new URL("./websites.tsx", import.meta.url),
  "utf8",
);

test("website summary rates stay rounded to one decimal with the no-view fallback", () => {
  assert.match(
    source,
    /summary\.totalViews\s*>\s*0\s*\?\s*`\$\{summary\.acceptRate\.toFixed\(1\)\}%`\s*:\s*['"]—['"]/,
  );
  assert.match(
    source,
    /summary\.totalViews\s*>\s*0\s*\?\s*`\$\{summary\.rejectRate\.toFixed\(1\)\}%`\s*:\s*['"]—['"]/,
  );
});

test("website summary rates are not rendered as raw percentages", () => {
  assert.doesNotMatch(source, /`\$\{summary\.acceptRate\}%`/);
  assert.doesNotMatch(source, /`\$\{summary\.rejectRate\}%`/);
});
