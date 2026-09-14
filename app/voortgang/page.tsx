'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Voortgang() {
  const router = useRouter();
  const [aantal, setAantal] = useState(0);
  const [laden, setLaden] = useState(true);
  const [bericht, setBericht] = useState('');

  async function laadVoortgang() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      router.push('/login');
      return;
    }
    const { data, error } = await supabase
      .from('voortgang')
      .select('id')
      .eq('user_id', user.id);

    if (!error && data) {
      setAantal(data.length);
    }
    setLaden(false);
  }

  useEffect(() => {
    laadVoortgang();
  }, []);

  async function trainingAfgerond() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      router.push('/login');
      return;
    }
    const { error } = await supabase.from('voortgang').insert({ user_id: user.id });
    if (error) {
      setBericht('Er ging iets mis: ' + error.message);
    } else {
      setBericht('Training genoteerd!');
      laadVoortgang();
    }
  }

  function motivatieTekst(n: number) {
    if (n === 0) return 'Nog geen training gelogd. Zet vandaag de eerste stap.';
    if (n < 3) return `Je hebt ${n} keer getraind. Mooie start, blijf dit volhouden.`;
    if (n < 10) return `Je hebt al ${n} keer getraind. Je bent bezig een gewoonte te bouwen.`;
    return `Indrukwekkend: ${n} trainingen gelogd. Dit is al een echt ritme.`;
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px 100px' }}>
      <h1 style={{ marginBottom: 4 }}>Jouw voortgang</h1>
      <p style={{ margin: '0 0 32px', fontSize: 15, color: '#8A7561' }}>Elke training telt mee.</p>

      {laden ? (
        <p>Laden...</p>
      ) : (
        <>
          <div
            style={{
              padding: '28px 32px',
              background: '#FFF1DC',
              borderRadius: 20,
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            <div style={{ fontSize: 44, fontWeight: 700, color: '#E85D00', lineHeight: 1 }}>{aantal}</div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: '#8A7561', marginTop: 6, marginBottom: 16 }}>
              {aantal === 1 ? 'training gelogd' : 'trainingen gelogd'}
            </div>
            <div style={{ fontSize: 15, color: '#2B1B0E', lineHeight: 1.5 }}>{motivatieTekst(aantal)}</div>
          </div>

          <button
            onClick={trainingAfgerond}
            style={{
              width: '100%',
              padding: '15px 0',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg,#FF8601,#E85D00)',
              color: '#FFF8EE',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            + Training afgerond
          </button>

          {bericht && (
            <p style={{ textAlign: 'center', fontSize: 14, color: '#B9601A', marginTop: 16 }}>{bericht}</p>
          )}
        </>
      )}
    </div>
  );
}
