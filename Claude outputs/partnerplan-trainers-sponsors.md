# Blijf Sterk — Partnerplan

Trainers werven en binden, sponsors werven, en de site onder de aandacht brengen.
Versie 23 september 2026. Korte zinnen, bewust. Dit is een werkdocument, geen juridisch of fiscaal advies.

---

## 1. Waar we naartoe werken

Nu: gebruikers trainen thuis, met Dirk als virtuele coach.
Straks: wie wil, wordt gekoppeld aan een personal trainer of sportschool in de buurt. Of aan een trainingsmaatje. Altijd op eigen verzoek.

Dat vraagt drie dingen:

1. Een landelijke lijst met trainers om uit te nodigen.
2. Een toetsing die grotendeels automatisch loopt, maar wel betrouwbaar is.
3. Een verdienmodel waar de trainer én Blijf Sterk beter van worden.

---

## 2. De landelijke lijst

### Bron: Google Maps, alle 342 gemeenten

Het script `scripts/verzamel-trainers.mjs` loopt alle gemeenten af en zet elke trainer in `trainers-nederland.csv`. Met naam, adres, telefoon, website, Google-score en aantal reviews.

Starten, in een terminal in de map blijfsterk:

```
node scripts/verzamel-trainers.mjs
```

Eerst even testen met een paar plaatsen:

```
node scripts/verzamel-trainers.mjs --plaatsen=Zwolle,Deventer
```

Het script onthoudt waar het was. Stopt het, dan draai je hetzelfde commando opnieuw. Verwacht 3.000 tot 6.000 trainers. Kosten: ruwweg €30 tot €50 aan Google-tegoed voor het hele land. Duur: ongeveer een uur.

De CSV open je in Excel. De kolom `status` houd je zelf bij: nieuw, uitgenodigd, gesproken, aangemeld, nee.

### Aanvulling later: KvK-adressenbestand

Voor wie niet op Google Maps staat. SBI-codes 85.51 (sportonderwijs) en 93.13 (fitnesscentra). Te koop bij de KvK, enkele honderden euro's voor heel Nederland. Pas doen als de eerste ronde loopt.

### Volgorde van uitnodigen

Niet alles tegelijk. Begin met de trainers die het meest kansrijk zijn:

- Google-score 4,5 of hoger, minimaal 10 reviews.
- Website of profiel noemt "senioren", "55+", "ouderen", "revalidatie" of "medische fitness".
- In een gemeente waar al gebruikers van Blijf Sterk zijn (te zien in "Trainers zoeken" → "Vraag bij gebruikers").

Die eerste groep is misschien 300 tot 500 trainers. Dat is te doen.

---

## 3. Toetsing: automatisch waar het kan, handmatig waar het moet

Ouderen zijn een kwetsbare groep. De toetsing is dus geen formaliteit. Maar ze hoeft niet alles via Dirk te laten lopen.

### Wat een trainer bij aanmelding uploadt

| Nr | Wat | Waarom | Controle |
|----|-----|--------|----------|
| 1 | KvK-nummer | Echt bedrijf | Automatisch via KvK-API (of handmatig via kvk.nl) |
| 2 | Registratienummer NL Actief / EREPS, of erkend diploma | Vakbekwaam | Nummer opzoeken; diploma handmatig |
| 3 | Verklaring Omtrent het Gedrag (VOG), max. 2 jaar oud | Betrouwbaar met kwetsbare mensen | Handmatig bekijken, eenmalig |
| 4 | Polisblad bedrijfsaansprakelijkheidsverzekering | Als er iets misgaat | Handmatig bekijken, jaarlijks |
| 5 | EHBO- of reanimatiecertificaat | Veiligheid tijdens training | Handmatig bekijken |
| 6 | Korte vragenlijst (staat al op /word-partner) | Ervaring met 55+, omgang met klachten | Automatisch: verplichte velden |

### De regel

- Alles compleet, KvK klopt, registratienummer klopt → **automatisch geaccepteerd**, status "proef". Trainer is meteen zichtbaar.
- Iets ontbreekt of klopt niet → status "te beoordelen". Komt bij Dirk in "Aanmeldingen".
- Eerste 3 maanden: proefperiode. Na elke match beoordeelt de gebruiker de trainer (1 tot 5 sterren, één zin).
- Twee beoordelingen van 2 sterren of lager op rij → **automatisch op pauze**. Dirk kijkt ernaar.
- Gemiddeld 4 sterren of hoger na 3 matches → vast partner.

