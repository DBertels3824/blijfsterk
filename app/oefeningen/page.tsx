'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { OEFENINGEN, CATEGORIEEN, BENODIGDHEDEN, type Oefening } from '@/lib/oefeningen';
import { OEFENING_POSES } from '@/lib/oefening-poses';
import { OEFENING_VIDEOS } from '@/lib/oefening-videos';
import OefeningAnimatie from '@/app/components/OefeningAnimatie';

const card: React.CSSProperties = {
  borderRadius: 24,
  border: '2px solid #F3E4C8',
  background: '#FFFFFF',
  padding: 20,
};

export default function OefeningenPagina() {
  const router = useRouter();
  const [laden, setLaden] = useState(true);
  const [filter, setFilter] = useState<(typeof BENODIGDHEDEN)[number]>('Alles');

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

  const zichtbaar: Oefening[] = OEFENINGEN.filter(
    (o) => filter === 'Alles' || o.benodigdheden.includes(filter)
  );

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 20px 60px' }}>
      <h1 style={{ fontSize: 26, margin: '0 0 6px' }}>Oefeningenbibliotheek</h1>
      <p style={{ color: '#8A7561', margin: '0 0 16px' }}>
        Rustige basisoefeningen om thuis te doen — met je weerstandsband, fitnessmatje, of gewoon een flesje water
        als vervanger voor gewichten.
      </p>

      <div style={{ fontSize: 13, color: '#8A7561', lineHeight: 1.6, background: '#FFF8EE', borderRadius: 14, padding: '12px 16px', marginBottom: 16 }}>
        Stop meteen bij pijn, duizeligheid of kortademigheid. Twijfel je of een oefening geschikt is voor jou? Overleg
        eerst met je huisarts of fysiotherapeut. Deze bibliotheek is een eerste, voorzichtige versie en nog niet
        beoordeeld door een fysiotherapeut of sportarts. De video's en illustraties zijn een ondersteuning bij de
        uitleg — volg voor de precieze uitvoering altijd de geschreven stappen.
      </div>

      <Link
        href="/oefeningen/schema"
        style={{
          display: 'block', textAlign: 'center', fontFamily: 'inherit', fontWeight: 700, fontSize: 14.5,
          borderRadius: 999, padding: '12px 16px', marginBottom: 24, textDecoration: 'none',
          background: 'linear-gradient(135deg,#FFBE0A,#FF8601)', color: '#3A1E00',
        }}
      >
        Bekijk je weekschema →
      </Link>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {BENODIGDHEDEN.map((b) => (
          <button
            key={b}
            onClick={() => setFilter(b)}
            style={{
              fontFamily: 'inherit', fontWeight: 700, fontSize: 13, padding: '8px 16px', borderRadius: 999,
              border: filter === b ? 'none' : '2px solid #F3E4C8', cursor: 'pointer',
              background: filter === b ? 'linear-gradient(135deg,#FFBE0A,#FF8601)' : '#FFFFFF',
              color: filter === b ? '#3A1E00' : '#5A4636',
            }}
          >
            {b}
          </button>
        ))}
      </div>

      {CATEGORIEEN.map((categorie) => {
        const inCategorie = zichtbaar.filter((o) => o.categorie === categorie);
        if (inCategorie.length === 0) return null;
        return (
          <div key={categorie} style={{ marginBottom: 28 }}>
            <p style={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#8A7561', marginBottom: 12 }}>
              {categorie}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {inCategorie.map((oefening) => (
                <OefeningKaart key={oefening.id} oefening={oefening} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OefeningKaart({ oefening }: { oefening: Oefening }) {
  const [open, setOpen] = useState(false);
  const animatie = OEFENING_POSES[oefening.id];
  const video = OEFENING_VIDEOS[oefening.id];

  return (
    <div style={card}>
      {video && (
        <video
          src={video}
          autoPlay
          loop
          muted
          playsInline
          style={{ width: '100%', borderRadius: 16, display: 'block', marginBottom: 14, background: '#FFF1DC' }}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {!video && animatie && (
          <OefeningAnimatie start={animatie.start} eind={animatie.eind} statisch={animatie.statisch} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 17 }}>{oefening.naam}</div>
          <p style={{ color: '#8A7561', fontSize: 14, margin: '4px 0 0' }}>{oefening.uitleg}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
        {oefening.benodigdheden.map((b) => (
          <span
            key={b}
            style={{ fontSize: 12, fontWeight: 700, color: '#B9601A', background: '#FFF1DC', borderRadius: 999, padding: '4px 10px' }}
          >
            {b}
          </span>
        ))}
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        style={{ marginTop: 14, fontSize: 13.5, background: 'none', border: 'none', color: '#E85D00', cursor: 'pointer', padding: 0, fontWeight: 700 }}
      >
        {open ? 'Verberg uitleg' : 'Bekijk stappen'}
      </button>

      {open && (
        <div style={{ marginTop: 14 }}>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14.5, lineHeight: 1.7, color: '#2B1B0E' }}>
            {oefening.stappen.map((stap, i) => (
              <li key={i}>{stap}</li>
            ))}
          </ol>
          <p style={{ fontSize: 13.5, fontWeight: 700, marginTop: 12, marginBottom: 0 }}>{oefening.setsHerhalingen}</p>
          <p style={{ fontSize: 13, color: '#8A7561', marginTop: 6, marginBottom: 0 }}>{oefening.veiligheid}</p>
        </div>
      )}
    </div>
  );
}
