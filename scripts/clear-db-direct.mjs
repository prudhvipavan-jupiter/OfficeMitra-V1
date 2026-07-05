#!/usr/bin/env node
/** Direct Neon wipe when API reset is unavailable. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { neon } from "@neondatabase/serverless";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const env = {
  ...loadEnvFile(path.join(ROOT, ".env.production.local")),
  ...loadEnvFile(path.join(ROOT, ".env.local")),
};
const url = process.env.POSTGRES_URL ?? env.POSTGRES_URL ?? env.DATABASE_URL;
if (!url) {
  console.error("POSTGRES_URL not found");
  process.exit(1);
}

const sql = neon(url);
const cleared = {};

cleared.discussions = (await sql`DELETE FROM discussions RETURNING id`).length;
cleared.expert_requests = (await sql`DELETE FROM expert_requests RETURNING id`).length;
await sql`DELETE FROM cms_files`;
cleared.cms_records = (await sql`DELETE FROM cms_content RETURNING id`).length;
cleared.article_feedback = (await sql`DELETE FROM article_feedback RETURNING slug`).length;
cleared.subscribers = (await sql`DELETE FROM digest_subscribers RETURNING email`).length;
cleared.search_queries = (await sql`DELETE FROM search_queries RETURNING id`).length;
cleared.admin_activity = (await sql`DELETE FROM admin_activity RETURNING id`).length;

try {
  cleared.nexus_jobs = (await sql`DELETE FROM nexus_jobs RETURNING id`).length;
} catch {
  cleared.nexus_jobs = 0;
}
try {
  cleared.intel_updates = (await sql`DELETE FROM intel_detected_updates RETURNING id`).length;
} catch {
  cleared.intel_updates = 0;
}

console.log("Neon database cleared:", cleared);
