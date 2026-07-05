import fs from "fs";
import path from "path";
import { clearAllOperationalData } from "@/lib/admin/clear-data";
import { forceClearAllCms } from "@/lib/admin/clear-cms";
import { createOperationalBackup } from "@/lib/admin/backup";
import { setCmsSyncPaused } from "@/lib/cms/meta";
import { readJsonFile, writeJsonFile } from "@/lib/read-json-file";

const CONTENT_ROOT = path.join(process.cwd(), "content");
const MARKDOWN_DIRS = ["articles", "procedures", "updates"] as const;

function deleteMarkdownTree(dir: string): number {
  if (!fs.existsSync(dir)) return 0;
  let removed = 0;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      removed += deleteMarkdownTree(full);
      if (fs.readdirSync(full).length === 0) {
        fs.rmdirSync(full);
      }
    } else if (entry.name.endsWith(".md") && entry.name !== "ORIGINAL-CONTENT-NOTICE.md") {
      fs.unlinkSync(full);
      removed += 1;
    }
  }

  return removed;
}

function writeJson(relativePath: string, data: unknown): void {
  writeJsonFile(path.join(CONTENT_ROOT, relativePath), data);
}

function deletePdfs(dir: string): number {
  if (!fs.existsSync(dir)) return 0;
  let removed = 0;
  for (const name of fs.readdirSync(dir)) {
    if (name.endsWith(".pdf")) {
      fs.unlinkSync(path.join(dir, name));
      removed += 1;
    }
  }
  return removed;
}

function updateManifest(): void {
  const manifestPath = path.join(CONTENT_ROOT, "MANIFEST.json");
  const base = readJsonFile<Record<string, unknown>>(manifestPath, {});
  writeJson("MANIFEST.json", {
    ...base,
    generated_at: new Date().toISOString(),
    counts: {
      articles: 0,
      procedures: 0,
      updates: 0,
      documents: 0,
      templates: 0,
      faq: 0,
      glossary: 0,
    },
    notice: "Site reset — add new content via Admin CMS, NeXus, or Agent Studio.",
  });
}

export interface ScratchResetResult {
  backup_id?: string;
  backup_label?: string;
  files: Record<string, number>;
  database: Record<string, number>;
  cmsDbError?: string;
}

/** Remove all git content, downloads, and database records — fresh start. */
export async function clearAllWebsiteContent(options?: {
  backupFirst?: boolean;
  backupLabel?: string;
}): Promise<ScratchResetResult> {
  let backup_id: string | undefined;
  let backup_label: string | undefined;

  if (options?.backupFirst !== false) {
    try {
      const backup = await createOperationalBackup(
        options?.backupLabel ?? "Full site backup before scratch reset"
      );
      backup_id = backup.id;
      backup_label = backup.label;
    } catch (err) {
      console.error("[ScratchReset] backup failed (continuing):", err);
    }
  }

  const files: Record<string, number> = {};

  for (const section of MARKDOWN_DIRS) {
    files[`markdown:${section}`] = deleteMarkdownTree(path.join(CONTENT_ROOT, section));
  }

  writeJson("documents/metadata.json", []);
  writeJson("templates/metadata.json", []);
  writeJson("faq/items.json", []);
  writeJson("glossary/terms.json", []);
  files["documents/metadata.json"] = 0;
  files["templates/metadata.json"] = 0;
  files["faq/items.json"] = 0;
  files["glossary/terms.json"] = 0;

  files["pdfs:documents"] = deletePdfs(path.join(process.cwd(), "public", "downloads", "documents"));
  files["pdfs:templates"] = deletePdfs(path.join(process.cwd(), "public", "downloads", "templates"));

  updateManifest();

  await setCmsSyncPaused(true);
  const database = await clearAllOperationalData();
  const cms = await forceClearAllCms();

  return { backup_id, backup_label, files, database: { ...database, ...cms.cleared }, cmsDbError: cms.dbError };
}
