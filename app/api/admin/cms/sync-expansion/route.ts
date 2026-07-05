import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { syncCmsFromFiles } from "@/lib/cms/seed";
import { cmsPublishAllDrafts } from "@/lib/cms/publish";
import { setCmsSyncPaused } from "@/lib/cms/meta";
import { logAdminAction } from "@/lib/admin-log";
import { revalidatePath } from "next/cache";
import { CMS_TYPE_PATHS } from "@/lib/cms/types";

/** Import generated content from git files into CMS and publish everything. */
export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await setCmsSyncPaused(false);

  const syncCounts = await syncCmsFromFiles({
    types: ["article", "procedure", "document", "template", "faq", "glossary", "update"],
    onlyEmpty: false,
  });

  const publishCounts = await cmsPublishAllDrafts();

  for (const path of Object.values(CMS_TYPE_PATHS)) {
    revalidatePath(path);
  }
  revalidatePath("/");

  await logAdminAction("cms_sync_expansion", { sync: JSON.stringify(syncCounts), publish: JSON.stringify(publishCounts) });

  return NextResponse.json({ ok: true, sync: syncCounts, published: publishCounts });
}
