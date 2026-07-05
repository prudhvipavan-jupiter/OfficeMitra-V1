"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/components/i18n/LanguageProvider";

interface MobileTableOfContentsProps {
  headings: { id: string; text: string }[];
}

export function MobileTableOfContents({ headings }: MobileTableOfContentsProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
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
      { rootMargin: "-15% 0px -70% 0px", threshold: [0, 0.25, 0.5] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label={t.toc.label} className="mb-6 lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-xl border border-navy-100 bg-navy-50 px-4 py-3 text-left text-sm font-semibold text-navy-900 dark:border-navy-700 dark:bg-navy-900/80 dark:text-navy-50"
        aria-expanded={open}
      >
        {t.toc.label}
        <ChevronDown
          className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open && (
        <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto rounded-xl border border-navy-100 bg-white p-3 shadow-sm dark:border-navy-700 dark:bg-navy-800">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                onClick={() => setOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm transition",
                  activeId === h.id
                    ? "bg-navy-700 font-medium text-white dark:bg-gold-600"
                    : "text-gray-600 hover:bg-navy-50 hover:text-navy-800 dark:text-navy-200 dark:hover:bg-navy-700"
                )}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
