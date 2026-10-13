# Blijf Sterk — instructies voor Claude Code

## Wat dit is
Blijf Sterk is een platform voor 55-plussers die thuis sterk willen blijven.
Gratis voor gebruikers. Dirk (de eigenaar) is ook "Dirk, je virtuele coach" in de app.
Inkomsten komen van trainers, sportscholen en sponsors. Zie `claude/partnerplan-trainers-sponsors.md`.

Live: https://blijfsterk.vercel.app (domein blijfsterk.nl volgt).

## Stack
- Next.js (App Router, TypeScript), map `app/` en `lib/`.
- Supabase: auth + database + opslag. Project-id `scspksvgftrjbpucmyed`.
- Vercel: hosting, auto-deploy vanaf GitHub `main`.
- Anthropic API voor de coach-chat en de aanbevelingsagent.
- Mollie voor betalingen (code staat klaar, account nog niet actief).
- Scripts in `scripts/` (Node, draaien in `cmd` in deze map).

## Lees eerst
Bij de start van een sessie: lees `claude/status.md`.
Daar staat wat gebouwd is, wat open staat, en de werkwijze.
Verdere documenten:
- `claude/partnerplan-trainers-sponsors.md` — verdienmodel, toetsing, matchflow, werving.
- `claude/ux-analyse-2026-09-22.md` — UX-punten voor 55+; welke gedaan, welke open.

Werk je iets af? Zet het dan kort in `claude/status.md` bij "Openstaand" en bij de sessie van die dag.

## Hoe Dirk werkt
- Dirk is niet-technisch. Praat in korte zinnen. Altijd Nederlands.
- Leg uit wat je gaat doen vóór je het doet. Geen jargon zonder uitleg.
- Vraag bij twijfel. Doe geen grote herstructureringen zonder overleg.
- Dirk doet commit en push zelf in GitHub Desktop. Vraag eerst voordat je zelf commit.
- Sleutels (API-keys, Mollie, Supabase) maakt Dirk altijd zelf aan. Vraag er nooit om in de chat.
- Betalingen of financiële transacties voer je nooit zelf uit.
- Na elke codewijziging: `npx tsc --noEmit -p .` draaien. Pas klaar bij EXIT 0.

## Vaste regels
- **Nooit laten verzinnen door een AI-agent** wat gecontroleerd moet zijn: matching-ids, oefeningen, video-beweging. Alles komt uit `lib/oefeningen.ts` of de database.
- **Nieuwe functies eerst toetsen aan het verdienmodel.** Vraag: geeft dit iets weg waar normaal voor betaald wordt? Daarom: gebruikers zien alleen eigen partnertrainers, oefeningen staan achter login, chat gaat pas open na betaling van de matchvergoeding.
- **Elke nieuwe publieke tabel in Supabase krijgt in dezelfde migratie expliciete GRANTs** voor anon/authenticated/service_role. Verplicht vanaf 30 okt 2026. Plus RLS-policies.
- Admin-only pagina's: gate via `lib/admin.ts`, redirect naar `/dashboard`. Rol-only pagina's: zelfde patroon op `profiles.rol` of `trainers.user_id`.
- `SUPABASE_SERVICE_ROLE_KEY` alleen server-side (cron en `/api/*`-routes). Nooit in client-code.
- Chatberichten met extra UI-velden filteren tot `role`/`content` vóór ze naar de Anthropic API gaan.
- Persoonsgegevens zoals naam in auth user-metadata, niet in een nieuwe kolom.
- Geen beeldmateriaal van derden zonder duidelijke commerciële licentie. Foto's en video's maakt Dirk zelf in Canva/Runway.
- Een gewijzigde env-var in Vercel werkt pas na een redeploy.
- Debug-truc: tijdelijk de echte foutmelding in de UI tonen, daarna opruimen.

## Huisstijl
Kleuren als CSS-variabelen in `app/globals.css`:
geel `#FFBE0A`, oranje `#FF8601`, dieporanje `#E85D00` (alleen in verlopen/iconen/achtergronden), crème `#FFF8EE`, leestekst `#2B1B0E`.
Tekstkleuren: hulptekst `#6F5A48`, oranje tekst/links `#B34500`, waarschuwing `#9E5A18`. Alle ≥ 5:1 op crème.
IBM Plex Sans, basis 17px. Niets onder 15px. Knoppen minimaal 52px hoog.
Doelgroep 55+: grote letters, één hoofdknop per scherm, geen afleiding.

## Openstaand (oktober 2026)
Zie `claude/status.md` voor de volledige lijst. Kort:
- Commit + push van de UX-wijzigingen van 30 sep.
- `node scripts/vind-emails.mjs` opnieuw draaien (ca. 4099 kandidaten).
- Mollie-account + `MOLLIE_API_KEY` in Vercel.
- Domein blijfsterk.nl koppelen, daarna `vercel.app` vervangen in code en Supabase Site URL.
- UX-items 2, 7, 11, 12.
- Notificaties bij chatberichten; beoordeling na match + auto-pauze.
- Jurist (voorwaarden) en fysiotherapeut (oefeningen) vóór brede lancering.
