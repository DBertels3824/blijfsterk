import JuridischePagina, { Inhoudsopgave, alinea, kop2, kop3, lijst, lijstItem } from '@/app/components/JuridischePagina';
import { ONDERNEMING } from '@/lib/juridisch';

export const metadata = {
  title: 'Privacyverklaring — Blijf Sterk',
  description: 'Welke gegevens Blijf Sterk verzamelt, waarom, en wat jouw rechten zijn.',
};

const HOOFDSTUKKEN = [
  { id: 'wie', titel: 'Wie is verantwoordelijk' },
  { id: 'gebruikers', titel: 'Gegevens van gebruikers' },
  { id: 'partners', titel: 'Gegevens van trainers, sportscholen en andere partners' },
  { id: 'kandidaten', titel: 'Trainers die wij uitnodigen' },
  { id: 'waarom', titel: 'Waarvoor we je gegevens gebruiken' },
  { id: 'coach', titel: 'De virtuele coach en kunstmatige intelligentie' },
  { id: 'delen', titel: 'Met wie we gegevens delen' },
  { id: 'bewaren', titel: 'Hoe lang we gegevens bewaren' },
  { id: 'beveiliging', titel: 'Beveiliging' },
  { id: 'cookies', titel: 'Cookies en opslag op je apparaat' },
  { id: 'rechten', titel: 'Jouw rechten' },
  { id: 'wijzigingen', titel: 'Wijzigingen en contact' },
];

