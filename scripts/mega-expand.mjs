#!/usr/bin/env node
/**
 * Generate 120+ unique items per CMS section, dedupe-aware.
 * Run: node scripts/mega-expand.mjs
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";
import { buildTopicBank } from "./content-pipeline/mega-topic-bank.mjs";
import {
  buildDetailedArticleBody,
  buildDetailedProcedureBody,
  buildDetailedSummary,
  buildDetailedTeluguSummary,
  buildDetailedFaqAnswer,
  buildDetailedFaqAnswerTe,
  buildDetailedGlossaryDefinition,
  buildDetailedGlossaryDefinitionTe,
} from "./content-pipeline/detailed-builder.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const TARGET = 120;

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function existingSlugs(dir, slugField = "slug") {
  const slugs = new Set();
  if (!fs.existsSync(dir)) return slugs;
  function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) walk(f);
      else if (e.name.endsWith(".md")) {
        const { data } = matter(fs.readFileSync(f, "utf-8"));
        if (data[slugField]) slugs.add(String(data[slugField]));
      }
    }
  }
  walk(dir);
  return slugs;
}

function articleBody(topic) {
  return buildDetailedArticleBody(topic);
}

function writeArticles(topics, existing) {
  const dir = path.join(root, "content", "articles");
  let added = 0;
  for (const topic of topics) {
    if (existing.has(topic.slug)) continue;
    const catDir = path.join(dir, topic.category);
    ensureDir(catDir);
    const fm = {
      title: topic.title,
      slug: topic.slug,
      category: topic.category,
      tags: topic.tags,
      summary: buildDetailedSummary(topic),
      telugu_summary: buildDetailedTeluguSummary(topic),
      status: "published",
      published_at: "2026-06-07",
      author: "OfficeMitra",
      detail_level: "comprehensive",
      audience: "beginner-to-advanced",
    };
    fs.writeFileSync(path.join(catDir, `${topic.slug}.md`), matter.stringify(articleBody(topic), fm));
    existing.add(topic.slug);
    added++;
  }
  return added;
}

function writeProcedures(topics, existing) {
  const dir = path.join(root, "content", "procedures");
  let added = 0;
  for (const topic of topics) {
    const slug = `${topic.slug}-procedure`;
    if (existing.has(slug)) continue;
    ensureDir(path.join(dir, topic.category));
    const body = buildDetailedProcedureBody(topic);
    const fm = {
      title: `${topic.title} — Procedure`,
      slug,
      category: topic.category,
      summary: buildDetailedSummary({ ...topic, title: `${topic.title} — Procedure` }),
      telugu_summary: buildDetailedTeluguSummary(topic),
      estimated_time: "2–5 working days",
      status: "published",
      detail_level: "comprehensive",
      audience: "beginner-to-advanced",
      author: "OfficeMitra",
    };
    fs.writeFileSync(path.join(dir, topic.category, `${slug}.md`), matter.stringify(body, fm));
    existing.add(slug);
    added++;
  }
  return added;
}

function writeJsonArray(filePath, items, existingIds, idFn) {
  const list = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, "utf-8")) : [];
  const ids = new Set(list.map(idFn));
  let added = 0;
  for (const item of items) {
    const id = idFn(item);
    if (ids.has(id) || existingIds.has(id)) continue;
    list.push(item);
    ids.add(id);
    added++;
  }
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(list, null, 2) + "\n");
  return added;
}

function buildDocuments(topics) {
  return topics.map((t) => ({
    id: `doc-${t.slug}`,
    title: `${t.title} — GO Reference`,
    type: "go",
    number: "Verify on GOIR",
    date: "2026-06-07",
    department: "Finance Department",
    category: t.category,
    year: 2026,
    subject: t.summary,
    goir_url: "https://goir.ap.gov.in/",
    related_articles: [t.slug],
    file: `/downloads/documents/doc-${t.slug}.pdf`,
  }));
}

function buildTemplates(topics) {
  return topics.map((t) => ({
    id: `tpl-${t.slug}`,
    title: `${t.title} — Blank Template`,
    category: t.category,
    description: `Blank format for ${t.title.toLowerCase()}.`,
    description_te: `${t.title} blank format.`,
    usage_notes: "Customize with office details. Verify GO on GOIR before use.",
    related_articles: [t.slug],
    related_procedures: [`${t.slug}-procedure`],
    file_pdf: `/downloads/templates/tpl-${t.slug}.pdf`,
  }));
}

function buildFaq(topics) {
  return topics.map((t) => ({
    id: `faq-${t.slug}`,
    category: t.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    question: `How do I handle ${t.title.split("—")[0].trim()}?`,
    question_te: `${t.title.split("—")[0].trim()} ఎలా handle చేయాలి?`,
    answer: buildDetailedFaqAnswer({ title: t.title, category: t.category }),
    answer_te: buildDetailedFaqAnswerTe({ title: t.title }),
  }));
}

function buildGlossary(topics) {
  return topics.map((t) => {
    const label = t.title.split("—")[0].trim().slice(0, 35);
    return {
      term: label,
      slug_key: t.slug,
      telugu: label,
      definition: buildDetailedGlossaryDefinition({ title: t.title, category: t.category }),
      definition_te: buildDetailedGlossaryDefinitionTe({ title: t.title }),
      category: t.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    };
  });
}

function buildUpdates(topics) {
  const dir = path.join(root, "content", "updates", "2026");
  ensureDir(dir);
  const existing = existingSlugs(dir);
  let added = 0;
  for (const t of topics) {
    const slug = `update-${t.slug}`;
    if (existing.has(slug)) continue;
    const fm = {
      title: t.title,
      slug,
      date: "2026-06-07",
      category: t.category,
      what_changed: `OfficeMitra published a comprehensive beginner→advanced guide on ${t.title.toLowerCase()}.`,
      who_is_affected: "AP ministerial staff, DDO sections, establishment staff.",
      action_required: "Review full guide, verify GO on GOIR, update office procedures if applicable.",
      status: "published",
      detail_level: "comprehensive",
      audience: "beginner-to-advanced",
    };
    const body = buildDetailedUpdateBody(t);
    fs.writeFileSync(path.join(dir, `${slug}.md`), matter.stringify(body, fm));
    existing.add(slug);
    added++;
  }
  return added;
}

function main() {
  const topics = buildTopicBank(TARGET);
  console.log(`Topic bank: ${topics.length} unique topics\n`);

  const artAdded = writeArticles(topics, existingSlugs(path.join(root, "content", "articles")));
  const procAdded = writeProcedures(topics, existingSlugs(path.join(root, "content", "procedures")));
  const updAdded = buildUpdates(topics);

  const docIds = new Set();
  const docPath = path.join(root, "content", "documents", "metadata.json");
  if (fs.existsSync(docPath)) JSON.parse(fs.readFileSync(docPath, "utf-8")).forEach((d) => docIds.add(d.id));
  const docAdded = writeJsonArray(docPath, buildDocuments(topics), docIds, (d) => d.id);

  const tplPath = path.join(root, "content", "templates", "metadata.json");
  const tplIds = new Set();
  if (fs.existsSync(tplPath)) JSON.parse(fs.readFileSync(tplPath, "utf-8")).forEach((t) => tplIds.add(t.id));
  const tplAdded = writeJsonArray(tplPath, buildTemplates(topics), tplIds, (t) => t.id);

  const faqPath = path.join(root, "content", "faq", "items.json");
  const faqIds = new Set();
  if (fs.existsSync(faqPath)) JSON.parse(fs.readFileSync(faqPath, "utf-8")).forEach((f) => faqIds.add(f.id));
  const faqAdded = writeJsonArray(faqPath, buildFaq(topics), faqIds, (f) => f.id);

  const glossPath = path.join(root, "content", "glossary", "terms.json");
  const glossIds = new Set();
  if (fs.existsSync(glossPath)) JSON.parse(fs.readFileSync(glossPath, "utf-8")).forEach((g) => glossIds.add(g.term));
  const glossAdded = writeJsonArray(
    glossPath,
    buildGlossary(topics),
    glossIds,
    (g) => g.slug_key ?? g.term
  );

  console.log({ articles: artAdded, procedures: procAdded, updates: updAdded, documents: docAdded, templates: tplAdded, faq: faqAdded, glossary: glossAdded });
  console.log("\nNext: npm.cmd run content:pdfs && node scripts/dedupe-cms.mjs && npm.cmd run content:import-all && publish");
}

main();
