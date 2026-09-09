# SAM — analytics

First-party analytics at `/sam`, behind Supabase auth. Replaces Google Analytics.

---

## Setup

### 1. Create the Supabase project

Pick the region closest to Dhaka — **Singapore (`ap-southeast-1`)** — so dashboard queries are fast. Collector writes are fire-and-forget, so their latency never delays a page.

### 2. Run the schema

Supabase Dashboard → SQL Editor → New query → paste all of `supabase/migrations/0001_analytics.sql` → Run.

It is idempotent, so re-running it is safe.

### 3. Lock down auth

**Authentication → Providers → Email → turn OFF "Enable sign ups".** There is exactly one account and you create it by hand; a self-service signup would be a way into your visitor data.

Then **Authentication → Users → Add user** with a real password. Copy the generated user id.

### 4. Add yourself to the allowlist

Looks the id up by email, so there is no UUID to copy by hand:

```sql
insert into public.admins (user_id, email)
select id, email from auth.users
where email = 'you@example.com'
on conflict (user_id) do nothing;
```

Confirm exactly one row:

```sql
select email, created_at from public.admins;
```

### 5. Fill in the environment variables

From Supabase → Project Settings → API:

| Variable | Where it goes | Value |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + `.env.local` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + `.env.local` | `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel + `.env.local` | `service_role` `secret` key |
| `SAM_ALLOWED_EMAIL` | Vercel + `.env.local` | the email from step 3 |
| `ANALYTICS_SALT` | Vercel + `.env.local` | already generated in your `.env.local` — copy that same value to Vercel |

**`SUPABASE_SERVICE_ROLE_KEY` must never get a `NEXT_PUBLIC_` prefix.** It bypasses Row Level Security entirely; with that prefix Next would inline it into the browser bundle and hand anyone full read/write on your database.

Use the *same* `ANALYTICS_SALT` locally and in production. Changing it resets unique-visitor counting from that day on.

### 6. Harden and schedule the cron

Run all of `supabase/migrations/0002_harden.sql` in the SQL editor. It does three things:

1. **Revokes the anon role's table grants.** RLS already blocks anon reads, but Supabase grants anon table-level `SELECT` by default — so if RLS were ever accidentally disabled, the public key would expose every visitor row. Removing the grant means anon cannot read even with RLS off.
2. **Enables `pg_cron`.** This is the step that trips people up: `cron.schedule()` fails with *"schema cron does not exist"* until the extension is on.
3. **Schedules `sam_rollup_and_prune(90)`** daily, replacing any existing schedule of the same name rather than stacking duplicates.

**pg_cron runs in UTC on Supabase.** `17 3 * * *` is 03:17 UTC = **09:17 Dhaka**. Change the expression if you want it overnight local time — `17 20 * * *` is 02:17 Dhaka.

Verify it registered:

```sql
select jobid, jobname, schedule, active from cron.job;
```

Prove the function itself works without waiting a day. With no data older than 90 days this is a no-op and should complete with no error:

```sql
select public.sam_rollup_and_prune(90);
```

After the first scheduled run, check the outcome:

```sql
select status, return_message, start_time
from cron.job_run_details
order by start_time desc
limit 10;
```


### 7. Enable Realtime

Run `supabase/migrations/0003_realtime.sql`. This is what makes the dashboard update the instant something happens instead of on a timer.

It publishes `events` INSERT and `sessions` INSERT to the `supabase_realtime` publication. It deliberately does **not** publish `sessions` UPDATE: the beacon heartbeats every 15s per open tab, so publishing those would push a message per visitor per 15 seconds to redraw numbers the live-viewer poll already covers.

Verify both tables are listed:

```sql
select tablename from pg_publication_tables
where pubname = 'supabase_realtime' order by tablename;
```

Realtime respects RLS, so the admins-only policies apply to the stream too — an anon key subscribing receives nothing.

### 8. Verify the lockdown

```sql
set role anon;
select count(*) from public.sessions;   -- expect: ERROR permission denied
reset role;
```

**The error is the pass.** Before `0002_harden.sql` this returned `0` — RLS hid every row, but the table grant still existed. After the revokes it fails outright, which is the stronger guarantee.

Then, in the browser: open `/sam` signed out — you should land on `/sam/login`.

---

## What's built

| File | Role |
|---|---|
| `middleware.ts` | Gates `/sam`; records crawler hits server-side |
| `app/api/collect/route.ts` | Edge collector for human pageviews, heartbeats, conversions |
| `components/Analytics.tsx` | Client beacon — pageviews, 15s heartbeat, scroll depth, conversion clicks |
| `lib/analytics/classify.ts` | Bot detection, referrer grouping, visitor hash, ignored paths |
| `lib/analytics/ingest.ts` | Supabase write path (service-role, server only) |
| `lib/supabase/{config,server,browser,admin-guard}.ts` | Clients and the three-layer admin gate |
| `app/sam/` | Login + dashboard |
| `app/api/sam/live/route.ts` | Live viewers, polled every 5s |
| `app/api/sam/stats/route.ts` | All panels in one payload, refetched on Realtime signal |
| `lib/sam/stats.ts` | Shared query layer — used by both the page and the API |
| `components/sam/Dashboard.tsx` | Client dashboard, range picker, chart, panels |
| `components/sam/useLiveStats.ts` | Realtime subscription + polling fallback |

### Why two collection paths

Crawlers don't run JavaScript, so the client beacon is invisible to them — and crawler activity is the most valuable thing here, because it tells you whether the AI-SEO work is being read. So middleware records bots server-side.

Humans go through the beacon instead, which means a real visitor never waits on a database insert, and you get screen size, engagement time and scroll depth that the server can't see.

The bot insert *is* awaited, adding ~50–150ms to a crawler's request. Bots don't care, and it avoids relying on fire-and-forget fetches that the Edge runtime may cancel once the response is sent.

### How live updating works

Two mechanisms, because either alone is insufficient:

**Supabase Realtime is the trigger, not the transport.** A new row in `events` or `sessions` means the numbers changed, so the client refetches `/api/sam/stats`. It deliberately does *not* compute aggregates client-side from the streamed rows — that would create a second definition of every metric that could drift from the SQL. One row arriving means "ask again", nothing more.

**Polling is the safety net.** Realtime channels drop: laptops sleep, networks change, quota runs out. Without a fallback the dashboard would sit there looking authoritative while being an hour stale. So it polls every 30s while Realtime is healthy, and every 8s when it isn't.

Refetches are debounced at 1.2s and never stack, so a burst of pageviews causes one request rather than one per row. Polling pauses when the tab is hidden and fires immediately when you come back.

The header shows which mode you're in:

| Indicator | Meaning |
|---|---|
| 🟢 **Live** | Realtime connected; updates arrive within ~1s of an event |
| 🟡 **Polling** | Realtime dropped; still current within 8s |
| ⚪ Connecting | Establishing the channel |
| 🔴 Session expired | Reload and sign in again |

Next to it, "updated Ns ago" ticks every second and flashes green when new data lands — so you can tell the difference between "nothing is happening" and "the dashboard is stuck".

The live-viewer list is separate and polls every 5s, since presence is about *absence* of events (someone leaving generates no row to react to).

### Privacy

No cookies. No IP addresses stored anywhere. `visitor_hash` is SHA-256 over `salt + ip + user-agent + today's UTC date`, computed in the collector; the raw IP is used only to derive it and never written.

