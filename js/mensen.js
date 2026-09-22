// De mensen van het dorp: wie ze zijn, op één plek.
//
// Waarom dit bestaat (Marcel, 22 sep 2026): "Hoe houden we alle poppetjes uit elkaar? Het kunnen
// er wel 100 worden." Een mens stond tot nu toe op vier plekken verdeeld — zijn uiterlijk en zijn
// stats in T.WEZENS, zijn tekst in T.GESPREKKEN, zijn quest als `gever` in T.QUESTS, en zijn plek
// op de kaart. Bij achttien kun je dat onthouden; bij honderd niet, en niets verbond ze: je kon
// dezelfde bakker op twee plekken neerzetten zonder dat iets klaagde.
//
// Nu is één mens één regel hier, en zegt de kaart alleen nog wáár hij staat:
//
//   kaarten/<naam>.betekenis.json:  { "x": 118, "y": 52, "wie": "bakker", "straal": 3 }
//
// Wie geen naam hoeft te hebben, staat er niet in. Dat is de menigte: `{ x, y, zaad: 7 }` zet een
// gewone dorpeling neer die niets zegt en nergens bij hoort. Zie ontwerp/wereld.md, "Een flink
// dorp": achttien mensen met een karakter en een haakje voor een quest, en daarnaast zoveel
// figuranten als het dorp druk moet doen aanvoelen. Alleen die eerste groep hoef je uit elkaar te
// houden.
//
// ── Vorm van één mens ──
//
//   T.MENSEN.<id> = {
//     naam:     'de bakker',   // wat er boven zijn hoofd staat; mag weg als `wezen` het al zegt
//     wezen:    'bakker',      // leent uiterlijk en stats van dat wezen uit js/wereld.js
//     zaad:     4,             // óf: een gewone dorpeling met dit zaad als uiterlijk
//     straal:   3,             // hoe ver hij van zijn plek af dwaalt (de kaart mag het overrulen)
//     snelheid: 1.3,           // alleen als hij anders loopt dan zijn wezen of een dorpeling
//     gesprek:  'bakker',      // welk gesprek hij voert; zonder dit is het zijn eigen id
//   }
//
// `wezen` of `zaad`, niet allebei. Een mens met `wezen` is iemand die al getekend is; een mens met
// `zaad` leent zolang het vel van een gewone dorpeling, precies zoals de bakker en de marskramer
// dat deden voordat ze hun eigen tekeningen hadden.
(function (T) {
  'use strict';

  T.MENSEN = {
    // Op het erf en in de toren.
    meester: { wezen: 'meester' },
    wim: { wezen: 'wim' },

    // Het dorp, zoals ontwerp/wereld.md het opschrijft. Wie al getekend is, leent zijn eigen vel.
    smid: { wezen: 'smid' },
    smidsvrouw: { wezen: 'smidsvrouw' },
    herbergierster: { wezen: 'herbergierster' },
    boer: { wezen: 'boer' },
    boerin: { wezen: 'boerin' },
    dorpsoudste: { wezen: 'dorpsoudste' },
    oudeman: { wezen: 'oudeman' },
    bruid: { wezen: 'bruid' },
    bruidegom: { wezen: 'bruidegom' },
    jongen: { wezen: 'jongen' },
    meisje: { wezen: 'meisje' },
    kleuter: { wezen: 'kleuter' },
    bakker: { wezen: 'bakker' },
    marskramer: { wezen: 'marskramer' },

    // En de vaklieden die wel een haakje hebben in wereld.md maar nog geen tekening: zij lenen
    // het vel van een gewone dorpeling tot dat er is (zie de werklijst, fase B2b).
    molenaar: { naam: 'de molenaar', zaad: 11, straal: 3 },
    kruidenvrouw: { naam: 'de kruidenvrouw', zaad: 12, straal: 2 },
    jager: { naam: 'de jager', zaad: 13, straal: 4 },
    koster: { naam: 'de koster', zaad: 14, straal: 3 },
    wachter: { naam: 'de wachter', zaad: 15, straal: 2 },
  };

  // Hoe heet deze mens? Zijn eigen naam, anders die van het wezen dat hij leent, anders zijn id.
  // Zo staat "de bakker" maar op één plek: in js/wereld.js, waar hij toch al stond.
  T.naamVanMens = function (id) {
    const m = T.MENSEN[id];
    if (!m) return id;
    if (m.naam) return m.naam;
    const w = m.wezen && T.WEZENS ? T.WEZENS[m.wezen] : null;
    return (w && w.naam) || id;
  };

  // Welk gesprek voert hij? Zijn eigen id, tenzij er iets anders staat — zo kunnen de bruid en de
  // bruidegom desnoods hetzelfde gesprek delen zonder dat het een ongelukje lijkt.
  T.gesprekVanMens = (id) => (T.MENSEN[id] && T.MENSEN[id].gesprek) || id;

  // Een mens neerzetten als wezen in de wereld. `maakDorpeling` komt uit js/kaart.js en wordt
  // meegegeven, zodat dit bestand niets over het inlezen van kaarten hoeft te weten.
  T.maakMens = function (id, x, y, straal, maakDorpeling) {
    const m = T.MENSEN[id];
    if (!m) throw new Error(`onbekende mens "${id}"`);
    const ver = straal != null && straal > 0 ? straal : m.straal || 0;
    const e = m.wezen ? T.maakWezen(m.wezen, x, y) : maakDorpeling(m.zaad || 0, x, y, ver);
    e.wie = id;
    e.naam = T.naamVanMens(id);
    e.gesprek = T.gesprekVanMens(id);
    if (m.snelheid) e.snelheid = m.snelheid;
    if (ver > 0) {
      e.thuis = { x, y };
      e.straal = ver;
      e.dwaalt = true;
    }
    return e;
  };
})(globalThis.Toren = globalThis.Toren || {});
