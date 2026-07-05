import { formatDocumentsMarkdown, relatedKnowledgeSlug } from "./document-links";
import { isPrimaryAiConfigured, primaryAiJson } from "@/lib/llm/primary-ai";
import { sanitizeIntelDraft } from "./sanitize-draft";
import type { IntelDetectedUpdate } from "./types";

export interface IntelDraft {
  title: string;
  summary: string;
  what_changed: string;
  who_is_affected: string;
  action_required: string;
  reference_source: string;
  department_impact: string;
  keywords: string[];
  body: string;
}

function section(title: string, body: string): string {
  return `## ${title}\n\n${body.trim()}\n`;
}

function departmentLabel(category?: string): string {
  if (!category?.trim()) return "AP government administration";
  const c = category.trim();
  if (/officemitra/i.test(c)) return "AP ministerial staff";
  return c.replace(/\s*Department\s*$/i, "").trim() || c;
}

function buildDetailedFallback(item: {
  title: string;
  source_category?: string;
  source_url: string;
}): IntelDraft {
  const department = departmentLabel(item.source_category);
  const slug = relatedKnowledgeSlug(item.title);

  const body = [
    section(
      "Overview",
      `OfficeMitra Intelligence flagged a new government publication titled **"${item.title}"**. This guide explains what ${department} ministerial staff should do next. We do not reproduce government text — open the official link below, verify GO/circular numbers on GOIR, and confirm with your controlling officer before acting.`
    ),
    section(
      "What appears to have changed",
      `A new order or circular titled **"${item.title}"** may affect AP government employees. Based on the subject area (${department}), review whether establishment, finance, leave, or service rules apply to your institution.`
    ),
    section(
      "Who should review this",
      `- Establishment section staff\n- DDO / finance section\n- Head of Office\n- Ministerial staff handling ${department} matters where applicable`
    ),
    section(
      "Recommended office action",
      "1. Open the official document link and download/read the full order\n2. Note GO/circular number and date\n3. Assess applicability to your institution\n4. Brief Head of Office if action required\n5. Prepare proceedings or office instructions\n6. Update Service Registers, leave accounts, or BCR\n7. File GO copy in subject file"
    ),
    section(
      "Documents to collect",
      "- Official order/circular (from the link below)\n- Previous related GOs for comparison\n- Office note for Head of Office\n- Employee list if head-count action needed"
    ),
    formatDocumentsMarkdown(item.title, item.source_url),
    slug ? `\n## Related OfficeMitra guide\n\n[Full step-by-step guide → /knowledge/${slug}](/knowledge/${slug})\n` : "",
    `\n## తెలుగు సారాంశం\n\n**${item.title}** — కొత్త ప్రభుత్వ order/circular ministerial staff కు applicable కావచ్చు. GOIR లో GO number verify చేయండి. Head of Office కు brief చేసి, proceedings తయారు చేయండి.\n\n**చర్య:** (1) Official document open (2) GO number note (3) Applicability check (4) SR/BCR update\n`,
  ].join("\n");

  const draft: IntelDraft = {
    title: item.title.length > 100 ? item.title.slice(0, 97) + "…" : item.title,
    summary: `New government publication: "${item.title}". Follow the office action guide and verify GO/circular details before acting.`,
    what_changed: `New publication titled "${item.title}" may affect ${department} staff. Verify scope and effective date on the official order.`,
    who_is_affected: `AP ministerial staff in ${department}, especially establishment and finance sections.`,
    action_required:
      "1. Read official document\n2. Note GO number/date\n3. Brief Head of Office\n4. Prepare proceedings\n5. Update SR and office records",
    reference_source: `Official link: ${item.source_url}`,
    department_impact: department,
    keywords: ["AP government", department.toLowerCase(), "circular", "GO", "ministerial staff"],
    body,
  };

  return sanitizeIntelDraft(draft, { sourceUrl: item.source_url });
}

const DETAILED_SYSTEM_PROMPT = `You are OfficeMitra Intelligence for AP government ministerial staff.

Write ORIGINAL detailed content from metadata only — never copy government text.

CRITICAL — do NOT name monitoring websites, portal brands, or source labels anywhere (summary, what_changed, body, title, etc.).
NEVER write phrases like "detected on GOIR", "listed on AP Finance Department website", "published on the Health portal", or the source URL hostname in prose.
Write about the government order/circular itself: its title, department area, and what staff should do.
Put the URL ONLY in reference_source as "Official link: <url>" and in "## Official documents & links" with link text "View official document" — never a portal brand name.

JSON keys: title, summary, what_changed, who_is_affected, action_required, reference_source, department_impact, keywords (array), body (long markdown).

Body must include: Overview, Applicable rules, Step-by-step procedure, Practical example (AP hospital), Checklist, Documents required, Official documents & links, Common mistakes. Minimum 600 words in body.`;

export { buildDetailedFallback };

export async function generateIntelDraft(update: IntelDetectedUpdate): Promise<IntelDraft> {
  const item = {
    title: update.title,
    department_category: departmentLabel(update.source?.category),
    source_url: update.source_url,
    published_date: update.published_date,
  };

  const fallbackInput = {
    title: update.title,
    source_category: update.source?.category,
    source_url: update.source_url,
  };

  if (!isPrimaryAiConfigured()) return buildDetailedFallback(fallbackInput);

  try {
    const draft = (await primaryAiJson(
      DETAILED_SYSTEM_PROMPT,
      `Generate a DETAILED OfficeMitra update from this metadata (do NOT repeat any website/portal name in output):\n${JSON.stringify(item, null, 2)}\n\nreference_source must be exactly "Official link: ${update.source_url}".\nAppend to body a section "## Official documents & links" with the URL as a markdown link — link text must be "View official document" only.`
    )) as Partial<IntelDraft>;
    const base = buildDetailedFallback(fallbackInput);

    let body = draft.body ?? base.body;
    if (!body.includes("Official documents")) {
      body += "\n\n" + formatDocumentsMarkdown(update.title, update.source_url);
    }

    const merged: IntelDraft = {
      title: draft.title ?? base.title,
      summary: draft.summary ?? base.summary,
      what_changed: draft.what_changed ?? base.what_changed,
      who_is_affected: draft.who_is_affected ?? base.who_is_affected,
      action_required: draft.action_required ?? base.action_required,
      reference_source: draft.reference_source ?? base.reference_source,
      department_impact: draft.department_impact ?? base.department_impact,
      keywords: Array.isArray(draft.keywords) ? draft.keywords : base.keywords,
      body,
    };

    return sanitizeIntelDraft(merged, {
      sourceName: update.source?.name,
      sourceUrl: update.source_url,
    });
  } catch {
    return buildDetailedFallback(fallbackInput);
  }
}
