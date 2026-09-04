-- Límite de uso para los chatbots (landing-chat y help-chat), para evitar que
-- alguien los use sin límite ni tema específico y dispare el coste de la API
-- de Anthropic. Solo lo usan las Edge Functions vía service role.

create table public.chat_rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  count integer not null default 0
);

alter table public.chat_rate_limits enable row level security;
-- Sin policies a propósito: solo se accede vía service role desde Edge Functions.

create or replace function public.check_chat_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window_start timestamptz;
  v_count integer;
begin
  select window_start, count into v_window_start, v_count
  from chat_rate_limits
  where key = p_key
  for update;

  if not found or now() - v_window_start > make_interval(secs => p_window_seconds) then
    insert into chat_rate_limits (key, window_start, count)
    values (p_key, now(), 1)
    on conflict (key) do update set window_start = now(), count = 1;
    return true;
  end if;

  if v_count >= p_limit then
    return false;
  end if;

  update chat_rate_limits set count = count + 1 where key = p_key;
  return true;
end;
$$;
