"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Bot,
  Database,
  Globe,
  Loader2,
  MessageCircle,
  Palette,
  Server,
  Settings,
  Sparkles,
} from "lucide-react";
import { AdminModeToggle } from "@/components/admin/AdminModeToggle";
import { JarvisPage, JarvisPageHeader } from "@/components/admin/jarvis/JarvisPage";
import { TelegramSettingsPanel } from "@/components/admin/TelegramSettingsPanel";
import type { EnvVarStatus } from "@/lib/admin/settings-summary";
import type { LlmBackendStatus } from "@/lib/llm/providers-config";
import { cn } from "@/lib/utils";

type SettingsTab = "general" | "integrations" | "ai" | "environment";

interface SettingsData {
  siteUrl: string;
  system: {
    database: "disabled" | "ok" | "unavailable";
    postgresConfigured: boolean;
    intelligence: boolean;
  };
  ai: {
    gemini: boolean;
    defaultBackend: string | null;
    backends: LlmBackendStatus[];
    anyLlm: boolean;
  };
  cms: {
    autoSync: boolean;
    autoPublish: boolean;
    syncPaused: boolean;
  };
  integrations: {
    telegram: boolean;
    email: boolean;
    nexusWorker: boolean;
  };
  envVars: EnvVarStatus[];
}

const TABS: { id: SettingsTab; label: string; icon: typeof Settings }[] = [
  { id: "general", label: "General", icon: Palette },
  { id: "integrations", label: "Integrations", icon: MessageCircle },
  { id: "ai", label: "AI & agents", icon: Bot },
  { id: "environment", label: "Environment", icon: Server },
];

