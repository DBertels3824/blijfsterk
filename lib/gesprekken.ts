import type { SupabaseClient } from '@supabase/supabase-js';

// Server-side hulpfuncties voor gesprekken (chat na een match). Alleen aanroepen met
// de service-client: Dirk's berichten mogen niet vanuit de browser geplaatst worden.

// Aantal gratis matches per partner (founding partner-aanbod).
export const GRATIS_MATCHES = 2;
export const MATCHVERGOEDING_CENT = 3500;

function voornaam(naam: string | null | undefined): string {
  return (naam || '').trim().split(/\s+/)[0] || 'daar';
}

// Opent een gesprek en laat Dirk beide partijen aan elkaar voorstellen.
export async function openGesprek(service: SupabaseClient, gesprekId: string): Promise<void> {
  const { data: g } = await service
    .from('gesprekken')
    .select('id, status, user_id, trainer_id')
    .eq('id', gesprekId)
    .single();
  if (!g || g.status === 'open') return;

  const [{ data: trainer }, { data: profiel }, { data: authUser }] = await Promise.all([
    service.from('trainers').select('naam, plaats, type').eq('id', g.trainer_id).single(),
    service.from('profiles').select('woonplaats, doelen, doel, huidige_staat, dagen_per_week, voorkeur').eq('id', g.user_id).maybeSingle(),
    service.auth.admin.getUserById(g.user_id),
  ]);

  const gebruikerNaam = voornaam(authUser?.user?.user_metadata?.naam);
  const trainerNaam = voornaam(trainer?.naam);
  const doelen: string[] = profiel?.doelen?.length ? profiel.doelen : profiel?.doel ? [profiel.doel] : [];

  const regels = [
    `Hallo ${gebruikerNaam}, hallo ${trainerNaam}. Ik ben Dirk, de coach van Blijf Sterk. Ik heb jullie aan elkaar gekoppeld.`,
    `${gebruikerNaam} woont in ${profiel?.woonplaats || 'de buurt'}${doelen.length ? ` en wil vooral: ${doelen.slice(0, 2).join(' en ').toLowerCase()}` : ''}.${
      profiel?.dagen_per_week ? ` Trainen kan ${profiel.dagen_per_week} ${/^\d$/.test(profiel.dagen_per_week) && profiel.dagen_per_week === '1' ? 'dag' : 'dagen'} per week.` : ''
    }`,
    `${trainerNaam} is ${trainer?.type === 'sportschool' ? 'een sportschool' : 'personal trainer'} in ${trainer?.plaats || 'de buurt'}, met ervaring met 55-plussers.`,
    `${trainerNaam}, wanneer zou een kennismaking kunnen? Stel gerust een paar momenten voor. ${gebruikerNaam}, alles wat je wilt weten kun je hier vragen. Ik lees mee.`,
  ];

  const nu = new Date().toISOString();
  await service.from('berichten').insert({ gesprek_id: gesprekId, afzender: 'dirk', tekst: regels.join('\n\n') });
  await service.from('gesprekken').update({ status: 'open', geopend_op: nu, laatste_bericht_op: nu }).eq('id', gesprekId);
}
