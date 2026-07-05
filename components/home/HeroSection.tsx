import { HeroSearch } from "@/components/home/HeroSearch";
import { VisitorHeroBadge } from "@/components/visitors/VisitorHeroBadge";
import { getPublicVisitorStats } from "@/lib/analytics/visitors";
import { getTranslations } from "@/lib/i18n/server";

export async function HeroSection() {
  const [stats, { dict: t }] = await Promise.all([getPublicVisitorStats(), getTranslations()]);

  return (
    <HeroSearch
      visitorBadge={
        <VisitorHeroBadge
          stats={stats}
          labels={{ heroUnique: t.visitors.heroUnique, heroToday: t.visitors.heroToday }}
        />
      }
    />
  );
}
