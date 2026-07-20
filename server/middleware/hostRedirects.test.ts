import assert from "node:assert/strict";
import test from "node:test";
import { decideHostRedirect, isAppPath, type HostRoutingConfig } from "./hostRedirects";

const config: HostRoutingConfig = {
  publicHost: "consentease.io",
  appHost: "app.consentease.io",
  publicBaseUrl: "https://consentease.io",
  appBaseUrl: "https://app.consentease.io",
};

test("classifies dashboard, auth, onboarding, and demo as app routes", () => {
  for (const path of [
    "/dashboard",
    "/dashboard/analytics",
    "/login",
    "/onboarding",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/verify-email-change",
    "/demo",
  ]) {
    assert.equal(isAppPath(path), true, `${path} should belong to the app host`);
  }

  assert.equal(isAppPath("/pricing"), false);
  assert.equal(isAppPath("/blog/example"), false);
});

test("moves app routes from the public host and preserves query tokens", () => {
  const decision = decideHostRedirect(
    "consentease.io",
    "/reset-password",
    "/reset-password?token=secret-token",
    config,
  );

  assert.deepEqual(decision, {
    status: 302,
    location: "https://app.consentease.io/reset-password?token=secret-token",
    reason: "public-host-app->app",
  });
});

test("starts demo on the app host before it creates a host-only session", () => {
  const decision = decideHostRedirect(
    "consentease.io",
    "/demo",
    "/demo?domain=example.com",
    config,
  );

  assert.deepEqual(decision, {
    status: 302,
    location: "https://app.consentease.io/demo?domain=example.com",
    reason: "public-host-app->app",
  });
});

test("keeps dashboard and auth pages on the app host", () => {
  assert.equal(decideHostRedirect("app.consentease.io", "/dashboard", "/dashboard", config), null);
  assert.equal(decideHostRedirect("app.consentease.io", "/login", "/login", config), null);
  assert.equal(decideHostRedirect("app.consentease.io", "/demo", "/demo", config), null);
});

test("moves marketing pages from app to the public host", () => {
  const decision = decideHostRedirect(
    "app.consentease.io",
    "/pricing",
    "/pricing?currency=eur",
    config,
  );

  assert.deepEqual(decision, {
    status: 301,
    location: "https://consentease.io/pricing?currency=eur",
    reason: "app-host-marketing->public",
  });
});

test("sends app root to dashboard without losing its querystring", () => {
  const decision = decideHostRedirect(
    "app.consentease.io",
    "/",
    "/?from=email",
    config,
  );

  assert.deepEqual(decision, {
    status: 302,
    location: "https://app.consentease.io/dashboard?from=email",
    reason: "app-host-root->dashboard",
  });
});

test("canonicalizes www to the public apex", () => {
  const decision = decideHostRedirect(
    "www.consentease.io",
    "/pricing",
    "/pricing",
    config,
  );

  assert.deepEqual(decision, {
    status: 301,
    location: "https://consentease.io/pricing",
    reason: "www->apex",
  });
});

test("does nothing for unknown and single-host environments", () => {
  assert.equal(decideHostRedirect("preview.replit.dev", "/dashboard", "/dashboard", config), null);
  assert.equal(
    decideHostRedirect("localhost", "/dashboard", "/dashboard", {
      publicHost: "localhost",
      appHost: "localhost",
      publicBaseUrl: "http://localhost:5000",
      appBaseUrl: "http://localhost:5000",
    }),
    null,
  );
});
