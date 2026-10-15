-- E-mail voor de klantenservice-agent (15 okt 2026): logboek van alle in- en uitgaande mail,
-- en concept-antwoorden die Dirk goedkeurt voordat ze de deur uitgaan.
-- Uitvoeren via de Supabase MCP (migratie "email").
--
-- Toegang:
--  * Alleen de beheerder (Dirk) mag lezen/schrijven via de browser (RLS-policy op e-mail).
--  * De server (service-sleutel) schrijft het logboek en de concepten.
--  * anon krijgt bewust GEEN rechten (expliciet, niet vergeten).

create table if not exists public.email_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  richting text not null check (richting in ('uit', 'in')),
  soort text not null default 'klantenservice' check (soort in ('klantenservice', 'uitnodiging', 'melding', 'overig')),
  status text not null check (status in ('verstuurd', 'mislukt', 'overgeslagen', 'ontvangen')),
  ticket_id uuid references public.support_tickets(id) on delete set null,
  adres text,
  onderwerp text,
  provider_id text,
  message_id text,
  reden text
);

-- Dezelfde mail nooit twee keer verwerken (de maildienst herhaalt een webhook bij een fout).
create unique index if not exists email_log_provider_idx on public.email_log (richting, provider_id) where provider_id is not null;
create index if not exists email_log_created_idx on public.email_log (created_at desc);
create index if not exists email_log_adres_idx on public.email_log (adres, created_at);

create table if not exists public.support_concepten (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  created_at timestamptz not null default now(),
  tekst text not null,
  status text not null default 'concept' check (status in ('concept', 'verstuurd', 'weggegooid', 'vervangen')),
  besloten_op timestamptz
);

create index if not exists support_concepten_ticket_idx on public.support_concepten (ticket_id, created_at);
create index if not exists support_concepten_status_idx on public.support_concepten (status, created_at);

-- Mail koppelt aan een gesprek via het onderwerp en het adres van de afzender.
alter table public.support_berichten add column if not exists message_id text;
alter table public.support_tickets add column if not exists mail_onderwerp text;

alter table public.email_log enable row level security;
alter table public.support_concepten enable row level security;

create policy "Beheerder leest maillogboek" on public.email_log
  for select using ((auth.jwt() ->> 'email') = 'dick.bertels@interim-share.nl');

create policy "Beheerder beheert concepten" on public.support_concepten
  for all using ((auth.jwt() ->> 'email') = 'dick.bertels@interim-share.nl')
  with check ((auth.jwt() ->> 'email') = 'dick.bertels@interim-share.nl');

grant select on public.email_log to authenticated;
grant select, insert, update, delete on public.support_concepten to authenticated;
grant all on public.email_log to service_role;
grant all on public.support_concepten to service_role;

revoke all on public.email_log from anon;
revoke all on public.support_concepten from anon;
