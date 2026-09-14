'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type EchteTrainer = {
  id: string | null;
  naam: string;
  adres: string;
  rating: number | null;
  aantalReviews: number;
  telefoon: string | null;
  website: string | null;
  mapsLink: string | null;
};

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
  return naam.split(' ').map((d) => d[0]).join('').slice(0, 2).toUpperCase();
}

const sterIcon = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L5.8 21l1.6-7-5.4-4.7 7.1-.6L12 2z" fill="#E85D00" />
  </svg>
);

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
  const [woonplaats, setWoonplaats] = useState('');
  const [echteTrainers, setEchteTrainers] = useState<EchteTrainer[]>([]);
  const [echteVoeding, setEchteVoeding] = useState<EchteTrainer[]>([]);
  const [echteLaden, setEchteLaden] = useState(true);
  const [echteFout, setEchteFout] = useState<string | null>(null);
  const [tab, setTab] = useState<'trainer' | 'voedingsdeskundige'>('trainer');

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
      setWoonplaats(profielData?.woonplaats || '');

      const zoekEchteTrainers = async (soort: string) => {
        try {
          const res = await fetch('/api/echte-trainers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plaats: profielData?.woonplaats, type: soort }),
          });
          return await res.json();
        } catch {
          return { resultaten: [], fout: 'Zoeken bij Google is mislukt.' };
        }
      };

      const [trainerResultaat, voedingResultaat] = await Promise.all([
        zoekEchteTrainers('trainer'),
        zoekEchteTrainers('voedingsdeskundige'),
      ]);
      setEchteTrainers(trainerResultaat.resultaten || []);
      setEchteVoeding(voedingResultaat.resultaten || []);
      setEchteFout(trainerResultaat.fout || voedingResultaat.fout || null);
      setEchteLaden(false);

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

  const isTrainerTab = tab === 'trainer';
  const partnerItems = isTrainerTab ? trainers : voeding;
  const gekozenId = isTrainerTab ? gekozenTrainerId : gekozenVoedingId;
  const aanbevolenId = isTrainerTab ? aanbeveling?.trainer_id || null : aanbeveling?.voeding_id || null;
  const aanbevolenReden = isTrainerTab ? aanbeveling?.trainer_reden || null : aanbeveling?.voeding_reden || null;
  const echteItems = isTrainerTab ? echteTrainers : echteVoeding;
  const echteLeegTekst = isTrainerTab ? 'Geen trainers gevonden in de buurt.' : 'Geen voedingsdeskundigen gevonden in de buurt.';

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px 60px' }}>
      <h1 style={{ fontSize: 26, margin: '0 0 6px' }}>Kies wie bij je past</h1>
      <p style={{ color: '#8A7561', margin: '0 0 20px' }}>Op basis van je doelen en woonplaats.</p>

      <div style={{ display: 'flex', gap: 8, background: '#FFFFFF', border: '2px solid #F3E4C8', borderRadius: 999, padding: 4, marginBottom: 26 }}>
        {(['trainer', 'voedingsdeskundige'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: 14.5,
              padding: '11px 0',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              background: tab === t ? 'linear-gradient(135deg,#FFBE0A,#FF8601)' : 'transparent',
              color: tab === t ? '#3A1E00' : '#8A7561',
            }}
          >
            {t === 'trainer' ? 'Trainers' : 'Voedingsdeskundigen'}
          </button>
        ))}
      </div>

      <p style={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#8A7561', marginBottom: 12 }}>
        Onze partners
      </p>
      <Lijst
        items={partnerItems}
        type={tab}
        gekozenId={gekozenId}
        reviews={reviews}
        userId={userId}
        onKies={kies}
        onReviewOpgeslagen={verversReviews}
        aanbevolenId={aanbevolenId}
        aanbevolenReden={aanbevolenReden}
      />

      <p style={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#8A7561', margin: '32px 0 6px' }}>
        Ook gevonden bij jou in de buurt{woonplaats ? ` · ${woonplaats}` : ''}
      </p>
      <p style={{ color: '#8A7561', fontSize: 13.5, margin: '0 0 12px' }}>
        Live gevonden via Google Maps. Vraag een introductie — wij leggen het contact, jij hoeft niet zelf te bellen.
      </p>
      {echteLaden ? (
        <p style={{ color: '#8A7561', fontSize: 14 }}>Zoeken...</p>
      ) : echteFout ? (
        <p style={{ color: '#8A7561', fontSize: 14 }}>{echteFout}</p>
      ) : echteItems.length === 0 ? (
        <p style={{ color: '#8A7561', fontSize: 14 }}>{echteLeegTekst}</p>
      ) : (
        <EchteLijst items={echteItems} type={tab} userId={userId} />
      )}
    </div>
  );
}

