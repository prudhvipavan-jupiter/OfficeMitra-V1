import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  AGENT_DIVISION_LABELS,
  AGENT_TOOLS,
  agentsByCategory,
  getAgentById,
} from "@/lib/agents/registry";
import { AGENT_PIPELINES } from "@/lib/agents/pipeline-config";
import { isPrimaryAiConfigured } from "@/lib/llm/primary-ai";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const agent = getAgentById(id);
    if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ agent });
  }

  const aiConfigured = isPrimaryAiConfigured();

  return NextResponse.json({
    agents: AGENT_TOOLS,
    byCategory: agentsByCategory(),
    categoryLabels: AGENT_DIVISION_LABELS,
    pipelines: AGENT_PIPELINES,
    aiConfigured,
  });
}
