'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Profiel = {
  doel: string | null;
  ervaring: string | null;
};

type GekozenPersoon = {
  naam: string;
  plaats: string;
  specialisatie: string;
};

function initialen(naam: string) {
  return naam
    .split(' ')
    .map((deel) => deel[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function DashboardPagina() {
  const router = useRouter();
  const [naam, setNaam] = useState('');
  const [profiel, setProfiel] = useState<Profiel | null>(null);
  const [aantalTrainingen, setAantalTrainingen] = useState(0);
  const [trainer, setTrainer] = useState<GekozenPersoon | null>(null);
  const [voedingsdeskundige, setVoedingsdeskundige] = useState<GekozenPersoon | null>(null);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    const laadDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
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

      const { data: matches } = await supabase
        .from('matches')
        .select('type, trainers(naam, plaats, specialisatie)')
        .eq('user_id', user.id);

      if (matches) {
        const trainerMatch = matches.find((m: any) => m.type === 'trainer');
        const voedingMatch = matches.find((m: any) => m.type === 'voedingsdeskundige');
        if (trainerMatch?.trainers) setTrainer(trainerMatch.trainers as any);
        if (voedingMatch?.trainers) setVoedingsdeskundige(voedingMatch.trainers as any);
      }

      setLaden(false);
    };
    laadDashboard();
  }, [router]);

  if (laden) return <p style={{ padding: 24 }}>Laden...</p>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 100px' }}>

      {/* Welkomstbanner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 28px',
          background: '#FFF1DC',
          borderRadius: 20,
          marginBottom: 36,
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 24 }}>
            Welkom terug{naam ? `, ${naam}` : ''}
          </h1>
          <p style={{ margin: 0, fontSize: 14.5, color: '#5A4636' }}>
            Goed dat je er weer bent — elke stap telt.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
        <div style={{ padding: 20, background: '#FFFFFF', border: '1px solid #F3E4C8', borderRadius: 16 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: '#8A7561', marginBottom: 8 }}>Trainingen gelogd</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#E85D00' }}>{aantalTrainingen}</div>
        </div>
        <div style={{ padding: 20, background: '#FFFFFF', border: '1px solid #F3E4C8', borderRadius: 16 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: '#8A7561', marginBottom: 8 }}>Jouw doel</div>
          <div style={{ fontSize: 15.5, fontWeight: 600, color: '#2B1B0E' }}>{profiel?.doel || 'nog niet ingevuld'}</div>
        </div>
        <div style={{ padding: 20, background: '#FFFFFF', border: '1px solid #F3E4C8', borderRadius: 16 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: '#8A7561', marginBottom: 8 }}>Ervaring</div>
          <div style={{ fontSize: 15.5, fontWeight: 600, color: '#2B1B0E' }}>{profiel?.ervaring || 'nog niet ingevuld'}</div>
        </div>
      </div>

      {/* Begeleiding */}
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Jouw begeleiding</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 40 }}>

        <div style={{ padding: 20, background: '#FFFFFF', border: '1px solid #F3E4C8', borderRadius: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
          <div
            style={{
              width: 52, height: 52, borderRadius: '50%', flex: '0 0 auto',
              background: trainer ? 'linear-gradient(135deg,#FFBE0A,#FF8601)' : '#FFF1DC',
              border: trainer ? 'none' : '1px solid #F3E4C8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17, fontWeight: 700, color: trainer ? '#FFF8EE' : '#B9601A',
            }}
          >
            {trainer ? initialen(trainer.naam) : '?'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#B9601A', marginBottom: 2 }}>
              Jouw trainer
            </div>
            {trainer ? (
              <>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{trainer.naam}</div>
                <div style={{ fontSize: 13, color: '#8A7561' }}>{trainer.plaats} &middot; {trainer.specialisatie}</div>
              </>
            ) : (
              <Link href="/matching" style={{ fontSize: 13.5, fontWeight: 600 }}>Nog geen trainer — kies er een &rarr;</Link>
            )}
          </div>
        </div>

        <div style={{ padding: 20, background: '#FFFFFF', border: '1px solid #F3E4C8', borderRadius: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
          <div
            style={{
              width: 52, height: 52, borderRadius: '50%', flex: '0 0 auto',
              background: voedingsdeskundige ? 'linear-gradient(135deg,#FFBE0A,#FF8601)' : '#FFF1DC',
              border: voedingsdeskundige ? 'none' : '1px solid #F3E4C8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17, fontWeight: 700, color: voedingsdeskundige ? '#FFF8EE' : '#B9601A',
            }}
          >
            {voedingsdeskundige ? initialen(voedingsdeskundige.naam) : '?'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#B9601A', marginBottom: 2 }}>
              Jouw voedingsdeskundige
            </div>
            {voedingsdeskundige ? (
              <>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{voedingsdeskundige.naam}</div>
                <div style={{ fontSize: 13, color: '#8A7561' }}>{voedingsdeskundige.plaats} &middot; {voedingsdeskundige.specialisatie}</div>
              </>
            ) : (
              <Link href="/matching" style={{ fontSize: 13.5, fontWeight: 600 }}>Nog geen voedingsdeskundige — kies er een &rarr;</Link>
            )}
          </div>
        </div>

      </div>

      {/* Snel verder */}
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Snel verder</div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <Link
          href="/advies"
          style={{
            flex: '1 1 240px', padding: '20px 22px', borderRadius: 16,
            background: 'linear-gradient(135deg,#FF8601,#E85D00)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            textDecoration: 'none',
          }}
        >
          <span style={{ fontSize: 15.5, fontWeight: 600, color: '#FFF8EE' }}>Vraag de AI-coach iets</span>
          <span style={{ fontSize: 18, color: '#FFF8EE' }}>&rarr;</span>
        </Link>
        <Link
          href="/voortgang"
          style={{
            flex: '1 1 240px', padding: '20px 22px', borderRadius: 16,
            background: '#FFFFFF', border: '1px solid #F3E4C8',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            textDecoration: 'none',
          }}
        >
          <span style={{ fontSize: 15.5, fontWeight: 600, color: '#2B1B0E' }}>Log een training</span>
          <span style={{ fontSize: 18, color: '#E85D00' }}>&rarr;</span>
        </Link>
      </div>

    </div>
  );
}
