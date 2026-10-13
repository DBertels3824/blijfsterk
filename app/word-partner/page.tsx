'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { isPartnerType, PARTNERTYPEN, PARTNERTYPEN_VOLGORDE, type DocumentSleutel, type PartnerType } from '@/lib/partnertypen';

const inputStijl: React.CSSProperties = {
  fontFamily: 'inherit',
  width: '100%',
  padding: '0 16px',
  minHeight: 50,
  borderRadius: 14,
  border: '2px solid #F3E4C8',
  fontSize: 15.5,
  boxSizing: 'border-box',
};

const textareaStijl: React.CSSProperties = {
  ...inputStijl,
  minHeight: 90,
  padding: 14,
  resize: 'vertical' as const,
};

export default function WordPartner() {
  const [type, setType] = useState<PartnerType>('trainer');
  const [naam, setNaam] = useState('');
  const [email, setEmail] = useState('');
  const [telefoon, setTelefoon] = useState('');
  const [plaats, setPlaats] = useState('');
  const [antwoorden, setAntwoorden] = useState<Record<string, string>>({});
  const [versturen, setVersturen] = useState(false);
  const [verstuurd, setVerstuurd] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [uitgenodigd, setUitgenodigd] = useState(false);
  const [partnernummer, setPartnernummer] = useState('');
  const [akkoord, setAkkoord] = useState(false);
  const [kvkNummer, setKvkNummer] = useState('');
  const [registratienummer, setRegistratienummer] = useState('');
  const [bestanden, setBestanden] = useState<Partial<Record<DocumentSleutel, File>>>({});
  const [resultaat, setResultaat] = useState<{
    geaccepteerd: boolean;
    partnernummer: string | null;
    redenen: string[];
    controle: string | null;
  } | null>(null);

  // Uitnodigingslink uit een mailing: velden staan dan al ingevuld, de partner hoeft
  // alleen te controleren en de vragen te beantwoorden. Voorbeeld:
  //   /word-partner?naam=Jan%20de%20Vries&plaats=Zwolle&telefoon=06...&website=https://...
  // Met &type=fysiotherapeut (of sportmasseur, voedingsdeskundige, sportschool) staat
  // meteen het goede formulier open. Deze parameters worden alleen in het formulier
  // gezet, niet opgeslagen tot de partner zelf op "versturen" klikt.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const q = new URLSearchParams(window.location.search);
    const typeUitLink = q.get('type');
    if (isPartnerType(typeUitLink)) setType(typeUitLink);
    if (!q.has('naam') && !q.has('email')) return;
    const kort = (v: string | null) => (v || '').trim().slice(0, 200);
    setPartnernummer(kort(q.get('pn')).replace(/[^A-Z0-9-]/gi, '').toUpperCase());
    setNaam(kort(q.get('naam')));
    setEmail(kort(q.get('email')));
    setTelefoon(kort(q.get('telefoon')));
    setPlaats(kort(q.get('plaats')));
    const website = kort(q.get('website'));
    if (website) setAntwoorden((prev) => ({ ...prev, referenties: website }));
    setUitgenodigd(true);
  }, []);

  const cfg = PARTNERTYPEN[type];
  const vragen = cfg.vragen;

  const zetAntwoord = (sleutel: string, waarde: string) => {
    setAntwoorden((prev) => ({ ...prev, [sleutel]: waarde }));
  };

  const kiesType = (t: PartnerType) => {
    setType(t);
    // Elk beroep heeft eigen vragen. De website uit een uitnodigingslink blijft staan.
    setAntwoorden((prev) => (prev.referenties ? { referenties: prev.referenties } : {}));
  };

  const versturenKlik = async () => {
    setFout(null);
    if (!naam.trim() || !email.trim()) {
      setFout('Vul in ieder geval je naam en e-mailadres in.');
      return;
    }
    if (cfg.registratie?.eis === 'verplicht' && !registratienummer.trim()) {
      setFout(`Vul je ${cfg.registratie.kort} in.`);
      return;
    }
    const ontbreekt = vragen.find((v) => v.verplicht && !antwoorden[v.sleutel]?.trim());
    if (ontbreekt) {
      setFout('Vul alle verplichte vragen in.');
      return;
    }
    if (!akkoord) {
      setFout('Vink aan dat je akkoord gaat met de voorwaarden en de privacyverklaring.');
      return;
    }

    setVersturen(true);
    const form = new FormData();
    form.set('type', type);
    form.set('naam', naam);
    form.set('email', email);
    form.set('telefoon', telefoon);
    form.set('plaats', plaats);
    form.set('kvk_nummer', kvkNummer);
    form.set('registratienummer', cfg.registratie ? registratienummer : '');
    form.set('partnernummer', partnernummer);
    form.set('antwoorden', JSON.stringify(antwoorden));
    for (const doc of cfg.documenten) {
      const f = bestanden[doc.sleutel];
      if (f) form.set(`doc_${doc.sleutel}`, f);
    }

    try {
      const res = await fetch('/api/partner/aanmelden', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      setVersturen(false);
      if (!res.ok) {
        setFout(data.fout || 'Versturen is niet gelukt. Probeer het nog eens.');
        return;
      }
      setResultaat({
        geaccepteerd: !!data.geaccepteerd,
        partnernummer: data.partnernummer || null,
        redenen: data.redenen || [],
        controle: data.controle || null,
      });
      setVerstuurd(true);
    } catch {
      setVersturen(false);
      setFout('Versturen is niet gelukt. Controleer je verbinding en probeer het nog eens.');
    }
  };

  if (verstuurd) {
    const nummer = resultaat?.partnernummer || partnernummer;
    return (
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '40px 20px 60px', textAlign: 'center' }}>
        {resultaat?.geaccepteerd ? (
          <>
            <h1 style={{ fontSize: 26 }}>Welkom bij Blijf Sterk!</h1>
            <p style={{ color: '#4A3624', marginTop: 10, lineHeight: 1.6 }}>
              Je aanmelding is compleet en je bent per direct partner, op proef. Je partnernummer is{' '}
              <strong style={{ fontFamily: 'monospace' }}>{nummer}</strong>.
            </p>
            <p style={{ color: '#4A3624', marginTop: 10, lineHeight: 1.6 }}>
              Nog één stap: maak een account aan met hetzelfde e-mailadres (<strong>{email}</strong>). Dan zie je
              je partnerdashboard, met je klanten en afrekeningen.
            </p>
            <Link
              href={`/login?partner=1&email=${encodeURIComponent(email)}`}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginTop: 20,
                minHeight: 52, padding: '0 28px', borderRadius: 999, fontWeight: 700, fontSize: 16,
                background: 'linear-gradient(135deg,#FFBE0A,#FF8601)', color: '#3A1E00', textDecoration: 'none',
              }}
            >
              Account aanmaken
            </Link>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 24 }}>Bedankt voor je aanmelding!</h1>
            <p style={{ color: '#4A3624', marginTop: 10, lineHeight: 1.6 }}>
              We nemen je aanmelding persoonlijk door en laten je binnen een paar dagen weten of je bent
              toegelaten. Je partnernummer is <strong style={{ fontFamily: 'monospace' }}>{nummer}</strong>.
            </p>
            {resultaat && resultaat.redenen.length > 0 && (
              <p style={{ color: '#6F5A48', marginTop: 12, fontSize: 15.5, lineHeight: 1.6 }}>
                Nog niet compleet: {resultaat.redenen.join(', ')}. Je kunt dit later aanvullen via info@blijfsterk.nl.
              </p>
            )}
            {resultaat && resultaat.redenen.length === 0 && resultaat.controle && (
              <p style={{ color: '#6F5A48', marginTop: 12, fontSize: 15.5, lineHeight: 1.6 }}>
                Je aanmelding is compleet. Eén ding doen we zelf: {resultaat.controle}. Daarna hoor je van ons.
              </p>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px 60px' }}>
      <h1 style={{ fontSize: 26, margin: '0 0 6px' }}>
        {uitgenodigd ? `Welkom${naam ? `, ${naam.split(' ')[0]}` : ''}!` : 'Word partner van Blijf Sterk'}
      </h1>
      <p style={{ color: '#6F5A48', margin: '0 0 24px', lineHeight: 1.6 }}>
        {uitgenodigd
          ? 'We hebben je gegevens alvast ingevuld. Kijk of alles klopt, beantwoord de vragen hieronder, en klik op versturen. Dat is alles.'
          : 'We werken alleen samen met trainers, fysiotherapeuten, sportmasseurs, voedingsdeskundigen en sportscholen die goed passen bij onze doelgroep: volwassenen van 55+.'}
      </p>

      {uitgenodigd && (
        <div style={{ background: '#FFF1DC', border: '2px solid #FFBE0A', borderRadius: 16, padding: '14px 16px', marginBottom: 22, fontSize: 16, lineHeight: 1.6 }}>
          <strong>Founding partner:</strong> als een van de eerste partners betaal je de eerste zes maanden geen
          abonnement, en zijn je eerste twee koppelingen gratis.
          {partnernummer && (
            <div style={{ marginTop: 8, fontSize: 15, color: '#6F5A48' }}>
              Je partnernummer is <strong style={{ fontFamily: 'monospace' }}>{partnernummer}</strong>. Bewaar dit — het staat straks op elke afrekening.
            </div>
          )}
        </div>
      )}

      <div role="group" aria-label="Wat ben je?" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 26 }}>
        {PARTNERTYPEN_VOLGORDE.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={type === t}
            onClick={() => kiesType(t)}
            style={{
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: 15.5,
              minHeight: 46,
              padding: '0 18px',
              borderRadius: 999,
              cursor: 'pointer',
              border: type === t ? 'none' : '2px solid #F3E4C8',
              background: type === t ? 'linear-gradient(135deg,#FFBE0A,#FF8601)' : '#FFFFFF',
              color: type === t ? '#3A1E00' : '#6F5A48',
            }}
          >
            {PARTNERTYPEN[t].knop}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Veld label={cfg.naamLabel} verplicht>
          <input style={inputStijl} value={naam} onChange={(e) => setNaam(e.target.value)} />
        </Veld>
        <Veld label="E-mailadres" verplicht>
          <input type="email" style={inputStijl} value={email} onChange={(e) => setEmail(e.target.value)} />
        </Veld>
        <Veld label="Telefoonnummer">
          <input style={inputStijl} value={telefoon} onChange={(e) => setTelefoon(e.target.value)} />
        </Veld>
        <Veld label={cfg.plaatsLabel}>
          <input style={inputStijl} value={plaats} onChange={(e) => setPlaats(e.target.value)} />
        </Veld>

        <Veld label="KvK-nummer (8 cijfers)" verplicht>
          <input style={inputStijl} inputMode="numeric" value={kvkNummer} onChange={(e) => setKvkNummer(e.target.value)} placeholder="12345678" />
        </Veld>
        {cfg.registratie && (
          <Veld label={cfg.registratie.label} verplicht={cfg.registratie.eis === 'verplicht'}>
            <input style={inputStijl} value={registratienummer} onChange={(e) => setRegistratienummer(e.target.value)} placeholder={cfg.registratie.plaatshouder} />
          </Veld>
        )}

        <div style={{ background: '#FFF8EE', border: '2px solid #F3E4C8', borderRadius: 18, padding: '14px 16px' }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>Documenten</div>
          <p style={{ fontSize: 15, color: '#6F5A48', margin: '0 0 12px', lineHeight: 1.5 }}>
            We werken met een kwetsbare doelgroep. Daarom vragen we deze documenten. Alleen Blijf Sterk ziet ze,
            ze worden nooit gedeeld. PDF, JPG of PNG, maximaal 8 MB per bestand.{' '}
            {cfg.handmatigeControle
              ? 'Is alles compleet, dan controleren we je registratie en hoor je binnen een paar dagen van ons.'
              : 'Is alles compleet, dan ben je meteen partner.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cfg.documenten.map((doc) => (
              <Veld key={doc.sleutel} label={doc.label} verplicht={doc.verplicht}>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setBestanden((prev) => ({ ...prev, [doc.sleutel]: f }));
                  }}
                  style={{ fontFamily: 'inherit', fontSize: 15.5 }}
                />
                {bestanden[doc.sleutel] && (
                  <div style={{ fontSize: 15, color: '#2E7D32', marginTop: 4 }}>✓ {bestanden[doc.sleutel]!.name}</div>
                )}
              </Veld>
            ))}
          </div>
        </div>

        {vragen.map((v) => (
          <Veld key={v.sleutel} label={v.label} verplicht={v.verplicht}>
            {v.type === 'ja-nee' ? (
              <div style={{ display: 'flex', gap: 8 }}>
                {['Ja', 'Nee'].map((optie) => (
                  <button
                    key={optie}
                    type="button"
                    onClick={() => zetAntwoord(v.sleutel, optie)}
                    style={{
                      fontFamily: 'inherit', fontWeight: 700, fontSize: 15.5, padding: '10px 20px', borderRadius: 999,
                      cursor: 'pointer',
                      border: antwoorden[v.sleutel] === optie ? 'none' : '2px solid #F3E4C8',
                      background: antwoorden[v.sleutel] === optie ? 'linear-gradient(135deg,#FFBE0A,#FF8601)' : '#FFFFFF',
                      color: antwoorden[v.sleutel] === optie ? '#3A1E00' : '#5A4636',
                    }}
                  >
                    {optie}
                  </button>
                ))}
              </div>
            ) : v.type === 'textarea' ? (
              <textarea
                style={textareaStijl}
                rows={3}
                value={antwoorden[v.sleutel] || ''}
                onChange={(e) => zetAntwoord(v.sleutel, e.target.value)}
              />
            ) : (
              <input
                style={inputStijl}
                value={antwoorden[v.sleutel] || ''}
                onChange={(e) => zetAntwoord(v.sleutel, e.target.value)}
              />
            )}
          </Veld>
        ))}

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 15.5, lineHeight: 1.55, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={akkoord}
            onChange={(e) => setAkkoord(e.target.checked)}
            style={{ width: 24, height: 24, marginTop: 2, flexShrink: 0, accentColor: '#FF8601' }}
          />
          <span>
            Ik ga akkoord met de{' '}
            <Link href={cfg.voorwaardenHref} target="_blank" style={{ color: '#B34500', fontWeight: 600 }}>{cfg.voorwaardenLabel}</Link>
            {' '}en de{' '}
            <Link href="/privacy" target="_blank" style={{ color: '#B34500', fontWeight: 600 }}>privacyverklaring</Link>
            {' '}van Blijf Sterk, en ik ben bevoegd om deze aanmelding te doen.
            <span style={{ color: '#B34500' }}> *</span>
          </span>
        </label>

        {fout && <p style={{ color: '#B3261E', fontSize: 15.5 }}>{fout}</p>}

        <button
          onClick={versturenKlik}
          disabled={versturen}
          style={{
            fontFamily: 'inherit', fontWeight: 700, fontSize: 16, borderRadius: 999,
            border: 'none', minHeight: 52, marginTop: 8,
            background: 'linear-gradient(135deg,#FFBE0A,#FF8601)', color: '#3A1E00',
            cursor: versturen ? 'default' : 'pointer', opacity: versturen ? 0.7 : 1,
          }}
        >
          {versturen ? 'Versturen...' : 'Aanmelding versturen'}
        </button>

        <p style={{ fontSize: 15, color: '#6F5A48', lineHeight: 1.6, marginTop: 4 }}>
          Let op: Blijf Sterk brengt gebruikers en partners bij elkaar, maar is geen partij in en niet aansprakelijk
          voor de samenwerking, begeleiding of eventuele schade die ontstaat tussen een partner en een gebruiker.
          Elke partner is zelf verantwoordelijk voor een passende verzekering.
        </p>
      </div>
    </div>
  );
}

function Veld({ label, verplicht, children }: { label: string; verplicht?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
        {label}{verplicht && <span style={{ color: '#B34500' }}> *</span>}
      </label>
      {children}
    </div>
  );
}
