-- Fase 3: vídeo de presentación de YouTube en la mini-landing pública.

alter table public.profiles add column mini_landing_video_url text;

grant update (mini_landing_video_url) on public.profiles to authenticated;
