import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { logAdminAction } from "@/lib/admin-log";
import { cmsPublishAllDrafts, cmsPublishTypes } from "@/lib/cms/publish";
import { CMS_TYPE_PATHS } from "@/lib/cms/types";

/** Publish every draft CMS item (articles, procedures, documents, templates, updates). */
export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const counts = await cmsPublishAllDrafts();

  for (const path of Object.values(CMS_TYPE_PATHS)) {
    revalidatePath(path);
    revalidatePath(`${path}/[slug]`, "page");
  }
  revalidatePath("/");
  revalidatePath("/search");

  await logAdminAction(
    "cms_publish_all",
    Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, String(v)]))
  );

  return NextResponse.json({ ok: true, counts });
}

/** Publish specific types only — body: { types: ["procedure", "article"] } */
export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { types?: string[] };
  const counts = await cmsPublishTypes(body.types);

  for (const path of Object.values(CMS_TYPE_PATHS)) {
    revalidatePath(path);
  }
  revalidatePath("/");

  return NextResponse.json({ ok: true, counts });
}
