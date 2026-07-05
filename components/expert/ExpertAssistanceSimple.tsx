import Link from "next/link";
import { Mail, MessageCircle, Shield } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { getTranslations } from "@/lib/i18n/server";

export async function ExpertAssistanceSimple() {
  const { dict: t } = await getTranslations();

  return (
    <>
      <section className="hero-gradient relative overflow-hidden px-4 py-14 text-white md:py-20">
        <Container narrow className="relative text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-gold-400">
            {t.expertBanner.badge}
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
            {t.expertHub.heroTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-navy-100 md:text-lg">
            {t.expertHub.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-gold-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-gold-500"
            >
              <Mail className="h-5 w-5" />
              Contact us for guidance
            </Link>
            <Link
              href="/community"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/20"
            >
              <MessageCircle className="h-5 w-5" />
              Ask in Staff Community
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-16">
        <Container narrow>
          <div className="rounded-2xl border border-gold-200 bg-gold-50/50 p-8 text-center">
            <Shield className="mx-auto h-10 w-10 text-gold-700" />
            <h2 className="mt-4 text-xl font-bold text-navy-900">Expert Assistance — coming this week</h2>
            <p className="mx-auto mt-3 max-w-lg text-gray-700">
              The full request form with draft review and rule clarification launches in V1.1. For urgent
              questions today, use{" "}
              <Link href="/contact" className="font-semibold text-navy-800 underline">
                Contact
              </Link>{" "}
              or post in{" "}
              <Link href="/community" className="font-semibold text-navy-800 underline">
                Staff Community
              </Link>
              .
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
