# Content Package — Original Files for OfficeMitra

This folder is the **source of truth** for all website content. Everything here is **original OfficeMitra material** (see [ORIGINAL-CONTENT-NOTICE.md](./ORIGINAL-CONTENT-NOTICE.md)).

## Folder structure

```
content/
├── MANIFEST.json              ← Auto-generated inventory (run content:prepare)
├── ORIGINAL-CONTENT-NOTICE.md ← Copyright / originality statement
├── articles/                  ← 170+ knowledge articles (Markdown + YAML)
├── procedures/                ← 150+ procedure guides (Markdown)
├── updates/2026/              ← 120+ update posts (Markdown)
├── documents/metadata.json    ← 150 document records → GOIR links
├── templates/metadata.json    ← 150 blank template records
├── faq/items.json             ← 150 FAQ entries (EN + TE)
└── glossary/terms.json        ← 168 glossary terms (EN + TE)

public/downloads/
├── documents/*.pdf            ← Original OfficeMitra reference PDFs
└── templates/*.pdf            ← Original blank template PDFs

lib/tools/                     ← Calculator & checklist definitions
app/tools/                     ← Live tool pages
```

## Prepare / validate package

```powershell
cd C:\Users\Jupiter\Projects\OfficeMitra

# Validate, dedupe files, fix PDFs, rebuild manifest
npm.cmd run content:prepare

# Import all files into CMS database (production uses POSTGRES_URL)
npm.cmd run content:import-all
```

On production (after deploy), sync via Admin → **Content review** → **Sync from files**.

## Regenerate more content

```powershell
npm.cmd run content:mega      # Add 120 topics per section (skips duplicates)
npm.cmd run content:prepare   # Clean & validate
npm.cmd run content:import-all
```

## Content rules

1. **Original prose only** — write guides in our own words
2. **GO references** — link to [goir.ap.gov.in](https://goir.ap.gov.in/), do not copy GO text
3. **Bilingual** — English body + Telugu sections in Markdown posts
4. **Published by default** — `status: published` in frontmatter after prepare
5. **Unique slugs** — one file per slug; prepare script removes duplicates

## Current inventory

Run `npm run content:prepare` to refresh [MANIFEST.json](./MANIFEST.json) with live counts.
