// De campagne (vraag 187, stap 2b; ontwerp/scenario.md, 6): één land met hoofdstukken, die je op het titelscherm kiest
// (Campaign, js/menu.js; de regels in js/campagne.js). Het eiland staat hier één keer (Marcel, 24 okt: "Kies jij er
// voorlopig een"): eiland 5. Elk hoofdstuk noemt zijn level (T.LEVELS, levels/), zijn dorpsplek op dat eiland en zijn rand
// in stukken (stap 2a); de titel is een zin voor de speler (T.tGegevens; npm run teksten leest hem hier). Sinds c3 van vraag
// 170 komen de rovers uit een kamp, en in een level met een rand alleen uit een kamp binnen de rand: een hoofdstuk met een
// overval ligt dus bij een kamp (test/campagne.test.cjs kijkt het na).
//
// Gegevens, geen functie, zodat later de editor het blok terugschrijft (T.bronBlok, gereedschap/bronblok.js).
(function (T) {
  'use strict';

  T.CAMPAGNE = {
    eiland: { zaad: 5 },
    hoofdstukken: [
      // Hoofdstuk 1 (Marcel, 24 okt: "Op het campagne-eiland"): het demojaar, de aankomst en het eerste jaar. In Oakley,
      // 1295 tegels van het kasteel, met een kamp op 210 tegels, dus een rand van 7 bij 7 (Marcel, 27 okt: "H1"; tot dan
      // Millcombe, 5 bij 5, maar daar ligt geen kamp binnen de rand, en kwam de overval van het demojaar niet).
      { id: 'aankomst', titel: 'The first year', level: 'demojaar', plek: 'Oakley', rand: { b: 7, h: 7 } },
      // Hoofdstuk 2 (werklijst K, 2c; Marcel, 27 okt: "A1, B1, C1, D2, E1"): het rovershol. In Oldland, 630 tegels van het
      // kasteel, met een kamp op 190 tegels, dus een rand van 7 bij 7.
      { id: 'hol', titel: "The robbers' den", level: 'rovershol', plek: 'Oldland', rand: { b: 7, h: 7 } },
    ],
  };
})(globalThis.Spel = globalThis.Spel || {});
