import Link from "next/link";
import {
  BookOpen,
  FolderOpen,
  HelpCircle,
  ListTodo,
  Newspaper,
} from "lucide-react";
import { CMS_TYPE_LABELS, type CmsContentType } from "@/lib/cms/types";
import { getGitContentCounts } from "@/lib/cms/git-counts";
import { cmsStorageMode } from "@/lib/cms/seed";
import { cmsList } from "@/lib/cms/store";
import { getDatabaseStatus, isDatabaseReachable } from "@/lib/db/resilience";
import { ProductionResetButton } from "@/components/admin/ProductionResetButton";
import { BackupListPanel } from "@/components/admin/BackupListPanel";
import { ScratchResetButton } from "@/components/admin/ScratchResetButton";

const types: { type: CmsContentType; icon: typeof BookOpen; href: string }[] = [
  { type: "article", icon: BookOpen, href: "/admin/content/article" },
  { type: "procedure", icon: ListTodo, href: "/admin/content/procedure" },
  { type: "update", icon: Newspaper, href: "/admin/content/update" },
  { type: "document", icon: FolderOpen, href: "/admin/content/document" },
  { type: "faq", icon: HelpCircle, href: "/admin/content/faq" },
];

export default async function AdminContentHubPage() {
  const dbReachable = await isDatabaseReachable();
  const dbStatus = getDatabaseStatus();
  const gitCounts = getGitContentCounts();
  const counts = dbReachable
    ? await Promise.all(types.map(async ({ type }) => (await cmsList(type, { includeDeleted: true })).length))
    : types.map(({ type }) => gitCounts[type]);
  const storage = cmsStorageMode();
  const countsFromGit = !dbReachable;

  return (
    <div className="jarvis-content mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="jarvis-label text-cyan-400/90">Content management</p>
        <h1 className="text-2xl font-bold text-white">CMS Control</h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage everything visitors see — stored in {storage}.
        </p>
      </header>

      {dbStatus === "unavailable" && (
        <div className="jarvis-alert critical mb-6">
          <strong>Database temporarily unavailable</strong> — public pages still serve from deployed files. Upgrade Neon
          or wait for quota reset, then sync from Review Hub.
        </div>
      )}

      <div className="jarvis-panel mb-6 p-4 text-sm text-slate-300">
        <strong className="text-cyan-200">Automated sync:</strong> Empty sections sync from project files on start. Daily
        cron keeps CMS in sync. Edit here — changes go live when status is <em>published</em>.
      </div>

      <BackupListPanel />

      <ProductionResetButton />

      <ScratchResetButton />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {types.map(({ type, icon: Icon, href }, i) => (
          <Link key={type} href={href} className="jarvis-module-card group block">
            <Icon className="h-7 w-7 text-cyan-400/80" />
            <h2 className="mt-3 font-semibold text-white">{CMS_TYPE_LABELS[type]}</h2>
            <p className="mt-1 text-sm text-slate-400">
              {counts[i]} items{countsFromGit ? " in deployed files" : " in CMS"}
            </p>
            <span className="mt-3 inline-flex text-sm font-semibold text-cyan-400 group-hover:text-cyan-300">
              Manage →
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <Link href="/admin/people" className="jarvis-module-card block max-w-md">
          <strong className="text-white">People Queue</strong>
          <p className="mt-1 text-sm text-slate-400">Staff community — review and reply to questions.</p>
        </Link>
      </div>
    </div>
  );
}
