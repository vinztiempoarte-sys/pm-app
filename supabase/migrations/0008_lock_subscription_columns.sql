-- Fase 2: la política "profiles_update_own" permite a cada usuario actualizar
-- CUALQUIER columna de su propia fila, incluidas subscription_status,
-- stripe_customer_id y trial_ends_at — es decir, cualquier usuario podía
-- auto-activarse la suscripción sin pagar con un simple PATCH a la REST API.
-- Estas columnas solo deben poder cambiarlas las Edge Functions (que usan la
-- service role key y por tanto no pasan por estos grants de columna).

revoke update (subscription_status, stripe_customer_id, trial_ends_at)
  on public.profiles
  from authenticated, anon;
