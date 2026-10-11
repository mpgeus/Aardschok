// Het lege begin (werklijst, vraag 152, stap 1b; Marcel, 11 okt: "We moeten ook zelf alles vanaf de start gaan bouwen", en
// "Een kar met wat spullen en 'settlers'"): met de spelregel "Het begin" op "Leeg" legt de maker geen gehucht, maar alleen
// het land van het eiland om jouw plek, met een open plek die het plein wordt (js/maker.js, `leeg`). Een kar met wat
// spullen rijdt over de weg het land in, met de schout, zijn gezin en vier gezinnen erachter, en op het plein zetten ze
// hun kamp op: een tent of een afdak per gezin, en het kampvuur. Daar wonen ze tot er hutten zijn.
//
// Een tent is een gebouw met één gezin erin (`T.GEBOUWEN.tent`), zo groot als zijn gezin: hij telt niet als plaats voor
// een nieuw gezin (T.woonruimteVan, js/gebouwen.js). De tent van de schout is zijn huis (`huis: 'schout'`): daar slaapt
// hij, daar brengt de raadsman zijn rapport, en daar vertrekt de bode, tot zijn huis er staat.
//
// Wat het dorp van het lege begin weet, staat in D.begin (vanaf T.nieuwDorp, js/dorp.js): { kar: <het wezen>, kamp:
// 'onderweg' of 'op', en hoe ver de aankomst is }.
(function (T) {
  'use strict';
  T.BEGIN_INSTELLINGEN = {
    // Wat de kar meebrengt (Marcel, 11 okt: "Akkoord", en de schout met zijn gezin: 140 graan in plaats van 120). Het
    // zaaigraan is graan dat de boeren apart houden als er akkers zijn (T.zaaigraanApart, js/akkers.js); in de voorraad is
    // het graan.
    kar: { hout: 50, graan: 140, zaaigraan: 60, goud: 20, gereedschap: 5 },
    // Hoeveel gezinnen er met de schout meekomen, en hoe groot: een man, een vrouw en `kinderen` kinderen (van tot), en
    // bij `grootvader` gezinnen een grootvader erbij.
    gezinnen: 4,
    kinderen: [1, 3],
    grootvader: 1,
    // Het kamp (gereedschap/pixelart/kamp.cjs, "het kamp zoals het op het plein kan staan"): waar alles staat, vanaf het
    // vuur, in tegels. Een tent of een afdak per gezin, met zijn opening naar het vuur (ZO, ZW, NW of NO), de eerste voor de
    // schout; en waar de kar stopt. Er zijn meer plekken dan gezinnen, voor als het er meer worden.
    kamp: {
      plekken: [
        { dx: -4, dy: 0, open: 'ZO', vorm: 'tent' },
        { dx: 0, dy: -4, open: 'ZW', vorm: 'tent-bruin' },
        { dx: 4, dy: 1, open: 'NW', vorm: 'afdak' },
        { dx: -1, dy: 4, open: 'NO', vorm: 'afdak' },
        { dx: -3, dy: -3, open: 'ZO', vorm: 'tent-bruin' },
        { dx: 3, dy: 3, open: 'NW', vorm: 'tent' },
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
    Object.assign(kar, { soort: 'kar', naam: 'de huifkar', vel: 'huifkar', kar: true, zaad: null, snelheid: I.karSnelheid });
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
})(globalThis.Spel = globalThis.Spel || {});
