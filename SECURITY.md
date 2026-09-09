# Security notes

## ⚠️ Open item: a Sanity token is in git history

**Found:** 2026-09-09. **Status: not yet resolved — requires you to rotate the token.**

A Sanity API token beginning `skMmYoaL9h…` is committed to this repository's history in two places:

| Location | Commits |
|---|---|
| `test_sanity.js` line 8 — plaintext in source | HEAD and earlier |
| `dist/assets/index-*.js` — inlined into the Vite bundle | `2d8da36`, `248c256`, `ece0843`, `8508d2d` |

The bundle copy exists because Vite replaces `import.meta.env.VITE_*` with literal values at build time, and `dist/` was tracked. So committing a build was equivalent to committing the token.

The remote is `github.com/ashikulbarichy/ashikulbarichy.github.io`. A `*.github.io` repository on a free account must be public for Pages to serve it, so **treat this token as publicly disclosed.**

### What to do

**1. Rotate it. This is the fix.**

sanity.io/manage → project `eu7fw3iy` → API → Tokens → revoke the existing token, and do not create a replacement unless you need one for `scripts/seed-seo.mjs`.

Rotation is what actually resolves this: it makes the disclosed value worthless. Everything below is optional cleanup.

The site itself needs no token — the `production` dataset allows unauthenticated reads, and `lib/sanity/client.ts` is deliberately tokenless.

**2. Check for misuse.** sanity.io/manage → project → API → look at recent activity. The token's scope determines the blast radius: a read token on a public dataset exposes nothing that wasn't already public; an Editor or Deploy token could have modified content.

**3. Optional — purge from history.** Only worth doing *after* rotating, and only if you want the value gone rather than merely dead:

```bash
# git-filter-repo is the maintained tool for this (not filter-branch)
pip install git-filter-repo
git filter-repo --path dist --path test_sanity.js --invert-paths
git push --force
```

This rewrites every commit, so anyone else with a clone must re-clone. Given it's a personal portfolio that's likely fine — but rotation already removes the risk, so this is housekeeping, not remediation.

---

## Correction to earlier advice

`SEO.md` states the token "was never committed to git, but it was public in the bundle." **That is wrong**, and this file is the correction.

The mistake: I checked whether `.env` was tracked (it wasn't) and concluded the token was safe from git. I didn't check whether the *build output* was tracked. It was, and the build inlines the env var. `test_sanity.js` also had it in plaintext, which no amount of `.env` checking would have caught.

The lesson generalises: **for a bundler that inlines env vars, "is `.env` gitignored?" is the wrong question.** The right one is "is any build artifact tracked?"

---

## What is now protected

`.gitignore` covers, with verification both directions:

- Every `.env` variant except `.env.example`
- `dist/`, `.next/`, `out/`, `build/` — all build output
- Keys and certificates: `*.pem`, `*.key`, `*.p12`, `id_rsa`, `service-account*.json`, and similar
- `.vercel`, `supabase/.temp/`, `supabase/.env`, `.sanity/`, `schema.json`
- Logs, caches, editor and OS junk

Deliberately **not** ignored, because they belong in version control:

- `.env.example` — placeholders only, verified
- `supabase/migrations/*.sql` — schema is code
- `sanity-schema/` — studio schema source

`dist/` and `test_sanity.js` have been removed from the git index, so the next commit stops tracking them. Note that untracking does not remove them from history — see the purge step above.

---

## Standing rules

**Never put a secret in a `NEXT_PUBLIC_*` variable.** Next inlines those into the browser bundle. The same trap as `VITE_*`, and it's how this happened.

Current split:

| Public (browser-safe) | Server-only (never `NEXT_PUBLIC_`) |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `SUPABASE_SERVICE_ROLE_KEY` |
| `NEXT_PUBLIC_SANITY_DATASET` | `SANITY_REVALIDATE_SECRET` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | `ANALYTICS_SALT` |
| `NEXT_PUBLIC_SITE_URL` | `SAM_ALLOWED_EMAIL` |
| `NEXT_PUBLIC_SUPABASE_URL` | `SANITY_WRITE_TOKEN` (local only) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | |

The Supabase anon key is genuinely safe to publish: every analytics table has RLS enabled with no anon policy, and `0002_harden.sql` additionally revokes the anon role's table grants. It can read nothing.

### Vercel variable visibility

Vercel asks for a visibility per variable, and it **refuses to let a
`NEXT_PUBLIC_*` variable be marked Secret/Sensitive** — you get:

> Environment variables with a public framework prefix cannot use
> `visibility: secret`. Use `visibility: config` instead.

That is correct behaviour, not a bug to work around. Next.js inlines every
`NEXT_PUBLIC_*` value into the JavaScript sent to the browser at build time, so
marking one "secret" would only hide it from you in the dashboard while it sits
in plain view in the bundle. Vercel blocks the false sense of security.

| Variable | Visibility |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Config / Plain |
| `NEXT_PUBLIC_SANITY_DATASET` | Config / Plain |
| `NEXT_PUBLIC_SANITY_API_VERSION` | Config / Plain |
| `NEXT_PUBLIC_SITE_URL` | Config / Plain |
| `NEXT_PUBLIC_SUPABASE_URL` | Config / Plain |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Config / Plain |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret / Sensitive** |
| `SANITY_REVALIDATE_SECRET` | **Secret / Sensitive** |
| `ANALYTICS_SALT` | **Secret / Sensitive** |
| `SAM_ALLOWED_EMAIL` | **Secret / Sensitive** |

Setting the anon key to Config is safe. It is designed to be public: every
analytics table has RLS enabled with no anon policy, and `0002_harden.sql`
revokes the anon role's table grants outright. It can read nothing.

`SANITY_WRITE_TOKEN`, `SANITY_PROJECT_ID` and `SANITY_DATASET` are read only by
`scripts/seed-seo.mjs`, which you run from your own machine. **Do not add them
to Vercel at all** — the deployed site never needs a Sanity token.

**Never commit build output.** It's regenerated on every deploy and it's where inlined secrets hide.

**Check before you commit:**

```bash
git diff --cached --name-only | xargs -r grep -lIE "sk[A-Za-z0-9]{35,}|eyJhbGciOi|-----BEGIN [A-Z ]*PRIVATE"
```

Empty output means clean. Worth wiring into a pre-commit hook if you want it enforced rather than remembered.
