'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Bericht = {
  role: 'user' | 'assistant';
  content: string;
  agent?: string;
};

export default function AdviesPagina() {
  const router = useRouter();
  const [berichten, setBerichten] = useState<Bericht[]>([]);
  const [invoer, setInvoer] = useState('');
  const [laden, setLaden] = useState(true);
  const [versturen, setVersturen] = useState(false);
  const profielRef = useRef<any>(null);
  const eindeRef = useRef<HTMLDivElement>(null);
  const gestart = useRef(false);

  useEffect(() => {
    if (gestart.current) return;
    gestart.current = true;

    const start = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profielData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const risicoGesignaleerd = !!(
        profielData?.risico_hart ||
        profielData?.risico_duizeligheid ||
        profielData?.risico_bot_gewricht ||
        profielData?.risico_medicatie ||
        profielData?.risico_zwangerschap
      );

      profielRef.current = { ...profielData, risicoGesignaleerd };

      await vraagCoach([]);
      setLaden(false);
    };
    start();
  }, [router]);

  useEffect(() => {
    eindeRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [berichten]);

  const vraagCoach = async (nieuweBerichten: Bericht[]) => {
    const res = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profiel: profielRef.current, berichten: nieuweBerichten }),
    });
    const data = await res.json();
    setBerichten((huidig) => [...huidig, { role: 'assistant', content: data.tekst, agent: data.agent }]);
  };

  const versturenHandler = async () => {
    if (!invoer.trim() || versturen) return;
    const userBericht: Bericht = { role: 'user', content: invoer };
    const nieuweBerichten = [...berichten, userBericht];
    setBerichten(nieuweBerichten);
    setInvoer('');
    setVersturen(true);
    await vraagCoach(nieuweBerichten);
    setVersturen(false);
  };

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', height: '85vh' }}>

      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 20px 16px', borderBottom: '1px solid #F3E4C8', background: '#FFFFFF' }}>
        <div
          style={{
            width: 44, height: 44, borderRadius: 999, flexShrink: 0,
            background: 'linear-gradient(135deg,#FFBE0A,#FF8601)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, color: '#3A1E00',
          }}
        >
          S
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Sam, jouw AI-coach</div>
          <div style={{ fontSize: 13, color: '#8A7561' }}>Training &amp; voeding</div>
        </div>
      </div>

      {/* messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {laden && <p style={{ color: '#8A7561', fontSize: 14.5 }}>Even denken...</p>}

        {berichten.map((bericht, i) => (
          <div key={i} style={{ alignSelf: bericht.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '84%' }}>
            {bericht.role === 'assistant' && bericht.agent && (
              <div style={{ fontSize: 11, fontWeight: 700, color: '#E85D00', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '.04em' }}>
                {bericht.agent}
              </div>
            )}
            {bericht.role === 'assistant' ? (
              <div style={{ background: '#FFFFFF', border: '1px solid #F3E4C8', borderRadius: '20px 20px 20px 6px', padding: '16px 18px', whiteSpace: 'pre-line', lineHeight: 1.6, fontSize: 15 }}>
                {bericht.content}
              </div>
            ) : (
              <div style={{ background: '#E85D00', color: '#FFFFFF', borderRadius: '20px 20px 6px 20px', padding: '14px 18px', fontWeight: 500, whiteSpace: 'pre-line', lineHeight: 1.6, fontSize: 15 }}>
                {bericht.content}
              </div>
            )}
          </div>
        ))}
        <div ref={eindeRef}></div>
      </div>

      {/* input */}
      <div style={{ display: 'flex', gap: 10, padding: '14px 16px 20px', borderTop: '1px solid #F3E4C8', background: '#FFFFFF' }}>
        <input
          value={invoer}
          onChange={(e) => setInvoer(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && versturenHandler()}
          placeholder="Typ je vraag..."
          style={{
            fontFamily: 'inherit', fontSize: 16, width: '100%', minHeight: 52,
            borderRadius: 999, border: '2px solid #F3E4C8', background: '#FFF8EE',
            padding: '0 20px', color: '#2B1B0E',
          }}
        />
        <button
          onClick={versturenHandler}
          disabled={versturen}
          style={{
            width: 52, height: 52, borderRadius: 999, border: 'none', flexShrink: 0,
            background: 'linear-gradient(135deg,#FFBE0A,#FF8601)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: versturen ? 'default' : 'pointer', opacity: versturen ? 0.7 : 1,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 20l16-8L4 4v6l10 2-10 2v6z" fill="#3A1E00" /></svg>
        </button>
      </div>
    </div>
  );
}
