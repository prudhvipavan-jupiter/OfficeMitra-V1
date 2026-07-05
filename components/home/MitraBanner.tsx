import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { getTranslations } from "@/lib/i18n/server";
import { isMitraPublicEnabled } from "@/lib/mitra/config";

export async function MitraBanner() {
  if (!isMitraPublicEnabled()) return null;

  const { dict: t } = await getTranslations();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 py-12 text-white md:py-14">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, #fbbf24 0%, transparent 50%), radial-gradient(circle at 80% 20%, #22d3ee 0%, transparent 40%)`,
        }}
        aria-hidden
      />
      <Container className="relative">
        <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:text-left">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-500 to-gold-700 shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-400">{t.mitra.badge}</p>
            <h2 className="mt-2 text-2xl font-bold md:text-3xl">{t.mitra.bannerTitle}</h2>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-navy-100">{t.mitra.bannerDesc}</p>
          </div>
          <Link
            href="/mitra"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gold-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-gold-500"
          >
            {t.mitra.tryNow}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
