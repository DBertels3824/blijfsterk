'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { berekenWeekstatus, type Weekstatus } from '@/lib/weekschema';
import { ADMIN_EMAIL } from '@/lib/admin';
import TekstgrootteKnop from '@/app/components/TekstgrootteKnop';

function startVanDeWeek(): Date {
  const nu = new Date();
  const dagIndex = (nu.getDay() + 6) % 7; // 0 = maandag
  const maandag = new Date(nu);
  maandag.setDate(nu.getDate() - dagIndex);
  maandag.setHours(0, 0, 0, 0);
  return maandag;
}

const statusKleur: Record<Weekstatus['soort'], { achtergrond: string; rand: string; tekst: string }> = {
  gehaald: { achtergrond: '#EAF6E9', rand: '#BFE3BC', tekst: '#2E7D32' },
  op_schema: { achtergrond: '#FFF8EE', rand: '#F3E4C8', tekst: '#8A7561' },
  risico: { achtergrond: '#FDEDEA', rand: '#F4C2B8', tekst: '#B3261E' },
};

export default function DashboardPagina() {
  const router = useRouter();
  const [aantalTrainingen, setAantalTrainingen] = useState(0);
  const [weekstatus, setWeekstatus] = useState<Weekstatus | null>(null);
  const [laden, setLaden] = useState(true);
  const [naam, setNaam] = useState('');
  const [profielLeeg, setProfielLeeg] = useState(false);

  useEffect(() => {
    const laadDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setNaam(user.user_metadata?.naam || '');

      const { data: profiel } = await supabase
        .from('profiles')
        .select('rol, huidige_staat, doelen, ervaring')
        .eq('id', user.id)
        .single();

      // Nog helemaal geen profiel: dan is dit een nieuwe gebruiker die de intake nog
      // niet gezien heeft — daar eerst even langs, zodat Dirk iets over je weet.
      if (!profiel && user.email !== ADMIN_EMAIL) {
        router.replace('/intake');
        return;
      }
      if (profiel?.rol === 'trainer') {
        router.push('/trainer-dashboard');
        return;
      }
      if (profiel?.rol === 'sportschool') {
        router.push('/sportschool-dashboard');
        return;
      }
      // Wel een profiel, maar (nog) niets ingevuld — bijv. na "later invullen" bij de intake.
      setProfielLeeg(
        !profiel?.huidige_staat && !profiel?.ervaring && !(profiel?.doelen && profiel.doelen.length)
      );

      const { count } = await supabase
        .from('voortgang')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      setAantalTrainingen(count || 0);

      const maandag = startVanDeWeek();
      const { data: weekData } = await supabase
        .from('voortgang')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', maandag.toISOString());

      if (weekData) {
        const dagen = [false, false, false, false, false, false, false];
        weekData.forEach((rij: { created_at: string }) => {
          const dagIndex = (new Date(rij.created_at).getDay() + 6) % 7;
          dagen[dagIndex] = true;
        });
        setWeekstatus(berekenWeekstatus(dagen.filter(Boolean).length));
      }

      setLaden(false);

      // Direct na de intake (?coach=1): Dirk opent zichzelf even om welkom te heten,
      // zodat de nieuwe gebruiker meteen een eerste stap krijgt aangereikt.
      if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('coach') === '1') {
        window.history.replaceState(null, '', '/dashboard');
        setTimeout(() => window.dispatchEvent(new Event('blijfsterk:open-coach')), 400);
      }
    };
    laadDashboard();
  }, [router]);

  if (laden) return <p style={{ padding: 24 }}>Laden...</p>;

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 20px 100px' }}>
      <div style={{ display: 'flex', justifyContent: naam ? 'space-between' : 'flex-end', alignItems: 'center', marginBottom: 20, gap: 12 }}>
        {naam && <h1 style={{ fontSize: 21, margin: 0 }}>Hoi, {naam}</h1>}
        <TekstgrootteKnop />
      </div>

      {profielLeeg && (
        <Link
          href="/intake"
          style={{
            display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16,
            background: '#FFF1DC', border: '2px solid #FFBE0A', borderRadius: 20,
            padding: '16px 18px', textDecoration: 'none', color: '#2B1B0E',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Vertel Dirk kort iets over jezelf</div>
            <div style={{ fontSize: 14.5, color: '#5A4636', marginTop: 4, lineHeight: 1.5 }}>
              Dan kan je coach advies geven dat echt bij jou past. Duurt een paar minuten.
            </div>
          </div>
          <span style={{ fontWeight: 800, color: '#E85D00', fontSize: 22 }}>→</span>
        </Link>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <GroteTegel
          href="/oefeningen"
          titel="Oefeningen"
          tekst="Start met trainen"
          beeld={<img src="/tegels/oefeningen.jpg" alt="" style={beeldStijl} />}
        />

        <GroteTegel
          href="/oefeningen/schema"
          titel="Voortgang"
          tekst={
            weekstatus
              ? weekstatus.soort === 'gehaald'
                ? `${aantalTrainingen} trainingen — doel gehaald`
                : `${aantalTrainingen} trainingen — nog ${weekstatus.nogNodig} te gaan`
              : `${aantalTrainingen} trainingen gelogd`
          }
          badgeKleur={weekstatus ? statusKleur[weekstatus.soort] : undefined}
          beeld={<img src="/tegels/voortgang.jpg" alt="" style={beeldStijl} />}
        />

        <GroteTegel
          onClick={() => window.dispatchEvent(new Event('blijfsterk:open-coach'))}
          titel="Jouw coach"
          tekst="Stel Dirk een vraag"
          beeld={<CoachBeeld />}
        />

        <GroteTegel
          href="/intake"
          titel="Mijn gegevens"
          tekst="Over jou, voor je coach"
          beeld={<GegevensBeeld />}
        />

        <GroteTegel
          href="/telefoon"
          titel="Op je telefoon"
          tekst="Installeer & meldingen"
          beeld={<TelefoonBeeld />}
        />

        <GroteTegel
          href="/winkel"
          titel="Winkel"
          tekst="Materialen bestellen"
          beeld={<img src="/tegels/winkel.jpg" alt="" style={beeldStijl} />}
        />
      </div>
    </div>
  );
}

// Foto's in de tegels: staan in public/tegels/. Wil je een andere foto? Vervang het
// bestand met dezelfde naam (liefst 640x480, liggend) en de tegel pakt 'm vanzelf.
const beeldStijl: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

// Tegels zonder foto krijgen een grote, simpele tekening in de huisstijl.
const beeldVlak: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(160deg,#FFF1DC,#FFE2B8)',
};

function CoachBeeld() {
  return (
    <div style={beeldVlak}>
      <svg width="76%" viewBox="0 0 160 120" fill="none">
        <defs>
          <linearGradient id="bs-coach-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFBE0A" />
            <stop offset="1" stopColor="#FF8601" />
          </linearGradient>
        </defs>
        <circle cx="62" cy="62" r="42" fill="url(#bs-coach-grad)" />
        <text x="62" y="80" textAnchor="middle" fontFamily="inherit" fontWeight="800" fontSize="50" fill="#3A1E00">D</text>
        <path d="M108 22h40a8 8 0 018 8v22a8 8 0 01-8 8h-24l-12 10V60h-4a8 8 0 01-8-8V30a8 8 0 018-8z" fill="#FFFFFF" stroke="#F3E4C8" strokeWidth="2" />
        <circle cx="120" cy="41" r="3.5" fill="#E85D00" />
        <circle cx="132" cy="41" r="3.5" fill="#E85D00" />
        <circle cx="144" cy="41" r="3.5" fill="#E85D00" />
      </svg>
    </div>
  );
}

function GegevensBeeld() {
  return (
    <div style={beeldVlak}>
      <svg width="70%" viewBox="0 0 160 120" fill="none">
        <rect x="14" y="16" width="132" height="88" rx="14" fill="#FFFFFF" stroke="#F3E4C8" strokeWidth="2" />
        <circle cx="48" cy="52" r="15" fill="#FF8601" />
        <path d="M24 88c0-13 11-22 24-22s24 9 24 22" fill="#FFBE0A" />
        <rect x="84" y="40" width="46" height="9" rx="4.5" fill="#F3E4C8" />
        <rect x="84" y="57" width="36" height="9" rx="4.5" fill="#F3E4C8" />
        <rect x="84" y="74" width="42" height="9" rx="4.5" fill="#FFBE0A" />
      </svg>
    </div>
  );
}

function TelefoonBeeld() {
  return (
    <div style={beeldVlak}>
      <svg width="52%" viewBox="0 0 90 120" fill="none">
        <rect x="9" y="4" width="72" height="112" rx="14" fill="#2B1B0E" />
        <rect x="15" y="12" width="60" height="96" rx="9" fill="#FFF8EE" />
        <rect x="33" y="8" width="24" height="4" rx="2" fill="#5A4636" />
        <image href="/icons/icon-192.png" x="29" y="40" width="32" height="32" />
        <rect x="24" y="82" width="42" height="7" rx="3.5" fill="#F3E4C8" />
      </svg>
    </div>
  );
}

function GroteTegel({
  href,
  onClick,
  titel,
  tekst,
  beeld,
  badgeKleur,
}: {
  href?: string;
  onClick?: () => void;
  titel: string;
  tekst: string;
  beeld: ReactNode;
  badgeKleur?: { achtergrond: string; rand: string; tekst: string };
}) {
  const inhoud = (
    <>
      <div style={{ width: '100%', aspectRatio: '4 / 3', overflow: 'hidden', background: '#FFF1DC' }}>
        {beeld}
      </div>
      <div style={{ padding: '14px 16px 18px' }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: '#2B1B0E' }}>{titel}</div>
        <div
          style={{
            fontSize: 14.5, marginTop: 4, lineHeight: 1.4,
            color: badgeKleur ? badgeKleur.tekst : '#6F5A48',
            fontWeight: badgeKleur ? 700 : 500,
          }}
        >
          {tekst}
        </div>
      </div>
    </>
  );

  const stijl: CSSProperties = {
    borderRadius: 22,
    border: `2px solid ${badgeKleur ? badgeKleur.rand : '#F3E4C8'}`,
    background: badgeKleur ? badgeKleur.achtergrond : '#FFFFFF',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    textAlign: 'left',
    textDecoration: 'none',
    overflow: 'hidden',
    boxShadow: '0 6px 18px rgba(43,27,14,0.06)',
  };

  if (onClick) {
    return (
      <button onClick={onClick} style={{ ...stijl, fontFamily: 'inherit', cursor: 'pointer', width: '100%' }}>
        {inhoud}
      </button>
    );
  }

  return (
    <Link href={href || '#'} style={stijl}>
      {inhoud}
    </Link>
  );
}