The date inside the hash rotates it every 24 hours. That's the deliberate trade: **no consent banner is required**, and the cost is that the same person tomorrow counts as a new visitor.

`sessionStorage` holds a session id so pageviews group into a visit. It dies with the tab and never leaves the browser.

### What is never recorded

`/sam` itself (otherwise you'd be your own top visitor), `/api/*`, `/_next/*`, and anything with a file extension — except `/llms.txt`, `/humans.txt`, `/robots.txt` and `/sitemap.xml`, which are real pages worth knowing about. A crawler fetching `/llms.txt` is the single clearest signal the agentic SEO is landing.

---

## Extending the dashboard

The SQL functions already exist, so adding a panel means rendering another table:

| Function | Returns |
|---|---|
| `sam_overview(days)` | pageviews, sessions, visitors, bounce rate, avg engaged seconds, bot hits |
| `sam_timeseries(days)` | daily pageviews + visitors, for a chart |
| `sam_top_pages(days, max_rows)` | path, pageviews, visitors |
| `sam_breakdown(field, days, max_rows)` | group by country / region / city / device_type / os / browser / referrer_group / referrer_source / language / timezone |
| `sam_crawlers(days)` | bot name, hits, distinct paths, last seen, whether it fetched `/llms.txt` |
| `sam_conversions(days)` | CV downloads, email clicks, outbound clicks, project views, FAQ opens |
| `sam_live_viewers(window_seconds)` | who is on the site right now, and where |

`sam_timeseries` now renders as an inline SVG bar chart (no chart library). Still unwired: the lat/lng columns, which need a map component. The data is already being collected.

To track a new interaction, import the helper anywhere in a client component:

```ts
import { trackEvent } from '@/components/Analytics'

trackEvent('outbound_click', { href, host })
```

Add the new `event_type` to the `ALLOWED` set in `app/api/collect/route.ts` — the collector rejects unknown types on purpose, so a stray or forged event can't create arbitrary rows.

---

## Google Analytics has been removed

`NEXT_PUBLIC_GA_ID`, the `gtag.js` script and the GA init block are gone from `app/layout.tsx` and both env files. Verified: zero `gtag` references in the served HTML.

You can delete the GA4 property when you're satisfied the numbers here look right. One thing you lose: GA4's Search Console integration. Search Console itself still works — it's just no longer joined to your analytics.
