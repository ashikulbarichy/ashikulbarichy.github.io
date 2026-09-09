-- ============================================================================
-- SAM analytics — Realtime
--
-- Run after 0002_harden.sql. Idempotent.
--
-- Purpose: let the dashboard know the instant something happens, instead of
-- waiting for a poll interval.
--
-- What is published, and what is deliberately NOT:
--
--   events   INSERT  — every pageview, conversion and crawler hit. This is the
--                     signal worth reacting to.
--   sessions INSERT  — a brand new visit arriving.
--
--   sessions UPDATE  — EXCLUDED ON PURPOSE. The beacon sends a heartbeat every
--                     15 seconds per open tab, each of which updates
--                     last_seen_at. Publishing those would push a message per
--                     visitor per 15s to deliver nothing the dashboard does not
--                     already get from its 5-second live-viewer poll. It would
--                     burn Realtime quota to redraw identical numbers.
--
-- Realtime respects RLS: a subscriber only receives rows it could SELECT. The
-- admins-only policies from 0001 therefore apply to the stream as well, so an
-- anon key subscribing here receives nothing.
-- ============================================================================

-- Supabase ships this publication; create it only if somehow absent.
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end
$$;

-- Add the two tables, ignoring "already present".
do $$
begin
  begin
    alter publication supabase_realtime add table public.events;
  exception
    when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.sessions;
  exception
    when duplicate_object then null;
  end;
end
$$;

-- Realtime needs to identify rows for RLS evaluation on the stream. `full`
-- sends the whole old row on update/delete, which is what lets the RLS check
-- run against it. The tables are small and write-light, so the extra WAL
-- volume is immaterial here.
alter table public.events   replica identity full;
alter table public.sessions replica identity full;

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------
-- Both tables should be listed:
--
--     select schemaname, tablename
--     from pg_publication_tables
--     where pubname = 'supabase_realtime'
--     order by tablename;
--
-- You can also see it in the dashboard under Database -> Replication.
-- ============================================================================
