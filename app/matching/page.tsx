'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Trainer = {
  id: string;
  naam: string;
  plaats: string;
  specialisatie: string;
  type: string;
  reisbereidheid_km: number;
};

type Review = {
  id: string;
  user_id: string;
  trainer_id: string;
  rating: number;
  tekst: string | null;
};

type Aanbeveling = {
  trainer_id: string | null;
  trainer_reden: string | null;
  voeding_id: string | null;
  voeding_reden: string | null;
};

function initialen(naam: string) {
  return naam
    .split(' ')
    .map((deel) => deel[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function MatchingPagina() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [voeding, setVoeding] = useState<Trainer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [gekozenTrainerId, setGekozenTrainerId] = useState<string | null>(null);
  const [gekozenVoedingId, setGekozenVoedingId] = useState<string | null>(null);
  const [aanbeveling, setAanbeveling] = useState<Aanbeveling | null>(null);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    const laadAlles = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      const { data: profielData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: alleTrainers } = await supabase.from('trainers').select('*');
      const trainersLijst = alleTrainers ? alleTrainers.filter((t) => t.type === 'trainer') : [];
      const voedingLijst = alleTrainers ? alleTrainers.filter((t) => t.type === 'voedingsdeskundige') : [];
      setTrainers(trainersLijst);
      setVoeding(voedingLijst);

      const { data: matches } = await supabase
        .from('matches')
        .select('trainer_id, type')
        .eq('user_id', user.id);
      if (matches) {
        const trainerMatch = matches.find((m) => m.type === 'trainer');
        const voedingMatch = matches.find((m) => m.type === 'voedingsdeskundige');
        setGekozenTrainerId(trainerMatch ? trainerMatch.trainer_id : null);
        setGekozenVoedingId(voedingMatch ? voedingMatch.trainer_id : null);
      }

      const { data: alleReviews } = await supabase.from('reviews').select('*');
      setReviews(alleReviews || []);

      setLaden(false);

      // Aanbeveling ophalen, los van het laden van de rest van de pagina.
      const metGemiddelde = (lijst: Trainer[]) =>
        lijst.map((t) => {
          const eigenReviews = (alleReviews || []).filter((r) => r.trainer_id === t.id);
          const gemiddelde = eigenReviews.length
            ? eigenReviews.reduce((som, r) => som + r.rating, 0) / eigenReviews.length
            : null;
          return { ...t, gemiddelde, aantalReviews: eigenReviews.length };
        });

      try {
        const res = await fetch('/api/aanbeveling', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profiel: profielData,
            trainers: metGemiddelde(trainersLijst),
            voedingsdeskundigen: metGemiddelde(voedingLijst),
          }),
        });
        const data = await res.json();
        setAanbeveling(data);
      } catch {
        setAanbeveling(null);
      }
    };
    laadAlles();
  }, [router]);

  const verversReviews = async () => {
    const { data } = await supabase.from('reviews').select('*');
    if (data) setReviews(data);
  };

  const kies = async (trainerId: string, type: string) => {
    if (!userId) return;
    await supabase.from('matches').delete().eq('user_id', userId).eq('type', type);
    await supabase.from('matches').insert({ user_id: userId, trainer_id: trainerId, type });
    if (type === 'trainer') setGekozenTrainerId(trainerId);
    else setGekozenVoedingId(trainerId);
  };

  if (laden) return <p style={{ padding: 24 }}>Laden...</p>;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 100px' }}>
      <h1 style={{ marginBottom: 6 }}>Vind je trainer en voedingsdeskundige</h1>
      <p style={{ fontSize: 14.5, color: '#B9601A', fontWeight: 500, marginTop: 0 }}>
        De juiste begeleiding maakt fit-zijn nog leuker.
      </p>

      <h2 style={{ marginTop: 36, fontSize: 19 }}>Trainers</h2>
      <Lijst
        items={trainers}
        type="trainer"
        gekozenId={gekozenTrainerId}
        reviews={reviews}
        userId={userId}
        onKies={kies}
        onReviewOpgeslagen={verversReviews}
        aanbevolenId={aanbeveling?.trainer_id || null}
        aanbevolenReden={aanbeveling?.trainer_reden || null}
      />

      <h2 style={{ marginTop: 40, fontSize: 19 }}>Voedingsdeskundigen</h2>
      <Lijst
        items={voeding}
        type="voedingsdeskundige"
        gekozenId={gekozenVoedingId}
        reviews={reviews}
        userId={userId}
        onKies={kies}
        onReviewOpgeslagen={verversReviews}
        aanbevolenId={aanbeveling?.voeding_id || null}
        aanbevolenReden={aanbeveling?.voeding_reden || null}
      />
    </div>
  );
}

