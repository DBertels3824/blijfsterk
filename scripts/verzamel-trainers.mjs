// Verzamelt personal trainers in heel Nederland via Google Maps (Places API, New)
// en zet ze in één CSV-bestand dat je in Excel opent.
//
// Starten (in een terminal, in de map blijfsterk):
//   node scripts/verzamel-trainers.mjs
//
// Alleen een paar plaatsen (bijv. om te testen):
//   node scripts/verzamel-trainers.mjs --plaatsen=Zwolle,Deventer
//
// - Leest de Google-sleutel uit .env.local (GOOGLE_MAPS_API_KEY), dezelfde als de site.
// - Loopt alle gemeenten af, max. 3 pagina's (60 resultaten) per gemeente.
// - Schrijft naar trainers-nederland.csv (verse regels worden toegevoegd).
// - Onthoudt welke gemeenten al klaar zijn in trainers-voortgang.json, dus als het
//   script stopt, ga je met hetzelfde commando gewoon verder waar je was.
// - Kosten: ongeveer 1.000 zoekopdrachten voor heel Nederland, ruwweg €30–50 aan
//   Google-tegoed. Controleer je tegoed/limieten in de Google Cloud Console.

import fs from 'node:fs';
import path from 'node:path';

const CSV = 'trainers-nederland.csv';
const VOORTGANG = 'trainers-voortgang.json';
const MAX_PAGINAS = 3;
const PAUZE_MS = 2200; // Google wil ±2 s wachten voor een volgende pagina

