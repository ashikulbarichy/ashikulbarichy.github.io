# Sanity schema

Drop-in schema files for your studio at `G:\Projects\Application\Portfolio\Sanity\portfolio` (project `eu7fw3iy`).

They live here, in the site repo, so the schema is versioned next to the code that consumes it. Your studio stays the deployable studio; this is the source you copy from.

Written to match your studio's existing conventions: flat `schemaTypes/` folder, named `xxxType` exports, single quotes, no semicolons, `bracketSpacing: false`.

## What's here

| File | New or replaces | Purpose |
|---|---|---|
| `schemaTypes/seo.ts` | new | Reusable per-page SEO overrides object |
| `schemaTypes/identity.ts` | new | **Singleton.** Your identity facts. Feeds Person JSON-LD, `/llms.txt`, `/humans.txt`, and derived titles |
| `schemaTypes/uiText.ts` | new | **Singleton.** Every button label, section heading and caption on the site |
| `schemaTypes/faq.ts` | new | Q&A pairs — render visibly *and* generate FAQPage JSON-LD |
| `schemaTypes/project.ts` | **replaces** yours | Adds `slug`, `summary`, `body`, `role`, `highlights`, `repoUrl`, `publishedAt`, `seo` |
| `schemaTypes/siteSettings.ts` | **replaces** yours | Keeps all four current fields; adds AI-crawler toggle, verification tokens, `llmsIntro` |
| `schemaTypes/index.ts` | **replaces** yours | Registers everything |

`hero.ts`, `menu.ts` and `aboutSlide.ts` are untouched — leave them exactly as they are.

**Nothing is renamed or deleted.** Every field your documents currently use keeps its name, so existing content keeps working. On `project`, your `description` and `date` fields are retained as legacy fallbacks.

---

## Integration, step by step

Do it locally, check it in the local studio, then deploy. Nothing touches production content until step 5.

### 1. Copy the files

From this repo (`G:\Projects\Application\Portfolio\portfolio\project`):

```bash
cp -r sanity-schema/schemaTypes/. "G:/Projects/Application/Portfolio/Sanity/portfolio/schemaTypes/"
```

PowerShell equivalent:

```powershell
Copy-Item -Path "sanity-schema\schemaTypes\*" -Destination "G:\Projects\Application\Portfolio\Sanity\portfolio\schemaTypes\" -Force
```

That overwrites `project.ts`, `siteSettings.ts` and `index.ts`, and adds `identity.ts`, `uiText.ts`, `faq.ts`, `seo.ts`. Your `hero.ts`, `menu.ts` and `aboutSlide.ts` are not in the copy set, so they survive.

> Your current `siteSettings.ts` uses `export default`. The replacement uses a named `siteSettingsType` export, and the new `index.ts` already imports it that way — which is why `index.ts` has to be copied too, not just the schema files.

### 2. Make the three singletons behave as singletons

Otherwise the Studio will happily let you create a second Identity, and the site reads `[0]` — whichever one it happens to get.

In `G:\Projects\Application\Portfolio\Sanity\portfolio\sanity.config.ts`, replace the file with:

```ts
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

const SINGLETONS = ['identity', 'siteSettings', 'uiText']

export default defineConfig({
  name: 'default',
  title: 'Portfolio',

  projectId: 'eu7fw3iy',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Identity (SEO source of truth)')
              .id('identity')
              .child(S.document().schemaType('identity').documentId('identity')),
            S.listItem()
              .title('Site settings')
              .id('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            S.listItem()
              .title('UI Text (labels & headings)')
              .id('uiText')
              .child(S.document().schemaType('uiText').documentId('uiText')),
            S.divider(),
            S.documentTypeListItem('project').title('Projects'),
            S.documentTypeListItem('faq').title('FAQ'),
            S.divider(),
            S.documentTypeListItem('hero').title('Hero'),
            S.documentTypeListItem('aboutSlide').title('About slides'),
            S.documentTypeListItem('menu').title('Menu'),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    // Hide "create new" for the singletons
    newDocumentOptions: (prev) => prev.filter((t) => !SINGLETONS.includes(t.templateId)),
    // And remove delete/duplicate on them
    actions: (prev, {schemaType}) =>
      SINGLETONS.includes(schemaType)
        ? prev.filter(({action}) => action !== 'delete' && action !== 'duplicate')
        : prev,
  },
})
```

