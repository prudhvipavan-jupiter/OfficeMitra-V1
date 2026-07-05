# OfficeMitra V1

**Tomorrow-launch build** — a simplified administrative knowledge platform for Andhra Pradesh government staff.

## What's included

- **Knowledge Hub** — articles with document and image upload via admin CMS
- **Procedures & Updates** — step-by-step guides and policy summaries
- **Document Library** — GOs, circulars, forms (PDF download)
- **Staff Community** — moderated public Q&A
- **FAQ** — common questions
- **Office Tools** — 6 essential calculators and checklists
- **Official Portals** — curated links (CFMS, GOIR, APGLI, HRMS, etc.)
- **Expert Assistance** — info page + contact (full request form in V1.1)

## What's not in this build

NeXus, AI agents, Mitra AI, Templates, Glossary, and the full V2 admin stack are removed. See [docs/V1-LAUNCH.md](docs/V1-LAUNCH.md).

## Quick start

```bash
npm install
cp .env.example .env.local   # set ADMIN_PASSWORD, DATABASE_URL
npm run dev
```

Admin: `/admin/login` → CMS at `/admin/content`

## Documentation

| Doc | Purpose |
|---|---|
| [docs/V1-LAUNCH.md](docs/V1-LAUNCH.md) | Launch scope and checklist |
| [docs/VISION.md](docs/VISION.md) | Product vision |
| [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) | Navy + gold design tokens |

## Tech

Next.js 15 · TypeScript · Tailwind CSS · Neon Postgres (CMS + community)
