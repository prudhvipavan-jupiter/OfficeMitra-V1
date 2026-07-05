/**
 * Topic-specific expertise for AP government content — not generic templates.
 * Inspired by lib/intelligence/briefing-content.ts quality bar.
 */
import { SUBJECTS } from "./mega-topic-bank.mjs";

const HAND_CRAFTED = {
  "probation-declaration": {
    definition:
      "Probation declaration is the competent authority's order confirming that a direct recruit has satisfactorily completed the prescribed probation period (generally two years under FR 9). Until probation is declared, confirmation, regular increment, and certain benefits may remain incomplete.",
    when: [
      "Direct recruit completes two years from date of joining",
      "Before confirmation increment or regularisation of service",
      "When audit queries missing probation orders",
      "Before promotion to next stage where confirmed service is required",
    ],
    rules: [
      "Fundamental Rule 9 (Probation)",
      "AP State & Subordinate Service Rules, 1996",
      "Department service rules (e.g. Medical & Health)",
      "ACR / performance appraisal instructions",
    ],
    documents: [
      ["Appointment order & joining report", "Establishes start of probation"],
      ["ACRs for each probation year", "Proof of satisfactory performance"],
      ["Leave account", "No unauthorised absence during probation"],
      ["Vigilance / disciplinary clearance", "No pending charge memo"],
      ["Service Register", "Permanent record of declaration"],
    ],
    steps: [
      "List employees completing probation this quarter from joining dates",
      "Verify appointment order — note category, scale, and date of joining",
      "Calculate probation end date (usually 2 years from joining for direct recruits)",
      "Collect ACRs for full probation period; scrutinise ratings",
      "Confirm no suspension, charge memo, or vigilance enquiry pending",
      "Draft proceedings citing FR 9, appointment order, and ACR summary",
      "Route draft to Superintendent / competent authority",
      "Obtain signed order with proceeding number and effective date",
      "Make Service Register entry on date of order — quote proc number verbatim",
      "Update service book and personal file",
      "Intimate DDO if pay fixation or increment is due on confirmation",
      "File authenticated copy in establishment guard file",
    ],
    mistakes: [
      "Declaring probation before completion of prescribed period",
      "Proceeding issued without ACR scrutiny",
      "Declaration while disciplinary case pending",
      "SR entry omitted or back-dated without authority",
      "Wrong competent authority signing confirmation order",
      "Probation declared but DDO not informed for pay bill update",
    ],
    ddoNotes: [
      "After confirmation, verify increment due date in CFMS master",
      "Update pay if confirmation triggers scale change",
      "Cross-check probation order date with increment schedule",
    ],
    faq: [
      ["How long is probation for direct recruits?", "Generally two years from date of joining under FR 9 and AP Service Rules — verify category-specific rules on GOIR."],
      ["Can probation be extended?", "Yes, if rules permit and ACRs are unsatisfactory — requires specific extension order citing rules."],
      ["Who signs probation declaration?", "Competent authority as per delegation — usually Head of Office / Superintendent for hospital staff."],
      ["Is ACR mandatory?", "Yes — audit expects ACRs for each year of probation before declaration."],
    ],
    sample:
      "**Sub:** Establishment — Probation — Declaration — Orders.\n\n**Ref:** Appointment order dated ___; Joining report dated ___.\n\nSri/Smt. ___ joined as ___ on ___. Completed probation satisfactorily. ACRs scrutinised. No disciplinary proceedings pending.\n\n**Therefore,** probation is declared with effect from ___.\n\nSd/- Competent Authority",
    telugu:
      "Probation declaration — direct recruit రెండు సంవత్సరాల probation పూర్తి చేసిన తర్వాత competent authority order. FR 9 మరియు ACR scrutiny తప్పనిసరి. SR entry same day.",
  },
  "ndc-certificate": {
    definition:
      "A Non-Drawal Certificate (NDC) certifies that no salary has been drawn beyond a specified date and that recoveries/advances are cleared or arranged. DDOs issue NDC when an employee is transferred out, retires, or when treasury requires pay clearance.",
    when: [
      "Transfer to another institution / DDO",
      "Retirement and pension processing",
      "Reimbursement bills requiring last-pay confirmation",
      "Treasury objection on pending recoveries",
    ],
    rules: [
      "Fundamental Rules on pay and drawal of salary",
      "Treasury / CFMS instructions on NDC format",
      "AP Financial Code provisions on recoveries",
      "Department-specific transfer and pension rules",
    ],
    documents: [
      ["Last pay certificate (LPC)", "Shows last drawn pay and recoveries"],
      ["Recovery statements (GPF/APGLI/festival advance)", "Proves clearance or schedule"],
      ["Leave account", "No unadjusted leave affecting pay"],
      ["Transfer / retirement order", "Trigger for NDC"],
      ["CFMS employee master print", "Verify ID and DDO code"],
    ],
    steps: [
      "Receive transfer/retirement order or employee request for NDC",
      "Verify all pay bills submitted up to relieving date in CFMS",
      "List outstanding recoveries: GPF, APGLI, festival advance, court attachment, etc.",
      "Ensure recoveries cleared or transfer-of-recovery arranged with receiving DDO",
      "Prepare NDC in prescribed format with 'not drawn after' date",
      "Route to DDO for signature and seal",
      "Issue copies to employee, receiving DDO, and pension section if applicable",
      "Update recovery register and note NDC number in service book",
      "Attach NDC to LPC set for transfer",
      "File office copy in pay bill / establishment file",
    ],
    mistakes: [
      "NDC issued while salary drawn for month after relieving date",
      "Pending festival advance not reflected in NDC",
      "Wrong 'not drawn after' date causing treasury rejection",
      "NDC signed by staff other than DDO",
      "Receiving institution not given NDC copy with LPC",
      "CFMS master not updated before NDC",
    ],
    ddoNotes: [
      "Run CFMS pay bill status report before signing NDC",
      "Coordinate with bill section on supplementary bills",
      "For pension, NDC must align with last pay month in RBPS",
    ],
    faq: [
      ["What is NDC?", "Certificate that salary was not drawn beyond a date and recoveries are settled — issued by DDO."],
      ["Who prepares NDC?", "DDO section with input from establishment; DDO signs."],
      ["Is NDC needed for transfer?", "Yes — receiving DDO usually requires NDC with LPC."],
      ["Can NDC be corrected?", "Issue revised NDC with reference to earlier one if error found before pension/transfer completes."],
    ],
    sample:
      "**NDC Format (indicative):** Certified that Sri/Smt. ___, ___ , was not paid salary for any period after ___ and that all recoveries due up to that date are cleared / arranged.",
    telugu:
      "NDC — DDO జారీ చేసే Non-Drawal Certificate. Transfer/pension కు LPC తో పాటు అవసరం. Recoveries clear చేయకుండా NDC issue చేయవద్దు.",
  },
  "lpc-preparation": {
    definition:
      "Last Pay Certificate (LPC) is a detailed statement of pay, allowances, and recoveries drawn by an employee up to the date of relief. It accompanies transfer orders and is essential for pay fixation at the new station.",
    when: ["Transfer out to another DDO", "Deputation ending", "Retirement (final LPC)", "Death case settlement"],
    rules: ["Fundamental Rules on pay", "Treasury LPC format instructions", "Transfer rules under AP Service Rules"],
    documents: [
      ["Pay slips for last 12 months", "Verify amounts"],
      ["Service Register entries", "Match scale and increments"],
      ["Leave account", "LWP/HPL impact on pay"],
      ["Recovery register", "GPF, APGLI, advances"],
      ["Transfer / relieving order", "Effective date"],
    ],
    steps: [
      "Note relieving date from transfer order",
      "Extract last pay drawn from CFMS pay bill",
      "List all allowances drawn in last month",
      "Compile recoveries with balance outstanding",
      "Calculate total service for increment purposes if needed",
      "Prepare LPC in treasury-prescribed format",
      "Get establishment verification on SR entries",
      "Route to DDO for authentication",
      "Issue to employee with covering letter",
      "Send copy to receiving DDO by due date",
    ],
    mistakes: [
      "LPC pay not matching CFMS bill",
      "Recoveries omitted from LPC schedule",
      "Relieving date mismatch with order",
      "Late LPC causing joining delay at new station",
    ],
    ddoNotes: ["LPC must match CFMS last bill exactly", "Attach NDC when required", "Use online LPC format if mandated"],
    faq: [
      ["Who prepares LPC?", "DDO / pay bill section with establishment verification."],
      ["How many copies?", "Usually 3–4: employee, receiving DDO, office copy, pension if applicable."],
    ],
    sample: "**LPC:** Last pay Rs.___ + DA + HRA; recoveries GPF ___, APGLI ___; relieved on ___.",
    telugu: "LPC — Last Pay Certificate. Transfer కు receiving DDO కు pay fixation కోసం తప్పనిసరి.",
  },
  "earned-leave": {
    definition:
      "Earned Leave (EL) is credited to government servants at prescribed rates (typically 15 days per year, half-yearly) and is subject to maximum accumulation limits under AP Leave Rules.",
    when: ["Half-yearly leave account crediting", "Employee applies for EL", "Audit of leave accounts", "Before EL encashment"],
    rules: ["AP Leave Rules / FR 82-85", "Half-yearly credit instructions", "Maximum accumulation limits"],
    documents: [["Leave account register", "Official record"], ["SR leave entries", "Cross-check"], ["Sanction orders", "Proof of debits"]],
    steps: [
      "Credit EL half-yearly as per rules",
      "Update leave account register",
      "On application, verify EL balance",
      "Check overlapping leave applications",
      "Obtain recommending officer endorsement",
      "Sanction by competent authority",
      "Debit leave account immediately",
      "Update SR and communicate to DDO",
    ],
    mistakes: ["Double credit in same half-year", "Sanction exceeding balance", "Leave account not matching SR"],
    ddoNotes: ["Reflect EL/LWP correctly in pay bills", "No pay for unauthorized absence"],
    faq: [["How is EL calculated?", "Generally 15 days per year credited half-yearly — verify current rules on GOIR."]],
    sample: null,
    telugu: "EL — Earned Leave. Half-yearly credit మరియు leave account maintenance తప్పనిసరి.",
  },
  "transfer-relieving": {
    definition:
      "Transfer relieving is the formal release of an employee from the current institution on the effective date in the transfer order. Until relieving is complete — LPC, NDC, SR entries, and CFMS updates — the employee cannot join the new station.",
    when: ["Inter-institution transfer order received", "Before LPC and NDC issue", "Employee reports for relieving on last working day"],
    rules: ["AP State & Subordinate Service Rules — transfer", "Joining time rules", "CFMS transfer workflow instructions"],
    documents: [
      ["Transfer order", "Relieving date and new station"],
      ["Service Register", "Relieving entry"],
      ["LPC draft", "Pay fixation at new station"],
      ["NDC", "Pay clearance"],
      ["Charge handover memo", "Pending files listed"],
    ],
    steps: [
      "Verify transfer order — note relieving date, new institution, and category",
      "Stop pay bill from relieving month in CFMS after final bill",
      "Prepare LPC with last drawn pay and recoveries",
      "Clear or schedule all recoveries; issue NDC",
      "Make SR entry: 'Relieved on ___ to join as ___ at ___'",
      "Hand over personal file with checklist to employee / receiving section",
      "Send LPC + NDC to receiving DDO within prescribed time",
      "Update BCR and attendance up to last day",
      "File office copy of relieving proceedings",
    ],
    mistakes: ["Relieving before order effective date", "LPC pay mismatch with CFMS", "NDC omitted", "SR entry not on relieving date", "Personal file not handed over"],
    ddoNotes: ["Final supplementary bill if needed before NDC", "Update CFMS employee status to transferred out"],
    faq: [
      ["Can employee be relieved early?", "Only if order permits or HO approves — otherwise wait for effective date."],
      ["What if LPC delayed?", "Receiving institution may refuse joining — prioritize LPC within 15 days of relieving."],
    ],
    sample: "**Sub:** Transfer — Relieving — Orders.\n\nSri/Smt. ___ is relieved from this office with effect from ___ to join ___ at ___. LPC and NDC issued.",
    telugu: "Transfer relieving — employee ను effective date న relieving order issue. LPC, NDC, SR entry తప్పనిసరి.",
  },
  "transfer-joining": {
    definition:
      "Transfer joining is the formal assumption of duty at the new institution after production of transfer order, LPC, and NDC (where required). Pay fixation and seniority at new station start from joining date.",
    when: ["Employee reports after relieving from previous station", "LPC and NDC received from outgoing DDO", "Within joining time under rules"],
    rules: ["Joining time rules (generally 15 days)", "Pay fixation rules on transfer", "AP Service Rules"],
    documents: [
      ["Transfer order", "Authority"],
      ["Relieving order copy", "From previous station"],
      ["LPC", "Pay fixation"],
      ["NDC", "Recovery clearance"],
      ["Joining report", "Employee signature"],
    ],
    steps: [
      "Verify transfer order and joining within joining time",
      "Check LPC and NDC from previous DDO",
      "Inspect personal file and pending papers",
      "Fix pay in CFMS based on LPC",
      "Issue joining proceedings with effective date",
      "Make SR entry at new institution",
      "Open leave account continuation",
      "Intimate bill section for first pay bill",
      "Update employee master in CFMS",
    ],
    mistakes: ["Joining without LPC", "Pay fixed without verifying NDC recoveries", "Joining time exceeded without extension", "SR opened without previous SR extract"],
    ddoNotes: ["First pay bill must reflect LPC pay", "Transfer TA/TC if applicable per rules"],
    faq: [["What if joining time expired?", "Seek extension from competent authority before joining proceedings."]],
    sample: "**Sub:** Transfer — Joining — Orders.\n\nSri/Smt. ___ joined duty on ___ vide transfer order dated ___. Pay fixed as per LPC.",
    telugu: "Transfer joining — LPC తో pay fixation, SR entry, CFMS update. Joining time rules పాటించండి.",
  },
  "service-register": {
    definition:
      "The Service Register (SR) is the permanent record of an employee's service history — appointments, promotions, increments, leave, punishments, and confirmations. Audit treats SR as primary evidence.",
    when: ["Every establishment order", "Monthly BCR reconciliation", "Before audit", "Transfer / retirement"],
    rules: ["SR maintenance instructions", "FR 54 and AP Service Rules", "Audit manual provisions"],
    documents: [["Service Register (bound volume)", "Original"], ["Appointment order", "First entry"], ["All establishment orders", "Chronological entries"]],
    steps: [
      "Open SR on appointment with full particulars",
      "Enter every order on date of order — never back-date without authority",
      "Quote proceeding number verbatim in margin",
      "Cross-check with leave account and pay bills monthly",
      "Superintendent to certify SR quarterly",
      "On transfer, close SR with signature and date",
      "Send authenticated extract to new institution",
    ],
    mistakes: ["Blank SR at audit", "Entries without order reference", "White fluid or overwriting", "Increment not entered", "Probation/confirmation omitted"],
    ddoNotes: ["SR must match CFMS pay — audit compares both", "Missing SR entry is a standing audit objection"],
    faq: [["Who maintains SR?", "Establishment section; Superintendent supervises; Head of Office responsible."], ["Can corrections be made?", "Only by authenticated correction entry citing authority."]],
    sample: "SR margin entry: 'Vide Proc.No. ___ dated ___, probation declared w.e.f. ___.'",
    telugu: "Service Register — ప్రతి establishment order same day entry. Audit లో primary record.",
  },
  "charge-memo": {
    definition:
      "A charge memo (Articles of Charge) is the formal statement of allegations in disciplinary proceedings against a government servant. It must specify charges clearly with rule violations cited.",
    when: ["Misconduct prima facie established", "After preliminary enquiry if required", "Before major/minor penalty proceedings"],
    rules: ["AP Civil Services (CCA) Rules", "Article 311 protections", "Department disciplinary rules"],
    documents: [
      ["Incident report / complaint", "Basis of charge"],
      ["Witness statements", "If collected"],
      ["Draft charge memo", "For legal vetting"],
      ["Delinquent's written statement of defence", "After service"],
    ],
    steps: [
      "Document incident with dates and witnesses",
      "Obtain HO/legal section vetting of draft charges",
      "Cite specific rule/article violated in each charge",
      "Serve charge memo on delinquent with enquiry officer details",
      "Allow prescribed time for written defence",
      "Conduct enquiry if not admitted",
      "Submit findings to disciplinary authority",
      "Issue penalty order if proved",
      "Enter penalty in SR",
    ],
    mistakes: ["Vague charges without dates", "Wrong rule cited", "Service of memo not proved", "Enquiry officer bias not addressed", "Penalty without SR entry"],
    ddoNotes: ["Do not stop pay without specific order", "Coordinate with AG if major penalty"],
    faq: [["Minor vs major penalty?", "Determined by CCA rules and nature of charge — verify on GOIR."]],
    sample: "**Charge No.1:** That on ___, the delinquent ___ failed to ___ thereby violating Rule ___ of ___.",
    telugu: "Charge memo — disciplinary proceedings ప్రారంభం. Clear charges, rule citation, proper service తప్పనిసరి.",
  },
  "cfms-pay-bill": {
    definition:
      "CFMS pay bill is the monthly electronic salary bill submitted by DDO through Comprehensive Financial Management System. All allowances, deductions, and recoveries must match establishment orders.",
    when: ["Monthly before treasury cutoff", "After increment/transfer/promotion orders", "When treasury returns bill"],
    rules: ["CFMS user manual", "Treasury bill submission calendar", "AP Financial Code"],
    documents: [
      ["Employee master in CFMS", "Scale and ID"],
      ["Increment/promotion orders", "Pay changes"],
      ["Recovery schedules", "GPF, APGLI, advances"],
      ["Attendance / LWP data", "For that month"],
    ],
    steps: [
      "Verify employee master before bill generation",
      "Apply increment/promotion effective that month",
      "Enter LWP / EL / HPL correctly",
      "Check recovery codes and amounts",
      "Generate bill and run validation report",
      "DDO approval in CFMS workflow",
      "Submit to treasury before deadline",
      "Track bill status; fix rejections same day",
      "File bill copy in pay register",
    ],
    mistakes: ["Bill after employee relieved", "Wrong scale after promotion", "Recoveries not updated", "Duplicate bill for same month", "Missing DDO digital signature"],
    ddoNotes: ["Rejected bill blocks NDC and pension", "Keep CFMS credentials secure — DDO only approves"],
    faq: [["Bill rejected — what now?", "Read treasury objection, fix in CFMS, resubmit same day if possible."]],
    sample: null,
    telugu: "CFMS pay bill — monthly salary bill. Employee master, recoveries, LWP verify చేసి submit.",
  },
  "annual-increment": {
    definition:
      "Annual increment is the regular addition to basic pay on completion of qualifying service in the scale, usually on 1 July or as per scale rules. Requires increment sanction order and SR entry.",
    when: ["Increment due date in scale", "After probation declared for direct recruits", "Before July pay bill"],
    rules: ["FR 26-27", "Pay scale rules", "Increment withholding during suspension/LWP"],
    documents: [["Increment due statement", "From establishment"], ["SR", "Previous increment entry"], ["LWP/suspension check", "Eligibility"]],
    steps: [
      "Run increment due list from joining/increment dates",
      "Verify no suspension, unauthorized absence, or penalty withholding increment",
      "Draft increment proceedings for batch or individual",
      "Obtain competent authority signature",
      "Update SR with increment date and new basic pay",
      "Update CFMS employee master",
      "Reflect in July (or due month) pay bill",
    ],
    mistakes: ["Increment while on unauthorized absence", "Double increment same year", "CFMS not updated before bill", "SR entry missing"],
    ddoNotes: ["Arrears bill if increment order late", "Cross-check with MACP/AAS dates"],
    faq: [["Increment withheld?", "Only under rules — suspension, penalty, or unsatisfactory ACR with specific order."]],
    sample: "**Sub:** Increment — Sanction — Orders.\n\nSri/Smt. ___ granted annual increment of Rs.___ w.e.f. ___ in scale ___.",
    telugu: "Annual increment — SR entry మరియు CFMS update తప్పనిసరి. LWP/suspension లో eligibility verify.",
  },
  "pay-fixation-promotion": {
    definition:
      "Pay fixation on promotion determines the new basic pay when an employee is promoted to a higher post. Options under FR 22 / rule 13 may apply — fixation must follow latest pay rules.",
    when: ["Promotion order issued", "Before first pay bill in new scale", "Option exercise period"],
    rules: ["FR 22 / FR 22-B", "PRC pay rules", "Promotion order terms"],
    documents: [["Promotion order", "Effective date"], ["Option form if applicable", "Within time limit"], ["Previous pay fixation", "History"], ["SR", "Promotion entry"]],
    steps: [
      "Note promotion effective date and new scale",
      "Explain pay fixation options to employee if applicable",
      "Collect option form within prescribed period",
      "Calculate fixation per rules (often on next increment date or immediate)",
      "Issue pay fixation order",
      "Enter in SR and service book",
      "Update CFMS scale and basic pay",
      "Draw arrears if applicable via supplementary bill",
    ],
    mistakes: ["Fixation without option when required", "Wrong stage in new scale", "Arrears not drawn", "Promotion in bill before fixation order"],
    ddoNotes: ["Fixation order must precede bill", "Keep option forms in personal file"],
    faq: [["FR 22 vs 22-B?", "Depends on promotion type — verify current PRC rules on GOIR."]],
    sample: "**Sub:** Promotion — Pay Fixation — Orders.\n\nOn promotion as ___, pay fixed at Rs.___ w.e.f. ___ in scale ___.",
    telugu: "Promotion pay fixation — option form, fixation order, CFMS update. PRC rules GOIR లో verify.",
  },
  "macp-benefit": {
    definition:
      "Modified Assured Career Progression (MACP) grants financial upgrade in the same post when regular promotion is delayed, after 10/20/30 years of service (as per rules). Distinct from regular promotion.",
    when: ["Completion of 10/20/30 years in same grade", "No disciplinary bar", "Before pay bill after due date"],
    rules: ["MACP orders under central/state adoption", "AP MACP implementation GOs — verify on GOIR"],
    documents: [["Service verification", "Years in grade"], ["ACRs", "Satisfactory record"], ["Promotion seniority status", "Not promoted despite eligibility"]],
    steps: [
      "Identify employees completing MACP tenure in grade",
      "Verify years of service and grade from SR",
      "Confirm no penalty bar to MACP",
      "Draft MACP proceedings citing applicable GO",
      "Fix pay in next grade pay level",
      "SR entry and CFMS update",
      "Draw arrears from due date if delayed",
    ],
    mistakes: ["MACP treated as promotion for post", "Wrong grade pay level", "MACP while penalty subsists", "Double MACP for same period"],
    ddoNotes: ["MACP changes scale — update all recoveries percentage bases if needed"],
    faq: [["MACP vs promotion?", "MACP is financial upgrade only; post designation unchanged unless promoted separately."]],
    sample: "**Sub:** MACP — Benefit — Orders.\n\nGranted 1st MACP w.e.f. ___ ; pay fixed at ___ in next level.",
    telugu: "MACP — promotion delay అయినప్పుడు financial upgrade. Service years, ACR verify.",
  },
  "gpf-advance": {
    definition:
      "GPF advance is a refundable withdrawal from General Provident Fund account for specified purposes (marriage, education, house construction, etc.) subject to balance and sanction limits.",
    when: ["Employee applies with purpose proof", "Sufficient GPF balance", "No previous advance outstanding beyond limit"],
    rules: ["AP GPF Rules", "AG GPF instructions", "Purpose-specific limits"],
    documents: [["GPF account statement", "Balance"], ["Application with purpose", "Marriage/education proof"], ["Sanction order", "Recovery schedule"]],
    steps: [
      "Verify GPF account number and balance from AG slip / online",
      "Check purpose eligible under rules",
      "Ensure previous advance recovered or within concurrent limit",
      "Obtain competent authority sanction",
      "Prepare GPF advance bill in CFMS/treasury",
      "Schedule recovery in monthly installments",
      "Update GPF recovery register",
      "File sanction in personal file",
    ],
    mistakes: ["Advance exceeds balance", "Recovery not started in next bill", "Wrong purpose", "No sanction before bill"],
    ddoNotes: ["Recovery must appear in every pay bill until cleared"],
    faq: [["Final withdrawal vs advance?", "Advance is refundable with interest; final payment on retirement — different forms."]],
    sample: "**Sub:** GPF — Advance — Sanction.\n\nAdvance Rs.___ sanctioned recoverable in ___ installments.",
    telugu: "GPF advance — purpose proof, balance verify, recovery schedule pay bill లో.",
  },
  "apgli-loan": {
    definition:
      "APGLI policy loan is a loan against the employee's Andhra Pradesh Government Life Insurance policy, subject to surrender value and APGLI department rules.",
    when: ["Employee applies through DDO", "Policy in force minimum period", "No default on premium"],
    rules: ["APGLI Act and rules", "APGLI portal instructions"],
    documents: [["Policy bond / number", "Identity"], ["Loan application", "DDO certification"], ["Premium payment proof", "Up to date"]],
    steps: [
      "Verify policy details on APGLI portal",
      "Confirm premiums paid — no break",
      "Certify employee service and identity as DDO",
      "Forward application to APGLI office / online submission",
      "Track sanction and disbursement",
      "Note recovery in pay bill when APGLI notifies",
      "File APGLI correspondence in personal file",
    ],
    mistakes: ["Certification without premium verification", "Loan recovery not in pay bill", "Wrong policy number"],
    ddoNotes: ["APGLI recovery is separate code in CFMS — do not mix with GPF"],
    faq: [["Loan vs surrender?", "Loan keeps policy active; surrender closes policy — employee choice per need."]],
    sample: "DDO certificate: Sri/Smt. ___ is working as ___ ; APGLI policy No. ___ ; premiums paid up to ___.",
    telugu: "APGLI loan — premium paid verify, DDO certificate, recovery pay bill లో.",
  },
  "pension-proposal": {
    definition:
      "Pension proposal is the consolidated set of papers submitted to pension sanctioning authority before retirement, including service verification, last pay, qualifying service, and retirement type (superannuation, voluntary, etc.).",
    when: ["Six months before superannuation", "On voluntary retirement application", "Death in service"],
    rules: ["AP Revised Pension Rules", "RBPS workflow", "Qualifying service criteria"],
    documents: [
      ["Retirement notification / application", "Trigger"],
      ["Service verification", "From HO"],
      ["Last pay certificate", "Final"],
      ["NDC", "No drawal after last pay"],
      ["Nomination forms", "GPF/APGLI/GIS"],
      ["Qualifying service certificate", "Verified"],
    ],
    steps: [
      "Issue retirement intimation six months ahead",
      "Compile SR extract and service book",
      "Verify qualifying service — no breaks unless counted",
      "Prepare Form 7 / pension papers as per current format",
      "Obtain vigilance clearance and no-dues",
      "Submit to pension sanctioning authority via RBPS if online",
      "Track defects and comply within time",
      "Issue PPO after sanction",
    ],
    mistakes: ["Late proposal causing pension delay", "Qualifying service error", "Missing NDC/LPC", "Nomination not updated"],
    ddoNotes: ["Pension papers checklist is audit-critical", "Coordinate NDC with last pay month exactly"],
    faq: [["When does pension start?", "Usually day after retirement — verify rule for the retirement type."]],
    sample: "**Sub:** Retirement — Pension — Proposal submitted.\n\nPapers sent for sanction of ___ pension w.e.f. ___.",
    telugu: "Pension proposal — 6 months before retire compile papers. LPC, NDC, service verification తప్పనిసరి.",
  },
};

