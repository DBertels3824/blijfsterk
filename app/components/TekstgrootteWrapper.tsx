'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

// 'zoom' bestaat niet in het standaard React CSSProperties-type, maar wordt door
// alle moderne browsers ondersteund — vandaar deze kleine uitbreiding.
type StijlMetZoom = CSSProperties & { zoom?: number };

// Onthoudt of de bezoeker "grotere letters" heeft aangezet (via TekstgrootteKnop)
// en past dat toe op de hele site door de pagina uit te vergroten. We gebruiken
// bewust CSS zoom in plaats van elk lettertype los aan te passen — de site is
// overal met vaste pixel-waarden opgebouwd, dus dit is de simpelste manier om
// alles tegelijk groter te maken, inclusief knoppen en iconen.
const OPSLAG_SLEUTEL = 'bs-grote-tekst';
const GEBEURTENIS = 'blijfsterk:tekstgrootte-wijzig';

export default function TekstgrootteWrapper({ children }: { children: ReactNode }) {
  const [groot, setGroot] = useState(false);

  useEffect(() => {
    try {
      setGroot(localStorage.getItem(OPSLAG_SLEUTEL) === 'aan');
    } catch {
      // Privénavigatie of geblokkeerde opslag — gewoon met de standaardgrootte verder.
    }

    function verwerkWijziging() {
      try {
        setGroot(localStorage.getItem(OPSLAG_SLEUTEL) === 'aan');
      } catch {
        // negeren
      }
    }
    window.addEventListener(GEBEURTENIS, verwerkWijziging);
    return () => window.removeEventListener(GEBEURTENIS, verwerkWijziging);
  }, []);

  // Neemt de flex-layout van <body> over (min-h-full flex flex-col), zodat de
  // footer onderaan blijft plakken zoals voorheen — deze div zit er nu tussenin.
  const stijl: StijlMetZoom = { minHeight: '100%', ...(groot ? { zoom: 1.25 } : {}) };

  return (
    <div className="flex flex-col" style={stijl}>
      {children}
    </div>
  );
}
