import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import HeaderNav from "./components/HeaderNav";
import ServiceWorkerRegistratie from "./components/ServiceWorkerRegistratie";
import CoachWidget from "./components/CoachWidget";
import TekstgrootteWrapper from "./components/TekstgrootteWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blijf Sterk",
  description: "Kracht opbouwen na je 55e — persoonlijke coaching, trainers en voedingsadvies.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/favicon-32.png",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Blijf Sterk",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF8601",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegistratie />
        <TekstgrootteWrapper>
        <header style={{ background: "#FFFFFF" }}>
          <div
            style={{
              padding: "14px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <Link href="/" style={{ display: "flex", alignItems: "center" }}>
              <img src="/logo.png" alt="Blijf Sterk" style={{ height: 40, width: "auto" }} />
            </Link>
            <HeaderNav />
          </div>
          <div style={{ height: 4, background: "linear-gradient(90deg, #FFBE0A, #FF8601)" }}></div>
        </header>

        <main style={{ flex: 1 }}>{children}</main>

        <footer style={{ borderTop: "1px solid #F3E4C8", background: "#FFFFFF", padding: "48px 24px 32px" }}>
          <div style={{ maxWidth: 1140, margin: "0 auto" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 32,
                paddingBottom: 28,
              }}
            >
              <div>
                <img src="/logo.png" alt="Blijf Sterk" style={{ height: 28, width: "auto" }} />
                <p style={{ color: "#8A7561", fontSize: 13.5, marginTop: 12, maxWidth: 260 }}>
                  Sterk, beweeglijk en zelfstandig blijven — op elke leeftijd.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
                <span style={{ fontWeight: 700, color: "#2B1B0E", marginBottom: 2 }}>Blijf Sterk</span>
                <Link href="/#hoe-het-werkt" style={{ color: "#2B1B0E" }}>Hoe het werkt</Link>
                <Link href="/#voor-wie" style={{ color: "#2B1B0E" }}>Voor wie</Link>
                <Link href="/waarom-krachttraining" style={{ color: "#2B1B0E" }}>Waarom krachttraining</Link>
                <Link href="/login" style={{ color: "#2B1B0E" }}>Inloggen</Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
                <span style={{ fontWeight: 700, color: "#2B1B0E", marginBottom: 2 }}>Contact</span>
                <span style={{ color: "#2B1B0E" }}>info@blijfsterk.nl</span>
              </div>
            </div>
            <div style={{ borderTop: "1px solid #F3E4C8", paddingTop: 24, fontSize: 12.5, color: "#8A7561", lineHeight: 1.6 }}>
              <p style={{ margin: 0, maxWidth: 820 }}>
                Blijf Sterk geeft algemene adviezen over training en voeding en vervangt geen medisch advies.
                Raadpleeg bij twijfel, blessures of gezondheidsklachten altijd eerst je huisarts of behandelend
                specialist voordat je begint met een nieuw trainings- of voedingsprogramma.
              </p>
              <p style={{ margin: "12px 0 0" }}>&copy; 2026 Blijf Sterk. Alle rechten voorbehouden.</p>
            </div>
          </div>
        </footer>

        <CoachWidget />
        </TekstgrootteWrapper>
      </body>
    </html>
  );
}
