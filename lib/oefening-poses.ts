// Eenvoudige "poppetje"-standen (start/eind) per oefening uit lib/oefeningen.ts.
// Bewust een simpel schematisch figuur (hoofd, romp, armen, benen als lijnen) —
// geen echte AI-avatar video. Dat is bewust een latere fase (zie conceptdocument,
// hoofdstuk 10): de beweging zelf moet uit een echte, gecontroleerde bron komen,
// niet door AI verzonnen worden.
//
// Deze zelfde start/eind-coördinaten kunnen later ook gebruikt worden om de
// twee standen naast elkaar af te drukken op de Startpakket-poster.

export type Punt = [number, number];

export type Pose = {
  hoofd: Punt;
  schouderL: Punt;
  schouderR: Punt;
  elleboogL: Punt;
  handL: Punt;
  elleboogR: Punt;
  handR: Punt;
  heup: Punt;
  knieL: Punt;
  voetL: Punt;
  knieR: Punt;
  voetR: Punt;
};

export type OefeningAnimatieData =
  | { start: Pose; eind: Pose; statisch?: false }
  | { start: Pose; eind?: undefined; statisch: true };

// Neutrale staande basishouding — uitgangspunt voor de meeste staande oefeningen.
const STAAN: Pose = {
  hoofd: [60, 18],
  schouderL: [52, 34],
  schouderR: [68, 34],
  elleboogL: [46, 50],
  handL: [40, 66],
  elleboogR: [74, 50],
  handR: [80, 66],
  heup: [60, 64],
  knieL: [54, 90],
  voetL: [50, 112],
  knieR: [66, 90],
  voetR: [70, 112],
};

export const OEFENING_POSES: Record<string, OefeningAnimatieData> = {
  marcheren: {
    start: STAAN,
    eind: { ...STAAN, knieR: [72, 60], voetR: [78, 74] },
  },

  'stoel-squat': {
    start: STAAN,
    eind: {
      hoofd: [56, 32],
      schouderL: [48, 48],
      schouderR: [64, 48],
      elleboogL: [38, 58],
      handL: [30, 66],
      elleboogR: [74, 58],
      handR: [82, 66],
      heup: [60, 78],
      knieL: [48, 84],
      voetL: [48, 112],
      knieR: [72, 84],
      voetR: [72, 112],
    },
  },

  'zijwaartse-beenheffing-band': {
    start: STAAN,
    eind: { ...STAAN, heup: [56, 64], knieR: [86, 80], voetR: [96, 84] },
  },

  kuitheffingen: {
    start: STAAN,
    eind: {
      hoofd: [60, 12],
      schouderL: [52, 28],
      schouderR: [68, 28],
      elleboogL: [46, 44],
      handL: [40, 60],
      elleboogR: [74, 44],
      handR: [80, 60],
      heup: [60, 58],
      knieL: [54, 84],
      voetL: [50, 106],
      knieR: [66, 84],
      voetR: [70, 106],
    },
  },

  bekkenlift: {
    start: {
      hoofd: [18, 78],
      schouderL: [30, 82],
      schouderR: [30, 82],
      elleboogL: [26, 90],
      handL: [20, 92],
      elleboogR: [26, 90],
      handR: [20, 92],
      heup: [52, 84],
      knieL: [70, 68],
      voetL: [78, 86],
      knieR: [70, 68],
      voetR: [78, 86],
    },
    eind: {
      hoofd: [18, 78],
      schouderL: [30, 82],
      schouderR: [30, 82],
      elleboogL: [26, 90],
      handL: [20, 92],
      elleboogR: [26, 90],
      handR: [20, 92],
      heup: [52, 70],
      knieL: [70, 68],
      voetL: [78, 86],
      knieR: [70, 68],
      voetR: [78, 86],
    },
  },

  'vogel-hond': {
    start: {
      hoofd: [90, 52],
      schouderL: [72, 56],
      schouderR: [72, 56],
      elleboogL: [64, 66],
      handL: [58, 78],
      elleboogR: [64, 66],
      handR: [58, 78],
      heup: [45, 56],
      knieL: [32, 68],
      voetL: [22, 80],
      knieR: [32, 68],
      voetR: [22, 80],
    },
    eind: {
      hoofd: [92, 50],
      schouderL: [72, 56],
      schouderR: [72, 56],
      elleboogL: [64, 66],
      handL: [58, 78],
      elleboogR: [85, 48],
      handR: [104, 44],
      heup: [45, 56],
      knieL: [32, 68],
      voetL: [22, 80],
      knieR: [25, 50],
      voetR: [8, 40],
    },
  },

  'knie-plank': {
    start: {
      hoofd: [95, 50],
      schouderL: [75, 54],
      schouderR: [75, 54],
      elleboogL: [62, 66],
      handL: [62, 80],
      elleboogR: [62, 66],
      handR: [62, 80],
      heup: [48, 56],
      knieL: [28, 72],
      voetL: [18, 76],
      knieR: [28, 72],
      voetR: [18, 76],
    },
    statisch: true,
  },

  'band-roeien': {
    start: {
      ...STAAN,
      elleboogL: [42, 40],
      handL: [28, 40],
      elleboogR: [78, 40],
      handR: [92, 40],
    },
    eind: {
      ...STAAN,
      elleboogL: [36, 46],
      handL: [44, 50],
      elleboogR: [84, 46],
      handR: [76, 50],
    },
  },

  'band-chest-pull': {
    start: { ...STAAN, elleboogL: [54, 42], handL: [58, 42], elleboogR: [66, 42], handR: [62, 42] },
    eind: { ...STAAN, elleboogL: [40, 38], handL: [20, 36], elleboogR: [80, 38], handR: [100, 36] },
  },

  'band-bicepscurl': {
    start: STAAN,
    eind: { ...STAAN, handL: [54, 36], handR: [66, 36] },
  },

  'fles-overhead-press': {
    start: {
      hoofd: [60, 26],
      schouderL: [52, 42],
      schouderR: [68, 42],
      elleboogL: [42, 48],
      handL: [46, 38],
      elleboogR: [78, 48],
      handR: [74, 38],
      heup: [60, 72],
      knieL: [54, 98],
      voetL: [50, 118],
      knieR: [66, 98],
      voetR: [70, 118],
    },
    eind: {
      hoofd: [60, 26],
      schouderL: [52, 42],
      schouderR: [68, 42],
      elleboogL: [50, 18],
      handL: [46, 4],
      elleboogR: [70, 18],
      handR: [74, 4],
      heup: [60, 72],
      knieL: [54, 98],
      voetL: [50, 118],
      knieR: [66, 98],
      voetR: [70, 118],
    },
  },

  'fles-zijheffing': {
    start: STAAN,
    eind: { ...STAAN, elleboogL: [30, 36], handL: [14, 36], elleboogR: [90, 36], handR: [106, 36] },
  },
};
