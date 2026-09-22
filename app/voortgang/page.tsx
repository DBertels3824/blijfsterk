'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Los "training loggen" bestaat niet meer: je vinkt een oefening af in de
// oefeningenbibliotheek. Je voortgang zie je op /oefeningen/schema.
export default function VoortgangPagina() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/oefeningen/schema');
  }, [router]);

  return <p style={{ padding: 24 }}>Even geduld...</p>;
}
