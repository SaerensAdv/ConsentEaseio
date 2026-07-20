import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";

const MAX_FILE_BYTES = 1_000_000;
const SKIPPED_PREFIXES = [
  "attached_assets/",
  "output/",
  "public/",
];
const SKIPPED_FILES = new Set([
  "package-lock.json",
  "script/check-secrets.mjs",
]);

const rules = [
  { name: "private key", pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g },
  { name: "Stripe live secret", pattern: /\bsk_live_[A-Za-z0-9]{16,}\b/g },
  { name: "Stripe webhook secret", pattern: /\bwhsec_[A-Za-z0-9]{16,}\b/g },
  { name: "GitHub token", pattern: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b/g },
  { name: "OpenAI-style key", pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/g },
  { name: "AWS access key", pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g },
  {
    name: "database URL with embedded credentials",
    pattern: /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s/:@]+:[^\s/@]+@[^\s"'`]+/gi,
  },
];

const trackedFiles = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);

const findings = [];

for (const file of trackedFiles) {
  if (SKIPPED_FILES.has(file) || SKIPPED_PREFIXES.some((prefix) => file.startsWith(prefix))) continue;

  let stats;
  try {
    stats = statSync(file);
  } catch {
    continue;
  }
  if (!stats.isFile() || stats.size > MAX_FILE_BYTES) continue;

  let contents;
  try {
    contents = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  if (contents.includes("\0")) continue;

  for (const rule of rules) {
    rule.pattern.lastIndex = 0;
    let match;
    while ((match = rule.pattern.exec(contents)) !== null) {
      const line = contents.slice(0, match.index).split("\n").length;
      findings.push({ file, line, rule: rule.name });
      if (match.index === rule.pattern.lastIndex) rule.pattern.lastIndex += 1;
    }
  }
}

if (findings.length > 0) {
  console.error("Potential committed secrets found:\n");
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} (${finding.rule})`);
  }
  console.error("\nRemove the credential, rotate it, and keep the value in deployment secrets.");
  process.exit(1);
}

console.log(`Secret scan passed across ${trackedFiles.length} tracked files.`);
