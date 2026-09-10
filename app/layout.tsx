import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header style={{ background: "#FFFFFF" }}>
          <div style={{ padding: "14px 24px" }}>
            <img src="/logo.png" alt="Blijf Sterk" style={{ height: 40, width: "auto" }} />
          </div>
          <div style={{ height: 4, background: "linear-gradient(90deg, #FFBE0A, #FF8601)" }}></div>
        </header>

        <main style={{ flex: 1 }}>{children}</main>

        <footer
          style={{
            padding: "20px 24px",
            borderTop: "1px solid #F3E4C8",
            background: "#FFFFFF",
            fontSize: 12.5,
            color: "#8A7561",
          }}
        >
          Blijf Sterk geeft algemene informatie en ondersteuning bij krachttraining voor 55-plussers.
          Dit is geen medisch advies en vervangt niet het advies van je huisarts, fysiotherapeut of diëtist.
          Twijfel je over jouw gezondheid? Overleg dan altijd eerst met een arts.
        </footer>
      </body>
    </html>
  );
}