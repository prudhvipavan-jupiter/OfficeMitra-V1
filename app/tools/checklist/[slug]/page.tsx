import { notFound } from "next/navigation";
import { GenericChecklistPage } from "@/components/tools/GenericChecklistPage";
import { checklistTools, getChecklistBySlug } from "@/lib/tools/checklists";
import { createPageMetadata } from "@/lib/metadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return checklistTools.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const tool = getChecklistBySlug(slug);
  if (!tool) return {};
  return createPageMetadata({
    title: tool.title,
    description: tool.subtitle,
    path: `/tools/checklist/${slug}`,
  });
}

export default async function ChecklistToolRoute({ params }: PageProps) {
  const { slug } = await params;
  const tool = getChecklistBySlug(slug);
  if (!tool) notFound();
  return <GenericChecklistPage tool={tool} />;
}
