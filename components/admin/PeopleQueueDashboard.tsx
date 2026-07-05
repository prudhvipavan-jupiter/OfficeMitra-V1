"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bot, MessageCircle, Sparkles, UserCheck } from "lucide-react";
import { buildCommunityReplyUrl, buildExpertResponseUrl } from "@/lib/admin/agent-links";
import { JarvisPanel } from "@/components/admin/jarvis/JarvisPanel";
import { expertResponseTemplates } from "@/lib/expert-templates";
import { serviceTypeLabels, type ServiceType } from "@/lib/expert-assistance";
import { formatDate } from "@/lib/utils";

interface RequestRow {
  id: string;
  reference_number: string;
  created_at: string;
  status: string;
  name: string;
  designation: string;
  email: string;
  institution: string;
  service_type: ServiceType;
  case_summary: string;
  response_notes?: string;
}

interface DiscussionRow {
  id: string;
  created_at: string;
  status: string;
  author_name: string;
  designation: string;
  institution: string;
  category: string;
  title: string;
  body: string;
  replies: { id: string; author: string; body: string; created_at: string; is_official: boolean }[];
}

type QueueFilter = "all" | "pending" | "published" | "resolved";

export function PeopleQueueDashboard() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [discussionReplies, setDiscussionReplies] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("pending");

  useEffect(() => {
    Promise.all([fetch("/api/admin/requests").then((r) => r.json()), fetch("/api/admin/discussions").then((r) => r.json())])
      .then(([reqData, discData]) => {
        const rows = (reqData.requests ?? []) as RequestRow[];
        setRequests(rows);
        const notes: Record<string, string> = {};
        rows.forEach((r) => {
          notes[r.id] = r.response_notes ?? "";
        });
        setDraftNotes(notes);

        const discs = (discData.discussions ?? []) as DiscussionRow[];
        setDiscussions(discs);
        const replies: Record<string, string> = {};
        discs.forEach((d) => {
          replies[d.id] = "";
        });
        setDiscussionReplies(replies);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredDiscussions = useMemo(() => {
    if (queueFilter === "all") return discussions;
    return discussions.filter((d) => d.status === queueFilter);
  }, [discussions, queueFilter]);

  async function saveRequest(id: string, status: string, notifyUser: boolean) {
    setSaving(id);
    await fetch("/api/admin/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status,
        response_notes: draftNotes[id] ?? "",
        notify_user: notifyUser,
      }),
    });
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, response_notes: draftNotes[id] ?? "" } : r))
    );
    setSaving(null);
  }

  function applyTemplate(id: string, key: string) {
    const template = expertResponseTemplates[key];
    if (template) setDraftNotes((prev) => ({ ...prev, [id]: template.body }));
  }

  async function saveDiscussion(id: string, status: string) {
    setSaving(id);
    const reply = discussionReplies[id]?.trim();
    await fetch("/api/admin/discussions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status,
        ...(reply ? { reply_body: reply, reply_author: "OfficeMitra Moderator" } : {}),
      }),
    });
    const res = await fetch("/api/admin/discussions");
    const data = await res.json();
    setDiscussions((data.discussions ?? []) as DiscussionRow[]);
    setDiscussionReplies((prev) => ({ ...prev, [id]: "" }));
    setSaving(null);
  }

  const pendingCommunity = discussions.filter((d) => d.status === "pending").length;
  const pendingExpert = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="jarvis-content mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="jarvis-label text-cyan-400/90">People operations</p>
        <h1 className="text-2xl font-bold text-white">People Queue</h1>
        <p className="mt-1 text-sm text-slate-400">
          Community moderation and expert assistance — with Agent Studio shortcuts.
        </p>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <JarvisPanel className="p-4" gold>
          <p className="jarvis-label">Pending community</p>
          <p className="jarvis-metric-value-gold text-3xl font-bold">{pendingCommunity}</p>
        </JarvisPanel>
        <JarvisPanel className="p-4">
          <p className="jarvis-label">Pending expert</p>
          <p className="jarvis-metric-value text-3xl font-bold">{pendingExpert}</p>
        </JarvisPanel>
        <JarvisPanel className="p-4">
          <p className="jarvis-label">Total requests</p>
          <p className="jarvis-metric-value text-3xl font-bold">{requests.length}</p>
        </JarvisPanel>
      </div>

      <section id="discussions" className="mb-12">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">Community</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["pending", "published", "resolved", "all"] as QueueFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setQueueFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                  queueFilter === f
                    ? "border border-cyan-400/50 bg-cyan-500/15 text-cyan-100"
                    : "border border-cyan-500/10 text-slate-400 hover:text-cyan-200"
                }`}
              >
                {f}
              </button>
            ))}
            <Link href="/admin/agents" className="jarvis-btn text-xs">
              <Bot className="h-3.5 w-3.5" /> Agent Studio
            </Link>
          </div>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading queue…</p>
        ) : filteredDiscussions.length === 0 ? (
          <JarvisPanel className="p-6 text-center text-slate-500">No discussions in this filter.</JarvisPanel>
        ) : (
          <div className="space-y-4">
            {filteredDiscussions.map((disc) => (
              <JarvisPanel key={disc.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">{disc.title}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {disc.author_name} · {disc.designation} · {disc.institution}
                    </p>
                    <p className="mt-2 text-sm text-slate-300">{disc.body}</p>
                  </div>
                  <StatusBadge status={disc.status} />
                </div>
                <div className="mt-4">
                  <label className="jarvis-label">Official reply</label>
                  <textarea
                    rows={4}
                    value={discussionReplies[disc.id] ?? ""}
                    onChange={(e) => setDiscussionReplies((prev) => ({ ...prev, [disc.id]: e.target.value }))}
                    className="input-field mt-1"
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={buildCommunityReplyUrl(disc.title, disc.body, disc.category)}
                    className="jarvis-btn jarvis-btn-gold text-xs"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Draft reply with AI
                  </Link>
                  <button type="button" disabled={saving === disc.id} onClick={() => saveDiscussion(disc.id, "published")} className="jarvis-btn">
                    Publish with reply
                  </button>
                  <button type="button" disabled={saving === disc.id} onClick={() => saveDiscussion(disc.id, "resolved")} className="jarvis-btn jarvis-btn-gold">
                    Mark resolved
                  </button>
                  <button type="button" disabled={saving === disc.id} onClick={() => saveDiscussion(disc.id, "closed")} className="jarvis-btn">
                    Close
                  </button>
                </div>
              </JarvisPanel>
            ))}
          </div>
        )}
      </section>

      <section id="requests">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Expert requests</h2>
          </div>
          <Link href="/admin/agents" className="jarvis-btn text-xs">
            <Bot className="h-3.5 w-3.5" /> Agent Studio
          </Link>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading requests…</p>
        ) : requests.length === 0 ? (
          <JarvisPanel className="p-6 text-center text-slate-500">No expert requests yet.</JarvisPanel>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <JarvisPanel key={req.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm font-bold text-cyan-200">{req.reference_number}</p>
                    <p className="mt-1 font-medium text-white">
                      {req.name} — {req.designation}
                    </p>
                    <p className="text-sm text-slate-400">
                      {req.institution} · {req.email} · {formatDate(req.created_at)}
                    </p>
                    <p className="mt-2 text-sm text-amber-200/80">{serviceTypeLabels[req.service_type]}</p>
                    <p className="mt-2 text-sm text-slate-300">{req.case_summary}</p>
                  </div>
                  <select
                    value={req.status}
                    onChange={(e) =>
                      setRequests((prev) => prev.map((r) => (r.id === req.id ? { ...r, status: e.target.value } : r)))
                    }
                    className="input-field w-auto py-1.5"
                    aria-label="Update status"
                  >
                    <option value="pending">Pending</option>
                    <option value="assigned">Assigned</option>
                    <option value="in_review">In Review</option>
                    <option value="responded">Responded</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="mt-4">
                  <label className="jarvis-label">Response template</label>
                  <select
                    className="input-field mt-1 sm:max-w-xs"
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) applyTemplate(req.id, e.target.value);
                      e.target.value = "";
                    }}
                  >
                    <option value="">Insert template…</option>
                    {Object.entries(expertResponseTemplates).map(([key, tpl]) => (
                      <option key={key} value={key}>
                        {tpl.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-3">
                  <label htmlFor={`notes-${req.id}`} className="jarvis-label">
                    Response notes (emailed when saved)
                  </label>
                  <textarea
                    id={`notes-${req.id}`}
                    rows={6}
                    value={draftNotes[req.id] ?? ""}
                    onChange={(e) => setDraftNotes((prev) => ({ ...prev, [req.id]: e.target.value }))}
                    className="input-field mt-1"
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={buildExpertResponseUrl(req.case_summary, req.designation, serviceTypeLabels[req.service_type])}
                    className="jarvis-btn jarvis-btn-gold text-xs"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Draft response with AI
                  </Link>
                  <button type="button" disabled={saving === req.id} onClick={() => saveRequest(req.id, req.status, false)} className="jarvis-btn">
                    Save draft
                  </button>
                  <button type="button" disabled={saving === req.id} onClick={() => saveRequest(req.id, req.status, true)} className="jarvis-btn jarvis-btn-gold">
                    Save & email user
                  </button>
                </div>
              </JarvisPanel>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "pending"
      ? "bg-amber-500/15 text-amber-200 border-amber-500/30"
      : status === "published"
        ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/30"
        : status === "resolved"
          ? "bg-cyan-500/15 text-cyan-200 border-cyan-500/30"
          : "bg-slate-500/15 text-slate-300 border-slate-500/30";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${styles}`}>{status}</span>
  );
}
