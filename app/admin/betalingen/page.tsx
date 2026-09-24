'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ADMIN_EMAIL } from '@/lib/admin';

// Beheer van betalingen (alleen Dirk): vergoeding klaarzetten voor een partner,
// en zien wie betaald heeft. De partner betaalt zelf via zijn dashboard (iDEAL).

type Partner = { id: string; naam: string; plaats: string | null; partnernummer: string | null; type: string | null };
type Betaling = {
  id: string;
  partnernummer: string;
  trainer_id: string | null;
  soort: string;
  omschrijving: string;
  bedrag_cent: number;
  status: string;
  mollie_id: string | null;
  betaald_op: string | null;
  aangemaakt_op: string;
};

const SOORTEN = [
  { key: 'matchvergoeding', label: 'Matchvergoeding (nieuwe klant)', bedrag: 3500 },
  { key: 'abonnement', label: 'Partnerabonnement (maand)', bedrag: 2900 },
  { key: 'overig', label: 'Overig', bedrag: 0 },
];

const statusKleur: Record<string, string> = {
  open: '#B9601A', wacht_op_betaling: '#8A7561', betaald: '#2E7D32', gratis: '#2E7D32', mislukt: '#B3261E', geannuleerd: '#8A7561', verlopen: '#B3261E',
};

const euro = (cent: number) => `€ ${(cent / 100).toFixed(2).replace('.', ',')}`;
const datum = (iso: string) => new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });

