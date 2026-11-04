# Voorstel: de virtuele coach die persoonlijk begeleidt (coach-sessies)

Geschreven op 30 oktober 2026. **Dit is een voorstel. Er is nog niets gebouwd.** Beslissingen voor Dirk staan onderaan (sectie 11).

## 1. Het idee in een paar zinnen

Een lid van Blijf Sterk kiest een vast ritme, bijvoorbeeld drie keer per week. Op het afgesproken moment staat "Dirk, je virtuele coach" klaar. Lid en coach doen samen de oefeningen, in beeld. De coach is persoonlijk, vriendelijk en opbeurend, en houdt de lat net hoog genoeg: minder vrijblijvend, wel vriendelijk. Alles wat het lid doet wordt bijgehouden, zodat de coach de volgende keer verder kan bouwen.

Het is een **betaalde extra** (de coach kost tokens en spraak). De basis van Blijf Sterk blijft gratis.

## 1b. Het doel: van basis naar echt trainen, liefst in een groepje (Dirk, 30 okt)

De coach is geen eindpunt maar een **opstap**.

- **Stap 1, de basis thuis:** zonder gewichten. Alleen het eigen lichaam, een stoel, de muur en een matje. Doel: zelfvertrouwen, een gewoonte, basiskracht en balans.
- **Stap 2, doorstromen:** trainen bij een sportschool of een personal trainer, het liefst in een klein groepje. Daar komen gewichten en meer begeleiding.
- **Waarom een groepje:** sociale voordelen (samen afspreken, minder eenzaam, elkaar helpen volhouden), en een trainer bedient meer mensen per uur. Dat is voordeliger voor het lid en aantrekkelijker voor de trainer.

Wat dit verandert:

1. **Het programma krijgt niveaus.** *Basis* (geen gewichten, geen flesjes) en daarna *Klaar voor de volgende stap*. De oefeningen met band en flesje horen niet meer in de basis. Voor armen, schouders en rug zijn dan nieuwe oefeningen zonder gewicht nodig. Alles wat erbij komt gaat eerst langs de fysiotherapeut; de AI voegt zelf nooit iets toe.
2. **De coach leidt het lid naar de volgende stap.** Bijvoorbeeld na zes tot acht weken goed volhouden, of eerder als het lid het zelf wil: "Zin om dit samen met anderen te doen?" Nooit pushen. Wie thuis wil blijven, kan dat.
3. **Dit is de kern van het verdienmodel.** De coach (betaald door het lid of een verzekeraar) brengt leden bij partners. Daar geldt de bestaande regel: de partner betaalt €35 per nieuwe klant en de chat gaat pas open na betaling. De coach geeft zelf nooit contactgegevens.
4. **De groepsvormings-agent** (nu "later fase" in status.md) komt vooraan. Hij brengt leden uit dezelfde buurt, met hetzelfde niveau en doel, bij een trainer of sportschool. Eerst het idee uitwerken; de ids komen uit de database, nooit van de AI. De intake vraagt al naar voorkeur alleen, 1-op-1 of groepje.
5. **Nieuw, nog te bedenken:** een groepschat bestaat niet (nu: lid, partner en Dirk). Als die er komt: alleen voornamen en alleen met toestemming van alle leden.
6. **Voor de zorgverzekeraar** is dit een sterker verhaal: minder eenzaamheid en duurzaam bewegen. We voegen "doorgestroomd naar een groep of trainer" toe als meetpunt.
7. **Video's:** de basisset moet bij dit niveau passen (zonder gewichten). Dirk is niet tevreden over de huidige video's; wat hem tegenvalt, is nog niet bekend.

## 2. Hoe een week eruitziet voor het lid

