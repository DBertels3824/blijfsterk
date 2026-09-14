import { NextResponse } from 'next/server';

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
};

export async function POST(req: Request) {
  const { plaats, type } = await req.json();

  if (!plaats) {
    return NextResponse.json({ resultaten: [], fout: 'Vul eerst je woonplaats in bij je profiel.' });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ resultaten: [], fout: 'Het zoeken naar echte trainers is nog niet ingesteld.' });
  }

  const zoekterm = type === 'voedingsdeskundige' ? 'diëtist voedingsdeskundige' : 'personal trainer 55 plus';
  const textQuery = `${zoekterm} in ${plaats}`;

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri',
      },
      body: JSON.stringify({ textQuery, languageCode: 'nl', maxResultCount: 8 }),
    });

    if (!res.ok) {
      return NextResponse.json({ resultaten: [], fout: 'Zoeken bij Google is mislukt.' });
    }

    const data = await res.json();
    const places: GooglePlace[] = data.places || [];

    const resultaten = places.map((p) => ({
      id: p.id || null,
      naam: p.displayName?.text || 'Onbekend',
      adres: p.formattedAddress || '',
      rating: typeof p.rating === 'number' ? p.rating : null,
      aantalReviews: p.userRatingCount ?? 0,
      telefoon: p.nationalPhoneNumber || null,
      website: p.websiteUri || null,
      mapsLink: p.googleMapsUri || null,
    }));

    return NextResponse.json({ resultaten, fout: null });
  } catch {
    return NextResponse.json({ resultaten: [], fout: 'Zoeken bij Google is mislukt.' });
  }
}
