import { NextResponse } from "next/server";
import { runAutoAgent, runAutoAgentViaWorker } from "@/lib/autogpt/runner";
import { logAdminAction } from "@/lib/admin-log";
import { isAdminAuthenticated } from "@/lib/auth";
import { cmsUpsert } from "@/lib/cms/store";
import type { LlmBackendId } from "@/lib/llm/providers-config";
import { isLlmBackendConfigured, getDefaultLlmBackend } from "@/lib/llm/providers-config";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    task?: string;
    backend?: LlmBackendId;
    maxSteps?: number;
    saveAsDraft?: boolean;
    workerProvider?: string;
    useWorkerRun?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const task = body.task?.trim();
  if (!task || task.length < 10) {
    return NextResponse.json({ error: "Task must be at least 10 characters" }, { status: 400 });
  }

  const backend = body.backend ?? getDefaultLlmBackend() ?? "gemini";
  if (!isLlmBackendConfigured(backend)) {
    return NextResponse.json(
      { error: `${backend} is not configured. Check environment variables or run the local worker.` },
      { status: 400 }
    );
  }

  try {
    const result =
      backend === "free_worker" && body.useWorkerRun !== false
        ? await runAutoAgentViaWorker({
            task,
            provider: body.workerProvider,
            maxSteps: body.maxSteps,
          })
        : await runAutoAgent({ task, backend, maxSteps: body.maxSteps });

    let savedSlug: string | undefined;
    if (body.saveAsDraft && result.success && result.finalAnswer) {
      const slug =
        task
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 60) || `auto-${Date.now()}`;
      const title = task.split("\n")[0].slice(0, 120);
      await cmsUpsert({
        content_type: "article",
        slug,
        status: "draft",
        data: {
          title,
          summary: result.finalAnswer.slice(0, 280),
          category: "establishment",
          source: "auto-agent",
        },
        body: result.finalAnswer,
      });
      savedSlug = slug;
    }

    await logAdminAction("auto_agent_run", {
      backend,
      steps: String(result.steps.length),
      success: String(result.success),
    });

    return NextResponse.json({ ...result, savedSlug });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Run failed" },
      { status: 500 }
    );
  }
}
