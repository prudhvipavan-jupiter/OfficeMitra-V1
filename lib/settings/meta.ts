import { ensureSchema, getSql, isDatabaseEnabled } from "@/lib/db/client";
import { withDatabaseFallback } from "@/lib/db/resilience";

export async function getMetaValue(key: string): Promise<string | null> {
  if (!isDatabaseEnabled()) return null;
  return withDatabaseFallback(
    async () => {
      await ensureSchema();
      const sql = getSql();
      const rows = await sql`SELECT value FROM cms_meta WHERE key = ${key} LIMIT 1`;
      return rows[0]?.value ? String(rows[0].value) : null;
    },
    () => null
  );
}

export async function setMetaValue(key: string, value: string): Promise<void> {
  if (!isDatabaseEnabled()) return;
  await withDatabaseFallback(
    async () => {
      await ensureSchema();
      const sql = getSql();
      await sql`
        INSERT INTO cms_meta (key, value, updated_at)
        VALUES (${key}, ${value}, NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `;
    },
    () => undefined
  );
}
