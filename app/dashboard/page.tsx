'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { OEFENINGEN } from '@/lib/oefeningen';
import { berekenWeekstatus, type Weekstatus } from '@/lib/weekschema';
import PushMeldingenKnop from '@/app/components/PushMeldingenKnop';

type Profiel = {
  doel: string | null;
  ervaring: string | null;
};

const DAGEN = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

function startVanDeWeek(): Date {
  const nu = new Date();
  const dagIndex = (nu.getDay() + 6) % 7; // 0 = maandag
  const maandag = new Date(nu);
  maandag.setDate(nu.getDate() - dagIndex);
  maandag.setHours(0, 0, 0, 0);
  return maandag;
}

function naamVoorOefening(id: string | null): string {
  if (!id) return 'Training';
  return OEFENINGEN.find((o) => o.id === id)?.naam || 'Training';
}

function groet() {
  const uur = new Date().getHours();
  if (uur < 12) return 'Goedemorgen';
  if (uur < 18) return 'Goedemiddag';
  return 'Goedenavond';
}

const card: CSSProperties = {
  borderRadius: 24,
  border: '2px solid #F3E4C8',
  background: '#FFFFFF',
  padding: 20,
};

const statusKleur: Record<Weekstatus['soort'], { achtergrond: string; rand: string; tekst: string }> = {
  gehaald: { achtergrond: '#EAF6E9', rand: '#BFE3BC', tekst: '#2E7D32' },
  op_schema: { achtergrond: '#FFF8EE', rand: '#F3E4C8', tekst: '#8A7561' },
  risico: { achtergrond: '#FDEDEA', rand: '#F4C2B8', tekst: '#B3261E' },
};

