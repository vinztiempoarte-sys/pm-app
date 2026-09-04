-- Cada usuario nuevo parte con el catálogo de productos principales de
-- FitLine ya cargado, para que el sistema de recompras funcione desde el
-- primer día (sin productos no se pueden registrar ventas). La duración
-- media es orientativa; el usuario puede editarla, cambiar el precio o
-- borrar cualquier producto libremente.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);

  insert into public.products (owner_id, name, category, avg_duration_days)
  values
    (new.id, 'FitLine Basics', 'Activación celular', 30),
    (new.id, 'FitLine Restorate', 'Antioxidantes y minerales', 30),
    (new.id, 'FitLine Activize Oxyplus', 'Energía y vitalidad', 30),
    (new.id, 'FitLine PowerCocktail', 'Bebida energética', 30),
    (new.id, 'FitLine Protein', 'Proteína', 20),
    (new.id, 'FitLine Beauty', 'Belleza y colágeno', 30);

  return new;
end;
$$;

-- Backfill: siembra el mismo catálogo para cuentas ya existentes que
-- todavía no tengan ningún producto propio (evita duplicar en cuentas
-- como la de pruebas, que ya se cargó a mano).
insert into public.products (owner_id, name, category, avg_duration_days)
select p.id, t.name, t.category, t.duration
from public.profiles p,
  lateral (values
    ('FitLine Basics', 'Activación celular', 30),
    ('FitLine Restorate', 'Antioxidantes y minerales', 30),
    ('FitLine Activize Oxyplus', 'Energía y vitalidad', 30),
    ('FitLine PowerCocktail', 'Bebida energética', 30),
    ('FitLine Protein', 'Proteína', 20),
    ('FitLine Beauty', 'Belleza y colágeno', 30)
  ) as t(name, category, duration)
where not exists (
  select 1 from public.products where owner_id = p.id
);
