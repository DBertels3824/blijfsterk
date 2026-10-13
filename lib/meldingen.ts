import type { SupabaseClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import { ADMIN_EMAIL } from '@/lib/admin';

// Stuurt een pushmelding naar de telefoon of browser van de beheerder (Dirk), als die
// meldingen heeft aangezet. Gooit nooit een fout: een mislukte melding mag een gesprek
// met een klant niet kapot maken.
export async function meldAanBeheerder(service: SupabaseClient, melding: { titel: string; tekst: string; url: string }): Promise<void> {
  try {
    const publiek = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const prive = process.env.VAPID_PRIVATE_KEY;
    if (!publiek || !prive) return;
    webpush.setVapidDetails('mailto:info@blijfsterk.nl', publiek, prive);

    const { data: lijst } = await service.auth.admin.listUsers({ perPage: 1000 });
    const beheerder = lijst?.users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
    if (!beheerder) return;

    const { data: abonnementen } = await service
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('user_id', beheerder.id);

    const payload = JSON.stringify({ title: melding.titel, body: melding.tekst, url: melding.url });
    for (const a of abonnementen || []) {
      try {
        await webpush.sendNotification({ endpoint: a.endpoint, keys: { p256dh: a.p256dh, auth: a.auth } }, payload);
      } catch (fout: unknown) {
        const status = (fout as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) await service.from('push_subscriptions').delete().eq('id', a.id);
      }
    }
  } catch (fout) {
    console.error('Melding aan beheerder mislukt:', fout);
  }
}
