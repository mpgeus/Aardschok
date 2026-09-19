// Gesprekken. Een gesprek is een handvol knopen met tekst en keuzes. Een knoop mag ook een
// functie zijn, zodat Wim iets anders zegt als je de sleutel al hebt.
(function (T) {
  'use strict';

  const OPENING = [
    { tekst: 'Hoe kom ik naar boven?', naar: 'boven' },
    { tekst: 'Wat voor monsters?', naar: 'monsters' },
    { tekst: 'Tot ziens, Wim.', naar: null },
  ];

  T.DIALOOG_WIM = {
    start(S) {
      if (S.sleutelGebruikt) {
        return {
          tekst: 'Het trappenhuis is open. Ga maar, ik houd de hal wel schoon.',
          keuzes: [{ tekst: 'Tot ziens, Wim.', naar: null }],
        };
      }
      if (S.inventaris.has('sleutel')) {
        return {
          tekst: 'Je hebt de sleutel! Die zware deur hier in de hal, daarachter is het trappenhuis. Pas op voor het skelet.',
          keuzes: [
            { tekst: 'Wat weet je van dat skelet?', naar: 'monsters' },
            { tekst: 'Tot ziens, Wim.', naar: null },
          ],
        };
      }
      return {
        tekst: 'Ah, bezoek! Ik ben Wim, de conciërge. Sinds de meester boven verdwenen is, lopen hier monsters rond. En niemand die zijn voeten veegt.',
        keuzes: OPENING,
      };
    },
    meer: { tekst: 'Wat wil je nog weten?', keuzes: OPENING },
    boven: {
      tekst: 'Via het trappenhuis, achter die zware deur hier in de hal. Die zit op slot. De sleutel ligt in de voorraadkamer, als die slijmkruiper hem tenminste niet heeft opgegeten.',
      keuzes: [
        { tekst: 'En als ik gewond raak?', naar: 'fontein' },
        { tekst: 'Nog iets anders.', naar: 'meer' },
      ],
    },
    monsters: {
      tekst: 'Een slijmkruiper in de voorraadkamer. Traag, maar hij bijt. En bij de trap staat een skelet met een zwaard. Dat is mijn voorganger. Die veegde ook nooit zijn voeten.',
      keuzes: [{ tekst: 'Nog iets anders.', naar: 'meer' }],
    },
    fontein: {
      tekst: 'Drink van de fontein, daar bij de muur. Het water is betoverd en gratis. Dat laatste vind ik het belangrijkst.',
      keuzes: [{ tekst: 'Nog iets anders.', naar: 'meer' }],
    },
  };

  T.openDialoog = function (S, wie) {
    const boom = T.DIALOOG_WIM;
    S.modus = 'dialoog';
    S.held.pad = [];
    const toon = (id) => {
      if (id === null) {
        T.sluitDialoog(S);
        return;
      }
      const knoop = typeof boom[id] === 'function' ? boom[id](S) : boom[id];
      T.ui.toonDialoog(
        T.hoofdletter(wie.naam),
        knoop.tekst,
        knoop.keuzes.map((k) => ({ tekst: k.tekst, kies: () => toon(k.naar) })),
      );
    };
    toon('start');
  };

  T.sluitDialoog = function (S) {
    T.ui.sluitDialoog();
    if (S.modus === 'dialoog') S.modus = 'verkennen';
  };
})(globalThis.Toren = globalThis.Toren || {});
