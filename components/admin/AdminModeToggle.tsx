"use client";

import { Moon, Sun } from "lucide-react";
import { useAdminTheme } from "@/components/admin/AdminThemeProvider";
import { cn } from "@/lib/utils";

export function AdminModeToggle({ compact }: { compact?: boolean }) {
  const { mode, setMode, isJupiter } = useAdminTheme();

  return (
    <div
      className={cn(
        "inline-flex rounded-lg border p-0.5 text-xs font-semibold",
        isJupiter ? "border-cyan-500/25 bg-cyan-950/40" : "border-navy-200 bg-white"
      )}
      role="group"
      aria-label="Admin display mode"
    >
      <button
        type="button"
        onClick={() => setMode("normal")}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-2 py-1 transition",
          mode === "normal"
            ? "bg-navy-700 text-white shadow-sm"
            : isJupiter
              ? "text-slate-400 hover:text-slate-200"
              : "text-gray-600 hover:text-navy-900"
        )}
        aria-pressed={mode === "normal"}
      >
        <Sun className="h-3.5 w-3.5" />
        {!compact && "Normal"}
      </button>
      <button
        type="button"
        onClick={() => setMode("jupiter")}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-2 py-1 transition",
          mode === "jupiter"
            ? "bg-cyan-600 text-white shadow-sm shadow-cyan-500/30"
            : "text-gray-600 hover:text-navy-900"
        )}
        aria-pressed={mode === "jupiter"}
      >
        <Moon className="h-3.5 w-3.5" />
        {!compact && "Jupiter"}
      </button>
    </div>
  );
}
