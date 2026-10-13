-- Partnertypen uitgebreid (13 okt 2026): naast 'trainer' en 'sportschool' kunnen
-- fysiotherapeuten, sportmasseurs en voedingsdeskundigen zich aanmelden.
-- Al uitgevoerd via de Supabase MCP (migratie "partnertypen_uitbreiden").
-- De lijst met beroepen staat ook in lib/partnertypen.ts: houd die twee gelijk.
alter table public.trainer_aanmeldingen drop constraint if exists trainer_aanmeldingen_type_check;
alter table public.trainer_aanmeldingen add constraint trainer_aanmeldingen_type_check
  check (type = any (array['trainer','fysiotherapeut','sportmasseur','voedingsdeskundige','sportschool']));
