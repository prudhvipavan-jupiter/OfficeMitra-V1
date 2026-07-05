# Original Content Notice

All files under `content/` and `public/downloads/` in this repository are **original OfficeMitra content**.

## What we create

| Type | Location | Description |
|------|----------|-------------|
| Knowledge articles | `content/articles/` | Original guides in English + Telugu |
| Procedures | `content/procedures/` | Step-by-step workflows |
| Updates | `content/updates/` | Policy/office change summaries |
| Documents | `content/documents/metadata.json` + `public/downloads/documents/` | Reference sheets linking to [GOIR](https://goir.ap.gov.in/) |
| Templates | `content/templates/metadata.json` + `public/downloads/templates/` | Blank OfficeMitra PDF formats |
| FAQ | `content/faq/items.json` | Original Q&A |
| Glossary | `content/glossary/terms.json` | Original term definitions |
| Tools | `lib/tools/` + `app/tools/` | Original web calculators & checklists |

## What we do NOT copy

- Excel/software files from third-party sites (Medakbadi, APME, etc.)
- Verbatim text from government orders or third-party blogs
- Copyrighted forms from external websites

We use reference sites only as **topic inspiration**. All prose, PDFs, and tools are written/built by OfficeMitra.

## Official sources

Government orders are **referenced** via links to official `.gov.in` portals (GOIR, AP Finance, Treasury, Health). Download official GOs from those portals before taking office action.

## Regenerate content package

```powershell
npm.cmd run content:prepare
```

This validates files, removes orphan PDFs, rebuilds the manifest, and syncs to production CMS.

© OfficeMitra — https://officemitra.vercel.app
