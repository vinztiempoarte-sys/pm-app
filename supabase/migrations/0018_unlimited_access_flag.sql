-- Marca de acceso ilimitado para cuentas concretas (ej. cuentas internas
-- o de partners), independiente de subscription_status. Se añade ahora,
-- de forma explícita en el esquema, para que cuando se construya el
-- sistema de 3 niveles de suscripción (todavía en pausa) estas cuentas
-- sigan disfrutando de todas las funcionalidades sin depender de que
-- alguien recuerde excluirlas manualmente entonces.

alter table public.profiles
  add column unlimited_access boolean not null default false;
