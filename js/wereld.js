// De wereld: één verdieping van de toren. Plattegrond, kamers, deuren, voorwerpen en
// wezens, plus de vragen die de rest van het spel erover stelt: kan ik hier staan,
// zie ik daar iets, in welke kamer ligt dit.
(function (T) {
  'use strict';

  // Legenda: # muur, . vloer, D deur (dicht), L deur (op slot), spatie = buiten de toren.
  // De deur helemaal links in rij 5 is de buitendeur: daarachter ligt het erf (zie OVERGANGEN).
  const PLATTEGROND = [
    '####################',
    '#........#.........#',
    '#........#.........#',
    '#........#.........#',
    '#........D.........#',
    'D........#.........#',
    '#........#.........#',
    '#........#.........#',
    '####L###############',
    '#........#          ',
    '#........#          ',
    '#........#          ',
    '#........#          ',
    '#........#          ',
    '#........#          ',
    '##########          ',
  ];

  // Een kamer is een rechthoek vloer. De muren eromheen horen er niet bij: een muur
  // scheidt twee kamers, en welke kant de voorkant is, hangt af van waar je staat.
  const KAMERS = [
    { id: 'hal', naam: 'De hal', x1: 1, y1: 1, x2: 8, y2: 7, vloer: ['#6e5c48', '#675643'] },
    { id: 'opslag', naam: 'De voorraadkamer', x1: 10, y1: 1, x2: 18, y2: 7, vloer: ['#5f4b37', '#584532'] },
    { id: 'trap', naam: 'Het trappenhuis', x1: 1, y1: 9, x2: 8, y2: 14, vloer: ['#51555a', '#4b4f54'] },
  ];

  // blokkeert: je kunt er niet op staan. zichtDicht: je kijkt er niet langs.
  T.VOORWERPEN = {
    fontein: { blokkeert: true, zichtDicht: false },
    kist: { blokkeert: true, zichtDicht: true },
    pilaar: { blokkeert: true, zichtDicht: true },
    trap: { blokkeert: true, zichtDicht: false, voet: { dx: -2, dy: -2, b: 3, h: 3 } },
    // Het gat in de vloer waar de trap van beneden aankomt. Er staat er nog geen in de wereld —
    // de verdiepingen bestaan nog niet — maar het beeld ligt klaar (gereedschap/pixelart/trap.cjs).
    trapgat: { blokkeert: true, zichtDicht: false, voet: { dx: -2, dy: -2, b: 3, h: 3 } },
    sleutel: { blokkeert: false, zichtDicht: false },
    // De schandpaal van de heer op de brink: komt er de eerste keer dat hij iemand straft, en blijft
    // staan (js/heer.js, T.zetSchandpaalNeer).
    schandpaal: { blokkeert: true, zichtDicht: false, naam: 'de schandpaal' },
  };

  // Hoe snel de schout loopt, in tegels per seconde: wat vlotter dan een dorpeling (1,2 tot 1,5),
  // zodat rondlopen niet sleept. Zijn loopbeeld telt de afgelegde weg (js/sprites.js), dus zijn
  // voeten glijden bij geen enkele snelheid.
  T.SCHOUT_SNELHEID = 2.2;

  // leven: levenspunten; wie op nul komt, valt. ap: actiepunten per beurt. snelheid: tegels per
  // seconde tijdens het rondlopen. zicht: vanaf hoe ver een monster je opmerkt. aanval.schade:
  // wat een klap kost aan levenspunten. Namen staan met een kleine letter, omdat ze bijna altijd
  // midden in een zin staan.
  //
  // De held (de schout) heeft sinds 25 sep levenspunten, net als een monster (Marcel koos het,
  // voorlopig: ontwerp/spel.md, onder Open). Daarvoor was zijn leeftijd zijn levensbalk, en kostte
  // een klap maanden; die maanden zijn hieronder gedeeld door twee, zodat de monsters onderling
  // even sterk bleven. Wat vallen echt betekent, komt bij punt 13 van de werklijst.
  const WEZENS = {
    held: { naam: 'jij', kant: 'held', leven: 20, ap: 8, initiatief: 10, snelheid: T.SCHOUT_SNELHEID },
    // Wim, de knecht van de meester, veegt de hal: hij schuifelt een paar tegels heen en weer en
    // staat er dan weer bij stil met zijn bezem (de houding "vegen", zie js/sprites.js). Hij
    // begint nooit een gevecht — hij is neutraal — en hij blijft nooit naast een deur staan.
    wim: { naam: 'Wim', kant: 'neutraal', leven: 10, ap: 0, initiatief: 0, snelheid: 1.4, dwaalt: true, straal: 3 },
    // De oude meester scharrelt bij zijn moestuin, op het erf (ontwerp/verhaal.md, "Hij doet zijn
    // moestuin, tot hij sterft"): neutraal als Wim. `snelheid` is zijn eigen, tragere loopmaat
    // (MEESTER_SNELHEID in gereedschap/pixelart/meester.cjs, waar zijn animatie op is afgestemd).
    meester: {
      naam: 'de oude meester', kant: 'neutraal', leven: 10, ap: 0, initiatief: 0, snelheid: 1.55,
      dwaalt: true, straal: 2,
    },
    // De mensen van het dorp staan niet hier maar in js/mensen.js: wie ze zijn, hoe ze heten, hoe
    // snel ze lopen en welk vel ze krijgen. Deze tabel gaat over wat een wezen ís — wat vecht,
    // wat in code wordt neergezet — en een dorpeling is dat niet. Zie
    // ontwerp/wereld.md, "Wie is wie, als het er honderd worden".
    slijm: {
      naam: 'slijmkruiper', kant: 'monster', leven: 10, ap: 4, initiatief: 4, snelheid: 1.4, zicht: 5, dwaalt: true,
      aanval: { kosten: 3, schade: [2, 3], zin: 'bijt je' },
    },
    skelet: {
      naam: 'skeletwacht', kant: 'monster', leven: 18, ap: 6, initiatief: 6, snelheid: 2.2, zicht: 5, dwaalt: false,
      aanval: { kosten: 3, schade: [3, 5], zin: 'raakt je met zijn zwaard' },
    },
    // Buiten, in het bos om het erf. Hij loopt harder dan de schout en ziet verder dan wat er
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

  // Waar je de toren uit loopt. Dezelfde vorm als de overgangen die js/kaart.js uit een .tmj
  // haalt: `x`/`y` is de tegel die je erheen brengt (hier de buitendeur), `naar` het gebied waar
  // je heen gaat, en `komt` de tegel waar je landt als je vanaf díe kant terugkomt — één stap van
  // de deur af, zodat je niet meteen weer terugstapt. Zie js/gebied.js.
  //
  // "wereld": sinds "Eén doorlopende wereld" (ontwerp/wereld.md) is buiten niet meer een los erf,
  // maar kaarten/wereld.tmj — de hele buitenwereld op één doek, met het erf, het dorp en de ruimte
  // ertussen. Het erf als zelfstandig gebied bestaat niet meer.
  const OVERGANGEN = [{ x: 0, y: 5, naar: 'wereld', komt: { x: 1, y: 5 }, tekst: 'Naar buiten' }];

  const sleutelVan = (x, y) => x + ',' + y;

  // Alleen zodat js/kaart.js een wezen uit een ingelezen kaart in precies dezelfde vorm kan
  // neerzetten als hierboven; de vorm zelf (WEZENS, maakWezen) blijft hier, en verandert niet.
  T.maakWezen = maakWezen;
  // De tabel zelf gaat mee naar buiten, want dit is precies de lijst die Marcel in Tiled mag
  // invullen bij de eigenschap "wezen". Wie wil weten wat er te plaatsen valt, vraagt het hier.
  T.WEZENS = WEZENS;

  // "ij" is in het Nederlands één letter: ijzer wordt IJzer, niet Ijzer.
  T.hoofdletter = (s) => (/^ij/.test(s) ? 'IJ' + s.slice(2) : s.charAt(0).toUpperCase() + s.slice(1));
  T.tegelVan = (e) => ({ x: e.tx, y: e.ty });
  // Afstand in stappen: schuin telt als één stap, net als bij het lopen.
  T.afstand = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
  // Hoe snel loopt dit wezen? Ieder op zijn eigen vaste maat. (Tot 25 sep liep de held trager
  // naarmate hij ouder werd; de leeftijd ging eruit met het oude spel.)
  T.snelheidVan = (e) => e.snelheid;

  T.maakWereld = function () {
    const h = PLATTEGROND.length;
    const b = PLATTEGROND[0].length;
    const tegels = [];
    const deuren = new Map();
    for (let y = 0; y < h; y++) {
      const rij = [];
      for (let x = 0; x < b; x++) {
        const t = PLATTEGROND[y][x];
        if (t === '#') rij.push('muur');
        else if (t === '.') rij.push('vloer');
        else if (t === 'D' || t === 'L') {
          rij.push('deur');
          deuren.set(sleutelVan(x, y), { x, y, staat: t === 'L' ? 'opslot' : 'dicht', richting: 'ow' });
        } else rij.push('buiten');
      }
      tegels.push(rij);
    }
    const w = {
      b, h, tegels, deuren, kamers: KAMERS,
      voorwerpen: [], wezens: [],
      bekend: new Set(['hal']), huidigeKamer: 'hal',
      overgangen: OVERGANGEN.map((o) => ({ ...o, komt: { ...o.komt } })),
      buiten: false,
    };
    // Loopt de muur rond de deur van noord naar zuid, dan staat het deurpaneel dwars op x.
    for (const d of deuren.values()) if (T.tegel(w, d.x, d.y - 1) === 'muur') d.richting = 'ns';
    w.voorwerpen.push(
      { soort: 'fontein', x: 7, y: 6 },
      { soort: 'kist', x: 12, y: 2 },
      { soort: 'kist', x: 13, y: 5 },
      { soort: 'kist', x: 14, y: 5 },
      { soort: 'sleutel', x: 17, y: 2 },
      { soort: 'pilaar', x: 3, y: 11 },
      { soort: 'pilaar', x: 6, y: 11 },
      // De trap beslaat drie bij drie tegels (een spiraal waar een man door past is minstens
      // twee meter breed), met zijn voorste hoek op deze tegel: zo staat hij precies in de
      // zuidoosthoek van het trappenhuis. `staat` kiest het beeld; herstellen kan nog niet.
      { soort: 'trap', x: 8, y: 14, staat: 'hersteld' },
    );
    w.wezens.push(
      maakWezen('held', 3, 5),
      maakWezen('wim', 5, 2),
      maakWezen('slijm', 16, 4),
      maakWezen('skelet', 5, 13),
    );
    w.burenKamers = berekenBurenKamers(w);
    return w;
  };

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
    };
  }

  // Per tegel: welke kamers liggen er direct omheen (ook schuin). Een muur of deur is
  // zichtbaar zodra een van die kamers bekend is.
  function berekenBurenKamers(w) {
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
  }

  T.tegel = (w, x, y) => (x >= 0 && y >= 0 && x < w.b && y < w.h ? w.tegels[y][x] : 'buiten');
  T.deurOp = (w, x, y) => w.deuren.get(sleutelVan(x, y)) || null;
  T.kamerVan = (w, x, y) => w.kamers.find((k) => x >= k.x1 && x <= k.x2 && y >= k.y1 && y <= k.y2) || null;
  // Een voorwerp staat meestal op één tegel, maar de spiraaltrap beslaat er drie bij drie: een
  // spiraal waar een man door past is minstens twee meter breed. `voet` geeft die rechthoek ten
  // opzichte van de tegel van het voorwerp zelf, als {dx, dy, b, h}. Die tegel is bij de trap de
  // voorste hoek (de hoogste x+y), want daarop sorteert het tekenen; de voet loopt dus naar
  // achteren, met negatieve dx en dy.
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
