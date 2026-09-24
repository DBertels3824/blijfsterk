// Regels voor het automatisch toetsen van een partneraanmelding.
// Alles compleet en kloppend → automatisch geaccepteerd (status "proef").
// Anders → "te beoordelen", Dirk kijkt ernaar in het menu Aanmeldingen.

export const DOCUMENTEN = [
  { sleutel: 'vog', label: 'Verklaring Omtrent het Gedrag (VOG), niet ouder dan 2 jaar', verplicht: true },
  { sleutel: 'verzekering', label: 'Polisblad bedrijfs- of beroepsaansprakelijkheidsverzekering', verplicht: true },
  { sleutel: 'ehbo', label: 'EHBO-, BHV- of reanimatiecertificaat', verplicht: true },
  { sleutel: 'diploma', label: "Diploma of certificaat (alleen nodig als je geen registratienummer hebt)", verplicht: false },
] as const;

export type DocumentSleutel = (typeof DOCUMENTEN)[number]['sleutel'];

export const TOEGESTANE_BESTANDEN = ['application/pdf', 'image/jpeg', 'image/png'];
export const MAX_BESTAND_BYTES = 8 * 1024 * 1024;

// KvK-nummer: precies 8 cijfers.
export function kvkGeldig(nummer: string): boolean {
  return /^\d{8}$/.test(nummer.replace(/\s/g, ''));
}

// Registratienummer NL Actief / EREPS: we kunnen dit niet automatisch verifiëren,
// dus we controleren alleen of het er redelijk uitziet (letters/cijfers, 4–20 tekens).
export function registratienummerGeldig(nummer: string): boolean {
  return /^[A-Za-z0-9-]{4,20}$/.test(nummer.trim());
}

export function beoordeel(invoer: {
  type: 'trainer' | 'sportschool';
  kvkNummer: string;
  registratienummer: string;
  documenten: Partial<Record<DocumentSleutel, string>>;
  antwoorden: Record<string, string>;
}): { compleet: boolean; redenen: string[] } {
  const redenen: string[] = [];
  if (!kvkGeldig(invoer.kvkNummer)) redenen.push('KvK-nummer ontbreekt of is geen 8 cijfers');
  if (!invoer.documenten.vog) redenen.push('VOG ontbreekt');
  if (!invoer.documenten.verzekering) redenen.push('Polisblad verzekering ontbreekt');
  if (!invoer.documenten.ehbo) redenen.push('EHBO/BHV/reanimatiecertificaat ontbreekt');
  if (invoer.type === 'trainer') {
    const heeftRegistratie = registratienummerGeldig(invoer.registratienummer);
    if (!heeftRegistratie && !invoer.documenten.diploma) redenen.push('Geen registratienummer én geen diploma');
  }
  // Antwoorden die "Nee" zijn op de veiligheidsvragen: altijd handmatig bekijken.
  if (invoer.antwoorden.ehbo === 'Nee' || invoer.antwoorden.verzekering === 'Nee' || invoer.antwoorden.ehbo_aanwezig === 'Nee') {
    redenen.push('Een veiligheidsvraag is met Nee beantwoord');
  }
  return { compleet: redenen.length === 0, redenen };
}
