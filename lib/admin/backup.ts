import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { ensureSchema, getSql, isDatabaseEnabled } from "@/lib/db/client";
import { withDatabaseFallback } from "@/lib/db/resilience";

const BACKUP_VERSION = 1;
const MAX_BACKUPS = 20;
const LOCAL_FILES = [
  "expert-requests.json",
  "discussions.json",
  "digest-subscribers.json",
  "article-feedback.json",
  "admin-activity.json",
  "nexus/jobs.json",
];

export interface BackupSummary {
  cms_records: number;
  discussions: number;
  expert_requests: number;
  nexus_jobs: number;
  intel_updates: number;
  intel_sources: number;
  subscribers: number;
}

export interface BackupListItem {
  id: string;
  label: string;
  created_at: string;
  storage: "database" | "file";
  summary: BackupSummary;
}

export interface BackupPayload {
  version: number;
  exported_at: string;
  tables: Record<string, unknown[]>;
  local_files: Record<string, unknown>;
}

function backupsDir(): string {
  const dir = path.join(process.cwd(), "data", "backups");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function readLocalFiles(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const dataDir = path.join(process.cwd(), "data");
  for (const rel of LOCAL_FILES) {
    const filePath = path.join(dataDir, rel);
    if (!fs.existsSync(filePath)) continue;
    try {
      out[rel] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
      out[rel] = rel === "article-feedback.json" ? {} : [];
    }
  }
  return out;
}

function writeLocalFiles(files: Record<string, unknown>): void {
  const dataDir = path.join(process.cwd(), "data");
  for (const rel of LOCAL_FILES) {
    if (!(rel in files)) continue;
    const filePath = path.join(dataDir, rel);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(files[rel], null, 2), "utf-8");
  }
}

function summarize(tables: Record<string, unknown[]>, local: Record<string, unknown>): BackupSummary {
  const localCount = (key: string) => {
    const v = local[key];
    if (Array.isArray(v)) return v.length;
    if (v && typeof v === "object") return Object.keys(v).length;
    return 0;
  };

  return {
    cms_records: tables.cms_content?.length ?? 0,
    discussions: (tables.discussions?.length ?? 0) || localCount("discussions.json"),
    expert_requests: (tables.expert_requests?.length ?? 0) || localCount("expert-requests.json"),
    nexus_jobs: (tables.nexus_jobs?.length ?? 0) || localCount("nexus/jobs.json"),
    intel_updates: tables.intel_detected_updates?.length ?? 0,
    intel_sources: tables.intel_sources?.length ?? 0,
    subscribers: (tables.digest_subscribers?.length ?? 0) || localCount("digest-subscribers.json"),
  };
}

async function exportDatabaseTables(): Promise<Record<string, unknown[]>> {
  await ensureSchema();
  const sql = getSql();

  const safe = async (query: PromiseLike<unknown[]>) => {
    try {
      return await query;
    } catch {
      return [];
    }
  };

  const [
    discussions,
    expert_requests,
    cms_content,
    cms_files,
    article_feedback,
    digest_subscribers,
    search_queries,
    admin_activity,
    nexus_jobs,
    intel_detected_updates,
    intel_sources,
    intel_monitoring_runs,
    intel_activity_log,
  ] = await Promise.all([
    safe(sql`SELECT * FROM discussions`),
    safe(sql`SELECT * FROM expert_requests`),
    safe(sql`SELECT * FROM cms_content`),
    safe(sql`SELECT * FROM cms_files`),
    safe(sql`SELECT * FROM article_feedback`),
    safe(sql`SELECT * FROM digest_subscribers`),
    safe(sql`SELECT * FROM search_queries`),
    safe(sql`SELECT * FROM admin_activity`),
    safe(sql`SELECT * FROM nexus_jobs`),
    safe(sql`SELECT * FROM intel_detected_updates`),
    safe(sql`SELECT * FROM intel_sources`),
    safe(sql`SELECT * FROM intel_monitoring_runs`),
    safe(sql`SELECT * FROM intel_activity_log`),
  ]);

  return {
    discussions,
    expert_requests,
    cms_content,
    cms_files,
    article_feedback,
    digest_subscribers,
    search_queries,
    admin_activity,
    nexus_jobs,
    intel_detected_updates,
    intel_sources,
    intel_monitoring_runs,
    intel_activity_log,
  };
}

