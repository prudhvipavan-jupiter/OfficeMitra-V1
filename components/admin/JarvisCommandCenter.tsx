"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  Brain,
  Cpu,
  Eye,
  FileText,
  FolderOpen,
  Inbox,
  ListTodo,
  Mail,
  MessageCircle,
  Network,
  Newspaper,
  Settings,
  Sparkles,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { ADMIN_MODULES } from "@/lib/admin/modules";
import { formatDate } from "@/lib/utils";
import { useAdminTheme } from "@/components/admin/AdminThemeProvider";
import { JarvisMetric, JarvisPanel, JarvisStatusPill } from "@/components/admin/jarvis/JarvisPanel";

interface CommandData {
  timestamp: string;
  system: {
    db: "disabled" | "ok" | "unavailable";
    ai: boolean;
    nexusWorker: boolean;
    intelligence: boolean;
    agents: number;
    pipelines: number;
  };
  attention: number;
  alerts: { level: "warn" | "critical"; message: string; href?: string }[];
  queue: {
    expertRequests: number;
    pendingExpert: number;
    pendingCommunity: number;
    publishedCommunity: number;
    resolvedCommunity: number;
    subscribers: number;
  };
  content: {
    articles: number;
    procedures: number;
    documents: number;
    templates: number;
    updates: number;
    tools: number;
    published: number;
    drafts: number;
  };
  nexus: {
    draft_ready: number;
    queued: number;
    published: number;
    total: number;
  };
  intelligence: {
    pending_review: number;
    detected_today: number;
    sources_monitored: number;
  } | null;
  inbox?: { total: number; cms: number; nexus: number; intel: number };
  visitors?: {
    totalViews: number;
    todayViews: number;
    uniqueToday: number;
    uniqueAllTime: number;
  };
  activity: { action: string; detail: Record<string, string>; at: string }[];
}

function useLiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

const MODULE_ICONS: Record<string, typeof Bot> = {
  command: Activity,
  inbox: Inbox,
  nexus: Network,
  studio: Bot,
  autogpt: Cpu,
  intelligence: Brain,
  content: FolderOpen,
  review: Sparkles,
  analytics: BarChart3,
  guide: BookOpen,
  settings: Settings,
  community: Users,
};

const CONTENT_LINKS = [
  { label: "Articles", href: "/admin/content/article", icon: BookOpen, key: "articles" as const },
  { label: "Procedures", href: "/admin/content/procedure", icon: ListTodo, key: "procedures" as const },
  { label: "Documents", href: "/admin/content/document", icon: FolderOpen, key: "documents" as const },
  { label: "Templates", href: "/admin/content/template", icon: FileText, key: "templates" as const },
  { label: "Updates", href: "/admin/content/update", icon: Newspaper, key: "updates" as const },
  { label: "Tools", href: "/tools", icon: Wrench, key: "tools" as const },
];

