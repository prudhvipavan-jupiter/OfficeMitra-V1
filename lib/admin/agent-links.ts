/** Build Agent Studio deep-link with prefilled form fields. */
export function buildAgentUrl(
  agentId: string,
  fields: Record<string, string>,
  opts?: { view?: "agents" | "pipelines"; pipeline?: string; autorun?: boolean }
): string {
  const params = new URLSearchParams({ agent: agentId });
  for (const [k, v] of Object.entries(fields)) {
    if (v.trim()) params.set(k, v);
  }
  if (opts?.view) params.set("view", opts.view);
  if (opts?.pipeline) params.set("pipeline", opts.pipeline);
  if (opts?.autorun) params.set("autorun", "1");
  return `/admin/agents?${params.toString()}`;
}

export function buildCommunityReplyUrl(title: string, body: string, category?: string): string {
  return buildAgentUrl("community-reply-drafter", {
    question: `${title}\n\n${body}`.trim(),
    ...(category ? { category } : {}),
  });
}

export function buildExpertResponseUrl(
  caseSummary: string,
  designation?: string,
  topic?: string
): string {
  return buildAgentUrl("expert-response-drafter", {
    case_summary: caseSummary,
    ...(designation ? { designation } : {}),
    ...(topic ? { topic } : {}),
  });
}
