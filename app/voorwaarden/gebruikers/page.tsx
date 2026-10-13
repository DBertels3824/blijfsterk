import JuridischePagina, { Inhoudsopgave, alinea, kop2, lijst, lijstItem } from '@/app/components/JuridischePagina';
import VoorwaardenSlot, { SLOT_HOOFDSTUKKEN } from '@/app/components/VoorwaardenSlot';
import { ONDERNEMING } from '@/lib/juridisch';

export const metadata = {
  title: 'Voorwaarden voor gebruikers — Blijf Sterk',
  description: 'De afspraken tussen Blijf Sterk en mensen die zelf oefenen met Blijf Sterk.',
};

const HOOFDSTUKKEN = [
  { id: 'wie', titel: 'Wie wij zijn en voor wie dit is' },
  { id: 'gratis', titel: 'Gratis' },
  { id: 'account', titel: 'Je account' },
  { id: 'gezondheid', titel: 'Je gezondheid en veiligheid' },
  { id: 'coach', titel: 'De virtuele coach' },
  { id: 'partners', titel: 'Trainers en sportscholen via Blijf Sterk' },
  { id: 'gedrag', titel: 'Gedrag' },
  { id: 'aansprakelijkheid', titel: 'Aansprakelijkheid' },
  { id: 'einde', titel: 'Stoppen' },
  ...SLOT_HOOFDSTUKKEN,
];

