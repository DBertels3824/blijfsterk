'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Blok in het partner-dashboard: openstaande vergoedingen en betaalde afrekeningen.
// Betalen gaat via Mollie (iDEAL); de partner wordt doorgestuurd en komt terug op
// het dashboard met ?betaling=<id>, waarna we de status opnieuw ophalen.

type Betaling = {
  id: string;
  partnernummer: string;
  soort: string;
  omschrijving: string;
  bedrag_cent: number;
  status: string;
  betaald_op: string | null;
  aangemaakt_op: string;
};

const card: React.CSSProperties = {
  borderRadius: 24,
  border: '2px solid #F3E4C8',
  background: '#FFFFFF',
  padding: 20,
};

const statusTekst: Record<string, { label: string; kleur: string }> = {
  open: { label: 'Nog te betalen', kleur: '#B9601A' },
  wacht_op_betaling: { label: 'Betaling gestart', kleur: '#8A7561' },
  betaald: { label: 'Betaald', kleur: '#2E7D32' },
  mislukt: { label: 'Mislukt, probeer opnieuw', kleur: '#B3261E' },
  geannuleerd: { label: 'Geannuleerd', kleur: '#8A7561' },
  verlopen: { label: 'Verlopen, probeer opnieuw', kleur: '#B3261E' },
};

const euro = (cent: number) => `€ ${(cent / 100).toFixed(2).replace('.', ',')}`;
const datum = (iso: string) => new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

export default function PartnerBetalingen({ trainerIds }: { trainerIds: string[] }) {
  const [lijst, setLijst] = useState<Betaling[]>([]);
  const [bezig, setBezig] = useState<string | null>(null);
  const [melding, setMelding] = useState('');

  async function laad() {
    if (trainerIds.length === 0) return;
    const { data } = await supabase
      .from('betalingen')
      .select('id, partnernummer, soort, omschrijving, bedrag_cent, status, betaald_op, aangemaakt_op')
      .in('trainer_id', trainerIds)
      .order('aangemaakt_op', { ascending: false });
    setLijst((data as Betaling[]) || []);
  }

  useEffect(() => {
    laad();
    // Terug van Mollie? Even een moment geven zodat de webhook de status kan bijwerken.
    const terug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('betaling');
    if (terug) {
      window.history.replaceState(null, '', window.location.pathname);
      setMelding('Bedankt. We controleren je betaling...');
      setTimeout(async () => {
        await laad();
        setMelding('');
      }, 2500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainerIds.join(',')]);

  async function betaal(b: Betaling) {
    setBezig(b.id);
    setMelding('');
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/betalingen/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
      body: JSON.stringify({ betalingId: b.id }),
    });
    const data = await res.json().catch(() => ({}));
    setBezig(null);
    if (!res.ok || !data.checkoutUrl) {
      setMelding(data.fout || 'Betalen lukt op dit moment niet. Probeer het later nog eens.');
      return;
    }
    window.location.href = data.checkoutUrl;
  }

  const open = lijst.filter((b) => ['open', 'mislukt', 'verlopen', 'geannuleerd', 'wacht_op_betaling'].includes(b.status));
  const betaald = lijst.filter((b) => b.status === 'betaald');
  if (lijst.length === 0 && !melding) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#8A7561', marginBottom: 12 }}>
        Afrekeningen
      </p>

      {melding && (
        <div style={{ background: '#FFF1DC', border: '2px solid #FFBE0A', borderRadius: 14, padding: '12px 16px', marginBottom: 12, fontSize: 14.5 }}>
          {melding}
        </div>
      )}

      {open.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
          {open.map((b) => (
            <div key={b.id} style={{ ...card, padding: '14px 16px', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
              <div style={{ flex: '1 1 200px' }}>
                <div style={{ fontWeight: 700 }}>{b.omschrijving}</div>
                <div style={{ fontSize: 13.5, color: statusTekst[b.status]?.kleur || '#8A7561', marginTop: 2 }}>
                  {statusTekst[b.status]?.label || b.status} · {b.partnernummer} · {datum(b.aangemaakt_op)}
                </div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#E85D00' }}>{euro(b.bedrag_cent)}</div>
              <button
                onClick={() => betaal(b)}
                disabled={bezig === b.id}
                style={{
                  fontFamily: 'inherit', fontWeight: 700, fontSize: 14.5, minHeight: 44, padding: '0 18px',
                  borderRadius: 999, border: 'none', cursor: bezig === b.id ? 'default' : 'pointer',
                  background: 'linear-gradient(135deg,#FFBE0A,#FF8601)', color: '#3A1E00', opacity: bezig === b.id ? 0.7 : 1,
                }}
              >
                {bezig === b.id ? 'Even geduld...' : 'Betaal via iDEAL'}
              </button>
            </div>
          ))}
        </div>
      )}

      {betaald.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {betaald.map((b) => (
            <div key={b.id} style={{ ...card, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', gap: 12, background: '#FAFAF6' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14.5 }}>{b.omschrijving}</div>
                <div style={{ fontSize: 13, color: '#2E7D32', marginTop: 2 }}>Betaald op {b.betaald_op ? datum(b.betaald_op) : '–'} · {b.partnernummer}</div>
              </div>
              <div style={{ fontWeight: 700, color: '#6F5A48' }}>{euro(b.bedrag_cent)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
