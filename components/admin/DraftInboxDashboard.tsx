"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Brain, Database, Inbox, Network, RefreshCw } from "lucide-react";
import { JarvisPage, JarvisPageHeader } from "@/components/admin/jarvis/JarvisPage";
import { JarvisPanel } from "@/components/admin/jarvis/JarvisPanel";
import { formatDate } from "@/lib/utils";
import type { InboxItem, InboxSummary } from "@/lib/admin/inbox";

const SOURCE_META: Record<
  InboxItem["source"],
  { label: string; icon: typeof Database; color: string }
> = {
  cms: { label: "CMS", icon: Database, color: "text-sky-400" },
  nexus: { label: "NeXus", icon: Network, color: "text-amber-400" },
  intel: { label: "Intel", icon: Brain, color: "text-emerald-400" },
};

type FilterSource = "all" | InboxItem["source"];

export function DraftInboxDashboard() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [summary, setSummary] = useState<InboxSummary | null>(null);
  const [filter, setFilter] = useState<FilterSource>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/inbox");
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Failed to load inbox");
      }
      const json = await res.json();
      setItems(json.items ?? []);
      setSummary(json.summary ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load inbox");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = filter === "all" ? items : items.filter((i) => i.source === filter);

  return (
    <JarvisPage>
      <JarvisPageHeader
        label="Publish pipeline"
        title="Draft Inbox"
        subtitle="All pending content from CMS, NeXus, and Intelligence — one place to review before going live."
        action={
          <button type="button" onClick={load} className="jarvis-btn">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        }
      />

      {error && (
        <div className="jarvis-alert mb-4">{error}</div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <JarvisPanel className="p-4" glow>
          <p className="jarvis-label">Total pending</p>
          <p className="jarvis-metric-value text-3xl font-bold">{summary?.total ?? "—"}</p>
        </JarvisPanel>
        <JarvisPanel className="p-4">
          <p className="jarvis-label">CMS drafts</p>
          <p className="jarvis-metric-value text-3xl font-bold">{summary?.cms ?? "—"}</p>
        </JarvisPanel>
        <JarvisPanel className="p-4">
          <p className="jarvis-label">NeXus</p>
          <p className="jarvis-metric-value-gold text-3xl font-bold">{summary?.nexus ?? "—"}</p>
        </JarvisPanel>
        <JarvisPanel className="p-4">
          <p className="jarvis-label">Intelligence</p>
          <p className="jarvis-metric-value text-3xl font-bold">{summary?.intel ?? "—"}</p>
        </JarvisPanel>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "cms", "nexus", "intel"] as FilterSource[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
              filter === f
                ? "border border-cyan-400/50 bg-cyan-500/15 text-cyan-100"
                : "border border-cyan-500/10 text-slate-400"
            }`}
          >
            {f === "all" ? "All sources" : f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-slate-500">Scanning draft sources…</p>
      ) : filtered.length === 0 && !error ? (
        <JarvisPanel className="flex flex-col items-center gap-3 p-12 text-center">
          <Inbox className="h-10 w-10 text-cyan-500/40" />
          <p className="text-slate-400">No pending drafts — inbox clear.</p>
          <Link href="/admin/agents" className="jarvis-btn jarvis-btn-gold">
            Create with Agent Studio
          </Link>
        </JarvisPanel>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const meta = SOURCE_META[item.source];
            const Icon = meta.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="jarvis-module-card flex flex-wrap items-center gap-4 px-4 py-3"
                style={{ "--accent": "#22d3ee" } as React.CSSProperties}
              >
                <Icon className={`h-5 w-5 shrink-0 ${meta.color}`} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white truncate">{item.title}</p>
                  <p className="text-xs text-slate-500">
                    {meta.label}
                    {item.subtitle ? ` · ${item.subtitle}` : ""} · {item.status.replace(/_/g, " ")}
                  </p>
                </div>
                <span className="font-mono text-xs text-slate-500">{formatDate(item.updatedAt)}</span>
                <span className="text-sm text-cyan-400">Open →</span>
              </Link>
            );
          })}
        </div>
      )}
    </JarvisPage>
  );
}