export default function BetalingenAdmin() {
  const router = useRouter();
  const [toegestaan, setToegestaan] = useState<boolean | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [lijst, setLijst] = useState<Betaling[]>([]);
  const [laden, setLaden] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  // Nieuwe betaling klaarzetten
  const [partnerId, setPartnerId] = useState('');
  const [soort, setSoort] = useState('matchvergoeding');
  const [bedrag, setBedrag] = useState('35,00');
  const [omschrijving, setOmschrijving] = useState('Matchvergoeding nieuwe klant');
  const [bezig, setBezig] = useState(false);
  const [melding, setMelding] = useState('');

  async function laad() {
    const { data: p } = await supabase.from('trainers').select('id, naam, plaats, partnernummer, type').order('naam');
    setPartners((p as Partner[]) || []);
    const { data: b } = await supabase.from('betalingen').select('*').order('aangemaakt_op', { ascending: false });
    setLijst((b as Betaling[]) || []);
  }

  useEffect(() => {
    const start = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      if (user.email !== ADMIN_EMAIL) { router.push('/dashboard'); return; }
      setToegestaan(true);
      await laad();
      setLaden(false);
    };
    start();
  }, [router]);

  function kiesSoort(key: string) {
    setSoort(key);
    const s = SOORTEN.find((x) => x.key === key);
    if (s && s.bedrag > 0) setBedrag((s.bedrag / 100).toFixed(2).replace('.', ','));
    if (key === 'matchvergoeding') setOmschrijving('Matchvergoeding nieuwe klant');
    if (key === 'abonnement') setOmschrijving(`Partnerabonnement ${new Date().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}`);
    if (key === 'overig') setOmschrijving('');
  }

  async function klaarzetten() {
    setMelding('');
    const partner = partners.find((p) => p.id === partnerId);
    const cent = Math.round(parseFloat(bedrag.replace(',', '.')) * 100);
    if (!partner) { setMelding('Kies een partner.'); return; }
    if (!partner.partnernummer) { setMelding('Deze partner heeft nog geen partnernummer.'); return; }
    if (!Number.isFinite(cent) || cent <= 0) { setMelding('Vul een geldig bedrag in.'); return; }
    if (!omschrijving.trim()) { setMelding('Vul een omschrijving in.'); return; }
    setBezig(true);
    const { error } = await supabase.from('betalingen').insert({
      partnernummer: partner.partnernummer,
      trainer_id: partner.id,
      soort,
      omschrijving: omschrijving.trim(),
      bedrag_cent: cent,
    });
    setBezig(false);
    if (error) { setMelding(`Klaarzetten mislukt: ${error.message}`); return; }
    setMelding(`Klaargezet voor ${partner.naam} (${partner.partnernummer}). De partner ziet dit nu in zijn dashboard.`);
    await laad();
  }

  async function annuleer(b: Betaling) {
    if (b.status === 'betaald') return;
    await supabase.from('betalingen').update({ status: 'geannuleerd', bijgewerkt_op: new Date().toISOString() }).eq('id', b.id);
    await laad();
  }

  const gefilterd = useMemo(() => lijst.filter((b) => !filterStatus || b.status === filterStatus), [lijst, filterStatus]);
  const totaalBetaald = lijst.filter((b) => b.status === 'betaald').reduce((s, b) => s + b.bedrag_cent, 0);
  const totaalOpen = lijst.filter((b) => b.status === 'open' || b.status === 'wacht_op_betaling').reduce((s, b) => s + b.bedrag_cent, 0);
  const partnerNaam = (id: string | null) => partners.find((p) => p.id === id)?.naam || '–';

  if (toegestaan === null || laden) return <p style={{ padding: 24 }}>Laden...</p>;
  if (!toegestaan) return null;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 20px 60px' }}>
      <h1 style={{ fontSize: 26, margin: '0 0 6px' }}>Betalingen</h1>
      <p style={{ color: '#6F5A48', margin: '0 0 20px' }}>
        Alleen zichtbaar voor jou · ontvangen {euro(totaalBetaald)} · openstaand {euro(totaalOpen)}
      </p>

      <div style={{ borderRadius: 20, border: '2px solid #FFBE0A', background: '#FFF8EE', padding: 18, marginBottom: 24 }}>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 12 }}>Vergoeding klaarzetten</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          <select value={partnerId} onChange={(e) => setPartnerId(e.target.value)} style={veld}>
            <option value="">Kies partner</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>
                {p.partnernummer || '—'} · {p.naam}{p.plaats ? ` (${p.plaats})` : ''}
              </option>
            ))}
          </select>
          <select value={soort} onChange={(e) => kiesSoort(e.target.value)} style={veld}>
            {SOORTEN.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <input value={bedrag} onChange={(e) => setBedrag(e.target.value)} placeholder="Bedrag, bijv. 35,00" style={veld} />
          <input value={omschrijving} onChange={(e) => setOmschrijving(e.target.value)} placeholder="Omschrijving" style={{ ...veld, gridColumn: '1 / -1' }} />
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
          <button onClick={klaarzetten} disabled={bezig} style={knop}>{bezig ? 'Bezig...' : 'Klaarzetten'}</button>
          {melding && <span style={{ fontSize: 14, color: '#6F5A48' }}>{melding}</span>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={veld}>
          <option value="">Alle statussen</option>
          {Object.keys(statusKleur).map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <span style={{ fontSize: 13.5, color: '#6F5A48' }}>{gefilterd.length} betalingen</span>
      </div>

      {gefilterd.length === 0 ? (
        <p style={{ color: '#8A7561' }}>Nog geen betalingen.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {gefilterd.map((b) => (
            <div key={b.id} style={{ borderRadius: 16, border: '2px solid #F3E4C8', background: '#FFFFFF', padding: '12px 16px', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <div style={{ flex: '1 1 260px' }}>
                <div style={{ fontWeight: 700 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 12.5, color: '#8A7561', background: '#FFF8EE', border: '1px solid #F3E4C8', borderRadius: 6, padding: '2px 6px', marginRight: 8 }}>{b.partnernummer}</span>
                  {partnerNaam(b.trainer_id)}
                </div>
                <div style={{ fontSize: 13.5, color: '#6F5A48', marginTop: 2 }}>
                  {b.omschrijving} · {datum(b.aangemaakt_op)}{b.betaald_op ? ` · betaald ${datum(b.betaald_op)}` : ''}{b.mollie_id ? ` · ${b.mollie_id}` : ''}
                </div>
              </div>
              <div style={{ fontWeight: 800, color: '#E85D00' }}>{euro(b.bedrag_cent)}</div>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: statusKleur[b.status] || '#8A7561', minWidth: 120 }}>{b.status.replace(/_/g, ' ')}</div>
              {b.status !== 'betaald' && b.status !== 'gratis' && b.status !== 'geannuleerd' && (
                <button onClick={() => annuleer(b)} style={{ ...knop, background: '#FFFFFF', border: '2px solid #F3E4C8', color: '#6F5A48', minHeight: 36, fontSize: 13 }}>Annuleer</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const veld: React.CSSProperties = {
  fontFamily: 'inherit', fontSize: 14, minHeight: 42, padding: '0 12px', borderRadius: 12,
  border: '2px solid #F3E4C8', background: '#FFFFFF', boxSizing: 'border-box',
};

const knop: React.CSSProperties = {
  fontFamily: 'inherit', fontWeight: 700, fontSize: 14.5, minHeight: 44, padding: '0 20px',
  borderRadius: 999, border: 'none', cursor: 'pointer',
  background: 'linear-gradient(135deg,#FFBE0A,#FF8601)', color: '#3A1E00',
};
