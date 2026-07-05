import type { ChatMessage } from "./chat";

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export function isGeminiConfigured(): boolean {
  return !!(process.env.GEMINI_API_KEY?.trim());
}

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
}

export async function geminiGenerateContent(options: {
  system?: string;
  user: string;
  json?: boolean;
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured on the server");

  const model = getGeminiModel();
  const url = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body: Record<string, unknown> = {
    contents: [{ role: "user", parts: [{ text: options.user }] }],
    generationConfig: {
      temperature: options.temperature ?? 0.4,
      maxOutputTokens: options.maxOutputTokens ?? 4096,
      ...(options.json ? { responseMimeType: "application/json" } : {}),
    },
  };

  if (options.system?.trim()) {
    body.systemInstruction = { parts: [{ text: options.system.trim() }] };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini request failed (${res.status}): ${err.slice(0, 300)}`);
  }

  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    error?: { message?: string };
  };

  if (json.error?.message) throw new Error(json.error.message);

  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
  if (!text) throw new Error("Empty Gemini response");
  return text;
}

export async function geminiChat(
  messages: ChatMessage[],
  options?: { json?: boolean; temperature?: number; maxOutputTokens?: number }
): Promise<string> {
  const systemParts = messages.filter((m) => m.role === "system").map((m) => m.content.trim());
  const system = systemParts.length ? systemParts.join("\n\n") : undefined;

  const contents: { role: string; parts: { text: string }[] }[] = [];
  for (const msg of messages) {
    if (msg.role === "system") continue;
    contents.push({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    });
  }

  if (contents.length === 0) throw new Error("No user/assistant messages for Gemini");

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured on the server");

  const model = getGeminiModel();
  const url = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: options?.temperature ?? 0.5,
      maxOutputTokens: options?.maxOutputTokens ?? 4096,
      ...(options?.json ? { responseMimeType: "application/json" } : {}),
    },
  };

  if (system) {
    body.systemInstruction = { parts: [{ text: system }] };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini request failed (${res.status}): ${err.slice(0, 300)}`);
  }

  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
    error?: { message?: string };
  };

  if (json.error?.message) throw new Error(json.error.message);

  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
  if (!text) throw new Error("Empty Gemini response");
  return text;
}
