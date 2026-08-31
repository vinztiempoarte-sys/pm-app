-- Fase 0: esquema inicial — profiles + contacts, RLS multi-tenant, campos RGPD/Fase 2 ready

create extension if not exists "pgcrypto";

-- =========================================================
-- profiles
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  pm_distributor_id text,
  current_rank text,

  -- marca personal / mini-landing (Fase 3)
  mini_landing_slug text unique,
  mini_landing_bio text,
  brand_color text,
  brand_logo_url text,

  -- Fase 2: monetización
  subscription_status text not null default 'trialing'
    check (subscription_status in ('trialing', 'active', 'past_due', 'canceled')),
  stripe_customer_id text,
  trial_ends_at timestamptz default (now() + interval '14 days'),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- crea automáticamente el profile al confirmarse el alta por Email OTP
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================
-- contacts
-- =========================================================
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,

  full_name text not null,
  phone text,
  email text,

  type text not null check (type in ('cliente', 'prospecto', 'equipo')),
  temperature text check (temperature in ('frio', 'tibio', 'caliente')),
  activity_status text check (activity_status in ('activo', 'inactivo')),
  source text,

  last_interaction_at timestamptz,
  next_action_at timestamptz,
  next_action_note text,

  -- solo aplica cuando type = 'equipo'
  team_rank text,
  team_join_date date,
  team_personal_volume numeric,
  team_group_volume numeric,
  sponsor_contact_id uuid references public.contacts (id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contacts_owner_id_idx on public.contacts (owner_id);
create index contacts_owner_next_action_idx on public.contacts (owner_id, next_action_at);
create index contacts_sponsor_idx on public.contacts (sponsor_contact_id);

alter table public.contacts enable row level security;

create policy "contacts_select_own"
  on public.contacts for select
  using (auth.uid() = owner_id);

create policy "contacts_insert_own"
  on public.contacts for insert
  with check (auth.uid() = owner_id);

create policy "contacts_update_own"
  on public.contacts for update
  using (auth.uid() = owner_id);

create policy "contacts_delete_own"
  on public.contacts for delete
  using (auth.uid() = owner_id);

-- =========================================================
-- RGPD: borrado en cascada al eliminar la cuenta
-- (contacts ya cae con "on delete cascade" desde profiles;
--  las tablas de fases posteriores deberán seguir el mismo patrón:
--  owner_id -> profiles(id) on delete cascade)
-- =========================================================

-- updated_at automático
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger set_contacts_updated_at
  before update on public.contacts
  for each row execute procedure public.set_updated_at();
