// Echte video's per oefening (met Blijf Sterk-logo verwerkt), aangeleverd door Dirk.
// Nog niet elke oefening heeft een video — waar er geen video is, valt de
// oefeningenbibliotheek terug op het schematische poppetje uit lib/oefening-poses.ts.
export const OEFENING_VIDEOS: Record<string, string> = {
  marcheren: '/oefeningen-video/marcheren.mp4',
  'stoel-squat': '/oefeningen-video/stoel-squat.mp4',
  kuitheffingen: '/oefeningen-video/kuitheffingen.mp4',
  'zijwaartse-beenheffing-band': '/oefeningen-video/zijwaartse-beenheffing-band.mp4',
  bekkenlift: '/oefeningen-video/bekkenlift.mp4',
  'vogel-hond': '/oefeningen-video/vogel-hond.mp4',
  'knie-plank': '/oefeningen-video/knie-plank.mp4',
  'band-chest-pull': '/oefeningen-video/band-chest-pull.mp4',
  'band-roeien': '/oefeningen-video/band-roeien.mp4',
};

// Korte waarschuwing/opmerking die direct onder de video getoond wordt, voor
// video's die niet de volledige beweging laten zien (bijv. maar één kant).
export const VIDEO_OPMERKINGEN: Record<string, string> = {
  'vogel-hond': 'De video laat één kant zien — wissel bij het echt uitvoeren af tussen links en rechts.',
};
