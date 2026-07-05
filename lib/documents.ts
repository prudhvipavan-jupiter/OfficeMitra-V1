import fs from "fs";
import path from "path";
import { readJsonFile } from "@/lib/read-json-file";
import type { DocumentRecord, DocumentType } from "@/lib/documents-shared";

export type { DocumentRecord, DocumentType } from "@/lib/documents-shared";
export {
  documentTypeLabels,
  getDocumentGoLinks,
  getGoirPortalUrl,
} from "@/lib/documents-shared";

const metadataPath = path.join(
  process.cwd(),
  "content",
  "documents",
  "metadata.json"
);

export function getDocuments(): DocumentRecord[] {
  if (!fs.existsSync(metadataPath)) return [];
  const data = readJsonFile<DocumentRecord[]>(metadataPath, []);
  return data.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getDocumentById(id: string): DocumentRecord | undefined {
  return getDocuments().find((d) => d.id === id);
}

export function filterDocuments(
  filters: {
    department?: string;
    year?: string;
    category?: string;
    type?: string;
    q?: string;
  },
  source?: DocumentRecord[]
): DocumentRecord[] {
  let docs = source ?? getDocuments();

  if (filters.department) {
    docs = docs.filter((d) =>
      d.department.toLowerCase().includes(filters.department!.toLowerCase())
    );
  }
  if (filters.year) {
    docs = docs.filter((d) => d.year === parseInt(filters.year!, 10));
  }
  if (filters.category) {
    docs = docs.filter((d) => d.category === filters.category);
  }
  if (filters.type) {
    docs = docs.filter((d) => d.type === filters.type);
  }
  if (filters.q) {
    const q = filters.q.toLowerCase();
    docs = docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.subject.toLowerCase().includes(q) ||
        d.number.toLowerCase().includes(q)
    );
  }

  return docs;
}
