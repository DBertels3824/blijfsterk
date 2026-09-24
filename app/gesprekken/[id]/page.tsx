'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Het gesprek na een match: gebruiker, trainer en Dirk. Eenvoudige chat, dezelfde stijl
// als de Dirk-chat. Ververst elke 5 seconden (geen ingewikkelde realtime-koppeling nodig).

type Bericht = {
  id: string;
  afzender: 'gebruiker' | 'trainer' | 'dirk';
  afzender_user: string | null;
  tekst: string;
  aangemaakt_op: string;
};

type Gesprek = {
  id: string;
  status: string;
  user_id: string;
  trainer_id: string;
  trainers: { naam: string; plaats: string | null } | null;
};

const tijd = (iso: string) => new Date(iso).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function GesprekPagina() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const gesprekId = params?.id;
  const [gesprek, setGesprek] = useState<Gesprek | null>(null);
  const [berichten, setBerichten] = useState<Bericht[]>([]);
  const [mijnId, setMijnId] = useState('');
  const [mijnRol, setMijnRol] = useState<'gebruiker' | 'trainer'>('gebruiker');
  const [invoer, setInvoer] = useState('');
  const [versturen, setVersturen] = useState(false);
  const [fout, setFout] = useState('');
  const [laden, setLaden] = useState(true);
  const eindeRef = useRef<HTMLDivElement>(null);

  async function laadBerichten() {
    if (!gesprekId) return;
    const { data } = await supabase.from('berichten').select('*').eq('gesprek_id', gesprekId).order('aangemaakt_op');
    if (data) setBerichten(data as Bericht[]);
  }

  useEffect(() => {
    const start = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setMijnId(user.id);

      const { data: g } = await supabase
        .from('gesprekken')
        .select('id, status, user_id, trainer_id, trainers(naam, plaats)')
        .eq('id', gesprekId)
        .maybeSingle();
      if (!g) { router.push('/gesprekken'); return; }
      const gesprekData = g as unknown as Gesprek;
      setGesprek(gesprekData);
      setMijnRol(gesprekData.user_id === user.id ? 'gebruiker' : 'trainer');
      await laadBerichten();
      setLaden(false);
    };
    start();
    const timer = setInterval(laadBerichten, 5000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gesprekId, router]);

  useEffect(() => {
    eindeRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [berichten.length]);

  async function verstuur() {
    const tekst = invoer.trim();
    if (!tekst || versturen || !gesprek) return;
    setVersturen(true);
    setFout('');
    const { error } = await supabase.from('berichten').insert({
      gesprek_id: gesprek.id,
      afzender: mijnRol,
      afzender_user: mijnId,
      tekst,
    });
    setVersturen(false);
    if (error) {
      setFout('Versturen lukte niet. Probeer het nog eens.');
      return;
    }
    setInvoer('');
    await supabase.from('gesprekken').update({ laatste_bericht_op: new Date().toISOString() }).eq('id', gesprek.id);
    await laadBerichten();
  }

  if (laden || !gesprek) return <p style={{ padding: 24 }}>Laden...</p>;

  const titel = mijnRol === 'gebruiker' ? gesprek.trainers?.naam || 'Je trainer' : 'Je nieuwe klant';
  const naamVan = (b: Bericht) => {
    if (b.afzender === 'dirk') return 'Dirk (Blijf Sterk)';
    if (b.afzender_user === mijnId) return 'Jij';
    return b.afzender === 'trainer' ? gesprek.trainers?.naam?.split(' ')[0] || 'Trainer' : 'Klant';
  };

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', minHeight: 480 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid #F3E4C8', background: '#FFFFFF' }}>
        <Link href="/gesprekken" style={{ fontSize: 13.5, fontWeight: 700, color: '#E85D00', textDecoration: 'none' }}>←</Link>
        <div style={{ width: 38, height: 38, borderRadius: 999, background: 'linear-gradient(135deg,#FFBE0A,#FF8601)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#3A1E00' }}>
          {titel.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{titel}</div>
          <div style={{ fontSize: 12.5, color: '#8A7561' }}>Dirk leest mee</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {berichten.map((b) => {
          const vanMij = b.afzender_user === mijnId && b.afzender !== 'dirk';
          const vanDirk = b.afzender === 'dirk';
          return (
            <div key={b.id} style={{ alignSelf: vanMij ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: vanDirk ? '#E85D00' : '#8A7561', marginBottom: 4, textTransform: vanDirk ? 'uppercase' : 'none', letterSpacing: vanDirk ? '.04em' : 0 }}>
                {naamVan(b)} · {tijd(b.aangemaakt_op)}
              </div>
              <div
                style={{
                  background: vanMij ? '#E85D00' : vanDirk ? '#FFF1DC' : '#FFFFFF',
                  color: vanMij ? '#FFFFFF' : '#2B1B0E',
                  border: vanMij ? 'none' : '1px solid #F3E4C8',
                  borderRadius: vanMij ? '18px 18px 5px 18px' : '18px 18px 18px 5px',
                  padding: '12px 16px', whiteSpace: 'pre-line', lineHeight: 1.6, fontSize: 16,
                }}
              >
                {b.tekst}
              </div>
            </div>
          );
        })}
        <div ref={eindeRef} />
      </div>

      <div style={{ padding: '10px 12px 14px', borderTop: '1px solid #F3E4C8', background: '#FFFFFF' }}>
        {fout && <p style={{ margin: '0 0 8px', fontSize: 13.5, color: '#B3261E', fontWeight: 600 }}>{fout}</p>}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={invoer}
            onChange={(e) => setInvoer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && verstuur()}
            placeholder="Typ je bericht..."
            style={{ fontFamily: 'inherit', fontSize: 16, width: '100%', minHeight: 50, borderRadius: 16, border: '2px solid #F3E4C8', background: '#FFF8EE', padding: '0 16px', color: '#2B1B0E' }}
          />
          <button
            onClick={verstuur}
            disabled={versturen}
            style={{ width: 50, height: 50, borderRadius: 16, border: 'none', flexShrink: 0, background: 'linear-gradient(135deg,#FFBE0A,#FF8601)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: versturen ? 'default' : 'pointer', opacity: versturen ? 0.7 : 1 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 20l16-8L4 4v6l10 2-10 2v6z" fill="#3A1E00" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
