'use client';

import { useEffect, useState } from 'react';

const OPSLAG_SLEUTEL = 'bs-grote-tekst';
const GEBEURTENIS = 'blijfsterk:tekstgrootte-wijzig';

// Grote, makkelijk te vinden knop om de hele site groter te maken — voor wie
// moeite heeft met kleine tekst. Staat in de header op elke pagina (UX-punt 10):
// het zet een voorkeur die TekstgrootteWrapper (in layout.tsx) toepast.
// `compact` = alleen "A+" met een kort woord, voor in de bovenbalk.
export default function TekstgrootteKnop({ compact = false, volleBreedte = false }: { compact?: boolean; volleBreedte?: boolean }) {
  const [groot, setGroot] = useState(false);

  useEffect(() => {
    const lees = () => {
      try {
        setGroot(localStorage.getItem(OPSLAG_SLEUTEL) === 'aan');
      } catch {
        // negeren
      }
    };
    lees();
    // Meerdere knoppen op één pagina (bovenbalk + mobiel menu) blijven zo gelijk.
    window.addEventListener(GEBEURTENIS, lees);
    return () => window.removeEventListener(GEBEURTENIS, lees);
  }, []);

  function wisselen() {
    const nieuw = !groot;
    setGroot(nieuw);
    try {
      localStorage.setItem(OPSLAG_SLEUTEL, nieuw ? 'aan' : 'uit');
    } catch {
      // Opslag niet beschikbaar (bijv. privénavigatie) — knop werkt dan alleen voor deze weergave.
    }
    window.dispatchEvent(new Event(GEBEURTENIS));
  }

  return (
    <button
      onClick={wisselen}
      aria-pressed={groot}
      title={groot ? 'Normale letters' : 'Grotere letters'}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        fontFamily: 'inherit', fontWeight: 700, fontSize: 15,
        borderRadius: 999, border: '2px solid #F3E4C8',
        background: groot ? '#2B1B0E' : '#FFFFFF',
        color: groot ? '#FFFFFF' : '#2B1B0E',
        padding: compact ? '0 14px' : '0 18px', minHeight: compact ? 44 : 48,
        cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
        width: volleBreedte ? '100%' : undefined,
      }}
    >
      <span style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>A+</span>
      {compact ? (groot ? 'Normaal' : 'Groter') : groot ? 'Normale letters' : 'Grotere letters'}
    </button>
  );
}
