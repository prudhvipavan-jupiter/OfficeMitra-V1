import Link from "next/link";
import { ArrowRight, FileText, Shield } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { getTranslations } from "@/lib/i18n/server";
import { getGoirPortalUrl } from "@/lib/documents";

export async function GoDocumentsIntro() {
  const { dict: t } = await getTranslations();

  return (
    <section className="mb-10 rounded-2xl border border-gold-200 bg-gradient-to-br from-gold-50 via-white to-navy-50 p-6 md:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-navy-800 text-white">
          <FileText className="h-7 w-7" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-navy-900 md:text-2xl">{t.documents.goHubTitle}</h2>
          <p className="mt-2 leading-relaxed text-gray-700">{t.documents.goHubDesc}</p>
          <ul className="mt-4 space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
              {t.documents.goHubStep1}
            </li>
            <li className="flex gap-2">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
              {t.documents.goHubStep2}
            </li>
            <li className="flex gap-2">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
              {t.documents.goHubStep3}
            </li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={getGoirPortalUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-navy-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-700"
            >
              {t.documents.openGoir}
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/expert-assistance/topics"
              className="inline-flex items-center gap-2 rounded-lg border border-navy-200 px-4 py-2.5 text-sm font-semibold text-navy-800 hover:bg-white"
            >
              {t.expertTopics.browseAll}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
