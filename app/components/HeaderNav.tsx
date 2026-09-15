'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ADMIN_EMAIL } from '@/lib/admin';

const LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/advies', label: 'Advies' },
  { href: '/matching', label: 'Matching' },
  { href: '/voortgang', label: 'Voortgang' },
  { href: '/intake', label: 'Profiel' },
];

const ADMIN_LINKS = [
  { href: '/admin/trainers-zoeken', label: 'Trainers zoeken' },
  { href: '/admin/product-interesse', label: 'Interesse' },
  { href: '/admin/aanmeldingen', label: 'Aanmeldingen' },
];

const PARTNER_LINKS: Record<string, { href: string; label: string }> = {
  trainer: { href: '/trainer-dashboard', label: 'Mijn dashboard' },
  sportschool: { href: '/sportschool-dashboard', label: 'Mijn dashboard' },
};

export default function HeaderNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [ingelogd, setIngelogd] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rol, setRol] = useState('gebruiker');

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

  async function uitloggen() {
    await supabase.auth.signOut();
    router.push('/');
  }

  const partnerLink = PARTNER_LINKS[rol];
  const navLinks = partnerLink
    ? [partnerLink]
    : [
        ...LINKS,
        { href: '/winkel', label: 'Winkel' },
        { href: '/word-partner', label: 'Word partner' },
        ...(isAdmin ? ADMIN_LINKS : []),
      ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      {ingelogd && (
        <nav style={{ display: 'flex', gap: 20 }}>
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontSize: 14.5,
                fontWeight: pathname === l.href ? 600 : 500,
                color: pathname === l.href ? '#E85D00' : '#5A4636',
                textDecoration: 'none',
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}

      {ingelogd === false && (
        <>
          <Link href="/winkel" style={{ fontSize: 15, fontWeight: 500, color: '#2B1B0E', textDecoration: 'none' }}>
            Winkel
          </Link>
          <Link href="/word-partner" style={{ fontSize: 15, fontWeight: 500, color: '#2B1B0E', textDecoration: 'none' }}>
            Word partner
          </Link>
          <Link href="/login" style={{ fontSize: 15, fontWeight: 500, color: '#2B1B0E', textDecoration: 'none' }}>
            Inloggen
          </Link>
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
            Start gratis
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
  );
}
