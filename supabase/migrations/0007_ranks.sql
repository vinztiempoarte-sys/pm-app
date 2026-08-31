-- Fase 1 (paso 8): calculadora de rango, genérica y configurable por el usuario

create table public.ranks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,

  name text not null,
  min_personal_volume numeric not null default 0,
  min_group_volume numeric not null default 0,
  sort_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index ranks_owner_id_idx on public.ranks (owner_id);

alter table public.ranks enable row level security;

create policy "ranks_select_own"
  on public.ranks for select
  using (auth.uid() = owner_id);

create policy "ranks_insert_own"
  on public.ranks for insert
  with check (auth.uid() = owner_id);

create policy "ranks_update_own"
  on public.ranks for update
  using (auth.uid() = owner_id);

create policy "ranks_delete_own"
  on public.ranks for delete
  using (auth.uid() = owner_id);

create trigger set_ranks_updated_at
  before update on public.ranks
  for each row execute procedure public.set_updated_at();

-- guarda el volumen actual del propio usuario para no tener que reintroducirlo cada vez
alter table public.profiles
  add column current_personal_volume numeric,
  add column current_group_volume numeric;
