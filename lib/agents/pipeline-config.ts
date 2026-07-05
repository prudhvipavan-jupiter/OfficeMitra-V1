import type { AgentInputField } from "./registry";

export interface AgentPipelineStep {
  agentId: string;
  label: string;
}

export interface AgentPipeline {
  id: string;
  name: string;
  description: string;
  steps: AgentPipelineStep[];
  inputFields: AgentInputField[];
  saveAsArticle?: boolean;
  saveContentType?: "article" | "procedure" | "update";
}

const WRITER_ANGLES = [
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
].map((c) => ({ value: c, label: c }));

/** Client-safe pipeline definitions (no server imports). */
export const AGENT_PIPELINES: AgentPipeline[] = [
  {
    id: "beast-article",
    name: "Beast Article Pipeline",
    description: "Full expert article: Write → Quality audit → Reality check → SEO — one click.",
    saveAsArticle: true,
    saveContentType: "article",
    steps: [
      { agentId: "ap-government-content-writer", label: "Write guide" },
      { agentId: "ap-content-quality-reviewer", label: "Quality score" },
      { agentId: "reality-checker", label: "Reality check" },
      { agentId: "seo-specialist", label: "SEO polish" },
    ],
    inputFields: [
      { name: "topic", label: "Topic", type: "text", required: true, placeholder: "Earned leave encashment rules" },
      { name: "angle", label: "Angle", type: "select", required: true, options: WRITER_ANGLES },
      { name: "category", label: "Category", type: "select", required: true, options: CATEGORIES },
      { name: "notes", label: "Extra context", type: "textarea", rows: 3 },
    ],
  },
  {
    id: "beast-procedure",
    name: "Beast Procedure Pipeline",
    description: "Procedure draft → Quality → Reality check.",
    saveAsArticle: true,
    saveContentType: "procedure",
    steps: [
      { agentId: "procedure-writer", label: "Write procedure" },
      { agentId: "ap-content-quality-reviewer", label: "Quality score" },
      { agentId: "reality-checker", label: "Reality check" },
    ],
    inputFields: [
      { name: "title", label: "Procedure title", type: "text", required: true },
      { name: "notes", label: "Steps / context", type: "textarea", required: true, rows: 6 },
      { name: "category", label: "Category", type: "select", required: true, options: CATEGORIES },
    ],
  },
  {
    id: "beast-review",
    name: "Pre-Publish Review",
    description: "Quality + Reality check on existing content before going live.",
    steps: [
      { agentId: "ap-content-quality-reviewer", label: "Quality score" },
      { agentId: "reality-checker", label: "Reality check" },
    ],
    inputFields: [
      { name: "slug", label: "Article slug (auto-load)", type: "text", placeholder: "ndc-certificate-ddo-checklist" },
      { name: "content", label: "Or paste content", type: "textarea", rows: 10 },
    ],
  },
  {
    id: "beast-update",
    name: "Policy Update Pack",
    description: "Draft a policy update + SEO metadata for /updates.",
    saveAsArticle: true,
    saveContentType: "update",
    steps: [
      { agentId: "policy-update-writer", label: "Write update" },
      { agentId: "reality-checker", label: "Reality check" },
    ],
    inputFields: [
      { name: "topic", label: "What changed", type: "text", required: true },
      { name: "notes", label: "Source / context", type: "textarea", required: true, rows: 4 },
      { name: "category", label: "Category", type: "select", required: true, options: CATEGORIES },
    ],
  },
];

export function getPipelineById(id: string): AgentPipeline | undefined {
  return AGENT_PIPELINES.find((p) => p.id === id);
}
