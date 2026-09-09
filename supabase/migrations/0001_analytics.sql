-- ============================================================================
-- SAM analytics — schema
--
-- Run this in the Supabase SQL editor (Dashboard -> SQL Editor -> New query).
-- It is idempotent: safe to run more than once.
--
-- Design notes that matter:
--
--   * No IP addresses are stored anywhere. `visitor_hash` is a SHA-256 of
--     (ip + user-agent + a server-side salt + today's UTC date), computed in
--     the collector and never reversible back to an IP. Because the date is in
--     the hash it rotates every 24h, which is what lets the site run with no
--     cookies and therefore no consent banner. The cost is that a visitor
--     cannot be followed across days — deliberate.
--
--   * RLS is on for every table and there is NO policy granting the anon role
--     read access. Reads happen through the dashboard using the signed-in
--     user's session and an explicit admins check; writes happen only with the
--     service-role key from the server. A leaked anon key exposes nothing.
--
--   * `events` is raw and pruned at 90 days. `daily_rollups` keeps the
--     aggregates indefinitely so year-over-year still works after pruning.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- admins — who may read the dashboard
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null unique,
  created_at timestamptz not null default now()
);

comment on table public.admins is
  'Allowlist of accounts permitted to read analytics. A valid Supabase session is not sufficient; the user must also appear here.';

-- Helper used by every read policy.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- sessions — one row per visit
-- ---------------------------------------------------------------------------
create table if not exists public.sessions (
  id              uuid primary key default gen_random_uuid(),
  visitor_hash    text,                       -- daily-rotating, not an identity
  first_seen_at   timestamptz not null default now(),
  last_seen_at    timestamptz not null default now(),
  pageview_count  integer not null default 0,

  entry_path      text,
  exit_path       text,
  current_path    text,                       -- drives the live view

  referrer        text,
  referrer_group  text,                       -- direct|search|ai_assistant|social|other
  referrer_source text,                       -- 'Google', 'ChatGPT', 'LinkedIn', ...
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,

  country         text,
  region          text,
  city            text,
  latitude        double precision,
  longitude       double precision,
  timezone        text,

  device_type     text,                       -- desktop|mobile|tablet|unknown
  os              text,
  os_version      text,
  browser         text,
  browser_version text,
  screen_w        integer,
  screen_h        integer,
  viewport_w      integer,
  viewport_h      integer,
  language        text,
  color_scheme    text,                       -- light|dark

  is_bot          boolean not null default false,
  bot_name        text,

  -- Total engaged milliseconds, accumulated from beacon heartbeats.
  engaged_ms      integer not null default 0
);

create index if not exists sessions_last_seen_idx on public.sessions (last_seen_at desc);
create index if not exists sessions_first_seen_idx on public.sessions (first_seen_at desc);
create index if not exists sessions_is_bot_idx on public.sessions (is_bot, first_seen_at desc);
create index if not exists sessions_visitor_hash_idx on public.sessions (visitor_hash);
create index if not exists sessions_country_idx on public.sessions (country);

-- Live view: sessions seen in the last 30 seconds. Partial index keeps it tiny.
create index if not exists sessions_live_idx
  on public.sessions (last_seen_at desc)
  where is_bot = false;

-- ---------------------------------------------------------------------------
-- events — pageviews, conversions, crawler hits
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id          bigserial primary key,
  session_id  uuid references public.sessions (id) on delete cascade,
  ts          timestamptz not null default now(),

  -- pageview | heartbeat | cv_download | email_click | outbound_click
  -- | project_view | faq_open | scroll_depth | crawler_hit
  event_type  text not null,
  path        text not null,

  -- Denormalised so the crawler panel and geo charts do not need a join.
  country     text,
  city        text,
  device_type text,
  is_bot      boolean not null default false,
  bot_name    text,

  -- event_type-specific payload: {href, depth, seconds, slug, status, ...}
  meta        jsonb not null default '{}'::jsonb
);

create index if not exists events_ts_idx on public.events (ts desc);
create index if not exists events_type_ts_idx on public.events (event_type, ts desc);
create index if not exists events_path_ts_idx on public.events (path, ts desc);
create index if not exists events_session_idx on public.events (session_id);
create index if not exists events_bot_idx on public.events (is_bot, ts desc);
create index if not exists events_bot_name_idx on public.events (bot_name, ts desc)
  where bot_name is not null;

-- ---------------------------------------------------------------------------
-- daily_rollups — survives the 90-day prune
-- ---------------------------------------------------------------------------
create table if not exists public.daily_rollups (
  day       date not null,
  metric    text not null,   -- pageviews|visitors|sessions|bot_hits|cv_downloads|...
  dimension text not null default '',  -- country, path, bot name, ... ('' = total)
  value     bigint not null default 0,
  primary key (day, metric, dimension)
);

create index if not exists daily_rollups_day_idx on public.daily_rollups (day desc);
create index if not exists daily_rollups_metric_idx on public.daily_rollups (metric, day desc);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.admins        enable row level security;
alter table public.sessions      enable row level security;
alter table public.events        enable row level security;
alter table public.daily_rollups enable row level security;

