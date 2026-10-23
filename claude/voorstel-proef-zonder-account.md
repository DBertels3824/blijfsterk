# Voorstel: proeven zonder account en een regio-aanvraag

Geschreven op 22 oktober 2026. **Dit is een voorstel. Er is nog niets gebouwd.** Beslissingen voor Dirk staan onderaan (sectie 9).

## 1. Het idee in een paar zinnen

Nu moet iemand eerst een account maken (naam, e-mail, wachtwoord) voordat hij iets ziet. Dat kost bezoekers. Het idee:

1. Laat mensen **eerst proeven**, zonder account: een korte veiligheidscheck en drie oefeningen met video.
2. Vraag het **e-mailadres op het moment dat het iets oplevert**: om voortgang te bewaren, of om een trainer in de buurt te vinden.
3. Het **geldmoment blijft zoals het is**: een partner betaalt €35 voor een nieuwe klant, en pas daarna gaat de chat open.

Daarnaast een **regio-aanvraag** zonder account: plaats, wens en e-mailadres. Dat is een lead voor partners, en het vertelt ons waar vraag is.

## 2. Eerlijk over de kans

Dirk twijfelt of dit platform zijn beste idee is. Dat kan ik van hieruit niet beoordelen. Wat ik wel kan zeggen:

- **Wat voor dit model pleit:** de kosten blijven laag, gebruikers betalen niets, en je verdient pas als er een echte klant bij een partner terechtkomt. Dat sluit aan bij hoe trainers nu al klanten werven.
- **Wat nog niet bewezen is, en wat het echte risico is** (de techniek is het risico niet):
  1. **Betalen trainers €25 inschrijfgeld en €35 per klant?** Er zijn nu 0 aanmeldingen en 0 betalingen.
  2. **Komen er genoeg bezoekers?** Inlog weghalen helpt niet als niemand de site opent. Verkeer is het eigenlijke vraagstuk (sectie 8).
  3. **Is er aanbod in de regio waar de vraag zit?** Een aanvrager zonder trainer in de buurt haakt af.
- **De goedkoopste test is fase 0** (sectie 6): het regio-formulier, zonder iets anders te veranderen, in één pilotregio. Dat kost ongeveer een dag bouwen en beantwoordt vraag 1 en 3. Met vaste drempels (sectie 7) kun je ook vergelijken met je andere ideeën.

## 3. Toets aan het verdienmodel

Vaste regel: geeft dit iets weg waar normaal voor betaald wordt?

- **Drie proef-oefeningen met video:** weinig. Trainers verkopen begeleiding, geen losse video's. Let wel: de video-bestanden zijn nu al per webadres te openen zonder login (zie sectie 10). De login-poort is dus vooral een poort voor de pagina.
- **Regio-aanvraag:** geen namen of contactgegevens van partners tonen, alleen aantallen. Contact loopt na de aanvraag via een account en de chat, die pas opengaat na betaling van de matchvergoeding.
- **Coach:** blijft voor accounts. Hij is de beloning voor het aanmaken van een account.

Conclusie: past, zolang er geen partnergegevens naar buiten gaan voordat betaald is.

## 4. De route van een bezoeker

| Stap | Wat de bezoeker ziet | Wat we bewaren | Waar het geld zit |
|---|---|---|---|
| 1 | Homepage met knop "Probeer gratis, zonder account" | niets | |
| 2 | Veiligheidscheck (5 vragen in gewone taal) | niets op de server (alleen in de browser) | |
| 3 | Drie oefeningen met video en uitleg | niets | |
| 4a | "Bewaar je voortgang": e-mailadres, krijgt een code | account (e-mail, naam in user-metadata) | gebruiker is nu een lead |
| 4b | "Zoek een trainer bij jou in de buurt": plaats, wens, e-mail | een regel in `regio_aanvragen` | lead voor partners |
| 5 | Account, trainers in de buurt kiezen (nu alleen Dirk) | match | **partner betaalt €35, chat opent** |

## 5. Onderdelen

