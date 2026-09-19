import Link from "next/link";
import type { CSSProperties } from "react";
import SponsorBanner from "./components/SponsorBanner";

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

const btnSecondary: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  fontSize: 16,
  borderRadius: 999,
  minHeight: 52,
  padding: "0 30px",
  background: "#FFFFFF",
  color: "#E85D00",
  border: "2px solid #F3E4C8",
  textDecoration: "none",
};

const card: CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #F3E4C8",
  borderRadius: 24,
};

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section style={{ maxWidth: 1140, margin: "0 auto", padding: "56px 24px 64px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto 40px", textAlign: "center" }}>
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
            Voor volwassenen van 55+
          </span>
          <h1 style={{ fontSize: "clamp(30px, 5vw, 48px)", lineHeight: 1.1, margin: "20px 0 0", fontWeight: 800, letterSpacing: "-0.01em" }}>
            Sterk blijven begint vandaag.
          </h1>
          <p style={{ fontSize: 18, color: "#4A3624", margin: "20px auto 0", maxWidth: 520, lineHeight: 1.6 }}>
            Persoonlijk advies over kracht en voeding, gekoppeld aan een trainer en voedingsdeskundige die bij je
            passen. Zodat je blijft doen wat je wilt: zelfstandig bewegen, wonen en leven.
          </p>
          <div style={{ display: "flex", gap: 16, marginTop: 30, flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/login" style={btnPrimary}>Start gratis</Link>
            <a href="#hoe-het-werkt" style={btnSecondary}>Bekijk hoe het werkt</a>
          </div>
          <p style={{ marginTop: 18, fontSize: 13.5, color: "#8A7561", fontWeight: 600 }}>
            Gratis intake &middot; Geen verplichtingen
          </p>
        </div>

        <div style={{ position: "relative" }}>
          <img
            src="/hero-photo.jpg"
            alt="Fitte 55-plussers tijdens krachttraining in het park"
            style={{
              width: "100%",
              height: "auto",
              borderRadius: 28,
              display: "block",
              border: "1px solid #F3E4C8",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 20,
              bottom: 20,
              background: "#FFFFFF",
              border: "1px solid #F3E4C8",
              borderRadius: 18,
              padding: "12px 18px",
              boxShadow: "0 10px 28px rgba(43,27,14,0.14)",
              fontWeight: 700,
              fontSize: 13.5,
              maxWidth: 220,
            }}
          >
            In beweging, op elke leeftijd
          </div>
        </div>
      </section>

      {/* VIDEO */}
      <section style={{ maxWidth: 1140, margin: "0 auto", padding: "0 24px 64px" }}>
        <div style={{ ...card, padding: "40px 32px", textAlign: "center" }}>
          <h2 style={{ fontSize: 26, margin: 0 }}>Maak kennis met Blijf Sterk</h2>
          <p style={{ color: "#8A7561", marginTop: 8, fontSize: 15.5 }}>
            Een korte introductie door de oprichter — binnenkort hier te bekijken.
          </p>
          <div
            style={{
              margin: "26px auto 0",
              maxWidth: 700,
              aspectRatio: "16 / 9",
              borderRadius: 20,
              position: "relative",
              background: "linear-gradient(160deg,#F5E6C8,#EFD9AE)",
              border: "1px solid #F3E4C8",
            }}
          >
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 999,
                  background: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(43,27,14,0.18)",
                }}
              >
                <svg width="22" height="26" viewBox="0 0 26 30" fill="none"><path d="M2 2v26l22-13L2 2z" fill="#E85D00" /></svg>
              </div>
            </div>
            <span style={{ position: "absolute", bottom: 14, left: 0, right: 0, textAlign: "center", fontSize: 14, color: "#8A7561", fontWeight: 500 }}>
              Introductievideo — wordt binnenkort toegevoegd
            </span>
          </div>
        </div>
      </section>

      {/* PERSOONLIJK VERHAAL */}
      <section style={{ maxWidth: 1140, margin: "0 auto", padding: "0 24px 64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: ".8fr 1.2fr", gap: 44, alignItems: "center" }} className="hero-grid">
          <div
            style={{
              aspectRatio: "1 / 1",
              borderRadius: 28,
              background: "linear-gradient(160deg,#F5E6C8,#EFD9AE)",
              border: "1px solid #F3E4C8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#8A7561",
              fontWeight: 600,
              fontSize: 14,
              textAlign: "center",
              padding: 24,
            }}
          >
            [ Foto van Dirk volgt ]
          </div>
          <div>
            <span
              style={{
                display: "inline-flex",
                background: "#FFFFFF",
                border: "1px solid #F3E4C8",
                borderRadius: 999,
                padding: "7px 16px",
                fontWeight: 600,
                fontSize: 13.5,
                color: "#E85D00",
              }}
            >
              Waarom Blijf Sterk bestaat
            </span>
            <p style={{ fontSize: 21, lineHeight: 1.5, marginTop: 18, fontWeight: 600, color: "#2B1B0E" }}>
              &ldquo;Ik train al mijn hele leven met gewichten. Ik zag mensen om me heen op hun 65e stoppen met
              bewegen — niet omdat het moest, maar omdat niemand ze liet zien dat het anders kon. Blijf Sterk is het
              bewijs dat je op elke leeftijd sterker kunt worden dan je nu bent. Niet morgen. Vandaag.&rdquo;
            </p>
            <p style={{ marginTop: 16, fontWeight: 700, color: "#E85D00" }}>&mdash; Dirk, oprichter van Blijf Sterk</p>
          </div>
        </div>
      </section>

      {/* HOE HET WERKT */}
      <section id="hoe-het-werkt" style={{ background: "#FFFFFF", borderTop: "1px solid #F3E4C8", borderBottom: "1px solid #F3E4C8", padding: "64px 24px" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 520, margin: "0 auto 40px" }}>
            <h2 style={{ fontSize: 28, margin: 0 }}>Hoe het werkt</h2>
            <p style={{ color: "#8A7561", marginTop: 10, fontSize: 16 }}>Vier stappen, geen gedoe.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
            <Stap nummer={1} titel="Vertel iets over jezelf" tekst="Een paar vragen over je doelen, ervaring en voorkeuren. Geen ellenlange formulieren." />
            <Stap nummer={2} titel="Krijg persoonlijk advies" tekst="Onze AI-coach geeft je concreet advies over kracht en voeding, afgestemd op jou." />
            <Stap nummer={3} titel="Kies wie bij je past" tekst="We koppelen je aan een trainer en voedingsdeskundige bij jou in de buurt." />
            <Stap nummer={4} titel="Blijf sterk, stap voor stap" tekst="Log je voortgang, zie je reeks groeien en voel het verschil." />
          </div>
        </div>
      </section>

      {/* VOOR WIE */}
      <section id="voor-wie" style={{ maxWidth: 1140, margin: "0 auto", padding: "64px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 520, margin: "0 auto 40px" }}>
          <h2 style={{ fontSize: 28, margin: 0 }}>Voor wie is dit?</h2>
          <p style={{ color: "#8A7561", marginTop: 10, fontSize: 16 }}>Herken je jezelf hierin?</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          <div style={{ ...card, padding: "26px 22px" }}>
            <h3 style={{ fontSize: 17, margin: 0 }}>Je bent net begonnen</h3>
            <p style={{ color: "#8A7561", marginTop: 10, fontSize: 14.5, lineHeight: 1.6 }}>
              Je hebt weinig of geen ervaring met krachttraining en wilt een duidelijk startpunt, zonder je dom te voelen.
            </p>
          </div>
          <div style={{ ...card, padding: "26px 22px" }}>
            <h3 style={{ fontSize: 17, margin: 0 }}>Je bent even gestopt</h3>
            <p style={{ color: "#8A7561", marginTop: 10, fontSize: 14.5, lineHeight: 1.6 }}>
              Je hebt eerder getraind, maar door blessure, drukte of gemakzucht ben je gestopt. Tijd voor een herstart die past bij nu.
            </p>
          </div>
          <div style={{ ...card, padding: "26px 22px" }}>
            <h3 style={{ fontSize: 17, margin: 0 }}>Je wilt zelfstandig blijven</h3>
            <p style={{ color: "#8A7561", marginTop: 10, fontSize: 14.5, lineHeight: 1.6 }}>
              Je merkt dat kracht en balans er echt toe doen om te blijven doen wat je wilt — nu en over tien jaar.
            </p>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section style={{ background: "linear-gradient(120deg,#FFBE0A,#FF8601)", padding: "56px 24px" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 28, color: "#3A1E00", margin: 0 }}>Klaar om te beginnen?</h2>
          <p style={{ marginTop: 10, fontSize: 16.5, color: "#4A2C00" }}>Start vandaag nog — het kost je niets om te proberen.</p>
          <Link href="/login" style={{ ...btnPrimary, marginTop: 22, background: "#2B1B0E", color: "#FFFFFF", boxShadow: "none" }}>
            Start gratis
          </Link>
        </div>
      </section>

      <SponsorBanner />
    </div>
  );
}

function Stap({ nummer, titel, tekst }: { nummer: number; titel: string; tekst: string }) {
  return (
    <div style={{ ...card, padding: "24px 20px" }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 999,
          background: "#FFF1DC",
          border: "1px solid #F3E4C8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          color: "#E85D00",
        }}
      >
        {nummer}
      </div>
      <h3 style={{ fontSize: 17, marginTop: 16 }}>{titel}</h3>
      <p style={{ color: "#8A7561", marginTop: 8, fontSize: 14 }}>{tekst}</p>
    </div>
  );
}
