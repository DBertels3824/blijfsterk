'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Hulppagina: chat met de digitale hulp-assistent van Blijf Sterk. Werkt ook zonder account,
// want wie niet kan inloggen moet hier toch hulp kunnen vragen. Dirk kan in hetzelfde
// gesprek meelezen en antwoorden (/admin/klantenservice).

type Bericht = { afzender: 'klant' | 'agent' | 'dirk'; tekst: string };

const SLEUTEL_OPSLAG = 'bs-hulp-gesprek';

const SNELKEUZES = [
  'Ik kan niet inloggen.',
  'Ik heb een fout gezien op de site.',
  'Ik heb een wens of een idee.',
  'Ik heb een andere vraag.',
];

const bubbel: Record<Bericht['afzender'], React.CSSProperties> = {
  klant: { alignSelf: 'flex-end', background: '#FFF1DC', border: '2px solid #FFBE0A' },
  agent: { alignSelf: 'flex-start', background: '#FFFFFF', border: '2px solid #F3E4C8' },
  dirk: { alignSelf: 'flex-start', background: '#EAF6E9', border: '2px solid #BFE3BC' },
};

const invoerStijl: React.CSSProperties = {
  fontFamily: 'inherit', fontSize: 16, width: '100%', borderRadius: 14, border: '2px solid #F3E4C8',
  background: '#FFFFFF', boxSizing: 'border-box', color: '#2B1B0E',
};