-- Reads: admins only. No anon policy exists, so the anon key reads nothing.
drop policy if exists "admins read admins" on public.admins;
create policy "admins read admins" on public.admins
  for select to authenticated using (public.is_admin());

drop policy if exists "admins read sessions" on public.sessions;
create policy "admins read sessions" on public.sessions
  for select to authenticated using (public.is_admin());

drop policy if exists "admins read events" on public.events;
create policy "admins read events" on public.events
  for select to authenticated using (public.is_admin());

drop policy if exists "admins read rollups" on public.daily_rollups;
create policy "admins read rollups" on public.daily_rollups
  for select to authenticated using (public.is_admin());

-- No INSERT/UPDATE policies at all. The collector uses the service-role key,
-- which bypasses RLS. That key must never reach the browser.

-- ---------------------------------------------------------------------------
-- Counter bump
--
-- PostgREST cannot express `col = col + n`, and a read-modify-write from the
-- collector would race between concurrent pageviews. This does it atomically.
-- ---------------------------------------------------------------------------
create or replace function public.sam_bump_session(
  p_session_id uuid,
  p_pageviews integer default 0,
  p_engaged_ms integer default 0
)
returns void
language sql
security definer
set search_path = public
as $$
  update public.sessions
  set pageview_count = pageview_count + greatest(p_pageviews, 0),
      engaged_ms     = engaged_ms + greatest(p_engaged_ms, 0),
      last_seen_at   = now()
  where id = p_session_id;
$$;

-- ============================================================================
-- Dashboard helpers
-- ============================================================================

-- Live viewers right now, with where they are and what they are reading.
create or replace function public.sam_live_viewers(window_seconds integer default 30)
returns table (
  session_id uuid,
  current_path text,
  city text,
  region text,
  country text,
  device_type text,
  browser text,
  seconds_ago integer
)
language sql
security invoker
stable
as $$
  select
    s.id,
    s.current_path,
    s.city,
    s.region,
    s.country,
    s.device_type,
    s.browser,
    greatest(0, extract(epoch from (now() - s.last_seen_at))::integer)
  from public.sessions s
  where s.is_bot = false
    and s.last_seen_at > now() - make_interval(secs => window_seconds)
  order by s.last_seen_at desc
$$;

-- Headline numbers for a date range. Humans only.
create or replace function public.sam_overview(days integer default 30)
returns table (
  pageviews bigint,
  sessions bigint,
  visitors bigint,
  bounce_rate numeric,
  avg_engaged_seconds numeric,
  bot_hits bigint
)
language sql
security invoker
stable
as $$
  with span as (select now() - make_interval(days => days) as since),
  human_sessions as (
    select * from public.sessions, span
    where is_bot = false and first_seen_at >= span.since
  )
  select
    (select count(*) from public.events, span
      where is_bot = false and event_type = 'pageview' and ts >= span.since),
    (select count(*) from human_sessions),
    (select count(distinct visitor_hash) from human_sessions where visitor_hash is not null),
    (select round(
        100.0 * count(*) filter (where pageview_count <= 1)
        / greatest(count(*), 1), 1)
      from human_sessions),
    (select round(avg(engaged_ms) / 1000.0, 1) from human_sessions),
    (select count(*) from public.events, span
      where is_bot = true and ts >= span.since)
$$;

-- Group-by helper the dashboard reuses for country / city / device / browser /
-- os / referrer_source. Whitelisted column names — never interpolate input.
create or replace function public.sam_breakdown(
  field text,
  days integer default 30,
  max_rows integer default 20
)
returns table (label text, sessions bigint, visitors bigint)
language plpgsql
security invoker
stable
as $$
begin
  if field not in (
    'country','region','city','device_type','os','browser',
    'referrer_group','referrer_source','language','timezone'
  ) then
    raise exception 'sam_breakdown: unsupported field %', field;
  end if;

  -- `field` is whitelisted above and interpolated with %I (quoted identifier).
  -- The two numerics are typed integer parameters, so they are passed as bind
  -- values rather than interpolated at all.
  return query execute format($q$
    select
      coalesce(nullif(s.%I, ''), 'Unknown')::text as label,
      count(*)::bigint as sessions,
      count(distinct s.visitor_hash)::bigint as visitors
    from public.sessions s
    where s.is_bot = false
      and s.first_seen_at >= now() - make_interval(days => $1)
    group by 1
    order by sessions desc
    limit $2
  $q$, field)
  using days, max_rows;
end;
$$;

-- Crawler activity — the panel that tells you whether the AI-SEO work landed.
create or replace function public.sam_crawlers(days integer default 30)
returns table (
  bot_name text,
  hits bigint,
  distinct_paths bigint,
  last_seen_at timestamptz,
  fetched_llms_txt boolean
)
language sql
security invoker
stable
as $$
  select
    coalesce(e.bot_name, 'Unknown bot')::text,
    count(*)::bigint,
    count(distinct e.path)::bigint,
    max(e.ts),
    bool_or(e.path = '/llms.txt')
  from public.events e
  where e.is_bot = true
    and e.ts >= now() - make_interval(days => days)
  group by 1
  order by 2 desc
