'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toonWachtwoord, setToonWachtwoord] = useState(false);
  const [bericht, setBericht] = useState('');
  const [bezig, setBezig] = useState(false);

  async function handleSignUp() {
    if (bezig) return;
    setBezig(true);
    setBericht('');
    const { data, error } = await supabase.auth.signUp({ email, password });
    setBezig(false);
    if (error) {
      setBericht(error.message);
      return;
    }
    if (data.session) {
      router.push('/intake');
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
    router.push('/dashboard');
  }

  async function handleWachtwoordVergeten() {
    if (!email) {
      setBericht('Vul eerst je e-mailadres in, dan sturen we je een link.');
      return;
    }
    setBezig(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setBezig(false);
    setBericht(
      error ? error.message : 'Check je e-mail — we hebben je een link gestuurd om je wachtwoord opnieuw in te stellen.'
    );
  }

  return (
    <div style={{ minHeight: '78vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px' }}>
      <div style={{ width: '100%', maxWidth: 380, margin: '0 auto' }}>

        <h1 style={{ fontSize: 27, textAlign: 'center', margin: 0 }}>Welkom terug</h1>
        <p style={{ textAlign: 'center', color: '#8A7561', marginTop: 10, fontSize: 15 }}>
          Log in om verder te gaan met je training.
        </p>

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ fontWeight: 700, fontSize: 13.5, display: 'block', marginBottom: 8 }}>E-mailadres</label>
            <input
              type="email"
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
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

          <button
            onClick={handleSignIn}
            disabled={bezig}
            style={{
              fontFamily: 'inherit', fontWeight: 700, fontSize: 16.5, borderRadius: 999,
              cursor: bezig ? 'default' : 'pointer', border: 'none', minHeight: 54, width: '100%',
              background: 'linear-gradient(135deg,#FFBE0A,#FF8601)', color: '#3A1E00',
              opacity: bezig ? 0.7 : 1,
            }}
          >
            {bezig ? 'Bezig...' : 'Inloggen'}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 26, fontSize: 15, color: '#8A7561' }}>
          Nog geen account?{' '}
          <button
            onClick={handleSignUp}
            disabled={bezig}
            style={{ background: 'none', border: 'none', color: '#E85D00', fontWeight: 700, fontSize: 15, cursor: bezig ? 'default' : 'pointer', padding: 0 }}
          >
            Registreer hier
          </button>
        </p>

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
