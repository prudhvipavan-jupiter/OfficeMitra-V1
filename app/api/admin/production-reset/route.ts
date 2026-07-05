import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { clearAllOperationalData } from "@/lib/admin/clear-data";
import { forceClearAllCms } from "@/lib/admin/clear-cms";
import { logAdminAction } from "@/lib/admin-log";
import { isAdminAuthenticated } from "@/lib/auth";
import { CMS_TYPE_PATHS, type CmsContentType } from "@/lib/cms/types";

const CMS_TYPES: CmsContentType[] = [
  "article",
  "procedure",
  "update",
  "document",
  "template",
  "faq",
  "glossary",
];

function revalidateAll() {
  for (const type of CMS_TYPES) {
    revalidatePath(CMS_TYPE_PATHS[type]);
  }
  revalidatePath("/");
  revalidatePath("/search");
  revalidatePath("/community");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin");
  revalidatePath("/admin/inbox");
  revalidatePath("/admin/nexus");
  revalidatePath("/admin/intelligence");
  revalidatePath("/admin/people");
  revalidatePath("/admin/review");
}

/** Wipe queues, CMS DB records, intel/nexus jobs, and local JSON fallbacks. */
export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cleared = await clearAllOperationalData();
    const cms = await forceClearAllCms();
    await logAdminAction("production_reset", {
      cleared: JSON.stringify({ ...cleared, ...cms.cleared }),
    });
    revalidateAll();

    return NextResponse.json({
      ok: true,
      cleared: { ...cleared, ...cms.cleared },
      dbError: cms.dbError,
      message:
        "All queues and database content cleared to zero. Live markdown content in git is unchanged — use Review Hub → Sync to republish from files.",
    });
  } catch (err) {
    console.error("[ProductionReset] failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Reset failed" },
      { status: 500 }
    );
  }
}
