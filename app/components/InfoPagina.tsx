import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

// Vaste opbouw voor de informatiepagina's (Waarom krachttraining, Voor wie is dit,
// Hoe het werkt): terugknop naar de homepage, kop, inhoud, en onderaan altijd
// dezelfde "Deelnemen is gratis"-band. Zo voelen ze als één geheel en kan een
// bezoeker overal verder.
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

export const infoCard: CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #F3E4C8",
  borderRadius: 24,
};

export default function InfoPagina({
  label,
  titel,
  intro,
  children,
  ctaTitel,
  ctaTekst,
}: {
  label: string;
  titel: string;
  intro: string;
  children: ReactNode;
  ctaTitel: string;
  ctaTekst: string;
}) {
  return (
    <div>
      <section style={{ maxWidth: 880, margin: "0 auto", padding: "24px 24px 40px", textAlign: "center" }}>
        <div style={{ textAlign: "left", marginBottom: 24 }}>
          <Link href="/" style={{ fontSize: 14.5, fontWeight: 700, color: "#E85D00", textDecoration: "none" }}>
            ← Terug naar de homepage
          </Link>
        </div>
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
          {label}
        </span>
        <h1 style={{ fontSize: "clamp(28px, 4.5vw, 40px)", lineHeight: 1.15, margin: "20px 0 0", fontWeight: 800, letterSpacing: "-0.01em" }}>
          {titel}
        </h1>
        <p style={{ fontSize: 17.5, color: "#4A3624", margin: "20px auto 0", maxWidth: 640, lineHeight: 1.65 }}>{intro}</p>
      </section>

      <section style={{ maxWidth: 1140, margin: "0 auto", padding: "0 24px 56px" }}>{children}</section>

      <section style={{ background: "linear-gradient(120deg,#FFBE0A,#FF8601)", padding: "56px 24px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 26, color: "#3A1E00", margin: 0 }}>{ctaTitel}</h2>
          <p style={{ marginTop: 10, fontSize: 16, color: "#4A2C00" }}>{ctaTekst}</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 22 }}>
            <Link href="/login" style={{ ...btnPrimary, background: "#2B1B0E", color: "#FFFFFF", boxShadow: "none" }}>
              Deelnemen is gratis
            </Link>
            <Link href="/" style={{ ...btnSecondary, background: "rgba(255,255,255,0.7)", border: "2px solid rgba(58,30,0,0.15)", color: "#3A1E00" }}>
              Naar de homepage
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
