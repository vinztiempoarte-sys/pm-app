-- Fase 1 (paso 7): checklist de onboarding 30/60/90 para nuevos miembros de equipo

create table public.onboarding_checklist_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  contact_id uuid not null references public.contacts (id) on delete cascade,

  title text not null,
  day_bucket integer not null check (day_bucket in (30, 60, 90)),
  completed boolean not null default false,
  completed_at timestamptz,

  created_at timestamptz not null default now()
);

create index checklist_contact_id_idx on public.onboarding_checklist_items (contact_id);
create index checklist_owner_id_idx on public.onboarding_checklist_items (owner_id);

alter table public.onboarding_checklist_items enable row level security;

create policy "checklist_select_own"
  on public.onboarding_checklist_items for select
  using (auth.uid() = owner_id);

create policy "checklist_insert_own"
  on public.onboarding_checklist_items for insert
  with check (auth.uid() = owner_id);

create policy "checklist_update_own"
  on public.onboarding_checklist_items for update
  using (auth.uid() = owner_id);

create policy "checklist_delete_own"
  on public.onboarding_checklist_items for delete
  using (auth.uid() = owner_id);

-- =========================================================
-- Al crear un contacto de tipo 'equipo', siembra automáticamente
-- su checklist de onboarding de 30/60/90 días.
-- =========================================================
create function public.seed_onboarding_checklist()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.type = 'equipo' then
    insert into public.onboarding_checklist_items (owner_id, contact_id, title, day_bucket) values
      (new.owner_id, new.id, 'Completar el registro oficial en PM International', 30),
      (new.owner_id, new.id, 'Hacer su primer pedido / kit de bienvenida', 30),
      (new.owner_id, new.id, 'Compartir la app con su primer contacto', 30),
      (new.owner_id, new.id, 'Asistir a una llamada o formación inicial', 30),
      (new.owner_id, new.id, 'Definir su lista de primeros 10 contactos', 30),
      (new.owner_id, new.id, 'Realizar su primera venta', 60),
      (new.owner_id, new.id, 'Invitar a alguien a un evento o formación', 60),
      (new.owner_id, new.id, 'Revisar objetivos con su patrocinador', 60),
      (new.owner_id, new.id, 'Alcanzar su primer rango', 90),
      (new.owner_id, new.id, 'Ayudar a alguien de su equipo con su primer paso', 90),
      (new.owner_id, new.id, 'Evaluar resultados de los primeros 90 días', 90);
  end if;
  return new;
end;
$$;

create trigger contacts_seed_checklist
  after insert on public.contacts
  for each row execute procedure public.seed_onboarding_checklist();