### Wat dit betekent voor de bouw

Het aanmeldformulier (`/word-partner`) krijgt uploadvelden voor VOG, polisblad, certificaat en diploma, en een veld voor KvK- en registratienummer. Bestanden gaan naar Supabase Storage, alleen zichtbaar voor de admin. De status-logica komt in de database. Beoordelen na een match komt bij de matching-pagina. Dit bouw ik als je zegt dat het zover is.

---

## 4. Het verdienmodel voor trainers

### Uitgangspunt

De trainer betaalt pas als Blijf Sterk hem iets oplevert. Instappen is gratis. Zo wordt uitnodigen makkelijk, en verdien jij aan elk succes.

### Drie lagen

**Laag 1 — Gratis vermelding.**
Trainer staat in de lijst, met naam, plaats en kwaliteitskeurmerk. Kost niets. Doel: zoveel mogelijk trainers binnen, zodat elke gebruiker iemand in de buurt vindt.

**Laag 2 — Matchvergoeding: €35 per nieuwe klant.**
Zodra een gebruiker kiest voor een trainer én de eerste afspraak is bevestigd, betaalt de trainer €35. Eenmalig, per nieuwe klant. Geen match, geen kosten.
Rekenvoorbeeld: een trainer vraagt €60 tot €80 per uur. Een 55-plusser die blijft, traint al snel 20 keer. Dat is €1.200 tot €1.600 omzet voor €35. Dat verkoopt zichzelf.

**Laag 3 — Partnerabonnement: €29 per maand (optioneel).**
Voor trainers die actief klanten willen ontvangen:
- Bovenaan in de resultaten in hun regio.
- "Aanbevolen door Blijf Sterk"-badge.
- Eigen profielpagina met foto, verhaal en beschikbaarheid.
- Matchvergoeding daalt naar €20.
- Maandelijks overzicht: hoe vaak bekeken, hoeveel matches.

### Startaanbod (eerste 100 trainers)

- Eerste 6 maanden: geen abonnement.
- Eerste 2 matches: gratis.
- Daarna de normale tarieven.
- Noem het "Founding partner". Mensen willen daarbij horen.

### Wat het oplevert (voorzichtig gerekend)

| | Jaar 1 | Jaar 2 |
|---|---|---|
| Trainers in de lijst | 300 | 1.000 |
| Waarvan abonnement (€29) | 30 | 150 |
| Matches per maand | 40 | 200 |
| Omzet abonnementen / maand | €870 | €4.350 |
| Omzet matches / maand (gem. €28) | €1.120 | €5.600 |
| **Totaal per maand** | **€1.990** | **€9.950** |

Het conceptdocument rekende met break-even rond €2.900 per maand. Met sponsors erbij (hoofdstuk 5) is dat in jaar 1 haalbaar.

### Sportscholen

Zelfde opzet, andere getallen. Sportschool betaalt geen matchvergoeding maar een vaste bonus per lid dat via Blijf Sterk komt: €25 bij inschrijving, en €25 als het lid na 3 maanden nog lid is. Dat past bij hoe sportscholen rekenen (ledenwerving).

### Praktisch

- Facturatie via Mollie (iDEAL, automatische incasso voor abonnementen). Dirk zet Mollie zelf op.
- Trainer ziet in zijn dashboard: matches, openstaande vergoedingen, betaalstatus.
- Voorwaarden laten nakijken door een jurist vóór de eerste betaling. Staat al op de lijst.

---

## 5. Sponsors werven

### Wanneer

Pas als er iets te laten zien is. Concreet: minimaal 200 actieve gebruikers, de introductievideo staat, en de eerste trainers zijn aangesloten. Een sponsor koopt bereik en imago. Zonder cijfers is er niets te verkopen.

### Wie

Bedrijven die 55-plussers als klant hebben en "vitaal ouder worden" willen uitstralen:

- Zorgverzekeraars (preventie is hun grootste kostenpost; regionale verzekeraars zijn benaderbaar).
- Fysiotherapieketens en gezondheidscentra.
- Leveranciers van fitnessmateriaal (weerstandsbanden, matten). Die kunnen ook het Startpakket leveren.
- Voedingsmerken gericht op eiwitten en ouderen.
- Regionale ondernemers: apotheek, opticien, thuiszorg, seniorenmakelaar.
- Gemeenten en GGD's. Geen sponsor in klassieke zin, maar wel budget voor valpreventie en "gezond ouder worden". Vaak via subsidie.

