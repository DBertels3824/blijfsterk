import type { SupabaseClient } from '@supabase/supabase-js';
import { TARIEVEN } from '@/lib/juridisch';

// Server-side hulpfuncties voor partners (trainers, fysio's, sportscholen, ...).
// Alleen aanroepen met de service-client.

// Inschrijfgeld (besloten 13 okt 2026): een kleine eenmalige vergoeding, om
// nepaanmeldingen en robots buiten het platform te houden. Een partner wordt pas
// zichtbaar voor gebruikers als dit betaald (of kwijtgescholden) is. Aanmelden
// zelf is gratis; het inschrijfgeld komt pas na toelating, in het dashboard.
export const INSCHRIJFGELD_CENT = TARIEVEN.inschrijfgeld * 100;
export const INSCHRIJFGELD_SOORT = 'inschrijfgeld';

// Statussen in de tabel betalingen waarmee het inschrijfgeld als voldaan geldt.
const VOLDAAN = ['betaald', 'gratis'];

// Maakt de partner-rij aan voor een toegelaten aanmelding, en zet het inschrijfgeld
// klaar. De partner is dan nog niet zichtbaar (zichtbaar = false) tot hij betaalt.
export async function maakPartnerRij(
  service: SupabaseClient,
  invoer: {
    naam: string;
    plaats: string | null;
    type: string;
    email: string;
    specialisatie: string;
    partnernummer: string | null;
    aanmeldingId: string;
  }
): Promise<string | null> {
  let partnernummer = invoer.partnernummer;
  if (!partnernummer) {
    const { data: nieuw } = await service.rpc('nieuw_partnernummer');
    partnernummer = (nieuw as string) || null;
  }

  const { data: trainer, error } = await service
    .from('trainers')
    .insert({
      naam: invoer.naam,
      plaats: invoer.plaats || null,
      type: invoer.type,
      contact: invoer.email,
      email: invoer.email,
      specialisatie: invoer.specialisatie,
      reisbereidheid_km: 15,
      partnernummer,
      status: 'proef',
      aanmelding_id: invoer.aanmeldingId,
      zichtbaar: false,
    })
    .select('id')
    .single();
  if (error || !trainer) {
    console.error('Partner-rij aanmaken mislukt:', error?.message);
    return null;
  }

  if (!partnernummer) {
    console.error('Geen partnernummer voor partner', trainer.id, '- inschrijfgeld niet klaargezet.');
    return trainer.id;
  }
  const { error: betalingFout } = await service.from('betalingen').insert({
    partnernummer,
    trainer_id: trainer.id,
    soort: INSCHRIJFGELD_SOORT,
    omschrijving: 'Inschrijfgeld Blijf Sterk (eenmalig)',
    bedrag_cent: INSCHRIJFGELD_CENT,
    status: 'open',
  });
  if (betalingFout) console.error('Inschrijfgeld klaarzetten mislukt:', betalingFout.message);

  return trainer.id;
}

// Is het inschrijfgeld van deze partner voldaan? Partners zonder inschrijfgeld-rij
// (van vóór de invoering) tellen als voldaan.
export async function inschrijfgeldVoldaan(service: SupabaseClient, trainerId: string): Promise<boolean> {
  const { data } = await service.from('betalingen').select('status').eq('trainer_id', trainerId).eq('soort', INSCHRIJFGELD_SOORT);
  if (!data || data.length === 0) return true;
  return data.some((b) => VOLDAAN.includes(b.status));
}

// Maakt een partner zichtbaar voor gebruikers.
export async function maakZichtbaar(service: SupabaseClient, trainerId: string): Promise<void> {
  await service.from('trainers').update({ zichtbaar: true }).eq('id', trainerId);
}
