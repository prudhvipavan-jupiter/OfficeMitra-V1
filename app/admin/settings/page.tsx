import { AdminSettingsDashboard } from "@/components/admin/AdminSettingsDashboard";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Settings",
  description: "OfficeMitra admin settings — integrations, AI, CMS, and environment configuration.",
  path: "/admin/settings",
});

export default function AdminSettingsPage() {
  return <AdminSettingsDashboard />;
}
