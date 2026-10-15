import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import {
  automatischBericht,
  haalOntvangenMail,
  nummerUitOnderwerp,
  parseerAfzender,
  schoneMailTekst,
  verifieerWebhook,
} from '@/lib/email';
import { CATEGORIEEN, URGENTIES, vraagAgent, type GespreksBericht, type KlantContext } from '@/lib/klantenservice';
import { meldAanBeheerder } from '@/lib/meldingen';
import { INSCHRIJFGELD_SOORT } from '@/lib/partners';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Ontvangt binnenkomende mail van de maildienst (Resend, webhook "email.received").
// Elke mail komt in het postvak van Dirk. De assistent schrijft hooguit een CONCEPT-antwoord;
// er gaat niets de deur uit voordat Dirk het goedkeurt (zie /api/klantenservice/mail/verstuur).
// We geven altijd 200 terug na het opslaan, zodat de maildienst niet blijft herhalen.

const MAX_BERICHTEN_PER_GESPREK = 60;
const MAX_MAILS_PER_AFZENDER_PER_UUR = 6;
const MAX_CONCEPTEN_PER_DAG = 150;

type Ticket = {
  id: string;
  nummer: number;
  status: string;
  agent_actief: boolean;
  email: string | null;
  naam: string | null;
  mail_onderwerp: string | null;
};

const TICKET_VELDEN = 'id, nummer, status, agent_actief, email, naam, mail_onderwerp';

function dienst(): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const kort = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
const escapeLike = (t: string) => t.replace(/[\\%_]/g, (c) => `\\${c}`);

