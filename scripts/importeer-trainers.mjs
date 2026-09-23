// Zet trainers-nederland.csv in de Supabase-tabel trainer_kandidaten.
//
// Starten (in een terminal, in de map blijfsterk):
//   node scripts/importeer-trainers.mjs
//
// Het script vraagt om het wachtwoord van je Blijf Sterk-beheerdersaccount (het
// wordt niet getoond en nergens bewaard). Alleen de beheerder mag deze tabel vullen.
// Trainers die al in de tabel staan (zelfde place_id) worden overgeslagen, dus je
// kunt dit script gerust vaker draaien na een nieuwe verzamelronde.

import fs from 'node:fs';
import readline from 'node:readline';
import { createClient } from '@supabase/supabase-js';

const CSV = 'trainers-nederland.csv';
const ADMIN_EMAIL = 'dick.bertels@interim-share.nl';
const BATCH = 500;

function leesEnv(naam) {
  if (process.env[naam]) return process.env[naam];
  for (const bestand of ['.env.local', '.env']) {
    if (!fs.existsSync(bestand)) continue;
    const regel = fs.readFileSync(bestand, 'utf8').split(/\r?\n/).find((r) => r.startsWith(naam + '='));
    if (regel) return regel.slice(naam.length + 1).trim().replace(/^["']|["']$/g, '');
  }
  return '';
}

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

function vraagWachtwoord(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const origineel = rl._writeToOutput;
    rl.question(prompt, (antwoord) => {
      rl._writeToOutput = origineel;
      rl.close();
      process.stdout.write('\n');
      resolve(antwoord);
    });
    rl._writeToOutput = () => {}; // typen niet tonen
  });
}

async function main() {
  const url = leesEnv('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = leesEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!url || !anonKey) {
    console.error('Supabase-gegevens niet gevonden in .env.local.');
    process.exit(1);
  }
  if (!fs.existsSync(CSV)) {
    console.error(`${CSV} niet gevonden. Draai eerst scripts/verzamel-trainers.mjs.`);
    process.exit(1);
  }

  const supabase = createClient(url, anonKey);
  const wachtwoord = await vraagWachtwoord(`Wachtwoord van ${ADMIN_EMAIL}: `);
  const { error: loginFout } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: wachtwoord });
  if (loginFout) {
    console.error('Inloggen mislukt:', loginFout.message);
    process.exit(1);
  }

  const trainers = leesCsv(CSV);
  const gezien = new Set();
  const rijen = [];
  for (const t of trainers) {
    if (!t.place_id || gezien.has(t.place_id)) continue;
    gezien.add(t.place_id);
    const score = parseFloat(String(t.google_score).replace(',', '.'));
    rijen.push({
      place_id: t.place_id,
      naam: t.naam || 'Onbekend',
      gemeente: t.gemeente || null,
      adres: t.adres || null,
      telefoon: t.telefoon || null,
      website: t.website || null,
      google_score: Number.isFinite(score) ? score : null,
      aantal_reviews: parseInt(t.aantal_reviews, 10) || 0,
      maps_link: t.maps_link ? t.maps_link.split('&g_mp=')[0] : null,
    });
  }

  console.log(`${rijen.length} trainers gelezen. Bezig met importeren...`);
  let klaar = 0;
  for (let i = 0; i < rijen.length; i += BATCH) {
    const deel = rijen.slice(i, i + BATCH);
    const { error } = await supabase.from('trainer_kandidaten').upsert(deel, { onConflict: 'place_id', ignoreDuplicates: true });
    if (error) {
      console.error(`\nFout bij rij ${i + 1}: ${error.message}`);
      process.exit(1);
    }
    klaar += deel.length;
    process.stdout.write(`\r${klaar} van ${rijen.length}`);
  }

  const { count } = await supabase.from('trainer_kandidaten').select('*', { count: 'exact', head: true });
  console.log(`\nKlaar. De tabel trainer_kandidaten bevat nu ${count} trainers.`);
  await supabase.auth.signOut();
}

main().catch((fout) => {
  console.error('Er ging iets mis:', fout.message);
  process.exit(1);
});
