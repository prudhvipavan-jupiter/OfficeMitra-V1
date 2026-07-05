import { cmsList } from "@/lib/cms/store";
import { getCmsTotals } from "@/lib/cms/stats";
import { isPrimaryAiConfigured, primaryAiJson } from "@/lib/llm/primary-ai";
import {
  AGENT_JSON_SCHEMA_HINT,
  AGENT_SYSTEM_PROMPTS,
  AGENT_USER_TEMPLATES,
} from "./prompts";

export interface AgentRunInput {
  [key: string]: string;
}

export interface AgentRunOutput {
  markdown?: string;
  title?: string;
  slug?: string;
  summary?: string;
  telugu_summary?: string;
  category?: string;
  report?: {
    score?: number;
    grade?: string;
    issues?: string[];
    recommendations?: string[];
    blockers?: string[];
    warnings?: string[];
    safe_to_publish?: boolean;
    summary?: string;
  };
  seo?: {
    meta_title?: string;
    meta_description?: string;
    suggested_slug?: string;
    internal_links?: string[];
    cannibalization_notes?: string;
  };
  telugu?: string;
  raw?: Record<string, unknown>;
}

export interface AgentRunResult {
  success: boolean;
  usedAi: boolean;
  output: AgentRunOutput;
  error?: string;
}

const GENERIC_PHRASES = [
  "step 1: understand the requirement",
  "expert officemitra guide on",
  "covers definition, rules, documents",
];

