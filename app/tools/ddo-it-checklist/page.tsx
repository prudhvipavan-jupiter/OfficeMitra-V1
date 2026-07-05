import { DdoItChecklistPage } from "@/components/tools/DdoItChecklist";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "DDO IT Declaration Checklist",
  description: "Income tax DDO declaration checklist for February CFMS pay bills.",
  path: "/tools/ddo-it-checklist",
});

export default function Page() {
  return <DdoItChecklistPage />;
}
