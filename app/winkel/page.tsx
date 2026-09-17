'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Product = {
  key: string;
  naam: string;
  ondertitel: string;
  onderdelen: string[];
  prijs: string;
};

const PRODUCTEN: Product[] = [
  {
    key: 'bandjes-poster',
    naam: 'Weerstandsbandjes + posterpakket',
    ondertitel: 'Klein, licht en simpel te versturen — alles om vandaag te starten.',
    onderdelen: [
      '3 weerstandsbanden (licht, gemiddeld, stevig)',
      'Blijf Sterk-poster met oefeningen',
      'Handig opbergtasje',
    ],
    prijs: '€14,95',
  },
  {
    key: 'startpakket',
    naam: 'Blijf Sterk Startpakket',
    ondertitel: 'Alles om vandaag te beginnen met trainen, in één pakket bij je thuisbezorgd.',
    onderdelen: [
      'Bidon',
      'Handdoek',
      'Fitnessmatje',
      'Weerstandsband',
      'Lichte gewichten',
      'Blijf Sterk-poster met oefeningen',
    ],
    prijs: '€39,95',
  },
];

const vinkIcoon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M4 12.5l5 5L20 6.5" stroke="#E85D00" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function WinkelPagina() {
  const [gekozen, setGekozen] = useState<string>(PRODUCTEN[0].key);
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

  const product = PRODUCTEN.find((p) => p.key === gekozen)!;

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
      product: product.naam,
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

      <h1 style={{ fontSize: 28, margin: '16px 0 6px' }}>Winkel</h1>
      <p style={{ color: '#8A7561', fontSize: 16, lineHeight: 1.6, margin: 0 }}>
        Kies een pakket. Nog niet te bestellen — laat je gegevens achter, dan laten we je als eerste weten
        wanneer het kan.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 26 }}>
        {PRODUCTEN.map((p) => {
          const actief = gekozen === p.key;
          return (
            <button
              key={p.key}
              onClick={() => {
                setGekozen(p.key);
                setVerstuurd(false);
              }}
              style={{
                textAlign: 'left',
                fontFamily: 'inherit',
                cursor: 'pointer',
                borderRadius: 24,
                border: actief ? '2px solid #E85D00' : '1px solid #F3E4C8',
                background: '#FFFFFF',
                padding: 24,
                boxShadow: actief ? '0 6px 16px rgba(232,93,0,0.12)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 17, margin: '0 0 4px' }}>{p.naam}</p>
                  <p style={{ color: '#8A7561', fontSize: 14, margin: 0 }}>{p.ondertitel}</p>
                </div>
                <div
                  style={{
                    width: 24, height: 24, borderRadius: 999, flexShrink: 0,
                    border: actief ? 'none' : '2px solid #F3E4C8',
                    background: actief ? 'linear-gradient(135deg,#FFBE0A,#FF8601)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {actief && (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <path d="M4 12.5l5 5L20 6.5" stroke="#3A1E00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                {p.onderdelen.map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14.5, color: '#2B1B0E' }}>
                    {vinkIcoon}
                    {item}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid #F3E4C8', display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 26, fontWeight: 800, color: '#E85D00' }}>{p.prijs}</span>
                <span style={{ color: '#8A7561', fontSize: 13 }}>richtprijs, kan nog wijzigen</span>
              </div>
            </button>
          );
        })}
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
            <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 4px' }}>Ik wil: {product.naam}</p>
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
            Bedankt! We laten je weten zodra je "{product.naam}" echt kunt bestellen.
          </p>
        )}
      </div>
    </div>
  );
}
