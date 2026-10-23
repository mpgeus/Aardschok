// De wereld: wat een wezen is (T.WEZENS), wat een voorwerp is (T.VOORWERPEN), en de vragen die de
// rest van het spel over een kaart stelt: kan ik hier staan, zie ik daar iets, in welke kamer
// ligt dit. Een kaart komt uit Tiled (js/kaart.js), op één na: de proefkamers hieronder, drie
// kamers in code voor de toetsen van het gevecht (test/regels.test.cjs). Tot 25 sep was dat één
// verdieping van de toren van het oude spel; de toren ging eruit, de plattegrond bleef.
(function (T) {
  'use strict';

  T.WERELD_INSTELLINGEN = {
    // Op de kaart van het eiland gaat een stuk land open als een van je mensen binnen zoveel tegels komt (de aanvoerder, wie
    // in je dorp woont, de ossenkar; B2b, stap 5, Marcel: "Al je mensen"). Verder dan ze kijken (T.MIST_INSTELLINGEN,
    // js/mist.js), zodat wat je ziet al klaar ligt.
    openRond: 16,
    // Zoveel tegels verder dan openRond maakt het spel het land van een stuk alvast, in delen van zoveel bij zoveel tegels,
    // zoveel ms per seconde (minstens één deel per beeld), zodat er niets meer te rekenen is als het open gaat (Marcel,
    // 13 okt: "Alles per stuk"). Per seconde en niet per beeld (Marcel, 13 okt: "3 optie a"): bij weinig beelden per
    // seconde kwam het anders niet bij (aan de kust, 10 per seconde). 240 is bij 60 beelden per seconde 4 ms per beeld.
    // Het is geen spelstaat: hoe snel het klaar is, verandert niets aan het land.
    vooruit: 48,
    vooruitDeel: 16,
    vooruitMsPerSeconde: 240,
    // Na het laden maakt het spel eerst het land van alle open stukken (T.maakOpenStukken), zoveel ms per beeld (minstens
    // één stuk), met de voortgang in het menu (js/menu.js).
    ladenMsPerBeeld: 30,
  };
  const IN = () => T.WERELD_INSTELLINGEN;

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
    { id: 'hal', naam: T.t('The hall'), x1: 1, y1: 1, x2: 8, y2: 7, vloer: ['#6e5c48', '#675643'] },
    { id: 'opslag', naam: T.t('The storeroom'), x1: 10, y1: 1, x2: 18, y2: 7, vloer: ['#5f4b37', '#584532'] },
    { id: 'trap', naam: T.t('The stairwell'), x1: 1, y1: 9, x2: 8, y2: 14, vloer: ['#51555a', '#4b4f54'] },
  ];

  // blokkeert: je kunt er niet op staan. zichtDicht: je kijkt er niet langs.
  T.VOORWERPEN = {
    fontein: { blokkeert: true, zichtDicht: false },
    kist: { blokkeert: true, zichtDicht: true },
    pilaar: { blokkeert: true, zichtDicht: true },
    // De schandpaal van de heer op het plein: komt er de eerste keer dat hij iemand straft, en blijft
    // staan (js/heer.js, T.zetSchandpaalNeer).
    schandpaal: { blokkeert: true, zichtDicht: false, naam: T.t('the pillory') },
    // De meiboom op het plein: in bloeimaand (js/versiering.js).
    meiboom: { blokkeert: true, zichtDicht: false, naam: T.t('the maypole') },
    // De kerstboom op het plein: van 20 wintermaand tot en met 6 louwmaand, met kaarsjes die 's avonds branden
    // (js/versiering.js).
    kerstboom: { blokkeert: true, zichtDicht: false, naam: T.t('the Christmas tree') },
    // Het hol van een roedel wolven, op een tegel naast zijn thuis diep in het bos (js/beesten.js, T.zetHol): een kuil onder een
    // omgevallen boom. Je loopt er niet overheen, maar langs.
    hol: { blokkeert: true, zichtDicht: false, naam: T.t('a wolf den') },
    // Een kraam van de markt op het plein (js/markt.js): een toonbank met een luifel. Je loopt eromheen, en ertussendoor.
    kraam: { blokkeert: true, zichtDicht: false, naam: T.t('a stall') },
    // Een mand, kist, zak of ton naast een kraam (js/markt.js): wat niet op de toonbank past.
    mand: { blokkeert: true, zichtDicht: false, naam: T.t('a basket') },
    // Een wijnrank in de wijngaard van een wijnboerderij (js/wijngaard.js): aan een paal met een draad, in een rij; je loopt
    // ertussen over het pad, en wie plukt, staat ernaast.
    wijnrank: { blokkeert: true, zichtDicht: false, naam: T.t('a vine') },
    // Een stronk die achterblijft als een boom om is (T.velBoom, js/bos.js): je loopt tussen de stronken door, zoals in een
    // kapvlakte, en zo komt de houthakker bij de bomen erachter. In de speeltest van 6 okt zette hij zich met zijn eigen
    // stronken vast: na de rand van het bos kon hij er niet meer in. Een stronk die de maker op de kaart zette, heeft een
    // muur onder zich, zoals elk vast ding uit het vel (js/kaart.js).
    boomstronk: { blokkeert: false, zichtDicht: false },
    // Het kamp van het lege begin (js/begin.js; werklijst vraag 152): de tent of het afdak van een gezin, met de tegel erachter
    // als voet (`voet` op het voorwerp), en het kampvuur in het midden.
    tent: { blokkeert: true, zichtDicht: false, naam: T.t('a tent') },
    kampvuur: { blokkeert: true, zichtDicht: false, naam: T.t('the campfire') },
  };

  // De bomen en de struiken, op één plek (vraag 148, a: met een nieuwe soort hier telt hij overal mee). Een boom zonder
  // meer is een boom van het bos (T.NATUUR.bos, js/gebouwen.js): hij telt voor het bos, de houthakker hakt hem om, en de
  // bosrand om de kaart volgt hem (js/tekenen.js). `eigen`: een boom van iemand (de appelboom, T.isEigenBoom in
  // js/bos.js); `struik`: wat je rooit (js/bos.js). `wordt`: wat een boompje dat de houthakker op zijn plek plant wordt,
  // en `jong`: hoe het er als jonge boom uitziet (zonder: een eik). `wind`: hoe ver zijn kruin meebuigt (js/sprites.js),
  // `vlak`: zijn kleur, hoogte en breedte zonder kunst (js/tekenen.js), `rand`: hij staat ook in het bos om de kaart.
  T.BOMEN = {
    eik: { wordt: 'eik', jong: 'jongeEik', wind: 4, vlak: ['#4a7030', 46, 0.3], rand: true },
    herfstEik: { wordt: 'herfstEik', jong: 'jongeEik', wind: 4, vlak: ['#a9632a', 46, 0.3] },
    den: { wordt: 'den', jong: 'jongeDen', wind: 3, vlak: ['#2f5734', 54, 0.26], rand: true },
    berk: { wordt: 'berk', jong: 'jongeBerk', wind: 5, vlak: ['#6f9a45', 40, 0.22], rand: true },
    wilg: { wind: 6, vlak: ['#5d7f3c', 42, 0.32], rand: true },
    dodeBoom: { wind: 1, vlak: ['#6b5a44', 44, 0.2], rand: true },
    beuk: { wordt: 'beuk', jong: 'jongeEik', wind: 4, vlak: ['#4f7a2e', 50, 0.32], rand: true },
    linde: { wordt: 'linde', jong: 'jongeEik', wind: 4, vlak: ['#5b8536', 48, 0.32] },
    els: { wordt: 'els', jong: 'jongeBerk', wind: 5, vlak: ['#3f6630', 40, 0.24] },
    populier: { wind: 6, vlak: ['#58843a', 62, 0.16] },
    knotwilg: { wind: 3, vlak: ['#62813f', 30, 0.26] },
    groveDen: { wordt: 'groveDen', jong: 'jongeDen', wind: 3, vlak: ['#3c5e38', 50, 0.26] },
    appelboom: { eigen: true, wind: 4, vlak: ['#4f7a33', 38, 0.3], rand: true },
    struik: { struik: true, wind: 3, vlak: ['#3d6329', 18, 0.3], rand: true },
    bessenStruik: { struik: true, wind: 3, vlak: ['#3a5f2c', 16, 0.3], rand: true },
    meidoorn: { struik: true, wind: 3, vlak: ['#4b6e2c', 26, 0.3] },
    hazelaar: { struik: true, wind: 3, vlak: ['#557a32', 28, 0.3] },
    // het groen eronder (vraag 148, stap 3; Marcel, 11 okt: de braam en de brem staan in de weg en je rooit ze zoals een
    // struik): de braam aan de bosrand, de brem op de heide
    braam: { struik: true, wind: 2, vlak: ['#34552a', 16, 0.32] },
    brem: { struik: true, wind: 3, vlak: ['#4f7a2a', 18, 0.26] },
  };
  // Een boom van het bos (geen struik, niet van iemand), op zijn soort.
  T.isBosBoom = (soort) => !!T.BOMEN[soort] && !T.BOMEN[soort].struik && !T.BOMEN[soort].eigen;

  // Hoe snel de aanvoerder loopt, in tegels per seconde: wat vlotter dan een dorpeling (1,2 tot 1,5),
  // zodat rondlopen niet sleept. Zijn loopbeeld telt de afgelegde weg (js/sprites.js), dus zijn
  // voeten glijden bij geen enkele snelheid.
  T.AANVOERDER_SNELHEID = 2.2;

  // leven: levenspunten; wie op nul komt, valt. snelheid: tegels per
  // seconde tijdens het rondlopen. zicht: vanaf hoe ver een monster je opmerkt. aanval.schade:
  // wat een klap kost aan levenspunten. Namen staan met een kleine letter, omdat ze bijna altijd
  // midden in een zin staan.
  //
  // De aanvoerder heeft sinds 25 sep levenspunten, net als een monster (Marcel koos het, voorlopig:
  // ontwerp/spel.md, onder Open). Daarvoor was de leeftijd van de tovenaar zijn levensbalk, en
  // kostte een klap maanden; die maanden zijn hieronder gedeeld door twee, zodat de monsters
  // onderling even sterk bleven. Wat vallen echt betekent, komt bij punt 13 van de werklijst.
  // Zijn kant heet 'speler' en niet 'aanvoerder' (Marcel, 26 sep): soort en kant zijn twee dingen, en
  // een man van de militie (punt 13) vecht straks aan jouw kant zonder de aanvoerder te zijn.
  const WEZENS = {
    aanvoerder: { naam: T.t('commander'), kant: 'speler', leven: 20, snelheid: T.AANVOERDER_SNELHEID },
    // De mensen van het dorp staan niet hier maar in js/mensen.js: wie ze zijn, hoe ze heten, hoe
    // snel ze lopen en welk vel ze krijgen. Deze tabel gaat over wat een wezen ís — wat vecht,
    // wat in code wordt neergezet — en een dorpeling is dat niet. Zie
    // ontwerp/wereld.md, "Wie is wie, als het er honderd worden".
    slijm: {
      naam: T.t('slime crawler'), kant: 'monster', leven: 10, snelheid: 1.4, zicht: 5, dwaalt: true,
      aanval: { kosten: 3, schade: [2, 3], zin: T.t('bites {doel}') },
    },
    skelet: {
      naam: T.t('skeleton guard'), kant: 'monster', leven: 18, snelheid: 2.2, zicht: 5, dwaalt: false,
      aanval: { kosten: 3, schade: [3, 5], zin: T.t('hits {doel} with his sword') },
    },
    // Buiten, in het bos. Hij loopt harder dan de aanvoerder en ziet verder dan wat er
    // binnen rondloopt: buiten is er ruimte, en een wolf hoort eerder op te vallen dan een
    // slijmkruiper in een kelder.
    wolf: {
      naam: T.t('wolf'), kant: 'monster', leven: 12, snelheid: 2.6, zicht: 6, dwaalt: true,
      aanval: { kosten: 3, schade: [2, 4], zin: T.t('bites {doel}') },
    },
    // Dieper het bos in. De sleutel is hier de naam: js/sprites.js zoekt het figuur op de soort
    // op, dus deze twee heten precies zoals hun animatievellen in beelden/figuren
    // (bosvijanden-anim.cjs, via naar-spel.cjs). Zo kan Marcel ze in Tiled neerzetten met
    // wezen="reuzenspin" of wezen="kobold", zonder dat er nog ergens iets bij moet.
    //
    // De spin is traag maar taai en bijt gif: wie haar ziet aankomen, loopt om. De kobold loopt
    // bijna zo hard als een wolf en steekt met een speer, dus hij is juist niet te ontlopen.
    reuzenspin: {
      naam: T.t('giant spider'), kant: 'monster', leven: 14, snelheid: 2.0, zicht: 6, dwaalt: true,
      aanval: { kosten: 3, schade: [3, 4], zin: T.t('bites {doel} with her fangs') },
    },
    kobold: {
      naam: T.t('kobold'), kant: 'monster', leven: 16, snelheid: 2.4, zicht: 6, dwaalt: true,
      aanval: { kosten: 3, schade: [2, 4], zin: T.t('stabs {doel} with his spear') },
    },
    // De rovers (js/rovers.js; werklijst vraag 55, 29 sep): wie wegtrok, of wilde rovers van buiten. Ze dwalen niet
    // maar lopen waar hun aanval ze heen stuurt, en dragen het vel van gewone mensen (e.vel, zie S.houding in
    // js/sprites.js): er hoeft niets voor getekend te worden.
    rover: {
      naam: T.t('robber'), kant: 'monster', leven: 12, snelheid: 2.2, zicht: 6, dwaalt: false, vel: 'boer',
      aanval: { kosten: 3, schade: [2, 4], zin: T.t('hits {doel} with a club') },
    },
    // Een soldaat van het wachthuis (js/soldaten.js; vraag 159): wat hij kan als hij bij een aanval naast de aanvoerder vecht
    // (js/rovers.js). Hij is een bewoner met zijn eigen poppetje; dit is alleen zijn leven en zijn punten, en hoe hij slaat
    // zegt zijn wapen (T.slagVan).
    soldaat: { naam: T.t('soldier'), kant: 'speler', leven: 16, snelheid: 2.4, vel: 'boer' },
    // Wie van de heervaart terugkwam (js/heervaart.js; Marcel, 29 sep, vraag 60, B): hij heeft leren vechten. Hij
    // vecht mee als er rovers komen, ook zonder wachthuis, en houdt meer klappen uit dan een soldaat.
    veteraan: { naam: T.t('veteran'), kant: 'speler', leven: 20, snelheid: 2.4, vel: 'boer' },
  };

  const sleutelVan = (x, y) => x + ',' + y;

  // Alleen zodat js/kaart.js een wezen uit een ingelezen kaart in precies dezelfde vorm kan
  // neerzetten als hierboven; de vorm zelf (WEZENS, maakWezen) blijft hier, en verandert niet.
  T.maakWezen = maakWezen;
  // De tabel zelf gaat mee naar buiten, want dit is precies de lijst die Marcel in Tiled mag
  // invullen bij de eigenschap "wezen". Wie wil weten wat er te plaatsen valt, vraagt het hier.
  T.WEZENS = WEZENS;

  // "ij" is in het Nederlands één letter: ijzer wordt IJzer, niet Ijzer.
  T.hoofdletter = (s) => (/^ij/.test(s) ? 'IJ' + s.slice(2) : s.charAt(0).toUpperCase() + s.slice(1)); // geen tekst
  // Een klein getal in woorden, voor een bericht of een brief: "three wild robbers", "five able-bodied men" (Engels sinds
  // 11 okt, ontwerp/engels.md).
  const TELWOORDEN = [T.t('no'), T.t('one'), T.t('two'), T.t('three'), T.t('four'), T.t('five'), T.t('six'), T.t('seven'),
    T.t('eight'), T.t('nine'), T.t('ten'), T.t('eleven'), T.t('twelve')];
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
      { soort: 'pilaar', x: 3, y: 11 },
      { soort: 'pilaar', x: 6, y: 11 },
    );
    w.wezens.push(
      maakWezen('aanvoerder', 3, 5),
      maakWezen('slijm', 16, 4),
      maakWezen('skelet', 5, 13),
    );
    w.burenKamers = berekenBurenKamers(w);
    return w;
  };

  // x en y lopen vloeiend mee tijdens het lopen; tx en ty zijn de tegel waar het wezen
  // staat of naartoe stapt. Wie iets over bezetting vraagt, vraagt tx en ty.
  function maakWezen(soort, x, y) {
    // Uit de plek, niet uit Math.random, zodat het op elke computer hetzelfde wezen is (werklijst vraag 170, stap 0).
    const lot = T.dobbelsteen((Math.floor(x) * 4099 + Math.floor(y) * 7) >>> 0);
    const s = WEZENS[soort];
    return {
      soort, naam: s.naam, kant: s.kant,
      x, y, tx: x, ty: y, pad: [], onderweg: false,
      leven: s.leven, maxLeven: s.leven, snelheid: s.snelheid, zicht: s.zicht || 0,
      // Waar hij hoort en hoe ver hij daarvandaan dwaalt. Zonder thuis blijft hij in zijn eigen
      // kamer; dat werkt binnen, maar buiten is de hele kaart één kamer (zie T.laatDwalen).
      dwaalt: !!s.dwaalt, thuis: s.straal ? { x, y } : null, straal: s.straal || 0,
      aanval: s.aanval || null,
      // Een geleend vel, zolang dit figuur nog niet getekend is (js/sprites.js, S.houding).
      vel: s.vel || null,
      dwaalTijd: 1 + lot() * 2, fase: lot() * 6.28,
      dood: false, sterfTijd: 0, uitval: null, flits: 0, alarm: 0,
    };
  }

  // Per tegel: welke kamers liggen er direct omheen (ook schuin). Een muur of deur is
  // zichtbaar zodra een van die kamers bekend is.
  function berekenBurenKamers(w) {
    const r = [];
    const vak = T.kaartVak(w);
    for (let y = vak.y; y < vak.y + vak.h; y++) {
      const rij = [];
      for (let x = vak.x; x < vak.x + vak.b; x++) {
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

  // ── De kaart: één weg naar de tegels (B2a en B2b, vraag 117, stap 3; ontwerp/kaarten.md, "Het hele eiland") ──
  // Wat een tegel is (een woord: 'buiten', 'muur', 'vloer' of 'deur'), welke grond eronder ligt, en wat de kaart
  // beslaat, vraag en zet je alleen hier: niets anders leest w.tegels, w.grond, w.b of w.h zelf (test/tegels.test.cjs
  // kijkt het na). Er zijn twee soorten kaart achter dezelfde vragen: een kaart uit Tiled (de proefkaarten, de kamers
  // van de toetsen), met w.tegels en w.grond van (0, 0) tot (w.b, w.h), en een kaart van het eiland (T.eilandKaart
  // hieronder), het hele eiland in stukken.
  const opEiland = (w) => !!(w && w.eiland && !w.tegels);
  T.opEiland = opEiland;
  T.opKaart = (w, x, y) => (opEiland(w) ? x >= 0 && y >= 0 && x < EILAND_MAAT() && y < EILAND_MAAT() : x >= 0 && y >= 0 && x < w.b && y < w.h);
  T.tegel = function (w, x, y) {
    if (!opEiland(w)) return T.opKaart(w, x, y) ? w.tegels[y][x] : 'buiten';
    const s = openStuk(w, x, y);
    return s ? WOORD[s.tegel[(y - s.y0) * STUK + (x - s.x0)]] : 'buiten';
  };
  // Buiten de kaart zet het niets, en op het eiland ook niet in een stuk dat niet open is.
  T.zetTegel = function (w, x, y, soort) {
    if (!opEiland(w)) {
      if (T.opKaart(w, x, y)) w.tegels[y][x] = soort;
      return;
    }
    const s = openStuk(w, x, y);
    if (!s) return;
    s.tegel[(y - s.y0) * STUK + (x - s.x0)] = CODE[soort];
    w.tegelsAnders.set(T.tegelNummer(x, y), soort);
  };
  // De grond op tegel (x, y): één ding per soort tegel ({ vel, id, naam }, js/kaart.js), of null (buiten de kaart, of
  // een kaart zonder grond).
  T.grondOp = function (w, x, y) {
    if (!opEiland(w)) return (w && w.grond && T.opKaart(w, x, y) && w.grond[y][x]) || null;
    const s = openStuk(w, x, y);
    return s ? T.grondVanGid(s.grond[(y - s.y0) * STUK + (x - s.x0)]) : null;
  };
  // Het vak dat de kaart beslaat: { x, y, b, h }. Wat over de hele kaart gaat (een lijst per tegel, een lus over alle
  // tegels), gaat over dit vak, met tegel (x, y) op plek (y - vak.y) * vak.b + (x - vak.x). Op het eiland is dat het vak
  // om het dorp (w.vak), want het eiland is te groot voor één lijst: in B2b, stap 4, krijgt wat niet om het dorp gaat
  // zijn eigen vak.
  T.kaartVak = (w) => (opEiland(w) ? w.vak : { x: 0, y: 0, b: w.b, h: w.h });
  // Het land van een dorp (D.plek.vak): op het eiland zijn 100 bij 100 tegels, op een kaart uit Tiled de kaart. Wat over
  // het land van één dorp zoekt (waar de wolven en de herten wonen, een plek om te bouwen, het water voor een visser),
  // neemt dit vak; wat van de kaart is (het tekenen, het lopen, de paadjes), neemt T.kaartVak: op het eiland het vak om
  // alle dorpen op de kaart (werklijst vraag 170, stap 6a).
  T.dorpVak = (D) => D.plek.vak;
  // Waar de kaart tegels kan hebben, { x, y, b, h }: om het tekenen af te knippen, en om te zoeken in wat er in beeld is.
  // Op het eiland het hele eiland, dus maak er nooit een lijst over (daarvoor is T.kaartVak).
  T.kaartGrens = (w) => (opEiland(w) ? { x: 0, y: 0, b: EILAND_MAAT(), h: EILAND_MAAT() } : { x: 0, y: 0, b: w.b, h: w.h });
  // Het vak waarin gelopen wordt, { x, y, b, h }: op het eiland alle stukken die open zijn (B2b, stap 4: "Overal"), op een
  // kaart uit Tiled de kaart. Het vaste raster en de eilanden van A* (hieronder) beslaan dit vak, zodat wie buiten het vak
  // om het dorp staat (die over de weg binnenkwam), ook een weg vindt; de velden van het lopen het dorp met een rand
  // (js/lopen.js). Het groeit als er een stuk open gaat; tot dan is het hetzelfde ding, zodat wie het onthoudt, ziet of
  // het veranderde.
  const LOOPVAK = new WeakMap();
  T.loopVak = function (w) {
    const al = LOOPVAK.get(w);
    if (!opEiland(w)) {
      if (al && al.vak.b === w.b && al.vak.h === w.h) return al.vak;
      const vak = T.kaartVak(w);
      LOOPVAK.set(w, { vak });
      return vak;
    }
    if (al && al.open === w.open.size) return al.vak;
    let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
    for (const n of w.open) {
      const sx = n % 64;
      const sy = Math.floor(n / 64);
      x0 = Math.min(x0, sx * STUK);
      y0 = Math.min(y0, sy * STUK);
      x1 = Math.max(x1, (sx + 1) * STUK);
      y1 = Math.max(y1, (sy + 1) * STUK);
    }
    const vak = w.open.size ? { x: x0, y: y0, b: x1 - x0, h: y1 - y0 } : { ...w.vak };
    LOOPVAK.set(w, { open: w.open.size, vak });
    return vak;
  };
  // Ligt tegel (x, y) in dit vak? Wie een lijst over T.kaartVak bijhoudt, vraagt dit, niet T.opKaart: op het eiland is
  // de kaart veel groter dan het vak.
  T.inVak = (vak, x, y) => x >= vak.x && y >= vak.y && x < vak.x + vak.b && y < vak.y + vak.h;
  // Heeft deze kaart tegels, en grond? Een toets kan een kaart zonder maken (zoals die van het vee).
  T.heeftTegels = (w) => opEiland(w) || !!(w && w.tegels && w.tegels.length);
  T.heeftGrond = (w) => opEiland(w) || !!(w && w.grond && w.grond.length);
  // Een tegel als één getal dat niet van de maat van de kaart afhangt (het eiland is kleiner dan 4096 tegels), voor wat
  // per tegel bewaard wordt (het slijten van de paadjes, js/paden.js; wat op het eiland veranderde); en terug.
  T.tegelNummer = (x, y) => y * 4096 + x;
  T.tegelVanNummer = (k) => ({ x: k % 4096, y: Math.floor(k / 4096) });
  // Welke kamers er om tegel (x, y) liggen (berekenBurenKamers, hierboven); buiten de kaart geen, en op het eiland is
  // alles buiten.
  const BUITEN = ['buiten'];
  T.burenKamersOp = (w, x, y) => (!T.opKaart(w, x, y) ? [] : opEiland(w) ? BUITEN : w.burenKamers[y][x]);

  // ── De kaart van het eiland, in stukken (B2b) ──
  // Het eiland komt uit zijn nummer (js/eiland.js), en het land van elk stuk van STUK bij STUK tegels uit T.landStuk
  // (js/maker.js). Wat in het spel bewaard wordt (in S), is alleen wat er anders werd: per tegelnummer het woord
  // (w.tegelsAnders, T.zetTegel), de grond (w.grondAnders: de maker legt het plein en zijn grond), en wat er van het eiland
  // weg is (w.gerooid, T.haalVoorwerpWeg); wat iemand neerzette staat in w.voorwerpen, zoals op elke kaart. En welke
  // stukken open zijn (w.open, stuknummers): waar je mensen kwamen (wat een dorp kent, staat in het dorp: D.gekend, js/mist.js). Een stuk dat
  // niet open is, is 'buiten', zodat A* nooit een stuk laat maken en wat er gebeurt niet van het scherm afhangt. De
  // stukken zelf zijn geen spelstaat: ze staan per kaart in STUKKEN (niet in S), en een geladen spel maakt ze opnieuw,
  // met wat er anders werd erover.
  const STUK = 64;
  T.STUK = STUK;
  const EILAND_MAAT = () => T.EILAND_INSTELLINGEN.maat;
  const WOORD = ['buiten', 'vloer', 'muur', 'deur'];
  const CODE = { buiten: 0, vloer: 1, muur: 2, deur: 3 };
  const STUKKEN = new WeakMap();
  T.stukNummer = (sx, sy) => sy * 64 + sx;
  T.stukVan = (x, y) => T.stukNummer(Math.floor(x / STUK), Math.floor(y / STUK));
  // Een nieuwe kaart van het eiland van `zaad`, met `vak` het vak om het dorp (T.kaartVak). Nog zonder open stukken.
  T.eilandKaart = function (zaad, vak) {
    const kamer = { id: 'buiten', naam: T.t('Outside'), x1: 0, y1: 0, x2: EILAND_MAAT() - 1, y2: EILAND_MAAT() - 1, vloer: ['#3c5e1e', '#355f22'] };
    return {
      eiland: { zaad }, vak: { ...vak },
      open: new Set(), tegelsAnders: new Map(), grondAnders: new Map(), gerooid: new Set(),
      deuren: new Map(), geheimen: [], kamers: [kamer], voorwerpen: [], questVoorwerpen: [], wezens: [],
      bekend: new Set(['buiten']), huidigeKamer: 'buiten', overgangen: [], akkers: [], meenten: [],
      buiten: true, naam: null, proef: false, pleinen: [], plekken: [],
    };
  };
  function stukkenVan(w) {
    let m = STUKKEN.get(w);
    if (!m) STUKKEN.set(w, (m = new Map()));
    return m;
  }
  // Het stuk van tegel (x, y) als het open is (en dan gemaakt), anders null.
  function openStuk(w, x, y) {
    if (!(x >= 0 && y >= 0 && x < EILAND_MAAT() && y < EILAND_MAAT())) return null;
    const sx = Math.floor(x / STUK);
    const sy = Math.floor(y / STUK);
    const n = T.stukNummer(sx, sy);
    if (!w.open.has(n)) return null;
    const m = stukkenVan(w);
    let s = m.get(n);
    if (!s) m.set(n, (s = maakStuk(w, sx, sy)));
    return s;
  }
  // Wat een tegel van het eiland is naar zijn grond: water en wat verder vast is, is muur, behalve onder een brug (js/eiland.js,
  // legBruggen): daar loop je over het water.
  const tegelVanGrond = (E, x, y, gid) => (!E.brugOp.has(y * E.maat + x) && T.grondVanGid(gid) && T.grondVanGid(gid).vast ? CODE.muur : CODE.vloer);
  // De brug van het eiland op tegel (x, y): { brug (het nummer in E.bruggen), i (langs, -1 en L zijn de landhoofden), k
  // (dwars, 0 tot 2) }, of null.
  T.brugOp = function (w, x, y) {
    if (!opEiland(w)) return null;
    const E = T.eilandVan(w.eiland.zaad);
    return E.brugOp.get(y * E.maat + x) || null;
  };
  // Het land van het eiland (T.landStuk, of `L` als het vooruit gemaakt is), met wat er anders werd erover.
  const NATUUR = new Map(); // naam → { vel, id, eig }: de tekening van wat er op het eiland groeit
  function maakStuk(w, sx, sy, L = null) {
    const x0 = sx * STUK;
    const y0 = sy * STUK;
    const E = T.eilandVan(w.eiland.zaad);
    if (!L) L = T.landStuk(E, x0, y0, STUK, STUK);
    const tegel = new Uint8Array(STUK * STUK);
    const grond = new Uint16Array(STUK * STUK);
    const op = new Array(STUK * STUK).fill(null);
    for (let i = 0; i < STUK * STUK; i++) {
      const n = T.tegelNummer(x0 + (i % STUK), y0 + Math.floor(i / STUK));
      const anders = w.grondAnders.get(n);
      grond[i] = anders != null ? anders : L.grond[i];
      tegel[i] = tegelVanGrond(E, x0 + (i % STUK), y0 + Math.floor(i / STUK), grond[i]);
    }
    for (const d of L.dingen) {
      if (w.gerooid.has(T.tegelNummer(d.x, d.y))) continue;
      if (!NATUUR.has(d.naam)) NATUUR.set(d.naam, T.opzoekTegelNaam(T.natuurTegel(d.naam)));
      const v = T.maakVoorwerp(NATUUR.get(d.naam), d.x, d.y);
      v.natuur = true;
      const i = (d.y - y0) * STUK + (d.x - x0);
      op[i] = v;
      if (NATUUR.get(d.naam).eig.vast) tegel[i] = CODE.muur; // een vast ding staat op een muur, zoals de maker het legt
    }
    for (let i = 0; i < STUK * STUK; i++) {
      const anders = w.tegelsAnders.get(T.tegelNummer(x0 + (i % STUK), y0 + Math.floor(i / STUK)));
      if (anders) tegel[i] = CODE[anders];
    }
    return { sx, sy, x0, y0, tegel, grond, op };
  }
  // Maak de stukken open die (een deel van) dit vak raken. Een stuk dat open gaat, is geen verandering van de kaart (geen
  // T.kaartVeranderd): er komt alleen land bij. Wat het land beslaat, kijkt zelf naar w.open, en neemt alleen het nieuwe
  // stuk erbij (het raster en de eilanden hieronder, de velden en de wegen in js/lopen.js, de grond in js/tekenen.js;
  // Marcel, 13 okt: "Alles per stuk").
  T.openVak = function (w, vak) {
    for (let sy = Math.max(0, Math.floor(vak.y / STUK)); sy * STUK < Math.min(EILAND_MAAT(), vak.y + vak.h); sy++) {
      for (let sx = Math.max(0, Math.floor(vak.x / STUK)); sx * STUK < Math.min(EILAND_MAAT(), vak.x + vak.b); sx++) w.open.add(T.stukNummer(sx, sy));
    }
  };
  // Bij welk dorp een wezen hoort (werklijst vraag 170, stap 6a; Marcel, 15 okt: "elk een eigen dorp op hetzelfde
  // eiland"): een wezen draagt zijn dorp mee (`e.dorp`, gezet waar het ontstaat: T.nieuwDorp, het poppetje van een
  // bewoner in js/bewoners.js, T.maakKar, het vee, de wolven en de herten van zijn bos, de rovers van een overval, en wie
  // op bezoek komt: de marskramer, de heer en zijn soldaten). Elk dorp werkt alleen zijn eigen wezens bij (zijn
  // dobbelsteen, zijn dag, zijn gevecht), zodat er meer dorpen op één kaart kunnen leven zonder elkaar te raken. Een
  // wezen zonder dorp is van de wereld (stap 6a2, a; Marcel, 16 okt: "Het wild is van iedereen"): het wild, en wat een
  // kaart uit Tiled of een toets neerzet. Dat werkt de wereld bij, één keer per kaart (T.wereldTik, js/tik.js), en geen
  // dorp; `T.hoortBij(null, e)` is zo'n wezen (een kaart zonder dorp, het gereedschap).
  T.hoortBij = (D, e) => (e.dorp || null) === (D || null);
  // Wie van dorp D is en buiten staat: zijn aanvoerder, wie er woont, zijn ossenkarren (geen dier en geen bezoeker, ook
  // de wagen van de heer niet, js/heer.js). Zij maken het land open (hieronder) en kijken door de mist van hun dorp
  // (js/mist.js).
  T.isVanDorp = (D, e) => !!D && !!e && e.dorp === D && !e.dood && !e.binnen && (!!e.bewoner || (!!e.kar && !e.vanDeHeer) || e === D.aanvoerder);
  // Het land gaat open waar je mensen komen (stap 5; Marcel, 13 okt: "Al je mensen"): een stuk binnen `openRond` tegels
  // van de aanvoerder, van wie in het dorp woont of van de ossenkar. Hooguit één per beeld. Geeft het stuknummer, of null.
  // `dt` is de tijd van het scherm sinds het vorige beeld (js/dorp.js): zoveel tijd krijgt het vooruit maken.
  T.werkStukkenBij = function (S, D, dt) {
    const w = D.wereld;
    if (!opEiland(w)) return null;
    const R = IN().openRond;
    const rand = Math.floor((EILAND_MAAT() - 1) / STUK);
    for (const e of w.wezens) {
      if (!T.isVanDorp(D, e)) continue;
      const [x, y] = [Math.round(e.x), Math.round(e.y)];
      for (let sy = Math.max(0, Math.floor((y - R) / STUK)); sy <= Math.min(rand, Math.floor((y + R) / STUK)); sy++) {
        for (let sx = Math.max(0, Math.floor((x - R) / STUK)); sx <= Math.min(rand, Math.floor((x + R) / STUK)); sx++) {
          const n = T.stukNummer(sx, sy);
          if (w.open.has(n)) continue;
          w.open.add(n);
          return n;
        }
      }
    }
    const tot = performance.now() + IN().vooruitMsPerSeconde * (dt || 0);
    while (maakVooruit(S, w, R + IN().vooruit) && performance.now() < tot);
    return null;
  };
  // Vooruit: het stuk dat het eerst nodig is (nodigOver), binnen R tegels van je mensen of langs het pad van wie loopt,
  // en dat niet open is en nog niet gemaakt, een deel verder
  // (T.landStuk op een deel van het stuk: het land is hetzelfde in welke delen je het maakt, test/landstuk.test.cjs). Is
  // het laatste deel er, dan wordt het stuk gemaakt, en het wacht tot het open gaat (openStuk kijkt eerst naar w.open).
  const VOORUIT = new WeakMap(); // kaart → { n, sx, sy, delen: [...] }: het stuk dat nu vooruit gemaakt wordt
  function maakVooruit(S, w, R) {
    const m = stukkenVan(w);
    let v = VOORUIT.get(w);
    if (v && (m.has(v.n) || w.open.has(v.n))) v = null;
    if (!v) {
      const rand = Math.floor((EILAND_MAAT() - 1) / STUK);
      let ver = Infinity;
      for (const e of w.wezens) {
        if (!T.isVanDorp(e.dorp, e)) continue; // vooruit maken voor wie van een dorp is, van welk dan ook
        const kandidaten = (x, y, r) => {
          [x, y] = [Math.round(x), Math.round(y)];
          for (let sy = Math.max(0, Math.floor((y - r) / STUK)); sy <= Math.min(rand, Math.floor((y + r) / STUK)); sy++) {
            for (let sx = Math.max(0, Math.floor((x - r) / STUK)); sx <= Math.min(rand, Math.floor((x + r) / STUK)); sx++) {
              const n = T.stukNummer(sx, sy);
              if (w.open.has(n) || m.has(n)) continue;
              const d = nodigOver(e, sx, sy);
              if (d < ver) [ver, v] = [d, { n, sx, sy, delen: [] }];
            }
          }
        };
        kandidaten(e.x, e.y, R);
        if (e.pad && e.pad.length) {
          for (let i = 0; i < e.pad.length; i += PAD_STAP) kandidaten(e.pad[i].x, e.pad[i].y, IN().openRond);
        }
      }
      VOORUIT.set(w, v);
      if (!v) return false;
    }
    const d = IN().vooruitDeel;
    const per = Math.ceil(STUK / d);
    if (v.delen.length < per * per) {
      const i = v.delen.length;
      const E = T.eilandVan(w.eiland.zaad);
      const [x, y] = [v.sx * STUK + (i % per) * d, v.sy * STUK + Math.floor(i / per) * d];
      // eerst de blokken van het eiland onder het rekenvak van dit deel (zijn rand erbij, de tegels en de hoeken), één per
      // stap, zodat geen stap meer dan een paar ms kost (T.eilandRaster, js/eiland.js; `snelheid.md`, F1)
      const M = T.STUK_MARGE;
      if (T.eilandRasterVooruit(E, x - M, y - M, d + 2 * M, d + 2 * M) || T.eilandRasterVooruit(E, x - M, y - M, d + 2 * M + 1, d + 2 * M + 1, true)) return true;
      v.delen.push(T.landStuk(E, x, y, d, d));
      return true;
    }
    const grond = new Uint16Array(STUK * STUK);
    const dingen = [];
    v.delen.forEach((L, i) => {
      const [dx, dy] = [(i % per) * d, Math.floor(i / per) * d];
      for (let y = 0; y < d; y++) for (let x = 0; x < d; x++) grond[(dy + y) * STUK + dx + x] = L.grond[y * d + x];
      dingen.push(...L.dingen);
    });
    m.set(v.n, maakStuk(w, v.sx, v.sy, { grond, dingen }));
    VOORUIT.delete(w);
    return true;
  }
  // Over hoeveel stappen stuk (sx, sy) nodig is voor wezen e: het gaat open als e binnen openRond tegels komt. Wie loopt,
  // volgt zijn pad (e.pad[0] is de volgende stap), dus het stuk waar zijn pad het eerst langs komt, eerst; een stuk achter
  // hem is pas nodig als hij terugkomt. Wie stilstaat, komt er misschien nooit: zijn stukken komen na wat een loper
  // binnen `vooruit` tegels nodig heeft. Tot 13 okt telde alleen hoe dichtbij een stuk lag, ook achter de aanvoerder, en
  // lag 8 van de 18 stukken van de stukmeting niet klaar als het open ging (21 tot 57 ms land maken in dat beeld).
  const PAD_STAP = 4; // zo om de zoveel stappen kijkt het langs het pad
  function nodigOver(e, sx, sy) {
    const R = IN().openRond;
    const af = (x, y) => Math.max(sx * STUK - x, x - (sx + 1) * STUK, sy * STUK - y, y - (sy + 1) * STUK, 0);
    if (!e.pad || !e.pad.length) return Math.max(0, af(Math.round(e.x), Math.round(e.y)) - R) + IN().vooruit;
    let nodig = Infinity;
    for (let i = 0; i < e.pad.length; i += PAD_STAP) nodig = Math.min(nodig, i + Math.max(0, af(e.pad[i].x, e.pad[i].y) - R));
    const eind = e.pad[e.pad.length - 1];
    return Math.min(nodig, e.pad.length + Math.max(0, af(eind.x, eind.y) - R));
  }
  // Hoeveel stukken er open zijn: wat het land beslaat, ziet zo dat er land bij kwam (een kaart uit Tiled: 0).
  const openGrootte = (w) => (w.open ? w.open.size : 0);
  T.openGrootte = openGrootte;
  // De stukken die open gingen sinds `al` (een Set van stuknummers), als { x, y, b, h } in tegels.
  const nieuweStukken = (w, al) => [...w.open].filter((n) => !al.has(n)).map((n) => ({ x: (n % 64) * STUK, y: Math.floor(n / 64) * STUK, b: STUK, h: STUK }));
  T.nieuweStukken = nieuweStukken;
  const binnenVak = (a, b) => a.x >= b.x && a.y >= b.y && a.x + a.b <= b.x + b.b && a.y + a.h <= b.y + b.h;
  // Het ding van het eiland op tegel (x, y), of null.
  function natuurOp(w, x, y) {
    const s = openStuk(w, x, y);
    return s ? s.op[(y - s.y0) * STUK + (x - s.x0)] : null;
  }
  // Alles wat in dit vak staat: wat iemand zette (w.voorwerpen), en op het eiland wat er groeit, in de stukken die open
  // zijn. Voor wie zoekt wat er in een stuk land staat (een boom, iets laags dat plaats maakt voor een gebouw).
  // Het open stuk met nummer n (T.stukNummer), gemaakt als het er nog niet was: { sx, sy, x0, y0, op, ... }, met op wat er
  // per tegel staat. Voor de vaste rijen in js/tekenen.js (vraag 178, B2), die het per stuk doen, zoals hieronder.
  T.stukOpen = (w, n) => stukkenVan(w).get(n) || openStuk(w, (n % 64) * STUK, Math.floor(n / 64) * STUK);
  // Het land van de open stukken die er nog niet zijn, zoveel als in ladenMsPerBeeld past, en minstens één. Een stuk wordt
  // niet bewaard, dus na het laden is er nog geen, en anders maakte de eerste tik ze allemaal tegelijk, als het raster om
  // het dorp of het tekenen erom vroeg: op het proefdorp 0,5 s, na veel verkennen seconden (18 okt; `snelheid.md`, F2).
  // Geeft { klaar, open }: hoeveel stukken er nu zijn, van de open stukken. Geen spelstaat: het land is hetzelfde,
  // wanneer het ook gemaakt wordt.
  T.maakOpenStukken = function (w) {
    const open = openGrootte(w);
    if (!opEiland(w)) return { klaar: open, open };
    const m = stukkenVan(w);
    const tot = performance.now() + IN().ladenMsPerBeeld;
    let klaar = 0;
    let gemaakt = 0;
    for (const n of w.open) {
      if (!m.has(n)) {
        if (gemaakt && performance.now() >= tot) continue;
        T.stukOpen(w, n);
        gemaakt++;
      }
      klaar++;
    }
    return { klaar, open };
  };
  T.voorwerpenIn = function (w, vak) {
    const binnen = (v) => v.x >= vak.x && v.y >= vak.y && v.x < vak.x + vak.b && v.y < vak.y + vak.h;
    const uit = (w.voorwerpen || []).filter(binnen);
    if (!opEiland(w)) return uit;
    for (const n of w.open) {
      // eerst of het stuk het vak raakt, en dan pas maken: anders maakt één vraag over een klein vak elk open stuk
      const [x0, y0] = [(n % 64) * STUK, Math.floor(n / 64) * STUK];
      if (x0 >= vak.x + vak.b || y0 >= vak.y + vak.h || x0 + STUK <= vak.x || y0 + STUK <= vak.y) continue;
      const s = stukkenVan(w).get(n) || openStuk(w, x0, y0);
      // alleen het deel van het stuk in het vak, rij voor rij zoals de lijst ligt (vraag 178: elk stuk helemaal, 4096
      // tegels, kostte ver uitgezoomd een halve ms per beeld)
      const ix0 = Math.max(0, Math.floor(vak.x) - x0);
      const iy0 = Math.max(0, Math.floor(vak.y) - y0);
      const ix1 = Math.min(STUK, Math.ceil(vak.x + vak.b) - x0);
      const iy1 = Math.min(STUK, Math.ceil(vak.y + vak.h) - y0);
      for (let iy = iy0; iy < iy1; iy++) {
        for (let i = iy * STUK + ix0, eind = iy * STUK + ix1; i < eind; i++) {
          const v = s.op[i];
          if (v && binnen(v)) uit.push(v);
        }
      }
    }
    return uit;
  };
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
    if (Number.isInteger(x) && Number.isInteger(y)) return lijstPerTegel(w).get(tegelSleutel(x, y)) || (opEiland(w) && natuurOp(w, x, y)) || null;
    // Tussen twee tegels in (een poppetje onderweg): zoals vroeger, langs alle voorwerpen.
    return w.voorwerpen.find((v) => {
      const f = T.voetVan(v);
      return x >= f.x1 && x <= f.x2 && y >= f.y1 && y <= f.y2;
    }) || null;
  };
  // T.voorwerpOp voor elke tegel van het vak { x, y, b, h } (gehele getallen) in één keer: een lijst, tegel (x, y) op plek
  // (y - vak.y) * vak.b + (x - vak.x), met hetzelfde als T.voorwerpOp (het eerste voorwerp van w.voorwerpen dat de tegel
  // beslaat, anders wat er op het eiland groeit), of null. Voor wie elke nacht een heel vak afloopt (T.bosInVak): per
  // tegel vroeg dat vier opzoekingen, hier leest het de rijen van de stukken zoals ze liggen.
  T.voorwerpOpVak = function (w, vak) {
    const uit = new Array(vak.b * vak.h).fill(null);
    for (const v of w.voorwerpen || []) {
      const f = T.voetVan(v);
      if (!Number.isInteger(f.x1) || !Number.isInteger(f.y1)) continue; // die vindt T.voorwerpOp ook niet
      for (let y = Math.max(vak.y, f.y1); y <= Math.min(vak.y + vak.h - 1, f.y2); y++) {
        for (let x = Math.max(vak.x, f.x1); x <= Math.min(vak.x + vak.b - 1, f.x2); x++) {
          const i = (y - vak.y) * vak.b + (x - vak.x);
          if (uit[i] === null) uit[i] = v; // staan er twee op één tegel, dan de eerste, zoals lijstPerTegel
        }
      }
    }
    if (!opEiland(w)) return uit;
    for (const n of w.open) {
      const [x0, y0] = [(n % 64) * STUK, Math.floor(n / 64) * STUK];
      if (x0 >= vak.x + vak.b || y0 >= vak.y + vak.h || x0 + STUK <= vak.x || y0 + STUK <= vak.y) continue;
      const s = stukkenVan(w).get(n) || openStuk(w, x0, y0);
      if (!s) continue;
      // niet over de rand van het eiland, zoals openStuk
      const [xa, xb] = [Math.max(vak.x, x0, 0), Math.min(vak.x + vak.b, x0 + STUK, EILAND_MAAT())];
      for (let y = Math.max(vak.y, y0, 0); y < Math.min(vak.y + vak.h, y0 + STUK, EILAND_MAAT()); y++) {
        let i = (y - vak.y) * vak.b + (xa - vak.x);
        for (let j = (y - y0) * STUK + (xa - x0), eind = j + (xb - xa); j < eind; j++, i++) if (uit[i] === null && s.op[j]) uit[i] = s.op[j];
      }
    }
    return uit;
  };
  T.zetVoorwerp = function (w, v) {
    (w.voorwerpen || (w.voorwerpen = [])).push(v);
    T.kaartVeranderd(w, T.voetVan(v));
    return v;
  };
  // Wat van het eiland kwam (v.natuur), gaat uit zijn stuk, en het bewaarde spel onthoudt dat het weg is (w.gerooid).
  T.haalVoorwerpWeg = function (w, v) {
    const i = w.voorwerpen.indexOf(v);
    if (i >= 0) w.voorwerpen.splice(i, 1);
    else if (v.natuur && opEiland(w)) {
      const s = openStuk(w, v.x, v.y);
      const j = s ? (v.y - s.y0) * STUK + (v.x - s.x0) : -1;
      if (s && s.op[j] === v) {
        s.op[j] = null;
        // de tegel wordt wat de grond is, zoals een geladen spel hem maakt (maakStuk)
        const nr = T.tegelNummer(v.x, v.y);
        if (!w.tegelsAnders.has(nr)) s.tegel[j] = tegelVanGrond(T.eilandVan(w.eiland.zaad), v.x, v.y, s.grond[j]);
      }
      w.gerooid.add(T.tegelNummer(v.x, v.y));
    }
    T.kaartVeranderd(w, T.voetVan(v));
  };
  // De kaart is veranderd (een voorwerp, of een tegel die een muur werd of weer vloer): wat eruit volgt, rekent hij
  // opnieuw uit als iemand het vraagt, de lijst per tegel en de eilanden (hieronder). Met `plek` ({ x1, y1, x2, y2 }, zoals
  // T.voetVan) werkt het raster van wat vaststaat alleen die tegels bij, in plaats van het hele land opnieuw.
  // Kwam er op die plek alleen ruimte bij (een boom om), dan worden de eilanden niet opnieuw gezocht: de tegels die vrij
  // kwamen, gaan op in de eilanden ernaast (maakVrij). Kwam er iets vast bij, dan alles opnieuw, want een eiland kan in
  // tweeën gaan.
  T.kaartVeranderd = function (w, plek) {
    PER_TEGEL.delete(w);
    const e = EILANDEN.get(w);
    EILANDEN.delete(w);
    const r = RASTERS.get(w);
    if (plek && r && r.kaart === T.kaartVersie(w) && r.vak === T.loopVak(w) && r.open === openGrootte(w)) {
      const v = r.vak;
      const [x0, y0] = [Math.max(v.x, plek.x1), Math.max(v.y, plek.y1)];
      const [x1, y1] = [Math.min(v.x + v.b - 1, plek.x2), Math.min(v.y + v.h - 1, plek.y2)];
      const vrij = [];
      let vaster = false;
      if (x1 >= x0 && y1 >= y0) {
        const was = [];
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) was.push(r.raster[(y - v.y) * v.b + (x - v.x)]);
        vulRaster(w, r.raster, v, x0, y0, x1 - x0 + 1, y1 - y0 + 1);
        let i = 0;
        for (let y = y0; y <= y1; y++) {
          for (let x = x0; x <= x1; x++, i++) {
            const nu = r.raster[(y - v.y) * v.b + (x - v.x)];
            if (was[i] === VAST && nu !== VAST) vrij.push((y - v.y) * v.b + (x - v.x));
            else if (was[i] !== VAST && nu === VAST) vaster = true;
          }
        }
      }
      Object.assign(r, { voorwerpen: w.voorwerpen, aantal: w.voorwerpen.length, kaart: T.kaartVersie(w) + 1 });
      if (e && e.vak === v && e.open === openGrootte(w) && !vaster) {
        maakVrij(w, e, r.raster, vrij);
        EILANDEN.set(w, e);
      }
    } else {
      RASTERS.delete(w);
      if (laatste && laatste.w === w) laatste = null;
    }
    const log = PLEKKEN.get(w) || { van: T.kaartVersie(w), plekken: [] };
    log.plekken.push(plek ? { ...plek } : null);
    if (log.plekken.length > PLEKKEN_MAX) {
      log.plekken.shift();
      log.van++;
    }
    PLEKKEN.set(w, log);
    VERSIES.set(w, T.kaartVersie(w) + 1);
  };
  // Waar de kaart veranderde sinds versie `versie`: een lijst plekken ({ x1, y1, x2, y2 }), of null als dat niet bekend is
  // (een verandering zonder plek, of meer dan PLEKKEN_MAX geleden). Zo tekent js/tekenen.js alleen de grond rond een
  // gevelde boom of een nieuw gebouw opnieuw, in plaats van alle grond in beeld (13 okt: 49 ms in plaats van 11). Net als
  // de versie geen spelstaat. `van` is de versie vóór de eerste plek in de lijst.
  const PLEKKEN = new WeakMap();
  const PLEKKEN_MAX = 64;
  T.kaartPlekkenSinds = function (w, versie) {
    const nu = T.kaartVersie(w);
    if (versie === nu) return [];
    const log = PLEKKEN.get(w);
    if (!log || versie < log.van || versie > nu) return null;
    const plekken = log.plekken.slice(versie - log.van);
    return plekken.includes(null) ? null : plekken;
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
  // Op het eiland gaat er land open (T.werkStukkenBij): dan krijgen alleen de tegels van het nieuwe stuk een eiland, en
  // waar dat aan een eiland van het oude land raakt, worden ze één (`ouder`: elk eiland wijst naar het eiland waar het in
  // opging, en T.eilandOp geeft het bovenste). Wat ruim is, leest het uit het raster van wat vaststaat (hieronder): een
  // deur telt als open, een muur, buiten en wat in de weg staat niet.
  const EILANDEN = new WeakMap();
  const RUIM = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  function bovenste(ouder, a) {
    while (ouder[a] !== a) a = ouder[a] = ouder[ouder[a]];
    return a;
  }
  function eilandenVan(w) {
    const vak = T.loopVak(w);
    const al = EILANDEN.get(w);
    if (al && al.vak === vak && al.open === openGrootte(w)) return al;
    const raster = vastRaster(w);
    const { b, h } = vak;
    // Kwam er land bij: het oude mee naar het (grotere) vak, en alleen het nieuwe land zoeken.
    const erbij = al && opEiland(w) && binnenVak(al.vak, vak);
    const op = erbij && al.vak === vak ? al.op : new Int32Array(b * h).fill(-1);
    if (erbij && al.vak !== vak) for (let y = 0; y < al.vak.h; y++) op.set(al.op.subarray(y * al.vak.b, (y + 1) * al.vak.b), (al.vak.y + y - vak.y) * b + (al.vak.x - vak.x));
    const ouder = erbij ? al.ouder : [];
    const kan = (k) => raster[k] !== VAST;
    const bekijk = (i) => {
      if (!kan(i) || op[i] >= 0) return;
      const n = ouder.length;
      ouder.push(n);
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
          if (!kan(k) || op[k] === n) continue;
          // Schuin alleen als geen van de twee hoektegels vast is, zoals A* (js/pad.js).
          if (dx && dy && (!kan(y * b + nx) || !kan(ny * b + x))) continue;
          // en niet door een wand van de hoogte (js/hoogte.js; vraag 121, stap 2)
          if (w.hoogte && !T.kanStappen(w, vak.x + x, vak.y + y, vak.x + nx, vak.y + ny)) continue;
          if (op[k] >= 0) {
            // het oude land: één eiland met wat daar al was
            const [p, q] = [bovenste(ouder, op[k]), bovenste(ouder, n)];
            if (p !== q) ouder[q] = p;
            continue;
          }
          op[k] = n;
          rij.push(k);
        }
      }
    };
    if (erbij) {
      for (const r of nieuweStukken(w, al.stukken)) {
        for (let y = Math.max(r.y, vak.y); y < Math.min(r.y + r.h, vak.y + h); y++) {
          for (let x = Math.max(r.x, vak.x); x < Math.min(r.x + r.b, vak.x + b); x++) bekijk((y - vak.y) * b + (x - vak.x));
        }
      }
    } else for (let i = 0; i < b * h; i++) bekijk(i);
    const e = { op, vak, ouder, open: openGrootte(w), stukken: new Set(w.open || []) };
    EILANDEN.set(w, e);
    return e;
  }
  // Tegels die vrij kwamen (plekken in het raster), elk een eigen eiland, één met elk eiland ernaast waar je heen kunt
  // stappen, zoals in eilandenVan.
  function maakVrij(w, e, raster, vrij) {
    const { op, vak, ouder } = e;
    const { b, h } = vak;
    const kan = (k) => raster[k] !== VAST;
    for (const i of vrij) {
      const x = i % b;
      const y = (i - x) / b;
      const n = ouder.length;
      ouder.push(n);
      op[i] = n;
      for (const [dx, dy] of RUIM) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= b || ny >= h) continue;
        const k = ny * b + nx;
        if (!kan(k) || op[k] < 0) continue;
        if (dx && dy && (!kan(y * b + nx) || !kan(ny * b + x))) continue;
        if (w.hoogte && !T.kanStappen(w, vak.x + x, vak.y + y, vak.x + nx, vak.y + ny)) continue;
        const [p, q] = [bovenste(ouder, op[k]), bovenste(ouder, n)];
        if (p !== q) ouder[q] = p;
      }
    }
  }
  // Het eiland van een tegel, of -1 (vast, of buiten de kaart).
  T.eilandOp = function (w, x, y) {
    const { op, vak, ouder } = eilandenVan(w);
    const i = x - vak.x;
    const j = y - vak.y;
    const n = i >= 0 && j >= 0 && i < vak.b && j < vak.h ? op[j * vak.b + i] : -1;
    return n < 0 ? -1 : bovenste(ouder, n);
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

  // Mag je deze tegel op? deurenOpenen: een dichte deur telt als doorgang (de aanvoerder duwt
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
  // Vul het raster (over `vak`) op de tegels van x0, y0, b bij h.
  function vulRaster(w, raster, vak, x0, y0, b, h) {
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + b; x++) {
        const t = T.tegel(w, x, y);
        const v = t === 'muur' || t === 'buiten' ? null : T.voorwerpOp(w, x, y);
        raster[(y - vak.y) * vak.b + (x - vak.x)] = t === 'muur' || t === 'buiten' || (v && T.VOORWERPEN[v.soort].blokkeert) ? VAST : t === 'deur' ? DEUR : VRIJ;
      }
    }
  }
  const rasterGoed = (r, w) => r.voorwerpen === w.voorwerpen && r.aantal === w.voorwerpen.length && r.b === w.b && r.h === w.h && r.vak === T.loopVak(w) && r.open === openGrootte(w);
  function vastRaster(w) {
    let r = laatste && laatste.w === w ? laatste : RASTERS.get(w);
    if (!(r && rasterGoed(r, w))) {
      const vak = T.loopVak(w);
      const zelfde = r && r.voorwerpen === w.voorwerpen && r.aantal === w.voorwerpen.length && r.kaart === T.kaartVersie(w);
      if (zelfde && opEiland(w) && binnenVak(r.vak, vak)) {
        // Er ging land open: het oude raster gaat mee naar het (grotere) vak, en alleen de nieuwe stukken worden gevuld;
        // wat daartussen ligt en niet open is, is buiten (VAST).
        let raster = r.raster;
        if (r.vak !== vak) {
          raster = new Uint8Array(vak.b * vak.h).fill(VAST);
          for (let y = 0; y < r.vak.h; y++) raster.set(r.raster.subarray(y * r.vak.b, (y + 1) * r.vak.b), (r.vak.y + y - vak.y) * vak.b + (r.vak.x - vak.x));
        }
        for (const n of nieuweStukken(w, r.stukken)) vulRaster(w, raster, vak, n.x, n.y, n.b, n.h);
        r = { ...r, vak, raster, open: openGrootte(w), stukken: new Set(w.open) };
      } else {
        const raster = new Uint8Array(vak.b * vak.h);
        vulRaster(w, raster, vak, vak.x, vak.y, vak.b, vak.h);
        r = { w, voorwerpen: w.voorwerpen, aantal: w.voorwerpen.length, b: w.b, h: w.h, vak, raster, kaart: T.kaartVersie(w), open: openGrootte(w), stukken: new Set(w.open || []) };
      }
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
    if (!T.opKaart(w, x, y)) return VAST;
    if ((x | 0) === x && (y | 0) === y) {
      const l = laatste;
      if (!(l && l.w === w && rasterGoed(l, w))) vastRaster(w);
      const { vak, raster } = laatste;
      const i = x - vak.x;
      const j = y - vak.y;
      if (i >= 0 && j >= 0 && i < vak.b && j < vak.h) return raster[j * vak.b + i];
    }
    // tussen twee tegels in, of op het eiland buiten het vak om het dorp: per tegel
    const t = T.tegel(w, x, y);
    if (t === 'muur' || t === 'buiten') return VAST;
    const v = T.voorwerpOp(w, x, y);
    if (v && T.VOORWERPEN[v.soort].blokkeert) return VAST;
    return t === 'deur' ? DEUR : VRIJ;
  }

  // Ligt het punt (px, py) binnen een rand, een lijst hoekpunten [[x, y], ...]? Een straal naar rechts
  // telt hoe vaak hij de rand kruist. Ook voor de maker (js/maker.js), die er het plein mee legt.
  T.binnenRand = function (rand, px, py) {
    let binnen = false;
    for (let i = 0, k = rand.length - 1; i < rand.length; k = i++) {
      const [xi, yi] = rand[i];
      const [xk, yk] = rand[k];
      if (yi > py !== yk > py && px < ((xk - xi) * (py - yi)) / (yk - yi) + xi) binnen = !binnen;
    }
    return binnen;
  };

  // Ligt deze tegel op een plein? Een kaart heeft de pleinen die erop liggen (w.pleinen: hun randen, in tegels, van de
  // maker), een voor elk dorp; een tegel ligt erop als zijn midden binnen een rand valt. Op een plein wordt niet gebouwd (js/gebouwen.js, T.gebouwPast), van welk dorp ook.
  const opRand = (rand, x, y) => !!rand && rand.length >= 3 && T.binnenRand(rand, x + 0.5, y + 0.5);
  T.opHetPlein = function (w, x, y) {
    return !!w && (w.pleinen || []).some((rand) => opRand(rand, x, y));
  };

  // Een dorp heeft zijn plek op de kaart (D.plek; werklijst vraag 170, stap 6a, zodat er meer dorpen op één kaart kunnen
  // leven): wat de maker voor dat dorp legde, of wat een kaart uit Tiled noemt (js/kaart.js). { naam (de dorpsplek op
  // het eiland, E.plekken, of null), vak (zijn land, { x, y, b, h }), plein (de rand van zijn plein, of null),
  // marskramer (waar de marskramer uitstalt, { x, y, komt? }, of null), heer (waar de heer staat, alleen op een kaart uit
  // Tiled), kamp (het kamp van het lege begin, js/begin.js), markt (de marktplek op het plein, js/markt.js), uitgang (waar
  // zijn weg de wereld in gaat, { x, y }, of null; T.wegInEnUit in js/handel.js) }. Wat het
  // dorp met zijn plek doet, vraagt het dorp (T.pleinTegels(D), T.pleinVan(D)); een kaart geeft haar plekken door in
  // w.plekken, en T.nieuwDorp neemt er een (js/dorp.js). Het gereedschap, dat zijn eigen dorp is, neemt de eerste.
  T.legePlek = (w) => {
    const o = (w.overgangen || [])[0];
    return { naam: null, vak: T.kaartVak(w), plein: null, marskramer: null, heer: null, kamp: null, markt: null, uitgang: o ? { x: o.x, y: o.y } : null };
  };

  // De tegels van het plein van een dorp, rij voor rij van boven naar onder, en in een rij van links naar rechts. Eén keer
  // per plein uitgerekend, want de rand van een plein verandert niet (werklijst, vraag 71: dit werd elke dag voor elk
  // kind opnieuw gedaan). Het volgt uit de kaart, en staat niet in S. `D`: een dorp, of wat er zo uitziet ({ wereld, plek },
  // de maker voordat er een dorp is).
  const PLEIN = new WeakMap();
  T.pleinTegels = function (D) {
    const rand = D && D.plek && D.plek.plein;
    if (!rand || rand.length < 3) return [];
    const was = PLEIN.get(rand);
    if (was) return was;
    const xs = rand.map((q) => q[0]);
    const ys = rand.map((q) => q[1]);
    const tegels = [];
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
      for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
        if (opRand(rand, x, y)) tegels.push({ x, y });
      }
    }
    PLEIN.set(rand, tegels);
    return tegels;
  };

  // Loopt hier een pad? Wat de grond zegt (js/kaart.js, `naam` bij de tegel in de .tmj): een zandpad of
  // kasseien, of een weg die jij legde (w.wegen, js/wegen.js). Op een pad wordt niet gebouwd (js/gebouwen.js,
  // T.waaromPastHetNiet), en de ossenkar rijdt er sneller (T.karKostOp, js/wegen.js).
  const PADEN = ['zandpad', 'kasseien'];
  T.opPad = function (w, x, y) {
    if (w.wegen && w.wegen.has(T.tegelNummer(x, y))) return true;
    if (T.brugOp(w, x, y)) return true; // een brug van het eiland, met zijn landhoofden
    const g = T.grondOp(w, x, y);
    return !!(g && PADEN.includes(g.naam));
  };

  // Is deze grond water? Dat van een beek, een meer of een rivier, en de zee van het eiland (tegels/kust.png; werklijst
  // vraag 117, B van 2a). Daar vist een visser (T.NATUUR, js/gebouwen.js).
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
  // het zicht niet houden, wat er ook staat.
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
  // geen vierkant) en met niets ertussen. In het gevecht kijkt wie vecht nog in een vierkant (js/gevecht.js). Wie hoger staat, ziet verder
  // (T.verderVanBoven, js/hoogte.js; vraag 121, stap 2).
  T.zietTegel = function (w, van, naar, ver, open) {
    const dx = naar.x - van.x;
    const dy = naar.y - van.y;
    if (w.hoogte) ver += T.verderVanBoven(w, van, naar);
    if (dx * dx + dy * dy > ver * ver) return false;
    return !T.heeftTegels(w) || T.zichtTussen(w, van, naar, open);
  };

  T.isZichtbaar = function (w, x, y) {
    const t = T.tegel(w, x, y);
    if (t === 'buiten') return false;
    if (t === 'vloer') return w.bekend.has(T.kamerVan(w, x, y).id);
    return T.burenKamersOp(w, x, y).some((id) => w.bekend.has(id));
  };

  // Wie in een deuropening staat of een deur opendoet, kijkt in de kamers aan beide kanten.
  T.ontdekBijDeur = function (w, d) {
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const k = T.kamerVan(w, d.x + dx, d.y + dy);
      if (k) w.bekend.add(k.id);
    }
  };
})(globalThis.Spel = globalThis.Spel || {});
