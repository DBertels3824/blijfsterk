'use client';

import { SPONSORS } from '@/lib/sponsors';

const MIN_HERHALING = 6; // zorgt dat de balk altijd breed genoeg is om echt door het beeld te lopen, ook met weinig sponsors

export default function SponsorBanner() {
  if (SPONSORS.length === 0) return null;

  // vul aan tot minimaal MIN_HERHALING logo's, en verdubbel dat dan voor een naadloze loop
  const basisSet = Array.from(
    { length: Math.max(MIN_HERHALING, SPONSORS.length) },
    (_, i) => SPONSORS[i % SPONSORS.length]
  );
  const logos = [...basisSet, ...basisSet];
  const duurInSeconden = basisSet.length * 4; // vaste snelheid per logo, ongeacht aantal sponsors

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderTop: '1px solid #F3E4C8',
        borderBottom: '1px solid #F3E4C8',
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
          {logos.map((sponsor, i) =>
            sponsor.url ? (
              <a
                key={`${sponsor.naam}-${i}`}
                href={sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ flexShrink: 0 }}
              >
                <img src={sponsor.logo} alt={sponsor.naam} style={{ height: 32, width: 'auto', opacity: 0.85 }} />
              </a>
            ) : (
              <img
                key={`${sponsor.naam}-${i}`}
                src={sponsor.logo}
                alt={sponsor.naam}
                style={{ height: 32, width: 'auto', opacity: 0.85, flexShrink: 0 }}
              />
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
