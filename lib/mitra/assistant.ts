import type { ChatMessage } from "@/lib/llm/chat";
import { geminiChat } from "@/lib/llm/gemini";
import { isPrimaryAiConfigured } from "@/lib/llm/primary-ai";
import { buildMitraContext, type MitraSource } from "./context";

const SYSTEM = `You are Mitra AI — the intelligent assistant on OfficeMitra, a platform for Andhra Pradesh government ministerial and ministerial staff (Health, Finance, Establishment, etc.).

RULES (strict):
1. Answer ONLY using the CONTEXT provided below from OfficeMitra. Do not invent GO numbers, rules, or procedures.
2. Give practical office guidance: steps, documents needed, who approves, common mistakes, CFMS/GPF/APGLI tips when relevant.
3. Cite sources using markdown links exactly as given in context (e.g. [Article title](/knowledge/slug)).
4. If context is insufficient, say so clearly. Tell the user to verify on GOIR (goir.ap.gov.in) before official action.
5. For complex or institution-specific cases, recommend Expert Assistance at /expert-assistance.
6. Never claim to be a government officer or issue official orders. Include brief disclaimer when giving procedural advice.
7. If the user writes in Telugu, respond in Telugu. Otherwise use clear English.
8. Keep answers concise (3–8 short paragraphs or bullet lists). No fluff.

You are grounded in real OfficeMitra content — not general internet knowledge.`;

export interface MitraReply {
  reply: string;
  sources: MitraSource[];
  configured: boolean;
}

export async function askMitra(
  userMessage: string,
  history: ChatMessage[] = []
): Promise<MitraReply> {
  const trimmed = userMessage.trim();
  if (!trimmed) {
    return { reply: "Please ask a question about AP government office procedures.", sources: [], configured: isPrimaryAiConfigured() };
  }

  const { contextText, sources } = await buildMitraContext(trimmed);

  if (!isPrimaryAiConfigured()) {
    return {
      configured: false,
      sources,
      reply: sources.length
        ? `Mitra AI is temporarily offline. Here are relevant guides:\n\n${sources.map((s) => `- [${s.title}](${s.href})`).join("\n")}\n\nFor complex cases, use [Expert Assistance](/expert-assistance).`
        : "Mitra AI is temporarily offline. Try [Search](/search) or [Expert Assistance](/expert-assistance) for help.",
    };
  }

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `${SYSTEM}\n\n--- CONTEXT FROM OFFICEMITRA ---\n${contextText}\n--- END CONTEXT ---`,
    },
    ...history.filter((m) => m.role === "user" || m.role === "assistant").slice(-6),
    { role: "user", content: trimmed },
  ];

  const reply = await geminiChat(messages, { temperature: 0.35, maxOutputTokens: 2048 });
  return { reply, sources, configured: true };
}
