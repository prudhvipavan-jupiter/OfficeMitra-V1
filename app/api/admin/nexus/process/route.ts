import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { logAdminAction } from "@/lib/admin-log";
import { processNexusJob, processAllQueued } from "@/lib/nexus/processor";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let jobId: string | undefined;
  let processAll = false;
  try {
    const body = await request.json();
    jobId = typeof body?.jobId === "string" ? body.jobId : undefined;
    processAll = body?.processAll === true;
  } catch {
    /* single job from queue */
  }

  if (processAll) {
    const results = await processAllQueued(10);
    await logAdminAction("nexus_process_batch", { processed: String(results.length) });
    return NextResponse.json({ ok: true, processed: results.length, jobs: results });
  }

  const job = await processNexusJob(jobId);
  if (!job) {
    return NextResponse.json({ error: "No queued jobs to process" }, { status: 404 });
  }

  await logAdminAction("nexus_process", { job_id: job.id, status: job.status });
  return NextResponse.json({ ok: true, job });
}
