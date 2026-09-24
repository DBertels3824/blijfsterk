'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { relatieveDatum } from '@/lib/datum';

// Overzicht van gesprekken (na een match). Werkt voor gebruikers én partners:
// de database laat alleen de eigen gesprekken zien.

type Gesprek = {
  id: string;
  status: string;
  user_id: string;
  trainer_id: string;
  laatste_bericht_op: string | null;
  aangemaakt_op: string;
  trainers: { naam: string; plaats: string | null } | null;
};

export default function GesprekkenPagina() {
  const router = useRouter();
  const [lijst, setLijst] = useState<Gesprek[]>([]);
  const [ikBenPartner, setIkBenPartner] = useState(false);
  const [namen, setNamen] = useState<Record<string, string>>({});
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    const laad = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: eigenTrainers } = await supabase.from('trainers').select('id').eq('user_id', user.id);
      const partner = (eigenTrainers || []).length > 0;
      setIkBenPartner(partner);

      const { data } = await supabase
        .from('gesprekken')
        .select('id, status, user_id, trainer_id, laatste_bericht_op, aangemaakt_op, trainers(naam, plaats)')
        .order('laatste_bericht_op', { ascending: false, nullsFirst: false });
      const gesprekken = (data as unknown as Gesprek[]) || [];
      setLijst(gesprekken);

      // Partner: de voornaam van de klant staat in het profiel (woonplaats) + eerste bericht;
      // we tonen woonplaats als de naam niet bekend is.
      if (partner && gesprekken.length) {
        const ids = Array.from(new Set(gesprekken.map((g) => g.user_id)));
        const { data: profielen } = await supabase.from('profiles').select('id, woonplaats').in('id', ids);
        const map: Record<string, string> = {};
        for (const p of profielen || []) map[p.id] = p.woonplaats ? `Klant uit ${p.woonplaats}` : 'Klant';
        setNamen(map);
      }
      setLaden(false);
    };
    laad();
  }, [router]);

  if (laden) return <p style={{ padding: 24 }}>Laden...</p>;

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 20px 100px' }}>
      <Link href={ikBenPartner ? '/trainer-dashboard' : '/dashboard'} style={{ fontSize: 13.5, fontWeight: 700, color: '#E85D00', textDecoration: 'none' }}>
        ← Terug naar dashboard
      </Link>
      <h1 style={{ fontSize: 26, margin: '10px 0 6px' }}>Gesprekken</h1>
      <p style={{ color: '#6F5A48', margin: '0 0 20px' }}>
        {ikBenPartner ? 'Je klanten via Blijf Sterk. Dirk stelt jullie aan elkaar voor.' : 'Je trainer via Blijf Sterk. Dirk leest mee en helpt als het nodig is.'}
      </p>

      {lijst.length === 0 ? (
        <p style={{ color: '#8A7561' }}>Nog geen gesprekken.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lijst.map((g) => {
            const titel = ikBenPartner ? namen[g.user_id] || 'Klant' : g.trainers?.naam || 'Trainer';
            const open = g.status === 'open';
            return (
              <Link
                key={g.id}
                href={open ? `/gesprekken/${g.id}` : '#'}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', color: '#2B1B0E',
                  borderRadius: 20, border: '2px solid #F3E4C8', background: open ? '#FFFFFF' : '#FFF8EE', padding: '14px 16px',
                  opacity: open ? 1 : 0.85,
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 999, background: 'linear-gradient(135deg,#FFBE0A,#FF8601)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#3A1E00', flexShrink: 0 }}>
                  {titel.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{titel}</div>
                  <div style={{ fontSize: 13.5, color: '#6F5A48', marginTop: 2 }}>
                    {open
                      ? `Laatste bericht: ${g.laatste_bericht_op ? relatieveDatum(g.laatste_bericht_op).toLowerCase() : 'nog geen'}`
                      : ikBenPartner
                        ? 'Gaat open zodra de matchvergoeding is betaald (zie je dashboard)'
                        : 'Gaat open zodra de trainer bevestigd heeft'}
                  </div>
                </div>
                {open && <span style={{ color: '#E85D00', fontWeight: 800, fontSize: 20 }}>→</span>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
