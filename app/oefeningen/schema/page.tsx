'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { OEFENINGEN, type Oefening } from '@/lib/oefeningen';

const card: React.CSSProperties = {
  borderRadius: 24,
  border: '2px solid #F3E4C8',
  background: '#FFFFFF',
  padding: 20,
};

// Eenvoudig, algemeen voorbeeldschema — geen persoonlijk trainingsschema.
// Verdeelt de categorieën uit de bibliotheek over 3 trainingsdagen per week.
const WEEKSCHEMA: { dag: string; categorieen: Oefening['categorie'][] }[] = [
  { dag: 'Dag 1', categorieen: ['Warming-up', 'Benen & balans', 'Rug & schouders'] },
  { dag: 'Dag 2', categorieen: ['Warming-up', 'Buik & core', 'Armen'] },
  { dag: 'Dag 3', categorieen: ['Warming-up', 'Benen & balans', 'Buik & core'] },
];

export default function WeekschemaPagina() {
  const router = useRouter();
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login');
        return;
      }
      setLaden(false);
    });
  }, [router]);

  if (laden) return <p style={{ padding: 24 }}>Laden...</p>;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 20px 60px' }}>
      <Link href="/oefeningen" style={{ fontSize: 13.5, fontWeight: 700, color: '#E85D00', textDecoration: 'none' }}>
        ← Naar de oefeningenbibliotheek
      </Link>

      <h1 style={{ fontSize: 26, margin: '10px 0 6px' }}>Jouw weekschema</h1>
      <p style={{ color: '#8A7561', margin: '0 0 16px' }}>
        Een eenvoudig voorbeeldschema van 3 trainingsdagen per week, opgebouwd uit de oefeningenbibliotheek.
      </p>

      <div style={{ fontSize: 13, color: '#8A7561', lineHeight: 1.6, background: '#FFF8EE', borderRadius: 14, padding: '12px 16px', marginBottom: 24 }}>
        Dit is een algemeen voorbeeld, geen persoonlijk schema. Pas de dagen zelf aan op je eigen ritme — bouw rustig
        op en las minimaal 1 rustdag in tussen twee trainingsdagen. Twijfel je? Overleg met je huisarts of
        fysiotherapeut.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {WEEKSCHEMA.map((item) => (
          <div key={item.dag} style={card}>
            <p style={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#8A7561', marginBottom: 12 }}>
              {item.dag}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {item.categorieen.map((categorie) => {
                const oefeningen = OEFENINGEN.filter((o) => o.categorie === categorie);
                return (
                  <div key={categorie}>
                    <p style={{ fontWeight: 700, fontSize: 14.5, margin: '0 0 4px' }}>{categorie}</p>
                    <p style={{ fontSize: 13.5, color: '#5A4636', margin: 0, lineHeight: 1.6 }}>
                      {oefeningen.map((o) => o.naam).join(' · ')}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 13, color: '#8A7561', marginTop: 20 }}>
        Zie de <Link href="/oefeningen" style={{ color: '#E85D00', fontWeight: 700 }}>oefeningenbibliotheek</Link> voor
        de uitleg, stappen en veiligheidstips per oefening.
      </p>
    </div>
  );
}
