import fs from "fs";
import path from "path";
import { setCmsSyncPaused } from "@/lib/cms/meta";
import { getSql, isDatabaseEnabled } from "@/lib/db/client";
import { withDatabaseFallback } from "@/lib/db/resilience";

const LOCAL_FILES = [
  "expert-requests.json",
  "discussions.json",
  "digest-subscribers.json",
  "article-feedback.json",
  "admin-activity.json",
  "nexus/jobs.json",
];

async function clearDatabase(): Promise<Record<string, number>> {
  const cleared: Record<string, number> = {};

  await setCmsSyncPaused(true);
  const sql = getSql();

  const discussions = await sql`DELETE FROM discussions RETURNING id`;
  cleared.discussions = discussions.length;

  const requests = await sql`DELETE FROM expert_requests RETURNING id`;
  cleared.expert_requests = requests.length;

  await sql`DELETE FROM cms_files`;
  const cmsRows = await sql`DELETE FROM cms_content RETURNING id`;
  cleared.cms_records = cmsRows.length;

  const feedback = await sql`DELETE FROM article_feedback RETURNING slug`;
  cleared.article_feedback = feedback.length;

  const subscribers = await sql`DELETE FROM digest_subscribers RETURNING email`;
  cleared.subscribers = subscribers.length;

  const searches = await sql`DELETE FROM search_queries RETURNING id`;
  cleared.search_queries = searches.length;

  const activity = await sql`DELETE FROM admin_activity RETURNING id`;
  cleared.admin_activity = activity.length;

  try {
    const nexus = await sql`DELETE FROM nexus_jobs RETURNING id`;
    cleared.nexus_jobs = nexus.length;
  } catch {
    cleared.nexus_jobs = 0;
  }

  try {
    const intelUpdates = await sql`DELETE FROM intel_detected_updates RETURNING id`;
    cleared.intel_updates = intelUpdates.length;
  } catch {
    cleared.intel_updates = 0;
  }

  try {
    const intelRuns = await sql`DELETE FROM intel_monitoring_runs RETURNING id`;
    cleared.intel_runs = intelRuns.length;
  } catch {
    cleared.intel_runs = 0;
  }

  try {
    const intelLog = await sql`DELETE FROM intel_activity_log RETURNING id`;
    cleared.intel_activity = intelLog.length;
  } catch {
    cleared.intel_activity = 0;
  }

  try {
    const intelSources = await sql`DELETE FROM intel_sources RETURNING id`;
    cleared.intel_sources = intelSources.length;
  } catch {
    cleared.intel_sources = 0;
  }

  return cleared;
}

function clearLocalFiles(): Record<string, number> {
  const cleared: Record<string, number> = {};
  const dataDir = path.join(process.cwd(), "data");

  for (const rel of LOCAL_FILES) {
    const filePath = path.join(dataDir, rel);
    if (!fs.existsSync(filePath)) {
      cleared[`file:${rel}`] = 0;
      continue;
    }
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      const count = Array.isArray(parsed)
        ? parsed.length
        : typeof parsed === "object" && parsed !== null
          ? Object.keys(parsed).length
          : 0;
      fs.writeFileSync(filePath, rel === "article-feedback.json" ? "{}" : "[]", "utf-8");
      cleared[`file:${rel}`] = count;
    } catch {
      cleared[`file:${rel}`] = 0;
    }
  }

  return cleared;
}

/** Wipe CMS records, queues, intel/nexus jobs, and local JSON fallbacks. */
export async function clearAllOperationalData(): Promise<Record<string, number>> {
  let cleared: Record<string, number> = {};

  if (isDatabaseEnabled()) {
    cleared = await withDatabaseFallback(
      () => clearDatabase(),
      () => ({ db: 0 })
    );
  }

  return { ...cleared, ...clearLocalFiles() };
}
