import { NextRequest, NextResponse } from "next/server";
import type { ChatMessage } from "@/lib/llm/chat";
import { askMitra } from "@/lib/mitra/assistant";
import { isMitraPublicEnabled } from "@/lib/mitra/config";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  if (!isMitraPublicEnabled()) {
    return NextResponse.json({ error: "Mitra AI is not available." }, { status: 503 });
  }

  const ip = getClientIp(request);
  const limited = rateLimit(`mitra:${ip}`, 20, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later.", retryAfter: limited.retryAfter },
      { status: 429 }
    );
  }

  let body: { message?: string; history?: { role: string; content: string }[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message || message.length > 2000) {
    return NextResponse.json({ error: "Message required (max 2000 characters)" }, { status: 400 });
  }

  const history: ChatMessage[] = (body.history ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-8)
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content.slice(0, 4000) }));

  try {
    const result = await askMitra(message, history);
    return NextResponse.json(result);
  } catch (e) {
    console.error("[Mitra]", e);
    return NextResponse.json(
      { error: "Mitra AI could not respond. Try again or use Expert Assistance." },
      { status: 500 }
    );
  }
}
