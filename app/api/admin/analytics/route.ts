import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAdminVisitorStats } from "@/lib/analytics/visitors";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = await getAdminVisitorStats();
  return NextResponse.json(stats);
}
