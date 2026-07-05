#!/usr/bin/env node
/**
 * Prepare original content package: validate, clean orphans, build manifest, sync CMS.
 * Run: npm run content:prepare
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function walkMd(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMd(full));
    else if (entry.name.endsWith(".md")) {
      const raw = fs.readFileSync(full, "utf-8");
      const { data, content } = matter(raw);
      out.push({ path: full, data, content, rel: path.relative(root, full) });
    }
  }
  return out;
}

function readJson(p, fallback = []) {
  if (!fs.existsSync(p)) return fallback;
  const raw = fs.readFileSync(p, "utf-8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function ensurePublishedMarkdown(files) {
  let fixed = 0;
  for (const f of files) {
    if (f.data.status === "published") continue;
    f.data.status = "published";
    fs.writeFileSync(f.path, matter.stringify(f.content, f.data));
    fixed++;
  }
  return fixed;
}

function dedupeMarkdownBySlug(files, slugField = "slug") {
  const bySlug = new Map();
  let removed = 0;
  for (const f of files) {
    const slug = String(f.data[slugField] ?? "");
    if (!slug) continue;
    const prev = bySlug.get(slug);
    if (!prev) {
      bySlug.set(slug, f);
      continue;
    }
    // Keep file with more content
    const keep = f.content.length >= prev.content.length ? f : prev;
    const drop = keep === f ? prev : f;
    if (fs.existsSync(drop.path)) {
      fs.unlinkSync(drop.path);
      removed++;
    }
    bySlug.set(slug, keep);
  }
  return removed;
}

function syncPdfPaths(metadata, pdfDir, prefix) {
  let fixed = 0;
  for (const item of metadata) {
    const id = item.id;
    const expected = `/downloads/${prefix}/${id}.pdf`;
    const disk = path.join(root, "public", expected.replace(/^\//, ""));
    if (item.file !== expected && item.file_pdf !== expected) {
      if (prefix === "documents") item.file = expected;
      else item.file_pdf = expected;
      fixed++;
    }
    if (!fs.existsSync(disk)) {
      fixed++;
    }
  }
  return fixed;
}

async function buildMinimalPdf(outPath, title, subtitle) {
  const ascii = (s) =>
    String(s)
      .replace(/₹/g, "Rs.")
      .replace(/[^\x00-\xFF]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const reg = await pdf.embedFont(StandardFonts.Helvetica);
  page.drawRectangle({ x: 0, y: 750, width: 595, height: 92, color: rgb(0.04, 0.09, 0.16) });
  page.drawText("OfficeMitra Original", { x: 50, y: 800, size: 12, font: bold, color: rgb(0.83, 0.63, 0.09) });
  page.drawText(ascii(title).slice(0, 80), { x: 50, y: 770, size: 14, font: bold, color: rgb(1, 1, 1) });
  page.drawText(ascii(subtitle).slice(0, 120), { x: 50, y: 720, size: 10, font: reg, color: rgb(0.2, 0.2, 0.2) });
  page.drawText("Verify official GO on goir.ap.gov.in before official use.", {
    x: 50,
    y: 680,
    size: 9,
    font: reg,
    color: rgb(0.4, 0.4, 0.4),
  });
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, await pdf.save());
}

async function ensurePdfs(metadata, prefix, titleFn) {
  let created = 0;
  for (const item of metadata) {
    const id = item.id;
    const rel = `/downloads/${prefix}/${id}.pdf`;
    const disk = path.join(root, "public", rel.replace(/^\//, ""));
    if (!fs.existsSync(disk)) {
      await buildMinimalPdf(disk, titleFn(item), item.subject ?? item.description ?? "");
      created++;
    }
  }
  return created;
}

function cleanOrphanPdfs(pdfDir, metadata, idField = "id") {
  if (!fs.existsSync(pdfDir)) return 0;
  const expected = new Set(metadata.map((m) => `${m[idField]}.pdf`));
  let removed = 0;
  for (const f of fs.readdirSync(pdfDir)) {
    if (!f.endsWith(".pdf")) continue;
    if (!expected.has(f)) {
      fs.unlinkSync(path.join(pdfDir, f));
      removed++;
    }
  }
  return removed;
}

function dedupeJsonArray(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    map.set(keyFn(item), item);
  }
  return [...map.values()];
}

async function main() {
  console.log("OfficeMitra — preparing original content package\n");

  const articles = walkMd(path.join(root, "content", "articles"));
  const procedures = walkMd(path.join(root, "content", "procedures"));
  const updates = walkMd(path.join(root, "content", "updates"));

  const artDeduped = dedupeMarkdownBySlug(articles);
  const procDeduped = dedupeMarkdownBySlug(procedures);
  const updDeduped = dedupeMarkdownBySlug(updates);

  const artFixed = ensurePublishedMarkdown(walkMd(path.join(root, "content", "articles")));
  const procFixed = ensurePublishedMarkdown(walkMd(path.join(root, "content", "procedures")));
  const updFixed = ensurePublishedMarkdown(walkMd(path.join(root, "content", "updates")));

  const docPath = path.join(root, "content", "documents", "metadata.json");
  const tplPath = path.join(root, "content", "templates", "metadata.json");
  const faqPath = path.join(root, "content", "faq", "items.json");
  const glossPath = path.join(root, "content", "glossary", "terms.json");

  let documents = dedupeJsonArray(readJson(docPath), (d) => d.id);
  let templates = dedupeJsonArray(readJson(tplPath), (t) => t.id);
  let faq = dedupeJsonArray(readJson(faqPath), (f) => f.id);
  let glossary = dedupeJsonArray(readJson(glossPath), (g) => g.slug_key ?? g.term);

  fs.writeFileSync(docPath, JSON.stringify(documents, null, 2) + "\n");
  fs.writeFileSync(tplPath, JSON.stringify(templates, null, 2) + "\n");
  fs.writeFileSync(faqPath, JSON.stringify(faq, null, 2) + "\n");
  fs.writeFileSync(glossPath, JSON.stringify(glossary, null, 2) + "\n");

  syncPdfPaths(documents, "documents", "documents");
  syncPdfPaths(templates, "templates", "templates");
  fs.writeFileSync(docPath, JSON.stringify(documents, null, 2) + "\n");
  fs.writeFileSync(tplPath, JSON.stringify(templates, null, 2) + "\n");

  const docPdfCreated = await ensurePdfs(documents, "documents", (d) => d.title);
  const tplPdfCreated = await ensurePdfs(templates, "templates", (t) => t.title);

  const orphanDocs = cleanOrphanPdfs(path.join(root, "public", "downloads", "documents"), documents);
  const orphanTpl = cleanOrphanPdfs(path.join(root, "public", "downloads", "templates"), templates);

  const manifest = {
    generated_at: new Date().toISOString(),
    copyright: "Original OfficeMitra content — not copied from third-party sites",
    notice: "content/ORIGINAL-CONTENT-NOTICE.md",
    counts: {
      articles: walkMd(path.join(root, "content", "articles")).length,
      procedures: walkMd(path.join(root, "content", "procedures")).length,
      updates: walkMd(path.join(root, "content", "updates")).length,
      documents: documents.length,
      templates: templates.length,
      faq: faq.length,
      glossary: glossary.length,
    },
    paths: {
      articles: "content/articles/**/*.md",
      procedures: "content/procedures/**/*.md",
      updates: "content/updates/**/*.md",
      documents: "content/documents/metadata.json",
      document_pdfs: "public/downloads/documents/*.pdf",
      templates: "content/templates/metadata.json",
      template_pdfs: "public/downloads/templates/*.pdf",
      faq: "content/faq/items.json",
      glossary: "content/glossary/terms.json",
      tools: "lib/tools/ + app/tools/",
    },
    maintenance: {
      deduped_markdown: artDeduped + procDeduped + updDeduped,
      status_fixed: artFixed + procFixed + updFixed,
      pdfs_created: docPdfCreated + tplPdfCreated,
      orphan_pdfs_removed: orphanDocs + orphanTpl,
    },
  };

  fs.writeFileSync(path.join(root, "content", "MANIFEST.json"), JSON.stringify(manifest, null, 2) + "\n");

  console.log("Counts:", manifest.counts);
  console.log("Maintenance:", manifest.maintenance);
  console.log("\nManifest written to content/MANIFEST.json");
  console.log("Next: npm.cmd run content:import-all  (then admin sync on production)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
