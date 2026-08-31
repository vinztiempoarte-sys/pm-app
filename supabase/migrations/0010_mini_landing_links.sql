-- Fase 3: enlaces de la mini-landing personalizable de cada distribuidor.
-- Los campos "de perfil" (slug, bio, color, logo) ya existían desde 0001;
-- aquí se añade la lista de enlaces que el usuario gestiona desde la app.

create table public.mini_landing_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  label text not null,
  url text not null,
  position integer not null default 0,
  click_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.mini_landing_links enable row level security;

create policy "mini_landing_links_select_own"
  on public.mini_landing_links for select
  using (auth.uid() = profile_id);

create policy "mini_landing_links_insert_own"
  on public.mini_landing_links for insert
  with check (auth.uid() = profile_id);

create policy "mini_landing_links_update_own"
  on public.mini_landing_links for update
  using (auth.uid() = profile_id);

create policy "mini_landing_links_delete_own"
  on public.mini_landing_links for delete
  using (auth.uid() = profile_id);

-- Función para incrementar el contador de clics de forma atómica, llamada
-- por la Edge Function "mini-landing-click" (con la service role key, que
-- ya se salta RLS — security definer aquí es solo para poder llamarla vía
-- RPC de forma sencilla, no para saltarse ningún permiso adicional).
create function public.increment_mini_landing_click(link_id uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.mini_landing_links
  set click_count = click_count + 1
  where id = link_id;
$$;

-- Nota deliberada: no se concede ningún acceso a "anon" sobre esta tabla,
-- ni sobre "profiles", para servir la página pública /l/[slug]. Esa página
-- pasa por las Edge Functions "mini-landing-public" y "mini-landing-click"
-- (con la service role key), igual que ya hacemos con Stripe — así evitamos
-- repetir el problema de permisos de columna que tuvimos en "profiles".
