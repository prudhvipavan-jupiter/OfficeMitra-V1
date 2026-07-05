import { NextResponse } from "next/server";
import { getDraftInbox } from "@/lib/admin/inbox";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { items, summary } = await getDraftInbox();
  return NextResponse.json({ items, summary });
}
