import { ensureSchema, getSql, isDatabaseEnabled } from "./client";

/** Skip repeated Neon calls for a short window after the first failure (quota / connectivity). */
const OUTAGE_TTL_MS = 60_000;
let dbOutageUntil = 0;

export function markDatabaseOutage(): void {
  dbOutageUntil = Date.now() + OUTAGE_TTL_MS;
}

export function clearDatabaseOutageCache(): void {
  dbOutageUntil = 0;
}

export function isDatabaseOutageCached(): boolean {
  return Date.now() < dbOutageUntil;
}

export type DatabaseStatus = "disabled" | "ok" | "unavailable";

export function getDatabaseStatus(): DatabaseStatus {
  if (!isDatabaseEnabled()) return "disabled";
  if (isDatabaseOutageCached()) return "unavailable";
  return "ok";
}

let outageLogged = false;

export async function withDatabaseFallback<T>(
  dbOp: () => Promise<T>,
  fallback: () => T | Promise<T>
): Promise<T> {
  if (!isDatabaseEnabled()) return fallback();
  if (isDatabaseOutageCached()) return fallback();

  try {
    const result = await dbOp();
    clearDatabaseOutageCache();
    outageLogged = false;
    return result;
  } catch (err) {
    markDatabaseOutage();
    if (!outageLogged) {
      console.error("[OfficeMitra] Database unavailable, using fallback:", err);
      outageLogged = true;
    }
    return fallback();
  }
}

/** Probe DB once (respects outage cache). */
export async function isDatabaseReachable(): Promise<boolean> {
  if (!isDatabaseEnabled()) return false;
  if (isDatabaseOutageCached()) return false;

  try {
    await ensureSchema();
    const sql = getSql();
    await sql`SELECT 1`;
    clearDatabaseOutageCache();
    return true;
  } catch {
    markDatabaseOutage();
    return false;
  }
}
