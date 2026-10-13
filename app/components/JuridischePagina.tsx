import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { JURIDISCH_CONCEPT, JURIDISCH_VERSIE } from '@/lib/juridisch';

// Vaste opbouw voor de juridische pagina's (voorwaarden, privacy). Bewust
// zonder de "Deelnemen is gratis"-band van InfoPagina: hier hoort rust, geen
// verkoop. Grote letters, ruime regelafstand, korte alinea's.

export const kop2: CSSProperties = { fontSize: 22, margin: '36px 0 12px', color: '#2B1B0E', lineHeight: 1.3 };
export const kop3: CSSProperties = { fontSize: 18, margin: '24px 0 8px', color: '#2B1B0E', lineHeight: 1.35 };
export const alinea: CSSProperties = { fontSize: 17, lineHeight: 1.7, color: '#2B1B0E', margin: '0 0 14px' };
export const lijst: CSSProperties = { fontSize: 17, lineHeight: 1.7, color: '#2B1B0E', margin: '0 0 14px', paddingLeft: 24 };
export const lijstItem: CSSProperties = { marginBottom: 6 };

export function Inhoudsopgave({ items }: { items: { id: string; titel: string }[] }) {
  return (
    <nav aria-label="Inhoud" style={{ background: '#FFFFFF', border: '1px solid #F3E4C8', borderRadius: 18, padding: '18px 22px', margin: '24px 0 8px' }}>
      <p style={{ fontWeight: 700, fontSize: 15, color: '#6F5A48', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Inhoud</p>
      <ol style={{ margin: 0, paddingLeft: 22, fontSize: 16, lineHeight: 1.9 }}>
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} style={{ color: '#B34500', fontWeight: 600 }}>{i.titel}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default function JuridischePagina({
  label,
  titel,
  intro,
  children,
}: {
  label: string;
  titel: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 24px 72px' }}>
      <Link href="/" style={{ fontSize: 16, fontWeight: 700, color: '#B34500', textDecoration: 'none' }}>
        ← Terug naar de homepage
      </Link>

      <span
        style={{
          display: 'inline-flex', alignItems: 'center', marginTop: 22,
          background: '#FFFFFF', border: '1px solid #F3E4C8', borderRadius: 999,
          padding: '7px 16px', fontWeight: 600, fontSize: 15, color: '#B34500',
        }}
      >
        {label}
      </span>
      <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 38px)', lineHeight: 1.15, margin: '16px 0 0', fontWeight: 800, letterSpacing: '-0.01em', color: '#2B1B0E' }}>
        {titel}
      </h1>
      <p style={{ ...alinea, color: '#4A3624', marginTop: 16 }}>{intro}</p>
      <p style={{ fontSize: 15, color: '#6F5A48', margin: 0 }}>Versie: {JURIDISCH_VERSIE}</p>

      {JURIDISCH_CONCEPT && (
        <div
          role="note"
          style={{
            marginTop: 20, background: '#FFF1DC', border: '2px solid #F3E4C8', borderRadius: 14,
            padding: '12px 16px', fontSize: 15, lineHeight: 1.55, color: '#9E5A18',
          }}
        >
          <strong>Conceptversie.</strong> Deze tekst wordt nog door een jurist nagekeken. Tot die tijd kan de
          inhoud veranderen. Vragen? Mail ons gerust.
        </div>
      )}

      {children}

      <p style={{ marginTop: 40, fontSize: 15, color: '#6F5A48' }}>
        Zie ook: <Link href="/voorwaarden" style={{ color: '#B34500', fontWeight: 600 }}>Algemene voorwaarden</Link>
        {' · '}
        <Link href="/privacy" style={{ color: '#B34500', fontWeight: 600 }}>Privacyverklaring</Link>
      </p>
    </div>
  );
}