- **Zondagavond:** een korte, warme groet. "Morgen om 10:00 samen aan de slag? Vorige week deed je het mooi, drie van de drie keer."
- **Maandag 10:00:** melding "Dirk staat klaar". Eén grote knop. De coach begroet het lid bij naam, vraagt hoe het gaat (en onthoudt dat de knie vorige keer gevoelig was), en begint.
- **Tijdens de sessie:** de coach noemt de oefening, laat de video zien, telt mee, moedigt aan, laat rustmomenten in. Daarna een kort gesprekje.
- **Niet gekomen?** Na een uur één vriendelijke vraag ("Ik wacht niet, hoor. Lukt het later vandaag?"). De volgende ochtend een tweede. Daarna laat de coach het los tot de volgende afspraak. Geen schuldgevoel, geen drukmiddel.
- **Vrijdag:** terugblik. Wat is er gedaan, wat ging beter dan vorige week, wat is de afspraak voor de volgende week.

## 3. Persoonlijkheid en toon

Eis van Dirk: **heel persoonlijk, vriendelijk, opbeurend en motiverend.** Zo bouwen we dat in:

1. **Naam en eigen reden.** De coach gebruikt de naam en het eigen doel van het lid uit de intake ("zodat je weer met de kleinkinderen kunt voetballen"). Motivatie werkt het best met de reden van het lid zelf.
2. **Geheugen.** De coach onthoudt kleine persoonlijke dingen die het lid zelf vertelt (de hond, de tuin, de kleindochter, een gevoelige knie). Het lid kan dat zien, aanpassen en verwijderen (sectie 5).
3. **Echte successen benoemen.** De coach viert wat echt gebeurd is, met cijfers uit het eigen logboek: "Dit is je vierde week op rij." Hij **verzint nooit** een resultaat. Dat sluit aan bij de vaste regel dat de AI niets verzint dat gecontroleerd moet zijn.
4. **Warm, niet overdreven.** Geen "SUPER GEWELDIG!!!" na alles. Echte, specifieke complimenten. Rustig tempo, korte zinnen, gewone woorden, "je" zoals in de rest van de app.
5. **Afwisseling.** Niet elke keer dezelfde zinnen. Een beetje humor mag, nooit ten koste van het lid.
6. **Minder vrijblijvend zonder druk.** De coach vraagt om een concrete afspraak ("Maandag 10:00, past dat?") en komt erop terug. Het lid kiest zelf hoe nadrukkelijk de coach is (zacht / gewoon / stevig). Het account en de gegevens blijven van het lid; er gaat nooit een melding naar een kind of verzorger, behalve als het lid dat zelf aanzet (dat staat al als wens in status.md).
7. **Bij pijn, tegenslag of een slechte dag:** eerst luisteren, niet doorduwen. Pijn betekent stoppen en doorverwijzen. Een lastige week wordt een kleinere week, geen mislukking.
8. **Vaste testgesprekken.** Vóór livegang 15 tot 20 scenario's met het echte model (blij lid, moe lid, pijnklacht, rouw, lid dat wil stoppen, lid dat veel te hard wil), zoals bij de klantenservice-assistent. Dirk leest ze door en zegt: klinkt dit als jou?

De toon staat op één plek in de code (net als de kaders van de huidige coach), zodat Dirk hem kan bijstellen.

## 4. Zo werkt een sessie (de code stuurt, de AI praat)

- **Code bepaalt:** welke oefeningen (alleen uit `lib/oefeningen.ts`), volgorde, aantallen, rusttijd, wanneer te stoppen. Daardoor kan de coach geen oefening verzinnen.
- **AI praat eromheen:** begroeting, aanmoediging, korte praatjes, afsluiting. Alleen op een paar vaste momenten per sessie. Dat houdt de tokens laag.
- **Video's:** de 12 echte oefenvideo's worden afgespeeld. Er wordt niets live gegenereerd.
- **Camera (later):** het apparaat van het lid telt herhalingen en ziet of iemand er nog is. De beelden blijven op het apparaat. Dit is een hulpmiddel om te tellen, geen oordeel over de houding.

## 5. Bijhouden en geheugen

