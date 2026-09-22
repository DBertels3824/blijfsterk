'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const DOELEN_OPTIES = [
  'Makkelijker traplopen en opstaan',
  'Zelfstandig boodschappen kunnen dragen',
  'Sterker staan, minder snel vallen',
  'Fitter voelen in het dagelijks leven',
  "Actief blijven voor kleinkinderen of hobby's",
  'Herstellen na een periode van weinig bewegen',
];

const HUIDIGE_STAAT_OPTIES = [
  'Dagelijkse dingen gaan me makkelijk af',
  'Sommige dingen kosten wat meer moeite',
  'Ik merk duidelijk dat ik minder kracht heb dan vroeger',
  'Ik heb moeite met dingen als opstaan, tillen of traplopen',
];

const LOCATIE_OPTIES = ['Thuis', 'Sportschool', 'Buurt- of wijkcentrum', 'Buiten, in de buurt', 'Maakt me niet uit'];
const DAGEN_OPTIES = ['1', '2', '3', '4 of meer'];
const VOORKEUR_OPTIES = ['Alleen', '1-op-1 met trainer', 'Klein groepje'];
const ZEKERHEID_OPTIES = ['Nog onzeker', 'Wel zeker', 'Heel zeker'];
const EETPATROON_OPTIES = ['Gevarieerd en regelmatig', 'Wisselend, niet altijd bewust', 'Ik sla weleens een maaltijd over', 'Weet ik eigenlijk niet goed'];
const SUPPLEMENTEN_OPTIES = ['Nee', 'Af en toe', 'Ja, vaste supplementen', 'Weet niet precies wat ik gebruik'];
const EIWITTEN_OPTIES = ['Ja, daar let ik op', 'Waarschijnlijk niet genoeg', 'Weet ik niet'];
const ACTIVITEIT_OPTIES = [
  'Vooral zittend (bureau, veel lezen/tv)',
  'Af en toe in beweging (huishouden, boodschappen)',
  'Regelmatig actief (tuinieren, wandelen, fietsen)',
  'Erg actief (fysiek werk of veel beweging)',
];
const WERK_OPTIES = [
  'Werk, zittend beroep',
  'Werk, actief of staand beroep',
  'Gestopt met werken, geen vaste dagbesteding',
  'Gestopt met werken, wel vrijwilligerswerk of andere dagbesteding',
];
const SAMEN_OPTIES = ['Graag samen met partner, vriend(in) of buurtgenoot', 'Liever alleen', 'Weet ik nog niet'];
const RESULTAAT_OPTIES = [
  'Zelf de trap op zonder te hoeven pauzeren',
  'Een zware boodschappentas kunnen dragen',
  'Me sterker en zelfverzekerder voelen',
  'Weet ik nog niet, ik wil het gewoon proberen',
];
const ERVARING_OPTIES = ['Nooit gedaan', 'Lang geleden', 'Af en toe', 'Regelmatig'];

function Chip({ label, actief, onClick }: { label: string; actief: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontFamily: 'inherit',
        padding: '13px 18px',
        minHeight: 48,
        borderRadius: 999,
        border: actief ? '2px solid #E85D00' : '2px solid #F3E4C8',
        background: actief ? '#E85D00' : 'white',
        color: actief ? '#FFFFFF' : '#2B1B0E',
        fontWeight: 600,
        fontSize: 15,
        cursor: 'pointer',
        margin: '4px 8px 4px 0',
      }}
    >
      {label}
    </button>
  );
}

function ChipGroup({
  options,
  selected,
  onSelect,
  multi,
}: {
  options: string[];
  selected: string | string[];
  onSelect: (v: any) => void;
  multi?: boolean;
}) {
  function isActief(opt: string) {
    return multi ? (selected as string[]).includes(opt) : selected === opt;
  }
  function handleClick(opt: string) {
    if (multi) {
      const arr = selected as string[];
      if (arr.includes(opt)) onSelect(arr.filter((o) => o !== opt));
      else onSelect([...arr, opt]);
    } else {
      onSelect(opt);
    }
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 10 }}>
      {options.map((opt) => (
        <Chip key={opt} label={opt} actief={isActief(opt)} onClick={() => handleClick(opt)} />
      ))}
    </div>
  );
}

