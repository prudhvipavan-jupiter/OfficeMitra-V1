import Link from "next/link";
import { ArrowRight, FolderKanban, Users } from "lucide-react";
import { ADMIN_MODULES } from "@/lib/admin/modules";
import { CMS_TYPE_LABELS, type CmsContentType } from "@/lib/cms/types";
import { cmsList } from "@/lib/cms/store";
import { isDatabaseReachable } from "@/lib/db/resilience";

const contentTypes: CmsContentType[] = ["article", "procedure", "update", "document", "faq"];

export default async function AdminDashboard() {
  const dbOk = await isDatabaseReachable();
  const counts = dbOk
    ? await Promise.all(contentTypes.map(async (type) => (await cmsList(type)).filter((i) => i.status === "published").length))
    : contentTypes.map(() => 0);
  const totalPublished = counts.reduce((a, b) => a + b, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">OfficeMitra V1</p>
        <h1 className="mt-1 text-2xl font-bold text-navy-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          {totalPublished} published items across knowledge, procedures, updates, documents, and FAQ.
        </p>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {ADMIN_MODULES.filter((m) => m.id !== "command").map((mod) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.id}
              href={mod.href}
              className="group rounded-2xl border border-navy-100 bg-white p-6 shadow-sm transition hover:border-gold-300 hover:shadow-md"
            >
              <Icon className="h-8 w-8 text-navy-700" />
              <h2 className="mt-3 text-lg font-semibold text-navy-900">{mod.name}</h2>
              <p className="mt-1 text-sm text-gray-600">{mod.tagline}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold-700 group-hover:text-gold-800">
                Open
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          );
        })}
      </div>

      <section className="rounded-2xl border border-navy-100 bg-navy-50/50 p-6">
        <h2 className="font-semibold text-navy-900">Published content</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {contentTypes.map((type, i) => (
            <li key={type} className="flex justify-between text-gray-700">
              <span>{CMS_TYPE_LABELS[type]}</span>
              <span className="font-medium text-navy-900">{counts[i]}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/admin/content"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-navy-800 hover:text-gold-700"
        >
          <FolderKanban className="h-4 w-4" />
          Manage all content
        </Link>
      </section>

      <section className="mt-6 rounded-2xl border border-gold-200 bg-gold-50/60 p-6">
        <h2 className="font-semibold text-navy-900">Tomorrow launch checklist</h2>
        <p className="mt-2 text-sm text-gray-700">
          See <code className="rounded bg-white px-1.5 py-0.5 text-xs">docs/V1-LAUNCH.md</code> for the full list.
          Publish at least 10 articles, 5 documents, and 10 FAQ entries before going live.
        </p>
        <Link
          href="/admin/people"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-navy-800 hover:text-gold-700"
        >
          <Users className="h-4 w-4" />
          Moderate community queue
        </Link>
      </section>
    </div>
  );
}
