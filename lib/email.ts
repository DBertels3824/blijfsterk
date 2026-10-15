import { createHmac, timingSafeEqual } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';

// E-mail voor Blijf Sterk via Resend (versturen én ontvangen). Alles loopt via deze module,
// zodat elke mail in het logboek (`email_log`) komt en er maar één plek is voor de regels.
//
// Instellingen (Vercel, door Dirk aangemaakt):
//  RESEND_API_KEY          sleutel van de maildienst
//  RESEND_WEBHOOK_SECRET   handtekeningsleutel van de webhook voor inkomende mail (begint met whsec_)
//  MAIL_VAN                afzender, bijvoorbeeld: Blijf Sterk <hulp@hulp.blijfsterk.nl>
//  MAIL_MAX_UIT_PER_DAG    maximaal aantal uitgaande mails per dag (standaard 100)
//  NEXT_PUBLIC_SITE_URL    adres van de site in mails (standaard blijfsterk.vercel.app)
// Ontbreekt een sleutel, dan verstuurt deze module niets en schrijft hij dat in het logboek.

const RESEND = 'https://api.resend.com';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://blijfsterk.vercel.app';

export type MailSoort = 'klantenservice' | 'uitnodiging' | 'melding' | 'overig';

export type StuurResultaat = {
  ok: boolean;
  status: 'verstuurd' | 'mislukt' | 'overgeslagen';
  providerId?: string;
  fout?: string;
};

export const emailGeldig = (e: string) => /^[^@\s<>]+@[^@\s<>]+\.[^@\s<>]+$/.test(e) && e.length <= 200;

function standaardMaxUit(): number {
  const n = Number(process.env.MAIL_MAX_UIT_PER_DAG);
  return Number.isFinite(n) && n > 0 ? n : 100;
}

// Alleen het adres uit "Naam <adres>" of "adres".
export function parseerAfzender(van: string): { naam: string | null; email: string } {
  const m = van.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (m) return { naam: m[1].trim() || null, email: m[2].trim().toLowerCase() };
  return { naam: null, email: van.trim().toLowerCase() };
}

function mailDomein(): string | null {
  const van = process.env.MAIL_VAN;
  if (!van) return null;
  const adres = parseerAfzender(van).email;
  return adres.includes('@') ? adres.split('@')[1] : null;
}

const escapeHtml = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function naarHtml(tekst: string): string {
  const alineas = tekst.split(/\n{2,}/).map((a) => `<p style="margin:0 0 14px">${escapeHtml(a).replace(/\n/g, '<br>')}</p>`);
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:1.55;color:#2B1B0E">${alineas.join('')}</div>`;
}

export async function schrijfMailLog(
  service: SupabaseClient,
  rij: {
    richting: 'uit' | 'in';
    soort?: MailSoort;
    status: 'verstuurd' | 'mislukt' | 'overgeslagen' | 'ontvangen';
    ticketId?: string | null;
    adres?: string | null;
    onderwerp?: string | null;
    providerId?: string | null;
    messageId?: string | null;
    reden?: string | null;
  },
): Promise<void> {
  const { error } = await service.from('email_log').insert({
    richting: rij.richting,
    soort: rij.soort || 'klantenservice',
    status: rij.status,
    ticket_id: rij.ticketId || null,
    adres: rij.adres || null,
    onderwerp: (rij.onderwerp || '').slice(0, 200) || null,
    provider_id: rij.providerId || null,
    message_id: rij.messageId || null,
    reden: (rij.reden || '').slice(0, 300) || null,
  });
  if (error) console.error('Mail-logboek schrijven mislukt:', error.message);
}

