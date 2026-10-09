// Het weer (werklijst vraag 77, stap 2, en vraag 82, c; Marcel, 9 okt: "1. Beiden 2. Ook in beeld 3. Ja kleine beekjes
// ook, goed idee!"): elke dag zon, wolken, regen of sneeuw, uit het nummer van het land en de dag (geen Math.random, zodat
// hetzelfde spel hetzelfde weer heeft, en de speeltest met hetzelfde zaad hetzelfde jaar). Het weer van gisteren telt mee:
// wie nat begint, blijft vaker nat, en elk jaar is wat droger of natter dan het vorige.
//
// Valt er in het groeiseizoen lang geen regen, dan komt er droogte, en erger: ernstige droogte (een status, T.OORZAKEN in
// js/voorvallen.js). Het dorp telt een watertekort (`tekort`): elke droge dag één erbij, elke natte dag er een paar af.
// Zolang het droog is, verliezen de akkers van hun oogst (`verlies`, T.droogteFactor in T.oogstPerTegel, js/akkers.js),
// tot op 1 lentemaand het jaar opnieuw begint. En de kleine beekjes vallen droog (T.isBeek): een visser die alleen aan een
// beek staat, vangt niets meer, en een visser met ook groot water vangt naar wat er van zijn water over is
// (T.visserWater, vanuit T.tikGebouwenDag). Het beeld ervan (regen, sneeuw, de kleur van de lucht en de droge beek) tekent
// js/tekenen.js; wat het weer vandaag is, staat in `D.weer`.
//
// De spelregel "Het weer": aan, alleen te zien (zonder droogte), of uit (zoals vóór 9 okt: altijd zon).
(function (T) {
  'use strict';

  T.WEER_INSTELLINGEN = {
    // Is er weer (de spelregel "Het weer")? Zonder is het altijd zon, en is er geen droogte.
    aan: true,
    // Doet de droogte iets (de spelregel)? Zonder regent het wel, maar verliezen de akkers en de beekjes niets.
    droogte: true,
    // De kans op regen (of sneeuw in de winter) op een dag na een droge dag, per seizoen.
    regenKans: { lente: 0.35, zomer: 0.22, herfst: 0.4, winter: 0.35 },
    // De kans dat het na een natte dag nat blijft.
    blijftNat: 0.55,
    // Elk jaar is wat droger of natter: de kans op regen maal een getal van jaarVan tot jaarTot, uit het nummer en het jaar.
    jaarVan: 0.55,
    jaarTot: 1.35,
    // De kans op wolken op een droge dag.
    wolkenKans: 0.3,
    // De maanden waarin de akkers water nodig hebben, en waarin droogte telt.
    groeiseizoen: ['grasmaand', 'bloeimaand', 'zomermaand', 'hooimaand', 'oogstmaand'],
    // Het watertekort: elke droge dag in het groeiseizoen +1, elke natte dag regenMaaktGoed eraf. Vanaf droogteVanaf is
    // het droogte, vanaf ernstigVanaf ernstige droogte. Zo (9 okt, 200 jaren uit 40 nummers) is er in twee van de vijf
    // jaren een tijd droogte, in één van de twaalf ernstige droogte, en kost het de oogst gemiddeld een twintigste.
    regenMaaktGoed: 5,
    droogteVanaf: 18,
    ernstigVanaf: 30,
    // Wat een dag droogte de oogst van dat jaar kost (een deel ervan), en hoeveel hooguit.
    verliesPerDag: { droogte: 0.01, ernstig: 0.02 },
    verliesHooguit: 0.5,
    // Een stuk water is een beekje (of een vijver) als het nergens zoveel tegels breed is (T.isBeek): de beek met het
    // bruggetje in het gehucht valt droog, een meer, een brede rivier en de zee niet.
    meerBreed: 7,
    // Het beeld (js/tekenen.js): de kleur van het licht maal tint (met de videokaart), of een grijze waas (zonder); regen
    // als strepen en sneeuw als vlokjes, zoveel per 10.000 pixels en hooguit zoveel, met hun snelheid in pixels per
    // seconde; en de barsten en keien in de bedding van een droge beek.
    beeld: {
      tint: { zon: [1, 1, 1], wolken: [0.88, 0.9, 0.95], regen: [0.7, 0.75, 0.84], sneeuw: [0.92, 0.95, 1.02] },
      waas: { zon: 0, wolken: 0.08, regen: 0.2, sneeuw: 0.06 },
      druppels: 7,
      vlokken: 6,
      hooguit: 1600,
      druppelLengte: 18,
      valRegen: 900,
      valSneeuw: 55,
      wind: 0.12,
      windSneeuw: 14,
      regenKleur: 'rgba(206, 218, 236, 0.62)',
      sneeuwKleur: 'rgba(246, 248, 255, 0.92)',
      barstKleur: '#4f3e2b',
      keiKleur: '#b3a184',
    },
  };
  const IN = () => T.WEER_INSTELLINGEN;

  // Een getal van 0 tot 1 uit het nummer, de dag en een kanaal: hetzelfde getal voor dezelfde vraag, in elke browser.
  function lot(zaad, dag, kanaal) {
    let h = Math.imul((zaad | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(dag | 0, 0xc2b2ae35) ^ Math.imul(kanaal | 0, 0x27d4eb2f);
    h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
    h = Math.imul(h ^ (h >>> 12), 0x297a2d39);
    h ^= h >>> 15;
    return (h >>> 0) / 4294967296;
  }
  const zaadVan = (D) => (D.wereld && D.wereld.maker && D.wereld.maker.zaad) || (D.lot && D.lot.zaad) || 1;
  // Ook voor andere regels die een vast lot willen uit het nummer van het land (de bode, js/bode.js).
  T.vastLot = (D, a, b) => lot(zaadVan(D), a, b);
  const jaarVan = (dag) => Math.floor(dag / T.DAGEN_PER_JAAR);

  // Hoe nat dit jaar is: de kans op regen maal dit getal.
  T.natVanJaar = (D, dag) => IN().jaarVan + (IN().jaarTot - IN().jaarVan) * lot(zaadVan(D), jaarVan(dag), 771);

  // Het weer van vandaag, of null zonder weer (de spelregel, of een dag die nog niet getikt is).
  T.weerVan = (D) => (IN().aan && D && D.weer ? D.weer : null);
  const nat = (w) => w === 'regen' || w === 'sneeuw';
  T.isNat = (D) => !!(T.weerVan(D) && nat(D.weer.vandaag));
  const inGroeiseizoen = (dag) => IN().groeiseizoen.includes(T.MAANDEN[T.datumVanDag(dag).maand].naam);

  // Het niveau van de droogte: 0 geen, 1 droogte, 2 ernstige droogte.
  T.droogteNiveau = function (D) {
    const W = T.weerVan(D);
    if (!W || !IN().droogte) return 0;
    return W.tekort >= IN().ernstigVanaf ? 2 : W.tekort >= IN().droogteVanaf ? 1 : 0;
  };

  // Welk deel van zijn oogst een akker dit jaar nog geeft (T.oogstPerTegel in js/akkers.js): 1 zonder droogte.
  T.droogteFactor = (D) => {
    const W = T.weerVan(D);
    return W && IN().droogte ? 1 - (W.verlies || 0) : 1;
  };

  // Elke nacht, als eerste (T.tikGebouwenDag, js/gebouwen.js): het weer van de dag die begint, het watertekort en wat de
  // droogte de oogst kost.
  T.tikWeerDag = function (D, dag) {
    if (!IN().aan) {
      if (D.weer) delete D.weer;
      return;
    }
    const W = D.weer || (D.weer = { vandaag: 'zon', droog: 0, tekort: 0, verlies: 0 });
    if (W.dag === dag) return;
    const gisteren = W.vandaag;
    const datum = T.datumVanDag(dag);
    const zaad = zaadVan(D);
    const kans = nat(gisteren) ? IN().blijftNat : (IN().regenKans[datum.seizoen] || 0) * T.natVanJaar(D, dag);
    const valt = lot(zaad, dag, 1) < kans;
    W.dag = dag;
    W.vandaag = valt ? (datum.seizoen === 'winter' ? 'sneeuw' : 'regen') : lot(zaad, dag, 2) < IN().wolkenKans ? 'wolken' : 'zon';
    W.droog = valt ? 0 : (W.droog || 0) + 1;
    // Op 1 lentemaand begint het jaar van de akkers opnieuw: wat de droogte vorig jaar kostte, telt niet meer.
    // Een nieuw jaar: wat de droogte vorig jaar nam, onthoudt het dorp (de marskramer neemt dan meer zaaigraan mee,
    // js/handel.js).
    if (T.MAANDEN[datum.maand].naam === 'lentemaand' && datum.dagVanMaand === 1) {
      W.vorigJaar = W.verlies || 0;
      W.verlies = 0;
    }
    if (inGroeiseizoen(dag)) W.tekort = valt ? Math.max(0, W.tekort - IN().regenMaaktGoed) : W.tekort + 1;
    else W.tekort = valt ? 0 : Math.max(0, W.tekort - 1);
    const niveau = T.droogteNiveau(D);
    if (niveau && inGroeiseizoen(dag)) {
      const per = niveau === 2 ? IN().verliesPerDag.ernstig : IN().verliesPerDag.droogte;
      W.verlies = Math.min(IN().verliesHooguit, (W.verlies || 0) + per);
    }
    // Vallen de beekjes droog, of komen ze terug, dan verandert de grond (js/tekenen.js tekent hem opnieuw).
    const beekDroog = niveau > 0;
    if (!!W.beekDroog !== beekDroog) {
      W.beekDroog = beekDroog;
      W.beekVersie = (W.beekVersie || 0) + 1;
    }
  };

  // Hoe het weer heet, voor de balk en het rapport.
  T.WEER_NAMEN = { zon: 'zon', wolken: 'bewolkt', regen: 'regen', sneeuw: 'sneeuw' };

  // De beekjes: per kaart één keer, niet in Spel.S (de kaart onthoudt het tot hij verandert, T.kaartVersie). Een stuk
  // water dat aan elkaar zit, is een beekje (of een vijver) als het nergens meerBreed tegels breed is: geen tegel met
  // binnen (meerBreed - 1) / 2 tegels om zich heen alleen water. Zo valt een beek helemaal droog, en een meer niet.
  const beken = new WeakMap();
  function bekenVan(w) {
    const versie = T.kaartVersie(w);
    const oud = beken.get(w);
    if (oud && oud.versie === versie) return oud.set;
    const set = new Set();
    const h = (w.grond || []).length;
    const b = h ? w.grond[0].length : 0;
    const water = (x, y) => !!(w.grond[y] && w.grond[y][x] && w.grond[y][x].naam === 'water');
    // Hoeveel water er in een rechthoek ligt, met een tabel van sommen.
    const som = new Int32Array((b + 1) * (h + 1));
    for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) som[(y + 1) * (b + 1) + x + 1] = (water(x, y) ? 1 : 0) + som[y * (b + 1) + x + 1] + som[(y + 1) * (b + 1) + x] - som[y * (b + 1) + x];
    const r = Math.floor((IN().meerBreed - 1) / 2);
    const vol = (x, y) => {
      if (x - r < 0 || y - r < 0 || x + r >= b || y + r >= h) return false;
      const n = som[(y + r + 1) * (b + 1) + x + r + 1] - som[(y - r) * (b + 1) + x + r + 1] - som[(y + r + 1) * (b + 1) + x - r] + som[(y - r) * (b + 1) + x - r];
      return n === (2 * r + 1) * (2 * r + 1);
    };
    const gezien = new Uint8Array(b * h);
    for (let y0 = 0; y0 < h; y0++) {
      for (let x0 = 0; x0 < b; x0++) {
        if (gezien[y0 * b + x0] || !water(x0, y0)) continue;
        const stuk = [];
        let breed = false;
        const rij = [[x0, y0]];
        gezien[y0 * b + x0] = 1;
        while (rij.length) {
          const [x, y] = rij.pop();
          stuk.push(y * 100000 + x);
          if (!breed && vol(x, y)) breed = true;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= b || ny >= h || gezien[ny * b + nx] || !water(nx, ny)) continue;
            gezien[ny * b + nx] = 1;
            rij.push([nx, ny]);
          }
        }
        if (!breed) for (const k of stuk) set.add(k);
      }
    }
    beken.set(w, { versie, set });
    return set;
  }
  // Is deze tegel water van een beekje (dat bij droogte droogvalt)?
  T.isBeek = (w, x, y) => bekenVan(w).has(y * 100000 + x);
  // Staat deze tegel nu droog: een beekje, in de droogte?
  T.staatDroog = (D, x, y) => !!(T.weerVan(D) && D.weer.beekDroog && IN().droogte && T.isBeek(D.wereld, x, y));
  // De hoeken van een grondtegel (noord, oost, zuid, west, zoals T.sprites.grondHoeken ze geeft), met het water van een
  // droge beek als zandpad, zodat js/tekenen.js de tegel uit hetzelfde vel neemt die die hoeken heeft (zoals een paadje,
  // T.hoekenMetPaden in js/paden.js): de bedding met de zachte rand van het gras eromheen. Null als er niets verandert.
  const HOEK = [[0, 0], [1, 0], [1, 1], [0, 1]];
  T.hoekenDroog = function (D, x, y, oud) {
    if (!oud || !T.weerVan(D) || !D.weer.beekDroog || !IN().droogte) return null;
    let anders = false;
    const nieuw = oud.map((soort, i) => {
      if (soort !== 'water') return soort;
      const vx = x + HOEK[i][0];
      const vy = y + HOEK[i][1];
      for (const [tx, ty] of [[vx - 1, vy - 1], [vx, vy - 1], [vx - 1, vy], [vx, vy]]) {
        if (!T.isBeek(D.wereld, tx, ty)) continue;
        anders = true;
        return 'zandpad';
      }
      return soort;
    });
    return anders ? nieuw : null;
  };

  // De tegels van alle beekjes, voor het tekenen: [{ x, y }].
  T.beekTegels = (w) => [...bekenVan(w)].map((k) => ({ x: k % 100000, y: Math.floor(k / 100000) }));

  // Welk deel van zijn water een visser nog heeft: 1, of in de droogte het deel dat geen beekje is (T.tikGebouwenDag).
  T.visserWater = function (D, g) {
    if (g.soort !== 'visser' || !T.droogteNiveau(D)) return 1;
    const bij = T.GEBOUWEN.visser.bij;
    const w = D.wereld;
    const r = T.voetVanGebouw(g);
    let alles = 0;
    let beek = 0;
    for (let y = Math.max(0, r.y - bij.straal); y < Math.min(w.grond.length, r.y + r.h + bij.straal); y++) {
      for (let x = Math.max(0, r.x - bij.straal); x < r.x + r.b + bij.straal; x++) {
        if (!T.NATUUR.water.telt(w, x, y)) continue;
        alles++;
        if (T.isBeek(w, x, y)) beek++;
      }
    }
    return alles ? (alles - beek) / alles : 1;
  };
  // Waarom een visser vandaag niets vangt, of null: zijn beek staat droog.
  T.waaromVistHijNiet = (D, g) => (g.soort === 'visser' && T.visserWater(D, g) <= 0 ? 'de beek staat droog' : null);
})(globalThis.Spel = globalThis.Spel || {});
