import type { SupabaseClient } from '@supabase/supabase-js';

// Toegang tot de coach (/api/coach): alleen ingelogde gebruikers, met een limiet per gebruiker
// en een noodrem over alles. Zonder dit kan iedereen die het webadres kent kosten maken op de
// Anthropic-rekening (elk bericht is twee aanroepen). De module kent geen Next.js, zodat hij los te
// testen is: de aanroeper geeft de database-client mee.

export const COACH_MAX_PER_UUR = 15;
export const COACH_MAX_PER_DAG = 60;
// Noodrem over alle gebruikers samen, voor als er veel accounts tegelijk misbruikt worden.
export const COACH_MAX_ALLES_PER_DAG = Number(process.env.COACH_MAX_ALLES_PER_DAG) > 0 ? Number(process.env.COACH_MAX_ALLES_PER_DAG) : 2000;

export const MAX_BERICHTEN = 30;
export const MAX_TEKENS = 4000;

export type Toegang = { ok: true; userId: string } | { ok: false; status: 401 | 429; tekst: string };

export type CoachBericht = { role: 'user' | 'assistant'; content: string };

const nee = (status: 401 | 429, tekst: string): Toegang => ({ ok: false, status, tekst });

// Controleert het inlogbewijs, past de limieten toe en schrijft daarna één regel in coach_gebruik.
// Lukt het tellen niet (storing), dan laten we de vraag door: een storing mag de coach niet
// voor iedereen kapotmaken. Het inlogbewijs zelf is wel altijd verplicht.
export async function controleerCoachToegang(service: SupabaseClient, token: string): Promise<Toegang> {
  if (!token) return nee(401, 'Log eerst in om met de coach te praten.');
  const { data, error } = await service.auth.getUser(token);
  const user = data?.user;
  if (error || !user) return nee(401, 'Log eerst in om met de coach te praten.');

  const nu = Date.now();
  const sindsUur = new Date(nu - 60 * 60 * 1000).toISOString();
  const sindsDag = new Date(nu - 24 * 60 * 60 * 1000).toISOString();

  try {
    const [uur, dag, alles] = await Promise.all([
      service.from('coach_gebruik').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', sindsUur),
      service.from('coach_gebruik').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', sindsDag),
      service.from('coach_gebruik').select('*', { count: 'exact', head: true }).gte('created_at', sindsDag),
    ]);
    if (uur.error || dag.error || alles.error) throw uur.error || dag.error || alles.error;

    if ((uur.count || 0) >= COACH_MAX_PER_UUR) {
      return nee(429, 'Je hebt de laatste tijd veel met de coach gepraat. Wacht even en probeer het over een uur nog eens.');
    }
    if ((dag.count || 0) >= COACH_MAX_PER_DAG) return nee(429, 'Je hebt vandaag veel met de coach gepraat. Probeer het morgen weer.');
    if ((alles.count || 0) >= COACH_MAX_ALLES_PER_DAG) return nee(429, 'De coach is nu erg druk. Probeer het later nog eens.');
  } catch (fout) {
    console.error('Coach-limiet controleren mislukt, vraag toegelaten:', fout);
  }

  const { error: logFout } = await service.from('coach_gebruik').insert({ user_id: user.id });
  if (logFout) console.error('Coach-gebruik bewaren mislukt:', logFout.message);
  return { ok: true, userId: user.id };
}

// Maakt van wat de browser stuurt een veilige lijst: alleen user/assistant, alleen tekst, niet te
// lang, en maximaal de laatste MAX_BERICHTEN. Geeft null terug als een bericht te lang is.
export function schoonBerichten(ruw: unknown): CoachBericht[] | null {
  if (ruw === undefined || ruw === null) return [];
  if (!Array.isArray(ruw)) return null;
  const uit: CoachBericht[] = [];
  for (const b of ruw) {
    if (!b || typeof b !== 'object') continue;
    const { role, content } = b as { role?: unknown; content?: unknown };
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') continue;
    const tekst = content.trim();
    if (!tekst) continue;
    if (tekst.length > MAX_TEKENS) return null;
    uit.push({ role, content: tekst });
  }
  return uit.slice(-MAX_BERICHTEN);
}

// Een profielveld als korte tekst, zodat niemand via het profiel een enorme tekst kan doorsturen.
export const profielVeld = (v: unknown, max = 300): string => String(v ?? '').slice(0, max).trim() || 'onbekend';
