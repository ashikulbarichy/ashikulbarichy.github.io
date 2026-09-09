# ashikulbari.com

Personal portfolio. Next.js 14 (App Router) + Sanity CMS, deployed on Vercel.

## Stack

- **Next.js 14** App Router, React 18, TypeScript
- **Sanity** as the CMS (project `eu7fw3iy`, dataset `production`)
- **Tailwind CSS** + Radix primitives
- **GSAP** + **Lenis** for animation and smooth scroll

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Open http://localhost:3000

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | Next.js ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run seed:seo` | Seed/migrate the Sanity SEO documents (see below) |

## Structure

```
app/                    routes, metadata, generated SEO files
  page.tsx              homepage
  projects/             projects index + [slug] detail pages
  sitemap.ts            generated from Sanity
  robots.ts             generated, AI-crawler rules
  llms.txt/route.ts     generated brief for AI assistants
  humans.txt/route.ts   generated
  api/revalidate/       Sanity webhook receiver
components/             UI (client components where interactive)
lib/
  sanity/               client, tagged queries, fallbacks
  seo/                  metadata + JSON-LD builders
sanity-schema/          drop-in schema for the Studio at ../../Sanity/portfolio
scripts/seed-seo.mjs    one-off content migration
```

## Editing content

All visible text is editable in Sanity — headings, button labels, captions, the
404 copy, the loading sequence. See
[sanity-schema/README.md](sanity-schema/README.md#editing-text-after-this) for
which document owns what.

Layout, spacing, colour and animation are intentionally not editable; those live
in the code.

## SEO

Search and AI-assistant visibility is the load-bearing part of this site, and it is documented separately in **[SEO.md](SEO.md)** — architecture, deployment steps, the Sanity revalidation webhook, verification commands, and the editing rules that keep metadata and visible copy in agreement.

Schema installation for the Studio: **[sanity-schema/README.md](sanity-schema/README.md)**.

## Security

[SECURITY.md](SECURITY.md) — what is gitignored and why, the public/server-only env split, and **one open item: a Sanity token in git history that needs rotating.**

## Deploying

Push to `main`. Vercel builds and deploys automatically.

Environment variables and the webhook setup are covered in [SEO.md](SEO.md#deploying). One thing worth repeating here: never put a Sanity token in a `NEXT_PUBLIC_*` variable — that prefix ships the value to the browser. The site needs no token, because the `production` dataset allows unauthenticated reads.
