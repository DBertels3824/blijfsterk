// Korte motiverende zinnetjes die "Dirk" (de AI-coach) laat zien nadat iemand een
// oefening als gedaan heeft aangevinkt. Bewust vaste, korte zinnen (geen losse AI-aanroep
// per klik) — snel, voorspelbaar, en geen onnodige kosten voor iets simpels als dit.
export const MOTIVATIE_ZINNEN = [
  'Goed bezig! Dat is er weer één.',
  'Mooi, je bouwt aan een gewoonte.',
  'Elke oefening telt. Knap gedaan!',
  'Dit is precies hoe je sterk blijft.',
  'Goed volgehouden, ga zo door!',
  'Trots op je! Weer een stap gezet.',
  'Je lichaam bedankt je hiervoor.',
  'Fijn dat je het gedaan hebt. Consistentie wint.',
  'Zo bouw je aan je kracht, stap voor stap.',
  'Goed gedaan! Morgen weer een beetje sterker.',
];

export function willekeurigeMotivatie(): string {
  return MOTIVATIE_ZINNEN[Math.floor(Math.random() * MOTIVATIE_ZINNEN.length)];
}
