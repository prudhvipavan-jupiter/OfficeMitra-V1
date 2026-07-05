"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Bot,
  Check,
  Copy,
  Loader2,
  Play,
  Save,
  Sparkles,
} from "lucide-react";
import { JarvisPage, JarvisPageHeader } from "@/components/admin/jarvis/JarvisPage";
import { Markdown } from "@/components/ui/Markdown";
import type { AgentDivision, AgentTool } from "@/lib/agents/registry";
import { AGENT_PIPELINES, type AgentPipeline } from "@/lib/agents/pipeline-config";
import { cn } from "@/lib/utils";

interface AgentsResponse {
  agents: AgentTool[];
  categoryLabels: Record<AgentDivision, string>;
  aiConfigured: boolean;
  pipelines?: AgentPipeline[];
}

interface RunOutput {
  markdown?: string;
  title?: string;
  slug?: string;
  summary?: string;
  telugu_summary?: string;
  category?: string;
  report?: Record<string, unknown>;
  seo?: Record<string, unknown>;
  telugu?: string;
  raw?: Record<string, unknown>;
}

export function AgentToolsDashboard() {
  const searchParams = useSearchParams();
  const urlPrefill = useMemo(() => {
    const p: Record<string, string> = {};
    searchParams.forEach((v, k) => {
      if (!["agent", "view", "pipeline", "autorun"].includes(k)) p[k] = v;
    });
    return p;
  }, [searchParams]);
  const hasUrlPrefill = Object.keys(urlPrefill).length > 0;

  const [meta, setMeta] = useState<AgentsResponse | null>(null);
  const [view, setView] = useState<"agents" | "pipelines">(
    searchParams.get("view") === "pipelines" ? "pipelines" : "agents"
  );
  const [division, setDivision] = useState<AgentDivision | "all">("all");
  const [selectedId, setSelectedId] = useState<string>(
    searchParams.get("agent") ?? "ap-government-content-writer"
  );
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>(
    searchParams.get("pipeline") ?? "beast-article"
  );
  const [form, setForm] = useState<Record<string, string>>(urlPrefill);
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    usedAi: boolean;
    output: RunOutput;
    saveAsArticle: boolean;
    saveContentType?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedSlug, setSavedSlug] = useState("");

  const selected = meta?.agents.find((a) => a.id === selectedId);
  const pipelines = meta?.pipelines ?? AGENT_PIPELINES;
  const selectedPipeline = pipelines.find((p) => p.id === selectedPipelineId);

  const filteredAgents =
    division === "all"
      ? meta?.agents ?? []
      : (meta?.agents ?? []).filter((a) => a.division === division);

  const loadMeta = useCallback(async () => {
    const res = await fetch("/api/admin/agents");
    if (!res.ok) return;
    const json = await res.json();
    setMeta(json);
  }, []);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    const agent = searchParams.get("agent");
    if (agent) setSelectedId(agent);
    if (searchParams.get("view") === "pipelines") setView("pipelines");
    const pipe = searchParams.get("pipeline");
    if (pipe) setSelectedPipelineId(pipe);
    if (hasUrlPrefill) setForm(urlPrefill);
  }, [searchParams, urlPrefill, hasUrlPrefill]);

  useEffect(() => {
    if (hasUrlPrefill) return;
    setForm({});
    setResult(null);
    setError("");
    setSavedSlug("");
  }, [selectedId, selectedPipelineId, view, hasUrlPrefill]);

  async function runAgent(builtInAction?: string) {
    if (!selected) return;
    setRunning(true);
    setError("");
    setResult(null);
    setSavedSlug("");

    try {
      const input = { ...form };
      if (builtInAction) input.action = builtInAction;

      const res = await fetch("/api/admin/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: selected.id, input }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Run failed");
      setResult({
        usedAi: json.usedAi,
        output: json.output,
        saveAsArticle: json.saveAsArticle,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Run failed");
    } finally {
      setRunning(false);
    }
  }

  async function runPipeline() {
    if (!selectedPipeline) return;
    setRunning(true);
    setError("");
    setResult(null);
    setSavedSlug("");
    try {
      const res = await fetch("/api/admin/agents/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pipelineId: selectedPipeline.id, input: form }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Pipeline failed");
      setResult({
        usedAi: json.steps?.some((s: { usedAi: boolean }) => s.usedAi) ?? false,
        output: {
          ...json.finalOutput,
          markdown: json.combinedMarkdown ?? json.finalOutput?.markdown,
        },
        saveAsArticle: json.saveAsArticle ?? false,
        saveContentType: json.saveContentType,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Pipeline failed");
    } finally {
      setRunning(false);
    }
  }

  async function saveDraft() {
    if (!result?.output || (!selected && !selectedPipeline)) return;
    setSaving(true);
    setError("");
    try {
      const agent = selected;
      const res = await fetch("/api/admin/agents/save-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: agent?.id ?? "ap-government-content-writer",
          title: result.output.title,
          slug: result.output.slug,
          summary: result.output.summary,
          telugu_summary: result.output.telugu_summary,
          category: result.output.category ?? form.category,
          body_markdown: result.output.markdown,
          content_type: result.saveContentType ?? agent?.saveContentType,
          raw: result.output.raw,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      setSavedSlug(json.slug ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function copyMarkdown() {
    if (!result?.output.markdown) return;
    await navigator.clipboard.writeText(result.output.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <JarvisPage>
      <JarvisPageHeader
        label="Agent operations"
        title="Agent Studio"
        subtitle={`${meta?.agents.length ?? 21} online tools + ${pipelines.length} Beast pipelines`}
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setView("agents")}
          className={cn("jarvis-btn", view === "agents" && "jarvis-btn-gold")}
        >
          Individual agents
        </button>
        <button
          type="button"
          onClick={() => setView("pipelines")}
          className={cn("jarvis-btn jarvis-btn-gold", view === "pipelines" && "ring-1 ring-amber-400/50")}
        >
          Beast pipelines
        </button>
        <Link
          href="/admin/nexus"
          className="jarvis-btn text-sm"
        >
          → NeXus batch factory
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        {meta?.aiConfigured ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
            <Sparkles className="h-3.5 w-3.5" />
            AI online (OpenAI)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
            <AlertCircle className="h-3.5 w-3.5" />
            GEMINI_API_KEY not set — quality/reality tools use offline heuristics; writers need Gemini key
          </span>
        )}
        <span className="text-gray-500 dark:text-navy-400">
          Powered by{" "}
          <a
            href="https://github.com/msitarzewski/agency-agents"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-700 hover:underline dark:text-gold-400"
          >
            agency-agents
          </a>
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="space-y-1" aria-label={view === "agents" ? "Agent tools" : "Pipelines"}>
          {view === "agents" && meta && (
            <div className="mb-3">
              <label className="text-xs font-semibold uppercase text-gray-500">Division</label>
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value as AgentDivision | "all")}
                className="input-field mt-1 text-sm"
              >
                <option value="all">All divisions</option>
                {Object.entries(meta.categoryLabels).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}
          {view === "agents"
            ? filteredAgents.map((agent) => (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => setSelectedId(agent.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition",
                    selectedId === agent.id
                      ? "bg-navy-700 text-white"
                      : "text-navy-800 hover:bg-navy-100 dark:text-navy-100 dark:hover:bg-navy-800"
                  )}
                >
                  <Bot className="h-4 w-4 shrink-0 opacity-70" />
                  <span className="font-medium">{agent.name}</span>
                </button>
              ))
            : pipelines.map((pipe) => (
                <button
                  key={pipe.id}
                  type="button"
                  onClick={() => setSelectedPipelineId(pipe.id)}
                  className={cn(
                    "flex w-full flex-col rounded-lg px-3 py-2.5 text-left text-sm transition",
                    selectedPipelineId === pipe.id
                      ? "bg-gold-600 text-white"
                      : "text-navy-800 hover:bg-gold-50 dark:text-navy-100 dark:hover:bg-navy-800"
                  )}
                >
                  <span className="font-medium">{pipe.name}</span>
                  <span className="text-xs opacity-80">{pipe.steps.length} steps</span>
                </button>
              ))}
        </nav>

        <div className="min-w-0">
          {view === "pipelines" && selectedPipeline && (
            <div className="rounded-xl border border-gold-200 bg-white p-6 dark:border-gold-700/40 dark:bg-navy-800/80">
              <h2 className="text-lg font-semibold text-navy-900 dark:text-white">{selectedPipeline.name}</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-navy-300">{selectedPipeline.description}</p>
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-navy-800 dark:text-navy-200">
                {selectedPipeline.steps.map((s) => (
                  <li key={s.agentId}>{s.label}</li>
                ))}
              </ol>
              <form
                className="mt-6 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  runPipeline();
                }}
              >
                {selectedPipeline.inputFields.map((field) => (
                  <div key={field.name}>
                    <label className="text-xs font-semibold uppercase text-gray-500" htmlFor={`p-${field.name}`}>
                      {field.label}
                      {field.required && " *"}
                    </label>
                    {field.type === "select" ? (
                      <select
                        id={`p-${field.name}`}
                        value={form[field.name] ?? ""}
                        onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))}
                        className="input-field mt-1"
                        required={field.required}
                      >
                        <option value="">Select…</option>
                        {field.options?.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        id={`p-${field.name}`}
                        rows={field.rows ?? 4}
                        value={form[field.name] ?? ""}
                        onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))}
                        className="input-field mt-1"
                        required={field.required}
                      />
                    ) : (
                      <input
                        id={`p-${field.name}`}
                        type="text"
                        value={form[field.name] ?? ""}
                        onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))}
                        className="input-field mt-1"
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={running}
                  className="inline-flex items-center gap-2 rounded-lg bg-gold-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gold-700 disabled:opacity-50"
                >
                  {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  Run Beast pipeline
                </button>
              </form>
              {error && (
                <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
              )}
              {result && (
                <div className="mt-6 border-t border-navy-100 pt-6 dark:border-navy-700">
                  <div className="flex flex-wrap gap-2">
                    {result.saveAsArticle && result.output.markdown && (
                      <button
                        type="button"
                        onClick={saveDraft}
                        disabled={saving}
                        className="inline-flex items-center gap-1 rounded-lg bg-gold-600 px-3 py-1.5 text-sm font-semibold text-white"
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save as CMS draft
                      </button>
                    )}
                  </div>
                  {result.output.markdown && (
                    <div className="prose prose-navy mt-4 max-w-none rounded-xl border p-4 dark:prose-invert">
                      <Markdown>{result.output.markdown}</Markdown>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {view === "agents" && selected && (
            <div className="rounded-xl border border-navy-100 bg-white p-6 dark:border-navy-700 dark:bg-navy-800/80">
              <h2 className="text-lg font-semibold text-navy-900 dark:text-white">{selected.name}</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-navy-300">{selected.description}</p>
              <p className="mt-2 text-sm text-navy-800 dark:text-navy-200">{selected.officemitraUse}</p>

              {selected.builtInAction && (
                <button
                  type="button"
                  onClick={() => runAgent(selected.builtInAction!.id)}
                  disabled={running}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-50"
                >
                  {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  {selected.builtInAction.label}
                </button>
              )}

              {selected.inputFields.length > 0 && (
                <form
                  className="mt-6 space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    runAgent();
                  }}
                >
                  {selected.inputFields.map((field) => (
                    <div key={field.name}>
                      <label className="text-xs font-semibold uppercase text-gray-500" htmlFor={field.name}>
                        {field.label}
                        {field.required && " *"}
                      </label>
                      {field.type === "select" ? (
                        <select
                          id={field.name}
                          value={form[field.name] ?? ""}
                          onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))}
                          className="input-field mt-1"
                          required={field.required}
                        >
                          <option value="">Select…</option>
                          {field.options?.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      ) : field.type === "textarea" ? (
                        <textarea
                          id={field.name}
                          rows={field.rows ?? 4}
                          value={form[field.name] ?? ""}
                          onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))}
                          placeholder={field.placeholder}
                          className="input-field mt-1"
                          required={field.required}
                        />
                      ) : (
                        <input
                          id={field.name}
                          type="text"
                          value={form[field.name] ?? ""}
                          onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))}
                          placeholder={field.placeholder}
                          className="input-field mt-1"
                          required={field.required}
                        />
                      )}
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={running}
                    className="inline-flex items-center gap-2 rounded-lg bg-navy-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-600 disabled:opacity-50"
                  >
                    {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    {running ? "Running…" : "Run tool"}
                  </button>
                </form>
              )}

              {error && (
                <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
                  {error}
                </p>
              )}

              {result && (
                <div className="mt-6 border-t border-navy-100 pt-6 dark:border-navy-700">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-gray-500 dark:text-navy-400">
                      {result.usedAi ? "Generated with AI" : "Ran with built-in logic"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.output.markdown && (
                        <button
                          type="button"
                          onClick={copyMarkdown}
                          className="inline-flex items-center gap-1 rounded-lg border border-navy-200 px-3 py-1.5 text-sm dark:border-navy-600"
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          Copy
                        </button>
                      )}
                      {result.saveAsArticle && result.output.markdown && result.output.title && (
                        <button
                          type="button"
                          onClick={saveDraft}
                          disabled={saving}
                          className="inline-flex items-center gap-1 rounded-lg bg-gold-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Save as CMS draft
                        </button>
                      )}
                    </div>
                  </div>

                  {savedSlug && (
                    <p className="mt-3 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100">
                      Saved as draft: <strong>{savedSlug}</strong> —{" "}
                      <Link href="/admin/content/article" className="font-medium underline">
                        Review in Content → Articles
                      </Link>
                    </p>
                  )}

                  {(result.output.title || result.output.slug) && (
                    <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                      {result.output.title && (
                        <>
                          <dt className="text-gray-500">Title</dt>
                          <dd className="font-medium text-navy-900 dark:text-white">{result.output.title}</dd>
                        </>
                      )}
                      {result.output.slug && (
                        <>
                          <dt className="text-gray-500">Slug</dt>
                          <dd className="font-mono text-navy-800 dark:text-navy-200">{result.output.slug}</dd>
                        </>
                      )}
                      {result.output.summary && (
                        <>
                          <dt className="text-gray-500">Summary</dt>
                          <dd className="text-navy-800 dark:text-navy-200">{result.output.summary}</dd>
                        </>
                      )}
                    </dl>
                  )}

                  {result.output.markdown && (
                    <div className="prose prose-navy mt-4 max-w-none rounded-xl border border-navy-100 bg-navy-50/50 p-4 dark:prose-invert dark:border-navy-700 dark:bg-navy-900/50">
                      <Markdown>{result.output.markdown}</Markdown>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </JarvisPage>
  );
}
