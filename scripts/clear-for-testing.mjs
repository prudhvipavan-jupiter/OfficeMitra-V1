#!/usr/bin/env node
/**
 * Wipe all CMS content (local files + production DB) for a clean testing slate.
 * Usage: node scripts/clear-for-testing.mjs [--local-only] [--remote-only]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SITE = process.env.SITE_URL ?? "https://theofficemitra.com";

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

function deleteMarkdownTree(dir) {
  if (!fs.existsSync(dir)) return 0;
  let removed = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      removed += deleteMarkdownTree(full);
      if (fs.existsSync(full) && fs.readdirSync(full).length === 0) fs.rmdirSync(full);
    } else if (entry.name.endsWith(".md") && entry.name !== "ORIGINAL-CONTENT-NOTICE.md") {
      fs.unlinkSync(full);
      removed += 1;
    }
  }
  return removed;
}

function deletePdfs(dir) {
  if (!fs.existsSync(dir)) return 0;
  let n = 0;
  for (const name of fs.readdirSync(dir)) {
    if (name.endsWith(".pdf")) {
      fs.unlinkSync(path.join(dir, name));
      n += 1;
    }
  }
  return n;
}

function writeJson(rel, data) {
  const p = path.join(ROOT, "content", rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function clearLocalFiles() {
  const stats = {};
  for (const section of ["articles", "procedures", "updates"]) {
    stats[`markdown:${section}`] = deleteMarkdownTree(path.join(ROOT, "content", section));
  }
  writeJson("documents/metadata.json", []);
  writeJson("templates/metadata.json", []);
  writeJson("faq/items.json", []);
  writeJson("glossary/terms.json", []);
  stats.pdfs_documents = deletePdfs(path.join(ROOT, "public", "downloads", "documents"));
  stats.pdfs_templates = deletePdfs(path.join(ROOT, "public", "downloads", "templates"));

  const manifestPath = path.join(ROOT, "content", "MANIFEST.json");
  const base = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};
  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        ...base,
        generated_at: new Date().toISOString(),
        counts: { articles: 0, procedures: 0, updates: 0, documents: 0, templates: 0, faq: 0, glossary: 0 },
        notice: "Cleared for V1 testing — add content via Admin CMS.",
      },
      null,
      2
    ) + "\n",
    "utf8"
  );

  const dataDir = path.join(ROOT, "data");
  for (const rel of [
    "expert-requests.json",
    "discussions.json",
    "digest-subscribers.json",
    "article-feedback.json",
    "admin-activity.json",
  ]) {
    const p = path.join(dataDir, rel);
    if (fs.existsSync(p)) {
      fs.writeFileSync(p, rel === "article-feedback.json" ? "{}" : "[]", "utf8");
      stats[`file:${rel}`] = 1;
    }
  }

  return stats;
}

async function clearRemote(password) {
  const loginRes = await fetch(`${SITE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!loginRes.ok) {
    throw new Error(`Login failed (${loginRes.status}): ${await loginRes.text()}`);
  }

  const setCookies = loginRes.headers.getSetCookie?.() ?? [];
  const cookieHeader = setCookies.map((c) => c.split(";")[0]).join("; ");
  if (!cookieHeader) {
    throw new Error("No session cookie returned from login");
  }

  const resetRes = await fetch(`${SITE}/api/admin/production-reset`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
  });
  const json = await resetRes.json();
  if (!resetRes.ok) {
    throw new Error(json.error ?? `Production reset failed (${resetRes.status})`);
  }
  return json;
}

const args = new Set(process.argv.slice(2));
const localOnly = args.has("--local-only");
const remoteOnly = args.has("--remote-only");

if (!remoteOnly) {
  const local = clearLocalFiles();
  console.log("Local content cleared:", local);
}

if (!localOnly) {
  const env = { ...loadEnvFile(path.join(ROOT, ".env.local")), ...loadEnvFile(path.join(ROOT, ".env")) };
  const password = process.env.ADMIN_PASSWORD ?? env.ADMIN_PASSWORD;
  if (!password) {
    console.error("ADMIN_PASSWORD not set — skip remote clear or set in .env.local");
    process.exit(1);
  }
  const remote = await clearRemote(password);
  console.log("Production database cleared:", remote.message ?? remote);
  if (remote.database) console.log("DB counts:", remote.database);
}

console.log("\nReady for testing. Redeploy to refresh static routes: npm run build && vercel --prod");