- **Wat er bijgehouden wordt:** per sessie datum, geplande en echte tijd, welke oefeningen, aantal gedaan, hoe het ging (1 tot 5), en of er pijn was.
- **Geheugen van de coach:** een korte lijst persoonlijke notities (max. ongeveer 10 regels, klein gehouden voor de kosten). Het lid ziet ze in zijn profiel en kan ze wijzigen of wissen.
- **Voortgang:** bestaat al (`voortgang`). De sessies worden daaraan gekoppeld, zodat "Jouw voortgang" en "laatst gedaan" blijven kloppen.
- **Geen volledige gespreksopname.** Alleen wat nodig is. Minder bewaren is veiliger en goedkoper.

## 6. Fasen

| Fase | Wat | Waarom |
|---|---|---|
| 0 | Afspraken, herinneringen en een begeleide sessie in de app, met tekst en de bestaande video's, zonder camera. Tien testers. | Goedkoopste test. Meet kosten, volhouden en of de toon werkt. |
| 1 | Coach praat (stem) en het lid kan terugpraten of tikken. | Voelt als "opbellen". Meer kosten, dus eerst fase 0 meten. |
| 2 | Camera: herhalingen tellen op het apparaat. | "In beeld" samen oefenen, privacyvriendelijk. |
| 3 | Echt telefonisch bellen of een levende avatar. | Duur en pas als fase 0-2 hebben bewezen dat mensen betalen. |

## 7. Wie betaalt?

### a. Het lid zelf
Maandabonnement of een bedrag per periode. De prijs bepalen we pas na de proef (sectie 9). Betalen kan pas als Mollie draait; voor de proef is dat niet nodig.

### b. De zorgverzekeraar (Dirks idee, 30 okt)
Dit kan een sterke case zijn. Preventie bij 55-plussers, valpreventie en volhouden van beweging zijn juist waar een verzekeraar naar kijkt. En als de verzekeraar betaalt, kan het lid de coach gratis of met korting krijgen: het kostenprobleem voor jou valt weg en "gratis voor gebruikers" blijft overeind.

Drie manieren, van klein naar groot:
1. **Sponsorpakket** (staat al in het partnerplan, €250 tot €1.000 per maand): logo en vermelding. Geen gegevens.
2. **Collectief aanbod:** de verzekeraar biedt de coach aan zijn leden aan (korting of gratis, bijvoorbeeld via een aanvullend pakket). De verzekeraar betaalt Blijf Sterk per deelnemer of per periode.
3. **Pilot met bewijs:** een regionale verzekeraar, 50 tot 100 leden, drie maanden. Dit is de stap die een grote overeenkomst mogelijk maakt.

Wat een verzekeraar waarschijnlijk wil zien (dat moet Dirk bij een eerste gesprek natrekken, ik weet niet wat zij nu eisen):
- Deelname en volhouden: hoeveel sessies per week, hoeveel mensen nog actief na 12 weken.
- Een vragenlijst aan het begin en na drie maanden (zelfgerapporteerde kracht, vertrouwen om te bewegen, angst om te vallen). Een gangbare, erkende lijst kiezen we samen met de fysiotherapeut.
- Tevredenheid van de leden.

**Daarom meten we vanaf fase 0 netjes:** de logboeken van sectie 5 zijn precies dat bewijs.

**Harde regels voor de privacy van leden:**
- De verzekeraar krijgt **alleen totalen en gemiddelden**, nooit gegevens per persoon. Geen cijfers bij groepen kleiner dan ongeveer 10, zodat niemand herkend kan worden.
- Alleen met uitdrukkelijke, vooraf gegeven toestemming van het lid dat zijn deelname via de verzekeraar loopt.
- Vastleggen in de overeenkomst: de gegevens mogen **niet** gebruikt worden voor premie, acceptatie of beoordeling van een lid. Jurist erbij.
- Het lid ziet altijd wat gedeeld wordt.

**Risico's:**
- We hebben nu nog geen gebruikers en dus geen bewijs. Het partnerplan zegt ook: sponsors pas bij minimaal 200 actieve gebruikers.
- Verkooptrajecten bij verzekeraars duren lang.
- Claims als "voorkomt vallen" mogen we niet maken. Pas na controle door een fysiotherapeut, en zonder medische beloften.
- De wensen van één grote betaler kunnen het product gaan sturen. Dirk houdt de regie over toon en veiligheid.

