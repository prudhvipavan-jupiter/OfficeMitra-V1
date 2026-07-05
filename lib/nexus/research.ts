import type { NexusResearchSource } from "./types";

const USER_AGENT =
  "OfficeMitra-NeXus/1.0 (+https://officemitra.vercel.app; AP gov research)";

/** Official AP portals searched for topic-related pages. */
const AP_PORTALS: { name: string; url: string; searchPath?: string }[] = [
  { name: "GOIR Andhra Pradesh", url: "https://goir.ap.gov.in/" },
  { name: "AP Finance Department", url: "https://www.apfinance.ap.gov.in/" },
  { name: "AP Treasury", url: "https://treasury.ap.gov.in/" },
  { name: "CFMS AP", url: "https://cfms.ap.gov.in/" },
  { name: "APGLI", url: "https://www.apgli.ap.gov.in/" },
  { name: "AP Health Department", url: "https://health.ap.gov.in/" },
  { name: "AP Education", url: "https://cse.ap.gov.in/" },
];

function stripTags(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? stripTags(m[1]).slice(0, 200) : "";
}

async function fetchPage(url: string): Promise<{ html: string; ok: boolean; error?: string }> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" },
      signal: AbortSignal.timeout(20_000),
      next: { revalidate: 0 },
    });
    if (!res.ok) return { html: "", ok: false, error: `HTTP ${res.status}` };
    return { html: await res.text(), ok: true };
  } catch (e) {
    return { html: "", ok: false, error: e instanceof Error ? e.message : "Fetch failed" };
  }
}

function topicKeywords(topic: string): string[] {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function relevanceScore(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.reduce((n, kw) => (lower.includes(kw) ? n + 1 : n), 0);
}

function extractLinks(html: string, baseUrl: string, keywords: string[]): { title: string; url: string; score: number }[] {
  const items: { title: string; url: string; score: number }[] = [];
  const seen = new Set<string>();
  const linkRe = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = linkRe.exec(html)) !== null) {
    const href = match[1].trim();
    const title = stripTags(match[2]);
    if (!href || title.length < 6) continue;
    let fullUrl: string;
    try {
      fullUrl = new URL(href, baseUrl).href;
    } catch {
      continue;
    }
    if (seen.has(fullUrl)) continue;
    seen.add(fullUrl);
    const score = relevanceScore(`${title} ${fullUrl}`, keywords);
    if (score > 0) items.push({ title: title.slice(0, 300), url: fullUrl, score });
  }

  return items.sort((a, b) => b.score - a.score).slice(0, 8);
}

async function searchDuckDuckGo(topic: string): Promise<{ title: string; url: string }[]> {
  const query = encodeURIComponent(`Andhra Pradesh government ${topic} GO rules procedure`);
  const url = `https://html.duckduckgo.com/html/?q=${query}`;
  const { html, ok } = await fetchPage(url);
  if (!ok) return [];

  const items: { title: string; url: string }[] = [];
  const resultRe = /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;
  while ((match = resultRe.exec(html)) !== null && items.length < 6) {
    let href = match[1];
    const title = stripTags(match[2]);
    if (href.startsWith("//duckduckgo.com/l/?")) {
      const uddg = href.match(/uddg=([^&]+)/);
      if (uddg) href = decodeURIComponent(uddg[1]);
    }
    if (title && href.startsWith("http")) items.push({ title: title.slice(0, 300), url: href });
  }
  return items;
}

async function fetchSourceSnippet(url: string, title: string): Promise<NexusResearchSource> {
  const { html, ok, error } = await fetchPage(url);
  if (!ok) {
    return { url, title, snippet: error ?? "Could not fetch", ok: false };
  }
  const pageTitle = extractTitle(html) || title;
  const snippet = stripTags(html).slice(0, 800);
  return { url, title: pageTitle, snippet, ok: true };
}

/** Optional Python worker for richer scraping (BeautifulSoup). */
async function callPythonWorker(topic: string): Promise<NexusResearchSource[] | null> {
  const workerUrl = process.env.NEXUS_WORKER_URL;
  if (!workerUrl) return null;
  try {
    const res = await fetch(`${workerUrl.replace(/\/$/, "")}/research`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { sources?: NexusResearchSource[] };
    return data.sources ?? null;
  } catch {
    return null;
  }
}

export async function researchTopic(topic: string): Promise<{
  sources: NexusResearchSource[];
  notes: string;
}> {
  const fromPython = await callPythonWorker(topic);
  if (fromPython && fromPython.length > 0) {
    return {
      sources: fromPython,
      notes: `Python worker returned ${fromPython.length} source(s).`,
    };
  }

  const keywords = topicKeywords(topic);
  const candidateUrls = new Map<string, string>();

  for (const portal of AP_PORTALS) {
    const { html, ok } = await fetchPage(portal.url);
    if (!ok) continue;
    for (const link of extractLinks(html, portal.url, keywords)) {
      if (!candidateUrls.has(link.url)) candidateUrls.set(link.url, link.title);
    }
  }

  const webResults = await searchDuckDuckGo(topic);
  for (const r of webResults) {
    if (!candidateUrls.has(r.url)) candidateUrls.set(r.url, r.title);
  }

  const prioritized = [...candidateUrls.entries()]
    .slice(0, 6)
    .map(([url, title]) => ({ url, title }));

  if (prioritized.length === 0) {
    for (const portal of AP_PORTALS.slice(0, 3)) {
      prioritized.push({ url: portal.url, title: portal.name });
    }
  }

  const sources: NexusResearchSource[] = [];
  for (const { url, title } of prioritized) {
    sources.push(await fetchSourceSnippet(url, title));
  }

  const okCount = sources.filter((s) => s.ok).length;
  const notes = [
    `Topic: ${topic}`,
    `Keywords: ${keywords.join(", ") || "general"}`,
    `Fetched ${okCount}/${sources.length} sources from AP portals and web search.`,
    "Verify all rule references on GOIR before publishing.",
  ].join("\n");

  return { sources, notes };
}

export function formatResearchForPrompt(sources: NexusResearchSource[], notes: string): string {
  const blocks = sources
    .filter((s) => s.ok && s.snippet)
    .map((s, i) => `### Source ${i + 1}: ${s.title}\nURL: ${s.url}\n${s.snippet.slice(0, 1200)}`);
  return [notes, "", ...blocks].join("\n\n");
}
