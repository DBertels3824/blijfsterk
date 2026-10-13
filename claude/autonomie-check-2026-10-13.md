# Autonomie-check, 13 oktober 2026

**Vraag:** kan het hele Blijf Sterk platform autonoom werken?
**Antwoord: nee, nog niet.** Een deel van wat als klaar gold, werkt in productie niet. En een aantal routinetaken ligt nog bij Dirk zonder dat het systeem hem waarschuwt.

Gemeten op: de live database (Supabase), de live site (aanvragen die niets wijzigen), en de code. **Niet te meten:** Vercel (geen toegang via de koppeling, de opdrachtregel is niet geïnstalleerd) en de Supabase-auth-instellingen. Wat daar staat, is dus niet bevestigd.

Wat "autonoom" hier betekent: routine loopt zonder Dirk, uitzonderingen komen op één plek bij hem binnen, en het systeem meldt zelf als iets stuk is. Een aantal beslissingen blijft bewust bij Dirk (zie onderdeel D).

## A. Stuk of niet aangesloten

| # | Wat | Bewijs | Gevolg |
|---|---|---|---|
| 1 | **Beheersleutel (`SUPABASE_SERVICE_ROLE_KEY`) ontbreekt of werkt niet in Vercel.** | Twee routes die hem gebruiken geven op de live site een serverfout zonder tekst: de hulp-chat en het accepteren van partners. Lokaal staat hij ook niet. Status.md zegt dat hij in Vercel staat. | Aanmelden van partners, accepteren, koppelen aan een account, een partner kiezen, de betaalmelding van Mollie, de hulp-chat en de dagelijkse herinneringen werken niet. |
| 2 | **Tabel `push_subscriptions` bestaat niet in de database.** | `list_tables` toont hem niet; `sql/push_subscriptions.sql` is nooit uitgevoerd. | Pushmeldingen aanzetten kan niet. De dagelijkse herinnering kan niemand bereiken. Mijn meldingen aan Dirk bij een klantenservice-melding komen niet aan. |
| 3 | **Mollie niet actief.** | Live bevestigd: betalen starten geeft "nog niet ingesteld". | Inschrijfgeld en matchvergoeding kunnen niet betaald worden. Tot dan: kwijtschelden in het menu Betalingen. |
| 4 | **De partnerflow is nooit in productie gedraaid.** | 0 aanmeldingen, 0 betalingen, 0 gesprekken in de database. | Aanmelden, toetsen, account koppelen, betalen en chatten zijn nooit end-to-end bewezen. Alleen losse onderdelen zijn getest. |

## B. Werkt zelfstandig (A1 en A2 uitgezonderd)

- Account aanmaken en inloggen, intake, oefeningen met video, voortgang en weekschema.
- De coach "Dirk" (AI) en de aanbevelingsagent.
- Automatisch toetsen en toelaten van partners (fysiotherapeuten altijd met handmatige BIG-controle). *Na A1.*
- Inschrijfgeld en matchvergoeding klaarzetten, gesprek openen na betaling, openingsbericht. *Na A1 en A3.*
- Hulp-assistent als poortwachter, met postvak. *Na A1.*
- Wekelijkse opruiming van afgehandelde klantenservice-gesprekken. *Na A1.*

## C. Handwerk dat bij Dirk ligt en geautomatiseerd kan worden

1. **Partners werven.** 7681 kandidaten in de lijst, 6995 met e-mailadres, geen enkele uitgenodigd (alle status "nieuw"). De scripts draaien in `cmd` met Dirks wachtwoord. Het versturen van mails gebeurt buiten het platform. Er is geen opvolging.
2. **Het platform kan geen e-mail sturen.** Gevolgen: een partner hoort niet dat een gebruiker hem koos (het gesprek staat stil tot hij toevallig inlogt), geen bevestiging van toelating, geen herinnering voor het inschrijfgeld, geen e-mail aan Dirk bij een nieuwe aanmelding. **De voorwaarden beloven een factuur of betaalbewijs, maar dat wordt nergens gemaakt.** De inlogmails komen van de standaarddienst van Supabase; die heeft een lage verzendgrens. Controleren of er een eigen mailserver is ingesteld.
3. **Aanmeldingen die niet automatisch slagen** (en fysio's) wachten tot Dirk toevallig in het menu kijkt. Er komt geen melding.
4. **Verzoeken om gegevens te verwijderen of in te zien** zijn handwerk. De toezegging is dertig dagen.
5. **Bewaartermijnen uit de privacyverklaring** zijn grotendeels niet geautomatiseerd. Alleen klantenservice-gesprekken worden opgeruimd. Niet: accounts die twee jaar niet inloggen (stond als toezegging), partnerdocumenten één jaar na afloop.
6. **Beoordeling van trainers na een match en automatisch pauzeren** na slechte beoordelingen: niet gebouwd.
7. **Abonnement-incasso** (de €29 per maand): niet gebouwd.
8. **Deploy.** Commit en push in GitHub Desktop, daarna bouwt Vercel automatisch. Er is geen automatische controle voor het live gaat.
9. **Matching is nog niet open voor gebruikers.** Opletten: de 7 proefpartners in de database (4 trainers, 2 voedingsdeskundigen, 1 sportschool) staan op zichtbaar. Zodra matching opengaat, zien gebruikers die als echte partners.
10. **Back-ups:** niet gecontroleerd (plan en herstelmogelijkheden van Supabase).

## D. Blijft bewust bij Dirk

- Sleutels en accounts aanmaken (Mollie, mailprovider, Vercel), en betalingen. Claude doet dat nooit.
- Commit en push (afspraak in CLAUDE.md).
- Jurist en fysiotherapeut laten kijken vóór brede lancering.
- Uitzonderingen: kwijtschelden, terugbetalen, een partner weigeren of verwijderen.
- Inhoud: video's, de introductievideo, partnergesprekken.

## E. Monitoring ontbreekt

Er is niets dat alarm slaat als een route faalt, een dagtaak niet draait of een sleutel verloopt. A1 en A2 waren daardoor niet opgemerkt. Dat is de belangrijkste reden dat het platform niet autonoom is: het kan stil falen.

## F. Voorgestelde volgorde

| Stap | Wie | Wat |
|---|---|---|
| 1 | Dirk | In Vercel bij Environment Variables controleren dat `SUPABASE_SERVICE_ROLE_KEY` bestaat, voor **Production** aangevinkt is, en daarna redeployen. Ook `CRON_SECRET`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` en `ANTHROPIC_API_KEY` nalopen. |
| 2 | Claude | Migratie voor `push_subscriptions` uitvoeren en testen. |
| 3 | Claude | Pagina `/admin/gezondheid`: toont per onderdeel of het werkt (sleutels aanwezig ja of nee, tabellen, laatste run van de dagtaken, Mollie), en geeft een pushmelding als iets stuk is. Dan is een stille storing niet meer mogelijk. |
| 4 | Samen | Partnerflow end-to-end testen met een proefpartner en de testsleutel van Mollie. |
| 5 | Dirk, dan Claude | Eén mailvoorziening opzetten (domein, mailbox, provider). Die dekt meldingen aan partners, facturen, uitnodigingen en klantenservice-mail. |
| 6 | Claude | Opruiming van oude accounts en partnerdocumenten, zoals beloofd in de privacyverklaring. |
| 7 | Claude | Factuur of betaalbewijs bij elke betaling, beoordeling na een match met automatisch pauzeren, incasso van het abonnement. |
| 8 | Claude | Uitnodigen van partners in batches met opvolging en afmelden, vanuit het platform in plaats van `cmd`. |
