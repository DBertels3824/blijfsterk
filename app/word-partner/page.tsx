'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type VeldType = 'text' | 'textarea' | 'ja-nee';

type Vraag = {
  sleutel: string;
  label: string;
  type: VeldType;
  verplicht?: boolean;
};

const VRAGEN_TRAINER: Vraag[] = [
  { sleutel: 'ervaring_55plus', label: 'Hoeveel jaar ervaring heb je met het trainen van 55-plussers?', type: 'text', verplicht: true },
  { sleutel: 'diplomas', label: "Welke relevante diploma's of certificeringen heb je? (bijv. CIOS, fysiotherapie, Senior Fitness)", type: 'textarea', verplicht: true },
  { sleutel: 'ehbo', label: 'Heb je een geldig EHBO- of BHV-certificaat?', type: 'ja-nee', verplicht: true },
  { sleutel: 'gezondheidsbeperkingen', label: 'Hoe ga je om met deelnemers met gezondheidsbeperkingen, zoals hartklachten, artrose of evenwichtsproblemen?', type: 'textarea', verplicht: true },
  { sleutel: 'aanpak', label: 'Beschrijf kort je aanpak en trainingsstijl.', type: 'textarea', verplicht: true },
  { sleutel: 'verzekering', label: 'Heb je een eigen beroeps- of bedrijfsaansprakelijkheidsverzekering?', type: 'ja-nee', verplicht: true },
  { sleutel: 'motivatie', label: 'Waarom wil je je aansluiten bij Blijf Sterk?', type: 'textarea' },
  { sleutel: 'referenties', label: 'Referenties, website of links naar reviews (optioneel)', type: 'text' },
];

const VRAGEN_SPORTSCHOOL: Vraag[] = [
  { sleutel: 'toegankelijkheid', label: 'Is de sportschool goed toegankelijk voor 55-plussers (gelijkvloers of lift, geen hoge drempels)?', type: 'ja-nee', verplicht: true },
  { sleutel: 'aangepaste_begeleiding', label: 'Bieden jullie aangepaste apparatuur of begeleiding voor 55-plussers?', type: 'textarea', verplicht: true },
  { sleutel: 'ehbo_aanwezig', label: 'Is er tijdens openingstijden personeel met EHBO/BHV aanwezig?', type: 'ja-nee', verplicht: true },
  { sleutel: 'rustige_lessen', label: 'Bieden jullie rustige of aangepaste groepslessen aan buiten de spits, gericht op senioren?', type: 'textarea', verplicht: true },
  { sleutel: 'verzekering', label: 'Beschikt de sportschool over een aansprakelijkheidsverzekering?', type: 'ja-nee', verplicht: true },
  { sleutel: 'motivatie', label: 'Waarom willen jullie je aansluiten bij Blijf Sterk?', type: 'textarea' },
];

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
  const [type, setType] = useState<'trainer' | 'sportschool'>('trainer');
  const [naam, setNaam] = useState('');
  const [email, setEmail] = useState('');
  const [telefoon, setTelefoon] = useState('');
  const [plaats, setPlaats] = useState('');
  const [antwoorden, setAntwoorden] = useState<Record<string, string>>({});
  const [versturen, setVersturen] = useState(false);
  const [verstuurd, setVerstuurd] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  const vragen = type === 'trainer' ? VRAGEN_TRAINER : VRAGEN_SPORTSCHOOL;

  const zetAntwoord = (sleutel: string, waarde: string) => {
    setAntwoorden((prev) => ({ ...prev, [sleutel]: waarde }));
  };

  const versturenKlik = async () => {
    setFout(null);
    if (!naam.trim() || !email.trim()) {
      setFout('Vul in ieder geval je naam en e-mailadres in.');
      return;
    }
    const ontbreekt = vragen.find((v) => v.verplicht && !antwoorden[v.sleutel]?.trim());
    if (ontbreekt) {
      setFout('Vul alle verplichte vragen in.');
      return;
    }

    setVersturen(true);
    const { error } = await supabase.from('trainer_aanmeldingen').insert({
      type,
      naam,
      email,
      telefoon: telefoon || null,
      plaats: plaats || null,
      antwoorden,
    });
    setVersturen(false);

    if (error) {
      setFout('Versturen is niet gelukt. Probeer het nog eens.');
      return;
    }
    setVerstuurd(true);
  };

  if (verstuurd) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px 60px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 24 }}>Bedankt voor je aanmelding!</h1>
        <p style={{ color: '#8A7561', marginTop: 10 }}>
          We nemen je aanmelding door en nemen contact met je op.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 20px 60px' }}>
      <h1 style={{ fontSize: 26, margin: '0 0 6px' }}>Word partner van Blijf Sterk</h1>
      <p style={{ color: '#8A7561', margin: '0 0 24px' }}>
        We werken alleen samen met trainers en sportscholen die goed passen bij onze doelgroep: volwassenen van 55+.
      </p>

      <div style={{ display: 'flex', gap: 8, background: '#FFFFFF', border: '2px solid #F3E4C8', borderRadius: 999, padding: 4, marginBottom: 26, maxWidth: 340 }}>
        {(['trainer', 'sportschool'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setType(t); setAntwoorden({}); }}
            style={{
              flex: 1,
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: 14,
              padding: '10px 0',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              background: type === t ? 'linear-gradient(135deg,#FFBE0A,#FF8601)' : 'transparent',
              color: type === t ? '#3A1E00' : '#8A7561',
            }}
          >
            {t === 'trainer' ? 'Ik ben trainer' : 'Wij zijn een sportschool'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Veld label={type === 'trainer' ? 'Naam' : 'Naam sportschool'} verplicht>
          <input style={inputStijl} value={naam} onChange={(e) => setNaam(e.target.value)} />
        </Veld>
        <Veld label="E-mailadres" verplicht>
          <input type="email" style={inputStijl} value={email} onChange={(e) => setEmail(e.target.value)} />
        </Veld>
        <Veld label="Telefoonnummer">
          <input style={inputStijl} value={telefoon} onChange={(e) => setTelefoon(e.target.value)} />
        </Veld>
        <Veld label={type === 'trainer' ? 'Plaats / werkgebied' : 'Plaats / adres'}>
          <input style={inputStijl} value={plaats} onChange={(e) => setPlaats(e.target.value)} />
        </Veld>

        {vragen.map((v) => (
          <Veld key={v.sleutel} label={v.label} verplicht={v.verplicht}>
            {v.type === 'ja-nee' ? (
              <div style={{ display: 'flex', gap: 8 }}>
                {['Ja', 'Nee'].map((optie) => (
                  <button
                    key={optie}
                    onClick={() => zetAntwoord(v.sleutel, optie)}
                    style={{
                      fontFamily: 'inherit', fontWeight: 700, fontSize: 14, padding: '10px 20px', borderRadius: 999,
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

        {fout && <p style={{ color: '#B3261E', fontSize: 14 }}>{fout}</p>}

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

        <p style={{ fontSize: 12.5, color: '#8A7561', lineHeight: 1.6, marginTop: 4 }}>
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
      <label style={{ display: 'block', fontWeight: 700, fontSize: 14.5, marginBottom: 6 }}>
        {label}{verplicht && <span style={{ color: '#E85D00' }}> *</span>}
      </label>
      {children}
    </div>
  );
}
