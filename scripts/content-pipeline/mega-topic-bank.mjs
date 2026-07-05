/**
 * 120 unique AP ministerial/DDO topics — programmatic, no duplicate slugs.
 */
const CATEGORIES = [
  "establishment",
  "finance",
  "leave",
  "apgli",
  "gpf",
  "treasury",
  "health",
  "conduct",
  "service-rules",
];

const SUBJECTS = [
  { base: "probation-declaration", title: "Probation Declaration", cat: "establishment" },
  { base: "transfer-relieving", title: "Transfer Relieving", cat: "establishment" },
  { base: "transfer-joining", title: "Transfer Joining", cat: "establishment" },
  { base: "service-register", title: "Service Register Maintenance", cat: "establishment" },
  { base: "bcr-attendance", title: "BCR Attendance", cat: "establishment" },
  { base: "lpc-preparation", title: "LPC Preparation", cat: "establishment" },
  { base: "ndc-certificate", title: "Non-Drawal Certificate", cat: "finance" },
  { base: "noc-passport", title: "NOC for Passport", cat: "establishment" },
  { base: "certificate-attestation", title: "Certificate Attestation", cat: "establishment" },
  { base: "charge-memo", title: "Charge Memo", cat: "conduct" },
  { base: "vigilance-clearance", title: "Vigilance Clearance", cat: "establishment" },
  { base: "macp-benefit", title: "MACP Benefit", cat: "finance" },
  { base: "aas-stagnation", title: "AAS Stagnation Increment", cat: "finance" },
  { base: "annual-increment", title: "Annual Increment", cat: "finance" },
  { base: "pay-fixation-promotion", title: "Pay Fixation on Promotion", cat: "finance" },
  { base: "prc-2022-fixation", title: "PRC 2022 Pay Fixation", cat: "finance" },
  { base: "da-arrears", title: "DA Arrears", cat: "finance" },
  { base: "festival-advance", title: "Festival Advance", cat: "finance" },
  { base: "ddo-it-declaration", title: "DDO IT Declaration", cat: "finance" },
  { base: "form-12bb", title: "Form 12BB Investment Proof", cat: "finance" },
  { base: "tds-24q", title: "TDS Form 24Q", cat: "finance" },
  { base: "cfms-pay-bill", title: "CFMS Pay Bill", cat: "treasury" },
  { base: "supplementary-bill", title: "Supplementary Bill", cat: "treasury" },
  { base: "leave-salary-bill", title: "Leave Salary Bill", cat: "treasury" },
  { base: "treasury-rejection", title: "Treasury Bill Rejection", cat: "treasury" },
  { base: "earned-leave", title: "Earned Leave Account", cat: "leave" },
  { base: "hpl-sanction", title: "Half Pay Leave", cat: "leave" },
  { base: "maternity-leave", title: "Maternity Leave", cat: "leave" },
  { base: "el-encashment", title: "EL Encashment", cat: "leave" },
  { base: "ccl-rules", title: "Child Care Leave", cat: "leave" },
  { base: "leave-accrual", title: "Leave Accrual", cat: "leave" },
  { base: "gpf-advance", title: "GPF Advance", cat: "gpf" },
  { base: "gpf-final-payment", title: "GPF Final Payment", cat: "gpf" },
  { base: "gpf-subscription", title: "GPF Subscription", cat: "gpf" },
  { base: "apgli-loan", title: "APGLI Loan", cat: "apgli" },
  { base: "apgli-closure", title: "APGLI Closure", cat: "apgli" },
  { base: "apgli-premium", title: "APGLI Premium", cat: "apgli" },
  { base: "pension-proposal", title: "Pension Proposal", cat: "finance" },
  { base: "rbps-retirement", title: "RBPS Retirement Benefits", cat: "finance" },
  { base: "medical-reimbursement", title: "Medical Reimbursement", cat: "health" },
  { base: "ehs-referral", title: "EHS Referral", cat: "health" },
  { base: "hra-claim", title: "HRA Claim", cat: "finance" },
  { base: "conveyance-allowance", title: "Conveyance Allowance", cat: "finance" },
  { base: "tuition-fee-reimbursement", title: "Tuition Fee Reimbursement", cat: "finance" },
  { base: "gis-final-payment", title: "GIS Final Payment", cat: "finance" },
  { base: "rule-28-relinquishment", title: "Rule 28 Relinquishment", cat: "service-rules" },
  { base: "promotion-seniority", title: "Promotion Seniority", cat: "establishment" },
  { base: "acr-maintenance", title: "ACR Maintenance", cat: "establishment" },
  { base: "suspension-proceedings", title: "Suspension Proceedings", cat: "conduct" },
  { base: "retirement-proceedings", title: "Retirement Proceedings", cat: "establishment" },
];

const ANGLES = [
  { suffix: "office-guide", titleSuffix: "Office Guide", te: "కార్యాలయ మార్గదర్శి" },
  { suffix: "ddo-checklist", titleSuffix: "DDO Checklist", te: "DDO చెక్‌లిస్ట్" },
  { suffix: "step-by-step", titleSuffix: "Step-by-Step", te: "దశలవారీ" },
  { suffix: "common-mistakes", titleSuffix: "Common Mistakes", te: "సాధారణ తప్పులు" },
  { suffix: "audit-ready", titleSuffix: "Audit-Ready Tips", te: "ఆడిట్ సిద్ధత" },
  { suffix: "cfms-workflow", titleSuffix: "CFMS Workflow", te: "CFMS workflow" },
];

export function buildTopicBank(target = 120) {
  const topics = [];
  const seen = new Set();

  for (const sub of SUBJECTS) {
    for (const angle of ANGLES) {
      if (topics.length >= target) break;
      const slug = `${sub.base}-${angle.suffix}`;
      if (seen.has(slug)) continue;
      seen.add(slug);
      topics.push({
        slug,
        title: `${sub.title} — ${angle.titleSuffix}`,
        category: sub.cat,
        summary: `Original OfficeMitra guide: ${sub.title.toLowerCase()} for AP ministerial and DDO staff (${angle.titleSuffix.toLowerCase()}).`,
        telugu_summary: `${sub.title} — ${angle.te}. AP ministerial staff కోసం OfficeMitra మార్గదర్శి.`,
        tags: [sub.base.split("-")[0], sub.cat, "ap-government"],
      });
    }
    if (topics.length >= target) break;
  }

  // Pad with numbered variants if needed
  let n = 1;
  while (topics.length < target) {
    const sub = SUBJECTS[n % SUBJECTS.length];
    const slug = `${sub.base}-reference-${n}`;
    if (!seen.has(slug)) {
      seen.add(slug);
      topics.push({
        slug,
        title: `${sub.title} — Reference Notes ${n}`,
        category: sub.cat,
        summary: `Reference notes on ${sub.title.toLowerCase()} for establishment and finance sections.`,
        telugu_summary: `${sub.title} సంబంధిత సూచనలు.`,
        tags: [sub.cat, "reference"],
      });
    }
    n++;
  }

  return topics.slice(0, target);
}

export { CATEGORIES, SUBJECTS, ANGLES };
