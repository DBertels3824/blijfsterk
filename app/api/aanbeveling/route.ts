import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type Optie = {
  id: string;
  naam: string;
  plaats: string;
  specialisatie: string;
  reisbereidheid_km: number;
  gemiddelde: number | null;
  aantalReviews: number;
};

export async function POST(req: Request) {
  const { profiel, trainers, voedingsdeskundigen } = await req.json();

  const profielTekst = `
Woonplaats: ${profiel?.woonplaats || 'onbekend'}
Doelen: ${(profiel?.doelen && profiel.doelen.length ? profiel.doelen.join(', ') : profiel?.doel) || 'onbekend'}
Huidige situatie: ${profiel?.huidige_staat || 'onbekend'}
Ervaring: ${profiel?.ervaring || 'onbekend'}
Voorkeur trainingsvorm: ${profiel?.voorkeur || 'onbekend'}
Gewenste trainingslocatie: ${(profiel?.trainingslocatie && profiel.trainingslocatie.length ? profiel.trainingslocatie.join(', ') : 'onbekend')}
Eetpatroon: ${profiel?.eetpatroon || 'onbekend'}
Supplementen: ${profiel?.supplementen || 'onbekend'}
Gewenst resultaat: ${profiel?.gewenst_resultaat || 'onbekend'}`;

  if ((!trainers || trainers.length === 0) && (!voedingsdeskundigen || voedingsdeskundigen.length === 0)) {
    return NextResponse.json({ trainer_id: null, trainer_reden: null, voeding_id: null, voeding_reden: null });
  }

  const systemPrompt = `Je helpt de Blijf Sterk-app een trainer en een voedingsdeskundige aanbevelen aan een gebruiker.

Je krijgt het profiel van de gebruiker en twee lijsten: trainers en voedingsdeskundigen. Elke persoon in de lijst heeft een woonplaats en een reisbereidheid in km — gebruik je algemene kennis van Nederlandse aardrijkskunde om in te schatten of iemand realistisch bereikbaar is (dit is een inschatting, geen exacte afstandsberekening). Houd ook rekening met de inhoud: doelen, ervaring, en de specialisatie/beschrijving van de persoon. Een hoger gemiddeld cijfer (op basis van reviews) mag meewegen als extra argument, maar is niet doorslaggevend.

Kies ALTIJD een id die letterlijk voorkomt in de meegegeven lijst — verzin nooit een naam of id die niet in de lijst staat. Als een lijst leeg is, gebruik dan null voor dat id en die reden.

Geef een korte, warme reden in het Nederlands (maximaal één zin, geen jargon, rechtstreeks aan de gebruiker gericht, bijvoorbeeld "past goed bij jouw doel om..." of "zit dicht bij je in de buurt en is gespecialiseerd in...").

Antwoord ALLEEN met geldige JSON, exact in dit formaat, niets ervoor of erna:
{"trainer_id": "...of null", "trainer_reden": "...of null", "voeding_id": "...of null", "voeding_reden": "...of null"}`;

  const payload = {
    profiel: profielTekst,
    trainers: (trainers || []).map((t: Optie) => ({
      id: t.id,
      naam: t.naam,
      plaats: t.plaats,
      specialisatie: t.specialisatie,
      reisbereidheid_km: t.reisbereidheid_km,
      gemiddelde_score: t.gemiddelde,
      aantal_reviews: t.aantalReviews,
    })),
    voedingsdeskundigen: (voedingsdeskundigen || []).map((t: Optie) => ({
      id: t.id,
      naam: t.naam,
      plaats: t.plaats,
      specialisatie: t.specialisatie,
      reisbereidheid_km: t.reisbereidheid_km,
      gemiddelde_score: t.gemiddelde,
      aantal_reviews: t.aantalReviews,
    })),
  };

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 300,
    system: systemPrompt,
    messages: [{ role: 'user', content: JSON.stringify(payload) }],
  });

  const blok = response.content[0];
  const ruweTekst = blok.type === 'text' ? blok.text : '';

  let resultaat = { trainer_id: null, trainer_reden: null, voeding_id: null, voeding_reden: null };
  try {
    const schoon = ruweTekst.replace(/```json/g, '').replace(/```/g, '').trim();
    const geparsed = JSON.parse(schoon);

    // Veiligheidscheck: alleen id's accepteren die ook echt in de meegegeven lijst stonden.
    const geldigeTrainerIds = (trainers || []).map((t: Optie) => t.id);
    const geldigeVoedingIds = (voedingsdeskundigen || []).map((t: Optie) => t.id);

    resultaat = {
      trainer_id: geldigeTrainerIds.includes(geparsed.trainer_id) ? geparsed.trainer_id : null,
      trainer_reden: geldigeTrainerIds.includes(geparsed.trainer_id) ? geparsed.trainer_reden : null,
      voeding_id: geldigeVoedingIds.includes(geparsed.voeding_id) ? geparsed.voeding_id : null,
      voeding_reden: geldigeVoedingIds.includes(geparsed.voeding_id) ? geparsed.voeding_reden : null,
    } as any;
  } catch {
    // Als het parsen mislukt, geven we gewoon geen aanbeveling terug — de matchingpagina werkt dan nog steeds prima zonder.
  }

  return NextResponse.json(resultaat);
}