// Gegevens van de onderneming achter Blijf Sterk, zoals ze op de pagina's
// /voorwaarden en /privacy staan. Dirk vult dit zelf aan; lege velden worden
// op de pagina's niet getoond.
export const ONDERNEMING = {
  naam: 'Blijf Sterk',
  rechtsvorm: '', // bijv. 'eenmanszaak' of 'B.V.'
  kvk: '', // 8 cijfers
  adres: '', // straat + huisnummer, postcode + plaats
  email: 'info@blijfsterk.nl',
};

// Datum van de laatste versie van de voorwaarden en de privacyverklaring.
// Bij elke inhoudelijke wijziging aanpassen.
export const JURIDISCH_VERSIE = '13 oktober 2026';

// Zolang dit op true staat, tonen beide pagina's een melding dat de tekst een
// concept is dat nog door een jurist wordt nagekeken. Op false zetten na de
// beoordeling.
export const JURIDISCH_CONCEPT = true;

// Tarieven zoals ze in de voorwaarden genoemd worden. Eén plek, zodat de
// tekst en de betaalpagina niet uit elkaar lopen.
export const TARIEVEN = {
  matchvergoeding: 35,
  gratisMatchesFoundingPartner: 2,
  partnerabonnementPerMaand: 29,
};
