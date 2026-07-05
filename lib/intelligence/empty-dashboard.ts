import type { IntelDashboardStats } from "./types";

export const EMPTY_INTEL_STATS: IntelDashboardStats = {
  detected_today: 0,
  pending_review: 0,
  published_today: 0,
  sources_monitored: 0,
  active_sources: 0,
  last_run: null,
};

export function emptyIntelDashboard(warning: string) {
  return {
    degraded: true,
    warning,
    stats: EMPTY_INTEL_STATS,
    updates: [],
    sources: [],
    activity: [],
  };
}
