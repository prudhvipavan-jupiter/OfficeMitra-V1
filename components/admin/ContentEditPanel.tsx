"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Eye, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { categoryLabels, type ArticleCategory } from "@/lib/categories";
import type { CmsContentType, CmsRecord, CmsStatus } from "@/lib/cms/types";
import { CMS_TYPE_LABELS } from "@/lib/cms/types";

const MARKDOWN_TYPES: CmsContentType[] = ["article", "procedure", "update"];
const CATEGORIES = Object.keys(categoryLabels) as ArticleCategory[];

interface ContentEditPanelProps {
  type: CmsContentType;
  item: CmsRecord | null;
  onClose: () => void;
  onSaved: () => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function parseTags(raw: unknown): string {
  if (Array.isArray(raw)) return raw.join(", ");
  return "";
}

export function ContentEditPanel({ type, item, onClose, onSaved }: ContentEditPanelProps) {
  const isNew = !item;
  const initial = item?.data ?? defaultData(type);

  const [status, setStatus] = useState<CmsStatus>(item?.status ?? "draft");
  const [slug, setSlug] = useState(item?.slug ?? String(initial.slug ?? ""));
  const [title, setTitle] = useState(String(initial.title ?? initial.question ?? initial.term ?? ""));
  const [summary, setSummary] = useState(String(initial.summary ?? initial.description ?? ""));
  const [category, setCategory] = useState(String(initial.category ?? "establishment"));
  const [tags, setTags] = useState(parseTags(initial.tags));
  const [teluguSummary, setTeluguSummary] = useState(String(initial.telugu_summary ?? ""));
  const [body, setBody] = useState(item?.body ?? defaultBody(type));
  const [whatChanged, setWhatChanged] = useState(String(initial.what_changed ?? ""));
  const [whoAffected, setWhoAffected] = useState(String(initial.who_is_affected ?? ""));
  const [actionRequired, setActionRequired] = useState(String(initial.action_required ?? ""));
  const [faqAnswer, setFaqAnswer] = useState(String(initial.answer ?? ""));
  const [glossaryDef, setGlossaryDef] = useState(String(initial.definition ?? ""));
  const [file, setFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const [bodyTab, setBodyTab] = useState<"write" | "preview">("write");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const previewUrl = useMemo(() => {
    if (!slug || isNew) return null;
    const paths: Record<string, string> = {
      article: `/knowledge/${slug}`,
      procedure: `/procedures/${slug}`,
      update: `/updates/${slug}`,
    };
    return paths[type] ?? null;
  }, [slug, type, isNew]);

  function buildData(): Record<string, unknown> {
    const base = { ...(item?.data ?? defaultData(type)) };
    const today = new Date().toISOString().slice(0, 10);

    switch (type) {
      case "article":
      case "procedure":
        return {
          ...base,
          title,
          slug: slug || slugify(title),
          category,
          summary,
          telugu_summary: teluguSummary || undefined,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          status,
          published_at: base.published_at ?? today,
          updated_at: today,
        };
      case "update":
        return {
          ...base,
          title,
          slug: slug || slugify(title),
          date: base.date ?? today,
          category,
          what_changed: whatChanged,
          who_is_affected: whoAffected,
          action_required: actionRequired,
          status,
        };
      case "faq":
        return { ...base, question: title, answer: faqAnswer, category };
      case "glossary":
        return { ...base, term: title, definition: glossaryDef, category };
      default:
        return { ...base, title, category };
    }
  }

  async function save(publish = false) {
    setSaving(true);
    setErr("");
    const finalStatus = publish ? "published" : status;
    const data = buildData();
    const finalSlug = String(data.slug ?? slug);

    try {
      if (isNew) {
        const res = await fetch("/api/admin/cms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content_type: type,
            slug: finalSlug,
            status: finalStatus,
            data,
            body: MARKDOWN_TYPES.includes(type) ? body : null,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Create failed");
        await uploadFile(json.item.id);
      } else {
        const res = await fetch(`/api/admin/cms/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: finalSlug,
            status: finalStatus,
            data,
            body: MARKDOWN_TYPES.includes(type) ? body : null,
          }),
        });
        if (!res.ok) throw new Error("Update failed");
        await uploadFile(item.id);
      }
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function uploadFile(id: string) {
    if (file && (type === "document" || type === "template")) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("field", type === "document" ? "file" : "file_pdf");
      await fetch(`/api/admin/cms/${id}`, { method: "PATCH", body: fd });
    }
    if (coverImage && MARKDOWN_TYPES.includes(type)) {
      const fd = new FormData();
      fd.append("file", coverImage);
      fd.append("field", "cover_image");
      await fetch(`/api/admin/cms/${id}`, { method: "PATCH", body: fd });
    }
  }

  const typeLabel = CMS_TYPE_LABELS[type].slice(0, -1);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-navy-100 bg-white shadow-2xl sm:rounded-2xl dark:border-navy-700 dark:bg-navy-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-navy-100 px-6 py-4 dark:border-navy-700">
          <div>
            <h2 className="text-xl font-bold text-navy-900 dark:text-white">
              {isNew ? "New post" : "Review post"}
            </h2>
            <p className="text-sm text-gray-500">{typeLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            {previewUrl && status === "published" && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-navy-200 px-3 py-1.5 text-sm text-navy-700 hover:bg-navy-50"
              >
                <ExternalLink className="h-4 w-4" />
                View live
              </a>
            )}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CmsStatus)}
              className="rounded-lg border border-navy-200 px-3 py-1.5 text-sm font-medium dark:border-navy-600 dark:bg-navy-800"
            >
              <option value="draft">Draft — not visible</option>
              <option value="published">Published — live on site</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-navy-800 dark:text-navy-100">
              {type === "faq" ? "Question" : type === "glossary" ? "Term" : "Title"}
            </label>
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slug || slug === slugify(title)) setSlug(slugify(e.target.value));
              }}
              placeholder="Enter a clear title…"
              className="input-field text-lg font-semibold"
            />
          </div>

          {/* Category + tags for articles/procedures/updates */}
          {(type === "article" || type === "procedure" || type === "update") && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-navy-800 dark:text-navy-100">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {categoryLabels[c]}
                    </option>
                  ))}
                  {type === "update" && <option value="appsc">APPSC</option>}
                </select>
              </div>
              {(type === "article" || type === "procedure") && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-navy-800 dark:text-navy-100">
                    Tags <span className="font-normal text-gray-400">(comma separated)</span>
                  </label>
                  <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="probation, establishment, health"
                    className="input-field"
                  />
                </div>
              )}
            </div>
          )}

          {/* Summary */}
          {(type === "article" || type === "procedure") && (
            <>
              <div className="mt-4">
                <label className="mb-1 block text-sm font-medium text-navy-800 dark:text-navy-100">
                  Short summary
                  <span className="ml-1 font-normal text-gray-400">— shown in search & listings</span>
                </label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="One or two sentences explaining what this post covers…"
                  className="input-field resize-none"
                />
              </div>
              <div className="mt-4">
                <label className="mb-1 block text-sm font-medium text-navy-800 dark:text-navy-100">
                  Telugu summary <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={teluguSummary}
                  onChange={(e) => setTeluguSummary(e.target.value)}
                  placeholder="తెలుగు సారాంశం…"
                  className="input-field resize-none"
                />
              </div>
            </>
          )}

          {/* Update-specific fields */}
          {type === "update" && (
            <div className="mt-4 space-y-4">
              <Field label="What changed?" value={whatChanged} onChange={setWhatChanged} rows={2} />
              <Field label="Who is affected?" value={whoAffected} onChange={setWhoAffected} rows={2} />
              <Field label="Action required" value={actionRequired} onChange={setActionRequired} rows={2} />
            </div>
          )}

          {/* FAQ / Glossary */}
          {type === "faq" && (
            <div className="mt-4">
              <Field label="Answer" value={faqAnswer} onChange={setFaqAnswer} rows={4} />
            </div>
          )}
          {type === "glossary" && (
            <div className="mt-4">
              <Field label="Definition" value={glossaryDef} onChange={setGlossaryDef} rows={3} />
            </div>
          )}

          {/* Main content body */}
          {MARKDOWN_TYPES.includes(type) && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-navy-800 dark:text-navy-100">
                  Content
                  <span className="ml-1 font-normal text-gray-400">— write like a blog post</span>
                </label>
                <div className="flex rounded-lg border border-navy-200 p-0.5 text-xs dark:border-navy-600">
                  <button
                    type="button"
                    onClick={() => setBodyTab("write")}
                    className={`rounded-md px-3 py-1 ${bodyTab === "write" ? "bg-navy-800 text-white" : "text-navy-600"}`}
                  >
                    Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setBodyTab("preview")}
                    className={`inline-flex items-center gap-1 rounded-md px-3 py-1 ${bodyTab === "preview" ? "bg-navy-800 text-white" : "text-navy-600"}`}
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </button>
                </div>
              </div>

              {bodyTab === "write" ? (
                <textarea
                  rows={18}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your content here. Use ## for headings, - for bullet lists."
                  className="input-field min-h-[320px] resize-y text-base leading-relaxed"
                />
              ) : (
                <div className="prose-article min-h-[320px] rounded-xl border border-navy-100 bg-navy-50/50 p-6 dark:border-navy-700 dark:bg-navy-800/50">
                  <ReactMarkdown>{body || "*Nothing to preview yet.*"}</ReactMarkdown>
                </div>
              )}
              <p className="mt-2 text-xs text-gray-400">
                Tip: Use ## Overview, ## Procedure, ## Checklist as section headings.
              </p>
            </div>
          )}

          {/* Cover image for articles / procedures / updates */}
          {MARKDOWN_TYPES.includes(type) && (
            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-navy-800 dark:text-navy-100">
                Cover image (optional)
              </label>
              {String(initial.cover_image ?? item?.data?.cover_image ?? "") && !coverImage && (
                <p className="mb-2 text-xs text-gray-500">
                  Current: {String(item?.data?.cover_image ?? initial.cover_image)}
                </p>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)}
                className="block w-full text-sm"
              />
            </div>
          )}

          {/* Document upload */}
          {(type === "document" || type === "template") && (
            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-navy-800">Upload PDF</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm"
              />
            </div>
          )}

          {/* Advanced */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-navy-700"
          >
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Advanced settings
          </button>
          {showAdvanced && (
            <div className="mt-2">
              <label className="mb-1 block text-xs font-medium text-gray-500">URL slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="input-field font-mono text-sm"
              />
              <p className="mt-1 text-xs text-gray-400">
                Public URL: /{type === "article" ? "knowledge" : type}/{slug || "…"}
              </p>
            </div>
          )}

          {err && <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{err}</p>}
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-navy-100 px-6 py-4 dark:border-navy-700">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
            Cancel
          </button>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => save(false)}
              disabled={saving}
              className="rounded-lg border border-navy-200 px-5 py-2 text-sm font-medium text-navy-800 disabled:opacity-50 dark:border-navy-600"
            >
              {saving ? "Saving…" : "Save draft"}
            </button>
            <button
              type="button"
              onClick={() => save(true)}
              disabled={saving}
              className="rounded-lg bg-gold-600 px-5 py-2 text-sm font-semibold text-white hover:bg-gold-500 disabled:opacity-50"
            >
              {saving ? "Publishing…" : "Publish to website"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-navy-800 dark:text-navy-100">{label}</label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field resize-none"
      />
    </div>
  );
}

function defaultData(type: CmsContentType): Record<string, unknown> {
  const today = new Date().toISOString().slice(0, 10);
  switch (type) {
    case "article":
      return { title: "", slug: "", category: "establishment", summary: "", status: "draft", published_at: today };
    case "procedure":
      return { title: "", slug: "", category: "establishment", summary: "", status: "draft", published_at: today };
    case "update":
      return { title: "", slug: "", date: today, category: "finance", what_changed: "", who_is_affected: "", action_required: "", status: "draft" };
    case "faq":
      return { category: "General", question: "", answer: "" };
    case "glossary":
      return { term: "", definition: "", category: "General" };
    default:
      return { title: "" };
  }
}

function defaultBody(type: CmsContentType): string {
  if (!MARKDOWN_TYPES.includes(type)) return "";
  return "## Overview\n\nWrite your introduction here.\n\n## Procedure\n\n1. First step\n2. Second step\n\n## Checklist\n\n- [ ] Item one\n- [ ] Item two\n";
}