async function trimOldDbBackups(): Promise<void> {
  const sql = getSql();
  const rows = await sql`SELECT id FROM admin_backups ORDER BY created_at DESC`;
  if (rows.length <= MAX_BACKUPS) return;
  for (const row of rows.slice(MAX_BACKUPS)) {
    await sql`DELETE FROM admin_backups WHERE id = ${String(row.id)}`;
  }
}

async function saveBackupToDb(
  id: string,
  label: string,
  summary: BackupSummary,
  payload: BackupPayload
): Promise<void> {
  await ensureSchema();
  const sql = getSql();
  await sql`
    INSERT INTO admin_backups (id, label, summary, payload, created_at)
    VALUES (
      ${id},
      ${label},
      ${JSON.stringify(summary)}::jsonb,
      ${JSON.stringify(payload)}::jsonb,
      NOW()
    )
  `;
  await trimOldDbBackups();
}

function saveBackupToFile(
  id: string,
  label: string,
  summary: BackupSummary,
  payload: BackupPayload
): void {
  const filePath = path.join(backupsDir(), `${id}.json`);
  fs.writeFileSync(
    filePath,
    JSON.stringify({ id, label, summary, payload, created_at: payload.exported_at }, null, 2),
    "utf-8"
  );

  const files = fs
    .readdirSync(backupsDir())
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({
      name: f,
      mtime: fs.statSync(path.join(backupsDir(), f)).mtimeMs,
    }))
    .sort((a, b) => b.mtime - a.mtime);

  for (const stale of files.slice(MAX_BACKUPS)) {
    fs.unlinkSync(path.join(backupsDir(), stale.name));
  }
}

export async function createOperationalBackup(label?: string): Promise<BackupListItem> {
  const id = randomUUID();
  const exported_at = new Date().toISOString();
  const backupLabel = label?.trim() || `Backup ${exported_at.slice(0, 16).replace("T", " ")}`;
  const local_files = readLocalFiles();

  let tables: Record<string, unknown[]> = {};
  let storage: BackupListItem["storage"] = "file";

  if (isDatabaseEnabled()) {
    tables = await withDatabaseFallback(
      () => exportDatabaseTables(),
      () => ({})
    );
    if (Object.values(tables).some((rows) => rows.length > 0)) storage = "database";
  }

  const payload: BackupPayload = {
    version: BACKUP_VERSION,
    exported_at,
    tables,
    local_files,
  };
  const summary = summarize(tables, local_files);

  if (storage === "database") {
    await saveBackupToDb(id, backupLabel, summary, payload);
  } else {
    saveBackupToFile(id, backupLabel, summary, payload);
  }

  return { id, label: backupLabel, created_at: exported_at, storage, summary };
}

