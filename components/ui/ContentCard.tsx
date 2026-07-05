import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export interface ContentCardProps {
  href: string;
  title: string;
  summary: string;
  categoryLabel: string;
  ctaLabel: string;
  teluguSummary?: string;
  publishedAt?: string;
  estimatedTime?: string;
  badges?: string[];
}

export function ContentCard({
  href,
  title,
  summary,
  categoryLabel,
  ctaLabel,
  teluguSummary,
  publishedAt,
  estimatedTime,
  badges,
}: ContentCardProps) {
  return (
    <Link
      href={href}
      className="card-hover group flex h-full flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800/80"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex w-fit rounded-full bg-gold-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-gold-700 dark:bg-gold-600/20 dark:text-gold-500">
          {categoryLabel}
        </span>
        {badges?.map((badge) => (
          <span
            key={badge}
            className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
          >
            {badge}
          </span>
        ))}
      </div>
      <h3 className="mt-3 text-lg font-bold leading-snug text-navy-900 group-hover:text-navy-700 dark:text-navy-50 dark:group-hover:text-gold-500">
        {title}
      </h3>
      {teluguSummary && (
        <p className="mt-1 line-clamp-2 text-sm text-navy-700 dark:text-navy-200">{teluguSummary}</p>
      )}
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600 dark:text-navy-200">
        {summary}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-navy-300">
        {publishedAt && (
          <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
        )}
        {estimatedTime && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            {estimatedTime}
          </span>
        )}
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy-700 dark:text-gold-500">
        {ctaLabel}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}
