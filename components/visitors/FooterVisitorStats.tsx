import { Eye, Users } from "lucide-react";
import { getPublicVisitorStats } from "@/lib/analytics/visitors";
import { formatVisitorCount } from "@/lib/analytics/format";
import { getTranslations } from "@/lib/i18n/server";

export async function FooterVisitorStats() {
  const [{ dict: t }, stats] = await Promise.all([getTranslations(), getPublicVisitorStats()]);

  const views = formatVisitorCount(stats.totalViews);
  const unique = formatVisitorCount(stats.uniqueAllTime);

  return (
    <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-navy-300">
      <span className="inline-flex items-center gap-1.5">
        <Eye className="h-3.5 w-3.5 text-gold-500" aria-hidden />
        {t.visitors.footerViews.replace("{count}", views)}
      </span>
      <span className="hidden h-3 w-px bg-navy-700 sm:inline" aria-hidden />
      <span className="inline-flex items-center gap-1.5">
        <Users className="h-3.5 w-3.5 text-gold-500" aria-hidden />
        {t.visitors.footerUnique.replace("{count}", unique)}
      </span>
      {stats.uniqueToday > 0 && (
        <>
          <span className="hidden h-3 w-px bg-navy-700 sm:inline" aria-hidden />
          <span>{t.visitors.footerToday.replace("{count}", formatVisitorCount(stats.uniqueToday))}</span>
        </>
      )}
    </div>
  );
}
