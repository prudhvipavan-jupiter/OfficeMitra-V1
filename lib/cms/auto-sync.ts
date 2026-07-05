import { syncCmsFromFiles } from "./seed";
import { cmsPublishAllDrafts } from "./publish";
import { isCmsSyncPaused } from "./meta";
import { isNextBuildPhase } from "@/lib/runtime";

let syncStarted = false;

function autoSyncEnabled(): boolean {
  return process.env.CMS_AUTO_SYNC !== "false";
}

function autoPublishEnabled(): boolean {
  return process.env.CMS_AUTO_PUBLISH !== "false";
}

/** Sync empty CMS content types from git files (runs once per server process). */
export async function ensureCmsAutoSync(): Promise<Record<string, number | string>> {
  if (isNextBuildPhase() || !autoSyncEnabled() || syncStarted) return {};
  syncStarted = true;

  try {
    if (await isCmsSyncPaused()) {
      console.info("[OfficeMitra] CMS auto-sync skipped (content reset — use Admin sync to re-import)");
      return {};
    }
    const counts = await syncCmsFromFiles({ onlyEmpty: true });
    const synced = Object.entries(counts).filter(([, v]) => typeof v === "number" && v > 0);
    if (synced.length > 0) {
      console.info("[OfficeMitra] CMS auto-sync:", Object.fromEntries(synced));
    }
    if (autoPublishEnabled()) {
      const published = await cmsPublishAllDrafts();
      const pubTotal = Object.values(published).reduce((a, b) => a + b, 0);
      if (pubTotal > 0) {
        console.info("[OfficeMitra] CMS auto-publish:", published);
      }
    }
    return counts;
  } catch (err) {
    console.error("[OfficeMitra] CMS auto-sync failed:", err);
    return {};
  }
}
