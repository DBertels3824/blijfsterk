// Alle soorten partners op één plek: welke vragen, documenten en toetsregels er
// per beroep gelden. Het aanmeldformulier, de toetsing, de admin en de koppeling
// lezen allemaal hieruit. Een nieuw beroep toevoegen = hier één blok bijzetten
// (en de CHECK-regel op trainer_aanmeldingen.type uitbreiden, zie sql/partnertypen.sql).

export type PartnerType = 'trainer' | 'fysiotherapeut' | 'sportmasseur' | 'voedingsdeskundige' | 'sportschool';

export type DocumentSleutel = 'vog' | 'verzekering' | 'ehbo' | 'diploma';

export type VeldType = 'text' | 'textarea' | 'ja-nee';

export type Vraag = {
  sleutel: string;
  kort: string; // korte naam, voor de admin-pagina
  label: string;
  type: VeldType;
  verplicht?: boolean;
};

export type DocumentRegel = {
  sleutel: DocumentSleutel;
  label: string;
  verplicht: boolean;
};

export type Registratie = {
  label: string;
  plaatshouder: string;
  // 'verplicht': zonder nummer nooit automatisch toegelaten.
  // 'of-diploma': een nummer of een diploma is genoeg.
  eis: 'verplicht' | 'of-diploma';
  kort: string;
};

export type PartnerTypeConfig = {
  sleutel: PartnerType;
  knop: string; // "Ik ben trainer"
  meervoud: string; // "Trainers"
  beroep: string; // in de openingstekst van het gesprek: "fysiotherapeut"
  naamLabel: string;
  plaatsLabel: string;
  specialisatie: string; // standaardtekst op de partner-rij
  voorwaardenHref: string;
  voorwaardenLabel: string;
  registratie: Registratie | null;
  documenten: DocumentRegel[];
  // Als gevuld: nooit automatisch toelaten, Dirk controleert eerst. De tekst
  // wordt aan de aanvrager en in de admin getoond.
  handmatigeControle: string | null;
  vragen: Vraag[];
};

export const DOCUMENT_KORT: Record<DocumentSleutel, string> = {
  vog: 'VOG',
  verzekering: 'Polisblad verzekering',
  ehbo: 'EHBO/BHV/reanimatiecertificaat',
  diploma: 'Diploma',
};

const VOG: DocumentRegel = { sleutel: 'vog', label: 'Verklaring Omtrent het Gedrag (VOG), niet ouder dan 2 jaar', verplicht: true };
const VERZEKERING: DocumentRegel = { sleutel: 'verzekering', label: 'Polisblad bedrijfs- of beroepsaansprakelijkheidsverzekering', verplicht: true };
const EHBO: DocumentRegel = { sleutel: 'ehbo', label: 'EHBO-, BHV- of reanimatiecertificaat', verplicht: true };

const ERVARING_VRAAG = (tekst: string): Vraag => ({ sleutel: 'ervaring_55plus', kort: 'Ervaring met 55-plussers', label: tekst, type: 'text', verplicht: true });
const MOTIVATIE: Vraag = { sleutel: 'motivatie', kort: 'Motivatie', label: 'Waarom wil je je aansluiten bij Blijf Sterk?', type: 'textarea' };
const REFERENTIES: Vraag = { sleutel: 'referenties', kort: 'Referenties', label: 'Referenties, website of links naar reviews (optioneel)', type: 'text' };
const EHBO_VRAAG: Vraag = { sleutel: 'ehbo', kort: 'EHBO/BHV', label: 'Heb je een geldig EHBO- of BHV-certificaat?', type: 'ja-nee', verplicht: true };
const VERZEKERING_VRAAG: Vraag = { sleutel: 'verzekering', kort: 'Aansprakelijkheidsverzekering', label: 'Heb je een eigen beroeps- of bedrijfsaansprakelijkheidsverzekering?', type: 'ja-nee', verplicht: true };

const DIPLOMA_OF_REGISTRATIE: DocumentRegel = {
  sleutel: 'diploma',
  label: 'Diploma of certificaat (alleen nodig als je geen registratienummer hebt)',
  verplicht: false,
};

