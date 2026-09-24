// Kleine koppeling met Mollie (betalingen via iDEAL). Alleen server-side gebruiken:
// de sleutel MOLLIE_API_KEY staat in Vercel en mag nooit naar de browser.
//
// Test-sleutels beginnen met "test_": dan gaat er geen echt geld om, Mollie laat een
// testscherm zien waar je zelf "betaald" of "mislukt" kiest. Live-sleutels beginnen
// met "live_".

const MOLLIE_API = 'https://api.mollie.com/v2';

export type MollieStatus = 'open' | 'pending' | 'authorized' | 'paid' | 'canceled' | 'expired' | 'failed';

export type MolliePayment = {
  id: string;
  status: MollieStatus;
  amount: { value: string; currency: string };
  description: string;
  metadata?: Record<string, string> | null;
  paidAt?: string;
  _links?: { checkout?: { href: string } };
};

function apiKey(): string {
  const key = process.env.MOLLIE_API_KEY;
  if (!key) throw new Error('MOLLIE_API_KEY ontbreekt (zet die bij de omgevingsvariabelen in Vercel).');
  return key;
}

export function isMollieIngesteld(): boolean {
  return !!process.env.MOLLIE_API_KEY;
}

export function centNaarMollie(bedragCent: number): string {
  return (bedragCent / 100).toFixed(2);
}

export async function maakBetaling(invoer: {
  bedragCent: number;
  omschrijving: string;
  redirectUrl: string;
  webhookUrl: string;
  metadata: Record<string, string>;
}): Promise<MolliePayment> {
  const res = await fetch(`${MOLLIE_API}/payments`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: { currency: 'EUR', value: centNaarMollie(invoer.bedragCent) },
      description: invoer.omschrijving,
      redirectUrl: invoer.redirectUrl,
      webhookUrl: invoer.webhookUrl,
      metadata: invoer.metadata,
      locale: 'nl_NL',
    }),
  });
  if (!res.ok) {
    const tekst = await res.text();
    throw new Error(`Mollie gaf code ${res.status}: ${tekst.slice(0, 300)}`);
  }
  return res.json();
}

export async function haalBetaling(mollieId: string): Promise<MolliePayment> {
  const res = await fetch(`${MOLLIE_API}/payments/${encodeURIComponent(mollieId)}`, {
    headers: { Authorization: `Bearer ${apiKey()}` },
  });
  if (!res.ok) throw new Error(`Mollie gaf code ${res.status}`);
  return res.json();
}

// Vertaalt de Mollie-status naar onze eigen, Nederlandse statussen in de tabel betalingen.
export function naarOnzeStatus(status: MollieStatus): string {
  switch (status) {
    case 'paid':
      return 'betaald';
    case 'canceled':
      return 'geannuleerd';
    case 'expired':
      return 'verlopen';
    case 'failed':
      return 'mislukt';
    default:
      return 'wacht_op_betaling';
  }
}