export async function POST(req: Request) {
  const geheim = process.env.RESEND_WEBHOOK_SECRET;
  if (!geheim) return NextResponse.json({ fout: 'Mail-ontvangst is niet ingesteld.' }, { status: 503 });

  // Echt van de maildienst? De handtekening wordt over de ruwe tekst berekend.
  const ruw = await req.text();
  if (!verifieerWebhook(ruw, req.headers, geheim)) return NextResponse.json({ fout: 'Ongeldige handtekening.' }, { status: 401 });

  let gebeurtenis: { type?: string; data?: { email_id?: string; from?: string; subject?: string } };
  try {
    gebeurtenis = JSON.parse(ruw);
  } catch {
    return NextResponse.json({ fout: 'Ongeldig bericht.' }, { status: 400 });
  }
  if (gebeurtenis.type !== 'email.received') return NextResponse.json({ genegeerd: true });
  const emailId = kort(gebeurtenis.data?.email_id, 100);
  if (!emailId) return NextResponse.json({ fout: 'Geen mail-id.' }, { status: 400 });

  const service = dienst();
  const nu = () => new Date().toISOString();

  // 1. Dezelfde mail nooit twee keer verwerken. De unieke index op het logboek beslist.
  const { data: logRij, error: logFout } = await service
    .from('email_log')
    .insert({
      richting: 'in',
      soort: 'klantenservice',
      status: 'ontvangen',
      provider_id: emailId,
      adres: parseerAfzender(kort(gebeurtenis.data?.from, 300)).email || null,
      onderwerp: kort(gebeurtenis.data?.subject, 200) || null,
    })
    .select('id')
    .single();
  if (logFout || !logRij) {
    if (logFout?.code === '23505') return NextResponse.json({ dubbel: true });
    console.error('Mail-logboek schrijven mislukt:', logFout?.message);
    return NextResponse.json({ fout: 'Opslaan mislukt.' }, { status: 500 });
  }
  const logUpdate = (velden: Record<string, unknown>) => service.from('email_log').update(velden).eq('id', logRij.id);

  // 2. Inhoud ophalen. Lukt dat niet, dan geven we een fout terug zodat de maildienst het later
  //    opnieuw probeert (en halen we de logregel weg, anders zou de herhaling als dubbel gelden).
  let mail;
  try {
    mail = await haalOntvangenMail(emailId);
  } catch (fout) {
    console.error('Ontvangen mail ophalen mislukt:', fout);
    await service.from('email_log').delete().eq('id', logRij.id);
    return NextResponse.json({ fout: 'Ophalen mislukt.' }, { status: 500 });
  }

  const afzender = parseerAfzender(mail.from);
  await logUpdate({ adres: afzender.email, onderwerp: mail.subject.slice(0, 200), message_id: mail.message_id });

  // 3. Automatische berichten en lussen: nooit beantwoorden.
  const automatisch = automatischBericht(mail.from, mail.subject, mail.headers);
  if (automatisch) {
    await logUpdate({ status: 'overgeslagen', reden: automatisch });
    return NextResponse.json({ overgeslagen: automatisch });
  }

  // 4. Niet te veel mail van één adres per uur (misbruik en kosten).
  const sindsUur = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count: recent } = await service
    .from('email_log')
    .select('*', { count: 'exact', head: true })
    .eq('richting', 'in')
    .eq('status', 'ontvangen')
    .eq('adres', afzender.email)
    .gte('created_at', sindsUur);
  if ((recent || 0) > MAX_MAILS_PER_AFZENDER_PER_UUR) {
    await logUpdate({ status: 'overgeslagen', reden: `meer dan ${MAX_MAILS_PER_AFZENDER_PER_UUR} mails per uur van dit adres` });
    return NextResponse.json({ overgeslagen: 'te veel mail' });
  }

  const tekst = schoneMailTekst(mail.text, mail.html);
  if (!tekst) {
    await logUpdate({ status: 'overgeslagen', reden: 'lege mail' });
    return NextResponse.json({ overgeslagen: 'lege mail' });
  }

  // 5. Klopt de afzender? SPF/DKIM/DMARC bepalen of het adres niet vervalst is. Een onbevestigde
  //    mail komt wel in het postvak (Dirk ziet hem), maar altijd als eigen gesprek en zonder concept.
  const auth = mail.authentication;
  const bevestigd = !!auth && auth.dmarc !== 'fail' && (auth.dkim === 'pass' || auth.spf === 'pass');

  // 6. Bij een bestaand gesprek horen, of een nieuw gesprek.
  let ticket: Ticket | null = null;
  if (bevestigd) {
    const nummer = nummerUitOnderwerp(mail.subject);
    if (nummer) {
      const { data } = await service.from('support_tickets').select(TICKET_VELDEN).eq('kanaal', 'mail').eq('nummer', nummer).maybeSingle();
      if (data && data.email === afzender.email) ticket = data as Ticket;
    }
    if (!ticket) {
      const sinds14 = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await service
        .from('support_tickets')
        .select(TICKET_VELDEN)
        .eq('kanaal', 'mail')
        .eq('email', afzender.email)
        .not('status', 'in', '(opgelost,samengevoegd)')
        .gte('created_at', sinds14)
        .order('laatste_bericht_op', { ascending: false })
        .limit(1);
      if (data && data.length) ticket = data[0] as Ticket;
    }
  }
  if (!ticket) {
    const { data, error } = await service
      .from('support_tickets')
      .insert({
        sleutel: randomUUID().replace(/-/g, ''),
        kanaal: 'mail',
        extern_id: mail.message_id,
        naam: afzender.naam,
        email: afzender.email,
        rol: 'bezoeker',
        status: 'aandacht',
        mail_onderwerp: mail.subject.slice(0, 200) || null,
        onderwerp: mail.subject.slice(0, 80) || 'Mail zonder onderwerp',
        pagina: 'e-mail',
      })
      .select(TICKET_VELDEN)
      .single();
    if (error || !data) {
      console.error('Gesprek aanmaken voor mail mislukt:', error?.message);
      await logUpdate({ status: 'mislukt', reden: 'gesprek aanmaken mislukt' });
      return NextResponse.json({ opgeslagen: false });
    }
    ticket = data as Ticket;
  }

  // 7. De mail zelf bewaren, vóór alles wat kan mislukken: er raakt nooit een mail kwijt.
  await service.from('support_berichten').insert({ ticket_id: ticket.id, afzender: 'klant', tekst, message_id: mail.message_id });
  await service
    .from('support_tickets')
    .update({ status: 'aandacht', laatste_bericht_op: nu(), bijgewerkt_op: nu(), ...(ticket.mail_onderwerp ? {} : { mail_onderwerp: mail.subject.slice(0, 200) }) })
    .eq('id', ticket.id);
  await logUpdate({ ticket_id: ticket.id });

  const systeem = (t: string) => service.from('support_berichten').insert({ ticket_id: ticket!.id, afzender: 'systeem', tekst: t });
  const seintje = (t: string) => meldAanBeheerder(service, { titel: `Klantenservice #${ticket!.nummer} (mail)`, tekst: t, url: '/admin/klantenservice' });

  // 8. Wanneer maakt de assistent GEEN concept?
  if (!bevestigd) {
    await systeem('Afzender niet bevestigd (SPF, DKIM of DMARC klopt niet). Geen concept gemaakt. Wees voorzichtig met dit bericht.');
    await seintje(`Mail van onbevestigde afzender: ${mail.subject.slice(0, 80)}`);
    return NextResponse.json({ opgeslagen: true, concept: false });
  }
  if (!ticket.agent_actief) {
    await seintje(`Nieuwe mail in een gesprek dat jij hebt overgenomen: ${mail.subject.slice(0, 80)}`);
    return NextResponse.json({ opgeslagen: true, concept: false });
  }
  const { count: aantalBerichten } = await service.from('support_berichten').select('*', { count: 'exact', head: true }).eq('ticket_id', ticket.id);
  if ((aantalBerichten || 0) > MAX_BERICHTEN_PER_GESPREK) {
    await systeem('Dit gesprek is erg lang geworden. Geen concept gemaakt.');
    await seintje('Lang mailgesprek, geen concept gemaakt');
    return NextResponse.json({ opgeslagen: true, concept: false });
  }
  const sindsDag = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: conceptenVandaag } = await service.from('support_concepten').select('*', { count: 'exact', head: true }).gte('created_at', sindsDag);
  if ((conceptenVandaag || 0) >= MAX_CONCEPTEN_PER_DAG) {
    await systeem('Daglimiet voor concepten bereikt. Geen concept gemaakt.');
    await seintje('Daglimiet voor concepten bereikt');
    return NextResponse.json({ opgeslagen: true, concept: false });
  }

  // 9. De assistent een concept laten schrijven.
  try {
    const partnerRegels: string[] = [];
    const patroon = escapeLike(afzender.email);
    const { data: partners } = await service.from('trainers').select('id, type, status, zichtbaar').ilike('email', patroon).limit(1);
    const partner = partners && partners.length ? partners[0] : null;
    if (partner) {
      partnerRegels.push(`Dit e-mailadres hoort bij een partner van ons: ${partner.type}, status ${partner.status}, zichtbaar voor gebruikers: ${partner.zichtbaar ? 'ja' : 'nee'}.`);
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
    } else {
      const { data: kandidaten } = await service.from('trainer_kandidaten').select('naam, status, gemeente').ilike('email', patroon).limit(1);
      if (kandidaten && kandidaten.length) {
        partnerRegels.push(
          `Dit e-mailadres staat in onze lijst van trainers die we kunnen uitnodigen om partner te worden (${kandidaten[0].naam}, ${kandidaten[0].gemeente || 'plaats onbekend'}, status in de lijst: ${kandidaten[0].status}). Het gaat dus waarschijnlijk om een reactie op een uitnodiging. Leg uit wat in de kennis staat over partner worden en verwijs naar de pagina Word partner. Noem geen persoonlijke link en noem niet dat we het adres in een lijst hebben.`,
        );
      }
    }

    const { data: rijen } = await service
      .from('support_berichten')
      .select('afzender, tekst')
      .eq('ticket_id', ticket.id)
      .in('afzender', ['klant', 'agent', 'dirk'])
      .order('created_at', { ascending: true });
    const gesprek: GespreksBericht[] = (rijen || []).map((r) => ({ rol: r.afzender as GespreksBericht['rol'], tekst: r.tekst }));

    const context: KlantContext = {
      rol: partner ? 'partner' : 'bezoeker',
      voornaam: (afzender.naam || ticket.naam || '').split(' ')[0] || null,
      pagina: 'e-mail',
      apparaat: null,
      emailBekend: true,
      partnerRegels,
    };

    let doorgegeven = false;
    let spoed = false;
    let geenAntwoord: string | null = null;
    const voerToolUit = async (naam: string, invoer: Record<string, unknown>): Promise<Record<string, unknown>> => {
      if (naam === 'geen_antwoord_nodig') {
        geenAntwoord = kort(invoer.reden, 200) || 'geen vraag in de mail';
        return { ok: true };
      }
      if (naam !== 'meld_aan_dirk') return { ok: false, fout: 'Onbekende actie.' };
      const categorie = (CATEGORIEEN as readonly string[]).includes(String(invoer.categorie)) ? String(invoer.categorie) : 'anders';
      const urgentie = (URGENTIES as readonly string[]).includes(String(invoer.urgentie)) ? String(invoer.urgentie) : 'normaal';
      const onderwerp = kort(invoer.onderwerp, 80) || 'Zonder onderwerp';
      await service
        .from('support_tickets')
        .update({ status: 'aandacht', categorie, urgentie, onderwerp, samenvatting: kort(invoer.samenvatting, 1200), details: { stappen: kort(invoer.stappen, 1200) }, bijgewerkt_op: nu() })
        .eq('id', ticket!.id);
      await systeem(`Doorgegeven aan Dirk (${categorie}, ${urgentie}): ${onderwerp}`);
      doorgegeven = true;
      if (urgentie === 'hoog') spoed = true;
      return { ok: true };
    };

    const uitkomst = await vraagAgent({ gesprek, context, openMeldingen: [], voerToolUit, kanaal: 'mail' });
    console.log('Klantenservice mail:', { ticket: ticket.nummer, model: uitkomst.model, tools: uitkomst.toolsGebruikt, stop: uitkomst.stopReden });
    const voorvoegsel = spoed ? 'Spoed: ' : '';

    // De assistent zegt zelf dat er niets te beantwoorden valt: geen concept, wel zichtbaar in het postvak.
    if (geenAntwoord && !doorgegeven) {
      await systeem(`De assistent vond geen antwoord nodig (${geenAntwoord}). Sluit het gesprek of antwoord zelf.`);
      await seintje(`Nieuwe mail, geen antwoord nodig: ${(ticket.mail_onderwerp || mail.subject).slice(0, 80)}`);
      return NextResponse.json({ opgeslagen: true, concept: false });
    }

    if (uitkomst.stopReden === 'max_tokens') {
      // Afgebroken tekst nooit als concept tonen: Dirk zou een halve zin kunnen versturen.
      await systeem('Het concept was afgebroken en is niet bewaard. Lees de mail en antwoord zelf.');
      await seintje(`${voorvoegsel}Mail zonder bruikbaar concept: ${(ticket.mail_onderwerp || mail.subject).slice(0, 80)}`);
      return NextResponse.json({ opgeslagen: true, concept: false });
    }

    if (uitkomst.tekst) {
      // Een nieuwere mail maakt een eerder, nog niet verstuurd concept ongeldig.
      await service.from('support_concepten').update({ status: 'vervangen', besloten_op: nu() }).eq('ticket_id', ticket.id).eq('status', 'concept');
      await service.from('support_concepten').insert({ ticket_id: ticket.id, tekst: uitkomst.tekst });
      await systeem('Concept-antwoord klaar. Bekijk, pas aan en verstuur het in dit postvak.');
      await seintje(`${voorvoegsel}Concept klaar: ${(ticket.mail_onderwerp || mail.subject).slice(0, 80)}`);
    } else {
      await systeem(doorgegeven ? 'De assistent schreef geen concept; het gesprek is aan jou doorgegeven.' : 'De assistent vond geen antwoord nodig (bijvoorbeeld een bedankje). Sluit het gesprek of antwoord zelf.');
      await seintje(`${voorvoegsel}Nieuwe mail: ${(ticket.mail_onderwerp || mail.subject).slice(0, 80)}`);
    }
    return NextResponse.json({ opgeslagen: true, concept: !!uitkomst.tekst });
  } catch (fout) {
    console.error('Concept schrijven voor mail mislukt:', fout);
    await systeem('De assistent kon geen concept maken. Lees de mail en antwoord zelf.');
    await seintje('Assistent kon geen concept maken');
    return NextResponse.json({ opgeslagen: true, concept: false });
  }
}
