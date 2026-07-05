import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  MessageCircle,
  Scale,
  Shield,
  Users,
  Wallet,
  FolderCheck,
} from "lucide-react";
import { ExpertForm } from "@/components/expert/ExpertForm";
import { Container } from "@/components/ui/Container";
import { getTranslations } from "@/lib/i18n/server";
import type { ServiceType } from "@/lib/expert-assistance";

const SERVICE_ICONS: Record<ServiceType, typeof FileText> = {
  draft_review: FileText,
  rule_clarification: Scale,
  establishment_guidance: Users,
  finance_guidance: Wallet,
  document_review: FolderCheck,
};

const SERVICE_KEYS: ServiceType[] = [
  "draft_review",
  "rule_clarification",
  "establishment_guidance",
  "finance_guidance",
  "document_review",
];

export async function ExpertAssistanceHub() {
  const { dict: t } = await getTranslations();
  const h = t.expertHub;

  return (
    <>
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden px-4 py-14 text-white md:py-20">
        <Container narrow className="relative text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-gold-400">
            {t.expertBanner.badge}
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl lg:text-[2.5rem]">
            {h.heroTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-navy-100 md:text-lg">
            {h.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="#request"
              className="inline-flex items-center gap-2 rounded-xl bg-gold-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-gold-500"
            >
              <MessageCircle className="h-5 w-5" />
              {h.heroCta}
            </Link>
            <Link
              href="/expert-assistance/track"
              className="inline-flex items-center rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/20"
            >
              {h.heroTrack}
            </Link>
            <Link
              href="/expert-assistance/topics"
              className="inline-flex items-center gap-2 rounded-xl border border-gold-400/50 bg-gold-600/20 px-6 py-3.5 text-sm font-semibold backdrop-blur-sm transition hover:bg-gold-600/30"
            >
              {h.browseTopics}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>

      {/* Overview */}
      <section id="overview" className="border-b border-navy-100 py-14 md:py-16">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-navy-900 md:text-3xl">{h.overviewTitle}</h2>
            <p className="mt-2 text-gray-600">{h.overviewSubtitle}</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {(
              [
                { key: "personalized" as const, icon: MessageCircle },
                { key: "practitioners" as const, icon: Shield },
                { key: "private" as const, icon: Clock },
              ] as const
            ).map(({ key, icon: Icon }) => (
              <div
                key={key}
                className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-navy-900">
                  {h.pillars[key].title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {h.pillars[key].description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Services */}
      <section id="services" className="section-alt border-y border-navy-100 py-14 md:py-16">
        <Container>
          <h2 className="text-2xl font-bold text-navy-900 md:text-3xl">{h.servicesTitle}</h2>
          <p className="mt-2 max-w-2xl text-gray-600">{h.servicesSubtitle}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICE_KEYS.map((key) => {
              const Icon = SERVICE_ICONS[key];
              return (
                <div
                  key={key}
                  className="rounded-xl border border-navy-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 shrink-0 text-navy-700" aria-hidden />
                    <h3 className="font-semibold text-navy-900">{t.serviceTypes[key]}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    {h.serviceDetails[key]}
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-14 md:py-16">
        <Container narrow>
          <h2 className="text-2xl font-bold text-navy-900 md:text-3xl">{h.howTitle}</h2>
          <p className="mt-2 text-gray-600">{h.howSubtitle}</p>
          <ol className="mt-10 space-y-6">
            {(["step1", "step2", "step3", "step4"] as const).map((step, i) => (
              <li key={step} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-800 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-navy-900">{h.steps[step].title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    {h.steps[step].description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Eligibility */}
      <section className="section-alt border-y border-navy-100 py-14 md:py-16">
        <Container narrow>
          <h2 className="text-2xl font-bold text-navy-900 md:text-3xl">{h.eligibilityTitle}</h2>
          <p className="mt-3 text-gray-700">{h.eligibilityIntro}</p>
          <ul className="mt-6 space-y-3">
            {Object.values(h.eligibilityItems).map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-xl border border-navy-100 bg-white p-4 text-sm text-gray-600">
            {h.eligibilityNote}
          </p>
        </Container>
      </section>

      {/* When to use */}
      <section className="py-14 md:py-16">
        <Container>
          <h2 className="text-2xl font-bold text-navy-900 md:text-3xl">{h.whenTitle}</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {(["articles", "community", "expert"] as const).map((key) => {
              const item = h.whenItems[key];
              const isExpert = key === "expert";
              return (
                <div
                  key={key}
                  className={`rounded-2xl border p-6 ${
                    isExpert
                      ? "border-gold-300 bg-gradient-to-br from-gold-50 to-white ring-1 ring-gold-200"
                      : "border-navy-100 bg-white"
                  }`}
                >
                  <h3 className="font-semibold text-navy-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.description}</p>
                  <Link
                    href={item.href}
                    className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold ${
                      isExpert ? "text-gold-700" : "text-navy-700"
                    } hover:underline`}
                  >
                    {item.link}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section id="faq" className="section-alt border-y border-navy-100 py-14 md:py-16">
        <Container narrow>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-navy-700" />
            <h2 className="text-2xl font-bold text-navy-900 md:text-3xl">{h.faqTitle}</h2>
          </div>
          <dl className="mt-8 space-y-6">
            {Object.values(h.faqItems).map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-navy-100 bg-white p-5">
                <dt className="font-semibold text-navy-900">{q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-gray-600">{a}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* Request form */}
      <section id="request" className="py-14 md:py-16">
        <Container narrow>
          <h2 className="text-2xl font-bold text-navy-900 md:text-3xl">{h.formSectionTitle}</h2>
          <p className="mt-2 text-gray-600">{h.formSectionSubtitle}</p>

          <div
            role="note"
            className="mt-6 rounded-xl border border-gold-300 bg-gold-100 p-5 text-sm text-navy-900"
          >
            <strong>Notice:</strong> {t.expert.notice}
          </div>

          <div className="mt-4 rounded-lg border border-navy-100 bg-navy-50 p-4 text-sm text-navy-800">
            <strong>{t.expert.responseTime}</strong> {t.expert.responseDays}{" "}
            <strong>{t.expert.referenceFormat}</strong>{" "}
            <code className="rounded bg-white px-1">OM-EA-YYYY-XXXXX</code>
            {" · "}
            <Link href="/expert-assistance/track" className="font-medium underline">
              {t.expert.trackExisting}
            </Link>
          </div>

          <div className="mt-10">
            <ExpertForm />
          </div>
        </Container>
      </section>
    </>
  );
}
