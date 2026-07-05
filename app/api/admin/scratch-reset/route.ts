import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { logAdminAction } from "@/lib/admin-log";
import { isAdminAuthenticated } from "@/lib/auth";
import { clearAllWebsiteContent } from "@/lib/admin/scratch-reset";
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
  for (const base of ["/", "/search", "/community", "/knowledge", "/procedures", "/updates", "/documents", "/templates", "/faq", "/glossary"]) {
    revalidatePath(base);
  }
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin");
  revalidatePath("/admin/content");
  revalidatePath("/admin/review");
}

/** Wipe git content files + database — empty public site until new content is added. */
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let backupFirst = true;
  try {
    const body = await request.json();
    if (typeof body?.backupFirst === "boolean") backupFirst = body.backupFirst;
  } catch {
    backupFirst = true;
  }

  try {
    const result = await clearAllWebsiteContent({ backupFirst });
    await logAdminAction("scratch_reset", {
      backup_id: result.backup_id ?? "",
      files: JSON.stringify(result.files),
    });
    revalidateAll();

    return NextResponse.json({
      ok: true,
      ...result,
      message:
        "Website cleared to zero. Articles, procedures, updates, documents, templates, FAQ, and glossary removed. Tools and site shell remain. Add content via CMS, NeXus, or Agent Studio.",
    });
  } catch (err) {
    console.error("[ScratchReset] failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scratch reset failed" },
      { status: 500 }
    );
  }
}
