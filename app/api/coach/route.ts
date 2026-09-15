import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BASISREGELS = `
- Schrijf in het Nederlands, warm en direct, korte zinnen.
- Geen jargon, geen jeugdige fitnesstaal.
- Noem NOOIT specifieke oefeningen of bewegingsinstructies (zoals squats, lunges, planken, gewichten) — dat komt altijd uit een aparte, gecontroleerde bibliotheek, nooit los van jou verzonnen. Praat wel over frequentie, opbouw en volhouden in algemene termen.
- Bij twijfel over gezondheid: verwijs naar huisarts of fysiotherapeut.
- Geef platte tekst. Gebruik GEEN markdown: geen sterretjes, geen vetgedrukte tekst, geen opsommingstekens, geen kopjes.
- Houd antwoorden kort: maximaal een paar zinnen, of bij een dagindeling maximaal een paar korte regels per maaltijd.`;

const SPECIALISTEN: Record<string, { naam: string; prompt: string }> = {
  motivatie: {
    naam: 'Motivatie-agent',
    prompt: `Je bent de Motivatie-agent van Blijf Sterk. Je bemoedigt, viert kleine successen, en helpt iemand op gang te blijven of weer te beginnen na een mindere periode. Je gaat NIET over trainingsinhoud of voeding — daar verwijs je kort naar door.${BASISREGELS}`,
  },
  advies: {
    naam: 'Advies-agent',
    prompt: `Je bent de Advies-agent van Blijf Sterk. Je helpt met vragen over het trainingsschema en de opbouw (frequentie, rustdagen, hoe lang volhouden), binnen vaste kaders.

Vraagt iemand om concrete oefeningen: noem of verzin zelf NOOIT een specifieke oefening. Verwijs in plaats daarvan in gewone Nederlandse zin naar de oefeningenbibliotheek in de app (bereikbaar via het tegeltje "Oefeningen" op het dashboard) — daar staan vaste, veilige basisoefeningen voor thuis, met een weerstandsband, een fitnessmatje of gewoon een flesje water. Gebruik geen blokhaken of technische placeholders in je antwoord, schrijf gewoon een normale zin.${BASISREGELS}`,
  },
  voeding: {
    naam: 'Voedingsagent',
    prompt: `Je bent de Voedingsagent van Blijf Sterk. Je geeft praktische voedingstips die passen bij krachttraining, afgestemd op het profiel van deze gebruiker hieronder — hun eetpatroon, supplementgebruik, eiwitinname en doelen. Maak het concreet en persoonlijk, geen algemene standaardtekst.

Als iemand vraagt om een voedingsschema of dagindeling: geef een VOORBEELD-dagindeling. Zet Ontbijt, Lunch, Avondeten en eventueel Tussendoortje elk op een eigen nieuwe regel, in dit patroon: eerst het woord (bijvoorbeeld "Ontbijt:"), dan een korte, algemene omschrijving op dezelfde regel. Gebruik een echte regelafbreking tussen elke maaltijd, geen sterretjes, geen kopjes, geen opsommingstekens — gewoon vier of vijf korte regels onder elkaar. Gebruik NOOIT exacte grammen, calorieën of macrogetallen — dat is geen algemeen voorbeeld meer maar medisch dieetadvies, en dat mag je niet geven. Sluit af met een nieuwe regel: dit is een voorbeeld, voor een schema op maat kun je terecht bij een diëtist.

Blijf verder binnen praktische, algemene voeding: geen advies bij eetstoornissen of medische aandoeningen — verwijs daarvoor door naar een diëtist of huisarts.${BASISREGELS}`,
  },
  algemeen: {
    naam: 'Blijf Sterk Coach',
    prompt: `Je bent de Blijf Sterk Coach, het aanspreekpunt voor 55-plussers die willen beginnen met krachttraining. Je geeft een warm, kort welkom of algemeen antwoord.${BASISREGELS}`,
  },
};

