import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { maakBetaling, isMollieIngesteld } from '@/lib/mollie';

export const dynamic = 'force-dynamic';

// Start een iDEAL-betaling voor een openstaande rij in de tabel betalingen.
// De ingelogde partner stuurt zijn sessie-token mee; we controleren dat de betaling
// echt van hem is, maken 'm aan bij Mollie, en sturen de betaalpagina terug.
export async function POST(req: Request) {
  if (!isMollieIngesteld()) {
    return NextResponse.json({ fout: 'Betalen is nog niet ingesteld.' }, { status: 503 });
  }

  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ fout: 'Niet ingelogd.' }, { status: 401 });

  const { betalingId } = await req.json().catch(() => ({}));
  if (!betalingId) return NextResponse.json({ fout: 'Geen betaling opgegeven.' }, { status: 400 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: { user }, error: userFout } = await service.auth.getUser(token);
  if (userFout || !user) return NextResponse.json({ fout: 'Niet ingelogd.' }, { status: 401 });

  const { data: betaling } = await service
    .from('betalingen')
    .select('id, partnernummer, trainer_id, omschrijving, bedrag_cent, status, mollie_id')
    .eq('id', betalingId)
    .single();
  if (!betaling) return NextResponse.json({ fout: 'Betaling niet gevonden.' }, { status: 404 });

  // Hoort deze betaling bij een trainer-rij van de ingelogde gebruiker?
  const { data: eigen } = await service.from('trainers').select('id').eq('id', betaling.trainer_id).eq('user_id', user.id).maybeSingle();
  if (!eigen) return NextResponse.json({ fout: 'Deze betaling is niet van jou.' }, { status: 403 });

  if (betaling.status === 'betaald') return NextResponse.json({ fout: 'Deze betaling is al voldaan.' }, { status: 400 });

  const origin = new URL(req.url).origin;
  try {
    const mollie = await maakBetaling({
      bedragCent: betaling.bedrag_cent,
      // Het partnernummer staat in de omschrijving: zo staat het ook op het bankafschrift.
      omschrijving: `Blijf Sterk ${betaling.partnernummer} - ${betaling.omschrijving}`.slice(0, 255),
      redirectUrl: `${origin}/trainer-dashboard?betaling=${betaling.id}`,
      webhookUrl: `${origin}/api/betalingen/webhook`,
      metadata: { betalingId: betaling.id, partnernummer: betaling.partnernummer },
    });

    await service
      .from('betalingen')
      .update({ mollie_id: mollie.id, status: 'wacht_op_betaling', bijgewerkt_op: new Date().toISOString() })
      .eq('id', betaling.id);

    const checkoutUrl = mollie._links?.checkout?.href;
    if (!checkoutUrl) throw new Error('Geen betaalpagina ontvangen van Mollie.');
    return NextResponse.json({ checkoutUrl });
  } catch (fout: unknown) {
    console.error('Betaling starten mislukt:', fout);
    return NextResponse.json({ fout: 'Betaling starten is niet gelukt. Probeer het nog eens.' }, { status: 500 });
  }
}
