import type { LucideIcon } from "lucide-react";
import { FolderKanban, LayoutDashboard, Settings, Users } from "lucide-react";

export type AdminModuleId = "command" | "content" | "community" | "settings";

export interface AdminModule {
  id: AdminModuleId;
  name: string;
  tagline: string;
  href: string;
  icon: LucideIcon;
  accent: string;
  badge?: string;
  features: string[];
}

/** OfficeMitra V1 admin — CMS, community, settings only. */
export const ADMIN_MODULES: AdminModule[] = [
  {
    id: "command",
    name: "Dashboard",
    tagline: "Quick links to CMS and community",
    href: "/admin",
    icon: LayoutDashboard,
    accent: "from-navy-800 to-navy-600",
    features: ["Content stats", "Community queue", "Launch checklist"],
  },
  {
    id: "content",
    name: "CMS Control",
    tagline: "Articles, procedures, updates, documents, FAQ",
    href: "/admin/content",
    icon: FolderKanban,
    accent: "from-sky-600 to-blue-600",
    features: ["Create & publish posts", "Upload PDFs & images", "Draft / published status"],
  },
  {
    id: "community",
    name: "People Queue",
    tagline: "Staff community moderation",
    href: "/admin/people",
    icon: Users,
    accent: "from-orange-600 to-red-500",
    features: ["Review questions", "Publish replies", "Mark resolved"],
  },
  {
    id: "settings",
    name: "Settings",
    tagline: "Environment and site configuration",
    href: "/admin/settings",
    icon: Settings,
    accent: "from-slate-600 to-gray-600",
    features: ["Admin password", "Database status", "Theme toggle"],
  },
];

export function getModuleById(id: AdminModuleId): AdminModule | undefined {
  return ADMIN_MODULES.find((m) => m.id === id);
}
