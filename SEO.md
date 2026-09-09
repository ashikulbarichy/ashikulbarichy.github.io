# SEO architecture

How search and AI visibility work on this site, what to do after deploying, and how to verify it.

---

## The problem this solves

The old site was a Vite SPA. Its entire body was `<div id="root"></div>` and every meta tag was written by JavaScript after paint. That produced two distinct failures:

- **Google** could render the JavaScript eventually, but slowly and unreliably, and every title/description it saw was set client-side.
- **AI crawlers do not execute JavaScript at all.** GPTBot, ClaudeBot, PerplexityBot, CCBot, Applebot-Extended and Google-Extended fetch raw HTML. They saw a hardcoded `<head>` and an empty body. None of the actual portfolio content existed as far as they were concerned, and nothing updated when Sanity changed.

Now every page is server-rendered from Sanity. The content and the metadata are in the initial HTML, and both update when you publish.

## How it fits together

```
Sanity CMS
    │
    ├── identity (singleton) ──┬──> Person JSON-LD
    │                          ├──> /llms.txt
    │                          ├──> /humans.txt
    │                          └──> fallback meta description
    │
    ├── siteSettings ──────────┬──> default <title>, description, OG image
    │                          └──> robots.txt AI-crawler toggle
    │
    ├── faq ───────────────────┬──> visible FAQ section on the homepage
    │                          └──> FAQPage JSON-LD (same text — required)
    │
    ├── hero / menu / about ───────> server-rendered page content
    │
    └── project ───────────────┬──> /projects/<slug> pages + CreativeWork JSON-LD
                               └──> sitemap.xml entries with real lastmod
                                        │
                                        ▼
                          Publish in Studio
                                        │
                          webhook ──> /api/revalidate
                                        │
                          revalidateTag() ──> affected pages regenerate
```

Key files:

| File | Role |
|---|---|
| `lib/seo/site.ts` | `SITE_URL` — the one host everything canonical derives from |
| `lib/seo/metadata.ts` | Builds every `<head>` tag. One place for canonicals, OG, robots |
| `lib/seo/jsonld.ts` | Person, WebSite, ProfilePage, FAQPage, CreativeWork, BreadcrumbList |
| `lib/sanity/queries.ts` | Tagged, cached Sanity reads |
| `lib/sanity/fallbacks.ts` | Used when Sanity is unreachable — must stay consistent with it |
| `app/sitemap.ts` | Generated from Sanity, excludes `noIndex` projects |
| `app/robots.ts` | AI crawler rules, toggled from Sanity |
| `app/llms.txt/route.ts` | Generated prose brief for AI assistants |
| `app/api/revalidate/route.ts` | Sanity webhook receiver |

---

## Deploying

### 1. Vercel environment variables

Project → Settings → Environment Variables. Set for Production, Preview and Development:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `eu7fw3iy` |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | `2023-05-03` |
| `NEXT_PUBLIC_SITE_URL` | `https://www.ashikulbari.com` |
| `NEXT_PUBLIC_GA_ID` | your GA4 measurement ID |
| `SANITY_REVALIDATE_SECRET` | a long random string you generate |

**Delete `VITE_SANITY_API_TOKEN` and every other `VITE_*` variable.** They are unused now, and that token was inlined into the old public JS bundle — see *Rotate the token* below.

`SANITY_REVALIDATE_SECRET` must NOT have the `NEXT_PUBLIC_` prefix. Anything with that prefix ships to the browser.

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Framework preset

Vercel auto-detects Next.js. Confirm the build command is `next build` and there is no leftover output-directory override pointing at `dist`.

### 3. Rotate the token

The old app read `VITE_SANITY_API_TOKEN` through `import.meta.env`, so Vite inlined the literal value into the JavaScript it served. Anyone who viewed source on the live site could read it.

**It is also in git history** — in `test_sanity.js` as plaintext, and in the committed `dist/` bundles across four commits. The remote is a public `*.github.io` repo, so treat the token as publicly disclosed. See [SECURITY.md](SECURITY.md) for the detail and the purge option.

1. sanity.io/manage → project → API → Tokens
2. Revoke the existing token
3. Create a new **Editor** token only if you need `scripts/seed-seo.mjs`; keep it local, never in Vercel

The site itself needs no token: the `production` dataset allows unauthenticated reads.

### 4. Install the schema and seed content

See `sanity-schema/README.md`. Short version:

```bash
# after copying the schema files into your studio and deploying it
SANITY_WRITE_TOKEN=xxx node scripts/seed-seo.mjs --dry-run
SANITY_WRITE_TOKEN=xxx node scripts/seed-seo.mjs
```

This creates the `identity` singleton, creates the FAQ documents, **clears** the stale hardcoded `seoTitle`/`seoDescription`/`seoKeywords` in `siteSettings` so they derive from Identity instead, and backfills `slug`, `summary` and `publishedAt` on your existing projects. Until it runs, project URLs fall back to raw document ids and the site serves the fallback identity.

