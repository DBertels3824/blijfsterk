'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ADMIN_EMAIL } from '@/lib/admin';

type Aanmelding = {
  id: string;
  type: 'trainer' | 'sportschool';
  naam: string;
  email: string;
  telefoon: string | null;
  plaats: string | null;
  antwoorden: Record<string, string>;
  status: string;
  created_at: string;
  partnernummer: string | null;
  kvk_nummer: string | null;
  registratienummer: string | null;
  documenten: Record<string, string> | null;
  toetsing: string | null;
  trainer_id: string | null;
};

const DOC_LABELS: Record<string, string> = {
  vog: 'VOG',
  verzekering: 'Verzekering',
  ehbo: 'EHBO/BHV',
  diploma: 'Diploma',
};

const LABELS: Record<string, string> = {
  ervaring_55plus: 'Ervaring met 55-plussers',
  diplomas: "Diploma's / certificeringen",
  ehbo: 'EHBO/BHV',
  gezondheidsbeperkingen: 'Omgang met gezondheidsbeperkingen',
  aanpak: 'Aanpak / stijl',
  verzekering: 'Aansprakelijkheidsverzekering',
  motivatie: 'Motivatie',
  referenties: 'Referenties',
  toegankelijkheid: 'Toegankelijkheid',
  aangepaste_begeleiding: 'Aangepaste begeleiding/apparatuur',
  ehbo_aanwezig: 'EHBO/BHV aanwezig',
  rustige_lessen: 'Rustige lessen voor senioren',
};

const STATUSSEN = ['nieuw', 'in behandeling', 'geaccepteerd', 'afgewezen'];

const statusKleur: Record<string, string> = {
  nieuw: '#8A7561',
  'in behandeling': '#E85D00',
  geaccepteerd: '#1E8A4C',
  afgewezen: '#B3261E',
};

