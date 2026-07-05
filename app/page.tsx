import { HeroSection } from "@/components/home/HeroSection";
import { ExpertBanner } from "@/components/home/ExpertBanner";
import { FeaturedDocuments } from "@/components/home/FeaturedDocuments";
import { LatestUpdates } from "@/components/home/LatestUpdates";
import { OneStopHub } from "@/components/home/OneStopHub";
import { PopularProcedures } from "@/components/home/PopularProcedures";
import { TrustSection } from "@/components/home/TrustSection";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "One Stop Platform for AP Government Staff",
  description:
    "OfficeMitra V1 — knowledge, procedures, documents, community, FAQ, tools, official portals, and expert guidance for Andhra Pradesh ministerial staff.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <OneStopHub />
      <PopularProcedures />
      <LatestUpdates />
      <FeaturedDocuments />
      <TrustSection />
      <ExpertBanner />
    </>
  );
}