### c. Gemeenten
Zelfde redenering, vaak via een budget voor valpreventie of gezond ouder worden. Later.

### d. Kinderen die de coach cadeau geven (Dirk, 30 okt)
Veel kinderen willen dat hun ouders zelfstandig en sterk blijven, maar weten niet hoe ze dat bespreekbaar maken. Een cadeau lost dat op: "Een persoonlijke coach die jou helpt sterk te blijven." Het partnerplan noemt de kinderen van 45 tot 60 al als doelgroep. Zij zijn ook degenen die willen en kunnen betalen.

Hoe het zou werken:
- Het kind koopt een cadeau van 3, 6 of 12 maanden en schrijft een persoonlijke boodschap.
- De ouder krijgt een kaart of mail met een code en maakt zelf het account aan (de helper-stand op `/login` bestaat al). De ouder kiest zelf of hij het aanneemt.
- Betalen gaat via Mollie. Dat is nog niet actief, dus dit kan pas later live.

Regels, in lijn met wat Dirk eerder besloot:
- **Het account blijft van de ouder.** Het kind ziet geen voortgang, geen gesprekken en geen gezondheidsgegevens.
- **Geen drukmiddel.** Het kind kiest geen oefeningen of doelen. Een wekelijks vriendelijk mailtje naar het kind kan alleen als de ouder dat zelf aanzet (staat al als wens in status.md).
- **Toon van het cadeau:** "samen sterk blijven", nooit "je bent te afhankelijk". Dit moet in de tekst van de kaart en de verkooppagina zitten, anders voelt het als een verwijt.
- **Juridisch:** herroepingsrecht, geldigheid van een cadeaubon en wat er gebeurt als de ouder het niet gebruikt, laat de jurist bekijken.
- **Bouw (alleen bij ja):** tabel `cadeaus` (code, duur, status, boodschap) met RLS en expliciete GRANTs, een koop- en een inwisselpagina, en de inwisselcode bij het account.
- Past goed bij de doorstroom naar een groepje: het kind kan later ook de eerste maanden bij een trainer cadeau doen.

## 8. Toets aan het verdienmodel

Vaste regel: geeft dit iets weg waar normaal voor betaald wordt?

- Een persoonlijke coach is wat trainers verkopen. Daarom: de coach is **aanvullend**, voor de dagen tussen de trainerafspraken, en leidt op tot een echte trainer ("klaar voor een trainer in de buurt?"). Hij vervangt geen trainer en neemt hun klanten niet over.
- Oefeningen komen alleen uit de gecontroleerde bibliotheek en blijven achter login.
- De coach krijgt nooit contactgegevens van partners. Contact met een trainer loopt, zoals nu, via de match en de chat na betaling.
- De coach is dus een tweede inkomstenbron (lid of verzekeraar) naast de partnerbijdragen, en een kanaal naar de partners.

## 9. Kosten en proef

- **Kosten per sessie** zijn nu onbekend. Ik noem geen bedragen zonder ze eerst na te zoeken bij de aanbieders. Tekst is het goedkoopst, stem duurder, een avatar met beeld veel duurder.
- **Proef:** tien testers, vier weken, fase 0 (eventueel met stem). Wat we meten: kosten per sessie, hoe vaak mensen komen, hoeveel na vier weken nog meedoen, en of de toon werkt.
- **Dan pas de prijs:** kostprijs per lid per maand plus een marge, en bepalen of een verzekeraarspilot haalbaar is.
- **Noodremmen** zoals bij de huidige coach: limiet per lid per dag en maand, een dagelijkse noodrem voor alles, en bij storing in het tellen niet onbeperkt doorlopen.
- Gespreksmodellen en prijzen: bij het bouwen eerst controleren welke modellen en spraakdiensten er zijn (de lijst verandert snel).