export default function PrivacyPagina() {
  const bedrijfsregels = [
    ONDERNEMING.rechtsvorm ? `${ONDERNEMING.naam} (${ONDERNEMING.rechtsvorm})` : ONDERNEMING.naam,
    ONDERNEMING.kvk ? `KvK-nummer ${ONDERNEMING.kvk}` : '',
    ONDERNEMING.adres,
    `E-mail: ${ONDERNEMING.email}`,
  ].filter(Boolean);

  return (
    <JuridischePagina
      label="Privacyverklaring"
      titel="Zo gaan we met je gegevens om"
      intro="Blijf Sterk vraagt alleen wat nodig is om je goed te helpen. Hier lees je precies welke gegevens we bewaren, waarom, waar ze staan en wat je zelf kunt bepalen."
    >
      <Inhoudsopgave items={HOOFDSTUKKEN} />

      <h2 id="wie" style={kop2}>1. Wie is verantwoordelijk</h2>
      <p style={alinea}>Verantwoordelijk voor je gegevens is:</p>
      <ul style={lijst}>
        {bedrijfsregels.map((r) => <li key={r} style={lijstItem}>{r}</li>)}
      </ul>
      <p style={alinea}>We houden ons aan de Algemene verordening gegevensbescherming (AVG). Vragen over je gegevens? Mail naar {ONDERNEMING.email}.</p>

      <h2 id="gebruikers" style={kop2}>2. Gegevens van gebruikers</h2>

      <h3 style={kop3}>2.1 Bij het aanmaken van je account</h3>
      <ul style={lijst}>
        <li style={lijstItem}>Je voornaam of naam.</li>
        <li style={lijstItem}>Je e-mailadres en een wachtwoord. Het wachtwoord slaan we versleuteld op; wij kunnen het niet lezen.</li>
        <li style={lijstItem}>Helpt een zoon, dochter of andere naaste bij het aanmaken? Dan bewaren we ook de naam van die persoon, zodat we weten dat het account samen is aangemaakt. Het e-mailadres kan dan van de naaste zijn.</li>
      </ul>

      <h3 style={kop3}>2.2 Bij de kennismaking (intake)</h3>
      <p style={alinea}>Om de oefeningen en de coach op jou af te stemmen, vragen we naar:</p>
      <ul style={lijst}>
        <li style={lijstItem}>Je woonplaats, je doelen, je ervaring met training, hoeveel dagen per week je wilt oefenen, en of je liever alleen, met iemand samen of in een groepje oefent.</li>
        <li style={lijstItem}>Je dagelijkse activiteit, werksituatie, eetpatroon, eiwitinname en supplementgebruik.</li>
        <li style={lijstItem}><strong>Gezondheidsvragen:</strong> of je hartklachten hebt, snel duizelig wordt, bot- of gewrichtsproblemen hebt, medicijnen gebruikt die je conditie beïnvloeden, of zwanger bent.</li>
      </ul>
      <p style={alinea}>De gezondheidsvragen zijn <strong>bijzondere persoonsgegevens</strong>. Die verwerken we alleen met jouw uitdrukkelijke toestemming, en alleen om je veilig te laten oefenen: bij een risico adviseert de coach extra voorzichtigheid en verwijst naar je huisarts. Je hoeft deze vragen niet te beantwoorden. Je kunt de kennismaking overslaan met &ldquo;Liever later invullen&rdquo; en je antwoorden altijd aanpassen of weghalen in je profiel.</p>

      <h3 style={kop3}>2.3 Terwijl je het platform gebruikt</h3>
      <ul style={lijst}>
        <li style={lijstItem}>Welke oefeningen je hebt gedaan en wanneer. Daarmee tonen we je voortgang en je weekoverzicht.</li>
        <li style={lijstItem}>Je berichten aan de virtuele coach en de antwoorden daarop.</li>
        <li style={lijstItem}>Je berichten in een gesprek met een trainer of sportschool. Die gesprekken worden bewaard. Wij lezen niet routinematig mee, maar kunnen een gesprek inzien bij een klacht, bij een vermoeden van misbruik of als de wet dat vraagt.</li>
        <li style={lijstItem}>Als je meldingen aanzet: een technisch adres van je telefoon of browser om die meldingen te kunnen sturen. Geen locatie, geen contacten.</li>
        <li style={lijstItem}>Je beoordeling van een trainer, als je die geeft.</li>
        <li style={lijstItem}>Interesse in een product uit de winkel, als je dat formulier invult.</li>
        <li style={lijstItem}>Gebruik je de hulppagina, dan bewaren we je berichten, het e-mailadres dat je daar invult, de pagina waar je vandaan kwam, je apparaat en browser, en een versleutelde afkorting van je IP-adres om misbruik te voorkomen. Zo kunnen we je helpen en fouten beter nalopen. We verwijderen deze gesprekken uiterlijk twaalf maanden nadat ze zijn afgehandeld.</li>
      </ul>

      <h2 id="partners" style={kop2}>3. Gegevens van trainers, sportscholen en andere partners</h2>
      <p style={alinea}>Meld je je aan als partner, dan bewaren we:</p>
      <ul style={lijst}>
        <li style={lijstItem}>Je naam, e-mailadres, telefoonnummer en plaats.</li>
        <li style={lijstItem}>Je KvK-nummer en, afhankelijk van je beroep, je registratienummer (bijvoorbeeld je BIG-nummer, of je nummer bij NL Actief, EREPS of een beroepsvereniging).</li>
        <li style={lijstItem}>Je antwoorden op de vragen over ervaring, diploma&rsquo;s, aanpak en verzekering.</li>
        <li style={lijstItem}>De documenten die je uploadt: Verklaring Omtrent het Gedrag, polisblad van je verzekering, EHBO- of BHV-certificaat (niet voor voedingsdeskundigen) en eventueel je diploma. Deze staan in een afgeschermde opslag die alleen de beheerder van Blijf Sterk kan inzien.</li>
        <li style={lijstItem}>Je partnernummer, je matches, en je betalingen aan Blijf Sterk (bedrag, datum, status). Je bankgegevens zien wij niet; die verwerkt onze betaaldienst Mollie.</li>
        <li style={lijstItem}>Beoordelingen die gebruikers over je geven.</li>
      </ul>

      <h2 id="kandidaten" style={kop2}>4. Trainers die wij uitnodigen</h2>
      <p style={alinea}>Om partners te vinden, verzamelen we zakelijke contactgegevens van trainers en sportscholen uit openbare bronnen, zoals Google Maps en de eigen website van het bedrijf: bedrijfsnaam, adres, telefoonnummer, website, een algemeen e-mailadres en de publieke beoordelingsscore. We gebruiken die gegevens alleen om een uitnodiging te sturen. Dit doen we op grond van ons gerechtvaardigd belang om het platform op te bouwen. Wil je niet benaderd worden? Eén e-mail is genoeg; we verwijderen je gegevens dan uit de lijst.</p>

      <h2 id="waarom" style={kop2}>5. Waarvoor we je gegevens gebruiken</h2>
      <ul style={lijst}>
        <li style={lijstItem}><strong>Om het platform te laten werken:</strong> inloggen, je voortgang tonen, de coach laten antwoorden, gesprekken mogelijk maken. Grondslag: de overeenkomst met jou.</li>
        <li style={lijstItem}><strong>Om de oefeningen veilig op jou af te stemmen:</strong> de gezondheidsvragen. Grondslag: jouw uitdrukkelijke toestemming.</li>
        <li style={lijstItem}><strong>Om je te herinneren:</strong> een melding als je een tijd niet geoefend hebt, alleen als je meldingen hebt aangezet. Grondslag: toestemming; je zet het zelf weer uit.</li>
        <li style={lijstItem}><strong>Om partners te toetsen en te betalen:</strong> documenten, partnernummer, betalingen. Grondslag: de overeenkomst en wettelijke plichten, zoals de bewaarplicht voor de belastingdienst.</li>
        <li style={lijstItem}><strong>Om het platform te verbeteren:</strong> we kijken naar aantallen en gebruik, niet naar jou persoonlijk. Grondslag: gerechtvaardigd belang.</li>
      </ul>
      <p style={alinea}>We verkopen je gegevens nooit en gebruiken ze niet voor reclame van anderen.</p>

      <h2 id="coach" style={kop2}>6. De virtuele coach en kunstmatige intelligentie</h2>
      <p style={alinea}>&ldquo;Dirk, je virtuele coach&rdquo; werkt met kunstmatige intelligentie van het bedrijf Anthropic. Als je de coach een vraag stelt, sturen we je bericht, de eerdere berichten in dat gesprek en een samenvatting van je profiel (zoals je naam, doelen, ervaring, eetpatroon en of er een gezondheidsrisico is gemeld) naar Anthropic om een antwoord te maken. Anthropic is gevestigd in de Verenigde Staten; de doorgifte is gedekt door de standaardbepalingen van de Europese Commissie. Volgens de voorwaarden van Anthropic worden deze gegevens niet gebruikt om hun modellen te trainen.</p>
      <p style={alinea}>Hetzelfde geldt voor de digitale hulp op de hulppagina. Die is ook een computerprogramma van Anthropic. Wat je daar typt, wordt (met de eerdere berichten van het gesprek en, als je bent ingelogd, je voornaam en rol) naar Anthropic gestuurd om te kunnen antwoorden. Dirk kan het gesprek lezen. Typ daar daarom nooit je wachtwoord.</p>
      <p style={alinea}>Wil je dat liever niet? Gebruik de coach en de digitale hulp dan niet; de oefeningen en video&rsquo;s werken ook zonder. Voor hulp kun je ons dan mailen.</p>

      <h2 id="delen" style={kop2}>7. Met wie we gegevens delen</h2>
      <p style={alinea}>We werken met een paar dienstverleners die gegevens voor ons verwerken. Met elk van hen hebben we afspraken over beveiliging en geheimhouding.</p>
      <ul style={lijst}>
        <li style={lijstItem}><strong>Supabase</strong> &mdash; onze database, inlogsysteem en documentopslag. De gegevens staan op servers in Ierland (Europese Unie).</li>
        <li style={lijstItem}><strong>Vercel</strong> &mdash; de hosting van de website en app. Vercel verwerkt technische gegevens zoals je IP-adres om de pagina&rsquo;s te tonen en het platform te beschermen.</li>
        <li style={lijstItem}><strong>Anthropic</strong> &mdash; de kunstmatige intelligentie achter de coach, zie hoofdstuk 6.</li>
        <li style={lijstItem}><strong>Mollie</strong> &mdash; de betaaldienst voor betalingen van partners (Nederland).</li>
        <li style={lijstItem}><strong>Trainers en sportscholen</strong> &mdash; kies je zelf voor een partner, dan ziet die partner je voornaam en de berichten die je in het gesprek stuurt. Je intake en gezondheidsvragen delen we niet; wat je de partner vertelt, bepaal je zelf.</li>
      </ul>
      <p style={alinea}>Verder geven we gegevens alleen door als de wet ons daartoe verplicht.</p>

      <h2 id="bewaren" style={kop2}>8. Hoe lang we gegevens bewaren</h2>
      <ul style={lijst}>
        <li style={lijstItem}><strong>Je account en alles wat erbij hoort:</strong> zolang je account bestaat. Zeg je op, dan verwijderen we je gegevens binnen dertig dagen.</li>
        <li style={lijstItem}><strong>Accounts die lang niet gebruikt zijn:</strong> na twee jaar zonder inloggen sturen we een bericht. Reageer je niet, dan verwijderen we het account.</li>
        <li style={lijstItem}><strong>Partnerdocumenten:</strong> zolang de samenwerking loopt, en daarna nog een jaar in verband met eventuele klachten. Daarna verwijderen we ze.</li>
        <li style={lijstItem}><strong>Betalingsgegevens:</strong> zeven jaar, omdat de belastingdienst dat verplicht.</li>
        <li style={lijstItem}><strong>Contactgegevens van uitgenodigde trainers:</strong> tot je aangeeft niet benaderd te willen worden, of tot we de lijst niet meer nodig hebben.</li>
      </ul>

      <h2 id="beveiliging" style={kop2}>9. Beveiliging</h2>
      <ul style={lijst}>
        <li style={lijstItem}>Alle verbindingen zijn versleuteld (https).</li>
        <li style={lijstItem}>Wachtwoorden worden versleuteld opgeslagen en zijn voor niemand leesbaar.</li>
        <li style={lijstItem}>In de database kan ieder alleen zijn eigen gegevens zien. Partnerdocumenten staan in een afgeschermde opslag.</li>
        <li style={lijstItem}>Beheersleutels staan alleen op de server, nooit in de app op je apparaat.</li>
      </ul>
      <p style={alinea}>Ontdek je toch een zwakke plek? Laat het ons weten via {ONDERNEMING.email}, dan lossen we het snel op.</p>

      <h2 id="cookies" style={kop2}>10. Cookies en opslag op je apparaat</h2>
      <p style={alinea}>We gebruiken geen cookies voor reclame en geen volgsystemen van anderen. Op je apparaat slaan we alleen op wat nodig is om de app te laten werken: dat je ingelogd bent, en je voorkeur voor grote letters. Daarom zie je bij ons geen cookiebanner.</p>

      <h2 id="rechten" style={kop2}>11. Jouw rechten</h2>
      <p style={alinea}>Je mag altijd:</p>
      <ul style={lijst}>
        <li style={lijstItem}><strong>Inzien</strong> welke gegevens we van je hebben.</li>
        <li style={lijstItem}><strong>Aanpassen</strong> wat niet klopt. Je naam en je intake kun je zelf wijzigen in je profiel.</li>
        <li style={lijstItem}><strong>Verwijderen:</strong> je account en je gegevens laten wissen.</li>
        <li style={lijstItem}><strong>Toestemming intrekken</strong>, bijvoorbeeld voor de gezondheidsvragen of de meldingen. Dat heeft geen gevolgen voor wat daarvoor is gebeurd.</li>
        <li style={lijstItem}><strong>Bezwaar maken</strong> tegen een verwerking op grond van ons gerechtvaardigd belang.</li>
        <li style={lijstItem}><strong>Je gegevens meenemen</strong> in een leesbaar bestand.</li>
      </ul>
      <p style={alinea}>Stuur een e-mail naar {ONDERNEMING.email}. We reageren binnen een maand. Om zeker te weten dat jij het bent, kunnen we je vragen om vanaf het e-mailadres van je account te mailen. Ben je niet tevreden over hoe we met je gegevens omgaan? Dan kun je een klacht indienen bij de Autoriteit Persoonsgegevens.</p>

      <h2 id="wijzigingen" style={kop2}>12. Wijzigingen en contact</h2>
      <p style={alinea}>We kunnen deze verklaring aanpassen, bijvoorbeeld als we een nieuwe functie toevoegen. De datum bovenaan laat zien wanneer dat voor het laatst is gebeurd. Bij een belangrijke wijziging laten we het je weten in de app of per e-mail.</p>
      <p style={alinea}>Blijf Sterk is bedoeld voor volwassenen. We verzamelen bewust geen gegevens van kinderen onder de 16.</p>
      <p style={alinea}>Vragen? Mail naar {ONDERNEMING.email}.</p>
    </JuridischePagina>
  );
}
