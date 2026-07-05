import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { logAdminAction } from "@/lib/admin-log";
import { listNexusJobs, getNexusStats } from "@/lib/nexus/store";
import type { NexusTab } from "@/lib/nexus/types";
import { isPrimaryAiConfigured } from "@/lib/llm/primary-ai";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get("status") as NexusTab | null;
  const [stats, jobs] = await Promise.all([
    getNexusStats(),
    listNexusJobs(status ?? undefined),
  ]);

  return NextResponse.json({
    stats,
    jobs,
    aiConfigured: isPrimaryAiConfigured(),
    workerConfigured: !!process.env.NEXUS_WORKER_URL,
  });
}
