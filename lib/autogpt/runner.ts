import { chatComplete, type ChatMessage } from "@/lib/llm/chat";
import type { LlmBackendId } from "@/lib/llm/providers-config";

export interface AutoAgentStep {
  step: number;
  thought: string;
  action: string;
  observation: string;
}

export interface AutoAgentResult {
  success: boolean;
  backend: LlmBackendId;
  task: string;
  steps: AutoAgentStep[];
  finalAnswer: string;
  error?: string;
}

const SYSTEM = `You are an autonomous agent for OfficeMitra — an Andhra Pradesh government staff knowledge platform.

Each turn respond with ONLY valid JSON (no markdown fences):
{
  "thought": "brief reasoning",
  "action": "search" | "finish",
  "action_input": "search query when action is search, else empty string",
  "final_answer": "complete answer when action is finish, else empty string"
}

Rules:
- Use "search" when you need current AP government procedure or GO context (max 2 searches per task).
- Use "finish" when you can deliver the final output.
- Write for Indian government office staff — practical, accurate, bilingual notes welcome.
- Never invent GO numbers; say when verification on GOIR is needed.`;

async function duckDuckGoSearch(query: string): Promise<string> {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) return `Search failed (${res.status})`;
  const data = (await res.json()) as {
    AbstractText?: string;
    RelatedTopics?: { Text?: string }[];
  };
  const parts: string[] = [];
  if (data.AbstractText) parts.push(data.AbstractText);
  for (const t of (data.RelatedTopics ?? []).slice(0, 5)) {
    if (t.Text) parts.push(t.Text);
  }
  return parts.length ? parts.join("\n") : "No results — use your training knowledge and note GOIR verification.";
}

function parseAgentJson(raw: string): {
  thought: string;
  action: string;
  action_input: string;
  final_answer: string;
} {
  const trimmed = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
  const parsed = JSON.parse(trimmed) as Record<string, unknown>;
  return {
    thought: String(parsed.thought ?? ""),
    action: String(parsed.action ?? "finish").toLowerCase(),
    action_input: String(parsed.action_input ?? ""),
    final_answer: String(parsed.final_answer ?? parsed.finalAnswer ?? ""),
  };
}

export async function runAutoAgent(input: {
  task: string;
  backend: LlmBackendId;
  maxSteps?: number;
}): Promise<AutoAgentResult> {
  const maxSteps = Math.min(10, Math.max(1, input.maxSteps ?? 5));
  const steps: AutoAgentStep[] = [];
  const history: ChatMessage[] = [
    { role: "system", content: SYSTEM },
    { role: "user", content: `Goal:\n${input.task.trim()}` },
  ];

  try {
    for (let i = 1; i <= maxSteps; i++) {
      const raw = await chatComplete(history, input.backend);
      let parsed: ReturnType<typeof parseAgentJson>;
      try {
        parsed = parseAgentJson(raw);
      } catch {
        steps.push({
          step: i,
          thought: "Model returned non-JSON; treating as final answer",
          action: "finish",
          observation: raw.slice(0, 2000),
        });
        return {
          success: true,
          backend: input.backend,
          task: input.task,
          steps,
          finalAnswer: raw,
        };
      }

      if (parsed.action === "finish" || parsed.final_answer) {
        steps.push({
          step: i,
          thought: parsed.thought,
          action: "finish",
          observation: parsed.final_answer || raw,
        });
        return {
          success: true,
          backend: input.backend,
          task: input.task,
          steps,
          finalAnswer: parsed.final_answer || raw,
        };
      }

      let observation = "";
      if (parsed.action === "search" && parsed.action_input) {
        observation = await duckDuckGoSearch(parsed.action_input);
      } else {
        observation = "Unknown action — proceed to finish on next step.";
      }

      steps.push({
        step: i,
        thought: parsed.thought,
        action: parsed.action,
        observation: observation.slice(0, 1500),
      });

      history.push({ role: "assistant", content: raw });
      history.push({
        role: "user",
        content: `Observation:\n${observation}\n\nContinue toward the goal. Respond with JSON only.`,
      });
    }

    return {
      success: true,
      backend: input.backend,
      task: input.task,
      steps,
      finalAnswer: steps.at(-1)?.observation ?? "Max steps reached without a final answer.",
    };
  } catch (err) {
    return {
      success: false,
      backend: input.backend,
      task: input.task,
      steps,
      finalAnswer: "",
      error: err instanceof Error ? err.message : "Auto agent failed",
    };
  }
}

/** Delegate full task to local Free-AUTOGPT Python worker (BabyAGI-style loop). */
export async function runAutoAgentViaWorker(input: {
  task: string;
  provider?: string;
  maxSteps?: number;
}): Promise<AutoAgentResult> {
  const base = process.env.AUTOGPT_WORKER_URL!.replace(/\/$/, "");
  const res = await fetch(`${base}/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.AUTOGPT_WORKER_KEY
        ? { Authorization: `Bearer ${process.env.AUTOGPT_WORKER_KEY}` }
        : {}),
    },
    body: JSON.stringify({
      task: input.task,
      provider: input.provider ?? "huggingchat",
      max_iterations: input.maxSteps ?? 3,
    }),
    signal: AbortSignal.timeout(300_000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Worker run failed (${res.status}): ${err.slice(0, 300)}`);
  }

  const json = (await res.json()) as {
    success?: boolean;
    final_answer?: string;
    steps?: AutoAgentStep[];
    error?: string;
  };

  return {
    success: json.success !== false,
    backend: "free_worker",
    task: input.task,
    steps: json.steps ?? [],
    finalAnswer: json.final_answer ?? "",
    error: json.error,
  };
}
