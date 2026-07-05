import { NextResponse } from "next/server";
import { getPublicVisitorStats } from "@/lib/analytics/visitors";

export async function GET() {
  const stats = await getPublicVisitorStats();
  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
