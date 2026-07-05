"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ContentCard } from "@/components/ui/ContentCard";
import { useTranslations } from "@/components/i18n/LanguageProvider";

export interface ContentListItem {
  slug: string;
  href: string;
  title: string;
  summary: string;
  categoryLabel: string;
  teluguSummary?: string;
  publishedAt?: string;
  estimatedTime?: string;
  badges?: string[];
}

interface ContentListingProps {
  items: ContentListItem[];
  searchPlaceholder: string;
  emptyMessage: string;
  ctaLabel: string;
}

export function ContentListing({
  items,
  searchPlaceholder,
  emptyMessage,
  ctaLabel,
}: ContentListingProps) {
  const t = useTranslations();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q) ||
        item.teluguSummary?.toLowerCase().includes(q)
    );
  }, [items, query]);

  return (
    <div className="mt-8">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          className="input-field pl-10"
          aria-label={searchPlaceholder}
        />
      </div>

      <p className="mt-3 text-sm text-gray-500 dark:text-navy-300">
        {t.common.showingCount.replace("{count}", String(filtered.length)).replace("{total}", String(items.length))}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-navy-200 bg-navy-50/50 px-6 py-10 text-center text-gray-500 dark:border-navy-700 dark:bg-navy-900/50 dark:text-navy-300">
          {query ? t.common.noResults : emptyMessage}
        </p>
      ) : (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <li key={item.slug}>
              <ContentCard {...item} ctaLabel={ctaLabel} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
