import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { injectMetaTags, getMetaForPath } from "./seo-meta";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve static assets with long cache for hashed files
  // Vite generates hashed filenames (e.g., index-abc123.js) so they can be cached forever
  app.use(
    express.static(distPath, {
      maxAge: '1y', // Cache hashed assets for 1 year
      etag: true,
      lastModified: true,
      index: false, // we handle index.html ourselves to inject per-page meta
      setHeaders: (res, filePath) => {
        // index.html should never be cached as-is (we serve a per-page version below)
        if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
        // Hashed assets can be cached forever. Vite emits files like
        // `vendor-misc-XQpJ540K.js` — the hash is base64url-style (mixed
        // case + digits, sometimes with `_` or `-`), so the previous
        // lowercase-hex regex matched none of them. We now match `-<hash>`
        // before the extension for any asset under /assets/, plus the
        // legacy hex pattern as a fallback.
        else if (
          /\/assets\/.+-[A-Za-z0-9_-]{6,}\.(js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|webp|ico)$/i.test(filePath) ||
          /\.[a-f0-9]{8,}\.(js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|webp|ico)$/i.test(filePath)
        ) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
        // Other static assets - moderate cache with revalidation
        else {
          res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
        }
      },
    })
  );

  // Cache the raw template once; meta tags are injected per request below.
  const indexHtmlPath = path.resolve(distPath, "index.html");
  const indexTemplate = fs.readFileSync(indexHtmlPath, "utf-8");

  // SPA fallback with per-page SEO meta injection.
  app.use("*", (req, res) => {
    const pathname = req.originalUrl.split("?")[0] || "/";

    // Authenticated/private routes must never be cached at the edge.
    const isPrivate =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/onboarding") ||
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/reset-password") ||
      pathname.startsWith("/verify-email") ||
      pathname.startsWith("/account");

    // If a session cookie is present we may be hydrating an authenticated
    // shell — never let an upstream CDN cache that variant of the HTML.
    const hasSessionCookie =
      typeof req.headers.cookie === "string" &&
      /(connect\.sid|session|sid)=/.test(req.headers.cookie);

    if (isPrivate || hasSessionCookie) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Vary', 'Cookie');
    } else if (getMetaForPath(pathname)) {
      // Known public marketing route — allow short edge cache with SWR.
      // Browsers always revalidate (max-age=0), but the Replit edge / any
      // upstream CDN can serve a cached copy for 5 minutes and refresh in the
      // background for 24 hours.
      res.setHeader(
        'Cache-Control',
        'public, max-age=0, s-maxage=300, stale-while-revalidate=86400'
      );
    } else {
      // Unknown SPA route — be conservative.
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }

    const html = injectMetaTags(indexTemplate, pathname);
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.send(html);
  });
}