export function AdminSettingsDashboard() {
  const [tab, setTab] = useState<SettingsTab>("general");
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load settings");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleCmsSyncPaused(paused: boolean) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cmsSyncPaused: paused }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading && !data) {
    return (
      <JarvisPage>
        <p className="flex items-center gap-2 admin-text-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading settings…
        </p>
      </JarvisPage>
    );
  }

  return (
    <JarvisPage>
      <JarvisPageHeader
        label="Configuration"
        title="Settings"
        subtitle="Portal preferences, integrations, AI backends, and Vercel environment checklist."
      />

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition",
              tab === id
                ? "bg-navy-800 text-white dark:bg-cyan-500/20 dark:text-cyan-200"
                : "bg-navy-100 text-navy-700 hover:bg-navy-200 dark:bg-navy-800 dark:text-navy-200"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "general" && data && (
        <div className="space-y-6">
          <section className="jarvis-panel p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold admin-text-heading">
              <Palette className="h-5 w-5" /> Appearance
            </h2>
            <p className="mt-2 text-sm admin-text-body">Switch between Normal admin and OM-Jupiter command theme.</p>
            <div className="mt-4">
              <AdminModeToggle />
            </div>
          </section>

          <section className="jarvis-panel p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold admin-text-heading">
              <Globe className="h-5 w-5" /> Site
            </h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="admin-text-muted">Public URL</dt>
                <dd className="font-medium admin-text-heading">{data.siteUrl}</dd>
              </div>
              <div>
                <dt className="admin-text-muted">Admin login</dt>
                <dd>
                  <Link href="/admin/login" className="text-cyan-600 underline dark:text-cyan-400">
                    /admin/login
                  </Link>
                </dd>
              </div>
            </dl>
          </section>

          <section className="jarvis-panel p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold admin-text-heading">
              <Database className="h-5 w-5" /> Database
            </h2>
            <p className="mt-2 text-sm admin-text-body">
              Status:{" "}
              <StatusBadge
                ok={data.system.database === "ok"}
                warn={data.system.database === "unavailable"}
                label={
                  data.system.database === "ok"
                    ? "Online"
                    : data.system.database === "unavailable"
                      ? "Degraded"
                      : "Not configured"
                }
              />
            </p>
            {!data.system.postgresConfigured && (
              <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                Set <code className="rounded bg-black/10 px-1">POSTGRES_URL</code> on Vercel for production persistence.
              </p>
            )}
          </section>

          <section className="jarvis-panel p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold admin-text-heading">
              <Sparkles className="h-5 w-5" /> CMS automation
            </h2>
            <ul className="mt-3 space-y-2 text-sm admin-text-body">
              <li>
                Auto-sync from git: <strong>{data.cms.autoSync ? "On" : "Off"}</strong> (env{" "}
                <code className="rounded bg-black/10 px-1">CMS_AUTO_SYNC</code>)
              </li>
              <li>
                Auto-publish on sync: <strong>{data.cms.autoPublish ? "On" : "Off"}</strong>
              </li>
            </ul>
            <label className="mt-4 flex items-center gap-2 text-sm admin-text-body">
              <input
                type="checkbox"
                checked={data.cms.syncPaused}
                disabled={saving}
                onChange={(e) => toggleCmsSyncPaused(e.target.checked)}
              />
              Pause CMS sync (maintenance mode)
            </label>
            <p className="mt-3 text-sm">
              <Link href="/admin/content" className="text-cyan-600 underline dark:text-cyan-400">
                CMS Control →
              </Link>{" "}
              for backups, reset, and scratch start.
            </p>
          </section>
        </div>
      )}

      {tab === "integrations" && (
        <div className="space-y-6">
          <TelegramSettingsPanel />
          <section className="jarvis-panel p-6">
            <h2 className="text-lg font-semibold admin-text-heading">Other integrations</h2>
            <ul className="mt-3 space-y-2 text-sm admin-text-body">
              <li>
                Email (Resend):{" "}
                <StatusBadge ok={!!data?.integrations.email} label={data?.integrations.email ? "Configured" : "Not set"} />
              </li>
              <li>
                NeXus Python worker:{" "}
                <StatusBadge
                  ok={!!data?.integrations.nexusWorker}
                  label={data?.integrations.nexusWorker ? "Connected" : "Optional — Node research used"}
                />
              </li>
              <li>
                Intelligence monitor:{" "}
                <StatusBadge ok={!!data?.system.intelligence} label={data?.system.intelligence ? "Active" : "Off"} />
              </li>
            </ul>
          </section>
        </div>
      )}

      {tab === "ai" && data && (
        <section className="jarvis-panel p-6">
          <h2 className="text-lg font-semibold admin-text-heading">AI backends</h2>
          <p className="mt-2 text-sm admin-text-body">
            Agent Studio and NeXus use <code className="rounded bg-black/10 px-1">GEMINI_API_KEY</code> (V1 primary). Auto
            Agent also supports Groq, Ollama, and the free worker below.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {data.ai.backends.map((b) => (
              <div
                key={b.id}
                className="rounded-lg border border-navy-100 bg-white p-4 dark:border-navy-700 dark:bg-navy-800/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium admin-text-heading">{b.label}</p>
                  <StatusBadge ok={b.configured} label={b.configured ? "Ready" : "Not set"} />
                </div>
                <p className="mt-1 text-xs admin-text-muted">{b.hint}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm">
            <Link href="/admin/auto-agent" className="text-cyan-600 underline dark:text-cyan-400">
              Auto Agent →
            </Link>{" "}
            ·{" "}
            <Link href="/admin/agents" className="text-cyan-600 underline dark:text-cyan-400">
              Agent Studio →
            </Link>
          </p>
        </section>
      )}

      {tab === "environment" && data && (
        <section className="jarvis-panel overflow-hidden p-0">
          <div className="border-b border-navy-100 px-6 py-4 dark:border-navy-700">
            <h2 className="text-lg font-semibold admin-text-heading">Vercel environment variables</h2>
            <p className="mt-1 text-sm admin-text-body">
              Read-only checklist — set values in Vercel → Project → Settings → Environment Variables, then redeploy.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-navy-50 text-xs uppercase text-navy-600 dark:bg-navy-900 dark:text-navy-300">
                <tr>
                  <th className="px-6 py-3 font-semibold">Variable</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100 dark:divide-navy-700">
                {data.envVars.map((v) => (
                  <tr key={v.key}>
                    <td className="px-6 py-3 font-mono text-xs admin-text-heading">{v.key}</td>
                    <td className="px-6 py-3">
                      <StatusBadge ok={v.configured} label={v.configured ? "Set" : "Missing"} />
                    </td>
                    <td className="px-6 py-3 admin-text-muted">{v.hint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-navy-100 px-6 py-4 text-sm admin-text-muted dark:border-navy-700">
            Full setup docs:{" "}
            <Link href="/admin/guide" className="text-cyan-600 underline dark:text-cyan-400">
              Admin Guide →
            </Link>
          </p>
        </section>
      )}
    </JarvisPage>
  );
}

function StatusBadge({
  ok,
  warn,
  label,
}: {
  ok: boolean;
  warn?: boolean;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
        ok && "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
        warn && "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
        !ok && !warn && "bg-gray-100 text-gray-700 dark:bg-navy-800 dark:text-navy-300"
      )}
    >
      {label}
    </span>
  );
}
