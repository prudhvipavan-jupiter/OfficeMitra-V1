import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getCmsTotals } from "@/lib/cms/stats";
import { CMS_TYPE_LABELS } from "@/lib/cms/types";
import { toolDefinitions } from "@/lib/tools/registry";
import { checklistTools } from "@/lib/tools/checklists";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cms = await getCmsTotals();

  return NextResponse.json({
    ...cms,
    tools: {
      calculators: toolDefinitions.length,
      checklists: checklistTools.length,
      total: toolDefinitions.length + checklistTools.length,
    },
    labels: CMS_TYPE_LABELS,
  });
}
