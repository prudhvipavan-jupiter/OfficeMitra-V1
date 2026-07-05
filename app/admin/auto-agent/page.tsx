import { Suspense } from "react";
import { AutoAgentDashboard } from "@/components/admin/AutoAgentDashboard";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Auto Agent",
  description: "Autonomous AI agents for OfficeMitra — free LLM backends and local AutoGPT worker.",
  path: "/admin/auto-agent",
});

export default function AdminAutoAgentPage() {
  return (
    <Suspense
      fallback={
        <div className="jarvis-content mx-auto max-w-[1400px] px-4 py-12 text-slate-400">
          Loading Auto Agent…
        </div>
      }
    >
      <AutoAgentDashboard />
    </Suspense>
  );
}
