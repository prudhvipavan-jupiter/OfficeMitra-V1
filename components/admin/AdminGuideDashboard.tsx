"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  ChevronRight,
  ExternalLink,
  Search,
} from "lucide-react";
import { JarvisPage, JarvisPageHeader } from "@/components/admin/jarvis/JarvisPage";
import { TelegramSettingsPanel } from "@/components/admin/TelegramSettingsPanel";
import {
  ADMIN_GUIDE_INTRO,
  ADMIN_GUIDE_SECTIONS,
  ADMIN_GUIDE_WORKFLOWS,
} from "@/lib/admin/guide-content";
import { ADMIN_MODULES } from "@/lib/admin/modules";
import { cn } from "@/lib/utils";

export function AdminGuideDashboard() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(ADMIN_GUIDE_SECTIONS[0]?.id ?? "getting-started");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ADMIN_GUIDE_SECTIONS;
    return ADMIN_GUIDE_SECTIONS.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        s.steps.some((st) => st.title.toLowerCase().includes(q) || st.detail.toLowerCase().includes(q))
    );
  }, [query]);

  const active = ADMIN_GUIDE_SECTIONS.find((s) => s.id === activeId) ?? ADMIN_GUIDE_SECTIONS[0];

  return (
    <JarvisPage>
      <JarvisPageHeader
        label="Documentation"
        title={ADMIN_GUIDE_INTRO.title}
        subtitle={ADMIN_GUIDE_INTRO.subtitle}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {ADMIN_MODULES.map((m) => (
          <Link key={m.id} href={m.href} className="jarvis-btn text-xs">
            {m.name}
          </Link>
        ))}
      </div>

      <section className="jarvis-panel scroll-mt-24 p-6">
        <TelegramSettingsPanel compact />
        <p className="mt-4 text-sm admin-text-muted">
          Full setup steps and env checklist:{" "}
          <Link href="/admin/settings" className="text-cyan-600 underline dark:text-cyan-400">
            Settings → Integrations
          </Link>
        </p>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="jarvis-panel h-fit p-3">
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search guide…"
              className="jarvis-input w-full pl-9 text-sm"
            />
          </div>
          <nav className="space-y-0.5">
            {filtered.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveId(s.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition",
                  activeId === s.id ? "bg-cyan-500/15 text-cyan-200" : "text-slate-400 hover:bg-white/5"
                )}
              >
                <BookOpen className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{s.title}</span>
              </button>
            ))}
          </nav>
        </aside>

        <article className="jarvis-panel p-6">
          {active && (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white">{active.title}</h2>
                  <p className="mt-2 text-slate-300">{active.summary}</p>
                </div>
                {active.href && (
                  <Link href={active.href} className="jarvis-btn inline-flex items-center gap-1 text-sm">
                    Open module <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>

              <div className="mt-6">
                <h3 className="jarvis-label mb-2">When to use</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
                  {active.whenToUse.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <h3 className="jarvis-label mb-3">Step by step</h3>
                <ol className="space-y-4">
                  {active.steps.map((step, i) => (
                    <li key={step.title} className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-300">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-medium text-white">{step.title}</p>
                        <p className="mt-1 text-sm text-slate-400">{step.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {active.tips && active.tips.length > 0 && (
                <div className="jarvis-alert mt-6 text-sm">
                  <strong className="text-cyan-200">Tips</strong>
                  <ul className="mt-2 list-disc pl-5 text-slate-300">
                    {active.tips.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              {active.warnings && active.warnings.length > 0 && (
                <div className="jarvis-alert critical mt-4 text-sm">
                  <strong>Warnings</strong>
                  <ul className="mt-2 list-disc pl-5">
                    {active.warnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </article>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-white">Common workflows</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {ADMIN_GUIDE_WORKFLOWS.map((wf) => (
            <div key={wf.id} className="jarvis-panel p-4">
              <h3 className="font-semibold text-cyan-200">{wf.title}</h3>
              <ol className="mt-3 space-y-2">
                {wf.steps.map((step, i) => (
                  <li key={step} className="flex gap-2 text-sm text-slate-400">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-cyan-500" />
                    <span>
                      <span className="text-slate-500">{i + 1}. </span>
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <div className="jarvis-panel mt-8 p-4 text-sm text-slate-400">
        <p className="flex items-center gap-2 font-semibold text-cyan-200">
          <Check className="h-4 w-4" />
          Quick links
        </p>
        <ul className="mt-2 space-y-1">
          <li>
            Login:{" "}
            <Link href={ADMIN_GUIDE_INTRO.loginUrl} className="text-cyan-300 underline">
              {ADMIN_GUIDE_INTRO.loginUrl}
            </Link>
          </li>
          <li>
            Production:{" "}
            <a href={ADMIN_GUIDE_INTRO.productionUrl} className="text-cyan-300 underline" target="_blank" rel="noreferrer">
              {ADMIN_GUIDE_INTRO.productionUrl}
            </a>
          </li>
        </ul>
      </div>
    </JarvisPage>
  );
}
