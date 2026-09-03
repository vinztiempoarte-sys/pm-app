-- Fase 3: modo duplicación. El checklist de onboarding de 30/60/90 días
-- estaba fijo en el código (migración 0006) — ahora cada patrocinador
-- tiene su propia plantilla editable, y es ESA plantilla la que se clona
-- automáticamente al checklist de cada nuevo miembro de equipo.

create table public.checklist_templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  day_bucket integer not null check (day_bucket in (30, 60, 90)),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index checklist_templates_owner_id_idx on public.checklist_templates (owner_id);

alter table public.checklist_templates enable row level security;

create policy "checklist_templates_select_own"
  on public.checklist_templates for select
  using (auth.uid() = owner_id);

create policy "checklist_templates_insert_own"
  on public.checklist_templates for insert
  with check (auth.uid() = owner_id);

create policy "checklist_templates_update_own"
  on public.checklist_templates for update
  using (auth.uid() = owner_id);

create policy "checklist_templates_delete_own"
  on public.checklist_templates for delete
  using (auth.uid() = owner_id);

-- Siembra la plantilla por defecto (los 11 items que antes estaban fijos
-- en el código) para cada usuario ya existente, para que nadie pierda su
-- checklist actual al pasar a este sistema editable.
insert into public.checklist_templates (owner_id, title, day_bucket, position)
select p.id, t.title, t.day_bucket, t.ord
from public.profiles p,
  lateral (values
    ('Completar el registro oficial en PM International', 30, 1),
    ('Hacer su primer pedido / kit de bienvenida', 30, 2),
    ('Compartir la app con su primer contacto', 30, 3),
    ('Asistir a una llamada o formación inicial', 30, 4),
    ('Definir su lista de primeros 10 contactos', 30, 5),
    ('Realizar su primera venta', 60, 6),
    ('Invitar a alguien a un evento o formación', 60, 7),
    ('Revisar objetivos con su patrocinador', 60, 8),
    ('Alcanzar su primer rango', 90, 9),
    ('Ayudar a alguien de su equipo con su primer paso', 90, 10),
    ('Evaluar resultados de los primeros 90 días', 90, 11)
  ) as t(title, day_bucket, ord);

-- Reemplaza el trigger: ahora clona desde la plantilla del propio
-- patrocinador en vez de una lista fija en el código.
create or replace function public.seed_onboarding_checklist()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.type = 'equipo' then
    insert into public.onboarding_checklist_items (owner_id, contact_id, title, day_bucket)
    select new.owner_id, new.id, title, day_bucket
    from public.checklist_templates
    where owner_id = new.owner_id
    order by position;
  end if;
  return new;
end;
$$;
