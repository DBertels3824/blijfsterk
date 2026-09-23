'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ADMIN_EMAIL } from '@/lib/admin';

// Landelijke lijst van personal trainers (uit Google Maps, tabel trainer_kandidaten).
// Alleen voor Dirk: filteren, uitnodigingslink kopiëren, status en notitie bijhouden.

type Kandidaat = {
  id: number;
  naam: string;
  gemeente: string | null;
  adres: string | null;
  telefoon: string | null;
  website: string | null;
  email: string | null;
  email_bron: string | null;
  google_score: number | null;
  aantal_reviews: number;
  maps_link: string | null;
  status: string;
  notitie: string | null;
  uitgenodigd_op: string | null;
};

const STATUSSEN = ['nieuw', 'uitgenodigd', 'gereageerd', 'aangemeld', 'nee'] as const;

const statusKleur: Record<string, { bg: string; tekst: string }> = {
  nieuw: { bg: '#FFF8EE', tekst: '#8A7561' },
  uitgenodigd: { bg: '#FFF1DC', tekst: '#B9601A' },
  gereageerd: { bg: '#E8F1FB', tekst: '#2A5A8C' },
  aangemeld: { bg: '#EAF6E9', tekst: '#2E7D32' },
  nee: { bg: '#F3F3F3', tekst: '#777' },
};

const PAGINA = 50;

function uitnodigingslink(k: Kandidaat) {
  const q = new URLSearchParams();
  q.set('naam', k.naam);
  if (k.gemeente) q.set('plaats', k.gemeente);
  if (k.telefoon) q.set('telefoon', k.telefoon);
  if (k.website) q.set('website', k.website);
  const basis = typeof window !== 'undefined' ? window.location.origin : '';
  return `${basis}/word-partner?${q.toString()}`;
}

