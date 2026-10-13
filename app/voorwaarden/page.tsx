import JuridischePagina, { Inhoudsopgave, alinea, kop2, kop3, lijst, lijstItem } from '@/app/components/JuridischePagina';
import { ONDERNEMING, TARIEVEN } from '@/lib/juridisch';

export const metadata = {
  title: 'Algemene voorwaarden — Blijf Sterk',
  description: 'De afspraken tussen Blijf Sterk en gebruikers, trainers en sportscholen.',
};

const HOOFDSTUKKEN = [
  { id: 'wie', titel: 'Wie wij zijn' },
  { id: 'geldig', titel: 'Voor wie deze voorwaarden gelden' },
  { id: 'gebruikers', titel: 'Voor gebruikers' },
  { id: 'trainers', titel: 'Voor trainers en andere partners' },
  { id: 'sportscholen', titel: 'Voor sportscholen' },
  { id: 'betalingen', titel: 'Betalingen' },
  { id: 'aansprakelijkheid', titel: 'Aansprakelijkheid' },
  { id: 'eigendom', titel: 'Teksten, video’s en logo' },
  { id: 'beschikbaar', titel: 'Beschikbaarheid en wijzigingen' },
  { id: 'einde', titel: 'Opzeggen en beëindigen' },
  { id: 'recht', titel: 'Klachten en toepasselijk recht' },
];