export default function VoorwaardenGebruikers() {
  const bedrijfsregels = [
    ONDERNEMING.rechtsvorm ? `${ONDERNEMING.naam} (${ONDERNEMING.rechtsvorm})` : ONDERNEMING.naam,
    ONDERNEMING.kvk ? `KvK-nummer ${ONDERNEMING.kvk}` : '',
    ONDERNEMING.adres,
    `E-mail: ${ONDERNEMING.email}`,
  ].filter(Boolean);

  return (
    <JuridischePagina
      label="Voorwaarden voor gebruikers"
      titel="Jouw afspraken met Blijf Sterk"
      intro="Dit zijn de afspraken voor mensen die zelf oefenen met Blijf Sterk. Het is gratis, je bepaalt zelf wat je doet, en je kunt altijd stoppen."
    >
      <Inhoudsopgave items={HOOFDSTUKKEN} />

      <h2 id="wie" style={kop2}>1. Wie wij zijn en voor wie dit is</h2>
      <p style={alinea}>Blijf Sterk is een platform voor mensen van 55 jaar en ouder die thuis sterk, beweeglijk en zelfstandig willen blijven. Het platform wordt aangeboden door:</p>
      <ul style={lijst}>
        {bedrijfsregels.map((r) => <li key={r} style={lijstItem}>{r}</li>)}
      </ul>
      <p style={alinea}>In deze voorwaarden noemen we onszelf &ldquo;Blijf Sterk&rdquo; of &ldquo;wij&rdquo;. Ze gelden voor iedereen die een gebruikersaccount heeft. Ben je trainer of heb je een sportschool? Dan gelden voor jou de voorwaarden voor trainers of voor sportscholen.</p>
      <p style={alinea}>Door een account aan te maken ga je akkoord met deze voorwaarden en met onze privacyverklaring. Ben je het er niet mee eens? Gebruik het platform dan niet.</p>

      <h2 id="gratis" style={kop2}>2. Gratis</h2>
      <p style={alinea}>Het gebruik van Blijf Sterk is gratis voor gebruikers: het account, de oefeningen, de video&rsquo;s en de virtuele coach. Dat blijft zo. Kies je zelf voor begeleiding door een trainer of sportschool, dan maak je daar rechtstreeks afspraken met die partner over kosten. Blijf Sterk vraagt jou daarvoor niets.</p>

      <h2 id="account" style={kop2}>3. Je account</h2>
      <ul style={lijst}>
        <li style={lijstItem}>Je bent 18 jaar of ouder.</li>
        <li style={lijstItem}>Je vult juiste gegevens in en houdt je wachtwoord voor jezelf.</li>
        <li style={lijstItem}>Maakt een zoon, dochter of andere naaste het account voor je aan? Dat mag, als jij dat wilt. Het account is en blijft van jou. Die persoon helpt alleen bij het aanmaken en kan niet meekijken in je account, tenzij je zelf je inloggegevens deelt.</li>
        <li style={lijstItem}>Je gebruikt het platform voor jezelf en niet voor commerciële doelen.</li>
        <li style={lijstItem}>Je kunt je naam, je intake en je voorkeuren altijd zelf aanpassen.</li>
      </ul>

      <h2 id="gezondheid" style={kop2}>4. Je gezondheid en veiligheid</h2>
      <p style={alinea}>Blijf Sterk geeft algemene informatie over krachttraining, beweging en voeding. Dat is geen medisch advies en geen behandeling. Daarom:</p>
      <ul style={lijst}>
        <li style={lijstItem}>Heb je hartklachten, duizeligheid, bot- of gewrichtsproblemen, gebruik je medicijnen die je conditie beïnvloeden, of twijfel je? Overleg dan eerst met je huisarts of behandelaar voordat je begint.</li>
        <li style={lijstItem}>Je oefent op eigen verantwoordelijkheid. Luister naar je lichaam. Stop bij pijn, duizeligheid, benauwdheid of een onveilig gevoel.</li>
        <li style={lijstItem}>Zorg voor een veilige plek om te oefenen: een stevige stoel, vrije ruimte en goed licht.</li>
        <li style={lijstItem}>De oefeningen zijn bedoeld voor mensen die zelfstandig kunnen staan en lopen. Is dat lastig? Vraag dan om begeleiding van een professional.</li>
        <li style={lijstItem}>Blijf Sterk is niet bedoeld voor noodsituaties. Bel bij acute klachten 112.</li>
      </ul>

      <h2 id="coach" style={kop2}>5. De virtuele coach</h2>
      <p style={alinea}>&ldquo;Dirk, je virtuele coach&rdquo; is een computerprogramma dat werkt met kunstmatige intelligentie. De coach helpt je op weg en motiveert je, maar kan fouten maken. De coach is geen arts, fysiotherapeut of diëtist en kent je medische geschiedenis niet. Twijfel je over een antwoord? Vraag het aan een professional. Wat de coach met je gegevens doet, lees je in de privacyverklaring.</p>

      <h2 id="partners" style={kop2}>6. Trainers en sportscholen via Blijf Sterk</h2>
      <p style={alinea}>Je kunt via het platform in contact komen met trainers en sportscholen die bij ons zijn aangesloten. Daarbij geldt:</p>
      <ul style={lijst}>
        <li style={lijstItem}><strong>Jij beslist.</strong> Je bent nergens toe verplicht. Of je contact opneemt en met wie, kies je zelf.</li>
        <li style={lijstItem}><strong>Wij controleren</strong> bij aanmelding of een partner de gevraagde documenten heeft, zoals een Verklaring Omtrent het Gedrag en een verzekering. Wij kunnen niet garanderen dat alle informatie altijd juist en actueel is.</li>
        <li style={lijstItem}><strong>Blijf Sterk is geen partij in de begeleiding.</strong> Afspraken over tijden, plaats, inhoud en kosten maak je rechtstreeks met de partner. Die is zelf verantwoordelijk voor de begeleiding.</li>
        <li style={lijstItem}><strong>Het eerste contact loopt via de chat op het platform.</strong> In die chat ziet de partner je voornaam, je woonplaats en je doelen. Je telefoonnummer en andere gegevens deel je pas als je dat zelf wilt. Je gezondheidsgegevens uit de intake delen wij niet.</li>
        <li style={lijstItem}><strong>Beoordelen.</strong> Na een kennismaking kunnen wij je vragen om een korte beoordeling. Wees eerlijk en respectvol.</li>
        <li style={lijstItem}><strong>Klachten over een partner.</strong> Gaat er iets mis, laat het ons weten. Wij kunnen een partner pauzeren of verwijderen. Een schadeclaim neem je op met de partner zelf.</li>
      </ul>

      <h2 id="gedrag" style={kop2}>7. Gedrag</h2>
      <p style={alinea}>We gaan respectvol met elkaar om. Beledigende, bedreigende of misleidende berichten zijn niet toegestaan, tegen andere gebruikers niet, tegen partners niet en tegen ons niet. Je misbruikt het platform niet, bijvoorbeeld door er gegevens van anderen uit te halen. Wij mogen een account pauzeren of sluiten als iemand zich hier niet aan houdt. We leggen dan uit waarom.</p>

      <h2 id="aansprakelijkheid" style={kop2}>8. Aansprakelijkheid</h2>
      <ul style={lijst}>
        <li style={lijstItem}>Wij doen ons best om Blijf Sterk goed, veilig en betrouwbaar te laten werken. We kunnen niet garanderen dat alles altijd foutloos is of dat je een bepaald resultaat bereikt.</li>
        <li style={lijstItem}>Blijf Sterk is niet aansprakelijk voor schade die ontstaat door het uitvoeren van oefeningen, door antwoorden van de virtuele coach of door de begeleiding van een partner. Dat geldt niet als de schade komt door opzet of grove nalatigheid van Blijf Sterk.</li>
        <li style={lijstItem}>Is Blijf Sterk toch aansprakelijk, dan is dat beperkt tot €100 per gebeurtenis, behalve als de wet iets anders voorschrijft.</li>
        <li style={lijstItem}>Wettelijke rechten die je als consument hebt, blijven gewoon bestaan.</li>
      </ul>

      <h2 id="einde" style={kop2}>9. Stoppen</h2>
      <ul style={lijst}>
        <li style={lijstItem}>Je kunt altijd stoppen. Stuur ons een e-mail en we verwijderen je account en je gegevens, zoals beschreven in de privacyverklaring.</li>
        <li style={lijstItem}>Wij mogen je account sluiten bij misbruik of als je deze voorwaarden niet naleeft. Wij zeggen het vooraf, tenzij dat niet kan, bijvoorbeeld bij een ernstig vermoeden van misbruik.</li>
      </ul>

      <VoorwaardenSlot start={10} partner={false} />
    </JuridischePagina>
  );
}
