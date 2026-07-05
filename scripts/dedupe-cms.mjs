#!/usr/bin/env node
/** Remove duplicate CMS records (same content_type + slug), keep newest. */
import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

const storePath = path.join(process.cwd(), "data", "cms", "records.json");

async function dedupeDb() {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error("POSTGRES_URL required");
  const sql = neon(url);
  const dupes = await sql`
    SELECT content_type, slug, array_agg(id ORDER BY updated_at DESC) AS ids
    FROM cms_content
    WHERE slug IS NOT NULL AND status <> 'deleted'
    GROUP BY content_type, slug
    HAVING COUNT(*) > 1
  `;
  let removed = 0;
  for (const row of dupes) {
    const ids = row.ids.slice(1);
    for (const id of ids) {
      await sql`DELETE FROM cms_files WHERE content_id = ${id}`;
      await sql`DELETE FROM cms_content WHERE id = ${id}`;
      removed++;
    }
  }
  return { duplicateGroups: dupes.length, removed };
}

function dedupeLocal() {
  if (!fs.existsSync(storePath)) return { duplicateGroups: 0, removed: 0 };
  const records = JSON.parse(fs.readFileSync(storePath, "utf-8"));
  const map = new Map();
  for (const r of records) {
    const key = `${r.content_type}:${r.slug}`;
    const prev = map.get(key);
    if (!prev || new Date(r.updated_at) > new Date(prev.updated_at)) map.set(key, r);
  }
  const unique = [...map.values()];
  const removed = records.length - unique.length;
  fs.writeFileSync(storePath, JSON.stringify(unique, null, 2));
  return { duplicateGroups: removed, removed };
}

async function main() {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  const result = url ? await dedupeDb() : dedupeLocal();
  console.log("Dedupe complete:", result);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
