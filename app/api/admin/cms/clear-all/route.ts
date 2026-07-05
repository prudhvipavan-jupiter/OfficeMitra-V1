import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { logAdminAction } from "@/lib/admin-log";
import { forceClearAllCms } from "@/lib/admin/clear-cms";

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { cleared, dbError } = await forceClearAllCms();
    await logAdminAction("cms_clear_all", { cleared: JSON.stringify(cleared) });
    return NextResponse.json({
      ok: !dbError,
      cleared,
      dbError,
      message: dbError
        ? `Database clear failed: ${dbError}`
        : `Cleared ${cleared.cms_records ?? 0} CMS records from database and ${cleared.local_cms ?? 0} from local fallback.`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "CMS clear failed" },
      { status: 500 }
    );
  }
}
