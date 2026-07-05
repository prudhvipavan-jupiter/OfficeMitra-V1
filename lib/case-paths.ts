import type { ToolKey } from "./tools/registry";

export interface CasePath {
  id: string;
  category: string;
  articleSlug: string;
  procedureSlug?: string;
  tool?: ToolKey;
  faqHref?: string;
  expertPrefill?: string;
}

/** High-frequency AP government staff tasks — wired to live CMS content. */
export const casePaths: CasePath[] = [
  {
    id: "probation",
    category: "establishment",
    articleSlug: "probation-declaration",
    procedureSlug: "probation-declaration-procedure",
    tool: "probation",
    faqHref: "/faq",
    expertPrefill: "probation-declaration",
  },
  {
    id: "promotion",
    category: "establishment",
    articleSlug: "increment-sanction",
    procedureSlug: "increment-sanction-procedure",
    expertPrefill: "increment-sanction",
  },
  {
    id: "apgli",
    category: "apgli",
    articleSlug: "apgli-loan-application",
    procedureSlug: "apgli-loan-application-procedure",
    tool: "apgliPremium",
    expertPrefill: "apgli-loan-application",
  },
  {
    id: "gpf",
    category: "gpf",
    articleSlug: "gpf-advance",
    procedureSlug: "gpf-advance-procedure",
    expertPrefill: "gpf-advance",
  },
  {
    id: "medical",
    category: "finance",
    articleSlug: "contingent-bill-preparation",
    procedureSlug: "cfms-bill-processing-procedure",
    expertPrefill: "medical-reimbursement",
  },
  {
    id: "sr",
    category: "establishment",
    articleSlug: "service-register-step-by-step",
    procedureSlug: "service-register-step-by-step-procedure",
    expertPrefill: "service-register",
  },
  {
    id: "el",
    category: "leave",
    articleSlug: "earned-leave-rules",
    procedureSlug: "earned-leave-rules-procedure",
    tool: "elEncashment",
    expertPrefill: "earned-leave-rules",
  },
  {
    id: "bill",
    category: "finance",
    articleSlug: "cfms-bill-processing",
    procedureSlug: "cfms-bill-processing-procedure",
    tool: "payBillChecklist",
    expertPrefill: "cfms-bill-processing",
  },
];
