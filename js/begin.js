// Het lege begin (werklijst, vraag 152, stap 1b; Marcel, 11 okt: "We moeten ook zelf alles vanaf de start gaan bouwen", en
// "Een kar met wat spullen en 'settlers'"): met de spelregel "Het begin" op "Leeg" legt de maker geen gehucht, maar alleen
// het land van het eiland om jouw plek, met een open plek die het plein wordt (js/maker.js, `leeg`). Een kar met wat
// spullen rijdt over de weg het land in, met de aanvoerder, zijn gezin en vier gezinnen erachter, en op het plein zetten ze
// hun kamp op: een tent of een afdak per gezin, en het kampvuur. Daar wonen ze tot er hutten zijn: is een hut of huis af,
// dan trekt er een gezin uit het kamp in, en gaat zijn tent weg (stap 1c; T.verhuisUitHetKamp hieronder).
//
// Een tent is een gebouw met één gezin erin (`T.GEBOUWEN.tent`), zo groot als zijn gezin: hij telt niet als plaats voor
// een nieuw gezin (T.woonruimteVan, js/gebouwen.js). De tent van de aanvoerder is zijn huis (`huis: 'aanvoerder'`): daar slaapt
// hij, en daar vertrekt de bode, tot zijn huis er staat.
//
// Wat het dorp van het lege begin weet, staat in D.begin (vanaf T.nieuwDorp, js/dorp.js): { kar: <het wezen, null zodra
// het raadhuis af is>, kamp:
// 'onderweg', 'op' of 'weg' (de laatste tent is weg), en hoe ver de aankomst is }.
(function (T) {
  'use strict';
  T.BEGIN_INSTELLINGEN = {
    // Wat de kar meebrengt (Marcel, 11 okt: "Akkoord", en de aanvoerder met zijn gezin: 140 graan in plaats van 120). Het
    // zaaigraan is graan dat de boeren apart houden als er akkers zijn (T.zaaigraanApart, js/akkers.js); in de voorraad is
    // het graan. De kaas en het gezouten vlees (Marcel, 13 okt, vraag 154: "D1"): met het graan drie soorten, dus het dorp
    // begint op 90% werk (T.werkVanAfwisseling, js/behoeften.js), en met 15 mensen zijn ze na zo'n maand op: vóór die tijd
    // een jager en een moestuin. Het zout houdt het vlees goed (10 per zout).
    kar: { hout: 50, graan: 140, zaaigraan: 60, goud: 20, gereedschap: 5, kaas: 8, vlees: 8, zout: 1 },
    // Hoeveel gezinnen er met de aanvoerder meekomen, en hoe groot: een man, een vrouw en `kinderen` kinderen (van tot), en
    // bij `grootvader` gezinnen een grootvader erbij. Een man, een vrouw en een kind, zodat een gezin in een hut past (plaats
    // voor 3; Marcel, 11 okt: "Kleinere gezinnen", vraag 152, 1c; tot dan 1 tot 3 kinderen en een grootvader, 3 tot 6 mensen).
    gezinnen: 4,
    kinderen: [1, 1],
    grootvader: 0,
    // Het kamp (gereedschap/pixelart/kamp.cjs, "het kamp zoals het op het plein kan staan"): waar alles staat, vanaf het
    // vuur, in tegels. Een tent of een afdak per gezin, met zijn opening naar het vuur (ZO, ZW, NW of NO), de eerste voor de
    // aanvoerder; en waar de kar stopt. Er zijn meer plekken dan gezinnen, voor als het er meer worden.
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
    // De aanvoerder loopt naast de kar, en haalt hem in als hij verder dan zoveel tegels achter is; klik je zelf ergens heen,
    // dan loopt hij niet meer mee.
    naastDeKar: 3,
    // Het kampvuur geeft licht, en minder als het smeult (tegels, en van 0 tot 1, zoals de lantaarns in js/zien.js). Op
    // het scherm is de plas kleiner dan voor de regel (`beeldStraal`; de wolven blijven op `straal`), zoals bij de lantaarn
    // (vraag 175; Marcel, 17 okt: "dat lijkt heel fel in de nacht, maar ook onnatuurlijk", en koos K3 uit vier proeven:
    // 3 tegels en 0,45, warm, was 6 tegels, 0,9 en wit). Het smeulen ging naar verhouding mee (0,35 werd 0,2).
    vuur: { straal: 6, beeldStraal: 3, sterkte: 0.45, smeult: 0.2 },
    // Zoveel jaar vraagt de heer niets (geen schatting op Sint-Maarten en geen grillen; js/heer.js, js/grillen.js), en
    // schrijft hij in de maand van zijn brief dat hij je spaart. Tot 18 okt 1 (Marcel, 11 okt: "het eerste jaar vraagt de
    // heer niets"); sinds het doel van de demo 0 (Marcel, 18 okt, D2: de demo eindigt op het eerste Sint-Maarten).
    heerVrij: 0,
    // Het bouwbereik (vraag 152, 1d; Marcel, 11 okt: "b ja"): je bouwt binnen zoveel tegels van het plein en van elke
    // opslag die af is (het raadhuis; in C ook een schuur), gemeten van het midden van een tegel. Sinds 12 okt 16
    // (1f; Marcel: "Ja prima, 16 tegels is goed"): met 12 paste er op een van de vijf eilanden na de zomer geen tweede
    // boerderij meer (ontwerp/speelbaar.md).
    bouwBereik: 16,
  };
  const IN = () => T.BEGIN_INSTELLINGEN;

  // ---------------------------------------------------------------------------------------------
  // Een nieuw spel op het eiland
  // ---------------------------------------------------------------------------------------------

  // Het land van een nieuw spel (vraag 112, a; Marcel, 3 okt: "Eigenlijk een random map generator per nieuwe game"): het
  // zaad voor de maker, het land dat je bij Nieuw spel koos, of een nieuw. Een zaad is een getal van vijf cijfers, zodat
  // je een land dat je mooi vond, kunt onthouden en opnieuw spelen.
  T.landVoorNieuwSpel = (gekozen) => (gekozen != null ? gekozen : T.nieuwLandZaad());
  T.nieuwLandZaad = () => 1 + Math.floor(Math.random() * T.MAKER_INSTELLINGEN.zaden);

  // Een nieuw spel beginnen: de maker legt je land op het eiland (js/maker.js) uit `makerZaad` (zonder: een nieuw), met
  // het lege begin erop, een open plek voor het plein en het kamp. Welk land een nieuw spel krijgt, zegt T.landVoorNieuwSpel
  // hierboven (vanuit T.nieuwSpel, js/main.js). Het zaad is ook het zaad van het dorp (D.lot.zaad), zodat hetzelfde zaad
  // hetzelfde spel geeft. Daarna staan S.wereld, S.dorp met zijn aanvoerder, en S.dorpen klaar; geeft het dorp. (Tot 23
  // okt heette dit T.beginOpKaart, in js/gebied.js, en kon het ook op een kaart uit Tiled beginnen; ronde 4 van het
  // snoeien.) Met een `level` (T.LEVELS, levels/; vraag 187, stap 1b en 2a) zijn eiland (`eiland.zaad`, anders dat van
  // makerZaad), zijn dorpsplek (`plek`, een naam; anders jouw plek), en zijn rand (`rand`, in stukken: T.randOm in
  // js/maker.js); je dorp krijgt wat het level van het eerste dorp zegt (de wacht, wat dicht is, of er overvallen
  // op het rooster komen; T.nieuwDorp), en daarna begint zijn scenario (T.startScenario, js/scenario.js). Een level dat niet door de keuring
  // komt, is een fout in het spel: dan begint het niet.
  T.beginOpEiland = function (S, makerZaad, level = null) {
    const L = level || {};
    const fout = level ? T.keurScenario(level) : [];
    if (fout.length) throw new Error(`Het level klopt niet: ${fout.join('; ')}`); // geen tekst
    const d = (L.dorpen && L.dorpen[0]) || {};
    const zaad = L.eiland ? L.eiland.zaad : makerZaad != null ? makerZaad : T.nieuwLandZaad();
    const w = T.laadGemaaktGehucht(zaad, { plek: L.plek });
    if (L.rand) w.rand = T.randOm(w.plekken[0].vak, L.rand.b, L.rand.h);
    S.wereld = w;
    // Zijn soort is 'aanvoerder' en zijn kant 'speler' (T.WEZENS, js/wereld.js); hij draagt het vel van een gewone
    // dorpeling, en welk, kiest zijn zaad (T.sprites.houding, js/sprites.js).
    const aanvoerder = w.wezens.find((e) => e.soort === 'aanvoerder');
    zetAanvoerderKlaar(aanvoerder, 1);
    // Het dorp op deze kaart, met zijn aanvoerder (js/dorp.js; sinds vraag 170, stap 5 staat hij alleen daar, als
    // S.dorp.aanvoerder): wat er staat, de boeren, het vee en wie er woont. Het is je eigen dorp (S.dorp); een tweede
    // komt erbij met T.dorpErbij (hieronder).
    S.dorp = T.nieuwDorp(S, w, aanvoerder, { zaad, wacht: d.wacht, dicht: d.dicht, overvallen: d.overvallen });
    S.dorpen = [S.dorp];
    // Het hol van het level: het dichtste roverskamp, met zijn bende, zijn buit en een palissade (T.maakHol, js/rovers.js).
    if (d.hol) T.maakHol(S.dorp, d.hol);
    if (level) T.startScenario(S, level);
    return S.dorp;
  };
  function zetAanvoerderKlaar(aanvoerder, zaad) {
    aanvoerder.snelheid = T.AANVOERDER_SNELHEID;
    if (aanvoerder.zaad == null) aanvoerder.zaad = zaad; // zijn zaad kiest zijn vel (T.sprites.houding, js/sprites.js)
    Object.assign(aanvoerder, { tx: aanvoerder.x, ty: aanvoerder.y, pad: [], onderweg: false });
  }

  // Nog een dorp op het eiland van het eerste (werklijst vraag 170, stap 6a; Marcel, 15 okt: "elk een eigen dorp op
  // hetzelfde eiland", en 16 okt: "A1"): op de dichtste andere dorpsplek die ver genoeg weg ligt (T.legDorpOpKaart,
  // js/maker.js), op dezelfde kaart, met het lege begin erop. Zijn zaad komt uit dat van het eiland en zijn nummer, zodat
  // hetzelfde spel hetzelfde tweede dorp krijgt. Het dorp komt achteraan in S.dorpen; geeft het dorp.
  T.dorpErbij = function (S) {
    const eerste = S.dorpen[0];
    const w = eerste.wereld;
    const E = T.eilandVan(w.eiland);
    const bij = E.plekken.find((p) => p.naam === eerste.plek.naam);
    const nummer = S.dorpen.length;
    const { plek, aanvoerder } = T.legDorpOpKaart(w, { bij, niet: S.dorpen.map((D) => D.plek.naam) });
    zetAanvoerderKlaar(aanvoerder, 1 + nummer);
    const D = T.nieuwDorp(S, w, aanvoerder, { zaad: w.eiland.zaad + 7919 * nummer, plek });
    S.dorpen.push(D);
    return D;
  };

  // ---------------------------------------------------------------------------------------------
  // Het begin
  // ---------------------------------------------------------------------------------------------

  // Een nieuw dorp op een lege plek (T.nieuwDorp, js/dorp.js, als zijn plek een kamp heeft, D.plek.kamp, van de maker): een
  // tent per gezin (nog niet opgezet: dat doen ze als de kar er is, T.zetKampOp), de kar aan de rand op de weg, met de
  // aanvoerder ernaast, en de kar op weg naar het plein. Wat de kar meebrengt, telt pas als hij er is (werklijst C, stap 1).
  // Wie er woont, zet T.zetBeginBewoners (js/bewoners.js) erna: een gezin per tent, dat nog over de weg moet komen.
  // `wacht`: de soldaten die met de huifkar meekomen (een level, zoals het demojaar; werklijst Q, vraag 181, e), met een
  // tent erbij, die weet wie erin woont (`wacht`).
  T.zetKamp = function (S, D, wacht = []) {
    const w = D.wereld;
    const I = IN();
    D.plek.kamp.plekken.slice(0, 1 + I.gezinnen + (wacht.length ? 1 : 0)).forEach((p, i) => {
      D.gebouwen.push({
        soort: 'tent', x: p.voet.x, y: p.voet.y, voet: { b: p.voet.b, h: p.voet.h }, deur: { x: p.deur.x, y: p.deur.y },
        tent: { x: p.x, y: p.y, vorm: p.vorm, open: p.open }, tekening: null, klaar: true, klaarOp: 0, handen: 0,
        voorwerp: null, huis: i === 0 ? 'aanvoerder' : null, bewoners: i === 0 ? null : i > I.gezinnen ? 'wacht' : 'kamp',
        ...(i > I.gezinnen ? { wacht: [...wacht] } : {}),
      });
    });
    // de kar aan de rand, waar de weg het land in komt, en de aanvoerder ernaast
    const van = T.wegInEnUit(D) || { x: D.plek.kamp.kar.x, y: D.plek.kamp.kar.y };
    const kar = T.maakKar(D, van.x, van.y, T.t('covered wagon'), 'huifkar');
    const dag = D.kalender ? Math.floor(D.kalender.dag) : 0;
    D.begin = { kamp: 'onderweg', kar, van: { x: van.x, y: van.y }, gezinnen: false, volgt: !D.ander, heerVrijTot: dag + I.heerVrij * T.DAGEN_PER_JAAR };
    if (D.aanvoerder && !D.ander) zetNeer(w, D.aanvoerder, vrijNaast(w, van, D.aanvoerder) || van);
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
  // De kar op weg naar zijn plek in het kamp (de maker koos hem, D.plek.kamp.kar); is er geen weg, dan staat hij er meteen.
  function stuurKar(D) {
    const w = D.wereld;
    const kar = D.begin.kar;
    const doel = D.plek.kamp.kar;
    const pad = T.zoekRoute(w, { x: kar.tx, y: kar.ty }, doel, { kar: true }); // over de weg van de kaart, die hij opzoekt (js/wegen.js)
    if (pad && pad.length) T.geefRoute(kar, pad, doel);
    else zetNeer(w, kar, doel);
  }

  // ---------------------------------------------------------------------------------------------
  // De aankomst, elk beeld
  // ---------------------------------------------------------------------------------------------

  // Elk beeld (T.werkDorpBij, js/dorp.js): de kar rijdt naar het plein; is hij `voorsprong` tegels voor, dan komen de
  // gezinnen over de weg (T.werkBewonersBij, js/bewoners.js; ze lopen naar hun tent, p.komt); de aanvoerder loopt naast de kar
  // tot je zelf ergens heen klikt; en staat de kar op zijn plek, dan zetten ze het kamp op.
  T.werkBeginBij = function (S, D) {
    const B = D.begin;
    if (!B || B.kamp !== 'onderweg') return;
    const kar = B.kar;
    const karTegel = { x: kar.tx, y: kar.ty };
    if (!B.gezinnen && (T.afstand(karTegel, B.van) >= IN().voorsprong || !kar.pad.length)) laatGezinnenKomen(D, true);
    volgDeKar(S, D);
    if (kar.pad.length || kar.onderweg) return;
    if (T.afstand(karTegel, D.plek.kamp.kar) > 1) {
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

  // De aanvoerder loopt naast de kar, tot je zelf ergens heen klikt (zijn weg is dan niet die naar de kar).
  function volgDeKar(S, D) {
    const B = D.begin;
    const h = D.aanvoerder;
    if (!B.volgt || !h || T.aanvoerderIsWeg(D) || S.modus !== 'verkennen') return;
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
  // staat op zijn plek (ook als hij er nog niet was: het vangnet van de nacht, T.tikBeginDag). Wat hij bracht, is
  // uitgeladen en telt in de voorraad (de plek van de kar is de opslag tot het raadhuis er is), en de kar gaat
  // aan het werk: hij haalt de stapels (js/kar.js; werklijst C, stap 1).
  T.zetKampOp = function (D) {
    const B = D.begin;
    if (!B || B.kamp !== 'onderweg') return;
    const w = D.wereld;
    const k = D.plek.kamp;
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
    // wat de kar bracht, ligt nu in de voorraad; de kar zelf rijdt niet meer, maar blijft staan als de opslag tot het
    // raadhuis er is (vraag 184: vanaf dag één dragen de mensen; T.deVoorraad, js/kar.js)
    for (const wat in IN().kar) T.wijzigVoorraad(D, wat === 'zaaigraan' ? 'graan' : wat, IN().kar[wat]);
    if (!B.gezinnen) laatGezinnenKomen(D, true);
    T.zeg(D, T.t('The cart is on the open ground that will be the square. The families put up their tents around the campfire.'));
    // Het vee dat meekwam (werklijst Q, vraag 181, b; js/vee.js): los bij de kar, tot er een weide is.
    const vee = [];
    for (const soort in T.VEE_INSTELLINGEN.metDeKar) vee.push(...T.veeErbij(D, soort, T.VEE_INSTELLINGEN.metDeKar[soort], k.kar));
    if (vee.length) T.zeg(D, T.t('{kudde} came along with the cart. They need a meadow: make a field a pasture.', { kudde: T.hoofdletter(T.dierenTekst(vee, D.kalender ? D.kalender.dag : 0)) }));
  };

  // Elke nacht (T.tikGebouwenDag, js/gebouwen.js): staat het kamp nog niet, dan staat het nu (een kar die vastzat, of de
  // toetsen, die geen beelden spelen).
  T.tikBeginDag = function (D) {
    if (D.begin && D.begin.kamp === 'onderweg') T.zetKampOp(D);
  };

  // ---------------------------------------------------------------------------------------------
  // Verhuizen uit het kamp (vraag 152, 1c)
  // ---------------------------------------------------------------------------------------------

  // De tenten van de gezinnen in het kamp; niet die van de aanvoerder, want die is zijn huis tot zijn eigen huis af is (1d),
  // en niet die van de wacht in de demo, die blijft (zijn soldaten trekken niet in een hut, en worden geen boer).
  // Zolang er een is, komt er geen nieuw gezin over de weg (T.waaromGeenGezin, js/gebouwen.js): eerst je eigen mensen.
  T.kampTenten = (D) => (D.gebouwen || []).filter((g) => g.soort === 'tent' && g.huis !== 'aanvoerder' && g.bewoners !== 'wacht');

  // Elke nacht, als de gebouwen van vandaag af zijn en vóór er een nieuw gezin kan komen (T.tikGebouwenDag, js/gebouwen.js):
  // in een woning die af is en plaats heeft (een hut, een huis), trekt een gezin uit het kamp, het eerste dat er past; past
  // er geen, dan het eerste in een woning waar nog niemand woont, ook als het krap is (Marcel, 11 okt). Zijn tent gaat weg
  // zodra hij leeg is, en met de laatste tent het kampvuur; de kar blijft (Marcel, 11 okt: "Per tent"). Een boerderij of
  // een wijnboerderij is ook een thuis voor een gezin, en de man wordt er de boer (vraag 152, 1e; js/boerderij.js).
  T.verhuisUitHetKamp = function (D) {
    if (!D.begin || D.begin.kamp === 'onderweg') return;
    if (D.begin.kamp === 'op') verhuisDeAanvoerder(D);
    for (const g of D.gebouwen.slice()) {
      const soort = T.GEBOUWEN[g.soort];
      const boerderij = T.isBoerderij(g);
      if (!g.klaar || !soort || !(soort.woning || boerderij)) continue;
      const wonen = inHuis(D, g).length;
      if (boerderij && wonen) continue; // op een boerderij woont één gezin
      const vrij = T.woonruimteVan(D, g) - wonen;
      // eerst wie in het kamp woont, dan wie geen huis meer heeft (js/afbreken.js)
      const gezinnen = T.kampTenten(D).map((t) => inHuis(D, t)).concat(T.daklozeGezinnen(D)).filter((l) => l.length);
      const gezin = gezinnen.find((l) => l.length <= vrij) || (wonen === 0 ? gezinnen[0] : null);
      if (!gezin) continue;
      const tent = gezin[0].huis;
      T.verhuis(D, gezin, g);
      const wie = (gezin.find((p) => !p.hoofd) || gezin[0]).naam;
      if (!tent) T.zeg(D, boerderij
        ? T.t('{wie} and family have a home again, on the {boerderij}: {wie} is the farmer now.', { wie, boerderij: soort.naam })
        : T.t('{wie} and family have a home again: the {gebouw}.', { wie, gebouw: soort.naam }), 'goed');
      else if (boerderij) T.zeg(D, T.t('{wie} and family leave the camp for the {boerderij}: {wie} is the farmer now.', { wie, boerderij: soort.naam }));
      else T.zeg(D, gezin.length > vrij
        ? T.t('{wie} and family leave the camp: their {gebouw} is ready, though it is cramped.', { wie, gebouw: soort.naam })
        : T.t('{wie} and family leave the camp: their {gebouw} is ready.', { wie, gebouw: soort.naam }));
      if (tent && !inHuis(D, tent).length) haalTentWeg(D, tent);
    }
  };
  const inHuis = (D, g) => D.bewoners.mensen.filter((p) => p.huis === g);

  // Het raadhuis (1d; `aanvoerder` in T.GEBOUWEN): is het af, dan trekt de aanvoerder er met zijn gezin in. Het is
  // voortaan zijn huis (`huis: 'aanvoerder'`: slapen, het rapport, de bode), zijn tent gaat weg (met de laatste tent ook het
  // kampvuur), en het is voortaan de opslag waar de dragers lossen (js/kar.js). De huifkar gaat op in het raadhuis
  // (Marcel, 23 okt: "de huifkar verdwijnt, deze gaat op in het raadhuis. de spullen staan dan op de grond"): wat erin zat
  // (alles in de voorraad wat gedragen wordt; het goud niet), ligt als losse stapel waar hij stond, en telt pas weer als
  // de dragers het binnen hebben. Een ossenkar komt er pas met een schuur (vraag 184, 3b1; tot 23 okt werd de huifkar
  // hier de ossenkar). Geen gezin uit het kamp trekt erin: het is geen woning. Het uitladen gebeurt na het eten van die
  // nacht (T.laadDeHuifkarUit): die avond eten ze nog uit de kar; anders at het dorp uit een lege opslag tot de dragers het
  // binnen hadden.
  function verhuisDeAanvoerder(D) {
    const huis = D.gebouwen.find((g) => g.soort === 'raadhuis' && g.klaar && g.huis !== 'aanvoerder');
    const tent = huis && D.gebouwen.find((g) => g.soort === 'tent' && g.huis === 'aanvoerder');
    if (!tent) return;
    T.verhuis(D, inHuis(D, tent), huis);
    tent.huis = null;
    huis.huis = 'aanvoerder';
    T.zeg(D, T.t('The town hall is ready: you and your family move in. The covered wagon goes into it, and the carriers bring in what it held.'));
    if (!inHuis(D, tent).length) haalTentWeg(D, tent);
  }

  // Elke nacht na het eten (T.tikGebouwenDag, js/gebouwen.js): woont de aanvoerder in het raadhuis en staat de huifkar er
  // nog, dan is de huifkar weg, en ligt wat erin zat waar hij stond (hierboven).
  T.laadDeHuifkarUit = function (D) {
    const kar = D.begin && D.begin.kar;
    if (!kar || !D.gebouwen.some((g) => g.soort === 'raadhuis' && g.klaar && g.huis === 'aanvoerder')) return;
    const w = D.wereld;
    const plek = D.plek.kamp.kar;
    if (w.wezens.includes(kar)) w.wezens.splice(w.wezens.indexOf(kar), 1);
    D.begin.kar = null;
    const ligt = {};
    for (const wat of Object.keys(D.voorraad)) {
      const n = D.voorraad[wat];
      if (!(n > 1e-6) || !T.gaatMetVervoer(D, wat)) continue;
      ligt[wat] = n;
      T.wijzigVoorraad(D, wat, -n);
    }
    if (Object.keys(ligt).length) T.legLosseStapel(D, { x: plek.x, y: plek.y }, ligt);
  };

  // Een lege tent gaat van de kaart en uit het dorp; is het de laatste, dan gaat ook het kampvuur uit.
  function haalTentWeg(D, tent) {
    const w = D.wereld;
    if (tent.voorwerp) T.haalVoorwerpWeg(w, tent.voorwerp);
    D.gebouwen.splice(D.gebouwen.indexOf(tent), 1);
    if (D.gebouwen.some((g) => g.soort === 'tent' && g.bewoners !== 'wacht')) return; // de tent van de wacht blijft staan
    // zijn eigen vuur, niet dat van een ander dorp of een roverskamp (js/rovers.js)
    const k = D.plek.kamp.vuur;
    const vuur = w.voorwerpen.find((v) => v.soort === 'kampvuur' && v.x === k.x && v.y === k.y);
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
    const was = BEREIK.get(D);
    if (was && was.sleutel === sleutel) return was;
    const bronnen = T.pleinTegels(D).map((t) => ({ x: t.x, y: t.y }));
    for (const g of opslagen) {
      const r = T.voetVanGebouw(g);
      for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.b; x++) bronnen.push({ x, y });
    }
    if (!bronnen.length) bronnen.push({ x: -1e6, y: -1e6 }); // geen plein: nergens bereik (het vak valt buiten de kaart)
    const R = Math.ceil(straal);
    // het vak: de bronnen met de straal eromheen, binnen de kaart
    const vak = T.kaartVak(w);
    const x0 = Math.max(vak.x, Math.min(...bronnen.map((b) => b.x)) - R);
    const y0 = Math.max(vak.y, Math.min(...bronnen.map((b) => b.y)) - R);
    const b = Math.max(0, Math.min(vak.x + vak.b - 1, Math.max(...bronnen.map((q) => q.x)) + R) - x0 + 1);
    const h = Math.max(0, Math.min(vak.y + vak.h - 1, Math.max(...bronnen.map((q) => q.y)) + R) - y0 + 1);
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
    BEREIK.set(D, uit);
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
  // Ook niet in het bereik van een ander dorp op de kaart (werklijst vraag 170, stap 6a): de kaart weet wie waar woont
  // (de plekken die ze doorgaf, w.plekken, met hun dorp: T.nieuwDorp, js/dorp.js).
  T.waaromBuitenBouwBereik = function (D, r) {
    const anderen = ((D.wereld && D.wereld.plekken) || []).map((p) => p.dorp).filter((A) => A && A !== D && A.begin);
    for (let y = r.y; y < r.y + r.h; y++) {
      for (let x = r.x; x < r.x + r.b; x++) {
        if (!T.inBouwBereik(D, x, y)) return T.t('Too far away: you build within {n} tiles of the square or of a store.', { n: IN().bouwBereik });
        const A = anderen.find((a) => T.inBouwBereik(a, x, y));
        if (A) return T.t('This land belongs to {dorp}: you do not build there.', { dorp: T.dorpsnaam(A) || A.plek.naam || T.t('another village') });
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
    const v = D.plek.kamp.vuur;
    const L = IN().vuur;
    return [{ x: v.x, y: v.y, straal: L.straal, beeldStraal: L.beeldStraal, sterkte: stand === 'brandt' ? L.sterkte : L.smeult, soort: 'kampvuur' }];
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
  //   T.proefdorp.begin(zaad)   een nieuw spel op het eiland van `zaad` (PROEF_ZAAD), met het lege begin, op dag 1: geeft S
  //                             (met een level erachter, zoals T.LEVELS.demojaar, het spel van dat level)
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

  // Het eiland van het proefdorp: één getal, voor de toetsen en het gereedschap. Het heeft open grond bij het plein, water,
  // bos en rotsen in de buurt (B2b, 13 okt: sinds het land overal van het eiland komt, ligt elk land anders dan ervoor).
  const PROEF_ZAAD = 2;
  // Een nieuw spel op het eiland van `zaad`, met het lege begin, zoals js/main.js het begint, maar zonder scherm.
  function begin(zaad = PROEF_ZAAD, level = null) {
    const S = { kalender: T.nieuweKalender(), tijd: 0, wereldTijd: 0, modus: 'verkennen' };
    metVastToeval(11, () => T.beginOpEiland(S, zaad, level));
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

  // Een bouwplaats meteen af: de kavel gerooid, het hout gebracht (uit de voorraad, alsof de kar het bracht; js/kar.js) en
  // al het werk gedaan; die nacht komt hij klaar (T.tikGebouwenDag).
  function bouwAf(D, g, dag) {
    T.brengMeteen(D, g);
    if (g.wachtOpRooien) {
      for (const t of T.teRooienOp(D, g.kavel)) T.rooiTegel(D, t);
      if (g.egaliseert) T.zetEgaliseerDeel(D.wereld, g.vlak, 1); // half geëgaliseerd: nu vlak (js/bouwen.js)
      g.wachtOpRooien = false;
      g.egaliseert = false;
      if (!T.isVeldSoort(g.soort)) T.zetOpDeKaart(D, g);
    }
    g.bouw.gedaan = g.bouw.werk;
    if (g.voorwerp) g.voorwerp.voortgang = 1;
    g.klaarOp = dag;
  }

  // Zet `soort` neer zo dicht mogelijk bij het kampvuur, zoals de speler het met het bouwmenu doet; in het bos ook (de
  // kavel rooit bouwAf). Met `ruimte` blijft er zoveel tegels om zijn voet vrij van andere gebouwen, zoals een speler die
  // wil dat zijn hut kan doorgroeien tot een huis. Geeft het gebouw.
  function zetBijHetVuur(D, soort, ruimte = 0) {
    const v = D.plek.kamp.vuur;
    const voet = T.gebouwVoet(soort, T.volgendeTekening(D, soort)) || { b: 1, h: 1 };
    const raakt = (a, b) => a.x < b.x + b.b && b.x < a.x + a.b && a.y < b.y + b.h && b.y < a.y + a.h;
    const tekrap = (x, y) => {
      const om = { x: x - ruimte, y: y - ruimte, b: voet.b + 2 * ruimte, h: voet.h + 2 * ruimte };
      return D.gebouwen.some((g) => raakt(om, T.voetVanGebouw(g)));
    };
    for (let r = 1; r < 40; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          if (ruimte && tekrap(v.x + dx, v.y + dy)) continue;
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
      if (!e || p.aanvoerder) continue;
      delete p.komt;
      const deur = T.deurVanBewoner(D, p);
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

  // Het proefdorp bouwen: het lege begin, en op dag 1 neergezet en meteen af het raadhuis, twee boerderijen met
  // elk een akker, en hutten voor wie er dan nog in het kamp woont. Op dag 2 trekken de gezinnen erin, wordt de man op een
  // boerderij boer, en worden de akkers land; het kamp is dan leeg, en iedereen staat thuis. Rond het vuur is het krap, dus
  // bouwt het met een ruimer bereik (`bereik` tegels; in het spel `bouwBereik` hierboven), alleen zolang het neerzet.
  // Geeft S, met S.kalender op dag 2.
  //   zaad         het eiland (PROEF_ZAAD)
  //   boerderijen  hoeveel boerderijen, elk met een akker (2)
  //   hutten       hoeveel hutten; standaard zoveel als er dan nog gezinnen in het kamp wonen
  //   gebouwen     wat er verder staat, af, zoals ['herberg', 'schaapskooi'] (een gebouw met handen krijgt ze op dag 2)
  //   weide        de eerste boerderij krijgt er een veld bij dat weide is, met de beginkudde erop (T.zetBeginKudde)
  function maak({ zaad = PROEF_ZAAD, boerderijen = 2, hutten = null, gebouwen = [], weide = false, bereik = 40 } = {}) {
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
        const soorten = ['raadhuis', ...Array(boerderijen).fill('boerderij'), ...Array(n).fill('hut'), ...gebouwen];
        for (const soort of soorten) for (const [wat, k] of Object.entries(T.GEBOUWEN[soort].kosten || {})) T.wijzigVoorraad(D, wat, k);
        const raadhuis = zetBijHetVuur(D, 'raadhuis');
        const hoeven = [];
        for (let i = 0; i < boerderijen; i++) hoeven.push(zetBijHetVuur(D, 'boerderij'));
        const velden = hoeven.map((g) => legVeldBij(D, 'akker', g));
        if (weide) velden.push((weiveld = legVeldBij(D, 'akker', hoeven[0])));
        const rest = [];
        // Drie tegels om elke hut, zodat hij kan doorgroeien (B2b, 13 okt: tegen elkaar stond de ene de andere in de weg).
        for (let i = 0; i < n; i++) rest.push(zetBijHetVuur(D, 'hut', 3));
        for (const soort of gebouwen) rest.push(zetBijHetVuur(D, soort));
        for (const g of [raadhuis, ...hoeven, ...velden, ...rest]) bouwAf(D, g, 1);
      } finally {
        IN().bouwBereik = echt;
      }
      dagen(S, 2);
      // De huifkar ging op in het raadhuis, en wat erin zat, ligt als losse stapel waar hij stond (verhuisDeAanvoerder,
      // hierboven): in het proefdorp is het meteen binnen, alsof de dragers het al haalden.
      for (const g of D.gebouwen.filter((x) => x.soort === 'stapel')) {
        for (const wat in g.stapel) T.wijzigVoorraad(D, wat, g.stapel[wat]);
        D.gebouwen.splice(D.gebouwen.indexOf(g), 1);
      }
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
      return S;
    });
  }

  T.proefdorp = { zaad: PROEF_ZAAD, begin, maak, dagen, bouwAf, zetBijHetVuur, legVeldBij, metVastToeval };
})(globalThis.Spel = globalThis.Spel || {});
