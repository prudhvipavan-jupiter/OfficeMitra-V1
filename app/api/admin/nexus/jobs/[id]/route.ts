import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { logAdminAction } from "@/lib/admin-log";
import { getNexusJob, saveNexusJob } from "@/lib/nexus/store";
import { publishNexusJob } from "@/lib/nexus/publish";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const job = await getNexusJob(id);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ job });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const job = await getNexusJob(id);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const action = String(body?.action ?? "");

  if (action === "approve") {
    job.status = "APPROVED";
    job.reviewed_at = new Date().toISOString();
  } else if (action === "reject") {
    job.status = "REJECTED";
    job.reviewed_at = new Date().toISOString();
    job.admin_notes = String(body?.admin_notes ?? job.admin_notes ?? "");
  } else if (action === "requeue") {
    job.status = "QUEUED";
    job.error_message = null;
  } else if (action === "edit") {
    const fields = body?.fields ?? {};
    if (fields.title != null) job.title = String(fields.title);
    if (fields.slug != null) job.slug = String(fields.slug);
    if (fields.summary != null) job.summary = String(fields.summary);
    if (fields.telugu_summary != null) job.telugu_summary = String(fields.telugu_summary);
    if (fields.body != null) job.body = String(fields.body);
    if (fields.admin_notes != null) job.admin_notes = String(fields.admin_notes);
    if (job.status === "QUEUED" && job.body) job.status = "DRAFT_READY";
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const saved = await saveNexusJob(job);
  await logAdminAction("nexus_job_update", { job_id: id, action });
  return NextResponse.json({ ok: true, job: saved });
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  if (body?.action !== "publish") {
    return NextResponse.json({ error: "Use action publish" }, { status: 400 });
  }

  try {
    const job = await publishNexusJob(id);
    await logAdminAction("nexus_publish", { job_id: id, slug: job.published_slug ?? "" });
    return NextResponse.json({ ok: true, job });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Publish failed" },
      { status: 400 }
    );
  }
}
