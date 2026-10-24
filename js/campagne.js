// De campagne (vraag 187, stap 2b; ontwerp/scenario.md, 6): één land met hoofdstukken (T.CAMPAGNE, levels/campagne.js).
// Een hoofdstuk is een level (T.LEVELS, levels/) op het eiland van de campagne, met zijn eigen dorpsplek en rand (stap 2a).
// Hier de regels zonder scherm (test/campagne.test.cjs): het level waarmee een hoofdstuk begint, welke hoofdstukken open
// zijn, en wanneer een hoofdstuk af is. Het scherm staat in js/menu.js (Campaign op het titelscherm) en js/hud.js (het
// eindscherm).
//
// Wat af is, blijft op deze computer (T.opslagPlek, js/opslaan.js; later Steam Cloud), zoals de beste punten van de demo,
// en niet in S: het hoort bij wie speelt, niet bij één spel.
(function (T) {
  'use strict';

  const sleutel = () => `${T.OPSLAG_SLEUTEL}.campagne`; // geen tekst
  const lijst = () => T.CAMPAGNE.hoofdstukken;

  // Het hoofdstuk met dit id, of null.
  T.hoofdstukVan = (id) => lijst().find((h) => h.id === id) || null;

  // Het level waarmee hoofdstuk `id` begint (T.nieuwSpel, js/main.js): zijn level, op het eiland van de campagne, op zijn
  // plek, met zijn rand. `hoofdstuk` zegt het spel dat het een hoofdstuk is (S.scenario.hoofdstuk, js/scenario.js).
  T.hoofdstukLevel = function (id) {
    const h = T.hoofdstukVan(id);
    return { ...T.LEVELS[h.level], eiland: { ...T.CAMPAGNE.eiland }, plek: h.plek, rand: { ...h.rand }, hoofdstuk: h.id };
  };

  // Wat er af is op deze computer: { id: true }.
  T.campagneAf = function () {
    try {
      const p = T.opslagPlek();
      const v = p ? JSON.parse(p.getItem(sleutel()) || '{}') : {};
      return v && typeof v === 'object' ? v : {};
    } catch (e) {
      return {}; // een browser die niets bewaart (een privévenster), of iets wat geen JSON is
    }
  };

  // Is hoofdstuk `id` te spelen: het eerste altijd, een volgend als het hoofdstuk ervoor af is. Wat af is, speel je opnieuw.
  T.hoofdstukOpen = function (id) {
    const i = lijst().findIndex((h) => h.id === id);
    return i === 0 || (i > 0 && !!T.campagneAf()[lijst()[i - 1].id]);
  };

  // Is het spel in dorp D gewonnen: betaald op Sint-Maarten (het demojaar: hij rijdt weg met je waren, js/heer.js), of een
  // scenario dat gewonnen eindigt (de trigger `einde`). Zijn leger, een leeg dorp, weggejaagd of je ambt kwijt: verloren.
  T.spelGewonnen = (D) => !!D.einde && (D.einde.reden === 'betaald' || (D.einde.reden === 'scenario' && !!D.einde.gewonnen));

  // Het eind van een hoofdstuk (het eindscherm, js/hud.js): is het gewonnen, dan is het af op deze computer. Geeft
  // { hoofdstuk, gewonnen, volgende } (volgende: het hoofdstuk dat nu opengaat, of null), of null als dit spel geen
  // hoofdstuk is of nog niet uit.
  T.eindVanHoofdstuk = function (S, D) {
    const h = S.scenario && S.scenario.hoofdstuk ? T.hoofdstukVan(S.scenario.hoofdstuk) : null;
    if (!h || !D.einde) return null;
    const gewonnen = T.spelGewonnen(D);
    if (gewonnen) {
      try {
        const p = T.opslagPlek();
        if (p) p.setItem(sleutel(), JSON.stringify({ ...T.campagneAf(), [h.id]: true }));
      } catch (e) {
        // een browser die niets bewaart: dan blijft het niet staan
      }
    }
    const volgende = gewonnen ? lijst()[lijst().indexOf(h) + 1] || null : null;
    return { hoofdstuk: h, gewonnen, volgende };
  };

  // Wat er mis is met de campagne, als een lijst zinnen voor wie hem maakt (zoals T.keurScenario): een eiland met een zaad,
  // elk hoofdstuk een id (één keer), een titel, een level dat er is, en dat level met zijn plek en zijn rand door de
  // keuring. Of de plek op het eiland ligt en er een dorp past, zegt pas de maker (test/campagne.test.cjs begint elk
  // hoofdstuk). Leeg: het is goed.
  T.keurCampagne = function (C = T.CAMPAGNE) {
    const fout = [];
    if (!C || !C.eiland || !Number.isInteger(C.eiland.zaad)) fout.push('de campagne heeft een eiland met een zaad'); // geen tekst
    const ids = [];
    ((C && C.hoofdstukken) || []).forEach((h, i) => {
      const wie = `hoofdstuk ${h.id || i + 1}`; // geen tekst
      if (!h.id) fout.push(`hoofdstuk ${i + 1} heeft geen id`); // geen tekst
      else if (ids.includes(h.id)) fout.push(`${wie} staat er twee keer`); // geen tekst
      ids.push(h.id);
      if (!h.titel) fout.push(`${wie} heeft geen titel`); // geen tekst
      if (!T.LEVELS[h.level]) fout.push(`${wie}: het level ${h.level} is er niet`); // geen tekst
      else for (const z of T.keurScenario({ ...T.LEVELS[h.level], eiland: C.eiland, plek: h.plek, rand: h.rand })) fout.push(`${wie}: ${z}`); // geen tekst
    });
    if (!ids.length) fout.push('de campagne heeft geen hoofdstukken'); // geen tekst
    return fout;
  };
})(globalThis.Spel = globalThis.Spel || {});
