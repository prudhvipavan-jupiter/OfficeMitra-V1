"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useTranslations } from "@/components/i18n/LanguageProvider";
import type { DocumentRecord } from "@/lib/documents-shared";
import { getDocumentGoLinks } from "@/lib/documents-shared";

export function DocumentGoActions({ doc }: { doc: DocumentRecord }) {
  const t = useTranslations();
  const [copied, setCopied] = useState(false);
  const { portal, searchHint } = getDocumentGoLinks(doc);

  async function copySearchHint() {
    try {
      await navigator.clipboard.writeText(searchHint);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-lg border border-dashed border-navy-200 bg-navy-50/80 px-3 py-2 text-xs text-navy-800">
        <p className="font-semibold text-navy-900">{t.documents.goirSearchLabel}</p>
        <p className="mt-1 leading-relaxed">{searchHint}</p>
        <button
          type="button"
          onClick={copySearchHint}
          className="mt-2 inline-flex items-center gap-1 rounded-md border border-navy-200 bg-white px-2 py-1 font-medium text-navy-700 hover:bg-navy-50"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? t.documents.copied : t.documents.copySearchTerm}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {doc.file && (
          <a
            href={doc.file}
            download={doc.file.endsWith(".pdf") ? undefined : true}
            target={doc.file.endsWith(".pdf") ? "_blank" : undefined}
            rel={doc.file.endsWith(".pdf") ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-2 rounded-md bg-navy-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-navy-600"
          >
            {t.documents.downloadGoCopy}
          </a>
        )}
        <a
          href={portal}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-navy-200 px-3 py-1.5 text-sm font-medium text-navy-700 hover:bg-navy-50"
        >
          <ExternalLink className="h-4 w-4" />
          {t.documents.openGoir}
        </a>
      </div>
    </div>
  );
}
