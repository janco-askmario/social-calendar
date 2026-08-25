-- Social Media Calendar - initial schema
-- Run this against a fresh Supabase project (SQL editor or `supabase db push`).

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Any authenticated user can read every profile's name/id (needed for the
-- read-only "team member" avatar list). Email is intentionally left out of
-- the broad policy below is not possible with row-level security alone
-- (RLS is row-level, not column-level), so instead we rely on the app only
-- ever displaying `name` from the list query. If you want to hide email
-- from teammates entirely, put it in a separate table or use a view/RPC
-- that excludes it. Users can always read/update their own full row.
create policy "profiles are readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Inserts are performed by the trigger below (as the postgres role), not by
-- clients directly, so no insert policy is granted to regular users.

-- ---------------------------------------------------------------------------
-- events (shared team table - not per-user)
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  colour text not null default 'lavender',
  platform text not null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.events enable row level security;

create index if not exists events_start_time_idx on public.events (start_time);

-- Only approved users may read or write events. RLS is the actual security
-- boundary here - the frontend "approved" gate is UX only.
create policy "approved users can read events"
  on public.events for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.approved = true
    )
  );

create policy "approved users can insert events"
  on public.events for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.approved = true
    )
  );

create policy "approved users can update events"
  on public.events for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.approved = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.approved = true
    )
  );

create policy "approved users can delete events"
  on public.events for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.approved = true
    )
  );

-- ---------------------------------------------------------------------------
-- updated_at auto-update trigger (shared function, applied to both tables)
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_events_updated_at on public.events;
create trigger set_events_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- auto-create a profile row whenever a new auth user signs up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, approved)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- realtime
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.events;
