import InfoPagina, { infoCard } from "../components/InfoPagina";

type Voordeel = {
  titel: string;
  tekst: string;
};

const VOORDELEN: Voordeel[] = [
  {
    titel: "Remt spierverlies af",
    tekst:
      "Vanaf je 35e verlies je geleidelijk spiermassa, en dat gaat na je 60e sneller. Regelmatige krachttraining remt dit af — en kan spierverlies voor een deel zelfs terugdraaien.",
  },
  {
    titel: "Verkleint de kans op vallen",
    tekst:
      "Ongeveer 1 op de 3 mensen boven de 65 valt minstens één keer per jaar. Sterkere beenspieren en een beter evenwicht verkleinen dat risico aanzienlijk.",
  },
  {
    titel: "Houdt je botten sterker",
    tekst:
      "Krachttraining helpt botontkalking (osteoporose) tegen te gaan, waardoor botten steviger blijven naarmate je ouder wordt.",
  },
  {
    titel: "Helpt je zelfstandig blijven",
    tekst:
      "Opstaan uit een stoel, boodschappen dragen, de trap op lopen — onderzoek laat na een trainingsprogramma duidelijke krachttoename zien in armen en benen, soms wel 25 tot 30% sterker.",
  },
  {
    titel: "Verlaagt het risico op vroegtijdig overlijden",
    tekst:
      "In grootschalig onderzoek hadden mensen die 1 tot 2 uur per week aan krachttraining deden, tot 10 à 12% minder kans om in die onderzoeksperiode te overlijden dan mensen die niet trainden.",
  },
  {
    titel: "Is goed voor hart en bloedvaten",
    tekst:
      "Al bij minder dan een uur per week krachttraining zag onderzoek een duidelijk lager risico op overlijden door hart- en vaatziekten.",
  },
  {
    titel: "Verbetert je stemming",
    tekst:
      "In onderzoek naar verschillende vormen van beweging bij ouderen had krachttraining het grootste effect op mentaal welzijn — je voelt je er merkbaar beter door.",
  },
  {
    titel: "Kost weinig tijd",
    tekst:
      "Je hoeft niet uren te sporten. Twee keer per week, met rustige, gecontroleerde oefeningen, is al genoeg om deze voordelen te gaan merken.",
  },
];

export default function WaaromKrachttrainingPagina() {
  return (
    <InfoPagina
      label="Waarom trainen?"
      titel="Waarom krachttraining zo goed voor je is"
      intro="Krachttraining is niet iets voor jonge mensen in de sportschool. Juist na je 55e levert het je het meeste op. Hieronder staat op een rij wat wetenschappelijk onderzoek hierover laat zien."
      ctaTitel="Zelf ervaren wat krachttraining voor je doet?"
      ctaTekst="Meld je gratis aan en begin vandaag nog met de oefeningen."
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
        {VOORDELEN.map((v) => (
          <div key={v.titel} style={{ ...infoCard, padding: "26px 24px" }}>
            <h2 style={{ fontSize: 18, margin: 0, color: "#2B1B0E" }}>{v.titel}</h2>
            <p style={{ color: "#5A4636", marginTop: 10, fontSize: 15, lineHeight: 1.65 }}>{v.tekst}</p>
          </div>
        ))}
      </div>

      <p style={{ color: "#6F5A48", fontSize: 14, lineHeight: 1.6, marginTop: 28, maxWidth: 720 }}>
        Gebaseerd op onderzoek en overzichtsstudies van onder meer Harvard Medical School, de Amerikaanse
        gezondheidsdienst CDC en wetenschappelijke publicaties over krachttraining bij ouderen. De cijfers zijn
        gemiddelden uit onderzoek — je eigen resultaat hangt af van je situatie. Dit is algemene informatie en
        vervangt geen medisch advies; raadpleeg bij twijfel of klachten altijd eerst je huisarts.
      </p>
    </InfoPagina>
  );
}
