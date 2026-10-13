// Regels voor het automatisch toetsen van een partneraanmelding.
// Alles compleet en kloppend → automatisch geaccepteerd (status "proef").
// Anders → "te beoordelen", Dirk kijkt ernaar in het menu Aanmeldingen.
// Welke vragen, documenten en registraties per beroep gelden staat in
// lib/partnertypen.ts.

import { DOCUMENT_KORT, PARTNERTYPEN, type PartnerType } from '@/lib/partnertypen';

export type { DocumentSleutel } from '@/lib/partnertypen';

// Alle documenten die het uploadformulier kent. Welke bij welk beroep horen,
// bepaalt lib/partnertypen.ts; de server accepteert elk van deze vier.
export const DOCUMENTEN = [
  { sleutel: 'vog', label: 'Verklaring Omtrent het Gedrag (VOG), niet ouder dan 2 jaar', verplicht: true },
  { sleutel: 'verzekering', label: 'Polisblad bedrijfs- of beroepsaansprakelijkheidsverzekering', verplicht: true },
  { sleutel: 'ehbo', label: 'EHBO-, BHV- of reanimatiecertificaat', verplicht: true },
  { sleutel: 'diploma', label: "Diploma of certificaat (alleen nodig als je geen registratienummer hebt)", verplicht: false },
] as const;

export const TOEGESTANE_BESTANDEN = ['application/pdf', 'image/jpeg', 'image/png'];
export const MAX_BESTAND_BYTES = 8 * 1024 * 1024;

// KvK-nummer: precies 8 cijfers.
export function kvkGeldig(nummer: string): boolean {
  return /^\d{8}$/.test(nummer.replace(/\s/g, ''));
}

// Registratienummer (NL Actief, EREPS, BIG, beroepsvereniging): we kunnen dit niet
// automatisch verifiëren, dus we controleren alleen of het er redelijk uitziet
// (letters/cijfers, 4–20 tekens).
export function registratienummerGeldig(nummer: string): boolean {
  return /^[A-Za-z0-9-]{4,20}$/.test(nummer.trim());
}

export type Toetsing = {
  // Alle gevraagde onderdelen zijn er en kloppen.
  compleet: boolean;
  // Wat er ontbreekt (leeg als compleet).
  redenen: string[];
  // Gevuld als een mens eerst moet kijken, ook al is alles compleet.
  handmatig: string | null;
};

export function beoordeel(invoer: {
  type: PartnerType;
  kvkNummer: string;
  registratienummer: string;
  documenten: Partial<Record<keyof typeof DOCUMENT_KORT, string>>;
  antwoorden: Record<string, string>;
}): Toetsing {
  const cfg = PARTNERTYPEN[invoer.type];
  const redenen: string[] = [];

  if (!kvkGeldig(invoer.kvkNummer)) redenen.push('KvK-nummer ontbreekt of is geen 8 cijfers');

  for (const doc of cfg.documenten) {
    if (doc.verplicht && !invoer.documenten[doc.sleutel]) redenen.push(`${DOCUMENT_KORT[doc.sleutel]} ontbreekt`);
  }

  if (cfg.registratie) {
    const heeftRegistratie = registratienummerGeldig(invoer.registratienummer);
    if (cfg.registratie.eis === 'verplicht') {
      if (!heeftRegistratie) redenen.push(`${cfg.registratie.kort} ontbreekt of ziet er niet goed uit`);
    } else if (!heeftRegistratie && !invoer.documenten.diploma) {
      redenen.push('Geen registratienummer én geen diploma');
    }
  }

  // Antwoorden die "Nee" zijn op de veiligheidsvragen: altijd handmatig bekijken.
  if (invoer.antwoorden.ehbo === 'Nee' || invoer.antwoorden.verzekering === 'Nee' || invoer.antwoorden.ehbo_aanwezig === 'Nee') {
    redenen.push('Een veiligheidsvraag is met Nee beantwoord');
  }

  const compleet = redenen.length === 0;
  return { compleet, redenen, handmatig: compleet ? cfg.handmatigeControle : null };
}
