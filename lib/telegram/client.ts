import { getTelegramAdminChatId, getTelegramBotToken } from "./settings";

const API_BASE = "https://api.telegram.org";

export interface TelegramSendResult {
  ok: boolean;
  error?: string;
  messageId?: number;
}

export async function telegramApi<T>(
  method: string,
  body?: Record<string, unknown>
): Promise<T> {
  const token = getTelegramBotToken();
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not set");

  const res = await fetch(`${API_BASE}/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30_000),
  });

  const json = (await res.json()) as { ok: boolean; description?: string; result?: T };
  if (!json.ok) {
    throw new Error(json.description ?? `Telegram API error (${res.status})`);
  }
  return json.result as T;
}

export async function sendTelegramMessage(
  text: string,
  chatId?: string,
  parseMode: "HTML" | "Markdown" = "HTML"
): Promise<TelegramSendResult> {
  const token = getTelegramBotToken();
  const target = chatId ?? (await getTelegramAdminChatId());
  if (!token || !target) {
    return { ok: false, error: "Telegram not configured (token or chat ID missing)" };
  }

  try {
    const result = await telegramApi<{ message_id: number }>("sendMessage", {
      chat_id: target,
      text: text.slice(0, 4096),
      parse_mode: parseMode,
      disable_web_page_preview: true,
    });
    return { ok: true, messageId: result.message_id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Send failed" };
  }
}

export async function getTelegramBotInfo(): Promise<{ username?: string; first_name?: string } | null> {
  try {
    return await telegramApi("getMe");
  } catch {
    return null;
  }
}

export async function setTelegramWebhook(webhookUrl: string, secret?: string): Promise<void> {
  await telegramApi("setWebhook", {
    url: webhookUrl,
    secret_token: secret || undefined,
    allowed_updates: ["message"],
    drop_pending_updates: true,
  });
}

export async function deleteTelegramWebhook(): Promise<void> {
  await telegramApi("deleteWebhook", { drop_pending_updates: true });
}

export async function getTelegramWebhookInfo(): Promise<{
  url?: string;
  has_custom_certificate?: boolean;
  pending_update_count?: number;
}> {
  try {
    return await telegramApi("getWebhookInfo");
  } catch {
    return {};
  }
}
