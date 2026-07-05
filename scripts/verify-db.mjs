import { readFileSync } from "fs";
import { neon } from "@neondatabase/serverless";

const envText = readFileSync(".env.vercel.prod", "utf-8");
const url =
  envText.match(/^POSTGRES_URL="(.+)"$/m)?.[1] ??
  envText.match(/^POSTGRES_URL=(.+)$/m)?.[1]?.replace(/^"|"$/g, "");

if (!url) {
  console.error("POSTGRES_URL missing from .env.vercel.prod");
  process.exit(1);
}

const sql = neon(url);

const ping = await sql`SELECT 1 AS ok`;
console.log("Ping:", ping[0]?.ok === 1 ? "ok" : ping);

const count = await sql`SELECT COUNT(*)::int AS c FROM cms_content`.catch(async () => {
  console.log("cms_content table missing — will be created on first deploy request");
  return [{ c: 0 }];
});
console.log("cms_content rows:", count[0]?.c ?? 0);
