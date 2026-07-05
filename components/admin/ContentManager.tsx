"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Plus, RefreshCw, Trash2 } from "lucide-react";
import { JarvisPage, JarvisPageHeader } from "@/components/admin/jarvis/JarvisPage";
import { ContentEditPanel } from "@/components/admin/ContentEditPanel";
import type { CmsContentType, CmsRecord, CmsStatus } from "@/lib/cms/types";
import { CMS_TYPE_LABELS } from "@/lib/cms/types";

interface ContentManagerProps {
  type: CmsContentType;
}

function itemTitle(item: CmsRecord): string {
  const d = item.data;
  return String(
    d.title ?? d.number ?? d.question ?? d.term ?? d.id ?? item.slug ?? item.id.slice(0, 8)
  );
}

function wordCount(body: string | null | undefined): number {
  return (body ?? "").split(/\s+/).filter(Boolean).length;
}

function detailLevel(item: CmsRecord): string {
  return String(item.data?.detail_level ?? "");
}

export function ContentManager({ type }: ContentManagerProps) {
  const [items, setItems] = useState<CmsRecord[]>([]);
  const [storage, setStorage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | CmsStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editing, setEditing] = useState<CmsRecord | "new" | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/cms?type=${type}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load");
      setItems(json.items ?? []);
      setStorage(json.storage ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    load();
  }, [load]);

  async function runSync(action: "sync" | "seed", force = false) {
    setSaving(true);
    await fetch("/api/admin/cms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, force, type }),
    });
    setSaving(false);
    await load();
  }

  async function publishAllDrafts() {
    const drafts = items.filter((i) => i.status === "draft");
    if (drafts.length === 0) return;
    if (!confirm(`Publish all ${drafts.length} draft items? They will appear on the public site.`)) return;
    setSaving(true);
    for (const item of drafts) {
      await fetch(`/api/admin/cms/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published", data: item.data, body: item.body }),
      });
    }
    setSaving(false);
    await load();
  }

  async function seedImport(force = false) {
    if (force && !confirm("Reset this section and re-import everything from files?")) return;
    await runSync(force ? "seed" : "sync", force);
  }

  const filtered = (statusFilter === "all" ? items : items.filter((i) => i.status === statusFilter)).filter(
    (item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        itemTitle(item).toLowerCase().includes(q) ||
        (item.slug ?? "").toLowerCase().includes(q) ||
        String(item.data.category ?? "").toLowerCase().includes(q)
      );
    }
  );
  const draftCount = items.filter((i) => i.status === "draft").length;

  async function remove(id: string) {
    if (!confirm("Delete this item permanently?")) return;
    await fetch(`/api/admin/cms/${id}`, { method: "DELETE" });
    await load();
    setEditing(null);
  }

  return (
    <JarvisPage>
      <Link href="/admin/content" className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-400 hover:text-cyan-300">
        <ArrowLeft className="h-4 w-4" />
        All content
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <JarvisPageHeader
          label="CMS section"
          title={CMS_TYPE_LABELS[type]}
          subtitle={`Create, edit, publish, or delete ${CMS_TYPE_LABELS[type].toLowerCase()}. Storage: ${storage || "…"}`}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => load()}
            className="inline-flex items-center gap-1 rounded-lg border border-navy-200 px-3 py-2 text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => seedImport(false)}
            disabled={saving}
            className="rounded-lg border border-navy-200 px-3 py-2 text-sm"
          >
            Sync from files
          </button>
          <button
            type="button"
            onClick={() => seedImport(true)}
            disabled={saving}
            className="rounded-lg border border-amber-200 px-3 py-2 text-sm text-amber-900"
          >
            Reset &amp; reimport
          </button>
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="inline-flex items-center gap-1 rounded-lg bg-navy-700 px-3 py-2 text-sm font-medium text-white"
          >
            <Plus className="h-4 w-4" />
            Add new
          </button>
          {draftCount > 0 && (
            <button
              type="button"
              onClick={publishAllDrafts}
              disabled={saving}
              className="rounded-lg bg-gold-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Publish all drafts ({draftCount})
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="text-xs font-semibold uppercase text-gray-500">Filter</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | CmsStatus)}
          className="rounded-lg border border-navy-200 px-3 py-1.5 text-sm"
        >
          <option value="all">All ({items.length})</option>
          <option value="draft">Draft ({draftCount})</option>
          <option value="published">Published ({items.filter((i) => i.status === "published").length})</option>
          <option value="archived">Archived ({items.filter((i) => i.status === "archived").length})</option>
        </select>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search title, slug, category…"
          className="min-w-[200px] flex-1 rounded-lg border border-navy-200 px-3 py-1.5 text-sm"
        />
        {(type === "article" || type === "procedure") && (
          <span className="text-xs text-gray-500">
            Expert: {items.filter((i) => detailLevel(i) === "expert" || detailLevel(i) === "comprehensive").length} ·
            Short (&lt;400w): {items.filter((i) => wordCount(i.body) < 400).length}
          </span>
        )}
        {type === "article" && draftCount > 0 && (
          <span className="text-xs text-amber-800 dark:text-amber-200">
            {draftCount} articles awaiting your review — edit and set status to Published when approved.
          </span>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="mt-6 text-gray-500">Loading…</p>
      ) : (
        <ul className="mt-6 divide-y divide-navy-100 rounded-xl border border-navy-100 bg-white dark:divide-navy-700 dark:border-navy-700 dark:bg-navy-800/80">
          {filtered.length === 0 && (
            <li className="p-6 text-center text-sm text-gray-500">
              {items.length === 0
                ? 'No items yet. Run "Sync from files" or "Add new".'
                : "No items match this filter."}
            </li>
          )}
          {filtered.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium text-navy-900 dark:text-white">
                  {itemTitle(item)}
                  {item.data.priority === 1 && (
                    <span className="ml-2 rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-bold uppercase text-gold-800">
                      Week 1
                    </span>
                  )}
                  {item.status === "draft" && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                      Review
                    </span>
                  )}
                  {(detailLevel(item) === "expert" || detailLevel(item) === "comprehensive") && (
                    <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                      Expert
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {item.status} · {String(item.data.category ?? "—")} · {item.slug ?? "no slug"} ·{" "}
                  {(type === "article" || type === "procedure") && (
                    <>{wordCount(item.body)} words · </>
                  )}
                  updated {new Date(item.updated_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(item)}
                  className="rounded-lg bg-navy-100 px-3 py-1.5 text-sm font-medium text-navy-800 dark:bg-navy-700 dark:text-white"
                >
                  {item.status === "draft" ? "Review" : "Edit"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="rounded-lg border border-red-200 p-1.5 text-red-600"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <ContentEditPanel
          type={type}
          item={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </JarvisPage>
  );
}
