export type Sponsor = {
  naam: string;
  logo: string; // pad naar het logo-bestand, bijv. "/sponsors/naam.png" (zet het bestand in de map public/sponsors/)
  url?: string; // optioneel: link naar de website van de sponsor
};

// Voeg hier sponsors toe zodra ze echt bevestigd zijn. Zolang deze lijst leeg is,
// laat de homepage geen banner zien (geen nep-logo's tonen).
// TIJDELIJK: het eigen Blijf Sterk-logo erin, alleen om te zien hoe de banner eruitziet.
// Haal deze regel weer weg (of vervang 'm door echte sponsors) voor de site echt live gaat.
export const SPONSORS: Sponsor[] = [
  { naam: "Blijf Sterk", logo: "/logo.png" },
];
