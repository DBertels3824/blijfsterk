# Blijf Sterk — status

## Deliverables
- Conceptdocument (Artifact, privé): https://claude.ai/code/artifact/fc476d1c-750f-4285-861c-6860b9f52544 — 24 hoofdstukken. Hoofdstuk 10, roadmap (fase 2) en risico's bijgewerkt met de AI-avatar-oefenvideo-beslissing.
- Pitch (PowerPoint): `blijfsterk-pitch.pptx`, 18 slides, laatst verstuurd in de chat op 1 sep 2026.
- Bouwplan sprint 1 (Artifact, privé): https://claude.ai/code/artifact/a6e2370f-56ad-4e10-a0b6-08a065eff1ba
- Architectuur & bestandenoverzicht (Artifact, privé): https://claude.ai/code/artifact/ed83bbc5-479f-47dc-8610-155efbd92e13 — nog de oude (groenige) huisstijl, mist recente wijzigingen. Nog niet bijgewerkt.
- LinkedIn-architectuurplaat (PNG): `blijfsterk-linkedin-stack.html` / `blijfsterk-diagram-only.html`.
- Blijf Sterk-logo: `blijfsterk-logo-transparent.png` — geel-oranje verloop kettlebell-hart met smiley. Gebruikt in de live app (`public/logo.png`).
- Live site: https://blijfsterk.vercel.app
- Design-canvas #1 (Artifact, privé, Claude Design-preview, 11 sep): https://claude.ai/code/artifact/9544be0c-1588-47e9-b042-7f0949f8db0f — eerste visuele ronde. **Niet meer de huidige stijl van de app — Dirk heeft zelf een tweede, nieuwer ontwerp aangeleverd dat nu wél in de app zit.**
- UX-analyse 55+ (22 sep): projectdocument `claude/ux-analyse-2026-09-22.md`.
- Partnerplan trainers/sponsors/werving (23–24 sep): projectdocument `claude/partnerplan-trainers-sponsors.md`.
- Intro-video script + Runway-instructies: `introvideo-script-en-instructies.txt`. LinkedIn-collage: `blijfsterk-collage.png`.

## Businessmodel
Gratis voor de gebruiker. Inkomsten van: trainers (matchvergoeding €35 per nieuwe klant, eerste 2 gratis als founding partner; partnerabonnement €29/mnd later), sportscholen (partnerprogramma), sponsors (€250–1.000/mnd), merchandise. **Belangrijk principe (bevestigd 14 sep, verstevigd 24 sep): gebruikers zien alléén onze eigen partnertrainers, en contact tussen gebruiker en trainer loopt via de chat op het platform die pas opengaat na betaling van de matchvergoeding. Zo kan niemand om de fee heen.**

