import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { logAdminAction } from "@/lib/admin-log";
import {
  deleteTelegramWebhook,
  getTelegramBotInfo,
  getTelegramWebhookInfo,
  sendTelegramMessage,
  setTelegramWebhook,
} from "@/lib/telegram/client";
import {
  getTelegramAdminChatId,
  getTelegramBotToken,
  getTelegramWebhookSecret,
  isTelegramConfigured,
  isTelegramNotificationsEnabled,
  setTelegramAdminChatId,
  setTelegramNotificationsEnabled,
} from "@/lib/telegram/settings";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tokenSet = !!getTelegramBotToken();
  const chatId = await getTelegramAdminChatId();
  const notificationsEnabled = await isTelegramNotificationsEnabled();
  const configured = await isTelegramConfigured();
  const bot = tokenSet ? await getTelegramBotInfo() : null;
  const webhook = tokenSet ? await getTelegramWebhookInfo() : null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://officemitra.vercel.app";
  const webhookPath = "/api/telegram/webhook";
  const suggestedWebhookUrl = `${siteUrl.replace(/\/$/, "")}${webhookPath}`;

  return NextResponse.json({
    tokenSet,
    chatId: chatId ?? null,
    chatIdFromEnv: !!process.env.TELEGRAM_ADMIN_CHAT_ID?.trim(),
    notificationsEnabled,
    configured,
    bot: bot ? { username: bot.username, name: bot.first_name } : null,
    webhook: {
      url: webhook?.url ?? null,
      pendingUpdates: webhook?.pending_update_count ?? 0,
      suggestedUrl: suggestedWebhookUrl,
      secretConfigured: !!getTelegramWebhookSecret(),
    },
  });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!getTelegramBotToken()) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN is not set on the server" }, { status: 400 });
  }

  let body: {
    action?: string;
    chatId?: string;
    enabled?: boolean;
    webhookUrl?: string;
    message?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = body.action ?? "test";

  try {
    if (action === "setChatId") {
      if (!body.chatId?.trim()) {
        return NextResponse.json({ error: "chatId required" }, { status: 400 });
      }
      await setTelegramAdminChatId(body.chatId.trim());
      await logAdminAction("telegram_set_chat", { chat_id: body.chatId.trim() });
      return NextResponse.json({ ok: true, chatId: body.chatId.trim() });
    }

    if (action === "setNotifications") {
      await setTelegramNotificationsEnabled(body.enabled !== false);
      return NextResponse.json({ ok: true, enabled: body.enabled !== false });
    }

    if (action === "setWebhook") {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://officemitra.vercel.app";
      const url = (body.webhookUrl ?? `${siteUrl.replace(/\/$/, "")}/api/telegram/webhook`).trim();
      await setTelegramWebhook(url, getTelegramWebhookSecret() ?? undefined);
      await logAdminAction("telegram_webhook_set", { url });
      return NextResponse.json({ ok: true, webhookUrl: url });
    }

    if (action === "deleteWebhook") {
      await deleteTelegramWebhook();
      await logAdminAction("telegram_webhook_delete", {});
      return NextResponse.json({ ok: true });
    }

    if (action === "test") {
      const chatId = body.chatId?.trim() || (await getTelegramAdminChatId());
      if (!chatId) {
        return NextResponse.json(
          { error: "No chat ID — message your bot /start on Telegram or enter chat ID here" },
          { status: 400 }
        );
      }
      const text =
        body.message?.trim() ||
        "✅ OfficeMitra admin bot is connected. You will receive alerts for expert requests and community questions.";
      const result = await sendTelegramMessage(text, chatId);
      if (!result.ok) {
        return NextResponse.json({ error: result.error ?? "Send failed" }, { status: 500 });
      }
      await logAdminAction("telegram_test", { chat_id: chatId });
      return NextResponse.json({ ok: true, messageId: result.messageId });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Telegram action failed" },
      { status: 500 }
    );
  }
}
