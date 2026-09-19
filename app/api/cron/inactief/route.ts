import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Dagen sinds de laatste training waarop we een herinnering sturen. Na het
// laatste getal blijven we elke 30 dagen herinneren, zodat iemand die al
// heel lang weg is niet voorgoed stil blijft.
const MIJLPALEN = [3, 7, 14, 21, 30];

function dagenSinds(datum: Date, vandaag: Date): number {
  const ms = vandaag.getTime() - datum.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function moetHerinneren(dagen: number): boolean {
  if (MIJLPALEN.includes(dagen)) return true;
  const laatsteMijlpaal = MIJLPALEN[MIJLPALEN.length - 1];
  return dagen > laatsteMijlpaal && dagen % 30 === 0;
}

export async function GET(req: Request) {
  // Vercel Cron stuurt automatisch "Authorization: Bearer <CRON_SECRET>" mee
  // als de omgevingsvariabele CRON_SECRET is ingesteld. Zo kan niemand anders
  // dit endpoint aanroepen en ongevraagd meldingen laten versturen.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const header = req.headers.get('authorization');
    if (header !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ fout: 'Niet toegestaan' }, { status: 401 });
    }
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;

    if (!supabaseUrl || !serviceRoleKey || !vapidPublicKey || !vapidPrivateKey) {
      console.error('Cron inactief: ontbrekende omgevingsvariabelen.');
      return NextResponse.json({ fout: 'Server niet volledig ingesteld' }, { status: 500 });
    }

    webpush.setVapidDetails('mailto:info@blijfsterk.nl', vapidPublicKey, vapidPrivateKey);

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Alle opgeslagen pushabonnementen ophalen, gegroepeerd per gebruiker.
    const { data: abonnementen, error: abonnementenFout } = await admin
      .from('push_subscriptions')
      .select('id, user_id, endpoint, p256dh, auth');
    if (abonnementenFout) throw abonnementenFout;
    if (!abonnementen || abonnementen.length === 0) {
      return NextResponse.json({ verwerkt: 0, verzonden: 0, verwijderd: 0 });
    }

    const abonnementenPerGebruiker = new Map<string, typeof abonnementen>();
    for (const a of abonnementen) {
      const lijst = abonnementenPerGebruiker.get(a.user_id) || [];
      lijst.push(a);
      abonnementenPerGebruiker.set(a.user_id, lijst);
    }
    const gebruikerIds = Array.from(abonnementenPerGebruiker.keys());

    // Laatste trainingsdatum per gebruiker (alleen voor gebruikers met een abonnement nodig).
    const { data: voortgangRijen, error: voortgangFout } = await admin
      .from('voortgang')
      .select('user_id, created_at')
      .in('user_id', gebruikerIds)
      .order('created_at', { ascending: false });
    if (voortgangFout) throw voortgangFout;

    const laatsteTrainingPerGebruiker = new Map<string, Date>();
    for (const rij of voortgangRijen || []) {
      if (!laatsteTrainingPerGebruiker.has(rij.user_id)) {
        laatsteTrainingPerGebruiker.set(rij.user_id, new Date(rij.created_at));
      }
    }

    // Accountdatum nodig voor gebruikers die nog nooit getraind hebben.
    const { data: gebruikersData, error: gebruikersFout } = await admin.auth.admin.listUsers({ perPage: 1000 });
    if (gebruikersFout) throw gebruikersFout;
    const aangemaaktPerGebruiker = new Map<string, Date>();
    for (const g of gebruikersData.users) {
      aangemaaktPerGebruiker.set(g.id, new Date(g.created_at));
    }

    const vandaag = new Date();
    let verzonden = 0;
    let verwijderd = 0;

    for (const userId of gebruikerIds) {
      const laatsteTraining = laatsteTrainingPerGebruiker.get(userId);
      const referentieDatum = laatsteTraining || aangemaaktPerGebruiker.get(userId);
      if (!referentieDatum) continue;

      const dagen = dagenSinds(referentieDatum, vandaag);
      if (!moetHerinneren(dagen)) continue;

      const titel = 'Blijf Sterk';
      const tekst = laatsteTraining
        ? `We hebben je gemist — het is ${dagen} dagen geleden dat je trainde. Kom terug voor een korte oefening.`
        : 'Nog geen eerste training gedaan? Zet vandaag je eerste stap bij Blijf Sterk.';

      const payload = JSON.stringify({ title: titel, body: tekst, url: '/oefeningen' });

      for (const abonnement of abonnementenPerGebruiker.get(userId) || []) {
        try {
          await webpush.sendNotification(
            {
              endpoint: abonnement.endpoint,
              keys: { p256dh: abonnement.p256dh, auth: abonnement.auth },
            },
            payload
          );
          verzonden += 1;
        } catch (fout: any) {
          // Een abonnement dat niet meer bestaat (bijv. browserdata gewist) geeft 404/410.
          // Dan ruimen we het meteen op, anders proberen we het bij de volgende run gewoon opnieuw.
          if (fout?.statusCode === 404 || fout?.statusCode === 410) {
            await admin.from('push_subscriptions').delete().eq('id', abonnement.id);
            verwijderd += 1;
          } else {
            console.error('Push mislukt voor abonnement', abonnement.id, fout?.statusCode, fout?.body);
          }
        }
      }
    }

    return NextResponse.json({ verwerkt: gebruikerIds.length, verzonden, verwijderd });
  } catch (fout) {
    console.error('Fout in /api/cron/inactief:', fout);
    return NextResponse.json({ fout: 'Er ging iets mis' }, { status: 500 });
  }
}
