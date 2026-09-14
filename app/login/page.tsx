'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#FFFFFF',
          borderRadius: 24,
          border: '1px solid #F3E4C8',
          boxShadow: '0 20px 48px rgba(43,27,14,0.08)',
          padding: '40px 36px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 700, color: '#2B1B0E' }}>Welkom terug</h1>
          <p style={{ margin: 0, fontSize: 15, color: '#8A7561' }}>Log in en voel je weer sterk.</p>
        </div>

        <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: '#5A4636', marginBottom: 6 }}>
          E-mailadres
        </label>
        <input
          placeholder="naam@voorbeeld.nl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            display: 'block',
            width: '100%',
            marginBottom: 16,
            padding: '12px 14px',
            borderRadius: 10,
            border: '1px solid #F3E4C8',
            fontSize: 15.5,
            boxSizing: 'border-box',
          }}
        />

        <label style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: '#5A4636', marginBottom: 6 }}>
          Wachtwoord
        </label>
        <input
          placeholder="••••••••"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
          style={{
            display: 'block',
            width: '100%',
            marginBottom: 24,
            padding: '12px 14px',
            borderRadius: 10,
            border: '1px solid #F3E4C8',
            fontSize: 15.5,
            boxSizing: 'border-box',
          }}
        />

        <button
          onClick={handleSignIn}
          disabled={bezig}
          style={{
            width: '100%',
            padding: '14px 0',
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg,#FF8601,#E85D00)',
            color: '#FFF8EE',
            fontWeight: 600,
            fontSize: 16,
            cursor: bezig ? 'default' : 'pointer',
            opacity: bezig ? 0.7 : 1,
          }}
        >
          {bezig ? 'Bezig...' : 'Inloggen'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#8A7561', margin: '18px 0 0' }}>
          Nog geen account?{' '}
          <button
            onClick={handleSignUp}
            disabled={bezig}
            style={{
              background: 'none',
              border: 'none',
              color: '#E85D00',
              fontWeight: 600,
              fontSize: 14,
              cursor: bezig ? 'default' : 'pointer',
              padding: 0,
            }}
          >
            Registreer hier
          </button>
        </p>

        {bericht && (
          <p style={{ textAlign: 'center', fontSize: 13.5, color: '#B9601A', marginTop: 16 }}>{bericht}</p>
        )}

        <p style={{ textAlign: 'center', marginTop: 24 }}>
          <Link href="/" style={{ fontSize: 13.5, color: '#8A7561' }}>
            &larr; Terug naar de homepage
          </Link>
        </p>
      </div>
    </div>
  );
}
