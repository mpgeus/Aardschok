// Afbreken (werklijst C, stap 5, e; Marcel, 14 okt: "we moeten een 'demolition' knop hebben", "Wegen en gebouwen, nu", en
// "ze lopen los, met een melding dat er huizen nodig zijn"). De knop staat in het bouwmenu (js/hud.js) en blijft in de hand
// tot een rechtsklik; de muis zegt wat een klik afbreekt (T.handelingAfbreken), en de klik doet hetzelfde.
//
// - Een weg die jij legde (js/wegen.js): die tegel wordt weer gras. Een weg in aanleg: wat er nog niet ligt, komt niet. De
//   weg van de kaart en het plein blijven.
// - Een gebouw (T.breekAf), ook een bouwplaats: er komt niets terug. Wie erin woonde, heeft geen huis meer (T.wordtDakloos,
//   js/bewoners.js): het gezin slaapt op het plein tot er een woning met plaats is, en zolang is dat een status. Wie er
//   werkte, is vrij. Wat erbij lag (zijn stapel, het hout dat de kar al naar de bouwplaats bracht, wat een werkplaats nog
//   moest verwerken, en de lading van de kar van een schuur) blijft als losse stapel liggen tot de ossenkar hem haalt
//   (`stapel` in T.GEBOUWEN, js/kar.js). De velden van een boerderij gaan mee, met wat erop groeit.
// - Niet af te breken: het huis van de schout, de tenten van het kamp (die gaan vanzelf), en een veld op zichzelf (dat gaat
//   met zijn boerderij).
// Regels zonder scherm, dus te toetsen (test/afbreken.test.cjs).
(function (T) {
  'use strict';

  // Wat een klik met afbreken op (x, y) doet: { tekst, kan, doe, tegels } (de tegels om rood te kleuren), of null als er
  // niets is om af te breken. Eén antwoord voor de muis en de klik (js/main.js).
  T.handelingAfbreken = function (D, x, y) {
    const w = D.wereld;
    if (T.opGelegdeWeg(w, x, y)) {
      return { tekst: T.t('Click to demolish this piece of road.'), kan: true, plekken: [{ x, y }], doe: () => T.haalWegWeg(w, x, y) };
    }
    const weg = T.wegKomtOp(D, x, y);
    if (weg) {
      return {
        tekst: T.t('Click to stop this road: what is not laid yet will not come.'), kan: true, plekken: T.wegNogTeDoen(weg),
        doe: () => T.stopWegwerk(D, weg),
      };
    }
    const g = T.bouwplaatsOp(D, x, y) || T.gebouwOp(D, x, y);
    if (g) return gebouwAfbreken(D, g);
    if (T.opPad(w, x, y) && !T.opHetPlein(w, x, y)) return { tekst: T.t('This road was here before you came: it stays.'), kan: false };
    if (T.veldOp(w, x, y) || T.wijngaardOp(D, x, y)) return { tekst: T.t('A field goes with its farm: demolish the farm.'), kan: false };
    return null;
  };

  function gebouwAfbreken(D, g) {
    const soort = T.GEBOUWEN[g.soort];
    const naam = soort ? soort.naam : g.soort;
    if (g.huis === 'schout' || g.soort === 'schout') return { tekst: T.t('Your own house stays.'), kan: false };
    if (g.soort === 'tent') return { tekst: T.t('The camp goes by itself, when its families have a home.'), kan: false };
    if (g.soort === 'stapel') return { tekst: T.t('The ox cart fetches this pile.'), kan: false };
    if (T.isVeldSoort(g.soort)) return { tekst: T.t('A field goes with its farm: demolish the farm.'), kan: false };
    const zinnen = [g.klaar ? T.t('Click to demolish the {gebouw}. Nothing comes back.', { gebouw: naam })
      : T.t('Click to stop building the {gebouw}. Nothing comes back.', { gebouw: naam })];
    const wonen = wonenIn(D, g);
    if (wonen.length) zinnen.push(T.t('{wie} and family will have no home.', { wie: hoofdVan(wonen).naam }));
    if (T.isBoerderij(g) && veldenVan(D, g).length) zinnen.push(T.t('Its fields go with it.'));
    if (somVan(watErLigt(D, g)) >= 0.5) zinnen.push(T.t('What lies by it stays for the ox cart.'));
    const r = T.voetVanGebouw(g);
    const plekken = [];
    for (let dy = 0; dy < r.h; dy++) for (let dx = 0; dx < r.b; dx++) plekken.push({ x: r.x + dx, y: r.y + dy });
    return { tekst: zinnen.join(' '), kan: true, plekken, doe: () => T.breekAf(D, g) };
  }

  const wonenIn = (D, g) => ((D.bewoners && D.bewoners.mensen) || []).filter((p) => p.huis === g);
  const hoofdVan = (leden) => leden.find((p) => !p.hoofd) || leden[0];
  const somVan = (o) => Object.values(o).reduce((s, n) => s + n, 0);

  // De velden van boerderij g: de akkers en wijngaarden die er liggen, en die de bouwers nog maken.
  function veldenVan(D, g) {
    const w = D.wereld;
    return [
      ...(w.akkers || []).filter((a) => a.boerderij === g),
      ...(w.wijngaarden || []).filter((a) => a.boerderij === g),
      ...D.gebouwen.filter((v) => T.isVeldSoort(v.soort) && v.boerderij === g),
    ];
  }

  // Wat er bij g ligt en blijft liggen: zijn stapel, het hout dat de kar al bracht maar dat nog niet verbouwd is (zoals
  // T.stapelsOp het laat zien), wat een werkplaats nog moest verwerken (g.in), en wat de kar van een schuur geladen heeft.
  function watErLigt(D, g) {
    const ligt = {};
    const erbij = (wat, n) => {
      if (n > 1e-6) ligt[wat] = (ligt[wat] || 0) + n;
    };
    for (const wat in g.stapel || {}) erbij(wat, g.stapel[wat]);
    const B = g.bouw;
    if (B && !g.klaar && B.er) {
      const deel = B.werk > 0 ? B.gedaan / B.werk : 1;
      for (const wat in B.er) erbij(wat, B.er[wat] - ((B.nodig && B.nodig[wat]) || 0) * deel);
    }
    for (const wat in g.in || {}) erbij(wat, g.in[wat]);
    if (g.kar && g.kar.lading) for (const wat in g.kar.lading) erbij(wat, g.kar.lading[wat]);
    return ligt;
  }

  // Breek gebouw g af (of stop met bouwen): het is weg, en er komt niets terug.
  T.breekAf = function (D, g) {
    const w = D.wereld;
    const soort = T.GEBOUWEN[g.soort];
    // wat erbij ligt, en waar: vóór het gebouw weg is, want de plek hangt aan zijn deur
    const ligt = watErLigt(D, g);
    const plek = somVan(ligt) >= 1e-6 ? T.stapelPlek(D, g) : null;
    // wie erin woonde, heeft geen huis meer
    const wonen = wonenIn(D, g);
    if (wonen.length) T.wordtDakloos(D, wonen);
    // de velden van een boerderij gaan mee
    if (T.isBoerderij(g)) haalVeldenWeg(D, g);
    // de kar van een schuur gaat mee (wat hij geladen had, ligt op de stapel)
    if (g.kar) haalKarWeg(D, g.kar);
    // de lantaarn bij zijn deur (js/paden.js)
    if (soort && soort.lantaarn && g.klaar) {
      const deur = T.deurVan(w, g);
      const licht = w.voorwerpen.find((v) => v.soort === 'lantaarn' && v.vanHetDorp && T.afstand(v, deur) <= 2);
      if (licht) T.haalVoorwerpWeg(w, licht);
    }
    // de kramen en manden van de markt (js/markt.js)
    for (const v of [...(g.kramen || []), ...(g.manden || [])]) if (w.voorwerpen.includes(v)) T.haalVoorwerpWeg(w, v);
    // het gebouw zelf: van de kaart, en zijn voet weer begaanbaar
    const r = T.voetVanGebouw(g);
    if (g.voorwerp) {
      T.haalVoorwerpWeg(w, g.voorwerp);
      for (let dy = 0; dy < r.h; dy++) for (let dx = 0; dx < r.b; dx++) T.zetTegel(w, r.x + dx, r.y + dy, 'vloer');
      T.kaartVeranderd(w, { x1: r.x, y1: r.y, x2: r.x + r.b - 1, y2: r.y + r.h - 1 });
    }
    D.gebouwen.splice(D.gebouwen.indexOf(g), 1);
    for (const p of (D.bewoners && D.bewoners.mensen) || []) if (p.bouwt === g) p.bouwt = null;
    if (plek) {
      D.gebouwen.push({
        soort: 'stapel', x: plek.x, y: plek.y, voet: { b: 1, h: 1 }, deur: { x: plek.x, y: plek.y }, tekening: null,
        klaar: true, klaarOp: D.kalender ? Math.floor(D.kalender.dag) : 0, handen: 0, voorwerp: null, stapel: ligt,
      });
    }
    // wie er werkte, is vrij, en de handen gaan opnieuw rond (js/gebouwen.js); de boeren kijken naar hun akkers; en de
    // soldaten van een wachthuis leveren hun wapen in (js/soldaten.js)
    if (D.bewoners) {
      T.verdeelHanden(D);
      T.werkDeBoerenBij(D);
      T.tikSoldatenDag(D);
    }
    const naam = soort ? soort.naam : g.soort;
    T.zeg(D, g.klaar ? T.t('The {gebouw} is demolished.', { gebouw: naam }) : T.t('The {gebouw} will not be built.', { gebouw: naam }));
    if (wonen.length) {
      T.zeg(D, T.t('{wie} and family have no home now: they sleep on the square until there is a hut or a house with room for them.', { wie: hoofdVan(wonen).naam }), 'gevaar');
      if (D.kalender) T.tikStatussenDag(D, Math.floor(D.kalender.dag)); // de status staat meteen in de balk, niet pas vannacht
    }
    if (T.ui && T.ui.toonBevolking) T.ui.toonBevolking(D);
    return true;
  };

  // De velden van boerderij g: weg, met wat erop groeit (de ranken van een wijngaard, js/wijngaard.js).
  function haalVeldenWeg(D, g) {
    const w = D.wereld;
    for (const v of veldenVan(D, g)) {
      let r = v;
      if (w.akkers && w.akkers.includes(v)) w.akkers.splice(w.akkers.indexOf(v), 1);
      else if (w.wijngaarden && w.wijngaarden.includes(v)) w.wijngaarden.splice(w.wijngaarden.indexOf(v), 1);
      else {
        D.gebouwen.splice(D.gebouwen.indexOf(v), 1);
        for (const p of (D.bewoners && D.bewoners.mensen) || []) if (p.bouwt === v) p.bouwt = null;
        r = T.voetVanGebouw(v);
      }
      T.kaartVeranderd(w, { x1: r.x, y1: r.y, x2: r.x + r.b - 1, y2: r.y + r.h - 1 });
    }
    for (const v of T.rankenVan(D, g)) T.haalVoorwerpWeg(w, v);
  }

  // De kar van een schuur: uit het dorp en van de kaart.
  function haalKarWeg(D, e) {
    const w = D.wereld;
    if (D.karren && D.karren.includes(e)) D.karren.splice(D.karren.indexOf(e), 1);
    if (w.wezens.includes(e)) w.wezens.splice(w.wezens.indexOf(e), 1);
    e.rit = null;
    e.lading = {};
  }
})(globalThis.Spel = globalThis.Spel || {});
