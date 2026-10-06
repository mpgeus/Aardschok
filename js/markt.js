// De markt op het plein (werklijst vraag 110, d; Marcel, 5 okt: "Voor nu a1, b tot e ja"). In de speeltest van vier jaar
// kwam er in geen spel een markt: een eigen gebouw van 6 bij 6 vroeg 12 bij 12 open grond, en die was op toen er goud
// was. Zo hield een dorp ook markt: op het plein, met kramen.
//
// - Hoe hij komt (a1): zoals elk gebouw, een inwoner vraagt het je (js/verzoeken.js), of jij hangt een oproep op. Alleen
//   de plek is het plein, niet een eigen stuk grond: T.plekVoor, T.waaromPastHetNiet en T.plaatsGebouw vragen het hier.
// - Wat het is (b): vier kramen aan de rand van het plein, elk op één tegel en met zijn toonbank naar het midden, waar je
//   tussendoor loopt (T.kraamPlekken). Het midden blijft vrij voor het feest en de meiboom (js/feesten.js), en de plek van
//   de heer en zijn schandpaal ook (js/heer.js). De markt staat als gebouw in D.gebouwen (`opHetPlein`, met zijn kramen),
//   zodat de wens van de stenen huizen hem telt (T.plekkenVan, js/wensen.js), maar zonder voet: zijn plek is het midden
//   van het plein, en daar wordt niets vast.
// - Wat het kost (c): kramen zijn geen huis (`kosten` hieronder, in de werkbank). T.GEBOUWEN.markt.kosten zegt het,
//   naar de spelregel.
// - De spelregel "De markt" (d): "Op het plein" (de standaard) of "Een eigen gebouw", zoals vóór 6 okt.
// - Het beeld (e): de marktkraam uit gereedschap/pixelart/dorp.cjs, van vier kanten (js/tekenen.js, T.sprites.kraam).
// Niet in deze stap: een marktdag met kooplui, en de handel met de buren (vraag 72): "De markt wordt essentieel voor de
// handel, vanaf dat punt kan een nederzetting pas handelen met buren etc." (Marcel, 5 okt).
(function (T) {
  'use strict';

  // Alle getallen in één blok, zoals elders (CLAUDE.md); ze staan ook in de werkbank (js/opties.js).
  T.MARKT_INSTELLINGEN = {
    // De spelregel "De markt": true, op het plein; false, een eigen gebouw van 6 bij 6 (T.GEBOUWEN.markt).
    opHetPlein: true,
    // Wat de kramen kosten. Een eigen gebouw kost wat T.GEBOUWEN.markt zegt (16 hout, 14 goud).
    kosten: { hout: 8, goud: 6 },
    // Zoveel kramen, elk aan een andere kant van het plein.
    kramen: 4,
    // Een kraam staat buiten de kring van het feest (T.FEESTEN_INSTELLINGEN.kring, om T.feestMidden), en nog zoveel
    // tegels verder.
    vanHetFeest: 0,
    // Zo ver blijft een kraam van de plek van de heer (en de marskramer), in tegels.
    vanDeHeer: 3,
    // En zo ver van een andere kraam.
    vanElkaar: 4,
  };
  const IN = () => T.MARKT_INSTELLINGEN;

  // Wat de markt kost, naar de spelregel: de kramen, of een eigen gebouw. Eén plek, zodat elke regel die
  // T.GEBOUWEN.markt.kosten vraagt (het bouwen, het verzoek, de raad, de inner) hetzelfde hoort.
  const eigenKosten = T.GEBOUWEN.markt.kosten;
  Object.defineProperty(T.GEBOUWEN.markt, 'kosten', { enumerable: true, get: () => (IN().opHetPlein ? IN().kosten : eigenKosten) });

  // Komt de markt hier op het plein? Naar de spelregel, en alleen op een kaart met een plein.
  T.marktOpHetPlein = (D) => !!IN().opHetPlein && T.pleinTegels(D.wereld).length > 0;

  // De vier kanten van het plein, langs de assen van de kaart, en waar een kraam daar naartoe kijkt: naar het midden.
  // De richtingen zijn die van het beeld (js/sprites.js, T.sprites.richtingVan): +x is ZO, +y is ZW.
  const KANTEN = [
    { dx: -1, dy: 0, richting: 'ZO' },
    { dx: 0, dy: -1, richting: 'ZW' },
    { dx: 1, dy: 0, richting: 'NW' },
    { dx: 0, dy: 1, richting: 'NO' },
  ];
  // De acht buren van een tegel, rondom, zodat twee na elkaar ook naast elkaar liggen.
  const RONDOM = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];
  const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

  // Het midden van het plein: de tegel van het plein het dichtst bij zijn zwaartepunt, waar het ook staat. Daar is de
  // markt als gebouw (zijn "deur", T.deurVan), en daarvandaan rekent een kring (de spelregel "De herberg en de markt").
  T.marktMidden = function (w) {
    const tegels = T.pleinTegels(w);
    if (!tegels.length) return null;
    const m = zwaartepunt(tegels);
    let beste = null;
    for (const t of tegels) {
      const a = Math.hypot(t.x - m.x, t.y - m.y);
      if (!beste || a < beste.a) beste = { x: t.x, y: t.y, a };
    }
    return { x: beste.x, y: beste.y };
  };
  function zwaartepunt(tegels) {
    return { x: tegels.reduce((s, t) => s + t.x, 0) / tegels.length, y: tegels.reduce((s, t) => s + t.y, 0) / tegels.length };
  }

  // Houdt een kraam op deze tegel niemand tegen? Wie om hem heen loopt, gaat over de acht tegels eromheen, zonder hoeken
  // af te snijden (js/pad.js), dus alleen van een tegel naar de volgende in de ring. Zijn de open tegels rondom één
  // aaneengesloten stuk, dan komt iedereen die over deze tegel had gekund, er ook omheen. Een open hoek tussen twee dichte
  // kanten telt niet: daar kon je over deze tegel ook niet komen.
  function niemandTegen(w, x, y, bezet) {
    const open = RONDOM.map(([dx, dy]) => T.isBegaanbaar(w, x + dx, y + dy) && !bezet.has(`${x + dx},${y + dy}`));
    let stukken = 0;
    for (let i = 0; i < 8; i++) {
      if (!open[i] || open[(i + 7) % 8]) continue; // het begin van een stuk
      const hoek = i % 2 === 0;
      if (hoek && !open[(i + 1) % 8]) continue; // een losse hoek
      stukken++;
    }
    return stukken <= 1;
  }

  // Waar de kramen komen: [{ x, y, richting }], een per kant van het plein, zoveel als er passen (hooguit `kramen`). Een
  // kraam staat aan de rand: op elke kant de tegel die het verst naar buiten ligt, en daarvan die het dichtst bij het
  // midden van die kant. Hij staat op het plein, op een open tegel zonder iets erop, niet bij een deur, buiten het feest,
  // weg van de heer en zijn schandpaal, met een open tegel ervoor (de klant), en hij houdt niemand tegen. Puur: zet niets
  // neer. Wie er nu staat, telt niet: die stapt opzij als de kraam komt.
  T.kraamPlekken = function (D) {
    const w = D.wereld;
    const tegels = T.pleinTegels(w);
    if (!tegels.length) return [];
    const m = zwaartepunt(tegels);
    const heer = w.heer || w.marskramer || null;
    const paal = (w.voorwerpen || []).find((v) => v.soort === 'schandpaal') || (heer ? T.plekVoorDeSchandpaal(D) : null);
    const weg = new Set();
    if (paal) for (const [dx, dy] of [[0, 0], [1, 1]]) weg.add(`${paal.x + dx},${paal.y + dy}`);
    const deuren = (D.gebouwen || []).filter((g) => !g.opHetPlein).map((g) => T.deurVan(w, g));
    const vrij = (x, y) => T.opHetPlein(w, x, y) && T.isBegaanbaar(w, x, y) && !T.voorwerpOp(w, x, y) && !T.bijDeur(w, x, y);
    const feest = T.FEESTEN_INSTELLINGEN.kring + IN().vanHetFeest;
    const feestMidden = T.feestMidden(w) || m;
    const gekozen = [];
    const bezet = new Set();
    for (const kant of KANTEN) {
      if (gekozen.length >= IN().kramen) break;
      const kan = tegels.filter((t) => vrij(t.x, t.y) && vrij(t.x - kant.dx, t.y - kant.dy)
        && cheb(t, feestMidden) > feest && (!heer || cheb(t, heer) > IN().vanDeHeer) && !weg.has(`${t.x},${t.y}`)
        && !deuren.some((d) => cheb(t, d) <= 1) && gekozen.every((k) => cheb(t, k) >= IN().vanElkaar)
        && niemandTegen(w, t.x, t.y, bezet));
      // Aan deze kant: de tegels in zijn kwart van het plein (meer naar deze kant dan opzij), aan de rand, en daarvan die
      // het dichtst bij de lijn door het midden; dan die het verst naar buiten, dan van boven naar onder.
      const buiten = (t) => (t.x - m.x) * kant.dx + (t.y - m.y) * kant.dy;
      const opzij = (t) => Math.abs((t.x - m.x) * kant.dy - (t.y - m.y) * kant.dx);
      const aanDeRand = (t) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !T.opHetPlein(w, t.x + dx, t.y + dy));
      const hier = kan.filter((t) => buiten(t) > 0 && buiten(t) >= opzij(t) && aanDeRand(t));
      hier.sort((a, b) => Math.round(opzij(a)) - Math.round(opzij(b)) || buiten(b) - buiten(a) || a.y - b.y || a.x - b.x);
      const t = hier[0];
      if (!t) continue;
      gekozen.push({ x: t.x, y: t.y, richting: kant.richting });
      bezet.add(`${t.x},${t.y}`);
    }
    return gekozen;
  };

  // Waarom de markt hier niet op het plein kan, of null: er staat er al een, of de kramen passen niet.
  T.waaromGeenMarktOpHetPlein = function (D) {
    if ((D.gebouwen || []).some((g) => g.soort === 'markt' && g.opHetPlein)) return 'Op het plein staat al een markt.';
    if (T.kraamPlekken(D).length < IN().kramen) return 'Op het plein is geen plaats voor de kramen.';
    return null;
  };

  // Waar de markt komt, voor een verzoek (T.plekVoor, js/verzoeken.js): het midden van het plein, met de kramen erbij, of
  // null als hij er niet kan komen.
  T.marktPlek = function (D) {
    if (T.waaromGeenMarktOpHetPlein(D)) return null;
    return { ...T.marktMidden(D.wereld), kramen: T.kraamPlekken(D) };
  };

  // De markt op het plein zetten (T.plaatsGebouw, js/gebouwen.js): betalen, en dan de kramen, in aanbouw tot de markt
  // klaar is (T.tikGebouwenDag). Zelfde antwoord als T.plaatsGebouw: { gelukt, reden, instantie, bericht }.
  T.zetMarktOpHetPlein = function (D) {
    const g = T.GEBOUWEN.markt;
    const reden = T.waaromGeenMarktOpHetPlein(D);
    if (reden) return { gelukt: false, reden };
    if (!T.kanBetalen(D, g.kosten)) return { gelukt: false, reden: 'Daar is de voorraad niet groot genoeg voor.' };
    T.betaalKosten(D, g.kosten);
    const w = D.wereld;
    const dag = D.kalender ? Math.floor(D.kalender.dag) : 0;
    const midden = T.marktMidden(w);
    const klaar = g.bouwtijd <= 0;
    const kramen = T.kraamPlekken(D).map((k) => T.zetVoorwerp(w, { soort: 'kraam', x: k.x, y: k.y, richting: k.richting, inAanbouw: !klaar }));
    for (const k of kramen) T.stapEraf(D, { x: k.x, y: k.y, b: 1, h: 1 });
    const instantie = { soort: 'markt', x: midden.x, y: midden.y, voet: { b: 1, h: 1 }, tekening: null, klaar, klaarOp: dag + g.bouwtijd, handen: 0, voorwerp: null, opHetPlein: true, kramen };
    D.gebouwen.push(instantie);
    if (T.ui && T.ui.toonBevolking) T.ui.toonBevolking(D);
    return { gelukt: true, instantie, bericht: `De kramen van de markt komen op het plein (${g.bouwtijd} dag${g.bouwtijd === 1 ? '' : 'en'}).` };
  };
})(globalThis.Spel = globalThis.Spel || {});
