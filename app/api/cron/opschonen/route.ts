import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Wekelijkse opruiming: klantenservice-gesprekken die zijn afgehandeld (opgelost of
// samengevoegd) en langer dan twaalf maanden geleden zijn bijgewerkt, worden verwijderd.
// Dit is de bewaartermijn die in de privacyverklaring staat. De berichten gaan mee
// (ON DELETE CASCADE). Openstaande gesprekken blijven altijd staan.
export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const header = req.headers.get('authorization');
    if (header !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ fout: 'Niet toegestaan' }, { status: 401 });
    }
  }

  try {
    const service = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const grens = new Date();
    grens.setMonth(grens.getMonth() - 12);

    const { data, error } = await service
      .from('support_tickets')
      .delete()
      .in('status', ['opgelost', 'samengevoegd'])
      .lt('bijgewerkt_op', grens.toISOString())
      .select('id');
    if (error) throw error;

    // Het maillogboek (adres, onderwerp, resultaat) bewaren we ook twaalf maanden.
    const { data: logs, error: logFout } = await service.from('email_log').delete().lt('created_at', grens.toISOString()).select('id');
    if (logFout) throw logFout;

    // Het coachgebruik (alleen wie en wanneer, voor de limiet) hoeft maar een week mee.
    const weekGeleden = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: coach, error: coachFout } = await service.from('coach_gebruik').delete().lt('created_at', weekGeleden).select('id');
    if (coachFout) throw coachFout;
    return NextResponse.json({ verwijderd: data?.length || 0, maillogboek: logs?.length || 0, coachgebruik: coach?.length || 0 });
  } catch (fout) {
    console.error('Fout in /api/cron/opschonen:', fout);
    return NextResponse.json({ fout: 'Er ging iets mis' }, { status: 500 });
  }
}
