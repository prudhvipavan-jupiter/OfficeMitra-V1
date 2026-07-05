import { ensureSchema, getSql, isDatabaseEnabled } from "@/lib/db/client";
import * as local from "./local-store";
import type { CmsContentType, CmsRecord } from "./types";

const PUBLISH_TYPES: CmsContentType[] = [
  "article",
  "procedure",
  "document",
  "template",
  "update",
  "faq",
  "glossary",
];

async function dbPublishAll(types: CmsContentType[]): Promise<Record<string, number>> {
  await ensureSchema();
  const sql = getSql();
  const counts: Record<string, number> = {};

  for (const type of types) {
    const rows = await sql`
      UPDATE cms_content
      SET status = 'published',
          data = jsonb_set(COALESCE(data, '{}'::jsonb), '{status}', '"published"'),
          updated_at = NOW()
      WHERE content_type = ${type} AND status = 'draft'
      RETURNING id
    `;
    counts[type] = rows.length;
  }

  return counts;
}

function localPublishAll(types: CmsContentType[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const type of types) {
    let n = 0;
    const records = local.localList(type, { includeDeleted: false });
    for (const r of records) {
      if (r.status === "draft") {
        const updated: CmsRecord = {
          ...r,
          status: "published",
          data: { ...r.data, status: "published" },
          updated_at: new Date().toISOString(),
        };
        local.localUpsert(updated);
        n++;
      }
    }
    counts[type] = n;
  }
  return counts;
}

export async function cmsPublishAllDrafts(): Promise<Record<string, number>> {
  return cmsPublishTypes(PUBLISH_TYPES);
}

export async function cmsPublishTypes(types?: string[]): Promise<Record<string, number>> {
  const list = (types?.length ? types : PUBLISH_TYPES).filter((t): t is CmsContentType =>
    PUBLISH_TYPES.includes(t as CmsContentType)
  );

  if (isDatabaseEnabled()) return dbPublishAll(list);
  return localPublishAll(list);
}
