/**
 * OfficeMitra Agent Studio — online tools powered by agency-agents patterns
 * @see https://github.com/msitarzewski/agency-agents
 */

export type AgentDivision =
  | "content"
  | "quality"
  | "seo"
  | "docs"
  | "support"
  | "cms"
  | "government";

export type AgentCategory = AgentDivision;

export type AgentInputType = "text" | "textarea" | "select";

export type SaveContentType = "article" | "procedure" | "update" | "faq" | "glossary";

export interface AgentInputField {
  name: string;
  label: string;
  type: AgentInputType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  rows?: number;
}

export interface AgentTool {
  id: string;
  name: string;
  division: AgentDivision;
  source: "agency-agents" | "officemitra";
  description: string;
  officemitraUse: string;
  inputFields: AgentInputField[];
  saveAsArticle?: boolean;
  saveContentType?: SaveContentType;
  builtInAction?: { id: string; label: string };
}

export const AGENT_DIVISION_LABELS: Record<AgentDivision, string> = {
  content: "Content writing",
  quality: "Quality & review",
  seo: "SEO & discovery",
  docs: "Documents & language",
  support: "Support & community",
  cms: "CMS & pipeline",
  government: "AP government specialist",
};

/** @deprecated use AGENT_DIVISION_LABELS */
export const AGENT_CATEGORY_LABELS = AGENT_DIVISION_LABELS;

const ANGLES = [
  { value: "office-guide", label: "Office guide" },
  { value: "ddo-checklist", label: "DDO checklist" },
  { value: "step-by-step", label: "Step-by-step" },
  { value: "common-mistakes", label: "Common mistakes" },
  { value: "audit-ready", label: "Audit-ready" },
  { value: "cfms-workflow", label: "CFMS workflow" },
];

const CATEGORIES = [
  "establishment",
  "finance",
  "leave",
  "apgli",
  "gpf",
  "treasury",
  "conduct",
  "health",
  "service-rules",
  "education",
  "appsc",
].map((c) => ({ value: c, label: c }));

const UPDATE_CATEGORIES = [
  { value: "finance", label: "Finance" },
  { value: "establishment", label: "Establishment" },
  { value: "health", label: "Health" },
  { value: "appsc", label: "APPSC" },
];

