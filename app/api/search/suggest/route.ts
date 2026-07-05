import { NextRequest, NextResponse } from "next/server";
import { loadArticles, loadProcedures } from "@/lib/cms/loaders";
import { popularSearches } from "@/lib/constants";
import { expandSearchQuery } from "@/lib/search-synonyms";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ suggestions: popularSearches.slice(0, 6) });
  }

  const terms = expandSearchQuery(q);
  const [articles, procedures] = await Promise.all([loadArticles(), loadProcedures()]);

  const scored: { label: string; href: string; score: number }[] = [];

  for (const a of articles) {
    const title = a.title.toLowerCase();
    let score = 0;
    for (const t of terms) {
      if (title.startsWith(t)) score += 10;
      else if (title.includes(t)) score += 5;
      else if (a.summary.toLowerCase().includes(t)) score += 2;
    }
    if (score > 0) scored.push({ label: a.title, href: `/knowledge/${a.slug}`, score });
  }

  for (const p of procedures) {
    const title = p.title.toLowerCase();
    let score = 0;
    for (const t of terms) {
      if (title.startsWith(t)) score += 10;
      else if (title.includes(t)) score += 6;
    }
    if (score > 0) scored.push({ label: p.title, href: `/procedures/${p.slug}`, score: score + 1 });
  }

  const suggestions = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ label, href }) => ({ label, href }));

  if (suggestions.length === 0) {
    return NextResponse.json({
      suggestions: popularSearches.filter((s) => s.toLowerCase().includes(q)).slice(0, 5),
    });
  }

  return NextResponse.json(
    { suggestions },
    { headers: { "Cache-Control": "public, s-maxage=120" } }
  );
}
