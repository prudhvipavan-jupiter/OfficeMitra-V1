import Link from "next/link";
import { ExpertTopicsBrowser } from "@/components/expert/ExpertTopicsBrowser";
import { Container } from "@/components/ui/Container";
import { getExpertTopics } from "@/lib/expert/topics";
import { getTranslations } from "@/lib/i18n/server";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Expert Topics — 100+ Health Department Cases",
  description:
    "Browse 100+ unique expert assistance topics for AP Health Department staff — guides, procedures, GO packs, and one-click expert requests.",
  path: "/expert-assistance/topics",
});

export default async function ExpertTopicsPage() {
  const [{ dict: t }, topics] = await Promise.all([getTranslations(), Promise.resolve(getExpertTopics())]);

  return (
    <Container className="py-10">
      <nav className="text-sm text-gray-500">
        <Link href="/expert-assistance" className="hover:text-navy-700">
          {t.nav.expertAssistance}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-navy-800">{t.expertTopics.pageTitle}</span>
      </nav>
      <h1 className="mt-4 text-3xl font-bold text-navy-900">{t.expertTopics.pageTitle}</h1>
      <p className="mt-3 max-w-3xl text-lg text-gray-600">{t.expertTopics.pageSubtitle}</p>
      <div className="mt-10">
        <ExpertTopicsBrowser topics={topics} />
      </div>
    </Container>
  );
}
