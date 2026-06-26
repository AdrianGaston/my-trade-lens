-- =========================================================
-- My Trade Lens — initial schema (run in Supabase SQL Editor)
-- Project: egyvvcnbevlmcowdibry
-- =========================================================

-- ---------- TABLES ----------
create table if not exists public.assets (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  "order" int default 0,
  created_at timestamptz default now()
);

create table if not exists public.setups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  "order" int default 0,
  created_at timestamptz default now()
);

create table if not exists public.errors (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  "order" int default 0,
  created_at timestamptz default now()
);

create table if not exists public.sentiments (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  "order" int default 0,
  created_at timestamptz default now()
);

create table if not exists public.trades (
  id uuid default gen_random_uuid() primary key,
  date date,
  asset text,
  type text,
  volume numeric,
  setup text,
  trend text,
  sentiment text,
  error text,
  points numeric,
  result numeric,
  change_pct numeric,
  created_at timestamptz default now()
);

create table if not exists public.checklists (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  image_url text,
  "order" int default 0,
  created_at timestamptz default now()
);

create table if not exists public.management (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  items jsonb default '[]'::jsonb,
  image_url text,
  "order" int default 0,
  created_at timestamptz default now()
);

create table if not exists public.trading_plan (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  "order" int default 0,
  created_at timestamptz default now()
);

create table if not exists public.notes (
  id uuid default gen_random_uuid() primary key,
  section text not null,
  content text not null default '',
  completed boolean default false,
  "order" int default 0,
  created_at timestamptz default now()
);

-- ---------- GRANTS (required for PostgREST / Data API) ----------
do $$
declare t text;
begin
  for t in select unnest(array[
    'assets','setups','errors','sentiments','trades',
    'checklists','management','trading_plan','notes'
  ]) loop
    execute format('grant select, insert, update, delete on public.%I to anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end$$;

-- ---------- RLS (open policies — single-user app) ----------
do $$
declare t text;
begin
  for t in select unnest(array[
    'assets','setups','errors','sentiments','trades',
    'checklists','management','trading_plan','notes'
  ]) loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "allow all" on public.%I', t);
    execute format('create policy "allow all" on public.%I for all using (true) with check (true)', t);
  end loop;
end$$;

-- ---------- STORAGE BUCKET ----------
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "images allow all read"  on storage.objects;
drop policy if exists "images allow all write" on storage.objects;
create policy "images allow all read"  on storage.objects for select using (bucket_id = 'images');
create policy "images allow all write" on storage.objects for all
  using (bucket_id = 'images') with check (bucket_id = 'images');

-- ---------- SEED DEFAULT CATALOGS ----------
insert into public.errors (name, "order")
select v.name, v.ord from (values
  ('Nenhum', 0), ('Emocional', 1), ('Foco', 2), ('Gerenciamento', 3),
  ('Hesitação', 4), ('Quantidade', 5), ('Setup', 6), ('Stop', 7)
) as v(name, ord)
where not exists (select 1 from public.errors);

insert into public.sentiments (name, "order")
select v.name, v.ord from (values
  ('Neutro', 0), ('Ansiedade', 1), ('Dúvida', 2), ('Esperança', 3),
  ('Euforia', 4), ('Ganância', 5), ('Medo', 6), ('Raiva', 7)
) as v(name, ord)
where not exists (select 1 from public.sentiments);

insert into public.setups (name, "order")
select v.name, v.ord from (values
  ('Abertura', 0), ('Barra Elefante', 1), ('Gap & Go', 2),
  ('MM200', 3), ('Pullback', 4), ('Região', 5)
) as v(name, ord)
where not exists (select 1 from public.setups);

insert into public.assets (name, "order")
select v.name, v.ord from (values
  ('UsaInd', 0), ('UsaTec', 1), ('Usa500', 2),
  ('UsaRus', 3), ('MinDol', 4), ('HKInd', 5)
) as v(name, ord)
where not exists (select 1 from public.assets);
