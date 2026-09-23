'use client';

import type { CSSProperties, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

// De foto van de homepage als zachte achtergrond op elke pagina, met een crème-laag
// eroverheen zodat tekst en knoppen goed leesbaar blijven. Op de homepage zelf niet:
// daar staat de foto al groot in beeld.
const achtergrond: CSSProperties = {
  flex: 1,
  backgroundImage:
    'linear-gradient(180deg, rgba(255,248,238,0.78) 0%, rgba(255,248,238,0.86) 60%, rgba(255,248,238,0.96) 100%), url(/hero-photo.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center top',
};

export default function PaginaAchtergrond({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const opHomepage = pathname === '/';

  return <main style={opHomepage ? { flex: 1 } : achtergrond}>{children}</main>;
}
