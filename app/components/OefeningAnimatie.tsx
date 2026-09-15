'use client';

import type { Pose, Punt } from '@/lib/oefening-poses';

const HUID = '#FFD9A8';
const ROMP = '#FF8601';
const OMLIJNING = '#B9601A';

function lijn(a: Punt, b: Punt) {
  return { x1: a[0], y1: a[1], x2: b[0], y2: b[1] };
}

function midden(a: Punt, b: Punt): Punt {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

// Gevuld poppetje met een "shirt" (romp), huidskleurige armen/benen/hoofd en een
// eenvoudig gezichtje — leest sneller als een persoon dan een dun lijnenpoppetje,
// ook op klein formaat.
function Poppetje({ pose }: { pose: Pose }) {
  const schouderMidden = midden(pose.schouderL, pose.schouderR);
  const ledematen = [
    lijn(pose.schouderL, pose.elleboogL),
    lijn(pose.elleboogL, pose.handL),
    lijn(pose.schouderR, pose.elleboogR),
    lijn(pose.elleboogR, pose.handR),
    lijn(pose.heup, pose.knieL),
    lijn(pose.knieL, pose.voetL),
    lijn(pose.heup, pose.knieR),
    lijn(pose.knieR, pose.voetR),
  ];
  const uiteinden: Punt[] = [pose.handL, pose.handR, pose.voetL, pose.voetR];

  return (
    <g>
      {/* romp ("shirt") */}
      <line {...lijn(schouderMidden, pose.heup)} stroke={OMLIJNING} strokeWidth={28} strokeLinecap="round" />
      <line {...lijn(schouderMidden, pose.heup)} stroke={ROMP} strokeWidth={22} strokeLinecap="round" />

      {/* armen en benen */}
      {ledematen.map((l, i) => (
        <line key={`rand-${i}`} {...l} stroke={OMLIJNING} strokeWidth={12} strokeLinecap="round" />
      ))}
      {ledematen.map((l, i) => (
        <line key={`vulling-${i}`} {...l} stroke={HUID} strokeWidth={7.5} strokeLinecap="round" />
      ))}

      {/* handen/voeten */}
      {uiteinden.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={5.5} fill={HUID} stroke={OMLIJNING} strokeWidth={2.5} />
      ))}

      {/* hoofd met eenvoudig gezichtje */}
      <circle cx={pose.hoofd[0]} cy={pose.hoofd[1]} r={13} fill={HUID} stroke={OMLIJNING} strokeWidth={4} />
      <circle cx={pose.hoofd[0] - 4} cy={pose.hoofd[1] - 1} r={1.4} fill={OMLIJNING} />
      <circle cx={pose.hoofd[0] + 4} cy={pose.hoofd[1] - 1} r={1.4} fill={OMLIJNING} />
      <path
        d={`M ${pose.hoofd[0] - 4} ${pose.hoofd[1] + 5} Q ${pose.hoofd[0]} ${pose.hoofd[1] + 8} ${pose.hoofd[0] + 4} ${pose.hoofd[1] + 5}`}
        stroke={OMLIJNING}
        strokeWidth={1.6}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}

function BewegingsBadge() {
  return (
    <div
      style={{
        position: 'absolute', top: -6, right: -6, width: 26, height: 26, borderRadius: 999,
        background: '#E85D00', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(43,27,14,0.25)', animation: 'bs-badge-puls 2s ease-in-out infinite',
      }}
      aria-hidden="true"
    >
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
        <path d="M12 3v18M7 8l5-5 5 5M7 16l5 5 5-5" stroke="#FFF8EE" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// Eén grote, duidelijke illustratie van de belangrijkste stand van de oefening, in een
// eigen kader — bedoeld om in één oogopslag helder te zijn. Een klein pijl-bolletje
// laat zien dat het om een beweging gaat (in plaats van twee kleine, vervagende
// poppetjes naast elkaar — dat bleek niet duidelijk genoeg).
// Bewust GEEN AI-gegenereerde foto/video — zie lib/oefening-poses.ts.
export default function OefeningAnimatie({ start, eind, statisch }: { start: Pose; eind?: Pose; statisch?: boolean }) {
  const toonPose = statisch || !eind ? start : eind;
  const beweegt = !statisch && !!eind;

  return (
    <div
      style={{
        position: 'relative', width: 92, height: 92, flexShrink: 0, borderRadius: 18,
        background: '#FFF1DC', border: '2px solid #F3E4C8', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      <svg viewBox="0 0 120 120" width={86} height={86} style={{ display: 'block' }} aria-hidden="true">
        <g style={{ transformOrigin: '60px 60px', animation: 'bs-adem 2.6s ease-in-out infinite' }}>
          <Poppetje pose={toonPose} />
        </g>
      </svg>
      {beweegt && <BewegingsBadge />}
    </div>
  );
}
