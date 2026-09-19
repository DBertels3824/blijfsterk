'use client';

import { SPONSORS } from '@/lib/sponsors';

const AANTAL_HERHALINGEN = 3; // hoeveel keer de set (logo's + oproep) door het beeld loopt

type BannerItem =
  | { soort: 'logo'; naam: string; logo: string; url?: string }
  | { soort: 'tekst'; tekst: string };

export default function SponsorBanner() {
  if (SPONSORS.length === 0) return null;

  // Elk sponsor-logo wordt gevolgd door een oproeptekst — zo staat niet steeds
  // hetzelfde logo naast elkaar, en nodigt de banner meteen nieuwe sponsors uit.
  const ronde: BannerItem[] = SPONSORS.flatMap((sponsor) => [
    { soort: 'logo' as const, naam: sponsor.naam, logo: sponsor.logo, url: sponsor.url },
    { soort: 'tekst' as const, tekst: 'Komt hier uw logo?' },
  ]);
  const basisSet = Array.from({ length: AANTAL_HERHALINGEN }, () => ronde).flat();
  const items = [...basisSet, ...basisSet]; // verdubbelen voor een naadloze loop
  const duurInSeconden = basisSet.length * 4; // vaste snelheid per item, ongeacht aantal sponsors

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderTop: '1px solid #F3E4C8',
        padding: '20px 0',
        overflow: 'hidden',
      }}
    >
      <p
        style={{
          textAlign: 'center',
          fontSize: 12.5,
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: '#8A7561',
          margin: '0 0 14px',
        }}
      >
        Blijf Sterk wordt mede mogelijk gemaakt door
      </p>
      <div style={{ overflow: 'hidden', width: '100%' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 56,
            width: 'max-content',
            animation: `blijfsterk-sponsor-scroll ${duurInSeconden}s linear infinite`,
          }}
        >
          {items.map((item, i) =>
            item.soort === 'logo' ? (
              item.url ? (
                <a
                  key={`logo-${i}`}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flexShrink: 0 }}
                >
                  <img src={item.logo} alt={item.naam} style={{ height: 32, width: 'auto', opacity: 0.85 }} />
                </a>
              ) : (
                <img
                  key={`logo-${i}`}
                  src={item.logo}
                  alt={item.naam}
                  style={{ height: 32, width: 'auto', opacity: 0.85, flexShrink: 0 }}
                />
              )
            ) : (
              <span
                key={`tekst-${i}`}
                style={{
                  flexShrink: 0,
                  fontWeight: 700,
                  fontSize: 14,
                  fontStyle: 'italic',
                  color: '#C99A57',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.tekst}
              </span>
            )
          )}
        </div>
      </div>

      <style>{`
        @keyframes blijfsterk-sponsor-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          div[style*="blijfsterk-sponsor-scroll"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
