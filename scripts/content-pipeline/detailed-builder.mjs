/**
 * Detailed OfficeMitra content — beginner to advanced, not one-line summaries.
 */

function subjectFromTitle(title) {
  return title.split("—")[0].split("–")[0].trim();
}

function angleFromTitle(title) {
  const parts = title.split("—");
  return parts.length > 1 ? parts.slice(1).join("—").trim() : "Complete office guide";
}

const OFFICIAL_LINKS = `- [GOIR — Government Orders](https://goir.ap.gov.in/)
- [AP Finance Department](https://www.apfinance.ap.gov.in/)
- [AP Treasury / CFMS](https://treasury.ap.gov.in/)
- [AP Health Department](https://health.ap.gov.in/)`;

export function buildDetailedSummary(topic) {
  const s = subjectFromTitle(topic.title);
  const angle = angleFromTitle(topic.title);
  return `Comprehensive OfficeMitra guide on ${s.toLowerCase()} for AP government ministerial staff, DDO sections, and establishment officers. Covers ${angle.toLowerCase()} — from first-day basics through advanced CFMS/treasury compliance, with checklists, examples, and audit-safe practice. Always verify the latest GO on GOIR before acting.`;
}

export function buildDetailedTeluguSummary(topic) {
  const s = subjectFromTitle(topic.title);
  return `${s} — AP ప్రభుత్వ ఉద్యోగులు, DDO మరియు establishment staff కోసం పూర్తి OfficeMitra మార్గదర్శి. ప్రారంభ స్థాయి నుండి advanced CFMS/treasury వరకు. GOIR లో latest GO verify చేయండి.`;
}