function Lijst({
  items,
  type,
  gekozenId,
  reviews,
  userId,
  onKies,
  onReviewOpgeslagen,
  aanbevolenId,
  aanbevolenReden,
}: {
  items: Trainer[];
  type: string;
  gekozenId: string | null;
  reviews: Review[];
  userId: string | null;
  onKies: (id: string, type: string) => void;
  onReviewOpgeslagen: () => void;
  aanbevolenId: string | null;
  aanbevolenReden: string | null;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
      {items.map((item) => {
        const eigenReviews = reviews.filter((r) => r.trainer_id === item.id);
        const gemiddelde =
          eigenReviews.length > 0
            ? (eigenReviews.reduce((som, r) => som + r.rating, 0) / eigenReviews.length).toFixed(1)
            : null;
        const isAanbevolen = aanbevolenId === item.id;
        const isGekozen = gekozenId === item.id;

        return (
          <div
            key={item.id}
            style={{
              border: isAanbevolen ? '2px solid #E85D00' : '1px solid #F3E4C8',
              borderRadius: 16,
              padding: 22,
              background: isGekozen ? '#FFF1DC' : '#FFFFFF',
            }}
          >
            {isAanbevolen && (
              <div style={{ marginBottom: 14 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#FFF1DC',
                    color: '#B9601A',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '5px 12px',
                    borderRadius: 999,
                    marginBottom: 6,
                  }}
                >
                  ✨ Aanbevolen voor jou
                </span>
                {aanbevolenReden && (
                  <p style={{ fontSize: 13.5, color: '#8A7561', margin: '6px 0 0' }}>{aanbevolenReden}</p>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div
                style={{
                  width: 50, height: 50, borderRadius: '50%', flex: '0 0 auto',
                  background: isAanbevolen ? 'linear-gradient(135deg,#FFBE0A,#FF8601)' : '#FFF1DC',
                  border: isAanbevolen ? 'none' : '1px solid #F3E4C8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 700, color: isAanbevolen ? '#FFF8EE' : '#B9601A',
                }}
              >
                {initialen(item.naam)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: 16.5 }}>{item.naam}</strong>
                  <div style={{ fontSize: 13.5 }}>
                    {gemiddelde ? `⭐ ${gemiddelde} (${eigenReviews.length} reviews)` : 'Nog geen reviews'}
                  </div>
                </div>
                <div style={{ color: '#8A7561', fontSize: 13.5, marginTop: 2 }}>{item.plaats} &middot; {item.specialisatie}</div>
                <div style={{ color: '#8A7561', fontSize: 12.5, marginTop: 2 }}>Reist tot {item.reisbereidheid_km} km</div>
              </div>
              <button
                onClick={() => onKies(item.id, type)}
                disabled={isGekozen}
                style={{
                  padding: '10px 18px',
                  borderRadius: 10,
                  border: isGekozen ? '1px solid #F3E4C8' : 'none',
                  background: isGekozen ? '#FFFFFF' : 'linear-gradient(135deg,#FF8601,#E85D00)',
                  color: isGekozen ? '#8A7561' : '#FFF8EE',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: isGekozen ? 'default' : 'pointer',
                  flex: '0 0 auto',
                }}
              >
                {isGekozen ? 'Gekozen' : 'Kies'}
              </button>
            </div>

            {eigenReviews.length > 0 && (
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {eigenReviews.map((r) => (
                  <div key={r.id} style={{ fontSize: 14, background: '#FFF8EE', padding: 10, borderRadius: 10 }}>
                    {'⭐'.repeat(r.rating)} {r.tekst}
                  </div>
                ))}
              </div>
            )}

            {userId && (
              <ReviewFormulier
                trainerId={item.id}
                userId={userId}
                bestaandeReview={eigenReviews.find((r) => r.user_id === userId) || null}
                onOpgeslagen={onReviewOpgeslagen}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ReviewFormulier({
  trainerId,
  userId,
  bestaandeReview,
  onOpgeslagen,
}: {
  trainerId: string;
  userId: string;
  bestaandeReview: Review | null;
  onOpgeslagen: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(bestaandeReview?.rating || 0);
  const [tekst, setTekst] = useState(bestaandeReview?.tekst || '');

  const opslaan = async () => {
    if (rating === 0) return;
    if (bestaandeReview) {
      await supabase.from('reviews').update({ rating, tekst }).eq('id', bestaandeReview.id);
    } else {
      await supabase.from('reviews').insert({ user_id: userId, trainer_id: trainerId, rating, tekst });
    }
    setOpen(false);
    onOpgeslagen();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{ marginTop: 12, fontSize: 13, background: 'none', border: 'none', color: '#E85D00', cursor: 'pointer', padding: 0, fontWeight: 600 }}
      >
        {bestaandeReview ? 'Review aanpassen' : 'Review achterlaten'}
      </button>
    );
  }

  return (
    <div style={{ marginTop: 14, padding: 14, background: '#FFF8EE', borderRadius: 12 }}>
      <div style={{ marginBottom: 8 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', padding: 2 }}
          >
            {n <= rating ? '⭐' : '☆'}
          </button>
        ))}
      </div>
      <textarea
        value={tekst}
        onChange={(e) => setTekst(e.target.value)}
        placeholder="Hoe was je ervaring?"
        rows={3}
        style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #F3E4C8', boxSizing: 'border-box', fontFamily: 'inherit' }}
      />
      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
        <button onClick={opslaan} style={{ padding: '8px 16px', borderRadius: 8, background: '#E85D00', color: 'white', border: 'none', fontWeight: 600 }}>Opslaan</button>
        <button onClick={() => setOpen(false)} style={{ padding: '8px 16px', borderRadius: 8, background: 'none', border: '1px solid #F3E4C8' }}>
          Annuleren
        </button>
      </div>
    </div>
  );
}
