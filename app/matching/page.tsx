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
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 24 }}>
      <h1>Kies je trainer en voedingsdeskundige</h1>

      <h2 style={{ marginTop: 32 }}>Trainers</h2>
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

      <h2 style={{ marginTop: 40 }}>Voedingsdeskundigen</h2>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {items.map((item) => {
        const eigenReviews = reviews.filter((r) => r.trainer_id === item.id);
        const gemiddelde =
          eigenReviews.length > 0
            ? (eigenReviews.reduce((som, r) => som + r.rating, 0) / eigenReviews.length).toFixed(1)
            : null;
        const isAanbevolen = aanbevolenId === item.id;

        return (
          <div
            key={item.id}
            style={{
              border: isAanbevolen ? '2px solid #E85D00' : '1px solid #F3E4C8',
              borderRadius: 8,
              padding: 16,
              background: gekozenId === item.id ? '#FFF1DC' : 'white',
            }}
          >
            {isAanbevolen && (
              <div style={{ marginBottom: 10 }}>
                <span
                  style={{
                    display: 'inline-block',
                    background: '#E85D00',
                    color: 'white',
                    fontSize: 11.5,
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: 999,
                    marginBottom: 6,
                  }}
                >
                  ✨ Aanbevolen voor jou
                </span>
                {aanbevolenReden && (
                  <p style={{ fontSize: 13.5, color: '#8A7561', margin: '4px 0 0' }}>{aanbevolenReden}</p>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{item.naam}</strong> — {item.plaats}
                <div style={{ color: '#8A7561', fontSize: 14 }}>{item.specialisatie}</div>
                <div style={{ color: '#8A7561', fontSize: 13, marginTop: 2 }}>
                  Reist tot {item.reisbereidheid_km} km
                </div>
                <div style={{ fontSize: 14, marginTop: 4 }}>
                  {gemiddelde ? `⭐ ${gemiddelde} (${eigenReviews.length} reviews)` : 'Nog geen reviews'}
                </div>
              </div>
              <button
                onClick={() => onKies(item.id, type)}
                disabled={gekozenId === item.id}
                style={{
                  padding: '8px 14px',
                  borderRadius: 6,
                  border: 'none',
                  background: gekozenId === item.id ? '#F3E4C8' : '#E85D00',
                  color: gekozenId === item.id ? '#8A7561' : 'white',
                }}
              >
                {gekozenId === item.id ? 'Gekozen' : 'Kies'}
              </button>
            </div>

            {eigenReviews.length > 0 && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {eigenReviews.map((r) => (
                  <div key={r.id} style={{ fontSize: 14, background: '#FFF8EE', padding: 8, borderRadius: 6 }}>
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
        style={{ marginTop: 10, fontSize: 13, background: 'none', border: 'none', color: '#E85D00', cursor: 'pointer', padding: 0 }}
      >
        {bestaandeReview ? 'Review aanpassen' : 'Review achterlaten'}
      </button>
    );
  }

  return (
    <div style={{ marginTop: 12, padding: 12, background: '#FFF8EE', borderRadius: 6 }}>
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
        style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
      />
      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        <button onClick={opslaan} style={{ padding: '6px 14px', borderRadius: 6, background: '#E85D00', color: 'white', border: 'none' }}>Opslaan</button>
        <button onClick={() => setOpen(false)} style={{ padding: '6px 14px', borderRadius: 6, background: 'none', border: '1px solid #ccc' }}>
          Annuleren
        </button>
      </div>
    </div>
  );
}