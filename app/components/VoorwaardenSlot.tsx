import { alinea, kop2, lijst, lijstItem } from '@/app/components/JuridischePagina';
import { ONDERNEMING } from '@/lib/juridisch';

// Slotbepalingen die in alle drie de voorwaarden hetzelfde zijn: teksten en
// logo, beschikbaarheid en wijzigingen, klachten en toepasselijk recht.
// Eén plek, zodat de drie documenten niet uit elkaar gaan lopen.
export const SLOT_HOOFDSTUKKEN = [
  { id: 'eigendom', titel: 'Teksten, video\u2019s en logo' },
  { id: 'beschikbaar', titel: 'Beschikbaarheid en wijzigingen' },
  { id: 'recht', titel: 'Klachten en toepasselijk recht' },
];

export default function VoorwaardenSlot({ start, partner }: { start: number; partner: boolean }) {
  return (
    <>
      <h2 id="eigendom" style={kop2}>{start}. Teksten, video&rsquo;s en logo</h2>
      <p style={alinea}>
        De teksten, oefenvideo&rsquo;s, afbeeldingen, het logo en de software van Blijf Sterk zijn van ons. Je mag ze
        gebruiken binnen het platform, voor jezelf. Je mag ze niet kopiëren, verspreiden of commercieel gebruiken
        zonder onze schriftelijke toestemming.
        {partner && ' Als partner mag je het logo van Blijf Sterk en de vermelding \u201CPartner van Blijf Sterk\u201D gebruiken om te laten zien dat je bij ons bent aangesloten, zolang de samenwerking loopt en op de manier die wij aangeven. Wij mogen jouw naam en logo tonen op het platform.'}
      </p>

      <h2 id="beschikbaar" style={kop2}>{start + 1}. Beschikbaarheid en wijzigingen</h2>
      <ul style={lijst}>
        <li style={lijstItem}>Het platform kan tijdelijk niet werken, bijvoorbeeld door onderhoud of een storing. We proberen dat kort te houden.</li>
        <li style={lijstItem}>We mogen het platform aanpassen, functies toevoegen of verwijderen, en in het uiterste geval stoppen. Grote veranderingen kondigen we aan.</li>
        <li style={lijstItem}>We mogen deze voorwaarden wijzigen. Bij een belangrijke wijziging laten we dat weten via de app of per e-mail, en geven we je de kans om op te zeggen voordat de wijziging ingaat. Gebruik je het platform daarna nog, dan ga je akkoord met de nieuwe versie.</li>
      </ul>

      <h2 id="recht" style={kop2}>{start + 2}. Klachten en toepasselijk recht</h2>
      <p style={alinea}>
        Heb je een klacht? Mail ons op {ONDERNEMING.email}. We reageren binnen veertien dagen en proberen het samen
        op te lossen. Komen we er niet uit, dan is Nederlands recht van toepassing en beslist de Nederlandse rechter.
      </p>
    </>
  );
}
