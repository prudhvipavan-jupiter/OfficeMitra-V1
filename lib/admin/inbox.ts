import { cmsList } from "@/lib/cms/store";
import { CMS_TYPE_LABELS, type CmsContentType } from "@/lib/cms/types";
import { getIntelUpdates, isIntelligenceEnabled } from "@/lib/intelligence/store";
import { listNexusJobs } from "@/lib/nexus/store";

export type InboxSource = "cms" | "nexus" | "intel";

export interface InboxItem {
  id: string;
  source: InboxSource;
  title: string;
  subtitle?: string;
  status: string;
  updatedAt: string;
  href: string;
  contentType?: string;
}

export interface InboxSummary {
  total: number;
  cms: number;
  nexus: number;
  intel: number;
}

const CMS_TYPES: CmsContentType[] = [
  "article",
  "procedure",
  "update",
  "document",
  "template",
  "faq",
  "glossary",
];

function cmsTitle(data: Record<string, unknown>, slug: string | null): string {
  return String(data.title ?? data.question ?? data.term ?? data.number ?? slug ?? "Untitled");
}

export async function getDraftInbox(): Promise<{ items: InboxItem[]; summary: InboxSummary }> {
  const items: InboxItem[] = [];

  for (const type of CMS_TYPES) {
    const records = await cmsList(type, { includeDeleted: false });
    for (const r of records.filter((x) => x.status === "draft")) {
      items.push({
        id: `cms-${r.id}`,
        source: "cms",
        title: cmsTitle(r.data, r.slug),
        subtitle: CMS_TYPE_LABELS[type],
        status: "draft",
        updatedAt: r.updated_at,
        href: `/admin/content/${type}`,
        contentType: type,
      });
    }
  }

  try {
    const nexusJobs = await listNexusJobs("DRAFT_READY");
    for (const j of nexusJobs) {
      items.push({
        id: `nexus-${j.id}`,
        source: "nexus",
        title: j.title ?? j.topic,
        subtitle: `${j.content_type} · ${j.category}`,
        status: j.status,
        updatedAt: j.updated_at,
        href: "/admin/nexus",
      });
    }
    const approved = await listNexusJobs("APPROVED");
    for (const j of approved) {
      items.push({
        id: `nexus-${j.id}`,
        source: "nexus",
        title: j.title ?? j.topic,
        subtitle: `${j.content_type} · approved`,
        status: j.status,
        updatedAt: j.updated_at,
        href: "/admin/nexus",
      });
    }
  } catch {
    /* nexus store fallback — skip */
  }

  if (isIntelligenceEnabled()) {
    try {
      const intelNew = await getIntelUpdates("NEW");
      const intelDrafts = await getIntelUpdates("DRAFT_GENERATED");
      for (const u of [...intelNew, ...intelDrafts]) {
        items.push({
          id: `intel-${u.id}`,
          source: "intel",
          title: u.ai_title ?? u.title,
          subtitle: u.source?.name ?? "Policy update",
          status: u.status,
          updatedAt: u.updated_at,
          href: "/admin/intelligence",
        });
      }
    } catch {
      /* intel unavailable */
    }
  }

  items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const summary: InboxSummary = {
    total: items.length,
    cms: items.filter((i) => i.source === "cms").length,
    nexus: items.filter((i) => i.source === "nexus").length,
    intel: items.filter((i) => i.source === "intel").length,
  };

  return { items, summary };
}

export async function getDraftInboxSummary(): Promise<InboxSummary> {
  const { summary } = await getDraftInbox();
  return summary;
}