$$;

-- Top pages, humans only.
create or replace function public.sam_top_pages(days integer default 30, max_rows integer default 20)
returns table (path text, pageviews bigint, visitors bigint)
language sql
security invoker
stable
as $$
  select
    e.path,
    count(*)::bigint,
    count(distinct s.visitor_hash)::bigint
  from public.events e
  left join public.sessions s on s.id = e.session_id
  where e.is_bot = false
    and e.event_type = 'pageview'
    and e.ts >= now() - make_interval(days => days)
  group by 1
  order by 2 desc
  limit max_rows
$$;

-- Conversions — the events that actually matter for a job search.
create or replace function public.sam_conversions(days integer default 30)
returns table (event_type text, count bigint, last_at timestamptz)
language sql
security invoker
stable
as $$
  select e.event_type, count(*)::bigint, max(e.ts)
  from public.events e
  where e.is_bot = false
    and e.event_type in ('cv_download','email_click','outbound_click','project_view','faq_open')
    and e.ts >= now() - make_interval(days => days)
  group by 1
  order by 2 desc
$$;

-- Daily pageview / visitor series for the chart.
create or replace function public.sam_timeseries(days integer default 30)
returns table (day date, pageviews bigint, visitors bigint)
language sql
security invoker
stable
as $$
  select
    d::date,
    (select count(*) from public.events e
      where e.is_bot = false and e.event_type = 'pageview' and e.ts::date = d::date),
    (select count(distinct s.visitor_hash) from public.sessions s
      where s.is_bot = false and s.first_seen_at::date = d::date)
  from generate_series(
    (now() - make_interval(days => days))::date, now()::date, interval '1 day'
  ) as d
  order by 1
$$;

-- ============================================================================
-- Retention — 90 days of raw events, rollups kept forever
-- ============================================================================
create or replace function public.sam_rollup_and_prune(retain_days integer default 90)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Roll up everything older than the retention window before deleting it.
  insert into public.daily_rollups (day, metric, dimension, value)
  select ts::date, 'pageviews', '', count(*)
  from public.events
  where event_type = 'pageview' and is_bot = false
    and ts < now() - make_interval(days => retain_days)
  group by 1
  on conflict (day, metric, dimension) do update set value = excluded.value;

  insert into public.daily_rollups (day, metric, dimension, value)
  select ts::date, 'pageviews_by_path', path, count(*)
  from public.events
  where event_type = 'pageview' and is_bot = false
    and ts < now() - make_interval(days => retain_days)
  group by 1, 3
  on conflict (day, metric, dimension) do update set value = excluded.value;

  insert into public.daily_rollups (day, metric, dimension, value)
  select ts::date, 'bot_hits', coalesce(bot_name, 'Unknown bot'), count(*)
  from public.events
  where is_bot = true and ts < now() - make_interval(days => retain_days)
  group by 1, 3
  on conflict (day, metric, dimension) do update set value = excluded.value;

  insert into public.daily_rollups (day, metric, dimension, value)
  select first_seen_at::date, 'sessions_by_country', coalesce(country, 'Unknown'), count(*)
  from public.sessions
  where is_bot = false and first_seen_at < now() - make_interval(days => retain_days)
  group by 1, 3
  on conflict (day, metric, dimension) do update set value = excluded.value;

  delete from public.events
  where ts < now() - make_interval(days => retain_days);

  delete from public.sessions
  where last_seen_at < now() - make_interval(days => retain_days);
end;
$$;

comment on function public.sam_rollup_and_prune is
  'Aggregate then delete raw rows older than the retention window. Schedule daily via Supabase Dashboard -> Database -> Cron (pg_cron).';

-- ============================================================================
-- AFTER RUNNING THIS
-- ============================================================================
--
-- 1. Authentication -> Providers -> Email: turn OFF "Enable sign ups".
--
-- 2. Authentication -> Users -> Add user: create your single account with a
--    real password. Note the generated user id.
--
-- 3. Add yourself to the allowlist. This looks the id up by email, so there is
--    no UUID to copy by hand — just change the address:
--
--      insert into public.admins (user_id, email)
--      select id, email from auth.users
--      where email = 'you@example.com'
--      on conflict (user_id) do nothing;
--
--    Confirm exactly one row came back:
--
--      select email, created_at from public.admins;
--
-- 4. Run supabase/migrations/0002_harden.sql. It revokes the anon role's table
--    grants, enables pg_cron, and schedules the retention job. It lives in its
--    own file so this one stays schema-only.
--
-- 5. Confirm the lockdown. After 0002 this is a hard ERROR, and the error is
--    the PASS condition:
--
--      set role anon;
--      select count(*) from public.sessions;   -- expect: permission denied
--      reset role;
-- ============================================================================
