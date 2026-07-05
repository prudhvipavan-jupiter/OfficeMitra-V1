#!/usr/bin/env node
/** Sync agency-agents Cursor rules into .cursor/rules/ */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src =
  process.env.AGENCY_AGENTS_PATH ??
  path.join(path.dirname(root), "agency-agents", "integrations", "cursor", "rules");
const dest = path.join(root, ".cursor", "rules");

const AGENTS = [
  "technical-writer",
  "content-creator",
  "cms-developer",
  "seo-specialist",
  "document-generator",
  "language-translator",
  "government-digital-presales-consultant",
  "reality-checker",
];

if (!fs.existsSync(src)) {
  console.error("agency-agents not found at:", src);
  console.error("Clone: git clone https://github.com/msitarzewski/agency-agents.git ../agency-agents");
  process.exit(1);
}

fs.mkdirSync(dest, { recursive: true });
for (const id of AGENTS) {
  const from = path.join(src, `${id}.mdc`);
  if (!fs.existsSync(from)) {
    console.warn("Skip missing:", id);
    continue;
  }
  fs.copyFileSync(from, path.join(dest, `${id}.mdc`));
  console.log("Synced", id);
}
console.log("\nCustom OfficeMitra rules (ap-*) are kept as-is in .cursor/rules/");
