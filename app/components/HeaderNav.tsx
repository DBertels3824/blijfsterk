'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/advies', label: 'Advies' },
  { href: '/matching', label: 'Matching' },
  { href: '/voortgang', label: 'Voortgang' },
  { href: '/intake', label: 'Profiel' },
];

export default function HeaderNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [ingelogd, setIngelogd] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setIngelogd(!!data.user);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIngelogd(!!session?.user);
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

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      {ingelogd && (
        <nav style={{ display: 'flex', gap: 20 }}>
          {LINKS.map((l) => (
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
