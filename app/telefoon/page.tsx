import Link from 'next/link';

const card: React.CSSProperties = {
  borderRadius: 24,
  border: '2px solid #F3E4C8',
  background: '#FFFFFF',
  padding: 20,
};

const stapNummer: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 999, flexShrink: 0,
  background: 'linear-gradient(135deg,#FFBE0A,#FF8601)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontWeight: 800, fontSize: 13.5, color: '#3A1E00',
};

function Stap({ nummer, children }: { nummer: number; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <div style={stapNummer}>{nummer}</div>
      <p style={{ margin: '3px 0 0', fontSize: 15, lineHeight: 1.6, color: '#2B1B0E' }}>{children}</p>
    </div>
  );
}

export default function TelefoonPagina() {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 20px 60px' }}>
      <Link href="/dashboard" style={{ fontSize: 13.5, fontWeight: 700, color: '#E85D00', textDecoration: 'none' }}>
        ← Terug naar dashboard
      </Link>

      <h1 style={{ fontSize: 26, margin: '10px 0 6px' }}>Zet Blijf Sterk op je telefoon</h1>
      <p style={{ color: '#8A7561', margin: '0 0 16px', lineHeight: 1.6 }}>
        Dan krijg je een icoontje op je scherm, net als een gewone app. Je hoeft dan niet meer de website op
        te zoeken — je tikt gewoon op het icoontje. Het kost niets en je hoeft niets te downloaden uit een
        appstore.
      </p>

      <div style={{ fontSize: 13, color: '#8A7561', lineHeight: 1.6, background: '#FFF8EE', borderRadius: 14, padding: '12px 16px', marginBottom: 24 }}>
        Volg de stappen hieronder voor jouw type telefoon. Het duurt maar een minuutje.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={card}>
          <p style={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#8A7561', marginBottom: 14 }}>
            iPhone (Safari)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Stap nummer={1}>Open Blijf Sterk in Safari (het kompas-icoontje).</Stap>
            <Stap nummer={2}>Tik onderin op het deelicoontje — het vierkantje met het pijltje omhoog.</Stap>
            <Stap nummer={3}>Scrol in het menu naar beneden en tik op "Zet op beginscherm".</Stap>
            <Stap nummer={4}>Tik rechtsboven op "Voeg toe". Klaar!</Stap>
          </div>
        </div>

        <div style={card}>
          <p style={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#8A7561', marginBottom: 14 }}>
            Android (Chrome)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Stap nummer={1}>Open Blijf Sterk in Chrome.</Stap>
            <Stap nummer={2}>Tik rechtsboven op de drie puntjes.</Stap>
            <Stap nummer={3}>Tik op "App installeren" of "Toevoegen aan startscherm".</Stap>
            <Stap nummer={4}>Tik op "Installeren". Klaar!</Stap>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 13, color: '#8A7561', marginTop: 20, lineHeight: 1.6 }}>
        Zie je op je{' '}
        <Link href="/dashboard" style={{ color: '#E85D00', fontWeight: 700 }}>dashboard</Link>{' '}
        het kaartje "Wil je een seintje als je een dag mist?" — zet dat ook aan. Dan sturen we je een
        herinnering als je een tijdje niet getraind hebt.
      </p>
    </div>
  );
}
