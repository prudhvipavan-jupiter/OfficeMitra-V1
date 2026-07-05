# OfficeMitra V1 — Tomorrow Launch Scope

> Stripped copy of the full platform. **Launch date:** Monday 6 July 2026.

## In scope (public)

| Module | Route | Notes |
|---|---|---|
| Knowledge Hub | `/knowledge` | Articles via CMS — markdown body + cover image |
| Procedure Guides | `/procedures` | Step-by-step workflows |
| Updates Centre | `/updates` | Policy change summaries |
| Document Library | `/documents` | PDF upload + download |
| FAQ | `/faq` | Q&A from CMS |
| Staff Community | `/community` | Public Q&A, moderated |
| Office Tools | `/tools` | 5 mandatory tools only (see below) |
| Official Portals | `/official-links` | Curated AP gov links |
| Expert Assistance | `/expert-assistance` | Info banner + contact link (form in V1.1) |
| Search | `/search` | Full-text across live content |
| About / Contact / Terms / Privacy | static | Required disclaimers |

## Mandatory tools (day 1)

1. Pay Bill Checklist
2. Probation Calculator
3. Leave Accrual Estimator
4. EL Encashment Calculator
5. Working Days Calculator
6. APGLI Premium Calculator

## Admin (simplified)

| Area | Route |
|---|---|
| Dashboard | `/admin` → CMS hub |
| CMS Control | `/admin/content` — articles, procedures, updates, documents, FAQ |
| People Queue | `/admin/people` — community moderation |
| Settings | `/admin/settings` — env checklist, theme |

## Explicitly out of V1 launch

- NeXus, Agent Studio, Auto Agent, Intelligence
- Mitra AI (public widget off)
- Templates Library, Glossary
- Department landing pages
- Expert request form (contact link only until V1.1)
- Analytics dashboard
- Telegram / Jarvis theme (normal admin mode only)

## Content upload

- **Documents:** PDF/DOC upload in CMS → `/documents`
- **Articles / procedures / updates:** Markdown body + optional cover image upload
- **FAQ:** Question + answer fields in CMS

## Pre-launch checklist

- [ ] `npm install && npm run build` passes
- [ ] Admin password set (`ADMIN_PASSWORD`)
- [ ] Database connected (Neon) or file fallback verified
- [ ] 10+ published articles, 5+ documents, 10+ FAQ entries
- [ ] Community moderation workflow tested
- [ ] Deploy to Vercel with `MITRA_AI_ENABLED=false`
- [ ] Disclaimer visible on About / footer

---

*Full vision remains in [VISION.md](VISION.md). V1 is a credible public launch; V2 restores Expert form scale and advanced admin.*
