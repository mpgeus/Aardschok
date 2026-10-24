// De campagne (vraag 187, stap 2b; ontwerp/scenario.md, 6): één land met hoofdstukken, die je op het titelscherm kiest
// (Campaign, js/menu.js; de regels in js/campagne.js). Het eiland staat hier één keer (Marcel, 24 okt: "Kies jij er
// voorlopig een"): eiland 5, waar Millcombe het verst van het kasteel ligt (1721 tegels), zodat het verhaal over het land
// naar de heer trekt. Elk hoofdstuk noemt zijn level (T.LEVELS, levels/), zijn dorpsplek op dat eiland en zijn rand in
// stukken (stap 2a); de titel is een zin voor de speler (T.tGegevens; npm run teksten leest hem hier).
//
// Gegevens, geen functie, zodat later de editor het blok terugschrijft (T.bronBlok, gereedschap/bronblok.js).
(function (T) {
  'use strict';

  T.CAMPAGNE = {
    eiland: { zaad: 5 },
    hoofdstukken: [
      // Hoofdstuk 1 (Marcel, 24 okt: "Op het campagne-eiland, 5×5"): het demojaar, de aankomst en het eerste jaar.
      { id: 'aankomst', titel: 'The first year', level: 'demojaar', plek: 'Millcombe', rand: { b: 5, h: 5 } },
    ],
  };
})(globalThis.Spel = globalThis.Spel || {});