## Kernconcepten (concept-hoofdstukken)
1–2 Probleem & marktomvang · 3 Visie (Coach/Connect/Prove) · 4 Doelgroepen · 5 Propositie (incl. trainer-dashboard) · 6 AI-agents & de Blijf Sterk Coach · 7 De continue Blijf Sterk-cyclus · 8 Groei & vindbaarheid · 9 Binden zonder geld · 10 Content & video (incl. later-fase AI-avatar oefenvideo's) · 11 Verdienmodel · 12 Financiën · 13 MVP-scope · 14 Roadmap · 15 Validatieplan · 16 Team & rollen · 17 Techniek · 18 Merk & tone of voice · 19 Juridische structuur (AVG) · 20 Risico's · 21 Succesmaatstaven · 22 Referentiekader · 23 Dubbele businesscase · 24 Volgende stappen.

## Productbeslissing: AI-avatar oefenvideo's (later fase, niet in MVP)
Hybride aanpak: AI genereert alleen de presentatie, nooit de beweging zelf. Inmiddels ingehaald: alle 12 oefeningen hebben een échte video (sessie 18–19 sep).

## Productidee: groepsvormings-agent (later fase, nog niet uitgewerkt)
Agent die gebruikers in dezelfde buurt met vergelijkbare doelen bij elkaar brengt in kleine trainingsgroepjes. Intake vraagt al naar voorkeur alleen/1-op-1/groepje.

## Merchandise: Startpakket + weerstandsbandjes-pakket (14–17 sep)
Twee producten in `app/winkel/page.tsx` (bandjes+poster €14,95; Startpakket €39,95, richtprijzen) met één interesseformulier → tabel `product_interesse`; admin-overzicht `/admin/product-interesse`. Nog geen bestel-/betaalflow; zodra Mollie werkt (code staat er sinds 23 sep, zie hieronder) kan de winkel daarop aangesloten worden.

## Bouwfase — sprint 1 + verdiepingsfase compleet (1–9 sep 2026)
Account & login, Intake & risicocheck, AI-coach & advies, Voortgang & motivatie, Matching (incl. slimme aanbeveling + reviews), Dashboard. Stack: Next.js (App Router, TypeScript) + Supabase (auth + database) + Vercel (hosting, auto-deploy) + Anthropic API.

## GitHub & Vercel rechtgezet (10 sep 2026)
Werkmap en GitHub Desktop-map bleken niet gekoppeld; hersteld (`.git` verplaatst naar `C:\Users\Lenovo\blijfsterk`). Vercel-env-vars toegevoegd + redeploy.

## Sessie 14 sep 2026 — nieuw design, navigatie, loginfix, profielpagina, admin "trainers zoeken"
Tweede (nieuwer) design van Dirk volledig doorgevoerd. `HeaderNav.tsx` in `app/layout.tsx`. Inlog-redirect gefixt, wachtwoord-vergeten werkt. `app/intake/page.tsx` dient ook als profielpagina. Live Google-zoeken naar trainers alleen nog voor Dirk (`/admin/trainers-zoeken`) — nooit voor gebruikers (verdienmodel). `lib/admin.ts` exporteert `ADMIN_EMAIL`.

## Sponsorbanner (14–18 sep)
`SponsorBanner.tsx` + `lib/sponsors.ts`, onderaan de homepage, "Komt hier uw logo?" ertussen. Toont niets zolang `SPONSORS` leeg is; eigen logo staat er tijdelijk in — eruit vóór echte lancering.

## Sessie 15 sep 2026 — rollen, partner-accounts, aanmeldformulier, disclaimer, AI-coach-fix, oefeningenbibliotheek
- `profiles.rol` (gebruiker/trainer/sportschool), `trainers.user_id`, tabel `trainer_aanmeldingen`, RLS-policies. Trainer-/sportschool-dashboards (`/trainer-dashboard`, `/sportschool-dashboard`), publiek `/word-partner`, admin `/admin/aanmeldingen`.
- Disclaimer "Blijf Sterk is geen partij in de begeleiding" — **nog door een jurist laten nakijken.**
- AI-coach gaf `invalid x-api-key` → nieuwe `ANTHROPIC_API_KEY` in Vercel + redeploy. Les: bij "blijft hangen" tijdelijk de echte fout in de UI tonen.
- Oefeningenbibliotheek: `lib/oefeningen.ts` (12 oefeningen, 5 categorieën), `/oefeningen` (achter login), voorbeeld-weekschema `/oefeningen/schema`. Coach verzint nooit oefeningen, verwijst naar de bibliotheek met een echte knop. **Nog door fysiotherapeut/sportarts laten controleren.**
- Schematische poppetjes (`lib/oefening-poses.ts`, `OefeningAnimatie.tsx`) als tussenstap; geen beeldmateriaal van derden zonder duidelijke licentie.

## Sessie 16–17 sep 2026 — echte oefeningvideo's, open vs. afgeschermd deel
Dirk laat video's genereren in Canva (Brand Kit zet het logo zelf op de muur; anders logo-chip erop), gecomprimeerd naar 720p, `lib/oefening-videos.ts` koppelt id → pad. Matching alleen nog voor admin zichtbaar (menu én pagina-check); dashboard zonder "Jouw team".

## Sessie 18–19 sep 2026 — alle 12 video's, branding, landingspagina, dashboard, naam
Alle 12 oefeningen hebben video. Consistente naam "Dirk, je virtuele coach". Bandveiligheid-zin bij 4 bandoefeningen. `/waarom-krachttraining` (onderbouwd). Landingspagina vereenvoudigd (geen medische claims, "Deelnemen is gratis"). Dashboard herbouwd tot tegels + lettergrootte-knop (`TekstgrootteKnop`/`TekstgrootteWrapper`, CSS `zoom`, `localStorage` `bs-grote-tekst`). "Laatst gedaan" per oefening (`lib/datum.ts`). Naam bij registratie in auth user-metadata (`options.data.naam`), gebruikt in dashboard-begroeting en coach. Veiligheidsvraag beantwoord (Supabase Auth, HTTPS, RLS, sleutels server-side; incident 14 sep opgelost).

## Sessie 22–24 sep 2026 — UX-fixes, achtergrond, infopagina's, landelijke trainerslijst, partnernummers, Mollie, toetsing, match + chat

**Model gewisseld:** sessie draait nu op Fable 5.1. Alles wat er stond werkt gewoon door; werkwijze onveranderd.

**UX-analyse 55+** — apart projectdocument `claude/ux-analyse-2026-09-22.md`. Gedaan: items 1, 3, 4 (redirect als je al ingelogd bent, "Liever later invullen" bij intake, `/advies` → `/dashboard?coach=1`, `/voortgang` → `/oefeningen/schema`, weekschema-pagina heet nu "Jouw voortgang"). Nog open: 2, 5–12 (intake in stappen, oefeningkaart korter, lettergroottes/contrast (#8A7561 en #E85D00 halen de norm niet), letters-knop in header, weekschema klikbaar, Nederlandse loginfouten, coachknop overlapt op oefeningenpagina).

**Design:** hamburger-menu op smalle schermen (`HeaderNav` + `.bs-nav-desktop`/`.bs-nav-toggle` in `globals.css`). Dashboard: fototegels gebouwd en weer weggehaald op verzoek; nu 6 icoontegels op de hero-foto als achtergrond. Achtergrond staat op elke pagina behalve `/`, als vaste laag (`PaginaAchtergrond.tsx`, position fixed) zodat je niet alleen "de kruin" ziet op korte pagina's. Nieuwe eigen pagina's `/voor-wie` en `/hoe-het-werkt` via gedeeld `InfoPagina.tsx` (terug-link + "Deelnemen is gratis"-band); homepage is korter.

**Intro-video:** script + Runway-instructies geleverd (`introvideo-script-en-instructies.txt`). Dirk neemt zelf op/laat genereren. LinkedIn-collage gemaakt (`blijfsterk-collage.png`).

**Landelijke trainerslijst (7681 trainers, 340 gemeenten)** via Google Places, script `scripts/verzamel-trainers.mjs`, geïmporteerd in nieuwe tabel `trainer_kandidaten` (`scripts/importeer-trainers.mjs`). E-mailadressen: `scripts/vind-emails.mjs` zoekt op de website, anders `info@domein` (`email_bron` = gevonden/aangenomen/handmatig). **Eerste run: 2897 van 7681 opgeslagen** (sessie verliep na 1 uur, fouten werden niet gecheckt). Script gerepareerd (herlogin elke 40 min, opslaan met controle) — **Dirk moet `node scripts/vind-emails.mjs` nog opnieuw draaien** (ca. 4099 over). Uitnodigingslinks: `scripts/maak-uitnodigingslinks.mjs` → `trainers-mailing.csv` (filters `--gemeente --score --reviews`). Admin-pagina `/admin/kandidaten` (Trainers uitnodigen): filters, e-mail aanpassen, notitie, link kopiëren. CSV/xlsx/mailing staan in `.gitignore`.

**Partnernummers:** `BS-10001` en verder, uit een database-reeks (`nieuw_partnernummer()`). Alle kandidaten hebben er een; gaat mee in de uitnodigingslink (`pn`), komt op de aanmelding, de partner-rij en elke betaling. Zo is elke betaling altijd aan de juiste partner te koppelen.

**Mollie (code klaar, nog geen account):** `lib/mollie.ts`, `/api/betalingen/start` (iDEAL-checkout), `/api/betalingen/webhook`. Partner betaalt in zijn dashboard ("Afrekeningen"-blok, `PartnerBetalingen.tsx`); Dirk zet handmatig bedragen klaar in `/admin/betalingen` (matchvergoeding €35, abonnement €29, overig). **Dirk maakt zelf het Mollie-account aan en zet `MOLLIE_API_KEY` in Vercel + redeploy.** Tot dan geeft "Betaal via iDEAL" een nette foutmelding.

**Toetsing, match en chat (24 sep):** zie het partnerplan-document, sectie "Gebouwd (24 sep)". Kort: aanmelden met KvK + VOG/verzekering/EHBO (+diploma of registratienummer) → automatisch partner als alles klopt, anders naar Dirk → account aanmaken op hetzelfde e-mailadres koppelt automatisch → gebruiker kiest een trainer → eerste 2 matches per partner gratis, daarna €35 vooraf → gesprek gaat open met een openingsbericht van Dirk → beiden chatten in `/gesprekken`. Contact vóór betaling is niet mogelijk; dat beschermt het verdienmodel.

**Database (migraties uitgevoerd via Supabase MCP):** `trainer_kandidaten`, partnernummer-reeks, `betalingen`, `gesprekken`, `berichten`, extra kolommen op `trainer_aanmeldingen`/`trainers`, opslagbucket `partner-documenten` (privé, alleen Dirk leest). Alle nieuwe tabellen hebben expliciete GRANTs — **verplicht vanaf 30 okt 2026** (Supabase-mail; bij elke nieuwe tabel meteen GRANT toevoegen).

**Domein blijfsterk.nl (Yourhosting):** instructies gegeven (A-record `@` → Vercel-IP, CNAME `www` → `cname.vercel-dns.com`, MX laten staan). Domein staat nog niet in Vercel; Dirk kwam er niet uit. Aangeboden om het domein via Vercel toe te voegen zodra hij "ja" zegt. Daarna: `vercel.app` in code/`SITE` en Supabase Site URL vervangen.

**Werkwijze-aanvullingen:**
- Bestanden `app/matching/page.tsx`, `app/trainer-dashboard/page.tsx`, `app/admin/aanmeldingen/page.tsx` zijn rechtstreeks op de laptop bewerkt en staan **niet** in de cloud-spiegel — nooit vanuit de spiegel overschrijven.
- `tar xzf … --overwrite` nodig op de Windows-mount; verwijderrechten voor `C:\Users\Lenovo\blijfsterk` zijn per sessie opnieuw te vragen.
- Live site is vanuit de cloud niet te bereiken (proxy); screenshots via de ingebouwde browser.
- Node-scripts loggen in met Dirks admin-wachtwoord (verborgen ingetypt, nooit opgeslagen); sessies verlopen na 1 uur → scripts loggen zelf opnieuw in.

**30 sep — UX-punten 5, 6, 8, 9, 10 gedaan** (tsc EXIT:0, Dirk commit zelf): oefeningenpagina korter (veiligheid inklapbaar, coach onderaan, "Zo doe je het" vóór "Ik heb dit gedaan"), geen letters onder 15px, contrastkleuren (`#6F5A48` hulptekst, `#B34500` oranje tekst, `#9E5A18` waarschuwing), letters-knop in de bovenbalk en het mobiele menu. Details in `claude/ux-analyse-2026-09-22.md`. Vervangtabel `ux-sed.txt` is op de laptop op alle app/lib-bestanden toegepast, ook de drie laptop-only bestanden.

**30 sep — logo op de oefeningvideo's:** nieuwe stijl is een klein wit kader rechtsonder (logo 150px breed, kader 176×62, 20px van de rand). Nieuwe vogel-hond-video (diversiteit) zo verwerkt. Bij 8 bestaande video's is het oude witte kader rechtsboven weggehaald met ffmpeg `delogo` (werkt goed op een vlakke muur) en het nieuwe kader rechtsonder gezet. Bij `marcheren`, `stoel-squat` en `zijwaartse-beenheffing-band` zit het Canva-muurlogo in de scène zelf; `delogo` gaf daar strepen. Opgelost door terug te gaan naar Dirks originele uploads (staan nog in de uploads-map van de cloudsessie, zonder kader): opnieuw geschaald/gecomprimeerd en alleen het nieuwe kader rechtsonder erop. Alle 12 video's hebben nu één stijl: kader rechtsonder (bij deze drie plus het Canva-muurlogo in de scène). ffmpeg staat op de laptop-VM, dus video's worden daar bewerkt (geen transfer nodig).

**Openstaand na deze sessie:** commit + push; e-mailscript opnieuw draaien; Mollie-account + sleutel; domein; intro-video; LinkedIn-post; UX-items 2, 5–12; notificaties bij nieuwe chatberichten (mail naar trainer, push naar gebruiker); beoordeling na match + auto-pauze; e-mail-agent (na domein-mailbox); abonnement-incasso; sponsorbrochure; jurist (voorwaarden) en fysiotherapeut (oefeningen) blijven staan.

## Sessie 13 okt 2026 — werken op de laptop, hulp van familie bij inloggen

**Werkwijze:** sessie draait nu in Claude Code (desktop-app) rechtstreeks in `C:UsersLenovolijfsterk`. Geen cloud-spiegel en geen tar-overdracht meer; de drie "laptop-only" bestanden zijn geen uitzondering meer. Supabase en Vercel zijn als tools gekoppeld. Dirk doet commit/push nog steeds zelf. Lokale voorbeeldserver via `.claude/launch.json` (poort 3000 is bezet door ProjectCockpit, dus vrije poort).

**Map `claude/`** aangemaakt met `status.md`, `partnerplan-trainers-sponsors.md` en `ux-analyse-2026-09-22.md`, zodat CLAUDE.md klopt. Oude versie van het partnerplan staat nog in `Claude outputs/`.

**Inloggen met hulp van familie (tsc EXIT:0, Dirk commit zelf):**
- Knop "Ik help mijn vader of moeder" op `/login` (ook via `/login?helper=1`). Zet het formulier in helper-stand: naam van de oudere, eigen naam van de helper, e-mail (mag van de helper zijn), wachtwoord. De naam van de oudere komt zoals altijd in `naam` (user-metadata); de helper staat erbij als `helper_naam` en `aangemaakt_door: 'naaste'`. Dashboard en coach spreken dus de oudere aan, zonder aanpassing.
- Bewuste keuze: géén meekijken en géén melding naar het kind. Het account blijft van de oudere; anders wordt het een drukmiddel.
- Knop "Hulp nodig bij inloggen?" met een rustig paneel: wachtwoord kwijt, e-mailadres kwijt (vraag een naaste), en "Mail ons" naar `HULP_EMAIL` in `lib/admin.ts` (nu Dirks adres; later `info@blijfsterk.nl`).
- Blok "Help je je vader of moeder?" op `/voor-wie` met link naar de helper-stand. `btnSecondary` is nu geëxporteerd uit `InfoPagina.tsx`.

**Voorwaarden en privacy (concept, tsc EXIT:0, Dirk commit zelf):**
- **Drie aparte voorwaarden (13 okt):** `/voorwaarden` is een keuzepagina; de afspraken staan in `/voorwaarden/gebruikers`, `/voorwaarden/trainers` en `/voorwaarden/sportscholen`. Slotbepalingen (teksten/logo, wijzigingen, klachten/recht) staan op één plek in `app/components/VoorwaardenSlot.tsx`. Voettekst heeft drie links; `/login` verwijst naar die voor gebruikers; `/word-partner` naar die voor het gekozen type. Daarnaast `/privacy` (per rol welke gegevens, grondslag, Anthropic/Supabase-Ierland/Vercel/Mollie, bewaartermijnen, rechten). Gedeeld sjabloon `JuridischePagina.tsx` (zonder verkoopband), inhoudsopgave, grote letters.
- Bedrijfsgegevens, versiedatum, concept-vlag en tarieven staan in `lib/juridisch.ts`. **Dirk vult KvK, rechtsvorm en adres in**; zolang `JURIDISCH_CONCEPT` op true staat, tonen beide pagina's een "Conceptversie"-melding.
- Akkoord-zin onder "Account aanmaken" op `/login` (ook in helper-stand). Verplicht vinkje op `/word-partner` ("akkoord + bevoegd").
- **Sportscholen betalen hetzelfde als trainers (besloten 13 okt):** €35 matchvergoeding per nieuwe klant, eerste 2 gratis, chat open na betaling. De ledenbonus (€25 + €25) uit het partnerplan vervalt; code en voorwaarden kloppen nu met elkaar. Partnerplan, sectie Sportscholen, is ook aangepast.
- **Beleidskeuzes in de tekst die Dirk/jurist moeten bevestigen:** trainers moeten binnen 2 werkdagen reageren en ernstige incidenten binnen 2 werkdagen melden; opzegtermijn voor Blijf Sterk 30 dagen; tariefwijziging 30 dagen vooraf; gesprekken kunnen bij klacht door ons worden ingezien (ook in `/privacy`); aansprakelijkheid gebruikers €100 per gebeurtenis; bedragen excl. btw; matchvergoeding niet terugbetaald behalve bij fout van Blijf Sterk; aansprakelijkheid beperkt tot betaalde bedragen (gebruikers €100); accounts na 2 jaar niet inloggen verwijderen (nog niet gebouwd); verwijdering binnen 30 dagen na opzegging (handmatig door Dirk); partnerdocumenten 1 jaar na einde bewaren; 18+. Doorgifte Anthropic op standaardbepalingen EU: controleren in de Anthropic-DPA.

## Huisstijl
Merkkleuren als CSS-variabelen in `app/globals.css`: geel `#FFBE0A`, oranje `#FF8601`, dieporanje `#E85D00`, crème `#FFF8EE`, donkerbruine leestekst `#2B1B0E`. IBM Plex Sans, 17px basis. Tekstkleuren sinds 30 sep: hulptekst `#6F5A48`, oranje tekst/links `#B34500`, waarschuwing `#9E5A18` (alle ≥ 5:1 op crème). `#E85D00` alleen nog in verlopen, iconen en achtergronden.

## Slimme matching-agent (9 sep 2026)
`app/api/aanbeveling/route.ts` — één aanbevolen id + reden per categorie, ids hard gecontroleerd in code.

## LinkedIn-ritme
Terugkerende scheduled task: elke 3 weken op vrijdag. Eerste firing 25 sep 2026. Trigger-id `trig_01BmoHevYGh1Kmk9pt5LwERk`. Post-concept klaar (`linkedin-post-3.txt`, collage `blijfsterk-collage.png`), nog niet geplaatst.

## Werkwijze
- Dirk mag ik Artifact-publicaties zelf goedkeuren.
- Dirk is niet-technisch. Voorkeur: korte zinnen, Nederlands.
- Sessie werkt rechtstreeks in `C:\Users\Lenovo\blijfsterk` (bestandstoegang + `device_bash`). Git commit/push doet Dirk altijd zelf in GitHub Desktop (Ctrl+R om de lijst te verversen → Summary → Commit to main → Push origin), daarna vercel.com → Deployments → "Ready".
- **Standaard overzetten vanuit de cloud-spiegel (`/home/claude/blijfsterk-edit`):** `tar czf` van de gewijzigde bestanden → SendUserFile → `device_commit_files` naar `_sync_tmp\syncN.tar.gz` → `device_bash`: `tar xzf … --overwrite && rm -rf _sync_tmp && npx tsc --noEmit -p .`. Nooit base64 in een commando plakken. Verwijderrechten per sessie opvragen.
- **Bestanden die alleen op de laptop bewerkt zijn (niet in de spiegel): `app/matching/page.tsx`, `app/trainer-dashboard/page.tsx`, `app/admin/aanmeldingen/page.tsx`.** Nooit vanuit de spiegel overschrijven. Spiegel heeft ook geen `lib/supabase.ts`, `tsconfig`, `node_modules` — typecheck alleen op de laptop.
- Live site is vanuit de cloud niet bereikbaar (proxy 403) — screenshots via de ingebouwde browser (`request_access` per pagina) of lokale render.
- Gewijzigde env-var in Vercel wordt pas actief na redeploy. Sleutels maakt Dirk altijd zelf aan.
- Supabase-migraties via de Supabase MCP; project `scspksvgftrjbpucmyed`. **Elke nieuwe publieke tabel krijgt in dezelfde migratie expliciete GRANTs voor anon/authenticated/service_role (verplicht vanaf 30 okt 2026).**
- `SUPABASE_SERVICE_ROLE_KEY` staat in Vercel en wordt gebruikt door de cron en door de server-routes (`/api/partner/*`, `/api/betalingen/*`, `/api/match/kies`).
- Node-scripts in `scripts/` draaien in `cmd` in de projectmap; loggen in met Dirks admin-wachtwoord (verborgen ingetypt, nooit opgeslagen). Sessie verloopt na 1 uur → scripts loggen zelf opnieuw in en controleren elke opslag.
- Chatberichten met extra UI-velden altijd filteren tot `role`/`content` vóór ze naar de Anthropic API gaan.
- **Terugkerend patroon: als een AI-agent iets kan "verzinnen", wordt dat niet aan de AI overgelaten** (matching-ids, oefeningen, video-beweging).
- **Terugkerend patroon: nieuwe functies eerst toetsen aan het verdienmodel** (geeft dit iets weg waar normaal voor betaald wordt?). Vandaar: matching alleen eigen partners, oefeningen achter login, chat pas na betaling.
- Geen beeldmateriaal van derden zonder duidelijke commerciële licentie. Cowork kan zelf geen foto's/video's genereren; Dirk maakt ze in Canva/Runway.
- Admin-only pagina's: gate via `lib/admin.ts`, redirect naar `/dashboard`. Rol-only pagina's: zelfde patroon op `profiles.rol` of `trainers.user_id`.
- Debug-truc: tijdelijk de echte foutmelding in de UI tonen, daarna opruimen.
- Betalingen/financiële transacties voert de sessie nooit zelf uit; Dirk beheert zijn eigen Mollie-account.
- Persoonsgegevens zoals naam liever in auth user-metadata dan in een nieuwe kolom.
- Nooit screenshots met zichtbare sleutels verwerken zonder op rotatie te wijzen.

## Openstaand
- **`node scripts/vind-emails.mjs` opnieuw draaien** (ca. 4099 kandidaten zonder e-mail).
- **Mollie-account aanmaken + `MOLLIE_API_KEY` in Vercel + redeploy.** Daarna testen met een test-sleutel. Later ook winkel aansluiten.
- **Domein blijfsterk.nl:** in Vercel toevoegen (ik kan dat doen na "ja"), DNS bij Yourhosting (A `@`, CNAME `www`, MX laten staan), daarna `vercel.app` vervangen in code (`SITE` in `maak-uitnodigingslinks.mjs`, links) en Supabase Site URL.
- Intro-video opnemen/genereren; LinkedIn-post plaatsen.
- UX-items 2, 7, 11, 12 uit `claude/ux-analyse-2026-09-22.md` (5, 6, 8, 9, 10 gedaan op 30 sep).
- Notificaties bij nieuwe chatberichten (mail naar trainer, push naar gebruiker) — wacht op domein-mailbox.
- Beoordeling van de trainer na een match (sterren + zin) en automatisch op pauze na 2 slechte beoordelingen.
- **Signaal naar een kind of verzorger over het oefenen (wens 13 okt):** alleen als de oudere dat zélf aanzet in het profiel (naam + e-mail van de naaste), met een wekelijks, vriendelijk mailtje (geen alarm). Blokkade: de app kan nog geen e-mail versturen. Nodig: mailprovider (bijv. Resend) + sleutel in Vercel, liefst na de domein-mailbox. Daarna: opt-in in `/intake`, cron naast `/api/cron/inactief`.
- E-mail-agent voor de partnermailbox (na domein). Abonnement-incasso. Sponsorbrochure. KvK-adreslijst als aanvulling.
- **Jurist:** conceptteksten op `/voorwaarden` en `/privacy` laten nakijken (beleidskeuzes: zie sessie 13 okt), daarna `JURIDISCH_CONCEPT` op false en bedrijfsgegevens in `lib/juridisch.ts` invullen. Fysiotherapeut/sportarts (oefeningen) vóór brede lancering. Optioneel externe beveiligingscheck.
- Registratienummer NL Actief/EREPS wordt nog niet echt geverifieerd (geen API) — steekproef door Dirk.
- Weekschema personaliseren; naam achteraf toevoegen voor bestaande accounts; eigen logo uit de sponsorbanner vóór lancering; architectuur-artifact bijwerken.
- Later-fase: groepsvormings-agent, AI-avatar-laag, SEO-agent, Blijf Sterk Score, maatjes-matching.
