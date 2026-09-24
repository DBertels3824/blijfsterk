'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Modus = 'inloggen' | 'registreren';

export default function LoginPage() {
  const router = useRouter();
  const [modus, setModus] = useState<Modus>('inloggen');
  const [naam, setNaam] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toonWachtwoord, setToonWachtwoord] = useState(false);
  const [bericht, setBericht] = useState('');
  const [bezig, setBezig] = useState(false);

  // Al ingelogd? Dan hoort iemand niet op dit scherm, maar in de app.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace('/dashboard');
    });
  }, [router]);

  // Via de "Account aanmaken"-knop na een partneraanmelding: registratiemodus,
  // e-mailadres alvast ingevuld.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = new URLSearchParams(window.location.search);
    if (q.get('partner') === '1') {
      setModus('registreren');
      if (q.get('email')) setEmail(q.get('email') || '');
    }
  }, []);

  // Is dit e-mailadres een geaccepteerde partner zonder account? Dan koppelen we
  // het account aan de partner-rij en gaat de gebruiker naar het partnerdashboard.
  async function koppelPartnerEnGaVerder(standaard: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/partner/koppel', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.access_token || ''}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.gekoppeld) {
        router.push(data.rol === 'sportschool' ? '/sportschool-dashboard' : '/trainer-dashboard');
        return;
      }
    } catch {
      // Geen partner of koppelen mislukt: gewoon verder als gebruiker.
    }
    router.push(standaard);
  }

  function wisselModus(nieuweModus: Modus) {
    // Bewust de velden leegmaken bij het wisselen — voorkomt dat de browser per
    // ongeluk een opgeslagen e-mail/wachtwoord invult die bij de andere modus hoort
    // (leidde eerder tot een verwarrende "User already registered"-foutmelding).
    setModus(nieuweModus);
    setNaam('');
    setEmail('');
    setPassword('');
    setBericht('');
  }

  async function handleSignUp() {
    if (bezig) return;
    if (!naam.trim()) {
      setBericht('Vul je naam in.');
      return;
    }
    setBezig(true);
    setBericht('');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { naam: naam.trim() } },
    });
    setBezig(false);
    if (error) {
      setBericht(error.message);
      return;
    }
    if (data.session) {
      await koppelPartnerEnGaVerder('/intake');
    } else {
      setBericht('Account aangemaakt! Check je e-mail om je account te bevestigen.');
    }
  }

  async function handleSignIn() {
    if (bezig) return;
    setBezig(true);
    setBericht('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBezig(false);
    if (error) {
      setBericht(error.message);
      return;
    }
    await koppelPartnerEnGaVerder('/dashboard');
  }

  async function handleWachtwoordVergeten() {
    if (!email) {
      setBericht('Vul eerst je e-mailadres in, dan sturen we je een link.');
      return;
    }
    setBezig(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/wachtwoord-resetten`,
    });
    setBezig(false);
    setBericht(
      error ? error.message : 'Check je e-mail — we hebben je een link gestuurd om je wachtwoord opnieuw in te stellen.'
    );
  }

  const isRegistreren = modus === 'registreren';

  return (
    <div style={{ minHeight: '78vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px' }}>
      <div style={{ width: '100%', maxWidth: 380, margin: '0 auto' }}>

        <h1 style={{ fontSize: 27, textAlign: 'center', margin: 0 }}>
          {isRegistreren ? 'Account aanmaken' : 'Welkom terug'}
        </h1>
        <p style={{ textAlign: 'center', color: '#8A7561', marginTop: 10, fontSize: 15 }}>
          {isRegistreren ? 'Maak een gratis account aan om te beginnen.' : 'Log in om verder te gaan met je training.'}
        </p>

        {/* duidelijke tabs — geen verwarring meer tussen inloggen en registreren */}
        <div style={{ display: 'flex', gap: 8, marginTop: 22, background: '#FFF1DC', borderRadius: 999, padding: 4 }}>
          <button
            type="button"
            onClick={() => wisselModus('inloggen')}
            style={{
              flex: 1, fontFamily: 'inherit', fontWeight: 700, fontSize: 14.5, minHeight: 42,
              borderRadius: 999, border: 'none', cursor: 'pointer',
              background: !isRegistreren ? '#FFFFFF' : 'transparent',
              color: !isRegistreren ? '#2B1B0E' : '#8A7561',
            }}
          >
            Inloggen
          </button>
          <button
            type="button"
            onClick={() => wisselModus('registreren')}
            style={{
              flex: 1, fontFamily: 'inherit', fontWeight: 700, fontSize: 14.5, minHeight: 42,
              borderRadius: 999, border: 'none', cursor: 'pointer',
              background: isRegistreren ? '#FFFFFF' : 'transparent',
              color: isRegistreren ? '#2B1B0E' : '#8A7561',
            }}
          >
            Account aanmaken
          </button>
        </div>

        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {isRegistreren && (
            <div>
              <label style={{ fontWeight: 700, fontSize: 13.5, display: 'block', marginBottom: 8 }}>Jouw naam</label>
              <input
                type="text"
                autoComplete="given-name"
                placeholder="Bijv. Marijke"
                value={naam}
                onChange={(e) => setNaam(e.target.value)}
                style={{
                  fontFamily: 'inherit', fontSize: 16, width: '100%', minHeight: 52,
                  borderRadius: 14, border: '2px solid #F3E4C8', background: '#FFFFFF',
                  padding: '0 16px', boxSizing: 'border-box', color: '#2B1B0E',
                }}
              />
            </div>
          )}

          <div>
            <label style={{ fontWeight: 700, fontSize: 13.5, display: 'block', marginBottom: 8 }}>E-mailadres</label>
            <input
              type="email"
              autoComplete="email"
              placeholder="naam@voorbeeld.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                fontFamily: 'inherit', fontSize: 16, width: '100%', minHeight: 52,
                borderRadius: 14, border: '2px solid #F3E4C8', background: '#FFFFFF',
                padding: '0 16px', boxSizing: 'border-box', color: '#2B1B0E',
              }}
            />
          </div>

          <div>
            <label style={{ fontWeight: 700, fontSize: 13.5, display: 'block', marginBottom: 8 }}>Wachtwoord</label>
            <div style={{ position: 'relative' }}>
              <input
                type={toonWachtwoord ? 'text' : 'password'}
                autoComplete={isRegistreren ? 'new-password' : 'current-password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (isRegistreren ? handleSignUp() : handleSignIn())}
                style={{
                  fontFamily: 'inherit', fontSize: 16, width: '100%', minHeight: 52,
                  borderRadius: 14, border: '2px solid #F3E4C8', background: '#FFFFFF',
                  padding: '0 64px 0 16px', boxSizing: 'border-box', color: '#2B1B0E',
                }}
              />
              <button
                type="button"
                onClick={() => setToonWachtwoord((v) => !v)}
                style={{
                  position: 'absolute', right: 6, top: 6, bottom: 6, border: 'none',
                  background: 'transparent', color: '#E85D00', fontWeight: 700, fontSize: 13.5,
                  cursor: 'pointer', padding: '0 10px',
                }}
              >
                {toonWachtwoord ? 'Verberg' : 'Toon'}
              </button>
            </div>
          </div>

          {!isRegistreren && (
            <div style={{ textAlign: 'right' }}>
              <button
                type="button"
                onClick={handleWachtwoordVergeten}
                disabled={bezig}
                style={{ background: 'none', border: 'none', color: '#E85D00', fontWeight: 600, fontSize: 13.5, cursor: 'pointer', padding: 0 }}
              >
                Wachtwoord vergeten?
              </button>
            </div>
          )}

          <button
            onClick={isRegistreren ? handleSignUp : handleSignIn}
            disabled={bezig}
            style={{
              fontFamily: 'inherit', fontWeight: 700, fontSize: 16.5, borderRadius: 999,
              cursor: bezig ? 'default' : 'pointer', border: 'none', minHeight: 54, width: '100%',
              background: 'linear-gradient(135deg,#FFBE0A,#FF8601)', color: '#3A1E00',
              opacity: bezig ? 0.7 : 1,
            }}
          >
            {bezig ? 'Bezig...' : isRegistreren ? 'Account aanmaken' : 'Inloggen'}
          </button>
        </div>

        {bericht && (
          <p style={{ textAlign: 'center', fontSize: 13.5, color: '#B9601A', marginTop: 16 }}>{bericht}</p>
        )}

        <p style={{ textAlign: 'center', marginTop: 22 }}>
          <Link href="/" style={{ fontSize: 13.5, color: '#8A7561' }}>&larr; Terug naar de homepage</Link>
        </p>
      </div>
    </div>
  );
}