function heuristicQualityReview(content: string): AgentRunOutput {
  const words = content.split(/\s+/).filter(Boolean).length;
  const lower = content.toLowerCase();
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (words < 400) issues.push(`Thin content: ~${words} words (target ≥400)`);
  if (!lower.includes("goir")) recommendations.push("Add GOIR verification note");
  if (!lower.includes("ddo") && !lower.includes("establishment"))
    recommendations.push("Add DDO or establishment section for ministerial audience");
  for (const phrase of GENERIC_PHRASES) {
    if (lower.includes(phrase)) issues.push(`Generic template phrase detected: "${phrase}"`);
  }
  const h2Count = (content.match(/^## /gm) ?? []).length;
  if (h2Count < 4) issues.push(`Only ${h2Count} sections — expert guides need 6+ distinct sections`);

  let score = 100 - issues.length * 15 - (words < 400 ? 20 : 0);
  score = Math.max(0, Math.min(100, score));
  const grade = score >= 75 ? "pass" : score >= 50 ? "revise" : "reject";

  return {
    report: { score, grade, issues, recommendations },
    markdown: `## Quality score: ${score}/100 (${grade})\n\n### Issues\n${issues.map((x) => `- ${x}`).join("\n") || "- None"}\n\n### Recommendations\n${recommendations.map((x) => `- ${x}`).join("\n") || "- None"}`,
    raw: { score, grade, issues, recommendations, word_count: words },
  };
}

function heuristicRealityCheck(content: string): AgentRunOutput {
  const lower = content.toLowerCase();
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (/go\.?\s*ms\.?\s*no\.?\s*\d+/i.test(content))
    warnings.push("Contains GO-style number — verify it is real on GOIR, not invented");
  if (lower.includes("legal advice") || lower.includes("guaranteed"))
    blockers.push("Remove legal advice or guarantee language");
  if (!lower.includes("verify") && !lower.includes("goir"))
    warnings.push("Missing GOIR verification reminder");
  if (lower.includes("official government website"))
    blockers.push("Do not claim OfficeMitra is an official government website");

  const safe = blockers.length === 0;
  return {
    report: { blockers, warnings, safe_to_publish: safe, summary: safe ? "No blockers found" : `${blockers.length} blocker(s)` },
    markdown: `## Reality check\n\n**Safe to publish:** ${safe ? "Yes" : "No"}\n\n### Blockers\n${blockers.map((x) => `- ${x}`).join("\n") || "- None"}\n\n### Warnings\n${warnings.map((x) => `- ${x}`).join("\n") || "- None"}`,
    raw: { blockers, warnings, safe_to_publish: safe },
  };
}

export async function runCmsQualityScan(): Promise<AgentRunOutput> {
  const totals = await getCmsTotals();
  const articles = await cmsList("article", { includeDeleted: false });
  const short = articles.filter((a) => (a.body ?? "").split(/\s+/).filter(Boolean).length < 400);
  const expert = articles.filter(
    (a) => a.data?.detail_level === "expert" || a.data?.detail_level === "comprehensive"
  );

  const lines = [
    "## CMS quality scan",
    "",
    `| Metric | Count |`,
    `|--------|-------|`,
    `| Total CMS items | ${totals.grandTotal} |`,
    `| Published | ${totals.publishedTotal} |`,
    `| Articles | ${articles.length} |`,
    `| Expert/comprehensive | ${expert.length} |`,
    `| Short articles (<400w) | ${short.length} |`,
    "",
    totals.quality
      ? `Quality stats: ${totals.quality.expert} expert, ${totals.quality.legacy} legacy, ${totals.quality.shortBody} short bodies`
      : "",
    "",
    short.length > 0 ? "### Short articles\n" + short.slice(0, 15).map((a) => `- ${a.slug}`).join("\n") : "No short articles in CMS.",
  ];

  return {
    markdown: lines.filter(Boolean).join("\n"),
    report: {
      score: articles.length ? Math.round((expert.length / articles.length) * 100) : 0,
      summary: `${articles.length} articles, ${short.length} need expansion`,
      recommendations: short.length
        ? ["Run AP Government Content Writer on short slugs", "Sync via Admin → Review"]
        : ["CMS looks healthy"],
    },
    raw: { totals, shortSlugs: short.map((a) => a.slug) },
  };
}

async function callPrimaryAi(agentId: string, input: AgentRunInput): Promise<Record<string, unknown>> {
  if (!isPrimaryAiConfigured()) throw new Error("GEMINI_API_KEY is not configured on the server");

  const system = AGENT_SYSTEM_PROMPTS[agentId];
  const userTemplate = AGENT_USER_TEMPLATES[agentId];
  if (!system || !userTemplate) throw new Error("Unknown agent");

  return primaryAiJson(system, userTemplate(input));
}

function mapAiResponse(agentId: string, data: Record<string, unknown>): AgentRunOutput {
  const out: AgentRunOutput = { raw: data };

  if (agentId === "ap-government-content-writer" || agentId === "technical-writer") {
    out.title = String(data.title ?? "");
    out.slug = String(data.slug ?? "").toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    out.summary = String(data.summary ?? "");
    out.telugu_summary = String(data.telugu_summary ?? "");
    out.category = String(data.category ?? "establishment");
    out.markdown = String(data.body_markdown ?? "");
  } else if (agentId === "content-creator") {
    out.title = String(data.headline ?? "");
    out.summary = String(data.summary ?? "");
    out.telugu_summary = String(data.telugu_summary ?? "");
    const hooks = Array.isArray(data.bullet_hooks) ? data.bullet_hooks : [];
    out.markdown = [`## ${out.title}`, "", out.summary, "", ...hooks.map((h) => `- ${h}`), "", String(data.social_blurb ?? "")].join("\n");
  } else if (agentId === "ap-content-quality-reviewer") {
    out.report = {
      score: Number(data.score ?? 0),
      grade: String(data.grade ?? ""),
      issues: Array.isArray(data.issues) ? data.issues.map(String) : [],
      recommendations: Array.isArray(data.recommendations) ? data.recommendations.map(String) : [],
    };
    out.markdown = formatReportMarkdown("Quality review", out.report);
  } else if (agentId === "reality-checker") {
    out.report = {
      blockers: Array.isArray(data.blockers) ? data.blockers.map(String) : [],
      warnings: Array.isArray(data.warnings) ? data.warnings.map(String) : [],
      safe_to_publish: Boolean(data.safe_to_publish),
      summary: String(data.summary ?? ""),
    };
    out.markdown = formatReportMarkdown("Reality check", out.report);
  } else if (agentId === "seo-specialist") {
    out.seo = {
      meta_title: String(data.meta_title ?? ""),
      meta_description: String(data.meta_description ?? ""),
      suggested_slug: String(data.suggested_slug ?? ""),
      internal_links: Array.isArray(data.internal_links) ? data.internal_links.map(String) : [],
      cannibalization_notes: String(data.cannibalization_notes ?? ""),
    };
    out.markdown = [
      "## SEO recommendations",
      "",
      `**Meta title:** ${out.seo.meta_title}`,
      `**Meta description:** ${out.seo.meta_description}`,
      `**Suggested slug:** \`${out.seo.suggested_slug}\``,
      "",
      "### Internal links",
      ...(out.seo.internal_links ?? []).map((l) => `- ${l}`),
      "",
      out.seo.cannibalization_notes,
    ].join("\n");
  } else if (agentId === "document-generator") {
    out.title = String(data.title ?? "");
    out.markdown = String(data.body_markdown ?? "");
  } else if (agentId === "language-translator") {
    out.telugu = String(data.telugu_text ?? "");
    const notes = Array.isArray(data.notes) ? data.notes.map(String) : [];
    out.markdown = `## Telugu\n\n${out.telugu}\n\n${notes.length ? "### Notes\n" + notes.map((n) => `- ${n}`).join("\n") : ""}`;
  } else if (agentId === "government-digital-presales-consultant") {
    out.markdown = String(data.improved_copy ?? "");
    const trust = Array.isArray(data.trust_improvements) ? data.trust_improvements.map(String) : [];
    out.markdown += `\n\n### Trust improvements\n${trust.map((t) => `- ${t}`).join("\n")}`;
  } else if (agentId === "cms-developer") {
    out.markdown = String(data.answer_markdown ?? "");
    const actions = Array.isArray(data.action_items) ? data.action_items.map(String) : [];
    if (actions.length) out.markdown += `\n\n### Actions\n${actions.map((a) => `- ${a}`).join("\n")}`;
  } else if (agentId === "procedure-writer" || agentId === "cfms-workflow-advisor") {
    out.title = String(data.title ?? "");
    out.slug = String(data.slug ?? "").toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    out.summary = String(data.summary ?? "");
    out.telugu_summary = String(data.telugu_summary ?? "");
    out.category = String(data.category ?? "establishment");
    out.markdown = String(data.body_markdown ?? "");
  } else if (agentId === "policy-update-writer") {
    out.title = String(data.title ?? "");
    out.slug = String(data.slug ?? "").toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    out.category = String(data.category ?? "establishment");
    out.summary = String(data.what_changed ?? data.summary ?? "");
    const parts = [
      `# ${out.title}`,
      "",
      `**What changed:** ${data.what_changed ?? ""}`,
      `**Who is affected:** ${data.who_is_affected ?? ""}`,
      `**Action required:** ${data.action_required ?? ""}`,
      "",
      String(data.body_markdown ?? ""),
    ];
    out.markdown = parts.join("\n");
  } else if (agentId === "content-expander") {
    out.title = String(data.title ?? "");
    out.slug = String(data.slug ?? "").toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    out.summary = String(data.summary ?? "");
    out.telugu_summary = String(data.telugu_summary ?? "");
    out.markdown = String(data.body_markdown ?? "");
  } else if (agentId === "topic-idea-generator") {
    const topics = Array.isArray(data.topics) ? data.topics.map(String) : [];
    out.markdown = `## 10 topic ideas\n\n${topics.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\n_Paste into NeXus → Queue topics_`;
    out.raw = { topics };
  } else if (agentId === "audit-objection-advisor") {
    out.markdown = String(data.body_markdown ?? "");
    if (!out.markdown && Array.isArray(data.objections)) {
      out.markdown = "## Audit objections\n\n" + data.objections
        .map((o: { objection?: string; response?: string }) => `- **${o.objection}** — ${o.response}`)
        .join("\n");
    }
  } else if (agentId === "faq-builder") {
    out.title = String(data.question ?? "");
    out.markdown = `**Q:** ${data.question}\n\n**A:** ${data.answer}\n\n${data.question_te ? `**Q (TE):** ${data.question_te}\n\n**A (TE):** ${data.answer_te}` : ""}`;
    out.raw = data;
  } else if (agentId === "glossary-term-writer") {
    out.title = String(data.term ?? "");
    out.markdown = `## ${data.term}\n\n${data.telugu ? `**Telugu:** ${data.telugu}\n\n` : ""}${data.definition}\n\n${data.definition_te ?? ""}`;
    out.raw = data;
  } else if (agentId === "expert-response-drafter") {
    out.markdown = String(data.response_markdown ?? "");
  } else if (agentId === "community-reply-drafter") {
    out.markdown = String(data.reply_markdown ?? "");
  } else if (agentId === "go-impact-analyst") {
    out.title = String(data.summary ?? "").slice(0, 80);
    out.markdown = String(data.body_markdown ?? "") || [
      `## ${data.summary ?? "GO impact"}`,
      "",
      `**Timeline:** ${data.timeline ?? "Verify on GOIR"}`,
      `**Risk if ignored:** ${data.risk_if_ignored ?? ""}`,
      "",
      "### Departments",
      ...(Array.isArray(data.departments_affected) ? data.departments_affected.map((d) => `- ${d}`) : []),
      "",
      "### Actions",
      ...(Array.isArray(data.action_items) ? data.action_items.map((a) => `- ${a}`) : []),
    ].join("\n");
  }

  return out;
}

function formatReportMarkdown(
  title: string,
  report: NonNullable<AgentRunOutput["report"]>
): string {
  const parts = [`## ${title}`, ""];
  if (report.score != null) parts.push(`**Score:** ${report.score}/100 (${report.grade ?? ""})`, "");
  if (report.summary) parts.push(report.summary, "");
  if (report.issues?.length) parts.push("### Issues", ...report.issues.map((i) => `- ${i}`), "");
  if (report.recommendations?.length)
    parts.push("### Recommendations", ...report.recommendations.map((r) => `- ${r}`), "");
  if (report.blockers?.length) parts.push("### Blockers", ...report.blockers.map((b) => `- ${b}`), "");
  if (report.warnings?.length) parts.push("### Warnings", ...report.warnings.map((w) => `- ${w}`), "");
  if (report.safe_to_publish != null)
    parts.push(`**Safe to publish:** ${report.safe_to_publish ? "Yes" : "No"}`);
  return parts.join("\n");
}

export async function runAgent(agentId: string, input: AgentRunInput): Promise<AgentRunResult> {
  try {
    if (agentId === "cms-developer") {
      if (input.action === "scan" || !input.question?.trim()) {
        const output = await runCmsQualityScan();
        return { success: true, usedAi: false, output };
      }
    }

    if (agentId === "ap-content-quality-reviewer" && input.content?.trim()) {
      if (!isPrimaryAiConfigured()) {
        const output = heuristicQualityReview(input.content);
        return { success: true, usedAi: false, output };
      }
    }

    if (agentId === "reality-checker" && input.content?.trim()) {
      if (!isPrimaryAiConfigured()) {
        const output = heuristicRealityCheck(input.content);
        return { success: true, usedAi: false, output };
      }
    }

    const data = await callPrimaryAi(agentId, input);
    const keys = AGENT_JSON_SCHEMA_HINT[agentId] ?? [];
    for (const k of keys) {
      if (data[k] === undefined) data[k] = k.includes("array") ? [] : "";
    }
    const output = mapAiResponse(agentId, data);
    return { success: true, usedAi: true, output };
  } catch (e) {
    return {
      success: false,
      usedAi: false,
      output: {},
      error: e instanceof Error ? e.message : "Agent run failed",
    };
  }
}

export async function loadContentBySlug(slug: string): Promise<{ title: string; body: string } | null> {
  const record = (await cmsList("article", { includeDeleted: false })).find((r) => r.slug === slug);
  if (record) {
    return {
      title: String(record.data?.title ?? slug),
      body: record.body ?? "",
    };
  }
  try {
    const { loadArticleBySlug } = await import("@/lib/cms/loaders");
    const article = await loadArticleBySlug(slug);
    if (article) return { title: article.title, body: article.content };
  } catch {
    /* ignore */
  }
  return null;
}
