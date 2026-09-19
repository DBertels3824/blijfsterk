import Link from "next/link";
import type { CSSProperties } from "react";

const card: CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #F3E4C8",
  borderRadius: 24,
};

const btnPrimary: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  fontWeight: 700,
  fontSize: 16,
  borderRadius: 999,
  minHeight: 52,
  padding: "0 30px",
  background: "linear-gradient(135deg,#FFBE0A,#FF8601)",
  color: "#3A1E00",
  textDecoration: "none",
  boxShadow: "0 6px 18px rgba(232,93,0,0.28)",
};

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
    <div>
      <section style={{ maxWidth: 880, margin: "0 auto", padding: "56px 24px 40px", textAlign: "center" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#FFFFFF",
            border: "1px solid #F3E4C8",
            borderRadius: 999,
            padding: "7px 16px",
            fontWeight: 600,
            fontSize: 13.5,
            color: "#E85D00",
          }}
        >
          Waarom trainen?
        </span>
        <h1 style={{ fontSize: "clamp(28px, 4.5vw, 40px)", lineHeight: 1.15, margin: "20px 0 0", fontWeight: 800, letterSpacing: "-0.01em" }}>
          Waarom krachttraining zo goed voor je is
        </h1>
        <p style={{ fontSize: 17.5, color: "#4A3624", margin: "20px auto 0", maxWidth: 640, lineHeight: 1.65 }}>
          Krachttraining is niet iets voor jonge mensen in de sportschool. Juist na je 55e levert het je het
          meeste op. Hieronder staat op een rij wat wetenschappelijk onderzoek hierover laat zien.
        </p>
      </section>

      <section style={{ maxWidth: 1140, margin: "0 auto", padding: "0 24px 56px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {VOORDELEN.map((v) => (
            <div key={v.titel} style={{ ...card, padding: "26px 24px" }}>
              <h2 style={{ fontSize: 18, margin: 0, color: "#2B1B0E" }}>{v.titel}</h2>
              <p style={{ color: "#5A4636", marginTop: 10, fontSize: 15, lineHeight: 1.65 }}>{v.tekst}</p>
            </div>
          ))}
        </div>

        <p style={{ color: "#8A7561", fontSize: 13, lineHeight: 1.6, marginTop: 28, maxWidth: 720 }}>
          Gebaseerd op onderzoek en overzichtsstudies van onder meer Harvard Medical School, de Amerikaanse
          gezondheidsdienst CDC en wetenschappelijke publicaties over krachttraining bij ouderen. De cijfers zijn
          gemiddelden uit onderzoek — je eigen resultaat hangt af van je situatie. Dit is algemene informatie en
          vervangt geen medisch advies; raadpleeg bij twijfel of klachten altijd eerst je huisarts.
        </p>
      </section>

      <section style={{ background: "linear-gradient(120deg,#FFBE0A,#FF8601)", padding: "56px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 26, color: "#3A1E00", margin: 0 }}>Zelf ervaren wat krachttraining voor je doet?</h2>
          <p style={{ marginTop: 10, fontSize: 16, color: "#4A2C00" }}>
            Begin vandaag nog met een gratis intake — geen verplichtingen.
          </p>
          <Link href="/login" style={{ ...btnPrimary, marginTop: 22, background: "#2B1B0E", color: "#FFFFFF", boxShadow: "none" }}>
            Deelnemen is gratis
          </Link>
        </div>
      </section>
    </div>
  );
}
