const { execSync, execFileSync } = require("child_process");
const { existsSync, mkdirSync, writeFileSync, readdirSync } = require("fs");
const { resolve } = require("path");

const ROOT = __dirname.replace(/[/\\]script$/, "");
process.chdir(ROOT);

console.log("=== Deploy Build ===");
console.log("Node:", process.version);
console.log("CWD:", ROOT);

function run(cmd, label) {
  console.log("\n--- " + label + " ---");
  console.log("> " + cmd);
  try {
    execSync(cmd, { stdio: "inherit", cwd: ROOT });
    console.log("[OK] " + label);
  } catch (err) {
    console.error("[FAIL] " + label + ": " + err.message);
    process.exit(1);
  }
}

if (!existsSync(resolve(ROOT, "node_modules"))) {
  run("npm install --production=false", "Install dependencies");
} else {
  console.log("\nnode_modules exists, skipping install");
}

if (!existsSync("dist")) {
  mkdirSync("dist", { recursive: true });
}

run("node node_modules/vite/bin/vite.js build", "Vite client build");

if (!existsSync("dist/public")) {
  console.error("FATAL: dist/public not created!");
  process.exit(1);
}

console.log("\n--- esbuild server build ---");
try {
  var esbuildArgs = [
    "server/index.ts",
    "--bundle",
    "--platform=node",
    "--format=esm",
    "--outfile=dist/index.mjs",
    "--sourcemap",
    "--external:pg-native",
    "--external:better-sqlite3",
    "--external:playwright",
    "--external:playwright-core",
    "--external:lightningcss",
    "--external:@tailwindcss/oxide",
    "--external:@babel/preset-typescript",
    "--external:esbuild",
    "--external:vite",
    "--external:tailwindcss",
    "--external:@tailwindcss/*",
    "--external:postcss",
    "--external:autoprefixer",
    "--external:@replit/*",
    "--external:./vite",
    "--external:./vite.js",
    "--external:../vite.config",
    "--external:../vite.config.ts",
  ];

  var bannerContent = [
    'import { createRequire as _banner_cr } from "module";',
    'import { fileURLToPath as _banner_fu } from "url";',
    'import { dirname as _banner_dn } from "path";',
    "var require = _banner_cr(import.meta.url);",
    "var __filename = _banner_fu(import.meta.url);",
    "var __dirname = _banner_dn(__filename);",
  ].join("\n");

  esbuildArgs.push("--banner:js=" + bannerContent.replace(/\n/g, ";"));

  execFileSync(
    resolve(ROOT, "node_modules/esbuild/bin/esbuild"),
    esbuildArgs,
    { stdio: "inherit", cwd: ROOT }
  );
  console.log("[OK] esbuild server build");
} catch (err) {
  console.error("[FAIL] esbuild server build: " + err.message);
  process.exit(1);
}

if (!existsSync("dist/index.mjs")) {
  console.error("FATAL: dist/index.mjs not created!");
  process.exit(1);
}

writeFileSync(
  resolve(ROOT, "dist/index.cjs"),
  '(async () => { await import("./index.mjs"); })();\n'
);

console.log("\n=== Build complete ===");
readdirSync("dist").forEach(function (f) {
  console.log("  dist/" + f);
});
