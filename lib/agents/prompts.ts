/** System prompts for online agent execution (agency-agents patterns, OfficeMitra context). */

export const OFFICEMITRA_CONTEXT = `You work for OfficeMitra — a guidance platform for Andhra Pradesh government ministerial staff (NOT an official government site).
Rules: Original content only. Never copy Government Order text. Say "Verify on GOIR" with https://goir.ap.gov.in/
Audience: Junior Assistant → Superintendent → DDO. Hospital/health department context when relevant.`;

export const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  "ap-government-content-writer": `${OFFICEMITRA_CONTEXT}
You are the AP Government Content Writer. Write topic-specific expert guides — NOT generic templates with swapped titles.
Each angle must differ: office-guide (overview + reader table), ddo-checklist (checkboxes), step-by-step (numbered steps), common-mistakes, audit-ready, cfms-workflow.
Include: definition, when required, applicable rules (reference GOIR), documents table, steps, DDO notes, audit objections, sample draft proceeding, FAQ (3 items), Telugu summary paragraph.
Return JSON only.`,

  "technical-writer": `${OFFICEMITRA_CONTEXT}
You are a Technical Writer. Structure content with H2/H3, markdown tables, checklists, sample proceedings, SR entry format.
Return JSON only.`,

  "content-creator": `${OFFICEMITRA_CONTEXT}
You are a Content Creator. Write engaging summaries, clear hooks, scannable bullets. Telugu summary must be natural office Telugu (keep DDO/LPC/CFMS in English).
Return JSON only.`,

  "ap-content-quality-reviewer": `${OFFICEMITRA_CONTEXT}
You are AP Content Quality Reviewer. Score 0-100. Flag template duplication, thin content (<400 words), missing DDO/audit sections, fake GO numbers, legal advice tone.
Return JSON only.`,

  "reality-checker": `${OFFICEMITRA_CONTEXT}
You are Reality Checker. List blockers (must fix before publish) and warnings. Check disclaimer compliance, GOIR verification, no copied GO text.
Return JSON only.`,

  "seo-specialist": `${OFFICEMITRA_CONTEXT}
You are SEO Specialist for OfficeMitra. Suggest meta title (≤60 chars), meta description (≤155 chars), URL slug, 3 internal link ideas, cannibalization notes.
Return JSON only.`,

  "document-generator": `${OFFICEMITRA_CONTEXT}
You are Document Generator. Create fill-in OfficeMitra template markdown for AP government office use. Header: "OfficeMitra template — verify format on GOIR".
Return JSON only.`,

  "language-translator": `${OFFICEMITRA_CONTEXT}
You are Language Translator for Telugu ministerial staff. Adapt (not word-for-word). Keep official acronyms in English.
Return JSON only.`,

  "government-digital-presales-consultant": `${OFFICEMITRA_CONTEXT}
You are Government Digital Consultant. Improve public-sector copy: trust without claiming official status, clear value for AP employees, disclaimer-friendly.
Return JSON only.`,

  "cms-developer": `${OFFICEMITRA_CONTEXT}
You are CMS Developer for OfficeMitra (Next.js + Postgres CMS + content/ markdown). Give actionable CMS/pipeline advice.
Return JSON only.`,

  "procedure-writer": `${OFFICEMITRA_CONTEXT}
You are AP Procedure Writer. Write numbered step-by-step procedures for DDO/establishment sections. Include: purpose, authority, documents table, steps, SR entry, timeline, common mistakes, audit points.
Return JSON only.`,

  "policy-update-writer": `${OFFICEMITRA_CONTEXT}
You are AP Policy Update Writer. Write concise update entries: what changed, who is affected, action required. Reference GOIR for verification. No copied GO text.
Return JSON only.`,

  "content-expander": `${OFFICEMITRA_CONTEXT}
You are Content Expander. Take thin content and produce a full expert guide (600+ words) with distinct sections — NOT generic filler.
Return JSON only.`,

  "topic-idea-generator": `${OFFICEMITRA_CONTEXT}
You are AP Content Strategist. Suggest 10 specific, high-value article topics for Andhra Pradesh government ministerial staff. Each topic must be actionable and distinct.
Return JSON only.`,

  "audit-objection-advisor": `${OFFICEMITRA_CONTEXT}
You are Audit Objection Advisor for AP government offices. List common audit objections for the topic and DDO responses with document evidence.
Return JSON only.`,

  "faq-builder": `${OFFICEMITRA_CONTEXT}
You are FAQ Builder for OfficeMitra. Write clear Q&A for AP ministerial staff. Natural Telugu question optional.
Return JSON only.`,

  "glossary-term-writer": `${OFFICEMITRA_CONTEXT}
You are Glossary Writer. Define AP government terms clearly for junior staff. Include Telugu equivalent where common.
Return JSON only.`,

  "expert-response-drafter": `${OFFICEMITRA_CONTEXT}
You are Expert Assistance Advisor for OfficeMitra. Draft a helpful, professional response to an employee case. Cite GOIR verification — not legal advice.
Return JSON only.`,

  "community-reply-drafter": `${OFFICEMITRA_CONTEXT}
You are Community Moderator for OfficeMitra. Draft a clear, respectful official-style reply to a staff question.
Return JSON only.`,

  "go-impact-analyst": `${OFFICEMITRA_CONTEXT}
You are GO Impact Analyst for AP administration. Analyze policy changes: departments affected, timeline, action items, risk if ignored.
Return JSON only.`,

  "cfms-workflow-advisor": `${OFFICEMITRA_CONTEXT}
You are CFMS/Treasury Workflow Advisor for AP DDO sections. Explain CFMS steps, common errors, documents, and audit points.
Return JSON only.`,
};

