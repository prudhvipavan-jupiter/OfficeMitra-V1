import { getMetaValue, setMetaValue } from "@/lib/settings/meta";

const CHAT_ID_KEY = "telegram_admin_chat_id";
const ENABLED_KEY = "telegram_notifications_enabled";

export function getTelegramBotToken(): string | null {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  return token || null;
}

export function getTelegramWebhookSecret(): string | null {
  return process.env.TELEGRAM_WEBHOOK_SECRET?.trim() || null;
}

export async function getTelegramAdminChatId(): Promise<string | null> {
  const fromEnv = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim();
  if (fromEnv) return fromEnv;
  return getMetaValue(CHAT_ID_KEY);
}

export async function setTelegramAdminChatId(chatId: string): Promise<void> {
  await setMetaValue(CHAT_ID_KEY, chatId.trim());
}

export async function isTelegramNotificationsEnabled(): Promise<boolean> {
  const stored = await getMetaValue(ENABLED_KEY);
  if (stored === "false") return false;
  return true;
}

export async function setTelegramNotificationsEnabled(enabled: boolean): Promise<void> {
  await setMetaValue(ENABLED_KEY, enabled ? "true" : "false");
}

export async function isTelegramConfigured(): Promise<boolean> {
  return !!(getTelegramBotToken() && (await getTelegramAdminChatId()));
}
