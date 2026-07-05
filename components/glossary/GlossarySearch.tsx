"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "@/components/i18n/LanguageProvider";
import type { GlossaryTerm } from "@/lib/glossary";

interface GlossarySearchProps {
  terms: GlossaryTerm[];
  locale?: "en" | "te";
}

export function GlossarySearch({ terms, locale = "en" }: GlossarySearchProps) {
  const t = useTranslations();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return terms;
    return terms.filter(
      (term) =>
        term.term.toLowerCase().includes(q) ||
        term.definition.toLowerCase().includes(q) ||
        term.telugu?.includes(q) ||
        term.category.toLowerCase().includes(q)
    );
  }, [terms, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, GlossaryTerm[]>();
    filtered.forEach((term) => {
      const list = map.get(term.category) ?? [];
      list.push(term);
      map.set(term.category, list);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.glossary.searchPlaceholder}
        className="input-field"
      />

      {filtered.length === 0 ? (
        <p className="mt-8 text-gray-500">{t.common.noResults}</p>
      ) : (
        <div className="mt-8 space-y-8">
          {grouped.map(([category, categoryTerms]) => (
            <section key={category}>
              <h2 className="text-lg font-semibold text-navy-900">{category}</h2>
              <dl className="mt-4 space-y-4">
                {categoryTerms.map((term) => (
                  <div
                    key={term.slug_key ?? term.term}
                    className="rounded-xl border border-navy-100 bg-white p-4 shadow-sm dark:border-navy-700 dark:bg-navy-800/80"
                  >
                    <dt className="font-bold text-navy-900">
                      {term.term}
                      {term.telugu && (
                        <span className="ml-2 font-normal text-navy-600">({term.telugu})</span>
                      )}
                    </dt>
                    <dd className="mt-1 text-sm leading-relaxed text-gray-700">
                      {locale === "te" && term.definition_te ? term.definition_te : term.definition}
                    </dd>
                    {term.related_articles && term.related_articles[0] && (
                      <a
                        href={`/knowledge/${term.related_articles[0]}`}
                        className="mt-2 inline-block text-xs font-medium text-navy-700 hover:underline"
                      >
                        Read guide →
                      </a>
                    )}
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
