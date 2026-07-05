import { getDiscussions } from "./db/discussions";
import { expandSearchQuery } from "./search-synonyms";
import {
  loadArticles,
  loadDocuments,
  loadFaqItems,
  loadGlossaryTerms,
  loadProcedures,
  loadTemplates,
  loadUpdates,
} from "./cms/loaders";
import type { FaqItem } from "./faq";
import type { GlossaryTerm } from "./glossary";
import { toolDefinitions, toolSearchTitles, type ToolKey } from "./tools/registry";

export interface UnifiedSearchResults {
  articles: Awaited<ReturnType<typeof searchContentAsync>>["articles"];
  procedures: Awaited<ReturnType<typeof searchContentAsync>>["procedures"];
  documents: Awaited<ReturnType<typeof searchContentAsync>>["documents"];
  templates: Awaited<ReturnType<typeof searchContentAsync>>["templates"];
  updates: Awaited<ReturnType<typeof searchContentAsync>>["updates"];
  faq: FaqItem[];
  glossary: GlossaryTerm[];
  community: {
    id: string;
    title: string;
    body: string;
    category: string;
  }[];
  tools: { key: ToolKey; href: string; title: string }[];
}

function scoreText(text: string, terms: string[]): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const term of terms) {
    if (!term) continue;
    if (lower === term) score += 12;
    else if (lower.startsWith(term)) score += 8;
    else if (lower.includes(term)) score += 4;
  }
  return score;
}

function scoreItem(
  fields: string[],
  terms: string[],
  typeBoost = 0
): number {
  return fields.reduce((sum, f) => sum + scoreText(f, terms), 0) + typeBoost;
}

function sortByScore<T>(items: T[], scorer: (item: T) => number): T[] {
  return [...items].sort((a, b) => scorer(b) - scorer(a));
}

async function searchContentAsync(query: string) {
  const terms = expandSearchQuery(query);
  const q = query.toLowerCase().trim();
  const [articles, procedures, documents, templates, updates] = await Promise.all([
    loadArticles(),
    loadProcedures(),
    loadDocuments(),
    loadTemplates(),
    loadUpdates(),
  ]);
  if (!q && terms.length === 0) return { articles: [], procedures: [], documents: [], templates: [], updates: [] };

  const match = (fields: string[]) => terms.some((t) => fields.some((f) => f.toLowerCase().includes(t)));

  return {
    articles: sortByScore(
      articles.filter((a) =>
        match([
          a.title,
          a.summary,
          a.content.slice(0, 2000),
          a.telugu_summary ?? "",
          ...(a.tags ?? []),
        ])
      ),
      (a) =>
        scoreItem([a.title, a.summary, ...(a.tags ?? [])], terms, 1) +
        scoreText(a.content.slice(0, 1500), terms)
    ),
    procedures: sortByScore(
      procedures.filter((p) => match([p.title, p.summary, p.content.slice(0, 2000)])),
      (p) => scoreItem([p.title, p.summary], terms, 3) + scoreText(p.content.slice(0, 1500), terms)
    ),
    documents: sortByScore(
      documents.filter((d) => match([d.title, d.subject, d.number])),
      (d) => scoreItem([d.title, d.subject, d.number], terms, 2)
    ),
    templates: sortByScore(
      templates.filter((t) => match([t.title, t.description])),
      (t) => scoreItem([t.title, t.description], terms, 2)
    ),
    updates: sortByScore(
      updates.filter((u) => match([u.title, u.what_changed, u.action_required])),
      (u) => scoreItem([u.title, u.what_changed, u.action_required], terms, 2)
    ),
  };
}

export async function searchAll(query: string): Promise<UnifiedSearchResults> {
  const terms = expandSearchQuery(query);
  const q = query.toLowerCase().trim();
  const base = await searchContentAsync(query);

  if (!q && terms.length === 0) {
    return {
      ...base,
      faq: [],
      glossary: [],
      community: [],
      tools: [],
    };
  }

  const [faqAll, glossaryAll] = await Promise.all([loadFaqItems(), loadGlossaryTerms()]);
  const faqMatch = (f: (typeof faqAll)[0]) =>
    terms.some(
      (t) =>
        f.question.toLowerCase().includes(t) ||
        f.answer.toLowerCase().includes(t) ||
        f.category.toLowerCase().includes(t)
    );
  const faq = sortByScore(faqAll.filter(faqMatch), (f) =>
    scoreItem([f.question, f.answer, f.category], terms, 2)
  );
  const glossary = sortByScore(
    glossaryAll.filter((g) =>
      terms.some(
        (t) =>
          g.term.toLowerCase().includes(t) ||
          g.definition.toLowerCase().includes(t) ||
          g.category.toLowerCase().includes(t)
      )
    ),
    (g) => scoreItem([g.term, g.definition, g.category], terms, 1)
  );

  const discussions = await getDiscussions({ status: "published" });
  const resolved = await getDiscussions({ status: "resolved" });
  const community = sortByScore(
    [...discussions, ...resolved].filter((d) =>
      terms.some(
        (t) =>
          d.title.toLowerCase().includes(t) ||
          d.body.toLowerCase().includes(t) ||
          d.category.toLowerCase().includes(t)
      )
    ),
    (d) => scoreItem([d.title, d.body, d.category], terms)
  )
    .slice(0, 10)
    .map((d) => ({
      id: d.id,
      title: d.title,
      body: d.body,
      category: d.category,
    }));

  const tools = sortByScore(
    toolDefinitions.filter(({ key }) => {
      const title = toolSearchTitles[key].toLowerCase();
      return terms.some((t) => title.includes(t) || key.toLowerCase().includes(t));
    }),
    ({ key }) => scoreItem([toolSearchTitles[key], key], terms, 2)
  ).map(({ key, href }) => ({
    key,
    href,
    title: toolSearchTitles[key],
  }));

  return {
    ...base,
    faq,
    glossary,
    community,
    tools,
  };
}

export function countSearchResults(results: UnifiedSearchResults): number {
  return (
    results.articles.length +
    results.procedures.length +
    results.documents.length +
    results.templates.length +
    results.updates.length +
    results.faq.length +
    results.glossary.length +
    results.community.length +
    results.tools.length
  );
}