// Verstuurt één mail en schrijft het resultaat in het logboek. Gooit nooit een fout.
export async function stuurMail(
  service: SupabaseClient,
  mail: {
    aan: string;
    onderwerp: string;
    tekst: string;
    soort?: MailSoort;
    ticketId?: string | null;
    inReplyTo?: string | null;
    references?: string[];
  },
): Promise<StuurResultaat> {
  const soort = mail.soort || 'klantenservice';
  const aan = mail.aan.trim().toLowerCase();
  const log = (status: StuurResultaat['status'], reden?: string, providerId?: string) =>
    schrijfMailLog(service, { richting: 'uit', soort, status, ticketId: mail.ticketId, adres: aan, onderwerp: mail.onderwerp, providerId, reden });

  try {
    if (!emailGeldig(aan)) {
      await log('overgeslagen', 'ongeldig adres');
      return { ok: false, status: 'overgeslagen', fout: 'Dit e-mailadres lijkt niet te kloppen.' };
    }
    const sleutel = process.env.RESEND_API_KEY;
    const van = process.env.MAIL_VAN;
    if (!sleutel || !van) {
      await log('overgeslagen', 'geen maildienst ingesteld (RESEND_API_KEY of MAIL_VAN ontbreekt)');
      return { ok: false, status: 'overgeslagen', fout: 'De maildienst is nog niet ingesteld.' };
    }
    // Nooit mailen naar ons eigen ontvangstadres: dat geeft een lus.
    if (mailDomein() && aan.endsWith(`@${mailDomein()}`)) {
      await log('overgeslagen', 'adres hoort bij ons eigen ontvangstdomein (voorkomt een lus)');
      return { ok: false, status: 'overgeslagen', fout: 'Dit adres kan niet.' };
    }

    // Noodrem tegen een dolgedraaide lus of misbruik.
    const sinds = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await service
      .from('email_log')
      .select('*', { count: 'exact', head: true })
      .eq('richting', 'uit')
      .eq('status', 'verstuurd')
      .gte('created_at', sinds);
    if ((count || 0) >= standaardMaxUit()) {
      await log('overgeslagen', `daglimiet van ${standaardMaxUit()} mails bereikt`);
      return { ok: false, status: 'overgeslagen', fout: 'De daglimiet voor mail is bereikt. Probeer het morgen.' };
    }

    const headers: Record<string, string> = {};
    if (mail.inReplyTo) headers['In-Reply-To'] = mail.inReplyTo;
    if (mail.references && mail.references.length) headers['References'] = mail.references.join(' ');

    const voet = `\n\n--\nBlijf Sterk\n${SITE_URL}`;
    const antwoord = await fetch(`${RESEND}/emails`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${sleutel}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: van,
        to: [aan],
        subject: mail.onderwerp.slice(0, 200),
        text: mail.tekst + voet,
        html: naarHtml(mail.tekst + voet),
        ...(Object.keys(headers).length ? { headers } : {}),
      }),
    });
    const uitkomst = (await antwoord.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!antwoord.ok || !uitkomst.id) {
      const reden = `maildienst gaf ${antwoord.status}: ${uitkomst.message || 'onbekende fout'}`;
      await log('mislukt', reden);
      return { ok: false, status: 'mislukt', fout: 'Versturen is niet gelukt. Kijk in het logboek.' };
    }
    await log('verstuurd', undefined, uitkomst.id);
    return { ok: true, status: 'verstuurd', providerId: uitkomst.id };
  } catch (fout) {
    console.error('Mail versturen mislukt:', fout);
    await log('mislukt', fout instanceof Error ? fout.message : 'onbekende fout');
    return { ok: false, status: 'mislukt', fout: 'Versturen is niet gelukt. Kijk in het logboek.' };
  }
}

// Controleert de handtekening van een webhook van Resend (Svix-standaard): de maildienst
// ondertekent "<id>.<tijd>.<inhoud>" met HMAC-SHA256. Zo weet je dat de aanroep echt van
// de maildienst komt en niet van iemand die de webadres kent.
export function verifieerWebhook(ruweTekst: string, headers: Headers, geheim: string): boolean {
  const id = headers.get('svix-id');
  const tijd = headers.get('svix-timestamp');
  const handtekening = headers.get('svix-signature');
  if (!id || !tijd || !handtekening) return false;

  const t = Number(tijd);
  if (!Number.isFinite(t) || Math.abs(Date.now() / 1000 - t) > 5 * 60) return false;

  const sleutel = Buffer.from(geheim.replace(/^whsec_/, ''), 'base64');
  const verwacht = createHmac('sha256', sleutel).update(`${id}.${tijd}.${ruweTekst}`).digest();
  for (const deel of handtekening.split(' ')) {
    const [versie, waarde] = deel.split(',');
    if (versie !== 'v1' || !waarde) continue;
    const kandidaat = Buffer.from(waarde, 'base64');
    if (kandidaat.length === verwacht.length && timingSafeEqual(kandidaat, verwacht)) return true;
  }
  return false;
}

export type OntvangenMail = {
  id: string;
  from: string;
  to: string[];
  subject: string;
  text: string | null;
  html: string | null;
  headers: Record<string, string>;
  message_id: string | null;
  authentication: { spf?: string; dkim?: string; dmarc?: string } | null;
};

