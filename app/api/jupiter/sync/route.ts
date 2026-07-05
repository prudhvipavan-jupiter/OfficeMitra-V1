import { NextRequest, NextResponse } from "next/server";
import { getArticles, getProcedures, getUpdates } from "@/lib/content";
import { checklistTools } from "@/lib/tools/checklists";

export const dynamic = "force-dynamic";

function authOk(request: NextRequest): boolean {
  const token = process.env.JUPITER_SYNC_TOKEN;
  if (!token) return false;
  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${token}`;
}

export async function GET(request: NextRequest) {
  if (!authOk(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = Number(request.nextUrl.searchParams.get("since") ?? "0");
  const items: Array<{
    type: string;
    slug: string;
    title: string;
    category: string;
    summary: string;
    telugu_summary?: string;
    content: string;
    updated_at: number;
  }> = [];

  for (const article of getArticles()) {
    const updated = new Date(article.updated_at ?? article.published_at).getTime();
    if (updated <= since) continue;
    items.push({
      type: "article",
      slug: article.slug,
      title: article.title,
      category: article.category,
      summary: article.summary,
      telugu_summary: article.telugu_summary,
      content: article.content,
      updated_at: updated,
    });
  }

  for (const procedure of getProcedures()) {
    const updated = new Date(procedure.published_at).getTime();
    if (updated <= since) continue;
    items.push({
      type: "procedure",
      slug: procedure.slug,
      title: procedure.title,
      category: procedure.category,
      summary: procedure.summary,
      content: procedure.content,
      updated_at: updated,
    });
  }

  for (const update of getUpdates()) {
    const updated = new Date(update.date).getTime();
    if (updated <= since) continue;
    items.push({
      type: "update",
      slug: update.slug,
      title: update.title,
      category: update.category,
      summary: update.what_changed,
      content: update.content,
      updated_at: updated,
    });
  }

  for (const checklist of checklistTools) {
    items.push({
      type: "checklist",
      slug: checklist.slug,
      title: checklist.title,
      category: checklist.category,
      summary: checklist.subtitle,
      content: JSON.stringify(checklist.items),
      updated_at: Date.now(),
    });
  }

  return NextResponse.json({
    server_time: Date.now(),
    count: items.length,
    items,
  });
}
