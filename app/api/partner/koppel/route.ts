import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Koppelt een ingelogd account aan een geaccepteerde partner-rij.
// Voorwaarde: het e-mailadres van het account is hetzelfde als dat van de aanmelding.
// Zet daarna de rol van het profiel op trainer/sportschool, zodat het juiste dashboard opent.
export async function POST(req: Request) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ fout: 'Niet ingelogd.' }, { status: 401 });

  const service = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: { user } } = await service.auth.getUser(token);
  if (!user || !user.email) return NextResponse.json({ fout: 'Niet ingelogd.' }, { status: 401 });

  const email = user.email.toLowerCase();
  const { data: trainer } = await service
    .from('trainers')
    .select('id, type, partnernummer, user_id')
    .eq('email', email)
    .is('user_id', null)
    .order('aangemaakt_op', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!trainer) return NextResponse.json({ gekoppeld: false });

  await service.from('trainers').update({ user_id: user.id }).eq('id', trainer.id);
  await service.from('profiles').upsert({ id: user.id, rol: trainer.type === 'sportschool' ? 'sportschool' : 'trainer' });

  return NextResponse.json({ gekoppeld: true, partnernummer: trainer.partnernummer, rol: trainer.type });
}
