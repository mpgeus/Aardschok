// De kern van De laatste klim: je leeftijd is je levensbalk. Elke spreuk kost een jaar, elke
// klap die je krijgt een paar maanden, en op je honderdste is het voorbij. Er is geen genezen,
// alleen ouder worden. Hoe ouder, hoe zwakker je lijf (minder actiepunten) en hoe sterker je
// magie: je wordt machtiger naarmate de tijd opraakt.
//
// Leeftijd wordt geteld in hele maanden, nooit in kommagetallen: 84 jaar is 1008 maanden.
(function (T) {
  'use strict';

  T.STARTLEEFTIJD = 84 * 12;
  T.EINDLEEFTIJD = 100 * 12;
  T.SPREUK_MAANDEN = 12;

  const jaren = (maanden) => Math.floor(maanden / 12);
  T.jaren = jaren;

  // Het lijf wordt trager: 8 actiepunten, vanaf je negentigste 7, vanaf je vijfennegentigste 6.
  T.apVoorLeeftijd = (maanden) => {
    const j = jaren(maanden);
    return j >= 95 ? 6 : j >= 90 ? 7 : 8;
  };

  // De magie wordt sterker: +1 schade per vijf jaar boven de tachtig.
  T.magieBonus = (maanden) => Math.max(0, Math.floor((jaren(maanden) - 80) / 5));

  // 1011 → '84 jaar en 3 maanden'
  T.leeftijdTekst = function (maanden) {
    const j = jaren(maanden);
    const m = maanden % 12;
    if (m === 0) return `${j} jaar`;
    return `${j} jaar en ${m} ${m === 1 ? 'maand' : 'maanden'}`;
  };

  // Hoe lang iets duurt, zoals je het zegt: '4 maanden', 'een jaar', '1 jaar en 2 maanden'.
  T.duurTekst = function (maanden) {
    if (maanden === 12) return 'een jaar';
    if (maanden < 12) return `${maanden} ${maanden === 1 ? 'maand' : 'maanden'}`;
    return T.leeftijdTekst(maanden);
  };

  // Kort, voor boven het hoofd van de held: '+4 mnd', '+1 jaar', '−2 jaar'.
  T.duurKort = function (maanden) {
    const teken = maanden < 0 ? '−' : '+';
    const n = Math.abs(maanden);
    return n % 12 === 0 ? `${teken}${n / 12} jaar` : `${teken}${n} mnd`;
  };
})(globalThis.Toren = globalThis.Toren || {});
