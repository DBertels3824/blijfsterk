'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

type Status = 'onbekend' | 'niet_ondersteund' | 'uit' | 'aan' | 'geweigerd' | 'bezig';

// Kaartje dat vraagt om pushmeldingen aan te zetten (bijv. een seintje als iemand
// een paar dagen niet getraind heeft). Toont zichzelf niet als het al aanstaat,
// niet ondersteund wordt, of als de gebruiker eerder geweigerd heeft.
export default function PushMeldingenKnop() {
  const [status, setStatus] = useState<Status>('onbekend');

  useEffect(() => {
    const controleer = async () => {
      if (
        typeof window === 'undefined' ||
        !('serviceWorker' in navigator) ||
        !('PushManager' in window) ||
        !('Notification' in window) ||
        !VAPID_PUBLIC_KEY
      ) {
        setStatus('niet_ondersteund');
        return;
      }
      if (Notification.permission === 'denied') {
        setStatus('geweigerd');
        return;
      }
      try {
        const registratie = await navigator.serviceWorker.ready;
        const bestaand = await registratie.pushManager.getSubscription();
        setStatus(bestaand ? 'aan' : 'uit');
      } catch {
        setStatus('niet_ondersteund');
      }
    };
    controleer();
  }, []);

  async function zetAan() {
    setStatus('bezig');
    try {
      const toestemming = await Notification.requestPermission();
      if (toestemming !== 'granted') {
        setStatus('geweigerd');
        return;
      }

      const registratie = await navigator.serviceWorker.ready;
      const subscription = await registratie.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        setStatus('uit');
        return;
      }

      const json = subscription.toJSON();
      await supabase.from('push_subscriptions').upsert(
        {
          user_id: user.id,
          endpoint: json.endpoint,
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
        },
        { onConflict: 'endpoint' }
      );

      setStatus('aan');
    } catch (fout) {
      console.error('Kon meldingen niet aanzetten:', fout);
      // Komt op iPhone vaak doordat de site nog niet als app is toegevoegd —
      // dat kan pas ná installatie. Geen harde foutmelding, gewoon terug naar "uit".
      setStatus('uit');
    }
  }

  if (status === 'niet_ondersteund' || status === 'aan' || status === 'onbekend') return null;

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        background: '#FFFFFF', border: '2px solid #F3E4C8', borderRadius: 20,
        padding: '14px 16px', marginBottom: 16,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#2B1B0E' }}>
          {status === 'geweigerd' ? 'Meldingen staan uit' : 'Wil je een seintje als je een dag mist?'}
        </div>
        <div style={{ fontSize: 13.5, color: '#8A7561', marginTop: 2 }}>
          {status === 'geweigerd'
            ? 'Zet meldingen aan bij de instellingen van je browser of telefoon.'
            : 'Zet meldingen aan, dan herinneren we je eraan.'}
        </div>
      </div>
      {status !== 'geweigerd' && (
        <button
          onClick={zetAan}
          disabled={status === 'bezig'}
          style={{
            fontFamily: 'inherit', fontWeight: 700, fontSize: 13.5, whiteSpace: 'nowrap',
            borderRadius: 999, padding: '10px 18px', border: 'none', cursor: status === 'bezig' ? 'default' : 'pointer',
            background: 'linear-gradient(135deg,#FFBE0A,#FF8601)', color: '#3A1E00',
            opacity: status === 'bezig' ? 0.7 : 1,
          }}
        >
          {status === 'bezig' ? 'Bezig...' : 'Zet aan'}
        </button>
      )}
    </div>
  );
}
