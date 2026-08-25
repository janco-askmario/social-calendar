-- Social Media Calendar - Trello-style boards feature
-- Run this against the same Supabase project as 0001_init.sql.
--
-- Security model (mirrors 0001_init.sql exactly): boards, lists, cards and
-- checklist_items are shared team data, not per-user. Any authenticated user
-- whose profiles.approved = true may read/write everything; RLS is the real
-- boundary, the frontend "approved" gate is UX only.

-- ---------------------------------------------------------------------------
-- boards
-- ---------------------------------------------------------------------------
create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.boards enable row level security;

create policy "approved users can read boards"
  on public.boards for select
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.approved = true)
  );

create policy "approved users can insert boards"
  on public.boards for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.approved = true)
  );

create policy "approved users can update boards"
  on public.boards for update
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.approved = true)
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.approved = true)
  );

create policy "approved users can delete boards"
  on public.boards for delete
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.approved = true)
  );

-- ---------------------------------------------------------------------------
-- lists (columns within a board)
-- ---------------------------------------------------------------------------
create table if not exists public.lists (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  name text not null,
  position numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lists enable row level security;

create index if not exists lists_board_id_idx on public.lists (board_id);

create policy "approved users can read lists"
  on public.lists for select
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.approved = true)
  );

create policy "approved users can insert lists"
  on public.lists for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.approved = true)
  );

create policy "approved users can update lists"
  on public.lists for update
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.approved = true)
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.approved = true)
  );

create policy "approved users can delete lists"
  on public.lists for delete
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.approved = true)
  );

-- ---------------------------------------------------------------------------
-- cards
-- ---------------------------------------------------------------------------
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists (id) on delete cascade,
  title text not null,
  description text,
  colour text,
  position numeric not null default 0,
  is_done boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cards enable row level security;

create index if not exists cards_list_id_idx on public.cards (list_id);

create policy "approved users can read cards"
  on public.cards for select
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.approved = true)
  );

create policy "approved users can insert cards"
  on public.cards for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.approved = true)
  );

create policy "approved users can update cards"
  on public.cards for update
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.approved = true)
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.approved = true)
  );

create policy "approved users can delete cards"
  on public.cards for delete
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.approved = true)
  );

-- ---------------------------------------------------------------------------
-- checklist_items
-- ---------------------------------------------------------------------------
create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards (id) on delete cascade,
  text text not null,
  is_checked boolean not null default false,
  position numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.checklist_items enable row level security;

create index if not exists checklist_items_card_id_idx on public.checklist_items (card_id);

create policy "approved users can read checklist_items"
  on public.checklist_items for select
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.approved = true)
  );

create policy "approved users can insert checklist_items"
  on public.checklist_items for insert
  to authenticated
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.approved = true)
  );

create policy "approved users can update checklist_items"
  on public.checklist_items for update
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.approved = true)
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.approved = true)
  );

create policy "approved users can delete checklist_items"
  on public.checklist_items for delete
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.approved = true)
  );

-- ---------------------------------------------------------------------------
-- updated_at triggers - reuse public.set_updated_at() defined in 0001_init.sql
-- ---------------------------------------------------------------------------
drop trigger if exists set_boards_updated_at on public.boards;
create trigger set_boards_updated_at
  before update on public.boards
  for each row execute function public.set_updated_at();

drop trigger if exists set_lists_updated_at on public.lists;
create trigger set_lists_updated_at
  before update on public.lists
  for each row execute function public.set_updated_at();

drop trigger if exists set_cards_updated_at on public.cards;
create trigger set_cards_updated_at
  before update on public.cards
  for each row execute function public.set_updated_at();

drop trigger if exists set_checklist_items_updated_at on public.checklist_items;
create trigger set_checklist_items_updated_at
  before update on public.checklist_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- realtime
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.boards;
alter publication supabase_realtime add table public.lists;
alter publication supabase_realtime add table public.cards;
alter publication supabase_realtime add table public.checklist_items;