export async function POST(req: Request) {
  try {
  const { profiel, berichten } = await req.json();

  const profielTekst = `
Doelen: ${(profiel?.doelen && profiel.doelen.length ? profiel.doelen.join(', ') : profiel?.doel) || 'onbekend'}
Huidige situatie: ${profiel?.huidige_staat || 'onbekend'}
Ervaring: ${profiel?.ervaring || 'onbekend'}
Dagen per week beschikbaar: ${profiel?.dagen_per_week || 'onbekend'}
Voorkeur trainingsvorm: ${profiel?.voorkeur || 'onbekend'}
Dagelijkse activiteit: ${profiel?.dagelijkse_activiteit || 'onbekend'}
Werksituatie: ${profiel?.werksituatie || 'onbekend'}
Eetpatroon: ${profiel?.eetpatroon || 'onbekend'}
Supplementen: ${profiel?.supplementen || 'onbekend'}
Eiwitinname: ${profiel?.eiwitten || 'onbekend'}
Gewenst resultaat: ${profiel?.gewenst_resultaat || 'onbekend'}
Risicosignalen: ${profiel?.risicoGesignaleerd ? 'ja, wees extra voorzichtig' : 'nee'}`;

  const ruweBerichten = berichten && berichten.length > 0
    ? berichten
    : [{ role: 'user', content: 'Geef me een kort, bemoedigend eerste advies om te beginnen, gebaseerd op mijn profiel.' }];

  // Alleen role en content doorsturen naar de Anthropic API — extra velden zoals "agent"
  // (dat we zelf toevoegen voor het label in de chat) mag de API niet zien.
  const gespreksberichten = ruweBerichten.map((b: any) => ({ role: b.role, content: b.content }));

  const laatsteGebruikersBericht = [...gespreksberichten].reverse().find((b: any) => b.role === 'user');

  const classificatie = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 10,
    system: `Bepaal welke specialist het beste past bij deze ene vraag. Kies uit precies één van: motivatie, advies, voeding, algemeen.
- motivatie: gaat over doorzetten, geen zin hebben, tegenslag, succes vieren.
- advies: gaat over het trainingsschema — hoe vaak, hoe zwaar, opbouw, rustdagen.
- voeding: gaat over eten, eiwitten, supplementen, een voedingsschema of dagindeling.
- algemeen: een begroeting, of iets dat nergens anders bij past.
Antwoord met alleen dat ene woord, niets anders.`,
    messages: [{ role: 'user', content: laatsteGebruikersBericht?.content || '' }],
  });

  const eersteBlok = classificatie.content[0];
  const specialistSleutel = eersteBlok.type === 'text' ? eersteBlok.text.trim().toLowerCase().replace(/[^a-z]/g, '') : 'algemeen';
  const specialist = SPECIALISTEN[specialistSleutel] || SPECIALISTEN.algemeen;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 400,
    system: `${specialist.prompt}\n\nProfiel van deze gebruiker:${profielTekst}`,
    messages: gespreksberichten,
  });

  const laatsteBlok = response.content[0];
  const ruweTekst = laatsteBlok.type === 'text' ? laatsteBlok.text : '';
  const tekst = ruweTekst.replace(/\*\*/g, '').replace(/^#+\s*/gm, '');

  // De advies-agent verwijst in woorden naar de oefeningenbibliotheek (zie zijn prompt
  // hierboven) — als dat woord voorkomt, laat de chat er ook een echte knop bij zien
  // in plaats van dat de gebruiker het zelf moet opzoeken.
  const naarOefeningen = /oefeningenbibliotheek/i.test(tekst);

  return NextResponse.json({ tekst, agent: specialist.naam, naarOefeningen });
  } catch (fout: any) {
    console.error('Fout in /api/coach:', fout);
    return NextResponse.json({
      tekst: 'Sorry, er ging iets mis. Probeer het over even nog eens.',
      agent: 'Blijf Sterk Coach',
    });
  }
}