export default function HulpPagina() {
  const [berichten, setBerichten] = useState<Bericht[]>([]);
  const [invoer, setInvoer] = useState('');
  const [email, setEmail] = useState('');
  const [ingelogd, setIngelogd] = useState(false);
  const [gesprek, setGesprek] = useState<{ id: string; sleutel: string; nummer: number } | null>(null);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState('');
  const [dirkLeestMee, setDirkLeestMee] = useState(false);
  const eindeRef = useRef<HTMLDivElement>(null);

  // Eerder gesprek op dit apparaat? Dan pakken we dat weer op.
  useEffect(() => {
    let actief = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!actief) return;
      setIngelogd(!!data.user);
      try {
        const opgeslagen = JSON.parse(localStorage.getItem(SLEUTEL_OPSLAG) || 'null');
        if (opgeslagen?.id && opgeslagen?.sleutel) {
          const res = await fetch(`/api/klantenservice/chat?ticketId=${encodeURIComponent(opgeslagen.id)}&sleutel=${encodeURIComponent(opgeslagen.sleutel)}`);
          if (res.ok && actief) {
            const d = await res.json();
            setGesprek({ id: opgeslagen.id, sleutel: opgeslagen.sleutel, nummer: d.nummer });
            setBerichten(d.berichten.map((b: { afzender: Bericht['afzender']; tekst: string }) => ({ afzender: b.afzender, tekst: b.tekst })));
            setDirkLeestMee(!!d.dirkLeestMee);
          } else {
            localStorage.removeItem(SLEUTEL_OPSLAG);
          }
        }
      } catch {
        // Opslag niet beschikbaar of kapot: gewoon met een leeg gesprek beginnen.
      }
    })();
    return () => {
      actief = false;
    };
  }, []);

  // Komt Dirk met een antwoord? Elke tien seconden kijken we even.
  useEffect(() => {
    if (!gesprek) return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/klantenservice/chat?ticketId=${encodeURIComponent(gesprek.id)}&sleutel=${encodeURIComponent(gesprek.sleutel)}`);
        if (!res.ok) return;
        const d = await res.json();
        setBerichten(d.berichten.map((b: { afzender: Bericht['afzender']; tekst: string }) => ({ afzender: b.afzender, tekst: b.tekst })));
        setDirkLeestMee(!!d.dirkLeestMee);
      } catch {
        // Even geen verbinding: volgende ronde opnieuw.
      }
    }, 10000);
    return () => clearInterval(timer);
  }, [gesprek]);

  useEffect(() => {
    eindeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [berichten, bezig]);

  async function verstuur(tekstIn?: string) {
    const tekst = (tekstIn ?? invoer).trim();
    if (!tekst || bezig) return;
    setFout('');
    setBezig(true);
    setBerichten((huidig) => [...huidig, { afzender: 'klant', tekst }]);
    setInvoer('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      let pagina = '';
      try {
        const van = document.referrer ? new URL(document.referrer) : null;
        if (van && van.origin === window.location.origin) pagina = van.pathname;
      } catch {
        // Geen bruikbare verwijzer.
      }
      const res = await fetch('/api/klantenservice/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
        body: JSON.stringify({
          ticketId: gesprek?.id,
          sleutel: gesprek?.sleutel,
          tekst,
          email: ingelogd ? undefined : email,
          pagina,
          apparaat: `${navigator.userAgent.slice(0, 120)} · ${window.innerWidth}px breed`,
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFout(d.fout || 'Versturen is niet gelukt. Probeer het nog eens.');
        setBerichten((huidig) => huidig.slice(0, -1));
        setInvoer(tekst);
        return;
      }
      if (!gesprek) {
        setGesprek({ id: d.ticketId, sleutel: d.sleutel, nummer: d.nummer });
        try {
          localStorage.setItem(SLEUTEL_OPSLAG, JSON.stringify({ id: d.ticketId, sleutel: d.sleutel }));
        } catch {
          // Zonder opslag kan het gesprek niet later terugkomen; verder geen probleem.
        }
      }
      if (d.dirkLeestMee) setDirkLeestMee(true);
      if (d.antwoord) setBerichten((huidig) => [...huidig, { afzender: 'agent', tekst: d.antwoord }]);
    } catch {
      setFout('Versturen is niet gelukt. Controleer je verbinding en probeer het nog eens.');
      setBerichten((huidig) => huidig.slice(0, -1));
      setInvoer(tekst);
    } finally {
      setBezig(false);
    }
  }

  function nieuwGesprek() {
    try {
      localStorage.removeItem(SLEUTEL_OPSLAG);
    } catch {
      // Niet erg.
    }
    setGesprek(null);
    setBerichten([]);
    setDirkLeestMee(false);
    setFout('');
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 20px 80px' }}>
      <Link href="/" style={{ fontSize: 16, fontWeight: 700, color: '#B34500', textDecoration: 'none' }}>
        ← Terug naar de homepage
      </Link>

      <h1 style={{ fontSize: 28, margin: '14px 0 8px' }}>Hulp nodig?</h1>
      <p style={{ color: '#4A3624', fontSize: 17, lineHeight: 1.6, margin: '0 0 12px' }}>
        Stel hier je vraag. Je praat met de digitale hulp van Blijf Sterk. Dat is een computerprogramma, geen mens.
        Kan die je niet helpen, dan geeft hij je vraag door aan Dirk.
      </p>
      <div style={{ background: '#FFF8EE', border: '2px solid #F3E4C8', borderRadius: 14, padding: '12px 16px', fontSize: 15.5, lineHeight: 1.55, color: '#4A3624', marginBottom: 20 }}>
        <strong>Let op:</strong> typ hier nooit je wachtwoord. Heb je een medische vraag? Bel je huisarts. Is het een
        noodgeval? Bel 112.
      </div>

      {!gesprek && berichten.length === 0 && (
        <>
          {!ingelogd && (
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
                Je e-mailadres <span style={{ fontWeight: 400, color: '#6F5A48' }}>(als je wilt dat Dirk je kan mailen)</span>
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@voorbeeld.nl"
                style={{ ...invoerStijl, minHeight: 52, padding: '0 16px' }}
              />
            </div>
          )}
          <p style={{ fontWeight: 700, fontSize: 16, margin: '0 0 10px' }}>Waar gaat het over?</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
            {SNELKEUZES.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => verstuur(k)}
                disabled={bezig}
                style={{
                  fontFamily: 'inherit', fontWeight: 700, fontSize: 16, minHeight: 52, padding: '0 18px', textAlign: 'left',
                  borderRadius: 16, border: '2px solid #F3E4C8', background: '#FFFFFF', color: '#B34500', cursor: 'pointer',
                }}
              >
                {k}
              </button>
            ))}
          </div>
        </>
      )}

      <div role="log" aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        {berichten.map((b, i) => (
          <div key={i} style={{ ...bubbel[b.afzender], maxWidth: '88%', borderRadius: 18, padding: '12px 16px' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#6F5A48', marginBottom: 4 }}>
              {b.afzender === 'klant' ? 'Jij' : b.afzender === 'dirk' ? 'Dirk' : 'Digitale hulp'}
            </div>
            <div style={{ fontSize: 17, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{b.tekst}</div>
          </div>
        ))}
        {bezig && <div style={{ alignSelf: 'flex-start', color: '#6F5A48', fontSize: 16 }}>Even denken...</div>}
        <div ref={eindeRef} />
      </div>

      {dirkLeestMee && (
        <div style={{ background: '#EAF6E9', border: '2px solid #BFE3BC', borderRadius: 14, padding: '10px 14px', marginBottom: 14, fontSize: 15.5, color: '#2E7D32' }}>
          Dirk heeft dit gesprek overgenomen. Zijn antwoord verschijnt hier. Je kunt dit scherm gewoon openlaten.
        </div>
      )}

      {fout && <p style={{ color: '#B3261E', fontSize: 16, margin: '0 0 12px' }}>{fout}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <textarea
          value={invoer}
          onChange={(e) => setInvoer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              verstuur();
            }
          }}
          rows={3}
          maxLength={1500}
          placeholder="Typ hier je vraag..."
          aria-label="Je bericht"
          style={{ ...invoerStijl, padding: 14, resize: 'vertical' }}
        />
        <button
          type="button"
          onClick={() => verstuur()}
          disabled={bezig || !invoer.trim()}
          style={{
            fontFamily: 'inherit', fontWeight: 700, fontSize: 16.5, minHeight: 54, borderRadius: 999, border: 'none',
            background: 'linear-gradient(135deg,#FFBE0A,#FF8601)', color: '#3A1E00',
            cursor: bezig || !invoer.trim() ? 'default' : 'pointer', opacity: bezig || !invoer.trim() ? 0.6 : 1,
          }}
        >
          {bezig ? 'Bezig...' : 'Verstuur'}
        </button>
      </div>

      {gesprek && (
        <p style={{ marginTop: 22, fontSize: 15, color: '#6F5A48' }}>
          Gespreksnummer: {gesprek.nummer}.{' '}
          <button
            type="button"
            onClick={nieuwGesprek}
            style={{ background: 'none', border: 'none', padding: 0, fontFamily: 'inherit', fontSize: 15, fontWeight: 700, color: '#B34500', cursor: 'pointer' }}
          >
            Nieuw gesprek beginnen
          </button>
        </p>
      )}
    </div>
  );
}
