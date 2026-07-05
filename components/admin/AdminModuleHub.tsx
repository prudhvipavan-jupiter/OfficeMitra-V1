"use client";

import Link from "next/link";
import { ADMIN_MODULES } from "@/lib/admin/modules";
import { AGENT_PIPELINES } from "@/lib/agents/pipeline-config";
import { AGENT_TOOLS } from "@/lib/agents/registry";

export function AdminModuleHub() {
  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gold-600">OfficeMitra Beast Stack</p>
          <h2 className="text-xl font-bold text-navy-900 dark:text-white">Admin modules</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-navy-300">
          {ADMIN_MODULES.length} modules · {AGENT_TOOLS.length} agents · {AGENT_PIPELINES.length} pipelines
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ADMIN_MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.id}
              href={mod.href}
              className="group relative overflow-hidden rounded-2xl border border-navy-100 bg-white p-5 shadow-sm transition hover:border-gold-400 hover:shadow-md dark:border-navy-700 dark:bg-navy-800/80"
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${mod.accent}`}
                aria-hidden
              />
              {mod.badge && (
                <span className="absolute right-3 top-3 rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-bold uppercase text-gold-800">
                  {mod.badge}
                </span>
              )}
              <Icon className="h-7 w-7 text-navy-700 dark:text-navy-200" />
              <h3 className="mt-3 font-semibold text-navy-900 dark:text-white">{mod.name}</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-navy-300">{mod.tagline}</p>
              <ul className="mt-3 space-y-0.5 text-xs text-gray-500 dark:text-navy-400">
                {mod.features.map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
              <span className="mt-4 inline-flex text-sm font-semibold text-navy-700 group-hover:text-gold-700 dark:text-gold-400">
                Open →
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