### A. Regio-aanvraag (publiek)
- Pagina bijvoorbeeld `/zoek-hulp` en een blok op de homepage. Velden: **plaats, wens** (begeleiding bij krachttraining, fysiotherapeut, voeding, weet ik niet), **voornaam, e-mail**, een vinkje voor toestemming, en een verborgen valstrikveld (zoals op `/word-partner`).
- Route `/api/regio-aanvraag`, schrijft met de service-sleutel. Limiet per apparaat (zoals bij de hulp-assistent), e-mail controleren.
- Nieuwe tabel `regio_aanvragen`: id, aangemaakt, plaats, wens, voornaam, e-mail, status (nieuw, uitgenodigd, account, gematcht, niet gelukt), notitie, toestemming-datum, ip_hash. **Migratie met expliciete GRANTs en RLS** (alleen beheerder leest, anon geen rechten), zoals vaste regel.
- Admin-pagina `/admin/aanvragen`: lijst, aantallen per plaats naast het aantal zichtbare partners in die plaats (`trainers.plaats`), status en notitie.
- Bevestigingsmail via `stuurMail` (Resend, zie fase 0). Eerlijke tekst: "Je staat op de lijst, ik mail je zodra er een partner bij jou in de buurt is." Nooit iets beloven.
- Let op: de app kent nu **geen postcodes**. Trainers hebben `plaats` en `reisbereidheid_km`, gebruikers `woonplaats`. Fase 0 werkt dus op plaatsnaam (genormaliseerd). Later kan een postcode-opzoeking (bijvoorbeeld PDOK Locatieserver) erbij.

### B. Proef zonder account (openbare pagina `/proef`)
- **Veiligheidscheck** vóór de eerste oefening: dezelfde vijf onderwerpen als de intake (hart, duizeligheid, bot of gewricht, medicatie, zwangerschap), in gewone taal. Bij één ja: "Overleg eerst met je huisarts of fysiotherapeut" en geen proef. Antwoorden blijven in de browser, niet in de database. Dit is geen medische goedkeuring; de tekst moet de jurist en de fysiotherapeut nalopen.
- **Drie oefeningen** uit `lib/oefeningen.ts`, met video uit `lib/oefening-videos.ts`. Nieuw veld `proef: true` op die drie. Voorstel (Dirk beslist, fysio checkt): `marcheren`, `stoel-squat`, `kuitheffingen`. Alle drie staan nu in de bibliotheek.
- Geen opslag zonder account. "Ik heb dit gedaan" kan in de browser blijven.
- Slotscherm: "Bewaar je voortgang" (account met e-mail) en "Zoek een trainer in de buurt" (aanvraag).
- **Coach blijft voor accounts.** Dat wijkt af van wat ik in de chat eerder voorstelde (drie vragen aan de coach zonder account). Reden: de coach-route is nu niet beveiligd (sectie 10); zonder bescherming zou dit direct geld kosten.

### C. Inloggen met alleen een e-mailadres
- Nu: alleen e-mail plus wachtwoord (`app/login/page.tsx`: `signUp` en `signInWithPassword`).
- Voorstel voor nieuwe accounts: **e-mail en een code** (Supabase Auth, `signInWithOtp`). Geen wachtwoord onthouden. Bestaande accounts en de helper-stand ("Ik help mijn vader of moeder") blijven zoals ze zijn.
- Nodig: een eigen mailserver voor Supabase Auth (Resend via SMTP), want de ingebouwde mail van Supabase heeft een zeer lage limiet (controleer de actuele limiet). Site URL en Redirect URLs op `https://www.blijfsterk.nl`. Mailtekst in het Nederlands met de code. De naam blijft in user-metadata.
- Testen met echte 55-plussers, ook het geval dat de mail op een ander apparaat geopend wordt. Daarom een code in plaats van alleen een link.

### D. Meten
- Zonder cookies en zonder persoonsgegevens: Vercel Web Analytics (controleer of het bij je plan hoort) of een eigen kleine teller (gebeurtenis en dag, niets over personen).
- Zes cijfers: bezoekers, proef gestart, proef afgerond, aanvraag achtergelaten, account gemaakt, betaalde matches.

## 6. Fasering en bouwstappen

