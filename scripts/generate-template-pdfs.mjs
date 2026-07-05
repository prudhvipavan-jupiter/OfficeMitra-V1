#!/usr/bin/env node
/**
 * Generate blank template PDFs from content/templates/metadata.json
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const metadataPath = path.join(root, "content", "templates", "metadata.json");
const outDir = path.join(root, "public", "downloads", "templates");

const NAVY = rgb(0.04, 0.09, 0.16);
const GOLD = rgb(0.83, 0.63, 0.09);
const GRAY = rgb(0.42, 0.45, 0.5);

function wrap(text, maxW, font, size) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(t, size) <= maxW) line = t;
    else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function buildTemplatePdf(tpl) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  const reg = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const margin = 50;
  const cw = width - margin * 2;
  let y = height - margin;

  page.drawRectangle({ x: 0, y: height - 72, width, height: 72, color: NAVY });
  page.drawText("OfficeMitra Template", { x: margin, y: height - 46, size: 14, font: bold, color: GOLD });
  page.drawText("Blank format — customize before official use", { x: margin, y: height - 62, size: 9, font: reg, color: rgb(0.66, 0.72, 0.83) });
  y = height - 100;

  for (const line of wrap(tpl.title, cw, bold, 16).slice(0, 2)) {
    page.drawText(line, { x: margin, y, size: 16, font: bold, color: rgb(0.1, 0.1, 0.1) });
    y -= 22;
  }
  y -= 8;
  page.drawText(`Category: ${tpl.category}`, { x: margin, y, size: 10, font: reg, color: GRAY });
  y -= 20;

  for (const line of wrap(tpl.description, cw, reg, 11)) {
    page.drawText(line, { x: margin, y, size: 11, font: reg, color: rgb(0.1, 0.1, 0.1) });
    y -= 14;
  }
  y -= 16;
  page.drawText("Usage:", { x: margin, y, size: 11, font: bold, color: rgb(0.1, 0.1, 0.1) });
  y -= 16;
  for (const line of wrap(tpl.usage_notes, cw, reg, 10)) {
    page.drawText(line, { x: margin, y, size: 10, font: reg, color: GRAY });
    y -= 13;
  }

  y -= 24;
  page.drawRectangle({ x: margin, y: y - 200, width: cw, height: 220, borderColor: rgb(0.8, 0.82, 0.86), borderWidth: 1 });
  page.drawText("[ Fill official content here ]", { x: margin + 12, y: y - 20, size: 10, font: reg, color: GRAY });

  page.drawText("Verify latest GO on goir.ap.gov.in before use. © OfficeMitra", { x: margin, y: 36, size: 8, font: reg, color: GRAY });
  return pdf.save();
}

async function main() {
  if (!fs.existsSync(metadataPath)) {
    console.error("Run generate-all-content.mjs first");
    process.exit(1);
  }
  ensureDir(outDir);
  const tpls = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
  for (const tpl of tpls) {
    const bytes = await buildTemplatePdf(tpl);
    fs.writeFileSync(path.join(outDir, `${tpl.id}.pdf`), bytes);
    console.log(`  ✓ ${tpl.id}.pdf`);
  }
  console.log(`\nGenerated ${tpls.length} template PDFs`);
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
