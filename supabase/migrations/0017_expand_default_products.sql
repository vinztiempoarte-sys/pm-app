-- Amplía el catálogo por defecto de FitLine con 3 productos más:
-- Sensitiv (articulaciones), Immunize (sistema inmune) y Optimal-Set
-- (el pack combinado Basics+Restorate+Activize). Se añade al trigger de
-- alta para cuentas nuevas, y se rellena para cuentas existentes que
-- todavía no los tengan (sin tocar los 6 productos que ya tenían).

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
    (new.id, 'FitLine Beauty', 'Belleza y colágeno', 30),
    (new.id, 'FitLine Sensitiv', 'Articulaciones y movilidad', 30),
    (new.id, 'FitLine Immunize', 'Sistema inmune', 30),
    (new.id, 'FitLine Optimal-Set', 'Pack Basics + Restorate + Activize', 30);

  return new;
end;
$$;

insert into public.products (owner_id, name, category, avg_duration_days)
select p.id, t.name, t.category, t.duration
from public.profiles p,
  lateral (values
    ('FitLine Sensitiv', 'Articulaciones y movilidad', 30),
    ('FitLine Immunize', 'Sistema inmune', 30),
    ('FitLine Optimal-Set', 'Pack Basics + Restorate + Activize', 30)
  ) as t(name, category, duration)
where not exists (
  select 1 from public.products where owner_id = p.id and name = t.name
);
