-- =========================================================
-- My Trade Lens — migration 2 (run after the initial schema)
-- Adds: daily_summary, goals, journal
-- =========================================================

-- ---------- daily_summary ----------
create table if not exists public.daily_summary (
  id uuid default gen_random_uuid() primary key,
  date date not null unique,
  total_trades int,
  total_result numeric,
  total_change_pct numeric,
  total_points numeric,
  gains int,
  losses int,
  assertiveness numeric,
  top_setup text,
  top_error text,
  top_sentiment text,
  observation text,
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.daily_summary to anon, authenticated;
grant all on public.daily_summary to service_role;
alter table public.daily_summary enable row level security;
drop policy if exists "allow all" on public.daily_summary;
create policy "allow all" on public.daily_summary for all using (true) with check (true);

-- ---------- goals (singleton) ----------
create table if not exists public.goals (
  id uuid default gen_random_uuid() primary key,
  daily_result numeric,
  weekly_result numeric,
  monthly_result numeric,
  assertiveness numeric,
  max_daily_loss numeric,
  max_daily_trades int,
  created_at timestamptz default now()
);
-- column add for already-existing installs
alter table public.goals add column if not exists max_daily_trades int;
grant select, insert, update, delete on public.goals to anon, authenticated;
grant all on public.goals to service_role;
alter table public.goals enable row level security;
drop policy if exists "allow all" on public.goals;
create policy "allow all" on public.goals for all using (true) with check (true);

-- ---------- journal ----------
create table if not exists public.journal (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  title text,
  content text not null,
  mood text,
  daily_summary_id uuid references public.daily_summary(id) on delete set null,
  "order" int default 0,
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.journal to anon, authenticated;
grant all on public.journal to service_role;
alter table public.journal enable row level security;
drop policy if exists "allow all" on public.journal;
create policy "allow all" on public.journal for all using (true) with check (true);
