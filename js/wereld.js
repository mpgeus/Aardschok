// De wereld: tegels, kamers, deuren, voorwerpen en wezens, en de vragen die de rest van het
// spel erover stelt: kan ik hier staan, zie ik daar iets, in welke kamer ligt dit.
//
// Een wereld komt uit een kaart (js/kaart.js). Tot 24 sep 2026 stond hier ook de toren van het
// oude spel, met de hand opgeschreven (T.maakWereld); die ging eruit met het oude spel (werklijst
// punt 7). De machinerie voor binnen bleef: kamers die je ontdekt, deuren, zicht per kamer, en een
// gevecht dat binnen begint (js/gevecht.js). De plattegrond van de toren leeft voort als
// toetsdecor, in test/decor/binnen.cjs.
(function (T) {
  'use strict';

  // Welke soorten voorwerpen er zijn en wat ze doen. blokkeert: je kunt er niet op staan.
  // zichtDicht: je kijkt er niet langs. voet (mag weg): een voorwerp dat meer dan één tegel
  // beslaat, zie T.voetVan hieronder.
  //
  // Leeg om mee te beginnen: js/kaart.js zet er elke soort bij die op een kaart staat (een eik,
  // een huis), en js/gebouwen.js elk gebouw dat de speler neerzet. Tot 24 sep stonden hier de
  // meubels van de toren (een fontein, kisten, een trap, een sleutel, een ton).
  T.VOORWERPEN = {};

  // ap: actiepunten per beurt. snelheid: tegels per seconde tijdens het rondlopen.
  // zicht: vanaf hoe ver een monster je opmerkt. aanval.schade: hoeveel levenspunten een klap kost
  // (tussen de twee getallen). Namen staan met een kleine letter, omdat ze bijna altijd midden in
  // een zin staan.
  //
  // De levenspunten van de schout zijn voorlopig (Marcel, 24 sep 2026; werklijst punt 7): een
  // gewone balk, zodat een gevecht blijft werken. Het echte ontwerp komt bij punt 13, als er weer
  // gevochten wordt. De schade van de monsters is de helft van wat een klap vroeger aan maanden
  // kostte, naar boven afgerond: hun onderlinge sterkte blijft zo gelijk.
  T.SCHOUT_SNELHEID = 2.5; // tegels per seconde; een dorpeling doet 1,2
  const WEZENS = {
    held: { naam: 'jij', kant: 'held', leven: 24, ap: 8, initiatief: 10, snelheid: T.SCHOUT_SNELHEID },
    // De mensen van het dorp staan niet hier maar in js/mensen.js: wie ze zijn, hoe ze heten, hoe
    // snel ze lopen en welk vel ze krijgen. Deze tabel gaat over wat een wezen ís — wat vecht,
    // wat een leeftijd draagt, wat in code wordt neergezet — en een dorpeling is dat niet. Zie
    // ontwerp/wereld.md, "Wie is wie, als het er honderd worden".
    slijm: {
      naam: 'slijmkruiper', kant: 'monster', leven: 10, ap: 4, initiatief: 4, snelheid: 1.4, zicht: 5, dwaalt: true,
      aanval: { kosten: 3, schade: [2, 3], zin: 'bijt je' },
    },
    skelet: {
      naam: 'skeletwacht', kant: 'monster', leven: 18, ap: 6, initiatief: 6, snelheid: 2.2, zicht: 5, dwaalt: false,
      aanval: { kosten: 3, schade: [3, 5], zin: 'raakt je met zijn zwaard' },
    },
    // Buiten, in het bos om het erf. Hij loopt harder dan de tovenaar en ziet verder dan wat er
    // binnen rondloopt: buiten is er ruimte, en een wolf hoort eerder op te vallen dan een
    // slijmkruiper in een kelder. Sluipen (T.SLUIP_ZICHT) scheelt dan twee tegels, en dat is
    // precies genoeg om hem te ontlopen als je hem op tijd ziet.
    wolf: {
      naam: 'wolf', kant: 'monster', leven: 12, ap: 6, initiatief: 8, snelheid: 2.6, zicht: 6, dwaalt: true,
      aanval: { kosten: 3, schade: [2, 4], zin: 'bijt je' },
    },
    // Dieper het bos in. De sleutel is hier de naam: js/sprites.js zoekt het figuur op de soort
    // op, dus deze twee heten precies zoals hun animatievellen in beelden/figuren
    // (bosvijanden-anim.cjs, via naar-spel.cjs). Zo kan Marcel ze in Tiled neerzetten met
    // wezen="reuzenspin" of wezen="kobold", zonder dat er nog ergens iets bij moet.
    //
    // De spin is traag maar taai en bijt gif: wie haar ziet aankomen, loopt om. De kobold loopt
    // bijna zo hard als een wolf en steekt met een speer, dus hij is juist niet te ontlopen.
    reuzenspin: {
      naam: 'reuzenspin', kant: 'monster', leven: 14, ap: 5, initiatief: 5, snelheid: 2.0, zicht: 6, dwaalt: true,
      aanval: { kosten: 3, schade: [3, 4], zin: 'bijt je met haar giftanden' },
    },
    kobold: {
      naam: 'kobold', kant: 'monster', leven: 16, ap: 6, initiatief: 7, snelheid: 2.4, zicht: 6, dwaalt: true,
      aanval: { kosten: 3, schade: [2, 4], zin: 'steekt je met zijn speer' },
    },
  };

  const sleutelVan = (x, y) => x + ',' + y;

  // Zodat js/kaart.js (en js/mensen.js) een wezen uit een ingelezen kaart in precies dezelfde vorm
  // kan neerzetten; de vorm zelf (WEZENS, maakWezen) blijft hier, en verandert niet.
  T.maakWezen = maakWezen;
  // De tabel zelf gaat mee naar buiten, want dit is precies de lijst die Marcel in Tiled mag
  // invullen bij de eigenschap "wezen". Wie wil weten wat er te plaatsen valt, vraagt het hier.
  T.WEZENS = WEZENS;

  T.hoofdletter = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  T.tegelVan = (e) => ({ x: e.tx, y: e.ty });
  // Afstand in stappen: schuin telt als één stap, net als bij het lopen.
  T.afstand = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
  // Hoe snel loopt dit wezen? Elk wezen heeft zijn eigen vaste snelheid: zijn animatie is op
  // precies die loopsnelheid afgestemd, anders glijden zijn voeten over de grond.
  T.snelheidVan = (e) => e.snelheid;

  // x en y lopen vloeiend mee tijdens het lopen; tx en ty zijn de tegel waar het wezen
  // staat of naartoe stapt. Wie iets over bezetting vraagt, vraagt tx en ty.
  function maakWezen(soort, x, y) {
    const s = WEZENS[soort];
    return {
      soort, naam: s.naam, kant: s.kant,
      x, y, tx: x, ty: y, pad: [], onderweg: false, opKlaar: null,
      leven: s.leven, maxLeven: s.leven, ap: s.ap, maxAp: s.ap,
      initiatief: s.initiatief, snelheid: s.snelheid, zicht: s.zicht || 0,
      // Waar hij hoort en hoe ver hij daarvandaan dwaalt. Zonder thuis blijft hij in zijn eigen
      // kamer; dat werkt binnen, maar buiten is de hele kaart één kamer (zie T.laatDwalen).
      dwaalt: !!s.dwaalt, thuis: s.straal ? { x, y } : null, straal: s.straal || 0,
      aanval: s.aanval || null,
      // Een geleend vel, zolang dit figuur nog niet getekend is (js/sprites.js, S.houding).
      vel: s.vel || null,
      dwaalTijd: 1 + Math.random() * 2, fase: Math.random() * 6.28,
      dood: false, sterfTijd: 0, uitval: null, flits: 0, alarm: 0,
      vraag: 0, // het vraagteken boven het hoofd: dit wezen heeft iets gezien wat de held niet is
    };
  }

  // Per tegel: welke kamers liggen er direct omheen (ook schuin). Een muur of deur is
  // zichtbaar zodra een van die kamers bekend is (T.isZichtbaar hieronder). Wie een wereld met
  // kamers maakt, zet dit erbij als w.burenKamers, nadat de tegels en de kamers er zijn.
  T.burenKamers = function (w) {
    const r = [];
    for (let y = 0; y < w.h; y++) {
      const rij = [];
      for (let x = 0; x < w.b; x++) {
        const s = new Set();
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const k = T.kamerVan(w, x + dx, y + dy);
            if (k) s.add(k.id);
          }
        }
        rij.push([...s]);
      }
      r.push(rij);
    }
    return r;
  };

  T.tegel = (w, x, y) => (x >= 0 && y >= 0 && x < w.b && y < w.h ? w.tegels[y][x] : 'buiten');
  T.deurOp = (w, x, y) => w.deuren.get(sleutelVan(x, y)) || null;
  T.kamerVan = (w, x, y) => w.kamers.find((k) => x >= k.x1 && x <= k.x2 && y >= k.y1 && y <= k.y2) || null;
  // Een voorwerp staat meestal op één tegel, maar kan er meer beslaan (een spiraaltrap van drie
  // bij drie, in het toetsdecor). `voet` geeft die rechthoek ten opzichte van de tegel van het
  // voorwerp zelf, als {dx, dy, b, h}. Die tegel is dan de voorste hoek (de hoogste x+y), want
  // daarop sorteert het tekenen; de voet loopt dus naar achteren, met negatieve dx en dy.
  T.voetVan = function (v) {
    const f = v.voet || (T.VOORWERPEN[v.soort] && T.VOORWERPEN[v.soort].voet);
    if (!f) return { x1: v.x, y1: v.y, x2: v.x, y2: v.y };
    return { x1: v.x + f.dx, y1: v.y + f.dy, x2: v.x + f.dx + f.b - 1, y2: v.y + f.dy + f.h - 1 };
  };

  T.voorwerpOp = function (w, x, y) {
    return w.voorwerpen.find((v) => {
      const f = T.voetVan(v);
      return x >= f.x1 && x <= f.x2 && y >= f.y1 && y <= f.y2;
    }) || null;
  };
  T.wezenOp = (w, x, y, behalve) => w.wezens.find((e) => !e.dood && e !== behalve && e.tx === x && e.ty === y) || null;

  // Mag je deze tegel op? deurenOpenen: een dichte deur telt als doorgang (de held duwt
  // hem open, een monster niet). wezensBlokkeren: andere wezens staan in de weg.
  T.isBegaanbaar = function (w, x, y, opties) {
    const o = opties || {};
    const t = T.tegel(w, x, y);
    if (t === 'muur' || t === 'buiten') return false;
    if (t === 'deur') {
      const d = T.deurOp(w, x, y);
      if (d.staat === 'opslot') return false;
      if (d.staat === 'dicht' && !o.deurenOpenen) return false;
    }
    const v = T.voorwerpOp(w, x, y);
    if (v && T.VOORWERPEN[v.soort].blokkeert) return false;
    if (o.wezensBlokkeren && T.wezenOp(w, x, y, o.wie)) return false;
    return true;
  };

  // Houdt deze tegel een schuine stap om de hoek tegen? Alleen vaste dingen tellen: een
  // wezen dat schuin naast je staat, sluit de doorgang niet af.
  T.isVast = function (w, x, y) {
    const t = T.tegel(w, x, y);
    if (t === 'muur' || t === 'buiten') return true;
    if (t === 'deur' && T.deurOp(w, x, y).staat !== 'open') return true;
    const v = T.voorwerpOp(w, x, y);
    return !!(v && T.VOORWERPEN[v.soort].blokkeert);
  };

  // Twee tegels raken elkaar als ze naast elkaar liggen, ook schuin, maar niet schuin
  // om een muurhoek heen. Dat geldt voor slaan, praten en iets gebruiken.
  T.raakt = function (w, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== 1) return false;
    if (dx !== 0 && dy !== 0) return !T.isVast(w, a.x + dx, a.y) && !T.isVast(w, a.x, a.y + dy);
    return true;
  };

  T.blokkeertZicht = function (w, x, y) {
    const t = T.tegel(w, x, y);
    if (t === 'muur' || t === 'buiten') return true;
    if (t === 'deur' && T.deurOp(w, x, y).staat !== 'open') return true;
    const v = T.voorwerpOp(w, x, y);
    return !!(v && T.VOORWERPEN[v.soort].zichtDicht);
  };

  // Zicht langs een lijn van tegelmidden naar tegelmidden (Bresenham). De begin- en
  // eindtegel tellen niet mee: wie in een deuropening staat, ziet eruit.
  T.zicht = function (w, a, b) {
    let x = a.x;
    let y = a.y;
    const dx = Math.abs(b.x - x);
    const dy = -Math.abs(b.y - y);
    const sx = x < b.x ? 1 : -1;
    const sy = y < b.y ? 1 : -1;
    let fout = dx + dy;
    for (;;) {
      if (x === b.x && y === b.y) return true;
      const f2 = 2 * fout;
      if (f2 >= dy) { fout += dy; x += sx; }
      if (f2 <= dx) { fout += dx; y += sy; }
      if (x === b.x && y === b.y) return true;
      if (T.blokkeertZicht(w, x, y)) return false;
    }
  };

  // Een lijn is niet altijd heen en terug dezelfde; zien werkt hier twee kanten op.
  T.zichtTussen = (w, a, b) => T.zicht(w, a, b) || T.zicht(w, b, a);

  T.isZichtbaar = function (w, x, y) {
    const t = T.tegel(w, x, y);
    if (t === 'buiten') return false;
    if (t === 'vloer') return w.bekend.has(T.kamerVan(w, x, y).id);
    return w.burenKamers[y][x].some((id) => w.bekend.has(id));
  };

  // Wie in een deuropening staat of een deur opendoet, kijkt in de kamers aan beide kanten.
  T.ontdekBijDeur = function (w, d) {
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const k = T.kamerVan(w, d.x + dx, d.y + dy);
      if (k) w.bekend.add(k.id);
    }
  };
})(globalThis.Toren = globalThis.Toren || {});
