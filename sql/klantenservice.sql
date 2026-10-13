-- Klantenservice (13 okt 2026): gesprekken met de digitale hulp-assistent en meldingen
-- van fouten en wensen. Al uitgevoerd via de Supabase MCP (migratie "klantenservice").
--
-- Toegang:
--  * Alleen de beheerder (Dirk) mag lezen en schrijven via de browser (RLS-policy op e-mail).
--  * Klanten komen er nooit rechtstreeks bij. Zij praten via /api/klantenservice/chat, dat met
--    de service-sleutel schrijft en per gesprek een geheime sleutel controleert.
--  * anon krijgt bewust GEEN rechten op deze tabellen (expliciet, niet vergeten).

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  nummer bigint generated always as identity,
  sleutel text not null,
  created_at timestamptz not null default now(),
  bijgewerkt_op timestamptz not null default now(),
  laatste_bericht_op timestamptz not null default now(),
  kanaal text not null default 'chat' check (kanaal in ('chat', 'mail')),
  extern_id text,
  user_id uuid references auth.users(id) on delete set null,
  naam text,
  email text,
  rol text not null default 'bezoeker' check (rol in ('bezoeker', 'gebruiker', 'partner', 'beheerder')),
  status text not null default 'open_chat' check (status in ('open_chat', 'aandacht', 'wacht_op_klant', 'opgelost', 'samengevoegd')),
  categorie text check (categorie in ('fout', 'wens', 'vraag', 'klacht', 'inloggen', 'betaling', 'partner', 'privacy', 'anders')),
  urgentie text check (urgentie in ('laag', 'normaal', 'hoog')),
  onderwerp text,
  samenvatting text,
  details jsonb,
  pagina text,
  apparaat text,
  dubbel_van uuid references public.support_tickets(id) on delete set null,
  aantal_meldingen integer not null default 1,
  agent_actief boolean not null default true,
  opgelost_door text check (opgelost_door in ('agent', 'dirk')),
  ip_hash text
);

create unique index if not exists support_tickets_nummer_idx on public.support_tickets (nummer);
create index if not exists support_tickets_status_idx on public.support_tickets (status, laatste_bericht_op desc);
create index if not exists support_tickets_ip_idx on public.support_tickets (ip_hash, created_at);

create table if not exists public.support_berichten (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  afzender text not null check (afzender in ('klant', 'agent', 'dirk', 'systeem')),
  tekst text not null,
  created_at timestamptz not null default now()
);

create index if not exists support_berichten_ticket_idx on public.support_berichten (ticket_id, created_at);

alter table public.support_tickets enable row level security;
alter table public.support_berichten enable row level security;

create policy "Beheerder beheert tickets" on public.support_tickets
  for all using ((auth.jwt() ->> 'email') = 'dick.bertels@interim-share.nl')
  with check ((auth.jwt() ->> 'email') = 'dick.bertels@interim-share.nl');

create policy "Beheerder beheert berichten" on public.support_berichten
  for all using ((auth.jwt() ->> 'email') = 'dick.bertels@interim-share.nl')
  with check ((auth.jwt() ->> 'email') = 'dick.bertels@interim-share.nl');

grant select, insert, update, delete on public.support_tickets to authenticated;
grant select, insert, update, delete on public.support_berichten to authenticated;
grant all on public.support_tickets to service_role;
grant all on public.support_berichten to service_role;

revoke all on public.support_tickets from anon;
revoke all on public.support_berichten from anon;
