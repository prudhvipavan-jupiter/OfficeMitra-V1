import { DocumentGoActions } from "@/components/documents/DocumentGoActions";
import { GoDocumentsIntro } from "@/components/documents/GoDocumentsIntro";
import Link from "next/link";
import { FileText } from "lucide-react";

import { Container, SectionHeading } from "@/components/ui/Container";
import { filterDocuments, type DocumentType } from "@/lib/documents";
import { loadDocuments } from "@/lib/cms/loaders";

import { getTranslations } from "@/lib/i18n/server";

import type { ArticleCategory } from "@/lib/categories";

import { formatDate } from "@/lib/utils";

import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({

  title: "Document Library",

  description: "Search and download GOs, circulars, manuals, and forms for Andhra Pradesh government administration.",

  path: "/documents",

});



interface PageProps {

  searchParams: Promise<{

    department?: string;

    year?: string;

    category?: string;

    type?: string;

    q?: string;

    id?: string;

  }>;

}



export default async function DocumentsPage({ searchParams }: PageProps) {

  const params = await searchParams;

  const { dict: t } = await getTranslations();

  const allDocs = await loadDocuments();
  const documents = filterDocuments(params, allDocs);

  const years = [...new Set(allDocs.map((d) => d.year))].sort((a, b) => b - a);

  const categoryKeys = Object.keys(t.categories) as ArticleCategory[];

  const docTypeKeys = Object.keys(t.docTypes) as DocumentType[];



  return (

    <Container className="py-10">

      <SectionHeading title={t.documents.title} subtitle={t.documents.subtitle} />

      <GoDocumentsIntro />

      <form method="get" className="mb-8 grid gap-4 rounded-xl border border-navy-100 bg-navy-50 p-5 sm:grid-cols-2 lg:grid-cols-5">

        <input

          name="q"

          defaultValue={params.q}

          placeholder={t.documents.searchPlaceholder}

          className="input-field lg:col-span-2"

        />

        <select

          name="category"

          defaultValue={params.category ?? ""}

          className="input-field"

        >

          <option value="">{t.documents.allCategories}</option>

          {categoryKeys.map((k) => (

            <option key={k} value={k}>

              {t.categories[k]}

            </option>

          ))}

        </select>

        <select

          name="year"

          defaultValue={params.year ?? ""}

          className="input-field"

        >

          <option value="">{t.documents.allYears}</option>

          {years.map((y) => (

            <option key={y} value={y}>

              {y}

            </option>

          ))}

        </select>

        <select

          name="type"

          defaultValue={params.type ?? ""}

          className="input-field"

        >

          <option value="">{t.documents.allTypes}</option>

          {docTypeKeys.map((k) => (

            <option key={k} value={k}>

              {t.docTypes[k]}

            </option>

          ))}

        </select>

        <button

          type="submit"

          className="rounded-lg bg-navy-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-navy-600 sm:col-span-2 lg:col-span-1"

        >

          {t.common.filter}

        </button>

      </form>



      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

        {documents.map((doc) => (

          <article

            key={doc.id}

            id={doc.id}

            className={`rounded-xl border bg-white p-5 shadow-sm ${

              params.id === doc.id

                ? "border-gold-600 ring-2 ring-gold-100"

                : "border-navy-100"

            }`}

          >

            <div className="flex gap-3">

              <FileText className="h-8 w-8 shrink-0 text-navy-700" />

              <div>

                <span className="text-xs font-medium text-gold-600">

                  {t.docTypes[doc.type as DocumentType]}

                </span>

                <h3 className="font-semibold text-navy-900">{doc.title ?? doc.number}</h3>

                <p className="mt-0.5 text-xs font-medium text-navy-600">{doc.number}</p>

                <p className="mt-1 text-sm text-gray-600 line-clamp-3">{doc.subject}</p>

                <p className="mt-2 text-xs text-gray-500">

                  {formatDate(doc.date)} · {doc.department}

                </p>

              </div>

            </div>

            {doc.related_articles.length > 0 && (

              <div className="mt-3 text-xs text-gray-500">

                {t.documents.related}{" "}

                {doc.related_articles.map((slug) => (

                  <Link

                    key={slug}

                    href={`/knowledge/${slug}`}

                    className="text-navy-700 hover:underline"

                  >

                    {slug}

                  </Link>

                ))}

              </div>

            )}

            {doc.related_procedures && doc.related_procedures.length > 0 && (
              <div className="mt-2 text-xs">
                <Link
                  href={`/procedures/${doc.related_procedures[0]}`}
                  className="font-medium text-navy-700 hover:underline"
                >
                  {t.documents.viewProcedure}
                </Link>
              </div>
            )}

            <DocumentGoActions doc={doc} />
          </article>

        ))}

      </div>



      {documents.length === 0 && (

        <p className="text-center text-gray-500">{t.documents.empty}</p>

      )}

    </Container>

  );

}

