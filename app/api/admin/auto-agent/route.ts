import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  getDefaultLlmBackend,
  getLlmBackendStatuses,
} from "@/lib/llm/providers-config";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const backends = getLlmBackendStatuses();
  const defaultBackend = getDefaultLlmBackend();
  const anyConfigured = backends.some((b) => b.configured);

  return NextResponse.json({
    backends,
    defaultBackend,
    anyConfigured,
    workerProviders: ["huggingchat", "ollama"],
    docs: {
      repo: "https://github.com/Decentralised-AI/Free-AUTOGPT-with-NO-API",
      localWorker: "workers/free-autogpt/README.md",
    },
  });
}
