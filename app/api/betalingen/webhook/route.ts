import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { haalBetaling, naarOnzeStatus, isMollieIngesteld } from '@/lib/mollie';

export const dynamic = 'force-dynamic';

// Mollie roept dit aan zodra een betaling van status verandert (betaald, mislukt, ...).
// Mollie stuurt alleen het id mee; wij halen de echte status zelf op bij Mollie.
// Zo kan niemand een betaling "op betaald zetten" door zelf dit adres aan te roepen.
export async function POST(req: Request) {
  if (!isMollieIngesteld()) return NextResponse.json({ ok: false }, { status: 503 });

  let mollieId = '';
  const type = req.headers.get('content-type') || '';
  if (type.includes('application/json')) {
    mollieId = (await req.json().catch(() => ({}))).id || '';
  } else {
    const form = await req.formData().catch(() => null);
    mollieId = (form?.get('id') as string) || '';
  }
  if (!mollieId) return NextResponse.json({ ok: false }, { status: 400 });

  try {
    const betaling = await haalBetaling(mollieId);
    const status = naarOnzeStatus(betaling.status);

    const service = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    await service
      .from('betalingen')
      .update({
        status,
        betaald_op: status === 'betaald' ? betaling.paidAt || new Date().toISOString() : null,
        bijgewerkt_op: new Date().toISOString(),
      })
      .eq('mollie_id', mollieId);

    return NextResponse.json({ ok: true });
  } catch (fout: unknown) {
    console.error('Webhook Mollie mislukt:', fout);
    // 200 teruggeven zou Mollie laten denken dat het gelukt is; 500 laat 'm het later opnieuw proberen.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
