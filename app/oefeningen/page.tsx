'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { OEFENINGEN, CATEGORIEEN, BENODIGDHEDEN, type Oefening } from '@/lib/oefeningen';
import { OEFENING_POSES } from '@/lib/oefening-poses';
import { OEFENING_VIDEOS, VIDEO_OPMERKINGEN } from '@/lib/oefening-videos';
import { willekeurigeMotivatie } from '@/lib/motivatie';
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

      <Link
        href="/advies"
        style={{
          display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none',
          background: '#FFFFFF', border: '2px solid #F3E4C8', borderRadius: 20,
          padding: '14px 16px', marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 44, height: 44, borderRadius: 999, flexShrink: 0,
            background: 'linear-gradient(135deg,#FFBE0A,#FF8601)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, color: '#3A1E00',
          }}
        >
          D
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#2B1B0E' }}>Niet zeker waar je moet beginnen?</div>
          <div style={{ fontSize: 13.5, color: '#8A7561', marginTop: 2 }}>Vraag het Dirk, je AI-coach, voor persoonlijk advies →</div>
        </div>
      </Link>

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
  const [bezig, setBezig] = useState(false);
  const [motivatie, setMotivatie] = useState('');
  const animatie = OEFENING_POSES[oefening.id];
  const video = OEFENING_VIDEOS[oefening.id];
  const videoOpmerking = VIDEO_OPMERKINGEN[oefening.id];

  async function markeerGedaan() {
    if (bezig) return;
    setBezig(true);
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      setBezig(false);
      return;
    }
    const { error } = await supabase.from('voortgang').insert({ user_id: user.id, oefening_id: oefening.id });
    setBezig(false);
    if (!error) {
      setMotivatie(willekeurigeMotivatie());
      setTimeout(() => setMotivatie(''), 5000);
    }
  }

  return (
    <div style={card}>
      {video && (
        <>
          <div
            style={{
              width: '100%',
              aspectRatio: '4 / 3',
              borderRadius: 16,
              marginBottom: videoOpmerking ? 8 : 14,
              background: '#FFF1DC',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <video
              src={video}
              autoPlay
              loop
              muted
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          </div>
          {videoOpmerking && (
            <p style={{ fontSize: 12.5, color: '#B9601A', fontWeight: 700, margin: '0 0 14px' }}>
              {videoOpmerking}
            </p>
          )}
        </>
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
        onClick={markeerGedaan}
        disabled={bezig}
        style={{
          marginTop: 14, width: '100%', fontFamily: 'inherit', fontWeight: 700, fontSize: 14.5,
          borderRadius: 999, minHeight: 46, border: '2px solid #F3E4C8', background: '#FFF8EE',
          color: '#2B1B0E', cursor: bezig ? 'default' : 'pointer', opacity: bezig ? 0.7 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M4 12.5l5 5L20 6.5" stroke="#E85D00" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {bezig ? 'Bezig...' : 'Ik heb dit gedaan'}
      </button>

      {motivatie && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 999, flexShrink: 0,
              background: 'linear-gradient(135deg,#FFBE0A,#FF8601)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 13, color: '#3A1E00',
            }}
          >
            D
          </div>
          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: '#2B1B0E' }}>{motivatie}</p>
        </div>
      )}

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
