import { execSync } from "child_process";

try {
  execSync("node script/build.mjs", { stdio: "inherit", cwd: process.cwd() });
} catch (err) {
  console.error("Build failed!");
  process.exit(1);
}
