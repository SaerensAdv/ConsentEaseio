const { existsSync } = require("fs");
const { resolve, join } = require("path");
const { execSync } = require("child_process");

const root = __dirname;
const mjsPath = join(root, "dist", "index.mjs");

async function main() {
  if (!existsSync(mjsPath)) {
    console.log("[start.cjs] dist/index.mjs not found, running build...");
    try {
      execSync("node script/build.mjs", { stdio: "inherit", cwd: root });
    } catch (err) {
      console.error("[start.cjs] Build failed:", err.message);
      process.exit(1);
    }
  }

  if (!existsSync(mjsPath)) {
    console.error("[start.cjs] dist/index.mjs still not found after build!");
    process.exit(1);
  }

  console.log("[start.cjs] Starting server...");
  await import("./dist/index.mjs");
}

main().catch((err) => {
  console.error("[start.cjs] Fatal error:", err);
  process.exit(1);
});
