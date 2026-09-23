// De akkers: welk stadium het graan heeft op welke dag, hoe de wind per tegel waait, welke vaste
// variant een tegel krijgt, en hoe een boer op en rond zijn eigen akker werkt. Net als js/quest.js
// en js/pad.js zijn dit regels zonder scherm, dus te toetsen (test/akkers.test.cjs). Alleen voor
// het nieuwe spel (?kaart=gehucht, ontwerp/spel.md, "Het eerste proefje"); het getekende gebruik
// staat in js/tekenen.js, het lopen/maaien in js/verkennen.js (T.laatDwalen) en js/main.js.
(function (T) {
  'use strict';

  const maandIdx = (naam) => T.MAANDEN.findIndex((m) => m.naam === naam);

  // Eén tabel, één plek: wanneer welk stadium begint (ontwerp/werklijst.md, punt 1b, "Eén tabel
  // op één plek ... zodat Marcel het makkelijk kan bijstellen"). "gemaaid" dekt ook de stoppels
  // erna: er is geen apart stadium voor, het graan.cjs-vel kent er ook geen. Cyclisch: wat na de
  // laatste ingang komt, geldt tot de eerste ingang van het volgende jaar (zie T.akkerStadium).
  T.AKKER_STADIA = [
    { maand: maandIdx('lentemaand'), dag: 1, stadium: 'geploegd' }, // vroege lente: net geploegd
    { maand: maandIdx('lentemaand'), dag: 11, stadium: 'kiemend' },
    { maand: maandIdx('bloeimaand'), dag: 1, stadium: 'groen' },
    { maand: maandIdx('hooimaand'), dag: 1, stadium: 'rijp' }, // "rijp in hooi- en oogstmaand"
    { maand: maandIdx('herfstmaand'), dag: 1, stadium: 'gemaaid' }, // vangnet: zie T.werkOogstBij
  ];

  const dagInJaar = (maand, dag) => maand * T.DAGEN_PER_MAAND + (dag - 1);

  // Welk stadium hoort van nature bij deze datum? Dit is het stadium vóórdat een boer ook maar
  // iets deed: tijdens "rijp" bepaalt T.werkOogstBij per tegel of hij al gemaaid is (hij maait
  // vóór het vangnet hierboven aanslaat), zie T.akkerTegelStadium.
  T.akkerStadium = function (maand, dagVanMaand) {
    const nu = dagInJaar(maand, dagVanMaand);
    let gekozen = T.AKKER_STADIA[T.AKKER_STADIA.length - 1].stadium;
    for (const g of T.AKKER_STADIA) {
      if (dagInJaar(g.maand, g.dag) <= nu) gekozen = g.stadium;
    }
    return gekozen;
  };

  // Welke van de N geplante varianten staat er op tegel (x, y)? Vast per tegel (geen geflikker,
  // ontwerp/werklijst.md punt 1b, punt 2) en zonder Math.random, dus hetzelfde bij elke herlaad.
  T.akkerVariant = function (x, y, aantal) {
    if (!aantal) return 0;
    const h = ((x * 374761393 + y * 668265263) ^ (x * 2654435761)) >>> 0;
    return h % aantal;
  };

  // Het windbeeld (0..7) op tegel (x, y), op speeltijd `tijd` (S.tijd, niet de kalender — de wind
  // waait door, ook als het spel stilstaat of het jaar versnelt). Dezelfde vorm als de opdracht
  // 'm geeft: beeld = (tijd·snelheid + x·a + y·b) mod 8. De akkers in het gehucht liggen lang in
  // de y-richting (b=2..3, h=14), dus de golf rolt overlangs (WIND_GOLF_Y); WIND_GOLF_X blijft 0
  // zodat de twee/drie tegels breedte niet los van elkaar knipperen.
  T.WIND_GOLF_TIJD = 1.6; // beelden per seconde: hoe snel de halmen zelf zwaaien
  T.WIND_GOLF_X = 0;
  T.WIND_GOLF_Y = 1; // faseverschuiving per tegel in y, in beelden: één volle golf per 8 tegels
  T.windBeeld = function (tijd, x, y) {
    const t = tijd * T.WIND_GOLF_TIJD + x * T.WIND_GOLF_X + y * T.WIND_GOLF_Y;
    return ((Math.floor(t) % 8) + 8) % 8;
  };

  // Waar dwaalt deze boer nu rond? In het groeiseizoen (kiemend, groen, rijp) op en rond zijn
  // eigen akker (ontwerp/werklijst.md punt 1b, punt 5); anders (geploegd, of het veld is al
  // gemaaid) gewoon bij zijn huis, zoals elke dwalende dorpeling. `e.werkAkkers` komt van
  // T.laadKaart (js/kaart.js): de akkers waarvan `huis` gelijk is aan het `huis` van deze mens.
  // Heeft hij er meer dan één (boer1 en boer3 hebben ook nog een klein stuk onder de es), dan
  // telt voorlopig alleen de eerste mee voor het dwalen — de tweede telt wel gewoon mee voor de
  // groei en de oogst hieronder, hij loopt er alleen niet expliciet naartoe om te dwalen.
  T.wandelAnker = function (e, stadium) {
    const a = e.werkAkkers && e.werkAkkers[0];
    if (a && (stadium === 'kiemend' || stadium === 'groen' || stadium === 'rijp')) {
      return { x: a.x + (a.b - 1) / 2, y: a.y + (a.h - 1) / 2, straal: Math.max(a.b, a.h) / 2 + 1 };
    }
    return e.thuis ? { x: e.thuis.x, y: e.thuis.y, straal: e.straal || 3 } : null;
  };

  // Het stadium van precies deze tegel, met de oogst van deze boer erin verrekend: zolang het
  // hele veld nog "rijp" heet, kan een deel al gemaaid zijn omdat T.werkOogstBij daar al langs
  // kwam. Ná het vangnet (basisStadium 'gemaaid') is toch alles gemaaid, dus dan doet het er niet
  // meer toe wat er in `geoogst` staat.
  T.akkerTegelStadium = function (akker, x, y, basisStadium) {
    if (basisStadium === 'rijp' && akker.geoogst && akker.geoogst.has(x + ',' + y)) return 'gemaaid';
    return basisStadium;
  };

  // Alle tegels van een akker, als lijst {x, y} — voor het zoeken naar de dichtstbijzijnde
  // ongemaaide tegel hieronder, en te toetsen zonder een hele wereld te hoeven opbouwen.
  T.akkerTegels = function (akker) {
    const lijst = [];
    for (let dy = 0; dy < akker.h; dy++) {
      for (let dx = 0; dx < akker.b; dx++) lijst.push({ x: akker.x + dx, y: akker.y + dy });
    }
    return lijst;
  };

  // Hoelang een boer over één tegel doet: iets langer dan één zwaai van de zeis (maaier.cjs:
  // MAAIER_BEELDEN/MAAIER_FPS = 12/8 = 1,5s), zodat de hele slag minstens één keer te zien is.
  // In speeltijd (S.tijd, wall-clock), niet in kalenderdagen — zie ook de opmerking bij T.windBeeld.
  T.OOGST_TEGEL_DUUR = 1.6;

  function onbeslistTegels(akker) {
    const open = [];
    for (const t of T.akkerTegels(akker)) {
      if (!akker.geoogst || !akker.geoogst.has(t.x + ',' + t.y)) open.push(t);
    }
    return open;
  }
  T.akkerOnbeslistTegels = onbeslistTegels; // ook voor test/akkers.test.cjs

  // Eén stap oogsten, voor elke boer met een akker. Vóór T.laatDwalen aanroepen (js/main.js): wie
  // hier een pad krijgt of aan het maaien is, slaat T.laatDwalen dan vanzelf over (dezelfde
  // voorwaarde `m.pad.length`, plus `m.maait` — zie de aanpassing in js/verkennen.js).
  //
  // Buiten "rijp" gebeurt hier niets (T.wandelAnker regelt dan het gewone dwalen); wordt het veld
  // ergens tussendoor toch "gemaaid" (het vangnet in T.akkerStadium, oogstmaand voorbij), dan
  // stopt het maaien vanzelf — de tekening laat dan toch alles als gemaaid zien.
  T.werkOogstBij = function (S, dt) {
    const w = S.wereld;
    if (!w.akkers || !w.akkers.length) return;
    const datum = T.datumVanDag(S.kalender.dag);
    const basis = T.akkerStadium(datum.maand, datum.dagVanMaand);
    for (const e of w.wezens) {
      if (e.dood || !e.werkAkkers || !e.werkAkkers.length) continue;
      const akker = e.werkAkkers[0];
      if (!akker.geoogst) akker.geoogst = new Set();
      if (basis !== 'rijp') {
        if (akker.geoogst.size && basis === 'geploegd') akker.geoogst.clear(); // nieuw jaar, weer vers
        e.maait = null;
        e.oogstDoel = null;
        continue;
      }
      if (e.maait) {
        if (S.tijd >= e.maait.tot) {
          akker.geoogst.add(e.maait.x + ',' + e.maait.y);
          e.maait = null;
          e.oogstDoel = null;
        }
        continue;
      }
      if (e.pad && e.pad.length) continue; // onderweg naar zijn doel
      if (e.oogstDoel && e.tx === e.oogstDoel.x && e.ty === e.oogstDoel.y) {
        e.maait = { x: e.tx, y: e.ty, tot: S.tijd + T.OOGST_TEGEL_DUUR };
        continue;
      }
      const open = onbeslistTegels(akker);
      if (!open.length) {
        e.oogstDoel = null;
        continue;
      }
      let doel = open[0];
      let beste = Infinity;
      for (const t of open) {
        const d = T.afstand({ x: e.tx, y: e.ty }, t);
        if (d < beste) {
          beste = d;
          doel = t;
        }
      }
      const pad = T.zoekPad(
        { x: e.tx, y: e.ty },
        doel,
        (x, y) => T.isBegaanbaar(w, x, y, { wezensBlokkeren: true, wie: e }),
        (x, y) => T.isVast(w, x, y),
        {},
      );
      if (pad && pad.length) {
        e.pad = pad;
        e.oogstDoel = doel;
      } else {
        e.oogstDoel = null; // niet te bereiken, volgende beurt opnieuw proberen
      }
    }
  };
})(globalThis.Toren = globalThis.Toren || {});
