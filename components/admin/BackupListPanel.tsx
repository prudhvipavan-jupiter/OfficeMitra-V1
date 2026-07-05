"use client";

import { useCallback, useEffect, useState } from "react";
import { Archive, Download, RefreshCw, RotateCcw, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { BackupListItem } from "@/lib/admin/backup";

export function BackupListPanel() {
  const [backups, setBackups] = useState<BackupListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [label, setLabel] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/backups");
      const json = await res.json();
      if (res.ok) setBackups(json.backups ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createBackup() {
    setBusy("create");
    setMessage("");
    try {
      const res = await fetch("/api/admin/backups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Backup failed");
      setLabel("");
      setMessage(`Backup created: ${json.backup?.label ?? "OK"}`);
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Backup failed");
    } finally {
      setBusy("");
    }
  }

  async function restoreBackup(id: string, name: string) {
    if (!confirm(`Restore "${name}"? Current operational data will be replaced.`)) return;
    setBusy(id);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/backups/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Restore failed");
      setMessage(`Restored from "${name}"`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Restore failed");
    } finally {
      setBusy("");
    }
  }

  async function deleteBackup(id: string, name: string) {
    if (!confirm(`Delete backup "${name}"?`)) return;
    setBusy(id);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/backups/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Delete failed");
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy("");
    }
  }

  function downloadBackup(id: string, name: string) {
    window.open(`/api/admin/backups/${id}`, "_blank", "noopener,noreferrer");
    setMessage(`Downloading ${name}…`);
  }

  return (
    <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-4 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <strong className="flex items-center gap-2 text-cyan-100">
            <Archive className="h-4 w-4" />
            Backup list
          </strong>
          <p className="mt-1 text-slate-400">
            Snapshot CMS DB records, queues, NeXus/Intel jobs, and people data before clearing or migrating.
          </p>
        </div>
        <button type="button" onClick={load} className="jarvis-btn text-xs">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Optional backup label"
          className="min-w-[200px] flex-1 rounded-lg border border-cyan-500/20 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder:text-slate-500"
        />
        <button
          type="button"
          onClick={createBackup}
          disabled={busy === "create"}
          className="jarvis-btn jarvis-btn-gold"
        >
          {busy === "create" ? "Saving…" : "Create backup"}
        </button>
      </div>

      {message && <p className="mt-3 text-cyan-200">{message}</p>}

      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <p className="text-slate-500">Loading backups…</p>
        ) : backups.length === 0 ? (
          <p className="rounded-lg border border-dashed border-cyan-500/20 px-4 py-8 text-center text-slate-500">
            No backups yet — create one before clearing data.
          </p>
        ) : (
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead>
              <tr className="border-b border-cyan-500/20 text-slate-400">
                <th className="py-2 pr-3 font-medium">Label</th>
                <th className="py-2 pr-3 font-medium">Created</th>
                <th className="py-2 pr-3 font-medium">CMS</th>
                <th className="py-2 pr-3 font-medium">People</th>
                <th className="py-2 pr-3 font-medium">NeXus</th>
                <th className="py-2 pr-3 font-medium">Intel</th>
                <th className="py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((b) => (
                <tr key={b.id} className="border-b border-cyan-500/10 text-slate-300">
                  <td className="py-3 pr-3 font-medium text-white">{b.label}</td>
                  <td className="py-3 pr-3 whitespace-nowrap">{formatDate(b.created_at)}</td>
                  <td className="py-3 pr-3">{b.summary.cms_records}</td>
                  <td className="py-3 pr-3">
                    {b.summary.discussions + b.summary.expert_requests}
                  </td>
                  <td className="py-3 pr-3">{b.summary.nexus_jobs}</td>
                  <td className="py-3 pr-3">{b.summary.intel_updates}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        title="Restore"
                        disabled={!!busy}
                        onClick={() => restoreBackup(b.id, b.label)}
                        className="rounded border border-emerald-500/30 px-2 py-1 text-emerald-300 hover:bg-emerald-500/10"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Download JSON"
                        onClick={() => downloadBackup(b.id, b.label)}
                        className="rounded border border-cyan-500/30 px-2 py-1 text-cyan-300 hover:bg-cyan-500/10"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        disabled={!!busy}
                        onClick={() => deleteBackup(b.id, b.label)}
                        className="rounded border border-red-500/30 px-2 py-1 text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/** Create backup via API — used before production reset. */
export async function createBackupBeforeReset(label?: string): Promise<string | null> {
  const res = await fetch("/api/admin/backups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label: label ?? "Auto-backup before clear" }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Auto-backup failed");
  return json.backup?.label ?? null;
}
