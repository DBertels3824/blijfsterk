-- Nieuwe tabel voor pushmeldingen-abonnementen. Eén rij per apparaat/browser
-- waarop een gebruiker meldingen heeft aangezet.
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

create policy "Gebruikers kunnen eigen abonnement toevoegen"
  on push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Gebruikers kunnen eigen abonnement bijwerken"
  on push_subscriptions for update
  using (auth.uid() = user_id);

create policy "Gebruikers kunnen eigen abonnement zien"
  on push_subscriptions for select
  using (auth.uid() = user_id);

create policy "Gebruikers kunnen eigen abonnement verwijderen"
  on push_subscriptions for delete
  using (auth.uid() = user_id);
