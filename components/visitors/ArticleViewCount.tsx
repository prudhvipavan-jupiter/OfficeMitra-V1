import { Eye } from "lucide-react";
import { getPageViewCount } from "@/lib/analytics/visitors";
import { formatVisitorCount } from "@/lib/analytics/format";
import { getTranslations } from "@/lib/i18n/server";

export async function ArticleViewCount({ path }: { path: string }) {
  const [{ dict: t }, views] = await Promise.all([getTranslations(), getPageViewCount(path)]);
  if (views === 0) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-navy-400">
      <Eye className="h-3.5 w-3.5" aria-hidden />
      {t.visitors.articleViews.replace("{count}", formatVisitorCount(views))}
    </span>
  );
}
