import { revalidatePath } from "next/cache";
import { setCmsSyncPaused } from "@/lib/cms/meta";
import { localClearAll } from "@/lib/cms/local-store";
import { cmsClearType } from "@/lib/cms/store";
import { CMS_TYPE_PATHS, type CmsContentType } from "@/lib/cms/types";
import { getSql, isDatabaseEnabled } from "@/lib/db/client";
import { clearDatabaseOutageCache } from "@/lib/db/resilience";

const ALL_TYPES: CmsContentType[] = [
  "article",
  "procedure",
  "update",
  "document",
  "template",
  "faq",
  "glossary",
];

export type CmsClearResult = {
  cleared: Record<string, number>;
  dbError?: string;
};

/** Wipe Neon cms_content + local JSON fallback. Bypasses outage cache. */
export async function forceClearAllCms(): Promise<CmsClearResult> {
  await setCmsSyncPaused(true);
  clearDatabaseOutageCache();

  const cleared: Record<string, number> = { local_cms: 0, cms_records: 0 };
  let dbError: string | undefined;

  if (isDatabaseEnabled()) {
    try {
      const sql = getSql();
      const countRows = await sql`SELECT COUNT(*)::int AS c FROM cms_content`;
      const before = Number(countRows[0]?.c ?? 0);
      await sql`DELETE FROM cms_files`;
      await sql`DELETE FROM cms_content`;
      cleared.cms_records = before;
      clearDatabaseOutageCache();
    } catch (err) {
      dbError = err instanceof Error ? err.message : String(err);
      console.error("[CMS] force clear DB failed:", dbError);
      cleared.cms_db_failed = 1;
      for (const type of ALL_TYPES) {
        await cmsClearType(type);
      }
    }
  } else {
    for (const type of ALL_TYPES) {
      await cmsClearType(type);
    }
  }

  try {
    cleared.local_cms = localClearAll();
  } catch (err) {
    console.warn("[CMS] local clear skipped:", err);
    cleared.local_cms_skipped = 1;
  }

  if (!isDatabaseEnabled()) {
    cleared.cms_records = cleared.local_cms;
  }

  for (const type of ALL_TYPES) {
    revalidatePath(CMS_TYPE_PATHS[type]);
  }
  revalidatePath("/");
  revalidatePath("/search");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/review");
  revalidatePath("/admin/content");

  return dbError ? { cleared, dbError } : { cleared };
}
