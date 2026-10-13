import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ADMIN_EMAIL } from '@/lib/admin';
import { isPartnerType, PARTNERTYPEN } from '@/lib/partnertypen';
import { inschrijfgeldVoldaan, maakPartnerRij, maakZichtbaar } from '@/lib/partners';

export const dynamic = 'force-dynamic';

// Handmatig accepteren of afwijzen door de beheerder (voor aanmeldingen die niet
// automatisch door de toetsing kwamen). Accepteren maakt de partner-rij aan.
export async function POST(req: Request) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const service = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: { user } } = await service.auth.getUser(token);
  if (!user || user.email !== ADMIN_EMAIL) return NextResponse.json({ fout: 'Niet toegestaan.' }, { status: 403 });

  const { aanmeldingId, besluit } = await req.json().catch(() => ({}));
  if (!aanmeldingId || !['geaccepteerd', 'afgewezen', 'in behandeling', 'nieuw'].includes(besluit)) {
    return NextResponse.json({ fout: 'Ongeldig verzoek.' }, { status: 400 });
  }

  const { data: a } = await service.from('trainer_aanmeldingen').select('*').eq('id', aanmeldingId).single();
  if (!a) return NextResponse.json({ fout: 'Aanmelding niet gevonden.' }, { status: 404 });

  const partnerType: unknown = a.type;
  let trainerId: string | null = a.trainer_id;

  if (besluit === 'geaccepteerd' && !trainerId) {
    // Nog niet zichtbaar: dat wordt de partner pas na betaling van het inschrijfgeld.
    trainerId = await maakPartnerRij(service, {
      naam: a.naam,
      plaats: a.plaats,
      type: a.type,
      email: a.email,
      specialisatie: isPartnerType(partnerType) ? PARTNERTYPEN[partnerType].specialisatie : 'Partner',
      partnernummer: a.partnernummer,
      aanmeldingId: a.id,
    });
  }
  if (besluit === 'geaccepteerd' && trainerId && (await inschrijfgeldVoldaan(service, trainerId))) {
    await maakZichtbaar(service, trainerId);
  }
  if (besluit === 'afgewezen' && trainerId) {
    await service.from('trainers').update({ zichtbaar: false, status: 'pauze' }).eq('id', trainerId);
  }

  await service
    .from('trainer_aanmeldingen')
    .update({ status: besluit, trainer_id: trainerId, beoordeeld_op: besluit === 'geaccepteerd' || besluit === 'afgewezen' ? new Date().toISOString() : null })
    .eq('id', a.id);

  if (a.partnernummer) {
    await service.from('trainer_kandidaten').update({ status: besluit === 'afgewezen' ? 'nee' : 'aangemeld' }).eq('partnernummer', a.partnernummer);
  }

  return NextResponse.json({ ok: true, trainerId });
}
