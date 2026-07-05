#!/usr/bin/env node
/**
 * Upgrade all knowledge articles to 500–1000 word long-form expert prose.
 * Run: npm run content:long-form
 * Then: npm run content:prepare-sync
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";
import {
  buildLongFormArticleBody,
  buildPlainLanguageBlock,
  extractHeroImage,
} from "./content-pipeline/long-form-builder.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const today = new Date().toISOString().slice(0, 10);
const force = process.argv.includes("--force");
const MIN_WORDS = 500;

function walkArticles() {
  const dir = path.join(root, "content", "articles");
  const out = [];
  function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith(".md")) {
        const raw = fs.readFileSync(full, "utf-8");
        const { data, content } = matter(raw);
        out.push({ path: full, data, content });
      }
    }
  }
  walk(dir);
  return out;
}

function extractExample(oldContent) {
  const m = oldContent.match(/## Practical Example[\s\S]*?\n\n([\s\S]*?)(?=\n## |$)/);
  return m ? m[1].trim() : null;
}

function main() {
  const articles = walkArticles();
  let upgraded = 0;
  let skipped = 0;
  const wordCounts = [];

  for (const art of articles) {
    const slug = String(art.data.slug ?? "");
    const title = String(art.data.title ?? slug);
    const existingWords = art.content.split(/\s+/).filter(Boolean).length;

    if (
      !force &&
      existingWords >= MIN_WORDS &&
      art.content.includes("Detailed procedure") &&
      !art.content.includes("Before moving on, confirm supporting")
    ) {
      skipped++;
      continue;
    }

    const { body, wordCount } = buildLongFormArticleBody({
      slug,
      title,
      category: String(art.data.category ?? "establishment"),
      summary: String(art.data.summary ?? ""),
      example: extractExample(art.content),
      goReferences: null,
      sampleDraft: null,
      srEntry: null,
    });

    const hero =
      extractHeroImage(art.content) ??
      `![${title}](/images/articles/${slug}.svg)\n\n`;
    const plain = buildPlainLanguageBlock(title, String(art.data.summary ?? ""));

    const fullBody = plain + hero + body;

    art.data.detail_level = "expert";
    art.data.audience = "beginner-to-advanced";
    art.data.expert_assistance_cta = true;
    art.data.updated_at = today;
    art.data.word_count = wordCount;

    fs.writeFileSync(art.path, matter.stringify(fullBody, art.data));
    wordCounts.push(wordCount);
    upgraded++;
  }

  const avg = wordCounts.length
    ? Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length)
    : 0;
  const min = wordCounts.length ? Math.min(...wordCounts) : 0;
  const max = wordCounts.length ? Math.max(...wordCounts) : 0;

  console.log("Long-form article upgrade complete:");
  console.log({ total: articles.length, upgraded, skipped, avgWords: avg, minWords: min, maxWords: max });
  console.log("\nNext: npm run content:prepare-sync");
}

main();
