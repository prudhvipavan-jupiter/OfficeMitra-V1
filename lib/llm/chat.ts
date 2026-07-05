import type { LlmBackendId } from "./providers-config";
import { isLlmBackendConfigured } from "./providers-config";
import { geminiChat } from "./gemini";
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chatComplete(
  messages: ChatMessage[],
  backend: LlmBackendId
): Promise<string> {
  if (!isLlmBackendConfigured(backend)) {
    throw new Error(`${backend} is not configured on the server`);
  }

  switch (backend) {
    case "gemini":
      return geminiChat(messages);
    case "openai":
      return openAiChat(messages, process.env.OPENAI_API_KEY!, process.env.OPENAI_MODEL ?? "gpt-4o-mini");
    case "openai_compat":
      return openAiChat(
        messages,
        process.env.OPENAI_COMPAT_API_KEY ?? "unused",
        process.env.OPENAI_COMPAT_MODEL ?? "llama-3.1-8b-instant",
        process.env.OPENAI_COMPAT_BASE_URL!.replace(/\/$/, "")
      );
    case "ollama":
      return ollamaChat(messages);
    case "free_worker":
      return workerChat(messages);
    default:
      throw new Error("Unknown LLM backend");
  }
}

async function openAiChat(
  messages: ChatMessage[],
  apiKey: string,
  model: string,
  baseUrl = "https://api.openai.com/v1"
): Promise<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages, temperature: 0.5, max_tokens: 4096 }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LLM request failed (${res.status}): ${err.slice(0, 300)}`);
  }

  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = json.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty LLM response");
  return content;
}

async function ollamaChat(messages: ChatMessage[]): Promise<string> {
  const base = (process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434").replace(/\/$/, "");
  const model = process.env.OLLAMA_MODEL ?? "llama3.2";

  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, stream: false }),
    signal: AbortSignal.timeout(180_000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ollama failed (${res.status}): ${err.slice(0, 300)}`);
  }

  const json = (await res.json()) as { message?: { content?: string } };
  const content = json.message?.content?.trim();
  if (!content) throw new Error("Empty Ollama response");
  return content;
}

async function workerChat(messages: ChatMessage[]): Promise<string> {
  const base = process.env.AUTOGPT_WORKER_URL!.replace(/\/$/, "");
  const res = await fetch(`${base}/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.AUTOGPT_WORKER_KEY
        ? { Authorization: `Bearer ${process.env.AUTOGPT_WORKER_KEY}` }
        : {}),
    },
    body: JSON.stringify({ messages }),
    signal: AbortSignal.timeout(180_000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AutoGPT worker failed (${res.status}): ${err.slice(0, 300)}`);
  }

  const json = (await res.json()) as { content?: string; error?: string };
  if (json.error) throw new Error(json.error);
  if (!json.content?.trim()) throw new Error("Empty worker response");
  return json.content.trim();
}
