#!/usr/bin/env node
/**
 * Generate 100 expert Knowledge Hub articles + hero SVG images.
 * 50 flagship topics (all-topics) + 50 expert-angle guides (mega-topic-bank).
 *
 * Run: npm run content:top100
 * Then: npm run content:prepare-sync
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";
import { allTopics } from "./content-pipeline/topics/all-topics.mjs";
import { buildTopicBank } from "./content-pipeline/mega-topic-bank.mjs";
import { buildArticleMarkdown, buildHeroSvg } from "./content-pipeline/builder.mjs";
import {
  buildExpertArticleBody,
  buildExpertSummary,
  buildExpertTeluguSummary,
} from "./content-pipeline/expert-content-builder.mjs";
import { parseSlug } from "./content-pipeline/subject-definitions.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const today = "2026-06-07";
const scrapedPath = path.join(root, "scripts/content-pipeline/scraped/sources.json");

function loadScrapedNotes() {
  if (!fs.existsSync(scrapedPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(scrapedPath, "utf-8"));
  } catch {
    return {};
  }
}

function scrapedSummaryForTopic(topic, scraped) {
  const hits = [];
  for (const url of topic.scrapedSources ?? []) {
    const row = scraped[url];
    if (row?.ok && row.title) hits.push(`${row.title} (${url})`);
  }
  return hits.slice(0, 2).join("; ");
}

function write(relPath, content) {
  const full = path.join(root, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf-8");
}

function buildExpertMarkdown(topic) {
  const { angle } = parseSlug(topic.slug);
  const hero = `![${topic.title}](/images/articles/${topic.slug}.svg)\n\n`;
  const body = buildExpertArticleBody(topic);
  const fm = {
    title: topic.title,
    slug: topic.slug,
    category: topic.category,
    tags: topic.tags,
    summary: buildExpertSummary(topic, angle),
    telugu_summary: buildExpertTeluguSummary(topic),
    status: "published",
    published_at: today,
    updated_at: today,
    author: "OfficeMitra",
    verified_go: "Verify current GO on GOIR before processing",
    expert_assistance_cta: true,
    detail_level: "expert",
    audience: "beginner-to-advanced",
    hero_image: `/images/articles/${topic.slug}.svg`,
  };
  return matter.stringify(hero + body, fm);
}

const scraped = loadScrapedNotes();
const existingSlugs = new Set(allTopics.map((t) => t.slug));
const extraTopics = buildTopicBank(200)
  .filter((t) => !existingSlugs.has(t.slug))
  .slice(0, 50);

let articleCount = 0;
let imageCount = 0;

for (const topic of allTopics) {
  const notes = scrapedSummaryForTopic(topic, scraped);
  write(`content/articles/${topic.category}/${topic.slug}.md`, buildArticleMarkdown(topic, notes));
  write(`public/images/articles/${topic.slug}.svg`, buildHeroSvg(topic));
  articleCount += 1;
  imageCount += 1;
}

for (const topic of extraTopics) {
  write(`content/articles/${topic.category}/${topic.slug}.md`, buildExpertMarkdown(topic));
  write(`public/images/articles/${topic.slug}.svg`, buildHeroSvg({ ...topic, priority: 2 }));
  articleCount += 1;
  imageCount += 1;
}

const manifest = [
  ...allTopics.map((t) => ({
    slug: t.slug,
    title: t.title,
    category: t.category,
    tier: "flagship",
    image: `/images/articles/${t.slug}.svg`,
  })),
  ...extraTopics.map((t) => ({
    slug: t.slug,
    title: t.title,
    category: t.category,
    tier: "expert-angle",
    image: `/images/articles/${t.slug}.svg`,
  })),
];

write(
  "scripts/content-pipeline/top-100-manifest.json",
  JSON.stringify({ generated_at: new Date().toISOString(), count: manifest.length, articles: manifest }, null, 2)
);

console.log(`Generated ${articleCount} expert articles and ${imageCount} hero images.`);
console.log(`  Flagship: ${allTopics.length}`);
console.log(`  Expert-angle: ${extraTopics.length}`);
console.log("Next: npm run content:prepare-sync");