// De webhook bevat alleen een id; de inhoud halen we zelf op.
export async function haalOntvangenMail(emailId: string): Promise<OntvangenMail> {
  const sleutel = process.env.RESEND_API_KEY;
  if (!sleutel) throw new Error('RESEND_API_KEY ontbreekt');
  const antwoord = await fetch(`${RESEND}/emails/receiving/${encodeURIComponent(emailId)}?html_format=cid`, {
    headers: { Authorization: `Bearer ${sleutel}` },
  });
  if (!antwoord.ok) throw new Error(`Ontvangen mail ophalen gaf ${antwoord.status}`);
  const d = (await antwoord.json()) as Record<string, unknown>;
  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries((d.headers as Record<string, unknown>) || {})) headers[k.toLowerCase()] = String(v);
  return {
    id: String(d.id || emailId),
    from: String(d.from || ''),
    to: Array.isArray(d.to) ? d.to.map(String) : [],
    subject: String(d.subject || ''),
    text: typeof d.text === 'string' ? d.text : null,
    html: typeof d.html === 'string' ? d.html : null,
    headers,
    message_id: typeof d.message_id === 'string' ? d.message_id : headers['message-id'] || null,
    authentication: (d.authentication as OntvangenMail['authentication']) || null,
  };
}

// Een automatisch bericht (afwezigheid, nieuwsbrief, bounce, no-reply) krijgt nooit antwoord:
// anders praten twee computers eindeloos tegen elkaar. Geeft de reden terug, of null.
export function automatischBericht(van: string, onderwerp: string, headers: Record<string, string>): string | null {
  const auto = headers['auto-submitted'];
  if (auto && auto.toLowerCase() !== 'no') return 'automatisch bericht (Auto-Submitted)';
  const prec = (headers['precedence'] || '').toLowerCase();
  if (['bulk', 'junk', 'list', 'auto_reply'].includes(prec)) return `bulkmail (Precedence: ${prec})`;
  if (headers['list-id'] || headers['list-unsubscribe']) return 'nieuwsbrief of mailinglijst';
  if (headers['x-auto-response-suppress'] || headers['x-autoreply'] || headers['x-autorespond']) return 'automatisch antwoord';
  const lokaal = parseerAfzender(van).email.split('@')[0];
  if (/^(no-?reply|do-?not-?reply|donotreply|mailer-daemon|postmaster|bounces?|noreply)/i.test(lokaal)) return 'afzender is een no-reply-adres';
  if (/^(automatisch antwoord|automatic reply|auto-?reply|out of office|afwezig|afwezigheid|undeliverable|delivery status|mail delivery)/i.test(onderwerp.trim())) {
    return 'afwezigheids- of bouncebericht';
  }
  return null;
}

// Alleen wat de afzender nieuw schreef: citaten van eerdere mails en handtekeningen van
// mailprogramma's gaan eraf. Valt er niets over, dan houden we de hele tekst.
export function schoneMailTekst(tekst: string | null, html: string | null): string {
  let basis = tekst && tekst.trim() ? tekst : '';
  if (!basis && html) {
    basis = html
      .replace(/<(style|script)[\s\S]*?<\/\1>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|tr|h\d)>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
  basis = basis.replace(/\r\n/g, '\n');

  const knip = basis.search(
    /^(Op\s[\s\S]{0,200}?\sschreef\b[\s\S]{0,150}?:\s*$|On\s[\s\S]{0,200}?\swrote:\s*$|-{2,}\s*(Oorspronkelijk bericht|Original Message)[^\n]*|_{5,}\s*$|Van:\s.+$|From:\s.+$)/im,
  );
  let nieuw = knip > 0 ? basis.slice(0, knip) : basis;
  nieuw = nieuw
    .split('\n')
    .filter((r) => !r.trim().startsWith('>'))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (!nieuw) nieuw = basis.trim();
  return nieuw.length > 4000 ? `${nieuw.slice(0, 4000)}\n[bericht ingekort]` : nieuw;
}

// Het nummer van een gesprek staat als [#123] in het onderwerp van elke uitgaande klantenservice-mail.
export function onderwerpMetNummer(onderwerp: string, nummer: number): string {
  const schoon = onderwerp.replace(/\s*\[#\d+\]\s*$/, '').trim();
  const metRe = /^re:/i.test(schoon) ? schoon : `Re: ${schoon}`;
  return `${metRe} [#${nummer}]`;
}

export function nummerUitOnderwerp(onderwerp: string): number | null {
  const m = onderwerp.match(/\[#(\d{1,9})\]/);
  return m ? Number(m[1]) : null;
}