export function buildDetailedArticleBody(topic) {
  const s = subjectFromTitle(topic.title);
  const angle = angleFromTitle(topic.title);
  const cat = topic.category?.replace(/-/g, " ") ?? "administration";

  return `> **OfficeMitra comprehensive guide** — written for **beginner → advanced** AP government staff. Not a one-line summary; use this as your office reference.

## Who should read this

| Level | Reader | What you will learn |
|-------|--------|---------------------|
| **Beginner** | Junior Assistant, newly posted ministerial staff | What ${s.toLowerCase()} means, when it applies, and which papers to collect first |
| **Intermediate** | Superintendent, Section Head, Establishment staff | How to draft proceedings, verify rules, and update registers correctly |
| **Advanced** | DDO, Finance section, Institution Head | CFMS/treasury impact, audit points, delegation, and timeline compliance |

---

## Overview

**${s}** is a routine but audit-sensitive function in AP ${cat} work. This guide explains **${angle.toLowerCase()}** in plain language so that any ministerial employee can follow the workflow — while giving DDO-level detail where pay, treasury, or vigilance clearance matters.

Many offices lose time because staff treat this as "just a formality." In practice, incomplete papers cause **bill rejections**, **transfer delays**, **pension hold-ups**, or **audit objections** years later. This article walks you from the first paper on your desk to the final register entry.

**Key principle:** OfficeMitra does not reproduce government orders. Read the official GO/circular on GOIR, then use this guide to organise your office work.

---

## Applicable rules and references

Before you start, identify which rules apply to your employee category (direct recruit, promotion, transfer, retirement, etc.):

- **AP State & Subordinate Service Rules, 1996** — service matters, probation, transfer
- **Fundamental Rules & Supplementary Rules** — where cited in your institution's manual
- **Finance Department / Treasury instructions** — pay, bills, recoveries
- **Department-specific rules** (e.g. Medical & Health service rules for hospital staff)
- **Latest GOs and circulars** — search on [GOIR](https://goir.ap.gov.in/) using keywords related to ${s.toLowerCase()}

Note the **GO number, date, and effective date** on every order you implement. File a certified copy in the subject file.

---

## Complete step-by-step procedure

1. **Open a subject file** — Assign a file number; note date of receipt of application/order.
2. **Identify the employee and post** — Verify emp ID, designation, scale, and institution from service book / CFMS master.
3. **Check eligibility** — Confirm service period, category rules, and any bar (suspension, vigilance, pending dues).
4. **Collect mandatory documents** — Appointment/transfer orders, leave account, pay particulars, previous sanctions (list below).
5. **Verify rule position** — Read applicable GO; if unclear, seek Head of Office guidance before drafting.
6. **Prepare draft proceedings** — Use institution format; cite rules and previous orders; avoid vague language.
7. **Route for approval** — Send to competent authority as per delegation; attach note if policy decision needed.
8. **Issue signed order** — Use proceeding number and date; keep authenticated office copy.
9. **Update Service Register** — Enter order number, date, and effect; initial and date the entry.
10. **Update BCR / attendance** if leave or joining/relieving involved.
11. **Intimate DDO / finance** — For pay, recovery, or bill changes; attach copy of order.
12. **CFMS / treasury action** — Where bills or supplementary bills are required, follow DDO timeline.
13. **Acknowledge employee** — Where required, obtain receipt on copy of order.
14. **Close file** — Index for audit; link to related transfer/pension/AG files if applicable.

---

## Practical example (AP institution)

*Smt. Lakshmi, Superintendent at a District Hospital, receives papers for **${s.toLowerCase()}** regarding Sri Venkatesh, Senior Assistant, emp. ID 123456.*

She verifies: (1) joining date and category from appointment order, (2) no pending charge memo, (3) leave account up to date, (4) DDO last pay certificate if transfer-related. She drafts proceedings citing the correct rule, routes to the Superintendent / Medical Superintendent for signature, makes SR entry the same day, and sends a copy to the DDO with a covering note. The DDO updates CFMS before the monthly pay bill cutoff. **Result:** no arrears dispute, no audit query on missing SR entry.

---

## Documents and registers

| Document / register | Why it matters |
|---------------------|----------------|
| Appointment / transfer / promotion orders | Proves authority and effective dates |
| Service Register (SR) | Permanent record — audit always checks this first |
| Service book / history of service | Used for pension and MACP |
| Leave account | Must match BCR and sanction orders |
| Pay particulars / LPC | Treasury needs accurate last pay data |
| Vigilance / clearance | Required for pension, MACP, passport NOC |
| Subject file with GO copies | Shows rule basis for your order |

---

## Checklist (before you close)

- [ ] Latest GO/circular verified on GOIR
- [ ] Employee identity and post verified in CFMS master
- [ ] All supporting orders on file
- [ ] Eligibility confirmed (service period, category, no penalty bar)
- [ ] Draft proceedings checked for rule citation and dates
- [ ] Competent authority signature obtained
- [ ] SR entry made on date of order (not back-dated without authority)
- [ ] BCR updated if attendance/leave affected
- [ ] DDO informed for pay/recovery impact
- [ ] Employee copy issued / acknowledged where required
- [ ] File indexed for audit inspection

---

## Common mistakes and audit objections

1. **Order issued without rule citation** — Audit treats as irregular sanction.
2. **SR entry omitted or post-dated** — Seniority and pension disputes follow.
3. **Wrong competent authority** — Order may be void; must be re-issued.
4. **Leave account not reconciled with BCR** — Pay bill rejection in CFMS.
5. **Pending recoveries ignored** — NDC/transfer/pension blocked.
6. **Old GO relied upon** — Must check superseding orders on GOIR.
7. **Photocopy filed without verification** — Insist on authenticated copies for SR.

---

## Beginner tips

- Read the **appointment order and SR** before writing anything.
- Ask your Superintendent which **GO file** the institution follows for this subject.
- Never guess pay or leave figures — take from **LPC / leave account**.
- Keep a **personal rough notebook** of proceeding numbers you process (helps at month-end).

---

## Advanced notes (DDO / Head of Office)

- Align institution orders with **CFMS bill cycle** — late intimation causes supplementary bills.
- For transfers, ensure **LPC and NDC** chain is complete before joining is regularised at new station.
- Watch **vigilance and APGLI/GPF** clearance for retirement and MACP cases.
- Quarterly review: list pending **${s.toLowerCase()}** cases and ageing.

---

## Frequently asked questions

**When should a junior assistant escalate to the Superintendent?**  
Whenever rule position is unclear, vigilance is involved, or the case affects pay/retirement. Escalate with a short office note, not verbal instructions only.

**Can we process without the latest GO?**  
No. Search GOIR first. If GO is ambiguous, hold the case and seek legal/administration section guidance.

**What if CFMS master data is wrong?**  
Correct master through DDO **before** sanctioning; otherwise treasury rejects the bill.

**How long should files be preserved?**  
As per record retention rules; pension and service-related files are permanent value — never destroy casually.

**Is this legal advice?**  
No. OfficeMitra is administrative guidance. Official GOs and your controlling officer are final.

---

## Official document links

${OFFICIAL_LINKS}

---

## తెలుగు మార్గదర్శి (Telugu guide)

### అవలోకనం

**${s}** — AP ${cat} పనిలో ముఖ్యమైన ప్రక్రియ. Junior Assistant నుండి DDO వరకు అందరికీ అవసరమైన వివరాలు ఇక్కడ ఉన్నాయి. అధికారిక GO ను GOIR లో తప్పక verify చేయండి.

### ప్రాథమిక దశలు

1. Subject file తెరవండి  
2. Employee వివరాలు, appointment order verify  
3. అర్హత, vigilance, dues check  
4. Proceedings draft → competent authority approval  
5. Service Register entry  
6. DDO / CFMS కు intimation  

### పదవీ ఉద్యోగులకు సూచన

- SR entry మిస్ చేయవద్దు — audit లో మొదట ఇదే చూస్తారు  
- GO number, date note చేయండి  
- Pay/leave figures guess చేయవద్దు  

### Official links

GOIR: https://goir.ap.gov.in/ | AP Finance: https://www.apfinance.ap.gov.in/
`;
}

