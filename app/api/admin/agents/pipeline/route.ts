import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/admin-log";
import { isAdminAuthenticated } from "@/lib/auth";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getPipelineById, runPipeline } from "@/lib/agents/pipelines";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIp(request);
  const limited = rateLimit(`agent-pipeline:${ip}`, 10, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Retry in ${limited.retryAfter}s` },
      { status: 429 }
    );
  }

  let payload: { pipelineId?: string; input?: Record<string, string> };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const pipelineId = payload.pipelineId ?? "";
  const pipeline = getPipelineById(pipelineId);
  if (!pipeline) {
    return NextResponse.json({ error: "Unknown pipeline" }, { status: 400 });
  }

  const input = payload.input ?? {};
  for (const field of pipeline.inputFields) {
    if (field.required && !input[field.name]?.trim()) {
      if (field.name === "content" && input.slug?.trim()) continue;
      return NextResponse.json({ error: `${field.label} is required` }, { status: 400 });
    }
  }

  if (pipelineId === "beast-review" && input.slug?.trim() && !input.content?.trim()) {
    const { loadContentBySlug } = await import("@/lib/agents/runner");
    const loaded = await loadContentBySlug(input.slug.trim());
    if (loaded) {
      input.content = loaded.body;
      input.title = loaded.title;
    }
  }

  try {
    const result = await runPipeline(pipelineId, input);
    await logAdminAction("agent_pipeline", {
      pipeline: pipelineId,
      success: String(result.success),
      steps: String(result.steps.length),
    });

    return NextResponse.json({
      ok: true,
      pipelineName: pipeline.name,
      saveAsArticle: pipeline.saveAsArticle ?? false,
      saveContentType: pipeline.saveContentType ?? "article",
      ...result,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Pipeline failed" },
      { status: 500 }
    );
  }
}