function EchteLijst({ items, type, userId }: { items: EchteTrainer[]; type: string; userId: string | null }) {
  const [aangevraagd, setAangevraagd] = useState<Record<string, boolean>>({});
  const [bezigSleutel, setBezigSleutel] = useState<string | null>(null);

  const vraagIntroductie = async (item: EchteTrainer, sleutel: string) => {
    if (!userId || bezigSleutel) return;
    setBezigSleutel(sleutel);
    await supabase.from('interesse_aanvragen').insert({
      user_id: userId,
      type,
      naam: item.naam,
      adres: item.adres,
      google_place_id: item.id,
    });
    setAangevraagd((huidig) => ({ ...huidig, [sleutel]: true }));
    setBezigSleutel(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {items.map((item, i) => {
        const sleutel = item.id || `${item.naam}-${i}`;
        const isAangevraagd = !!aangevraagd[sleutel];
        const isBezig = bezigSleutel === sleutel;
        return (
          <div
            key={sleutel}
            style={{ borderRadius: 24, border: '2px solid #F3E4C8', background: '#FFFFFF', padding: 18 }}
          >
            <div style={{ fontWeight: 700, fontSize: 17 }}>{item.naam}</div>
            {item.adres && <div style={{ color: '#8A7561', fontSize: 14, marginTop: 4 }}>{item.adres}</div>}
            {item.rating !== null && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: '#E85D00' }}>
                {sterIcon} {item.rating.toFixed(1).replace('.', ',')} ({item.aantalReviews} Google-reviews)
              </div>
            )}
            <button
              onClick={() => vraagIntroductie(item, sleutel)}
              disabled={isAangevraagd || isBezig}
              style={{
                fontFamily: 'inherit', fontWeight: 700, fontSize: 15, borderRadius: 999,
                cursor: isAangevraagd ? 'default' : 'pointer', border: 'none', minHeight: 44, width: '100%', marginTop: 14,
                background: isAangevraagd ? '#2B1B0E' : 'linear-gradient(135deg,#FFBE0A,#FF8601)',
                color: isAangevraagd ? '#FFFFFF' : '#3A1E00',
                opacity: isBezig ? 0.7 : 1,
              }}
            >
              {isAangevraagd ? 'Aanvraag verstuurd' : isBezig ? 'Bezig...' : 'Vraag een introductie'}
            </button>
          </div>
        );
      })}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {items.map((item) => {
        const eigenReviews = reviews.filter((r) => r.trainer_id === item.id);
        const gemiddelde =
          eigenReviews.length > 0
            ? (eigenReviews.reduce((som, r) => som + r.rating, 0) / eigenReviews.length).toFixed(1).replace('.', ',')
            : null;
        const isAanbevolen = aanbevolenId === item.id;
        const isGekozen = gekozenId === item.id;

        return (
          <div
            key={item.id}
            style={{
              borderRadius: 24,
              border: `2px solid ${isAanbevolen ? '#FF8601' : '#F3E4C8'}`,
              background: isAanbevolen ? 'linear-gradient(180deg,#fff,#FFF3DE)' : '#FFFFFF',
              padding: 18,
            }}
          >
            {isAanbevolen && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#E85D00', marginBottom: 10 }}>
                {sterIcon} AANBEVOLEN VOOR JOU
              </div>
            )}

            <div style={{ display: 'flex', gap: 14 }}>
              <div
                style={{
                  width: 56, height: 56, borderRadius: 18, flexShrink: 0,
                  background: isAanbevolen ? 'linear-gradient(135deg,#FFBE0A,#FF8601)' : '#FFF1DC',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 16, color: isAanbevolen ? '#3A1E00' : '#B9601A',
                }}
              >
                {initialen(item.naam)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 17 }}>{item.naam}</div>
                <div style={{ color: '#8A7561', fontSize: 14, marginTop: 2 }}>{item.specialisatie}</div>
                <div style={{ display: 'flex', gap: 14, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: '#E85D00' }}>
                    {gemiddelde ? <>{sterIcon} {gemiddelde} ({eigenReviews.length})</> : 'Nog geen reviews'}
                  </span>
                  <span style={{ color: '#8A7561', fontSize: 13 }}>{item.plaats} &middot; reist tot {item.reisbereidheid_km} km</span>
                </div>
              </div>
            </div>

            {isAanbevolen && aanbevolenReden && (
              <p style={{ fontSize: 14, color: '#4A3624', margin: '12px 0 0', background: '#FFFFFF', borderRadius: 14, padding: '10px 12px' }}>
                {aanbevolenReden}
              </p>
            )}

            <button
              onClick={() => onKies(item.id, type)}
              disabled={isGekozen}
              style={{
                fontFamily: 'inherit', fontWeight: 700, fontSize: 15, borderRadius: 999, cursor: isGekozen ? 'default' : 'pointer',
                border: 'none', minHeight: 44, width: '100%', marginTop: 14,
                background: isGekozen ? '#2B1B0E' : 'linear-gradient(135deg,#FFBE0A,#FF8601)',
                color: isGekozen ? '#FFFFFF' : '#3A1E00',
              }}
            >
              {isGekozen ? 'Gekozen' : `Kies ${item.naam.split(' ')[0]}`}
            </button>

            {eigenReviews.length > 0 && (
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {eigenReviews.map((r) => (
                  <div key={r.id} style={{ fontSize: 14, background: '#FFF8EE', padding: 10, borderRadius: 12 }}>
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
        style={{ marginTop: 12, fontSize: 13, background: 'none', border: 'none', color: '#E85D00', cursor: 'pointer', padding: 0, fontWeight: 700 }}
      >
        {bestaandeReview ? 'Review aanpassen' : 'Review achterlaten'}
      </button>
    );
  }

  return (
    <div style={{ marginTop: 14, padding: 14, background: '#FFF8EE', borderRadius: 16 }}>
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
        style={{ width: '100%', padding: 10, borderRadius: 10, border: '2px solid #F3E4C8', boxSizing: 'border-box', fontFamily: 'inherit' }}
      />
      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
        <button onClick={opslaan} style={{ padding: '8px 16px', borderRadius: 999, background: '#E85D00', color: 'white', border: 'none', fontWeight: 700 }}>Opslaan</button>
        <button onClick={() => setOpen(false)} style={{ padding: '8px 16px', borderRadius: 999, background: 'none', border: '2px solid #F3E4C8' }}>
          Annuleren
        </button>
      </div>
    </div>
  );
}
