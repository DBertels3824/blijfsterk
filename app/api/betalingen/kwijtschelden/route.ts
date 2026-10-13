import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ADMIN_EMAIL } from '@/lib/admin';
import { INSCHRIJFGELD_SOORT, maakZichtbaar } from '@/lib/partners';

export const dynamic = 'force-dynamic';

// Alleen voor de beheerder: een openstaande betaling kwijtschelden (status "gratis").
// Handig voor een founding partner, en zolang Mollie nog niet actief is. Is het
// het inschrijfgeld, dan wordt de partner meteen zichtbaar voor gebruikers.
export async function POST(req: Request) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const service = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: { user } } = await service.auth.getUser(token);
  if (!user || user.email !== ADMIN_EMAIL) return NextResponse.json({ fout: 'Niet toegestaan.' }, { status: 403 });

  const { betalingId } = await req.json().catch(() => ({}));
  if (!betalingId) return NextResponse.json({ fout: 'Geen betaling opgegeven.' }, { status: 400 });

  const { data: betaling } = await service.from('betalingen').select('id, soort, status, trainer_id').eq('id', betalingId).single();
  if (!betaling) return NextResponse.json({ fout: 'Betaling niet gevonden.' }, { status: 404 });
  if (betaling.status === 'betaald') return NextResponse.json({ fout: 'Deze betaling is al voldaan.' }, { status: 400 });

  const nu = new Date().toISOString();
  await service.from('betalingen').update({ status: 'gratis', betaald_op: nu, bijgewerkt_op: nu }).eq('id', betaling.id);

  if (betaling.soort === INSCHRIJFGELD_SOORT && betaling.trainer_id) {
    await maakZichtbaar(service, betaling.trainer_id);
  }
  return NextResponse.json({ ok: true });
}
