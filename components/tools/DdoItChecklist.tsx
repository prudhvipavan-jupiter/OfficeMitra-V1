"use client";

import { useMemo, useState } from "react";
import { ToolPageShell, ToolResultBox } from "./ToolPageShell";

const ITEMS = [
  { id: "12bb", en: "Form 12BB collected from all staff", te: "Form 12BB అందుబాటులో" },
  { id: "proofs", en: "Investment proofs verified", te: "Investment proofs verify" },
  { id: "regime", en: "Tax regime (old/new) confirmed per employee", te: "Tax regime confirm" },
  { id: "consolidated", en: "DDO consolidated declaration prepared", te: "Consolidated declaration" },
  { id: "cfms", en: "Submitted in CFMS before Feb bill deadline", te: "CFMS submit" },
  { id: "ack", en: "Acknowledgment downloaded and filed", te: "Acknowledgment file" },
];

export function DdoItChecklistPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const done = useMemo(() => ITEMS.filter((i) => checked[i.id]).length, [checked]);

  return (
    <ToolPageShell
      title="DDO Income Tax Declaration Checklist"
      subtitle="February pay bill TDS declaration — FY 2025-26"
      note="Verify Finance Department circular for exact deadline."
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
          { label: "Progress", value: `${done} / ${ITEMS.length}` },
          {
            label: "Status",
            value: done === ITEMS.length ? "Ready for CFMS submission ✓" : "Pending items",
            highlight: done === ITEMS.length,
          },
        ]}
      />
    </ToolPageShell>
  );
}
