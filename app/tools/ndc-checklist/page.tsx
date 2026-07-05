import { NdcChecklistPage } from "@/components/tools/NdcChecklist";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "NDC Checklist — Non-Drawal Certificate",
  description: "Checklist before issuing Non-Drawal Certificate for AP government employees.",
  path: "/tools/ndc-checklist",
});

export default function Page() {
  return <NdcChecklistPage />;
}
