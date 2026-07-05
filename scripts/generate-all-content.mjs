#!/usr/bin/env node
/**
 * Generate procedures, documents, FAQ, glossary, templates + bilingual article upgrades.
 * Run: node scripts/generate-all-content.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import { wrapProcedureBody, wrapDocumentExplanation, bilingualBody } from "./content-pipeline/bilingual.mjs";
import {
  procedureTopics,
  documentTopics,
  faqTopics,
  glossaryTopics,
  templateTopics,
} from "./content-pipeline/topics/cms-expansion.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeProcedure(topic) {
  const dir = path.join(root, "content", "procedures", topic.category);
  ensureDir(dir);
  const fm = {
    title: topic.title,
    slug: topic.slug,
    category: topic.category,
    summary: topic.summary,
    telugu_summary: topic.summary_te,
    estimated_time: topic.estimated_time,
    status: "published",
    published_at: "2026-06-07",
    updated_at: "2026-06-07",
    prerequisites: ["Verify latest GO on GOIR", "Head of Office approval where required"],
    required_documents: ["Appointment/transfer orders as applicable", "Supporting certificates"],
    common_mistakes: ["Missing rule citation in proceedings", "SR entry omitted", "Wrong effective date"],
    related_articles: [topic.slug.replace(/-procedure$/, "").replace(/-sanction$/, "")],
  };
  const body = wrapProcedureBody(topic.stepsEn, topic.stepsTe, topic.summary, topic.summary_te);
  const md = matter.stringify(body, fm);
  fs.writeFileSync(path.join(dir, `${topic.slug}.md`), md);
}

function writeDocuments() {
  const docs = documentTopics.map((d) => ({
    ...d,
    file: `/downloads/documents/${d.id}.pdf`,
    explanation_en: d.subject,
    explanation_te: `${d.subject} — అధికారిక GO GOIR లో verify చేయండి.`,
  }));
  ensureDir(path.join(root, "content", "documents"));
  fs.writeFileSync(
    path.join(root, "content", "documents", "metadata.json"),
    JSON.stringify(docs, null, 2) + "\n"
  );
  return docs;
}

function writeFaq() {
  ensureDir(path.join(root, "content", "faq"));
  fs.writeFileSync(path.join(root, "content", "faq", "items.json"), JSON.stringify(faqTopics, null, 2) + "\n");
}

function writeGlossary() {
  ensureDir(path.join(root, "content", "glossary"));
  fs.writeFileSync(
    path.join(root, "content", "glossary", "terms.json"),
    JSON.stringify(glossaryTopics, null, 2) + "\n"
  );
}

function writeTemplates() {
  const tpls = templateTopics.map((t) => ({
    ...t,
    usage_notes_te: t.description_te,
    file_pdf: `/downloads/templates/${t.id}.pdf`,
  }));
  ensureDir(path.join(root, "content", "templates"));
  fs.writeFileSync(
    path.join(root, "content", "templates", "metadata.json"),
    JSON.stringify(tpls, null, 2) + "\n"
  );
  return tpls;
}

function upgradeArticlesBilingual() {
  const articlesDir = path.join(root, "content", "articles");
  if (!fs.existsSync(articlesDir)) return 0;
  let count = 0;
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".md")) {
        const raw = fs.readFileSync(full, "utf-8");
        const { data, content } = matter(raw);
        if (content.includes("## తెలుగు") || content.includes("## Telugu")) continue;
        const teSummary = data.telugu_summary ?? data.summary ?? "";
        const teBlock = bilingualBody([
          {
            enTitle: "Telugu summary",
            en: data.summary ?? "",
            teTitle: "తెలుగు సారాంశం",
            te: teSummary,
          },
          {
            enTitle: "Note for Telugu readers",
            en: "Full Telugu translation of each section is being expanded. Refer to the English sections above and verify on GOIR.",
            te: "ప్రతి విభాగానికి పూర్తి తెలుగు అనువాదం విస్తరిస్తున్నాం. పై English విభాగాలు చూడండి మరియు GOIR లో verify చేయండి.",
          },
        ]);
        fs.writeFileSync(full, matter.stringify(content + "\n\n" + teBlock, data));
        count++;
      }
    }
  }
  walk(articlesDir);
  return count;
}

function main() {
  console.log("Generating CMS expansion content…\n");

  for (const p of procedureTopics) writeProcedure(p);
  console.log(`  ✓ ${procedureTopics.length} procedures`);

  const docs = writeDocuments();
  console.log(`  ✓ ${docs.length} documents (metadata)`);

  writeFaq();
  console.log(`  ✓ ${faqTopics.length} FAQ items`);

  writeGlossary();
  console.log(`  ✓ ${glossaryTopics.length} glossary terms`);

  const tpls = writeTemplates();
  console.log(`  ✓ ${tpls.length} templates (metadata)`);

  const upgraded = upgradeArticlesBilingual();
  console.log(`  ✓ ${upgraded} articles upgraded with Telugu sections`);

  const manifest = {
    generated_at: new Date().toISOString(),
    counts: {
      procedures: procedureTopics.length,
      documents: documentTopics.length,
      faq: faqTopics.length,
      glossary: glossaryTopics.length,
      templates: templateTopics.length,
      articles_upgraded: upgraded,
    },
  };
  fs.writeFileSync(
    path.join(root, "scripts", "content-pipeline", "expansion-manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n"
  );

  console.log("\nDone. Next: npm.cmd run content:pdfs && npm.cmd run content:import-all");
}

main();
