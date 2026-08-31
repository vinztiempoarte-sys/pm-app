-- Fase 1 (paso 5): agenda de citas/eventos

create table public.events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete set null,

  title text not null,
  type text not null default 'reunion'
    check (type in ('llamada', 'reunion', 'evento_empresa', 'formacion')),
  start_at timestamptz not null,
  end_at timestamptz,
  location text,
  reminder_sent_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_owner_start_idx on public.events (owner_id, start_at);
create index events_contact_id_idx on public.events (contact_id);

alter table public.events enable row level security;

create policy "events_select_own"
  on public.events for select
  using (auth.uid() = owner_id);

create policy "events_insert_own"
  on public.events for insert
  with check (auth.uid() = owner_id);

create policy "events_update_own"
  on public.events for update
  using (auth.uid() = owner_id);

create policy "events_delete_own"
  on public.events for delete
  using (auth.uid() = owner_id);

create trigger set_events_updated_at
  before update on public.events
  for each row execute procedure public.set_updated_at();
