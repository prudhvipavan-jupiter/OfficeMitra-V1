import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/admin-log";
import { isAdminAuthenticated } from "@/lib/auth";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getAgentById } from "@/lib/agents/registry";
import { loadContentBySlug, runAgent } from "@/lib/agents/runner";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIp(request);
  const limited = rateLimit(`agent-run:${ip}`, 20, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Retry in ${limited.retryAfter}s` },
      { status: 429 }
    );
  }

  let payload: { agentId?: string; input?: Record<string, string> };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const agentId = payload.agentId ?? "";
  const agent = getAgentById(agentId);
  if (!agent) {
    return NextResponse.json({ error: "Unknown agent" }, { status: 400 });
  }

  const input = { ...(payload.input ?? {}) };

  if (input.slug?.trim() && !input.content?.trim()) {
    const loaded = await loadContentBySlug(input.slug.trim());
    if (loaded) {
      input.content = loaded.body;
      if (!input.title) input.title = loaded.title;
    } else {
      return NextResponse.json({ error: `No article found for slug: ${input.slug}` }, { status: 404 });
    }
  }

  for (const field of agent.inputFields) {
    if (field.required && !input[field.name]?.trim()) {
      return NextResponse.json({ error: `${field.label} is required` }, { status: 400 });
    }
  }

  if (agentId === "cms-developer" && !input.action && !input.question?.trim()) {
    input.action = "scan";
  }

  const result = await runAgent(agentId, input);

  await logAdminAction("agent_run", {
    agent: agentId,
    success: String(result.success),
    usedAi: String(result.usedAi),
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error ?? "Run failed" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    agentId,
    agentName: agent.name,
    usedAi: result.usedAi,
    saveAsArticle: agent.saveAsArticle ?? false,
    output: result.output,
  });
}
