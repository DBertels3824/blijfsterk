'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { OEFENINGEN, CATEGORIEEN, BENODIGDHEDEN, type Oefening } from '@/lib/oefeningen';
import { OEFENING_POSES } from '@/lib/oefening-poses';
import { OEFENING_VIDEOS, VIDEO_OPMERKINGEN } from '@/lib/oefening-videos';
import { willekeurigeMotivatie } from '@/lib/motivatie';
import { relatieveDatum } from '@/lib/datum';
import OefeningAnimatie from '@/app/components/OefeningAnimatie';

const card: React.CSSProperties = {
  borderRadius: 24,
  border: '2px solid #F3E4C8',
  background: '#FFFFFF',
  padding: 20,
};

// Kleuren met voldoende contrast (UX-punt 9): hulptekst #6F5A48, oranje tekst/links #B34500.
const MUTED = '#6F5A48';
const ORANJE_TEKST = '#B34500';

export default function OefeningenPagina() {
  const router = useRouter();
  const [laden, setLaden] = useState(true);
  const [filter, setFilter] = useState<(typeof BENODIGDHEDEN)[number]>('Alles');
  const [laatstGedaan, setLaatstGedaan] = useState<Record<string, string>>({});
  const [veiligheidOpen, setVeiligheidOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push('/login');
        return;
      }

      // Per oefening de meest recente keer dat 'ie gelogd is, zodat je op elke
      // kaart meteen ziet wanneer je 'm voor het laatst gedaan hebt.
      const { data: rijen } = await supabase
        .from('voortgang')
        .select('oefening_id, created_at')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false });

      if (rijen) {
        const laatste: Record<string, string> = {};
        for (const rij of rijen as { oefening_id: string; created_at: string }[]) {
          if (!laatste[rij.oefening_id]) laatste[rij.oefening_id] = rij.created_at;
        }
        setLaatstGedaan(laatste);
      }

      setLaden(false);
    });
  }, [router]);

  if (laden) return <p style={{ padding: 24 }}>Laden...</p>;

  const zichtbaar: Oefening[] = OEFENINGEN.filter(
    (o) => filter === 'Alles' || o.benodigdheden.includes(filter)
  );

  return (
    // 110px onderaan zodat de zwevende coachknop nooit over de laatste "Ik heb dit gedaan"-knop valt.
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 20px 110px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 26, margin: 0 }}>Oefeningen</h1>
        <Link href="/oefeningen/schema" style={{ fontSize: 15, fontWeight: 700, color: ORANJE_TEKST, textDecoration: 'none' }}>
          Jouw voortgang →
        </Link>
      </div>
      <p style={{ color: MUTED, fontSize: 16, margin: '6px 0 14px' }}>
        Rustige oefeningen voor thuis. Met je weerstandsband, je matje of een flesje water.
      </p>

      {/* Veiligheid: één regel, uitklapbaar (UX-punt 5) */}
      <div style={{ background: '#FFF8EE', borderRadius: 14, padding: '10px 14px', marginBottom: 14, fontSize: 15, lineHeight: 1.55, color: '#2B1B0E' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700 }}>Stop meteen bij pijn, duizeligheid of kortademigheid.</span>
          <button
            onClick={() => setVeiligheidOpen((v) => !v)}
            style={{ fontFamily: 'inherit', fontSize: 15, fontWeight: 700, color: ORANJE_TEKST, background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer' }}
          >
            {veiligheidOpen ? 'Minder' : 'Lees meer'}
          </button>
        </div>
        {veiligheidOpen && (
          <p style={{ margin: '8px 0 0', color: MUTED }}>
            Twijfel je of een oefening geschikt is voor jou? Overleg eerst met je huisarts of fysiotherapeut. Deze
            oefeningen zijn een eerste, voorzichtige versie en nog niet beoordeeld door een fysiotherapeut of sportarts.
            De video&apos;s zijn een hulpmiddel — volg voor de precieze uitvoering altijd de geschreven stappen.
          </p>
        )}
      </div>

      {/* Filters: compact, maar wel goed aan te raken */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {BENODIGDHEDEN.map((b) => (
          <button
            key={b}
            onClick={() => setFilter(b)}
            style={{
              fontFamily: 'inherit', fontWeight: 700, fontSize: 15, padding: '9px 16px', minHeight: 40, borderRadius: 999,
              border: filter === b ? 'none' : '2px solid #F3E4C8', cursor: 'pointer',
              background: filter === b ? 'linear-gradient(135deg,#FFBE0A,#FF8601)' : '#FFFFFF',
              color: filter === b ? '#3A1E00' : '#5A4636',
            }}
          >
            {b}
          </button>
        ))}
      </div>

      {CATEGORIEEN.map((categorie) => {
        const inCategorie = zichtbaar.filter((o) => o.categorie === categorie);
        if (inCategorie.length === 0) return null;
        return (
          <div key={categorie} style={{ marginBottom: 28 }}>
            <p style={{ fontWeight: 800, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.04em', color: MUTED, marginBottom: 12 }}>
              {categorie}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {inCategorie.map((oefening) => (
                <OefeningKaart
                  key={oefening.id}
                  oefening={oefening}
                  laatstGedaan={laatstGedaan[oefening.id]}
                  onGedaan={(iso) => setLaatstGedaan((v) => ({ ...v, [oefening.id]: iso }))}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Coach-kaartje onderaan (UX-punt 5): eerst de oefeningen, dan de hulp */}
      <button
        onClick={() => window.dispatchEvent(new Event('blijfsterk:open-coach'))}
        style={{
          display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
          fontFamily: 'inherit', cursor: 'pointer', width: '100%',
          background: '#FFFFFF', border: '2px solid #F3E4C8', borderRadius: 20,
          padding: '14px 16px', marginTop: 8,
        }}
      >
        <div
          style={{
            width: 44, height: 44, borderRadius: 999, flexShrink: 0,
            background: 'linear-gradient(135deg,#FFBE0A,#FF8601)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, color: '#3A1E00',
          }}
        >
          D
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#2B1B0E' }}>Niet zeker waar je moet beginnen?</div>
          <div style={{ fontSize: 15, color: MUTED, marginTop: 2 }}>Vraag het Dirk, je virtuele coach →</div>
        </div>
      </button>
    </div>
  );
}

function OefeningKaart({
  oefening,
  laatstGedaan,
  onGedaan,
}: {
  oefening: Oefening;
  laatstGedaan?: string;
  onGedaan: (iso: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [motivatie, setMotivatie] = useState('');
  const [foutmelding, setFoutmelding] = useState('');
  const animatie = OEFENING_POSES[oefening.id];
  const video = OEFENING_VIDEOS[oefening.id];
  const videoOpmerking = VIDEO_OPMERKINGEN[oefening.id];

  async function markeerGedaan() {
    if (bezig) return;
    setBezig(true);
    setFoutmelding('');
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      setBezig(false);
      return;
    }
    const nu = new Date().toISOString();
    const { error } = await supabase.from('voortgang').insert({ user_id: user.id, oefening_id: oefening.id });
    setBezig(false);
    if (!error) {
      onGedaan(nu);
      setMotivatie(willekeurigeMotivatie());
      setTimeout(() => setMotivatie(''), 5000);
    } else {
      console.error('Kon voortgang niet opslaan:', error.message);
      setFoutmelding('Kon dit niet opslaan. Probeer het nog eens.');
    }
  }

  return (
    <div style={card}>
      {video && (
        <>
          <div
            style={{
              width: '100%',
              aspectRatio: '4 / 3',
              borderRadius: 16,
              marginBottom: videoOpmerking ? 8 : 14,
              background: '#FFF1DC',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <video
              src={video}
              autoPlay
              loop
              muted
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          </div>
          {videoOpmerking && (
            <p style={{ fontSize: 15, color: '#9E5A18', fontWeight: 700, margin: '0 0 14px' }}>
              {videoOpmerking}
            </p>
          )}
        </>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {!video && animatie && (
          <OefeningAnimatie start={animatie.start} eind={animatie.eind} statisch={animatie.statisch} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{oefening.naam}</div>
          <p style={{ color: MUTED, fontSize: 15.5, margin: '4px 0 0' }}>{oefening.uitleg}</p>
          <p style={{ fontSize: 15, fontWeight: 700, margin: '6px 0 0', color: laatstGedaan ? '#2E7D32' : '#9E5A18' }}>
            {laatstGedaan ? `Laatst gedaan: ${relatieveDatum(laatstGedaan)}` : 'Nog niet gedaan'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
        {oefening.benodigdheden.map((b) => (
          <span
            key={b}
            style={{ fontSize: 15, fontWeight: 700, color: '#9E5A18', background: '#FFF1DC', borderRadius: 999, padding: '4px 12px' }}
          >
            {b}
          </span>
        ))}
      </div>

      {/* Eerst: hoe doe je het (UX-punt 6). Grote knop, klapt de stappen uit. */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          marginTop: 14, width: '100%', fontFamily: 'inherit', fontWeight: 700, fontSize: 16,
          borderRadius: 999, minHeight: 50, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg,#FFBE0A,#FF8601)', color: '#3A1E00',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        {open ? 'Verberg de stappen' : 'Zo doe je het'}
        <span aria-hidden style={{ fontSize: 15.5 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ marginTop: 14, background: '#FFF8EE', borderRadius: 16, padding: '14px 16px' }}>
          <ol style={{ margin: 0, paddingLeft: 22, fontSize: 16, lineHeight: 1.7, color: '#2B1B0E' }}>
            {oefening.stappen.map((stap, i) => (
              <li key={i} style={{ marginBottom: 4 }}>{stap}</li>
            ))}
          </ol>
          <p style={{ fontSize: 16, fontWeight: 700, marginTop: 12, marginBottom: 0 }}>{oefening.setsHerhalingen}</p>
          <p style={{ fontSize: 15, color: MUTED, marginTop: 6, marginBottom: 0 }}>{oefening.veiligheid}</p>
        </div>
      )}

      {/* Daarna pas: afvinken */}
      <button
        onClick={markeerGedaan}
        disabled={bezig}
        style={{
          marginTop: 10, width: '100%', fontFamily: 'inherit', fontWeight: 700, fontSize: 16,
          borderRadius: 999, minHeight: 50, border: '2px solid #F3E4C8', background: '#FFFFFF',
          color: '#2B1B0E', cursor: bezig ? 'default' : 'pointer', opacity: bezig ? 0.7 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M4 12.5l5 5L20 6.5" stroke={ORANJE_TEKST} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {bezig ? 'Bezig...' : 'Ik heb dit gedaan'}
      </button>

      {foutmelding && (
        <p style={{ color: '#B3261E', marginTop: 12, fontSize: 15, fontWeight: 600 }}>
          Fout: {foutmelding}
        </p>
      )}

      {motivatie && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 999, flexShrink: 0,
              background: 'linear-gradient(135deg,#FFBE0A,#FF8601)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 15, color: '#3A1E00',
            }}
          >
            D
          </div>
          <p style={{ margin: 0, fontSize: 15.5, fontWeight: 600, color: '#2B1B0E' }}>{motivatie}</p>
        </div>
      )}
    </div>
  );
}
