'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function DashboardPagina() {
  const router = useRouter();
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
    <div style={{ maxWidth: 560, margin: '0 auto', padding: 24 }}>
      <h1>Jouw overzicht</h1>

      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginTop: 20 }}>
        <h3>Profiel</h3>
        <p>Doel: {profiel?.doel || 'nog niet ingevuld'}</p>
        <p>Ervaring: {profiel?.ervaring || 'nog niet ingevuld'}</p>
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginTop: 16 }}>
        <h3>Voortgang</h3>
        <p>{aantalTrainingen} training(en) gelogd</p>
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginTop: 16 }}>
        <h3>Jouw trainer</h3>
        {trainer ? (
          <p>{trainer.naam} — {trainer.plaats} ({trainer.specialisatie})</p>
        ) : (
          <p>Nog geen trainer gekozen. <a href="/matching">Kies er een</a>.</p>
        )}
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginTop: 16 }}>
        <h3>Jouw voedingsdeskundige</h3>
        {voedingsdeskundige ? (
          <p>{voedingsdeskundige.naam} — {voedingsdeskundige.plaats} ({voedingsdeskundige.specialisatie})</p>
        ) : (
          <p>Nog geen voedingsdeskundige gekozen. <a href="/matching">Kies er een</a>.</p>
        )}
      </div>
    </div>
  );
}