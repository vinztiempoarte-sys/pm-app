-- La migración 0008 no funcionó: "authenticated" y "anon" ya tenían un grant
-- de UPDATE a nivel de TABLA completa (todas las columnas), y ese grant por
-- sí solo basta para poder actualizar cualquier columna — el REVOKE a nivel
-- de columna de 0008 no tiene efecto mientras siga existiendo el grant de
-- tabla completa. Hay que revocar el UPDATE de tabla completa y volver a
-- conceder explícitamente solo las columnas que el usuario debe poder
-- editar por su cuenta.

revoke update on public.profiles from authenticated, anon;

grant update (
  full_name,
  phone,
  avatar_url,
  pm_distributor_id,
  current_rank,
  mini_landing_slug,
  mini_landing_bio,
  brand_color,
  brand_logo_url,
  current_personal_volume,
  current_group_volume
) on public.profiles to authenticated;
