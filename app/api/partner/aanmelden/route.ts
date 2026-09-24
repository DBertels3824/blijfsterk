import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { beoordeel, DOCUMENTEN, MAX_BESTAND_BYTES, TOEGESTANE_BESTANDEN, type DocumentSleutel } from '@/lib/toetsing';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Verwerkt het aanmeldformulier van /word-partner (multipart, met documenten).
// 1. Documenten naar de privé-opslag (partner-documenten), alleen leesbaar voor de beheerder.
// 2. Aanmelding opslaan.
// 3. Automatisch toetsen: compleet → meteen partner (status "proef"), anders wacht op Dirk.
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ fout: 'Ongeldige aanmelding.' }, { status: 400 });

  const tekst = (naam: string) => String(form.get(naam) || '').trim().slice(0, 500);
  const type = tekst('type') === 'sportschool' ? 'sportschool' : 'trainer';
  const naam = tekst('naam');
  const email = tekst('email').toLowerCase();
  const telefoon = tekst('telefoon');
  const plaats = tekst('plaats');
  const kvkNummer = tekst('kvk_nummer').replace(/\s/g, '');
  const registratienummer = tekst('registratienummer');
  const partnernummerUitLink = tekst('partnernummer').toUpperCase().replace(/[^A-Z0-9-]/g, '');
  let antwoorden: Record<string, string> = {};
  try {
    antwoorden = JSON.parse(String(form.get('antwoorden') || '{}'));
  } catch {
    antwoorden = {};
  }

  if (!naam || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ fout: 'Vul in ieder geval je naam en een geldig e-mailadres in.' }, { status: 400 });
  }

  const service = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  // Documenten opslaan
  const documenten: Partial<Record<DocumentSleutel, string>> = {};
  const map = crypto.randomUUID();
  for (const doc of DOCUMENTEN) {
    const bestand = form.get(`doc_${doc.sleutel}`);
    if (!(bestand instanceof File) || bestand.size === 0) continue;
    if (!TOEGESTANE_BESTANDEN.includes(bestand.type)) {
      return NextResponse.json({ fout: `${doc.label}: alleen PDF, JPG of PNG.` }, { status: 400 });
    }
    if (bestand.size > MAX_BESTAND_BYTES) {
      return NextResponse.json({ fout: `${doc.label}: bestand is groter dan 8 MB.` }, { status: 400 });
    }
    const ext = bestand.type === 'application/pdf' ? 'pdf' : bestand.type === 'image/png' ? 'png' : 'jpg';
    const pad = `aanmeldingen/${map}/${doc.sleutel}.${ext}`;
    const { error } = await service.storage.from('partner-documenten').upload(pad, bestand, { contentType: bestand.type, upsert: true });
    if (error) {
      console.error('Upload mislukt:', error.message);
      return NextResponse.json({ fout: `Uploaden van ${doc.label} is niet gelukt. Probeer het nog eens.` }, { status: 500 });
    }
    documenten[doc.sleutel] = pad;
  }

  const toetsing = beoordeel({ type, kvkNummer, registratienummer, documenten, antwoorden });

  // Partnernummer: uit de uitnodigingslink als dat klopt met een kandidaat, anders een nieuw.
  let partnernummer: string | null = null;
  if (partnernummerUitLink) {
    const { data: kandidaat } = await service.from('trainer_kandidaten').select('partnernummer').eq('partnernummer', partnernummerUitLink).maybeSingle();
    if (kandidaat) partnernummer = kandidaat.partnernummer;
  }
  if (!partnernummer) {
    const { data: nieuw } = await service.rpc('nieuw_partnernummer');
    partnernummer = (nieuw as string) || null;
  }

  const { data: aanmelding, error: insertFout } = await service
    .from('trainer_aanmeldingen')
    .insert({
      type,
      naam,
      email,
      telefoon: telefoon || null,
      plaats: plaats || null,
      antwoorden,
      kvk_nummer: kvkNummer || null,
      registratienummer: registratienummer || null,
      documenten,
      toetsing: toetsing.compleet ? 'compleet' : `onvolledig: ${toetsing.redenen.join('; ')}`,
      status: toetsing.compleet ? 'geaccepteerd' : 'nieuw',
      partnernummer,
      beoordeeld_op: toetsing.compleet ? new Date().toISOString() : null,
    })
    .select('id')
    .single();
  if (insertFout || !aanmelding) {
    console.error('Aanmelding opslaan mislukt:', insertFout?.message);
    return NextResponse.json({ fout: 'Opslaan is niet gelukt. Probeer het nog eens.' }, { status: 500 });
  }

  // Kandidaat in de uitnodigingslijst bijwerken
  if (partnernummerUitLink) {
    await service.from('trainer_kandidaten').update({ status: 'aangemeld', email, bijgewerkt_op: new Date().toISOString() }).eq('partnernummer', partnernummerUitLink);
  }

  // Automatisch geaccepteerd: meteen een partner-rij aanmaken (nog zonder login;
  // die koppelt de partner zelf via /api/partner/koppel als hij een account maakt).
  if (toetsing.compleet) {
    const { data: trainer } = await service
      .from('trainers')
      .insert({
        naam,
        plaats: plaats || null,
        type,
        contact: email,
        email,
        specialisatie: type === 'trainer' ? 'Personal trainer 55+' : 'Sportschool',
        reisbereidheid_km: 15,
        partnernummer,
        status: 'proef',
        aanmelding_id: aanmelding.id,
        zichtbaar: true,
      })
      .select('id')
      .single();
    if (trainer) await service.from('trainer_aanmeldingen').update({ trainer_id: trainer.id }).eq('id', aanmelding.id);
  }

  return NextResponse.json({
    ok: true,
    geaccepteerd: toetsing.compleet,
    partnernummer,
    redenen: toetsing.compleet ? [] : toetsing.redenen,
  });
}
