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
    <div style={{ maxWidth: 560, margin: '0 auto', padding: 24, display: 'flex', flexDirection: 'column', height: '85vh' }}>
      <h1>Jouw coach</h1>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, padding: '8px 0' }}>
        {laden && <p style={{ color: '#888' }}>Even denken...</p>}

        {berichten.map((bericht, i) => (
          <div key={i} style={{ alignSelf: bericht.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
            {bericht.role === 'assistant' && bericht.agent && (
              <div style={{ fontSize: 11, fontWeight: 600, color: '#E85D00', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '.04em' }}>
                {bericht.agent}
              </div>
            )}
            <div
              style={{
                background: bericht.role === 'user' ? '#E85D00' : '#f5efe4',
                color: bericht.role === 'user' ? 'white' : '#2B1B0E',
                padding: '10px 14px',
                borderRadius: 10,
                whiteSpace: 'pre-line',
                lineHeight: 1.5,
              }}
            >
              {bericht.content}
            </div>
          </div>
        ))}
        <div ref={eindeRef}></div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <input
          value={invoer}
          onChange={(e) => setInvoer(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && versturenHandler()}
          placeholder="Stel een vraag aan je coach..."
          style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #ccc' }}
        />
        <button
          onClick={versturenHandler}
          disabled={versturen}
          style={{ padding: '10px 20px', borderRadius: 8, background: '#E85D00', color: 'white', border: 'none' }}
        >
          Stuur
        </button>
      </div>
    </div>
  );
}