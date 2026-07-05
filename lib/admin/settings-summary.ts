import { isDatabaseEnabled } from "@/lib/db/client";
import { getDatabaseStatus } from "@/lib/db/resilience";
import { isCmsSyncPaused } from "@/lib/cms/meta";
import { getLlmBackendStatuses, getDefaultLlmBackend } from "@/lib/llm/providers-config";
import { isPrimaryAiConfigured } from "@/lib/llm/primary-ai";
import { isIntelligenceEnabled } from "@/lib/intelligence/store";
import { isTelegramConfigured } from "@/lib/telegram/settings";
import { getTelegramBotToken } from "@/lib/telegram/settings";

export interface EnvVarStatus {
  key: string;
  configured: boolean;
  hint: string;
  group: "core" | "ai" | "integrations" | "cms";
}

function envSet(key: string): boolean {
  return !!(process.env[key]?.trim());
}

export function getEnvVarStatuses(): EnvVarStatus[] {
  return [
    { key: "POSTGRES_URL", configured: isDatabaseEnabled(), hint: "Neon / Vercel Postgres", group: "core" },
    { key: "ADMIN_PASSWORD", configured: envSet("ADMIN_PASSWORD"), hint: "Admin login", group: "core" },
    { key: "NEXT_PUBLIC_SITE_URL", configured: envSet("NEXT_PUBLIC_SITE_URL"), hint: "Public site URL", group: "core" },
    { key: "GEMINI_API_KEY", configured: envSet("GEMINI_API_KEY"), hint: "V1 primary — Agent Studio + NeXus + Intel", group: "ai" },
    { key: "GEMINI_MODEL", configured: envSet("GEMINI_MODEL"), hint: "Optional — default gemini-2.0-flash", group: "ai" },
    { key: "OPENAI_API_KEY", configured: envSet("OPENAI_API_KEY"), hint: "Legacy — Auto Agent optional backend", group: "ai" },
    { key: "OPENAI_COMPAT_BASE_URL", configured: envSet("OPENAI_COMPAT_BASE_URL"), hint: "Groq / OpenRouter", group: "ai" },
    { key: "OLLAMA_BASE_URL", configured: envSet("OLLAMA_BASE_URL"), hint: "Local Ollama", group: "ai" },
    { key: "AUTOGPT_WORKER_URL", configured: envSet("AUTOGPT_WORKER_URL"), hint: "Free AutoGPT worker", group: "ai" },
    { key: "TELEGRAM_BOT_TOKEN", configured: !!getTelegramBotToken(), hint: "Telegram bot", group: "integrations" },
    { key: "TELEGRAM_WEBHOOK_SECRET", configured: envSet("TELEGRAM_WEBHOOK_SECRET"), hint: "Webhook security", group: "integrations" },
    { key: "RESEND_API_KEY", configured: envSet("RESEND_API_KEY"), hint: "Email notifications", group: "integrations" },
    { key: "NEXUS_WORKER_URL", configured: envSet("NEXUS_WORKER_URL"), hint: "Optional Python NeXus", group: "cms" },
    { key: "CMS_AUTO_SYNC", configured: envSet("CMS_AUTO_SYNC"), hint: "Default true if unset", group: "cms" },
  ];
}

export async function getAdminSettingsSummary() {
  const db = getDatabaseStatus();
  const cmsSyncPaused = await isCmsSyncPaused();
  const llmBackends = getLlmBackendStatuses();
  const telegramConfigured = await isTelegramConfigured();

  return {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://officemitra.vercel.app",
    system: {
      database: db,
      postgresConfigured: isDatabaseEnabled(),
      intelligence: isIntelligenceEnabled(),
    },
    ai: {
      gemini: isPrimaryAiConfigured(),
      defaultBackend: getDefaultLlmBackend(),
      backends: llmBackends,
      anyLlm: llmBackends.some((b) => b.configured),
    },
    cms: {
      autoSync: process.env.CMS_AUTO_SYNC !== "false",
      autoPublish: process.env.CMS_AUTO_PUBLISH === "true",
      syncPaused: cmsSyncPaused,
    },
    integrations: {
      telegram: telegramConfigured,
      email: envSet("RESEND_API_KEY"),
      nexusWorker: envSet("NEXUS_WORKER_URL"),
    },
    envVars: getEnvVarStatuses(),
  };
}
