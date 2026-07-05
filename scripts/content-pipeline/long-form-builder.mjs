/**
 * Long-form expert articles — 500–1000 words, prose-first with supporting lists.
 */
import { getSubjectDef, parseSlug } from "./subject-definitions.mjs";

function wc(text) {
  return String(text).split(/\s+/).filter(Boolean).length;
}

function section(title, body) {
  return `## ${title}\n\n${body.trim()}\n\n`;
}

function para(...sentences) {
  return sentences.filter(Boolean).join(" ");
}

function expandStep(step, index) {
  return `**Step ${index + 1}.** ${step} Before moving on, confirm supporting papers are on file and note reference numbers for your draft proceeding. If anything is missing, obtain it from the employee or parent office rather than issuing orders on an incomplete record.`;
}

function expandMistake(m, index) {
  return `${index + 1}. **${m}** — Auditors and inspecting officers frequently raise this objection. Prevention: cross-check against appointment orders, leave account, CFMS master, and Service Register before signing proceedings.`;
}

export function buildLongFormArticleBody(topic) {
  const slug = topic.slug ?? "";
  const { base } = parseSlug(slug);
  const def = getSubjectDef(base);
  const title = topic.title ?? def.title;
  const category = topic.category ?? def.category ?? "establishment";

  const overview = para(
    def.definition,
    `In Andhra Pradesh government offices — especially Health Department hospitals, PHCs, and district establishments — ${def.title.toLowerCase()} is a routine but high-risk function. A small error can delay pay, block transfer, or draw audit objection years later.`,
    `This guide explains ${def.title.toLowerCase()} in plain language for junior assistants who are learning establishment work, superintendents who draft proceedings, and DDO staff who must align pay bills and certificates with establishment orders.`
  );

  const whenBlock = para(
    `You will need this process when any of the following situations arise in your institution. Each trigger has slightly different papers, but the underlying rule position remains the same — verify first, draft second, register entry same day.`
  );
  const whenList = def.when.map((w) => `- ${w}`).join("\n");

  const rulesIntro = para(
    `Government orders and service rules do not exist in isolation. Establishment staff should read the specific rule cited in your draft together with AP State and Subordinate Service Rules, Fundamental Rules where applicable, and any department-specific instructions published on GOIR.`,
    `Before issuing an order, confirm that the rule version on GOIR has not been amended by a later circular.`
  );
  const rulesList = def.rules.map((r) => `- ${r}`).join("\n");

  const procedureIntro = para(
    `Follow the sequence below in order. Skipping a step — especially document verification or Service Register entry — is the most common reason files return from audit or treasury.`,
    `Where your institution uses CFMS, inform the DDO section as soon as the establishment order is signed so employee master and recoveries stay aligned.`
  );
  const procedureSteps = def.steps
    .slice(0, 10)
    .map((s, i) => expandStep(s, i))
    .join("\n\n");

  const documentsIntro = para(
    `Keep authenticated copies of each document below in the personal file and note the reference in your draft proceeding. Inspecting officers expect a clear paper trail from application or trigger event through signed order.`
  );
  const documentsTable = def.documents
    .map(([d, w]) => `- **${d}** — ${w}`)
    .join("\n");

  const scenario = topic.example ?? para(
    `Consider a typical case at a district hospital in Andhra Pradesh. The establishment section receives papers from a staff member or controlling officer. The junior assistant verifies dates, rule position, and supporting certificates, then prepares a draft for the Superintendent.`,
    `The Superintendent scrutinises rule citations and ACR or recovery position, signs the proceeding with a distinct number and date, and returns the file for Service Register entry the same day. The DDO section is intimated if pay, recovery, or NDC/LPC is affected.`,
    `This pattern — verify, draft, approve, register, intimate — applies whether the subject is ${def.title.toLowerCase()} or a related establishment matter.`
  );

  const checklistIntro = para(
    `Use this checklist immediately before routing the file for signature. If any item cannot be ticked, resolve it or record a formal note explaining why the exception is permitted under rules.`
  );
  const checklist = def.steps.slice(0, 8).map((s) => `- [ ] ${s.split(/[—–-]/)[0].trim()}`).join("\n");

  const auditIntro = para(
    `Audit branches and AG inspection teams regularly test establishment files for rule citation, competent authority, and register entries. The objections below appear often in AP health and finance inspections.`
  );
  const audit = def.mistakes.map((m, i) => expandMistake(m, i)).join("\n\n");

  const ddoBlock = para(
    `DDO staff should not treat establishment orders as “only establishment work.” Pay bill impact, recovery schedules, and transfer/pension papers depend on correct dates and proceeding numbers.`,
    def.ddoNotes.join(" ")
  );

  const faqBlock = def.faq
    .slice(0, 4)
    .map(([q, a]) => `**${q}**\n\n${a}`)
    .join("\n\n");

  const sample = def.sample ?? topic.sampleDraft ?? "";
  const srEntry =
    topic.srEntry ??
    `Order issued regarding ${def.title.toLowerCase()} vide Proc.No. ___/Estt/___ dated ___. Entry made in Service Register on same date.`;

  const body = [
    section("Overview", overview),
    section("When does this apply?", `${whenBlock}\n\n${whenList}`),
    section("Applicable rules and legal framework", `${rulesIntro}\n\n${rulesList}`),
    section("Government orders — how to verify", topic.goReferences ?? para(
      `Search GOIR (https://goir.ap.gov.in/) for the latest government orders on ${def.title.toLowerCase()} and your department service rules. Cross-check finance and treasury circulars if pay or recoveries are involved. Never cite a GO number from memory — open the authenticated PDF and quote number and date exactly in your proceeding.`
    )),
    section("Detailed procedure", `${procedureIntro}\n\n${procedureSteps}`),
    section("Documents and registers you must maintain", `${documentsIntro}\n\n${documentsTable}`),
    section("Practical example — AP hospital office", scenario),
    section("Pre-signature checklist", `${checklistIntro}\n\n${checklist}`),
    section("Sample draft format", sample),
    section("Service Register entry", srEntry),
    section("Common audit objections and how to avoid them", `${auditIntro}\n\n${audit}`),
    section("Notes for DDO and finance sections", ddoBlock),
    section("Frequently asked questions", faqBlock),
    section(
      "References and official sources",
      `- [GOIR — Government Orders](https://goir.ap.gov.in/)\n- [AP Finance Department](https://www.apfinance.ap.gov.in/)\n- [AP Treasury / CFMS](https://treasury.ap.gov.in/)\n- [AP Health Department](https://health.ap.gov.in/)\n\n*OfficeMitra original guidance — verify all GO numbers on official portals before acting.*`
    ),
    section("తెలుగు సారాంశం", `${def.telugu}\n\n**ముఖ్య చర్యలు:** (1) Papers verify (2) GOIR లో rule confirm (3) Proceedings draft (4) SR entry same day (5) DDO కు intimation if pay impact.`),
  ].join("");

  return { body, wordCount: wc(body), title, category };
}

export function buildPlainLanguageBlock(title, summary) {
  const oneLine = (summary || title).split(/[.!]/)[0].trim();
  return `## Plain language — start here

**Who is this for?** Junior assistants, superintendents, and DDO staff in AP government offices — written in full sentences so anyone can follow.

**In one sentence:** ${oneLine}.

**Reading time:** About 5–8 minutes (500–1000 words). Skim the overview, then use the checklist before signing any proceeding.

> Verify every GO/circular number on [GOIR](https://goir.ap.gov.in/) before acting. OfficeMitra guidance only — not an official government order.

`;
}

export function extractHeroImage(content) {
  const m = content.match(/^!\[[^\]]*\]\([^)]+\)\s*\n+/m);
  return m ? m[0] : null;
}

export function extractPlainLanguageBlock(content) {
  const m = content.match(/## Plain language — start here[\s\S]*?(?=\n## |\n!\[|$)/);
  return m ? m[0].trim() + "\n\n" : null;
}
