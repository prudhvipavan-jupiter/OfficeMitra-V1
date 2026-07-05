import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { ensureSchema, getSql, isDatabaseEnabled } from "@/lib/db/client";

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseEnabled()) {
    return NextResponse.json({ error: "Database required" }, { status: 400 });
  }

  await ensureSchema();
  const sql = getSql();
  const dupes = await sql`
    SELECT content_type, slug, array_agg(id ORDER BY updated_at DESC) AS ids
    FROM cms_content
    WHERE slug IS NOT NULL AND status <> 'deleted'
    GROUP BY content_type, slug
    HAVING COUNT(*) > 1
  `;
  let removed = 0;
  for (const row of dupes) {
    for (const id of row.ids.slice(1)) {
      await sql`DELETE FROM cms_files WHERE content_id = ${id}`;
      await sql`DELETE FROM cms_content WHERE id = ${id}`;
      removed++;
    }
  }

  return NextResponse.json({ ok: true, duplicateGroups: dupes.length, removed });
}
