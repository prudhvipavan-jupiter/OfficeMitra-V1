import { ExpertAssistanceSimple } from "@/components/expert/ExpertAssistanceSimple";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Health Department Expert Assistance",
  description:
    "Personalized administrative guidance from experienced Health Department practitioners — contact OfficeMitra for establishment, finance, and document guidance.",
  path: "/expert-assistance",
});

export default function ExpertAssistancePage() {
  return <ExpertAssistanceSimple />;
}
