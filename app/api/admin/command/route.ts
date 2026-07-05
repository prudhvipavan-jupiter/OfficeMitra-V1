import { NextResponse } from "next/server";
import { getDraftInboxSummary } from "@/lib/admin/inbox";
import { getAdminActivityLog } from "@/lib/admin-log";
import { isAdminAuthenticated } from "@/lib/auth";
import { AGENT_PIPELINES } from "@/lib/agents/pipeline-config";
import { AGENT_TOOLS } from "@/lib/agents/registry";
import {
  loadArticles,
  loadDocuments,
  loadProcedures,
  loadTemplates,
  loadUpdates,
} from "@/lib/cms/loaders";
import { getCmsTotals } from "@/lib/cms/stats";
import { getAdminVisitorStats } from "@/lib/analytics/visitors";
import { ensureSchema, getSql, isDatabaseEnabled } from "@/lib/db/client";
import { getDatabaseStatus } from "@/lib/db/resilience";
import { getDiscussions } from "@/lib/db/discussions";
import { getExpertRequests } from "@/lib/db/requests";
import { getIntelDashboardStats, isIntelligenceEnabled } from "@/lib/intelligence/store";
import { getNexusStats } from "@/lib/nexus/store";
import { toolDefinitions } from "@/lib/tools/registry";
import { isPrimaryAiConfigured } from "@/lib/llm/primary-ai";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbStatus = getDatabaseStatus();
  const aiConfigured = isPrimaryAiConfigured();
  const nexusWorker = !!process.env.NEXUS_WORKER_URL;

  const [
    requests,
    pendingDiscussions,
    publishedDiscussions,
    resolvedDiscussions,
    activity,
    cms,
    nexus,
    articles,
    procedures,
    documents,
    templates,
    updates,
  ] = await Promise.all([
    getExpertRequests(),
    getDiscussions({ status: "pending" }),
    getDiscussions({ status: "published" }),
    getDiscussions({ status: "resolved" }),
    getAdminActivityLog(20),
    getCmsTotals().catch(() => null),
    getNexusStats().catch(() => null),
    loadArticles(),
    loadProcedures(),
    loadDocuments(),
    loadTemplates(),
    loadUpdates(),
  ]);

  let subscriberCount = 0;
  if (isDatabaseEnabled() && dbStatus !== "unavailable") {
    try {
      await ensureSchema();
      const sql = getSql();
      const rows = await sql`SELECT COUNT(*)::int AS count FROM digest_subscribers`;
      subscriberCount = Number(rows[0]?.count ?? 0);
    } catch {
      subscriberCount = 0;
    }
  }

  let intel: Awaited<ReturnType<typeof getIntelDashboardStats>> | null = null;
  if (isIntelligenceEnabled()) {
    try {
      intel = await getIntelDashboardStats();
    } catch {
      intel = null;
    }
  }

  const inbox = await getDraftInboxSummary().catch(() => ({
    total: cms?.draftTotal ?? 0,
    cms: cms?.draftTotal ?? 0,
    nexus: nexus?.draft_ready ?? 0,
    intel: intel?.pending_review ?? 0,
  }));

  const visitors = await getAdminVisitorStats().catch(() => ({
    totalViews: 0,
    todayViews: 0,
    uniqueToday: 0,
    uniqueAllTime: 0,
    topPages: [],
    dailyViews: [],
  }));

  const pendingExpert = requests.filter((r) => r.status === "pending").length;
  const attention =
    (pendingDiscussions.length > 0 ? 1 : 0) +
    (pendingExpert > 0 ? 1 : 0) +
    ((inbox.total ?? 0) > 0 ? 1 : 0) +
    ((intel?.pending_review ?? 0) > 0 ? 1 : 0);

  const alerts: { level: "warn" | "critical"; message: string; href?: string }[] = [];
  if (dbStatus === "unavailable") {
    alerts.push({
      level: "critical",
      message: "Database unavailable — CMS sync and NeXus persistence may use file fallback.",
      href: "/admin/review",
    });
  }
  if (!aiConfigured) {
    alerts.push({
      level: "warn",
      message: "GEMINI_API_KEY not set — writer agents and NeXus AI drafts need configuration.",
    });
  }
  if (pendingDiscussions.length > 0) {
    alerts.push({
      level: "warn",
      message: `${pendingDiscussions.length} community question${pendingDiscussions.length > 1 ? "s" : ""} awaiting moderation.`,
      href: "/admin/people",
    });
  }
  if (pendingExpert > 0) {
    alerts.push({
      level: "warn",
      message: `${pendingExpert} expert request${pendingExpert > 1 ? "s" : ""} pending response.`,
      href: "/admin/people",
    });
  }
  if (inbox.total > 0) {
    alerts.push({
      level: "warn",
      message: `${inbox.total} draft${inbox.total > 1 ? "s" : ""} pending publish (CMS ${inbox.cms}, NeXus ${inbox.nexus}, Intel ${inbox.intel}).`,
      href: "/admin/inbox",
    });
  }
  if ((nexus?.draft_ready ?? 0) > 0 && inbox.nexus === 0) {
    alerts.push({
      level: "warn",
      message: `${nexus!.draft_ready} NeXus draft${nexus!.draft_ready > 1 ? "s" : ""} ready for review.`,
      href: "/admin/nexus",
    });
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    system: {
      db: dbStatus,
      ai: aiConfigured,
      nexusWorker,
      intelligence: isIntelligenceEnabled(),
      agents: AGENT_TOOLS.length,
      pipelines: AGENT_PIPELINES.length,
    },
    attention,
    alerts,
    queue: {
      expertRequests: requests.length,
      pendingExpert,
      pendingCommunity: pendingDiscussions.length,
      publishedCommunity: publishedDiscussions.length,
      resolvedCommunity: resolvedDiscussions.length,
      subscribers: subscriberCount,
    },
    content: {
      articles: articles.length,
      procedures: procedures.length,
      documents: documents.length,
      templates: templates.length,
      updates: updates.length,
      tools: toolDefinitions.length,
      published: cms?.publishedTotal ?? articles.length + procedures.length,
      drafts: cms?.draftTotal ?? 0,
    },
    nexus: nexus ?? {
      queued: 0,
      researching: 0,
      draft_ready: 0,
      approved: 0,
      published: 0,
      rejected: 0,
      failed: 0,
      total: 0,
    },
    intelligence: intel,
    inbox,
    visitors: {
      totalViews: visitors.totalViews,
      todayViews: visitors.todayViews,
      uniqueToday: visitors.uniqueToday,
      uniqueAllTime: visitors.uniqueAllTime,
    },
    activity,
  });
}
