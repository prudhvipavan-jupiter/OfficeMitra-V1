/**
 * Build 100+ unique expert topics, dedupe glossary, consolidate GO documents.
 * Run: node scripts/build-expert-topics-and-dedupe.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { allTopics } from "./content-pipeline/topics/all-topics.mjs";
import { SUBJECTS } from "./content-pipeline/mega-topic-bank.mjs";

/** Extra unique bases so the expert hub stays above 100 topics */
const SUPPLEMENTAL_TOPICS = [
  { base: "file-noting", title: "File Noting & Correspondence", category: "establishment" },
  { base: "office-order-drafting", title: "Office Order Drafting", category: "establishment" },
  { base: "rti-reply", title: "RTI Reply Preparation", category: "establishment" },
  { base: "seniority-list-objection", title: "Seniority List Objection", category: "establishment" },
  { base: "special-casual-leave", title: "Special Casual Leave", category: "leave" },
  { base: "study-leave", title: "Study Leave Sanction", category: "leave" },
  { base: "funeral-advance", title: "Funeral Advance", category: "finance" },
  { base: "transport-allowance", title: "Transport Allowance", category: "finance" },
  { base: "risk-allowance", title: "Risk Allowance", category: "finance" },
  { base: "night-duty-allowance", title: "Night Duty Allowance", category: "finance" },
  { base: "ex-gratia-claim", title: "Ex-Gratia Claim", category: "finance" },
  { base: "lok-adalat-settlement", title: "Lok Adalat Settlement", category: "conduct" },
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const ANGLE_SUFFIXES = [
  "office-guide",
  "ddo-checklist",
  "step-by-step",
  "common-mistakes",
  "audit-ready",
  "cfms-workflow",
  "reference",
];

function toBaseSlug(slug) {
  for (const s of ANGLE_SUFFIXES) {
    const suffix = `-${s}`;
    if (slug.endsWith(suffix)) {
      const rest = slug.slice(0, -suffix.length);
      if (s === "reference" && /-\d+$/.test(rest)) {
        return rest.replace(/-\d+$/, "");
      }
      return rest;
    }
  }
  return slug;
}

function pickFlagshipSlug(base, articleSlugs) {
  const candidates = articleSlugs.filter((s) => toBaseSlug(s) === base);
  if (candidates.length === 0) return base;
  const order = ["office-guide", "step-by-step", "ddo-checklist", base];
  for (const pref of order) {
    const hit = candidates.find((s) => s === pref || s.endsWith(`-${pref}`));
    if (hit) return hit;
  }
  return candidates.sort((a, b) => a.length - b.length)[0];
}

function readJson(p) {
  let raw = fs.readFileSync(p, "utf-8");
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  return JSON.parse(raw);
}

function writeJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

// Collect article slugs from disk
const articlesDir = path.join(root, "content", "articles");
const articleSlugs = [];
for (const cat of fs.readdirSync(articlesDir)) {
  const dir = path.join(articlesDir, cat);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith(".md")) articleSlugs.push(f.replace(/\.md$/, ""));
  }
}

// Build topic map
const topicMap = new Map();

function addTopic(base, title, category, source) {
  if (!base || topicMap.has(base)) {
    if (topicMap.has(base) && title && !topicMap.get(base).title.includes("—")) {
      topicMap.get(base).title = title;
    }
    return;
  }
  const flagship = pickFlagshipSlug(base, articleSlugs);
  topicMap.set(base, {
    base,
    title: title || base.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    category: category || "establishment",
    flagship_slug: flagship,
    procedure_slug: `${flagship}-procedure`,
    document_id: `go-${base}`,
    source,
  });
}

for (const t of allTopics) addTopic(t.slug, t.title, t.category, "all-topics");
for (const s of SUBJECTS) addTopic(s.base, s.title, s.cat, "mega-bank");
for (const s of SUPPLEMENTAL_TOPICS) addTopic(s.base, s.title, s.category, "supplemental");

for (const slug of articleSlugs) {
  const base = toBaseSlug(slug);
  if (!topicMap.has(base)) {
    addTopic(base, null, null, "article-scan");
  }
}

const topics = [...topicMap.values()].sort((a, b) => a.title.localeCompare(b.title));
console.log(`Expert topics: ${topics.length} unique bases`);

const expertOut = path.join(root, "content", "expert", "topics.json");
fs.mkdirSync(path.dirname(expertOut), { recursive: true });
writeJson(expertOut, topics);

// Dedupe glossary by term label (case-insensitive) and slug_key base
const glossPath = path.join(root, "content", "glossary", "terms.json");
const glossary = readJson(glossPath);
const glossByTerm = new Map();

for (const g of glossary) {
  const key = (g.term || "").trim().toLowerCase();
  if (!key) continue;
  const existing = glossByTerm.get(key);
  if (!existing) {
    glossByTerm.set(key, { ...g, slug_key: g.slug_key || key.replace(/\s+/g, "-").toLowerCase() });
    continue;
  }
  const pick =
    (g.definition?.length || 0) > (existing.definition?.length || 0) ? g : existing;
  const other = pick === g ? existing : g;
  pick.related_articles = [
    ...new Set([...(pick.related_articles || []), ...(other.related_articles || [])]),
  ];
  if (!pick.definition_te && other.definition_te) pick.definition_te = other.definition_te;
  if (!pick.telugu && other.telugu) pick.telugu = other.telugu;
  glossByTerm.set(key, pick);
}

const dedupedGlossary = [...glossByTerm.values()].sort((a, b) =>
  a.term.localeCompare(b.term)
);
writeJson(glossPath, dedupedGlossary);
console.log(`Glossary: ${glossary.length} → ${dedupedGlossary.length} (deduped by term label)`);

// Consolidate documents — one GO pack per expert topic base
const docsPath = path.join(root, "content", "documents", "metadata.json");
const oldDocs = readJson(docsPath);
const oldByBase = new Map();
for (const d of oldDocs) {
  const slugPart = d.id.replace(/^doc-/, "");
  const base = toBaseSlug(slugPart);
  if (!oldByBase.has(base) || (d.subject?.length || 0) > (oldByBase.get(base).subject?.length || 0)) {
    oldByBase.set(base, d);
  }
}

const consolidatedDocs = topics.map((t) => {
  const prev = oldByBase.get(t.base);
  const subject =
    prev?.subject ||
    `Official GO reference pack for ${t.title} — download OfficeMitra summary PDF and verify current Government Orders on GOIR before official action.`;
  return {
    id: t.document_id,
    title: `${t.title} — GO Reference Pack`,
    type: "go",
    number: prev?.number && prev.number !== "Verify on GOIR" ? prev.number : "Verify on GOIR",
    date: prev?.date || new Date().toISOString().slice(0, 10),
    department: "Andhra Pradesh Government",
    category: t.category,
    year: prev?.year || new Date().getFullYear(),
    subject,
    goir_url: "https://goir.ap.gov.in/",
    goir_search: t.title,
    related_articles: [t.flagship_slug],
    related_procedures: [t.procedure_slug],
    file: `/downloads/documents/${t.document_id}.pdf`,
  };
});

writeJson(docsPath, consolidatedDocs);
console.log(`Documents: ${oldDocs.length} → ${consolidatedDocs.length} (one GO pack per topic)`);

console.log("\nNext: npm run content:pdfs && npm run content:prepare-sync (if CMS sync needed)");
