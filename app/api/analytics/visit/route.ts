import { NextRequest, NextResponse } from "next/server";
import { recordPageVisit } from "@/lib/analytics/visitors";

export async function POST(request: NextRequest) {
  let body: { path?: string; sessionId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const path = typeof body.path === "string" ? body.path : "/";
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  const userAgent = request.headers.get("user-agent");

  const recorded = await recordPageVisit(path, sessionId, userAgent);
  return NextResponse.json({ ok: true, recorded });
}
