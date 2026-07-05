import fs from "fs";
import path from "path";
import { readJsonFile } from "@/lib/read-json-file";

export interface GlossaryTerm {
  term: string;
  telugu?: string;
  definition: string;
  definition_te?: string;
  category: string;
  slug_key?: string;
  related_articles?: string[];
}

const termsPath = path.join(process.cwd(), "content", "glossary", "terms.json");

function loadTermsFromFile(): GlossaryTerm[] {
  if (!fs.existsSync(termsPath)) return [];
  return readJsonFile<GlossaryTerm[]>(termsPath, []);
}

export const glossaryTerms: GlossaryTerm[] = loadTermsFromFile();

export function searchGlossary(query: string): GlossaryTerm[] {
  const q = query.toLowerCase().trim();
  if (!q) return glossaryTerms;
  return glossaryTerms.filter(
    (g) =>
      g.term.toLowerCase().includes(q) ||
      g.definition.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      g.telugu?.includes(q) ||
      g.definition_te?.toLowerCase().includes(q)
  );
}
