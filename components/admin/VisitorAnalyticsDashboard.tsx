"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart3, Eye, RefreshCw, TrendingUp, Users } from "lucide-react";
import { JarvisMetric, JarvisPanel } from "@/components/admin/jarvis/JarvisPanel";

interface AnalyticsData {
  totalViews: number;
  todayViews: number;
  uniqueToday: number;
  uniqueAllTime: number;
  topPages: { path: string; views: number }[];
  dailyViews: { date: string; views: number; uniqueVisitors: number }[];
}

function formatCount(n: number): string {
  return n.toLocaleString("en-IN");
}

export function VisitorAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) throw new Error("Failed to load analytics");
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const maxDailyViews = Math.max(...(data?.dailyViews.map((d) => d.views) ?? [1]), 1);

  return (
    <div className="admin-page">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="jarvis-label admin-text-label">Traffic</p>
          <h1 className="admin-text-heading text-2xl font-bold sm:text-3xl">Page visitors</h1>
          <p className="admin-text-body mt-1 text-sm">
            Public site page views and unique sessions · Asia/Kolkata timezone
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="jarvis-btn flex items-center gap-2"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </header>

      {error && (
        <div className="jarvis-alert mb-6 critical">{error}</div>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <JarvisPanel className="p-4" glow>
          <Eye className="mb-2 h-5 w-5 text-cyan-400" />
          <JarvisMetric
            label="Total page views"
            value={loading ? "—" : formatCount(data?.totalViews ?? 0)}
          />
        </JarvisPanel>
        <JarvisPanel className="p-4" glow>
          <Users className="mb-2 h-5 w-5 text-emerald-400" />
          <JarvisMetric
            label="Unique visitors (all time)"
            value={loading ? "—" : formatCount(data?.uniqueAllTime ?? 0)}
          />
        </JarvisPanel>
        <JarvisPanel className="p-4" glow>
          <TrendingUp className="mb-2 h-5 w-5 text-amber-400" />
          <JarvisMetric
            label="Visitors today"
            value={loading ? "—" : formatCount(data?.uniqueToday ?? 0)}
            sub={`${formatCount(data?.todayViews ?? 0)} page views`}
            gold
          />
        </JarvisPanel>
        <JarvisPanel className="p-4" glow>
          <BarChart3 className="mb-2 h-5 w-5 text-violet-400" />
          <JarvisMetric
            label="Top pages tracked"
            value={loading ? "—" : String(data?.topPages.length ?? 0)}
            sub="Last 7 days"
          />
        </JarvisPanel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <JarvisPanel className="p-5">
          <h2 className="admin-text-heading mb-4 font-semibold">Top pages (7 days)</h2>
          {loading ? (
            <p className="admin-text-muted text-sm">Loading…</p>
          ) : (data?.topPages.length ?? 0) === 0 ? (
            <p className="admin-text-muted text-sm">No visits recorded yet. Stats appear after public traffic.</p>
          ) : (
            <ul className="space-y-2">
              {data!.topPages.map((row, i) => (
                <li
                  key={row.path}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-black/20 px-3 py-2 text-sm"
                >
                  <span className="admin-text-body truncate">
                    <span className="admin-text-muted mr-2 tabular-nums">{i + 1}.</span>
                    {row.path}
                  </span>
                  <span className="admin-text-accent shrink-0 tabular-nums font-medium">
                    {formatCount(row.views)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </JarvisPanel>

        <JarvisPanel className="p-5">
          <h2 className="admin-text-heading mb-4 font-semibold">Daily trend (14 days)</h2>
          {loading ? (
            <p className="admin-text-muted text-sm">Loading…</p>
          ) : (data?.dailyViews.length ?? 0) === 0 ? (
            <p className="admin-text-muted text-sm">No daily data yet.</p>
          ) : (
            <ul className="space-y-2">
              {data!.dailyViews.map((row) => (
                <li key={row.date} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="admin-text-muted">{row.date}</span>
                    <span className="admin-text-body tabular-nums">
                      {formatCount(row.views)} views · {formatCount(row.uniqueVisitors)} unique
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-black/30">
                    <div
                      className="h-full rounded-full bg-cyan-500/70"
                      style={{ width: `${Math.max(4, (row.views / maxDailyViews) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </JarvisPanel>
      </div>

      <p className="admin-text-muted mt-6 text-xs">
        Admin and API routes are excluded. Same session + page within 30 minutes counts once. Bot user-agents are filtered.
      </p>
    </div>
  );
}
