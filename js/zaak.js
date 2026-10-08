// De zaak: de verdwenen graanzak (werklijst vraag 128; Marcel, 6 okt: "A tot g allemaal, en de proef komt erna", en
// 8 okt: "akkoord, bouwen maar"; het plan: ontwerp/spel.md, "Informatie, de zitting en mensen die onthouden"). Eén
// keten van begin tot eind, de proef voor informatie, de zitting en gevolgen die later terugkomen:
//   1. 's Nachts neemt een vader met een ziek kind een zak graan uit de schuur van een boer. Dat is wat er echt
//      gebeurde (D.zaak), en er ligt een spoor van gemorst graan van de schuur naar zijn deur.
//   2. De boer komt je zeggen wie hij verdenkt (het voorval graanzak): de verkeerde. Dat is een gerucht.
//   3. Je zoekt het uit, te voet: het spoor zie je als je er staat (T.werkZaakBij), en wie je aanklikt, kun je iets
//      vragen (T.zaakGesprekVan, de gesprekken zaakBuur, zaakHerberg, ...). Wat je weet, staat op het papier "De zaak"
//      (js/brieven.js), apart wat je zelf zag, wat mensen je vertelden, en wat er gezegd wordt (T.ZAAK_WETEN).
//   4. Op de dag van de zitting staan de aanklager, de verdachte en wie er iets mee te maken heeft 's middags op het
//      plein (T.zaakAnker), en komt de schout erbij, dan begint ze (het voorval zitting, met L.plein): straffen,
//      vrijspreken, of, als je weet wie het was, hem straffen, de familie het graan geven, of het verbergen.
//   5. Wat je koos, komt terug: een vervolg over dezelfde mensen (T.ZAAK_INSTELLINGEN.vervolg), en een zak die nergens
//      staat, leest de inner op Sint-Maarten in het boek van de schuur (T.heerLeestHetBoek, vanuit js/heer.js).
// Eén keer per spel, in de eerste herfst. De spelregel "De zaak"; de getallen hieronder. Wat een antwoord kost, staat
// bij het antwoord in js/gesprekken.js, zoals bij elk voorval.
(function (T) {
  'use strict';

  T.ZAAK_INSTELLINGEN = {
    aan: true,
    // Wanneer: in de eerste herfst, op een dag in herfstmaand tussen deze twee (geloot), en kan het dan niet (er loopt
    // een ander voorval), een dag later, tot het eind van laatsteMaand.
    maand: 'herfstmaand',
    vanDag: 4,
    totDag: 18,
    laatsteMaand: 'wijnmaand',
    // Hoeveel graan er in een zak zit.
    zak: 10,
    // De zitting: zoveel dagen na de aanklacht, 's middags op het plein, vanaf zittingUur. Wie er staan, komen een uur
    // eerder; de schout moet binnen pleinStraal tegels van het midden van het plein komen. Na zittingTot gaan ze naar
    // huis, en is er geen zitting geweest.
    zittingNa: 3,
    zittingUur: 13,
    zittingTot: 18,
    pleinStraal: 4,
    // Het spoor: om de zoveel tegels een hoopje gemorst graan, van de schuur naar de deur van wie het nam, en hooguit
    // zoveel hoopjes. Wie er binnen spoorZien tegels van staat, ziet het.
    spoorStap: 2,
    spoorHoopjes: 8,
    spoorZien: 1,
    // Wat er later terugkomt, per uitkomst: welk vervolg (js/voorvallen.js, T.VOORVALLEN), over wie (wie het komt zeggen
    // en over wie het gaat, uit de zaak), en na hoeveel dagen.
    vervolg: {
      straf: { id: 'zaakWrok', wie: 'verdachte', ander: 'dader' },
      vrij: { id: 'zaakWeer', wie: 'aanklager', ander: 'dader' },
      gelaten: { id: 'zaakWeer', wie: 'aanklager', ander: 'dader' },
      geen: { id: 'zaakWeer', wie: 'aanklager', ander: 'dader' },
      strafDader: { id: 'zaakKind', wie: 'dader', ander: 'ziek' },
      geef: { id: 'zaakDank', wie: 'dader', ander: 'ziek' },
      verberg: { id: 'zaakDank', wie: 'dader', ander: 'ziek' },
    },
    vervolgNa: [8, 16],
    // Bij welke uitkomsten de zak nergens in het boek van de schuur staat: dat leest de inner op Sint-Maarten, en dan
    // groeit de argwaan (een getal van 0 tot 100, zoals argwaan in een antwoord) en daalt de gunst van de heer.
    nietInHetBoek: ['vrij', 'gelaten', 'geen', 'verberg'],
    boekArgwaan: 8,
    boekGunst: -3,
  };
  const IN = () => T.ZAAK_INSTELLINGEN;

  // Wat je kunt weten, en hoe het heet op het papier (js/brieven.js): zelf gezien, iemand vertelde het je (een getuige),
  // of er wordt gezegd (een gerucht). De vlag zet het in het dorp, zodat een gesprek ernaar kan kijken (zaakSpoor, ...);
  // wie iets weet dat hem verraadt (het spoor, of het licht), daar zet het ook zaakBewijs.
  T.ZAAK_WETEN = {
    beschuldiging: { soort: 'gerucht', vlag: 'zaakBeschuldiging', tekst: '{aanklager} zegt dat hij {verdachte} gisteravond bij zijn schuur zag.' },
    praat: { soort: 'gerucht', vlag: 'zaakPraat', tekst: 'In het dorp zeggen ze dat {verdachte} het was: die heeft altijd honger.' },
    ontkent: { soort: 'gerucht', vlag: 'zaakOntkent', tekst: '{verdachte} zegt dat hij die avond in de herberg zat.' },
    ziek: { soort: 'gerucht', vlag: 'zaakZiek', tekst: 'In de herberg zeggen ze dat {kind} van {dader} ziek is, en dat ze thuis niets meer hebben.' },
    alibi: { soort: 'getuige', vlag: 'zaakAlibi', tekst: '{herbergierster} zegt dat {verdachte} die avond in de herberg zat, tot ze sloot.' },
    licht: { soort: 'getuige', vlag: 'zaakLicht', bewijs: true, tekst: '{buur} zag die nacht laat licht bij {dader}, en hoorde een kind hoesten.' },
    spoor: { soort: 'feit', vlag: 'zaakSpoor', bewijs: true, tekst: 'Je zag gemorst graan, een spoor van de schuur van {schuurVan} naar de deur van {dader}.' },
    bekend: { soort: 'feit', vlag: 'zaakBekend', bewijs: true, tekst: '{dader} bekende het je: hij nam de zak voor {kind}, die ziek is.' },
  };
  const ALLE_VLAGGEN = ['zaakLoopt', 'zaakBewijs', ...Object.values(T.ZAAK_WETEN).map((w) => w.vlag)];

  const dagNu = (D) => Math.floor(D.kalender ? D.kalender.dag : 0);
  const naam = (p) => (p ? T.naamVanBewoner(p) : 'iemand');
  const lot = (D, dag, n) => T.lotVanDeDag(D, dag, n);
  const vanSchout = (p) => !!(p.schout || (p.hoofd && p.hoofd.schout));
  const volwassen = (p) => p.leeftijd === 'volwassen' || p.leeftijd === 'oud' || p.leeftijd === 'jong';
  const gezinVan = (D, p) => D.bewoners.mensen.filter((x) => x.gezin === p.gezin);

  // ---------------------------------------------------------------------------------------------
  // Wie het zijn
  // ---------------------------------------------------------------------------------------------

  // Een getal 0..1 per persoon, vast per spel: zo kiest het spel uit wie past, en elke keer dezelfde.
  const kiesUit = (D, lijst, dag, n) => (lijst.length ? lijst[Math.floor(lot(D, dag, n) * lijst.length)] : null);
  const deurVan = (D, g) => T.deurVan(D.wereld, g);
  const herbergierster = (D) => {
    const h = T.herbergVan(D);
    return (h && D.bewoners.mensen.find((p) => p.huis === h && volwassen(p) && p.geslacht === 'vrouw')) || null;
  };

  // De mensen van de zaak, of null als het dorp ze (nog) niet heeft: een gezin met een kind (de dader, een vader, en
  // het kind dat ziek is), de boerderij het dichtst bij zijn huis (de schuur, met wie er de baas is als aanklager), een
  // man uit een ander huis (de verdachte), en wie het dichtst bij de dader woont (de buur, die iets zag).
  T.mensenVoorDeZaak = function (D, dag) {
    if (!D.bewoners || !D.wereld) return null;
    const kan = (p) => T.kanJeKomenZoeken(D, p) && !vanSchout(p);
    const herberg = T.herbergVan(D);
    const mensen = D.bewoners.mensen;
    // De dader: een vader in een gezin met een kind, liefst uit een gewoon huis (niet de herberg), anders van een boerderij.
    const daders = mensen.filter((p) => kan(p) && p.geslacht === 'man' && volwassen(p) && p.huis && p.huis !== herberg
      && mensen.some((k) => k.gezin === p.gezin && (k.leeftijd === 'kind' || k.leeftijd === 'kleuter')));
    const dader = kiesUit(D, daders.filter((p) => p.huis.soort !== 'boerderij'), dag, 1281) || kiesUit(D, daders, dag, 1281);
    const schuren = (D.gebouwen || []).filter((g) => g.soort === 'boerderij' && (!dader || g !== dader.huis));
    if (!dader || !schuren.length) return null;
    const ziek = kiesUit(D, mensen.filter((k) => k.gezin === dader.gezin && (k.leeftijd === 'kind' || k.leeftijd === 'kleuter')), dag, 1282);
    const deur = deurVan(D, dader.huis);
    const schuur = schuren.slice().sort((a, b) => T.afstand(deurVan(D, a), deur) - T.afstand(deurVan(D, b), deur))[0];
    const aanklager = mensen.find((p) => kan(p) && p.huis === schuur && !p.hoofd && volwassen(p));
    if (!aanklager) return null;
    const niet = new Set([dader.gezin, aanklager.gezin]);
    const hb = herbergierster(D);
    if (hb) niet.add(hb.gezin);
    const mannen = mensen.filter((p) => kan(p) && p.geslacht === 'man' && volwassen(p) && !niet.has(p.gezin));
    const verdachte = kiesUit(D, mannen.filter((p) => !T.isBoer(p.wezen)), dag, 1283) || kiesUit(D, mannen, dag, 1283);
    if (!verdachte) return null;
    niet.add(verdachte.gezin);
    const buren = mensen.filter((p) => kan(p) && volwassen(p) && !niet.has(p.gezin) && p.huis && p.huis !== herberg);
    buren.sort((a, b) => T.afstand(deurVan(D, a.huis), deur) - T.afstand(deurVan(D, b.huis), deur) || a.id - b.id);
    return { dader, ziek, schuur, aanklager, verdachte, buur: buren[0] || null, herbergierster: hb };
  };

  // Het spoor van gemorst graan: de weg van de deur van de schuur naar die van de dader, om de spoorStap tegels een
  // hoopje, niet op de deuren zelf.
  function spoorVan(D, schuur, dader) {
    const van = deurVan(D, schuur);
    const naar = deurVan(D, dader.huis);
    const pad = T.zoekRoute(D.wereld, van, naar, { tot: 0 }) || [];
    const uit = [];
    for (let i = IN().spoorStap; i < pad.length - 1 && uit.length < IN().spoorHoopjes; i += IN().spoorStap) uit.push({ x: pad[i].x, y: pad[i].y });
    return uit;
  }

  // ---------------------------------------------------------------------------------------------
  // De zaak, dag voor dag
  // ---------------------------------------------------------------------------------------------

  // De zaak (D.zaak), zolang hij loopt en daarna:
  //   fase       'gestolen' (de zak is weg, de aanklager komt), 'onderzoek' (tot de zitting), of 'af'
  //   dag        de nacht dat de zak verdween; zitting: de dag van de zitting; af: de dag dat het af was
  //   dader, ziek, aanklager, verdachte, buur, herbergierster   bewoners (js/bewoners.js); schuur: de boerderij
  //   spoor      de hoopjes gemorst graan [{ x, y }], tot de zaak af is
  //   weet       wat je weet: [{ id, dag }] (T.ZAAK_WETEN)
  //   uitkomst   hoe het afliep ('straf', 'vrij', 'gelaten', 'geen', 'strafDader', 'geef', 'verberg')
  //   boek       { tekort, gelezen }: een zak die nergens staat, tot de inner het boek leest
  T.zaakLoopt = (D) => !!(D.zaak && D.zaak.fase !== 'af');
  T.zaakOnderzoek = (D) => !!(D.zaak && D.zaak.fase === 'onderzoek');

  // Vannacht verdwijnt de zak. Geeft de zaak, of null als het dorp de mensen ervoor niet heeft.
  T.beginZaak = function (D, dag) {
    const m = T.mensenVoorDeZaak(D, dag);
    if (!m) return null;
    const zak = Math.min(IN().zak, Math.floor((D.voorraad && D.voorraad.graan) || 0));
    T.wijzigVoorraad(D, 'graan', -zak);
    D.zaak = { fase: 'gestolen', dag: Math.floor(dag), ...m, zak, spoor: spoorVan(D, m.schuur, m.dader), weet: [], uitkomst: null, boek: null };
    T.zeg(D, `Vannacht is er een zak graan uit de schuur van ${naam(m.aanklager)} verdwenen.`, 'gevaar');
    return D.zaak;
  };

  // Elke nacht (T.tikGebouwenDag, vóór de voorvallen): de zak verdwijnt op zijn dag in de eerste herfst; de aanklager
  // komt; is hij niet gesproken, dan komt de zitting er toch; op de dag van de zitting begint ze; en is ze voorbij
  // zonder vonnis, dan is de zaak af ('geen').
  T.tikZaakDag = function (D, dag) {
    if (!IN().aan || D.ander || !D.bewoners || !D.voorvallen) return;
    const V = D.voorvallen;
    const Z = D.zaak;
    if (!Z) {
      if (V.lopend || !zaakVandaag(D, dag)) return;
      if (T.beginZaak(D, dag)) T.beginVoorval(D, 'graanzak', D.zaak.aanklager, D.zaak.verdachte, dag);
      return;
    }
    if (Z.fase === 'gestolen') {
      // De aanklager is weg zonder dat je hem sprak (js/voorvallen.js): hij wacht niet, de zitting komt er.
      if (!V.lopend || V.lopend.id !== 'graanzak') zittingOp(D, dag, true);
      return;
    }
    if (Z.fase !== 'onderzoek') return;
    if (Z.zittingBegon) {
      if (!V.lopend || V.lopend.id !== 'zitting') rondAf(D, 'geen', dag);
      return;
    }
    if (dag < Z.zitting || V.lopend) return;
    const L = T.beginVoorval(D, 'zitting', Z.aanklager, Z.verdachte, dag);
    L.plein = true;
    L.vanaf = dag + IN().zittingUur / 24;
    L.tot = dag + 1;
    Z.zitting = Math.floor(dag); // kon ze op haar dag niet (er liep een ander voorval), dan is ze vandaag
    Z.zittingBegon = true;
  };

  // Is vandaag de dag? In de eerste herfst, vanaf de geloote dag in de maand van de zaak, tot het eind van laatsteMaand.
  function zaakVandaag(D, dag) {
    const d = T.datumVanDag(dag);
    if (d.jaar !== T.TIJD_START_JAAR) return false;
    const m = T.MAANDEN[d.maand].naam;
    const begin = T.MAANDEN.findIndex((x) => x.naam === IN().maand);
    const eind = T.MAANDEN.findIndex((x) => x.naam === IN().laatsteMaand);
    if (d.maand < begin || d.maand > eind) return false;
    const opDag = IN().vanDag + Math.floor(lot(D, 0, 1280) * (IN().totDag - IN().vanDag + 1));
    return m !== IN().maand || d.dagVanMaand >= opDag;
  }

  // De zitting komt er: over zittingNa dagen, 's middags op het plein. Tot dan kun je rondvragen.
  function zittingOp(D, dag, nietGesproken) {
    const Z = D.zaak;
    Z.fase = 'onderzoek';
    Z.zitting = Math.floor(dag) + IN().zittingNa;
    T.zaakWeet(D, 'beschuldiging');
    T.zetVlag(D, 'zaakLoopt');
    const wanneer = T.datumVanDag(Z.zitting).tekst.replace(/ \d+$/, '');
    const eerst = nietGesproken ? `${T.hoofdletter(naam(Z.aanklager))} wacht niet langer op je. ` : '';
    T.zeg(D, `${eerst}De zitting over de graanzak is op ${wanneer}, 's middags op het plein. Tot dan kun je rondvragen: wie je aanklikt, vraag je ernaar.`);
  }

  // Het vonnis, of het einde zonder vonnis: de zaak is af. Het spoor gaat weg, de vlaggen ook, een zak die nergens staat,
  // komt in het boek, en het vervolg wacht.
  function rondAf(D, uitkomst, dag) {
    const Z = D.zaak;
    if (!Z || Z.fase === 'af') return;
    Z.fase = 'af';
    Z.uitkomst = uitkomst;
    Z.af = Math.floor(dag);
    Z.spoor = [];
    for (const v of ALLE_VLAGGEN) T.wisVlag(D, v);
    if (IN().nietInHetBoek.includes(uitkomst)) Z.boek = { tekort: Z.zak, gelezen: false };
    const v = IN().vervolg[uitkomst];
    const wie = v && Z[v.wie];
    if (wie) {
      const [van, tot] = IN().vervolgNa;
      const op = Z.af + van + Math.floor(lot(D, Z.af, 1284) * (tot - van + 1));
      D.voorvallen.wacht.push({ id: v.id, op, wie, ander: Z[v.ander] || null });
    }
  }

  // Wat je nu weet erbij (T.ZAAK_WETEN), één keer. Geeft of het nieuw was.
  T.zaakWeet = function (D, id) {
    const Z = D.zaak;
    const w = T.ZAAK_WETEN[id];
    if (!Z || !w || Z.weet.some((x) => x.id === id)) return false;
    Z.weet.push({ id, dag: dagNu(D) });
    T.zetVlag(D, w.vlag);
    if (w.bewijs) T.zetVlag(D, 'zaakBewijs');
    return true;
  };

  // Wat een antwoord aan de zaak doet (T.doeGevolg, js/gesprek.js): weet: wat je nu weet; zaak: 'zitting' (je zoekt
  // het uit), of een vonnis (rondAf).
  T.zaakGevolg = function (S, D, doe) {
    if (!D.zaak) return;
    for (const id of [].concat(doe.weet || [])) T.zaakWeet(D, id);
    if (!doe.zaak) return;
    if (doe.zaak === 'zitting') zittingOp(D, dagNu(D), false);
    else rondAf(D, doe.zaak, dagNu(D));
  };

  // Wat een vonnis kost, naast de getallen van het antwoord (T.prijsVanKeuze, js/voorvallen.js).
  T.zaakPrijs = function (D, uitkomst) {
    if (uitkomst === 'verberg') return ['de zak staat niet in het boek van de schuur'];
    if (uitkomst === 'vrij' || uitkomst === 'gelaten') return ['de zak blijft weg'];
    return [];
  };

  // Op Sint-Maarten (T.heerStaatErOp, js/heer.js): de inner leest de heer het boek van de schuur voor. Staat er een zak
  // niet in, dan ziet hij het.
  T.heerLeestHetBoek = function (D) {
    const B = D.zaak && D.zaak.boek;
    if (!B || B.gelezen) return;
    B.gelezen = true;
    const waarom = 'in het boek van de schuur mist een zak graan';
    T.zetArgwaan(D, IN().boekArgwaan / 100, waarom);
    T.wijzigGunst(D, IN().boekGunst, waarom);
    T.zeg(D, 'De inner leest de heer het boek van de schuur voor. Er mist een zak graan, en die staat nergens.', 'gevaar');
  };

  // ---------------------------------------------------------------------------------------------
  // Rondvragen, en het spoor zien
  // ---------------------------------------------------------------------------------------------

  // Wie hij is in de zaak: 'dader', 'gezin' (van de dader), 'buur', 'verdachte', 'aanklager', 'herberg' (de
  // herbergierster), of 'niemand'.
  T.zaakRolVan = function (D, p) {
    const Z = D.zaak;
    if (!Z || !p) return null;
    if (p === Z.dader) return 'dader';
    if (p.gezin === Z.dader.gezin) return 'gezin';
    if (p === Z.verdachte) return 'verdachte';
    if (p === Z.aanklager) return 'aanklager';
    if (p === Z.buur) return 'buur';
    if (p === Z.herbergierster) return 'herberg';
    return 'niemand';
  };

  // Welk gesprek je met dit wezen voert over de zaak (js/verkennen.js), of null: zolang je het uitzoekt, iedereen die hier
  // woont en groot genoeg is, behalve je eigen gezin. Wie je vraagt, onthoudt de zaak (Z.gevraagd), voor zijn naam.
  T.zaakGesprekVan = function (D, e) {
    if (!T.zaakOnderzoek(D)) return null;
    const p = T.bewonerVan(D, e);
    if (!p || vanSchout(p) || p.leeftijd === 'kleuter' || p.leeftijd === 'kind') return null;
    const rol = T.zaakRolVan(D, p);
    if (rol === 'niemand') return lot(D, p.id, 1285) < 0.4 ? 'zaakPraat' : 'zaakNiemand';
    return 'zaak' + T.hoofdletter(rol);
  };
  T.vraagNaarDeZaak = function (D, e) {
    D.zaak.gevraagd = T.bewonerVan(D, e);
  };

  // Elk beeld (js/main.js, voor je eigen dorp): staat de schout bij het spoor, dan ziet hij het.
  T.werkZaakBij = function (S, D) {
    const Z = D.zaak;
    if (!Z || Z.fase === 'af' || !Z.spoor.length || S.wereld !== D.wereld || Z.weet.some((x) => x.id === 'spoor')) return;
    const h = D.schout;
    if (!h || !Z.spoor.some((t) => T.afstand(t, { x: h.tx, y: h.ty }) <= IN().spoorZien)) return;
    if (T.zaakWeet(D, 'spoor')) T.zeg(D, T.vulWoordenIn(D, 'Gemorst graan op de grond: een spoor, van de schuur van {schuurVan} naar de deur van {dader}.'));
  };

  // Waar wie bij de zitting hoort, staat op de dag van de zitting, van een uur ervoor tot zittingTot (T.dagAnker,
  // js/dag.js): op het plein, de aanklager en de verdachte vooraan, de rest eromheen.
  T.zaakAnker = function (D, e) {
    const Z = D.zaak;
    if (!Z || Z.fase !== 'onderzoek' || !D.kalender || Math.floor(D.kalender.dag) !== Z.zitting) return null;
    const uur = (D.kalender.dag % 1) * 24;
    if (uur < IN().zittingUur - 1 || uur >= IN().zittingTot) return null;
    const p = T.bewonerVan(D, e);
    const rol = T.zaakRolVan(D, p);
    if (!rol || rol === 'niemand' || rol === 'herberg' || (rol === 'gezin' && p.leeftijd !== 'volwassen' && p.leeftijd !== 'oud')) return null;
    const m = T.zittingPlek(D);
    if (!m) return null;
    const plek = { aanklager: [-1, 1], verdachte: [1, 1], dader: [2, -1], gezin: [2, -2], buur: [-2, -1] }[rol] || [0, 2];
    return { x: m.x + plek[0], y: m.y + plek[1], straal: 0 };
  };
  // Het midden van de zitting: het midden van het plein (js/feesten.js), of waar de marskramer staat.
  T.zittingPlek = (D) => T.feestMidden(D.wereld) || T.pleinVan(D.wereld);
  // Staat de schout bij de zitting? (js/voorvallen.js, T.werkVoorvallenBij)
  T.schoutBijDeZitting = function (D) {
    const m = T.zittingPlek(D);
    const h = D.schout;
    return !!(m && h && T.afstand(m, { x: h.tx, y: h.ty }) <= IN().pleinStraal);
  };

  // ---------------------------------------------------------------------------------------------
  // Woorden voor de gesprekken en het papier
  // ---------------------------------------------------------------------------------------------

  const rol = (veld) => (D) => naam(D.zaak && D.zaak[veld]);
  T.GESPREK_WOORDEN = T.GESPREK_WOORDEN || {};
  T.GESPREK_WOORDEN.dader = rol('dader');
  T.GESPREK_WOORDEN.verdachte = rol('verdachte');
  T.GESPREK_WOORDEN.aanklager = rol('aanklager');
  T.GESPREK_WOORDEN.buur = rol('buur');
  T.GESPREK_WOORDEN.kind = rol('ziek');
  T.GESPREK_WOORDEN.gevraagd = rol('gevraagd');
  T.GESPREK_WOORDEN.herbergierster = (D) => (D.zaak && D.zaak.herbergierster ? naam(D.zaak.herbergierster) : 'de herbergierster');
  T.GESPREK_WOORDEN.schuurVan = rol('aanklager');
  T.GESPREK_WOORDEN.zittingOver = () => T.telwoord(IN().zittingNa);
  // Wat je weet, in één zin per soort, voor de zitting.
  T.GESPREK_WOORDEN.zaakWeet = (D) => {
    const delen = T.zaakWetenPerSoort(D).filter((s) => s.regels.length).map((s) => `${s.kop}: ${s.regels.join(' ')}`);
    return delen.length ? delen.join(' ') : 'Je weet alleen wat de aanklager zegt.';
  };

  // Wat je weet, per soort, met de woorden ingevuld: [{ soort, kop, regels }], voor het papier en de zitting.
  T.zaakWetenPerSoort = function (D) {
    const Z = D.zaak;
    const koppen = { feit: 'Wat je zelf zag', getuige: 'Wat mensen je vertelden', gerucht: 'Wat er gezegd wordt' };
    return Object.entries(koppen).map(([soort, kop]) => ({
      soort, kop,
      regels: ((Z && Z.weet) || []).filter((w) => T.ZAAK_WETEN[w.id].soort === soort).map((w) => T.vulWoordenIn(D, T.ZAAK_WETEN[w.id].tekst)),
    }));
  };
})(globalThis.Spel = globalThis.Spel || {});
