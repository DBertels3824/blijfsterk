import InfoPagina, { infoCard } from "../components/InfoPagina";

const STAPPEN = [
  { titel: "Vertel iets over jezelf", tekst: "Een paar vragen over je doelen, ervaring en voorkeuren. Geen ellenlange formulieren — en je mag het ook later doen." },
  { titel: "Krijg persoonlijk advies", tekst: "Dirk, je virtuele coach, geeft je concreet advies over kracht en voeding, afgestemd op jou. Stel hem elke vraag die je hebt." },
  { titel: "Ga direct aan de slag", tekst: "Kies uit twaalf rustige oefeningen voor thuis, elk met uitleg en een korte video. Met een weerstandsband, een matje of gewoon een flesje water." },
  { titel: "Blijf sterk, stap voor stap", tekst: "Vink af wat je gedaan hebt. Je ziet precies wanneer je welke oefening deed, en hoe je week ervoor staat." },
];

export default function HoeHetWerktPagina() {
  return (
    <InfoPagina
      label="Hoe het werkt"
      titel="Vier stappen, geen gedoe"
      intro="Blijf Sterk is gemaakt om vandaag nog te beginnen. Zo werkt het, van aanmelden tot je eerste oefening."
      ctaTitel="Klaar om te beginnen?"
      ctaTekst="Aanmelden kost niets en duurt een minuut."
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
        {STAPPEN.map((stap, i) => (
          <div key={stap.titel} style={{ ...infoCard, padding: "26px 22px" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                background: "#FFF1DC",
                border: "1px solid #F3E4C8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 18,
                color: "#E85D00",
              }}
            >
              {i + 1}
            </div>
            <h2 style={{ fontSize: 18, marginTop: 16, color: "#2B1B0E" }}>{stap.titel}</h2>
            <p style={{ color: "#5A4636", marginTop: 8, fontSize: 15, lineHeight: 1.65 }}>{stap.tekst}</p>
          </div>
        ))}
      </div>
      <p style={{ textAlign: "center", color: "#6F5A48", fontSize: 14.5, marginTop: 32 }}>
        Binnenkort: koppeling aan een echte trainer en voedingsdeskundige bij jou in de buurt.
      </p>
    </InfoPagina>
  );
}
