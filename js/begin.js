// Het lege begin (werklijst, vraag 152, stap 1b; Marcel, 11 okt: "We moeten ook zelf alles vanaf de start gaan bouwen", en
// "Een kar met wat spullen en 'settlers'"): met de spelregel "Het begin" op "Leeg" legt de maker geen gehucht, maar alleen
// het land van het eiland om jouw plek, met een open plek die het plein wordt (js/maker.js, `leeg`). Een kar met wat
// spullen rijdt over de weg het land in, met de schout, zijn gezin en vier gezinnen erachter, en op het plein zetten ze
// hun kamp op: een tent of een afdak per gezin, en het kampvuur. Daar wonen ze tot er hutten zijn: is een hut of huis af,
// dan trekt er een gezin uit het kamp in, en gaat zijn tent weg (stap 1c; T.verhuisUitHetKamp hieronder).
//
// Een tent is een gebouw met één gezin erin (`T.GEBOUWEN.tent`), zo groot als zijn gezin: hij telt niet als plaats voor
// een nieuw gezin (T.woonruimteVan, js/gebouwen.js). De tent van de schout is zijn huis (`huis: 'schout'`): daar slaapt
// hij, daar brengt de raadsman zijn rapport, en daar vertrekt de bode, tot zijn huis er staat.
//
// Wat het dorp van het lege begin weet, staat in D.begin (vanaf T.nieuwDorp, js/dorp.js): { kar: <het wezen>, kamp:
// 'onderweg', 'op' of 'weg' (de laatste tent is weg), en hoe ver de aankomst is }.
(function (T) {
  'use strict';
  T.BEGIN_INSTELLINGEN = {
    // Wat de kar meebrengt (Marcel, 11 okt: "Akkoord", en de schout met zijn gezin: 140 graan in plaats van 120). Het
    // zaaigraan is graan dat de boeren apart houden als er akkers zijn (T.zaaigraanApart, js/akkers.js); in de voorraad is
    // het graan.
    kar: { hout: 50, graan: 140, zaaigraan: 60, goud: 20, gereedschap: 5 },
    // Hoeveel gezinnen er met de schout meekomen, en hoe groot: een man, een vrouw en `kinderen` kinderen (van tot), en
    // bij `grootvader` gezinnen een grootvader erbij. Een man, een vrouw en een kind, zodat een gezin in een hut past (plaats
    // voor 3; Marcel, 11 okt: "Kleinere gezinnen", vraag 152, 1c; tot dan 1 tot 3 kinderen en een grootvader, 3 tot 6 mensen).
    gezinnen: 4,
    kinderen: [1, 1],
    grootvader: 0,
    // Het kamp (gereedschap/pixelart/kamp.cjs, "het kamp zoals het op het plein kan staan"): waar alles staat, vanaf het
    // vuur, in tegels. Een tent of een afdak per gezin, met zijn opening naar het vuur (ZO, ZW, NW of NO), de eerste voor de
    // schout; en waar de kar stopt. Er zijn meer plekken dan gezinnen, voor als het er meer worden.
    kamp: {
      plekken: [
        { dx: -4, dy: 0, open: 'ZO', vorm: 'tent' }, // geen tekst
        { dx: 0, dy: -4, open: 'ZW', vorm: 'tent-bruin' }, // geen tekst
        { dx: 4, dy: 1, open: 'NW', vorm: 'afdak' }, // geen tekst
        { dx: -1, dy: 4, open: 'NO', vorm: 'afdak' }, // geen tekst
        { dx: -3, dy: -3, open: 'ZO', vorm: 'tent-bruin' }, // geen tekst
        { dx: 3, dy: 3, open: 'NW', vorm: 'tent' }, // geen tekst
      ],
      kar: { dx: 5, dy: -3 },
    },
    // De kar rijdt in het tempo van de os (tegels per seconde, op 1×; gereedschap/pixelart/ossenkar.cjs, SNELHEID.os), en
    // de gezinnen lopen erachter, zodra de kar zoveel tegels voor is.
    karSnelheid: 0.9,
    voorsprong: 4,
    // De schout loopt naast de kar, en haalt hem in als hij verder dan zoveel tegels achter is; klik je zelf ergens heen,
    // dan loopt hij niet meer mee.
    naastDeKar: 3,
    // Het kampvuur geeft licht, en minder als het smeult (tegels, en van 0 tot 1, zoals de lantaarns in js/zien.js).
    vuur: { straal: 6, sterkte: 0.9, smeult: 0.35 },
    // Zoveel jaar vraagt de heer niets (geen schatting op Sint-Maarten en geen grillen; js/heer.js, js/grillen.js), en
    // schrijft hij in wijnmaand dat hij je spaart (Marcel, 11 okt: "het eerste jaar vraagt de heer niets").
    heerVrij: 1,
    // Het bouwbereik (vraag 152, 1d; Marcel, 11 okt: "b ja"): je bouwt binnen zoveel tegels van het plein en van elke
    // opslag die af is (het huis van de schout; in C ook een schuur), gemeten van het midden van een tegel. Sinds 12 okt 16
    // (1f; Marcel: "Ja prima, 16 tegels is goed"): met 12 paste er op een van de vijf eilanden na de zomer geen tweede
    // boerderij meer (ontwerp/speelbaar.md).
    bouwBereik: 16,
  };
  const IN = () => T.BEGIN_INSTELLINGEN;

  // ---------------------------------------------------------------------------------------------
  // Het begin
  // ---------------------------------------------------------------------------------------------

  // Een nieuw dorp op een lege plek (T.nieuwDorp, js/dorp.js, als de kaart een kamp heeft, w.kamp, van de maker): de
  // voorraad uit de kar, een tent per gezin (nog niet opgezet: dat doen ze als de kar er is, T.zetKampOp), de kar aan de
  // rand op de weg, met de schout ernaast, en de kar op weg naar het plein. Wie er woont, zet T.zetBeginBewoners
  // (js/bewoners.js) erna: een gezin per tent, dat nog over de weg moet komen.
  T.zetKamp = function (S, D) {
    const w = D.wereld;
    const I = IN();
    for (const wat in I.kar) T.wijzigVoorraad(D, wat === 'zaaigraan' ? 'graan' : wat, I.kar[wat]);
    w.kamp.plekken.slice(0, 1 + I.gezinnen).forEach((p, i) => {
      D.gebouwen.push({
        soort: 'tent', x: p.voet.x, y: p.voet.y, voet: { b: p.voet.b, h: p.voet.h }, deur: { x: p.deur.x, y: p.deur.y },
        tent: { x: p.x, y: p.y, vorm: p.vorm, open: p.open }, tekening: null, klaar: true, klaarOp: 0, handen: 0,
        voorwerp: null, huis: i === 0 ? 'schout' : null, bewoners: i === 0 ? null : 'kamp',
      });
    });
    // de kar aan de rand, waar de weg het land in komt, en de schout ernaast
    const van = T.wegInEnUit(w) || { x: w.kamp.kar.x, y: w.kamp.kar.y };
    const kar = T.maakDorpeling(0, van.x, van.y, 0, null);
    Object.assign(kar, { soort: 'kar', naam: T.t('covered wagon'), vel: 'huifkar', kar: true, zaad: null, snelheid: I.karSnelheid });
    w.wezens.push(kar);
    const dag = D.kalender ? Math.floor(D.kalender.dag) : 0;
    D.begin = { kamp: 'onderweg', kar, van: { x: van.x, y: van.y }, gezinnen: false, volgt: !D.ander, heerVrijTot: dag + I.heerVrij * T.DAGEN_PER_JAAR };
    if (D.schout && !D.ander) zetNeer(w, D.schout, vrijNaast(w, van, D.schout) || van);
    stuurKar(D);
  };

  // Een tegel waar `e` kan staan, zo dicht mogelijk bij `bij` (niet erop), of null.
  function vrijNaast(w, bij, e) {
    for (let ring = 1; ring <= 4; ring++) {
      for (let y = bij.y - ring; y <= bij.y + ring; y++) {
        for (let x = bij.x - ring; x <= bij.x + ring; x++) {
          if (Math.max(Math.abs(x - bij.x), Math.abs(y - bij.y)) !== ring) continue;
          if (T.isBegaanbaar(w, x, y, { wezensBlokkeren: true, wie: e })) return { x, y };
        }
      }
    }
    return null;
  }
  function zetNeer(w, e, t) {
    Object.assign(e, { x: t.x, y: t.y, tx: t.x, ty: t.y, pad: [], onderweg: false });
    e.padDoel = null;
  }
  // De kar op weg naar zijn plek in het kamp (de maker koos hem, w.kamp.kar); is er geen weg, dan staat hij er meteen.
  function stuurKar(D) {
    const w = D.wereld;
    const kar = D.begin.kar;
    const doel = w.kamp.kar;
    const pad = T.zoekRoute(w, { x: kar.tx, y: kar.ty }, doel, {});
    if (pad && pad.length) T.geefRoute(kar, pad, doel);
    else zetNeer(w, kar, doel);
  }

  // ---------------------------------------------------------------------------------------------
  // De aankomst, elk beeld
  // ---------------------------------------------------------------------------------------------

  // Elk beeld (T.werkDorpBij, js/dorp.js): de kar rijdt naar het plein; is hij `voorsprong` tegels voor, dan komen de
  // gezinnen over de weg (T.werkBewonersBij, js/bewoners.js; ze lopen naar hun tent, p.komt); de schout loopt naast de kar
  // tot je zelf ergens heen klikt; en staat de kar op zijn plek, dan zetten ze het kamp op.
  T.werkBeginBij = function (S, D) {
    const B = D.begin;
    if (!B || B.kamp !== 'onderweg') return;
    const kar = B.kar;
    const karTegel = { x: kar.tx, y: kar.ty };
    if (!B.gezinnen && (T.afstand(karTegel, B.van) >= IN().voorsprong || !kar.pad.length)) laatGezinnenKomen(D, true);
    volgDeKar(S, D);
    if (kar.pad.length || kar.onderweg) return;
    if (T.afstand(karTegel, D.wereld.kamp.kar) > 1) {
      // hij gaf het op (iemand stond in de weg): opnieuw
      stuurKar(D);
      return;
    }
    T.zetKampOp(D);
  };

  // De gezinnen van het kamp (wie nog moet komen, p.komt, zonder poppetje) komen over de weg, achter de kar aan.
  function laatGezinnenKomen(D, meteen) {
    D.begin.gezinnen = true;
    const mensen = D.bewoners.mensen.filter((p) => p.komt && !p.wezen);
    if (mensen.length) D.bewoners.komen.push({ mensen, meteen });
  }

  // De schout loopt naast de kar, tot je zelf ergens heen klikt (zijn weg is dan niet die naar de kar).
  function volgDeKar(S, D) {
    const B = D.begin;
    const h = D.schout;
    if (!B.volgt || !h || T.schoutIsWeg(D) || S.gevecht || S.modus !== 'verkennen') return;
    if (h.pad.length && !(h.padDoel && h.padDoel.metDeKar)) {
      B.volgt = false;
      return;
    }
    const kar = B.kar;
    if (h.pad.length || T.afstand({ x: h.tx, y: h.ty }, { x: kar.tx, y: kar.ty }) <= IN().naastDeKar) return;
    const doel = { x: kar.tx, y: kar.ty, tot: 2 };
    const pad = T.zoekRoute(D.wereld, { x: h.tx, y: h.ty }, doel, { tot: 2 });
    if (!pad || !pad.length) return;
    T.geefRoute(h, pad, doel);
    h.padDoel.metDeKar = true;
  }

  // Het kamp opzetten: de tenten en de afdakken op hun plek, met wie er staat opzij, en het vuur in het midden; de kar
  // staat op zijn plek (ook als hij er nog niet was: het vangnet van de nacht, T.tikBeginDag).
  T.zetKampOp = function (D) {
    const B = D.begin;
    if (!B || B.kamp !== 'onderweg') return;
    const w = D.wereld;
    const k = w.kamp;
    if (B.kar.tx !== k.kar.x || B.kar.ty !== k.kar.y) {
      if (w.wezens.includes(B.kar)) T.stapEraf(D, { x: k.kar.x, y: k.kar.y, b: 1, h: 1 });
      zetNeer(w, B.kar, k.kar);
    }
    for (const g of D.gebouwen) {
      if (g.soort !== 'tent' || g.voorwerp) continue;
      const t = g.tent;
      T.stapEraf(D, { x: g.x, y: g.y, b: g.voet.b, h: g.voet.h });
      g.voorwerp = T.zetVoorwerp(w, { soort: 'tent', x: t.x, y: t.y, vorm: t.vorm, richting: t.open, voet: { dx: g.x - t.x, dy: g.y - t.y, b: g.voet.b, h: g.voet.h } });
    }
    T.stapEraf(D, { x: k.vuur.x, y: k.vuur.y, b: 1, h: 1 });
    T.zetVoorwerp(w, { soort: 'kampvuur', x: k.vuur.x, y: k.vuur.y });
    B.kamp = 'op';
    if (!B.gezinnen) laatGezinnenKomen(D, true);
    T.zeg(D, T.t('The cart is on the open ground that will be the square. The families put up their tents around the campfire.'));
  };

  // Elke nacht (T.tikGebouwenDag, js/gebouwen.js): staat het kamp nog niet, dan staat het nu (een kar die vastzat, of de
  // toetsen, die geen beelden spelen).
  T.tikBeginDag = function (D) {
    if (D.begin && D.begin.kamp === 'onderweg') T.zetKampOp(D);
  };

  // ---------------------------------------------------------------------------------------------
  // Verhuizen uit het kamp (vraag 152, 1c)
  // ---------------------------------------------------------------------------------------------

  // De tenten van de gezinnen in het kamp; niet die van de schout, want die is zijn huis tot zijn eigen huis af is (1d).
  // Zolang er een is, komt er geen nieuw gezin over de weg (T.waaromGeenGezin, js/gebouwen.js): eerst je eigen mensen.
  T.kampTenten = (D) => (D.gebouwen || []).filter((g) => g.soort === 'tent' && g.huis !== 'schout');

  // Elke nacht, als de gebouwen van vandaag af zijn en vóór er een nieuw gezin kan komen (T.tikGebouwenDag, js/gebouwen.js):
  // in een woning die af is en plaats heeft (een hut, een huis), trekt een gezin uit het kamp, het eerste dat er past; past
  // er geen, dan het eerste in een woning waar nog niemand woont, ook als het krap is (Marcel, 11 okt). Zijn tent gaat weg
  // zodra hij leeg is, en met de laatste tent het kampvuur; de kar blijft (Marcel, 11 okt: "Per tent"). Een boerderij of
  // een wijnboerderij is ook een thuis voor een gezin, en de man wordt er de boer (vraag 152, 1e; js/boerderij.js).
  T.verhuisUitHetKamp = function (D) {
    if (!D.begin || D.begin.kamp !== 'op') return;
    verhuisDeSchout(D);
    for (const g of D.gebouwen.slice()) {
      const soort = T.GEBOUWEN[g.soort];
      const boerderij = T.isBoerderij(g);
      if (!g.klaar || !soort || !(soort.woning || boerderij)) continue;
      const wonen = inHuis(D, g).length;
      if (boerderij && wonen) continue; // op een boerderij woont één gezin
      const vrij = T.woonruimteVan(D, g) - wonen;
      const gezinnen = T.kampTenten(D).map((t) => inHuis(D, t)).filter((l) => l.length);
      const gezin = gezinnen.find((l) => l.length <= vrij) || (wonen === 0 ? gezinnen[0] : null);
      if (!gezin) continue;
      const tent = gezin[0].huis;
      T.verhuis(D, gezin, g);
      const wie = (gezin.find((p) => !p.hoofd) || gezin[0]).naam;
      if (boerderij) T.zeg(D, T.t('{wie} and family leave the camp for the {boerderij}: {wie} is the farmer now.', { wie, boerderij: soort.naam }));
      else T.zeg(D, gezin.length > vrij
        ? T.t('{wie} and family leave the camp: their {gebouw} is ready, though it is cramped.', { wie, gebouw: soort.naam })
        : T.t('{wie} and family leave the camp: their {gebouw} is ready.', { wie, gebouw: soort.naam }));
      if (!inHuis(D, tent).length) haalTentWeg(D, tent);
    }
  };
  const inHuis = (D, g) => D.bewoners.mensen.filter((p) => p.huis === g);

  // Het huis van de schout (1d; `schout` in T.GEBOUWEN): is het af, dan trekt de schout er met zijn gezin in. Het is
  // voortaan zijn huis (`huis: 'schout'`: slapen, het rapport, de bode), zijn tent gaat weg (met de laatste tent ook het
  // kampvuur), en de huifkar is uitgeladen en wordt de ossenkar die werkt (Marcel, 11 okt: "Huifkar wordt ossenkar"; wat
  // de ossenkar doet, komt in C). Geen gezin uit het kamp trekt erin: het is geen woning.
  function verhuisDeSchout(D) {
    const huis = D.gebouwen.find((g) => g.soort === 'schout' && g.klaar && g.huis !== 'schout');
    const tent = huis && D.gebouwen.find((g) => g.soort === 'tent' && g.huis === 'schout');
    if (!tent) return;
    T.verhuis(D, inHuis(D, tent), huis);
    tent.huis = null;
    huis.huis = 'schout';
    Object.assign(D.begin.kar, { naam: T.t('ox cart'), vel: 'ossenkar-leeg' });
    T.zeg(D, T.t('Your house is ready: you and your family leave the tent, and the covered wagon becomes the ox cart.'));
    if (!inHuis(D, tent).length) haalTentWeg(D, tent);
  }

  // Een lege tent gaat van de kaart en uit het dorp; is het de laatste, dan gaat ook het kampvuur uit.
  function haalTentWeg(D, tent) {
    const w = D.wereld;
    if (tent.voorwerp) T.haalVoorwerpWeg(w, tent.voorwerp);
    D.gebouwen.splice(D.gebouwen.indexOf(tent), 1);
    if (D.gebouwen.some((g) => g.soort === 'tent')) return;
    const vuur = w.voorwerpen.find((v) => v.soort === 'kampvuur');
    if (vuur) T.haalVoorwerpWeg(w, vuur);
    D.begin.kamp = 'weg';
  }

  // ---------------------------------------------------------------------------------------------
  // Het bouwbereik (vraag 152, 1d)
  // ---------------------------------------------------------------------------------------------

  // In het lege begin bouw je binnen bouwBereik tegels van het plein en van elke opslag die af is (`opslag` in
  // T.GEBOUWEN), zoals een kantoor in Anno (Marcel, 11 okt: "Ik wil geen 'grens' alles moet open zijn", en "Dus je kunt
  // bijvoorbeeld x tegels vanaf je stad bouwen"). Lopen en kijken kan overal; alleen bouwen niet. Per tegel de afstand
  // tot het dichtste plein of de dichtste opslag, één keer uitgerekend tot er een opslag bij komt (alleen beeld en regel,
  // dus niet in S: het volgt uit de kaart en de gebouwen). Alleen in het vak om het plein en de opslagen, niet over de
  // hele kaart: de wereld wordt het hele eiland van 2500 bij 2500 (Marcel, 11 okt: "de wereld moet 1 geheel worden").
  const BEREIK = new WeakMap();
  function bouwBereik(D) {
    const w = D && D.begin && D.wereld;
    if (!w) return null;
    const straal = IN().bouwBereik;
    const opslagen = D.gebouwen.filter((g) => g.klaar && T.GEBOUWEN[g.soort] && T.GEBOUWEN[g.soort].opslag);
    const sleutel = [straal, ...opslagen.map((g) => `${g.x},${g.y}`)].join(';');
    const was = BEREIK.get(w);
    if (was && was.sleutel === sleutel) return was;
    const bronnen = T.pleinTegels(w).map((t) => ({ x: t.x, y: t.y }));
    for (const g of opslagen) {
      const r = T.voetVanGebouw(g);
      for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.b; x++) bronnen.push({ x, y });
    }
    if (!bronnen.length) bronnen.push({ x: -1e6, y: -1e6 }); // geen plein: nergens bereik (het vak valt buiten de kaart)
    const R = Math.ceil(straal);
    // het vak: de bronnen met de straal eromheen, binnen de kaart
    const x0 = Math.max(0, Math.min(...bronnen.map((b) => b.x)) - R);
    const y0 = Math.max(0, Math.min(...bronnen.map((b) => b.y)) - R);
    const b = Math.max(0, Math.min(w.b - 1, Math.max(...bronnen.map((q) => q.x)) + R) - x0 + 1);
    const h = Math.max(0, Math.min(w.h - 1, Math.max(...bronnen.map((q) => q.y)) + R) - y0 + 1);
    const afstand = new Float32Array(b * h).fill(Infinity);
    for (const q of bronnen) {
      for (let dy = -R; dy <= R; dy++) {
        const y = q.y + dy - y0;
        if (y < 0 || y >= h) continue;
        for (let dx = -R; dx <= R; dx++) {
          const x = q.x + dx - x0;
          const d = Math.hypot(dx, dy);
          if (x < 0 || x >= b || d > straal) continue;
          if (d < afstand[y * b + x]) afstand[y * b + x] = d;
        }
      }
    }
    const uit = { sleutel, straal, x0, y0, b, h, afstand };
    BEREIK.set(w, uit);
    return uit;
  }
  // Voor het tekenen (js/tekenen.js): { straal, x0, y0, b, h, afstand } (per tegel van het vak vanaf x0, y0; Infinity
  // buiten het bereik), of null zonder bereik.
  T.bouwBereikVan = bouwBereik;
  // De afstand van deze tegel tot het plein of de dichtste opslag, of Infinity buiten het vak.
  const afstandIn = (B, x, y) => {
    const i = x - B.x0;
    const j = y - B.y0;
    return i >= 0 && j >= 0 && i < B.b && j < B.h ? B.afstand[j * B.b + i] : Infinity;
  };
  T.afstandInBouwBereik = afstandIn;
  // Ligt deze tegel binnen het bouwbereik? Zonder bereik (het oude begin) ligt alles erin.
  T.inBouwBereik = function (D, x, y) {
    const B = bouwBereik(D);
    return !B || afstandIn(B, x, y) <= B.straal;
  };
  // Waarom er op het vak r niet gebouwd kan worden, omdat het (deels) buiten het bereik ligt, of null
  // (T.waaromPastHetNiet, js/gebouwen.js).
  T.waaromBuitenBouwBereik = function (D, r) {
    for (let y = r.y; y < r.y + r.h; y++) {
      for (let x = r.x; x < r.x + r.b; x++) {
        if (!T.inBouwBereik(D, x, y)) return T.t('Too far away: you build within {n} tiles of the square or of a store.', { n: IN().bouwBereik });
      }
    }
    return null;
  };

  // Laat de heer dit dorp op dag `dag` met rust? Het eerste jaar van het lege begin (heerVrij): geen schatting en geen grillen.
  T.heerLaatMetRust = (D, dag) => !!(D.begin && dag < D.begin.heerVrijTot);

  // ---------------------------------------------------------------------------------------------
  // Het kampvuur
  // ---------------------------------------------------------------------------------------------

  // Brandt het vuur, of smeult het? Het brandt als de mensen op zijn ('s ochtends, in de schaft en 's avonds), en
  // smeult als ze werken of slapen. Null als er geen kamp staat.
  T.kampvuurStand = function (D) {
    if (!D.begin || D.begin.kamp !== 'op' || !D.kalender) return null;
    const deel = T.dagdeelVan(D.kalender.dag, T.isOogstDag(D.kalender.dag));
    return deel === 'nacht' || deel === 'werk' ? 'smeult' : 'brandt';
  };
  // Het licht van het kampvuur, voor T.lichtBronnen (js/zien.js): 's avonds en 's nachts.
  T.kampLicht = function (D) {
    const stand = T.kampvuurStand(D);
    if (!stand || T.lichtVan(D.kalender.dag).nacht <= 0) return [];
    const v = D.wereld.kamp.vuur;
    const L = IN().vuur;
    return [{ x: v.x, y: v.y, straal: L.straal, sterkte: stand === 'brandt' ? L.sterkte : L.smeult, soort: 'kampvuur' }];
  };
  // ---------------------------------------------------------------------------------------------
  // Het proefdorp (ronde 2 van het snoeien, stap 3 en 6)
  // ---------------------------------------------------------------------------------------------

  // Een dorp om op te proeven: het lege begin, en een dorp dat met de regels van het spel gebouwd is (T.plaatsGebouw,
  // T.legVeld), meteen af. De toetsen spelen erop (test/grond.cjs; Marcel, 12 okt: "B: lege begin met een proefdorp"), en
  // het gereedschap in de browser ook (Spel.debug.proefdorp in js/main.js: de schermafdrukken, de tekenmeting, de
  // samenvatting, npm run grootte), zodat ze hetzelfde dorp zien. Sinds stap 6 legt de maker geen dorp meer dat er al was
  // (Marcel: "Alles wordt door spelers geplaatst"). Alles met een vaste reeks toeval, en stil: wat het dorp zegt, gaat
  // nergens heen, ook niet als het spel in de browser draait.
  //   T.proefdorp.begin(zaad)   een nieuw spel op het eiland van `zaad` (2), met het lege begin, op dag 1: geeft S
  //   T.proefdorp.maak(opties)  en het dorp erop, op dag 2, iedereen thuis: geeft S (zie maak, hieronder)
  // De stappen ertussen (dagen, bouwAf, zetBijHetVuur, legVeldBij) gebruiken de toetsen ook los.
  const STIL = new Proxy({}, { get: () => () => undefined });
  // Doe `doe` met een vaste reeks toeval (Math.random), en zonder scherm (T.ui) en waarschuwingen; zet daarna alles terug.
  function metVastToeval(begin, doe) {
    const toeval = Math.random;
    const ui = T.ui;
    const warn = console.warn;
    let n = begin;
    Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
    T.ui = STIL;
    console.warn = () => {};
    try {
      return doe();
    } finally {
      Math.random = toeval;
      T.ui = ui;
      console.warn = warn;
    }
  }

  // Een nieuw spel op het eiland van `zaad`, met het lege begin, zoals js/main.js het begint, maar zonder scherm. Zaad 2
  // heeft open grond bij het plein.
  function begin(zaad = 2) {
    const S = { kalender: T.nieuweKalender(), tijd: 0, wereldTijd: 0, modus: 'verkennen', inventaris: new Set() };
    metVastToeval(11, () => {
      if (!T.beginOpKaart(S, 'gehucht', zaad)) throw new Error(`geen spel op het eiland van ${zaad}`); // geen tekst
    });
    return S;
  }

  // Dagen zoals het spel ze tikt (js/gebouwen.js), van `van` tot en met `tot`.
  function dagen(S, van, tot = van) {
    for (let dag = van; dag <= tot; dag++) {
      S.kalender.dag = dag + 0.3;
      S.kalender.stil = [];
      T.tikGebouwenDag(S.dorp, dag);
    }
  }

  // Een bouwplaats meteen af: de kavel gerooid en al het werk gedaan; die nacht komt hij klaar (T.tikGebouwenDag).
  function bouwAf(D, g, dag) {
    if (g.wachtOpRooien) {
      for (const t of T.teRooienOp(D, g.kavel)) T.rooiTegel(D, t);
      g.wachtOpRooien = false;
      if (!T.isVeldSoort(g.soort)) T.zetOpDeKaart(D, g);
    }
    g.bouw.gedaan = g.bouw.werk;
    if (g.voorwerp) g.voorwerp.voortgang = 1;
    g.klaarOp = dag;
  }

  // Zet `soort` neer zo dicht mogelijk bij het kampvuur, zoals de speler het met het bouwmenu doet; in het bos ook (de
  // kavel rooit bouwAf). Geeft het gebouw.
  function zetBijHetVuur(D, soort) {
    const v = D.wereld.kamp.vuur;
    for (let r = 1; r < 40; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const uit = T.plaatsGebouw(D, soort, v.x + dx, v.y + dy);
          if (uit.gelukt) return uit.instantie;
        }
      }
    }
    throw new Error(`er is geen plaats voor ${soort}`); // geen tekst
  }

  // Een veld van b bij h bij boerderij g, de dichtste plek waar het past.
  function legVeldBij(D, soort, g, b = 6, h = 5) {
    const r = T.voetVanGebouw(g);
    const midden = (q) => ({ x: q.x + q.b / 2, y: q.y + q.h / 2 });
    let beste = null;
    for (let y = r.y - 10; y <= r.y + r.h + 10; y++) {
      for (let x = r.x - 10; x <= r.x + r.b + 10; x++) {
        const q = { x, y, b, h };
        if (T.waaromPastVeldNiet(D, soort, q)) continue;
        const d = T.afstand(midden(q), midden(r));
        if (!beste || d < beste.d) beste = { q, d };
      }
    }
    if (!beste) throw new Error(`er is geen plaats voor een ${soort} bij de boerderij`); // geen tekst
    const uit = T.legVeld(D, soort, beste.q);
    if (!uit.gelukt) throw new Error(uit.reden);
    return uit.instantie;
  }

  // Iedereen thuis: wie nog over de weg komt, is er (T.werkBewonersBij maakt zijn poppetje bij de weg), en elk poppetje
  // staat bij zijn eigen deur, op een vrije tegel, zoals het spel een nieuw gezin bij zijn deur zet.
  function iedereenThuis(D) {
    T.werkBewonersBij(D);
    const w = D.wereld;
    for (const p of D.bewoners.mensen) {
      const e = p.wezen;
      if (!e || p.schout) continue;
      delete p.komt;
      const deur = T.deurVan(w, p.huis);
      let plek = null;
      for (let r = 0; r <= 4 && !plek; r++) {
        for (let y = deur.y - r; y <= deur.y + r && !plek; y++) {
          for (let x = deur.x - r; x <= deur.x + r && !plek; x++) {
            if (Math.max(Math.abs(x - deur.x), Math.abs(y - deur.y)) === r && T.isBegaanbaar(w, x, y, { wezensBlokkeren: true })) plek = { x, y };
          }
        }
      }
      if (!plek) continue;
      Object.assign(e, { x: plek.x, y: plek.y, tx: plek.x, ty: plek.y, pad: [], onderweg: false });
      e.thuis = { x: deur.x, y: deur.y };
    }
  }

  // Het proefdorp bouwen: het lege begin, en op dag 1 neergezet en meteen af het huis van de schout, twee boerderijen met
  // elk een akker, en hutten voor wie er dan nog in het kamp woont. Op dag 2 trekken de gezinnen erin, wordt de man op een
  // boerderij boer, en worden de akkers land; het kamp is dan leeg, en iedereen staat thuis. Rond het vuur is het krap, dus
  // bouwt het met een ruimer bereik (`bereik` tegels; in het spel `bouwBereik` hierboven), alleen zolang het neerzet.
  // Geeft S, met S.kalender op dag 2.
  //   zaad         het eiland (2)
  //   boerderijen  hoeveel boerderijen, elk met een akker (2)
  //   hutten       hoeveel hutten; standaard zoveel als er dan nog gezinnen in het kamp wonen
  //   gebouwen     wat er verder staat, af, zoals ['herberg', 'schaapskooi'] (een gebouw met handen krijgt ze op dag 2)
  //   weide        de eerste boerderij krijgt er een veld bij dat weide is, met de beginkudde erop (T.zetBeginKudde)
  function maak({ zaad = 2, boerderijen = 2, hutten = null, gebouwen = [], weide = false, bereik = 40 } = {}) {
    const S = begin(zaad);
    const D = S.dorp;
    const w = D.wereld;
    // Alles op een vaste reeks toeval, ook de dagen erna: anders kreeg elk proces (elk toetsbestand) een iets ander dorp.
    return metVastToeval(7, () => {
      dagen(S, 1);
      const echt = IN().bouwBereik;
      IN().bouwBereik = bereik;
      let weiveld = null;
      try {
        // Wat het kost, komt eerst in de voorraad, zodat die daarna is wat de kar bracht.
        const n = hutten != null ? hutten : Math.max(0, T.kampTenten(D).length - boerderijen);
        const soorten = ['schout', ...Array(boerderijen).fill('boerderij'), ...Array(n).fill('hut'), ...gebouwen];
        for (const soort of soorten) for (const [wat, k] of Object.entries(T.GEBOUWEN[soort].kosten || {})) T.wijzigVoorraad(D, wat, k);
        const schout = zetBijHetVuur(D, 'schout');
        const hoeven = [];
        for (let i = 0; i < boerderijen; i++) hoeven.push(zetBijHetVuur(D, 'boerderij'));
        const velden = hoeven.map((g) => legVeldBij(D, 'akker', g));
        if (weide) velden.push((weiveld = legVeldBij(D, 'akker', hoeven[0])));
        const rest = [];
        for (let i = 0; i < n; i++) rest.push(zetBijHetVuur(D, 'hut'));
        for (const soort of gebouwen) rest.push(zetBijHetVuur(D, soort));
        for (const g of [schout, ...hoeven, ...velden, ...rest]) bouwAf(D, g, 1);
      } finally {
        IN().bouwBereik = echt;
      }
      dagen(S, 2);
      if (weiveld) {
        const a = w.akkers.find((x) => x.x === weiveld.x && x.y === weiveld.y);
        a.bestemming = a.plan = 'weide';
        a.ongezaaid.clear();
        T.zetBeginKudde(D);
      }
      iedereenThuis(D);
      T.verdeelHanden(D);
      // De boeren krijgen hun akkers op hun poppetje, zoals elke nacht (js/boerderij.js): die poppetjes kwamen pas na de nacht.
      T.werkDeBoerenBij(D);
      // Welke tekening het volgende gebouw van elke soort krijgt (T.volgendeTekening), en dus hoe groot zijn voet is: hier
      // al gekozen, zodat een toets die iets neerzet, elke keer dezelfde plek vindt.
      for (const soort of Object.keys(T.GEBOUWEN)) T.volgendeTekening(D, soort);
      return S;
    });
  }

  T.proefdorp = { begin, maak, dagen, bouwAf, zetBijHetVuur, legVeldBij, metVastToeval };
})(globalThis.Spel = globalThis.Spel || {});
