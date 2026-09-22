'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// De losse chatpagina is vervangen door Dirk als zwevende chat op elke pagina.
// Oude links naar /advies komen zo netjes uit op het dashboard, met Dirk open.
export default function AdviesPagina() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard?coach=1');
  }, [router]);

  return <p style={{ padding: 24 }}>Even geduld...</p>;
}