function Vraag({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 26 }}>
      <p style={{ fontWeight: 700, marginBottom: 0, fontSize: 16 }}>{label}</p>
      {children}
    </div>
  );
}

export default function IntakePage() {
  const router = useRouter();
  const [laden, setLaden] = useState(true);
  const [opslaan, setOpslaan] = useState(false);
  const [bestaandProfiel, setBestaandProfiel] = useState(false);

  const [woonplaats, setWoonplaats] = useState('');
  const [doelen, setDoelen] = useState<string[]>([]);
  const [huidigeStaat, setHuidigeStaat] = useState('');
  const [trainingslocatie, setTrainingslocatie] = useState<string[]>([]);
  const [dagenPerWeek, setDagenPerWeek] = useState('');
  const [voorkeur, setVoorkeur] = useState('');
  const [zekerheid, setZekerheid] = useState('');
  const [eetpatroon, setEetpatroon] = useState('');
  const [supplementen, setSupplementen] = useState('');
  const [eiwitten, setEiwitten] = useState('');
  const [dagelijkseActiviteit, setDagelijkseActiviteit] = useState('');
  const [werksituatie, setWerksituatie] = useState('');
  const [samenOfAlleen, setSamenOfAlleen] = useState('');
  const [gewenstResultaat, setGewenstResultaat] = useState('');
  const [ervaring, setErvaring] = useState('');

  const [risicoHart, setRisicoHart] = useState(false);
  const [risicoDuizeligheid, setRisicoDuizeligheid] = useState(false);
  const [risicoBotGewricht, setRisicoBotGewricht] = useState(false);
  const [risicoMedicatie, setRisicoMedicatie] = useState(false);
  const [risicoZwangerschap, setRisicoZwangerschap] = useState(false);

  const risicoGesignaleerd =
    risicoHart || risicoDuizeligheid || risicoBotGewricht || risicoMedicatie || risicoZwangerschap;

  useEffect(() => {
    const laadProfiel = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profielData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profielData) {
        setBestaandProfiel(true);
        setWoonplaats(profielData.woonplaats || '');
        setDoelen(profielData.doelen || []);
        setHuidigeStaat(profielData.huidige_staat || '');
        setTrainingslocatie(profielData.trainingslocatie || []);
        setDagenPerWeek(profielData.dagen_per_week || '');
        setVoorkeur(profielData.voorkeur || '');
        setZekerheid(profielData.zekerheid || '');
        setEetpatroon(profielData.eetpatroon || '');
        setSupplementen(profielData.supplementen || '');
        setEiwitten(profielData.eiwitten || '');
        setDagelijkseActiviteit(profielData.dagelijkse_activiteit || '');
        setWerksituatie(profielData.werksituatie || '');
        setSamenOfAlleen(profielData.samen_of_alleen || '');
        setGewenstResultaat(profielData.gewenst_resultaat || '');
        setErvaring(profielData.ervaring || '');
        setRisicoHart(!!profielData.risico_hart);
        setRisicoDuizeligheid(!!profielData.risico_duizeligheid);
        setRisicoBotGewricht(!!profielData.risico_bot_gewricht);
        setRisicoMedicatie(!!profielData.risico_medicatie);
        setRisicoZwangerschap(!!profielData.risico_zwangerschap);
      }

      setLaden(false);
    };
    laadProfiel();
  }, [router]);

  async function opslaanIntake() {
    setOpslaan(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setOpslaan(false);
      return;
    }

    await supabase.from('profiles').upsert({
      id: user.id,
      woonplaats,
      doel: doelen.join(', '),
      doelen,
      huidige_staat: huidigeStaat,
      trainingslocatie,
      dagen_per_week: dagenPerWeek,
      voorkeur,
      zekerheid,
      eetpatroon,
      supplementen,
      eiwitten,
      dagelijkse_activiteit: dagelijkseActiviteit,
      werksituatie,
      samen_of_alleen: samenOfAlleen,
      gewenst_resultaat: gewenstResultaat,
      ervaring,
      risico_hart: risicoHart,
      risico_duizeligheid: risicoDuizeligheid,
      risico_bot_gewricht: risicoBotGewricht,
      risico_medicatie: risicoMedicatie,
      risico_zwangerschap: risicoZwangerschap,
    });

    setOpslaan(false);
    // Nieuwe gebruiker: naar het dashboard, waar Dirk even opent om welkom te heten.
    router.push(bestaandProfiel ? '/dashboard' : '/dashboard?coach=1');
  }

  // "Later invullen": maakt alleen een leeg profiel aan, zodat het dashboard weet dat
  // deze gebruiker de intake al gezien heeft en er niet steeds naar terugstuurt.
  async function laterInvullen() {
    if (opslaan) return;
    setOpslaan(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').upsert({ id: user.id });
    }
    setOpslaan(false);
    router.push('/dashboard?coach=1');
  }

  if (laden) return <p style={{ padding: 24 }}>Laden...</p>;

  return (
    <div style={{ padding: '32px 20px 60px', maxWidth: 640, margin: '0 auto' }}>
      {bestaandProfiel && (
        <Link href="/dashboard" style={{ fontSize: 13.5, fontWeight: 700, color: '#E85D00', textDecoration: 'none' }}>
          ← Terug naar dashboard
        </Link>
      )}
      <h1 style={{ fontSize: 26, marginTop: bestaandProfiel ? 10 : 0 }}>{bestaandProfiel ? 'Mijn gegevens' : 'Vertel iets over jezelf'}</h1>
      <p style={{ color: '#8A7561', fontSize: 15.5, lineHeight: 1.6 }}>
        {bestaandProfiel
          ? 'Werk je gegevens bij wanneer er iets verandert. Dirk gebruikt dit voor advies dat bij jou past.'
          : 'Deze vragen helpen Dirk, je virtuele coach, om advies te geven dat bij jou past. Geen quiz — tik gewoon aan wat past. Je kunt het ook later doen.'}
      </p>

      {!bestaandProfiel && (
        <button
          type="button"
          onClick={laterInvullen}
          disabled={opslaan}
          style={{
            fontFamily: 'inherit', fontWeight: 700, fontSize: 15, minHeight: 48, padding: '0 20px',
            borderRadius: 999, border: '2px solid #F3E4C8', background: '#FFFFFF', color: '#E85D00',
            cursor: opslaan ? 'default' : 'pointer', marginTop: 4,
          }}
        >
          Liever later invullen → naar mijn dashboard
        </button>
      )}

      <Vraag label="In welke plaats woon je ongeveer?">
        <input
          type="text"
          value={woonplaats}
          onChange={(e) => setWoonplaats(e.target.value)}
          placeholder="bijv. Utrecht"
          style={{
            fontFamily: 'inherit',
            marginTop: 10,
            padding: '0 16px',
            minHeight: 52,
            borderRadius: 14,
            border: '2px solid #F3E4C8',
            fontSize: 16,
            width: '100%',
            maxWidth: 320,
            boxSizing: 'border-box',
          }}
        />
      </Vraag>

      <h2 style={{ marginTop: 40, fontSize: 20 }}>Doelen &amp; training</h2>

      <Vraag label="Wat wil je bereiken? (meerdere mogelijk)">
        <ChipGroup options={DOELEN_OPTIES} selected={doelen} onSelect={setDoelen} multi />
      </Vraag>

      <Vraag label="Hoe ervaar je jezelf op dit moment?">
        <ChipGroup options={HUIDIGE_STAAT_OPTIES} selected={huidigeStaat} onSelect={setHuidigeStaat} />
      </Vraag>

      <Vraag label="Waar zou je willen trainen? (meerdere mogelijk)">
        <ChipGroup options={LOCATIE_OPTIES} selected={trainingslocatie} onSelect={setTrainingslocatie} multi />
      </Vraag>

      <Vraag label="Hoeveel dagen per week kun je vrijmaken?">
        <ChipGroup options={DAGEN_OPTIES} selected={dagenPerWeek} onSelect={setDagenPerWeek} />
      </Vraag>

      <Vraag label="Train je liever alleen, 1-op-1, of in een groepje?">
        <ChipGroup options={VOORKEUR_OPTIES} selected={voorkeur} onSelect={setVoorkeur} />
      </Vraag>

      <Vraag label="Zou je dit liever samen met iemand doen?">
        <ChipGroup options={SAMEN_OPTIES} selected={samenOfAlleen} onSelect={setSamenOfAlleen} />
      </Vraag>

      <Vraag label="Hoe zeker voel je je om te beginnen?">
        <ChipGroup options={ZEKERHEID_OPTIES} selected={zekerheid} onSelect={setZekerheid} />
      </Vraag>

      <Vraag label="Wat zou voor jou een mooi resultaat zijn, over een paar maanden?">
        <ChipGroup options={RESULTAAT_OPTIES} selected={gewenstResultaat} onSelect={setGewenstResultaat} />
      </Vraag>

      <Vraag label="Ervaring met krachttraining">
        <ChipGroup options={ERVARING_OPTIES} selected={ervaring} onSelect={setErvaring} />
      </Vraag>

      <h2 style={{ marginTop: 44, fontSize: 20 }}>Dagelijks leven</h2>

      <Vraag label="Hoe actief ben je overdag, los van trainen?">
        <ChipGroup options={ACTIVITEIT_OPTIES} selected={dagelijkseActiviteit} onSelect={setDagelijkseActiviteit} />
      </Vraag>

      <Vraag label="Wat is je situatie qua werk?">
        <ChipGroup options={WERK_OPTIES} selected={werksituatie} onSelect={setWerksituatie} />
      </Vraag>

      <h2 style={{ marginTop: 44, fontSize: 20 }}>Voeding</h2>

      <Vraag label="Hoe zou je je eetpatroon omschrijven?">
        <ChipGroup options={EETPATROON_OPTIES} selected={eetpatroon} onSelect={setEetpatroon} />
      </Vraag>

      <Vraag label="Gebruik je supplementen?">
        <ChipGroup options={SUPPLEMENTEN_OPTIES} selected={supplementen} onSelect={setSupplementen} />
      </Vraag>

      <Vraag label="Krijg je denk je genoeg eiwitten binnen?">
        <ChipGroup options={EIWITTEN_OPTIES} selected={eiwitten} onSelect={setEiwitten} />
      </Vraag>

      <h2 style={{ marginTop: 44, fontSize: 20 }}>Veiligheid</h2>
      <p style={{ color: '#8A7561', fontSize: 15 }}>Vink aan wat op jou van toepassing is.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', fontSize: 15.5 }}>
          <input type="checkbox" checked={risicoHart} onChange={(e) => setRisicoHart(e.target.checked)} style={{ width: 20, height: 20 }} /> Hartklachten
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', fontSize: 15.5 }}>
          <input type="checkbox" checked={risicoDuizeligheid} onChange={(e) => setRisicoDuizeligheid(e.target.checked)} style={{ width: 20, height: 20 }} /> Duizeligheid
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', fontSize: 15.5 }}>
          <input type="checkbox" checked={risicoBotGewricht} onChange={(e) => setRisicoBotGewricht(e.target.checked)} style={{ width: 20, height: 20 }} /> Bot- of gewrichtsklachten
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', fontSize: 15.5 }}>
          <input type="checkbox" checked={risicoMedicatie} onChange={(e) => setRisicoMedicatie(e.target.checked)} style={{ width: 20, height: 20 }} /> Medicatiegebruik dat van invloed kan zijn
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', fontSize: 15.5 }}>
          <input type="checkbox" checked={risicoZwangerschap} onChange={(e) => setRisicoZwangerschap(e.target.checked)} style={{ width: 20, height: 20 }} /> Zwangerschap
        </label>
      </div>

      {risicoGesignaleerd && (
        <p style={{ color: '#B3261E', marginTop: 14, fontSize: 14.5, fontWeight: 600 }}>
          Overleg bij twijfel eerst met je huisarts of fysiotherapeut voordat je begint.
        </p>
      )}

      <button
        onClick={opslaanIntake}
        disabled={opslaan}
        style={{
          fontFamily: 'inherit',
          marginTop: 36,
          marginBottom: 40,
          padding: '0 32px',
          minHeight: 56,
          fontSize: 17,
          fontWeight: 700,
          borderRadius: 999,
          background: 'linear-gradient(135deg,#FFBE0A,#FF8601)',
          color: '#3A1E00',
          border: 'none',
          cursor: opslaan ? 'default' : 'pointer',
          opacity: opslaan ? 0.7 : 1,
        }}
      >
        {opslaan ? 'Opslaan...' : bestaandProfiel ? 'Profiel opslaan' : 'Opslaan en verder'}
      </button>
    </div>
  );
}