export default function DashboardPagina() {
  const router = useRouter();
  const [naam, setNaam] = useState('');
  const [profiel, setProfiel] = useState<Profiel | null>(null);
  const [aantalTrainingen, setAantalTrainingen] = useState(0);
  const [weekDagen, setWeekDagen] = useState<boolean[]>([false, false, false, false, false, false, false]);
  const [weekOefeningen, setWeekOefeningen] = useState<string[]>([]);
  const [weekstatus, setWeekstatus] = useState<Weekstatus | null>(null);
  const [laden, setLaden] = useState(true);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    const laadDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: rolData } = await supabase.from('profiles').select('rol').eq('id', user.id).single();
      if (rolData?.rol === 'trainer') {
        router.push('/trainer-dashboard');
        return;
      }
      if (rolData?.rol === 'sportschool') {
        router.push('/sportschool-dashboard');
        return;
      }

      setNaam(user.email ? user.email.split('@')[0] : '');

      const { data: profielData } = await supabase
        .from('profiles')
        .select('doel, ervaring')
        .eq('id', user.id)
        .single();
      if (profielData) setProfiel(profielData);

      const { count } = await supabase
        .from('voortgang')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      setAantalTrainingen(count || 0);

      const maandag = startVanDeWeek();
      const { data: weekData, error: weekFout } = await supabase
        .from('voortgang')
        .select('created_at, oefening_id')
        .eq('user_id', user.id)
        .gte('created_at', maandag.toISOString());

      // TIJDELIJK voor debuggen — hierna weer weghalen zodra bekend is wat er misgaat.
      setDebugInfo(
        JSON.stringify(
          {
            maandagGrens: maandag.toISOString(),
            fout: weekFout?.message || null,
            aantalRijen: weekData?.length ?? null,
            rijen: weekData ?? null,
          },
          null,
          2
        )
      );

      if (weekData) {
        const dagen = [false, false, false, false, false, false, false];
        const namen: string[] = [];
        weekData.forEach((rij: any) => {
          const dagIndex = (new Date(rij.created_at).getDay() + 6) % 7;
          dagen[dagIndex] = true;
          const naam = naamVoorOefening(rij.oefening_id);
          if (!namen.includes(naam)) namen.push(naam);
        });
        setWeekDagen(dagen);
        setWeekOefeningen(namen);
        setWeekstatus(berekenWeekstatus(dagen.filter(Boolean).length));
      }

      setLaden(false);
    };
    laadDashboard();
  }, [router]);

  if (laden) return <p style={{ padding: 24 }}>Laden...</p>;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px 60px' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <p style={{ color: '#8A7561', fontSize: 14, margin: 0 }}>{groet()}</p>
          <h1 style={{ fontSize: 24, margin: '2px 0 0' }}>{naam || 'daar'}</h1>
        </div>
        <div
          style={{
            width: 48, height: 48, borderRadius: 999, flexShrink: 0,
            background: 'linear-gradient(135deg,#FFBE0A,#FF8601)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, color: '#3A1E00', fontSize: 17,
          }}
        >
          {naam ? naam[0].toUpperCase() : '?'}
        </div>
      </div>

      <Link
        href="/telefoon"
        style={{
          display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none',
          background: '#FFFFFF', border: '2px solid #F3E4C8', borderRadius: 20,
          padding: '14px 16px', marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            background: '#FFF8EE', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="7" y="2" width="10" height="20" rx="2" stroke="#E85D00" strokeWidth="2" />
            <path d="M11 18h2" stroke="#E85D00" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#2B1B0E' }}>Zet Blijf Sterk op je telefoon</div>
          <div style={{ fontSize: 13.5, color: '#8A7561', marginTop: 2 }}>Snellere toegang, geen browser nodig →</div>
        </div>
      </Link>

      <PushMeldingenKnop />

      {/* Voortgang */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 64, height: 64, borderRadius: 999, flexShrink: 0,
              background: '#FFF1DC', border: '2px solid #F3E4C8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 19, color: '#E85D00',
            }}
          >
            {aantalTrainingen}
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, margin: 0 }}>
              {aantalTrainingen === 1 ? 'Training gelogd' : 'Trainingen gelogd'}
            </p>
            <p style={{ color: '#8A7561', fontSize: 14, marginTop: 4 }}>
              {aantalTrainingen === 0 ? 'Zet vandaag de eerste stap.' : 'Goed bezig — blijf dit volhouden.'}
            </p>
          </div>
        </div>
      </div>

      {/* Deze week */}
      <div style={{ ...card, marginBottom: 20 }}>
        <p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 14px' }}>Deze week</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
          {DAGEN.map((dag, i) => (
            <div key={dag} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
              <div
                style={{
                  width: 32, height: 32, borderRadius: 999,
                  background: weekDagen[i] ? 'linear-gradient(135deg,#FFBE0A,#FF8601)' : '#FFF1DC',
                  border: weekDagen[i] ? 'none' : '2px solid #F3E4C8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {weekDagen[i] && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M4 12.5l5 5L20 6.5" stroke="#3A1E00" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#8A7561' }}>{dag}</span>
            </div>
          ))}
        </div>

        {weekOefeningen.length > 0 ? (
          <p style={{ color: '#8A7561', fontSize: 13.5, marginTop: 16, marginBottom: 0, lineHeight: 1.6 }}>
            Deze week gedaan: {weekOefeningen.join(', ')}.
          </p>
        ) : (
          <p style={{ color: '#8A7561', fontSize: 13.5, marginTop: 16, marginBottom: 0 }}>
            Nog niets gelogd deze week. Zet vandaag de eerste stap.
          </p>
        )}

        {weekstatus && (
          <div
            style={{
              fontSize: 13, fontWeight: 700, lineHeight: 1.5, borderRadius: 12, padding: '10px 14px', marginTop: 14,
              background: statusKleur[weekstatus.soort].achtergrond,
              border: `2px solid ${statusKleur[weekstatus.soort].rand}`,
              color: statusKleur[weekstatus.soort].tekst,
            }}
          >
            {weekstatus.bericht}
          </div>
        )}
      </div>

      {debugInfo && (
        <pre style={{ fontSize: 11, background: '#2B1B0E', color: '#FFF1DC', borderRadius: 12, padding: 14, marginBottom: 20, overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
          {debugInfo}
        </pre>
      )}

      {/* Snelle acties */}
      <p style={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#8A7561', marginBottom: 12 }}>
        Snelle acties
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12 }}>
        <Tegel href="/advies" label="Advies" icon={
          <path d="M4 4h16v12H8l-4 4V4z" stroke="#E85D00" strokeWidth="2" strokeLinejoin="round" />
        } />
        <Tegel href="/winkel" label="Winkel" icon={
          <>
            <path d="M4 8h16l-1.4 11.2a1 1 0 01-1 .8H6.4a1 1 0 01-1-.8L4 8z" stroke="#E85D00" strokeWidth="2" strokeLinejoin="round" />
            <path d="M8 8V6a4 4 0 018 0v2" stroke="#E85D00" strokeWidth="2" strokeLinecap="round" />
          </>
        } />
        <Tegel href="/oefeningen" label="Oefeningen" icon={
          <>
            <circle cx="12" cy="6" r="2.4" stroke="#E85D00" strokeWidth="2" />
            <path d="M12 8.4V15M12 15l-4 5M12 15l4 5M7 11h10" stroke="#E85D00" strokeWidth="2" strokeLinecap="round" />
          </>
        } />
      </div>

    </div>
  );
}

function Tegel({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        borderRadius: 20, border: '2px solid #F3E4C8', background: '#FFFFFF',
        padding: '16px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 8, textAlign: 'center', textDecoration: 'none',
      }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 14, background: '#FFF8EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">{icon}</svg>
      </div>
      <span style={{ fontWeight: 700, fontSize: 13, color: '#2B1B0E' }}>{label}</span>
    </Link>
  );
}