The document IDs matter: the seed script creates them as `identity`, `siteSettings` and `uiText`, and the structure above points at exactly those IDs.

### 3. Check it locally

```bash
cd "G:/Projects/Application/Portfolio/Sanity/portfolio"
npm run dev
```

Open http://localhost:3333 and confirm:

- No schema errors in the console or the Studio banner
- The sidebar shows Identity, Site settings, UI Text as single items (no "create" button on them)
- Projects now has a **Slug** field with a Generate button
- UI Text opens with four tabs and every label pre-filled with the site's current wording

Optional but worth it — normalise formatting to your prettier config:

```bash
npx prettier --write schemaTypes
```

### 4. Deploy the studio

```bash
npx sanity deploy
```

Your `sanity.cli.ts` already has `appId: ir9n5z5yhfq3vsci2dbf4sy7`, so this redeploys the existing hosted studio rather than creating a new one.

### 5. Seed and migrate the content

Back in the **site** repo. This is the first step that writes to production, so dry-run first:

```bash
cd "G:/Projects/Application/Portfolio/portfolio/project"
SANITY_WRITE_TOKEN=xxx node scripts/seed-seo.mjs --dry-run
```

You'll see a plan like:

```
Identity        create identity singleton
Site settings   clear seoTitle/seoDescription/seoKeywords so they derive from Identity
UI text         create uiText singleton
FAQ             create 6 FAQ documents
Projects        patch 2 projects: slug, summary, publishedAt
```

Read it, then apply:

```bash
SANITY_WRITE_TOKEN=xxx node scripts/seed-seo.mjs
```

It's idempotent — running it twice changes nothing. It never regenerates a slug that already exists, because changing a live slug breaks its indexed URL.

**Token:** create a fresh **Editor** token at sanity.io/manage → project → API → Tokens. Do not reuse the value that was in `VITE_SANITY_API_TOKEN` — that one was compiled into the old public JS bundle and should be revoked. Keep the new token local; the site itself needs no token, because the `production` dataset allows unauthenticated reads.

### 6. Wire the revalidation webhook

So that publishing updates the live site in seconds instead of waiting on the 1-hour cache. Full table in [`../SEO.md`](../SEO.md#5-wire-the-revalidation-webhook). The filter must include the new types:

```
_type in ["identity","siteSettings","uiText","hero","menu","aboutSlide","project","faq"]
```

---

## Editing text after this

Everything a visitor reads is now in one of these documents:

| Want to change | Edit |
|---|---|
| Your name, role, bio, skills, education, certs, links | **Identity** |
| Section headings, button labels, captions, 404 copy, loading messages | **UI Text** |
| Hero name/role/subtitle/location, skills, certs, featured picks | **Hero** |
| The About carousel cards | **About slides** |
| Brand text, email, nav links, social links | **Menu** |
| FAQ questions and answers | **FAQ** |
| A project and its write-up | **Projects** |
| Homepage title/description override, OG image, AI crawler toggle | **Site settings** |

Two rules that carry real weight:

**Blank means derived, and blank is usually right.** `siteSettings.seoTitle`, `seoDescription`, `seoKeywords` and `llmsIntro` compute themselves from Identity when empty. Filling one in freezes it, and it stops tracking your content — which is how the site previously ended up asserting a job title its own hero copy contradicted. Same for every field in UI Text: empty falls back to the shipped wording, and groups merge field by field, so setting one label in a group leaves its siblings alone.

**Identity and Hero must agree.** `identity.headline` feeds structured data and `/llms.txt`; `hero.heroRole` is what a visitor reads. Search engines compare the two and language models hedge when sources conflict. If you change one, change the other. They are separate fields on purpose — the hero wants display copy, schema wants a canonical claim — but they must not disagree.

## What is *not* editable, deliberately

Layout, spacing, colours, fonts, animation timing, and which sections appear in what order. Those live in the code where a change can be reviewed and tested. This schema changes wording and content only.
