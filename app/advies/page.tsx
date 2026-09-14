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
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', height: '82vh' }}>

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#B7A88F' }}>
          Jouw coach
        </div>
        <div style={{ fontSize: 13.5, color: '#B9601A', fontWeight: 500, marginTop: 4 }}>
          Kleine stappen, veel plezier in bewegen en goed eten.
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 0' }}>
        {laden && <p style={{ color: '#8A7561', fontSize: 14.5 }}>Even denken...</p>}

        {berichten.map((bericht, i) => (
          <div key={i} style={{ alignSelf: bericht.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
            {bericht.role === 'assistant' && bericht.agent && (
              <div style={{ fontSize: 11, fontWeight: 600, color: '#E85D00', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '.04em' }}>
                {bericht.agent}
              </div>
            )}
            <div
              style={{
                background: bericht.role === 'user' ? 'linear-gradient(135deg,#FF8601,#E85D00)' : '#FFFFFF',
                border: bericht.role === 'user' ? 'none' : '1px solid #F3E4C8',
                color: bericht.role === 'user' ? '#FFF8EE' : '#2B1B0E',
                padding: '14px 18px',
                borderRadius: bericht.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                whiteSpace: 'pre-line',
                lineHeight: 1.6,
                fontSize: 15,
              }}
            >
              {bericht.content}
            </div>
          </div>
        ))}
        <div ref={eindeRef}></div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, padding: '6px 6px 6px 18px', background: '#FFFFFF', border: '1px solid #F3E4C8', borderRadius: 16 }}>
        <input
          value={invoer}
          onChange={(e) => setInvoer(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && versturenHandler()}
          placeholder="Stel een vraag aan je coach..."
          style={{ flex: 1, padding: '10px 0', border: 'none', outline: 'none', fontSize: 15, background: 'transparent' }}
        />
        <button
          onClick={versturenHandler}
          disabled={versturen}
          style={{
            padding: '11px 22px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg,#FF8601,#E85D00)', color: '#FFF8EE',
            fontWeight: 600, fontSize: 14.5, cursor: versturen ? 'default' : 'pointer',
            opacity: versturen ? 0.7 : 1,
          }}
        >
          Stuur
        </button>
      </div>
    </div>
  );
}
