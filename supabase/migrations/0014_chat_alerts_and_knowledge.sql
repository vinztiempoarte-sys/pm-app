-- Fase 3: soporte para el chatbot de la mini-landing.
--
-- chat_knowledge: conocimiento propio que cada distribuidor añade para
-- "entrenar" su chatbot público (precios locales, envíos, dudas de su
-- zona...), sin tocar código.
--
-- chat_alerts: cuando el chatbot no está seguro de una respuesta, avisa
-- al distribuidor para que responda en persona.

create table public.chat_knowledge (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  topic text not null,
  answer text not null,
  created_at timestamptz not null default now()
);

create index chat_knowledge_owner_id_idx on public.chat_knowledge (owner_id);

alter table public.chat_knowledge enable row level security;

create policy "chat_knowledge_select_own"
  on public.chat_knowledge for select
  using (auth.uid() = owner_id);

create policy "chat_knowledge_insert_own"
  on public.chat_knowledge for insert
  with check (auth.uid() = owner_id);

create policy "chat_knowledge_update_own"
  on public.chat_knowledge for update
  using (auth.uid() = owner_id);

create policy "chat_knowledge_delete_own"
  on public.chat_knowledge for delete
  using (auth.uid() = owner_id);

create table public.chat_alerts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  question text not null,
  bot_reply text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create index chat_alerts_owner_id_idx on public.chat_alerts (owner_id);

alter table public.chat_alerts enable row level security;

create policy "chat_alerts_select_own"
  on public.chat_alerts for select
  using (auth.uid() = owner_id);

create policy "chat_alerts_update_own"
  on public.chat_alerts for update
  using (auth.uid() = owner_id);

-- No hay policy de insert para authenticated/anon a propósito: solo la
-- Edge Function landing-chat crea avisos, usando la service role key.
