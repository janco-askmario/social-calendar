-- Fix: list/card/checklist deletions weren't propagating over realtime to
-- other sessions.
--
-- Root cause: Postgres tables default to REPLICA IDENTITY DEFAULT, which
-- means the "old row" image sent to logical replication (and therefore to
-- Supabase Realtime) for UPDATE/DELETE only contains the primary key column,
-- not the rest of the row. This app relies on non-PK columns from the old
-- row in two ways:
--   1. The `lists` subscription filters server-side on `board_id=eq.<id>` -
--      for a DELETE, Postgres can't evaluate that filter without board_id
--      in the old row, so the event was silently dropped.
--   2. The `cards`/`checklist_items` subscriptions filter client-side on
--      `list_id`/`card_id` via payload.old - same problem, those columns
--      were missing from DELETE payloads.
-- REPLICA IDENTITY FULL makes Postgres include the entire old row, fixing
-- both cases.
alter table public.boards replica identity full;
alter table public.lists replica identity full;
alter table public.cards replica identity full;
alter table public.checklist_items replica identity full;
