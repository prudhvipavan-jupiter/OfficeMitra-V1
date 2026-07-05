import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/auth";
import { isDatabaseReachable } from "@/lib/db/resilience";
import { autoProcessIntelUpdates } from "@/lib/intelligence/auto-process";
import { runIntelligenceMonitorCycle } from "@/lib/intelligence/monitor-cycle";
import { isIntelligenceEnabled } from "@/lib/intelligence/store";
import { triggerIntelligenceWorker } from "@/lib/intelligence/trigger-worker";
import { upgradeBriefIntelPosts, resanitizeIntelDrafts } from "@/lib/intelligence/upgrade-content";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isIntelligenceEnabled()) {
    return NextResponse.json(
      { error: "POSTGRES_URL required for Intelligence Engine" },
      { status: 503 }
    );
  }

  if (!(await isDatabaseReachable())) {
    return NextResponse.json(
      { error: "Database unavailable — restore Neon Postgres before running the monitor" },
      { status: 503 }
    );
  }

  try {
    let monitor;
    if (process.env.INTELLIGENCE_USE_WORKER === "true") {
      const worker = await triggerIntelligenceWorker();
      if (!worker.ok) {
        return NextResponse.json({ error: worker.error ?? "Worker request failed" }, { status: 503 });
      }
      monitor = { mode: "worker", ...worker };
    } else {
      const cycle = await runIntelligenceMonitorCycle();
      monitor = { mode: "embedded", ...cycle };
    }

    const upgraded = await upgradeBriefIntelPosts();
    const resanitized = await resanitizeIntelDrafts(100);
    const autoPublished = await autoProcessIntelUpdates();

    if (autoPublished > 0) {
      revalidatePath("/updates");
      revalidatePath("/updates/[slug]", "page");
      revalidatePath("/");
    }

    return NextResponse.json({
      ...monitor,
      upgraded,
      resanitized,
      autoPublished,
      dailyTarget: parseInt(process.env.INTELLIGENCE_DAILY_PUBLISH_TARGET ?? "5", 10),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Intelligence run failed" },
      { status: 500 }
    );
  }
}
