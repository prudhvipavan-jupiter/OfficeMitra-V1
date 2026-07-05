#!/usr/bin/env node
/**
 * Import all generated content into CMS with mixed publish modes:
 * - FAQ, glossary → published
 * - Articles, procedures, documents, templates → draft
 */
import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const cmsDir = path.join(root, "data", "cms");
const storePath = path.join(cmsDir, "records.json");

const PUBLISH_TYPES = new Set(["article", "procedure", "update", "document", "template", "faq", "glossary"]);

function readMarkdownDir(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".md")) {
        const { data, content } = matter(fs.readFileSync(full, "utf-8"));
        out.push({ data, content });
      }
    }
  }
  walk(dir);
  return out;
}

function readLocalRecords() {
  fs.mkdirSync(cmsDir, { recursive: true });
  if (!fs.existsSync(storePath)) return [];
  return JSON.parse(fs.readFileSync(storePath, "utf-8"));
}

function writeLocalRecords(records) {
  fs.writeFileSync(storePath, JSON.stringify(records, null, 2));
}

async function upsertDb(record) {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  const sql = neon(url);
  const existing = await sql`
    SELECT id FROM cms_content WHERE content_type = ${record.content_type} AND slug = ${record.slug} LIMIT 1
  `;
  if (existing[0]) {
    await sql`
      UPDATE cms_content SET status = ${record.status}, data = ${JSON.stringify(record.data)}::jsonb,
        body = ${record.body}, updated_at = NOW() WHERE id = ${existing[0].id}
    `;
    return existing[0].id;
  }
  await sql`
    INSERT INTO cms_content (id, content_type, slug, status, data, body, created_at, updated_at)
    VALUES (${record.id}, ${record.content_type}, ${record.slug}, ${record.status},
      ${JSON.stringify(record.data)}::jsonb, ${record.body}, NOW(), NOW())
  `;
  return record.id;
}

function upsertLocal(record) {
  const records = readLocalRecords();
  const idx = records.findIndex((r) => r.content_type === record.content_type && r.slug === record.slug);
  if (idx >= 0) records[idx] = { ...records[idx], ...record, updated_at: new Date().toISOString() };
  else records.push(record);
  writeLocalRecords(records);
}

async function upsert(record) {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (url) return upsertDb(record);
  upsertLocal(record);
}

async function importMarkdownType(type, dir, slugField = "slug") {
  let draft = 0;
  let published = 0;
  for (const { data, content } of readMarkdownDir(dir)) {
    const status = PUBLISH_TYPES.has(type) ? "published" : (data.status ?? "published");
    await upsert({
      id: randomUUID(),
      content_type: type,
      slug: String(data[slugField] ?? ""),
      status,
      data,
      body: content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (status === "published") published++;
    else draft++;
  }
  return { draft, published, total: draft + published };
}

async function importJsonRecords(type, items, slugFn) {
  let draft = 0;
  let published = 0;
  for (const item of items) {
    const status = PUBLISH_TYPES.has(type) ? "published" : "published";
    await upsert({
      id: randomUUID(),
      content_type: type,
      slug: slugFn(item),
      status,
      data: item,
      body: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (status === "published") published++;
    else draft++;
  }
  return { draft, published, total: items.length };
}

async function main() {
  const counts = {};

  counts.article = await importMarkdownType("article", path.join(root, "content", "articles"));
  counts.procedure = await importMarkdownType("procedure", path.join(root, "content", "procedures"));
  counts.update = await importMarkdownType("update", path.join(root, "content", "updates"));

  const docsPath = path.join(root, "content", "documents", "metadata.json");
  if (fs.existsSync(docsPath)) {
    const docs = JSON.parse(fs.readFileSync(docsPath, "utf-8"));
    counts.document = await importJsonRecords("document", docs, (d) => d.id);
  }

  const tplPath = path.join(root, "content", "templates", "metadata.json");
  if (fs.existsSync(tplPath)) {
    const tpls = JSON.parse(fs.readFileSync(tplPath, "utf-8"));
    counts.template = await importJsonRecords("template", tpls, (t) => t.id);
  }

  const faqPath = path.join(root, "content", "faq", "items.json");
  if (fs.existsSync(faqPath)) {
    const faq = JSON.parse(fs.readFileSync(faqPath, "utf-8"));
    counts.faq = await importJsonRecords("faq", faq, (f) => f.id);
  }

  const glossPath = path.join(root, "content", "glossary", "terms.json");
  if (fs.existsSync(glossPath)) {
    const terms = JSON.parse(fs.readFileSync(glossPath, "utf-8"));
    counts.glossary = await importJsonRecords("glossary", terms, (g) =>
      String(g.slug_key ?? g.term)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
    );
  }

  const mode = process.env.POSTGRES_URL ?? process.env.DATABASE_URL ? "postgres" : "local";
  console.log(`\nImport complete via ${mode}:`);
  for (const [type, c] of Object.entries(counts)) {
    console.log(`  ${type}: ${c.total} (${c.published} published, ${c.draft} draft)`);
  }
  console.log("\nFAQ & glossary are live. Review drafts at /admin/content");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
