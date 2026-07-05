import { NextRequest, NextResponse } from "next/server";
import { getTelegramWebhookSecret } from "@/lib/telegram/settings";
import { handleTelegramUpdate } from "@/lib/telegram/webhook-handler";

export async function POST(request: NextRequest) {
  const secret = getTelegramWebhookSecret();
  if (secret) {
    const header = request.headers.get("x-telegram-bot-api-secret-token");
    if (header !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const update = await request.json();
    await handleTelegramUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Telegram webhook]", err);
    return NextResponse.json({ ok: true });
  }
}
