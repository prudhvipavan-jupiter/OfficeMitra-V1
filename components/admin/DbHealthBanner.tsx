"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useAdminTheme } from "@/components/admin/AdminThemeProvider";

export function DbHealthBanner() {
  const { isJupiter } = useAdminTheme();
  const [db, setDb] = useState<"disabled" | "ok" | "unavailable" | null>(null);

  useEffect(() => {
    fetch("/api/admin/command")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setDb(d.system?.db ?? null))
      .catch(() => {});
  }, []);

  if (db !== "unavailable") return null;

  if (!isJupiter) {
    return (
      <div className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-950">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Database degraded — CMS edit and NeXus may use file fallback until Neon is restored.
          </span>
          <Link href="/admin/review" className="shrink-0 font-semibold underline">
            Review Hub →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="jarvis-content border-b border-red-500/30 bg-red-950/40 px-4 py-2">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2 text-sm text-red-100">
        <span className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Database degraded — CMS edit, NeXus persistence, and community features may use file fallback.
        </span>
        <Link href="/admin/review" className="shrink-0 font-semibold text-red-100 underline hover:text-white">
          Review Hub →
        </Link>
      </div>
    </div>
  );
}
