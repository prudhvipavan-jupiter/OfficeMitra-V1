"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/components/i18n/LanguageProvider";

interface TableOfContentsProps {
  headings: { id: string; text: string }[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const t = useTranslations();
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav
      aria-label={t.toc.label}
      className="sticky top-24 rounded-xl border border-navy-100 bg-navy-50 p-5 dark:border-navy-700 dark:bg-navy-900/80"
    >
      <p className="text-sm font-semibold text-navy-900 dark:text-navy-50">{t.toc.label}</p>
      <ul className="mt-3 space-y-1">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={cn(
                "block rounded-lg px-2 py-1.5 text-sm transition",
                activeId === h.id
                  ? "bg-navy-700 font-medium text-white dark:bg-gold-600"
                  : "text-gray-600 hover:bg-navy-100 hover:text-navy-800 dark:text-navy-300 dark:hover:bg-navy-800 dark:hover:text-navy-50"
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
