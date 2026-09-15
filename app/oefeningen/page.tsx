'use client';

import { useState } from 'react';
import { OEFENINGEN, CATEGORIEEN, BENODIGDHEDEN, type Oefening } from '@/lib/oefeningen';

const card: React.CSSProperties = {
  borderRadius: 24,
  border: '2px solid #F3E4C8',
  background: '#FFFFFF',
  padding: 20,
};

export default function OefeningenPagina() {
  const [filter, setFilter] = useState<(typeof BENODIGDHEDEN)[number]>('Alles');

  const zichtbaar: Oefening[] = OEFENINGEN.filter(
    (o) => filter === 'Alles' || o.benodigdheden.includes(filter)
  );

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 20px 60px' }}>
      <h1 style={{ fontSize: 26, margin: '0 0 6px' }}>Oefeningenbibliotheek</h1>
      <p style={{ color: '#8A7561', margin: '0 0 16px' }}>
        Rustige basisoefeningen om thuis te doen — met je weerstandsband, fitnessmatje, of gewoon een flesje water
        als vervanger voor gewichten.
      </p>

      <div style={{ fontSize: 13, color: '#8A7561', lineHeight: 1.6, background: '#FFF8EE', borderRadius: 14, padding: '12px 16px', marginBottom: 22 }}>
        Stop meteen bij pijn, duizeligheid of kortademigheid. Twijfel je of een oefening geschikt is voor jou? Overleg
        eerst met je huisarts of fysiotherapeut. Deze bibliotheek is een eerste, voorzichtige versie en nog niet
        beoordeeld door een fysiotherapeut of sportarts.
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {BENODIGDHEDEN.map((b) => (
          <button
            key={b}
            onClick={() => setFilter(b)}
            style={{
              fontFamily: 'inherit', fontWeight: 700, fontSize: 13, padding: '8px 16px', borderRadius: 999,
              border: filter === b ? 'none' : '2px solid #F3E4C8', cursor: 'pointer',
              background: filter === b ? 'linear-gradient(135deg,#FFBE0A,#FF8601)' : '#FFFFFF',
              color: filter === b ? '#3A1E00' : '#5A4636',
            }}
          >
            {b}
          </button>
        ))}
      </div>

      {CATEGORIEEN.map((categorie) => {
        const inCategorie = zichtbaar.filter((o) => o.categorie === categorie);
        if (inCategorie.length === 0) return null;
        return (
          <div key={categorie} style={{ marginBottom: 28 }}>
            <p style={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#8A7561', marginBottom: 12 }}>
              {categorie}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {inCategorie.map((oefening) => (
                <OefeningKaart key={oefening.id} oefening={oefening} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OefeningKaart({ oefening }: { oefening: Oefening }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>{oefening.naam}</div>
          <p style={{ color: '#8A7561', fontSize: 14, margin: '4px 0 0' }}>{oefening.uitleg}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
        {oefening.benodigdheden.map((b) => (
          <span
            key={b}
            style={{ fontSize: 12, fontWeight: 700, color: '#B9601A', background: '#FFF1DC', borderRadius: 999, padding: '4px 10px' }}
          >
            {b}
          </span>
        ))}
      </div>

      <button
        onClick={() => setOpen((v) => !v)}
        style={{ marginTop: 14, fontSize: 13.5, background: 'none', border: 'none', color: '#E85D00', cursor: 'pointer', padding: 0, fontWeight: 700 }}
      >
        {open ? 'Verberg uitleg' : 'Bekijk stappen'}
      </button>

      {open && (
        <div style={{ marginTop: 14 }}>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14.5, lineHeight: 1.7, color: '#2B1B0E' }}>
            {oefening.stappen.map((stap, i) => (
              <li key={i}>{stap}</li>
            ))}
          </ol>
          <p style={{ fontSize: 13.5, fontWeight: 700, marginTop: 12, marginBottom: 0 }}>{oefening.setsHerhalingen}</p>
          <p style={{ fontSize: 13, color: '#8A7561', marginTop: 6, marginBottom: 0 }}>{oefening.veiligheid}</p>
        </div>
      )}
    </div>
  );
}
