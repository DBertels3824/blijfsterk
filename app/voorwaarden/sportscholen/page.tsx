import JuridischePagina, { Inhoudsopgave, alinea, kop2, lijst, lijstItem } from '@/app/components/JuridischePagina';
import VoorwaardenSlot, { SLOT_HOOFDSTUKKEN } from '@/app/components/VoorwaardenSlot';
import { ONDERNEMING, TARIEVEN } from '@/lib/juridisch';

export const metadata = {
  title: 'Voorwaarden voor sportscholen — Blijf Sterk',
  description: 'De afspraken tussen Blijf Sterk en sportscholen en vergelijkbare locaties.',
};

const HOOFDSTUKKEN = [
  { id: 'wie', titel: 'Wie wij zijn en voor wie dit is' },
  { id: 'toelating', titel: 'Toelating en toetsing' },
  { id: 'locatie', titel: 'Locatie en veiligheid' },
  { id: 'medewerkers', titel: 'Medewerkers en trainers op locatie' },
  { id: 'wat', titel: 'Wat Blijf Sterk voor je doet' },
  { id: 'kosten', titel: 'Wat het kost' },
  { id: 'contact', titel: 'Contact via het platform' },
  { id: 'beschermen', titel: 'Gebruikers beschermen' },
  { id: 'beoordelingen', titel: 'Beoordelingen, pauzeren en verwijderen' },
  { id: 'betalingen', titel: 'Betalingen' },
  { id: 'aansprakelijkheid', titel: 'Aansprakelijkheid en vrijwaring' },
  { id: 'gegevens', titel: 'Gegevens en geheimhouding' },
  { id: 'sponsoring', titel: 'Sponsoring en andere samenwerking' },
  { id: 'einde', titel: 'Opzeggen en beëindigen' },
  ...SLOT_HOOFDSTUKKEN,
];