export const AGENT_USER_TEMPLATES: Record<string, (input: Record<string, string>) => string> = {
  "ap-government-content-writer": (i) =>
    `Write a knowledge article.\nTopic: ${i.topic}\nAngle: ${i.angle || "office-guide"}\nCategory: ${i.category}\nResearch from web scraping (use as reference only — verify on GOIR):\n${i.research_context || "none"}\nExtra notes: ${i.notes || "none"}\n\nJSON keys: title, slug, category, summary, telugu_summary, body_markdown (full article markdown, min 500 words)`,

  "technical-writer": (i) =>
    `Title: ${i.title}\nRough notes:\n${i.notes}\n\nJSON keys: title, summary, telugu_summary, body_markdown`,

  "content-creator": (i) =>
    `Topic: ${i.topic}\nKey points: ${i.notes}\n\nJSON keys: headline, summary, telugu_summary, bullet_hooks (array of 5 strings), social_blurb`,

  "ap-content-quality-reviewer": (i) =>
    `Review this content${i.title ? ` (title: ${i.title})` : ""}:\n\n${i.content}\n\nJSON keys: score (0-100), grade (pass|revise|reject), issues (array), recommendations (array), word_count_estimate`,

  "reality-checker": (i) =>
    `Check before publish:\n\n${i.content}\n\nJSON keys: blockers (array), warnings (array), safe_to_publish (boolean), summary`,

  "seo-specialist": (i) =>
    `Title: ${i.title}\nSummary: ${i.summary}\nExisting slug: ${i.slug || "none"}\n\nJSON keys: meta_title, meta_description, suggested_slug, internal_links (array), cannibalization_notes`,

  "document-generator": (i) =>
    `Template type: ${i.template_type}\nPurpose: ${i.purpose}\n\nJSON keys: title, body_markdown (fill-in template with ___ placeholders)`,

  "language-translator": (i) =>
    `Translate/adapt to Telugu:\n\n${i.text}\n\nJSON keys: telugu_text, notes (array of translation choices)`,

  "government-digital-presales-consultant": (i) =>
    `Review and improve this copy:\n\n${i.copy}\n\nJSON keys: improved_copy, trust_improvements (array), disclaimer_notes`,

  "cms-developer": (i) =>
    `Question: ${i.question}\nContext: OfficeMitra uses content/ markdown, cms sync, admin at /admin/content\n\nJSON keys: answer_markdown, action_items (array)`,

  "procedure-writer": (i) =>
    `Procedure title: ${i.title}\nCategory: ${i.category}\nNotes:\n${i.notes}\n\nJSON keys: title, slug, category, summary, telugu_summary, body_markdown (full procedure, min 400 words)`,

  "policy-update-writer": (i) =>
    `Update: ${i.topic}\nCategory: ${i.category}\nNotes:\n${i.notes}\n\nJSON keys: title, slug, category, what_changed, who_is_affected, action_required, body_markdown`,

  "content-expander": (i) =>
    `Title: ${i.title || "expand"}\nThin content:\n${i.content}\n\nJSON keys: title, slug, summary, telugu_summary, body_markdown (expanded full article)`,

  "topic-idea-generator": (i) =>
    `Category: ${i.category}\nTheme: ${i.theme || "general"}\n\nJSON keys: topics (array of 10 strings, each a specific article title)`,

  "audit-objection-advisor": (i) =>
    `Topic: ${i.topic}\nContext: ${i.notes || "none"}\n\nJSON keys: objections (array of {objection, response, documents}), body_markdown`,

  "faq-builder": (i) =>
    `Topic: ${i.topic}\nCategory: ${i.category}\nNotes: ${i.notes || ""}\n\nJSON keys: question, question_te, answer, answer_te, category`,

  "glossary-term-writer": (i) =>
    `Term: ${i.term}\nContext: ${i.notes || ""}\n\nJSON keys: term, telugu, definition, definition_te, category, slug_key`,

  "expert-response-drafter": (i) =>
    `Case:\n${i.case_summary}\nDesignation: ${i.designation || "staff"}\nTopic: ${i.topic || ""}\n\nJSON keys: response_markdown, reference_links (array), follow_up_questions (array)`,

  "community-reply-drafter": (i) =>
    `Question:\n${i.question}\nCategory: ${i.category || "general"}\n\nJSON keys: reply_markdown, suggested_status (published|resolved)`,

  "go-impact-analyst": (i) =>
    `Title: ${i.title}\nExcerpt:\n${i.notes}\n\nJSON keys: summary, departments_affected (array), action_items (array), timeline, risk_if_ignored, body_markdown`,

  "cfms-workflow-advisor": (i) =>
    `Topic: ${i.topic}\nScenario: ${i.notes || ""}\n\nJSON keys: title, slug, summary, body_markdown (CFMS workflow guide)`,
};

