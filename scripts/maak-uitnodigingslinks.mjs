// Maakt van trainers-nederland.csv een mailingbestand: trainers-mailing.csv.
// Per trainer een persoonlijke uitnodigingslink naar het aanmeldformulier, met
// naam, plaats, telefoon en website alvast ingevuld.
//
// Starten (in een terminal, in de map blijfsterk):
//   node scripts/maak-uitnodigingslinks.mjs
//
// Daarna trainers-mailing.csv openen in Excel, e-mailadressen aanvullen in de
// kolom "email" (Google geeft die niet; staan meestal op de website), en de
// kolom "uitnodigingslink" gebruiken in je mailing.
//
// Alleen trainers met een Google-score van 4,5 of hoger en minstens 5 reviews
// komen in het mailingbestand. Pas SCORE_MIN en REVIEWS_MIN aan als je dat anders wilt.

import fs from 'node:fs';

const BRON = 'trainers-nederland.csv';
const DOEL = 'trainers-mailing.csv';
const SITE = 'https://blijfsterk.vercel.app'; // later: https://blijfsterk.nl
const SCORE_MIN = 4.5;
const REVIEWS_MIN = 5;

function leesCsv(pad) {
  const tekst = fs.readFileSync(pad, 'utf8').replace(/^﻿/, '');
  const regels = [];
  let veld = '', rij = [], inQuotes = false;
  for (let i = 0; i < tekst.length; i++) {
    const c = tekst[i];
    if (inQuotes) {
      if (c === '"' && tekst[i + 1] === '"') { veld += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else veld += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ';') { rij.push(veld); veld = ''; }
    else if (c === '\n') { rij.push(veld); regels.push(rij); rij = []; veld = ''; }
    else if (c !== '\r') veld += c;
  }
  if (veld || rij.length) { rij.push(veld); regels.push(rij); }
  const kop = regels.shift();
  return regels.filter((r) => r.length > 1).map((r) => Object.fromEntries(kop.map((k, i) => [k, r[i] ?? ''])));
}

function csvVeld(waarde) {
  const s = waarde == null ? '' : String(waarde);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function maakLink(t) {
  const q = new URLSearchParams();
  q.set('naam', t.naam);
  if (t.gemeente) q.set('plaats', t.gemeente);
  if (t.telefoon) q.set('telefoon', t.telefoon);
  if (t.website) q.set('website', t.website);
  return `${SITE}/word-partner?${q.toString()}`;
}

const trainers = leesCsv(BRON);
const geselecteerd = trainers.filter((t) => {
  const score = parseFloat(String(t.google_score).replace(',', '.'));
  const reviews = parseInt(t.aantal_reviews, 10) || 0;
  return score >= SCORE_MIN && reviews >= REVIEWS_MIN;
});

const kop = ['naam', 'gemeente', 'telefoon', 'website', 'email', 'google_score', 'aantal_reviews', 'uitnodigingslink', 'status'];
const uit = ['﻿' + kop.join(';')];
for (const t of geselecteerd) {
  uit.push([t.naam, t.gemeente, t.telefoon, t.website, '', t.google_score, t.aantal_reviews, maakLink(t), 'nog niet gemaild'].map(csvVeld).join(';'));
}
fs.writeFileSync(DOEL, uit.join('\n') + '\n');

console.log(`${trainers.length} trainers gelezen, ${geselecteerd.length} geselecteerd (score >= ${SCORE_MIN}, reviews >= ${REVIEWS_MIN}).`);
console.log(`Mailingbestand: ${DOEL}. Vul de kolom "email" aan en gebruik "uitnodigingslink" in je mailing.`);
