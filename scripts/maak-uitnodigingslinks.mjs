// Maakt het mailingbestand trainers-mailing.csv uit de database (tabel trainer_kandidaten):
// per trainer het partnernummer, e-mailadres en een persoonlijke uitnodigingslink
// naar het aanmeldformulier, met naam, plaats, telefoon en website alvast ingevuld.
//
// Starten (in een terminal, in de map blijfsterk):
//   node scripts/maak-uitnodigingslinks.mjs
//
// Alleen een gemeente, of een strengere selectie:
//   node scripts/maak-uitnodigingslinks.mjs --gemeente=Zwolle --score=4.8 --reviews=20
//
// Standaard: score >= 4,5, reviews >= 10, status 'nieuw', met e-mailadres.
// Vraagt om je beheerderswachtwoord (niet getoond, niet bewaard).

import fs from 'node:fs';
import readline from 'node:readline';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'dick.bertels@interim-share.nl';
const DOEL = 'trainers-mailing.csv';
const SITE = 'https://blijfsterk.vercel.app'; // later: https://blijfsterk.nl

const arg = (naam, standaard) => {
  const a = process.argv.find((x) => x.startsWith(`--${naam}=`));
  return a ? a.slice(naam.length + 3) : standaard;
};
const SCORE_MIN = parseFloat(arg('score', '4.5'));
const REVIEWS_MIN = parseInt(arg('reviews', '10'), 10);
const GEMEENTE = arg('gemeente', '');
const STATUS = arg('status', 'nieuw');

function leesEnv(naam) {
  if (process.env[naam]) return process.env[naam];
  for (const bestand of ['.env.local', '.env']) {
    if (!fs.existsSync(bestand)) continue;
    const regel = fs.readFileSync(bestand, 'utf8').split(/\r?\n/).find((r) => r.startsWith(naam + '='));
    if (regel) return regel.slice(naam.length + 1).trim().replace(/^["']|["']$/g, '');
  }
  return '';
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
    rl._writeToOutput = () => {};
  });
}

function csvVeld(waarde) {
  const s = waarde == null ? '' : String(waarde);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function maakLink(t) {
  const q = new URLSearchParams();
  if (t.partnernummer) q.set('pn', t.partnernummer);
  q.set('naam', t.naam);
  if (t.gemeente) q.set('plaats', t.gemeente);
  if (t.telefoon) q.set('telefoon', t.telefoon);
  if (t.website) q.set('website', t.website);
  return `${SITE}/word-partner?${q.toString()}`;
}

async function main() {
  const url = leesEnv('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = leesEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!url || !anonKey) {
    console.error('Supabase-gegevens niet gevonden in .env.local.');
    process.exit(1);
  }
  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  const wachtwoord = await vraagWachtwoord(`Wachtwoord van ${ADMIN_EMAIL}: `);
  const { error: loginFout } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: wachtwoord });
  if (loginFout) {
    console.error('Inloggen mislukt:', loginFout.message);
    process.exit(1);
  }

  const rijen = [];
  for (let van = 0; ; van += 1000) {
    let q = supabase
      .from('trainer_kandidaten')
      .select('partnernummer,naam,gemeente,telefoon,website,email,email_bron,google_score,aantal_reviews,status')
      .not('email', 'is', null)
      .gte('google_score', SCORE_MIN)
      .gte('aantal_reviews', REVIEWS_MIN)
      .order('google_score', { ascending: false })
      .order('aantal_reviews', { ascending: false })
      .range(van, van + 999);
    if (STATUS) q = q.eq('status', STATUS);
    if (GEMEENTE) q = q.eq('gemeente', GEMEENTE);
    const { data, error } = await q;
    if (error) { console.error(error.message); process.exit(1); }
    if (!data || data.length === 0) break;
    rijen.push(...data);
    if (data.length < 1000) break;
  }

  const kop = ['partnernummer', 'naam', 'gemeente', 'email', 'email_bron', 'telefoon', 'website', 'google_score', 'aantal_reviews', 'uitnodigingslink'];
  const uit = ['﻿' + kop.join(';')];
  for (const t of rijen) {
    uit.push(
      [t.partnernummer, t.naam, t.gemeente, t.email, t.email_bron, t.telefoon, t.website,
       t.google_score != null ? String(t.google_score).replace('.', ',') : '', t.aantal_reviews, maakLink(t)]
        .map(csvVeld).join(';')
    );
  }
  fs.writeFileSync(DOEL, uit.join('\n') + '\n');

  console.log(`${rijen.length} trainers geselecteerd (status ${STATUS || 'alle'}, score >= ${SCORE_MIN}, reviews >= ${REVIEWS_MIN}${GEMEENTE ? `, gemeente ${GEMEENTE}` : ''}).`);
  console.log(`Mailingbestand: ${DOEL}. Kolom "uitnodigingslink" gebruik je in de mail; "email_bron" = aangenomen betekent info@ geraden.`);
  await supabase.auth.signOut();
}

main().catch((fout) => {
  console.error('Er ging iets mis:', fout.message);
  process.exit(1);
});
