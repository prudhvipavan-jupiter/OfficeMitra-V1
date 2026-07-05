#!/usr/bin/env node
/**
 * Full content rewrite — topic-specific expert guides (not generic templates).
 * Run: npm run content:rewrite-all
 * Then: npm run content:prepare-sync && deploy && admin sync
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";
import {
  buildExpertArticleBody,
  buildExpertProcedureBody,
  buildExpertSummary,
  buildExpertTeluguSummary,
  buildExpertFaqAnswer,
  buildExpertGlossaryDefinition,
  buildExpertGlossaryDefinitionTe,
  buildExpertUpdateBody,
} from "./content-pipeline/expert-content-builder.mjs";
import { parseSlug } from "./content-pipeline/subject-definitions.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const today = new Date().toISOString().slice(0, 10);

function walkMd(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkMd(full));
    else if (e.name.endsWith(".md")) out.push(full);
  }
  return out;
}

function upgradeMarkdown(filePath, bodyFn) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content: _old } = matter(raw);
  const topic = {
    title: String(data.title ?? ""),
    slug: String(data.slug ?? path.basename(filePath, ".md")),
    category: String(data.category ?? "establishment"),
    tags: data.tags,
  };
  if (!topic.title) return false;

  data.summary = buildExpertSummary(topic, parseSlug(topic.slug).angle);
  data.telugu_summary = buildExpertTeluguSummary(topic);
  data.detail_level = "expert";
  data.audience = "beginner-to-advanced";
  data.author = "OfficeMitra";
  data.updated_at = today;
  data.rewritten_at = today;

  fs.writeFileSync(filePath, matter.stringify(bodyFn(topic), data));
  return true;
}

function main() {
  const stats = { articles: 0, procedures: 0, updates: 0, faq: 0, glossary: 0 };

  for (const f of walkMd(path.join(root, "content", "articles"))) {
    if (upgradeMarkdown(f, buildExpertArticleBody)) stats.articles++;
  }
  for (const f of walkMd(path.join(root, "content", "procedures"))) {
    if (upgradeMarkdown(f, buildExpertProcedureBody)) stats.procedures++;
  }
  for (const f of walkMd(path.join(root, "content", "updates"))) {
    if (upgradeMarkdown(f, buildExpertUpdateBody)) stats.updates++;
  }

  const faqPath = path.join(root, "content", "faq", "items.json");
  if (fs.existsSync(faqPath)) {
    const faq = JSON.parse(fs.readFileSync(faqPath, "utf-8"));
    for (const item of faq) {
      item.answer = buildExpertFaqAnswer(item.question, item.category);
      item.answer_te = buildExpertTeluguSummary({ slug: item.id, title: item.question });
    }
    fs.writeFileSync(faqPath, JSON.stringify(faq, null, 2) + "\n");
    stats.faq = faq.length;
  }

  const glPath = path.join(root, "content", "glossary", "terms.json");
  if (fs.existsSync(glPath)) {
    const terms = JSON.parse(fs.readFileSync(glPath, "utf-8"));
    for (const t of terms) {
      t.definition = buildExpertGlossaryDefinition(t.term, t.category);
      t.definition_te = buildExpertGlossaryDefinitionTe(t.term);
    }
    fs.writeFileSync(glPath, JSON.stringify(terms, null, 2) + "\n");
    stats.glossary = terms.length;
  }

  console.log("Expert content rewrite complete:\n", stats);
  console.log("\nNext: npm run content:prepare-sync");
}

main();
