export type ToolKey =
  | "probation"
  | "elEncashment"
  | "workingDays"
  | "payBillChecklist"
  | "apgliPremium"
  | "leaveAccrual";

export interface ToolDefinition {
  key: ToolKey;
  href: string;
}

/** V1 launch — mandatory tools only. */
export const toolDefinitions: ToolDefinition[] = [
  { key: "payBillChecklist", href: "/tools/pay-bill-checklist" },
  { key: "probation", href: "/tools/probation-calculator" },
  { key: "leaveAccrual", href: "/tools/leave-accrual-calculator" },
  { key: "elEncashment", href: "/tools/el-encashment-calculator" },
  { key: "workingDays", href: "/tools/working-days-calculator" },
  { key: "apgliPremium", href: "/tools/apgli-premium-calculator" },
];

export const toolHrefByKey = Object.fromEntries(
  toolDefinitions.map((d) => [d.key, d.href])
) as Record<ToolKey, string>;

export const toolSearchTitles: Record<ToolKey, string> = {
  probation: "Probation Calculator",
  elEncashment: "EL Encashment Calculator",
  workingDays: "Working Days Calculator",
  payBillChecklist: "Pay Bill Checklist",
  apgliPremium: "APGLI Premium Calculator",
  leaveAccrual: "Leave Accrual Estimator",
};
