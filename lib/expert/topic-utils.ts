import type { ServiceType } from "@/lib/expert-assistance";
import type { ArticleCategory } from "@/lib/categories";

export interface ExpertTopic {
  base: string;
  title: string;
  category: ArticleCategory | string;
  flagship_slug: string;
  procedure_slug: string;
  document_id: string;
  source?: string;
}

/** Map category to default expert service type for pre-fill */
export function defaultServiceTypeForCategory(category: string): ServiceType {
  switch (category) {
    case "finance":
    case "treasury":
    case "apgli":
    case "gpf":
      return "finance_guidance";
    case "conduct":
      return "rule_clarification";
    case "establishment":
    case "leave":
    case "service-rules":
      return "establishment_guidance";
    case "health":
      return "document_review";
    default:
      return "establishment_guidance";
  }
}

export function groupExpertTopicsByCategory(
  topics: ExpertTopic[]
): { category: string; topics: ExpertTopic[] }[] {
  const map = new Map<string, ExpertTopic[]>();
  for (const t of topics) {
    const list = map.get(t.category) ?? [];
    list.push(t);
    map.set(t.category, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, items]) => ({ category, topics: items }));
}
