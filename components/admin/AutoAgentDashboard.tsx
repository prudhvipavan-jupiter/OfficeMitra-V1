"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Bot,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  Play,
  Save,
  Zap,
} from "lucide-react";
import { JarvisPage, JarvisPageHeader } from "@/components/admin/jarvis/JarvisPage";
import { Markdown } from "@/components/ui/Markdown";
import type { AutoAgentStep } from "@/lib/autogpt/runner";
import type { LlmBackendId } from "@/lib/llm/providers-config";
import { cn } from "@/lib/utils";

interface BackendStatus {
  id: LlmBackendId;
  label: string;
  configured: boolean;
  hint: string;
}

interface ConfigResponse {
  backends: BackendStatus[];
  defaultBackend: LlmBackendId | null;
  anyConfigured: boolean;
  workerProviders: string[];
  docs: { repo: string; localWorker: string };
}

interface RunResult {
  success: boolean;
  backend: LlmBackendId;
  task: string;
  steps: AutoAgentStep[];
  finalAnswer: string;
  error?: string;
  savedSlug?: string;
}

export function AutoAgentDashboard() {
  const [config, setConfig] = useState<ConfigResponse | null>(null);
  const [task, setTask] = useState(
    "Research and draft a short OfficeMitra knowledge article outline on TA bill preparation for AP government staff."
  );
  const [backend, setBackend] = useState<LlmBackendId>("gemini");
  const [maxSteps, setMaxSteps] = useState(5);
  const [workerProvider, setWorkerProvider] = useState("huggingchat");
  const [saveAsDraft, setSaveAsDraft] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RunResult | null>(null);
  const [copied, setCopied] = useState(false);

  const loadConfig = useCallback(async () => {
    const res = await fetch("/api/admin/auto-agent");
    if (!res.ok) return;
    const json = (await res.json()) as ConfigResponse;
    setConfig(json);
    if (json.defaultBackend) setBackend(json.defaultBackend);
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  async function runAgent() {
    setRunning(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/admin/auto-agent/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task,
          backend,
          maxSteps,
          saveAsDraft,
          workerProvider,
          useWorkerRun: backend === "free_worker",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Run failed");
      setResult(json as RunResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Run failed");
    } finally {
      setRunning(false);
    }
  }

  async function copyAnswer() {
    if (!result?.finalAnswer) return;
    await navigator.clipboard.writeText(result.finalAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <JarvisPage>
      <JarvisPageHeader
        label="Autonomous AI"
        title="Auto Agent"
        subtitle="Run goal-driven agents — Gemini (V1), Groq-compatible APIs, Ollama, or the local Free-AUTOGPT worker."
      />

      {!config?.anyConfigured && (
        <div className="jarvis-alert warn mb-6">
          <strong>No LLM backend configured.</strong> Set one of:{" "}
          <code className="rounded bg-black/30 px-1">GEMINI_API_KEY</code>,{" "}
          <code className="rounded bg-black/30 px-1">OPENAI_COMPAT_BASE_URL</code> (Groq/OpenRouter),{" "}
          <code className="rounded bg-black/30 px-1">OLLAMA_BASE_URL</code>, or run the{" "}
          <Link href="https://github.com/Decentralised-AI/Free-AUTOGPT-with-NO-API" className="underline" target="_blank">
            Free-AUTOGPT
          </Link>{" "}
          worker locally.
        </div>
      )}

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {config?.backends.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => b.configured && setBackend(b.id)}
            disabled={!b.configured}
            title={b.hint}
            className={cn(
              "jarvis-panel rounded-xl p-4 text-left transition",
              backend === b.id && b.configured && "ring-2 ring-cyan-400/60",
              !b.configured && "opacity-50"
            )}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-400/80">{b.label}</p>
            <p className="mt-1 text-sm text-slate-300">
              {b.configured ? (
                <span className="text-emerald-400">Ready</span>
              ) : (
                <span className="text-slate-500">Not configured</span>
              )}
            </p>
          </button>
        ))}
      </div>

      <div className="jarvis-panel mb-6 space-y-4 p-5">
        <div>
          <label className="jarvis-label mb-2 block" htmlFor="auto-task">
            Goal / task
          </label>
          <textarea
            id="auto-task"
            rows={4}
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="jarvis-input w-full resize-y"
            placeholder="Describe what the agent should accomplish…"
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div>
            <label className="jarvis-label mb-1 block" htmlFor="auto-steps">
              Max steps
            </label>
            <input
              id="auto-steps"
              type="number"
              min={1}
              max={10}
              value={maxSteps}
              onChange={(e) => setMaxSteps(Number(e.target.value))}
              className="jarvis-input w-24"
            />
          </div>

          {backend === "free_worker" && (
            <div>
              <label className="jarvis-label mb-1 block" htmlFor="worker-provider">
                Worker provider
              </label>
              <select
                id="worker-provider"
                value={workerProvider}
                onChange={(e) => setWorkerProvider(e.target.value)}
                className="jarvis-input"
              >
                <option value="huggingchat">HuggingChat (free)</option>
                <option value="ollama">Ollama via worker</option>
              </select>
            </div>
          )}

          <label className="flex items-center gap-2 self-end text-sm text-slate-300">
            <input
              type="checkbox"
              checked={saveAsDraft}
              onChange={(e) => setSaveAsDraft(e.target.checked)}
              className="rounded border-cyan-500/40"
            />
            Save result as CMS draft article
          </label>
        </div>

        <button
          type="button"
          onClick={runAgent}
          disabled={running || !config?.backends.find((b) => b.id === backend)?.configured}
          className="jarvis-btn-primary inline-flex items-center gap-2"
        >
          {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Run Auto Agent
        </button>

        {error && (
          <p className="text-sm text-red-300" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="jarvis-panel mb-6 p-5 text-sm text-slate-400">
        <p className="mb-2 flex items-center gap-2 font-semibold text-cyan-200">
          <Zap className="h-4 w-4" />
          Local Free-AUTOGPT worker
        </p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>
            Clone{" "}
            <a
              href="https://github.com/Decentralised-AI/Free-AUTOGPT-with-NO-API"
              className="text-cyan-300 underline"
              target="_blank"
              rel="noreferrer"
            >
              Free-AUTOGPT-with-NO-API
            </a>{" "}
            or use <code className="rounded bg-black/30 px-1">workers/free-autogpt</code> in this repo
          </li>
          <li>
            Set HuggingFace credentials in worker <code className="rounded bg-black/30 px-1">.env</code>
          </li>
          <li>
            Run <code className="rounded bg-black/30 px-1">python server.py</code> → set{" "}
            <code className="rounded bg-black/30 px-1">AUTOGPT_WORKER_URL=http://127.0.0.1:8765</code>
          </li>
          <li>For production, use a tunnel (ngrok) or deploy worker on a VPS</li>
        </ol>
        <a
          href="https://github.com/Decentralised-AI/Free-AUTOGPT-with-NO-API"
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-100"
        >
          Upstream repo <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {result && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                result.success ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
              )}
            >
              {result.success ? "Completed" : "Failed"}
            </span>
            <span className="text-xs text-slate-500">{result.steps.length} steps · {result.backend}</span>
            {result.savedSlug && (
              <Link
                href={`/admin/content/article`}
                className="inline-flex items-center gap-1 text-xs text-cyan-300 underline"
              >
                <Save className="h-3.5 w-3.5" />
                Draft saved ({result.savedSlug})
              </Link>
            )}
            <button type="button" onClick={copyAnswer} className="jarvis-btn text-xs">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              Copy answer
            </button>
          </div>

          {result.steps.length > 0 && (
            <div className="jarvis-panel p-4">
              <p className="jarvis-label mb-3">Agent trace</p>
              <ol className="space-y-3">
                {result.steps.map((s) => (
                  <li key={s.step} className="rounded-lg border border-cyan-500/10 bg-black/20 p-3 text-sm">
                    <p className="font-medium text-cyan-200">
                      Step {s.step} · {s.action}
                    </p>
                    {s.thought && <p className="mt-1 text-slate-400">{s.thought}</p>}
                    <p className="mt-2 whitespace-pre-wrap text-slate-300">{s.observation}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {result.finalAnswer && (
            <div className="jarvis-panel p-5">
              <p className="jarvis-label mb-3 flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Final output
              </p>
              <Markdown>{result.finalAnswer}</Markdown>
            </div>
          )}

          {result.error && <p className="text-sm text-red-300">{result.error}</p>}
        </div>
      )}
    </JarvisPage>
  );
}
