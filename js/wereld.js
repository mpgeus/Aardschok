// De wereld: één verdieping van de toren. Plattegrond, kamers, deuren, voorwerpen en
// wezens, plus de vragen die de rest van het spel erover stelt: kan ik hier staan,
// zie ik daar iets, in welke kamer ligt dit.
(function (T) {
  'use strict';

  // Legenda: # muur, . vloer, D deur (dicht), L deur (op slot), spatie = buiten de toren.
  const PLATTEGROND = [
    '####################',
    '#........#.........#',
    '#........#.........#',
    '#........#.........#',
    '#........D.........#',
    '#........#.........#',
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
    trap: { blokkeert: true, zichtDicht: false },
    sleutel: { blokkeert: false, zichtDicht: false },
  };

  // ap: actiepunten per beurt. snelheid: tegels per seconde tijdens het rondlopen (bij de held
  // hangt die af van zijn leeftijd).
  // zicht: vanaf hoe ver een monster je opmerkt. Namen staan met een kleine letter,
  // omdat ze bijna altijd midden in een zin staan. De held heeft geen levenspunten maar een
  // leeftijd (zie leeftijd.js); een klap van een monster kost hem maanden.
  const WEZENS = {
    // De held heeft hier geen snelheid: hij loopt op zijn leeftijd (zie T.snelheidVan).
    held: { naam: 'jij', kant: 'held', leven: 0, ap: 8, initiatief: 10, snelheid: 0 },
    wim: { naam: 'Wim', kant: 'neutraal', leven: 10, ap: 0, initiatief: 0, snelheid: 0 },
    slijm: {
      naam: 'slijmkruiper', kant: 'monster', leven: 10, ap: 4, initiatief: 4, snelheid: 1.4, zicht: 5, dwaalt: true,
      aanval: { kosten: 3, maanden: [3, 5], zin: 'bijt je' },
    },
    skelet: {
      naam: 'skeletwacht', kant: 'monster', leven: 18, ap: 6, initiatief: 6, snelheid: 2.2, zicht: 5, dwaalt: false,
      aanval: { kosten: 3, maanden: [5, 9], zin: 'raakt je met zijn zwaard' },
    },
  };

  const sleutelVan = (x, y) => x + ',' + y;

  // Alleen zodat js/kaart.js een wezen uit een ingelezen kaart in precies dezelfde vorm kan
  // neerzetten als hierboven; de vorm zelf (WEZENS, maakWezen) blijft hier, en verandert niet.
  T.maakWezen = maakWezen;

  T.hoofdletter = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  T.tegelVan = (e) => ({ x: e.tx, y: e.ty });
  // Afstand in stappen: schuin telt als één stap, net als bij het lopen.
  T.afstand = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
  // Hoe snel loopt dit wezen? Een monster houdt zijn vaste snelheid; de held loopt trager
  // naarmate hij ouder wordt, en dat is aan hem te zien (T.loopSnelheid).
  T.snelheidVan = (e) => (e.leeftijd == null ? e.snelheid : T.loopSnelheid(e.leeftijd));

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
      { soort: 'trap', x: 8, y: 14 },
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
      dwaalt: !!s.dwaalt, aanval: s.aanval || null,
      dwaalTijd: 1 + Math.random() * 2, fase: Math.random() * 6.28,
      dood: false, sterfTijd: 0, uitval: null, flits: 0, alarm: 0,
      leeftijd: soort === 'held' ? T.STARTLEEFTIJD : null,
      // Wat spreuken achterlaten: nabranden, punten kwijt door een windstoot, kijken naar een
      // dwaallicht (vraag: het vraagteken boven het hoofd), en geduwd worden.
      brandt: 0, apVerlies: 0, afgeleid: null, gelokt: null, vraag: 0, geduwd: false,
      // Het meesterschap per spreuk, en de hoogste kring die open ging. Alleen de held tovert.
      meesterschap: soort === 'held' ? {} : null,
      kring: soort === 'held' ? T.kringVoorLeeftijd(T.STARTLEEFTIJD) : null,
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
  T.voorwerpOp = (w, x, y) => w.voorwerpen.find((v) => v.x === x && v.y === y) || null;
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
