import JuridischePagina, { Inhoudsopgave, alinea, kop2, lijst, lijstItem } from '@/app/components/JuridischePagina';
import VoorwaardenSlot, { SLOT_HOOFDSTUKKEN } from '@/app/components/VoorwaardenSlot';
import { ONDERNEMING, TARIEVEN } from '@/lib/juridisch';

export const metadata = {
  title: 'Voorwaarden voor trainers — Blijf Sterk',
  description: 'De afspraken tussen Blijf Sterk en trainers, fysiotherapeuten, voedingsdeskundigen en andere partners.',
};

const HOOFDSTUKKEN = [
  { id: 'wie', titel: 'Wie wij zijn en voor wie dit is' },
  { id: 'toelating', titel: 'Toelating en toetsing' },
  { id: 'zelfstandig', titel: 'Je blijft zelfstandig' },
  { id: 'wat', titel: 'Wat Blijf Sterk voor je doet' },
  { id: 'kosten', titel: 'Wat het kost' },
  { id: 'contact', titel: 'Contact via het platform' },
  { id: 'beschermen', titel: 'Gebruikers beschermen' },
  { id: 'beoordelingen', titel: 'Beoordelingen, pauzeren en verwijderen' },
  { id: 'betalingen', titel: 'Betalingen' },
  { id: 'aansprakelijkheid', titel: 'Aansprakelijkheid en vrijwaring' },
  { id: 'gegevens', titel: 'Gegevens en geheimhouding' },
  { id: 'einde', titel: 'Opzeggen en beëindigen' },
  ...SLOT_HOOFDSTUKKEN,
];

