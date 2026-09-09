-- ============================================================================
-- SAM analytics — hardening + cron
--
-- Run after 0001_analytics.sql. Idempotent.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Revoke the anon role's table privileges entirely.
--
-- RLS already blocks every anon read, but that is one layer. Supabase grants
-- anon table-level SELECT by default, so if RLS were ever accidentally
-- disabled on a table — a migration, a dashboard toggle, a mistake — the
-- public anon key would immediately expose every visitor row.
--
-- Removing the grant means anon cannot read these tables even with RLS off.
-- Safe to do: the collector writes with the service_role key (which bypasses
-- both) and the dashboard reads as `authenticated`.
-- ---------------------------------------------------------------------------
revoke all on public.sessions      from anon;
revoke all on public.events        from anon;
revoke all on public.daily_rollups from anon;
revoke all on public.admins        from anon;

-- The sequence behind events.id would otherwise still be visible.
revoke all on sequence public.events_id_seq from anon;

-- Dashboard helpers are for signed-in admins only.
revoke all on function public.sam_overview(integer)                     from anon;
revoke all on function public.sam_timeseries(integer)                   from anon;
revoke all on function public.sam_top_pages(integer, integer)           from anon;
revoke all on function public.sam_breakdown(text, integer, integer)     from anon;
revoke all on function public.sam_crawlers(integer)                     from anon;
revoke all on function public.sam_conversions(integer)                  from anon;
revoke all on function public.sam_live_viewers(integer)                 from anon;

-- These two are SECURITY DEFINER, so they must never be callable by the
-- public key: sam_bump_session writes, sam_rollup_and_prune deletes.
revoke all on function public.sam_bump_session(uuid, integer, integer) from anon, authenticated;
revoke all on function public.sam_rollup_and_prune(integer)            from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Retention cron
--
-- pg_cron must exist before cron.schedule() resolves. Enabling it here means
-- you do not have to hunt for it in the Extensions UI.
--
-- pg_cron on Supabase runs in UTC. '17 3 * * *' is 03:17 UTC, which is
-- 09:17 in Dhaka (UTC+6). Pick an hour when the site is quiet locally.
-- ---------------------------------------------------------------------------
create extension if not exists pg_cron with schema cron;

-- Replace an existing schedule rather than stacking duplicates.
select cron.unschedule('sam-rollup-and-prune')
where exists (select 1 from cron.job where jobname = 'sam-rollup-and-prune');

select cron.schedule(
  'sam-rollup-and-prune',
  '17 3 * * *',
  $$select public.sam_rollup_and_prune(90)$$
);

-- ---------------------------------------------------------------------------
-- 3. Verify
-- ---------------------------------------------------------------------------
-- The job is registered:
--
--     select jobid, jobname, schedule, active, command from cron.job;
--
-- After it has run at least once (or after you trigger it by hand):
--
--     select jobid, status, return_message, start_time, end_time
--     from cron.job_run_details
--     order by start_time desc
--     limit 10;
--
-- Trigger it manually to prove the function works, without waiting a day.
-- With no data older than 90 days this is a no-op and should return an empty
-- result with no error:
--
--     select public.sam_rollup_and_prune(90);
--
-- Lockdown check. Note the EXPECTED RESULT: after the revokes above this is
-- now a hard "permission denied for table sessions", not a 0. Before the
-- revokes it returned 0 (RLS hid every row but the grant still existed).
--
--     set role anon;
--     select count(*) from public.sessions;   -- expect: ERROR permission denied
--     reset role;
--
-- An error there is the PASS condition. Then confirm your own access still
-- works by loading /sam in the browser.
-- ============================================================================
