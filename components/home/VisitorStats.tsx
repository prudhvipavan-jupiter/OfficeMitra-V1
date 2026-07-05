import { Eye, TrendingUp, Users } from "lucide-react";
import { getPublicVisitorStats } from "@/lib/analytics/visitors";
import { formatVisitorCount } from "@/lib/analytics/format";
import { getTranslations } from "@/lib/i18n/server";

export async function VisitorStats() {
  const [{ dict: t }, stats] = await Promise.all([getTranslations(), getPublicVisitorStats()]);

  const items = [
    {
      icon: Eye,
      label: t.visitors.totalViews,
      value: formatVisitorCount(stats.totalViews),
    },
    {
      icon: Users,
      label: t.visitors.uniqueVisitors,
      value: formatVisitorCount(stats.uniqueAllTime),
    },
    {
      icon: TrendingUp,
      label: t.visitors.todayVisitors,
      value: formatVisitorCount(stats.uniqueToday),
      sub:
        stats.todayViews > 0
          ? `${formatVisitorCount(stats.todayViews)} ${t.visitors.pageViewsToday}`
          : undefined,
    },
  ];

  return (
    <div className="mt-8 border-t border-navy-100 pt-8">
      <p className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-navy-600 lg:text-left">
        {t.visitors.sectionTitle}
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map(({ icon: Icon, label, value, sub }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-xl border border-navy-100 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-50">
              <Icon className="h-5 w-5 text-navy-700" aria-hidden />
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums text-navy-900">{value}</p>
              <p className="text-xs text-gray-600">{label}</p>
              {sub && <p className="text-[11px] text-gray-500">{sub}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
