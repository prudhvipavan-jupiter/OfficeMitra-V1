"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  Play,
  Plus,
  RefreshCw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { JarvisPage, JarvisPageHeader } from "@/components/admin/jarvis/JarvisPage";
import { Markdown } from "@/components/ui/Markdown";
import {
  NEXUS_MAX_BATCH,
  NEXUS_STATUS_TABS,
  type NexusDashboardStats,
  type NexusJob,
  type NexusTab,
} from "@/lib/nexus/types";
import { formatDate } from "@/lib/utils";

const CATEGORIES = [
  { value: "establishment", label: "Establishment" },
  { value: "leave", label: "Leave" },
  { value: "finance", label: "Finance" },
  { value: "health", label: "Health" },
  { value: "education", label: "Education" },
  { value: "appsc", label: "APPSC" },
];

interface DashboardData {
  stats: NexusDashboardStats;
  jobs: NexusJob[];
  aiConfigured: boolean;
  workerConfigured: boolean;
}

export function NexusDashboard() {
  const [tab, setTab] = useState<NexusTab>("DRAFT_READY");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<NexusJob | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<NexusJob>>({});
  const [topicRows, setTopicRows] = useState<string[]>([""]);
  const [category, setCategory] = useState("establishment");
  const [contentType, setContentType] = useState<"article" | "procedure">("article");
  const [submitting, setSubmitting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const stats = data?.stats;
  const pendingTopics = topicRows.map((t) => t.trim()).filter(Boolean);
  const canQueue = pendingTopics.length > 0 && !submitting;
  const queuedCount = stats?.queued ?? 0;
  const canProcess = queuedCount > 0 && !processing;

  const load = useCallback(async (status?: NexusTab) => {
    setLoading(true);
    setError("");
    try {
      const qs = status ? `?status=${status}` : "";
      const res = await fetch(`/api/admin/nexus${qs}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(tab);
  }, [tab, load]);

  function openJob(job: NexusJob) {
    setSelected(job);
    setEditDraft({
      title: job.title ?? job.topic,
      slug: job.slug ?? "",
      summary: job.summary ?? "",
      telugu_summary: job.telugu_summary ?? "",
      body: job.body ?? "",
      admin_notes: job.admin_notes ?? "",
    });
  }

  function addTopicRow() {
    if (topicRows.length >= NEXUS_MAX_BATCH) return;
    setTopicRows([...topicRows, ""]);
  }

  function updateTopicRow(i: number, value: string) {
    const next = [...topicRows];
    next[i] = value;
    setTopicRows(next);
  }

  function removeTopicRow(i: number) {
    if (topicRows.length <= 1) return;
    setTopicRows(topicRows.filter((_, idx) => idx !== i));
  }

  async function submitBatch(thenProcess = false) {
    const topics = pendingTopics;
    if (topics.length === 0) {
      setError("Enter at least one topic in the box above");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/nexus/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics, category, content_type: contentType }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Batch failed");
      setTopicRows([""]);
      setSuccessMsg(
        thenProcess
          ? `Queued ${topics.length} topic(s) — starting research…`
          : `Queued ${topics.length} topic(s). Click “Research & draft” or use “Queue & research” next time.`
      );
      if (thenProcess) {
        setTab("QUEUED");
        await load("QUEUED");
        await processQueue(true);
      } else {
        setTab("QUEUED");
        await load("QUEUED");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Batch failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function processQueue(all = false) {
    setProcessing(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/nexus/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ processAll: all }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Process failed");
      const n = json.processed ?? 1;
      setSuccessMsg(`Research complete — ${n} draft${n === 1 ? "" : "s"} ready for review.`);
      setTab("DRAFT_READY");
      await load("DRAFT_READY");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Process failed");
    } finally {
      setProcessing(false);
    }
  }

  async function patchJob(id: string, action: string, fields?: Record<string, unknown>) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/nexus/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, fields }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Update failed");
      setSelected(null);
      load(tab);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function publishJob(id: string) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/nexus/jobs/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Publish failed");
      setSelected(null);
      setTab("PUBLISHED");
      load("PUBLISHED");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publish failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <JarvisPage>
      <JarvisPageHeader
        label="Content factory"
        title="NeXus"
        subtitle="Enter topics → research & draft → review → publish. Up to 10 topics per batch."
      />

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-100">
          {successMsg}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-600 dark:text-navy-300">
        <span className="rounded-full bg-navy-100 px-2.5 py-1 dark:bg-navy-800">
          AI: {data?.aiConfigured ? "Ready" : "Heuristic drafts only"}
        </span>
        <span className="rounded-full bg-navy-100 px-2.5 py-1 dark:bg-navy-800">
          Python worker: {data?.workerConfigured ? "Connected" : "Optional (Node research)"}
        </span>
      </div>

      {/* Batch input */}
      <section className="mt-8 rounded-2xl border border-navy-100 bg-white p-6 dark:border-navy-700 dark:bg-navy-900/80">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-navy-900 dark:text-white">
          <Sparkles className="h-5 w-5 text-gold-600" />
          Add topics (max {NEXUS_MAX_BATCH})
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-navy-300">
          Type a topic below, then use <strong>Queue &amp; research</strong> (one click) or{" "}
          <strong>Queue topics</strong> → <strong>Research &amp; draft</strong> (two steps).
          “+ Add topic” only adds another row for a batch of up to {NEXUS_MAX_BATCH}.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="font-medium text-navy-800 dark:text-navy-100">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 dark:border-navy-600 dark:bg-navy-800"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-medium text-navy-800 dark:text-navy-100">Post type</span>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as "article" | "procedure")}
              className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 dark:border-navy-600 dark:bg-navy-800"
            >
              <option value="article">Knowledge article</option>
              <option value="procedure">Procedure</option>
            </select>
          </label>
        </div>

        <div className="mt-4 space-y-2">
          {topicRows.map((topic, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => updateTopicRow(i, e.target.value)}
                placeholder={`Topic ${i + 1}`}
                className="flex-1 rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-600 dark:bg-navy-800"
              />
              {topicRows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTopicRow(i)}
                  className="rounded-lg border border-navy-200 px-3 text-sm text-gray-500 hover:bg-gray-50 dark:border-navy-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {topicRows.length < NEXUS_MAX_BATCH && (
            <button
              type="button"
              onClick={addTopicRow}
              className="inline-flex items-center gap-1 rounded-lg border border-navy-200 px-4 py-2 text-sm font-medium dark:border-navy-600"
            >
              <Plus className="h-4 w-4" /> Add another row
            </button>
          )}
          <button
            type="button"
            onClick={() => submitBatch(false)}
            disabled={!canQueue}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-navy-800 bg-white px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-navy-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-navy-400 dark:bg-navy-800 dark:text-white"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Step 1 · Queue topics ({pendingTopics.length})
          </button>
          <button
            type="button"
            onClick={() => submitBatch(true)}
            disabled={!canQueue || processing}
            className="inline-flex items-center gap-2 rounded-lg bg-gold-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gold-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting || processing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Queue &amp; research
          </button>
          <button
            type="button"
            onClick={() => processQueue(true)}
            disabled={!canProcess}
            title={queuedCount === 0 ? "Queue topics first — this runs research on the waiting list" : undefined}
            className="inline-flex items-center gap-2 rounded-lg bg-navy-800 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Step 2 · Research queued ({queuedCount})
          </button>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {[
            { label: "Queued", value: stats.queued },
            { label: "Drafts", value: stats.draft_ready },
            { label: "Approved", value: stats.approved },
            { label: "Live", value: stats.published },
            { label: "Failed", value: stats.failed },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl border border-navy-100 bg-white p-3 text-center dark:border-navy-700 dark:bg-navy-800/80"
            >
              <div className="text-2xl font-bold text-navy-900 dark:text-white">{value}</div>
              <div className="text-xs text-gray-500 dark:text-navy-300">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Review queue */}
      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1">
            {NEXUS_STATUS_TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  tab === id
                    ? "bg-navy-800 text-white"
                    : "bg-navy-100 text-navy-700 hover:bg-navy-200 dark:bg-navy-800 dark:text-navy-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => load(tab)}
            className="inline-flex items-center gap-1 text-sm text-navy-700 dark:text-navy-200"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {loading ? (
          <p className="mt-8 text-center text-gray-500">Loading…</p>
        ) : (data?.jobs.length ?? 0) === 0 ? (
          <p className="mt-8 rounded-xl border border-dashed border-navy-200 px-6 py-12 text-center text-gray-500 dark:border-navy-600">
            No items in this tab.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {data?.jobs.map((job) => (
              <button
                key={job.id}
                type="button"
                onClick={() => openJob(job)}
                className="rounded-xl border border-navy-100 bg-white p-4 text-left transition hover:border-gold-400 dark:border-navy-700 dark:bg-navy-800/80"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-navy-900 dark:text-white">
                    {job.title ?? job.topic}
                  </h3>
                  {job.quality_score != null && (
                    <span className="shrink-0 rounded-full bg-gold-100 px-2 py-0.5 text-xs font-bold text-gold-800">
                      {job.quality_score}/100
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-navy-300">
                  {job.summary ?? job.topic}
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  {formatDate(job.created_at)} · {job.content_type} · {job.category}
                  {job.used_ai ? " · AI" : " · Template"}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Review modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-navy-900">
            <div className="flex items-center justify-between border-b border-navy-100 px-6 py-4 dark:border-navy-700">
              <h2 className="text-lg font-bold text-navy-900 dark:text-white">
                Review: {editDraft.title ?? selected.topic}
              </h2>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-gray-500 hover:text-navy-800"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  <label className="block text-sm">
                    <span className="font-medium">Title</span>
                    <input
                      value={editDraft.title ?? ""}
                      onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-navy-600 dark:bg-navy-800"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium">Slug</span>
                    <input
                      value={editDraft.slug ?? ""}
                      onChange={(e) => setEditDraft({ ...editDraft, slug: e.target.value })}
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-navy-600 dark:bg-navy-800"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="font-medium">Summary</span>
                    <textarea
                      value={editDraft.summary ?? ""}
                      onChange={(e) => setEditDraft({ ...editDraft, summary: e.target.value })}
                      rows={3}
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-navy-600 dark:bg-navy-800"
                    />
                  </label>
                  {selected.research_sources.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Research sources</span>
                      <ul className="mt-1 space-y-1">
                        {selected.research_sources.slice(0, 5).map((s) => (
                          <li key={s.url}>
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-navy-700 hover:underline dark:text-gold-400"
                            >
                              {s.title.slice(0, 60)}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <Markdown>{editDraft.body ?? ""}</Markdown>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-navy-100 px-6 py-4 dark:border-navy-700">
              <button
                type="button"
                disabled={saving}
                onClick={() => patchJob(selected.id, "edit", editDraft)}
                className="rounded-lg border border-navy-200 px-4 py-2 text-sm font-medium dark:border-navy-600"
              >
                Save edits
              </button>
              {(selected.status === "DRAFT_READY" || selected.status === "APPROVED") && (
                <>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => patchJob(selected.id, "approve")}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => publishJob(selected.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-gold-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Publish to site
                  </button>
                </>
              )}
              {selected.status !== "PUBLISHED" && selected.status !== "REJECTED" && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => patchJob(selected.id, "reject")}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </button>
              )}
              {selected.status === "PUBLISHED" && selected.published_slug && (
                <Link
                  href={
                    selected.content_type === "procedure"
                      ? `/procedures/${selected.published_slug}`
                      : `/knowledge/${selected.published_slug}`
                  }
                  target="_blank"
                  className="inline-flex items-center gap-1 rounded-lg bg-navy-800 px-4 py-2 text-sm font-semibold text-white"
                >
                  View live <ExternalLink className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </JarvisPage>
  );
}
