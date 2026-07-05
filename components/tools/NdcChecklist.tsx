"use client";

import { useMemo, useState } from "react";
import { ToolPageShell, ToolResultBox } from "./ToolPageShell";

const ITEMS = [
  { id: "pay", en: "Last month pay verified in CFMS", te: "CFMS లో last month pay verify" },
  { id: "loans", en: "No outstanding GPF/APGLI/festival advance", te: "Outstanding loans లేవు" },
  { id: "treasury", en: "Treasury / DDO clearance obtained", te: "Treasury/DDO clearance" },
  { id: "leave", en: "Leave account closed up to relieving date", te: "Leave account close" },
  { id: "recoveries", en: "All recoveries reconciled", te: "Recoveries reconcile" },
  { id: "format", en: "NDC prepared in prescribed format", te: "Prescribed NDC format" },
  { id: "seal", en: "DDO seal and signature applied", te: "DDO seal & signature" },
  { id: "copy", en: "Office copy filed in employee record", te: "Office copy file" },
];

export function NdcChecklistPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const done = useMemo(() => ITEMS.filter((i) => checked[i.id]).length, [checked]);

  return (
    <ToolPageShell
      title="Non-Drawal Certificate (NDC) Checklist"
      subtitle="Verify all items before issuing NDC for transfer or retirement — English & Telugu"
      note="Original OfficeMitra tool. Verify treasury instructions before official use."
    >
      <ul className="space-y-3">
        {ITEMS.map((item) => (
          <li key={item.id}>
            <label
              className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition ${
                checked[item.id] ? "border-emerald-300 bg-emerald-50" : "border-gray-200 bg-white"
              }`}
            >
              <input
                type="checkbox"
                checked={!!checked[item.id]}
                onChange={() => setChecked((p) => ({ ...p, [item.id]: !p[item.id] }))}
                className="mt-1 h-4 w-4"
              />
              <span>
                <span className="block font-medium text-navy-900">{item.en}</span>
                <span className="mt-0.5 block text-sm text-navy-600">{item.te}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <ToolResultBox
        items={[
          { label: "Progress / పురోగతి", value: `${done} / ${ITEMS.length}` },
          {
            label: "Status",
            value: done === ITEMS.length ? "Ready to issue NDC ✓" : "Complete remaining items",
            highlight: done === ITEMS.length,
          },
        ]}
      />
    </ToolPageShell>
  );
}
