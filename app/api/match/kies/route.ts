import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GRATIS_MATCHES, MATCHVERGOEDING_CENT, openGesprek } from '@/lib/gesprekken';

export const dynamic = 'force-dynamic';

// De gebruiker kiest een trainer. Wat er dan gebeurt:
// 1. Match vastleggen.
// 2. Gesprek aanmaken (nog dicht).
// 3. Matchvergoeding klaarzetten voor de trainer. Eerste twee matches gratis → gesprek
//    gaat meteen open. Anders opent het gesprek pas als de trainer betaald heeft
//    (webhook van Mollie).
export async function POST(req: Request) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ fout: 'Niet ingelogd.' }, { status: 401 });

  const { trainerId } = await req.json().catch(() => ({}));
  if (!trainerId) return NextResponse.json({ fout: 'Geen trainer gekozen.' }, { status: 400 });

  const service = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: { user } } = await service.auth.getUser(token);
  if (!user) return NextResponse.json({ fout: 'Niet ingelogd.' }, { status: 401 });

  const { data: trainer } = await service.from('trainers').select('id, naam, type, partnernummer, zichtbaar').eq('id', trainerId).single();
  if (!trainer || trainer.zichtbaar === false) return NextResponse.json({ fout: 'Deze partner is niet beschikbaar.' }, { status: 404 });

  const matchType = trainer.type === 'sportschool' ? 'sportschool' : trainer.type === 'voedingsdeskundige' ? 'voedingsdeskundige' : 'trainer';

  // 1. Match (één per type per gebruiker)
  await service.from('matches').delete().eq('user_id', user.id).eq('type', matchType);
  await service.from('matches').insert({ user_id: user.id, trainer_id: trainer.id, type: matchType });

  // 2. Gesprek (bestaat er al een tussen deze twee? dan hergebruiken)
  const { data: bestaand } = await service.from('gesprekken').select('id, status').eq('user_id', user.id).eq('trainer_id', trainer.id).maybeSingle();
  let gesprekId = bestaand?.id as string | undefined;
  if (!gesprekId) {
    const { data: nieuw, error } = await service
      .from('gesprekken')
      .insert({ user_id: user.id, trainer_id: trainer.id, partnernummer: trainer.partnernummer })
      .select('id')
      .single();
    if (error || !nieuw) return NextResponse.json({ fout: 'Gesprek aanmaken mislukt.' }, { status: 500 });
    gesprekId = nieuw.id;
  } else if (bestaand?.status === 'open') {
    return NextResponse.json({ ok: true, gesprekId, status: 'open' });
  }
  if (!gesprekId) return NextResponse.json({ fout: 'Gesprek aanmaken mislukt.' }, { status: 500 });

  // 3. Vergoeding: gratis zolang de partner nog binnen zijn gratis matches zit
  const { count: eerdere } = await service
    .from('betalingen')
    .select('*', { count: 'exact', head: true })
    .eq('trainer_id', trainer.id)
    .eq('soort', 'matchvergoeding')
    .in('status', ['betaald', 'gratis']);
  const gratis = (eerdere || 0) < GRATIS_MATCHES;

  const gebruikerNaam = (user.user_metadata?.naam as string | undefined)?.split(' ')[0] || 'een nieuwe klant';
  const { data: betaling } = await service
    .from('betalingen')
    .insert({
      partnernummer: trainer.partnernummer || 'BS-ONBEKEND',
      trainer_id: trainer.id,
      soort: 'matchvergoeding',
      omschrijving: gratis ? `Matchvergoeding ${gebruikerNaam} (gratis, founding partner)` : `Matchvergoeding nieuwe klant: ${gebruikerNaam}`,
      bedrag_cent: gratis ? 0 : MATCHVERGOEDING_CENT,
      status: gratis ? 'gratis' : 'open',
      gesprek_id: gesprekId,
      betaald_op: gratis ? new Date().toISOString() : null,
    })
    .select('id')
    .single();
  if (betaling) await service.from('gesprekken').update({ betaling_id: betaling.id }).eq('id', gesprekId);

  if (gratis) {
    await openGesprek(service, gesprekId);
    return NextResponse.json({ ok: true, gesprekId, status: 'open' });
  }
  return NextResponse.json({ ok: true, gesprekId, status: 'wacht_op_betaling' });
}
