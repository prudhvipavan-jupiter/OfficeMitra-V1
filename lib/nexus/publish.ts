import { revalidatePath } from "next/cache";
import { cmsUpsert } from "@/lib/cms/store";
import { CMS_TYPE_PATHS } from "@/lib/cms/types";
import { getNexusJob, saveNexusJob } from "./store";
import type { NexusJob } from "./types";

export async function publishNexusJob(jobId: string): Promise<NexusJob> {
  const job = await getNexusJob(jobId);
  if (!job) throw new Error("Job not found");
  if (!job.body || !job.title || !job.slug) {
    throw new Error("Draft is incomplete — title, slug, and body required");
  }
  if (job.status !== "DRAFT_READY" && job.status !== "APPROVED") {
    throw new Error(`Cannot publish job in status ${job.status}`);
  }

  const now = new Date().toISOString();
  const record = await cmsUpsert({
    content_type: job.content_type,
    slug: job.slug,
    status: "published",
    data: {
      title: job.title,
      slug: job.slug,
      category: job.category,
      summary: job.summary ?? "",
      telugu_summary: job.telugu_summary ?? "",
      status: "published",
      published_at: now.slice(0, 10),
      author: "OfficeMitra NeXus",
      detail_level: "expert",
      audience: "beginner-to-advanced",
      generated_by: "nexus",
      nexus_job_id: job.id,
    },
    body: job.body,
  });

  job.status = "PUBLISHED";
  job.cms_id = record.id;
  job.published_slug = job.slug;
  job.published_at = now;
  job.reviewed_at = job.reviewed_at ?? now;

  const saved = await saveNexusJob(job);

  const publicPath = CMS_TYPE_PATHS[job.content_type === "procedure" ? "procedure" : "article"];
  revalidatePath(publicPath);
  if (job.content_type === "article") revalidatePath(`/knowledge/${job.slug}`);
  if (job.content_type === "procedure") revalidatePath(`/procedures/${job.slug}`);
  revalidatePath("/");

  return saved;
}
