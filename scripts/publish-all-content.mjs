#!/usr/bin/env node
/** Publish all draft CMS items. Requires POSTGRES_URL or uses local store. */
import { neon } from "@neondatabase/serverless";

const TYPES = ["article", "procedure", "document", "template", "update", "faq", "glossary"];

async function main() {
  const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
  if (!url) {
    console.error("POSTGRES_URL required");
    process.exit(1);
  }
  const sql = neon(url);
  const counts = {};
  for (const type of TYPES) {
    const rows = await sql`
      UPDATE cms_content SET status = 'published',
        data = jsonb_set(COALESCE(data, '{}'::jsonb), '{status}', '"published"'),
        updated_at = NOW()
      WHERE content_type = ${type} AND status = 'draft'
      RETURNING id
    `;
    counts[type] = rows.length;
  }
  console.log("Published:", counts);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