## 10. Veiligheid, privacy en eerlijkheid

- **Duidelijk dat het een AI is.** Het lid weet dat hij met een AI-coach praat ("Dirk, je virtuele coach"). Een nagebootste stem van Dirk alleen met zijn uitdrukkelijke keuze.
- **Gezondheidsgegevens** (pijn, klachten) zijn bijzondere persoonsgegevens. Uitdrukkelijke toestemming vooraf, minimaal bewaren, inzien en verwijderen door het lid. Spraak- en beelddienst moeten in de EU werken en een verwerkersovereenkomst hebben. Jurist kijkt mee (staat al op de lijst).
- **Veiligheid:** de bestaande risicocheck uit de intake blijft voorwaarde. Pijn of onwel zijn → stoppen, rustig doorverwijzen, bij een noodgeval 112. De coach stelt geen diagnose en geeft geen medisch advies.
- **Fysiotherapeut:** de oefeningen zijn nog niet gecontroleerd. Dat moet voor deze functie, zeker voor een verzekeraar.
- **Camera:** beelden verlaten het apparaat niet en worden niet bewaard.

## 11. Beslissingen voor Dirk

1. Beginnen met fase 0 (tien testers, zonder camera, zonder echte betaling)?
2. Welke toon-stand als standaard: zacht, gewoon of stevig?
3. Mag de coach een stem krijgen, en zo ja: een standaard warme stem, of een nagebootste stem van jou?
4. Welke tien testers? (Mensen die je kent in de doelgroep werken het best, met hun toestemming.)
5. Een eerste verkennend gesprek met één regionale zorgverzekeraar, of eerst de proef afwachten? Mijn advies: eerst de proef, wel alvast vragen wat zij als bewijs willen zien.
6. Wil je dat ik vooraf een fysiotherapeut laat kijken naar de eerste drie oefeningen die in de proef zitten?
7. Basis zonder gewichten: ook zonder band en flesjes? (Ik ga hier van uit.) Welke nieuwe oefeningen voor armen, schouders en rug komen erbij, en wie controleert ze?
8. Wat valt je tegen aan de huidige video's? (Er nep uitzien, beweging niet goed genoeg, te kort of één kant, past niet bij de coach.) En maak je de nieuwe zelf in Canva/Runway?
10. Cadeau van kinderen (sectie 7d): meenemen in fase 0 (alleen de kaart en de toon uitwerken), of pas bouwen als Mollie draait?
9. Doorstroom naar groepjes: betaalt de trainer dan €35 per lid (zoals nu per klant), of een ander bedrag voor een groep?

## 12. Wat er gebouwd moet worden (fase 0)

Alleen bij een ja van Dirk.

- Tabellen: `coach_afspraken` (ritme en tijden per lid), `coach_sessies` (wat er gedaan is), `coach_geheugen` (korte persoonlijke notities). Alle drie met RLS en **expliciete GRANTs voor anon/authenticated/service_role in dezelfde migratie** (verplicht vanaf 30 okt 2026).
- Pagina `/coach-sessie` met de begeleide sessie, grote knoppen, grote letters.
- Dagelijkse of per-uur cron voor herinneringen (naast `/api/cron/inactief`, via de bestaande pushmeldingen en later e-mail; `push_subscriptions` moet dan wel bestaan).
- Server-route voor de coach-praatjes met dezelfde toegangscontrole en limiet als `/api/coach` (`lib/coach-toegang.ts`).
- Toonbestand en de testgesprekken uit sectie 3.
- Hoofdregel van de huidige coach blijft: platte tekst, geen verzonnen oefeningen, chatberichten gefilterd tot `role`/`content`.

## 13. Nog niet bekend

- Wat een sessie echt kost.
- Of mensen van 55+ liever bij een afspraak komen of zelf starten.
- Wat een zorgverzekeraar als bewijs wil, en of zij zo'n collectief aanbod willen kopen.
- Of "opbellen" voor het lid een telefoongesprek moet zijn of een beeldscherm met een knop.
