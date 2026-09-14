'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Voortgang() {
  const router = useRouter();
  const [aantal, setAantal] = useState(0);
  const [laden, setLaden] = useState(true);
  const [bericht, setBericht] = useState('');
  const [bezig, setBezig] = useState(false);

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
    setBezig(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      router.push('/login');
      return;
    }
    const { error } = await supabase.from('voortgang').insert({ user_id: user.id });
    setBezig(false);
    if (error) {
      setBericht('Er ging iets mis: ' + error.message);
    } else {
      setBericht('Toegevoegd aan je voortgang!');
      setTimeout(() => setBericht(''), 2500);
      laadVoortgang();
    }
  }

  function motivatieTekst(n: number) {
    if (n === 0) return 'Nog geen training gelogd. Zet vandaag de eerste stap.';
    if (n < 3) return 'Mooie start, blijf dit volhouden.';
    if (n < 10) return 'Je bent bezig een gewoonte te bouwen.';
    return 'Dit is al een echt ritme. Knap volgehouden!';
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px 60px' }}>
      <h1 style={{ fontSize: 26, margin: '0 0 20px' }}>Jouw voortgang</h1>

      {laden ? (
        <p>Laden...</p>
      ) : (
        <>
          <div
            style={{
              borderRadius: 24,
              border: '2px solid #FF8601',
              background: 'linear-gradient(180deg,#fff,#FFF3DE)',
              padding: 24,
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 8px' }}>
              <path d="M12 2c1.5 3 4.5 5 4.5 9a5.5 5.5 0 11-11 0c0-1.7.8-2.9 1.6-4 .2 1.2.9 1.8 1.6 1.8 1.4 0-.4-2.2-.4-4.3 0-2 1.3-3.6 3.7-2.5z" fill="#FF8601" />
            </svg>
            <div style={{ fontSize: 38, fontWeight: 800, color: '#E85D00' }}>
              {aantal} {aantal === 1 ? 'training' : 'trainingen'}
            </div>
            <p style={{ color: '#4A3624', fontWeight: 600, marginTop: 6 }}>{motivatieTekst(aantal)}</p>
          </div>

          <button
            onClick={trainingAfgerond}
            disabled={bezig}
            style={{
              fontFamily: 'inherit', fontWeight: 700, fontSize: 17, borderRadius: 999,
              cursor: bezig ? 'default' : 'pointer', border: 'none', minHeight: 56, width: '100%',
              background: 'linear-gradient(135deg,#FFBE0A,#FF8601)', color: '#3A1E00',
              opacity: bezig ? 0.7 : 1,
            }}
          >
            {bezig ? 'Bezig...' : '+ Training loggen'}
          </button>

          {bericht && (
            <div style={{ marginTop: 16, background: '#2B1B0E', color: '#fff', borderRadius: 16, padding: '14px 18px', fontWeight: 600, fontSize: 14, textAlign: 'center' }}>
              {bericht}
            </div>
          )}
        </>
      )}
    </div>
  );
}
