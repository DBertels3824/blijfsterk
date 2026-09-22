'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ADMIN_EMAIL } from '@/lib/admin';

// Staat op de homepage: wie al ingelogd is, hoort niet op de "meld je aan"-pagina
// maar in de app. Vooral belangrijk vlak na het bevestigen van het e-mailadres —
// die link komt op de homepage uit, en de gebruiker moet dan meteen verder kunnen.
// De admin (Dirk) blijft op de homepage, zodat hij die gewoon kan bekijken.
export default function IngelogdDoorsturen() {
  const router = useRouter();

  useEffect(() => {
    let actief = true;

    const controleer = (email?: string | null) => {
      if (!actief || !email) return;
      if (email === ADMIN_EMAIL) return;
      router.replace('/dashboard');
    };

    supabase.auth.getUser().then(({ data }) => controleer(data.user?.email));

    // Na het klikken op de bevestigingslink zit de sessie in de URL; die wordt pas
    // even later verwerkt. Daarom ook luisteren naar het inloggen zelf.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      controleer(session?.user?.email);
    });

    return () => {
      actief = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
