import { Eye, Users } from "lucide-react";
import type { PublicVisitorStats } from "@/lib/analytics/visitors";
import { formatVisitorCount } from "@/lib/analytics/format";

interface VisitorHeroBadgeProps {
  stats: PublicVisitorStats;
  labels: {
    heroUnique: string;
    heroToday: string;
  };
}

export function VisitorHeroBadge({ stats, labels }: VisitorHeroBadgeProps) {
  const unique = formatVisitorCount(stats.uniqueAllTime);
  const today = formatVisitorCount(stats.uniqueToday);

  return (
    <div className="mx-auto mt-5 flex flex-wrap items-center justify-center gap-3">
      <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm text-navy-100 backdrop-blur-sm">
        <Users className="h-4 w-4 text-gold-400" aria-hidden />
        {labels.heroUnique.replace("{count}", unique)}
      </span>
      {stats.uniqueToday > 0 && (
        <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-600/15 px-4 py-1.5 text-sm text-gold-100 backdrop-blur-sm">
          <Eye className="h-4 w-4 text-gold-400" aria-hidden />
          {labels.heroToday.replace("{count}", today)}
        </span>
      )}
    </div>
  );
}
