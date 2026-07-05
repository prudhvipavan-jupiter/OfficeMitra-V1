import { Suspense } from "react";
import { AgentToolsDashboard } from "@/components/admin/AgentToolsDashboard";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Agent Studio",
  description: "OfficeMitra AI agent tools for content writing, review, SEO, and CMS workflows.",
  path: "/admin/agents",
});

export default function AdminAgentsPage() {
  return (
    <Suspense
      fallback={
        <div className="jarvis-content mx-auto max-w-[1400px] px-4 py-12 text-slate-400">
          Loading Agent Studio…
        </div>
      }
    >
      <AgentToolsDashboard />
    </Suspense>
  );
}
