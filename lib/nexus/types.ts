import type { ArticleCategory } from "@/lib/categories";

export type NexusJobStatus =
  | "QUEUED"
  | "RESEARCHING"
  | "DRAFT_READY"
  | "APPROVED"
  | "PUBLISHED"
  | "REJECTED"
  | "FAILED";

export type NexusContentType = "article" | "procedure";

export interface NexusResearchSource {
  url: string;
  title: string;
  snippet: string;
  ok: boolean;
}

export interface NexusJob {
  id: string;
  batch_id: string;
  topic: string;
  category: ArticleCategory;
  content_type: NexusContentType;
  status: NexusJobStatus;
  research_sources: NexusResearchSource[];
  research_notes: string | null;
  title: string | null;
  slug: string | null;
  summary: string | null;
  telugu_summary: string | null;
  body: string | null;
  quality_score: number | null;
  quality_notes: string | null;
  admin_notes: string | null;
  error_message: string | null;
  cms_id: string | null;
  published_slug: string | null;
  used_ai: boolean;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  published_at: string | null;
}

export interface NexusDashboardStats {
  queued: number;
  researching: number;
  draft_ready: number;
  approved: number;
  published: number;
  rejected: number;
  failed: number;
  total: number;
}

export type NexusTab = "DRAFT_READY" | "QUEUED" | "APPROVED" | "PUBLISHED" | "REJECTED" | "FAILED";

export const NEXUS_STATUS_TABS: { id: NexusTab; label: string }[] = [
  { id: "DRAFT_READY", label: "Ready for review" },
  { id: "QUEUED", label: "Queued" },
  { id: "APPROVED", label: "Approved" },
  { id: "PUBLISHED", label: "Published" },
  { id: "REJECTED", label: "Rejected" },
  { id: "FAILED", label: "Failed" },
];

export const NEXUS_MAX_BATCH = 10;
