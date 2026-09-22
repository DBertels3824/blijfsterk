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
          icon={
            <>
              <circle cx="12" cy="6" r="2.4" stroke="#E85D00" strokeWidth="2" />
              <path d="M12 8.4V15M12 15l-4 5M12 15l4 5M7 11h10" stroke="#E85D00" strokeWidth="2" strokeLinecap="round" />
            </>
          }
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
          icon={
            <>
              <path d="M4 19V10M10 19V5M16 19v-7M22 19H2" stroke="#E85D00" strokeWidth="2" strokeLinecap="round" />
            </>
          }
        />

        <GroteTegel
          onClick={() => window.dispatchEvent(new Event('blijfsterk:open-coach'))}
          titel="Jouw coach"
          tekst="Stel een vraag"
          icon={<path d="M4 4h16v12H8l-4 4V4z" stroke="#E85D00" strokeWidth="2" strokeLinejoin="round" />}
        />

        <GroteTegel
          href="/intake"
          titel="Mijn gegevens"
          tekst="Over jou, voor je coach"
          icon={
            <>
              <circle cx="12" cy="8" r="3.6" stroke="#E85D00" strokeWidth="2" />
              <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="#E85D00" strokeWidth="2" strokeLinecap="round" />
            </>
          }
        />

        <GroteTegel
          href="/telefoon"
          titel="Op je telefoon"
          tekst="Installeer & meldingen"
          icon={
            <>
              <rect x="7" y="2" width="10" height="20" rx="2" stroke="#E85D00" strokeWidth="2" />
              <path d="M11 18h2" stroke="#E85D00" strokeWidth="2" strokeLinecap="round" />
            </>
          }
        />

        <GroteTegel
          href="/winkel"
          titel="Winkel"
          tekst="Materialen bestellen"
          icon={
            <>
              <path d="M4 8h16l-1.4 11.2a1 1 0 01-1 .8H6.4a1 1 0 01-1-.8L4 8z" stroke="#E85D00" strokeWidth="2" strokeLinejoin="round" />
              <path d="M8 8V6a4 4 0 018 0v2" stroke="#E85D00" strokeWidth="2" strokeLinecap="round" />
            </>
          }
        />
      </div>
    </div>
  );
}

function GroteTegel({
  href,
  onClick,
  titel,
  tekst,
  icon,
  badgeKleur,
}: {
  href?: string;
  onClick?: () => void;
  titel: string;
  tekst: string;
  icon: ReactNode;
  badgeKleur?: { achtergrond: string; rand: string; tekst: string };
}) {
  const inhoud = (
    <>
      <div style={{ width: 52, height: 52, borderRadius: 16, background: '#FFF8EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">{icon}</svg>
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 17, color: '#2B1B0E' }}>{titel}</div>
        <div
          style={{
            fontSize: 13, marginTop: 4, lineHeight: 1.4,
            color: badgeKleur ? badgeKleur.tekst : '#8A7561',
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
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 14,
    textAlign: 'left',
    textDecoration: 'none',
    minHeight: 150,
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
