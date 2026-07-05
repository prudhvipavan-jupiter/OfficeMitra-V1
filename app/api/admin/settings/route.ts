import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAdminSettingsSummary } from "@/lib/admin/settings-summary";
import { setCmsSyncPaused } from "@/lib/cms/meta";
import { logAdminAction } from "@/lib/admin-log";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getAdminSettingsSummary());
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { cmsSyncPaused?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.cmsSyncPaused === "boolean") {
    await setCmsSyncPaused(body.cmsSyncPaused);
    await logAdminAction("settings_cms_sync", { paused: String(body.cmsSyncPaused) });
  }

  return NextResponse.json(await getAdminSettingsSummary());
}
