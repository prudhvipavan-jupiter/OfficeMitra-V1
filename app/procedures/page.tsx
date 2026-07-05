import { Container, SectionHeading } from "@/components/ui/Container";
import { CategoryPills } from "@/components/ui/CategoryPills";
import { ContentListing } from "@/components/content/ContentListing";
import { loadProcedures } from "@/lib/cms/loaders";
import type { ArticleCategory } from "@/lib/content";
import { getTranslations } from "@/lib/i18n/server";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Procedure Guides",
  description: "Step-by-step workflows for common administrative processes.",
  path: "/procedures",
});

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ProceduresPage({ searchParams }: PageProps) {
  const { category } = await searchParams;
  const { dict: t } = await getTranslations();
  let procedures = await loadProcedures();

  if (category) {
    procedures = procedures.filter((p) => p.category === category);
  }

  const categoryKeys = Object.keys(t.categories) as ArticleCategory[];
  const categories = categoryKeys.map((key) => ({
    key,
    label: t.categories[key],
  }));

  const items = procedures.map((proc) => ({
    slug: proc.slug,
    href: `/procedures/${proc.slug}`,
    title: proc.title,
    summary: proc.summary,
    categoryLabel: t.categories[proc.category as ArticleCategory],
    teluguSummary: proc.telugu_summary,
    estimatedTime: proc.estimated_time,
    badges:
      proc.detail_level === "comprehensive"
        ? [t.knowledge.comprehensiveBadge]
        : undefined,
  }));

  return (
    <Container className="py-10">
      <SectionHeading title={t.procedures.title} subtitle={t.procedures.subtitle} />

      <CategoryPills
        basePath="/procedures"
        activeCategory={category}
        allLabel={t.common.all}
        categories={categories}
      />

      <ContentListing
        items={items}
        searchPlaceholder={t.procedures.searchPlaceholder}
        emptyMessage={t.procedures.empty}
        ctaLabel={t.procedures.readGuide}
      />
    </Container>
  );
}
