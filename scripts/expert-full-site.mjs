#!/usr/bin/env node
/**
 * Full-site expert content — companions for every article, plain-language layer,
 * market topic expansion, homepage featured links.
 *
 * Run: npm run content:expert-site
 * Then: npm run content:prepare-sync
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";
import { buildArticleMarkdown, buildHeroSvg } from "./content-pipeline/builder.mjs";
import {
  buildExpertProcedureBody,
  buildExpertFaqAnswer,
  buildExpertFaqAnswerTe,
  buildExpertGlossaryDefinition,
  buildExpertGlossaryDefinitionTe,
  buildExpertSummary,
  buildExpertTeluguSummary,
} from "./content-pipeline/expert-content-builder.mjs";
import { parseSlug } from "./content-pipeline/subject-definitions.mjs";
import { buildTopicBank } from "./content-pipeline/mega-topic-bank.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const today = new Date().toISOString().slice(0, 10);

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function walkArticles() {
  const dir = path.join(root, "content", "articles");
  const out = [];
  if (!fs.existsSync(dir)) return out;
  function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith(".md")) {
        const raw = fs.readFileSync(full, "utf-8");
        const { data, content } = matter(raw);
        out.push({ path: full, data, content, rel: path.relative(root, full) });
      }
    }
  }
  walk(dir);
  return out;
}

function readJson(p, fallback = []) {
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, "utf-8").replace(/^\uFEFF/, ""));
}

function writeJson(p, data) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n");
}

function plainLanguageBlock(title, summary) {
  const oneLine = (summary || title).split(/[.!]/)[0].trim();
  return `## Plain language — start here

**Who is this for?** Junior assistants, superintendents, and DDO staff in AP government offices — written so anyone can follow, step by step.

**In one sentence:** ${oneLine}.

**How to use this guide:** Skim this section → read **Overview** → use the **Checklist** before signing → copy/adapt the **Sample Draft** if your office needs a proceeding.

> Verify every GO/circular number on [GOIR](https://goir.ap.gov.in/) before acting. OfficeMitra guidance only — not an official government order.

`;
}

function enrichArticlePlainLanguage(articles) {
  let updated = 0;
  for (const art of articles) {
    if (art.content.includes("Plain language — start here")) continue;

    const block = plainLanguageBlock(String(art.data.title ?? ""), String(art.data.summary ?? ""));
    let body = art.content;

    const heroMatch = body.match(/^!\[[^\]]*\]\([^)]+\)\s*\n+/);
    if (heroMatch) {
      body = heroMatch[0] + "\n" + block + body.slice(heroMatch[0].length);
    } else {
      body = block + body;
    }

    art.data.detail_level = "expert";
    art.data.audience = "beginner-to-advanced";
    art.data.expert_assistance_cta = true;
    art.data.updated_at = today;

    const procSlug = `${art.data.slug}-procedure`;
    art.data.related_procedures = [procSlug];
    art.data.related_documents = [`doc-${art.data.slug}`];
    art.data.related_templates = [`tpl-${art.data.slug}`];

    fs.writeFileSync(art.path, matter.stringify(body, art.data));
    updated++;
  }
  return updated;
}

function fillCompanions(articles) {
  const stats = { procedures: 0, faq: 0, glossary: 0, documents: 0, templates: 0, updates: 0 };

  const faqPath = path.join(root, "content", "faq", "items.json");
  const glossPath = path.join(root, "content", "glossary", "terms.json");
  const docPath = path.join(root, "content", "documents", "metadata.json");
  const tplPath = path.join(root, "content", "templates", "metadata.json");

  const faq = readJson(faqPath);
  const glossary = readJson(glossPath);
  const documents = readJson(docPath);
  const templates = readJson(tplPath);

  const faqIds = new Set(faq.map((f) => f.id));
  const glossKeys = new Set(glossary.map((g) => g.slug_key ?? g.term));
  const docIds = new Set(documents.map((d) => d.id));
  const tplIds = new Set(templates.map((t) => t.id));

  const procDir = path.join(root, "content", "procedures");
  const updDir = path.join(root, "content", "updates", "2026");
  ensureDir(procDir);
  ensureDir(updDir);

  const existingProcSlugs = new Set();
  function walkProc(d) {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walkProc(full);
      else if (e.name.endsWith(".md")) {
        const { data } = matter(fs.readFileSync(full, "utf-8"));
        if (data.slug) existingProcSlugs.add(String(data.slug));
      }
    }
  }
  walkProc(procDir);

  for (const art of articles) {
    const slug = String(art.data.slug ?? "");
    const title = String(art.data.title ?? slug);
    const category = String(art.data.category ?? "establishment");
    const procSlug = `${slug}-procedure`;
    const topic = { title, slug, category, tags: art.data.tags };

    if (!existingProcSlugs.has(procSlug)) {
      const catDir = path.join(procDir, category);
      ensureDir(catDir);
      const procBody = buildExpertProcedureBody({ ...topic, slug: procSlug });
      const procFm = {
        title: `${title} — Office Procedure`,
        slug: procSlug,
        category,
        summary: buildExpertSummary(topic, parseSlug(slug).angle),
        telugu_summary: buildExpertTeluguSummary(topic),
        estimated_time: "2–5 working days",
        status: "published",
        detail_level: "expert",
        audience: "beginner-to-advanced",
        author: "OfficeMitra",
        related_articles: [slug],
        published_at: today,
        updated_at: today,
      };
      fs.writeFileSync(path.join(catDir, `${procSlug}.md`), matter.stringify(procBody, procFm));
      existingProcSlugs.add(procSlug);
      stats.procedures++;
    }

    const faqId = `faq-${slug}`;
    if (!faqIds.has(faqId)) {
      const question = `How do I handle ${title.split("—")[0].trim()} in my office?`;
      faq.push({
        id: faqId,
        category: category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        question,
        question_te: `${title.split("—")[0].trim()} office లో ఎలా handle చేయాలి?`,
        answer: buildExpertFaqAnswer(question, category),
        answer_te: buildExpertFaqAnswerTe(question),
        related_articles: [slug],
        related_procedures: [procSlug],
      });
      faqIds.add(faqId);
      stats.faq++;
    }

    const termLabel = title.split("—")[0].trim().slice(0, 48);
    const glossKey = slug;
    if (!glossKeys.has(glossKey)) {
      glossary.push({
        term: termLabel,
        slug_key: glossKey,
        telugu: termLabel,
        definition: buildExpertGlossaryDefinition(termLabel, category),
        definition_te: buildExpertGlossaryDefinitionTe(termLabel),
        category: category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        related_articles: [slug],
      });
      glossKeys.add(glossKey);
      stats.glossary++;
    }

    const docId = `doc-${slug}`;
    if (!docIds.has(docId)) {
      documents.push({
        id: docId,
        title: `${termLabel} — Official GO Reference`,
        type: "go",
        number: "Verify on GOIR",
        date: today,
        department: "Andhra Pradesh Government",
        category,
        year: 2026,
        subject: String(art.data.summary ?? title).slice(0, 200),
        goir_url: "https://goir.ap.gov.in/",
        related_articles: [slug],
        related_procedures: [procSlug],
        file: `/downloads/documents/${docId}.pdf`,
      });
      docIds.add(docId);
      stats.documents++;
    }

    const tplId = `tpl-${slug}`;
    if (!tplIds.has(tplId)) {
      templates.push({
        id: tplId,
        title: `${termLabel} — Proceedings Template`,
        category,
        description: `Blank proceedings / office note format for ${termLabel.toLowerCase()}. Customize with your institution details.`,
        description_te: `${termLabel} blank format.`,
        usage_notes: "Fill all blanks; cite appointment order and rule numbers; verify GO on GOIR before issue.",
        related_articles: [slug],
        related_procedures: [procSlug],
        file_pdf: `/downloads/templates/${tplId}.pdf`,
      });
      tplIds.add(tplId);
      stats.templates++;
    }

    const updSlug = `update-${slug}`;
    const updFile = path.join(updDir, `${updSlug}.md`);
    if (!fs.existsSync(updFile)) {
      const updFm = {
        title: `${termLabel} — Expert guide published`,
        slug: updSlug,
        date: today,
        category,
        what_changed: `OfficeMitra published an expert, plain-language guide on ${termLabel.toLowerCase()} for AP ministerial staff.`,
        who_is_affected: "Establishment, finance, and DDO sections in AP government institutions.",
        action_required: "Read the full knowledge article, verify GO on GOIR, and update office checklists if needed.",
        status: "published",
        detail_level: "expert",
        audience: "beginner-to-advanced",
        related_knowledge_slug: slug,
      };
      const updBody = `## Summary\n\nNew expert content is available on **${termLabel}**. See the [full guide](/knowledge/${slug}) and [step-by-step procedure](/procedures/${procSlug}).\n\n## Plain language\n\nThis update tells staff that a clear, beginner-friendly guide now exists — not a new government order. Always verify official GOs separately.\n`;
      fs.writeFileSync(updFile, matter.stringify(updBody, updFm));
      stats.updates++;
    }
  }

  writeJson(faqPath, faq);
  writeJson(glossPath, glossary);
  writeJson(docPath, documents);
  writeJson(tplPath, templates);

  return stats;
}

function expandMarketArticles(existingSlugs) {
  const bank = buildTopicBank(180);
  let added = 0;

  for (const topic of bank) {
    if (existingSlugs.has(topic.slug)) continue;
    if (added >= 40) break;

    const topicForBuilder = {
      ...topic,
      title: topic.title,
      priority: 2,
      primaryRules: ["Verify applicable AP service rules on GOIR"],
      procedureSteps: [
        "Collect employee papers and previous orders",
        "Verify rule position on GOIR",
        "Draft proceedings in standard format",
        "Route for competent authority approval",
        "Make Service Register entry",
        "Inform DDO for pay bill impact if any",
      ],
      checklist: [
        "Appointment / transfer order on file",
        "Rule citation in draft proceeding",
        "Competent authority identified",
        "SR entry planned same day as order",
      ],
      example: `Example: Establishment staff at a district hospital follow these steps with Superintendent approval and same-day Service Register entry.`,
      sampleDraft: `Sub: ${topic.title} — Orders — Issued.\n\nAfter verification under applicable rules, orders are issued.\n\nSd/- Competent Authority`,
      srEntry: "Order issued vide Proc.No. ___ dated ___. Entry made in Service Register.",
      auditObjections: ["Missing rule citation", "SR entry omitted", "Wrong competent authority"],
      goReferences: "Search GOIR for latest orders on this subject.",
      scrapedSources: ["https://goir.ap.gov.in/"],
      tags: topic.tags ?? [topic.category],
      telugu_summary: topic.telugu_summary ?? `${topic.title} — AP ministerial staff కోసం మార్గదర్శి.`,
      summary: topic.summary,
    };
    const markdown = buildArticleMarkdown(topicForBuilder);
    writeArticle(topic.category, topic.slug, markdown, topicForBuilder);
    existingSlugs.add(topic.slug);
    added++;
  }
  return added;
}

function writeArticle(category, slug, markdown, topic) {
  const articlePath = path.join(root, "content", "articles", category, `${slug}.md`);
  ensureDir(path.dirname(articlePath));
  fs.writeFileSync(articlePath, markdown);

  const svg = buildHeroSvg({ ...topic, slug, category, priority: topic.priority ?? 2 });
  ensureDir(path.join(root, "public", "images", "articles"));
  fs.writeFileSync(path.join(root, "public", "images", "articles", `${slug}.svg`), svg);
}

function updateHomepageConstants(articles) {
  const priority = [
    "probation-declaration",
    "earned-leave-rules",
    "gpf-advance",
    "cfms-bill-processing",
    "increment-sanction",
    "pay-fixation-fr-22b",
    "apgli-loan-application",
    "retirement-processing",
  ];

  const bySlug = new Map(articles.map((a) => [String(a.data.slug), a]));
  const popularProcedures = [];
  for (const slug of priority) {
    const art = bySlug.get(slug);
    if (!art) continue;
    popularProcedures.push({
      title: String(art.data.title).split("—")[0].trim(),
      slug: `${slug}-procedure`,
      category: art.data.category,
      description: String(art.data.summary ?? "").slice(0, 120),
    });
  }

  const popularSearches = [
    "probation declaration",
    "earned leave rules",
    "GPF advance",
    "CFMS pay bill",
    "increment sanction",
    "APGLI loan",
    "transfer procedure",
    "retirement processing",
    "charge memo",
    "service register",
  ];

  const constantsPath = path.join(root, "lib", "constants.ts");
  const content = `export const popularSearches: string[] = ${JSON.stringify(popularSearches, null, 2)};

export const popularProcedures: {
  title: string;
  slug: string;
  category: import("./categories").ArticleCategory;
  description: string;
}[] = ${JSON.stringify(popularProcedures, null, 2)};
`;
  fs.writeFileSync(constantsPath, content);
  return { popularProcedures: popularProcedures.length, popularSearches: popularSearches.length };
}

function main() {
  console.log("OfficeMitra — expert full-site content build\n");

  let articles = walkArticles();
  const existingSlugs = new Set(articles.map((a) => String(a.data.slug)));

  const expanded = expandMarketArticles(existingSlugs);
  if (expanded > 0) {
    console.log(`Added ${expanded} market-topic articles`);
    articles = walkArticles();
  }

  const enriched = enrichArticlePlainLanguage(articles);
  const companions = fillCompanions(articles);
  const homepage = updateHomepageConstants(articles);

  console.log({
    articles: articles.length,
    enriched,
    expanded,
    ...companions,
    homepage,
  });
  console.log("\nNext: npm run content:prepare-sync");
}

main();
