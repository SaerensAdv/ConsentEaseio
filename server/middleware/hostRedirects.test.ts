import { test } from "node:test";
import assert from "node:assert/strict";
import {
  decideHostRedirect,
  isAppPath,
  type HostRoutingConfig,
} from "./hostRedirects";

// Run with:  npx tsx --test server/middleware/hostRedirects.test.ts
// Pure unit tests for the host-routing decision function. No network, no env.

const cfg: HostRoutingConfig = {
  publicHost: "consentease.io",
  appHost: "app.consentease.io",
  publicBaseUrl: "https://consentease.io",
  appBaseUrl: "https://app.consentease.io",
};

test("app subdomain root redirects to /dashboard on the app host", () => {
  assert.deepEqual(decideHostRedirect("app.consentease.io", "/", "/", cfg), {
    status: 302,
    location: "https://app.consentease.io/dashboard",
    reason: "app-host-root->dashboard",
  });
});

test("app subdomain root preserves the querystring when redirecting to /dashboard", () => {
  assert.deepEqual(
    decideHostRedirect("app.consentease.io", "/", "/?ref=welcome", cfg),
    {
      status: 302,
      location: "https://app.consentease.io/dashboard?ref=welcome",
      reason: "app-host-root->dashboard",
    },
  );
});

test("marketing route on the app host redirects to the same path on the public host", () => {
  assert.deepEqual(
    decideHostRedirect("app.consentease.io", "/pricing", "/pricing", cfg),
    {
      status: 301,
      location: "https://consentease.io/pricing",
      reason: "app-host-marketing->public",
    },
  );
});

test("dashboard route on the public host redirects to the app host, preserving the path", () => {
  assert.deepEqual(
    decideHostRedirect(
      "consentease.io",
      "/dashboard/settings",
      "/dashboard/settings",
      cfg,
    ),
    {
      status: 302,
      location: "https://app.consentease.io/dashboard/settings",
      reason: "public-host-app->app",
    },
  );
});

test("tokenized auth URL preserves its querystring across the host redirect", () => {
  assert.deepEqual(
    decideHostRedirect(
      "consentease.io",
      "/reset-password",
      "/reset-password?token=abc123",
      cfg,
    ),
    {
      status: 302,
      location: "https://app.consentease.io/reset-password?token=abc123",
      reason: "public-host-app->app",
    },
  );
});

test("www redirects to the apex public host, preserving path and query", () => {
  assert.deepEqual(
    decideHostRedirect("www.consentease.io", "/pricing", "/pricing?a=1", cfg),
    {
      status: 301,
      location: "https://consentease.io/pricing?a=1",
      reason: "www->apex",
    },
  );
  assert.deepEqual(
    decideHostRedirect("www.consentease.io", "/dashboard", "/dashboard", cfg),
    {
      status: 301,
      location: "https://consentease.io/dashboard",
      reason: "www->apex",
    },
  );
});

test("app pages on the app host are served without redirect (no loop)", () => {
  assert.equal(
    decideHostRedirect("app.consentease.io", "/dashboard", "/dashboard", cfg),
    null,
  );
  assert.equal(
    decideHostRedirect(
      "app.consentease.io",
      "/dashboard/settings",
      "/dashboard/settings",
      cfg,
    ),
    null,
  );
  assert.equal(
    decideHostRedirect(
      "app.consentease.io",
      "/verify-email",
      "/verify-email?token=x",
      cfg,
    ),
    null,
  );
});

test("marketing pages on the public host are served without redirect", () => {
  assert.equal(decideHostRedirect("consentease.io", "/", "/", cfg), null);
  assert.equal(
    decideHostRedirect("consentease.io", "/pricing", "/pricing", cfg),
    null,
  );
  assert.equal(
    decideHostRedirect("consentease.io", "/agency/acme", "/agency/acme?invite=1", cfg),
    null,
  );
});

test("single-host (dev) environments never redirect", () => {
  const dev: HostRoutingConfig = {
    publicHost: "example.replit.dev",
    appHost: "example.replit.dev",
    publicBaseUrl: "https://example.replit.dev",
    appBaseUrl: "https://example.replit.dev",
  };
  assert.equal(decideHostRedirect("example.replit.dev", "/", "/", dev), null);
  assert.equal(
    decideHostRedirect("example.replit.dev", "/dashboard", "/dashboard", dev),
    null,
  );
  assert.equal(
    decideHostRedirect("example.replit.dev", "/pricing", "/pricing", dev),
    null,
  );
});

test("unknown hosts are served without redirect", () => {
  assert.equal(
    decideHostRedirect("some-other-host.com", "/dashboard", "/dashboard", cfg),
    null,
  );
});

test("isAppPath classifies dashboard and auth paths, excluding near-misses", () => {
  assert.equal(isAppPath("/dashboard"), true);
  assert.equal(isAppPath("/dashboard/"), true);
  assert.equal(isAppPath("/dashboard/settings"), true);
  assert.equal(isAppPath("/login"), true);
  assert.equal(isAppPath("/verify-email"), true);
  assert.equal(isAppPath("/verify-email-change"), true);
  assert.equal(isAppPath("/verify-emails"), false);
  assert.equal(isAppPath("/agency/acme"), false);
  assert.equal(isAppPath("/partner/acme"), false);
  assert.equal(isAppPath("/"), false);
});
