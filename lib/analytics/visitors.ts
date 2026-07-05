import { ensureSchema, getSql, isDatabaseEnabled } from "@/lib/db/client";

const BOT_PATTERN =
  /bot|crawl|spider|slurp|mediapartners|facebookexternalhit|whatsapp|preview|lighthouse|headless|phantom/i;

export interface PublicVisitorStats {
  totalViews: number;
  todayViews: number;
  uniqueToday: number;
  uniqueAllTime: number;
}

export interface AdminVisitorStats extends PublicVisitorStats {
  topPages: { path: string; views: number }[];
  dailyViews: { date: string; views: number; uniqueVisitors: number }[];
}

function isBotUserAgent(ua: string | null): boolean {
  if (!ua) return false;
  return BOT_PATTERN.test(ua);
}

export async function recordPageVisit(
  path: string,
  sessionId: string,
  userAgent: string | null
): Promise<boolean> {
  const normalizedPath = path.split("?")[0]?.trim() || "/";
  if (
    !normalizedPath.startsWith("/") ||
    normalizedPath.startsWith("/admin") ||
    normalizedPath.startsWith("/api") ||
    normalizedPath.startsWith("/_next")
  ) {
    return false;
  }

  const sid = sessionId.trim().slice(0, 64);
  if (!sid || sid.length < 8) return false;
  if (isBotUserAgent(userAgent)) return false;

  if (!isDatabaseEnabled()) return false;

  try {
    await ensureSchema();
    const sql = getSql();

    const recent = await sql`
      SELECT id FROM page_visits
      WHERE session_id = ${sid}
        AND path = ${normalizedPath}
        AND visited_at > NOW() - INTERVAL '30 minutes'
      LIMIT 1
    `;
    if (recent.length > 0) return false;

    await sql`
      INSERT INTO page_visits (path, session_id, visited_at)
      VALUES (${normalizedPath}, ${sid}, NOW())
    `;
    return true;
  } catch (e) {
    console.error("[Visitors] record failed:", e);
    return false;
  }
}

export async function getPublicVisitorStats(): Promise<PublicVisitorStats> {
  const empty: PublicVisitorStats = {
    totalViews: 0,
    todayViews: 0,
    uniqueToday: 0,
    uniqueAllTime: 0,
  };

  if (!isDatabaseEnabled()) return empty;

  try {
    await ensureSchema();
    const sql = getSql();

    const rows = await sql`
      SELECT
        COUNT(*)::int AS total_views,
        COUNT(*) FILTER (WHERE visited_at >= CURRENT_DATE)::int AS today_views,
        COUNT(DISTINCT session_id) FILTER (WHERE visited_at >= CURRENT_DATE)::int AS unique_today,
        COUNT(DISTINCT session_id)::int AS unique_all_time
      FROM page_visits
    `;

    const row = rows[0];
    return {
      totalViews: Number(row?.total_views ?? 0),
      todayViews: Number(row?.today_views ?? 0),
      uniqueToday: Number(row?.unique_today ?? 0),
      uniqueAllTime: Number(row?.unique_all_time ?? 0),
    };
  } catch (e) {
    console.error("[Visitors] public stats failed:", e);
    return empty;
  }
}

export async function getPageViewCount(path: string): Promise<number> {
  const normalizedPath = path.split("?")[0]?.trim() || "/";
  if (!isDatabaseEnabled()) return 0;

  try {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`
      SELECT COUNT(*)::int AS views FROM page_visits WHERE path = ${normalizedPath}
    `;
    return Number(rows[0]?.views ?? 0);
  } catch {
    return 0;
  }
}

export async function getAdminVisitorStats(): Promise<AdminVisitorStats> {
  const base = await getPublicVisitorStats();
  const empty: AdminVisitorStats = { ...base, topPages: [], dailyViews: [] };

  if (!isDatabaseEnabled()) return empty;

  try {
    await ensureSchema();
    const sql = getSql();

    const topPages = await sql`
      SELECT path, COUNT(*)::int AS views
      FROM page_visits
      WHERE visited_at >= NOW() - INTERVAL '7 days'
      GROUP BY path
      ORDER BY views DESC
      LIMIT 15
    `;

    const dailyViews = await sql`
      SELECT
        DATE(visited_at AT TIME ZONE 'Asia/Kolkata')::text AS date,
        COUNT(*)::int AS views,
        COUNT(DISTINCT session_id)::int AS unique_visitors
      FROM page_visits
      WHERE visited_at >= NOW() - INTERVAL '14 days'
      GROUP BY DATE(visited_at AT TIME ZONE 'Asia/Kolkata')
      ORDER BY date DESC
    `;

    return {
      ...base,
      topPages: topPages.map((r) => ({
        path: String(r.path),
        views: Number(r.views),
      })),
      dailyViews: dailyViews.map((r) => ({
        date: String(r.date),
        views: Number(r.views),
        uniqueVisitors: Number(r.unique_visitors),
      })),
    };
  } catch (e) {
    console.error("[Visitors] admin stats failed:", e);
    return empty;
  }
}
