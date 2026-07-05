import { getSql, isDatabaseEnabled } from "@/lib/db/client";
import { generateIntelDraft } from "./draft-generator";
import { buildUpgradeDraft } from "./public";
import { sanitizeIntelDraft } from "./sanitize-draft";
import { getIntelUpdateById, saveIntelDraft } from "./store";

const MIN_BODY_LENGTH = 800;

/** Upgrade published/draft intel posts that are still too brief. */
export async function upgradeBriefIntelPosts(): Promise<number> {
  if (!isDatabaseEnabled()) return 0;

  const sql = getSql();
  const rows = await sql`
    SELECT id FROM intel_detected_updates
    WHERE status IN ('PUBLISHED', 'DRAFT_GENERATED', 'APPROVED')
      AND (ai_body IS NULL OR char_length(ai_body) < ${MIN_BODY_LENGTH})
    ORDER BY published_at DESC NULLS LAST, detected_at DESC
    LIMIT 20
  `;

  let upgraded = 0;
  for (const row of rows) {
    const id = String((row as Record<string, unknown>).id);
    const update = await getIntelUpdateById(id);
    if (!update) continue;

    const draft = buildUpgradeDraft(update);
    await saveIntelDraft(id, draft);
    upgraded += 1;
  }

  return upgraded;
}

/** Re-sanitize existing intel draft text — removes portal/source names from stored drafts. */
export async function resanitizeIntelDrafts(limit = 100): Promise<number> {
  if (!isDatabaseEnabled()) return 0;

  const sql = getSql();
  const rows = await sql`
    SELECT u.id, u.source_url, s.name AS source_name,
           u.ai_title, u.ai_summary, u.ai_what_changed, u.ai_who_affected,
           u.ai_action_required, u.ai_reference_source, u.ai_department_impact,
           u.ai_keywords, u.ai_body
    FROM intel_detected_updates u
    LEFT JOIN intel_sources s ON s.id = u.source_id
    WHERE u.ai_body IS NOT NULL
      AND u.status IN ('DRAFT_GENERATED', 'APPROVED', 'PUBLISHED')
    ORDER BY u.updated_at DESC
    LIMIT ${limit}
  `;

  let fixed = 0;
  for (const row of rows) {
    const r = row as Record<string, unknown>;
    const keywords = Array.isArray(r.ai_keywords)
      ? (r.ai_keywords as string[])
      : typeof r.ai_keywords === "string"
        ? (JSON.parse(r.ai_keywords as string) as string[])
        : [];

    const draft = sanitizeIntelDraft(
      {
        title: String(r.ai_title ?? ""),
        summary: String(r.ai_summary ?? ""),
        what_changed: String(r.ai_what_changed ?? ""),
        who_is_affected: String(r.ai_who_affected ?? ""),
        action_required: String(r.ai_action_required ?? ""),
        reference_source: String(r.ai_reference_source ?? ""),
        department_impact: String(r.ai_department_impact ?? ""),
        keywords,
        body: String(r.ai_body ?? ""),
      },
      {
        sourceName: r.source_name ? String(r.source_name) : undefined,
        sourceUrl: String(r.source_url ?? ""),
      }
    );

    await saveIntelDraft(String(r.id), draft);
    fixed += 1;
  }

  return fixed;
}

export async function regenerateIntelDraft(updateId: string): Promise<boolean> {
  const update = await getIntelUpdateById(updateId);
  if (!update) return false;
  const draft = await generateIntelDraft(update);
  await saveIntelDraft(updateId, draft);
  return true;
}
