'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const ONDERDELEN = [
  'Bidon',
  'Handdoek',
  'Fitnessmatje',
  'Weerstandsband',
  'Lichte gewichten',
  'Blijf Sterk-poster met oefeningen',
];

const vinkIcoon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M4 12.5l5 5L20 6.5" stroke="#E85D00" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function WinkelPagina() {
  const [naam, setNaam] = useState('');
  const [email, setEmail] = useState('');
  const [verstuurd, setVerstuurd] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
  }, []);

  const versturen = async () => {
    if (!naam.trim() || !email.trim()) {
      setFout('Vul je naam en e-mailadres in.');
      return;
    }
    setBezig(true);
    setFout('');
    const { error } = await supabase.from('product_interesse').insert({
      naam,
      email,
      product: 'Startpakket',
    });
    setBezig(false);
    if (error) {
      setFout('Er ging iets mis. Probeer het nog eens.');
      return;
    }
    setVerstuurd(true);
  };

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 20px 60px' }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: '#FFFFFF',
          border: '1px solid #F3E4C8',
          borderRadius: 999,
          padding: '7px 16px',
          fontWeight: 600,
          fontSize: 13.5,
          color: '#E85D00',
        }}
      >
        Binnenkort beschikbaar
      </span>

      <h1 style={{ fontSize: 28, margin: '16px 0 6px' }}>Blijf Sterk Startpakket</h1>
      <p style={{ color: '#8A7561', fontSize: 16, lineHeight: 1.6, margin: 0 }}>
        Alles om vandaag te beginnen met trainen, in één pakket bij je thuisbezorgd.
      </p>

      <div
        style={{
          marginTop: 26,
          borderRadius: 24,
          border: '1px solid #F3E4C8',
          background: '#FFFFFF',
          padding: 24,
        }}
      >
        <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 14px' }}>Wat zit erin</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ONDERDELEN.map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15.5 }}>
              {vinkIcoon}
              {item}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #F3E4C8', display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 30, fontWeight: 800, color: '#E85D00' }}>€39,95</span>
          <span style={{ color: '#8A7561', fontSize: 13.5 }}>richtprijs, kan nog wijzigen</span>
        </div>
      </div>

      <div
        style={{
          marginTop: 20,
          borderRadius: 24,
          border: '1px solid #F3E4C8',
          background: '#FFFFFF',
          padding: 24,
        }}
      >
        {!verstuurd ? (
          <>
            <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 4px' }}>Ik wil dit</p>
            <p style={{ color: '#8A7561', fontSize: 14, margin: '0 0 16px' }}>
              Nog niet te bestellen — laat je gegevens achter, dan laten we je als eerste weten wanneer het kan.
            </p>

            <p style={{ fontWeight: 700, marginBottom: 0, fontSize: 15 }}>Naam</p>
            <input
              type="text"
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              placeholder="Jouw naam"
              style={{
                fontFamily: 'inherit',
                marginTop: 8,
                marginBottom: 16,
                padding: '0 16px',
                minHeight: 50,
                borderRadius: 14,
                border: '2px solid #F3E4C8',
                fontSize: 16,
                width: '100%',
                boxSizing: 'border-box',
              }}
            />

            <p style={{ fontWeight: 700, marginBottom: 0, fontSize: 15 }}>E-mailadres</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jij@voorbeeld.nl"
              style={{
                fontFamily: 'inherit',
                marginTop: 8,
                padding: '0 16px',
                minHeight: 50,
                borderRadius: 14,
                border: '2px solid #F3E4C8',
                fontSize: 16,
                width: '100%',
                boxSizing: 'border-box',
              }}
            />

            {fout && (
              <p style={{ color: '#B3261E', marginTop: 12, fontSize: 14, fontWeight: 600 }}>{fout}</p>
            )}

            <button
              onClick={versturen}
              disabled={bezig}
              style={{
                fontFamily: 'inherit',
                marginTop: 20,
                padding: '0 32px',
                minHeight: 52,
                fontSize: 16,
                fontWeight: 700,
                borderRadius: 999,
                background: 'linear-gradient(135deg,#FFBE0A,#FF8601)',
                color: '#3A1E00',
                border: 'none',
                cursor: bezig ? 'default' : 'pointer',
                opacity: bezig ? 0.7 : 1,
                width: '100%',
              }}
            >
              {bezig ? 'Versturen...' : 'Ik wil dit'}
            </button>
          </>
        ) : (
          <p style={{ fontSize: 15.5, fontWeight: 600, color: '#2B1B0E', margin: 0 }}>
            Bedankt! We laten je weten zodra je het Startpakket echt kunt bestellen.
          </p>
        )}
      </div>
    </div>
  );
}
