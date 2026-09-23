// Zoekt e-mailadressen voor de trainers in de tabel trainer_kandidaten.
//
// Starten (in een terminal, in de map blijfsterk):
//   node scripts/vind-emails.mjs
//
// Per trainer met een website en nog geen e-mailadres:
//   1. De homepage en een paar gangbare contactpagina's ophalen (/contact, /over-ons, ...).
//   2. E-mailadressen eruit halen. Staat er een op de site, dan die (voorkeur voor info@).
//   3. Niets gevonden? Dan info@<domein> aannemen — werkt meestal.
// Het resultaat gaat direct in de database (kolom email + email_bron: 'website' of 'aangenomen').
//
// Vraagt om je beheerderswachtwoord (niet getoond, niet bewaard). Duurt voor ~7.000
// trainers ongeveer een uur. Stoppen met Ctrl+C; opnieuw starten gaat verder waar het was.

import fs from 'node:fs';
import readline from 'node:readline';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'dick.bertels@interim-share.nl';
const TEGELIJK = 8;         // hoeveel websites tegelijk
const TIMEOUT_MS = 8000;    // per pagina
const PADEN = ['', '/contact', '/contact/', '/over-ons', '/over-mij', '/over', '/about'];

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const NEGEER = /(\.png|\.jpg|\.jpeg|\.gif|\.svg|\.webp|sentry|wixpress|example\.|domain\.|yourdomain|email\.com|@2x|noreply|no-reply|godaddy|squarespace|wordpress\.)/i;

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

function domeinVan(website) {
  try {
    const u = new URL(website.startsWith('http') ? website : `https://${website}`);
    return u.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

async function haalPagina(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BlijfSterkBot/1.0; +https://blijfsterk.nl)' },
    });
    if (!res.ok) return '';
    const type = res.headers.get('content-type') || '';
    if (!type.includes('text/html')) return '';
    return (await res.text()).slice(0, 400000);
  } catch {
    return '';
  } finally {
    clearTimeout(timer);
  }
}

function emailsUit(html, domein) {
  const gevonden = new Set();
  // Ook "info [at] domein [dot] nl"-varianten en mailto-links
  const genormaliseerd = html
    .replace(/\s*\[at\]\s*|\s*\(at\)\s*|\s+at\s+(?=[a-z0-9.-]+\s*(\[dot\]|\(dot\)|\.))/gi, '@')
    .replace(/\s*\[dot\]\s*|\s*\(dot\)\s*/gi, '.');
  for (const m of genormaliseerd.matchAll(EMAIL_RE)) {
    const e = m[0].toLowerCase().replace(/^mailto:/, '');
    if (NEGEER.test(e)) continue;
    if (e.length > 60) continue;
    gevonden.add(e);
  }
  const lijst = [...gevonden];
  // Voorkeur: adres op het eigen domein, daarbinnen info@ eerst
  const eigen = lijst.filter((e) => domein && e.endsWith('@' + domein));
  const kies = (arr) => arr.find((e) => e.startsWith('info@')) || arr.find((e) => /^(contact|hallo|hello|mail|welkom)@/.test(e)) || arr[0];
  return kies(eigen) || kies(lijst) || null;
}

async function zoekEmail(website) {
  const domein = domeinVan(website);
  if (!domein) return { email: null, bron: null };
  const basis = website.startsWith('http') ? website.replace(/\/$/, '') : `https://${website}`;
  for (const pad of PADEN) {
    const html = await haalPagina(basis + pad);
    if (!html) continue;
    const email = emailsUit(html, domein);
    if (email) return { email, bron: 'website' };
  }
  return { email: `info@${domein}`, bron: 'aangenomen' };
}

async function main() {
  const url = leesEnv('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = leesEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!url || !anonKey) {
    console.error('Supabase-gegevens niet gevonden in .env.local.');
    process.exit(1);
  }
  const supabase = createClient(url, anonKey);
  const wachtwoord = await vraagWachtwoord(`Wachtwoord van ${ADMIN_EMAIL}: `);
  const { error: loginFout } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: wachtwoord });
  if (loginFout) {
    console.error('Inloggen mislukt:', loginFout.message);
    process.exit(1);
  }

  const teDoen = [];
  for (let van = 0; ; van += 1000) {
    const { data, error } = await supabase
      .from('trainer_kandidaten')
      .select('id, naam, website')
      .is('email', null)
      .not('website', 'is', null)
      .order('id')
      .range(van, van + 999);
    if (error) { console.error(error.message); process.exit(1); }
    if (!data || data.length === 0) break;
    teDoen.push(...data);
    if (data.length < 1000) break;
  }
  console.log(`${teDoen.length} trainers met website en zonder e-mailadres. Bezig...`);

  let klaar = 0, opSite = 0, aangenomen = 0;
  let stoppen = false;
  process.on('SIGINT', () => { stoppen = true; console.log('\nStoppen na de lopende websites...'); });

  const wachtrij = [...teDoen];
  async function werker() {
    while (wachtrij.length && !stoppen) {
      const t = wachtrij.shift();
      const { email, bron } = await zoekEmail(t.website);
      if (email) {
        await supabase.from('trainer_kandidaten').update({ email, email_bron: bron, bijgewerkt_op: new Date().toISOString() }).eq('id', t.id);
        if (bron === 'website') opSite++; else aangenomen++;
      }
      klaar++;
      process.stdout.write(`\r${klaar} van ${teDoen.length}  (op site gevonden: ${opSite}, aangenomen info@: ${aangenomen})   `);
    }
  }
  await Promise.all(Array.from({ length: TEGELIJK }, werker));

  console.log(`\nKlaar. ${opSite} adressen op de website gevonden, ${aangenomen} keer info@ aangenomen.`);
  console.log('Bekijk ze in het menu "Trainers uitnodigen". Aangenomen adressen kun je daar aanpassen als een mail terugkomt.');
  await supabase.auth.signOut();
}

main().catch((fout) => {
  console.error('Er ging iets mis:', fout.message);
  process.exit(1);
});