export default function KandidatenAdmin() {
  const router = useRouter();
  const [toegestaan, setToegestaan] = useState<boolean | null>(null);
  const [lijst, setLijst] = useState<Kandidaat[]>([]);
  const [laden, setLaden] = useState(true);
  const [zoek, setZoek] = useState('');
  const [gemeente, setGemeente] = useState('');
  const [status, setStatus] = useState('');
  const [minScore, setMinScore] = useState(4.5);
  const [minReviews, setMinReviews] = useState(10);
  const [pagina, setPagina] = useState(0);
  const [gekopieerd, setGekopieerd] = useState<number | null>(null);

  useEffect(() => {
    const laad = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      if (user.email !== ADMIN_EMAIL) { router.push('/dashboard'); return; }
      setToegestaan(true);

      // In stukken ophalen: Supabase geeft standaard max. 1000 rijen per keer.
      const alles: Kandidaat[] = [];
      for (let van = 0; ; van += 1000) {
        const { data } = await supabase
          .from('trainer_kandidaten')
          .select('id,naam,gemeente,adres,telefoon,website,email,email_bron,google_score,aantal_reviews,maps_link,status,notitie,uitgenodigd_op')
          .order('google_score', { ascending: false, nullsFirst: false })
          .order('aantal_reviews', { ascending: false })
          .range(van, van + 999);
        if (!data || data.length === 0) break;
        alles.push(...(data as Kandidaat[]));
        if (data.length < 1000) break;
      }
      setLijst(alles);
      setLaden(false);
    };
    laad();
  }, [router]);

  const gemeenten = useMemo(
    () => Array.from(new Set(lijst.map((k) => k.gemeente).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, 'nl')),
    [lijst]
  );

  const gefilterd = useMemo(() => {
    const z = zoek.trim().toLowerCase();
    return lijst.filter(
      (k) =>
        (!gemeente || k.gemeente === gemeente) &&
        (!status || k.status === status) &&
        (k.google_score ?? 0) >= minScore &&
        k.aantal_reviews >= minReviews &&
        (!z || k.naam.toLowerCase().includes(z) || (k.website || '').toLowerCase().includes(z))
    );
  }, [lijst, zoek, gemeente, status, minScore, minReviews]);

  const zichtbaar = gefilterd.slice(pagina * PAGINA, (pagina + 1) * PAGINA);
  const aantalPaginas = Math.max(1, Math.ceil(gefilterd.length / PAGINA));

  async function bewaar(id: number, velden: Partial<Kandidaat>) {
    setLijst((l) => l.map((k) => (k.id === id ? { ...k, ...velden } : k)));
    await supabase.from('trainer_kandidaten').update({ ...velden, bijgewerkt_op: new Date().toISOString() }).eq('id', id);
  }

  async function zetStatus(k: Kandidaat, nieuw: string) {
    const velden: Partial<Kandidaat> = { status: nieuw };
    if (nieuw === 'uitgenodigd' && !k.uitgenodigd_op) velden.uitgenodigd_op = new Date().toISOString();
    await bewaar(k.id, velden);
  }

  async function kopieerLink(k: Kandidaat) {
    try {
      await navigator.clipboard.writeText(uitnodigingslink(k));
      setGekopieerd(k.id);
      setTimeout(() => setGekopieerd(null), 1500);
    } catch {
      window.prompt('Kopieer deze link:', uitnodigingslink(k));
    }
  }

  const telling = STATUSSEN.map((s) => [s, lijst.filter((k) => k.status === s).length] as const);

  if (toegestaan === null || laden) return <p style={{ padding: 24 }}>Laden... (kan even duren, het zijn er veel)</p>;
  if (!toegestaan) return null;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px 60px' }}>
      <h1 style={{ fontSize: 26, margin: '0 0 6px' }}>Trainers uitnodigen</h1>
      <p style={{ color: '#6F5A48', margin: '0 0 16px' }}>
        Alleen zichtbaar voor jou · {lijst.length.toLocaleString('nl-NL')} trainers in de lijst ·{' '}
        {telling.map(([s, n]) => `${n} ${s}`).join(' · ')}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 18, alignItems: 'center' }}>
        <input
          value={zoek}
          onChange={(e) => { setZoek(e.target.value); setPagina(0); }}
          placeholder="Zoek op naam of website"
          style={veldStijl}
        />
        <select value={gemeente} onChange={(e) => { setGemeente(e.target.value); setPagina(0); }} style={veldStijl}>
          <option value="">Alle gemeenten</option>
          {gemeenten.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPagina(0); }} style={veldStijl}>
          <option value="">Alle statussen</option>
          {STATUSSEN.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <label style={{ fontSize: 13.5, color: '#6F5A48' }}>
          Score ≥{' '}
          <select value={minScore} onChange={(e) => { setMinScore(Number(e.target.value)); setPagina(0); }} style={{ ...veldStijl, minWidth: 70 }}>
            {[0, 4, 4.5, 4.8, 5].map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <label style={{ fontSize: 13.5, color: '#6F5A48' }}>
          Reviews ≥{' '}
          <select value={minReviews} onChange={(e) => { setMinReviews(Number(e.target.value)); setPagina(0); }} style={{ ...veldStijl, minWidth: 70 }}>
            {[0, 5, 10, 20, 50].map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>
        <span style={{ fontSize: 13.5, color: '#6F5A48', marginLeft: 'auto' }}>
          {gefilterd.length.toLocaleString('nl-NL')} gevonden
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {zichtbaar.map((k) => (
          <div key={k.id} style={{ borderRadius: 18, border: '2px solid #F3E4C8', background: '#FFFFFF', padding: '14px 16px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ flex: '1 1 320px', minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>
                  {k.naam}
                  {k.google_score != null && (
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#B9601A', marginLeft: 8 }}>
                      ★ {k.google_score.toFixed(1)} · {k.aantal_reviews} reviews
                    </span>
                  )}
                </div>
                <div style={{ color: '#6F5A48', fontSize: 14, marginTop: 2 }}>
                  {k.gemeente}{k.adres ? ` · ${k.adres}` : ''}
                </div>
                <div style={{ fontSize: 14, marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {k.telefoon && <span>{k.telefoon}</span>}
                  {k.website && <a href={k.website} target="_blank" rel="noreferrer" style={{ color: '#E85D00' }}>website</a>}
                  {k.maps_link && <a href={k.maps_link} target="_blank" rel="noreferrer" style={{ color: '#E85D00' }}>Google Maps</a>}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: '0 1 300px' }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <select
                    value={k.status}
                    onChange={(e) => zetStatus(k, e.target.value)}
                    style={{ ...veldStijl, minWidth: 130, background: statusKleur[k.status]?.bg, color: statusKleur[k.status]?.tekst, fontWeight: 700 }}
                  >
                    {STATUSSEN.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => kopieerLink(k)} style={knopStijl}>
                    {gekopieerd === k.id ? 'Gekopieerd ✓' : 'Kopieer uitnodigingslink'}
                  </button>
                </div>
                <input
                  defaultValue={k.email || ''}
                  placeholder="e-mailadres"
                  title={k.email_bron === 'aangenomen' ? 'Aangenomen (info@domein), niet op de website gevonden' : k.email_bron === 'website' ? 'Gevonden op de website' : ''}
                  onBlur={(e) => { if (e.target.value !== (k.email || '')) bewaar(k.id, { email: e.target.value || null, email_bron: 'handmatig' }); }}
                  style={{ ...veldStijl, width: '100%', borderColor: k.email_bron === 'aangenomen' ? '#FFBE0A' : '#F3E4C8' }}
                />
                <input
                  defaultValue={k.notitie || ''}
                  placeholder="notitie"
                  onBlur={(e) => { if (e.target.value !== (k.notitie || '')) bewaar(k.id, { notitie: e.target.value || null }); }}
                  style={{ ...veldStijl, width: '100%' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {aantalPaginas > 1 && (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
          <button onClick={() => setPagina((p) => Math.max(0, p - 1))} disabled={pagina === 0} style={knopStijl}>← Vorige</button>
          <span style={{ fontSize: 14, color: '#6F5A48' }}>Pagina {pagina + 1} van {aantalPaginas}</span>
          <button onClick={() => setPagina((p) => Math.min(aantalPaginas - 1, p + 1))} disabled={pagina >= aantalPaginas - 1} style={knopStijl}>Volgende →</button>
        </div>
      )}
    </div>
  );
}

const veldStijl: React.CSSProperties = {
  fontFamily: 'inherit',
  fontSize: 14,
  minHeight: 40,
  padding: '0 12px',
  borderRadius: 12,
  border: '2px solid #F3E4C8',
  background: '#FFFFFF',
  boxSizing: 'border-box',
};

const knopStijl: React.CSSProperties = {
  fontFamily: 'inherit',
  fontWeight: 700,
  fontSize: 13.5,
  minHeight: 40,
  padding: '0 14px',
  borderRadius: 999,
  border: '2px solid #F3E4C8',
  background: '#FFF8EE',
  color: '#2B1B0E',
  cursor: 'pointer',
};
