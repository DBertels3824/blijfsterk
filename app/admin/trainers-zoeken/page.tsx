'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ADMIN_EMAIL } from '@/lib/admin';

type Resultaat = {
  id: string | null;
  naam: string;
  adres: string;
  rating: number | null;
  aantalReviews: number;
  telefoon: string | null;
  website: string | null;
  mapsLink: string | null;
};

const pil: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: 13,
  fontWeight: 700,
  borderRadius: 999,
  padding: '8px 16px',
  background: 'linear-gradient(135deg,#FFBE0A,#FF8601)',
  color: '#3A1E00',
  textDecoration: 'none',
};

const pilSecundair: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: 13,
  fontWeight: 700,
  borderRadius: 999,
  padding: '8px 16px',
  background: '#FFFFFF',
  color: '#E85D00',
  border: '2px solid #F3E4C8',
  textDecoration: 'none',
};

export default function TrainersZoekenAdmin() {
  const router = useRouter();
  const [toegestaan, setToegestaan] = useState<boolean | null>(null);
  const [plaats, setPlaats] = useState('');
  const [type, setType] = useState<'trainer' | 'voedingsdeskundige'>('trainer');
  const [resultaten, setResultaten] = useState<Resultaat[]>([]);
  const [zoeken, setZoeken] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [gezocht, setGezocht] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.email !== ADMIN_EMAIL) {
        router.push('/dashboard');
        return;
      }
      setToegestaan(true);
    };
    check();
  }, [router]);

  const zoek = async () => {
    if (!plaats.trim()) return;
    setZoeken(true);
    setFout(null);
    setGezocht(true);
    try {
      const res = await fetch('/api/echte-trainers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plaats, type }),
      });
      const data = await res.json();
      setResultaten(data.resultaten || []);
      setFout(data.fout || null);
    } catch {
      setResultaten([]);
      setFout('Zoeken bij Google is mislukt.');
    }
    setZoeken(false);
  };

  if (toegestaan === null) return <p style={{ padding: 24 }}>Laden...</p>;
  if (!toegestaan) return null;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 20px 60px' }}>
      <h1 style={{ fontSize: 26, margin: '0 0 6px' }}>Trainers zoeken</h1>
      <p style={{ color: '#8A7561', margin: '0 0 24px' }}>
        Alleen zichtbaar voor jou. Zoek echte trainers of voedingsdeskundigen op plaats, om ze zelf te benaderen als partner.
      </p>

      <div style={{ display: 'flex', gap: 8, background: '#FFFFFF', border: '2px solid #F3E4C8', borderRadius: 999, padding: 4, marginBottom: 16, maxWidth: 360 }}>
        {(['trainer', 'voedingsdeskundige'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            style={{
              flex: 1,
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: 14,
              padding: '10px 0',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              background: type === t ? 'linear-gradient(135deg,#FFBE0A,#FF8601)' : 'transparent',
              color: type === t ? '#3A1E00' : '#8A7561',
            }}
          >
            {t === 'trainer' ? 'Trainers' : 'Voeding'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <input
          type="text"
          value={plaats}
          onChange={(e) => setPlaats(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && zoek()}
          placeholder="Plaats, bijv. Utrecht"
          style={{
            fontFamily: 'inherit',
            flex: 1,
            padding: '0 16px',
            minHeight: 52,
            borderRadius: 14,
            border: '2px solid #F3E4C8',
            fontSize: 16,
            boxSizing: 'border-box',
          }}
        />
        <button
          onClick={zoek}
          disabled={zoeken || !plaats.trim()}
          style={{
            fontFamily: 'inherit', fontWeight: 700, fontSize: 15, borderRadius: 999,
            border: 'none', padding: '0 26px', minHeight: 52,
            background: 'linear-gradient(135deg,#FFBE0A,#FF8601)', color: '#3A1E00',
            cursor: zoeken ? 'default' : 'pointer', opacity: zoeken ? 0.7 : 1,
          }}
        >
          {zoeken ? 'Zoeken...' : 'Zoeken'}
        </button>
      </div>

      {gezocht && !zoeken && fout && (
        <p style={{ color: '#8A7561', fontSize: 14, marginTop: 20 }}>{fout}</p>
      )}
      {gezocht && !zoeken && !fout && resultaten.length === 0 && (
        <p style={{ color: '#8A7561', fontSize: 14, marginTop: 20 }}>Niks gevonden voor deze plaats.</p>
      )}

      {resultaten.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24 }}>
          {resultaten.map((item, i) => (
            <div key={item.id || i} style={{ borderRadius: 20, border: '2px solid #F3E4C8', background: '#FFFFFF', padding: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{item.naam}</div>
              {item.adres && <div style={{ color: '#8A7561', fontSize: 14, marginTop: 4 }}>{item.adres}</div>}
              {item.rating !== null && (
                <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: '#E85D00' }}>
                  ⭐ {item.rating.toFixed(1).replace('.', ',')} ({item.aantalReviews} reviews)
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                {item.telefoon && (
                  <a href={`tel:${item.telefoon}`} style={pil}>Bel</a>
                )}
                {item.website && (
                  <a href={item.website} target="_blank" rel="noopener noreferrer" style={pil}>Website</a>
                )}
                {item.mapsLink && (
                  <a href={item.mapsLink} target="_blank" rel="noopener noreferrer" style={pilSecundair}>Google Maps</a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
