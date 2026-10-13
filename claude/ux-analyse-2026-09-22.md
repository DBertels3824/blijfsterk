# UX-analyse Blijf Sterk (22 sep 2026)

Vraag van Dirk: is de site logisch en intuïtief voor 55-plussers? Gebaseerd op een volledige doorloop van de code (alle pagina's, componenten, flows) zoals die op 22 sep in de werkmap staat.

## Status van de aanpak
- **Gedaan 22 sep:** punten 1, 3, 4 + kleine stukjes van 11 en 12.
- **Gedaan 30 sep (tsc OK, Dirk commit zelf):** punten 5, 6, 8, 9, 10 + het coachknop-punt uit 12. Zie "Doorgevoerd op 30 sep" onderaan.
- **Nog te doen:** 2 (intake opknippen), 7 (weekschema klikbaar), rest van 11/12 (woorden, Nederlandse loginfouten, leeg videoblok).

## Wat goed werkt
- Homepage: één duidelijke boodschap, één hoofdknop, echte foto, korte "hoe het werkt".
- Dashboard: zes grote tegels, niets afleidends, knop voor grotere letters.
- Oefeningen: echte video per oefening, "laatst gedaan", vaste veiligheidstip, één simpele "Ik heb dit gedaan"-knop.
- Knoppen zijn overal minimaal 52px hoog, vaste huisstijl, Dirk als één herkenbaar aanspreekpunt.

## Grootste problemen (op volgorde van impact)

### 1. Nieuwe gebruiker raakt na aanmelden de weg kwijt — GEDAAN
- Na e-mailbevestiging land je op de homepage. Die weet niet dat je ingelogd bent: de hero toont nog "Deelnemen is gratis" → loginformulier.
- `/login` stuurt ingelogde gebruikers niet door.
- Dashboard controleert niet of er al een profiel/intake is; niemand wordt naar stap 1 geleid.

### 2. De intake is te zwaar als eerste stap
- Eén lange pagina, 16 vragen + veiligheid, geen voortgang, niets verplicht. (Sinds 22 sep wél een "later invullen"-knop.)
- Fix: opknippen in 3–4 korte stappen met "stap 2 van 4", veiligheid vooraan.

### 3. Na de intake beland je op een doodlopende chatpagina — GEDAAN
- `/advies` was een volledige chatpagina, kopje zei nog "Dirk, jouw AI-coach", geen knop naar het dashboard.

### 4. Weespagina's en dubbelingen — GEDAAN
- `/voortgang` ("+ Training loggen" zonder oefening) was nergens meer gelinkt; tegel "Voortgang" ging naar een pagina die "Weekschema" heette.

### 5. Oefeningenpagina: eerste oefening staat te ver weg — GEDAAN
- Boven de eerste oefening: intro, coach-kaartje, veiligheidsblok, weekschema-knop, filters. Op een telefoon ~2 schermen scrollen.
- Fix: veiligheidsblok inklappen tot één regel met "lees meer"; coach-kaartje naar onderen; filters compacter.

### 6. Op de oefeningkaart staat de volgorde verkeerd om — GEDAAN
- "Ik heb dit gedaan" is een grote knop; de stappen (hoe doe ik het) en sets/herhalingen zitten achter een klein linkje "Bekijk stappen" eronder.
- Fix: eerst "Zo doe je het" (uitgeklapt of één grote knop), dan pas "Ik heb dit gedaan".

### 7. Weekschema is niet bruikbaar als schema
- Alleen categorienamen met oefeningnamen achter elkaar, niets klikbaar, geen "Start dag 1".
- Rode waarschuwing "Dit gaat deze week niet meer lukken" is demotiverend voor de doelgroep.
- Fix: per dag een klikbare lijst, één knop "Begin met dag 1"; waarschuwing vervangen door "Volgende week nieuwe kans".

### 8. Letters zijn op veel plekken te klein — GEDAAN
- Basis is 17px, maar chips, "laatst gedaan", disclaimers, stap-teksten op de homepage zijn 12–14,5px.
- Fix: niets onder 15px, gewone tekst 16–17px.

### 9. Contrast haalt de norm niet — GEDAAN
- Grijsbruin (#8A7561) op crème: 4,2 (norm 4,5). Oranje koppen/links (#E85D00) op crème: 3,3.
- Fix: muted iets donkerder (bijv. #6F5A48), koppen/links #C94F00 of donkerder.

### 10. "Grotere letters" is alleen op het dashboard te vinden — GEDAAN
- Fix: knop in de header op elke pagina (of onder het hamburger-menu op mobiel).

### 11. Woorden die niet vanzelf spreken
- "Oefeningenbibliotheek", "Intake", "loggen", "Word partner" in het ledenmenu. ("Profiel" → "Mijn gegevens" is al gedaan.)
- Fix: "Oefeningen", "Aanvinken"; "Word partner" en "Winkel" uit het ledenmenu (winkel is nog niet te bestellen).

### 12. Kleinere punten
- Foutmeldingen bij inloggen zijn Engels ("Invalid login credentials", "User already registered").
- Zwevende coach-knop kan op mobiel over de laatste "Ik heb dit gedaan"-knop vallen (dashboard heeft nu extra ruimte onderaan; oefeningenpagina nog niet).
- Leeg videoblok "binnenkort" bovenaan de homepage.

## Doorgevoerd op 22 sep (punten 1, 3, 4)
- `app/components/IngelogdDoorsturen.tsx` (nieuw), op de homepage: ingelogde gebruiker → `/dashboard` (admin/Dirk blijft op de homepage). Luistert ook naar `onAuthStateChange`, want de e-mailbevestigingslink zet de sessie pas even later.
- `app/login/page.tsx`: al ingelogd → `/dashboard`.
- `app/dashboard/page.tsx`: geen profielrij → `/intake` (admin uitgezonderd; er is géén DB-trigger die profielrijen aanmaakt, dus "geen rij" = intake nooit gezien). Profiel wel aanwezig maar leeg → gele kaart "Vertel Dirk kort iets over jezelf" bovenaan. `?coach=1` in de URL → Dirk (zwevende chat) opent zichzelf na 400 ms en de parameter wordt uit de URL gehaald. Tegel "Profiel" heet nu "Mijn gegevens". Onderaan 100px ruimte zodat de coach-knop niet over de laatste tegel valt.
- `app/intake/page.tsx`: na opslaan → `/dashboard?coach=1` (was `/advies`). Nieuwe gebruiker heeft knop "Liever later invullen → naar mijn dashboard" (maakt alleen `profiles`-rij met id aan, alle kolommen zijn nullable). Bestaande gebruiker ziet "← Terug naar dashboard" en kop "Mijn gegevens".
- `app/advies/page.tsx`: alleen nog een doorstuur naar `/dashboard?coach=1` (oude links blijven werken; de losse chatpagina met "AI-coach"-kop is weg).
- `app/voortgang/page.tsx`: alleen nog een doorstuur naar `/oefeningen/schema`.
- `app/oefeningen/schema/page.tsx`: heet nu "Jouw voortgang" (past bij de tegel), toont totaal aantal afgevinkte oefeningen + weekstatus, daaronder kop "Voorbeeld-weekschema". Terugknop naar dashboard.
- `app/oefeningen/page.tsx`: knop heet "Bekijk je voortgang en weekschema →".
- `app/components/HeaderNav.tsx`: "Profiel" → "Mijn gegevens".
- Push-cron linkt naar `/oefeningen`, dus niet geraakt.

## Doorgevoerd op 30 sep (punten 5, 6, 8, 9, 10)
- `app/oefeningen/page.tsx`: kop heet "Oefeningen", intro één zin, link "Jouw voortgang →" rechts van de kop. Veiligheidsblok is één vette regel ("Stop meteen bij pijn…") met "Lees meer"/"Minder". Coach-kaartje staat nu onderaan de lijst. Filters 15px, 40px hoog. Op de kaart: eerst grote gele knop "Zo doe je het" (klapt stappen, sets/herhalingen en veiligheidstip uit in een crème blok), daarna "Ik heb dit gedaan" (wit). 110px ruimte onderaan zodat de zwevende coachknop nergens overheen valt (punt 12).
- Lettergroottes site-breed (app/ en lib/, via één vervangtabel): 11,5–13,5 → 15; 14 → 15,5; 14,5 → 16. Niets staat meer onder 15px. Basis blijft 17px.
- Contrast site-breed: hulptekst `#8A7561` → `#6F5A48` (6,2:1 op crème); oranje tekst/links `#E85D00` → `#B34500` (5,3:1); waarschuwingsoranje `#B9601A` → `#9E5A18` (5,1:1). Verloopknoppen, iconen en achtergronden zijn niet aangeraakt (daar is de kleur geen tekst). CSS-variabele `--muted` is meegegaan.
- `app/components/TekstgrootteKnop.tsx`: varianten `compact` (bovenbalk: "A+ Groter"/"A+ Normaal") en `volleBreedte` (mobiel menu). Meerdere knoppen op één pagina luisteren naar hetzelfde event, dus ze blijven gelijk.
- `app/components/HeaderNav.tsx`: knop staat in de bovenbalk (desktop, ook uitgelogd) en bovenaan het uitklapmenu (mobiel). `app/dashboard/page.tsx`: knop daar weg, alleen nog "Hoi, naam".
- Vervangtabel ook toegepast op de drie bestanden die alleen op de laptop leven (`matching`, `trainer-dashboard`, `admin/aanmeldingen`).

## Voorgestelde volgorde voor de rest
1. ~~Oefeningkaart omdraaien + pagina inkorten. (5, 6)~~ gedaan
2. ~~Lettergrootte, contrast, knop grotere letters in header. (8, 9, 10)~~ gedaan
3. Intake opknippen. (2)
4. Weekschema klikbaar maken. (7)
5. Woorden en menu opschonen, Nederlandse foutmeldingen, leeg videoblok. (11, 12)
