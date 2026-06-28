import { execSync } from "child_process";
import { writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { resolve } from "path";

const ROOT = process.cwd();

console.log("=== ConsentEase Production Build ===");
console.log("Node version:", process.version);
console.log("CWD:", ROOT);
console.log("PATH:", process.env.PATH);

try {
  if (!existsSync("dist")) {
    mkdirSync("dist", { recursive: true });
  }

  // Step 1: Build client
  console.log("\n[1/3] Building client with Vite...");
  try {
    execSync("node node_modules/vite/bin/vite.js build", {
      stdio: "inherit",
      cwd: ROOT,
      env: { ...process.env, NODE_ENV: "production" },
    });
  } catch (err) {
    console.error("FATAL: Vite client build failed!", err.message);
    process.exit(1);
  }

  if (!existsSync("dist/public")) {
    console.error("FATAL: dist/public/ not created by vite!");
    process.exit(1);
  }
  console.log("[1/3] Client build OK.");

  // Step 2: Build server using esbuild JS API
  console.log("\n[2/3] Building server with esbuild...");
  let esbuild;
  try {
    esbuild = await import("esbuild");
  } catch (err) {
    console.error("FATAL: Could not import esbuild:", err.message);
    console.error("Trying fallback via CLI...");
    try {
      const bannerFile = resolve(ROOT, "dist/.banner.js");
      writeFileSync(bannerFile, [
        'import { createRequire } from "module";',
        'import { fileURLToPath } from "url";',
        'import { dirname } from "path";',
        "const require = createRequire(import.meta.url);",
        "const __filename = fileURLToPath(import.meta.url);",
        "const __dirname = dirname(__filename);",
      ].join("\n"));
      execSync(
        `node node_modules/esbuild/bin/esbuild server/index.ts --bundle --platform=node --format=esm --outfile=dist/index.mjs --minify --external:pg-native --external:better-sqlite3 --external:playwright --external:playwright-core --external:lightningcss --external:@tailwindcss/oxide --external:@babel/preset-typescript --external:esbuild --external:vite --external:tailwindcss --external:postcss --external:autoprefixer --external:sharp`,
        { stdio: "inherit", cwd: ROOT }
      );
    } catch (err2) {
      console.error("FATAL: esbuild CLI fallback also failed!", err2.message);
      process.exit(1);
    }
  }

  if (esbuild) {
    try {
      await esbuild.build({
        entryPoints: ["server/index.ts"],
        outfile: "dist/index.mjs",
        platform: "node",
        format: "esm",
        bundle: true,
        minify: true,
        banner: {
          js: [
            'import { createRequire as _banner_cr } from "module";',
            'import { fileURLToPath as _banner_fu } from "url";',
            'import { dirname as _banner_dn } from "path";',
            "var require = _banner_cr(import.meta.url);",
            "var __filename = _banner_fu(import.meta.url);",
            "var __dirname = _banner_dn(__filename);",
          ].join("\n"),
        },
        external: [
          "pg-native",
          "better-sqlite3",
          "playwright",
          "playwright-core",
          "lightningcss",
          "@tailwindcss/oxide",
          "@babel/preset-typescript",
          "esbuild",
          "vite",
          "tailwindcss",
          "@tailwindcss/*",
          "postcss",
          "autoprefixer",
          "@replit/*",
          "./vite",
          "./vite.js",
          "../vite.config",
          "../vite.config.ts",
          "sharp",
        ],
      });
    } catch (err) {
      console.error("FATAL: esbuild.build() failed!", err.message);
      process.exit(1);
    }
  }

  if (!existsSync("dist/index.mjs")) {
    console.error("FATAL: dist/index.mjs not created!");
    process.exit(1);
  }
  console.log("[2/3] Server build OK.");

  // Step 3: Install sharp natively in dist for production runtime
  console.log("\n[3/4] Installing sharp for production runtime...");
  try {
    if (!existsSync("dist/node_modules")) {
      mkdirSync("dist/node_modules", { recursive: true });
    }
    execSync("npm install --prefix dist sharp --no-save", {
      stdio: "inherit",
      cwd: ROOT,
    });
    console.log("[3/4] Sharp installation OK.");
  } catch (err) {
    console.warn("[3/4] Warning: Sharp installation failed, logo upload will be unavailable:", err.message);
  }

  // Step 4: CJS wrapper (simple launcher, no rebuild logic)
  console.log("\n[4/4] Creating CJS entry point...");
  writeFileSync(
    resolve(ROOT, "dist/index.cjs"),
    '(async () => { await import("./index.mjs"); })();\n'
  );

  if (!existsSync("dist/index.cjs")) {
    console.error("FATAL: dist/index.cjs not created!");
    process.exit(1);
  }
  console.log("[4/4] CJS wrapper OK.");

  console.log("\n=== Build complete! ===");
  const files = readdirSync("dist");
  files.forEach((f) => console.log("  dist/" + f));

} catch (err) {
  console.error("\n=== BUILD FAILED (uncaught) ===");
  console.error(err);
  process.exit(1);
}
