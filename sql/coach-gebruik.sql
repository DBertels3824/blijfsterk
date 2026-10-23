-- Gebruik van de coach (22 okt 2026): per bericht een regel met wie en wanneer, zodat
-- /api/coach een limiet per gebruiker kan toepassen. Er wordt GEEN tekst bewaard.
-- Uitvoeren via de Supabase MCP (migratie "coach_gebruik").
--
-- Toegang: alleen de server (service-sleutel). Niemand komt er via de browser bij:
-- RLS staat aan zonder policies, en anon en authenticated krijgen bewust geen rechten.
-- Oude regels worden wekelijks opgeruimd door /api/cron/opschonen.

create table if not exists public.coach_gebruik (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists coach_gebruik_user_idx on public.coach_gebruik (user_id, created_at desc);
create index if not exists coach_gebruik_tijd_idx on public.coach_gebruik (created_at);

alter table public.coach_gebruik enable row level security;

grant all on public.coach_gebruik to service_role;
revoke all on public.coach_gebruik from anon;
revoke all on public.coach_gebruik from authenticated;
