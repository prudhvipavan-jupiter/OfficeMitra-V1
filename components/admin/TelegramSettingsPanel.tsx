"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { TELEGRAM_SETUP_STEPS } from "@/lib/admin/guide-content";
import { cn } from "@/lib/utils";

export interface TelegramStatus {
  tokenSet: boolean;
  chatId: string | null;
  notificationsEnabled: boolean;
  configured: boolean;
  bot: { username?: string; name?: string } | null;
  webhook: {
    url: string | null;
    pendingUpdates: number;
    suggestedUrl: string;
    secretConfigured: boolean;
  };
}

export function TelegramSettingsPanel({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<TelegramStatus | null>(null);
  const [chatId, setChatId] = useState("");
  const [loading, setLoading] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/telegram");
    if (res.ok) {
      const json = (await res.json()) as TelegramStatus;
      setStatus(json);
      if (json.chatId) setChatId(json.chatId);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function act(action: string, extra?: Record<string, unknown>) {
    setLoading(action);
    setMsg("");
    try {
      const res = await fetch("/api/admin/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      setMsg(action === "test" ? "Test message sent!" : "Done.");
      await load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading("");
    }
  }

  return (
    <section className={compact ? "" : "jarvis-panel scroll-mt-24 p-6"} id="telegram">
      <h2 className="flex items-center gap-2 text-lg font-semibold admin-text-heading">
        <MessageCircle className="h-5 w-5 text-cyan-500" />
        Telegram bot
      </h2>
      <p className="mt-2 text-sm admin-text-body">
        Mobile alerts for expert requests and community questions. Token is set in Vercel as{" "}
        <code className="rounded bg-black/10 px-1 dark:bg-black/30">TELEGRAM_BOT_TOKEN</code>.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <StatusTile label="Bot token" ok={!!status?.tokenSet} okText="On server" failText="Not set" />
        <div className="rounded-lg border border-navy-100 bg-white p-3 text-sm dark:border-navy-700 dark:bg-navy-800/50">
          <p className="admin-text-muted">Bot</p>
          <p className="admin-text-heading font-medium">
            {status?.bot?.username ? `@${status.bot.username}` : status?.tokenSet ? "…" : "—"}
          </p>
        </div>
        <StatusTile
          label="Linked chat"
          ok={!!status?.configured}
          okText={status?.chatId ?? "Linked"}
          failText="Send /start to bot"
        />
      </div>

      {!compact && (
        <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm admin-text-body">
          {TELEGRAM_SETUP_STEPS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <div>
          <label className="jarvis-label mb-1 block" htmlFor="tg-chat">
            Admin chat ID
          </label>
          <input
            id="tg-chat"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder="From /start reply"
            className="jarvis-input w-48"
          />
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <button
            type="button"
            disabled={!!loading || !chatId}
            onClick={() => act("setChatId", { chatId })}
            className="jarvis-btn text-sm"
          >
            Save chat ID
          </button>
          <button
            type="button"
            disabled={!!loading || !status?.tokenSet}
            onClick={() => act("setWebhook")}
            className="jarvis-btn text-sm"
          >
            {loading === "setWebhook" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Register webhook"}
          </button>
          <button
            type="button"
            disabled={!!loading || !status?.tokenSet}
            onClick={() => act("test", { chatId })}
            className="jarvis-btn-primary inline-flex items-center gap-1 text-sm"
          >
            {loading === "test" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send test
          </button>
        </div>
      </div>

      {status?.webhook.url && (
        <p className="mt-3 text-xs admin-text-muted">
          Webhook: {status.webhook.url} ({status.webhook.pendingUpdates} pending)
        </p>
      )}

      {msg && (
        <p
          className={cn(
            "mt-3 text-sm",
            msg.includes("sent") || msg === "Done." ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-300"
          )}
        >
          {msg}
        </p>
      )}

      <label className="mt-4 flex items-center gap-2 text-sm admin-text-body">
        <input
          type="checkbox"
          checked={status?.notificationsEnabled !== false}
          onChange={(e) => act("setNotifications", { enabled: e.target.checked })}
          className="rounded border-gray-300"
        />
        Automatic alerts (expert requests, community questions)
      </label>
    </section>
  );
}

function StatusTile({
  label,
  ok,
  okText,
  failText,
}: {
  label: string;
  ok: boolean;
  okText: string;
  failText: string;
}) {
  return (
    <div className="rounded-lg border border-navy-100 bg-white p-3 text-sm dark:border-navy-700 dark:bg-navy-800/50">
      <p className="admin-text-muted">{label}</p>
      <p className={ok ? "font-medium text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
        {ok ? okText : failText}
      </p>
    </div>
  );
}