### 5. Wire the revalidation webhook

Sanity Studio → API → Webhooks → **Create webhook**:

| Field | Value |
|---|---|
| Name | Revalidate site |
| URL | `https://www.ashikulbari.com/api/revalidate` |
| Dataset | `production` |
| Trigger on | Create, Update, Delete |
| Filter | `_type in ["identity","siteSettings","uiText","hero","menu","aboutSlide","project","faq"]` |
| Projection | `{_type, "slug": slug.current}` |
| HTTP method | POST |
| API version | `v2023-05-03` |
| Secret | the same value as `SANITY_REVALIDATE_SECRET` |

Confirm it is live:

```bash
curl https://www.ashikulbari.com/api/revalidate
# {"ok":true,"configured":true,...}
```

`configured: false` means the env var is missing in Vercel. An unsigned or wrongly-signed POST returns 401 by design.

---

## Verifying after deploy

The single most important check. If your content appears here, AI crawlers can see it:

```bash
curl -s https://www.ashikulbari.com/ | grep -c "North South University"
```

Anything above `0` means it worked. On the old site this returned `0`.

Full pass:

```bash
# titles and canonicals come from Sanity
curl -s https://www.ashikulbari.com/ | grep -E '<title>|rel="canonical"'

# per-project pages exist and 200 (they used to 404)
curl -s -o /dev/null -w "%{http_code}\n" https://www.ashikulbari.com/projects

# unknown paths must be a real 404, not a soft 200
curl -s -o /dev/null -w "%{http_code}\n" https://www.ashikulbari.com/no-such-page

# generated SEO files
curl -s https://www.ashikulbari.com/sitemap.xml
curl -s https://www.ashikulbari.com/llms.txt
curl -s https://www.ashikulbari.com/robots.txt

# canonical must not redirect — expect 200, never 308
curl -s -o /dev/null -w "%{http_code}\n" https://www.ashikulbari.com/
```

Then:

- **Structured data** — paste each page URL into [Rich Results Test](https://search.google.com/test/rich-results). Expect Person, WebSite, ProfilePage, FAQPage, BreadcrumbList on `/`; CreativeWork on a project page.
- **Search Console** — add the `www` property, submit `https://www.ashikulbari.com/sitemap.xml`, then use URL Inspection → *View crawled page* on `/` and confirm the rendered HTML has your content. Request indexing for `/projects` and each project page, since those URLs are new.
- **Bing Webmaster Tools** — worth doing specifically because Bing's index feeds ChatGPT search. Submit the same sitemap.
- **Social previews** — check `/` and a project page in the LinkedIn Post Inspector and X Card Validator.

### Testing revalidation

1. Edit `identity` → `jobTitles` (reorder, or change the first entry) and publish
2. Wait a few seconds
3. `curl -s https://www.ashikulbari.com/ | grep -o "<title>[^<]*"`

The title should track the change with no redeploy, because it derives from Identity. If it doesn't move, check in this order:

- Is `siteSettings.seoTitle` filled in? A typed value overrides derivation. Clear it.
- Did the webhook fire? Sanity → API → Webhooks → your webhook → *Attempts*. Anything other than 200 there is the problem.
- Editing `hero.heroRole` will NOT change the title. That field is the visible hero copy; the title comes from `identity`. Keep them in agreement, but they are separate fields.

---

## What is derived vs. what you type

Identity is the source of truth. Fields left blank in `siteSettings` are computed from it, so editing one document moves everything downstream.

| Sanity field | Blank behaviour |
|---|---|
| `siteSettings.seoTitle` | Derived as `<name> \| <first job title>, <city>` |
| `siteSettings.seoDescription` | Derived from `identity.bio`, trimmed to whole sentences at ~155 chars |
| `siteSettings.seoKeywords` | Derived from job titles + expertise (and changes nothing about ranking either way) |
| `siteSettings.llmsIntro` | Derived from `identity.headline` + location |
| `project.summary` | Falls back to the legacy `description` field |
| `project.seo.*` | Falls back to the project title / summary / site OG image |

Blank is the recommended state for all of them. A typed value is an override and stops tracking Identity — which is how the old site ended up asserting a job title its own hero copy contradicted.

Resolution order in `lib/seo/metadata.ts` is: what the page passed in → an explicit `siteSettings` value → derived from Identity.

`lib/seo/derive.ts` holds the derivation logic. One non-obvious detail there: the description splits sentences on `/(?<=[.!?])\s+(?=[A-Z])/` rather than on `/[.!?]/`, because a naive split breaks inside "ASP.NET" and "B.Sc." — both of which appear in the bio — and truncated the description to "He works primarily with ASP."

### Cache behaviour worth knowing

Queries are wrapped in `unstable_cache`, whose entries persist in `.next/cache` **across builds** and are keyed only by the query name, not by your environment config. Two consequences:

- In production this is what you want: a redeploy does not throw away warm content, and the webhook busts entries by tag.
- When debugging locally, a rebuild alone will not pick up a changed data source. Run `rm -rf .next` if you need a genuinely cold read.

Without the webhook wired, content still refreshes on the `REVALIDATE_SECONDS` timer in `lib/sanity/queries.ts` (currently 1 hour). So an edit is never permanently stale — the webhook just takes it from up-to-an-hour down to seconds.

## Editing rules that matter

**Identity and visible copy must agree.** This is the one that costs you the most when broken. Search engines compare your metadata against what a visitor can read, and language models hedge or omit you when sources conflict. The previous site claimed "Cyber Security Analyst & GRC Specialist" in its metadata while the hero said "ASP.NET API Developer, building toward GRC" — that gap outweighs any amount of keyword tuning. If you change `headline` in Identity, change `heroRole` in Hero to match.

**Don't inflate `jobTitles` or `knowsAbout`.** Titles you hold, skills you'd defend in an interview. The old schema listed penetration testing, digital forensics, threat intelligence and SOC operations, none of which any project or credential on the site supports. Unsupported breadth reads as noise and gets discounted.

**Keep `knowsAbout` to 10–15 entries.** Thirty entries reads as keyword stuffing.

**Write FAQ answers so they stand alone.** Assistants quote the answer without the question. Never write "as mentioned above."

**Fill in `body` on projects.** A few hundred words of real detail — the problem, what you built, what you decided, what happened — is what makes a project page rank on its own and gives an assistant something specific to cite. Two sentences will not.

**Only list `sameAs` profiles that exist.** A dead link there actively hurts. The old schema claimed a Twitter profile that isn't in your socials.

---

## What was removed, and why

Some of the previous setup did nothing. Removing it isn't a downgrade:

| Removed | Why |
|---|---|
| `<meta name="GPTBot" content="index, follow">` and friends | No crawler reads a meta tag named after itself. robots.txt is the only control surface |
| `<link rel="ai-index">`, `<meta name="llms-txt">` | Not registered relations; nothing consumes them |
| `revisit-after`, `rating`, `coverage`, `distribution`, `language` | Ignored by every major engine since the 2000s |
| `changefreq`, `priority` in sitemap | Google has stated it ignores both |
| `#about` / `#contact` sitemap entries | Fragments are not separate pages and are invalid sitemap entries |
| `ProfessionalService` JSON-LD | Claimed a business entity distinct from you; duplicated Person and muddied the entity |
| `SearchAction` on WebSite | Declared a site search that does not exist |
| `estimatedSalary` (AUD 70–130k) | Invented figures, and denominated in the wrong currency |
| `telephone` in Person | Machine-readable by scrapers as well as search engines. Re-add via Identity if you want it public |
| "Keywords for AI Search" block in llms.txt | Keyword stuffing aimed at the audience least tolerant of it |
| `alumniOf: "Dhaka, Bangladesh"` + `latrobe.edu.au` | A find-and-replace had overwritten the institution name with a city |

`meta keywords` is retained because you have a Sanity field for it, but Google has ignored it since 2009 and so does Bing. It is not doing anything.

---

## Phase 4: the off-site half

Everything above is on-site work, and on-site work has a ceiling. For AI assistants specifically, the binding constraint is usually **corroboration**: a model states something confidently when several independent sources agree, and hedges when only your own site makes the claim.

Highest leverage, roughly in order:

1. **Align your LinkedIn headline and About section to your Identity `headline` and `bio`.** Same wording for role, location and stack. LinkedIn is heavily crawled and carries real weight as a corroborating source. This is the single highest-value item on the list and it takes ten minutes.

2. **Add a GitHub profile README** (`ashikulbarichy/ashikulbarichy` repo, `README.md`) stating the same role, location and stack, and linking to `ashikulbari.com`. GitHub profiles rank well and are in every training corpus.

3. **Make the projects verifiable.** Public repos for the two existing projects, each with a real README, linked from `repoUrl` in Sanity. A claim you can click through to is worth several you cannot.

4. **Fix the tag typos.** `"Typscript"` in the Aussie Solar project should be `"TypeScript"`. Tags are how people and machines match you to a technology, and a misspelling matches nothing.

5. **Write up the projects properly.** Fill `body` for both. The AI evaluation system in particular is the kind of specific, unusual work that gets cited if there is enough detail to cite.

6. **Get mentioned somewhere you don't control.** A dev.to or Hashnode post, an answer on Stack Overflow, a talk listing, an open-source contribution. One genuine third-party mention that matches your site's claims does more for AI answer confidence than any further on-site tuning.

7. **Only add depth you can back.** If you want to rank for GRC, the honest path is publishing something real about GRC — a write-up of applying NIST CSF or ISO 27001 to a project you actually built. That both earns the keyword and gives assistants something to quote. Claiming the expertise in metadata does neither.
