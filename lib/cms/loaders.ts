import type { Article, Procedure, UpdateEntry } from "@/lib/content";
import { getArticles as fileArticles, getProcedures as fileProcedures, getUpdates as fileUpdates } from "@/lib/content";
import type { DocumentRecord } from "@/lib/documents";
import { getDocuments as fileDocuments } from "@/lib/documents";
import type { FaqItem } from "@/lib/faq";
import { faqItems as fileFaq } from "@/lib/faq";
import type { GlossaryTerm } from "@/lib/glossary";
import { glossaryTerms as fileGlossary } from "@/lib/glossary";
import type { TemplateRecord } from "@/lib/templates";
import { getTemplates as fileTemplates } from "@/lib/templates";
import { isDatabaseEnabled } from "@/lib/db/client";
import { isDatabaseOutageCached } from "@/lib/db/resilience";
import { cmsFileUrl, cmsList } from "./store";
import type { CmsContentType } from "./types";
import { isNextBuildPhase } from "@/lib/runtime";

let bootPromise = isNextBuildPhase()
  ? Promise.resolve({})
  : import("./auto-sync").then(({ ensureCmsAutoSync }) => ensureCmsAutoSync());

async function ensureBootstrapped() {
  if (isNextBuildPhase()) return;
  await bootPromise;
}

/** Production uses Postgres CMS only — no git-file fallback when DB is configured. */
async function useCms(): Promise<boolean> {
  if (process.env.CMS_FORCE_EMPTY === "true") return false;
  if (isNextBuildPhase()) return false;
  if (!isDatabaseEnabled()) return false;
  if (isDatabaseOutageCached()) return false;
  await ensureBootstrapped();
  return true;
}

/** Load from CMS when DB is up; fall back to git files only on DB outage (not when CMS is intentionally empty). */
async function loadFromCmsOrFiles<T>(
  type: CmsContentType,
  fromCms: () => Promise<T[]>,
  fromFiles: () => T[] | Promise<T[]>
): Promise<T[]> {
  if (!(await useCms())) return fromFiles();
  try {
    return await fromCms();
  } catch (err) {
    console.error(`[OfficeMitra] CMS load failed for ${type}, using git files:`, err);
    return fromFiles();
  }
}

function resolveFileUrl(contentId: string, field: string): string {
  return `/api/cms/file/${contentId}/${field}`;
}

export async function loadDocuments(): Promise<DocumentRecord[]> {
  return loadFromCmsOrFiles(
    "document",
    async () => {
      const records = await cmsList("document", { status: "published" });
      return records.map((r) => {
        const doc = r.data as unknown as DocumentRecord;
        return {
          ...doc,
          file: doc.file?.startsWith("/api/cms/")
            ? doc.file
            : resolveFileUrl(r.id, "file") ?? doc.file,
        };
      });
    },
    fileDocuments
  );
}

export async function loadDocumentById(id: string): Promise<DocumentRecord | undefined> {
  const docs = await loadDocuments();
  return docs.find((d) => d.id === id);
}

export async function loadTemplates(): Promise<TemplateRecord[]> {
  return loadFromCmsOrFiles(
    "template",
    async () => {
      const records = await cmsList("template", { status: "published" });
      return records.map((r) => {
        const tpl = r.data as unknown as TemplateRecord;
        return {
          ...tpl,
          file_pdf: tpl.file_pdf?.startsWith("/api/cms/")
            ? tpl.file_pdf
            : resolveFileUrl(r.id, "file_pdf") ?? tpl.file_pdf,
          file_docx: tpl.file_docx?.startsWith("/api/cms/")
            ? tpl.file_docx
            : resolveFileUrl(r.id, "file_docx") ?? tpl.file_docx,
        };
      });
    },
    fileTemplates
  );
}

export async function loadArticles(): Promise<Article[]> {
  const items = await loadFromCmsOrFiles(
    "article",
    async () => {
      const records = await cmsList("article", { status: "published" });
      return records.map(
        (r) => ({ ...(r.data as unknown as Omit<Article, "content">), content: r.body ?? "" } as Article)
      );
    },
    fileArticles
  );
  return items.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
}

export async function loadArticleBySlug(slug: string): Promise<Article | undefined> {
  const articles = await loadArticles();
  return articles.find((a) => a.slug === slug);
}

export async function loadProcedures(): Promise<Procedure[]> {
  return loadFromCmsOrFiles(
    "procedure",
    async () => {
      const records = await cmsList("procedure", { status: "published" });
      return records.map(
        (r) => ({ ...(r.data as unknown as Omit<Procedure, "content">), content: r.body ?? "" } as Procedure)
      );
    },
    fileProcedures
  );
}

export async function loadProcedureBySlug(slug: string): Promise<Procedure | undefined> {
  const items = await loadProcedures();
  return items.find((p) => p.slug === slug);
}

export async function loadUpdates(): Promise<UpdateEntry[]> {
  const items = await loadFromCmsOrFiles(
    "update",
    async () => {
      const records = await cmsList("update", { status: "published" });
      return records.map(
        (r) => ({ ...(r.data as unknown as Omit<UpdateEntry, "content">), content: r.body ?? "" } as UpdateEntry)
      );
    },
    fileUpdates
  );
  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function loadUpdateBySlug(slug: string): Promise<UpdateEntry | undefined> {
  const items = await loadUpdates();
  return items.find((u) => u.slug === slug);
}

export async function loadFaqItems(): Promise<FaqItem[]> {
  return loadFromCmsOrFiles(
    "faq",
    async () => {
      const records = await cmsList("faq", { status: "published" });
      return records.map((r) => r.data as unknown as FaqItem);
    },
    () => fileFaq
  );
}

export async function loadGlossaryTerms(): Promise<GlossaryTerm[]> {
  return loadFromCmsOrFiles(
    "glossary",
    async () => {
      const records = await cmsList("glossary", { status: "published" });
      return records.map((r) => r.data as unknown as GlossaryTerm);
    },
    () => fileGlossary
  );
}

export { cmsFileUrl };
