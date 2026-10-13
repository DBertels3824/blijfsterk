'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { HULP_EMAIL } from '@/lib/admin';

// 'helper' = een zoon, dochter of andere naaste maakt het account aan vóór de
// oudere. Het account blijft van de oudere: de naam van de oudere komt in
// `naam` (zoals altijd), de helper staat er alleen bij als `helper_naam`.
type Modus = 'inloggen' | 'registreren' | 'helper';

const invoerStijl: React.CSSProperties = {
  fontFamily: 'inherit', fontSize: 16, width: '100%', minHeight: 52,
  borderRadius: 14, border: '2px solid #F3E4C8', background: '#FFFFFF',
  padding: '0 16px', boxSizing: 'border-box', color: '#2B1B0E',
};

const labelStijl: React.CSSProperties = { fontWeight: 700, fontSize: 15, display: 'block', marginBottom: 8 };

const knopSecundair: React.CSSProperties = {
  fontFamily: 'inherit', fontWeight: 700, fontSize: 16, borderRadius: 999,
  cursor: 'pointer', minHeight: 52, width: '100%', background: '#FFFFFF',
  color: '#B34500', border: '2px solid #F3E4C8',
};

export default function LoginPage() {
  const router = useRouter();
  const [modus, setModus] = useState<Modus>('inloggen');
  const [naam, setNaam] = useState('');
  const [helperNaam, setHelperNaam] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toonWachtwoord, setToonWachtwoord] = useState(false);
  const [toonHulp, setToonHulp] = useState(false);
  const [bericht, setBericht] = useState('');
  const [bezig, setBezig] = useState(false);

  // Al ingelogd? Dan hoort iemand niet op dit scherm, maar in de app.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace('/dashboard');
    });
  }, [router]);

  // Via de "Account aanmaken"-knop na een partneraanmelding: registratiemodus,
  // e-mailadres alvast ingevuld. Via "Ik help mijn vader of moeder" op een
  // infopagina (?helper=1): meteen in de helper-stand.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = new URLSearchParams(window.location.search);
    if (q.get('partner') === '1') {
      setModus('registreren');
      if (q.get('email')) setEmail(q.get('email') || '');
    } else if (q.get('helper') === '1') {
      setModus('helper');
    }
  }, []);

  // Is dit e-mailadres een geaccepteerde partner zonder account? Dan koppelen we
  // het account aan de partner-rij en gaat de gebruiker naar het partnerdashboard.
  async function koppelPartnerEnGaVerder(standaard: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/partner/koppel', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.access_token || ''}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.gekoppeld) {
        router.push(data.rol === 'sportschool' ? '/sportschool-dashboard' : '/trainer-dashboard');
        return;
      }
    } catch {
      // Geen partner of koppelen mislukt: gewoon verder als gebruiker.
    }
    router.push(standaard);
  }

  function wisselModus(nieuweModus: Modus) {
    // Bewust de velden leegmaken bij het wisselen — voorkomt dat de browser per
    // ongeluk een opgeslagen e-mail/wachtwoord invult die bij de andere modus hoort
    // (leidde eerder tot een verwarrende "User already registered"-foutmelding).
    setModus(nieuweModus);
    setNaam('');
    setHelperNaam('');
    setEmail('');
    setPassword('');
    setBericht('');
    setToonHulp(false);
  }

  async function handleSignUp() {
    if (bezig) return;
    const isHelper = modus === 'helper';
    if (!naam.trim()) {
      setBericht(isHelper ? 'Vul de naam van je vader of moeder in.' : 'Vul je naam in.');
      return;
    }
    if (isHelper && !helperNaam.trim()) {
      setBericht('Vul ook je eigen naam in.');
      return;
    }
    setBezig(true);
    setBericht('');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          naam: naam.trim(),
          ...(isHelper ? { helper_naam: helperNaam.trim(), aangemaakt_door: 'naaste' } : {}),
        },
      },
    });
    setBezig(false);
    if (error) {
      setBericht(error.message);
      return;
    }
    if (data.session) {
      await koppelPartnerEnGaVerder('/intake');
    } else {
      setBericht(
        isHelper
          ? `Account aangemaakt! Er is een e-mail gestuurd naar ${email} om het account te bevestigen.`
          : 'Account aangemaakt! Check je e-mail om je account te bevestigen.'
      );
    }
  }

  async function handleSignIn() {
    if (bezig) return;
    setBezig(true);
    setBericht('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBezig(false);
    if (error) {
      setBericht(error.message);
      return;
    }
    await koppelPartnerEnGaVerder('/dashboard');
  }

  async function handleWachtwoordVergeten() {
    if (!email) {
      setBericht('Vul eerst je e-mailadres in, dan sturen we je een link.');
      return;
    }
    setBezig(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/wachtwoord-resetten`,
    });
    setBezig(false);
    setBericht(
      error ? error.message : 'Check je e-mail — we hebben je een link gestuurd om je wachtwoord opnieuw in te stellen.'
    );
  }

  const isHelper = modus === 'helper';
  const isRegistreren = modus === 'registreren' || isHelper;

  let kop = 'Welkom terug';
  let subkop = 'Log in om verder te gaan met je training.';
  if (isHelper) {
    kop = 'Samen beginnen';
    subkop = 'Je maakt een gratis account aan voor je vader of moeder. Het account is van hen; jij helpt alleen met de eerste stap.';
  } else if (isRegistreren) {
    kop = 'Account aanmaken';
    subkop = 'Maak een gratis account aan om te beginnen.';
  }

  return (
    <div style={{ minHeight: '78vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px' }}>
      <div style={{ width: '100%', maxWidth: 380, margin: '0 auto' }}>

        <h1 style={{ fontSize: 27, textAlign: 'center', margin: 0 }}>{kop}</h1>
        <p style={{ textAlign: 'center', color: '#6F5A48', marginTop: 10, fontSize: 15, lineHeight: 1.55 }}>{subkop}</p>

        {/* duidelijke tabs — geen verwarring meer tussen inloggen en registreren */}
        <div style={{ display: 'flex', gap: 8, marginTop: 22, background: '#FFF1DC', borderRadius: 999, padding: 4 }}>
          <button
            type="button"
            onClick={() => wisselModus('inloggen')}
            style={{
              flex: 1, fontFamily: 'inherit', fontWeight: 700, fontSize: 16, minHeight: 42,
              borderRadius: 999, border: 'none', cursor: 'pointer',
              background: !isRegistreren ? '#FFFFFF' : 'transparent',
              color: !isRegistreren ? '#2B1B0E' : '#6F5A48',
            }}
          >
            Inloggen
          </button>
          <button
            type="button"
            onClick={() => wisselModus('registreren')}
            style={{
              flex: 1, fontFamily: 'inherit', fontWeight: 700, fontSize: 16, minHeight: 42,
              borderRadius: 999, border: 'none', cursor: 'pointer',
              background: isRegistreren ? '#FFFFFF' : 'transparent',
              color: isRegistreren ? '#2B1B0E' : '#6F5A48',
            }}
          >
            Account aanmaken
          </button>
        </div>

        {isHelper && (
          <div style={{ marginTop: 16, background: '#FFF8EE', border: '2px solid #F3E4C8', borderRadius: 14, padding: '12px 16px', fontSize: 15, lineHeight: 1.55, color: '#2B1B0E' }}>
            <strong>Je helpt je vader of moeder.</strong> Vul hun naam in en daarna je eigen naam.
            Het e-mailadres mag ook van jou zijn; daar komt de bevestiging binnen.
          </div>
        )}

        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {isRegistreren && (
            <div>
              <label style={labelStijl}>{isHelper ? 'Naam van je vader of moeder' : 'Jouw naam'}</label>
              <input
                type="text"
                autoComplete={isHelper ? 'off' : 'given-name'}
                placeholder="Bijv. Marijke"
                value={naam}
                onChange={(e) => setNaam(e.target.value)}
                style={invoerStijl}
              />
            </div>
          )}

          {isHelper && (
            <div>
              <label style={labelStijl}>Je eigen naam</label>
              <input
                type="text"
                autoComplete="given-name"
                placeholder="Bijv. Peter"
                value={helperNaam}
                onChange={(e) => setHelperNaam(e.target.value)}
                style={invoerStijl}
              />
            </div>
          )}

          <div>
            <label style={labelStijl}>E-mailadres</label>
            <input
              type="email"
              autoComplete="email"
              placeholder="naam@voorbeeld.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={invoerStijl}
            />
          </div>

          <div>
            <label style={labelStijl}>Wachtwoord</label>
            <div style={{ position: 'relative' }}>
              <input
                type={toonWachtwoord ? 'text' : 'password'}
                autoComplete={isRegistreren ? 'new-password' : 'current-password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (isRegistreren ? handleSignUp() : handleSignIn())}
                style={{ ...invoerStijl, padding: '0 64px 0 16px' }}
              />
              <button
                type="button"
                onClick={() => setToonWachtwoord((v) => !v)}
                style={{
                  position: 'absolute', right: 6, top: 6, bottom: 6, border: 'none',
                  background: 'transparent', color: '#B34500', fontWeight: 700, fontSize: 15,
                  cursor: 'pointer', padding: '0 10px',
                }}
              >
                {toonWachtwoord ? 'Verberg' : 'Toon'}
              </button>
            </div>
            {isHelper && (
              <p style={{ margin: '8px 0 0', fontSize: 15, color: '#6F5A48', lineHeight: 1.5 }}>
                Tip: kies een wachtwoord dat je vader of moeder zelf kan onthouden, en schrijf het samen op.
              </p>
            )}
          </div>

          {!isRegistreren && (
            <div style={{ textAlign: 'right' }}>
              <button
                type="button"
                onClick={handleWachtwoordVergeten}
                disabled={bezig}
                style={{ background: 'none', border: 'none', color: '#B34500', fontWeight: 600, fontSize: 15, cursor: 'pointer', padding: 0 }}
              >
                Wachtwoord vergeten?
              </button>
            </div>
          )}

          <button
            onClick={isRegistreren ? handleSignUp : handleSignIn}
            disabled={bezig}
            style={{
              fontFamily: 'inherit', fontWeight: 700, fontSize: 16.5, borderRadius: 999,
              cursor: bezig ? 'default' : 'pointer', border: 'none', minHeight: 54, width: '100%',
              background: 'linear-gradient(135deg,#FFBE0A,#FF8601)', color: '#3A1E00',
              opacity: bezig ? 0.7 : 1,
            }}
          >
            {bezig ? 'Bezig...' : isRegistreren ? 'Account aanmaken' : 'Inloggen'}
          </button>

          {isRegistreren && (
            <p style={{ margin: '-6px 0 0', textAlign: 'center', fontSize: 15, lineHeight: 1.55, color: '#6F5A48' }}>
              Door een account aan te maken ga je akkoord met de{' '}
              <Link href="/voorwaarden" style={{ color: '#B34500', fontWeight: 600 }}>voorwaarden</Link>
              {' '}en de{' '}
              <Link href="/privacy" style={{ color: '#B34500', fontWeight: 600 }}>privacyverklaring</Link>.
            </p>
          )}

          {/* Twee rustige hulpknoppen. Wie zelf wil beginnen, kan ze gewoon negeren. */}
          {!isHelper && (
            <button type="button" onClick={() => wisselModus('helper')} style={knopSecundair}>
              Ik help mijn vader of moeder
            </button>
          )}
          {isHelper && (
            <button type="button" onClick={() => wisselModus('registreren')} style={knopSecundair}>
              Toch een account voor mijzelf
            </button>
          )}
          {!isRegistreren && (
            <button
              type="button"
              onClick={() => setToonHulp((v) => !v)}
              aria-expanded={toonHulp}
              style={{ ...knopSecundair, background: toonHulp ? '#FFF1DC' : '#FFFFFF' }}
            >
              {toonHulp ? 'Hulp verbergen' : 'Hulp nodig bij inloggen?'}
            </button>
          )}
        </div>

        {toonHulp && !isRegistreren && (
          <div style={{ marginTop: 18, background: '#FFFFFF', border: '2px solid #F3E4C8', borderRadius: 18, padding: '18px 18px 6px', fontSize: 15, lineHeight: 1.6, color: '#2B1B0E' }}>
            <p style={{ margin: '0 0 14px' }}>
              <strong>Wachtwoord kwijt?</strong> Vul hierboven je e-mailadres in en tik op &ldquo;Wachtwoord vergeten?&rdquo;.
              Je krijgt dan een e-mail met een link om een nieuw wachtwoord te kiezen.
            </p>
            <p style={{ margin: '0 0 14px' }}>
              <strong>E-mailadres kwijt?</strong> Vraag een zoon, dochter of iemand anders uit je omgeving om even
              mee te kijken. Samen is het zo gevonden.
            </p>
            <p style={{ margin: '0 0 14px' }}>
              <strong>Kom je er niet uit?</strong> Stuur ons een berichtje, dan helpen we je verder.{' '}
              <a href={`mailto:${HULP_EMAIL}?subject=Hulp%20bij%20inloggen%20Blijf%20Sterk`} style={{ color: '#B34500', fontWeight: 700 }}>
                Mail ons
              </a>
            </p>
          </div>
        )}

        {bericht && (
          <p style={{ textAlign: 'center', fontSize: 15, color: '#9E5A18', marginTop: 16 }}>{bericht}</p>
        )}

        <p style={{ textAlign: 'center', marginTop: 22 }}>
          <Link href="/" style={{ fontSize: 15, color: '#6F5A48' }}>&larr; Terug naar de homepage</Link>
        </p>
      </div>
    </div>
  );
}
