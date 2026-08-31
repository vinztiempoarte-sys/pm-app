-- Fase 1 (paso 6): biblioteca de guiones/plantillas

create table public.templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,

  category text not null
    check (category in ('primer_contacto', 'seguimiento', 'objecion_precio', 'cierre', 'onboarding_equipo', 'otro')),
  title text not null,
  content text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index templates_owner_id_idx on public.templates (owner_id);

alter table public.templates enable row level security;

create policy "templates_select_own"
  on public.templates for select
  using (auth.uid() = owner_id);

create policy "templates_insert_own"
  on public.templates for insert
  with check (auth.uid() = owner_id);

create policy "templates_update_own"
  on public.templates for update
  using (auth.uid() = owner_id);

create policy "templates_delete_own"
  on public.templates for delete
  using (auth.uid() = owner_id);

create trigger set_templates_updated_at
  before update on public.templates
  for each row execute procedure public.set_updated_at();

-- =========================================================
-- Amplía el trigger de alta de usuario para sembrar unas
-- plantillas de arranque, así nadie empieza con la lista vacía.
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);

  insert into public.templates (owner_id, category, title, content) values
    (new.id, 'primer_contacto', 'Primer mensaje',
     'Hola [nombre], soy [tu nombre] 😊 Te escribo porque [motivo del contacto: nos conocimos en..., me diste tu contacto..., vi que te interesa...]. Si tienes un minuto me encantaría contarte algo que puede interesarte, sin ningún compromiso. ¿Te viene bien que hablemos?'),
    (new.id, 'seguimiento', 'Retomar contacto',
     'Hola [nombre] ¿qué tal todo? Hace tiempo que no hablamos y quería saber cómo te va con [tema anterior]. Si en algún momento te apetece retomarlo, aquí estoy, sin prisa ninguna 🙂'),
    (new.id, 'objecion_precio', 'Es muy caro',
     'Entiendo perfectamente, el precio siempre es algo a valorar. Lo que sí te puedo decir es que [beneficio concreto / comparación de valor]. Muchas personas al principio piensan lo mismo, y luego ven que [resultado/beneficio a medio plazo]. ¿Quieres que veamos juntos qué opción se ajusta mejor a lo que buscas?'),
    (new.id, 'cierre', 'Pedir la decisión',
     'Con todo lo que hemos hablado, creo que [producto/opción] encaja muy bien con lo que me contabas que buscabas. ¿Te gustaría que lo dejemos listo hoy mismo, o prefieres que resolvamos alguna duda más antes?'),
    (new.id, 'onboarding_equipo', 'Bienvenida a nuevo/a en el equipo',
     '¡Bienvenido/a al equipo, [nombre]! 🎉 Estoy aquí para acompañarte en todo lo que necesites al principio. En los próximos días te iré contando los primeros pasos, y cualquier duda que tengas, escríbeme sin problema — para eso estamos.');

  return new;
end;
$$;

-- =========================================================
-- Siembra las mismas plantillas para cuentas que ya existían
-- antes de este cambio (para que no se queden sin nada).
-- =========================================================
insert into public.templates (owner_id, category, title, content)
select p.id, t.category, t.title, t.content
from public.profiles p
cross join (
  values
    ('primer_contacto', 'Primer mensaje',
     'Hola [nombre], soy [tu nombre] 😊 Te escribo porque [motivo del contacto: nos conocimos en..., me diste tu contacto..., vi que te interesa...]. Si tienes un minuto me encantaría contarte algo que puede interesarte, sin ningún compromiso. ¿Te viene bien que hablemos?'),
    ('seguimiento', 'Retomar contacto',
     'Hola [nombre] ¿qué tal todo? Hace tiempo que no hablamos y quería saber cómo te va con [tema anterior]. Si en algún momento te apetece retomarlo, aquí estoy, sin prisa ninguna 🙂'),
    ('objecion_precio', 'Es muy caro',
     'Entiendo perfectamente, el precio siempre es algo a valorar. Lo que sí te puedo decir es que [beneficio concreto / comparación de valor]. Muchas personas al principio piensan lo mismo, y luego ven que [resultado/beneficio a medio plazo]. ¿Quieres que veamos juntos qué opción se ajusta mejor a lo que buscas?'),
    ('cierre', 'Pedir la decisión',
     'Con todo lo que hemos hablado, creo que [producto/opción] encaja muy bien con lo que me contabas que buscabas. ¿Te gustaría que lo dejemos listo hoy mismo, o prefieres que resolvamos alguna duda más antes?'),
    ('onboarding_equipo', 'Bienvenida a nuevo/a en el equipo',
     '¡Bienvenido/a al equipo, [nombre]! 🎉 Estoy aquí para acompañarte en todo lo que necesites al principio. En los próximos días te iré contando los primeros pasos, y cualquier duda que tengas, escríbeme sin problema — para eso estamos.')
) as t(category, title, content)
where not exists (
  select 1 from public.templates existing where existing.owner_id = p.id
);
