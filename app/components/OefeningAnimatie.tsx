'use client';

import type { Pose, Punt } from '@/lib/oefening-poses';

const OMLIJNING = '#B9601A';
const VULLING = '#FF8601';

function lijn(a: Punt, b: Punt) {
  return { x1: a[0], y1: a[1], x2: b[0], y2: b[1] };
}

// Gevuld, afgerond poppetje (dikke "capsule"-lijnen met een lichte buitenrand) —
// leesbaarder en vriendelijker dan een dun lijnenpoppetje, ook op klein formaat.
function Poppetje({ pose }: { pose: Pose }) {
  const ledematen = [
    lijn(pose.schouderL, pose.heup),
    lijn(pose.schouderR, pose.heup),
    lijn(pose.schouderL, pose.elleboogL),
    lijn(pose.elleboogL, pose.handL),
    lijn(pose.schouderR, pose.elleboogR),
    lijn(pose.elleboogR, pose.handR),
    lijn(pose.heup, pose.knieL),
    lijn(pose.knieL, pose.voetL),
    lijn(pose.heup, pose.knieR),
    lijn(pose.knieR, pose.voetR),
  ];

  return (
    <g>
      {ledematen.map((l, i) => (
        <line key={`rand-${i}`} {...l} stroke={OMLIJNING} strokeWidth={13} strokeLinecap="round" />
      ))}
      {ledematen.map((l, i) => (
        <line key={`vulling-${i}`} {...l} stroke={VULLING} strokeWidth={8} strokeLinecap="round" />
      ))}
      <circle cx={pose.hoofd[0]} cy={pose.hoofd[1]} r={11} fill="#FFF1DC" stroke={OMLIJNING} strokeWidth={4} />
    </g>
  );
}

function Pijl() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" style={{ flexShrink: 0, animation: 'bs-pijl 1.6s ease-in-out infinite' }} aria-hidden="true">
      <path d="M4 12h14M13 6l6 6-6 6" stroke="#E85D00" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function Paneel({ pose, cijfer }: { pose: Pose; cijfer: number }) {
  return (
    <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
      <svg viewBox="0 0 120 120" width={64} height={64} style={{ display: 'block' }} aria-hidden="true">
        <Poppetje pose={pose} />
      </svg>
      <span
        style={{
          position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 999,
          background: '#E85D00', color: '#FFF8EE', fontSize: 11, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {cijfer}
      </span>
    </div>
  );
}

// Toont de start- en eindhouding duidelijk naast elkaar (1 → 2), in plaats van over
// elkaar heen te laten overvloeien — dat bleek lastig te lezen. Bij een vasthoudhouding
// (zoals de plank) tonen we in plaats daarvan één stand met een zachte "adem"-puls.
// Bewust GEEN AI-gegenereerde bewegingsvideo of foto — zie lib/oefening-poses.ts.
export default function OefeningAnimatie({ start, eind, statisch }: { start: Pose; eind?: Pose; statisch?: boolean }) {
  if (statisch || !eind) {
    return (
      <svg
        viewBox="0 0 120 120"
        width={72}
        height={72}
        style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}
        aria-hidden="true"
      >
        <g style={{ transformOrigin: '60px 60px', animation: 'bs-adem 2.4s ease-in-out infinite' }}>
          <Poppetje pose={start} />
        </g>
      </svg>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
      <Paneel pose={start} cijfer={1} />
      <Pijl />
      <Paneel pose={eind} cijfer={2} />
    </div>
  );
}
