/**
 * Expert content builder — angle-specific, topic-aware (not one template).
 */
import { getSubjectDef, parseSlug } from "./subject-definitions.mjs";

const OFFICIAL = `- [GOIR — Government Orders](https://goir.ap.gov.in/)
- [AP Finance Department](https://www.apfinance.ap.gov.in/)
- [AP Treasury / CFMS](https://treasury.ap.gov.in/)
- [AP Health Department](https://health.ap.gov.in/)`;

function tableFromDocs(docs) {
  return docs.map(([d, w]) => `| ${d} | ${w} |`).join("\n");
}

export function buildExpertSummary(topic, angle) {
  const def = getSubjectDef(topic.slug ?? topic.title);
  const angleLabel = angle.replace(/-/g, " ");
  return `Expert OfficeMitra guide on ${def.title.toLowerCase()} (${angleLabel}) for AP ministerial staff, DDO sections, and establishment officers. Covers definition, rules, documents, and audit-safe practice. Verify latest GO on GOIR before acting.`;
}

export function buildExpertTeluguSummary(topic) {
  const def = getSubjectDef(topic.slug ?? topic.title);
  return def.telugu;
}

export function buildExpertArticleBody(topic) {
  const slug = topic.slug ?? "";
  const { base, angle } = parseSlug(slug);
  const def = getSubjectDef(base);

  switch (angle) {
    case "ddo-checklist":
      return buildDdoChecklist(def);
    case "step-by-step":
      return buildStepByStep(def);
    case "common-mistakes":
      return buildMistakesGuide(def);
    case "audit-ready":
      return buildAuditGuide(def);
    case "cfms-workflow":
      return buildCfmsGuide(def);
    default:
      return buildOfficeGuide(def);
  }
}

function buildOfficeGuide(def) {
  return `> **OfficeMitra expert guide** — ${def.title}. Beginner → advanced. Original guidance only; verify GOs on GOIR.

## What is ${def.title}?

${def.definition}

## When is it required?

${def.when.map((w) => `- ${w}`).join("\n")}

## Who should read this

| Level | Reader | Focus |
|-------|--------|-------|
| **Beginner** | Junior Assistant | Understand what ${def.title} means and which papers to collect |
| **Intermediate** | Superintendent / Section Head | Draft proceedings and verify rules |
| **Advanced** | DDO / Finance | CFMS, recoveries, audit compliance |

## Applicable rules

${def.rules.map((r) => `- ${r}`).join("\n")}

## Documents and registers

| Document / register | Why it matters |
|---------------------|----------------|
${tableFromDocs(def.documents)}

## Step-by-step procedure

${def.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}

${def.sample ? `## Sample draft format\n\n${def.sample}\n` : ""}

## DDO / CFMS notes

${def.ddoNotes.map((n) => `- ${n}`).join("\n")}

## Common mistakes

${def.mistakes.map((m, i) => `${i + 1}. ${m}`).join("\n")}

## Frequently asked questions

${def.faq.map(([q, a]) => `**${q}**\n\n${a}\n`).join("\n")}

## Official links

${OFFICIAL}

## తెలుగు మార్గదర్శి

${def.telugu}

### ప్రధాన దశలు

${def.steps.slice(0, 6).map((s, i) => `${i + 1}. ${s.split("—")[0].trim()}`).join("\n")}
`;
}

function buildDdoChecklist(def) {
  return `> **DDO checklist** — ${def.title}. Use before signing bills, NDC, or transfer papers.

## DDO responsibility

${def.definition}

## Before you sign — checklist

${def.steps.map((s) => `- [ ] ${s}`).join("\n")}

## Recovery & CFMS verification

${def.ddoNotes.map((n) => `- [ ] ${n}`).join("\n")}

## Documents DDO must verify

${def.documents.map(([d]) => `- [ ] ${d}`).join("\n")}

## Red flags (do not sign if)

${def.mistakes.slice(0, 5).map((m) => `- ${m}`).join("\n")}

## Official links

${OFFICIAL}

## తెలుగు — DDO చెక్‌లిస్ట్

${def.telugu}
`;
}

function buildStepByStep(def) {
  return `> **Step-by-step** — ${def.title}. Follow in order.

## Overview

${def.definition}

## Detailed steps

${def.steps.map((s, i) => `### Step ${i + 1}\n\n${s}\n`).join("\n")}

## Papers at each stage

${def.documents.map(([d, w]) => `- **${d}** — ${w}`).join("\n")}

## Official links

${OFFICIAL}
`;
}

function buildMistakesGuide(def) {
  return `> **Common mistakes** — ${def.title}. Learn from audit objections.

## Overview

${def.definition}

## Top mistakes and how to avoid them

${def.mistakes.map((m, i) => `### ${i + 1}. ${m}\n\n**Prevention:** Verify papers against ${def.rules[0] ?? "applicable rules"}; seek Superintendent guidance before issuing orders.\n`).join("\n")}

## Audit questions you may face

- Where is the rule citation in your proceeding?
- Show Service Register entry for this order
- Prove CFMS master matches establishment records

## Official links

${OFFICIAL}
`;
}

function buildAuditGuide(def) {
  return `> **Audit-ready** — ${def.title}. File index and evidence.

## What auditors check

${def.mistakes.map((m) => `- ${m}`).join("\n")}

## Evidence file should contain

${def.documents.map(([d]) => `- Authenticated copy: ${d}`).join("\n")}
- Signed proceeding with number and date
- GO / circular copy cited in order
- DDO intimation copy if pay impact

## SR / register entries

${def.steps.filter((s) => /SR|Service Register|register/i.test(s)).map((s) => `- ${s}`).join("\n") || "- Same-day Service Register entry with order reference"}

## Official links

${OFFICIAL}
`;
}

function buildCfmsGuide(def) {
  return `> **CFMS workflow** — ${def.title}. Treasury and pay bill impact.

## Overview

${def.definition}

## CFMS / treasury steps

${def.ddoNotes.map((n, i) => `${i + 1}. ${n}`).join("\n")}

## Before bill submission

- Verify employee master in CFMS
- Check recovery codes and balances
- Confirm bill cycle cutoff dates
- Attach establishment order copy to bill file if required

## When treasury rejects

1. Read objection memo carefully
2. Correct master data or recovery schedule
3. Resubmit supplementary bill if needed
4. File treasury reply in subject file

## Official links

${OFFICIAL}
`;
}

export function buildExpertProcedureBody(topic) {
  const slug = (topic.slug ?? "").replace(/-procedure$/, "");
  const { base } = parseSlug(slug);
  const def = getSubjectDef(base);
  const steps = def.steps.slice(0, 10);

  return steps
    .map(
      (s, i) => `## Step ${i + 1}: ${s.split("—")[0].split("-")[0].trim()}

${s}

**Beginner:** Collect papers listed in file cover checklist. **Advanced:** Flag CFMS mismatches before sanction.
`
    )
    .join("\n") +
    `\n## Telugu summary\n\n${def.telugu}\n`;
}

