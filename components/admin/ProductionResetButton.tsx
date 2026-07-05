"use client";

import { useState } from "react";
import { createBackupBeforeReset } from "@/components/admin/BackupListPanel";

export function ProductionResetButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [backupFirst, setBackupFirst] = useState(true);

  async function runReset() {
    if (
      !confirm(
        "Clear all operational data to zero? Removes CMS DB records, NeXus jobs, Intel queue, community posts, expert requests, and subscribers. Git content files are kept — sync again from Review Hub when ready."
      )
    ) {
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      if (backupFirst) {
        const backupLabel = await createBackupBeforeReset();
        if (backupLabel) setMessage(`Auto-backup saved: ${backupLabel}. Clearing…`);
      }
      const res = await fetch("/api/admin/production-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backupFirst: false }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Reset failed");
      setMessage((prev) => `${prev ? `${prev} ` : ""}${json.message ?? "Done"}`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-500/30 dark:bg-amber-600/10">
      <strong className="text-navy-900 dark:text-white">Clear all data to zero</strong>
      <p className="mt-1 text-navy-800 dark:text-navy-200">
        Wipe queues, CMS database records, NeXus/Intel jobs, people requests, and subscribers. Markdown files in git are not deleted.
      </p>
      <label className="mt-3 flex items-center gap-2 text-navy-800 dark:text-navy-200">
        <input
          type="checkbox"
          checked={backupFirst}
          onChange={(e) => setBackupFirst(e.target.checked)}
          className="rounded border-navy-300"
        />
        Create backup before clearing
      </label>
      <button
        type="button"
        onClick={runReset}
        disabled={loading}
        className="mt-3 rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Clearing…" : "Clear all data to zero"}
      </button>
      {message && <p className="mt-2 text-navy-700 dark:text-navy-200">{message}</p>}
    </div>
  );
}
