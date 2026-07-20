import assert from "node:assert/strict";
import test from "node:test";
import { getWebsiteStatusPresentation } from "./website-status";

test("maps compliant to a confirmed scan state", () => {
  const status = getWebsiteStatusPresentation("compliant");
  assert.equal(status.label, "Scan complete");
  assert.equal(status.tone, "success");
  assert.equal(status.action, null);
});

test("maps an active scan to progress rather than success", () => {
  const status = getWebsiteStatusPresentation("scanning");
  assert.equal(status.label, "Scanning now");
  assert.equal(status.tone, "progress");
  assert.match(status.detail, /checking pages, cookies, and scripts/i);
});

test("maps failed and incomplete states to an explicit action", () => {
  for (const rawStatus of ["attention", "needs_attention"]) {
    const status = getWebsiteStatusPresentation(rawStatus);
    assert.equal(status.tone, "warning");
    assert.ok(status.action, `${rawStatus} must provide a next action`);
    assert.notEqual(status.label.toLowerCase(), rawStatus);
  }
});

test("never treats an unknown or missing status as healthy", () => {
  for (const rawStatus of ["future_status", "", null, undefined]) {
    const status = getWebsiteStatusPresentation(rawStatus);
    assert.equal(status.label, "Status unavailable");
    assert.equal(status.tone, "warning");
    assert.ok(status.action);
  }
});

test("status meaning is not communicated by color alone", () => {
  for (const rawStatus of ["compliant", "scanning", "attention", "needs_attention", "unknown"]) {
    const status = getWebsiteStatusPresentation(rawStatus);
    assert.ok(status.label.trim().length > 0);
    assert.ok(status.detail.trim().length > 0);
    assert.ok(status.dotClass.trim().length > 0);
    assert.ok(status.iconClass.trim().length > 0);
    assert.ok(status.surfaceClass.trim().length > 0);
  }
});
