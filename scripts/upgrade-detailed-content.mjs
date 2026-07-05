#!/usr/bin/env node
/**
 * Upgrade all content to detailed beginner→advanced guides.
 * Run: npm run content:upgrade-detailed
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";
import {
  buildDetailedArticleBody,
  buildDetailedProcedureBody,
  buildDetailedUpdateBody,
  buildDetailedSummary,
  buildDetailedTeluguSummary,
  buildDetailedFaqAnswer,
  buildDetailedFaqAnswerTe,
  buildDetailedGlossaryDefinition,
  buildDetailedGlossaryDefinitionTe,
} from "./content-pipeline/detailed-builder.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

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
  const { data, content } = matter(raw);
  const topic = {
    title: String(data.title ?? ""),
    slug: String(data.slug ?? ""),
    category: String(data.category ?? "establishment"),
    tags: data.tags,
  };
  if (!topic.title) return false;

  const minLen = 1500;
  if (content.length >= minLen && data.detail_level === "comprehensive") return false;

  data.summary = buildDetailedSummary(topic);
  data.telugu_summary = buildDetailedTeluguSummary(topic);
  data.detail_level = "comprehensive";
  data.audience = "beginner-to-advanced";
  data.author = "OfficeMitra";
  data.updated_at = new Date().toISOString().slice(0, 10);

  fs.writeFileSync(filePath, matter.stringify(bodyFn(topic), data));
  return true;
}

function main() {
  let counts = { articles: 0, procedures: 0, updates: 0, faq: 0, glossary: 0, skipped: 0 };

  for (const f of walkMd(path.join(root, "content", "articles"))) {
    if (upgradeMarkdown(f, buildDetailedArticleBody)) counts.articles++;
    else counts.skipped++;
  }
  for (const f of walkMd(path.join(root, "content", "procedures"))) {
    if (upgradeMarkdown(f, buildDetailedProcedureBody)) counts.procedures++;
    else counts.skipped++;
  }
  for (const f of walkMd(path.join(root, "content", "updates"))) {
    if (upgradeMarkdown(f, buildDetailedUpdateBody)) counts.updates++;
    else counts.skipped++;
  }

  const faqPath = path.join(root, "content", "faq", "items.json");
  if (fs.existsSync(faqPath)) {
    const faq = JSON.parse(fs.readFileSync(faqPath, "utf-8"));
    for (const item of faq) {
      if ((item.answer?.length ?? 0) < 200) {
        item.answer = buildDetailedFaqAnswer(item.question, item.category);
        item.answer_te = buildDetailedFaqAnswerTe(item.question);
        counts.faq++;
      }
    }
    fs.writeFileSync(faqPath, JSON.stringify(faq, null, 2) + "\n");
  }

  const glossPath = path.join(root, "content", "glossary", "terms.json");
  if (fs.existsSync(glossPath)) {
    const terms = JSON.parse(fs.readFileSync(glossPath, "utf-8"));
    for (const term of terms) {
      if ((term.definition?.length ?? 0) < 150) {
        term.definition = buildDetailedGlossaryDefinition(term.term, term.category);
        term.definition_te = buildDetailedGlossaryDefinitionTe(term.term);
        counts.glossary++;
      }
    }
    fs.writeFileSync(glossPath, JSON.stringify(terms, null, 2) + "\n");
  }

  console.log("Detailed content upgrade complete:");
  console.log(counts);
  console.log("\nNext: npm run content:prepare-sync && deploy");
}

main();
