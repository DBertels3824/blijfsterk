'use client';

import type { CSSProperties, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

// De foto van de homepage als zachte achtergrond op elke pagina, met een crème-laag
// eroverheen zodat tekst en knoppen goed leesbaar blijven.
//
// De foto staat in een vaste laag ter grootte van het scherm (position: fixed),
// los van de lengte van de pagina. Zo zie je altijd de hele foto, ook op korte
// pagina's — niet alleen een bovenrandje — en blijft hij rustig staan tijdens het
// scrollen. (Bewust geen background-attachment: fixed — dat werkt niet op iPhone.)
//
// Op de homepage zelf niet: daar staat de foto al groot in beeld.
const fotoLaag: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: -1,
  backgroundImage:
    'linear-gradient(180deg, rgba(255,248,238,0.80) 0%, rgba(255,248,238,0.86) 55%, rgba(255,248,238,0.94) 100%), url(/hero-photo.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center 35%',
  pointerEvents: 'none',
};

export default function PaginaAchtergrond({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const opHomepage = pathname === '/';

  return (
    <>
      {!opHomepage && <div aria-hidden="true" style={fotoLaag} />}
      <main style={{ flex: 1 }}>{children}</main>
    </>
  );
}
