'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ADMIN_EMAIL } from '@/lib/admin';

type Interesse = {
  id: string;
  naam: string;
  email: string;
  product: string;
  created_at: string;
};

export default function ProductInteresseAdmin() {
  const router = useRouter();
  const [toegestaan, setToegestaan] = useState<boolean | null>(null);
  const [lijst, setLijst] = useState<Interesse[]>([]);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    const laad = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.email !== ADMIN_EMAIL) {
        router.push('/dashboard');
        return;
      }
      setToegestaan(true);

      const { data } = await supabase
        .from('product_interesse')
        .select('*')
        .order('created_at', { ascending: false });
      setLijst(data || []);
      setLaden(false);
    };
    laad();
  }, [router]);

  if (toegestaan === null || laden) return <p style={{ padding: 24 }}>Laden...</p>;
  if (!toegestaan) return null;

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 20px 60px' }}>
      <h1 style={{ fontSize: 26, margin: '0 0 6px' }}>Interesse in het Startpakket</h1>
      <p style={{ color: '#8A7561', margin: '0 0 24px' }}>Alleen zichtbaar voor jou · {lijst.length} aanmelding{lijst.length === 1 ? '' : 'en'}</p>

      {lijst.length === 0 ? (
        <p style={{ color: '#8A7561' }}>Nog niemand aangemeld.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {lijst.map((item) => (
            <div key={item.id} style={{ borderRadius: 18, border: '2px solid #F3E4C8', background: '#FFFFFF', padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{item.naam}</div>
              <div style={{ color: '#8A7561', fontSize: 14.5, marginTop: 2 }}>{item.email}</div>
              <div style={{ color: '#8A7561', fontSize: 12.5, marginTop: 6 }}>
                {new Date(item.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
