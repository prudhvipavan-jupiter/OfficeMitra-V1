export type LlmBackendId = "gemini" | "openai" | "ollama" | "openai_compat" | "free_worker";

export interface LlmBackendStatus {
  id: LlmBackendId;
  label: string;
  configured: boolean;
  hint: string;
}

export function getLlmBackendStatuses(): LlmBackendStatus[] {
  return [
    {
      id: "gemini",
      label: "Google Gemini API",
      configured: !!process.env.GEMINI_API_KEY?.trim(),
      hint: "Set GEMINI_API_KEY on Vercel (V1 primary for Agent Studio + NeXus)",
    },
    {
      id: "openai",
      label: "OpenAI API (legacy)",
      configured: !!process.env.OPENAI_API_KEY?.trim(),
      hint: "Optional — Auto Agent only; V1 uses Gemini",
    },
    {
      id: "openai_compat",
      label: "OpenAI-compatible (Groq, OpenRouter, etc.)",
      configured: !!process.env.OPENAI_COMPAT_BASE_URL?.trim(),
      hint: "Set OPENAI_COMPAT_BASE_URL and optional OPENAI_COMPAT_API_KEY",
    },
    {
      id: "ollama",
      label: "Ollama (local)",
      configured: !!process.env.OLLAMA_BASE_URL?.trim(),
      hint: "Run Ollama locally and set OLLAMA_BASE_URL=http://127.0.0.1:11434",
    },
    {
      id: "free_worker",
      label: "Free AutoGPT worker (HuggingChat / local Python)",
      configured: !!process.env.AUTOGPT_WORKER_URL?.trim(),
      hint: "Run workers/free-autogpt locally and set AUTOGPT_WORKER_URL",
    },
  ];
}

export function getDefaultLlmBackend(): LlmBackendId | null {
  const statuses = getLlmBackendStatuses();
  const order: LlmBackendId[] = ["gemini", "openai", "openai_compat", "ollama", "free_worker"];
  for (const id of order) {
    if (statuses.find((s) => s.id === id)?.configured) return id;
  }
  return null;
}

export function isLlmBackendConfigured(id: LlmBackendId): boolean {
  return getLlmBackendStatuses().find((s) => s.id === id)?.configured ?? false;
}
