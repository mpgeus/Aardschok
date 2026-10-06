// Het bos: bomen omhakken, rooien, planten en groeien, op één plek (werklijst vraag 110, e, met 115; Marcel, 6 okt: "A ja
// B ja C ja D zo"). Gemeten op vier landen van de maker: met rooien passen er twee à drie keer zoveel erven, en een groot
// deel staat al in de wei.
//
// Wat te rooien is (een boom, een stronk, een struik, een boompje, een jonge boom), zegt T.ontginWerkOp; een boom om met
// T.hakBoom (het hout naar de schuur) of T.velBoom (zonder: dat geeft de houthakker zelf), en de rest eruit met T.rooi.
// Zo ruimen een boer die bos ontgint (js/ontginnen.js), een gezin op zijn erf en een inwoner op de plek van zijn
// werkplaats het op, met dezelfde bijl (js/veldwerk.js).
//
// Een stuk dat gerooid moet worden (de kavel), hoort bij een gebouw dat erop wacht (`wachtOpRooien`): de hut van een gezin
// op zijn erf (js/erven.js), of een werkplaats die een inwoner vroeg waar geen open grond meer was (js/verzoeken.js).
// Zolang telt het gebouw al mee (de hut als huis van het gezin), maar staat het nog niet op de kaart (T.bouwGebouw,
// js/gebouwen.js). Wie het rooit, zegt T.rooitHij: het hoofd van het gezin, of de inwoner die de werkplaats vroeg (zijn
// meester). Hij werkt zolang nergens anders (js/bewoners.js). Is het stuk vrij, dan ligt de bouwplaats er de volgende
// dag; na `rooiDagen` rooien de buren de rest in één keer (T.tikRooienDag). En het bos is van de heer: een stuk met
// minstens zoveel bomen als een stuk bos bij het ontginnen, kost zijn gunst (T.inHetBosVanDeHeer).
//
// Een huis dat doorgroeit, rooit net zo wat er in de weg staat (werklijst vraag 130; Marcel, 6 okt: "Eens alle 3"): het
// staat al op de kaart en er wonen mensen in, dus wacht het niet, maar rooit het hoofd van het gezin de grond van het grotere
// huis (`rooitVoorGroei`, met die grond als kavel; js/behoeften.js), en daarna groeit het. Zijn werk houdt hij. Daarbij
// kapt het gezin ook zijn eigen appelboom (a2): een appelboom is van iemand (een boer die ontgint of een gezin op een
// erf laat hem staan), maar staat hij waar het grotere huis moet komen, dan is hij van dat gezin (`teKappen`).
//
// De houthakker (vraag 115; Marcel, 4 okt: "De houthakker hakt bomen om uiteindelijk en plant nieuwe boompjes terug")
// maakt zijn hout zoals elke werkplaats (T.tikGebouwenDag, js/gebouwen.js), maar het komt uit een boom: hij hakt aan de
// dichtste boom binnen `hakStraal` van zijn schuur (g.boom), en elke `houtPerBoom` hout is die om (T.houthakkerHakte): een
// stronk, die na een jaar vergaan is, en stond hij in het bos, twee boompjes ernaast (een stuk dat hij kapt en inplant,
// blijft bos: T.isBos met het jonge bos erbij). Dat wordt in een jaar of twee een jonge boom en dan een boom (T.tikBosDag). Staat er binnen zijn bereik geen boom meer, dan staat hij stil, en zegt de raad het
// (js/raad.js). Het poppetje erbij hakt aan zijn boom en brengt het hout in bundels naar de schuur (js/veldwerk.js).
//
//   g.wachtOpRooien  het gebouw wacht nog op het rooien
//   g.rooitVoorGroei het huis groeit door zodra zijn kavel gerooid is (vraag 130)
//   g.kavel          { x, y, b, h }: het stuk dat eerst vrij moet (bij een erf het erf met het looppad om de hut,
//                    T.kavelVanErf in js/erven.js; bij een werkplaats zijn voet met het looppad eromheen; bij een huis
//                    dat doorgroeit de voet van het grotere huis)
//   g.rooienTot      de dag waarop de buren de rest rooien
//   p.rooit          de werkplaats die deze inwoner vroeg en nu rooit (bij een hut volgt het uit het gezin)
//   g.boom           { x, y }: de boom waar de houthakker aan hakt; null als er geen meer binnen bereik staat
//   g.gehakt         het hout dat hij al uit die boom haalde
//   v.geplant        (op een boompje of een jonge boom) de dag dat het geplant is, en v.wordt: de boom die het wordt
//   v.gehaktOp       (op een stronk) de dag dat de boom omging
//   v.teKappen       (op een appelboom) een gezin kapt hem voor zijn grotere huis: tot dan een boom als elke andere
//
// Regels zonder scherm, dus te toetsen (test/rooien.test.cjs, test/bos.test.cjs).
(function (T) {
  'use strict';

  // Alle getallen in één blok (ook in de werkbank van de spelregels, js/opties.js).
  T.BOS_INSTELLINGEN = {
    // Een boom geeft zoveel hout, wie hem ook omhakt: een boer die ontgint, een gezin dat zijn erf rooit, de houthakker
    // (Marcel, 6 okt, bij vraag 115: "C ja"; tot dan 4).
    houtPerBoom: 10,
    // Zoveel dagen rooit wie er komt wonen of werken zijn plek zelf; wat er daarna nog staat, rooien de buren in één keer
    // (het vangnet, zoals bij het ontginnen). Een erf in de wei met een paar struiken is in een paar dagen vrij, een erf
    // vol bomen niet.
    rooiDagen: 30,
    // Of de houthakker bomen omhakt en plant (de spelregel "De houthakker"; uit: zijn hout komt uit het niets, zoals tot 6
    // okt), en binnen hoeveel tegels van de deur van zijn schuur.
    houthakkerHakt: true,
    hakStraal: 10,
    // Een boom staat in het bos als er in de vijf bij vijf tegels om hem heen minstens zoveel bomen staan, hijzelf
    // meegeteld; minder is een boom in de wei of tussen de huizen. Aan de rand van het bos rapen de boeren hout
    // (js/veldwerk.js). Alleen in het bos plant de houthakker, en daar tellen ook de jonge bomen, de boompjes en de
    // stronken mee: wat hij zelf kapt en weer inplant, blijft bos.
    bosBomen: 4,
    // Zoveel boompjes plant de houthakker naast de stronk van elke boom die hij in het bos omhakt (vraag 129, f; Marcel,
    // 6 okt: "Eens"). Met één hakte hij zijn bereik in een jaar leeg en daarna bijna niets meer: van de boompjes ging ook
    // een deel verloren, en wat hij dun hakte, telde niet meer als bos. Met twee hakt hij in het vierde jaar weer bijna het
    // hele jaar (gemeten op de drie landen van de speeltest, alleen de houthakker: 424 hout per jaar, met één 37).
    boompjesPerBoom: 2,
    // Zo lang is een boompje een boompje, en daarna een jonge boom, in dagen: elke boom tot twee keer zo lang, naar zijn
    // plek, zodat het bos niet in één keer opgroeit (zo is hij in een jaar of twee een boom; vraag 115, b). En zo lang
    // staat een stronk die de houthakker achterliet, voor hij vergaan is.
    boompjeDagen: 180,
    jongeBoomDagen: 180,
    stronkDagen: 360,
    // Het poppetje van de houthakker (js/veldwerk.js), in uren: zo lang hakt hij aan een stuk, dan brengt hij een bundel
    // naar zijn schuur.
    hakUren: 2,
  };
  const IN = () => T.BOS_INSTELLINGEN;

  const dagNu = (D) => Math.floor((D.kalender && D.kalender.dag) || 0);

  // ---------------------------------------------------------------------------------------------
  // Wat er staat, en wat ervan weg moet
  // ---------------------------------------------------------------------------------------------

  // Een boom (T.NATUUR.bos, js/gebouwen.js) hak je om; een stronk, een struik, een boompje of een jonge boom rooi je.
  const JONG = { eik: 'jongeEik', herfstEik: 'jongeEik', den: 'jongeDen', berk: 'jongeBerk' };
  // Het jonge bos: wat van een boom overbleef of een boom wordt (een stronk, een boompje, een jonge boom; T.isBos).
  const JONG_BOS = new Set(['boomstronk', 'boompje', ...Object.values(JONG)]);
  const ROOIEN = new Set(['struik', 'bessenStruik', ...JONG_BOS]);
  const isBoom = (w, x, y, v) => !!v && T.NATUUR.bos.telt(w, x, y, v);
  // Een boom die om mag: een boom van het bos, of een appelboom die een gezin kapt voor zijn grotere huis (`teKappen`).
  const teHakken = (w, x, y, v) => isBoom(w, x, y, v) || !!(v && v.teKappen);

  // Een appelboom is van iemand (vraag 130, a2): alleen het gezin waar hij in de weg staat van zijn grotere huis, kapt hem
  // (js/behoeften.js). Zolang hij `teKappen` heeft, is hij voor wie rooit een boom als elke andere.
  T.isEigenBoom = (v) => !!v && v.soort === 'appelboom';

  // Wat er op deze tegel eerst weg moet voor er gespit of gebouwd kan worden: 'hakken' (een boom), 'rooien' (een stronk,
  // een struik, een boompje of een jonge boom), of null. Voor js/veldwerk.js, dat er het werk en het figuur bij kiest.
  T.ontginWerkOp = function (w, x, y) {
    const v = T.voorwerpOp(w, x, y);
    if (teHakken(w, x, y, v)) return 'hakken';
    if (v && ROOIEN.has(v.soort)) return 'rooien';
    return null;
  };

  // Staat (x, y) in het bos: minstens bosBomen bomen in de vijf bij vijf tegels eromheen? Met `ookJong` tellen ook de jonge
  // bomen, de boompjes en de stronken mee: een stuk dat de houthakker kapt en weer inplant, is nog bos (vraag 129, f).
  T.isBos = function (w, x, y, ookJong = false) {
    if (!ookJong) return T.natuurBij(w, 'bos', { x, y, b: 1, h: 1 }, 2) >= IN().bosBomen;
    let n = 0;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const v = T.voorwerpOp(w, x + dx, y + dy);
        if (v && (isBoom(w, x + dx, y + dy, v) || JONG_BOS.has(v.soort))) n++;
      }
    }
    return n >= IN().bosBomen;
  };

  // Weg met wat op deze tegel stond. Van de kaart kwam het met een muur eronder (een vast ding, js/kaart.js), dus de tegel
  // wordt weer vloer; wat er daarna op komt (een stronk, een jonge boom), houdt hem zelf tegen.
  function haalWeg(w, v) {
    T.haalVoorwerpWeg(w, v);
    if (w.tegels[v.y] && w.tegels[v.y][v.x] === 'muur') {
      w.tegels[v.y][v.x] = 'vloer';
      T.kaartVeranderd(w);
    }
  }

  // Iets uit het vel van de bomen of de begroeiing neerzetten (een stronk, een boompje, een jonge boom, een boom), met zijn
  // plaatje, en zijn soort aangemeld (T.kenSoortVan, js/kaart.js), zodat wat vast is, de weg verspert. Zonder tekening
  // (een kaart zonder vellen) niets.
  function zetNeer(w, soort, x, y, meer) {
    const t = T.opzoekTegelNaam(soort);
    if (!t) return null;
    const v = { soort, x, y, vel: t.vel, id: t.id, beslaat: [1, 1], ...meer };
    T.kenSoortVan(v);
    return T.zetVoorwerp(w, v);
  }

  // Een boom om: er blijft een stronk staan. Geeft de soort van de boom, of null als er geen boom stond. Het hout geeft hij
  // niet: dat doet wie hem omhakt (T.hakBoom), of de houthakker met zijn werk van de dag.
  T.velBoom = function (D, x, y) {
    const w = D.wereld;
    const v = T.voorwerpOp(w, x, y);
    if (!teHakken(w, x, y, v)) return null;
    haalWeg(w, v);
    zetNeer(w, 'boomstronk', x, y, { gehaktOp: dagNu(D) });
    return v.soort;
  };

  // Een boom omgehakt door wie ontgint of zijn plek rooit (js/veldwerk.js): het hout gaat naar de schuur, en de stronk
  // blijft staan, tot hij die rooit.
  T.hakBoom = function (D, x, y) {
    if (!T.velBoom(D, x, y)) return false;
    T.wijzigVoorraad(D, 'hout', IN().houtPerBoom);
    return true;
  };

  // Een stronk, een struik, een boompje of een jonge boom gerooid: weg.
  T.rooi = function (D, x, y) {
    const w = D.wereld;
    const v = T.voorwerpOp(w, x, y);
    if (!v || !ROOIEN.has(v.soort)) return false;
    haalWeg(w, v);
    return true;
  };

  // ---------------------------------------------------------------------------------------------
  // Rooien voor een erf of een werkplaats
  // ---------------------------------------------------------------------------------------------

  // De tegels van het vak r ({ x, y, b, h }) waar iets te rooien staat, rij voor rij, zoals wie rooit ze afwerkt
  // (js/veldwerk.js).
  T.teRooienOp = function (D, r) {
    const w = D.wereld;
    const lijst = [];
    for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.b; x++) if (T.ontginWerkOp(w, x, y)) lijst.push({ x, y });
    return lijst;
  };

  // Hoeveel bomen en hoeveel struiken en stronken er op het vak r staan: { bomen, struiken }. In één stap, uit de
  // optelsommen van de natuur (T.natuurBij, js/gebouwen.js), want een verzoek vraagt het voor duizenden plekken.
  T.watTeRooien = (D, r) => ({ bomen: T.natuurBij(D.wereld, 'bos', r, 0), struiken: T.natuurBij(D.wereld, 'struiken', r, 0) });

  // Ligt het vak r in het bos van de heer: staan er minstens zoveel bomen op als op een stuk bos dat een boer ontgint
  // (T.ONTGINNEN_INSTELLINGEN.bosBomen)? Losse bomen en struiken in de wei zijn van niemand.
  T.inHetBosVanDeHeer = (D, r) => T.watTeRooien(D, r).bomen >= T.ONTGINNEN_INSTELLINGEN.bosBomen;

  // "3 bomen en 2 struiken en stronken (+30 hout)": wat er gerooid wordt, en wat het de schuur oplevert.
  T.rooiWoorden = function (wat) {
    const delen = [];
    if (wat.bomen) delen.push(wat.bomen === 1 ? 'één boom' : `${wat.bomen} bomen`);
    if (wat.struiken) delen.push(wat.struiken === 1 ? 'één struik of stronk' : `${wat.struiken} struiken en stronken`);
    const hout = wat.bomen * IN().houtPerBoom;
    return `${delen.join(' en ')}${hout ? ` (+${hout} hout)` : ''}`;
  };

  // Hoe het heet wat er op een tegel staat, voor een bericht of het briefje bij een huis (vraag 130): bij één ("een
  // appelboom") en bij meer ("appelbomen"). Een gebouw heet naar zijn soort (T.GEBOUWEN; alleen bij één, want gerooid
  // wordt het nooit), en wat er verder staat naar T.VOORWERPEN, of anders "iets".
  const NAMEN = {
    eik: ['een eik', 'eiken'], herfstEik: ['een eik', 'eiken'], den: ['een den', 'dennen'], berk: ['een berk', 'berken'],
    wilg: ['een wilg', 'wilgen'], dodeBoom: ['een dode boom', 'dode bomen'], appelboom: ['een appelboom', 'appelbomen'],
    struik: ['een struik', 'struiken'], bessenStruik: ['een bessenstruik', 'bessenstruiken'], boomstronk: ['een stronk', 'stronken'],
    boompje: ['een boompje', 'boompjes'], jongeEik: ['een jonge eik', 'jonge eiken'], jongeDen: ['een jonge den', 'jonge dennen'],
    jongeBerk: ['een jonge berk', 'jonge berken'], rots: ['een rots', 'rotsen'], kleineRots: ['een rots', 'rotsen'],
    regenton: ['een regenton', 'regentonnen'], lantaarn: ['een lantaarn', 'lantaarns'], bank: ['een bank', 'banken'],
  };
  T.naamVanVoorwerp = function (v, meer = false) {
    const gebouw = v && v.soort.startsWith('gebouw:') && T.GEBOUWEN[v.soort.slice(7)];
    if (gebouw) return `een ${gebouw.naam}`;
    const namen = v && NAMEN[v.soort];
    if (namen) return namen[meer ? 1 : 0];
    const elders = v && T.VOORWERPEN && T.VOORWERPEN[v.soort] && T.VOORWERPEN[v.soort].naam;
    return elders || 'iets';
  };

  // Wat er op deze tegels staat, geteld en bij naam: "een struik en twee eiken". Leeg als er niets staat.
  T.watStaatErOp = function (D, tegels) {
    const tel = new Map();
    for (const t of tegels) {
      const v = T.voorwerpOp(D.wereld, t.x, t.y);
      if (!v) continue;
      const een = T.naamVanVoorwerp(v);
      const n = tel.get(een);
      tel.set(een, { v, n: n ? n.n + 1 : 1 });
    }
    return T.opsomming([...tel.values()].map(({ v, n }) => (n === 1 ? T.naamVanVoorwerp(v) : `${T.telwoord(n)} ${T.naamVanVoorwerp(v, true)}`)));
  };

  // Het stuk dat vrij moet voor een gebouw met voet `voet` op (x, y): zijn voet en het looppad eromheen
  // (T.GEBOUWEN_INSTELLINGEN.looppad), binnen de kaart.
  T.kavelVan = function (D, x, y, voet) {
    const n = T.GEBOUWEN_INSTELLINGEN.looppad;
    const w = D.wereld;
    const x0 = Math.max(0, x - n);
    const y0 = Math.max(0, y - n);
    const x1 = Math.min(w.tegels[0].length, x + voet.b + n);
    const y1 = Math.min(w.tegels.length, y + voet.h + n);
    return { x: x0, y: y0, b: x1 - x0, h: y1 - y0 };
  };

  // Het gebouw dat deze inwoner nu rooit, of null: zijn hut als hij het hoofd van het gezin is en de hut daarop wacht
  // (js/erven.js), zijn huis als het daarvoor doorgroeit (vraag 130, js/behoeften.js), of de werkplaats die hij vroeg
  // (js/verzoeken.js).
  T.rooitHij = (p) => {
    if (!p) return null;
    if (p.huis && (p.huis.wachtOpRooien || p.huis.rooitVoorGroei) && !p.hoofd) return p.huis;
    return p.rooit && p.rooit.wachtOpRooien ? p.rooit : null;
  };

  // Wie dit gebouw rooit: het hoofd van het gezin in de hut of in het huis dat doorgroeit, of de meester van de
  // werkplaats; null als hij er niet meer is.
  function rooierVan(D, g) {
    if (g.erf || g.rooitVoorGroei) return (D.bewoners && D.bewoners.mensen.find((p) => p.huis === g && !p.hoofd)) || null;
    return g.meester && D.bewoners && D.bewoners.mensen.includes(g.meester) ? g.meester : null;
  }
  T.rooierVan = rooierVan; // ook voor js/behoeften.js: wie zegt het dorp dat er rooit

  // Wat er op deze tegel te rooien staat, in één keer weg: een boom om (het hout naar de schuur) en zijn stronk eruit, of
  // wat er verder staat eruit.
  function rooiNu(D, t) {
    if (T.ontginWerkOp(D.wereld, t.x, t.y) === 'hakken') T.hakBoom(D, t.x, t.y);
    T.rooi(D, t.x, t.y);
  }

  // Elke dag (T.tikGebouwenDag, js/gebouwen.js, vóór de erven): een gebouw dat op het rooien wachtte en nu vrij is, komt op
  // de kaart, en is de tijd om, dan rooien de buren eerst de rest. Een hut wacht dan op hout (T.tikErvenDag, js/erven.js),
  // een werkplaats begint: zijn kosten zijn al betaald.
  T.tikRooienDag = function (D) {
    const dag = dagNu(D);
    for (const g of D.gebouwen || []) {
      if (g.rooitVoorGroei) {
        rooiVoorGroeiDag(D, g, dag);
        continue;
      }
      if (!g.wachtOpRooien) continue;
      const over = T.teRooienOp(D, g.kavel);
      if (over.length && dag < g.rooienTot) continue;
      for (const t of over) rooiNu(D, t);
      g.wachtOpRooien = false;
      delete g.rooienTot;
      T.zetOpDeKaart(D, g);
      const p = rooierVan(D, g);
      if (p && p.rooit === g) delete p.rooit;
      const naam = p && p.naam ? p.naam : null;
      const wie = g.erf ? (naam ? `het gezin van ${naam}` : 'een nieuw gezin') : naam || 'wie het vroeg';
      const hulp = over.length ? `De buren helpen ${wie} de rest te rooien` : `${T.hoofdletter(wie)} heeft ${g.erf ? 'zijn erf' : 'de plek'} gerooid`;
      if (g.erf) {
        g.wachtOpHout = true;
        T.zeg(D, `${hulp}, en de bouwplaats van de hut ligt er.`);
      } else {
        g.klaarOp = dag + T.GEBOUWEN[g.soort].bouwtijd;
        if (g.voorwerp) g.voorwerp.klaarOp = g.klaarOp;
        T.zeg(D, `${hulp}, en de bouw van de ${T.GEBOUWEN[g.soort].naam} begint.`);
      }
    }
  };

  // ---------------------------------------------------------------------------------------------
  // Rooien voor een huis dat doorgroeit (vraag 130)
  // ---------------------------------------------------------------------------------------------

  // Het gezin van huis g gaat de grond van zijn grotere huis rooien (js/behoeften.js): `kavel` is de voet van dat huis, en
  // `tegels` wat er in de weg staat. Een eigen appelboom daarop kapt het (a2).
  T.rooiVoorGroei = function (D, g, kavel, tegels) {
    const w = D.wereld;
    T.stopRooienVoorGroei(D, g); // rooide het voor een andere vorm, dan blijft wat daar nog staat
    for (const t of tegels) {
      const v = T.voorwerpOp(w, t.x, t.y);
      if (T.isEigenBoom(v)) v.teKappen = true;
    }
    Object.assign(g, { rooitVoorGroei: true, kavel, rooienTot: dagNu(D) + IN().rooiDagen });
  };

  // Het huis rooit niet meer voor zijn grotere huis: het is gegroeid, de grond is vrij, of er woont niemand meer. Een eigen
  // appelboom die nog staat, is weer van iemand.
  T.stopRooienVoorGroei = function (D, g) {
    if (!g.rooitVoorGroei) return;
    const k = g.kavel;
    for (let y = k.y; y < k.y + k.h; y++) {
      for (let x = k.x; x < k.x + k.b; x++) {
        const v = T.voorwerpOp(D.wereld, x, y);
        if (v && v.teKappen) delete v.teKappen;
      }
    }
    delete g.rooitVoorGroei;
    delete g.kavel;
    delete g.rooienTot;
  };

  // Elke nacht (T.tikRooienDag), na het doorgroeien (T.tikBehoeftenDag, js/behoeften.js): is de tijd om, dan rooien de
  // buren de rest, en is de grond vrij, dan is het rooien klaar. Het huis groeit dan de volgende nacht, als het nog alles
  // heeft en de bouwstof er is; meestal groeide het al, de nacht nadat het gezin klaar was.
  function rooiVoorGroeiDag(D, g, dag) {
    const over = T.teRooienOp(D, g.kavel);
    if (over.length && dag < g.rooienTot) return;
    for (const t of over) rooiNu(D, t);
    if (over.length) {
      const p = rooierVan(D, g);
      T.zeg(D, `De buren helpen ${p && p.naam ? `het gezin van ${p.naam}` : 'een gezin'} de rest te rooien voor hun grotere huis.`);
    }
    T.stopRooienVoorGroei(D, g);
  }

  // ---------------------------------------------------------------------------------------------
  // De houthakker (vraag 115)
  // ---------------------------------------------------------------------------------------------

  // Hakt dit gebouw bomen om: een houthakker (hij hakt in het bos van de heer, `bos` in T.GEBOUWEN), als de spelregel het
  // zegt?
  const hakt = (g) => !!(T.GEBOUWEN[g.soort] && T.GEBOUWEN[g.soort].bos) && IN().houthakkerHakt;

  // Waar je staat om de boom op t om te hakken: een tegel recht ernaast (niet schuin: dan slaat de bijl ernaast,
  // js/veldwerk.js), te belopen, waar je vanaf `van` kunt komen; of null.
  const NAAST = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  function staanBij(w, t, van) {
    for (const [dx, dy] of NAAST) {
      const s = { x: t.x + dx, y: t.y + dy };
      if (T.isBegaanbaar(w, s.x, s.y) && T.kanErKomen(w, van, s)) return s;
    }
    return null;
  }

  // De boom waar deze houthakker aan hakt (g.boom), of null als er binnen hakStraal van zijn schuur geen boom meer staat
  // waar hij bij kan. Binnen hakStraal telt zoals de natuur bij een gebouw telt (T.natuurBij, js/gebouwen.js): zijn voet,
  // zoveel tegels naar elke kant groter. Hij houdt zijn boom tot die om is; dan neemt hij de boom die het dichtst bij zijn
  // deur staat en die geen andere houthakker al hakt.
  T.boomVanHouthakker = function (D, g) {
    const w = D.wereld;
    if (g.boom && isBoom(w, g.boom.x, g.boom.y, T.voorwerpOp(w, g.boom.x, g.boom.y))) return g.boom;
    g.boom = null;
    const deur = T.deurVan(w, g);
    const f = T.voetVanGebouw(g);
    if (!deur || !f) return null;
    const r = IN().hakStraal;
    const bezet = new Set((D.gebouwen || []).filter((h) => h !== g && h.boom).map((h) => `${h.boom.x},${h.boom.y}`));
    const bomen = [];
    for (let y = Math.max(0, f.y - r); y < Math.min(w.tegels.length, f.y + f.h + r); y++) {
      for (let x = Math.max(0, f.x - r); x < Math.min(w.tegels[0].length, f.x + f.b + r); x++) {
        if (bezet.has(`${x},${y}`) || !isBoom(w, x, y, T.voorwerpOp(w, x, y))) continue;
        bomen.push({ x, y, d: Math.hypot(x - deur.x, y - deur.y) });
      }
    }
    bomen.sort((a, b) => a.d - b.d || a.y - b.y || a.x - b.x);
    const boom = bomen.find((t) => staanBij(w, t, deur));
    if (boom) g.boom = { x: boom.x, y: boom.y };
    return g.boom;
  };

  // Staat deze houthakker stil omdat er binnen zijn bereik geen boom meer staat (g.boom null, gezet door
  // T.boomVanHouthakker)? Dan wil hij geen handen (T.verdeelHanden, js/gebouwen.js; werklijst vraag 129, e): zijn hand
  // werkt elders, tot de nacht waarin er weer een boom staat.
  T.houthakkerZonderBoom = (g) => hakt(g) && g.boom === null;

  // Waarom deze houthakker vandaag niet hakt (T.tikGebouwenDag, vóór zijn werk), of null: er staat binnen zijn bereik geen
  // boom meer.
  T.waaromHaktHijNiet = function (D, g) {
    if (!hakt(g) || T.boomVanHouthakker(D, g)) return null;
    return `er staat geen boom meer binnen ${T.telwoord(IN().hakStraal)} tegels van zijn schuur`;
  };

  // Na zijn werk van vandaag (T.tikGebouwenDag): het hout dat hij maakte, kwam uit zijn boom (g.gehakt), en zijn het er
  // houtPerBoom, dan is die om: een stronk, met boompjesPerBoom boompjes ernaast als hij in het bos stond (het jonge bos
  // meegeteld). Morgen hakt hij aan de volgende.
  T.houthakkerHakte = function (D, g, hout) {
    if (!hakt(g) || !(hout > 0)) return;
    g.gehakt = (g.gehakt || 0) + hout;
    while (g.gehakt >= IN().houtPerBoom && T.boomVanHouthakker(D, g)) {
      const t = g.boom;
      g.gehakt -= IN().houtPerBoom;
      const bos = T.isBos(D.wereld, t.x, t.y, true);
      const soort = T.velBoom(D, t.x, t.y);
      g.boom = null;
      if (bos) for (let i = 0; i < IN().boompjesPerBoom; i++) plantNaast(D, t, soort);
    }
    T.boomVanHouthakker(D, g);
  };

  // ---------------------------------------------------------------------------------------------
  // Planten en groeien
  // ---------------------------------------------------------------------------------------------

  // Wat een boompje wordt: dezelfde boom als die er stond. Een wilg of een dode boom wordt een eik (er is geen jonge wilg).
  const WORDT = { eik: 'eik', herfstEik: 'herfstEik', den: 'den', berk: 'berk' };

  // Een vast lot uit een plek en een dag, tussen 0 en 1: geen toeval, zodat hetzelfde spel hetzelfde bos geeft.
  const lot = (x, y, dag) => ((((x * 73856093) ^ (y * 19349663) ^ (dag * 83492791)) >>> 0) % 1000) / 1000;
  // Hoe lang dit boompje een boompje blijft, en hoe lang het daarna een jonge boom is.
  const alsBoompje = (v) => Math.round(IN().boompjeDagen * (1 + lot(v.x, v.y, v.geplant)));
  const alsJongeBoom = (v) => Math.round(IN().jongeBoomDagen * (1 + lot(v.y, v.x, v.geplant)));

  // Mag hier een boompje komen? Te belopen, en leeg of met wat laag groeit (dat maakt plaats, T.groeitLaag,
  // js/ontginnen.js), niemand die er staat, en geen plek waar het dorp loopt of bouwt: geen veld, weg, erf of lantaarn
  // (T.waaromNietOpDezeGrond), niet op het plein, niet voor een deur en geen paadje van een deur.
  function magPlanten(D, x, y) {
    const w = D.wereld;
    if (x < 0 || y < 0 || y >= w.tegels.length || x >= w.tegels[0].length) return false;
    if (!T.isBegaanbaar(w, x, y) || T.wezenOp(w, x, y)) return false;
    const v = T.voorwerpOp(w, x, y);
    if (v && !T.groeitLaag(v)) return false;
    return !T.opHetPlein(w, x, y) && !T.bijDeur(w, x, y) && !T.isAangelegdPaadje(D, x, y) && !T.waaromNietOpDezeGrond(D, x, y);
  }

  // Een boompje naast de stronk op t, van de boom `soort` die er stond: op de eerste tegel eromheen waar het mag, in een
  // volgorde die per stronk anders begint. Geeft het boompje, of null als er nergens plaats was.
  const RONDOM = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
  function plantNaast(D, t, soort) {
    const w = D.wereld;
    const dag = dagNu(D);
    const begin = Math.floor(lot(t.x, t.y, dag) * RONDOM.length);
    for (let i = 0; i < RONDOM.length; i++) {
      const [dx, dy] = RONDOM[(begin + i) % RONDOM.length];
      const x = t.x + dx;
      const y = t.y + dy;
      if (!magPlanten(D, x, y)) continue;
      const laag = T.voorwerpOp(w, x, y);
      if (laag) T.haalVoorwerpWeg(w, laag);
      return zetNeer(w, 'boompje', x, y, { geplant: dag, wordt: WORDT[soort] || 'eik' });
    }
    return null;
  }
  T.plantNaast = plantNaast; // ook voor test/bos.test.cjs

  // Elke dag (T.tikGebouwenDag, js/gebouwen.js): een boompje dat lang genoeg staat, wordt een jonge boom, en een jonge boom
  // een boom; een stronk die er sinds stronkDagen staat, is vergaan. Een boompje wacht een dag als er iemand op staat,
  // want een jonge boom staat in de weg.
  T.tikBosDag = function (D) {
    const w = D.wereld;
    if (!w || !w.voorwerpen) return;
    const dag = dagNu(D);
    for (const v of w.voorwerpen.slice()) {
      if (v.geplant != null) {
        const jong = v.geplant + alsBoompje(v);
        if (v.soort === 'boompje') {
          if (dag >= jong && !T.wezenOp(w, v.x, v.y)) groei(w, v, JONG[v.wordt] || 'jongeEik', { geplant: v.geplant, wordt: v.wordt });
        } else if (dag >= jong + alsJongeBoom(v)) groei(w, v, v.wordt, {});
      } else if (v.gehaktOp != null && v.soort === 'boomstronk' && dag >= v.gehaktOp + IN().stronkDagen) haalWeg(w, v);
    }
  };
  function groei(w, v, soort, meer) {
    if (!T.opzoekTegelNaam(soort)) return; // zonder tekening blijft het zoals het is
    T.haalVoorwerpWeg(w, v);
    zetNeer(w, soort, v.x, v.y, meer);
  }
})(globalThis.Spel = globalThis.Spel || {});