export const PARTNERTYPEN: Record<PartnerType, PartnerTypeConfig> = {
  trainer: {
    sleutel: 'trainer',
    knop: 'Ik ben trainer',
    meervoud: 'Trainers',
    beroep: 'personal trainer',
    naamLabel: 'Naam',
    plaatsLabel: 'Plaats / werkgebied',
    specialisatie: 'Personal trainer 55+',
    voorwaardenHref: '/voorwaarden/trainers',
    voorwaardenLabel: 'voorwaarden voor trainers',
    registratie: {
      label: 'Registratienummer NL Actief of EREPS (als je dat hebt)',
      plaatshouder: 'bijv. NLA-12345',
      eis: 'of-diploma',
      kort: 'Registratienummer',
    },
    documenten: [VOG, VERZEKERING, EHBO, DIPLOMA_OF_REGISTRATIE],
    handmatigeControle: null,
    vragen: [
      ERVARING_VRAAG('Hoeveel jaar ervaring heb je met het trainen van 55-plussers?'),
      { sleutel: 'diplomas', kort: "Diploma's / certificeringen", label: "Welke relevante diploma's of certificeringen heb je? (bijv. CIOS, fysiotherapie, Senior Fitness)", type: 'textarea', verplicht: true },
      EHBO_VRAAG,
      { sleutel: 'gezondheidsbeperkingen', kort: 'Omgang met gezondheidsbeperkingen', label: 'Hoe ga je om met deelnemers met gezondheidsbeperkingen, zoals hartklachten, artrose of evenwichtsproblemen?', type: 'textarea', verplicht: true },
      { sleutel: 'aanpak', kort: 'Aanpak / stijl', label: 'Beschrijf kort je aanpak en trainingsstijl.', type: 'textarea', verplicht: true },
      VERZEKERING_VRAAG,
      MOTIVATIE,
      REFERENTIES,
    ],
  },

  fysiotherapeut: {
    sleutel: 'fysiotherapeut',
    knop: 'Ik ben fysiotherapeut',
    meervoud: 'Fysiotherapeuten',
    beroep: 'fysiotherapeut',
    naamLabel: 'Naam (of naam van je praktijk)',
    plaatsLabel: 'Plaats / werkgebied',
    specialisatie: 'Fysiotherapeut',
    voorwaardenHref: '/voorwaarden/trainers',
    voorwaardenLabel: 'voorwaarden voor partners',
    registratie: {
      label: 'BIG-nummer',
      plaatshouder: 'bijv. 19012345678',
      eis: 'verplicht',
      kort: 'BIG-nummer',
    },
    documenten: [
      VOG,
      VERZEKERING,
      EHBO,
      { sleutel: 'diploma', label: 'Diploma of bewijs van je BIG-registratie (optioneel)', verplicht: false },
    ],
    // Fysiotherapeut is een beschermde titel en het BIG-register is openbaar:
    // Dirk kijkt het nummer zelf na voordat iemand zichtbaar wordt.
    handmatigeControle: 'we controleren je BIG-registratie in het BIG-register',
    vragen: [
      ERVARING_VRAAG('Hoeveel jaar ervaring heb je met het behandelen of begeleiden van 55-plussers?'),
      { sleutel: 'werkveld', kort: 'Specialisatie / werkveld', label: 'Wat is je specialisatie of werkveld? (bijv. geriatrie, valpreventie, orthopedie, hartrevalidatie)', type: 'textarea', verplicht: true },
      { sleutel: 'locatie', kort: 'Locatie', label: 'Waar ontvang je cliënten? (eigen praktijk, aan huis, in een sportschool of anders)', type: 'text', verplicht: true },
      { sleutel: 'aanpak', kort: 'Aanpak', label: 'Hoe wil je gebruikers van Blijf Sterk helpen? Bijvoorbeeld met een intake, een traject, oefeningen op maat of advies thuis.', type: 'textarea', verplicht: true },
      { sleutel: 'gezondheidsbeperkingen', kort: 'Omgang met gezondheidsbeperkingen', label: 'Hoe stem je je aanpak af op deelnemers met hartklachten, osteoporose, artrose of valangst?', type: 'textarea', verplicht: true },
      { ...EHBO_VRAAG, label: 'Heb je een geldig EHBO-, BHV- of reanimatiecertificaat?' },
      { ...VERZEKERING_VRAAG, label: 'Heb je een beroepsaansprakelijkheidsverzekering?' },
      MOTIVATIE,
      { ...REFERENTIES, label: 'Referenties of website (optioneel)' },
    ],
  },

  sportmasseur: {
    sleutel: 'sportmasseur',
    knop: 'Ik ben sportmasseur',
    meervoud: 'Sportmasseurs',
    beroep: 'sportmasseur',
    naamLabel: 'Naam (of naam van je praktijk)',
    plaatsLabel: 'Plaats / werkgebied',
    specialisatie: 'Sportmasseur',
    voorwaardenHref: '/voorwaarden/trainers',
    voorwaardenLabel: 'voorwaarden voor partners',
    registratie: {
      label: 'Registratienummer van je beroepsvereniging of kwaliteitsregister (als je dat hebt)',
      plaatshouder: 'bijv. SM-12345',
      eis: 'of-diploma',
      kort: 'Registratienummer',
    },
    documenten: [VOG, VERZEKERING, EHBO, DIPLOMA_OF_REGISTRATIE],
    handmatigeControle: null,
    vragen: [
      ERVARING_VRAAG('Hoeveel jaar ervaring heb je met het masseren of behandelen van 55-plussers?'),
      { sleutel: 'diplomas', kort: "Opleidingen / certificaten", label: 'Welke opleiding(en) of certificaten heb je? (bijv. sportmassage, medische massage)', type: 'textarea', verplicht: true },
      { sleutel: 'aanpak', kort: 'Aanbod', label: 'Welke vormen van massage of behandeling bied je aan 55-plussers aan?', type: 'textarea', verplicht: true },
      { sleutel: 'gezondheidsbeperkingen', kort: 'Wanneer niet masseren / doorverwijzen', label: 'Wanneer masseer je niet, en wanneer verwijs je door naar een huisarts of fysiotherapeut? (denk aan hartklachten, trombose, osteoporose of bloedverdunners)', type: 'textarea', verplicht: true },
      { sleutel: 'locatie', kort: 'Locatie', label: 'Waar ontvang je cliënten? (eigen praktijk, aan huis of anders)', type: 'text', verplicht: true },
      EHBO_VRAAG,
      { ...VERZEKERING_VRAAG, label: 'Heb je een beroepsaansprakelijkheidsverzekering?' },
      MOTIVATIE,
      { ...REFERENTIES, label: 'Referenties of website (optioneel)' },
    ],
  },

  voedingsdeskundige: {
    sleutel: 'voedingsdeskundige',
    knop: 'Ik ben voedingsdeskundige',
    meervoud: 'Voedingsdeskundigen',
    beroep: 'voedingsdeskundige',
    naamLabel: 'Naam (of naam van je praktijk)',
    plaatsLabel: 'Plaats / werkgebied',
    specialisatie: 'Voedingsdeskundige',
    voorwaardenHref: '/voorwaarden/trainers',
    voorwaardenLabel: 'voorwaarden voor partners',
    registratie: {
      label: 'Registratienummer van je beroepsvereniging of kwaliteitsregister, bijvoorbeeld als diëtist (als je dat hebt)',
      plaatshouder: 'bijv. KP-12345',
      eis: 'of-diploma',
      kort: 'Registratienummer',
    },
    // Voeding is geen fysieke training: een EHBO-certificaat is hier niet nodig.
    documenten: [VOG, VERZEKERING, DIPLOMA_OF_REGISTRATIE],
    handmatigeControle: null,
    vragen: [
      ERVARING_VRAAG('Hoeveel jaar ervaring heb je met voedingsadvies aan 55-plussers?'),
      { sleutel: 'diplomas', kort: 'Opleiding / titel', label: 'Wat is je opleiding en welke titel voer je? (bijv. diëtist, voedingsdeskundige, gezondheidscoach)', type: 'textarea', verplicht: true },
      { sleutel: 'aanpak', kort: 'Aanpak', label: 'Hoe begeleid je 55-plussers? Bijvoorbeeld bij eiwitinname, spiermassa, afvallen of ondergewicht.', type: 'textarea', verplicht: true },
      { sleutel: 'gezondheidsbeperkingen', kort: 'Omgang met gezondheidsbeperkingen', label: 'Hoe ga je om met deelnemers met diabetes, nierproblemen of medicijngebruik, en wanneer verwijs je door naar een huisarts of diëtist?', type: 'textarea', verplicht: true },
      { sleutel: 'producten', kort: 'Verkoop van producten', label: 'Verkoop je supplementen of andere producten aan cliënten? Zo ja, welke, en hoe maak je duidelijk wat je er zelf aan verdient?', type: 'textarea', verplicht: true },
      { sleutel: 'locatie', kort: 'Locatie', label: 'Werk je op locatie, aan huis of online?', type: 'text', verplicht: true },
      { ...VERZEKERING_VRAAG, label: 'Heb je een beroepsaansprakelijkheidsverzekering?' },
      MOTIVATIE,
      { ...REFERENTIES, label: 'Referenties of website (optioneel)' },
    ],
  },

  sportschool: {
    sleutel: 'sportschool',
    knop: 'Wij zijn een sportschool',
    meervoud: 'Sportscholen',
    beroep: 'sportschool',
    naamLabel: 'Naam sportschool',
    plaatsLabel: 'Plaats / adres',
    specialisatie: 'Sportschool',
    voorwaardenHref: '/voorwaarden/sportscholen',
    voorwaardenLabel: 'voorwaarden voor sportscholen',
    registratie: null,
    documenten: [VOG, VERZEKERING, EHBO],
    handmatigeControle: null,
    vragen: [
      { sleutel: 'toegankelijkheid', kort: 'Toegankelijkheid', label: 'Is de sportschool goed toegankelijk voor 55-plussers (gelijkvloers of lift, geen hoge drempels)?', type: 'ja-nee', verplicht: true },
      { sleutel: 'aangepaste_begeleiding', kort: 'Aangepaste begeleiding/apparatuur', label: 'Bieden jullie aangepaste apparatuur of begeleiding voor 55-plussers?', type: 'textarea', verplicht: true },
      { sleutel: 'ehbo_aanwezig', kort: 'EHBO/BHV aanwezig', label: 'Is er tijdens openingstijden personeel met EHBO/BHV aanwezig?', type: 'ja-nee', verplicht: true },
      { sleutel: 'rustige_lessen', kort: 'Rustige lessen voor senioren', label: 'Bieden jullie rustige of aangepaste groepslessen aan buiten de spits, gericht op senioren?', type: 'textarea', verplicht: true },
      { sleutel: 'verzekering', kort: 'Aansprakelijkheidsverzekering', label: 'Beschikt de sportschool over een aansprakelijkheidsverzekering?', type: 'ja-nee', verplicht: true },
      { sleutel: 'motivatie', kort: 'Motivatie', label: 'Waarom willen jullie je aansluiten bij Blijf Sterk?', type: 'textarea' },
    ],
  },
};

// Volgorde waarin de keuzes op het formulier en in de admin staan.
export const PARTNERTYPEN_VOLGORDE: PartnerType[] = ['trainer', 'fysiotherapeut', 'sportmasseur', 'voedingsdeskundige', 'sportschool'];

export function isPartnerType(waarde: unknown): waarde is PartnerType {
  return typeof waarde === 'string' && Object.prototype.hasOwnProperty.call(PARTNERTYPEN, waarde);
}

// Voor de openingstekst van een gesprek: "een sportschool" of "personal trainer".
export function beroepZin(type: string | null | undefined): string {
  if (type === 'sportschool') return 'een sportschool';
  return isPartnerType(type) ? PARTNERTYPEN[type].beroep : 'partner van Blijf Sterk';
}
