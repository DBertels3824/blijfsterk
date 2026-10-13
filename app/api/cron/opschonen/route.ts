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
    return NextResponse.json({ verwijderd: data?.length || 0 });
  } catch (fout) {
    console.error('Fout in /api/cron/opschonen:', fout);
    return NextResponse.json({ fout: 'Er ging iets mis' }, { status: 500 });
  }
}
