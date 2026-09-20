// Gesprekken. Een gesprek is een handvol knopen met tekst en keuzes. Een knoop mag ook een
// functie zijn, zodat Wim iets anders zegt als je de sleutel al hebt.
//
// Wim was de leerling van de meester. Toen de meester veertig jaar geleden vertrok, bleef hij,
// en veegde elke dag de trap, voor als de meester ooit terug zou komen. Vannacht schudde de
// aarde, en wat boven opgesloten zat, kwam naar beneden.
(function (T) {
  'use strict';

  const VRAGEN = [
    { tekst: 'Wat is er vannacht gebeurd?', naar: 'aardschok' },
    { tekst: 'Waar is de sleutel van het trappenhuis?', naar: 'sleutel' },
    { tekst: 'Werkt de fontein nog?', naar: 'fontein' },
    { tekst: 'Ik ga naar boven, Wim.', naar: null },
  ];

  T.DIALOOG_WIM = {
    start(S) {
      if (S.sleutelGebruikt) {
        return {
          tekst: 'Ga maar, meester. Ik veeg de trap nog één keer, voor het geval dat.',
          keuzes: [{ tekst: 'Dank je, Wim.', naar: null }],
        };
      }
      if (S.inventaris.has('sleutel')) {
        return {
          tekst: 'U hebt de sleutel. Wees voorzichtig daarboven, meester. Ik heb veertig jaar gewacht; ik wil nog even niet om u rouwen.',
          keuzes: [
            { tekst: 'Wat staat er bij de trap?', naar: 'monsters' },
            { tekst: 'Ik ga, Wim.', naar: null },
          ],
        };
      }
      return {
        tekst: 'Meester? Meester! U leeft nog. Veertig jaar heb ik de trap geveegd, voor als u ooit terug zou komen. En nu, uitgerekend nu, na die aardschok van vannacht...',
        keuzes: VRAGEN,
      };
    },
    meer: { tekst: 'Wat wilt u nog weten, meester?', keuzes: VRAGEN },
    aardschok: {
      tekst: 'Het hele huis schudde. Boven kraakte iets, heel lang, en toen kwam er gespuis de trap af. U weet wel wat u daar hebt opgesloten. Ik niet. Dat hebt u me nooit verteld.',
      keuzes: [
        { tekst: 'Wat voor gespuis?', naar: 'monsters' },
        { tekst: 'Nog iets anders.', naar: 'meer' },
      ],
    },
    monsters: {
      tekst: 'Een slijmkruiper, in de voorraadkamer. En bij de trap staat iets met een zwaard. Het staat daar maar, alsof het op iemand wacht. Ik heb de deur op slot gedaan.',
      keuzes: [{ tekst: 'Nog iets anders.', naar: 'meer' }],
    },
    sleutel: {
      tekst: 'In de voorraadkamer. Ik liet hem vallen toen ik wegrende. Ik ben ook niet meer de jongste, meester. Maar dat bent u al helemaal niet meer.',
      keuzes: [{ tekst: 'Nog iets anders.', naar: 'meer' }],
    },
    fontein: {
      tekst: 'Er zit nog één slok in. Eén. Hij maakt u een paar jaar jonger, maar daarna staat hij droog. Bewaar hem voor als het echt moet.',
      keuzes: [{ tekst: 'Nog iets anders.', naar: 'meer' }],
    },
  };

  T.openDialoog = function (S, wie) {
    const boom = T.DIALOOG_WIM;
    S.modus = 'dialoog';
    S.held.pad = [];
    // Met wie je praat, staat stil en blijft zichtbaar: hij komt door een boom of de toren heen
    // (js/tekenen.js, doorkijk) en hij dwaalt niet weg midden in het gesprek.
    S.spreektMet = wie || null;
    if (wie) wie.pad = [];
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
    S.spreektMet = null;
    if (S.modus === 'dialoog') S.modus = 'verkennen';
  };
})(globalThis.Toren = globalThis.Toren || {});
