import { readFileSync, unlinkSync } from "fs";

const envPath = ".env.vercel.prod";
const envText = readFileSync(envPath, "utf-8");
const token =
  envText.match(/^TELEGRAM_BOT_TOKEN="(.+)"$/m)?.[1] ??
  envText.match(/^TELEGRAM_BOT_TOKEN=(.+)$/m)?.[1]?.trim();
const secret =
  envText.match(/^TELEGRAM_WEBHOOK_SECRET="(.+)"$/m)?.[1] ??
  envText.match(/^TELEGRAM_WEBHOOK_SECRET=(.+)$/m)?.[1]?.trim();

if (!token) {
  console.error("TELEGRAM_BOT_TOKEN missing");
  process.exit(1);
}

const me = await fetch(`https://api.telegram.org/bot${token}/getMe`).then((r) => r.json());
console.log("Bot:", me.result?.username ?? me.description);

if (secret) {
  const wh = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: "https://officemitra.vercel.app/api/telegram/webhook",
      secret_token: secret,
      drop_pending_updates: true,
      allowed_updates: ["message"],
    }),
  }).then((r) => r.json());
  console.log("Webhook:", wh.ok ? "registered" : wh.description);
  const info = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`).then((r) => r.json());
  console.log("Webhook URL:", info.result?.url);
}

try {
  unlinkSync(envPath);
} catch {
  /* ignore */
}
