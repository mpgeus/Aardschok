// De veldslag (vraag 187 en 188, stap 3; ontwerp/scenario.md, 7; Marcel, 23 okt: skirmish zonder economie, en 28 okt:
// "B1, c2, D1, F2, L2, H2, E2"): twee legers op een kleine kaart, zonder huifkar, dorp of jaar, op 1×, tot er één kant
// geen mannen meer heeft of de tijd om is. Hier de regels zonder scherm (test/veldslag.test.cjs).
//
// Stap 3a1: de wereld van een veldslag, een kaart uit een recept (T.KAARTEN, levels/kaarten.js; het eiland maakt
// js/eiland.js). De legers, het begin en het eind komen in 3a2.
(function (T) {
  'use strict';

  // Alle getallen in één blok (ook in de werkbank, js/opties.js).
  T.VELDSLAG_INSTELLINGEN = {
    zee: 8, // zoveel tegels zee om het land zijn open en te zien
  };
  const IN = () => T.VELDSLAG_INSTELLINGEN;

  // De wereld van een veldslag op kaart `recept` met zaad `zaad`: een kaart van het eiland van dat recept (T.eilandKaart,
  // js/wereld.js), met het land en een strook zee eromheen open (`zee`), de rand eromheen (w.rand: de camera en de
  // stukken blijven erbinnen), de rotsen van de pas (het eiland legt ze niet zelf: een rots die er een kan staan,
  // zou er in een pas niet zeker staan), en de hoogte van het eiland, altijd (de heuvels horen bij de kaart, ook als de
  // spelregel Hoogte uit staat).
  T.veldslagWereld = function (recept, zaad) {
    const E = T.eilandVan({ zaad, recept });
    const R = E.recept;
    const z = IN().zee;
    const vak = { x: R.x0 - z, y: R.y0 - z, b: R.maat + 2 * z, h: R.maat + 2 * z };
    const w = T.eilandKaart(zaad, vak, recept);
    w.naam = T.tGegevens(T.KAARTEN[recept].naam);
    const S = T.STUK;
    const sx = Math.floor(vak.x / S);
    const sy = Math.floor(vak.y / S);
    w.rand = { sx, sy, b: Math.floor((vak.x + vak.b - 1) / S) - sx + 1, h: Math.floor((vak.y + vak.h - 1) / S) - sy + 1 };
    T.openVak(w, vak);
    const rots = T.opzoekTegelNaam(T.natuurTegel('rots'));
    for (const p of R.rotsen) {
      const er = T.voorwerpOp(w, p.x, p.y);
      if (er) T.haalVoorwerpWeg(w, er);
      const g = T.grondOp(w, p.x, p.y);
      if (T.tegel(w, p.x, p.y) === 'buiten' || (g && T.isWaterGrond(g.naam))) continue;
      T.zetVoorwerp(w, T.maakVoorwerp(rots, p.x, p.y));
      T.zetTegel(w, p.x, p.y, 'muur');
    }
    w.hoogte = { trede: T.HOOGTE_INSTELLINGEN.trede, zaad, b: vak.b, h: vak.h, vlaktes: [], vlakken: [], niveau: {}, hellingen: {}, eiland: { zaad, recept, x0: 0, y0: 0 } };
    return w;
  };
})(globalThis.Spel = globalThis.Spel || {});
