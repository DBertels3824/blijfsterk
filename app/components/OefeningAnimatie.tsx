'use client';

import type { Pose, Punt } from '@/lib/oefening-poses';

function lijn(a: Punt, b: Punt) {
  return { x1: a[0], y1: a[1], x2: b[0], y2: b[1] };
}

function Poppetje({ pose }: { pose: Pose }) {
  const s = { stroke: '#E85D00', strokeWidth: 4, strokeLinecap: 'round' as const };
  return (
    <g>
      <line {...lijn(pose.schouderL, pose.heup)} {...s} />
      <line {...lijn(pose.schouderR, pose.heup)} {...s} />
      <line {...lijn(pose.schouderL, pose.elleboogL)} {...s} />
      <line {...lijn(pose.elleboogL, pose.handL)} {...s} />
      <line {...lijn(pose.schouderR, pose.elleboogR)} {...s} />
      <line {...lijn(pose.elleboogR, pose.handR)} {...s} />
      <line {...lijn(pose.heup, pose.knieL)} {...s} />
      <line {...lijn(pose.knieL, pose.voetL)} {...s} />
      <line {...lijn(pose.heup, pose.knieR)} {...s} />
      <line {...lijn(pose.knieR, pose.voetR)} {...s} />
      <circle cx={pose.hoofd[0]} cy={pose.hoofd[1]} r={9} fill="#FFF1DC" stroke="#E85D00" strokeWidth={4} />
    </g>
  );
}

// Eenvoudige schematische animatie: laat een start- en eindhouding rustig in elkaar
// overvloeien (of, bij een vasthoudhouding zoals de plank, een zachte "adem"-puls).
// Bewust GEEN AI-gegenereerde bewegingsvideo — zie lib/oefening-poses.ts.
export default function OefeningAnimatie({ start, eind, statisch }: { start: Pose; eind?: Pose; statisch?: boolean }) {
  const toonStatisch = statisch || !eind;

  return (
    <svg
      viewBox="0 0 120 120"
      width={96}
      height={96}
      style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}
      aria-hidden="true"
    >
      {toonStatisch ? (
        <g style={{ transformOrigin: '60px 60px', animation: 'bs-adem 2.4s ease-in-out infinite' }}>
          <Poppetje pose={start} />
        </g>
      ) : (
        <>
          <g style={{ animation: 'bs-pose-a 2.6s ease-in-out infinite' }}>
            <Poppetje pose={start} />
          </g>
          <g style={{ animation: 'bs-pose-b 2.6s ease-in-out infinite' }}>
            <Poppetje pose={eind} />
          </g>
        </>
      )}
    </svg>
  );
}
