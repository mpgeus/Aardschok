// De wereld: wat een wezen is (T.WEZENS), wat een voorwerp is (T.VOORWERPEN), en de vragen die de
// rest van het spel over een kaart stelt: kan ik hier staan, zie ik daar iets, in welke kamer
// ligt dit. Een kaart komt uit Tiled (js/kaart.js), op één na: de proefkamers hieronder, drie
// kamers in code voor de toetsen van het gevecht (test/regels.test.cjs). Tot 25 sep was dat één
// verdieping van de toren van het oude spel; de toren ging eruit, de plattegrond bleef.
(function (T) {
  'use strict';

  // Legenda: # muur, . vloer, D deur (dicht), L deur (op slot), spatie = buiten.
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
    sleutel: { blokkeert: false, zichtDicht: false },
    // De schandpaal van de heer op het plein: komt er de eerste keer dat hij iemand straft, en blijft
    // staan (js/heer.js, T.zetSchandpaalNeer).
    schandpaal: { blokkeert: true, zichtDicht: false, naam: 'de schandpaal' },
    // De meiboom op het plein: de jongeren zetten hem op 1 bloeimaand, en hij blijft een maand staan (js/feesten.js).
    meiboom: { blokkeert: true, zichtDicht: false, naam: 'de meiboom' },
    // Het hol van een roedel wolven, op een tegel naast zijn thuis diep in het bos (js/beesten.js, T.zetHol): een kuil onder een
    // omgevallen boom. Je loopt er niet overheen, maar langs.
    hol: { blokkeert: true, zichtDicht: false, naam: 'een wolvenhol' },
    // Een kraam van de markt op het plein (js/markt.js): een toonbank met een luifel. Je loopt eromheen, en ertussendoor.
    kraam: { blokkeert: true, zichtDicht: false, naam: 'een kraam' },
    // Een mand, kist, zak of ton naast een kraam (js/markt.js): wat niet op de toonbank past.
    mand: { blokkeert: true, zichtDicht: false, naam: 'een mand' },
    // Een stronk die achterblijft als een boom om is (T.velBoom, js/bos.js): je loopt tussen de stronken door, zoals in een
    // kapvlakte, en zo komt de houthakker bij de bomen erachter. In de speeltest van 6 okt zette hij zich met zijn eigen
    // stronken vast: na de rand van het bos kon hij er niet meer in. Een stronk die de maker op de kaart zette, heeft een
    // muur onder zich, zoals elk vast ding uit het vel (js/kaart.js).
    boomstronk: { blokkeert: false, zichtDicht: false },
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
  // De schout heeft sinds 25 sep levenspunten, net als een monster (Marcel koos het, voorlopig:
  // ontwerp/spel.md, onder Open). Daarvoor was de leeftijd van de tovenaar zijn levensbalk, en
  // kostte een klap maanden; die maanden zijn hieronder gedeeld door twee, zodat de monsters
  // onderling even sterk bleven. Wat vallen echt betekent, komt bij punt 13 van de werklijst.
  // Zijn kant heet 'speler' en niet 'schout' (Marcel, 26 sep): soort en kant zijn twee dingen, en
  // een man van de militie (punt 13) vecht straks aan jouw kant zonder de schout te zijn.
  const WEZENS = {
    schout: { naam: 'jij', kant: 'speler', leven: 20, ap: 8, initiatief: 10, snelheid: T.SCHOUT_SNELHEID },
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
    // Buiten, in het bos. Hij loopt harder dan de schout en ziet verder dan wat er
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
    // De rovers (js/rovers.js; werklijst vraag 55, 29 sep): wie wegtrok, of wilde rovers van buiten. Ze dwalen niet
    // maar lopen waar hun aanval ze heen stuurt, en dragen het vel van gewone mensen (e.vel, zie S.houding in
    // js/sprites.js): er hoeft niets voor getekend te worden.
    rover: {
      naam: 'rover', kant: 'monster', leven: 12, ap: 6, initiatief: 6, snelheid: 2.2, zicht: 6, dwaalt: false, vel: 'boer',
      aanval: { kosten: 3, schade: [2, 4], zin: 'slaat je met een knuppel' },
    },
    // Een man van de militie, uit het wachthuis: wat hij kan als hij bij een aanval naast de schout vecht
    // (js/rovers.js). Hij is een bewoner met zijn eigen poppetje; dit is alleen zijn leven en zijn punten.
    wachter: { naam: 'wachter', kant: 'speler', leven: 16, ap: 8, initiatief: 8, snelheid: 2.4, vel: 'boer' },
    // Wie van de heervaart terugkwam (js/heervaart.js; Marcel, 29 sep, vraag 60, B): hij heeft leren vechten. Hij
    // vecht mee als er rovers komen, ook zonder wachthuis, en houdt meer klappen uit dan een wachter.
    veteraan: { naam: 'veteraan', kant: 'speler', leven: 20, ap: 8, initiatief: 8, snelheid: 2.4, vel: 'boer' },
  };

  const sleutelVan = (x, y) => x + ',' + y;

  // Alleen zodat js/kaart.js een wezen uit een ingelezen kaart in precies dezelfde vorm kan
  // neerzetten als hierboven; de vorm zelf (WEZENS, maakWezen) blijft hier, en verandert niet.
  T.maakWezen = maakWezen;
  // De tabel zelf gaat mee naar buiten, want dit is precies de lijst die Marcel in Tiled mag
  // invullen bij de eigenschap "wezen". Wie wil weten wat er te plaatsen valt, vraagt het hier.
  T.WEZENS = WEZENS;

  // "ij" is in het Nederlands één letter: ijzer wordt IJzer, niet Ijzer.
  T.hoofdletter = (s) => (/^ij/.test(s) ? 'IJ' + s.slice(2) : s.charAt(0).toUpperCase() + s.slice(1));
  // Een klein getal in woorden, voor een bericht of een brief: "drie wilde rovers", "vijf weerbare mannen".
  const TELWOORDEN = ['geen', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf', 'twaalf'];
  T.telwoord = (n) => TELWOORDEN[n] || String(n);
  T.tegelVan = (e) => ({ x: e.tx, y: e.ty });
  // Afstand in stappen: schuin telt als één stap, net als bij het lopen.
  T.afstand = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
  // Hoe snel loopt dit wezen? Ieder op zijn eigen vaste maat. (Tot 25 sep liep de tovenaar trager
  // naarmate hij ouder werd; de leeftijd ging eruit met het oude spel.)
  T.snelheidVan = (e) => e.snelheid;

  // De proefkamers: een hal, een voorraadkamer en een trappenhuis, met een dichte deur en een deur
  // op slot, kisten, pilaren, een fontein en twee monsters. Alleen voor de toetsen: in het spel
  // staan ze op geen enkele kaart.
  T.maakProefkamers = function () {
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
      overgangen: [],
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
    );
    w.wezens.push(
      maakWezen('schout', 3, 5),
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

  // ── Wat er op een tegel staat: een lijst per tegel ──
  // T.voorwerpOp wordt heel vaak gevraagd: bij elke stap die een poppetje overweegt (T.isBegaanbaar), en elke dag
  // voor elke tegel van het plein (js/bewoners.js). Tot 30 sep liep het daarvoor alle voorwerpen van de kaart af,
  // honderden bomen, huizen en bankjes, en dat was 85% van een speeldag (werklijst, vraag 71). Nu houdt elke kaart een
  // lijst per tegel bij, die er pas komt als iemand hem vraagt. Het is geen spelstaat maar iets wat uit de kaart volgt,
  // dus hij staat niet in S en gaat niet mee in het opslaan: een geladen kaart bouwt hem opnieuw.
  // Een voorwerp zet je erbij met T.zetVoorwerp en haal je weg met T.haalVoorwerpWeg; verandert er een van plaats of
  // maat, of wordt een tegel een muur, dan zegt T.kaartVeranderd het (test/wereld.test.cjs kijkt dat niemand het anders
  // doet).
  const PER_TEGEL = new WeakMap();
  const tegelSleutel = (x, y) => (y + 4096) * 8192 + (x + 4096);
  function lijstPerTegel(w) {
    const l = PER_TEGEL.get(w);
    // Een vangnet voor wie de lijst van de kaart toch zelf vervangt of aanvult: dan komt er een nieuwe.
    if (l && l.voorwerpen === w.voorwerpen && l.aantal === w.voorwerpen.length) return l.op;
    const op = new Map();
    for (const v of w.voorwerpen) {
      const f = T.voetVan(v);
      for (let y = f.y1; y <= f.y2; y++) {
        for (let x = f.x1; x <= f.x2; x++) {
          const k = tegelSleutel(x, y);
          if (!op.has(k)) op.set(k, v); // staan er twee op één tegel, dan de eerste, zoals altijd
        }
      }
    }
    PER_TEGEL.set(w, { voorwerpen: w.voorwerpen, aantal: w.voorwerpen.length, op });
    return op;
  }
  T.voorwerpOp = function (w, x, y) {
    if (Number.isInteger(x) && Number.isInteger(y)) return lijstPerTegel(w).get(tegelSleutel(x, y)) || null;
    // Tussen twee tegels in (een poppetje onderweg): zoals vroeger, langs alle voorwerpen.
    return w.voorwerpen.find((v) => {
      const f = T.voetVan(v);
      return x >= f.x1 && x <= f.x2 && y >= f.y1 && y <= f.y2;
    }) || null;
  };
  T.zetVoorwerp = function (w, v) {
    (w.voorwerpen || (w.voorwerpen = [])).push(v);
    T.kaartVeranderd(w);
    return v;
  };
  T.haalVoorwerpWeg = function (w, v) {
    const i = w.voorwerpen.indexOf(v);
    if (i >= 0) w.voorwerpen.splice(i, 1);
    T.kaartVeranderd(w);
  };
  // De kaart is veranderd (een voorwerp, of een tegel die een muur werd of weer vloer): wat eruit volgt, rekent hij
  // opnieuw uit als iemand het vraagt, de lijst per tegel en de eilanden (hieronder).
  T.kaartVeranderd = function (w) {
    PER_TEGEL.delete(w);
    EILANDEN.delete(w);
    RASTERS.delete(w);
    if (laatste && laatste.w === w) laatste = null;
    VERSIES.set(w, T.kaartVersie(w) + 1);
  };
  // Hoe vaak de kaart al veranderde: wat er verder uit de kaart volgt (de paadjes van de deuren, js/paden.js), weet zo
  // of het opnieuw moet. Ook geen spelstaat: een geladen kaart begint weer bij 0, en rekent alles opnieuw uit.
  const VERSIES = new WeakMap();
  T.kaartVersie = (w) => VERSIES.get(w) || 0;

  // ── Eilanden: welke tegels samen één gebied vormen ──
  // Marcel (2 okt, werklijst vraag 88): "Zoizo bezette tegels zijn uit te sluiten toch? Bomen, versiering etc". Wat
  // vaststaat (muren, huizen, bomen, versiering), rekent de kaart één keer uit: welke begaanbare tegels samen één
  // gebied vormen, een eiland. Wil iemand naar een plek op een ander eiland, dan is er geen weg, en dat hoeft A* niet
  // na de hele kaart te merken (T.kanErKomen). Zoals de lijst per tegel is het geen spelstaat maar iets wat uit de
  // kaart volgt: niet in S, en na T.kaartVeranderd opnieuw. Een eiland is ruim: een deur telt als open en wie er staat,
  // telt niet. Zo zegt het nooit "geen weg" waar er een is, en verandert er niets aan wie waar loopt; het gaat alleen
  // sneller (bij de bouwer van de speeltest liet een dichtgebouwde deur A* 4.000 keer per tien dagen de kaart afzoeken).
  const EILANDEN = new WeakMap();
  const RUIM = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  function ruim(w, x, y) {
    const t = T.tegel(w, x, y);
    if (t === 'muur' || t === 'buiten') return false;
    const v = T.voorwerpOp(w, x, y);
    return !(v && T.VOORWERPEN[v.soort].blokkeert);
  }
  function eilandenVan(w) {
    const al = EILANDEN.get(w);
    if (al) return al;
    const b = w.b;
    const h = w.h;
    const op = new Int32Array(b * h).fill(-1);
    const kan = new Uint8Array(b * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) kan[y * b + x] = ruim(w, x, y) ? 1 : 0;
    let n = 0;
    for (let i = 0; i < b * h; i++) {
      if (!kan[i] || op[i] >= 0) continue;
      op[i] = n;
      const rij = [i];
      while (rij.length) {
        const j = rij.pop();
        const x = j % b;
        const y = (j - x) / b;
        for (const [dx, dy] of RUIM) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= b || ny >= h) continue;
          const k = ny * b + nx;
          if (!kan[k] || op[k] >= 0) continue;
          // Schuin alleen als geen van de twee hoektegels vast is, zoals A* (js/pad.js).
          if (dx && dy && (!kan[y * b + nx] || !kan[ny * b + x])) continue;
          // en niet door een wand van de hoogte (js/hoogte.js; vraag 121, stap 2)
          if (w.hoogte && !T.kanStappen(w, x, y, nx, ny)) continue;
          op[k] = n;
          rij.push(k);
        }
      }
      n++;
    }
    const e = { op, b, h };
    EILANDEN.set(w, e);
    return e;
  }
  // Het eiland van een tegel, of -1 (vast, of buiten de kaart).
  T.eilandOp = function (w, x, y) {
    const e = eilandenVan(w);
    return x >= 0 && y >= 0 && x < e.b && y < e.h ? e.op[y * e.b + x] : -1;
  };

  // Kan wie op `van` staat ooit bij `doel` komen, met de opties van T.zoekPad (js/pad.js: `tot`, `naast`)? Nee als geen
  // tegel waar A* zou eindigen, op een eiland ligt waar hij vanaf `van` op kan stappen. `van` zelf mag vast zijn (wie
  // binnen in zijn deur staat, of ingemetseld is): dan telt waar hij heen kan stappen. Ja betekent alleen: zoek maar.
  T.kanErKomen = function (w, van, doel, opties) {
    const naast = !!(opties && opties.naast);
    const tot = opties && opties.tot >= 1 ? Math.floor(opties.tot) : 0;
    const ver = Math.max(Math.abs(van.x - doel.x), Math.abs(van.y - doel.y));
    if (ver <= tot || (naast && ver <= 1)) return true;
    const vanaf = new Set();
    const eigen = T.eilandOp(w, van.x, van.y);
    if (eigen >= 0) vanaf.add(eigen);
    for (const [dx, dy] of RUIM) {
      const e = T.eilandOp(w, van.x + dx, van.y + dy);
      if (e >= 0) vanaf.add(e);
    }
    if (!vanaf.size) return false;
    const r = naast ? 1 : tot;
    for (let y = doel.y - r; y <= doel.y + r; y++) {
      for (let x = doel.x - r; x <= doel.x + r; x++) {
        if (naast && x === doel.x && y === doel.y) continue;
        if (vanaf.has(T.eilandOp(w, x, y))) return true;
      }
    }
    return false;
  };
  // Wie binnen is (een boer 's nachts in zijn huis, js/dag.js), staat niemand in de weg.
  T.wezenOp = function (w, x, y, behalve) {
    if (stil) {
      const lijst = bezetIndex(w).get((x + 1024) * 4096 + (y + 1024));
      return (lijst && lijst.find((e) => e !== behalve)) || null;
    }
    return w.wezens.find((e) => !e.dood && !e.binnen && e !== behalve && e.tx === x && e.ty === y) || null;
  };
  // Wie waar staat, tijdens een zoektocht naar een pad (T.zoekPad, js/pad.js). A* vraagt het voor elke tegel die hij
  // bekijkt, en tot 3 okt liep dat elke keer alle wezens van de kaart af: bij een dorp van 100 mensen was het zoeken van
  // paden 64% van de tijd van een beeld, met beelden van 115 ms als 's ochtends iedereen op weg gaat (npm run grootte;
  // Marcel, 3 okt: "Als de performance slecht is, hebben we niks"). Tijdens één zoektocht staat iedereen stil, dus één
  // lijst per zoektocht geeft precies hetzelfde antwoord, in dezelfde volgorde. Geen spelstaat: hij leeft zolang de
  // zoektocht duurt.
  let stil = 0;
  let index = null; // { w, bezet: Map(tegel → [wezens, in de volgorde van w.wezens]) }
  T.iedereenStil = function (aan) {
    stil = Math.max(0, stil + (aan ? 1 : -1));
    if (!stil) index = null;
  };
  T.iedereenStaatStil = () => stil > 0;
  function bezetIndex(w) {
    if (index && index.w === w) return index.bezet;
    const bezet = new Map();
    for (const e of w.wezens) {
      if (e.dood || e.binnen) continue;
      const k = (e.tx + 1024) * 4096 + (e.ty + 1024);
      const lijst = bezet.get(k);
      if (lijst) lijst.push(e);
      else bezet.set(k, [e]);
    }
    index = { w, bezet };
    return bezet;
  }

  // Mag je deze tegel op? deurenOpenen: een dichte deur telt als doorgang (de schout duwt
  // hem open, een monster niet). wezensBlokkeren: andere wezens staan in de weg.
  T.isBegaanbaar = function (w, x, y, opties) {
    const o = opties || {};
    const g = vastOp(w, x, y);
    if (g === VAST) return false;
    if (g === DEUR) {
      const d = T.deurOp(w, x, y);
      if (d.staat === 'opslot') return false;
      if (d.staat === 'dicht' && !o.deurenOpenen) return false;
    }
    if (o.wezensBlokkeren && T.wezenOp(w, x, y, o.wie)) return false;
    return true;
  };

  // Houdt deze tegel een schuine stap om de hoek tegen? Alleen vaste dingen tellen: een
  // wezen dat schuin naast je staat, sluit de doorgang niet af.
  T.isVast = function (w, x, y) {
    const g = vastOp(w, x, y);
    return g === VAST || (g === DEUR && T.deurOp(w, x, y).staat !== 'open');
  };

  // Wat vaststaat, per tegel in een raster (vraag 113, 4 okt): A* vraagt voor elke tegel die hij bekijkt zestien keer
  // of er iets staat, en op een land van de maker van 100 bij 100 zijn het er duizenden per zoektocht. VAST is een muur,
  // buiten de kaart, of een voorwerp dat in de weg staat (een huis, een boom); DEUR een deur, die open of dicht kan; en
  // VRIJ de rest. Opnieuw als de kaart veranderde (T.kaartVeranderd), met hetzelfde vangnet als de lijst per tegel
  // hierboven, en als de kaart groeide (het meetgereedschap, gereedschap/grootte/).
  const VRIJ = 0;
  const VAST = 1;
  const DEUR = 2;
  const RASTERS = new WeakMap();
  let laatste = null; // het raster waar het laatst naar gevraagd werd: A* vraagt duizenden keren achter elkaar dezelfde kaart
  function vastRaster(w) {
    let r = laatste && laatste.w === w ? laatste : RASTERS.get(w);
    if (!(r && r.voorwerpen === w.voorwerpen && r.aantal === w.voorwerpen.length && r.b === w.b && r.h === w.h)) {
      const raster = new Uint8Array(w.b * w.h);
      for (let y = 0; y < w.h; y++) {
        for (let x = 0; x < w.b; x++) {
          const t = w.tegels[y][x];
          const v = t === 'muur' || t === 'buiten' ? null : T.voorwerpOp(w, x, y);
          raster[y * w.b + x] = t === 'muur' || t === 'buiten' || (v && T.VOORWERPEN[v.soort].blokkeert) ? VAST : t === 'deur' ? DEUR : VRIJ;
        }
      }
      r = { w, voorwerpen: w.voorwerpen, aantal: w.voorwerpen.length, b: w.b, h: w.h, raster };
      RASTERS.set(w, r);
    }
    laatste = r;
    return r.raster;
  }
  // Het raster zelf, voor wie per tegel heel vaak vraagt en de tegels al als getal kent (de velden in js/lopen.js: een
  // veld vraagt het voor elke buur van elke tegel). Een DEUR vraag je dan nog aan T.isBegaanbaar of T.isVast.
  T.vastRaster = vastRaster;
  T.RASTER = { VRIJ, VAST, DEUR };
  function vastOp(w, x, y) {
    if (!(x >= 0 && y >= 0 && x < w.b && y < w.h)) return VAST;
    if ((x | 0) === x && (y | 0) === y) {
      const l = laatste;
      const raster = l && l.w === w && l.voorwerpen === w.voorwerpen && l.aantal === w.voorwerpen.length && l.b === w.b && l.h === w.h ? l.raster : vastRaster(w);
      return raster[y * w.b + x];
    }
    // tussen twee tegels in: zoals vroeger
    const t = T.tegel(w, x, y);
    if (t === 'muur' || t === 'buiten') return VAST;
    const v = T.voorwerpOp(w, x, y);
    if (v && T.VOORWERPEN[v.soort].blokkeert) return VAST;
    return t === 'deur' ? DEUR : VRIJ;
  }

  // Ligt het punt (px, py) binnen een rand, een lijst hoekpunten [[x, y], ...]? Een straal naar rechts
  // telt hoe vaak hij de rand kruist. Ook voor gereedschap/tiled/maak-gehucht.cjs, dat er het plein
  // en het zand mee tekent.
  T.binnenRand = function (rand, px, py) {
    let binnen = false;
    for (let i = 0, k = rand.length - 1; i < rand.length; k = i++) {
      const [xi, yi] = rand[i];
      const [xk, yk] = rand[k];
      if (yi > py !== yk > py && px < ((xk - xi) * (py - yi)) / (yk - yi) + xi) binnen = !binnen;
    }
    return binnen;
  };

  // Ligt deze tegel op het plein? Een kaart kan een plein hebben (kaarten/<naam>.betekenis.json,
  // "plein": zijn rand, in tegels, via js/kaart.js in w.plein); een tegel ligt erop als zijn midden
  // binnen die rand valt. Op het plein wordt niet gebouwd (js/gebouwen.js, T.gebouwPast), en daar
  // spelen de kinderen (js/bewoners.js, T.pleinVan).
  T.opHetPlein = function (w, x, y) {
    return !!(w && w.plein && w.plein.length >= 3 && T.binnenRand(w.plein, x + 0.5, y + 0.5));
  };

  // De tegels van het plein, rij voor rij van boven naar onder, en in een rij van links naar rechts. Eén keer per kaart
  // uitgerekend, want de rand van het plein verandert niet (werklijst, vraag 71: dit werd elke dag voor elk kind
  // opnieuw gedaan). Net als de lijst per tegel hierboven volgt het uit de kaart, en staat het niet in S.
  const PLEIN = new WeakMap();
  T.pleinTegels = function (w) {
    if (!w || !w.plein || w.plein.length < 3) return [];
    const p = PLEIN.get(w);
    if (p && p.rand === w.plein) return p.tegels;
    const xs = w.plein.map((q) => q[0]);
    const ys = w.plein.map((q) => q[1]);
    const tegels = [];
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
      for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
        if (T.opHetPlein(w, x, y)) tegels.push({ x, y });
      }
    }
    PLEIN.set(w, { rand: w.plein, tegels });
    return tegels;
  };

  // Loopt hier een pad? Wat de grond zegt (js/kaart.js, `naam` bij de tegel in de .tmj): een zandpad of
  // kasseien. Op een pad wordt niet gebouwd (js/gebouwen.js, T.waaromPastHetNiet), en er komt geen erf.
  const PADEN = ['zandpad', 'kasseien'];
  T.opPad = function (w, x, y) {
    const g = w && w.grond && w.grond[y] && w.grond[y][x];
    return !!(g && PADEN.includes(g.naam));
  };

  // Is deze grond water? Dat van een beek, een meer of een rivier, en de zee van het eiland (tegels/kust.png; werklijst
  // vraag 117, B van 2a). Daar vist een visser (T.NATUUR, js/gebouwen.js), en daar komt geen stuk bos (js/ontginnen.js).
  T.isWaterGrond = (naam) => naam === 'water' || naam === 'zee';

  // Twee tegels raken elkaar als ze naast elkaar liggen, ook schuin, maar niet schuin
  // om een muurhoek heen. Dat geldt voor slaan, praten en iets gebruiken.
  // Staat deze tegel een doorgang in de weg? Een deur, of de tegel er pal naast: daar mag niemand
  // blijven staan te dwalen (js/verkennen.js), en daar gaat niemand opzij heen (js/lopen.js). Anders sta je voor een
  // dichte deur te wachten tot iemand opschuift, en dat mag je nooit jaren kosten (ontwerp/wereld.md).
  T.bijDeur = function (w, x, y) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) if (T.tegel(w, x + dx, y + dy) === 'deur') return true;
    }
    return false;
  };

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
  // eindtegel tellen niet mee: wie in een deuropening staat, ziet eruit. `open(x, y)` (mag ontbreken) zegt welke tegels
  // het zicht niet houden, wat er ook staat: een stuk bos dat ontgonnen gaat worden, zonder zijn bomen (js/ontginnen.js).
  T.zicht = function (w, a, b, open) {
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
      if (T.blokkeertZicht(w, x, y) && !(open && open(x, y))) return false;
    }
  };

  // Een lijn is niet altijd heen en terug dezelfde; zien werkt hier twee kanten op. Op een land met hoogte houdt ook een
  // heuvel het zicht (T.heuvelTussen, js/hoogte.js; vraag 121, stap 2).
  T.zichtTussen = (w, a, b, open) => (T.zicht(w, a, b, open) || T.zicht(w, b, a, open)) && !(w.hoogte && T.heuvelTussen(w, a, b));

  // Ziet wie op `van` staat de tegel `naar`, als hij `ver` tegels ver kijkt? Hemelsbreed (een cirkel,
  // geen vierkant) en met niets ertussen. Zo kijken de inner (js/inner.js) en de getuigen (js/zien.js);
  // een monster kijkt nog in een vierkant (T.zoekOntdekking, js/verkennen.js). Wie hoger staat, ziet verder
  // (T.verderVanBoven, js/hoogte.js; vraag 121, stap 2).
  T.zietTegel = function (w, van, naar, ver, open) {
    const dx = naar.x - van.x;
    const dy = naar.y - van.y;
    if (w.hoogte) ver += T.verderVanBoven(w, van, naar);
    if (dx * dx + dy * dy > ver * ver) return false;
    return !w.tegels || T.zichtTussen(w, van, naar, open);
  };

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
})(globalThis.Spel = globalThis.Spel || {});
