import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { ADMIN_EMAIL } from '@/lib/admin';
import { CATEGORIEEN, URGENTIES, vraagAgent, type GespreksBericht, type KlantContext, type OpenMelding } from '@/lib/klantenservice';
import { meldAanBeheerder } from '@/lib/meldingen';
import { INSCHRIJFGELD_SOORT } from '@/lib/partners';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Chat met de digitale hulp-assistent. Werkt voor iedereen, ook zonder account (iemand die
// niet kan inloggen moet toch hulp kunnen vragen). Een gesprek hoort bij een geheime sleutel
// die alleen de browser van de klant kent. Alleen de server schrijft naar de database.

const MAX_TEKST = 1500;
const MAX_BERICHTEN_PER_GESPREK = 60;
const MAX_NIEUWE_GESPREKKEN_PER_UUR = 8;

type Ticket = {
  id: string;
  nummer: number;
  sleutel: string;
  user_id: string | null;
  status: string;
  agent_actief: boolean;
  email: string | null;
  naam: string | null;
  rol: string;
  pagina: string | null;
  apparaat: string | null;
};

function dienst(): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function sleutelKlopt(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function ipHash(req: Request): string {
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'onbekend';
  return createHash('sha256').update(`blijfsterk:${ip}`).digest('hex').slice(0, 24);
}

const emailGeldig = (e: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) && e.length <= 200;
const kort = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);

// Wie is dit? Alleen als de klant ingelogd is, en dan alleen wat het systeem zelf weet.
async function bepaalKlant(service: SupabaseClient, token: string) {
  if (!token) return null;
  const { data: { user } } = await service.auth.getUser(token);
  if (!user) return null;
  const voornaam = ((user.user_metadata?.naam as string | undefined) || '').split(' ')[0] || null;
  const { data: partners } = await service.from('trainers').select('id, type, status, zichtbaar').eq('user_id', user.id);
  const partner = partners && partners.length ? partners[0] : null;
  const partnerRegels: string[] = [];
  if (partner) {
    partnerRegels.push(`Partner: ${partner.type}, status ${partner.status}, zichtbaar voor gebruikers: ${partner.zichtbaar ? 'ja' : 'nee'}.`);
    const { data: betalingen } = await service
      .from('betalingen')
      .select('soort, status, bedrag_cent')
      .eq('trainer_id', partner.id)
      .order('aangemaakt_op', { ascending: false })
      .limit(8);
    for (const b of betalingen || []) {
      const naam = b.soort === INSCHRIJFGELD_SOORT ? 'Inschrijfgeld' : b.soort === 'matchvergoeding' ? 'Matchvergoeding' : b.soort;
      partnerRegels.push(`${naam}: ${b.status} (${(b.bedrag_cent / 100).toFixed(2)} euro).`);
    }
  }
  const rol: KlantContext['rol'] = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'beheerder' : partner ? 'partner' : 'gebruiker';
  return { user, voornaam, rol, partnerRegels };
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ fout: 'Ongeldig bericht.' }, { status: 400 });

  const tekst = kort(body.tekst, MAX_TEKST + 1);
  if (!tekst) return NextResponse.json({ fout: 'Schrijf eerst iets.' }, { status: 400 });
  if (tekst.length > MAX_TEKST) return NextResponse.json({ fout: 'Dit bericht is te lang. Maak het korter.' }, { status: 400 });

  const service = dienst();
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const klant = await bepaalKlant(service, token);

  // 1. Bestaand gesprek (met sleutel) of een nieuw gesprek.
  let ticket: Ticket | null = null;
  const ticketId = kort(body.ticketId, 64);
  const sleutelIn = kort(body.sleutel, 64);
  if (ticketId) {
    const { data } = await service
      .from('support_tickets')
      .select('id, nummer, sleutel, user_id, status, agent_actief, email, naam, rol, pagina, apparaat')
      .eq('id', ticketId)
      .maybeSingle();
    if (!data || !sleutelKlopt(data.sleutel, sleutelIn)) {
      return NextResponse.json({ fout: 'Dit gesprek is niet gevonden. Begin een nieuw gesprek.' }, { status: 404 });
    }
    ticket = data as Ticket;
  } else {
    const hash = ipHash(req);
    const sinds = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await service.from('support_tickets').select('*', { count: 'exact', head: true }).eq('ip_hash', hash).gte('created_at', sinds);
    if ((count || 0) >= MAX_NIEUWE_GESPREKKEN_PER_UUR) {
      return NextResponse.json({ fout: 'Er zijn net veel gesprekken gestart vanaf dit apparaat. Probeer het over een uur nog eens.' }, { status: 429 });
    }
    const emailIn = kort(body.email, 200).toLowerCase();
    const email = klant?.user.email || (emailGeldig(emailIn) ? emailIn : null);
    const { data, error } = await service
      .from('support_tickets')
      .insert({
        sleutel: randomUUID().replace(/-/g, ''),
        user_id: klant?.user.id || null,
        naam: klant?.voornaam || kort(body.naam, 80) || null,
        email,
        rol: klant?.rol || 'bezoeker',
        pagina: kort(body.pagina, 200) || null,
        apparaat: kort(body.apparaat, 200) || null,
        ip_hash: hash,
      })
      .select('id, nummer, sleutel, user_id, status, agent_actief, email, naam, rol, pagina, apparaat')
      .single();
    if (error || !data) {
      console.error('Gesprek aanmaken mislukt:', error?.message);
      return NextResponse.json({ fout: 'Starten van het gesprek is niet gelukt. Probeer het nog eens.' }, { status: 500 });
    }
    ticket = data as Ticket;
  }

  // 2. Niet eindeloos doorgaan (kosten en misbruik).
  const { count: aantal } = await service.from('support_berichten').select('*', { count: 'exact', head: true }).eq('ticket_id', ticket.id);
  if ((aantal || 0) >= MAX_BERICHTEN_PER_GESPREK) {
    return NextResponse.json({ fout: 'Dit gesprek is erg lang geworden. Wacht even op Dirk, of begin een nieuw gesprek.' }, { status: 429 });
  }

  // 3. Bericht van de klant opslaan.
  const nu = () => new Date().toISOString();
  await service.from('support_berichten').insert({ ticket_id: ticket.id, afzender: 'klant', tekst });
  await service.from('support_tickets').update({ laatste_bericht_op: nu(), bijgewerkt_op: nu() }).eq('id', ticket.id);

  // Dirk heeft het gesprek overgenomen: de assistent zwijgt, Dirk krijgt een seintje.
  if (!ticket.agent_actief) {
    await service.from('support_tickets').update({ status: 'aandacht' }).eq('id', ticket.id);
    await meldAanBeheerder(service, { titel: `Klantenservice: nieuw bericht (#${ticket.nummer})`, tekst: tekst.slice(0, 120), url: '/admin/klantenservice' });
    return NextResponse.json({ ticketId: ticket.id, sleutel: ticket.sleutel, nummer: ticket.nummer, antwoord: null, status: 'aandacht', dirkLeestMee: true });
  }

  // 4. De assistent laten antwoorden.
  const { data: berichtenRijen } = await service
    .from('support_berichten')
    .select('afzender, tekst')
    .eq('ticket_id', ticket.id)
    .in('afzender', ['klant', 'agent', 'dirk'])
    .order('created_at', { ascending: true });
  const gesprek: GespreksBericht[] = (berichtenRijen || []).map((r) => ({ rol: r.afzender as GespreksBericht['rol'], tekst: r.tekst }));

  const { data: openRijen } = await service
    .from('support_tickets')
    .select('id, nummer, categorie, onderwerp')
    .in('status', ['aandacht', 'wacht_op_klant'])
    .neq('id', ticket.id)
    .order('laatste_bericht_op', { ascending: false })
    .limit(20);
  const openMeldingen = (openRijen || []) as OpenMelding[];

  const context: KlantContext = {
    rol: (klant?.rol || ticket.rol || 'bezoeker') as KlantContext['rol'],
    voornaam: klant?.voornaam || ticket.naam,
    pagina: ticket.pagina,
    apparaat: ticket.apparaat,
    emailBekend: !!ticket.email,
    partnerRegels: klant?.partnerRegels || [],
  };

  let status = ticket.status;
  const geldigeOpenIds = new Set(openMeldingen.map((m) => m.id));

  const voerToolUit = async (naam: string, invoer: Record<string, unknown>): Promise<Record<string, unknown>> => {
    if (naam === 'bewaar_contact') {
      const email = kort(invoer.email, 200).toLowerCase();
      if (!emailGeldig(email)) return { ok: false, fout: 'Dat e-mailadres lijkt niet te kloppen.' };
      await service.from('support_tickets').update({ email, naam: kort(invoer.naam, 80) || ticket!.naam }).eq('id', ticket!.id);
      return { ok: true };
    }
    if (naam === 'markeer_opgelost') {
      await service.from('support_tickets').update({ status: 'opgelost', opgelost_door: 'agent', bijgewerkt_op: nu() }).eq('id', ticket!.id);
      status = 'opgelost';
      return { ok: true };
    }
    if (naam === 'meld_aan_dirk') {
      const categorie = (CATEGORIEEN as readonly string[]).includes(String(invoer.categorie)) ? String(invoer.categorie) : 'anders';
      const urgentie = (URGENTIES as readonly string[]).includes(String(invoer.urgentie)) ? String(invoer.urgentie) : 'normaal';
      const onderwerp = kort(invoer.onderwerp, 80) || 'Zonder onderwerp';
      const samenvatting = kort(invoer.samenvatting, 1200);
      const stappen = kort(invoer.stappen, 1200);
      const dubbelVan = kort(invoer.dubbel_van, 64);

      // Dezelfde melding als een al open melding: samenvoegen, Dirk krijgt geen tweede ticket.
      if (dubbelVan && geldigeOpenIds.has(dubbelVan)) {
        const { data: origineel } = await service.from('support_tickets').select('nummer, aantal_meldingen').eq('id', dubbelVan).single();
        if (origineel) {
          await service.from('support_tickets').update({ aantal_meldingen: (origineel.aantal_meldingen || 1) + 1, bijgewerkt_op: nu() }).eq('id', dubbelVan);
          await service
            .from('support_tickets')
            .update({ status: 'samengevoegd', dubbel_van: dubbelVan, categorie, urgentie, onderwerp, samenvatting, details: { stappen }, bijgewerkt_op: nu() })
            .eq('id', ticket!.id);
          await service.from('support_berichten').insert({ ticket_id: ticket!.id, afzender: 'systeem', tekst: `Samengevoegd met melding #${origineel.nummer}.` });
          status = 'samengevoegd';
          return { ok: true, samengevoegd: true };
        }
      }

      await service
        .from('support_tickets')
        .update({ status: 'aandacht', categorie, urgentie, onderwerp, samenvatting, details: { stappen }, bijgewerkt_op: nu() })
        .eq('id', ticket!.id);
      await service.from('support_berichten').insert({ ticket_id: ticket!.id, afzender: 'systeem', tekst: `Doorgegeven aan Dirk (${categorie}, ${urgentie}): ${onderwerp}` });
      status = 'aandacht';
      await meldAanBeheerder(service, {
        titel: `${urgentie === 'hoog' ? 'Spoed: ' : ''}Klantenservice #${ticket!.nummer}`,
        tekst: onderwerp,
        url: '/admin/klantenservice',
      });
      return { ok: true };
    }
    return { ok: false, fout: 'Onbekende actie.' };
  };

  let antwoord = '';
  try {
    const uitkomst = await vraagAgent({ gesprek, context, openMeldingen, voerToolUit });
    antwoord = uitkomst.tekst;
    console.log('Klantenservice:', { ticket: ticket.nummer, model: uitkomst.model, tools: uitkomst.toolsGebruikt });
  } catch (fout) {
    console.error('Hulp-assistent mislukt:', fout);
  }

  // Lukt de assistent niet, of komt er niets uit: de klant blijft niet in de kou staan.
  if (!antwoord) {
    antwoord = 'Sorry, mijn assistent werkt even niet goed. Ik heb je bericht doorgegeven aan Dirk. Hij leest mee en antwoordt hier in de chat.';
    if (status !== 'aandacht') {
      await service
        .from('support_tickets')
        .update({ status: 'aandacht', categorie: 'anders', urgentie: 'normaal', onderwerp: 'Assistent kon niet antwoorden', samenvatting: tekst.slice(0, 500), bijgewerkt_op: nu() })
        .eq('id', ticket.id);
      status = 'aandacht';
      await meldAanBeheerder(service, { titel: `Klantenservice #${ticket.nummer}`, tekst: 'Assistent kon niet antwoorden', url: '/admin/klantenservice' });
    }
  }

  await service.from('support_berichten').insert({ ticket_id: ticket.id, afzender: 'agent', tekst: antwoord });
  await service.from('support_tickets').update({ laatste_bericht_op: nu(), bijgewerkt_op: nu() }).eq('id', ticket.id);

  return NextResponse.json({ ticketId: ticket.id, sleutel: ticket.sleutel, nummer: ticket.nummer, antwoord, status });
}

// De klant haalt het gesprek op (bijvoorbeeld om te zien of Dirk geantwoord heeft).
export async function GET(req: Request) {
  const url = new URL(req.url);
  const ticketId = kort(url.searchParams.get('ticketId'), 64);
  const sleutel = kort(url.searchParams.get('sleutel'), 64);
  if (!ticketId || !sleutel) return NextResponse.json({ fout: 'Geen gesprek opgegeven.' }, { status: 400 });

  const service = dienst();
  const { data: ticket } = await service.from('support_tickets').select('id, nummer, sleutel, status, agent_actief').eq('id', ticketId).maybeSingle();
  if (!ticket || !sleutelKlopt(ticket.sleutel, sleutel)) return NextResponse.json({ fout: 'Gesprek niet gevonden.' }, { status: 404 });

  const { data: berichten } = await service
    .from('support_berichten')
    .select('afzender, tekst, created_at')
    .eq('ticket_id', ticket.id)
    .in('afzender', ['klant', 'agent', 'dirk'])
    .order('created_at', { ascending: true });

  return NextResponse.json({ nummer: ticket.nummer, status: ticket.status, dirkLeestMee: !ticket.agent_actief, berichten: berichten || [] });
}
