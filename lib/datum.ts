// Zet een datum om in een korte, herkenbare tekst — makkelijker te lezen dan een
// kale datum of "3 dagen geleden op 14:32:07".
export function relatieveDatum(iso: string, vandaag = new Date()): string {
  const datum = new Date(iso);
  const dagVan = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const verschilDagen = Math.round((dagVan(vandaag) - dagVan(datum)) / 86400000);

  if (verschilDagen <= 0) return 'Vandaag';
  if (verschilDagen === 1) return 'Gisteren';
  if (verschilDagen < 7) return `${verschilDagen} dagen geleden`;
  if (verschilDagen < 14) return 'Vorige week';
  if (verschilDagen < 31) return `${Math.floor(verschilDagen / 7)} weken geleden`;
  return datum.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' });
}
