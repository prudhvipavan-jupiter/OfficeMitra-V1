import { AdminGuideDashboard } from "@/components/admin/AdminGuideDashboard";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Admin Guide",
  description: "Detailed how-to for every OfficeMitra admin module, workflows, and Telegram bot setup.",
  path: "/admin/guide",
});

export default function AdminGuidePage() {
  return <AdminGuideDashboard />;
}
