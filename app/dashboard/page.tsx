'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Profiel = {
  doel: string | null;
  ervaring: string | null;
};

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

export default function DashboardPagina() {
  const router = useRouter();
  const [naam, setNaam] = useState('');
  const [profiel, setProfiel] = useState<Profiel | null>(null);
  const [aantalTrainingen, setAantalTrainingen] = useState(0);
  const [laden, setLaden] = useState(true);

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

      {/* Snelle acties */}
      <p style={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#8A7561', marginBottom: 12 }}>
        Snelle acties
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12 }}>
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
        <Tegel href="/voortgang" label="Loggen" icon={
          <path d="M4 12l5 5L20 6" stroke="#E85D00" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
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
