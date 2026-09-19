'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Bericht = {
  role: 'user' | 'assistant';
  content: string;
  agent?: string;
  naarOefeningen?: boolean;
};

// Zwevende chatknop, rechtsonder op elk scherm — de AI-coach ("Dirk") is zo overal
// bereikbaar, in plaats van een aparte "Advies"-pagina. Ondersteunt ook spraak:
// een microfoonknop om te praten in plaats van te typen, en het voorlezen van
// antwoorden (aan/uit te zetten).
export default function CoachWidget() {
  const [ingelogd, setIngelogd] = useState(false);
  const [open, setOpen] = useState(false);
  const [berichten, setBerichten] = useState<Bericht[]>([]);
  const [invoer, setInvoer] = useState('');
  const [laden, setLaden] = useState(false);
  const [versturen, setVersturen] = useState(false);
  const [luisteren, setLuisteren] = useState(false);
  const [geluidAan, setGeluidAan] = useState(false);
  const [spraakOndersteund, setSpraakOndersteund] = useState(false);

  const profielRef = useRef<any>(null);
  const eindeRef = useRef<HTMLDivElement>(null);
  const gestart = useRef(false);
  const herkenningRef = useRef<any>(null);
  const transcriptRef = useRef('');

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setIngelogd(!!data.user);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIngelogd(!!session?.user);
    });

    const SpraakHerkenning = typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    setSpraakOndersteund(!!SpraakHerkenning);

    try {
      const opgeslagen = typeof window !== 'undefined' ? localStorage.getItem('bs-coach-geluid') : null;
      if (opgeslagen !== null) setGeluidAan(opgeslagen === 'aan');
    } catch {
      // localStorage niet beschikbaar — gewoon met de standaardwaarde verder.
    }

    const openViaEvent = () => setOpen(true);
    window.addEventListener('blijfsterk:open-coach', openViaEvent);

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
      window.removeEventListener('blijfsterk:open-coach', openViaEvent);
    };
  }, []);

  useEffect(() => {
    if (!open || gestart.current) return;
    gestart.current = true;

    const start = async () => {
      setLaden(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profielData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const risicoGesignaleerd = !!(
        profielData?.risico_hart ||
        profielData?.risico_duizeligheid ||
        profielData?.risico_bot_gewricht ||
        profielData?.risico_medicatie ||
        profielData?.risico_zwangerschap
      );

      profielRef.current = { ...profielData, risicoGesignaleerd };

      await vraagCoach([]);
      setLaden(false);
    };
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    eindeRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [berichten]);

  function spreekUit(tekst: string) {
    try {
      if (!geluidAan || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(tekst);
      utter.lang = 'nl-NL';
      window.speechSynthesis.speak(utter);
    } catch {
      // Voorlezen mislukt — niet storend, de tekst staat toch al in de chat.
    }
  }

  const vraagCoach = async (nieuweBerichten: Bericht[]) => {
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profiel: profielRef.current, berichten: nieuweBerichten }),
      });
      if (!res.ok) throw new Error('coach-fout');
      const data = await res.json();
      if (!data.tekst) throw new Error('coach-leeg');
      setBerichten((huidig) => [
        ...huidig,
        { role: 'assistant', content: data.tekst, agent: data.agent, naarOefeningen: !!data.naarOefeningen },
      ]);
      spreekUit(data.tekst);
    } catch {
      setBerichten((huidig) => [
        ...huidig,
        { role: 'assistant', content: 'Sorry, er ging iets mis. Probeer het nog eens.' },
      ]);
    }
  };

  const versturenHandler = async (tekstOverride?: string) => {
    const tekst = (tekstOverride ?? invoer).trim();
    if (!tekst || versturen) return;
    const userBericht: Bericht = { role: 'user', content: tekst };
    const nieuweBerichten = [...berichten, userBericht];
    setBerichten(nieuweBerichten);
    setInvoer('');
    transcriptRef.current = '';
    setVersturen(true);
    await vraagCoach(nieuweBerichten);
    setVersturen(false);
  };

  function zetGeluidOm() {
    setGeluidAan((huidig) => {
      const nieuw = !huidig;
      try {
        localStorage.setItem('bs-coach-geluid', nieuw ? 'aan' : 'uit');
      } catch {
        // Niet erg als dit niet onthouden kan worden.
      }
      if (!nieuw && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return nieuw;
    });
  }

  function startLuisteren() {
    if (!spraakOndersteund || luisteren) return;
    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const herkenning = new Ctor();
    herkenning.lang = 'nl-NL';
    herkenning.interimResults = true;
    herkenning.continuous = false;

    herkenning.onresult = (event: any) => {
      let tekst = '';
      for (let i = 0; i < event.results.length; i++) {
        tekst += event.results[i][0].transcript;
      }
      transcriptRef.current = tekst;
      setInvoer(tekst);
    };
    herkenning.onerror = () => setLuisteren(false);
    herkenning.onend = () => {
      setLuisteren(false);
      if (transcriptRef.current.trim()) {
        versturenHandler(transcriptRef.current);
      }
    };

    herkenningRef.current = herkenning;
    transcriptRef.current = '';
    herkenning.start();
    setLuisteren(true);
  }

  function stopLuisteren() {
    herkenningRef.current?.stop();
  }

  if (!ingelogd) return null;

  return (
    <>
      {open && (
        <div
          style={{
            position: 'fixed', zIndex: 60,
            right: 16, bottom: 92,
            width: 'min(380px, calc(100vw - 32px))',
            height: 'min(600px, calc(100vh - 160px))',
            background: '#FFFFFF', borderRadius: 24, border: '2px solid #F3E4C8',
            boxShadow: '0 12px 40px rgba(43,27,14,0.18)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}
        >
          {/* header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid #F3E4C8', background: '#FFFFFF' }}>
            <div
              style={{
                width: 38, height: 38, borderRadius: 999, flexShrink: 0,
                background: 'linear-gradient(135deg,#FFBE0A,#FF8601)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, color: '#3A1E00',
              }}
            >
              D
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Dirk, jouw AI-coach</div>
              <div style={{ fontSize: 12.5, color: '#8A7561' }}>Training &amp; voeding</div>
            </div>
            <button
              onClick={zetGeluidOm}
              title={geluidAan ? 'Antwoorden niet meer voorlezen' : 'Antwoorden voorlezen'}
              style={{ width: 34, height: 34, borderRadius: 999, border: '2px solid #F3E4C8', background: geluidAan ? '#FFF8EE' : '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              {geluidAan ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="#E85D00" /><path d="M16.5 8.5a5 5 0 010 7" stroke="#E85D00" strokeWidth="2" strokeLinecap="round" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="#8A7561" /><path d="M15 9l5 6M20 9l-5 6" stroke="#8A7561" strokeWidth="2" strokeLinecap="round" /></svg>
              )}
            </button>
            <button
              onClick={() => setOpen(false)}
              title="Sluiten"
              style={{ width: 34, height: 34, borderRadius: 999, border: '2px solid #F3E4C8', background: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="#5A4636" strokeWidth="2.4" strokeLinecap="round" /></svg>
            </button>
          </div>

          {/* messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {laden && berichten.length === 0 && <p style={{ color: '#8A7561', fontSize: 16 }}>Even denken...</p>}

            {berichten.map((bericht, i) => (
              <div key={i} style={{ alignSelf: bericht.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '90%' }}>
                {bericht.role === 'assistant' && bericht.agent && (
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: '#E85D00', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '.04em' }}>
                    {bericht.agent}
                  </div>
                )}
                {bericht.role === 'assistant' ? (
                  <div style={{ background: '#FFF8EE', border: '1px solid #F3E4C8', borderRadius: '18px 18px 18px 5px', padding: '14px 16px' }}>
                    <p style={{ margin: 0, whiteSpace: 'pre-line', lineHeight: 1.6, fontSize: 16.5 }}>{bericht.content}</p>
                    {bericht.naarOefeningen && (
                      <Link
                        href="/oefeningen"
                        onClick={() => setOpen(false)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12,
                          fontFamily: 'inherit', fontWeight: 700, fontSize: 14, color: '#3A1E00',
                          background: 'linear-gradient(135deg,#FFBE0A,#FF8601)', borderRadius: 999,
                          padding: '9px 15px', textDecoration: 'none',
                        }}
                      >
                        Bekijk de oefeningenbibliotheek →
                      </Link>
                    )}
                  </div>
                ) : (
                  <div style={{ background: '#E85D00', color: '#FFFFFF', borderRadius: '18px 18px 5px 18px', padding: '12px 16px', fontWeight: 500, whiteSpace: 'pre-line', lineHeight: 1.6, fontSize: 16.5 }}>
                    {bericht.content}
                  </div>
                )}
              </div>
            ))}
            <div ref={eindeRef}></div>
          </div>

          {/* input */}
          <div style={{ padding: '10px 12px 12px', borderTop: '1px solid #F3E4C8', background: '#FFFFFF' }}>
            <p style={{ margin: '0 0 8px', fontSize: 12.5, color: '#8A7561', fontWeight: 600 }}>
              {luisteren ? 'Ik luister... spreek rustig je vraag in.' : 'Typ hieronder, of tik op de microfoon om te praten.'}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={invoer}
                onChange={(e) => setInvoer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && versturenHandler()}
                placeholder="Typ je vraag..."
                style={{
                  fontFamily: 'inherit', fontSize: 16.5, width: '100%', minHeight: 50,
                  borderRadius: 16, border: '2px solid #F3E4C8', background: '#FFF8EE',
                  padding: '0 16px', color: '#2B1B0E',
                }}
              />
              {spraakOndersteund && (
                <button
                  onClick={luisteren ? stopLuisteren : startLuisteren}
                  title={luisteren ? 'Stop met luisteren' : 'Spreek je vraag in'}
                  style={{
                    width: 50, height: 50, borderRadius: 16, border: 'none', flexShrink: 0,
                    background: luisteren ? '#E85D00' : '#FFF1DC',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    animation: luisteren ? 'bs-mic-puls 1.2s ease-in-out infinite' : 'none',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="9" y="3" width="6" height="11" rx="3" fill={luisteren ? '#FFFFFF' : '#E85D00'} />
                    <path d="M5 11a7 7 0 0014 0M12 18v3" stroke={luisteren ? '#FFFFFF' : '#E85D00'} strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => versturenHandler()}
                disabled={versturen}
                title="Verstuur"
                style={{
                  width: 50, height: 50, borderRadius: 16, border: 'none', flexShrink: 0,
                  background: 'linear-gradient(135deg,#FFBE0A,#FF8601)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: versturen ? 'default' : 'pointer', opacity: versturen ? 0.7 : 1,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 20l16-8L4 4v6l10 2-10 2v6z" fill="#3A1E00" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* zwevende knop */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Chat met je AI-coach"
        style={{
          position: 'fixed', zIndex: 60, right: 16, bottom: 20,
          height: 60, minWidth: open ? 60 : undefined, padding: open ? 0 : '0 22px 0 18px',
          borderRadius: 999, border: 'none',
          background: 'linear-gradient(135deg,#FFBE0A,#FF8601)',
          boxShadow: '0 8px 24px rgba(232,93,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 16, color: '#3A1E00',
        }}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="#3A1E00" strokeWidth="2.6" strokeLinecap="round" /></svg>
        ) : (
          <>
            <div
              style={{
                width: 34, height: 34, borderRadius: 999, flexShrink: 0,
                background: 'rgba(58,30,0,0.16)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 15, color: '#3A1E00',
              }}
            >
              D
            </div>
            Dirk, je virtuele coach
          </>
        )}
      </button>

      <style>{`
        @keyframes bs-mic-puls {
          0%, 100% { box-shadow: 0 0 0 0 rgba(232,93,0,0.35); }
          50% { box-shadow: 0 0 0 8px rgba(232,93,0,0); }
        }
      `}</style>
    </>
  );
}