export const AGENT_TOOLS: AgentTool[] = [
  // ── Content ──
  {
    id: "ap-government-content-writer",
    name: "Write AP guide",
    division: "content",
    source: "officemitra",
    description: "Full expert knowledge article for AP ministerial staff.",
    officemitraUse: "DDO checklists, GOIR notes, Telugu summary — save as draft.",
    saveAsArticle: true,
    saveContentType: "article",
    inputFields: [
      { name: "topic", label: "Topic", type: "text", required: true, placeholder: "Non-Drawal Certificate (NDC)" },
      { name: "angle", label: "Article angle", type: "select", required: true, options: ANGLES },
      { name: "category", label: "Category", type: "select", required: true, options: CATEGORIES },
      { name: "notes", label: "Extra context", type: "textarea", rows: 3 },
    ],
  },
  {
    id: "procedure-writer",
    name: "Write procedure",
    division: "content",
    source: "officemitra",
    description: "Step-by-step office procedure with documents table and SR notes.",
    officemitraUse: "Save as procedure — ideal for /procedures section.",
    saveAsArticle: true,
    saveContentType: "procedure",
    inputFields: [
      { name: "title", label: "Procedure title", type: "text", required: true },
      { name: "category", label: "Category", type: "select", required: true, options: CATEGORIES },
      { name: "notes", label: "Steps / outline", type: "textarea", required: true, rows: 8 },
    ],
  },
  {
    id: "technical-writer",
    name: "Structure procedure",
    division: "content",
    source: "agency-agents",
    description: "Turn rough notes into structured content with tables and checklists.",
    officemitraUse: "Long-form steps, sample proceedings.",
    saveAsArticle: true,
    saveContentType: "article",
    inputFields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "notes", label: "Rough notes", type: "textarea", required: true, rows: 8 },
    ],
  },
  {
    id: "content-creator",
    name: "Write summaries",
    division: "content",
    source: "agency-agents",
    description: "Engaging summaries, hooks, and Telugu blurbs.",
    officemitraUse: "Homepage copy, article intros, social blurbs.",
    inputFields: [
      { name: "topic", label: "Topic", type: "text", required: true },
      { name: "notes", label: "Key points", type: "textarea", required: true, rows: 5 },
    ],
  },
  {
    id: "policy-update-writer",
    name: "Write policy update",
    division: "content",
    source: "officemitra",
    description: "Short policy update for /updates — what changed, who affected, action required.",
    officemitraUse: "GO/circular alerts after Intelligence or manual input.",
    saveAsArticle: true,
    saveContentType: "update",
    inputFields: [
      { name: "topic", label: "Update title", type: "text", required: true },
      { name: "category", label: "Category", type: "select", required: true, options: UPDATE_CATEGORIES },
      { name: "notes", label: "What changed / source URL", type: "textarea", required: true, rows: 5 },
    ],
  },
  {
    id: "content-expander",
    name: "Expand thin article",
    division: "content",
    source: "officemitra",
    description: "Expand a short draft into a full expert guide (400+ words).",
    officemitraUse: "Fix legacy one-line posts — paste slug or content.",
    saveAsArticle: true,
    saveContentType: "article",
    inputFields: [
      { name: "slug", label: "Load from slug", type: "text", placeholder: "optional" },
      { name: "title", label: "Title", type: "text" },
      { name: "content", label: "Thin content to expand", type: "textarea", required: true, rows: 8 },
    ],
  },
  {
    id: "topic-idea-generator",
    name: "Generate 10 topics",
    division: "content",
    source: "officemitra",
    description: "Suggest 10 article topics for a category — paste into NeXus batch.",
    officemitraUse: "Content planning for establishment, finance, leave, etc.",
    inputFields: [
      { name: "category", label: "Category", type: "select", required: true, options: CATEGORIES },
      { name: "theme", label: "Theme (optional)", type: "text", placeholder: "transfer, pension, CFMS…" },
    ],
  },

  // ── Quality ──
  {
    id: "ap-content-quality-reviewer",
    name: "Quality audit",
    division: "quality",
    source: "officemitra",
    description: "Score content for duplication, thin body, missing sections.",
    officemitraUse: "Works offline with heuristics if no API key.",
    inputFields: [
      { name: "slug", label: "Load from slug", type: "text" },
      { name: "title", label: "Title", type: "text" },
      { name: "content", label: "Content to review", type: "textarea", required: true, rows: 12 },
    ],
  },
  {
    id: "reality-checker",
    name: "Pre-publish check",
    division: "quality",
    source: "agency-agents",
    description: "Blockers and warnings — GOIR, disclaimers, legal tone.",
    officemitraUse: "Final sanity check before publish.",
    inputFields: [{ name: "content", label: "Content", type: "textarea", required: true, rows: 12 }],
  },
  {
    id: "audit-objection-advisor",
    name: "Audit objection guide",
    division: "quality",
    source: "officemitra",
    description: "Common audit objections and how DDO should respond for a topic.",
    officemitraUse: "Add audit-ready sections to articles.",
    inputFields: [
      { name: "topic", label: "Topic", type: "text", required: true },
      { name: "notes", label: "Context", type: "textarea", rows: 4 },
    ],
  },

  // ── SEO ──
  {
    id: "seo-specialist",
    name: "SEO optimizer",
    division: "seo",
    source: "agency-agents",
    description: "Meta title, description, slug, internal links.",
    officemitraUse: "Optimize knowledge articles for search.",
    inputFields: [
      { name: "title", label: "Page title", type: "text", required: true },
      { name: "summary", label: "Summary", type: "textarea", required: true, rows: 3 },
      { name: "slug", label: "Current slug", type: "text" },
    ],
  },

  // ── Docs ──
  {
    id: "document-generator",
    name: "Generate template",
    division: "docs",
    source: "agency-agents",
    description: "Fill-in office templates — proceedings, certificates, letters.",
    officemitraUse: "NDC, LPC, probation proceedings.",
    inputFields: [
      { name: "template_type", label: "Template type", type: "text", required: true },
      { name: "purpose", label: "Purpose", type: "textarea", required: true, rows: 3 },
    ],
  },
  {
    id: "language-translator",
    name: "Telugu adapter",
    division: "docs",
    source: "agency-agents",
    description: "Adapt English office content to natural Telugu.",
    officemitraUse: "telugu_summary and glossary fields.",
    inputFields: [{ name: "text", label: "English text", type: "textarea", required: true, rows: 8 }],
  },
  {
    id: "faq-builder",
    name: "Build FAQ entry",
    division: "docs",
    source: "officemitra",
    description: "Generate FAQ question + answer pair for ministerial staff.",
    officemitraUse: "Save as FAQ draft in CMS.",
    saveAsArticle: true,
    saveContentType: "faq",
    inputFields: [
      { name: "topic", label: "Topic", type: "text", required: true },
      { name: "category", label: "Category", type: "select", required: true, options: CATEGORIES },
      { name: "notes", label: "Common questions", type: "textarea", rows: 4 },
    ],
  },
  {
    id: "glossary-term-writer",
    name: "Glossary term",
    division: "docs",
    source: "officemitra",
    description: "Define an AP government term for the glossary.",
    officemitraUse: "Save as glossary entry.",
    saveAsArticle: true,
    saveContentType: "glossary",
    inputFields: [
      { name: "term", label: "Term", type: "text", required: true, placeholder: "LPC" },
      { name: "notes", label: "Context", type: "textarea", rows: 3 },
    ],
  },

  // ── Support ──
  {
    id: "expert-response-drafter",
    name: "Expert response",
    division: "support",
    source: "officemitra",
    description: "Draft a professional response to an expert assistance request.",
    officemitraUse: "Paste case summary from Command dashboard.",
    inputFields: [
      { name: "case_summary", label: "Case summary", type: "textarea", required: true, rows: 6 },
      { name: "designation", label: "Requester designation", type: "text" },
      { name: "topic", label: "Related topic", type: "text" },
    ],
  },
  {
    id: "community-reply-drafter",
    name: "Community reply",
    division: "support",
    source: "officemitra",
    description: "Draft an official-style reply to a community question.",
    officemitraUse: "Moderate Q&A from Command dashboard.",
    inputFields: [
      { name: "question", label: "Question title + body", type: "textarea", required: true, rows: 6 },
      { name: "category", label: "Category", type: "select", options: CATEGORIES },
    ],
  },

  // ── CMS ──
  {
    id: "cms-developer",
    name: "CMS diagnostics",
    division: "cms",
    source: "agency-agents",
    description: "Scan CMS quality stats — no AI required for scan.",
    officemitraUse: "Expert vs legacy content report.",
    builtInAction: { id: "scan", label: "Run CMS quality scan" },
    inputFields: [
      { name: "question", label: "CMS question (optional)", type: "textarea", rows: 4 },
    ],
  },

  // ── Government specialist ──
  {
    id: "government-digital-presales-consultant",
    name: "Improve public copy",
    division: "government",
    source: "agency-agents",
    description: "Trustworthy public-sector messaging without claiming official status.",
    officemitraUse: "About page, expert assistance, homepage.",
    inputFields: [{ name: "copy", label: "Copy to improve", type: "textarea", required: true, rows: 8 }],
  },
  {
    id: "go-impact-analyst",
    name: "GO impact analysis",
    division: "government",
    source: "officemitra",
    description: "Analyze a GO/circular — who is affected, action required, departments.",
    officemitraUse: "Intelligence review or manual GO paste.",
    inputFields: [
      { name: "title", label: "GO / circular title", type: "text", required: true },
      { name: "notes", label: "Summary or excerpt", type: "textarea", required: true, rows: 6 },
    ],
  },
  {
    id: "cfms-workflow-advisor",
    name: "CFMS workflow guide",
    division: "government",
    source: "officemitra",
    description: "CFMS pay bill / treasury workflow notes for DDO sections.",
    officemitraUse: "Finance category articles and checklists.",
    inputFields: [
      { name: "topic", label: "CFMS topic", type: "text", required: true, placeholder: "Pay bill submission" },
      { name: "notes", label: "Scenario", type: "textarea", rows: 4 },
    ],
  },
];

export function getAgentById(id: string): AgentTool | undefined {
  return AGENT_TOOLS.find((a) => a.id === id);
}

export function agentsByDivision(): Record<AgentDivision, AgentTool[]> {
  const out = {} as Record<AgentDivision, AgentTool[]>;
  for (const div of Object.keys(AGENT_DIVISION_LABELS) as AgentDivision[]) {
    out[div] = AGENT_TOOLS.filter((a) => a.division === div);
  }
  return out;
}

/** @deprecated */
export function agentsByCategory(): Record<AgentDivision, AgentTool[]> {
  return agentsByDivision();
}

export const CONTENT_PIPELINE_AGENTS = [
  "ap-government-content-writer",
  "procedure-writer",
  "technical-writer",
  "ap-content-quality-reviewer",
  "reality-checker",
  "seo-specialist",
  "cms-developer",
] as const;
