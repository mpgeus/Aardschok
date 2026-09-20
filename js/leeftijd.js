// De kern van De laatste klim: je leeftijd is je levensbalk. Elke spreuk kost tijd (een
// vuurschicht een heel jaar), elke klap die je krijgt een paar maanden, en op je honderdste is
// het voorbij. Er is geen genezen, alleen ouder worden. Hoe ouder, hoe zwakker je lijf (minder
// actiepunten) en hoe sterker je magie: je wordt machtiger naarmate de tijd opraakt.
//
// Leeftijd wordt geteld in hele maanden, nooit in kommagetallen: 84 jaar is 1008 maanden.
(function (T) {
  'use strict';

  T.STARTLEEFTIJD = 84 * 12;
  T.EINDLEEFTIJD = 100 * 12;

  const jaren = (maanden) => Math.floor(maanden / 12);
  T.jaren = jaren;

  // Het lijf wordt trager: 8 actiepunten, vanaf je negentigste 7, vanaf je vijfennegentigste 6.
  T.apVoorLeeftijd = (maanden) => {
    const j = jaren(maanden);
    return j >= 95 ? 6 : j >= 90 ? 7 : 8;
  };

  // De magie wordt sterker: +1 schade per vijf jaar boven de tachtig.
  T.magieBonus = (maanden) => Math.max(0, Math.floor((jaren(maanden) - 80) / 5));

  // Leeftijd opent de deur: de eerste kring van spreuken is open vanaf je 84e, de tweede vanaf
  // je 88e, de derde vanaf je 92e en de vierde vanaf je 96e. Wie jong blijft, blijft beperkt.
  // Dat een open kring open blijft als de fontein je jonger maakt, regelt T.verouder.
  T.KRING_JAREN = [84, 88, 92, 96];
  T.kringVoorLeeftijd = (maanden) => T.KRING_JAREN.filter((j) => jaren(maanden) >= j).length;

  // 1011 → '84 jaar en 3 maanden'
  T.leeftijdTekst = function (maanden) {
    const j = jaren(maanden);
    const m = maanden % 12;
    if (m === 0) return `${j} jaar`;
    return `${j} jaar en ${m} ${m === 1 ? 'maand' : 'maanden'}`;
  };

  // Hoe lang iets duurt, zoals je het zegt: 'een maand', '4 maanden', 'een jaar', '1 jaar en 2 maanden'.
  T.duurTekst = function (maanden) {
    if (maanden === 1) return 'een maand';
    if (maanden === 12) return 'een jaar';
    if (maanden < 12) return `${maanden} maanden`;
    return T.leeftijdTekst(maanden);
  };

  // Kort, voor boven het hoofd van de held: '+4 mnd', '+1 jaar', '−2 jaar'.
  T.duurKort = function (maanden) {
    const teken = maanden < 0 ? '−' : '+';
    const n = Math.abs(maanden);
    return n % 12 === 0 ? `${teken}${n / 12} jaar` : `${teken}${n} mnd`;
  };

  // Hoe snel de held loopt, in tegels per seconde: 2,5 op zijn 84e, 2,1 op zijn 92e en 1,8 op
  // zijn 99e, met rechte lijnen ertussen. Zo zie je hem langzamer worden, ook als er straks een
  // echte looppas onder zit. Hier telt de leeftijd wel in kommagetallen: het gaat om de
  // tussenstand, niet om de leeftijd zelf. Sluipen blijft de helft hiervan (anim.js).
  const LOOPSNELHEID = [[84, 2.5], [92, 2.1], [99, 1.8]];
  T.loopSnelheid = function (maanden) {
    const j = maanden / 12;
    for (let i = 1; i < LOOPSNELHEID.length; i++) {
      const [j0, s0] = LOOPSNELHEID[i - 1];
      const [j1, s1] = LOOPSNELHEID[i];
      if (j <= j0) return s0;
      if (j <= j1) return s0 + ((s1 - s0) * (j - j0)) / (j1 - j0);
    }
    return LOOPSNELHEID[LOOPSNELHEID.length - 1][1];
  };
})(globalThis.Toren = globalThis.Toren || {});