export default function VoorwaardenTrainers() {
  const bedrijfsregels = [
    ONDERNEMING.rechtsvorm ? `${ONDERNEMING.naam} (${ONDERNEMING.rechtsvorm})` : ONDERNEMING.naam,
    ONDERNEMING.kvk ? `KvK-nummer ${ONDERNEMING.kvk}` : '',
    ONDERNEMING.adres,
    `E-mail: ${ONDERNEMING.email}`,
  ].filter(Boolean);

  return (
    <JuridischePagina
      label="Voorwaarden voor trainers"
      titel="Afspraken voor trainers en andere partners"
      intro="Dit zijn de afspraken voor trainers, fysiotherapeuten, voedingsdeskundigen en andere professionals die gebruikers van Blijf Sterk willen begeleiden. Aansluiten is gratis. Je betaalt pas als Blijf Sterk je een nieuwe klant oplevert."
    >
      <Inhoudsopgave items={HOOFDSTUKKEN} />

      <h2 id="wie" style={kop2}>1. Wie wij zijn en voor wie dit is</h2>
      <p style={alinea}>Blijf Sterk is een platform voor mensen van 55 jaar en ouder die thuis sterk, beweeglijk en zelfstandig willen blijven. Het platform wordt aangeboden door:</p>
      <ul style={lijst}>
        {bedrijfsregels.map((r) => <li key={r} style={lijstItem}>{r}</li>)}
      </ul>
      <p style={alinea}>In deze voorwaarden noemen we onszelf &ldquo;Blijf Sterk&rdquo; of &ldquo;wij&rdquo;. Jij bent de &ldquo;partner&rdquo;. Een gebruiker is iemand met een gewoon account die oefent met Blijf Sterk.</p>
      <p style={alinea}>Deze voorwaarden gelden voor trainers en andere individuele professionals. Heb je een sportschool? Dan gelden de voorwaarden voor sportscholen. Doe je beide, dan gelden beide.</p>
      <p style={alinea}>Door je aan te melden en het vinkje bij de aanmelding aan te zetten, ga je akkoord met deze voorwaarden en met onze privacyverklaring. Je verklaart dat je bevoegd bent om de aanmelding te doen.</p>

      <h2 id="toelating" style={kop2}>2. Toelating en toetsing</h2>
      <ul style={lijst}>
        <li style={lijstItem}>Je meldt je aan met een geldig KvK-nummer en levert de gevraagde documenten aan: een Verklaring Omtrent het Gedrag (niet ouder dan twee jaar), het polisblad van je beroeps- of bedrijfsaansprakelijkheidsverzekering, een EHBO-, BHV- of reanimatiecertificaat, en een diploma of een registratienummer bij NL Actief of EREPS.</li>
        <li style={lijstItem}>Alles wat je invult en aanlevert is juist en volledig. Verandert er iets, bijvoorbeeld doordat je verzekering of certificaat verloopt, dan laat je dat ons meteen weten en lever je een nieuw document aan.</li>
        <li style={lijstItem}>Wij controleren je aanmelding. Als alles klopt, word je automatisch toegelaten. Zo niet, dan beoordeelt een medewerker van Blijf Sterk je aanmelding. Een registratienummer controleren wij steekproefsgewijs.</li>
        <li style={lijstItem}>Wij beslissen of we je toelaten. We mogen een aanmelding weigeren als de documenten niet kloppen, als er een veiligheidsvraag met nee is beantwoord of als de samenwerking niet past bij Blijf Sterk. We leggen dan uit waarom.</li>
        <li style={lijstItem}>Je krijgt een partnernummer. Dat staat op je aanmelding en op elke betaling.</li>
        <li style={lijstItem}>Toelating betekent niet dat Blijf Sterk instaat voor jouw kwaliteit. Het is een controle op de documenten, geen keurmerk voor jouw begeleiding.</li>
      </ul>

      <h2 id="zelfstandig" style={kop2}>3. Je blijft zelfstandig</h2>
      <p style={alinea}>Je werkt als zelfstandig ondernemer. Er is geen arbeidsovereenkomst en geen exclusiviteit: je mag ook voor anderen werken. Je bent zelf verantwoordelijk voor de kwaliteit en veiligheid van je begeleiding, voor je verzekeringen, voor je belastingen en voor je administratie. Jij bepaalt je eigen tarieven voor de gebruikers die je begeleidt.</p>

      <h2 id="wat" style={kop2}>4. Wat Blijf Sterk voor je doet</h2>
      <ul style={lijst}>
        <li style={lijstItem}>We tonen je profiel aan gebruikers in jouw buurt: naam, foto, plaats en beoordelingen. Je achternaam, bedrijfsnaam, website en telefoonnummer zien gebruikers pas in het gesprek.</li>
        <li style={lijstItem}>Kiest een gebruiker voor jou, dan openen wij een gesprek op het platform. De virtuele coach stelt jullie aan elkaar voor en vraagt je om een kennismaking voor te stellen.</li>
        <li style={lijstItem}>Je krijgt een eigen dashboard met je matches, openstaande vergoedingen en betaalstatus.</li>
        <li style={lijstItem}>Wij garanderen geen aantal gebruikers, matches of omzet.</li>
      </ul>

      <h2 id="kosten" style={kop2}>5. Wat het kost</h2>
      <ul style={lijst}>
        <li style={lijstItem}><strong>Gratis vermelding.</strong> Aansluiten en op het platform staan kost niets.</li>
        <li style={lijstItem}><strong>Matchvergoeding.</strong> €{TARIEVEN.matchvergoeding} per nieuwe klant die via Blijf Sterk voor jou kiest. Partners van het eerste uur betalen voor hun eerste {TARIEVEN.gratisMatchesFoundingPartner} matches niets.</li>
        <li style={lijstItem}><strong>Partnerabonnement.</strong> Later bieden we mogelijk een abonnement van €{TARIEVEN.partnerabonnementPerMaand} per maand met extra zichtbaarheid. Dat kondigen we vooraf aan en je kiest zelf of je meedoet.</li>
        <li style={lijstItem}>Bedragen zijn exclusief btw, tenzij anders vermeld. De actuele tarieven staan in je dashboard. Wijzigen we een tarief, dan laten we dat minimaal dertig dagen vooraf weten.</li>
        <li style={lijstItem}>Wat een gebruiker aan jou betaalt voor je begeleiding, bepaal je zelf. Daar krijgt Blijf Sterk geen deel van.</li>
      </ul>

      <h2 id="contact" style={kop2}>6. Contact via het platform</h2>
      <ul style={lijst}>
        <li style={lijstItem}>Het eerste contact met een gebruiker loopt via de chat op het platform. Die gaat open zodra de gebruiker voor jou heeft gekozen en de matchvergoeding is betaald, of als het een gratis match is.</li>
        <li style={lijstItem}>Telefoonnummers en andere contactgegevens mogen jullie daarna uitwisselen als de gebruiker dat zelf wil.</li>
        <li style={lijstItem}>Je werft geen gebruikers van Blijf Sterk buiten het platform om, bijvoorbeeld door hen te benaderen via een ander kanaal voordat het gesprek via Blijf Sterk is geopend. Doe je dat toch, dan mogen wij de matchvergoeding alsnog in rekening brengen, je vermelding verwijderen en de samenwerking beëindigen.</li>
        <li style={lijstItem}>Reageer binnen een redelijke tijd op berichten, in principe binnen twee werkdagen. Een gebruiker die niets hoort, haakt af.</li>
      </ul>

      <h2 id="beschermen" style={kop2}>7. Gebruikers beschermen</h2>
      <ul style={lijst}>
        <li style={lijstItem}>Je werkt met een kwetsbare doelgroep. Je houdt rekening met gezondheidsbeperkingen en verwijst door naar een huisarts of fysiotherapeut als dat nodig is. Je werkt niet buiten je opleiding en ervaring.</li>
        <li style={lijstItem}>Je behandelt gebruikers respectvol, eerlijk en zonder druk. Je verkoopt geen producten of diensten aan gebruikers die zij niet nodig hebben, en je misbruikt het vertrouwen van een gebruiker niet, ook niet financieel.</li>
        <li style={lijstItem}>Je meldt ons ernstige incidenten met een gebruiker die via Blijf Sterk bij je komt, zoals een ongeval of een ernstige klacht, binnen twee werkdagen.</li>
        <li style={lijstItem}>Je houdt je aan de regels van je beroepsgroep en aan de wet.</li>
      </ul>

      <h2 id="beoordelingen" style={kop2}>8. Beoordelingen, pauzeren en verwijderen</h2>
      <ul style={lijst}>
        <li style={lijstItem}>Gebruikers kunnen je beoordelen. Je mag een beoordeling niet laten schrijven of kopen en je mag een gebruiker er niet toe aanzetten.</li>
        <li style={lijstItem}>Bij herhaalde slechte beoordelingen of klachten mogen wij je profiel pauzeren en met je in gesprek gaan. Zo nodig verwijderen wij je.</li>
        <li style={lijstItem}>Wij mogen je ook pauzeren of verwijderen als je documenten verlopen zijn, als je deze voorwaarden niet naleeft of als er een ernstig vermoeden is dat je gebruikers schaadt. We leggen dan uit waarom. Bij een ernstig vermoeden mogen we eerst pauzeren en daarna uitleggen.</li>
      </ul>

      <h2 id="betalingen" style={kop2}>9. Betalingen</h2>
      <ul style={lijst}>
        <li style={lijstItem}>Betalingen lopen via onze betaaldienst Mollie, bijvoorbeeld met iDEAL. Je betaalt de matchvergoeding vooraf in je dashboard.</li>
        <li style={lijstItem}>Een betaalde matchvergoeding geeft toegang tot het gesprek met die ene gebruiker. We betalen de vergoeding niet terug, ook niet als de gebruiker uiteindelijk niet met je verder gaat. Komt het gesprek door een fout van Blijf Sterk niet tot stand, dan betalen we wel terug.</li>
        <li style={lijstItem}>Een lopend abonnement stopt aan het einde van de betaalde periode als je opzegt.</li>
        <li style={lijstItem}>Wij sturen een factuur of betaalbewijs voor elke betaling.</li>
      </ul>

      <h2 id="aansprakelijkheid" style={kop2}>10. Aansprakelijkheid en vrijwaring</h2>
      <ul style={lijst}>
        <li style={lijstItem}>Blijf Sterk brengt jou en de gebruiker bij elkaar, maar is geen partij in jullie samenwerking. Jij bent verantwoordelijk voor je begeleiding en voor schade die daardoor ontstaat. Daarvoor heb je een verzekering.</li>
        <li style={lijstItem}>Blijf Sterk is niet aansprakelijk voor schade die jij lijdt doordat het platform niet werkt, doordat er geen gebruikers kiezen of door gegevens van gebruikers die onjuist blijken. Dat geldt niet bij opzet of grove nalatigheid van Blijf Sterk.</li>
        <li style={lijstItem}>Is Blijf Sterk toch aansprakelijk, dan is dat beperkt tot het bedrag dat je in de twaalf maanden daarvoor aan ons hebt betaald.</li>
        <li style={lijstItem}>Maakt een gebruiker of een ander aanspraak op Blijf Sterk voor schade die voortkomt uit jouw begeleiding, dan vrijwaar je ons daarvoor, tenzij de schade komt door opzet of grove nalatigheid van Blijf Sterk.</li>
      </ul>

      <h2 id="gegevens" style={kop2}>11. Gegevens en geheimhouding</h2>
      <ul style={lijst}>
        <li style={lijstItem}>Gegevens van gebruikers die je via Blijf Sterk krijgt, gebruik je alleen voor de begeleiding van die gebruiker. Niet voor reclame en je geeft ze niet door aan anderen.</li>
        <li style={lijstItem}>Wat een gebruiker je vertelt over zijn gezondheid is vertrouwelijk. Je bewaart het veilig en niet langer dan nodig.</li>
        <li style={lijstItem}>Voor de gegevens die je van de gebruiker krijgt, ben je zelf verantwoordelijk volgens de privacywet (AVG). Je hebt een eigen privacyverklaring als je die gegevens bewaart.</li>
        <li style={lijstItem}>De gesprekken op het platform worden bewaard. Wij lezen niet routinematig mee, maar kunnen een gesprek inzien bij een klacht, een vermoeden van misbruik of als de wet dat vraagt.</li>
        <li style={lijstItem}>Van jou bewaren wij de gegevens en documenten die in de privacyverklaring staan.</li>
      </ul>

      <h2 id="einde" style={kop2}>12. Opzeggen en beëindigen</h2>
      <ul style={lijst}>
        <li style={lijstItem}>Je kunt de samenwerking op elk moment opzeggen met een e-mail. Al betaalde vergoedingen betalen we niet terug. Lopende gesprekken maak je netjes af.</li>
        <li style={lijstItem}>Wij mogen de samenwerking opzeggen met een opzegtermijn van dertig dagen. Bij misbruik, bij verlopen documenten of bij een ernstig vermoeden dat je gebruikers schaadt, mogen wij direct stoppen.</li>
        <li style={lijstItem}>Bij het einde van de samenwerking verwijderen wij je profiel van het platform. De afspraken over het contact met gebruikers, over geheimhouding en over aansprakelijkheid blijven gelden.</li>
      </ul>

      <VoorwaardenSlot start={13} partner />
    </JuridischePagina>
  );
}