export default function AanmeldingenAdmin() {
  const router = useRouter();
  const [toegestaan, setToegestaan] = useState<boolean | null>(null);
  const [aanmeldingen, setAanmeldingen] = useState<Aanmelding[]>([]);
  const [filter, setFilter] = useState<'alle' | 'trainer' | 'sportschool'>('alle');
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      if (user.email !== ADMIN_EMAIL) { router.push('/dashboard'); return; }
      setToegestaan(true);

      const { data } = await supabase.from('trainer_aanmeldingen').select('*').order('created_at', { ascending: false });
      setAanmeldingen(data || []);
      setLaden(false);
    };
    check();
  }, [router]);

  const zetStatus = async (id: string, status: string) => {
    setAanmeldingen((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    // Via de server: accepteren maakt de partner-rij aan, afwijzen haalt 'm uit de lijst.
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/partner/accepteer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
      body: JSON.stringify({ aanmeldingId: id, besluit: status }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.trainerId) {
      setAanmeldingen((prev) => prev.map((a) => (a.id === id ? { ...a, trainer_id: data.trainerId } : a)));
    }
  };

  // Documenten staan in een privé-opslag; we vragen een tijdelijke link (10 minuten).
  const openDocument = async (pad: string) => {
    const { data, error } = await supabase.storage.from('partner-documenten').createSignedUrl(pad, 600);
    if (error || !data?.signedUrl) {
      window.alert('Document kon niet geopend worden.');
      return;
    }
    window.open(data.signedUrl, '_blank', 'noopener');
  };

  if (toegestaan === null) return <p style={{ padding: 24 }}>Laden...</p>;
  if (!toegestaan) return null;

  const zichtbaar = aanmeldingen.filter((a) => filter === 'alle' || a.type === filter);

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 20px 60px' }}>
      <h1 style={{ fontSize: 26, margin: '0 0 6px' }}>Aanmeldingen</h1>
      <p style={{ color: '#8A7561', margin: '0 0 20px' }}>Trainers en sportscholen die zich hebben aangemeld als partner.</p>

      <div style={{ display: 'flex', gap: 8, background: '#FFFFFF', border: '2px solid #F3E4C8', borderRadius: 999, padding: 4, marginBottom: 24, maxWidth: 400 }}>
        {(['alle', 'trainer', 'sportschool'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              flex: 1, fontFamily: 'inherit', fontWeight: 700, fontSize: 13.5, padding: '9px 0', borderRadius: 999,
              border: 'none', cursor: 'pointer',
              background: filter === f ? 'linear-gradient(135deg,#FFBE0A,#FF8601)' : 'transparent',
              color: filter === f ? '#3A1E00' : '#8A7561',
            }}
          >
            {f === 'alle' ? 'Alle' : f === 'trainer' ? 'Trainers' : 'Sportscholen'}
          </button>
        ))}
      </div>

      {laden ? (
        <p style={{ color: '#8A7561' }}>Laden...</p>
      ) : zichtbaar.length === 0 ? (
        <p style={{ color: '#8A7561' }}>Nog geen aanmeldingen.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {zichtbaar.map((a) => (
            <div key={a.id} style={{ borderRadius: 20, border: '2px solid #F3E4C8', background: '#FFFFFF', padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>
                    {a.partnernummer && (
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12.5, color: '#8A7561', background: '#FFF8EE', border: '1px solid #F3E4C8', borderRadius: 6, padding: '2px 6px', marginRight: 8 }}>
                        {a.partnernummer}
                      </span>
                    )}
                    {a.naam}
                  </div>
                  <div style={{ color: '#8A7561', fontSize: 13, marginTop: 2 }}>
                    {a.type === 'trainer' ? 'Trainer' : 'Sportschool'} &middot; {a.plaats || 'plaats onbekend'}
                    {a.kvk_nummer ? ` · KvK ${a.kvk_nummer}` : ' · geen KvK'}
                    {a.registratienummer ? ` · reg. ${a.registratienummer}` : ''}
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: statusKleur[a.status] || '#8A7561', whiteSpace: 'nowrap' }}>
                  {a.status}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap', fontSize: 13.5 }}>
                <a href={`mailto:${a.email}`} style={{ color: '#E85D00', fontWeight: 700, textDecoration: 'none' }}>{a.email}</a>
                {a.telefoon && <span style={{ color: '#8A7561' }}>{a.telefoon}</span>}
              </div>

              <div
                style={{
                  marginTop: 12, fontSize: 13.5, borderRadius: 12, padding: '8px 12px',
                  background: a.toetsing === 'compleet' ? '#EAF6E9' : '#FDEDEA',
                  color: a.toetsing === 'compleet' ? '#2E7D32' : '#B3261E', fontWeight: 600,
                }}
              >
                {a.toetsing === 'compleet' ? 'Toetsing compleet — automatisch geaccepteerd' : `Toetsing: ${a.toetsing || 'onvolledig'}`}
                {a.trainer_id ? ' · partner-rij aangemaakt' : ''}
              </div>

              {a.documenten && Object.keys(a.documenten).length > 0 && (
                <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                  {Object.entries(a.documenten).map(([sleutel, pad]) => (
                    <button
                      key={sleutel}
                      onClick={() => openDocument(pad)}
                      style={{ fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, padding: '6px 12px', borderRadius: 999, cursor: 'pointer', border: '2px solid #F3E4C8', background: '#FFF8EE', color: '#2B1B0E' }}
                    >
                      Bekijk {DOC_LABELS[sleutel] || sleutel}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(a.antwoorden || {}).map(([sleutel, waarde]) => (
                  <div key={sleutel} style={{ fontSize: 13.5, background: '#FFF8EE', borderRadius: 12, padding: '8px 12px' }}>
                    <span style={{ fontWeight: 700 }}>{LABELS[sleutel] || sleutel}:</span> {waarde}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
                {STATUSSEN.map((s) => (
                  <button
                    key={s}
                    onClick={() => zetStatus(a.id, s)}
                    style={{
                      fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, padding: '6px 12px', borderRadius: 999, cursor: 'pointer',
                      border: a.status === s ? 'none' : '2px solid #F3E4C8',
                      background: a.status === s ? '#2B1B0E' : '#FFFFFF',
                      color: a.status === s ? '#FFFFFF' : '#5A4636',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
