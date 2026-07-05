export type DocumentType = "go" | "circular" | "manual" | "checklist" | "form";

export interface DocumentRecord {
  id: string;
  title: string;
  type: DocumentType;
  number: string;
  date: string;
  department: string;
  category: string;
  year: number;
  subject: string;
  related_articles: string[];
  related_procedures?: string[];
  file?: string;
  goir_url?: string;
  goir_search?: string;
}

export const documentTypeLabels: Record<DocumentType, string> = {
  go: "Government Order",
  circular: "Circular",
  manual: "Manual",
  checklist: "Checklist",
  form: "Form",
};

export function getGoirPortalUrl(): string {
  return "https://goir.ap.gov.in/";
}

/** GOIR opens in browser; search term shown to staff for manual lookup on portal. */
export function getDocumentGoLinks(doc: DocumentRecord): {
  portal: string;
  searchHint: string;
} {
  return {
    portal: doc.goir_url || getGoirPortalUrl(),
    searchHint: doc.goir_search || doc.title.replace(/ — GO Reference Pack$/i, ""),
  };
}