export function buildDetailedProcedureBody(topic) {
  const s = subjectFromTitle(topic.title);
  const steps = [
    [`Verify scope and papers`, `Open subject file for **${s}**. List employee name, ID, designation, and date of application. Cross-check with service book and CFMS employee master. **Beginner:** photocopy all pages; **Advanced:** flag master mismatches to DDO before sanction.`],
    [`Confirm eligibility and rule position`, `Search GOIR for current GOs on ${s.toLowerCase()}. Read delegation orders — who can sign? Note effective dates. If employee is under suspension or vigilance, stop and seek HO advice.`],
    [`Collect supporting documents`, `Gather appointment/transfer orders, leave account statement, pay slip or LPC, previous sanctions, medical/referral papers if applicable. Prepare a checklist tick-sheet for file cover.`],
    [`Draft proceedings`, `Use institution template. Cite rule and GO. State facts clearly: who, what, with effect from which date. Avoid blank "as per rules" without citation.`],
    [`Internal review`, `Senior Assistant or Superintendent reviews draft for arithmetic dates, spellings, and rule numbers. Compare with similar past proceedings in file.`],
    [`Competent authority approval`, `Route through Head of Office. Attach note if policy or exception involved. Obtain signature and seal.`],
    [`Issue and communicate`, `Allot proceeding number. Issue copies to employee, DDO, and concerned sections. Obtain acknowledgement if institution practice requires.`],
    [`Update Service Register and BCR`, `Enter order verbatim reference in SR on date of order. Mark BCR if leave/joining/relieving. Initial and date entries.`],
    [`Finance and CFMS`, `Send intimation to DDO with copy of order. Ensure pay bill, recovery, or supplementary bill reflects change before cutoff.`],
    [`Close and audit-ready file`, `Index papers. Link related files (transfer/pension). Keep GO copy authenticated. Ready for internal audit or AG inspection.`],
  ];

  let body = `> **Detailed procedure** — ${s}. Follow in order. See related knowledge article for full context.\n\n`;
  steps.forEach(([title, content], i) => {
    body += `## Step ${i + 1}: ${title}\n\n${content}\n\n`;
  });

  body += `## Telugu summary / తెలుగు సారాంశం\n\n${s} — పై 10 steps అనుసరించండి. SR entry మరియు DDO intimation తప్పనిసరి. GOIR లో verify చేయండి.\n`;

  return body;
}

export function buildDetailedFaqAnswer(question, category) {
  return `${question.replace(/\?$/, "")} — this depends on your category rules and latest GOs on GOIR. In general: (1) verify papers and service status first, (2) cite the correct rule in proceedings, (3) update Service Register the same day as the order, (4) inform DDO for any pay impact. Beginners should route unclear cases to the Superintendent; DDO staff should confirm CFMS master before closing. OfficeMitra guides explain workflow — your controlling officer and official GOs are final. Category: ${category}.`;
}

export function buildDetailedFaqAnswerTe(question) {
  return `${question} — మీ category rules మరియు GOIR లో latest GO ప్రకారం procedure follow చేయండి. Papers verify, SR update, DDO intimation తప్పనిసరి. స్పష్టత లేకపోతే Superintendent / HO guidance తీసుకోండి.`;
}

export function buildDetailedGlossaryDefinition(term, category) {
  return `**${term}** is a term used in Andhra Pradesh government administration (${category}). It appears in establishment, finance, treasury, and service records. Staff should understand it in context of GOs on GOIR, CFMS pay bills, and Service Register entries. When processing related cases, verify the latest circular from Finance or GAD — definitions and procedures may be updated by GO. OfficeMitra uses this term in guides for ministerial and DDO workflows; always cross-check with your institution's manual and controlling officer.`;
}

export function buildDetailedGlossaryDefinitionTe(term) {
  return `**${term}** — AP ప్రభుత్వ administration లో ఉపయోగించే పదం. Establishment, finance, treasury records లో చూస్తారు. GOIR లో latest instructions verify చేయండి.`;
}

export function buildDetailedUpdateBody(topic) {
  return buildDetailedArticleBody(topic) + `\n\n---\n\n## What changed (summary for updates feed)\n\nOfficeMitra published an expanded guide on **${subjectFromTitle(topic.title)}** with beginner-to-advanced detail. Review if your institution procedures need updating.\n`;
}
