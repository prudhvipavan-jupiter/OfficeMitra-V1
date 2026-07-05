/** Expand AP government staff search terms with common synonyms and abbreviations. */
const SYNONYM_GROUPS: string[][] = [
  ["el", "earned leave", "e.l.", "casual leave encashment"],
  ["gpf", "general provident fund", "provident fund"],
  ["apgli", "andhra pradesh government life insurance", "life insurance"],
  ["cfms", "comprehensive financial management", "treasury bill", "pay bill"],
  ["sr", "service register", "service book"],
  ["ddo", "drawing disbursing officer"],
  ["go", "government order", "g.o.", "circular"],
  ["probation", "probationary", "probation declaration"],
  ["increment", "annual increment", "pay increment"],
  ["retirement", "superannuation", "pension"],
  ["transfer", "posting", "relocation"],
  ["promotion", "zone promotion", "category promotion"],
  ["hra", "house rent allowance"],
  ["da", "dearness allowance", "arrears"],
  ["lwp", "leave without pay"],
  ["ndc", "no dues certificate", "no-dues"],
  ["fr 22", "fr22", "pay fixation", "fundamental rule"],
  ["medical", "reimbursement", "hospital bill", "ehs"],
  ["bill", "contingent bill", "treasury"],
  ["leave", "commuted leave", "special casual leave"],
];

export function expandSearchQuery(query: string): string[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const terms = new Set<string>([q]);

  for (const group of SYNONYM_GROUPS) {
    if (group.some((term) => q.includes(term) || term.includes(q))) {
      for (const term of group) terms.add(term);
    }
  }

  // Split multi-word queries
  for (const word of q.split(/\s+/)) {
    if (word.length >= 3) terms.add(word);
  }

  return [...terms];
}