export function buildExpertFaqAnswer(question, category) {
  const def = getSubjectDef(
    category?.toLowerCase?.() ??
      question.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)
  );
  const match = def.faq.find(([q]) => question.toLowerCase().includes(q.toLowerCase().slice(0, 20)));
  if (match) return match[1];
  return `${def.definition} In office: (1) verify papers, (2) cite rules in proceedings, (3) update Service Register, (4) inform DDO for pay impact. Category: ${def.category}. Always verify GOIR.`;
}

export function buildExpertFaqAnswerTe(question) {
  const def = getSubjectDef(parseSlug(question.replace(/\?/g, "")).base);
  return def.telugu;
}

const GLOSSARY_MAP = {
  DDO: "Drawing and Disbursing Officer — signs pay bills, NDC, and certifies non-drawal in AP government institutions.",
  LPC: "Last Pay Certificate — detailed pay and recovery statement issued on transfer or retirement.",
  NDC: "Non-Drawal Certificate — DDO certificate that salary was not drawn beyond a date and recoveries are cleared.",
  CFMS: "Comprehensive Financial Management System — AP treasury platform for pay bills and employee master.",
  SR: "Service Register — permanent establishment record of orders and service history.",
  BCR: "Biometric/Casual Register — daily attendance record maintained in offices.",
  MACP: "Modified Assured Career Progression — financial upgrade without change of post under career progression rules.",
  ACR: "Annual Confidential Report — performance appraisal record used in probation and promotion.",
  FR: "Fundamental Rules — core service and conduct rules applicable to government servants.",
  GPF: "General Provident Fund — retirement savings scheme with subscription and advances.",
  APGLI: "Andhra Pradesh Government Life Insurance — group insurance with premium and loan facilities.",
  EL: "Earned Leave — leave credited annually under AP Leave Rules.",
  HRA: "House Rent Allowance — compensatory allowance where government quarters not provided.",
  RBPS: "Retirement Benefits Processing System — pension calculation and retirement workflow.",
  GIS: "Group Insurance Scheme — insurance cover for government employees.",
};

export function buildExpertGlossaryDefinition(term, category) {
  const upper = term.toUpperCase().trim();
  if (GLOSSARY_MAP[upper]) {
    return `**${term}** — ${GLOSSARY_MAP[upper]} Verify latest GO/circular on GOIR for ${category ?? "your department"}.`;
  }
  const slug = term.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const def = getSubjectDef(slug);
  if (def && def.definition && !def.definition.startsWith(term + " is an administrative")) {
    return `**${term}** — ${def.definition.split(".")[0]}.`;
  }
  return `**${term}** — ${def.definition}`;
}

export function buildExpertGlossaryDefinitionTe(term) {
  return getSubjectDef(term).telugu;
}

export function buildExpertUpdateBody(topic) {
  const def = getSubjectDef(topic.slug ?? topic.title);
  return buildOfficeGuide(def);
}
