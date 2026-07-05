import { Container, SectionHeading } from "@/components/ui/Container";
import { CategoryPills } from "@/components/ui/CategoryPills";
import { ContentListing } from "@/components/content/ContentListing";
import { loadArticles } from "@/lib/cms/loaders";
import type { ArticleCategory } from "@/lib/content";
import { getTranslations } from "@/lib/i18n/server";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Knowledge Hub",
  description: "Structured articles on rules, procedures, and office practice for AP government employees.",
  path: "/knowledge",
});

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function KnowledgePage({ searchParams }: PageProps) {
  const { category } = await searchParams;
  const { dict: t } = await getTranslations();
  let articles = await loadArticles();

  if (category) {
    articles = articles.filter((a) => a.category === category);
  }

  const categoryKeys = Object.keys(t.categories) as ArticleCategory[];
  const categories = categoryKeys.map((key) => ({
    key,
    label: t.categories[key],
  }));

  const items = articles.map((article) => ({
    slug: article.slug,
    href: `/knowledge/${article.slug}`,
    title: article.title,
    summary: article.summary,
    categoryLabel: t.categories[article.category as ArticleCategory],
    teluguSummary: article.telugu_summary,
    publishedAt: article.published_at,
    badges:
      article.detail_level === "comprehensive"
        ? [t.knowledge.comprehensiveBadge]
        : undefined,
  }));

  return (
    <Container className="py-10">
      <SectionHeading title={t.knowledge.title} subtitle={t.knowledge.subtitle} />

      <CategoryPills
        basePath="/knowledge"
        activeCategory={category}
        allLabel={t.common.all}
        categories={categories}
      />

      <ContentListing
        items={items}
        searchPlaceholder={t.knowledge.searchPlaceholder}
        emptyMessage={t.knowledge.empty}
        ctaLabel={t.knowledge.readGuide}
      />
    </Container>
  );
}
