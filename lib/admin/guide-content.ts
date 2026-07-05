import type { AdminModuleId } from "@/lib/admin/modules";

export interface GuideStep {
  title: string;
  detail: string;
}

export interface GuideSection {
  id: string;
  title: string;
  moduleId?: AdminModuleId;
  href?: string;
  summary: string;
  whenToUse: string[];
  steps: GuideStep[];
  tips?: string[];
  warnings?: string[];
}

export interface GuideWorkflow {
  id: string;
  title: string;
  steps: string[];
}

export const ADMIN_GUIDE_INTRO = {
  title: "OfficeMitra V1 Admin — How To",
  subtitle: "Publish content, upload documents and images, and moderate staff community.",
  loginUrl: "/admin/login",
  productionUrl: "https://officemitra.vercel.app/admin",
};

export const ADMIN_GUIDE_SECTIONS: GuideSection[] = [
  {
    id: "getting-started",
    title: "Getting started",
    summary: "Sign in and open CMS Control to publish your first post.",
    whenToUse: ["First time in admin", "Training a new operator"],
    steps: [
      {
        title: "Open /admin/login",
        detail: "Use the password from ADMIN_PASSWORD in your environment.",
      },
      {
        title: "Go to CMS Control",
        detail: "Create articles, procedures, updates, documents, or FAQ entries. Set status to Published when ready.",
      },
      {
        title: "Moderate community",
        detail: "People Queue → approve staff questions and publish official replies.",
      },
    ],
  },
  {
    id: "command",
    title: "Dashboard",
    moduleId: "command",
    href: "/admin",
    summary: "Published content counts and quick links.",
    whenToUse: ["Daily check-in"],
    steps: [
      { title: "Review counts", detail: "See how many items are live in each section." },
      { title: "Open CMS or People", detail: "Jump to content management or community moderation." },
    ],
  },
  {
    id: "content",
    title: "CMS Control",
    moduleId: "content",
    href: "/admin/content",
    summary: "Articles, procedures, updates, documents (PDF), and FAQ.",
    whenToUse: ["Add or edit any public content"],
    steps: [
      { title: "Pick a section", detail: "Articles, Procedures, Updates, Documents, or FAQ." },
      { title: "New post", detail: "Fill title, category, markdown body. Upload cover image for articles." },
      { title: "Documents", detail: "Attach PDF — visitors download from /documents." },
      { title: "Publish", detail: "Set status to Published — content appears on the live site immediately." },
    ],
  },
  {
    id: "community",
    title: "People Queue",
    moduleId: "community",
    href: "/admin/people",
    summary: "Staff community Q&A moderation.",
    whenToUse: ["Review new community posts"],
    steps: [
      { title: "Community tab", detail: "Approve publishes to /community; resolve closes threads." },
      { title: "Add reply", detail: "Write an official-style answer before approving." },
    ],
  },
  {
    id: "settings",
    title: "Settings",
    moduleId: "settings",
    href: "/admin/settings",
    summary: "Environment checklist and database status.",
    whenToUse: ["Verify Neon connection", "Check required env vars before deploy"],
    steps: [
      { title: "Database", detail: "Ensure POSTGRES_URL is set on Vercel for CMS and community." },
      { title: "Admin password", detail: "ADMIN_PASSWORD must be set in production." },
    ],
  },
];

export const ADMIN_GUIDE_WORKFLOWS: GuideWorkflow[] = [
  {
    id: "launch-day",
    title: "Tomorrow launch checklist",
    steps: [
      "Publish 10+ articles, 5+ documents, 10+ FAQ in CMS",
      "Verify /community form submits and appears in People Queue",
      "Test /tools calculators on mobile",
      "Confirm /official-links opens correct portals",
      "Deploy with MITRA_AI_ENABLED=false",
    ],
  },
  {
    id: "daily-ops",
    title: "Daily operator checklist",
    steps: [
      "Dashboard — check published counts",
      "People Queue — community pending",
      "CMS — publish any drafts from the day",
    ],
  },
];

export const TELEGRAM_SETUP_STEPS: string[] = [];