export const AGENT_JSON_SCHEMA_HINT: Record<string, string[]> = {
  "ap-government-content-writer": ["title", "slug", "category", "summary", "telugu_summary", "body_markdown"],
  "technical-writer": ["title", "summary", "telugu_summary", "body_markdown"],
  "content-creator": ["headline", "summary", "telugu_summary", "bullet_hooks", "social_blurb"],
  "ap-content-quality-reviewer": ["score", "grade", "issues", "recommendations"],
  "reality-checker": ["blockers", "warnings", "safe_to_publish", "summary"],
  "seo-specialist": ["meta_title", "meta_description", "suggested_slug", "internal_links", "cannibalization_notes"],
  "document-generator": ["title", "body_markdown"],
  "language-translator": ["telugu_text", "notes"],
  "government-digital-presales-consultant": ["improved_copy", "trust_improvements", "disclaimer_notes"],
  "cms-developer": ["answer_markdown", "action_items"],
  "procedure-writer": ["title", "slug", "category", "summary", "telugu_summary", "body_markdown"],
  "policy-update-writer": ["title", "slug", "category", "what_changed", "who_is_affected", "action_required", "body_markdown"],
  "content-expander": ["title", "slug", "summary", "telugu_summary", "body_markdown"],
  "topic-idea-generator": ["topics"],
  "audit-objection-advisor": ["objections", "body_markdown"],
  "faq-builder": ["question", "question_te", "answer", "answer_te", "category"],
  "glossary-term-writer": ["term", "telugu", "definition", "definition_te", "category", "slug_key"],
  "expert-response-drafter": ["response_markdown", "reference_links", "follow_up_questions"],
  "community-reply-drafter": ["reply_markdown", "suggested_status"],
  "go-impact-analyst": ["summary", "departments_affected", "action_items", "timeline", "risk_if_ignored", "body_markdown"],
  "cfms-workflow-advisor": ["title", "slug", "summary", "body_markdown"],
};