| Fase | Wat | Omvang | Afhankelijk van |
|---|---|---|---|
| **0** | Regio-aanvraag (A) met admin-pagina, handmatig matchen door Dirk | klein (ongeveer een dag) | pilotregio met minstens 1 echte partner; Resend voor de bevestigingsmail (zonder Resend: Dirk mailt zelf) |
| **1** | Proef zonder account (B) | middel | fysio en jurist voor de veiligheidstekst; keuze van de drie oefeningen |
| **1b** | Inloggen met e-mailcode (C) | middel | Resend (SMTP), domein klaar, Supabase-instellingen |
| **2** | Matching openen voor gebruikers, per regio waar partners zijn | middel | Mollie live (inschrijfgeld en €35), partners die betaald hebben |
| **3** | Organisaties en sponsors benaderen met echte cijfers | gesprekken | cijfers uit fase 0 tot 2 |

Voordat matching opengaat: de 7 proefpartners in `trainers` staan nu op zichtbaar en moeten uit.

## 7. Wat we meten en wanneer we doorgaan of stoppen (voorstel, Dirk bepaalt)

Pilot van 6 tot 8 weken in één regio. Voorbeeld van drempels, aan te passen:
- **Doorgaan en fase 1 bouwen:** minstens 20 aanvragen en minstens 1 partner die bereid is te betalen.
- **Bijsturen:** weinig bezoekers (dan is het verkeer het probleem, niet de inlog) of veel aanvragen zonder partners in de buurt (dan eerst partners werven).
- **Stoppen of omgooien:** na de pilot geen enkele partner die wil betalen. Dan klopt de aanname van het verdienmodel niet en past een ander model beter (bijvoorbeeld organisaties).

## 8. Verkeer (het echte vraagstuk)

Een open voordeur helpt pas als mensen de weg vinden. Ideeën, goedkoopste eerst:
- LinkedIn en Facebook-groepen voor 55-plussers, met een link naar `/proef` in plaats van naar `/login`.
- Buurthuizen, seniorenbonden, gemeentes en fysiotherapeuten die de link delen.
- Partners die hun eigen klanten naar de proef sturen. Open vraag: moet een partner voor een bestaande klant ook €35 betalen? Eerst beslissen.

## 9. Beslissingen voor Dirk

1. **Drie proef-oefeningen open voor iedereen?** Ja of nee, en welke drie. De vaste regel "oefeningen achter login" verandert dan voor die drie.
2. **Coach zonder account?** Mijn advies: nee, tot de route is afgeschermd.
3. **Pilotregio:** welke plaats of regio, en zijn daar founding partners voor?
4. **E-mailcode in plaats van wachtwoord voor nieuwe accounts?**
5. **Beginnen met fase 0** (alleen het regio-formulier)? Mijn advies: ja.
6. **Resend en Mollie:** eerst aanzetten, want fase 0 (bevestigingsmail), 1b en 2 hangen daaraan.

## 10. Gevonden tijdens het lezen (los van dit voorstel)

- **De coach-route `/api/coach` was niet beveiligd. Opgelost op 22 oktober** (inlogcontrole, limiet per gebruiker, noodrem; zie `claude/status.md`, sessie 22 okt). Wat hier stond: er was geen controle of de aanroeper was ingelogd en geen limiet. Elke aanroep doet twee Claude-aanroepen (kiezen van een specialist en het antwoord). Iedereen die het webadres kent, kan dus kosten maken op jouw Anthropic-rekening. Reparatie is klein: de inlog controleren (token meesturen) en een limiet per gebruiker, zoals bij de hulp-assistent.
- **De video-bestanden in `public/oefeningen-video/` zijn openbaar** per webadres. De login beschermt de pagina, niet de bestanden. Wil je dat de bestanden echt achter login staan, dan moeten ze in een privé-opslag (Supabase Storage met tijdelijke links). Voor de proef maakt het niet uit, voor de rest wel als je de lessen als betaald product ziet.
- De coach gebruikt nog `claude-sonnet-4-5`, de hulp-assistent `claude-sonnet-5-5`.

## 11. Privacy en juridisch (voor fase 0)

- `/privacy` krijgt een regel voor aanvragen: doel (een partner in de buurt zoeken), grondslag (toestemming), bewaartermijn (voorstel 12 maanden), en **gegevens gaan pas naar een partner als de aanvrager zelf een partner kiest**.
- Het formulier noemt de verwerker (Resend voor de mail).
- Jurist laten kijken, samen met de overige concepttekst.
