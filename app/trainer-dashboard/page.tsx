'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import PartnerBetalingen from '@/app/components/PartnerBetalingen';

type Klant = { user_id: string; woonplaats: string | null };
type Review = { id: string; rating: number; tekst: string | null };

const card: React.CSSProperties = {
  borderRadius: 24,
  border: '2px solid #F3E4C8',
  background: '#FFFFFF',
  padding: 20,
};

export default function TrainerDashboard() {
  const router = useRouter();
  const [toegestaan, setToegestaan] = useState<boolean | null>(null);
  const [eigenNaam, setEigenNaam] = useState('');
  const [klanten, setKlanten] = useState<Klant[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [trainerIds, setTrainerIds] = useState<string[]>([]);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    const laad = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profielData } = await supabase.from('profiles').select('rol').eq('id', user.id).single();
      if (profielData?.rol !== 'trainer') {
        router.push('/dashboard');
        return;
      }
      setToegestaan(true);

      const { data: eigenTrainers } = await supabase.from('trainers').select('id, naam').eq('user_id', user.id);
      const trainerIds = (eigenTrainers || []).map((t) => t.id);
      setTrainerIds(trainerIds);
      setEigenNaam(eigenTrainers?.[0]?.naam || '');

      if (trainerIds.length > 0) {
        const { data: matches } = await supabase.from('matches').select('user_id').in('trainer_id', trainerIds);
        const userIds = (matches || []).map((m) => m.user_id);

        if (userIds.length > 0) {
          const { data: profielenData } = await supabase.from('profiles').select('id, woonplaats').in('id', userIds);
          setKlanten((profielenData || []).map((p) => ({ user_id: p.id, woonplaats: p.woonplaats })));
        }

        const { data: reviewsData } = await supabase.from('reviews').select('id, rating, tekst').in('trainer_id', trainerIds);
        setReviews(reviewsData || []);
      }

      setLaden(false);
    };
    laad();
  }, [router]);

  if (toegestaan === null || laden) return <p style={{ padding: 24 }}>Laden...</p>;
  if (!toegestaan) return null;

  const gemiddelde = reviews.length
    ? (reviews.reduce((som, r) => som + r.rating, 0) / reviews.length).toFixed(1).replace('.', ',')
    : null;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px 60px' }}>
      <h1 style={{ fontSize: 26, margin: '0 0 6px' }}>Mijn dashboard</h1>
      <p style={{ color: '#8A7561', margin: '0 0 24px' }}>
        {eigenNaam ? `Welkom, ${eigenNaam}.` : 'Welkom.'} Hier zie je wie jou gekozen heeft.
      </p>

      <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
        <div style={{ ...card, flex: 1, textAlign: 'center', padding: '18px 10px' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#E85D00' }}>{klanten.length}</div>
          <div style={{ color: '#8A7561', fontSize: 13, marginTop: 4 }}>{klanten.length === 1 ? 'klant' : 'klanten'}</div>
        </div>
        <div style={{ ...card, flex: 1, textAlign: 'center', padding: '18px 10px' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#E85D00' }}>{gemiddelde ?? '–'}</div>
          <div style={{ color: '#8A7561', fontSize: 13, marginTop: 4 }}>{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</div>
        </div>
      </div>

      <Link
        href="/gesprekken"
        style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: '#2B1B0E', ...card, padding: '14px 16px', marginBottom: 24 }}
      >
        <div style={{ width: 44, height: 44, borderRadius: 999, background: 'linear-gradient(135deg,#FFBE0A,#FF8601)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 4h16v12H8l-4 4V4z" stroke="#3A1E00" strokeWidth="2.2" strokeLinejoin="round" /></svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Gesprekken met je klanten</div>
          <div style={{ fontSize: 13.5, color: '#8A7561', marginTop: 2 }}>Dirk stelt jullie aan elkaar voor</div>
        </div>
        <span style={{ color: '#E85D00', fontWeight: 800, fontSize: 20 }}>→</span>
      </Link>

      <PartnerBetalingen trainerIds={trainerIds} />

      <p style={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#8A7561', marginBottom: 12 }}>
        Klanten die jou gekozen hebben
      </p>
      {klanten.length === 0 ? (
        <p style={{ color: '#8A7561', fontSize: 14.5 }}>Nog niemand heeft jou gekozen.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {klanten.map((k, i) => (
            <div key={i} style={{ ...card, padding: '14px 16px' }}>
              <p style={{ margin: 0, fontWeight: 700 }}>{k.woonplaats || 'Woonplaats onbekend'}</p>
            </div>
          ))}
        </div>
      )}

      {reviews.length > 0 && (
        <>
          <p style={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#8A7561', marginBottom: 12 }}>
            Reviews
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reviews.map((r) => (
              <div key={r.id} style={{ ...card, padding: '14px 16px' }}>
                <p style={{ margin: 0 }}>{'⭐'.repeat(r.rating)} {r.tekst}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
