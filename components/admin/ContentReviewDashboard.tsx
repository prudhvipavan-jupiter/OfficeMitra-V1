"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  FileText,
  FolderOpen,
  HelpCircle,
  Library,
  ListTodo,
  Newspaper,
  RefreshCw,
  Wrench,
} from "lucide-react";
import { JarvisPage, JarvisPageHeader } from "@/components/admin/jarvis/JarvisPage";
import { CMS_TYPE_LABELS, type CmsContentType } from "@/lib/cms/types";

interface SectionRow {
  type: CmsContentType;
  total: number;
  published: number;
  draft: number;
  archived: number;
  duplicateSlugs: number;
}

interface StatsResponse {
  sections: SectionRow[];
  grandTotal: number;
  publishedTotal: number;
  draftTotal: number;
  duplicateSlugsTotal: number;
  tools: { calculators: number; checklists: number; total: number };
  quality?: { expert: number; legacy: number; shortBody: number; markdownTotal: number };
}

const ICONS: Record<CmsContentType, typeof BookOpen> = {
  article: BookOpen,
  procedure: ListTodo,
  update: Newspaper,
  document: FolderOpen,
  template: FileText,
  faq: HelpCircle,
  glossary: Library,
};

export function ContentReviewDashboard() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/content-stats");
    if (res.ok) setStats(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function runAction(path: string, label: string) {
    setActionMsg(`${label}…`);
    const res = await fetch(path, { method: "POST" });
    const json = await res.json();
    setActionMsg(res.ok ? `${label} done` : json.error ?? "Failed");
    await load();
  }

  return (
    <JarvisPage>
      <JarvisPageHeader
        label="Quality control"
        title="Review Hub"
        subtitle="Section-wise post counts — published, drafts, and duplicates"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => load()}
          className="inline-flex items-center gap-1 rounded-lg border border-navy-200 px-3 py-1.5 text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
        <button
          type="button"
          onClick={() => {
            if (
              confirm(
                "Sync all content from git files to CMS and publish? This overwrites CMS bodies for matching slugs. Run `npm run content:rewrite-all` locally first if you updated files on disk."
              )
            ) {
              runAction("/api/admin/cms/sync-expansion", "Sync & publish");
            }
          }}
          className="rounded-lg bg-navy-700 px-3 py-1.5 text-sm font-semibold text-white"
        >
          Sync expert content to site
        </button>
        <button
          type="button"
          onClick={() => runAction("/api/admin/cms/publish-all", "Publish all drafts")}
          className="rounded-lg bg-gold-600 px-3 py-1.5 text-sm font-semibold text-white"
        >
          Publish all drafts
        </button>
        <button
          type="button"
          onClick={() => {
            if (
              confirm(
                "Clear ALL live CMS content from the database? Every published article, procedure, FAQ, etc. will be removed. The public site will show zero content."
              )
            ) {
              runAction("/api/admin/cms/clear-all", "Clear live CMS");
            }
          }}
          className="rounded-lg border border-red-400 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-800 dark:bg-red-950/40 dark:text-red-100"
        >
          Clear live CMS database
        </button>
        <button
          type="button"
          onClick={() => runAction("/api/admin/cms/dedupe", "Remove duplicates")}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700"
        >
          Remove duplicates
        </button>
      </div>
      <div className="mt-4 rounded-xl border border-gold-200 bg-gold-50 p-4 text-sm text-navy-900 dark:border-gold-700/50 dark:bg-gold-900/20 dark:text-navy-100">
        <p className="font-semibold">Expert content rewrite pipeline</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-navy-800 dark:text-navy-200">
          <li>
            Locally: <code className="rounded bg-white/80 px-1">npm run content:rewrite-all</code>
          </li>
          <li>
            Then: <code className="rounded bg-white/80 px-1">npm run content:prepare-sync</code>
          </li>
          <li>Deploy, then click &quot;Sync expert content to site&quot; above</li>
        </ol>
        <p className="mt-2 text-xs text-navy-600 dark:text-navy-300">
          Uses topic-specific expertise (not generic templates). ScraperAI/agency-agents patterns: structured research, angle-specific guides.
        </p>
      </div>
      {actionMsg && <p className="mt-2 text-sm text-navy-600">{actionMsg}</p>}

      {loading && !stats && <p className="mt-8 text-gray-500">Loading…</p>}

      {stats && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            <StatCard label="Total posts" value={stats.grandTotal} />
            <StatCard label="Published (live)" value={stats.publishedTotal} accent />
            <StatCard label="Drafts" value={stats.draftTotal} />
            <StatCard label="Duplicate slugs" value={stats.duplicateSlugsTotal} warn={stats.duplicateSlugsTotal > 0} />
          </div>

          {stats.quality && (
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <StatCard label="Expert/comprehensive guides" value={stats.quality.expert} accent />
              <StatCard label="Needs rewrite (legacy)" value={stats.quality.legacy} warn={stats.quality.legacy > 0} />
              <StatCard label="Short body (&lt;400 words)" value={stats.quality.shortBody} warn={stats.quality.shortBody > 0} />
            </div>
          )}

          <div className="mt-4 rounded-xl border border-navy-100 bg-white p-4 dark:border-navy-700 dark:bg-navy-800/80">
            <div className="flex items-center gap-2 text-navy-900 dark:text-white">
              <Wrench className="h-5 w-5" />
              <span className="font-semibold">Tools</span>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {stats.tools.calculators} calculators + {stats.tools.checklists} checklists ={" "}
              <strong>{stats.tools.total}</strong> live tools
            </p>
            <Link href="/tools" className="mt-2 inline-block text-sm font-medium text-gold-700 hover:underline">
              View tools →
            </Link>
          </div>

          <div className="mt-8 overflow-x-auto rounded-xl border border-navy-100 dark:border-navy-700">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-navy-50 text-xs uppercase text-navy-600 dark:bg-navy-800">
                <tr>
                  <th className="px-4 py-3">Section</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Published</th>
                  <th className="px-4 py-3 text-right">Draft</th>
                  <th className="px-4 py-3 text-right">Dupes</th>
                  <th className="px-4 py-3">Manage</th>
                </tr>
              </thead>
              <tbody>
                {stats.sections.map((row) => {
                  const Icon = ICONS[row.type];
                  return (
                    <tr key={row.type} className="border-t border-navy-100 dark:border-navy-700">
                      <td className="px-4 py-3 font-medium text-navy-900 dark:text-white">
                        <span className="inline-flex items-center gap-2">
                          <Icon className="h-4 w-4 text-navy-500" />
                          {CMS_TYPE_LABELS[row.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{row.total}</td>
                      <td className="px-4 py-3 text-right text-emerald-700">{row.published}</td>
                      <td className="px-4 py-3 text-right text-amber-700">{row.draft}</td>
                      <td className="px-4 py-3 text-right text-red-600">{row.duplicateSlugs || "—"}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/content/${row.type}`}
                          className="font-medium text-navy-700 hover:text-gold-700"
                        >
                          Review →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </JarvisPage>
  );
}

function StatCard({
  label,
  value,
  accent,
  warn,
}: {
  label: string;
  value: number;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        warn
          ? "border-red-200 bg-red-50"
          : accent
            ? "border-emerald-200 bg-emerald-50"
            : "border-navy-100 bg-white dark:border-navy-700 dark:bg-navy-800/80"
      }`}
    >
      <p className="text-xs font-medium uppercase text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-navy-900">{value}</p>
    </div>
  );
}
