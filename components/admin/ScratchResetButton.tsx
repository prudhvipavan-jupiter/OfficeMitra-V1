"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

export function ScratchResetButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [backupFirst, setBackupFirst] = useState(true);

  async function runScratchReset() {
    if (
      !confirm(
        "START FROM SCRATCH?\n\nThis permanently removes ALL articles, procedures, updates, documents, templates, FAQ, glossary, and PDF downloads from the site AND clears the database.\n\nTools (calculators) and pages (About, Contact) stay.\n\nThis cannot be undone except by restoring a backup."
      )
    ) {
      return;
    }
    if (!confirm("Final confirmation: wipe everything and start fresh?")) return;

    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/scratch-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backupFirst }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Reset failed");
      const parts = [
        json.backup_label ? `Backup: ${json.backup_label}` : null,
        json.message,
      ].filter(Boolean);
      setMessage(parts.join(" — "));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm dark:border-red-500/40 dark:bg-red-950/30">
      <strong className="flex items-center gap-2 text-red-900 dark:text-red-100">
        <AlertTriangle className="h-4 w-4" />
        Start from scratch
      </strong>
      <p className="mt-1 text-red-900/90 dark:text-red-100/90">
        Remove all published content from the website — markdown files, metadata, PDFs, and database records.
        Calculators/tools and static pages are kept.
      </p>
      <label className="mt-3 flex items-center gap-2 text-red-900 dark:text-red-100">
        <input
          type="checkbox"
          checked={backupFirst}
          onChange={(e) => setBackupFirst(e.target.checked)}
          className="rounded"
        />
        Create full backup before wiping
      </label>
      <button
        type="button"
        onClick={runScratchReset}
        disabled={loading}
        className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
      >
        {loading ? "Wiping site…" : "Clear entire website — start fresh"}
      </button>
      {message && <p className="mt-2 text-red-800 dark:text-red-100">{message}</p>}
    </div>
  );
}
