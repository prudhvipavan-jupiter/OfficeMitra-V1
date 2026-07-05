"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BookOpen,
  ClipboardList,
  Download,
  FileText,
  MessageCircle,
  Search,
} from "lucide-react";
import { useTranslations } from "@/components/i18n/LanguageProvider";
import type { ExpertTopic } from "@/lib/expert/topic-utils";
import { defaultServiceTypeForCategory } from "@/lib/expert/topic-utils";
import type { ArticleCategory } from "@/lib/categories";

export function ExpertTopicsBrowser({ topics }: { topics: ExpertTopic[] }) {
  const t = useTranslations();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  const categories = useMemo(
    () => [...new Set(topics.map((x) => x.category))].sort(),
    [topics]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return topics.filter((topic) => {
      if (category && topic.category !== category) return false;
      if (!q) return true;
      return (
        topic.title.toLowerCase().includes(q) ||
        topic.base.includes(q) ||
        topic.category.includes(q)
      );
    });
  }, [topics, query, category]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.expertTopics.searchPlaceholder}
            className="input-field w-full pl-10"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input-field sm:max-w-[220px]"
        >
          <option value="">{t.expertTopics.allCategories}</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {t.categories[c as ArticleCategory] ?? c}
            </option>
          ))}
        </select>
      </div>

      <p className="mb-4 text-sm text-gray-600">
        {t.expertTopics.showing.replace("{count}", String(filtered.length)).replace("{total}", String(topics.length))}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((topic) => {
          const service = defaultServiceTypeForCategory(topic.category);
          const expertHref = `/expert-assistance?article=${encodeURIComponent(topic.flagship_slug)}&service=${service}#request`;
          return (
            <article
              key={topic.base}
              className="flex flex-col rounded-xl border border-navy-100 bg-white p-5 shadow-sm transition hover:border-gold-300 hover:shadow-md"
            >
              <span className="text-[10px] font-bold uppercase tracking-wide text-gold-700">
                {t.categories[topic.category as ArticleCategory] ?? topic.category}
              </span>
              <h2 className="mt-1 text-base font-semibold leading-snug text-navy-900">
                {topic.title}
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/knowledge/${topic.flagship_slug}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-navy-50 px-2.5 py-1.5 text-xs font-medium text-navy-800 hover:bg-navy-100"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  {t.expertTopics.guide}
                </Link>
                <Link
                  href={`/procedures/${topic.procedure_slug}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-navy-50 px-2.5 py-1.5 text-xs font-medium text-navy-800 hover:bg-navy-100"
                >
                  <ClipboardList className="h-3.5 w-3.5" />
                  {t.expertTopics.steps}
                </Link>
                <Link
                  href={`/documents?id=${topic.document_id}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-navy-50 px-2.5 py-1.5 text-xs font-medium text-navy-800 hover:bg-navy-100"
                >
                  <FileText className="h-3.5 w-3.5" />
                  {t.expertTopics.goPack}
                </Link>
              </div>
              <Link
                href={expertHref}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-gold-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-gold-500"
              >
                <MessageCircle className="h-4 w-4" />
                {t.expertTopics.requestHelp}
              </Link>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-gray-500">{t.common.noResults}</p>
      )}
    </div>
  );
}
