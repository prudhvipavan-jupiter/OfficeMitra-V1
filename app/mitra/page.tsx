import { redirect } from "next/navigation";
import { MitraChat } from "@/components/mitra/MitraChat";
import { Container } from "@/components/ui/Container";
import { getTranslations } from "@/lib/i18n/server";
import { isMitraPublicEnabled } from "@/lib/mitra/config";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Mitra AI — Ask Office Questions",
  description:
    "Ask Mitra AI about AP government procedures, leave, GPF, CFMS, establishment work, and more. Grounded in OfficeMitra expert content.",
  path: "/mitra",
});

export default async function MitraPage() {
  if (!isMitraPublicEnabled()) {
    redirect("/");
  }

  const { dict: t } = await getTranslations();

  return (
    <Container narrow className="py-8 md:py-12">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-navy-900 dark:text-white">{t.mitra.pageTitle}</h1>
        <p className="mt-2 text-gray-600 dark:text-navy-200">{t.mitra.pageSubtitle}</p>
      </div>
      <MitraChat fullPage />
    </Container>
  );
}
