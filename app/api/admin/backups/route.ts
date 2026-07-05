import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { createOperationalBackup, listOperationalBackups } from "@/lib/admin/backup";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const backups = await listOperationalBackups();
  return NextResponse.json({ backups });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let label: string | undefined;
  try {
    const body = await request.json();
    label = typeof body?.label === "string" ? body.label : undefined;
  } catch {
    label = undefined;
  }

  try {
    const backup = await createOperationalBackup(label);
    return NextResponse.json({ ok: true, backup });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Backup failed" },
      { status: 500 }
    );
  }
}