function categoryDefaults(cat, title) {
  const map = {
    establishment: {
      authority: "Head of Office / Superintendent",
      registers: "Service Register, BCR, establishment guard file",
    },
    finance: { authority: "DDO / Head of Office", registers: "Pay registers, recovery register, CFMS" },
    leave: { authority: "Leave sanctioning authority", registers: "Leave account, SR leave column" },
    treasury: { authority: "DDO bill section", registers: "Bill register, CFMS workflow" },
    apgli: { authority: "DDO + APGLI portal", registers: "APGLI recovery schedule" },
    gpf: { authority: "DDO + AG account", registers: "GPF recovery register" },
    health: { authority: "Institution Head / MS", registers: "Medical claim file, EHS records" },
    conduct: { authority: "Disciplinary authority", registers: "Charge memo file, enquiry register" },
    "service-rules": { authority: "Appointing authority", registers: "Seniority register, SR" },
  };
  return map[cat] ?? map.establishment;
}

function generateSubjectDef(sub) {
  const hand = HAND_CRAFTED[sub.base];
  if (hand) return { ...hand, title: sub.title, category: sub.cat, base: sub.base };

  const def = categoryDefaults(sub.cat, sub.title);
  return {
    title: sub.title,
    category: sub.cat,
    base: sub.base,
    definition: `${sub.title} is an administrative process in AP ${sub.cat.replace(/-/g, " ")} work. Ministerial staff must follow applicable rules, maintain registers, and coordinate with ${def.authority} before closing the case.`,
    when: [
      `When office receives application or order related to ${sub.title.toLowerCase()}`,
      "Before pay bill / treasury submission if pay impact exists",
      "When audit or HO seeks compliance documentation",
      "At month-end / quarter-end establishment review",
    ],
    rules: [
      "AP State & Subordinate Service Rules, 1996",
      "Fundamental Rules & Supplementary Rules (where applicable)",
      `${sub.cat === "treasury" ? "CFMS and Treasury Code" : "Finance Department / department circulars"}`,
      "Latest GOs on GOIR — search using keywords for this subject",
    ],
    documents: [
      ["Appointment / service orders", "Authority and dates"],
      ["Service Register", "Permanent record"],
      [def.registers.split(",")[0], "Subject-specific register"],
      ["Previous proceedings / sanctions", "Continuity of record"],
      ["GO / circular copy", "Rule basis for action"],
    ],
    steps: [
      `Open subject file for ${sub.title}`,
      "Verify employee identity in service book and CFMS",
      "Collect supporting orders and applications",
      "Check eligibility and rule position on GOIR",
      `Draft proceedings citing applicable rules for ${sub.title.toLowerCase()}`,
      `Route to ${def.authority} for approval`,
      "Issue signed order with proceeding number",
      "Update Service Register on date of order",
      "Intimate DDO / finance if pay or recovery impact",
      "Update BCR / leave account if applicable",
      "Communicate copy to employee where required",
      "Index file for audit inspection",
    ],
    mistakes: [
      "Proceeding without rule citation",
      "SR entry omitted",
      "Wrong competent authority",
      "CFMS master not updated before bill",
      "Old GO relied upon without checking GOIR",
      `Incomplete papers specific to ${sub.title.toLowerCase()}`,
    ],
    ddoNotes: [
      "Align action with CFMS bill cycle",
      "Verify recovery codes before monthly bill",
      "Keep DDO copy of all establishment orders",
    ],
    faq: [
      [`What is ${sub.title}?`, `${sub.title} — follow ${sub.cat} rules and latest GO on GOIR; see establishment order and SR for employee-specific position.`],
      ["Who signs the order?", def.authority],
      ["What if rules are unclear?", "Hold case; seek HO / admin section guidance with office note."],
    ],
    sample: `**Sub:** ${sub.title} — Orders — Issued.\n\n**Ref:** Application dated ___.\n\nAfter verification under applicable rules, orders are issued as follows: ___\n\nSd/- Authority`,
    telugu: `${sub.title} — AP ${sub.cat} పనిలో ముఖ్యమైన ప్రక్రియ. Papers verify, SR update, DDO intimation తప్పనిసరి. GOIR లో latest GO చూడండి.`,
  };
}

const REGISTRY = new Map(SUBJECTS.map((s) => [s.base, generateSubjectDef(s)]));

export function getSubjectDef(baseOrSlug) {
  let base = baseOrSlug;
  for (const s of SUBJECTS) {
    if (baseOrSlug === s.base || baseOrSlug.startsWith(s.base + "-")) {
      base = s.base;
      break;
    }
  }
  if (REGISTRY.has(base)) return REGISTRY.get(base);
  const sub = SUBJECTS.find((s) => s.base === base);
  if (sub) return generateSubjectDef(sub);
  return generateSubjectDef({ base, title: base.replace(/-/g, " "), cat: "establishment" });
}

export function parseSlug(slug) {
  const angles = [
    "office-guide",
    "ddo-checklist",
    "step-by-step",
    "common-mistakes",
    "audit-ready",
    "cfms-workflow",
  ];
  for (const a of angles) {
    if (slug.endsWith("-" + a)) {
      return { base: slug.slice(0, -(a.length + 1)), angle: a };
    }
  }
  return { base: slug.replace(/-procedure$/, ""), angle: "office-guide" };
}
