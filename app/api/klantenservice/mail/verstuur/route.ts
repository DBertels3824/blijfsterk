import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { ADMIN_EMAIL } from '@/lib/admin';
import { onderwerpMetNummer, stuurMail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// Dirk keurt een concept goed (eventueel aangepast) of schrijft zelf een antwoord, en dit
// verstuurt de mail. Alleen de beheerder mag dit; niemand anders kan via deze route mailen.

const MAX_TEKST = 4000;

function dienst(): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(req: Request) {
  const service = dienst();
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return NextResponse.json({ ok: false, fout: 'Niet ingelogd.' }, { status: 401 });
  const { data: { user } } = await service.auth.getUser(token);
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return NextResponse.json({ ok: false, fout: 'Niet toegestaan.' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const ticketId = String(body?.ticketId || '').slice(0, 64);
  const conceptId = body?.conceptId ? String(body.conceptId).slice(0, 64) : null;
  const tekst = String(body?.tekst || '').trim();
  if (!ticketId || !tekst) return NextResponse.json({ ok: false, fout: 'Schrijf eerst een tekst.' }, { status: 400 });
  if (tekst.length > MAX_TEKST) return NextResponse.json({ ok: false, fout: 'De mail is te lang.' }, { status: 400 });

  const { data: ticket } = await service
    .from('support_tickets')
    .select('id, nummer, kanaal, email, onderwerp, mail_onderwerp')
    .eq('id', ticketId)
    .maybeSingle();
  if (!ticket || !ticket.email) return NextResponse.json({ ok: false, fout: 'Dit gesprek heeft geen e-mailadres.' }, { status: 400 });

  // Het concept moet bij dit gesprek horen en nog openstaan.
  let concept: { id: string; tekst: string } | null = null;
  if (conceptId) {
    const { data } = await service.from('support_concepten').select('id, tekst').eq('id', conceptId).eq('ticket_id', ticket.id).eq('status', 'concept').maybeSingle();
    if (!data) return NextResponse.json({ ok: false, fout: 'Dit concept is niet meer actueel. Laad de pagina opnieuw.' }, { status: 409 });
    concept = data;
  }

  // Draad: antwoord op de laatste mail van de klant.
  const { data: rijen } = await service
    .from('support_berichten')
    .select('message_id')
    .eq('ticket_id', ticket.id)
    .eq('afzender', 'klant')
    .not('message_id', 'is', null)
    .order('created_at', { ascending: true });
  const ids = (rijen || []).map((r) => r.message_id as string);

  const resultaat = await stuurMail(service, {
    aan: ticket.email,
    onderwerp: onderwerpMetNummer(ticket.mail_onderwerp || ticket.onderwerp || 'Je vraag aan Blijf Sterk', ticket.nummer),
    tekst,
    soort: 'klantenservice',
    ticketId: ticket.id,
    inReplyTo: ids.length ? ids[ids.length - 1] : null,
    references: ids,
  });
  if (!resultaat.ok) return NextResponse.json({ ok: false, status: resultaat.status, fout: resultaat.fout }, { status: resultaat.status === 'overgeslagen' ? 200 : 502 });

  const nu = new Date().toISOString();
  const ongewijzigd = !!concept && concept.tekst.trim() === tekst;
  await service.from('support_berichten').insert({ ticket_id: ticket.id, afzender: ongewijzigd ? 'agent' : 'dirk', tekst });
  if (concept) await service.from('support_concepten').update({ status: 'verstuurd', besloten_op: nu }).eq('id', concept.id);
  await service
    .from('support_tickets')
    .update({ status: 'wacht_op_klant', laatste_bericht_op: nu, bijgewerkt_op: nu, ...(concept ? {} : { agent_actief: false }) })
    .eq('id', ticket.id);

  return NextResponse.json({ ok: true });
}
