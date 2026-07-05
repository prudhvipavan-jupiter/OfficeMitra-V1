import { runAgent } from "@/lib/agents/runner";
import type { ArticleCategory } from "@/lib/categories";
import { formatResearchForPrompt, researchTopic } from "./research";
import { getNexusJob, getNextQueuedJob, saveNexusJob } from "./store";
import type { NexusJob } from "./types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function heuristicDraft(topic: string, researchContext: string, category: ArticleCategory) {
  const slug = slugify(topic);
  const title = topic.replace(/\b\w/g, (c) => c.toUpperCase());
  const summary = `Expert OfficeMitra guide on ${topic.toLowerCase()} for AP ministerial staff and DDO sections. Covers rules, documents, workflow, and audit-safe practice. Verify latest GO on GOIR before acting.`;

  const body = [
    `# ${title}`,
    "",
    "## Overview",
    "",
    `This guide explains **${topic}** for Andhra Pradesh government employees — from basic understanding to DDO-level processing.`,
    "",
    "## Legal and rule basis",
    "",
    "Consult the latest Government Orders on [GOIR](https://goir.ap.gov.in/) and applicable AP service rules. Do not rely on memory alone for dates, amounts, or eligibility.",
    "",
    "## Who is responsible",
    "",
    "| Role | Responsibility |",
    "|------|----------------|",
    "| Employee | Submit complete papers on time |",
    "| DDO / dealing assistant | Verify records, route file |",
    "| Establishment / treasury | Sanction and update registers |",
    "",
    "## Documents usually required",
    "",
    "- Service register extract",
    "- Previous orders / sanctions",
    "- NOC or clearance certificates where applicable",
    "- CFMS / treasury references if pay-related",
    "",
    "## Step-by-step procedure",
    "",
    "1. Collect documents and verify entries in service register.",
    "2. Prepare note for DDO with rule reference.",
    "3. Route through establishment section.",
    "4. Obtain sanction order and update registers.",
    "5. File copy in personal file and office copy.",
    "",
    "## Common mistakes",
    "",
    "- Missing register entries before processing",
    "- Wrong pay / leave balance not checked",
    "- Delay beyond prescribed joining / submission time",
    "",
    "## Audit and vigilance points",
    "",
    "- Maintain noting chain in file",
    "- Cross-check with LPC / NDC where transfer or retirement involved",
    "",
    "## Research context used",
    "",
    researchContext.slice(0, 2000),
    "",
    "---",
    "",
    "*Verify on GOIR before acting. OfficeMitra is an independent guidance platform, not an official government website.*",
  ].join("\n");

  return {
    title,
    slug,
    summary,
    telugu_summary: `${topic} — AP ప్రభుత్వ ఉద్యోగులకు OfficeMitra వివరణాత్మక మార్గదర్శి. GOIR లో తాజా GO ను ధృవీకరించండి.`,
    body,
    usedAi: false,
    quality_score: 55,
    quality_notes: "Heuristic draft — enable GEMINI_API_KEY for richer expert content.",
  };
}

export async function processNexusJob(jobId?: string): Promise<NexusJob | null> {
  const job = jobId ? await getNexusJob(jobId) : await getNextQueuedJob();
  if (!job || job.status !== "QUEUED") return null;

  job.status = "RESEARCHING";
  job.error_message = null;
  await saveNexusJob(job);

  try {
    const { sources, notes } = await researchTopic(job.topic);
    job.research_sources = sources;
    job.research_notes = notes;

    const researchContext = formatResearchForPrompt(sources, notes);
    const writerAgentId =
      job.content_type === "procedure" ? "procedure-writer" : "ap-government-content-writer";
    const agentResult = await runAgent(writerAgentId, {
      topic: job.topic,
      title: job.topic,
      angle: "office-guide",
      category: job.category,
      notes: researchContext,
      research_context: researchContext,
    });

    if (agentResult.success && agentResult.output.markdown) {
      job.title = agentResult.output.title ?? job.topic;
      job.slug = agentResult.output.slug ?? slugify(job.topic);
      job.summary = agentResult.output.summary ?? "";
      job.telugu_summary = agentResult.output.telugu_summary ?? "";
      job.body = agentResult.output.markdown;
      job.used_ai = agentResult.usedAi;

      const quality = await runAgent("ap-content-quality-reviewer", {
        content: job.body,
      });
      if (quality.success && quality.output.report) {
        job.quality_score = quality.output.report.score ?? null;
        job.quality_notes = [
          ...(quality.output.report.issues ?? []),
          ...(quality.output.report.recommendations ?? []),
        ].join("; ");
      }
    } else {
      const fallback = heuristicDraft(job.topic, researchContext, job.category);
      job.title = fallback.title;
      job.slug = fallback.slug;
      job.summary = fallback.summary;
      job.telugu_summary = fallback.telugu_summary;
      job.body = fallback.body;
      job.used_ai = false;
      job.quality_score = fallback.quality_score;
      job.quality_notes = agentResult.error
        ? `${fallback.quality_notes} AI error: ${agentResult.error}`
        : fallback.quality_notes;
    }

    job.status = "DRAFT_READY";
    job.error_message = null;
  } catch (e) {
    job.status = "FAILED";
    job.error_message = e instanceof Error ? e.message : "Processing failed";
  }

  return saveNexusJob(job);
}

export async function processAllQueued(max = 10): Promise<NexusJob[]> {
  const results: NexusJob[] = [];
  for (let i = 0; i < max; i++) {
    const next = await getNextQueuedJob();
    if (!next) break;
    const done = await processNexusJob(next.id);
    if (done) results.push(done);
    if (done?.status === "FAILED") continue;
  }
  return results;
}