const GEMEENTEN = [
  "'s-Hertogenbosch","Aa en Hunze","Aalsmeer","Aalten","Achtkarspelen","Alblasserdam","Alkmaar","Almelo","Almere","Alphen aan den Rijn","Alphen-Chaam","Altena","Ameland","Amersfoort","Amstelveen","Amsterdam","Apeldoorn","Arnhem","Assen","Asten","Baarle-Nassau","Baarn","Barendrecht","Barneveld","Beek","Beekdaelen","Beesel","Berg en Dal","Bergeijk","Bergen (L)","Bergen (NH)","Bergen op Zoom","Berkelland","Bernheze","Best","Beuningen","Beverwijk","De Bilt","Bladel","Blaricum","Bloemendaal","Bodegraven-Reeuwijk","Boekel","Borger-Odoorn","Borne","Borsele","Boxtel","Breda","Brielle","Bronckhorst","Brummen","Brunssum","Bunnik","Bunschoten","Buren","Capelle aan den IJssel","Castricum","Coevorden","Cranendonck","Culemborg","Dalfsen","Dantumadiel","Delft","Deurne","Deventer","Diemen","Dijk en Waard","Dinkelland","Doesburg","Doetinchem","Dongen","Dordrecht","Drechterland","Drimmelen","Dronten","Druten","Duiven","Echt-Susteren","Edam-Volendam","Ede","Eemnes","Eemsdelta","Eersel","Eijsden-Margraten","Eindhoven","Elburg","Emmen","Enkhuizen","Enschede","Epe","Ermelo","Etten-Leur","De Fryske Marren","Geertruidenberg","Geldrop-Mierlo","Gemert-Bakel","Gennep","Gilze en Rijen","Goeree-Overflakkee","Goes","Goirle","Gooise Meren","Gorinchem","Gouda","Groningen","Gulpen-Wittem","Haaksbergen","Haarlem","Haarlemmermeer","Halderberge","Hardenberg","Harderwijk","Hardinxveld-Giessendam","Harlingen","Hattem","Heemskerk","Heemstede","Heerde","Heerenveen","Heerlen","Heeze-Leende","Heiloo","Den Helder","Hellendoorn","Helmond","Hendrik-Ido-Ambacht","Hengelo","Het Hogeland","Heumen","Heusden","Hillegom","Hilvarenbeek","Hilversum","Hoeksche Waard","Hof van Twente","Hollands Kroon","Hoogeveen","Hoorn","Horst aan de Maas","Houten","Huizen","Hulst","IJsselstein","Kaag en Braassem","Kampen","Kapelle","Katwijk","Kerkrade","Koggenland","Krimpen aan den IJssel","Krimpenerwaard","Laarbeek","Land van Cuijk","Landgraaf","Landsmeer","Lansingerland","Laren","Leeuwarden","Leiden","Leiderdorp","Leidschendam-Voorburg","Lelystad","Leudal","Leusden","Lingewaard","Lisse","Lochem","Loon op Zand","Lopik","Losser","Maasdriel","Maasgouw","Maashorst","Maassluis","Maastricht","Medemblik","Meerssen","Meierijstad","Meppel","Middelburg","Midden-Delfland","Midden-Drenthe","Midden-Groningen","Moerdijk","Molenlanden","Montferland","Montfoort","Mook en Middelaar","Neder-Betuwe","Nederweert","Nieuwegein","Nieuwkoop","Nijkerk","Nijmegen","Nissewaard","Noardeast-Fryslân","Noord-Beveland","Noordenveld","Noordoostpolder","Noordwijk","Nuenen","Nunspeet","Oegstgeest","Oirschot","Oisterwijk","Oldambt","Oldebroek","Oldenzaal","Olst-Wijhe","Ommen","Oost Gelre","Oosterhout","Ooststellingwerf","Oostzaan","Opmeer","Opsterland","Oss","Oude IJsselstreek","Ouder-Amstel","Oudewater","Overbetuwe","Papendrecht","Peel en Maas","Pekela","Pijnacker-Nootdorp","Purmerend","Putten","Raalte","Renkum","Renswoude","Reusel-De Mierden","Rheden","Rhenen","Ridderkerk","Rijssen-Holten","Rijswijk","Roerdalen","Roermond","De Ronde Venen","Roosendaal","Rotterdam","Rozendaal","Rucphen","Schagen","Scherpenzeel","Schiedam","Schiermonnikoog","Schouwen-Duiveland","Simpelveld","Sint-Michielsgestel","Sittard-Geleen","Sliedrecht","Sluis","Smallingerland","Soest","Someren","Son en Breugel","Stadskanaal","Staphorst","Stede Broec","Steenbergen","Steenwijkerland","Stein","Stichtse Vecht","Súdwest-Fryslân","Terneuzen","Terschelling","Texel","Teylingen","Tholen","Tiel","Tilburg","Tubbergen","Twenterand","Tynaarlo","Tytsjerksteradiel","Uitgeest","Uithoorn","Urk","Utrecht","Utrechtse Heuvelrug","Vaals","Valkenburg aan de Geul","Valkenswaard","Veendam","Veenendaal","Veere","Veldhoven","Velsen","Venlo","Venray","Vijfheerenlanden","Vlaardingen","Vlieland","Vlissingen","Voerendaal","Voorne aan Zee","Voorschoten","Voorst","Vught","Waadhoeke","Waalre","Waalwijk","Waddinxveen","Wageningen","Wassenaar","Waterland","Weert","West Betuwe","West Maas en Waal","Westerkwartier","Westerveld","Westervoort","Westerwolde","Westland","Weststellingwerf","Wierden","Wijchen","Wijdemeren","Wijk bij Duurstede","Winterswijk","Woensdrecht","Woerden","De Wolden","Wormerland","Woudenberg","Zaanstad","Zaltbommel","Zandvoort","Zeewolde","Zeist","Zevenaar","Zoetermeer","Zoeterwoude","Zuidplas","Zundert","Zutphen","Zwartewaterland","Zwijndrecht","Zwolle","Den Haag",
];

