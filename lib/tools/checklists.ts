/** OfficeMitra original web tools — inspired by common AP office workflows (not copied Excel). */

export interface ChecklistItem {
  id: string;
  en: string;
  te: string;
}

export interface ChecklistTool {
  slug: string;
  title: string;
  subtitle: string;
  note?: string;
  items: ChecklistItem[];
  category: "finance" | "establishment" | "leave" | "treasury" | "apgli" | "gpf";
}

export const checklistTools: ChecklistTool[] = [
  {
    slug: "tds-form-24q",
    title: "TDS Form 24Q Checklist",
    subtitle: "Quarterly TDS return preparation for DDOs (FY 2025-26)",
    category: "finance",
    items: [
      { id: "1", en: "Collect Form 16 from all deductees", te: "Form 16 సేకరించండి" },
      { id: "2", en: "Verify PAN and challan details", te: "PAN/challan verify" },
      { id: "3", en: "Prepare Form 24Q in RPU utility", te: "RPU లో 24Q" },
      { id: "4", en: "Validate .fvu file before upload", te: ".fvu validate" },
      { id: "5", en: "Submit on TRACES before due date", te: "TRACES submit" },
    ],
  },
  {
    slug: "income-tax-declaration",
    title: "Income Tax Declaration Checklist",
    subtitle: "Employee investment proof collection — AP FY 2025-26",
    category: "finance",
    items: [
      { id: "1", en: "Form 12BB from each employee", te: "Form 12BB" },
      { id: "2", en: "80C, 80D proofs verified", te: "80C/80D proofs" },
      { id: "3", en: "HRA rent receipts if claimed", te: "HRA receipts" },
      { id: "4", en: "Regime (old/new) confirmed in writing", te: "Tax regime confirm" },
      { id: "5", en: "DDO consolidated file for CFMS", te: "CFMS file" },
    ],
  },
  {
    slug: "gpf-loan-proposal",
    title: "GPF Loan Proposal Checklist",
    subtitle: "GPF advance/loan proposal set for treasury",
    category: "gpf",
    items: [
      { id: "1", en: "Verify GPF balance and purpose", te: "Balance/purpose" },
      { id: "2", en: "Application with employee signature", te: "Application" },
      { id: "3", en: "Sanction proceedings drafted", te: "Proceedings" },
      { id: "4", en: "Recovery schedule in pay bill", te: "Recovery schedule" },
      { id: "5", en: "Update GPF ledger", te: "Ledger update" },
    ],
  },
  {
    slug: "apgli-loan-closure",
    title: "APGLI Loan & Closure Checklist",
    subtitle: "APGLI loan proposal or retirement closure",
    category: "apgli",
    items: [
      { id: "1", en: "Policy number and premium status", te: "Policy/premium" },
      { id: "2", en: "Surety details for loan", te: "Surety" },
      { id: "3", en: "Proposal routed via DDO", te: "DDO route" },
      { id: "4", en: "Closure: retirement/death papers", te: "Closure papers" },
      { id: "5", en: "Track APGLI office sanction", te: "Sanction track" },
    ],
  },
  {
    slug: "pay-fixation-fr22",
    title: "Pay Fixation FR 22 Checklist",
    subtitle: "Promotion pay fixation option and orders",
    category: "finance",
    items: [
      { id: "1", en: "Promotion order with effective date", te: "Promotion order" },
      { id: "2", en: "Explain FR 22(a)(i) vs 22(b)", te: "FR 22 options" },
      { id: "3", en: "Written option letter from employee", te: "Option letter" },
      { id: "4", en: "Calculate fixation and DNI", te: "Fixation calc" },
      { id: "5", en: "SR entry and DDO intimation", te: "SR/DDO" },
    ],
  },
  {
    slug: "pension-proposal-set",
    title: "Pension Proposal Checklist",
    subtitle: "Retirement pension papers for AG/sanctioning authority",
    category: "finance",
    items: [
      { id: "1", en: "Service book and SR complete", te: "SB/SR" },
      { id: "2", en: "Qualifying service verified", te: "QS verify" },
      { id: "3", en: "Form 5 and pension forms", te: "Form 5" },
      { id: "4", en: "Vigilance and dues clearance", te: "Clearance" },
      { id: "5", en: "RBPS/NIDHI upload if applicable", te: "RBPS upload" },
    ],
  },
  {
    slug: "rbps-nidhi",
    title: "RBPS / NIDHI Retirement Checklist",
    subtitle: "Retirement Benefits Processing System workflow",
    category: "finance",
    items: [
      { id: "1", en: "Retirement date and LPC ready", te: "LPC ready" },
      { id: "2", en: "Upload documents to NIDHI", te: "NIDHI upload" },
      { id: "3", en: "Track DTA verification stages", te: "DTA track" },
      { id: "4", en: "Pension papers linked", te: "Pension link" },
      { id: "5", en: "Settlement intimation to retiree", te: "Intimation" },
    ],
  },
  {
    slug: "leave-proceedings",
    title: "Leave Proceedings Checklist",
    subtitle: "EOL, HPL, ML, CCL sanction proceedings",
    category: "leave",
    items: [
      { id: "1", en: "Application with supporting certificate", te: "Application" },
      { id: "2", en: "Leave balance verified", te: "Balance" },
      { id: "3", en: "Rule citation in sanction order", te: "Rule cite" },
      { id: "4", en: "Leave account updated", te: "LA update" },
      { id: "5", en: "BCR marked for period", te: "BCR mark" },
    ],
  },
  {
    slug: "agi-proceedings",
    title: "Annual Grade Increment Checklist",
    subtitle: "AGI proceedings and pay bill update",
    category: "finance",
    items: [
      { id: "1", en: "List due for AGI this month", te: "Due list" },
      { id: "2", en: "No penalty/stoppage orders", te: "No penalty" },
      { id: "3", en: "Proceedings with new basic pay", te: "Proceedings" },
      { id: "4", en: "SR updated", te: "SR" },
      { id: "5", en: "CFMS pay bill reflects increment", te: "CFMS" },
    ],
  },
  {
    slug: "supplementary-arrears",
    title: "Supplementary / Arrears Bill Checklist",
    subtitle: "DA or pay arrears supplementary bill in CFMS",
    category: "treasury",
    items: [
      { id: "1", en: "Identify affected period and employees", te: "Period/list" },
      { id: "2", en: "GO reference attached", te: "GO ref" },
      { id: "3", en: "Calculation sheet on file", te: "Calc sheet" },
      { id: "4", en: "Supplementary bill in CFMS", te: "CFMS bill" },
      { id: "5", en: "Track treasury pass", te: "Pass track" },
    ],
  },
  {
    slug: "lpc-transfer",
    title: "LPC Before Transfer Checklist",
    subtitle: "Last Pay Certificate when employee is relieved",
    category: "establishment",
    items: [
      { id: "1", en: "Leave account closed to relieving date", te: "LA close" },
      { id: "2", en: "Pay and recoveries reconciled", te: "Reconcile" },
      { id: "3", en: "LPC in treasury format", te: "LPC format" },
      { id: "4", en: "Treasury/DDO signatures", te: "Signatures" },
      { id: "5", en: "Handover with relieving order", te: "Handover" },
    ],
  },
  {
    slug: "festival-advance",
    title: "Festival Advance Checklist",
    subtitle: "Sanction and recovery schedule",
    category: "finance",
    items: [
      { id: "1", en: "Eligibility and max amount verified", te: "Eligibility" },
      { id: "2", en: "No outstanding festival advance", te: "No outstanding" },
      { id: "3", en: "Sanction order issued", te: "Sanction" },
      { id: "4", en: "Recovery in 10 installments", te: "Recovery" },
      { id: "5", en: "Close advance on full recovery", te: "Close" },
    ],
  },
  {
    slug: "macp-sanction",
    title: "MACP Sanction Checklist",
    subtitle: "Modified Assured Career Progression benefit",
    category: "finance",
    items: [
      { id: "1", en: "Years in grade completed", te: "Years verify" },
      { id: "2", en: "Vigilance clearance obtained", te: "Vigilance" },
      { id: "3", en: "MACP proceedings drafted", te: "Proceedings" },
      { id: "4", en: "Pay fixed in next grade pay", te: "Pay fix" },
      { id: "5", en: "SR and pay bill updated", te: "Update" },
    ],
  },
  {
    slug: "nominal-roll",
    title: "Nominal Roll Preparation Checklist",
    subtitle: "Pay bill nominal roll verification",
    category: "treasury",
    items: [
      { id: "1", en: "Employee master matches CFMS", te: "Master match" },
      { id: "2", en: "Designation and scale correct", te: "Scale" },
      { id: "3", en: "Leave without pay reflected", te: "LWP" },
      { id: "4", en: "New joinings/relievings updated", te: "Join/relieve" },
      { id: "5", en: "Cross-check with BCR", te: "BCR cross" },
    ],
  },
  {
    slug: "medical-reimbursement-set",
    title: "Medical Reimbursement Checklist",
    subtitle: "In-service medical reimbursement proposal",
    category: "establishment",
    items: [
      { id: "1", en: "Bills, prescriptions, referral", te: "Bills/referral" },
      { id: "2", en: "EHS/CGHS eligibility checked", te: "Eligibility" },
      { id: "3", en: "Reimbursement bill set prepared", te: "Bill set" },
      { id: "4", en: "Medical officer certificate if req.", te: "MO cert" },
      { id: "5", en: "Submit to treasury", te: "Treasury" },
    ],
  },
];

export function getChecklistBySlug(slug: string) {
  return checklistTools.find((c) => c.slug === slug);
}
