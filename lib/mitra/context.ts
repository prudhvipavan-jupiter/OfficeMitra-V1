import { searchAll } from "@/lib/search";
import { expandSearchQuery } from "@/lib/search-synonyms";

export interface MitraSource {
  title: string;
  href: string;
  type: "article" | "procedure" | "faq" | "glossary" | "tool" | "update" | "document";
  snippet: string;
}

export async function buildMitraContext(query: string): Promise<{
  contextText: string;
  sources: MitraSource[];
}> {
  const expanded = expandSearchQuery(query);
  const searchQuery = expanded.length > 1 ? expanded.join(" ") : query;

  const results = await searchAll(searchQuery);
  const sources: MitraSource[] = [];

  for (const a of results.articles.slice(0, 4)) {
    sources.push({
      title: a.title,
      href: `/knowledge/${a.slug}`,
      type: "article",
      snippet: a.summary.slice(0, 280),
    });
  }
  for (const p of results.procedures.slice(0, 3)) {
    sources.push({
      title: p.title,
      href: `/procedures/${p.slug}`,
      type: "procedure",
      snippet: p.summary.slice(0, 280),
    });
  }
  for (const f of results.faq.slice(0, 3)) {
    sources.push({
      title: f.question,
      href: `/faq#${f.id}`,
      type: "faq",
      snippet: f.answer.slice(0, 220),
    });
  }
  for (const g of results.glossary.slice(0, 2)) {
    sources.push({
      title: g.term,
      href: `/glossary#${g.term.toLowerCase().replace(/\s+/g, "-")}`,
      type: "glossary",
      snippet: g.definition.slice(0, 220),
    });
  }
  for (const t of results.tools.slice(0, 2)) {
    sources.push({
      title: t.title,
      href: t.href,
      type: "tool",
      snippet: "Office calculator or checklist tool",
    });
  }
  for (const u of results.updates.slice(0, 2)) {
    sources.push({
      title: u.title,
      href: `/updates/${u.slug}`,
      type: "update",
      snippet: u.what_changed.slice(0, 220),
    });
  }

  if (sources.length === 0) {
    return {
      contextText: "No matching OfficeMitra content found for this query.",
      sources: [],
    };
  }

  const contextText = sources
    .map(
      (s, i) =>
        `[${i + 1}] ${s.type.toUpperCase()}: ${s.title}\nURL: ${s.href}\n${s.snippet}`
    )
    .join("\n\n");

  return { contextText, sources };
}
