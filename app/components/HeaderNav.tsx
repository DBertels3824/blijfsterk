'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ADMIN_EMAIL } from '@/lib/admin';

const LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/oefeningen', label: 'Oefeningen' },
  { href: '/intake', label: 'Mijn gegevens' },
];

// Matching (trainers/sportscholen) zit voorlopig in het afgeschermde deel — nog niet
// zichtbaar voor gewone gebruikers, alleen voor de admin (om het intern te bekijken).
const MATCHING_LINK = { href: '/matching', label: 'Matching' };

const ADMIN_LINKS = [
  { href: '/admin/trainers-zoeken', label: 'Trainers zoeken' },
  { href: '/admin/product-interesse', label: 'Interesse' },
  { href: '/admin/aanmeldingen', label: 'Aanmeldingen' },
  { href: '/admin/kandidaten', label: 'Trainers uitnodigen' },
  { href: '/admin/betalingen', label: 'Betalingen' },
];

const PARTNER_LINKS: Record<string, { href: string; label: string }> = {
  trainer: { href: '/trainer-dashboard', label: 'Mijn dashboard' },
  sportschool: { href: '/sportschool-dashboard', label: 'Mijn dashboard' },
};

const PUBLIEKE_LINKS = [
  { href: '/waarom-krachttraining', label: 'Waarom krachttraining' },
  { href: '/winkel', label: 'Winkel' },
  { href: '/word-partner', label: 'Word partner' },
  { href: '/login', label: 'Inloggen' },
];

const linkStijl = (actief: boolean): CSSProperties => ({
  fontSize: 14.5,
  fontWeight: actief ? 600 : 500,
  color: actief ? '#E85D00' : '#5A4636',
  textDecoration: 'none',
});

const mobielLinkStijl = (actief: boolean): CSSProperties => ({
  fontSize: 17,
  fontWeight: actief ? 700 : 500,
  color: actief ? '#E85D00' : '#2B1B0E',
  textDecoration: 'none',
  padding: '14px 4px',
  borderBottom: '1px solid #F3E4C8',
});

export default function HeaderNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [ingelogd, setIngelogd] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rol, setRol] = useState('gebruiker');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const laadRol = async (userId: string) => {
      const { data } = await supabase.from('profiles').select('rol').eq('id', userId).single();
      if (mounted) setRol(data?.rol || 'gebruiker');
    };

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) {
        setIngelogd(!!data.user);
        setIsAdmin(data.user?.email === ADMIN_EMAIL);
      }
      if (data.user) laadRol(data.user.id);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIngelogd(!!session?.user);
      setIsAdmin(session?.user?.email === ADMIN_EMAIL);
      if (session?.user) laadRol(session.user.id);
      else setRol('gebruiker');
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Sluit het uitklapmenu automatisch zodra er naar een andere pagina genavigeerd wordt.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function uitloggen() {
    setMenuOpen(false);
    await supabase.auth.signOut();
    router.push('/');
  }

  const partnerLink = PARTNER_LINKS[rol];
  const navLinks = partnerLink
    ? [partnerLink]
    : [
        ...LINKS,
        ...(isAdmin ? [MATCHING_LINK] : []),
        { href: '/winkel', label: 'Winkel' },
        { href: '/word-partner', label: 'Word partner' },
        ...(isAdmin ? ADMIN_LINKS : []),
      ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      {/* Volledige balk — verborgen op mobiel via CSS (.bs-nav-desktop, zie globals.css) */}
      <div className="bs-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {ingelogd && (
          <nav style={{ display: 'flex', gap: 20 }}>
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} style={linkStijl(pathname === l.href)}>
                {l.label}
              </Link>
            ))}
          </nav>
        )}

        {ingelogd === false && (
          <>
            {PUBLIEKE_LINKS.map((l) => (
              <Link key={l.href} href={l.href} style={linkStijl(pathname === l.href)}>
                {l.label}
              </Link>
            ))}
            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '11px 24px',
                borderRadius: 999,
                background: 'linear-gradient(135deg,#FF8601,#E85D00)',
                color: '#FFF8EE',
                fontWeight: 600,
                fontSize: 14.5,
                textDecoration: 'none',
                boxShadow: '0 6px 16px rgba(232,93,0,0.25)',
              }}
            >
              Deelnemen is gratis
            </Link>
          </>
        )}

        {ingelogd && (
          <button
            onClick={uitloggen}
            style={{
              fontSize: 13.5,
              color: '#8A7561',
              background: 'none',
              border: '1px solid #F3E4C8',
              borderRadius: 999,
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            Uitloggen
          </button>
        )}
      </div>

      {/* Hamburgerknop — alleen zichtbaar op mobiel via CSS (.bs-nav-toggle) */}
      {ingelogd !== null && (
        <button
          className="bs-nav-toggle"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Menu sluiten' : 'Menu openen'}
          aria-expanded={menuOpen}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: 12,
            border: '2px solid #F3E4C8',
            background: '#FFFFFF',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="#2B1B0E" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="#2B1B0E" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      )}

      {/* Uitklapmenu op mobiel */}
      {menuOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#FFFFFF',
            borderTop: '1px solid #F3E4C8',
            boxShadow: '0 12px 24px rgba(43,27,14,0.12)',
            padding: '4px 24px 20px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 50,
            maxHeight: 'calc(100vh - 80px)',
            overflowY: 'auto',
          }}
        >
          {ingelogd &&
            navLinks.map((l) => (
              <Link key={l.href} href={l.href} style={mobielLinkStijl(pathname === l.href)}>
                {l.label}
              </Link>
            ))}

          {ingelogd === false &&
            PUBLIEKE_LINKS.map((l) => (
              <Link key={l.href} href={l.href} style={mobielLinkStijl(pathname === l.href)}>
                {l.label}
              </Link>
            ))}

          {ingelogd === false && (
            <Link
              href="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 16,
                minHeight: 52,
                borderRadius: 999,
                background: 'linear-gradient(135deg,#FF8601,#E85D00)',
                color: '#FFF8EE',
                fontWeight: 700,
                fontSize: 16,
                textDecoration: 'none',
              }}
            >
              Deelnemen is gratis
            </Link>
          )}

          {ingelogd && (
            <button
              onClick={uitloggen}
              style={{
                fontFamily: 'inherit',
                marginTop: 16,
                minHeight: 48,
                fontSize: 15,
                color: '#8A7561',
                background: 'none',
                border: '1px solid #F3E4C8',
                borderRadius: 999,
                padding: '8px 16px',
                cursor: 'pointer',
              }}
            >
              Uitloggen
            </button>
          )}
        </div>
      )}
    </div>
  );
}
