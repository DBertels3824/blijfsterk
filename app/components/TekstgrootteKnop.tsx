'use client';

import { useEffect, useState } from 'react';

const OPSLAG_SLEUTEL = 'bs-grote-tekst';
const GEBEURTENIS = 'blijfsterk:tekstgrootte-wijzig';

// Grote, makkelijk te vinden knop om de hele site groter te maken — voor wie
// moeite heeft met kleine tekst. Werkt overal, niet alleen op deze pagina: het
// zet een voorkeur die TekstgrootteWrapper (in layout.tsx) toepast.
export default function TekstgrootteKnop() {
  const [groot, setGroot] = useState(false);

  useEffect(() => {
    try {
      setGroot(localStorage.getItem(OPSLAG_SLEUTEL) === 'aan');
    } catch {
      // negeren
    }
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
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        fontFamily: 'inherit', fontWeight: 700, fontSize: 14.5,
        borderRadius: 999, border: '2px solid #F3E4C8',
        background: groot ? '#2B1B0E' : '#FFFFFF',
        color: groot ? '#FFFFFF' : '#2B1B0E',
        padding: '10px 18px', cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: 17, fontWeight: 800 }}>A+</span>
      {groot ? 'Normale letters' : 'Grotere letters'}
    </button>
  );
}
