'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Landt hier via de link in de "wachtwoord vergeten"-e-mail. Supabase herkent de
// link zelf (leest het token uit de URL) en zet daarmee tijdelijk een sessie op —
// wij hoeven alleen te wachten tot die er is en dan het nieuwe-wachtwoord-formulier
// te tonen.
export default function WachtwoordResettenPagina() {
  const router = useRouter();
  const [klaarOmTeControleren, setKlaarOmTeControleren] = useState(false);
  const [geldig, setGeldig] = useState(false);
  const [wachtwoord, setWachtwoord] = useState('');
  const [herhaling, setHerhaling] = useState('');
  const [toon, setToon] = useState(false);
  const [bericht, setBericht] = useState('');
  const [bezig, setBezig] = useState(false);
  const [gelukt, setGelukt] = useState(false);

  useEffect(() => {
    // Supabase's client verwerkt de link automatisch (detectSessionInUrl) en stuurt
    // dan een PASSWORD_RECOVERY-event. We luisteren daarnaar, met een fallback-check
    // op een bestaande sessie voor het geval het event al voor het inhaken vuurde.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setGeldig(true);
        setKlaarOmTeControleren(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setGeldig(true);
      setKlaarOmTeControleren(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function opslaan() {
    if (bezig) return;
    if (wachtwoord.length < 6) {
      setBericht('Kies een wachtwoord van minimaal 6 tekens.');
      return;
    }
    if (wachtwoord !== herhaling) {
      setBericht('De twee wachtwoorden zijn niet hetzelfde.');
      return;
    }
    setBezig(true);
    setBericht('');
    const { error } = await supabase.auth.updateUser({ password: wachtwoord });
    setBezig(false);
    if (error) {
      setBericht(error.message);
      return;
    }
    setGelukt(true);
    setTimeout(() => router.push('/dashboard'), 2000);
  }

  return (
    <div style={{ minHeight: '78vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px' }}>
      <div style={{ width: '100%', maxWidth: 380, margin: '0 auto' }}>
        <h1 style={{ fontSize: 27, textAlign: 'center', margin: 0 }}>Nieuw wachtwoord</h1>

        {!klaarOmTeControleren && (
          <p style={{ textAlign: 'center', color: '#8A7561', marginTop: 16 }}>Even controleren...</p>
        )}

        {klaarOmTeControleren && !geldig && (
          <>
            <p style={{ textAlign: 'center', color: '#8A7561', marginTop: 10, fontSize: 15, lineHeight: 1.6 }}>
              Deze link is verlopen of al gebruikt. Vraag op de inlogpagina een nieuwe link aan bij "Wachtwoord vergeten".
            </p>
            <p style={{ textAlign: 'center', marginTop: 22 }}>
              <Link href="/login" style={{ fontSize: 14.5, color: '#E85D00', fontWeight: 700 }}>Naar de inlogpagina</Link>
            </p>
          </>
        )}

        {klaarOmTeControleren && geldig && !gelukt && (
          <>
            <p style={{ textAlign: 'center', color: '#8A7561', marginTop: 10, fontSize: 15 }}>
              Kies een nieuw wachtwoord voor je account.
            </p>

            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ fontWeight: 700, fontSize: 13.5, display: 'block', marginBottom: 8 }}>Nieuw wachtwoord</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={toon ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={wachtwoord}
                    onChange={(e) => setWachtwoord(e.target.value)}
                    style={{
                      fontFamily: 'inherit', fontSize: 16, width: '100%', minHeight: 52,
                      borderRadius: 14, border: '2px solid #F3E4C8', background: '#FFFFFF',
                      padding: '0 64px 0 16px', boxSizing: 'border-box', color: '#2B1B0E',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setToon((v) => !v)}
                    style={{
                      position: 'absolute', right: 6, top: 6, bottom: 6, border: 'none',
                      background: 'transparent', color: '#E85D00', fontWeight: 700, fontSize: 13.5,
                      cursor: 'pointer', padding: '0 10px',
                    }}
                  >
                    {toon ? 'Verberg' : 'Toon'}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontWeight: 700, fontSize: 13.5, display: 'block', marginBottom: 8 }}>Herhaal wachtwoord</label>
                <input
                  type={toon ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={herhaling}
                  onChange={(e) => setHerhaling(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && opslaan()}
                  style={{
                    fontFamily: 'inherit', fontSize: 16, width: '100%', minHeight: 52,
                    borderRadius: 14, border: '2px solid #F3E4C8', background: '#FFFFFF',
                    padding: '0 16px', boxSizing: 'border-box', color: '#2B1B0E',
                  }}
                />
              </div>

              <button
                onClick={opslaan}
                disabled={bezig}
                style={{
                  fontFamily: 'inherit', fontWeight: 700, fontSize: 16.5, borderRadius: 999,
                  cursor: bezig ? 'default' : 'pointer', border: 'none', minHeight: 54, width: '100%',
                  background: 'linear-gradient(135deg,#FFBE0A,#FF8601)', color: '#3A1E00',
                  opacity: bezig ? 0.7 : 1,
                }}
              >
                {bezig ? 'Bezig...' : 'Wachtwoord opslaan'}
              </button>
            </div>
          </>
        )}

        {gelukt && (
          <p style={{ textAlign: 'center', color: '#2E7D32', marginTop: 20, fontSize: 15, fontWeight: 600 }}>
            Wachtwoord opgeslagen. Je wordt doorgestuurd...
          </p>
        )}

        {bericht && (
          <p style={{ textAlign: 'center', fontSize: 13.5, color: '#B9601A', marginTop: 16 }}>{bericht}</p>
        )}
      </div>
    </div>
  );
}
