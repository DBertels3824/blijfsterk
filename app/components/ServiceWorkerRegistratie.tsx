'use client';

import { useEffect } from 'react';

// Registreert de service worker (public/sw.js), nodig om Blijf Sterk als app
// op de telefoon te kunnen zetten en om pushmeldingen te kunnen ontvangen.
// Toont zelf niets op het scherm.
export default function ServiceWorkerRegistratie() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Stil falen — bijvoorbeeld op browsers zonder ondersteuning. Niet storend voor de gebruiker.
      });
    }
  }, []);

  return null;
}
