-- Fase 1 (paso 3): productos + ventas, con cálculo de fecha estimada de recompra

create table public.products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,

  name text not null,
  category text,
  avg_duration_days integer not null default 30,
  default_price numeric,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_owner_id_idx on public.products (owner_id);

alter table public.products enable row level security;

create policy "products_select_own"
  on public.products for select
  using (auth.uid() = owner_id);

create policy "products_insert_own"
  on public.products for insert
  with check (auth.uid() = owner_id);

create policy "products_update_own"
  on public.products for update
  using (auth.uid() = owner_id);

create policy "products_delete_own"
  on public.products for delete
  using (auth.uid() = owner_id);

create trigger set_products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

-- =========================================================
create table public.sales (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  contact_id uuid not null references public.contacts (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,

  quantity integer not null default 1,
  price numeric,
  sale_date date not null default current_date,
  estimated_reorder_date date not null,
  status text not null default 'pendiente_recompra'
    check (status in ('pendiente_recompra', 'recomprado', 'perdido')),
  reminder_sent_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sales_owner_id_idx on public.sales (owner_id);
create index sales_contact_id_idx on public.sales (contact_id);
create index sales_reorder_status_idx on public.sales (owner_id, estimated_reorder_date, status);

alter table public.sales enable row level security;

create policy "sales_select_own"
  on public.sales for select
  using (auth.uid() = owner_id);

create policy "sales_insert_own"
  on public.sales for insert
  with check (auth.uid() = owner_id);

create policy "sales_update_own"
  on public.sales for update
  using (auth.uid() = owner_id);

create policy "sales_delete_own"
  on public.sales for delete
  using (auth.uid() = owner_id);

create trigger set_sales_updated_at
  before update on public.sales
  for each row execute procedure public.set_updated_at();

-- mantiene contacts.last_interaction_at al día cuando hay una venta nueva
create function public.touch_contact_on_sale()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.contacts
  set last_interaction_at = now()
  where id = new.contact_id;
  return new;
end;
$$;

create trigger sales_touch_contact
  after insert on public.sales
  for each row execute procedure public.touch_contact_on_sale();