function listFileBackups(): BackupListItem[] {
  if (!fs.existsSync(backupsDir())) return [];
  return fs
    .readdirSync(backupsDir())
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      const raw = JSON.parse(fs.readFileSync(path.join(backupsDir(), f), "utf-8")) as {
        id: string;
        label: string;
        created_at: string;
        summary: BackupSummary;
      };
      return {
        id: raw.id,
        label: raw.label,
        created_at: raw.created_at,
        storage: "file" as const,
        summary: raw.summary,
      };
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function listOperationalBackups(): Promise<BackupListItem[]> {
  if (isDatabaseEnabled()) {
    const dbList = await withDatabaseFallback(async () => {
      await ensureSchema();
      const sql = getSql();
      const rows = await sql`
        SELECT id, label, summary, created_at FROM admin_backups ORDER BY created_at DESC LIMIT ${MAX_BACKUPS}
      `;
      return rows.map((row) => ({
        id: String(row.id),
        label: String(row.label),
        created_at: new Date(row.created_at as string).toISOString(),
        storage: "database" as const,
        summary: row.summary as BackupSummary,
      }));
    }, () => [] as BackupListItem[]);

    if (dbList.length > 0) return dbList;
  }

  return listFileBackups();
}

export async function getOperationalBackup(id: string): Promise<{
  item: BackupListItem;
  payload: BackupPayload;
} | null> {
  if (isDatabaseEnabled()) {
    const fromDb = await withDatabaseFallback(async () => {
      await ensureSchema();
      const sql = getSql();
      const rows = await sql`
        SELECT id, label, summary, payload, created_at FROM admin_backups WHERE id = ${id} LIMIT 1
      `;
      const row = rows[0];
      if (!row) return null;
      return {
        item: {
          id: String(row.id),
          label: String(row.label),
          created_at: new Date(row.created_at as string).toISOString(),
          storage: "database" as const,
          summary: row.summary as BackupSummary,
        },
        payload: row.payload as BackupPayload,
      };
    }, () => null);

    if (fromDb) return fromDb;
  }

  const filePath = path.join(backupsDir(), `${id}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8")) as {
    id: string;
    label: string;
    created_at: string;
    summary: BackupSummary;
    payload: BackupPayload;
  };
  return {
    item: {
      id: raw.id,
      label: raw.label,
      created_at: raw.created_at,
      storage: "file",
      summary: raw.summary,
    },
    payload: raw.payload,
  };
}

async function restoreDatabaseTables(tables: Record<string, unknown[]>): Promise<Record<string, number>> {
  await ensureSchema();
  const sql = getSql();
  const restored: Record<string, number> = {};

  await sql`DELETE FROM intel_activity_log`;
  await sql`DELETE FROM intel_monitoring_runs`;
  await sql`DELETE FROM intel_detected_updates`;
  await sql`DELETE FROM intel_sources`;
  await sql`DELETE FROM nexus_jobs`;
  await sql`DELETE FROM cms_files`;
  await sql`DELETE FROM cms_content`;
  await sql`DELETE FROM article_feedback`;
  await sql`DELETE FROM digest_subscribers`;
  await sql`DELETE FROM search_queries`;
  await sql`DELETE FROM admin_activity`;
  await sql`DELETE FROM expert_requests`;
  await sql`DELETE FROM discussions`;

  for (const row of (tables.discussions ?? []) as Record<string, unknown>[]) {
    await sql`
      INSERT INTO discussions (id, created_at, status, author_name, designation, institution, category, title, body, replies, views)
      VALUES (
        ${String(row.id)}, ${row.created_at as string}::timestamptz, ${String(row.status)},
        ${String(row.author_name)}, ${String(row.designation)}, ${String(row.institution)},
        ${String(row.category)}, ${String(row.title)}, ${String(row.body)},
        ${JSON.stringify(row.replies ?? [])}::jsonb, ${Number(row.views ?? 0)}
      )
    `;
  }
  restored.discussions = tables.discussions?.length ?? 0;

  for (const row of (tables.expert_requests ?? []) as Record<string, unknown>[]) {
    await sql`
      INSERT INTO expert_requests (
        id, reference_number, created_at, status, name, designation, institution, department,
        email, phone, service_type, case_summary, related_article_slug, response_notes, responded_at
      ) VALUES (
        ${String(row.id)}, ${String(row.reference_number)}, ${row.created_at as string}::timestamptz,
        ${String(row.status)}, ${String(row.name)}, ${String(row.designation)}, ${String(row.institution)},
        ${String(row.department)}, ${String(row.email)}, ${row.phone ? String(row.phone) : null},
        ${String(row.service_type)}, ${String(row.case_summary)},
        ${row.related_article_slug ? String(row.related_article_slug) : null},
        ${row.response_notes ? String(row.response_notes) : null},
        ${row.responded_at ? (row.responded_at as string) : null}::timestamptz
      )
    `;
  }
  restored.expert_requests = tables.expert_requests?.length ?? 0;

  for (const row of (tables.cms_content ?? []) as Record<string, unknown>[]) {
    await sql`
      INSERT INTO cms_content (id, content_type, slug, status, data, body, created_at, updated_at)
      VALUES (
        ${String(row.id)}, ${String(row.content_type)}, ${row.slug ? String(row.slug) : null},
        ${String(row.status)}, ${JSON.stringify(row.data ?? {})}::jsonb,
        ${row.body ? String(row.body) : null},
        ${row.created_at as string}::timestamptz, ${row.updated_at as string}::timestamptz
      )
    `;
  }
  restored.cms_content = tables.cms_content?.length ?? 0;

  for (const row of (tables.cms_files ?? []) as Record<string, unknown>[]) {
    await sql`
      INSERT INTO cms_files (id, content_id, field, filename, mime_type, size, data_base64, created_at)
      VALUES (
        ${String(row.id)}, ${String(row.content_id)}, ${String(row.field)}, ${String(row.filename)},
        ${String(row.mime_type)}, ${Number(row.size ?? 0)}, ${String(row.data_base64)},
        ${row.created_at as string}::timestamptz
      )
    `;
  }
  restored.cms_files = tables.cms_files?.length ?? 0;

  for (const row of (tables.nexus_jobs ?? []) as Record<string, unknown>[]) {
    await sql`
      INSERT INTO nexus_jobs (
        id, batch_id, topic, category, content_type, status, research_sources, research_notes,
        title, slug, summary, telugu_summary, body, quality_score, quality_notes, admin_notes,
        error_message, cms_id, published_slug, used_ai, created_at, updated_at, reviewed_at, published_at
      ) VALUES (
        ${String(row.id)}, ${String(row.batch_id)}, ${String(row.topic)}, ${String(row.category)},
        ${String(row.content_type)}, ${String(row.status)},
        ${JSON.stringify(row.research_sources ?? [])}::jsonb,
        ${row.research_notes ? String(row.research_notes) : null},
        ${row.title ? String(row.title) : null}, ${row.slug ? String(row.slug) : null},
        ${row.summary ? String(row.summary) : null}, ${row.telugu_summary ? String(row.telugu_summary) : null},
        ${row.body ? String(row.body) : null}, ${row.quality_score != null ? Number(row.quality_score) : null},
        ${row.quality_notes ? String(row.quality_notes) : null}, ${row.admin_notes ? String(row.admin_notes) : null},
        ${row.error_message ? String(row.error_message) : null}, ${row.cms_id ? String(row.cms_id) : null},
        ${row.published_slug ? String(row.published_slug) : null}, ${Boolean(row.used_ai)},
        ${row.created_at as string}::timestamptz, ${row.updated_at as string}::timestamptz,
        ${row.reviewed_at ? (row.reviewed_at as string) : null}::timestamptz,
        ${row.published_at ? (row.published_at as string) : null}::timestamptz
      )
    `;
  }
  restored.nexus_jobs = tables.nexus_jobs?.length ?? 0;

  restored.intel_detected_updates = tables.intel_detected_updates?.length ?? 0;
  restored.intel_sources = tables.intel_sources?.length ?? 0;

  return restored;
}

export async function restoreOperationalBackup(id: string): Promise<Record<string, number>> {
  const backup = await getOperationalBackup(id);
  if (!backup) throw new Error("Backup not found");

  const { payload } = backup;
  let restored: Record<string, number> = {};

  if (isDatabaseEnabled() && Object.values(payload.tables).some((rows) => rows.length > 0)) {
    restored = await withDatabaseFallback(
      () => restoreDatabaseTables(payload.tables),
      () => ({ db: 0 })
    );
  }

  if (payload.local_files && Object.keys(payload.local_files).length > 0) {
    writeLocalFiles(payload.local_files);
    for (const [key, val] of Object.entries(payload.local_files)) {
      restored[`file:${key}`] = Array.isArray(val)
        ? val.length
        : typeof val === "object" && val
          ? Object.keys(val).length
          : 0;
    }
  }

  return restored;
}

export async function deleteOperationalBackup(id: string): Promise<boolean> {
  let deleted = false;

  if (isDatabaseEnabled()) {
    deleted = await withDatabaseFallback(async () => {
      await ensureSchema();
      const sql = getSql();
      const rows = await sql`DELETE FROM admin_backups WHERE id = ${id} RETURNING id`;
      return rows.length > 0;
    }, () => false);
  }

  const filePath = path.join(backupsDir(), `${id}.json`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    deleted = true;
  }

  return deleted;
}
