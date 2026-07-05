import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isAdminAuthenticated } from "@/lib/auth";
import { logAdminAction } from "@/lib/admin-log";
import { createNexusJob } from "@/lib/nexus/store";
import { NEXUS_MAX_BATCH } from "@/lib/nexus/types";
import type { ArticleCategory } from "@/lib/categories";
import type { NexusContentType } from "@/lib/nexus/types";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    topics?: string[];
    category?: string;
    content_type?: NexusContentType;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rawTopics = Array.isArray(body.topics)
    ? body.topics.map((t) => String(t).trim()).filter(Boolean)
    : [];

  if (rawTopics.length === 0) {
    return NextResponse.json({ error: "Add at least one topic" }, { status: 400 });
  }
  if (rawTopics.length > NEXUS_MAX_BATCH) {
    return NextResponse.json(
      { error: `Maximum ${NEXUS_MAX_BATCH} topics per batch` },
      { status: 400 }
    );
  }

  const category = (body.category ?? "establishment") as ArticleCategory;
  const content_type = (body.content_type ?? "article") as NexusContentType;
  const batch_id = randomUUID();

  const jobs = [];
  for (const topic of rawTopics) {
    jobs.push(
      await createNexusJob({
        batch_id,
        topic,
        category,
        content_type,
      })
    );
  }

  await logAdminAction("nexus_batch_create", {
    batch_id,
    count: String(jobs.length),
    topics: rawTopics.join("|").slice(0, 500),
  });

  return NextResponse.json({ ok: true, batch_id, jobs });
}
