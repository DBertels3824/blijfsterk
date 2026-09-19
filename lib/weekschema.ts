import type { Oefening } from './oefeningen';

// Eenvoudig, algemeen voorbeeldschema — geen persoonlijk trainingsschema.
// Verdeelt de categorieën uit de bibliotheek over 3 trainingsdagen per week.
export const WEEKSCHEMA: { dag: string; categorieen: Oefening['categorie'][] }[] = [
  { dag: 'Dag 1', categorieen: ['Warming-up', 'Benen & balans', 'Rug & schouders'] },
  { dag: 'Dag 2', categorieen: ['Warming-up', 'Buik & core', 'Armen'] },
  { dag: 'Dag 3', categorieen: ['Warming-up', 'Benen & balans', 'Buik & core'] },
];

// Doel: aantal trainingsdagen per week volgens het schema hierboven.
export const TRAININGSDAGEN_PER_WEEK = WEEKSCHEMA.length;

export type WeekstatusSoort = 'gehaald' | 'op_schema' | 'risico';

export type Weekstatus = {
  soort: WeekstatusSoort;
  aantal: number;
  doel: number;
  nogNodig: number;
  dagenOver: number;
  bericht: string;
};

// Bepaalt of het weekdoel (nog) gehaald kan worden, op basis van hoeveel losse
// dagen deze week al getraind is. Simpel gehouden: het gaat om het aantal
// trainingsdagen, niet om welke categorieën er precies zijn gedaan — het
// weekschema is toch al een vrij invulbaar voorbeeld, geen strak schema.
export function berekenWeekstatus(aantalTrainingsdagenDezeWeek: number, vandaag = new Date()): Weekstatus {
  const dagIndexVandaag = (vandaag.getDay() + 6) % 7; // 0 = maandag ... 6 = zondag
  const dagenOver = 7 - dagIndexVandaag; // inclusief vandaag
  const doel = TRAININGSDAGEN_PER_WEEK;
  const nogNodig = Math.max(0, doel - aantalTrainingsdagenDezeWeek);

  if (nogNodig === 0) {
    return {
      soort: 'gehaald',
      aantal: aantalTrainingsdagenDezeWeek,
      doel,
      nogNodig,
      dagenOver,
      bericht: `Doel gehaald deze week — ${aantalTrainingsdagenDezeWeek} van ${doel} trainingsdagen. Goed bezig!`,
    };
  }

  if (nogNodig <= dagenOver) {
    return {
      soort: 'op_schema',
      aantal: aantalTrainingsdagenDezeWeek,
      doel,
      nogNodig,
      dagenOver,
      bericht: `Nog ${nogNodig} ${nogNodig === 1 ? 'trainingsdag' : 'trainingsdagen'} te gaan deze week.`,
    };
  }

  return {
    soort: 'risico',
    aantal: aantalTrainingsdagenDezeWeek,
    doel,
    nogNodig,
    dagenOver,
    bericht: `Dit gaat deze week niet meer lukken bij dit tempo. Nog maar ${dagenOver} ${dagenOver === 1 ? 'dag' : 'dagen'} over, en je hebt er nog ${nogNodig} nodig.`,
  };
}
