import path from "path";
import { getArticles, getProcedures, getUpdates } from "@/lib/content";
import { getDocuments } from "@/lib/documents";
import { getTemplates } from "@/lib/templates";
import { faqItems } from "@/lib/faq";
import { glossaryTerms } from "@/lib/glossary";
import { readJsonFile } from "@/lib/read-json-file";
import type { CmsContentType } from "./types";

const contentDir = path.join(process.cwd(), "content");

function readJsonCount(relativePath: string, fallback: number): number {
  const items = readJsonFile<unknown[]>(path.join(contentDir, relativePath), []);
  return Array.isArray(items) ? items.length : fallback;
}
/** Count published items in deployed git content files (used when Postgres is unavailable). */
export function getGitContentCounts(): Record<CmsContentType, number> {
  return {
    article: getArticles().length,
    procedure: getProcedures().length,
    update: getUpdates().length,
    document: getDocuments().length,
    template: getTemplates().length,
    faq: readJsonCount("faq/items.json", faqItems.length),
    glossary: readJsonCount("glossary/terms.json", glossaryTerms.length),
  };
}
