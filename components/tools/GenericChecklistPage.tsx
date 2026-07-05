"use client";

import { useMemo, useState } from "react";
import { ToolPageShell, ToolResultBox } from "./ToolPageShell";
import type { ChecklistTool } from "@/lib/tools/checklists";

export function GenericChecklistPage({ tool }: { tool: ChecklistTool }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const done = useMemo(() => tool.items.filter((i) => checked[i.id]).length, [checked, tool.items]);

  return (
    <ToolPageShell
      title={tool.title}
      subtitle={tool.subtitle}
      note={tool.note ?? "Original OfficeMitra tool. Verify latest GO/circular before official use."}
    >
      <ul className="space-y-3">
        {tool.items.map((item) => (
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
          { label: "Progress / పురోగతి", value: `${done} / ${tool.items.length}` },
          {
            label: "Status",
            value: done === tool.items.length ? "Complete ✓" : "In progress",
            highlight: done === tool.items.length,
          },
        ]}
      />
    </ToolPageShell>
  );
}