### Wat ze krijgen

| Pakket | Prijs / maand | Wat |
|---|---|---|
| Regionaal | €250 | Logo in de banner, zichtbaar voor gebruikers in 1 regio, vermelding op partnerpagina |
| Landelijk | €600 | Logo landelijk in de banner, eigen blok op de homepage, 1 gastartikel per kwartaal |
| Hoofdsponsor | €1.000+ | "Mede mogelijk gemaakt door" bovenaan elke pagina, logo in de introductievideo, gezamenlijke persberichten, exclusief in de branche |

De banner ("Komt hier uw logo?") staat al klaar.

### Hoe

1. Maak een sponsorbrochure van 2 pagina's: wat Blijf Sterk is, voor wie, cijfers (gebruikers, trainingen, regio's), de drie pakketten. Ik maak die als de cijfers er zijn.
2. Begin regionaal en persoonlijk. Eén verzekeraar, één fysioketen, één materiaalleverancier. Bel, mail, kom langs.
3. Eerste sponsor mag "launching sponsor" heten, met korting. Daarna is het makkelijker.

---

## 6. De site onder de aandacht brengen

Zonder gebruikers geen trainers en geen sponsors. Dit is dus de eerste prioriteit na de lancering.

### Gratis, en werkt bij deze doelgroep

**Huisartsen en fysiotherapeuten.** Zij zien 55-plussers dagelijks en zeggen al "u moet meer bewegen". Blijf Sterk is een concreet antwoord. Maak een A5-kaartje voor in de wachtkamer. Bied fysiotherapeuten aan dat ze hun patiënten naar de oefeningen kunnen sturen.

**Gemeenten en welzijnsorganisaties.** Elke gemeente heeft een programma voor valpreventie en ouderen. Zij zoeken precies dit. Ga langs bij de beleidsmedewerker sport of ouderen.

**Bibliotheken, buurthuizen, seniorenverenigingen (KBO-PCOB, ANBO).** Geef een gratis workshop van een uur: "Sterk blijven na je 55e". Laat de app zien, doe drie oefeningen. Mensen melden zich ter plekke aan.

**Lokale media.** Huis-aan-huisbladen en regionale omroepen plaatsen graag verhalen over een lokale ondernemer met een goed idee. Stuur een persbericht met een foto van jou en de video.

**LinkedIn.** Loopt al (elke 3 weken). Richt je op: fysiotherapeuten, zorgverzekeraars, gemeenten, en mensen die voor hun ouders zoeken.

**Facebook.** De doelgroep zit hier, niet op Instagram. Lokale groepen ("Je bent een echte Zwollenaar als…"), en de kinderen van de doelgroep (45 tot 60 jaar) die voor hun ouders zoeken.

**Google.** Zorg dat "krachttraining ouderen", "oefeningen 55 plus thuis" en "sterk blijven na 60" naar de site leiden. De pagina "Waarom krachttraining" is daar al goed voor. Later meer van dit soort pagina's.

### Betaald, als er budget is

- Facebook-advertenties, gericht op 55+ én op 45–60 met ouders. Begin met €5 per dag, kijk wat werkt.
- Google Ads op de zoektermen hierboven. Alleen als de gratis vindbaarheid niet genoeg is.

### Wat er eerst klaar moet zijn

1. Domein blijfsterk.nl gekoppeld (nu nog vercel.app). Niemand typt "vercel" over.
2. Introductievideo op de homepage.
3. Oefeningen goedgekeurd door een fysiotherapeut. Dat is ook je eerste verhaal: "gecontroleerd door een fysiotherapeut".
4. Voorwaarden en privacyverklaring nagekeken.

---

## 7. Volgorde

1. **Nu:** script draaien, lijst in Excel, eerste 300 kansrijke trainers markeren.
2. **Deze maand:** domein koppelen, introvideo, fysiotherapeut laten meekijken.
3. **Daarna:** aanmeldformulier uitbreiden met uploads en automatische toetsing. Eerste 50 trainers persoonlijk uitnodigen als founding partner.
4. **Bij 200 gebruikers:** sponsorbrochure, eerste regionale sponsor.
5. **Bij 100 trainers:** Mollie aanzetten, matchvergoeding live.