export function JarvisCommandCenter() {
  const [data, setData] = useState<CommandData | null>(null);
  const [loading, setLoading] = useState(true);
  const clock = useLiveClock();
  const { isJupiter } = useAdminTheme();

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/command");
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, [load]);

  const dbLabel =
    data?.system.db === "ok"
      ? "Database online"
      : data?.system.db === "unavailable"
        ? "Database degraded"
        : "Database off";

  const dbStatus = data?.system.db === "ok" ? "ok" : data?.system.db === "unavailable" ? "error" : "off";

  const overallStatus = (() => {
    if (!data) return null;
    if (data.system.db === "unavailable") {
      return { label: "Systems degraded", className: "text-red-300" };
    }
    if (data.alerts.some((a) => a.level === "critical")) {
      return { label: "Critical alert active", className: "text-red-300" };
    }
    if (data.attention > 0) {
      return {
        label: `${data.attention} item${data.attention > 1 ? "s" : ""} need attention`,
        className: "text-amber-300",
      };
    }
    if (!data.system.ai) {
      return { label: "AI offline — review tools limited", className: "text-amber-300" };
    }
    return { label: "All systems nominal", className: "text-emerald-400" };
  })();

  const visibleAlerts =
    data?.alerts.filter(
      (a) => !(data.system.db === "unavailable" && a.message.toLowerCase().includes("database unavailable"))
    ) ?? [];

  return (
    <div className="jarvis-content mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      {/* Hero HUD */}
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          {isJupiter ? (
            <div className="flex items-center gap-3">
              <div className="relative flex h-14 w-14 items-center justify-center">
                <div className="absolute inset-0 animate-pulse rounded-full border border-cyan-400/30" />
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 to-amber-500/10">
                  <Cpu className="h-5 w-5 text-cyan-300" />
                </div>
              </div>
              <div>
                <p className="jarvis-label admin-text-label">OfficeMitra Neural Interface</p>
                <h1 className="admin-text-heading text-2xl font-bold tracking-tight sm:text-3xl">
                  OM<span className="text-cyan-400">-Jupiter</span>
                </h1>
                <p className="jupiter-subtitle admin-text-body mt-1 text-sm">
                  Command centre · Andhra Pradesh staff platform
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gold-600">Command centre</p>
              <h1 className="text-2xl font-bold text-navy-900 sm:text-3xl">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Queues, content stats, and module shortcuts · Andhra Pradesh staff platform
              </p>
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="jarvis-label admin-text-label">{isJupiter ? "System time" : "Local time"}</p>
          <p className="admin-text-body font-mono text-sm tabular-nums">{clock || "—"}</p>
          {overallStatus && (
            <p className={`mt-2 text-xs font-medium ${overallStatus.className}`}>{overallStatus.label}</p>
          )}
        </div>
      </header>

      {/* System strip */}
      <JarvisPanel className="mb-6 flex flex-wrap items-center gap-3 px-4 py-3" glow>
        <JarvisStatusPill label={dbLabel} status={dbStatus} />
        <JarvisStatusPill
          label={data?.system.ai ? "AI online" : "AI offline"}
          status={data?.system.ai ? "ok" : "warn"}
        />
        <JarvisStatusPill
          label={data?.system.intelligence ? "Intel active" : "Intel off"}
          status={data?.system.intelligence ? "ok" : "off"}
        />
        <JarvisStatusPill
          label={`${data?.system.agents ?? 21} agents · ${data?.system.pipelines ?? 4} pipelines`}
          status="ok"
        />
        {data?.system.nexusWorker && <JarvisStatusPill label="NeXus worker" status="ok" />}
        <div className="ml-auto flex flex-wrap gap-2">
          <Link href="/admin/nexus" className="jarvis-btn">
            <Network className="h-3.5 w-3.5" /> NeXus
          </Link>
          <Link href="/admin/agents" className="jarvis-btn jarvis-btn-gold">
            <Bot className="h-3.5 w-3.5" /> Agent Studio
          </Link>
        </div>
      </JarvisPanel>

      {/* Alerts — DB banner already covers degraded state */}
      {visibleAlerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {visibleAlerts.slice(0, 4).map((a, i) => (
            <div key={i} className={`jarvis-alert ${a.level === "critical" ? "critical" : ""} flex items-center justify-between gap-3`}>
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                {a.message}
              </span>
              {a.href && (
                <Link href={a.href} className="admin-text-accent shrink-0 text-xs font-semibold hover:opacity-80">
                  Resolve →
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Primary metrics */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <Link href="/admin/people" className="jarvis-module-card block" style={{ "--accent": "#fbbf24" } as React.CSSProperties}>
          <MessageCircle className="h-5 w-5 text-amber-400" />
          <JarvisMetric
            label="People queue"
            value={loading ? "—" : (data?.queue.pendingCommunity ?? 0) + (data?.queue.pendingExpert ?? 0)}
            sub={`${data?.queue.pendingCommunity ?? 0} community · ${data?.queue.pendingExpert ?? 0} expert`}
            gold
          />
        </Link>
        <Link href="/admin/nexus" className="jarvis-module-card block" style={{ "--accent": "#22d3ee" } as React.CSSProperties}>
          <Network className="h-5 w-5 text-cyan-400" />
          <JarvisMetric
            label="NeXus drafts"
            value={loading ? "—" : data?.nexus.draft_ready ?? 0}
            sub={`${data?.nexus.queued ?? 0} queued · ${data?.nexus.published ?? 0} live`}
          />
        </Link>
        <Link href="/admin/inbox" className="jarvis-module-card block" style={{ "--accent": "#22d3ee" } as React.CSSProperties}>
          <Inbox className="h-5 w-5 text-cyan-400" />
          <JarvisMetric
            label="Draft inbox"
            value={loading ? "—" : data?.inbox?.total ?? data?.content.drafts ?? 0}
            sub={`CMS ${data?.inbox?.cms ?? 0} · NeXus ${data?.inbox?.nexus ?? 0} · Intel ${data?.inbox?.intel ?? 0}`}
          />
        </Link>
        <Link href="/admin/intelligence" className="jarvis-module-card block" style={{ "--accent": "#34d399" } as React.CSSProperties}>
          <Brain className="h-5 w-5 text-emerald-400" />
          <JarvisMetric
            label="Intel review"
            value={loading ? "—" : data?.intelligence?.pending_review ?? "—"}
            sub={data?.intelligence ? `${data.intelligence.detected_today} detected today` : "Engine off"}
          />
        </Link>
        <Link href="/admin/review" className="jarvis-module-card block" style={{ "--accent": "#f472b6" } as React.CSSProperties}>
          <Sparkles className="h-5 w-5 text-pink-400" />
          <JarvisMetric
            label="Live content"
            value={loading ? "—" : data?.content.published ?? 0}
            sub={`${data?.content.articles ?? 0} articles · ${data?.content.procedures ?? 0} procedures`}
          />
        </Link>
        <Link href="/admin/analytics" className="jarvis-module-card block" style={{ "--accent": "#2dd4bf" } as React.CSSProperties}>
          <Eye className="h-5 w-5 text-teal-400" />
          <JarvisMetric
            label="Page visitors"
            value={loading ? "—" : (data?.visitors?.uniqueAllTime ?? 0).toLocaleString("en-IN")}
            sub={`${data?.visitors?.uniqueToday ?? 0} today · ${(data?.visitors?.totalViews ?? 0).toLocaleString("en-IN")} views`}
          />
        </Link>
        <div className="jarvis-module-card" style={{ "--accent": "#a78bfa" } as React.CSSProperties}>
          <Mail className="h-5 w-5 text-violet-400" />
          <JarvisMetric
            label="Subscribers"
            value={loading ? "—" : data?.queue.subscribers ?? 0}
            sub={`${data?.queue.resolvedCommunity ?? 0} resolved Q&A`}
          />
        </div>
      </div>

      {/* Module grid */}
      <section className="mb-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="jarvis-label admin-text-label">Deployment matrix</p>
            <h2 className="admin-text-heading text-lg font-semibold">Admin modules</h2>
          </div>
          <p className="admin-text-muted text-xs">{ADMIN_MODULES.length} modules online</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {ADMIN_MODULES.map((mod) => {
            const Icon = MODULE_ICONS[mod.id] ?? Zap;
            const accentMap: Record<string, string> = {
              command: "#64748b",
              inbox: "#22d3ee",
              nexus: "#fbbf24",
              studio: "#a78bfa",
              intelligence: "#34d399",
              content: "#38bdf8",
              review: "#f472b6",
              analytics: "#2dd4bf",
              community: "#fb923c",
            };
            return (
              <Link
                key={mod.id}
                href={mod.href}
                className="jarvis-module-card group"
                style={{ "--accent": accentMap[mod.id] ?? "#22d3ee" } as React.CSSProperties}
              >
                {mod.badge && <span className="jarvis-module-badge">{mod.badge}</span>}
                <Icon className="h-7 w-7 text-cyan-400 transition group-hover:text-cyan-300" />
                <h3 className="admin-text-heading mt-3 font-semibold">{mod.name}</h3>
                <p className="admin-text-body mt-1 text-sm">{mod.tagline}</p>
                <ul className="admin-text-muted mt-3 space-y-0.5 text-xs">
                  {mod.features.map((f) => (
                    <li key={f}>› {f}</li>
                  ))}
                </ul>
                <span className="admin-text-accent mt-4 inline-flex items-center gap-1 text-sm font-semibold group-hover:opacity-80">
                  Launch <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Content atlas */}
        <JarvisPanel className="lg:col-span-2 p-5">
          <p className="jarvis-label mb-4">Content atlas</p>
          <div className="grid grid-cols-2 gap-3">
            {CONTENT_LINKS.map(({ label, href, icon: Icon, key }) => (
              <Link
                key={label}
                href={href}
                className="atlas-tile flex items-center gap-3 rounded-lg border border-cyan-500/10 bg-cyan-500/5 px-3 py-2.5 transition hover:border-cyan-400/30 hover:bg-cyan-500/10"
              >
                <Icon className="h-4 w-4 text-cyan-500" />
                <div>
                  <p className="admin-text-heading text-lg font-bold tabular-nums">
                    {loading ? "—" : data?.content[key] ?? "—"}
                  </p>
                  <p className="admin-text-muted text-xs">{label}</p>
                </div>
              </Link>
            ))}
          </div>
        </JarvisPanel>

        {/* Activity log */}
        <JarvisPanel className="lg:col-span-3 p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="jarvis-label">Activity stream</p>
            <Activity className="h-4 w-4 text-cyan-500/60" />
          </div>
          {loading ? (
            <p className="admin-text-muted text-sm">Initializing telemetry…</p>
          ) : !data?.activity.length ? (
            <p className="admin-text-muted text-sm">No recent activity logged.</p>
          ) : (
            <div className="max-h-64 overflow-y-auto rounded-lg border border-cyan-500/10">
              {data.activity.map((entry, i) => (
                <div key={`${entry.at}-${i}`} className="jarvis-activity-row">
                  <span className="admin-text-body font-medium">{entry.action}</span>
                  <span className="admin-text-muted font-mono text-xs">{formatDate(entry.at)}</span>
                  {Object.keys(entry.detail).length > 0 && (
                    <span className="admin-text-muted w-full text-xs">
                      {Object.entries(entry.detail)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" · ")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </JarvisPanel>
      </div>

      {/* Quick launch */}
      <JarvisPanel className="mt-6 p-5" gold>
        <p className="jarvis-label mb-3">Quick launch protocols</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/agents?view=pipelines" className="jarvis-btn jarvis-btn-gold">
            Beast Article Pipeline
          </Link>
          <Link href="/admin/nexus" className="jarvis-btn">
            NeXus batch factory
          </Link>
          <Link href="/admin/intelligence" className="jarvis-btn">
            Review GO updates
          </Link>
          <Link href="/admin/review" className="jarvis-btn">
            Bulk publish
          </Link>
          <Link href="/admin/people" className="jarvis-btn">
            People queue
          </Link>
          <Link href="/admin/inbox" className="jarvis-btn">
            Draft inbox
          </Link>
          <Link href="/" className="jarvis-btn">
            View public site
          </Link>
        </div>
      </JarvisPanel>
    </div>
  );
}
