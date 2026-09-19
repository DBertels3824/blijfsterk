'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { OEFENINGEN } from '@/lib/oefeningen';
import { WEEKSCHEMA, berekenWeekstatus, type Weekstatus } from '@/lib/weekschema';

const card: React.CSSProperties = {
  borderRadius: 24,
  border: '2px solid #F3E4C8',
  background: '#FFFFFF',
  padding: 20,
};

function startVanDeWeek(): Date {
  const nu = new Date();
  const dagIndex = (nu.getDay() + 6) % 7; // 0 = maandag
  const maandag = new Date(nu);
  maandag.setDate(nu.getDate() - dagIndex);
  maandag.setHours(0, 0, 0, 0);
  return maandag;
}

const statusKleur: Record<Weekstatus['soort'], { achtergrond: string; rand: string; tekst: string }> = {
  gehaald: { achtergrond: '#EAF6E9', rand: '#BFE3BC', tekst: '#2E7D32' },
  op_schema: { achtergrond: '#FFF8EE', rand: '#F3E4C8', tekst: '#8A7561' },
  risico: { achtergrond: '#FDEDEA', rand: '#F4C2B8', tekst: '#B3261E' },
};

export default function WeekschemaPagina() {
  const router = useRouter();
  const [laden, setLaden] = useState(true);
  const [weekstatus, setWeekstatus] = useState<Weekstatus | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push('/login');
        return;
      }

      const maandag = startVanDeWeek();
      const { data: weekData } = await supabase
        .from('voortgang')
        .select('created_at')
        .eq('user_id', data.user.id)
        .gte('created_at', maandag.toISOString());

      if (weekData) {
        const dagenMetTraining = new Set(
          weekData.map((rij: any) => (new Date(rij.created_at).getDay() + 6) % 7)
        );
        setWeekstatus(berekenWeekstatus(dagenMetTraining.size));
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

      {weekstatus && (
        <div
          style={{
            fontSize: 13.5, fontWeight: 700, lineHeight: 1.6, borderRadius: 14, padding: '12px 16px', marginBottom: 16,
            background: statusKleur[weekstatus.soort].achtergrond,
            border: `2px solid ${statusKleur[weekstatus.soort].rand}`,
            color: statusKleur[weekstatus.soort].tekst,
          }}
        >
          {weekstatus.bericht}
        </div>
      )}

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
