import { cmsList } from "./store";
import type { CmsContentType, CmsStatus } from "./types";

const ALL_TYPES: CmsContentType[] = [
  "article",
  "procedure",
  "update",
  "document",
  "template",
  "faq",
  "glossary",
];

export interface SectionStats {
  type: CmsContentType;
  total: number;
  published: number;
  draft: number;
  archived: number;
  duplicateSlugs: number;
}

function countByStatus(records: { status: CmsStatus }[], status: CmsStatus) {
  return records.filter((r) => r.status === status).length;
}

function countDuplicateSlugs(records: { slug: string | null }[]) {
  const seen = new Set<string>();
  let dupes = 0;
  for (const r of records) {
    if (!r.slug) continue;
    if (seen.has(r.slug)) dupes++;
    else seen.add(r.slug);
  }
  return dupes;
}

export async function getCmsSectionStats(): Promise<SectionStats[]> {
  const out: SectionStats[] = [];
  for (const type of ALL_TYPES) {
    const records = await cmsList(type, { includeDeleted: false });
    out.push({
      type,
      total: records.length,
      published: countByStatus(records, "published"),
      draft: countByStatus(records, "draft"),
      archived: countByStatus(records, "archived"),
      duplicateSlugs: countDuplicateSlugs(records),
    });
  }
  return out;
}

export async function getContentQualityStats() {
  const articles = await cmsList("article", { includeDeleted: false });
  const procedures = await cmsList("procedure", { includeDeleted: false });
  let expert = 0;
  let legacy = 0;
  let shortBody = 0;
  for (const r of [...articles, ...procedures]) {
    const level = String(r.data?.detail_level ?? "");
    if (level === "expert" || level === "comprehensive") expert++;
    else legacy++;
    const words = (r.body ?? "").split(/\s+/).filter(Boolean).length;
    if (words < 400) shortBody++;
  }
  return { expert, legacy, shortBody, markdownTotal: articles.length + procedures.length };
}

export async function getCmsTotals() {
  if (process.env.CMS_FORCE_EMPTY === "true") {
    const sections = ALL_TYPES.map((type) => ({
      type,
      total: 0,
      published: 0,
      draft: 0,
      archived: 0,
      duplicateSlugs: 0,
    }));
    return {
      sections,
      grandTotal: 0,
      publishedTotal: 0,
      draftTotal: 0,
      duplicateSlugsTotal: 0,
      quality: { expert: 0, legacy: 0, shortBody: 0, markdownTotal: 0 },
    };
  }
  const sections = await getCmsSectionStats();
  const quality = await getContentQualityStats();
  return {
    sections,
    grandTotal: sections.reduce((a, s) => a + s.total, 0),
    publishedTotal: sections.reduce((a, s) => a + s.published, 0),
    draftTotal: sections.reduce((a, s) => a + s.draft, 0),
    duplicateSlugsTotal: sections.reduce((a, s) => a + s.duplicateSlugs, 0),
    quality,
  };
}
