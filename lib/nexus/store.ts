import { randomUUID } from "crypto";
import { ensureSchema, getSql, isDatabaseEnabled } from "@/lib/db/client";
import { withDatabaseFallback } from "@/lib/db/resilience";
import * as local from "./local-store";
import type {
  NexusDashboardStats,
  NexusJob,
  NexusJobStatus,
  NexusResearchSource,
} from "./types";
import type { ArticleCategory } from "@/lib/categories";
import type { NexusContentType } from "./types";

function rowToJob(row: Record<string, unknown>): NexusJob {
  const sources =
    typeof row.research_sources === "string"
      ? (JSON.parse(row.research_sources) as NexusResearchSource[])
      : ((row.research_sources as NexusResearchSource[]) ?? []);

  return {
    id: String(row.id),
    batch_id: String(row.batch_id),
    topic: String(row.topic),
    category: row.category as ArticleCategory,
    content_type: row.content_type as NexusContentType,
    status: row.status as NexusJobStatus,
    research_sources: sources,
    research_notes: row.research_notes ? String(row.research_notes) : null,
    title: row.title ? String(row.title) : null,
    slug: row.slug ? String(row.slug) : null,
    summary: row.summary ? String(row.summary) : null,
    telugu_summary: row.telugu_summary ? String(row.telugu_summary) : null,
    body: row.body ? String(row.body) : null,
    quality_score: row.quality_score != null ? Number(row.quality_score) : null,
    quality_notes: row.quality_notes ? String(row.quality_notes) : null,
    admin_notes: row.admin_notes ? String(row.admin_notes) : null,
    error_message: row.error_message ? String(row.error_message) : null,
    cms_id: row.cms_id ? String(row.cms_id) : null,
    published_slug: row.published_slug ? String(row.published_slug) : null,
    used_ai: Boolean(row.used_ai),
    created_at: new Date(row.created_at as string).toISOString(),
    updated_at: new Date(row.updated_at as string).toISOString(),
    reviewed_at: row.reviewed_at ? new Date(row.reviewed_at as string).toISOString() : null,
    published_at: row.published_at ? new Date(row.published_at as string).toISOString() : null,
  };
}

async function dbListJobs(status?: NexusJobStatus): Promise<NexusJob[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = status
    ? await sql`
        SELECT * FROM nexus_jobs WHERE status = ${status}
        ORDER BY created_at DESC
      `
    : await sql`SELECT * FROM nexus_jobs ORDER BY created_at DESC`;
  return rows.map((r) => rowToJob(r as Record<string, unknown>));
}

async function dbGetJob(id: string): Promise<NexusJob | null> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`SELECT * FROM nexus_jobs WHERE id = ${id} LIMIT 1`;
  return rows[0] ? rowToJob(rows[0] as Record<string, unknown>) : null;
}

async function dbUpsertJob(job: NexusJob): Promise<NexusJob> {
  await ensureSchema();
  const sql = getSql();
  await sql`
    INSERT INTO nexus_jobs (
      id, batch_id, topic, category, content_type, status,
      research_sources, research_notes, title, slug, summary, telugu_summary, body,
      quality_score, quality_notes, admin_notes, error_message,
      cms_id, published_slug, used_ai,
      created_at, updated_at, reviewed_at, published_at
    ) VALUES (
      ${job.id}, ${job.batch_id}, ${job.topic}, ${job.category}, ${job.content_type}, ${job.status},
      ${JSON.stringify(job.research_sources)}::jsonb, ${job.research_notes},
      ${job.title}, ${job.slug}, ${job.summary}, ${job.telugu_summary}, ${job.body},
      ${job.quality_score}, ${job.quality_notes}, ${job.admin_notes}, ${job.error_message},
      ${job.cms_id}, ${job.published_slug}, ${job.used_ai},
      ${job.created_at}::timestamptz, ${job.updated_at}::timestamptz,
      ${job.reviewed_at}::timestamptz, ${job.published_at}::timestamptz
    )
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      research_sources = EXCLUDED.research_sources,
      research_notes = EXCLUDED.research_notes,
      title = EXCLUDED.title,
      slug = EXCLUDED.slug,
      summary = EXCLUDED.summary,
      telugu_summary = EXCLUDED.telugu_summary,
      body = EXCLUDED.body,
      quality_score = EXCLUDED.quality_score,
      quality_notes = EXCLUDED.quality_notes,
      admin_notes = EXCLUDED.admin_notes,
      error_message = EXCLUDED.error_message,
      cms_id = EXCLUDED.cms_id,
      published_slug = EXCLUDED.published_slug,
      used_ai = EXCLUDED.used_ai,
      updated_at = EXCLUDED.updated_at,
      reviewed_at = EXCLUDED.reviewed_at,
      published_at = EXCLUDED.published_at
  `;
  return job;
}

export function isNexusEnabled(): boolean {
  return isDatabaseEnabled();
}

export async function listNexusJobs(status?: NexusJobStatus): Promise<NexusJob[]> {
  if (isDatabaseEnabled()) {
    return withDatabaseFallback(
      () => dbListJobs(status),
      () => local.localListJobs(status)
    );
  }
  return local.localListJobs(status);
}

export async function getNexusJob(id: string): Promise<NexusJob | null> {
  if (isDatabaseEnabled()) {
    return withDatabaseFallback(
      () => dbGetJob(id),
      () => local.localGetJob(id)
    );
  }
  return local.localGetJob(id);
}

export async function saveNexusJob(job: NexusJob): Promise<NexusJob> {
  job.updated_at = new Date().toISOString();
  if (isDatabaseEnabled()) {
    return withDatabaseFallback(
      () => dbUpsertJob(job),
      () => local.localSaveJob(job)
    );
  }
  return local.localSaveJob(job);
}

export async function createNexusJob(input: {
  batch_id: string;
  topic: string;
  category: ArticleCategory;
  content_type: NexusContentType;
}): Promise<NexusJob> {
  const now = new Date().toISOString();
  const job: NexusJob = {
    id: randomUUID(),
    batch_id: input.batch_id,
    topic: input.topic.trim(),
    category: input.category,
    content_type: input.content_type,
    status: "QUEUED",
    research_sources: [],
    research_notes: null,
    title: null,
    slug: null,
    summary: null,
    telugu_summary: null,
    body: null,
    quality_score: null,
    quality_notes: null,
    admin_notes: null,
    error_message: null,
    cms_id: null,
    published_slug: null,
    used_ai: false,
    created_at: now,
    updated_at: now,
    reviewed_at: null,
    published_at: null,
  };
  return saveNexusJob(job);
}

export async function getNexusStats(): Promise<NexusDashboardStats> {
  const jobs = await listNexusJobs();
  const count = (s: NexusJobStatus) => jobs.filter((j) => j.status === s).length;
  return {
    queued: count("QUEUED"),
    researching: count("RESEARCHING"),
    draft_ready: count("DRAFT_READY"),
    approved: count("APPROVED"),
    published: count("PUBLISHED"),
    rejected: count("REJECTED"),
    failed: count("FAILED"),
    total: jobs.length,
  };
}

export async function getNextQueuedJob(): Promise<NexusJob | null> {
  const queued = await listNexusJobs("QUEUED");
  return queued.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0] ?? null;
}
