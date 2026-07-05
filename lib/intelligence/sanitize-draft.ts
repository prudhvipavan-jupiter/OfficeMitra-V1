import type { IntelDraft } from "./draft-generator";

/** Monitoring source labels — must not appear in published draft prose. */
const KNOWN_SOURCE_LABELS = [
  "GOIR — Government Orders Repository",
  "GOIR AP",
  "GOIR",
  "AP Health Department",
  "AP Finance Department",
  "APPSC — Recruitment",
  "APPSC",
  "APMSIDC",
  "AP Treasury",
  "General Administration Department",
  "APGLI Portal",
  "CFMS Portal",
  "OfficeMitra Editorial Briefings",
  "OfficeMitra Intelligence",
];

const PROSE_REPLACEMENTS: [RegExp, string][] = [
  [
    /\b(?:detected|listed|published|appeared|found|flagged|identified)\s+(?:on|at|from)\s+(?:the\s+)?(?:official\s+)?(?:government\s+)?(?:portal|website|site)[^.!\n]*/gi,
    "identified from an official government publication",
  ],
  [
    /\b(?:detected|listed|published|appeared|found|flagged)\s+(?:on|at|from)\s+[^.\n!]+/gi,
    "identified from an official government publication",
  ],
  [
    /\bnew\s+(?:item|publication|order|circular)\s+(?:was\s+)?(?:detected|listed|published|found)\s+(?:on|at|from)\s+[^.\n!]+/gi,
    "a new government publication may affect your office",
  ],
  [
    /\bOfficeMitra Intelligence (?:detected|flagged|found)[^.!\n]*/gi,
    "OfficeMitra Intelligence flagged a new government publication",
  ],
  [/\bverify on (?:the\s+)?[^.\n]+ portal\b/gi, "verify on the official portal"],
  [/\bopen (?:the\s+)?[^.\n]+ (?:portal|website)\b/gi, "open the official document link"],
  [/\b[\w.-]+\.ap\.gov\.in\b/gi, "official portal"],
  [/\b[\w.-]+\.gov\.in\b/gi, "official portal"],
  [
    /(?:the\s+)?official government portal(?:\s+(?:the\s+)?official government portal)+/gi,
    "the official government portal",
  ],
];

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripSourceLabel(text: string, sourceName?: string): string {
  let out = text;
  const labels = new Set<string>(KNOWN_SOURCE_LABELS);

  if (sourceName?.trim()) {
    labels.add(sourceName.trim());
    for (const part of sourceName.split(/[—–\-|]/)) {
      const p = part.trim();
      if (p.length >= 3) labels.add(p);
    }
  }

  for (const label of labels) {
    out = out.replace(new RegExp(escapeRegExp(label), "gi"), "the official government portal");
  }

  for (const [re, replacement] of PROSE_REPLACEMENTS) {
    out = out.replace(re, replacement);
  }

  // Neutralize markdown link text that is a portal brand
  out = out.replace(/\[([^\]]*(?:GOIR|AP Finance|APGLI|CFMS|AP Treasury|APMSIDC|APPSC)[^\]]*)\]\(([^)]+)\)/gi, "[View official document]($2)");

  return out.replace(/\s{2,}/g, " ").trim();
}

function normalizeReferenceSource(reference: string, sourceUrl?: string): string {
  if (sourceUrl?.startsWith("http")) return `Official link: ${sourceUrl}`;
  const cleaned = stripSourceLabel(reference);
  if (cleaned.includes("http")) return cleaned.replace(/^[^:]*:\s*/i, "Official link: ");
  return cleaned || (sourceUrl ? `Official link: ${sourceUrl}` : "Verify on the official document link.");
}

/** Remove monitoring website / portal names from intel draft fields. */
export function sanitizeIntelDraft(
  draft: IntelDraft,
  context?: { sourceName?: string; sourceUrl?: string }
): IntelDraft {
  const sourceName = context?.sourceName;

  return {
    title: stripSourceLabel(draft.title, sourceName),
    summary: stripSourceLabel(draft.summary, sourceName),
    what_changed: stripSourceLabel(draft.what_changed, sourceName),
    who_is_affected: stripSourceLabel(draft.who_is_affected, sourceName),
    action_required: stripSourceLabel(draft.action_required, sourceName),
    reference_source: normalizeReferenceSource(draft.reference_source, context?.sourceUrl),
    department_impact: stripSourceLabel(draft.department_impact, sourceName),
    body: stripSourceLabel(draft.body, sourceName),
    keywords: draft.keywords
      .map((k) => stripSourceLabel(k, sourceName))
      .filter((k) => k.length > 1 && !/^the official government portal$/i.test(k)),
  };
}
