import Link from "next/link";
import InfoPagina, { btnSecondary, infoCard } from "../components/InfoPagina";

const PROFIELEN = [
  { titel: "Je bent net begonnen", tekst: "Je hebt weinig of geen ervaring met krachttraining en wilt een duidelijk startpunt, zonder je dom te voelen. Elke oefening wordt rustig uitgelegd, met video." },
  { titel: "Je bent even gestopt", tekst: "Je hebt eerder getraind, maar door blessure, drukte of gemakzucht ben je gestopt. Tijd voor een herstart die past bij nu — in je eigen tempo, thuis." },
  { titel: "Je wilt zelfstandig blijven", tekst: "Je merkt dat kracht en balans er echt toe doen om te blijven doen wat je wilt — nu en over tien jaar. Traplopen, boodschappen, de kleinkinderen optillen." },
];

export default function VoorWiePagina() {
  return (
    <InfoPagina
      label="Voor wie is dit?"
      titel="Herken je jezelf hierin?"
      intro="Blijf Sterk is er voor iedereen van 55 jaar en ouder die sterker wil worden of blijven. Geen sportschool nodig, geen ervaring nodig."
      ctaTitel="Herken je jezelf?"
      ctaTekst="Dan is dit het moment. Meld je gratis aan en begin vandaag."
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
        {PROFIELEN.map((p) => (
          <div key={p.titel} style={{ ...infoCard, padding: "26px 22px" }}>
            <h2 style={{ fontSize: 18, margin: 0, color: "#2B1B0E" }}>{p.titel}</h2>
            <p style={{ color: "#5A4636", marginTop: 10, fontSize: 15, lineHeight: 1.65 }}>{p.tekst}</p>
          </div>
        ))}
      </div>

      {/* Voor zonen en dochters die hun ouder op weg willen helpen. Bewust zonder
          "meekijken": het account blijft van de oudere, de keuze om te oefenen ook. */}
      <div style={{ ...infoCard, padding: "28px 24px", marginTop: 24, textAlign: "center", background: "#FFF8EE" }}>
        <h2 style={{ fontSize: 20, margin: 0, color: "#2B1B0E" }}>Help je je vader of moeder?</h2>
        <p style={{ color: "#5A4636", margin: "12px auto 0", maxWidth: 560, fontSize: 15, lineHeight: 1.65 }}>
          Veel mensen beginnen samen met een zoon of dochter. Jullie maken het account samen aan en zetten
          Blijf Sterk op de telefoon. Daarna gaat je vader of moeder zelf verder, in eigen tempo.
          Het account blijft van hen, en zij bepalen zelf wanneer ze oefenen.
        </p>
        <div style={{ marginTop: 20 }}>
          <Link href="/login?helper=1" style={btnSecondary}>
            Ik help mijn vader of moeder
          </Link>
        </div>
      </div>
    </InfoPagina>
  );
}
