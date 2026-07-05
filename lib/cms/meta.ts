import { ensureSchema, getSql, isDatabaseEnabled } from "@/lib/db/client";
import { withDatabaseFallback } from "@/lib/db/resilience";

const SYNC_PAUSED_KEY = "cms_sync_paused";

export async function isCmsSyncPaused(): Promise<boolean> {
  if (!isDatabaseEnabled()) return false;
  return withDatabaseFallback(
    async () => {
      await ensureSchema();
      const sql = getSql();
      const rows = await sql`SELECT value FROM cms_meta WHERE key = ${SYNC_PAUSED_KEY} LIMIT 1`;
      return rows[0]?.value === "true";
    },
    () => false
  );
}

export async function setCmsSyncPaused(paused: boolean): Promise<void> {
  if (!isDatabaseEnabled()) return;
  await withDatabaseFallback(
    async () => {
      await ensureSchema();
      const sql = getSql();
      await sql`
        INSERT INTO cms_meta (key, value, updated_at)
        VALUES (${SYNC_PAUSED_KEY}, ${paused ? "true" : "false"}, NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `;
    },
    () => undefined
  );
}
