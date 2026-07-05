import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/auth";
import { logAdminAction } from "@/lib/admin-log";
import {
  deleteOperationalBackup,
  getOperationalBackup,
  restoreOperationalBackup,
} from "@/lib/admin/backup";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const backup = await getOperationalBackup(id);
  if (!backup) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const filename = `officemitra-backup-${id.slice(0, 8)}.json`;
  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let action = "restore";
  try {
    const body = await request.json();
    action = typeof body?.action === "string" ? body.action : "restore";
  } catch {
    action = "restore";
  }

  if (action === "delete") {
    const deleted = await deleteOperationalBackup(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  try {
    const restored = await restoreOperationalBackup(id);
    await logAdminAction("backup_restore", { backup_id: id, restored: JSON.stringify(restored) });
    revalidatePath("/admin");
    revalidatePath("/admin/content");
    revalidatePath("/admin/people");
    revalidatePath("/admin/inbox");
    revalidatePath("/admin/nexus");
    revalidatePath("/admin/intelligence");
    return NextResponse.json({ ok: true, restored });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Restore failed" },
      { status: 500 }
    );
  }
}