export default function VoorwaardenPagina() {
  const bedrijfsregels = [
    ONDERNEMING.rechtsvorm ? `${ONDERNEMING.naam} (${ONDERNEMING.rechtsvorm})` : ONDERNEMING.naam,
    ONDERNEMING.kvk ? `KvK-nummer ${ONDERNEMING.kvk}` : '',
    ONDERNEMING.adres,
    `E-mail: ${ONDERNEMING.email}`,
  ].filter(Boolean);

  return (
    <JuridischePagina
      label="Algemene voorwaarden"
      titel="De afspraken, in gewone taal"
      intro="Hier staat wat je van Blijf Sterk mag verwachten en wat wij van jou vragen. Er is een deel voor gebruikers, een deel voor trainers en een deel voor sportscholen. De rest geldt voor iedereen."
    >
      <Inhoudsopgave items={HOOFDSTUKKEN} />

      <h2 id="wie" style={kop2}>1. Wie wij zijn</h2>
      <p style={alinea}>Blijf Sterk is een platform voor mensen van 55 jaar en ouder die thuis sterk, beweeglijk en zelfstandig willen blijven. Het platform wordt aangeboden door:</p>
      <ul style={lijst}>
        {bedrijfsregels.map((r) => <li key={r} style={lijstItem}>{r}</li>)}
      </ul>
      <p style={alinea}>In deze voorwaarden noemen we onszelf &ldquo;Blijf Sterk&rdquo; of &ldquo;wij&rdquo;.</p>

      <h2 id="geldig" style={kop2}>2. Voor wie deze voorwaarden gelden</h2>
      <p style={alinea}>Deze voorwaarden gelden voor iedereen die de website of de app van Blijf Sterk gebruikt:</p>
      <ul style={lijst}>
        <li style={lijstItem}><strong>Gebruikers:</strong> mensen die een account aanmaken om te oefenen, de virtuele coach te gebruiken of een trainer te zoeken.</li>
        <li style={lijstItem}><strong>Trainers en andere partners:</strong> zelfstandige trainers, fysiotherapeuten, voedingsdeskundigen en vergelijkbare professionals die zich als partner aanmelden.</li>
        <li style={lijstItem}><strong>Sportscholen:</strong> sportscholen en vergelijkbare locaties die zich als partner aanmelden.</li>
      </ul>
      <p style={alinea}>Door een account aan te maken of een aanmelding te versturen, ga je akkoord met deze voorwaarden en met onze privacyverklaring. Ben je het er niet mee eens? Gebruik het platform dan niet.</p>

      <h2 id="gebruikers" style={kop2}>3. Voor gebruikers</h2>

      <h3 style={kop3}>3.1 Gratis</h3>
      <p style={alinea}>Het gebruik van Blijf Sterk is gratis voor gebruikers: het account, de oefeningen, de video&rsquo;s en de virtuele coach. Dat blijft zo. Kies je zelf voor begeleiding door een trainer of sportschool, dan maak je daar rechtstreeks afspraken mee over kosten.</p>

      <h3 style={kop3}>3.2 Je account</h3>
      <ul style={lijst}>
        <li style={lijstItem}>Je bent 18 jaar of ouder.</li>
        <li style={lijstItem}>Je vult juiste gegevens in en houdt je wachtwoord voor jezelf.</li>
        <li style={lijstItem}>Maak je een account aan voor je vader, moeder of een andere naaste? Dat mag alleen als die persoon dat wil. Het account is en blijft van die persoon. Jij helpt alleen bij het aanmaken.</li>
        <li style={lijstItem}>Je gebruikt het platform alleen voor jezelf en niet voor commerciële doelen.</li>
      </ul>

      <h3 style={kop3}>3.3 Je gezondheid en veiligheid</h3>
      <p style={alinea}>Blijf Sterk geeft algemene informatie over krachttraining, beweging en voeding. Dat is geen medisch advies en geen behandeling. Daarom:</p>
      <ul style={lijst}>
        <li style={lijstItem}>Heb je hartklachten, duizeligheid, bot- of gewrichtsproblemen, gebruik je medicijnen die je conditie beïnvloeden, of twijfel je? Overleg dan eerst met je huisarts of behandelaar voordat je begint.</li>
        <li style={lijstItem}>Je oefent op eigen verantwoordelijkheid. Luister naar je lichaam. Stop bij pijn, duizeligheid, benauwdheid of een onveilig gevoel.</li>
        <li style={lijstItem}>Zorg voor een veilige plek om te oefenen: stevige stoel, vrije ruimte, goed licht.</li>
        <li style={lijstItem}>De oefeningen zijn bedoeld voor mensen die zelfstandig kunnen staan en lopen. Is dat lastig, vraag dan om begeleiding.</li>
      </ul>

      <h3 style={kop3}>3.4 De virtuele coach</h3>
      <p style={alinea}>&ldquo;Dirk, je virtuele coach&rdquo; is een computerprogramma dat werkt met kunstmatige intelligentie. De coach helpt je op weg en motiveert je, maar kan fouten maken. De coach is geen arts, fysiotherapeut of diëtist. Twijfel je over een antwoord? Vraag het aan een professional.</p>

      <h3 style={kop3}>3.5 Trainers en sportscholen via Blijf Sterk</h3>
      <p style={alinea}>Je kunt via het platform in contact komen met trainers en sportscholen die bij ons zijn aangesloten. Daarbij geldt:</p>
      <ul style={lijst}>
        <li style={lijstItem}>Wij controleren bij aanmelding of een partner de gevraagde documenten heeft, zoals een Verklaring Omtrent het Gedrag en een verzekering. Wij kunnen niet garanderen dat alle informatie altijd juist en actueel is.</li>
        <li style={lijstItem}>Blijf Sterk brengt jullie bij elkaar, maar is geen partij in de begeleiding. Afspraken over tijden, plaats, inhoud en kosten maak je rechtstreeks met de partner. Die is zelf verantwoordelijk voor de begeleiding.</li>
        <li style={lijstItem}>Het eerste contact loopt via de chat op het platform. Daarna kun je samen verder afspreken hoe jullie contact houden.</li>
        <li style={lijstItem}>Na een kennismaking kunnen wij je vragen om een korte beoordeling. Wees eerlijk en respectvol.</li>
      </ul>

      <h3 style={kop3}>3.6 Gedrag</h3>
      <p style={alinea}>We gaan respectvol met elkaar om. Beledigende, bedreigende of misleidende berichten zijn niet toegestaan. Wij mogen een account pauzeren of sluiten als iemand zich hier niet aan houdt.</p>

      <h2 id="trainers" style={kop2}>4. Voor trainers en andere partners</h2>

      <h3 style={kop3}>4.1 Toelating</h3>
      <ul style={lijst}>
        <li style={lijstItem}>Je meldt je aan met een geldig KvK-nummer en levert de gevraagde documenten aan: een Verklaring Omtrent het Gedrag (niet ouder dan twee jaar), een polisblad van je beroeps- of bedrijfsaansprakelijkheidsverzekering, een EHBO-, BHV- of reanimatiecertificaat, en een diploma of een registratienummer bij NL Actief of EREPS.</li>
        <li style={lijstItem}>Alles wat je invult en aanlevert is juist en volledig. Verandert er iets, bijvoorbeeld je verzekering verloopt, dan laat je dat ons meteen weten.</li>
        <li style={lijstItem}>Wij beslissen of we je toelaten. We mogen een aanmelding weigeren, een partner pauzeren of verwijderen als de documenten niet kloppen, als er klachten zijn of als de samenwerking niet past bij Blijf Sterk. We leggen dan uit waarom.</li>
        <li style={lijstItem}>Je krijgt een partnernummer. Dat nummer staat op je aanmelding en op elke betaling.</li>
      </ul>

      <h3 style={kop3}>4.2 Zelfstandig</h3>
      <p style={alinea}>Je werkt als zelfstandig ondernemer. Er is geen arbeidsrelatie, geen bemiddeling in de zin van de wet en geen exclusiviteit. Je bent zelf verantwoordelijk voor de kwaliteit en veiligheid van je begeleiding, voor je verzekeringen, en voor je belastingen en administratie.</p>

      <h3 style={kop3}>4.3 Wat Blijf Sterk doet en wat het kost</h3>
      <p style={alinea}>Blijf Sterk brengt gebruikers in contact met partners in hun buurt. Daarvoor vragen wij een vergoeding:</p>
      <ul style={lijst}>
        <li style={lijstItem}><strong>Matchvergoeding:</strong> €{TARIEVEN.matchvergoeding} per nieuwe klant die via Blijf Sterk kiest voor jou. De eerste {TARIEVEN.gratisMatchesFoundingPartner} matches zijn gratis voor partners van het eerste uur.</li>
        <li style={lijstItem}><strong>Partnerabonnement:</strong> later mogelijk een abonnement van €{TARIEVEN.partnerabonnementPerMaand} per maand met extra zichtbaarheid. Dat kondigen we vooraf aan en je kiest zelf of je meedoet.</li>
        <li style={lijstItem}>Bedragen zijn exclusief btw, tenzij anders vermeld. De actuele tarieven staan in je partnerdashboard.</li>
      </ul>

      <h3 style={kop3}>4.4 Contact via het platform</h3>
      <p style={alinea}>Het eerste contact met een gebruiker loopt via de chat op het platform. Die gaat open zodra de matchvergoeding is betaald of een gratis match is gebruikt. Het is niet toegestaan om buiten het platform om contact te leggen met gebruikers van Blijf Sterk om de matchvergoeding te ontlopen. Gebeurt dat toch, dan mogen wij de vergoeding alsnog in rekening brengen en de samenwerking beëindigen.</p>

      <h3 style={kop3}>4.5 Gebruikers beschermen</h3>
      <ul style={lijst}>
        <li style={lijstItem}>Je werkt met een kwetsbare doelgroep. Je houdt rekening met gezondheidsbeperkingen en verwijst door naar een arts of fysiotherapeut als dat nodig is.</li>
        <li style={lijstItem}>Gegevens van gebruikers die je via Blijf Sterk krijgt, gebruik je alleen voor de begeleiding van die gebruiker. Niet voor reclame en niet om door te geven aan anderen.</li>
        <li style={lijstItem}>Gebruikers kunnen je beoordelen. Bij herhaalde slechte beoordelingen of klachten kunnen wij je profiel pauzeren en met je in gesprek gaan.</li>
      </ul>

      <h2 id="sportscholen" style={kop2}>5. Voor sportscholen</h2>
      <p style={alinea}>Voor sportscholen geldt alles uit hoofdstuk 4. Daarnaast:</p>
      <ul style={lijst}>
        <li style={lijstItem}>De locatie is goed toegankelijk voor 55-plussers en tijdens openingstijden is er iemand met EHBO of BHV aanwezig.</li>
        <li style={lijstItem}>De sportschool is verantwoordelijk voor haar medewerkers en voor de veiligheid van de locatie en de apparatuur.</li>
        <li style={lijstItem}>Degene die de aanmelding doet, is bevoegd om namens de sportschool afspraken te maken.</li>
        <li style={lijstItem}>Sponsoring en andere samenwerkingen spreken we apart af, in een eigen overeenkomst.</li>
      </ul>

      <h2 id="betalingen" style={kop2}>6. Betalingen</h2>
      <ul style={lijst}>
        <li style={lijstItem}>Betalingen van partners lopen via onze betaaldienst Mollie, bijvoorbeeld met iDEAL. Je betaalt vooraf.</li>
        <li style={lijstItem}>Een betaalde matchvergoeding geeft toegang tot het gesprek met die ene gebruiker. We betalen de vergoeding niet terug, ook niet als de gebruiker uiteindelijk niet voor jou kiest. Komt het gesprek door een fout van Blijf Sterk niet tot stand, dan betalen we wel terug.</li>
        <li style={lijstItem}>Gebruikers betalen niets aan Blijf Sterk. Betalingen voor begeleiding regel je rechtstreeks met de partner.</li>
      </ul>

      <h2 id="aansprakelijkheid" style={kop2}>7. Aansprakelijkheid</h2>
      <ul style={lijst}>
        <li style={lijstItem}>Wij doen ons best om Blijf Sterk goed, veilig en betrouwbaar te laten werken. We kunnen niet garanderen dat alles altijd foutloos is of dat je een bepaald resultaat bereikt.</li>
        <li style={lijstItem}>Blijf Sterk is niet aansprakelijk voor schade die ontstaat door het uitvoeren van oefeningen, door adviezen van de virtuele coach, of door de begeleiding van een partner. Dat geldt niet als de schade komt door opzet of grove nalatigheid van Blijf Sterk.</li>
        <li style={lijstItem}>Is Blijf Sterk toch aansprakelijk, dan is dat beperkt tot het bedrag dat je in de twaalf maanden daarvoor aan ons hebt betaald. Voor gebruikers, die niets betalen, is dat beperkt tot €100.</li>
        <li style={lijstItem}>Partners vrijwaren Blijf Sterk voor aanspraken van gebruikers of anderen die voortkomen uit hun begeleiding.</li>
      </ul>

      <h2 id="eigendom" style={kop2}>8. Teksten, video&rsquo;s en logo</h2>
      <p style={alinea}>De teksten, oefenvideo&rsquo;s, afbeeldingen, het logo en de software van Blijf Sterk zijn van ons. Je mag ze gebruiken binnen het platform, voor jezelf. Je mag ze niet kopiëren, verspreiden of commercieel gebruiken zonder onze schriftelijke toestemming. Partners mogen het logo van Blijf Sterk gebruiken om te laten zien dat ze partner zijn, zolang de samenwerking loopt.</p>

      <h2 id="beschikbaar" style={kop2}>9. Beschikbaarheid en wijzigingen</h2>
      <ul style={lijst}>
        <li style={lijstItem}>Het platform kan tijdelijk niet werken, bijvoorbeeld door onderhoud of een storing. We proberen dat kort te houden.</li>
        <li style={lijstItem}>We mogen het platform aanpassen, functies toevoegen of verwijderen, en in het uiterste geval stoppen. Grote veranderingen kondigen we aan.</li>
        <li style={lijstItem}>We mogen deze voorwaarden wijzigen. Bij een belangrijke wijziging laten we dat weten via de app of per e-mail. Gebruik je het platform daarna nog, dan ga je akkoord met de nieuwe versie.</li>
      </ul>

      <h2 id="einde" style={kop2}>10. Opzeggen en beëindigen</h2>
      <ul style={lijst}>
        <li style={lijstItem}>Gebruikers kunnen altijd stoppen. Stuur ons een e-mail en we verwijderen je account en je gegevens, zoals beschreven in de privacyverklaring.</li>
        <li style={lijstItem}>Partners kunnen de samenwerking opzeggen met een e-mail. Al betaalde vergoedingen betalen we niet terug. Een lopend abonnement stopt aan het einde van de betaalde periode.</li>
        <li style={lijstItem}>Wij mogen een account of partnerschap beëindigen bij misbruik, bij het niet nakomen van deze voorwaarden, of als documenten niet meer geldig zijn.</li>
      </ul>

      <h2 id="recht" style={kop2}>11. Klachten en toepasselijk recht</h2>
      <p style={alinea}>Heb je een klacht? Mail ons op {ONDERNEMING.email}. We reageren binnen veertien dagen en proberen het samen op te lossen. Komen we er niet uit, dan is Nederlands recht van toepassing en beslist de Nederlandse rechter.</p>
    </JuridischePagina>
  );
}
