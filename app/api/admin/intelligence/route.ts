import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { isDatabaseReachable } from "@/lib/db/resilience";
import { emptyIntelDashboard } from "@/lib/intelligence/empty-dashboard";
import {
  getIntelActivityLog,
  getIntelDashboardStats,
  getIntelSources,
  getIntelUpdates,
  isIntelligenceEnabled,
} from "@/lib/intelligence/store";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isIntelligenceEnabled()) {
    return NextResponse.json(
      emptyIntelDashboard("POSTGRES_URL required for Intelligence Engine — add Neon Postgres to enable monitoring.")
    );
  }

  const reachable = await isDatabaseReachable();
  if (!reachable) {
    return NextResponse.json(
      emptyIntelDashboard(
        "Database unavailable — Intelligence Engine needs Neon Postgres. Restore quota or check connectivity."
      )
    );
  }

  const view = request.nextUrl.searchParams.get("view");

  try {
    if (view === "activity") {
      return NextResponse.json({ activity: await getIntelActivityLog(30) });
    }

    const status = request.nextUrl.searchParams.get("status") ?? undefined;
    const [stats, updates, sources, activity] = await Promise.all([
      getIntelDashboardStats(),
      getIntelUpdates(status as Parameters<typeof getIntelUpdates>[0]),
      getIntelSources(),
      getIntelActivityLog(15),
    ]);

    return NextResponse.json({ stats, updates, sources, activity });
  } catch (err) {
    console.error("[Intel] dashboard load failed:", err);
    return NextResponse.json(
      emptyIntelDashboard(
        err instanceof Error ? err.message : "Intelligence database query failed"
      )
    );
  }
}
