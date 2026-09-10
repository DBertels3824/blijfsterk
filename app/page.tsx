import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section style={{ padding: "56px 24px 40px", textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ fontSize: 34, lineHeight: 1.15, marginBottom: 16 }}>
          Sterk blijven, op jouw manier
        </h1>
        <p style={{ fontSize: 18, color: "#2B1B0E", lineHeight: 1.6, marginBottom: 28 }}>
          Blijf Sterk helpt 55-plussers om veilig en met vertrouwen aan krachttraining te beginnen —
          met een AI-coach die met je meedenkt, en trainers en voedingsdeskundigen bij jou in de buurt.
        </p>
        <Link
          href="/login"
          style={{
            display: "inline-block",
            padding: "14px 32px",
            borderRadius: 999,
            background: "#E85D00",
            color: "white",
            fontWeight: 600,
            fontSize: 16,
            textDecoration: "none",
          }}
        >
          Start gratis
        </Link>
      </section>

      {/* Video-plaatshouder */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 48px" }}>
        <div
          style={{
            aspectRatio: "16 / 9",
            background: "#2B1B0E",
            borderRadius: 16,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#E85D00",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderTop: "10px solid transparent",
                borderBottom: "10px solid transparent",
                borderLeft: "16px solid white",
                marginLeft: 4,
              }}
            ></div>
          </div>
          <p style={{ color: "#F3E4C8", fontSize: 14 }}>Introductievideo volgt binnenkort</p>
        </div>
        {/* Zodra je filmpje klaar is: vervang het blok hierboven door bijvoorbeeld
            <video controls poster="/video-poster.jpg" style={{ width: "100%", borderRadius: 16 }}>
              <source src="/intro.mp4" type="video/mp4" />
            </video>
        */}
      </section>

      {/* Persoonlijk verhaal */}
      <section style={{ background: "#FFFFFF", padding: "48px 24px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2 style={{ marginTop: 0 }}>Waarom Blijf Sterk</h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: "#2B1B0E" }}>
            Als krachtsporter weet ik wat kracht met je doet. Naarmate je ouder wordt, verlies je sneller
            spierkracht en -massa dan je zou denken — en daarmee ook een stukje zelfstandigheid. Zelf de trap op.
            Vertrouwen om te blijven bewegen. Langer je eigen leven leiden, op je eigen manier.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: "#2B1B0E" }}>
            Blijf Sterk is ontstaan vanuit die overtuiging: dat krachttraining voor iedereen toegankelijk moet
            zijn, ook — juist — na je 55e. Zonder drempels, zonder onzekerheid, met begeleiding die met je
            meedenkt.
          </p>
        </div>
      </section>

      {/* Hoe het werkt */}
      <section style={{ padding: "48px 24px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2 style={{ marginTop: 0 }}>Hoe het werkt</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 24 }}>
            <Stap nummer={1} titel="Vertel iets over jezelf" tekst="Een paar korte vragen over je doelen, situatie en gezondheid — geen quiz, gewoon een goed beeld." />
            <Stap nummer={2} titel="Krijg persoonlijk advies" tekst="Je AI-coach denkt met je mee en verwijst je, indien nodig, altijd door naar een arts of fysiotherapeut." />
            <Stap nummer={3} titel="Kies wie bij je past" tekst="Een trainer en/of voedingsdeskundige bij jou in de buurt — de app doet zelfs een persoonlijke aanbeveling." />
            <Stap nummer={4} titel="Blijf sterk, stap voor stap" tekst="Log je voortgang, blijf gemotiveerd, en bouw rustig verder aan je kracht en zelfvertrouwen." />
          </div>
        </div>
      </section>

      {/* Voor wie */}
      <section style={{ background: "#FFFFFF", padding: "48px 24px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2 style={{ marginTop: 0 }}>Voor wie is dit?</h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: "#2B1B0E" }}>
            Voor iedereen van 55 jaar en ouder die sterker wil worden — of je nu nog nooit aan krachttraining
            hebt gedaan, een tijdje niet actief bent geweest, of gewoon weer serieus wilt beginnen. Er is geen
            ervaring nodig, alleen de wens om te starten.
          </p>
        </div>
      </section>

      {/* Slot-CTA */}
      <section style={{ padding: "56px 24px", textAlign: "center" }}>
        <h2 style={{ marginTop: 0 }}>Klaar om te beginnen?</h2>
        <Link
          href="/login"
          style={{
            display: "inline-block",
            marginTop: 12,
            padding: "14px 32px",
            borderRadius: 999,
            background: "#E85D00",
            color: "white",
            fontWeight: 600,
            fontSize: 16,
            textDecoration: "none",
          }}
        >
          Start gratis
        </Link>
      </section>
    </div>
  );
}

function Stap({ nummer, titel, tekst }: { nummer: number; titel: string; tekst: string }) {
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <div
        style={{
          flex: "none",
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "#FFF1DC",
          color: "#E85D00",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {nummer}
      </div>
      <div>
        <p style={{ fontWeight: 600, margin: 0 }}>{titel}</p>
        <p style={{ color: "#8A7561", margin: "4px 0 0", lineHeight: 1.5 }}>{tekst}</p>
      </div>
    </div>
  );
}