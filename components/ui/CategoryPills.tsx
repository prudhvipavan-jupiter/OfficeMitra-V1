import Link from "next/link";
import { cn } from "@/lib/utils";

interface CategoryPillsProps {
  basePath: string;
  activeCategory?: string;
  allLabel: string;
  categories: { key: string; label: string }[];
}

export function CategoryPills({
  basePath,
  activeCategory,
  allLabel,
  categories,
}: CategoryPillsProps) {
  const pillClass = (active: boolean) =>
    cn(
      "rounded-full px-4 py-1.5 text-sm font-medium transition",
      active
        ? "bg-navy-700 text-white dark:bg-gold-600 dark:text-white"
        : "bg-navy-100 text-navy-700 hover:bg-navy-200 dark:bg-navy-800 dark:text-navy-100 dark:hover:bg-navy-700"
    );

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={basePath} className={pillClass(!activeCategory)}>
        {allLabel}
      </Link>
      {categories.map(({ key, label }) => (
        <Link
          key={key}
          href={`${basePath}?category=${key}`}
          className={pillClass(activeCategory === key)}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
