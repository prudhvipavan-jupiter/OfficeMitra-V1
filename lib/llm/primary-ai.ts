import type { ChatMessage } from "./chat";
import { geminiChat, geminiGenerateContent, isGeminiConfigured } from "./gemini";

/** V1 primary AI — Google Gemini (Agent Studio, NeXus, Intelligence). */
export function isPrimaryAiConfigured(): boolean {
  return isGeminiConfigured();
}

export async function primaryAiJson(system: string, user: string): Promise<Record<string, unknown>> {
  const content = await geminiGenerateContent({ system, user, json: true });
  return JSON.parse(content) as Record<string, unknown>;
}

export async function primaryAiChat(messages: ChatMessage[]): Promise<string> {
  return geminiChat(messages);
}
