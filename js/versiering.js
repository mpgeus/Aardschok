// De versiering van het plein (ronde 3 van het snoeien, 15 okt; Marcel: "Blijven als versiering"): de meiboom en de
// kerstboom, de tekeningen van de feesten (werklijst vraag 97 en 148), staan vanzelf op het plein, op het open midden
// (T.openMidden, js/markt.js), zolang hun tijd duurt: de meiboom in bloeimaand, de kerstboom van 20 wintermaand tot en
// met 6 louwmaand, met kaarsjes die 's avonds branden (T.versieringLicht, voor T.lichtBronnen in js/zien.js). Tot 15 okt
// kwamen ze met een feest, een voorval waarop je ja zei (js/feesten.js, in git). Regels zonder scherm; toetsen in
// test/versiering.test.cjs.
//
// D.versiering = { boom: { soort, x, y } } zolang er een boom staat.
(function (T) {
  'use strict';

  // Alle getallen in één blok, zoals elders (CLAUDE.md); ze staan ook in de werkbank (js/opties.js).
  T.VERSIERING_INSTELLINGEN = {
    // Van welke dag tot en met welke dag een boom staat (de soort is een voorwerp, T.VOORWERPEN in js/wereld.js).
    meiboom: { van: { maand: 'bloeimaand', dag: 1 }, tot: { maand: 'bloeimaand', dag: 30 } },
    // De kerstboom, met het licht van zijn kaarsjes 's avonds (tegels, en 0 tot 1).
    kerstboom: { van: { maand: 'wintermaand', dag: 20 }, tot: { maand: 'louwmaand', dag: 6 }, kaarsStraal: 3, kaarsSterkte: 0.45 },
  };
  const IN = () => T.VERSIERING_INSTELLINGEN;
  const BOMEN = ['meiboom', 'kerstboom'];

  // De dag van het jaar (0 tot DAGEN_PER_JAAR) van een datum { maand, dag }.
  const dagVan = (datum) => T.MAANDEN.findIndex((m) => m.naam === datum.maand) * T.DAGEN_PER_MAAND + datum.dag - 1;
  // Staat boom `soort` op dag `dag`? Een tijd die over de jaarwisseling loopt (de kerstboom), telt over het eind heen.
  function staatOp(soort, dag) {
    const B = IN()[soort];
    const d = T.dagVanJaar(dag);
    const van = dagVan(B.van);
    const tot = dagVan(B.tot);
    return van <= tot ? d >= van && d <= tot : d >= van || d <= tot;
  }

  // Elke nacht (T.tikGebouwenDag, js/gebouwen.js): een boom waarvan de tijd om is, gaat weg; en is het de tijd van een
  // boom en staat er geen, dan komt hij op het open midden van het plein (waar nu niemand staat). Zo heeft ook een spel
  // dat midden in de winter begint, zijn kerstboom.
  T.tikVersieringDag = function (D, dag) {
    const w = D.wereld;
    if (!w) return;
    const V = D.versiering || (D.versiering = { boom: null });
    if (V.boom && !staatOp(V.boom.soort, dag)) haalBoomWeg(D);
    if (V.boom) return;
    const soort = BOMEN.find((s) => staatOp(s, dag));
    const midden = soort && T.openMidden(D, true);
    if (!midden) return;
    T.zetVoorwerp(w, { soort, x: midden.x, y: midden.y });
    V.boom = { soort, x: midden.x, y: midden.y };
  };

  function haalBoomWeg(D) {
    const V = D.versiering;
    const w = D.wereld;
    const v = w.voorwerpen.find((x) => x.soort === V.boom.soort && x.x === V.boom.x && x.y === V.boom.y);
    if (v) T.haalVoorwerpWeg(w, v);
    V.boom = null;
  }

  // Het licht van de kaarsjes van de kerstboom (T.lichtBronnen, js/zien.js), zolang hij staat; T.lichtBronnen vraagt het
  // alleen 's avonds. Een lijst, leeg zonder kerstboom.
  T.versieringLicht = function (D) {
    const boom = D.versiering && D.versiering.boom;
    if (!boom || boom.soort !== 'kerstboom') return [];
    return [{ x: boom.x, y: boom.y, straal: IN().kerstboom.kaarsStraal, sterkte: IN().kerstboom.kaarsSterkte }];
  };
})(globalThis.Spel = globalThis.Spel || {});