function leesApiKey() {
  if (process.env.GOOGLE_MAPS_API_KEY) return process.env.GOOGLE_MAPS_API_KEY;
  for (const bestand of ['.env.local', '.env']) {
    if (!fs.existsSync(bestand)) continue;
    const regel = fs.readFileSync(bestand, 'utf8').split(/\r?\n/).find((r) => r.startsWith('GOOGLE_MAPS_API_KEY='));
    if (regel) return regel.slice('GOOGLE_MAPS_API_KEY='.length).trim().replace(/^["']|["']$/g, '');
  }
  return '';
}

function csvVeld(waarde) {
  const s = waarde == null ? '' : String(waarde);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const slaap = (ms) => new Promise((r) => setTimeout(r, ms));

async function zoekPagina(apiKey, textQuery, pageToken) {
  const body = { textQuery, languageCode: 'nl', regionCode: 'NL', pageSize: 20 };
  if (pageToken) body.pageToken = pageToken;
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask':
        'nextPageToken,places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Google gaf code ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.json();
}

async function main() {
  const apiKey = leesApiKey();
  if (!apiKey) {
    console.error('Geen GOOGLE_MAPS_API_KEY gevonden in .env.local. Zet die er eerst in.');
    process.exit(1);
  }

  const arg = process.argv.find((a) => a.startsWith('--plaatsen='));
  const plaatsen = arg ? arg.slice('--plaatsen='.length).split(',').map((p) => p.trim()).filter(Boolean) : GEMEENTEN;

  const voortgang = fs.existsSync(VOORTGANG) ? JSON.parse(fs.readFileSync(VOORTGANG, 'utf8')) : { klaar: [], ids: [] };
  const bekendeIds = new Set(voortgang.ids);

  if (!fs.existsSync(CSV)) {
    // BOM zodat Excel de ë, ï enz. goed leest; puntkomma als scheidingsteken (NL-Excel).
    fs.writeFileSync(
      CSV,
      '﻿' + ['naam', 'gemeente', 'adres', 'telefoon', 'website', 'google_score', 'aantal_reviews', 'maps_link', 'place_id', 'status', 'notitie'].join(';') + '\n'
    );
  }

  let totaalNieuw = 0;
  for (const plaats of plaatsen) {
    if (voortgang.klaar.includes(plaats)) continue;
    process.stdout.write(`${plaats} ... `);
    let nieuw = 0;
    let pageToken;
    try {
      for (let pagina = 0; pagina < MAX_PAGINAS; pagina++) {
        if (pageToken) await slaap(PAUZE_MS);
        const data = await zoekPagina(apiKey, `personal trainer in ${plaats}`, pageToken);
        for (const p of data.places || []) {
          if (!p.id || bekendeIds.has(p.id)) continue;
          bekendeIds.add(p.id);
          nieuw++;
          fs.appendFileSync(
            CSV,
            [
              p.displayName?.text || 'Onbekend',
              plaats,
              p.formattedAddress || '',
              p.nationalPhoneNumber || '',
              p.websiteUri || '',
              typeof p.rating === 'number' ? String(p.rating).replace('.', ',') : '',
              p.userRatingCount ?? 0,
              p.googleMapsUri || '',
              p.id,
              'nieuw',
              '',
            ]
              .map(csvVeld)
              .join(';') + '\n'
          );
        }
        pageToken = data.nextPageToken;
        if (!pageToken) break;
      }
    } catch (fout) {
      console.log(`MISLUKT (${fout.message}). Ga verder met de volgende; draai het script later opnieuw voor deze plaats.`);
      continue;
    }
    voortgang.klaar.push(plaats);
    voortgang.ids = [...bekendeIds];
    fs.writeFileSync(VOORTGANG, JSON.stringify(voortgang));
    totaalNieuw += nieuw;
    console.log(`${nieuw} nieuw (totaal ${bekendeIds.size})`);
    await slaap(300);
  }

  console.log(`\nKlaar. ${totaalNieuw} nieuwe trainers toegevoegd. Alles staat in ${path.resolve(CSV)}.`);
  console.log('Open het bestand in Excel. Kolom "status" kun je zelf bijhouden: nieuw / uitgenodigd / gesproken / aangemeld / nee.');
}

main().catch((fout) => {
  console.error('Er ging iets mis:', fout.message);
  process.exit(1);
});