export default function VoorwaardenSportscholen() {
  const bedrijfsregels = [
    ONDERNEMING.rechtsvorm ? `${ONDERNEMING.naam} (${ONDERNEMING.rechtsvorm})` : ONDERNEMING.naam,
    ONDERNEMING.kvk ? `KvK-nummer ${ONDERNEMING.kvk}` : '',
    ONDERNEMING.adres,
    `E-mail: ${ONDERNEMING.email}`,
  ].filter(Boolean);

  return (
    <JuridischePagina
      label="Voorwaarden voor sportscholen"
      titel="Afspraken voor sportscholen"
      intro="Dit zijn de afspraken voor sportscholen en vergelijkbare locaties die 55-plussers willen verwelkomen. Aansluiten is gratis. Je betaalt pas als Blijf Sterk je een nieuwe klant oplevert."
    >
      <Inhoudsopgave items={HOOFDSTUKKEN} />

      <h2 id="wie" style={kop2}>1. Wie wij zijn en voor wie dit is</h2>
      <p style={alinea}>Blijf Sterk is een platform voor mensen van 55 jaar en ouder die thuis sterk, beweeglijk en zelfstandig willen blijven. Het platform wordt aangeboden door:</p>
      <ul style={lijst}>
        {bedrijfsregels.map((r) => <li key={r} style={lijstItem}>{r}</li>)}
      </ul>
      <p style={alinea}>In deze voorwaarden noemen we onszelf &ldquo;Blijf Sterk&rdquo; of &ldquo;wij&rdquo;. Jullie zijn de &ldquo;sportschool&rdquo; en een &ldquo;partner&rdquo;. Een gebruiker is iemand met een gewoon account die oefent met Blijf Sterk.</p>
      <p style={alinea}>Deze voorwaarden gelden voor sportscholen en vergelijkbare locaties, zoals bewegingscentra en studio&rsquo;s. Zijn jullie een individuele trainer? Dan gelden de voorwaarden voor trainers. Zijn jullie beide, dan gelden beide.</p>
      <p style={alinea}>Door je aan te melden en het vinkje bij de aanmelding aan te zetten, ga je akkoord met deze voorwaarden en met onze privacyverklaring. Je verklaart dat je bevoegd bent om namens de sportschool afspraken te maken.</p>

      <h2 id="toelating" style={kop2}>2. Toelating en toetsing</h2>
      <ul style={lijst}>
        <li style={lijstItem}>De sportschool meldt zich aan met een geldig KvK-nummer en levert de gevraagde documenten aan: een Verklaring Omtrent het Gedrag (niet ouder dan twee jaar), het polisblad van de aansprakelijkheidsverzekering en een EHBO-, BHV- of reanimatiecertificaat.</li>
        <li style={lijstItem}>Jullie beantwoorden de vragen over toegankelijkheid, aangepaste begeleiding, aanwezigheid van EHBO of BHV, rustige lessen en verzekering. Alles wat jullie invullen en aanleveren is juist en volledig.</li>
        <li style={lijstItem}>Verandert er iets, bijvoorbeeld doordat de verzekering of een certificaat verloopt, de locatie verhuist of er geen EHBO-medewerker meer is, dan laten jullie dat ons meteen weten.</li>
        <li style={lijstItem}>Wij controleren de aanmelding. Als alles klopt, worden jullie automatisch toegelaten. Zo niet, dan beoordeelt een medewerker van Blijf Sterk de aanmelding. Wij beslissen of we een sportschool toelaten en mogen een aanmelding weigeren. We leggen dan uit waarom.</li>
        <li style={lijstItem}>Jullie krijgen een partnernummer. Dat staat op de aanmelding en op elke betaling.</li>
        <li style={lijstItem}>Toelating betekent niet dat Blijf Sterk instaat voor de kwaliteit van de sportschool. Het is een controle op de documenten, geen keurmerk.</li>
      </ul>

      <h2 id="locatie" style={kop2}>3. Locatie en veiligheid</h2>
      <ul style={lijst}>
        <li style={lijstItem}>De locatie is goed toegankelijk voor 55-plussers: gelijkvloers of met lift, zonder hoge drempels, met een toegankelijk toilet.</li>
        <li style={lijstItem}>Tijdens openingstijden is er iemand aanwezig met een geldig EHBO- of BHV-diploma, en er is een AED of een duidelijke afspraak voor de snelste hulp.</li>
        <li style={lijstItem}>De apparatuur wordt onderhouden en is veilig te gebruiken. Nieuwe leden krijgen een uitleg of intake voordat ze zelfstandig trainen.</li>
        <li style={lijstItem}>Jullie zijn verantwoordelijk voor de veiligheid van de locatie en de apparatuur.</li>
      </ul>

      <h2 id="medewerkers" style={kop2}>4. Medewerkers en trainers op locatie</h2>
      <ul style={lijst}>
        <li style={lijstItem}>Jullie zijn verantwoordelijk voor jullie medewerkers en voor trainers die op locatie werken, ook als zij zelfstandig zijn. Zij werken met dezelfde zorg voor gebruikers als in de voorwaarden voor trainers staat.</li>
        <li style={lijstItem}>Alleen personen met een geldige VOG werken met leden die via Blijf Sterk komen.</li>
        <li style={lijstItem}>Werkt een trainer op jullie locatie die zelf bij Blijf Sterk is aangesloten, dan loopt dat via zijn eigen partneraccount en de voorwaarden voor trainers.</li>
      </ul>

      <h2 id="wat" style={kop2}>5. Wat Blijf Sterk voor je doet</h2>
      <ul style={lijst}>
        <li style={lijstItem}>We tonen jullie sportschool aan gebruikers in de buurt: naam, plaats, foto en beoordelingen. Het telefoonnummer en de website zien gebruikers pas in het gesprek.</li>
        <li style={lijstItem}>Kiest een gebruiker voor jullie, dan openen wij een gesprek op het platform. De virtuele coach stelt jullie aan elkaar voor en vraagt jullie een kennismaking of proefles voor te stellen.</li>
        <li style={lijstItem}>Jullie krijgen een eigen dashboard met jullie matches en betaalstatus.</li>
        <li style={lijstItem}>Wij garanderen geen aantal gebruikers, leden of omzet.</li>
      </ul>

      <h2 id="kosten" style={kop2}>6. Wat het kost</h2>
      <ul style={lijst}>
        <li style={lijstItem}><strong>Gratis vermelding.</strong> Aansluiten en op het platform staan kost niets.</li>
        <li style={lijstItem}><strong>Matchvergoeding.</strong> €{TARIEVEN.matchvergoeding} per nieuwe klant die via Blijf Sterk voor jullie sportschool kiest. Partners van het eerste uur betalen voor hun eerste {TARIEVEN.gratisMatchesFoundingPartner} matches niets.</li>
        <li style={lijstItem}>De matchvergoeding geldt per gebruiker die voor jullie kiest. Ook als die zich later niet inschrijft, blijft de vergoeding verschuldigd. Daar staat tegenover dat jullie het gesprek en het contact met die gebruiker krijgen.</li>
        <li style={lijstItem}>Later kunnen we extra diensten of een abonnement aanbieden. Dat kondigen we vooraf aan en jullie kiezen zelf of jullie meedoen.</li>
        <li style={lijstItem}>Bedragen zijn exclusief btw, tenzij anders vermeld. De actuele tarieven staan in het dashboard. Wijzigen we een tarief, dan laten we dat minimaal dertig dagen vooraf weten.</li>
        <li style={lijstItem}>Wat een lid aan de sportschool betaalt voor zijn lidmaatschap, bepaalt de sportschool zelf. Daar krijgt Blijf Sterk geen deel van.</li>
      </ul>

      <h2 id="contact" style={kop2}>7. Contact via het platform</h2>
      <ul style={lijst}>
        <li style={lijstItem}>Het eerste contact met een gebruiker loopt via de chat op het platform. Die gaat open zodra de gebruiker voor jullie heeft gekozen en de matchvergoeding is betaald, of als het een gratis match is.</li>
        <li style={lijstItem}>Telefoonnummers en andere contactgegevens mogen jullie daarna uitwisselen als de gebruiker dat zelf wil.</li>
        <li style={lijstItem}>Jullie werven geen gebruikers van Blijf Sterk buiten het platform om, bijvoorbeeld door hen te benaderen via een ander kanaal voordat het gesprek via Blijf Sterk is geopend. Doen jullie dat toch, dan mogen wij de matchvergoeding alsnog in rekening brengen, de vermelding verwijderen en de samenwerking beëindigen.</li>
        <li style={lijstItem}>Reageer binnen een redelijke tijd op berichten, in principe binnen twee werkdagen.</li>
      </ul>

      <h2 id="beschermen" style={kop2}>8. Gebruikers beschermen</h2>
      <ul style={lijst}>
        <li style={lijstItem}>Jullie werken met een kwetsbare doelgroep. Jullie houden rekening met gezondheidsbeperkingen en verwijzen door naar een huisarts of fysiotherapeut als dat nodig is.</li>
        <li style={lijstItem}>Jullie behandelen gebruikers respectvol, eerlijk en zonder druk. Er is geen verkooppraktijk die uitgaat van de onzekerheid van een lid, en geen lastige opzegprocedure.</li>
        <li style={lijstItem}>Jullie leggen vooraf duidelijk uit wat een lidmaatschap kost, hoe lang het duurt en hoe je opzegt. Een proefles of kennismaking is vrijblijvend.</li>
        <li style={lijstItem}>Jullie melden ons ernstige incidenten met een gebruiker of lid dat via Blijf Sterk komt, zoals een ongeval of een ernstige klacht, binnen twee werkdagen.</li>
      </ul>

      <h2 id="beoordelingen" style={kop2}>9. Beoordelingen, pauzeren en verwijderen</h2>
      <ul style={lijst}>
        <li style={lijstItem}>Gebruikers kunnen de sportschool beoordelen. Jullie laten geen beoordelingen schrijven of kopen en zetten gebruikers er niet toe aan.</li>
        <li style={lijstItem}>Bij herhaalde slechte beoordelingen of klachten mogen wij de vermelding pauzeren en met jullie in gesprek gaan. Zo nodig verwijderen wij jullie.</li>
        <li style={lijstItem}>Wij mogen jullie ook pauzeren of verwijderen als documenten verlopen zijn, als deze voorwaarden niet worden nageleefd, als de locatie niet meer aan de eisen voldoet of als er een ernstig vermoeden is dat jullie gebruikers schaden. We leggen dan uit waarom. Bij een ernstig vermoeden mogen we eerst pauzeren en daarna uitleggen.</li>
      </ul>

      <h2 id="betalingen" style={kop2}>10. Betalingen</h2>
      <ul style={lijst}>
        <li style={lijstItem}>Betalingen lopen via onze betaaldienst Mollie, bijvoorbeeld met iDEAL. Jullie betalen de matchvergoeding vooraf in het dashboard.</li>
        <li style={lijstItem}>Een betaalde matchvergoeding geeft toegang tot het gesprek met die ene gebruiker. We betalen de vergoeding niet terug, ook niet als de gebruiker uiteindelijk niet met jullie verder gaat. Komt het gesprek door een fout van Blijf Sterk niet tot stand, dan betalen we wel terug.</li>
        <li style={lijstItem}>Wij sturen een factuur of betaalbewijs voor elke betaling.</li>
      </ul>

      <h2 id="aansprakelijkheid" style={kop2}>11. Aansprakelijkheid en vrijwaring</h2>
      <ul style={lijst}>
        <li style={lijstItem}>Blijf Sterk brengt jullie en de gebruiker bij elkaar, maar is geen partij in het lidmaatschap en geen partij in de begeleiding. Jullie zijn verantwoordelijk voor de sportschool, de apparatuur en de begeleiding op locatie, en voor schade die daardoor ontstaat. Daarvoor hebben jullie een verzekering.</li>
        <li style={lijstItem}>Blijf Sterk is niet aansprakelijk voor schade die jullie lijden doordat het platform niet werkt, doordat er geen gebruikers kiezen of door gegevens van gebruikers die onjuist blijken. Dat geldt niet bij opzet of grove nalatigheid van Blijf Sterk.</li>
        <li style={lijstItem}>Is Blijf Sterk toch aansprakelijk, dan is dat beperkt tot het bedrag dat jullie in de twaalf maanden daarvoor aan ons hebben betaald.</li>
        <li style={lijstItem}>Maakt een gebruiker, een lid of een ander aanspraak op Blijf Sterk voor schade die voortkomt uit de sportschool, de apparatuur of de begeleiding, dan vrijwaren jullie ons daarvoor, tenzij de schade komt door opzet of grove nalatigheid van Blijf Sterk.</li>
      </ul>

      <h2 id="gegevens" style={kop2}>12. Gegevens en geheimhouding</h2>
      <ul style={lijst}>
        <li style={lijstItem}>Gegevens van gebruikers die jullie via Blijf Sterk krijgen, gebruiken jullie alleen voor het contact en de begeleiding van die gebruiker. Niet voor reclame, niet voor de nieuwsbrief van de sportschool zonder toestemming en jullie geven ze niet door aan anderen.</li>
        <li style={lijstItem}>Wat een gebruiker jullie vertelt over zijn gezondheid is vertrouwelijk. Jullie bewaren het veilig en niet langer dan nodig.</li>
        <li style={lijstItem}>Schrijft een gebruiker zich in als lid, dan zijn jullie vanaf dat moment zelf verantwoordelijk voor de ledengegevens volgens de privacywet (AVG).</li>
        <li style={lijstItem}>De gesprekken op het platform worden bewaard. Wij lezen niet routinematig mee, maar kunnen een gesprek inzien bij een klacht, een vermoeden van misbruik of als de wet dat vraagt.</li>
        <li style={lijstItem}>Van jullie bewaren wij de gegevens en documenten die in de privacyverklaring staan.</li>
      </ul>

      <h2 id="sponsoring" style={kop2}>13. Sponsoring en andere samenwerking</h2>
      <p style={alinea}>Sponsoring, advertenties en andere samenwerking, bijvoorbeeld een vermelding op de homepage of een gezamenlijke actie, spreken we apart af in een eigen overeenkomst. Die voorwaarden gaan voor deze voorwaarden als ze elkaar tegenspreken.</p>

      <h2 id="einde" style={kop2}>14. Opzeggen en beëindigen</h2>
      <ul style={lijst}>
        <li style={lijstItem}>Jullie kunnen de samenwerking op elk moment opzeggen met een e-mail. Lopende gesprekken maken jullie netjes af.</li>
        <li style={lijstItem}>Wij mogen de samenwerking opzeggen met een opzegtermijn van dertig dagen. Bij misbruik, bij verlopen documenten of bij een ernstig vermoeden dat jullie gebruikers schaden, mogen wij direct stoppen.</li>
        <li style={lijstItem}>Bij het einde van de samenwerking verwijderen wij de vermelding van het platform. De afspraken over het contact met gebruikers, over geheimhouding en over aansprakelijkheid blijven gelden.</li>
      </ul>

      <VoorwaardenSlot start={15} partner />
    </JuridischePagina>
  );
}
