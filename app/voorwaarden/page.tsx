import Link from 'next/link';
import type { CSSProperties } from 'react';
import JuridischePagina, { alinea } from '@/app/components/JuridischePagina';

export const metadata = {
  title: 'Voorwaarden — Blijf Sterk',
  description: 'Kies de voorwaarden die bij jou passen: voor gebruikers, trainers of sportscholen.',
};

const kaart: CSSProperties = {
  display: 'block',
  background: '#FFFFFF',
  border: '2px solid #F3E4C8',
  borderRadius: 20,
  padding: '22px 24px',
  color: '#2B1B0E',
  textDecoration: 'none',
};

const KEUZES = [
  {
    href: '/voorwaarden/gebruikers',
    titel: 'Ik oefen zelf mee',
    sub: 'Voorwaarden voor gebruikers',
    tekst: 'Voor iedereen die een account heeft om te oefenen, de virtuele coach te gebruiken of een trainer te zoeken. Gratis, en jij bepaalt zelf wat je doet.',
  },
  {
    href: '/voorwaarden/trainers',
    titel: 'Ik ben trainer of andere professional',
    sub: 'Voorwaarden voor trainers en andere partners',
    tekst: 'Voor trainers, fysiotherapeuten en voedingsdeskundigen die gebruikers willen begeleiden. Met toelating, kosten en de afspraken over het contact.',
  },
  {
    href: '/voorwaarden/sportscholen',
    titel: 'Ik heb een sportschool',
    sub: 'Voorwaarden voor sportscholen',
    tekst: 'Voor sportscholen en vergelijkbare locaties. Met eisen aan de locatie, de kosten en de afspraken over het contact.',
  },
];

export default function VoorwaardenOverzicht() {
  return (
    <JuridischePagina
      label="Voorwaarden"
      titel="Welke voorwaarden gelden voor jou?"
      intro="Blijf Sterk heeft drie sets afspraken, omdat een gebruiker, een trainer en een sportschool iets anders van ons nodig hebben. Kies hieronder wat bij jou past."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 28 }}>
        {KEUZES.map((k) => (
          <Link key={k.href} href={k.href} style={kaart}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#B34500' }}>{k.sub}</span>
            <span style={{ display: 'block', fontSize: 21, fontWeight: 800, margin: '6px 0 8px' }}>{k.titel}</span>
            <span style={{ display: 'block', fontSize: 17, lineHeight: 1.6, color: '#4A3624' }}>{k.tekst}</span>
            <span style={{ display: 'block', marginTop: 12, fontSize: 16, fontWeight: 700, color: '#B34500' }}>Lees de voorwaarden &rarr;</span>
          </Link>
        ))}
      </div>

      <p style={{ ...alinea, marginTop: 28 }}>
        <strong>Ben je meer dan één van deze?</strong> Bijvoorbeeld trainer en ook zelf gebruiker. Dan gelden voor jou
        de voorwaarden van elk van je rollen.
      </p>
      <p style={alinea}>
        Deze pagina zelf bevat geen afspraken. Die staan in de drie voorwaarden. Over wat we met je gegevens doen,
        lees je meer in de{' '}
        <Link href="/privacy" style={{ color: '#B34500', fontWeight: 600 }}>privacyverklaring</Link>.
      </p>
    </JuridischePagina>
  );
}
