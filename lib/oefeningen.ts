export type Oefening = {
  id: string;
  naam: string;
  categorie: 'Warming-up' | 'Benen & balans' | 'Rug & schouders' | 'Armen' | 'Buik & core';
  benodigdheden: string[];
  uitleg: string;
  stappen: string[];
  setsHerhalingen: string;
  veiligheid: string;
};

// Vaste, vooraf samengestelde oefeningbibliotheek — bewust NIET door de AI-coach vrij
// verzonnen (zie de veiligheidsafspraak in het conceptdocument, hoofdstuk 20).
// Dit is een eerste, voorzichtige versie op basis van algemeen geaccepteerde
// bewegingsadviezen voor 55-plussers. NOG NIET gecontroleerd door een fysiotherapeut
// of sportarts — dat moet gebeuren voordat dit breed aan gebruikers getoond wordt.
export const OEFENINGEN: Oefening[] = [
  {
    id: 'marcheren',
    naam: 'Marcheren op de plek',
    categorie: 'Warming-up',
    benodigdheden: ['Geen'],
    uitleg: 'Een rustige warming-up om je lijf op te warmen voordat je begint.',
    stappen: [
      'Sta rechtop, eventueel met een hand op een stoel of aanrecht voor steun.',
      'Til om de beurt je knieën rustig op, alsof je op de plek loopt.',
      'Beweeg je armen rustig mee.',
      'Doe dit 1 tot 2 minuten in een tempo dat prettig aanvoelt.',
    ],
    setsHerhalingen: '1 tot 2 minuten',
    veiligheid: 'Rustig tempo. Voel je je onzeker op je benen, blijf dan met één hand steunen.',
  },
  {
    id: 'stoel-squat',
    naam: 'Stoel-squat',
    categorie: 'Benen & balans',
    benodigdheden: ['Stoel'],
    uitleg: 'Versterkt je beenspieren en helpt bij opstaan, traplopen en bukken.',
    stappen: [
      'Ga voor een stevige stoel staan, voeten op heupbreedte.',
      'Buig je knieën en zak langzaam naar achteren, alsof je gaat zitten.',
      'Raak de stoel lichtjes aan en kom weer rustig omhoog.',
      'Houd je knieën in lijn met je voeten.',
    ],
    setsHerhalingen: '2 sets van 8 tot 10 keer',
    veiligheid: 'Zak niet dieper dan prettig voelt. Bij knie- of heupklachten: vraag eerst advies aan je huisarts of fysiotherapeut.',
  },
  {
    id: 'zijwaartse-beenheffing-band',
    naam: 'Zijwaartse beenheffing met weerstandsband',
    categorie: 'Benen & balans',
    benodigdheden: ['Weerstandsband', 'Stoel'],
    uitleg: 'Traint je heupspieren, belangrijk voor stabiliteit en het voorkomen van vallen.',
    stappen: [
      'Doe de weerstandsband om beide enkels.',
      'Houd met één hand een stoel of aanrecht vast voor steun.',
      'Til je been recht opzij, rustig en gecontroleerd.',
      'Zet je voet weer rustig neer en wissel na de herhalingen van been.',
    ],
    setsHerhalingen: '2 sets van 8 tot 12 keer per been',
    veiligheid: 'Til je been niet hoger dan comfortabel. Blijf altijd met één hand steunen als je onzeker staat. Controleer voor je begint dat de band goed vastzit, zodat hij niet plotseling losschiet.',
  },
  {
    id: 'kuitheffingen',
    naam: 'Kuitheffingen',
    categorie: 'Benen & balans',
    benodigdheden: ['Stoel'],
    uitleg: 'Versterkt je kuiten en enkels, en helpt je balans.',
    stappen: [
      'Sta achter een stoel en houd de rugleuning vast.',
      'Kom rustig op je tenen omhoog.',
      'Zak langzaam weer terug.',
    ],
    setsHerhalingen: '2 sets van 10 tot 15 keer',
    veiligheid: 'Doe de beweging rustig, niet wippend.',
  },
  {
    id: 'bekkenlift',
    naam: 'Bekkenlift (glute bridge)',
    categorie: 'Buik & core',
    benodigdheden: ['Fitnessmatje'],
    uitleg: 'Versterkt je bilspieren en onderrug, goed voor een stabiele rug.',
    stappen: [
      'Ga op je rug liggen op het matje, knieën gebogen, voeten plat op de grond.',
      'Til je heupen rustig omhoog tot je lichaam een rechte lijn vormt van knieën tot schouders.',
      'Knijp je bilspieren kort samen boven.',
      'Zak langzaam weer terug.',
    ],
    setsHerhalingen: '2 sets van 8 tot 12 keer',
    veiligheid: 'Til niet te hoog — een kleine, gecontroleerde beweging is genoeg. Stop bij pijn in de onderrug.',
  },
  {
    id: 'vogel-hond',
    naam: 'Vogel-hond (op handen en knieën)',
    categorie: 'Buik & core',
    benodigdheden: ['Fitnessmatje'],
    uitleg: 'Traint balans en de spieren rond je wervelkolom.',
    stappen: [
      'Ga op handen en knieën op het matje, rug recht, blik naar de grond.',
      'Strek voorzichtig één arm naar voren, of één been naar achteren — niet allebei tegelijk als dat lastig voelt.',
      'Houd dit een paar tellen vast, kom dan rustig terug.',
      'Wissel af tussen links en rechts.',
    ],
    setsHerhalingen: '2 sets van 6 tot 8 keer per kant',
    veiligheid: 'Beweeg langzaam en houd je rug recht. Bij pijn in polsen of knieën: sla deze oefening over.',
  },
  {
    id: 'knie-plank',
    naam: 'Plank op de knieën',
    categorie: 'Buik & core',
    benodigdheden: ['Fitnessmatje'],
    uitleg: 'Versterkt je buik- en rugspieren, belangrijk voor een goede houding.',
    stappen: [
      'Ga op je onderarmen en knieën op het matje liggen.',
      'Houd je rug recht, van je hoofd tot je knieën, spier je buik aan.',
      'Houd deze houding vast.',
      'Zak rustig weer terug.',
    ],
    setsHerhalingen: '2 tot 3 keer, 10 tot 20 seconden vasthouden',
    veiligheid: 'Adem gewoon door tijdens het vasthouden. Stop meteen bij pijn in je rug of polsen.',
  },
  {
    id: 'band-roeien',
    naam: 'Roeien met weerstandsband',
    categorie: 'Rug & schouders',
    benodigdheden: ['Weerstandsband'],
    uitleg: 'Versterkt je rug- en schouderspieren, goed voor je houding.',
    stappen: [
      'Ga zitten, maak de band vast om iets stevigs (bijvoorbeeld een deurklink) of houd hem onder je voeten als je op de grond zit.',
      'Houd een uiteinde van de band in elke hand.',
      'Trek je ellebogen rustig naar achteren, alsof je iets tussen je schouderbladen wilt knijpen.',
      'Laat de band langzaam weer terug komen.',
    ],
    setsHerhalingen: '2 sets van 10 tot 12 keer',
    veiligheid: 'Trek rustig, niet met een ruk. Controleer voor je begint dat de band goed vastzit, zodat hij niet plotseling losschiet.',
  },
  {
    id: 'band-chest-pull',
    naam: 'Band uit elkaar trekken (borst/schouders)',
    categorie: 'Rug & schouders',
    benodigdheden: ['Weerstandsband'],
    uitleg: 'Traint de spieren tussen je schouderbladen, goed voor een rechte houding.',
    stappen: [
      'Sta of zit rechtop, houd de band met beide handen voor je borst.',
      'Trek de band rustig uit elkaar door je armen zijwaarts te bewegen.',
      'Breng je armen langzaam weer terug naar het midden.',
    ],
    setsHerhalingen: '2 sets van 10 tot 12 keer',
    veiligheid: 'Kies een band met lichte weerstand als dit nieuw voor je is. Controleer voor je begint dat de band goed vastzit, zodat hij niet plotseling losschiet.',
  },
  {
    id: 'band-bicepscurl',
    naam: 'Bicepscurl met weerstandsband',
    categorie: 'Armen',
    benodigdheden: ['Weerstandsband'],
    uitleg: 'Versterkt je armen, handig bij bijvoorbeeld boodschappen dragen.',
    stappen: [
      'Ga staan met de band onder beide voeten, een uiteinde in elke hand.',
      'Houd je ellebogen dicht bij je lichaam.',
      'Buig je armen rustig omhoog.',
      'Laat ze weer langzaam zakken.',
    ],
    setsHerhalingen: '2 sets van 10 tot 12 keer',
    veiligheid: 'Beweeg rustig, ook bij het laten zakken — dat deel telt ook mee. Controleer voor je begint dat de band goed vastzit, zodat hij niet plotseling losschiet.',
  },
  {
    id: 'fles-overhead-press',
    naam: 'Flesje water omhoog drukken',
    categorie: 'Armen',
    benodigdheden: ['Flesje water'],
    uitleg: 'Traint je schouders. Heb je nog geen lichte gewichtjes? Een gevulde waterfles werkt prima als vervanger.',
    stappen: [
      'Ga zitten of staan, in elke hand een flesje water.',
      'Houd de flesjes op schouderhoogte.',
      'Duw ze rustig omhoog tot je armen (bijna) gestrekt zijn.',
      'Laat ze langzaam weer zakken naar schouderhoogte.',
    ],
    setsHerhalingen: '2 sets van 8 tot 10 keer',
    veiligheid: 'Begin met een klein flesje. Voelt het zwaar in je schouders, gebruik dan een lichtere fles of minder water.',
  },
  {
    id: 'fles-zijheffing',
    naam: 'Flesje water zijwaarts heffen',
    categorie: 'Armen',
    benodigdheden: ['Flesje water'],
    uitleg: 'Traint de zijkant van je schouders.',
    stappen: [
      'Ga staan of zitten, in elke hand een flesje water, armen langs je lichaam.',
      'Til je armen rustig zijwaarts tot ongeveer schouderhoogte.',
      'Laat ze langzaam weer zakken.',
    ],
    setsHerhalingen: '2 sets van 8 tot 10 keer',
    veiligheid: 'Til niet hoger dan schouderhoogte. Gebruik een lichter flesje als dit lastig voelt.',
  },
];

export const CATEGORIEEN: Oefening['categorie'][] = [
  'Warming-up',
  'Benen & balans',
  'Rug & schouders',
  'Armen',
  'Buik & core',
];

export const BENODIGDHEDEN = ['Alles', 'Weerstandsband', 'Fitnessmatje', 'Flesje water', 'Stoel', 'Geen'] as const;
