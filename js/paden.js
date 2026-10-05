// De paadjes en de lantaarns (werklijst vraag 108, b en d; Marcel, 3 okt: "De gebouwen moeten menselijk gebouwd zijn.
// Paadjes, stenen en zand. Lantaarns voor in de avond etc. Dit moet allemaal straks staan voor de demo.", en op het plan:
// "108 a tab, b c d e ja"; besloten op 25 sep, ontwerp/spel.md, "Straten en paden"). Drie dingen:
//
// - Van elke deur loopt een paadje naar de weg, of naar het paadje van een buur dat dichterbij ligt: het aangelegde net
//   (T.aangelegdNet). Het volgt uit de kaart en de gebouwen, en staat dus niet in S: verandert de kaart (een gebouw
//   erbij, T.kaartVeranderd), dan legt het dorp het opnieuw, zodat een paadje nooit tegen een nieuw gebouw doodloopt.
// - Waar veel gelopen wordt, slijt het gras tot een paadje, zoals in Foundation: elke stap van een mens telt (T.telStap,
//   vanuit js/anim.js; een dier niet), en elke nacht wordt dat een gemiddelde over een paar weken (T.tikPadenDag). Komt
//   het boven wordtPad, dan is het een paadje; zakt het onder blijftPad, dan groeit het weer dicht. Dat staat wel in S
//   (w.paden), want het is wat er gebeurde.
// - Een lantaarn bij de deur van wat van het dorp is (`lantaarn` in T.GEBOUWEN: de kapel, de herberg, de markt, het
//   wachthuis) en op de kruisingen van het net, niet dichter bij ander licht dan lantaarnAfstand (T.zetLantaarns). Ze
//   branden 's avonds, zoals de lantaarns op de kaart (T.lichtBronnen, js/zien.js).
//
// Hoe het eruitziet, zegt T.zandHoeken. De grond van de kaart legt zijn soort op de hoeken van de tegels
// (T.sprites.grondHoeken, js/sprites.js), en een hoek wordt zand als twee van de vier tegels eromheen pad zijn, waarvan
// minstens één een paadje (de weg zelf blijft zoals de kaart hem legde). Zo is een recht paadje een tegel breed met een
// zachte rand, een schuin paadje smaller, en een losse tegel waar iemand eens stond niets. js/tekenen.js legt het in de
// buffer van de grond. Een pad loopt nog niet sneller (spel.md: besloten, maar de getallen zijn nog open).
(function (T) {
  'use strict';

  T.PADEN_INSTELLINGEN = {
    // De spelregel "Paadjes" (js/opties.js): 'lopen' (van elke deur, en waar veel gelopen wordt), 'deuren' (alleen
    // van elke deur) of 'uit'.
    paadjes: 'lopen',
    // Wat er gelopen wordt, telt als gemiddelde over zoveel dagen: een paadje komt en gaat in een paar weken.
    slijtDagen: 20,
    // Zoveel stappen per dag (gemiddeld) maken van gras een paadje, en daaronder groeit het weer dicht. Gemeten op 3
    // okt in het gehucht van 26 mensen: 157 tegels krijgen 3 stappen per dag of meer, vooral voor de deuren.
    wordtPad: 4,
    blijftPad: 2,
    // Zo ver (in stappen) zoekt een deur naar de weg of een ander paadje; verder weg krijgt hij er geen.
    deurZoekt: 40,
    // Een nieuwe lantaarn komt niet dichter dan zoveel tegels bij een andere, of bij de deur van de herberg.
    lantaarnAfstand: 8,
  };
  const IN = () => T.PADEN_INSTELLINGEN;

  const breedte = (w) => w.tegels[0].length;
  const hoogte = (w) => w.tegels.length;
  const binnen = (w, x, y) => x >= 0 && y >= 0 && x < breedte(w) && y < hoogte(w);
  const VIER = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  // Van een tegel naar zijn vier hoeken: noord, oost, zuid, west, zoals T.sprites.grondHoeken ze geeft (en zoals HOEK in
  // tekenWeides, js/tekenen.js). Hoek (x, y) is de noordhoek van tegel (x, y).
  const HOEK = [[0, 0], [1, 0], [1, 1], [0, 1]];

  // Wat er gelopen werd, in S (bij de kaart): vandaag (tegel → stappen), het gemiddelde (tegel → stappen per dag), welke
  // tegels nu paadje zijn, en een teller die verspringt als dat verandert (voor de buffer van de grond).
  function padenVan(w) {
    return w.paden || (w.paden = { vandaag: {}, slijt: {}, gesleten: new Set(), versie: 0 });
  }
  T.nieuwePaden = (w) => padenVan(w);

  // ---------------------------------------------------------------------------------------------
  // Het aangelegde net: van elke deur een paadje
  // ---------------------------------------------------------------------------------------------

  // Per kaart: { versie, net }, met in net per tegel 1 (de weg van de kaart, T.opPad), 2 (een paadje van een deur) of 0.
  // Zoals de lijst per tegel in js/wereld.js: geen spelstaat maar iets wat uit de kaart volgt, opnieuw na een verandering.
  const NETTEN = new WeakMap();

  // Mag een paadje hier lopen? Te belopen, geen veld, en niets erop (een bank, een lantaarn, een put).
  function magPad(w, x, y) {
    return binnen(w, x, y) && T.isBegaanbaar(w, x, y) && !T.veldOp(w, x, y) && !T.voorwerpOp(w, x, y);
  }

  // Van een deur naar het dichtste stuk net, in vier richtingen (zo loopt een paadje recht en slaat het een hoek om,
  // zoals mensen het aanleggen). Geeft de tegels van de deur tot vlak voor het net, of null.
  function naarHetNet(w, net, start) {
    const b = breedte(w);
    const s = start.x + start.y * b;
    if (net[s]) return [];
    const van = new Map([[s, -1]]);
    let rij = [s];
    for (let stap = 0; stap < IN().deurZoekt && rij.length; stap++) {
      const volgende = [];
      for (const k of rij) {
        const x = k % b;
        const y = (k - x) / b;
        for (const [dx, dy] of VIER) {
          const nx = x + dx;
          const ny = y + dy;
          if (!binnen(w, nx, ny)) continue;
          const nk = nx + ny * b;
          if (van.has(nk)) continue;
          if (net[nk]) {
            const pad = [];
            for (let j = k; j !== -1; j = van.get(j)) pad.push(j);
            return pad;
          }
          if (!magPad(w, nx, ny)) continue;
          van.set(nk, k);
          volgende.push(nk);
        }
      }
      rij = volgende;
    }
    return null;
  }

  // Hoe ver elke tegel van de weg ligt, in stappen (één keer over de kaart), om de deuren op volgorde te leggen.
  function afstandTotDeWeg(w, net) {
    const b = breedte(w);
    const af = new Int32Array(b * hoogte(w)).fill(-1);
    let rij = [];
    for (let k = 0; k < net.length; k++) if (net[k]) { af[k] = 0; rij.push(k); }
    while (rij.length) {
      const volgende = [];
      for (const k of rij) {
        const x = k % b;
        const y = (k - x) / b;
        for (const [dx, dy] of VIER) {
          const nx = x + dx;
          const ny = y + dy;
          const nk = nx + ny * b;
          if (!binnen(w, nx, ny) || af[nk] >= 0 || !magPad(w, nx, ny)) continue;
          af[nk] = af[k] + 1;
          volgende.push(nk);
        }
      }
      rij = volgende;
    }
    return af;
  }

  // Het net leggen: eerst de weg van de kaart, dan van elke deur een paadje, de deur die het dichtst bij de weg ligt
  // eerst, zodat wie verder weg woont aansluit op het paadje van zijn buur in plaats van ernaast een eigen te leggen.
  function legNet(D) {
    const w = D.wereld;
    const b = breedte(w);
    const net = new Uint8Array(b * hoogte(w));
    for (let y = 0; y < hoogte(w); y++) {
      for (let x = 0; x < b; x++) if (T.opPad(w, x, y) && !T.veldOp(w, x, y)) net[x + y * b] = 1;
    }
    if (IN().paadjes === 'uit' || !D.gebouwen) return net;
    const af = afstandTotDeWeg(w, net);
    const deuren = [];
    for (const g of D.gebouwen) {
      const d = T.deurVan(w, g);
      if (d && binnen(w, d.x, d.y)) deuren.push({ d, af: af[d.x + d.y * b] < 0 ? Infinity : af[d.x + d.y * b] });
    }
    deuren.sort((p, q) => p.af - q.af || p.d.y - q.d.y || p.d.x - q.d.x);
    for (const { d } of deuren) {
      const pad = naarHetNet(w, net, d);
      if (pad) for (const k of pad) net[k] = 2;
    }
    return net;
  }

  T.aangelegdNet = function (D) {
    const w = D.wereld;
    const versie = `${T.kaartVersie(w)}|${IN().paadjes}`;
    const al = NETTEN.get(w);
    if (al && al.versie === versie) return al.net;
    const net = legNet(D);
    NETTEN.set(w, { versie, net });
    return net;
  };

  // Is dit een paadje van een deur (aangelegd, niet gesleten)? Daar ontgint een boer niet (js/ontginnen.js).
  T.isAangelegdPaadje = (D, x, y) => binnen(D.wereld, x, y) && T.aangelegdNet(D)[x + y * breedte(D.wereld)] === 2;

  // Is dit een paadje (aangelegd, of gesleten waar gelopen wordt)? De weg van de kaart telt niet: die is er al.
  T.isPaadje = function (D, x, y) {
    const w = D.wereld;
    if (!binnen(w, x, y)) return false;
    if (T.isAangelegdPaadje(D, x, y)) return true;
    return IN().paadjes === 'lopen' && !!w.paden && w.paden.gesleten.has(x + y * breedte(w));
  };

  // Loopt hier een spoor: een paadje, of gras dat slijt waar elke dag gelopen wordt (gemiddeld blijftPad stappen per dag of
  // meer, ook voor het een paadje is dat je ziet)? Zo volgen de soldaten een boer naar zijn akker in het bos (werklijst
  // vraag 107, h; js/ontginnen.js): één gezin maakt er zo'n twee à drie stappen per dag (gemeten op 5 okt), en een
  // paadje vraagt er wordtPad.
  T.isSpoor = function (D, x, y) {
    const w = D.wereld;
    if (T.isPaadje(D, x, y)) return true;
    return IN().paadjes === 'lopen' && !!w.paden && binnen(w, x, y) && (w.paden.slijt[x + y * breedte(w)] || 0) >= IN().blijftPad;
  };

  // ---------------------------------------------------------------------------------------------
  // Slijten: waar gelopen wordt
  // ---------------------------------------------------------------------------------------------

  // Een mens zette een stap op deze tegel (js/anim.js, bij aankomst; een dier telt niet).
  T.telStap = function (w, x, y) {
    if (!w.paden || IN().paadjes !== 'lopen') return;
    const k = x + y * breedte(w);
    w.paden.vandaag[k] = (w.paden.vandaag[k] || 0) + 1;
  };

  // Mag hier een paadje slijten? Niet op een veld (daar maait en ploegt de boer, en het is al kale grond).
  const magSlijten = (w, k) => !T.veldOp(w, k % breedte(w), Math.floor(k / breedte(w)));

  // Elke nacht (vanuit T.tikGebouwenDag, js/gebouwen.js): wat er vandaag gelopen werd, in het gemiddelde; welke tegels
  // nu paadje zijn; en de lantaarns.
  T.tikPadenDag = function (D) {
    const w = D.wereld;
    if (!w || !w.tegels || !w.tegels.length) return; // een kaart zonder tegels (een toets van het vee): geen grond
    const P = padenVan(w);
    const a = 1 / IN().slijtDagen;
    const nieuw = {};
    for (const k of new Set([...Object.keys(P.slijt), ...Object.keys(P.vandaag)])) {
      // Naar beneden afgerond, anders bleef een klein getal hangen (0,09 maal 0,95 is weer 0,09); onder een tiende stap per
      // dag telt het niet meer, en zo blijft het bewaarde spel klein.
      const s = Math.floor(((P.slijt[k] || 0) * (1 - a) + (P.vandaag[k] || 0) * a) * 100) / 100;
      if (s >= 0.1) nieuw[k] = s;
    }
    P.slijt = nieuw;
    P.vandaag = {};
    let anders = false;
    for (const k of Object.keys(P.slijt)) {
      const i = Number(k);
      if (!P.gesleten.has(i) && P.slijt[k] >= IN().wordtPad && magSlijten(w, i)) {
        P.gesleten.add(i);
        anders = true;
      }
    }
    for (const i of [...P.gesleten]) {
      if (!((P.slijt[i] || 0) >= IN().blijftPad) || !magSlijten(w, i)) {
        P.gesleten.delete(i);
        anders = true;
      }
    }
    if (anders) P.versie++;
    T.zetLantaarns(D);
  };

  // ---------------------------------------------------------------------------------------------
  // Hoe het eruitziet
  // ---------------------------------------------------------------------------------------------

  // Een sleutel die verspringt als er iets aan de paadjes veranderde, voor de buffer van de grond (js/tekenen.js).
  T.padVersie = (D) => `${T.kaartVersie(D.wereld)}|${(D.wereld.paden && D.wereld.paden.versie) || 0}|${IN().paadjes}`;

  // Per hoek van de kaart ((breedte + 1) × (hoogte + 1), hoek (x, y) is de noordhoek van tegel (x, y)): 1 als hij zand
  // wordt. Een hoek wordt zand als twee van de vier tegels eromheen pad zijn (een paadje of de weg), waarvan minstens één
  // een paadje: zo sluit een paadje aan op de weg, en blijft de weg zelf zoals de kaart hem legde.
  const HOEKEN = new WeakMap();
  T.zandHoeken = function (D) {
    const w = D.wereld;
    const sleutel = T.padVersie(D);
    const al = HOEKEN.get(w);
    if (al && al.sleutel === sleutel) return al.zand;
    const b = breedte(w);
    const h = hoogte(w);
    const net = T.aangelegdNet(D);
    const gesleten = IN().paadjes === 'lopen' && w.paden ? w.paden.gesleten : null;
    const eigen = new Uint8Array(b * h);
    for (let k = 0; k < net.length; k++) if (net[k] === 2 || (gesleten && gesleten.has(k))) eigen[k] = 1;
    const zand = new Uint8Array((b + 1) * (h + 1));
    for (let y = 0; y <= h; y++) {
      for (let x = 0; x <= b; x++) {
        let paadje = 0;
        let pad = 0;
        for (const [tx, ty] of [[x - 1, y - 1], [x, y - 1], [x - 1, y], [x, y]]) {
          if (tx < 0 || ty < 0 || tx >= b || ty >= h) continue;
          const k = tx + ty * b;
          if (eigen[k]) paadje++;
          if (eigen[k] || net[k]) pad++;
        }
        if (paadje >= 1 && pad >= 2) zand[x + y * (b + 1)] = 1;
      }
    }
    HOEKEN.set(w, { sleutel, zand });
    return zand;
  };

  // De hoeken van deze tegel met de paadjes erin: wat gras was en zand wordt, is zandpad. Geeft null als er niets
  // verandert. `oud` zijn de hoeken zoals de kaart ze legde (T.sprites.grondHoeken).
  T.hoekenMetPaden = function (D, zand, x, y, oud) {
    if (!oud) return null;
    const b = breedte(D.wereld) + 1;
    let anders = false;
    const nieuw = oud.map((soort, i) => {
      if (soort !== 'gras' || !zand[x + HOEK[i][0] + (y + HOEK[i][1]) * b]) return soort;
      anders = true;
      return 'zandpad';
    });
    return anders ? nieuw : null;
  };

  // ---------------------------------------------------------------------------------------------
  // De lantaarns
  // ---------------------------------------------------------------------------------------------

  // Een plek voor een lantaarn naast deze tegel: te belopen grond zonder iets erop, geen veld, geen erf, geen pad en
  // geen deur. De eerste die past, in een vaste volgorde.
  const NAAST = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
  function plekNaast(D, t, net, deuren) {
    const w = D.wereld;
    const b = breedte(w);
    for (const [dx, dy] of NAAST) {
      const x = t.x + dx;
      const y = t.y + dy;
      if (!magPad(w, x, y) || net[x + y * b] || T.erfOp(D, x, y) || deuren.has(x + y * b)) continue;
      if (T.opHetPlein(w, x, y)) continue; // het plein blijft open
      return { x, y };
    }
    return null;
  }

  function zetLantaarn(w, plek) {
    const t = T.opzoekTegelNaam('lantaarn');
    if (!t) return null;
    if (!T.VOORWERPEN.lantaarn) T.VOORWERPEN.lantaarn = { blokkeert: !!t.eig.vast, zichtDicht: !!t.eig.vast };
    return T.zetVoorwerp(w, { soort: 'lantaarn', x: plek.x, y: plek.y, vel: t.vel, id: t.id, beslaat: [1, 1], vanHetDorp: true });
  }

  // Een lantaarn bij de deur van wat van het dorp is, als die klaar is en er nog geen staat; en op elke kruising van het
  // net (drie of vier kanten pad, waarvan minstens één een paadje van een deur) waar nog geen licht in de buurt is.
  T.zetLantaarns = function (D) {
    const w = D.wereld;
    if (!D.gebouwen || !w.tegels || !T.opzoekTegelNaam('lantaarn')) return;
    const b = breedte(w);
    const deuren = new Set();
    for (const g of D.gebouwen) {
      const d = T.deurVan(w, g);
      if (d) deuren.add(d.x + d.y * b);
    }
    const net = T.aangelegdNet(D);
    const lichten = w.voorwerpen.filter((v) => v.soort === 'lantaarn').map((v) => ({ x: v.x, y: v.y }));
    for (const g of D.gebouwen) {
      if (!g.klaar || !(T.GEBOUWEN[g.soort] && T.GEBOUWEN[g.soort].lantaarn)) continue;
      const deur = T.deurVan(w, g);
      if (!deur || lichten.some((l) => T.afstand(l, deur) <= 2)) continue;
      const plek = plekNaast(D, deur, net, deuren);
      if (plek && zetLantaarn(w, plek)) lichten.push(plek);
    }
    if (IN().paadjes === 'uit') return;
    // De herberg brandt al 's avonds (T.herbergLicht, js/herberg.js): daar komt geen lantaarn op de kruising naast.
    for (const g of T.herbergenVan(D)) lichten.push(T.deurVan(w, g));
    const ver = IN().lantaarnAfstand;
    for (let k = 0; k < net.length; k++) {
      if (!net[k]) continue;
      const x = k % b;
      const y = (k - x) / b;
      let kanten = 0;
      let paadje = net[k] === 2;
      for (const [dx, dy] of VIER) {
        const nx = x + dx;
        const ny = y + dy;
        if (!binnen(w, nx, ny) || !net[nx + ny * b]) continue;
        kanten++;
        if (net[nx + ny * b] === 2) paadje = true;
      }
      if (kanten < 3 || !paadje || lichten.some((l) => T.afstand(l, { x, y }) < ver)) continue;
      const plek = plekNaast(D, { x, y }, net, deuren);
      if (plek && zetLantaarn(w, plek)) lichten.push(plek);
    }
  };
})(globalThis.Spel = globalThis.Spel || {});
