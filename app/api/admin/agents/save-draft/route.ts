import { NextResponse } from "next/server";

import { revalidatePath } from "next/cache";

import { logAdminAction } from "@/lib/admin-log";

import { isAdminAuthenticated } from "@/lib/auth";

import { cmsUpsert } from "@/lib/cms/store";

import { getAgentById, type SaveContentType } from "@/lib/agents/registry";



function slugify(text: string): string {

  return text.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

}



export async function POST(request: Request) {

  if (!(await isAdminAuthenticated())) {

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  }



  let body: {

    agentId?: string;

    title?: string;

    slug?: string;

    summary?: string;

    telugu_summary?: string;

    category?: string;

    body_markdown?: string;

    content_type?: SaveContentType;

    raw?: Record<string, unknown>;

  };



  try {

    body = await request.json();

  } catch {

    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  }



  const agent = body.agentId ? getAgentById(body.agentId) : undefined;

  const contentType = body.content_type ?? agent?.saveContentType ?? "article";



  if (!agent?.saveAsArticle && !body.content_type) {

    return NextResponse.json({ error: "This agent output cannot be saved as CMS draft" }, { status: 400 });

  }



  const now = new Date().toISOString().slice(0, 10);

  const raw = body.raw ?? {};



  if (contentType === "faq") {

    const question = String(raw.question ?? body.title ?? "").trim();

    const answer = String(raw.answer ?? body.body_markdown ?? "").trim();

    if (!question || !answer) {

      return NextResponse.json({ error: "FAQ question and answer required" }, { status: 400 });

    }

    const id = slugify(question).slice(0, 60) || `faq-${Date.now()}`;

    const record = await cmsUpsert({

      content_type: "faq",

      slug: id,

      status: "draft",

      data: {

        id,

        category: String(raw.category ?? body.category ?? "general"),

        question,

        question_te: String(raw.question_te ?? ""),

        answer,

        answer_te: String(raw.answer_te ?? ""),

        generated_by: body.agentId,

      },

    });

    revalidatePath("/faq");

    await logAdminAction("agent_save_draft", { agent: body.agentId ?? "", slug: id, type: "faq" });

    return NextResponse.json({ ok: true, id: record.id, slug: id, contentType: "faq" });

  }



  if (contentType === "glossary") {

    const term = String(raw.term ?? body.title ?? "").trim();

    const definition = String(raw.definition ?? body.body_markdown ?? "").trim();

    if (!term || !definition) {

      return NextResponse.json({ error: "Glossary term and definition required" }, { status: 400 });

    }

    const slug = String(raw.slug_key ?? slugify(term));

    const record = await cmsUpsert({

      content_type: "glossary",

      slug,

      status: "draft",

      data: {

        term,

        telugu: String(raw.telugu ?? ""),

        definition,

        definition_te: String(raw.definition_te ?? ""),

        category: String(raw.category ?? body.category ?? "general"),

        slug_key: slug,

        generated_by: body.agentId,

      },

    });

    revalidatePath("/glossary");

    await logAdminAction("agent_save_draft", { agent: body.agentId ?? "", slug, type: "glossary" });

    return NextResponse.json({ ok: true, id: record.id, slug, contentType: "glossary" });

  }



  if (contentType === "update") {

    const title = body.title?.trim();

    const slug = body.slug?.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-");

    const markdown = body.body_markdown?.trim();

    if (!title || !slug || !markdown) {

      return NextResponse.json({ error: "title, slug, and body_markdown required for update" }, { status: 400 });

    }

    const record = await cmsUpsert({

      content_type: "update",

      slug,

      status: "draft",

      data: {

        title,

        slug,

        date: now,

        category: body.category ?? "establishment",

        what_changed: body.summary ?? String(raw.what_changed ?? ""),

        who_is_affected: String(raw.who_is_affected ?? ""),

        action_required: String(raw.action_required ?? ""),

        status: "draft",

        generated_by: body.agentId,

      },

      body: markdown,

    });

    revalidatePath("/updates");

    await logAdminAction("agent_save_draft", { agent: body.agentId ?? "", slug, type: "update" });

    return NextResponse.json({ ok: true, id: record.id, slug, contentType: "update" });

  }



  const title = body.title?.trim();

  const slug = body.slug?.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-");

  const markdown = body.body_markdown?.trim();



  if (!title || !slug || !markdown) {

    return NextResponse.json({ error: "title, slug, and body_markdown required" }, { status: 400 });

  }



  const record = await cmsUpsert({

    content_type: contentType === "procedure" ? "procedure" : "article",

    slug,

    status: "draft",

    data: {

      title,

      slug,

      category: body.category ?? "establishment",

      summary: body.summary ?? "",

      telugu_summary: body.telugu_summary ?? "",

      status: "draft",

      detail_level: "expert",

      audience: "beginner-to-advanced",

      author: "OfficeMitra",

      published_at: now,

      updated_at: now,

      generated_by: body.agentId,

    },

    body: markdown,

  });



  revalidatePath(contentType === "procedure" ? "/procedures" : "/knowledge");

  revalidatePath(`/admin/content/${contentType === "procedure" ? "procedure" : "article"}`);



  await logAdminAction("agent_save_draft", { agent: body.agentId ?? "", slug, type: contentType });



  return NextResponse.json({

    ok: true,

    id: record.id,

    slug: record.slug,

    contentType,

    editUrl: `/admin/content/${contentType === "procedure" ? "procedure" : "article"}`,

  });

}


