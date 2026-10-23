// De ossenkar (werklijst C; Marcel, 11 okt: "Misschien dat grondstoffen worden opgehaald met een kar?", en op het plan van
// 14 okt: "A2, B2, C1, D2, E2"): wat een gebouw maakt, ligt op een stapel bij zijn deur tot de kar het haalt, en telt pas
// in de voorraad als het in de opslag is (het raadhuis; tot dat er is, de plek van de kar in het kamp); en wat
// een bouwplaats of een werkplaats nodig heeft, brengt de kar uit de opslag. Dat geldt voor alles behalve het goud
// (`nietVervoerd` hieronder; stap 3, A2). Wat niet van een gebouw komt, gaat meteen de voorraad in: wat het vee geeft (de
// wol, de melk en de kaas, het vlees van het slachten, de mest; Marcel, 14 okt: "c ja"), het sprokkelhout, en wat de
// marskramer brengt.
//
// De stapel ligt op het gebouw: g.stapel = { hout: 6 }. Een veld legt zijn hout op de stapel van zijn boerderij. Is een
// stapel `stapelVol`, dan maakt het gebouw niets meer (T.ruimteOpStapel, js/gebouwen.js): zo zie je waar het stokt.
//
// Bouwen (stap 2, B2, zoals in The Settlers): je zet neer wanneer je wilt en betaalt alleen wat niet met de kar gaat (het
// goud, T.bouwKosten); wat wel met de kar gaat, is wat de bouwplaats nodig heeft (g.bouw.nodig), en wat er is, ligt in
// g.bouw.er. De bouwers komen zo ver als het hout reikt (T.bouwMateriaalDeel, js/bouwen.js), en wat ze op de plek rooien,
// gaat eerst in het gebouw (T.opStapel). Een werkplaats die iets verwerkt dat met de kar gaat (de zagerij zijn stammen),
// neemt het uit wat bij hem ligt (g.in), en de kar vult dat aan tot `voorraadIn`.
//
// De kar rijdt zelf, zonder hand (C1), in de werktijd van het dorp (T.dagindeling, js/dag.js). Wat hij doet (kiesRit):
// eerst brengen, naar de bouwplaatsen in de volgorde waarin je ze neerzette en dan naar de werkplaatsen; anders halen,
// de grootste stapel. Een rit is een regel op de klok van de kalender, niet op de beelden: elk stuk ervan heeft een begin
// en een eind (in dagen), uit de lengte van de weg en het tempo van de os. Elk beeld (T.werkKarBij) en elke nacht
// (T.tikKarDag) werken de kar bij tot nu; de beelden geven het wezen zijn weg, zodat je hem ziet rijden, en staat hij aan
// het eind van een stuk nog niet waar hij moet zijn (iemand stond in de weg), dan staat hij er. Zo komt er met of zonder
// beelden hetzelfde uit (de toetsen spelen zonder), zoals bij het meebouwen (js/bouwen.js).
//
// Een schuur (stap 4, D2; Marcel: "a ja, b ja, c ja") is een opslag met een eigen kar: elke kar haalt en brengt wat het
// dichtst bij zijn eigen opslag ligt (`verantwoordelijk`), en laadt en lost daar. De voorraad is één, voor alle opslagen.
//
// De dragers (vraag 184; Marcel, 20 okt: "Ik wil ook dat de mensen zonder werk zorgen voor het vervoer van materiaal",
// en "het begin heeft geen kar meer, vanaf dag één dragen de mensen"): wie geen werk heeft en niet bouwt, draagt
// (T.dragersVan, js/bouwen.js). Een drager is een kar met een lading van één (`perDrager`), in het tempo van een mens en
// zonder voordeel van een weg; hij rijdt dezelfde ritten in dezelfde volgorde, laadt en lost bij de opslag die het
// dichtst bij is (`opslagBij`), en bedient elk gebouw. Zo is er één manier van vervoer: de karren en de dragers samen
// zijn de vervoerders (T.vervoerdersVan). Zolang hij iets draagt, is hij bezig (e.werkt, soort 'vervoer': hij dwaalt dan
// niet, js/verkennen.js), en zegt `e.draagt` wat je hem ziet dragen (js/sprites.js; tot er dragers met een plank, een
// stam of een steen zijn, een bundel, een mand of een schoof). De huifkar van het begin rijdt niet meer: hij staat in het
// kamp, en is de opslag tot het raadhuis er is (T.deVoorraad).
//
//   D.karren   de karren van het dorp, wezens in w.wezens (die van elke schuur, als hij af is)
//   p.vervoer  wat de regel van een drager weet: { drager: true, bewoner: p, tx, ty, lading, rit, klok, rust }, met zijn
//              eigen plek (tx, ty), want zonder beelden heeft een bewoner geen poppetje (js/bewoners.js); met beelden loopt
//              zijn poppetje (p.wezen) er achteraan, en staat het aan het eind van elk stuk waar de regel zegt
//   e.thuis    de schuur van de kar; g.kar is de kar van schuur g
// Een kar en p.vervoer heten samen een vervoerder (v), met:
//   v.lading   { wat: hoeveel } wat de kar of de drager nu draagt
//   v.rit      null, of { plan, fase, naar, wat, n, tot, doel }: `plan` 'halen' (fasen heen, laden, terug, lossen) of
//              'brengen' (opslag, inladen, brengen, afladen); `naar` het gebouw; bij brengen `wat` en hoeveel (`n`); `tot`
//              de dag waarop deze fase klaar is, `doel` waar hij dan staat
//   v.klok     tot welk moment (in dagen) hij is bijgewerkt
// Regels zonder scherm, dus te toetsen (test/kar.test.cjs, test/dragers.test.cjs).
(function (T) {
  'use strict';

  // Alle getallen in één blok (ook in de werkbank van de spelregels, js/opties.js).
  T.KAR_INSTELLINGEN = {
    // Wat niet gedragen of gereden wordt: het goud, dat de aanvoerder zelf betaalt. De rest van wat een gebouw maakt of
    // vraagt, gaat via een stapel en een drager of een kar (stap 3, A2; tot dan alleen het hout).
    nietVervoerd: ['goud'],
    // Zoveel neemt de kar per rit mee. Met de getallen van 14 okt rijdt hij binnen het bouwbereik drie tot vier ritten
    // per dag (een rit van 20 tegels heen is zo'n twee uur), en maakt een houthakker 2 hout per dag: één kar is ruim
    // genoeg voor een gehucht. Wil je hem eerder voelen, dan is dit het getal.
    lading: 8,
    // Zoveel draagt een drager per keer (vraag 184; Marcel, 23 okt: "Eén stuk, van alles", zoals de opperman van Knights
    // and Merchants). Hij loopt sneller dan de os, maar neemt een achtste mee: een drager is zo'n kwart kar.
    perDrager: 1,
    // Zo groot wordt een stapel bij een deur; dan maakt het gebouw niets meer tot de kar komt.
    stapelVol: 16,
    // Een stapel kleiner dan dit laat de kar liggen.
    minstens: 1,
    // Zoveel houdt een werkplaats bij zich van wat hij verwerkt (de zagerij zijn stammen); is de helft op, dan brengt de kar
    // bij, en een drager zodra er één stuk bij kan.
    voorraadIn: 8,
    // Zoveel dagen kost het laden of het lossen (0,01 is drie seconden op 1×, een kwartier in het dorp).
    laden: 0.01,
    // Vindt een kar of een drager niets te doen, dan kijkt hij zoveel later weer (een kwartier: op 1× zo'n drie seconden).
    rust: 1 / 96,
  };
  const IN = () => T.KAR_INSTELLINGEN;

  const som = (o) => {
    let n = 0;
    for (const k in o || {}) n += o[k];
    return n;
  };

  // ---------------------------------------------------------------------------------------------
  // De stapels
  // ---------------------------------------------------------------------------------------------

  // De karren van dit dorp (die van de schuren), en de vervoerders: de karren, en wat de regel weet van wie nu draagt
  // (p.vervoer; wie draagt, zegt T.dragersVan in js/bouwen.js).
  T.karrenVan = (D) => (D && D.karren) || [];
  T.vervoerdersVan = (D) => T.karrenVan(D).concat(T.dragersVan(D).map((p) => vervoerVan(D, p)));
  // Wordt er in dit dorp gedragen en gereden? In het lege begin, zodra het kamp op is (vraag 184): dan ligt wat er gemaakt
  // wordt eerst op een stapel, en brengen de dragers wat een bouwplaats nodig heeft.
  T.metVervoer = (D) => !!(D && D.begin && D.begin.kamp !== 'onderweg');
  // Gaat deze waar in dit dorp op een stapel?
  T.gaatMetVervoer = (D, wat) => T.metVervoer(D) && !IN().nietVervoerd.includes(wat);

  // Het gebouw waar wat hier gemaakt of gerooid wordt, op de stapel komt: een veld legt het bij zijn boerderij.
  const stapelGebouw = (g) => (g && T.isVeldSoort(g.soort) ? g.boerderij || null : g);

  // Wat gebouw g maakte, of wat er bij g gerooid werd: op zijn stapel als het met de kar gaat, anders meteen in de
  // voorraad. Een bouwplaats die het nog nodig heeft, neemt het eerst zelf (B2: "wat ze op de plek rooien, gaat eerst in
  // dat gebouw"). Eén weg voor alles wat een gebouw de voorraad in brengt. Wat het maakte (niet wat er gerooid werd,
  // `{ gerooid: true }`), telt in zijn briefje (T.telGemaakt, js/gebouwen.js; vraag 156).
  T.opStapel = function (D, g, wat, hoeveel, { gerooid = false } = {}) {
    const bij = stapelGebouw(g);
    if (!(hoeveel > 0)) return;
    if (!gerooid) T.telGemaakt(D, bij, wat, hoeveel);
    if (!bij || !T.gaatMetVervoer(D, wat)) {
      T.wijzigVoorraad(D, wat, hoeveel);
      return;
    }
    let rest = hoeveel;
    const B = bij.bouw;
    if (B && !bij.klaar && B.nodig && B.nodig[wat] > 0) {
      const erin = Math.min(rest, B.nodig[wat] - (B.er[wat] || 0));
      if (erin > 0) {
        B.er[wat] = (B.er[wat] || 0) + erin;
        rest -= erin;
      }
    }
    if (rest <= 1e-9) return;
    const s = bij.stapel || (bij.stapel = {});
    s[wat] = (s[wat] || 0) + rest;
  };

  // Hoeveel er op de stapel van g ligt, alles samen.
  T.stapelVan = (g) => som(g && g.stapel);
  // Hoeveel er nog op de stapel van g kan (Infinity zonder kar): de nachtlus van de gebouwen maakt niet meer dan dat.
  T.ruimteOpStapel = (D, g) => (T.metVervoer(D) ? Math.max(0, IN().stapelVol - T.stapelVan(g)) : Infinity);
  // Hoeveel er van `wat` op alle stapels van het dorp ligt (de raad, de balk, de toetsen).
  T.opDeStapels = function (D, wat) {
    let n = 0;
    for (const g of (D && D.gebouwen) || []) if (g.stapel) n += g.stapel[wat] || 0;
    return n;
  };

  // De tegel waar de stapel van g ligt, om hem te tekenen: naast de deur (links of rechts ervan, of erachter), op een
  // tegel waar je kunt staan; de deur zelf blijft vrij.
  T.stapelPlek = function (D, g) {
    if (g.soort === 'stapel') return { x: g.x, y: g.y }; // een losse stapel ligt op zijn eigen tegel (js/afbreken.js)
    const w = D.wereld;
    const deur = T.deurVan(w, g);
    const r = T.voetVanGebouw(g);
    const opDeVoet = (x, y) => x >= r.x && y >= r.y && x < r.x + r.b && y < r.y + r.h;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [1, 1], [-1, 1]]) {
      const x = deur.x + dx;
      const y = deur.y + dy;
      if (!opDeVoet(x, y) && T.isBegaanbaar(w, x, y)) return { x, y };
    }
    return deur;
  };

  // De stapels om te tekenen (js/tekenen.js): { x, y, wat, hoeveel, g } per gebouw met een stapel, met de waar waar het
  // meest van ligt. Op een bouwplaats telt ook het hout dat er al is maar nog niet verbouwd (je ziet het liggen).
  T.stapelsOp = function (D) {
    const uit = [];
    for (const g of (D && D.gebouwen) || []) {
      const ligt = { ...(g.stapel || {}) };
      const B = g.bouw;
      if (B && !g.klaar && B.nodig) {
        const deel = B.werk > 0 ? B.gedaan / B.werk : 1;
        for (const wat in B.nodig) ligt[wat] = (ligt[wat] || 0) + Math.max(0, (B.er[wat] || 0) - B.nodig[wat] * deel);
      }
      const n = som(ligt);
      if (n < 0.5) continue;
      let wat = null;
      for (const k in ligt) if (!wat || ligt[k] > ligt[wat]) wat = k;
      uit.push({ ...T.stapelPlek(D, g), wat, hoeveel: n, vol: n / IN().stapelVol, g });
    }
    return uit;
  };

  // ---------------------------------------------------------------------------------------------
  // Bouwen met de kar (stap 2)
  // ---------------------------------------------------------------------------------------------

  // Wat een gebouw kost, in wat je nu betaalt (`nu`) en wat de kar naar de bouwplaats brengt (`later`). Zonder kar, of als
  // de mensen niet zelf bouwen, betaal je alles nu.
  T.bouwKosten = function (D, kosten) {
    const nu = {};
    const later = {};
    const metKar = T.bouwenMetHanden(D) && T.metVervoer(D);
    for (const wat in kosten || {}) (metKar && T.gaatMetVervoer(D, wat) ? later : nu)[wat] = kosten[wat];
    return { nu, later };
  };

  // Een nieuwe bouwplaats (T.plaatsGebouw, js/gebouwen.js) vraagt wat de kar brengt.
  T.zetBouwNodig = function (g, later) {
    if (!g.bouw || !Object.keys(later).length) return;
    g.bouw.nodig = { ...later };
    g.bouw.er = {};
  };

  // Hoeveel van wat de bouwplaats nodig heeft er al is, van 0 tot 1 (1 als hij niets van de kar nodig heeft): zo ver
  // komen de bouwers (js/bouwen.js).
  T.bouwMateriaalDeel = function (g) {
    const B = g && g.bouw;
    if (!B || !B.nodig) return 1;
    const nodig = som(B.nodig);
    return nodig > 0 ? Math.min(1, som(B.er) / nodig) : 1;
  };

  // Wat er van `wat` naar g onderweg is, bij een kar of een drager die het al geladen heeft of gaat laden (`alle`: de
  // vervoerders, als je ze al hebt).
  function onderweg(D, g, wat, alle = T.vervoerdersVan(D)) {
    let n = 0;
    for (const e of alle) if (e.rit && e.rit.plan === 'brengen' && e.rit.naar === g && e.rit.wat === wat) n += e.rit.n;
    return n;
  }

  // Wat de bouwplaatsen samen nog van `wat` vragen, en wat nog niet op een kar ligt: de kolonist van de speeltest bouwt
  // niet meer dan er dan over is (gereedschap/speeltest/kolonist.js).
  T.nogTeBrengen = function (D, wat) {
    let n = 0;
    for (const g of (D && D.gebouwen) || []) {
      const B = g.bouw;
      if (B && !g.klaar && B.nodig && B.nodig[wat]) n += Math.max(0, B.nodig[wat] - (B.er[wat] || 0) - onderweg(D, g, wat));
    }
    return n;
  };

  // Wat de bouwplaats nog nodig heeft, meteen uit de voorraad, alsof de kar het bracht (het proefdorp, js/begin.js).
  T.brengMeteen = function (D, g) {
    const B = g.bouw;
    if (!B || !B.nodig) return;
    for (const wat in B.nodig) {
      const n = Math.max(0, B.nodig[wat] - (B.er[wat] || 0));
      T.wijzigVoorraad(D, wat, -n);
      B.er[wat] = B.nodig[wat];
    }
  };

  // Wat een werkplaats verwerkt: wat met de kar gaat, uit wat bij hem ligt (g.in), de rest uit de voorraad (de nachtlus,
  // js/gebouwen.js).
  T.verwerkVoorraad = (D, g, wat) => (T.gaatMetVervoer(D, wat) ? (g.in && g.in[wat]) || 0 : D.voorraad[wat] || 0);
  T.verwerk = function (D, g, wat, n) {
    if (!T.gaatMetVervoer(D, wat)) {
      T.wijzigVoorraad(D, wat, -n);
      return;
    }
    const i = g.in || (g.in = {});
    i[wat] = Math.max(0, (i[wat] || 0) - n);
  };

  // ---------------------------------------------------------------------------------------------
  // De kar
  // ---------------------------------------------------------------------------------------------

  // Een ossenkar op (x, y): een wezen op de kaart, dat in het tempo van de os rijdt (de huifkar van het begin, js/begin.js,
  // en de kar van een schuur).
  T.maakKar = function (D, x, y, naam, vel) {
    const e = T.maakDorpeling(0, x, y, 0, null);
    Object.assign(e, { soort: 'kar', naam, vel, kar: true, dorp: D, zaad: null, snelheid: T.BEGIN_INSTELLINGEN.karSnelheid });
    D.wereld.wezens.push(e);
    return e;
  };

  // De kar van een schuur gaat aan het werk (T.geefSchurenEenKar).
  T.karAanHetWerk = function (D, e) {
    if (!D.karren) D.karren = [];
    if (D.karren.includes(e)) return;
    Object.assign(e, { lading: {}, rit: null, klok: D.kalender ? D.kalender.dag : 0 });
    D.karren.push(e);
  };

  // Elke nacht, als de gebouwen van vandaag af zijn (T.tikGebouwenDag, js/gebouwen.js): een schuur die af is, krijgt zijn
  // kar (stap 4; Marcel: "c ja"), naast zijn deur.
  T.geefSchurenEenKar = function (D) {
    if (!T.metVervoer(D)) return;
    const w = D.wereld;
    for (const g of D.gebouwen) {
      const soort = T.GEBOUWEN[g.soort];
      if (!g.klaar || !soort || !soort.kar || (g.kar && w.wezens.includes(g.kar))) continue;
      const deur = T.deurVan(w, g);
      let plek = deur;
      for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, 1]]) {
        if (T.isBegaanbaar(w, deur.x + dx, deur.y + dy, { wezensBlokkeren: true })) {
          plek = { x: deur.x + dx, y: deur.y + dy };
          break;
        }
      }
      const e = T.maakKar(D, plek.x, plek.y, T.t('ox cart'), 'ossenkar-leeg');
      e.thuis = g;
      g.kar = e;
      T.karAanHetWerk(D, e);
      T.zeg(D, T.t('The {schuur} is ready: you can build around it, and it has its own ox cart.', { schuur: soort.naam }), 'goed');
    }
  };

  // Waar de kar laadt en lost: zijn schuur, en anders waar de voorraad ligt (T.deVoorraad). Als tegel, met `naast` als hij
  // naast de deur stopt.
  function thuisVan(D, e) {
    if (e.thuis && e.thuis.klaar && D.gebouwen.includes(e.thuis)) return { ...T.deurVan(D.wereld, e.thuis), naast: true };
    return T.deVoorraad(D);
  }
  // Waar de voorraad van het dorp ligt: de deur van het raadhuis (de eerste opslag die geen schuur is), en tot dat er is
  // de huifkar in het kamp (die rijdt niet meer, vraag 184: je laadt en lost ernaast); of null. Ook waar de mannen van de
  // heer halen wat hij nam (js/heer.js).
  T.deVoorraad = function (D) {
    const huis = D.gebouwen.find((g) => g.klaar && T.GEBOUWEN[g.soort] && T.GEBOUWEN[g.soort].opslag && !T.GEBOUWEN[g.soort].kar);
    if (huis) return { ...T.deurVan(D.wereld, huis), naast: true };
    const k = D.plek && D.plek.kamp;
    return k && k.kar ? { x: k.kar.x, y: k.kar.y, naast: true } : null;
  };
  // De opslag het dichtst bij tegel `bij`: waar de voorraad ligt, of een schuur die af is. Daar laadt en lost een drager.
  function opslagBij(D, bij) {
    let beste = T.deVoorraad(D);
    let d = beste ? T.afstand(beste, bij) : Infinity;
    for (const g of D.gebouwen) {
      const soort = T.GEBOUWEN[g.soort];
      if (!g.klaar || !soort || !soort.opslag) continue;
      const deur = T.deurVan(D.wereld, g);
      const a = T.afstand(deur, bij);
      if (a < d) {
        beste = { ...deur, naast: true };
        d = a;
      }
    }
    return beste;
  }
  // Waar e laadt en lost voor een rit naar gebouw g: een kar bij zijn eigen opslag, een drager bij de opslag die het
  // dichtst bij g is (of bij hemzelf, als g er niet meer is).
  const opslagVoor = (D, e, g) => (e.kar ? thuisVan(D, e) : opslagBij(D, g && D.gebouwen.includes(g) ? T.deurVan(D.wereld, g) : { x: e.tx, y: e.ty }));

  // Welke kar dit gebouw bedient: die met zijn opslag het dichtst bij zijn deur (Marcel: "c ja").
  function verantwoordelijk(D, g) {
    const deur = T.deurVan(D.wereld, g);
    let beste = null;
    let bij = Infinity;
    for (const e of T.karrenVan(D)) {
      const t = thuisVan(D, e);
      const d = t ? T.afstand(t, deur) : Infinity;
      if (d < bij) {
        beste = e;
        bij = d;
      }
    }
    return beste;
  }

  // Een drager (p.vervoer) of een kar.
  const isDrager = (v) => !!v.drager;
  // Zoveel neemt hij per keer mee: een kar zijn lading, een drager één stuk.
  const ladingVan = (v) => (v.kar ? IN().lading : IN().perDrager);
  // Het poppetje dat je ziet: de kar zelf, of dat van de drager als het er is (zonder beelden is het er niet).
  const wezenVan = (D, v) => (isDrager(v) ? (v.bewoner.wezen && !v.bewoner.wezen.dood ? v.bewoner.wezen : null) : v);
  // Hoe snel hij gaat, in tegels per seconde: de kar in het tempo van de os, een drager in dat van zijn leeftijd (js/bewoners.js).
  const snelheidVan = (v) => (isDrager(v) ? T.BEWONERS_INSTELLINGEN[T.LEEFTIJDEN[v.bewoner.leeftijd].snelheid] : T.snelheidVan(v)) || 1;

  // Wat de regel van drager p weet (p.vervoer); wie voor het eerst draagt, begint bij zijn deur.
  function vervoerVan(D, p) {
    if (!p.vervoer) {
      const deur = T.deurVanBewoner(D, p);
      p.vervoer = { drager: true, bewoner: p, tx: deur.x, ty: deur.y, lading: {}, rit: null, klok: null, rust: false };
    }
    return p.vervoer;
  }

  // De werktijd van de vervoerders op de dag van moment t, in dagen: { begin, eind }.
  function werktijd(t) {
    const d = T.dagindeling(t);
    const dag = Math.floor(t);
    return { begin: dag + d.werkBegin / 24, eind: dag + d.werkEind / 24 };
  }
  // Het eerste moment vanaf t waarop een rit mag beginnen.
  function vrijVanaf(t) {
    const w = werktijd(t);
    if (t < w.begin) return w.begin;
    if (t < w.eind) return t;
    return werktijd(Math.floor(t) + 1).begin;
  }

  // De weg van kar of drager naar `doel` ({ x, y, naast }), en hoe lang hij erover doet (in dagen), of null als er geen weg
  // is. Een kar rijdt over een weg sneller (T.karKostOp, js/wegen.js), en zoekt die op; een mens loopt overal even snel
  // (de wegen, c1).
  function weg(D, e, doel) {
    const w = D.wereld;
    const van = { x: e.tx, y: e.ty };
    const kar = !!e.kar;
    const pad = T.zoekRoute(w, van, doel, { naast: !!doel.naast, kar });
    if (!pad) return null;
    let lengte = 0;
    let vorig = van;
    for (const t of pad) {
      lengte += Math.hypot(t.x - vorig.x, t.y - vorig.y) * (kar ? T.karKostOp(w, t.x, t.y) : 1);
      vorig = t;
    }
    const eind = pad.length ? pad[pad.length - 1] : van;
    return { pad, eind: { x: eind.x, y: eind.y }, duur: lengte / snelheidVan(e) / T.DAG_LENGTE };
  }

  // Het wezen staat waar de regel zegt dat de kar is (aan het eind van een stuk): kwam hij er in de beelden niet, of
  // speelden er geen beelden, dan staat hij er nu. Staat daar iemand, dan op de dichtste vrije tegel ernaast, en anders
  // blijft hij waar hij is: nooit twee op één tegel.
  function staOp(D, e, t) {
    if (e.tx === t.x && e.ty === t.y && !e.onderweg) {
      e.pad = [];
      return;
    }
    const w = D.wereld;
    const vrij = (x, y) => T.isBegaanbaar(w, x, y, { wezensBlokkeren: true, wie: e });
    let plek = vrij(t.x, t.y) ? t : null;
    for (let r = 1; r <= 2 && !plek; r++) {
      for (let dy = -r; dy <= r && !plek; dy++) {
        for (let dx = -r; dx <= r && !plek; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) === r && vrij(t.x + dx, t.y + dy)) plek = { x: t.x + dx, y: t.y + dy };
        }
      }
    }
    if (!plek) plek = { x: e.tx, y: e.ty }; // (de tegel waar hij heen stapte, is van hem)
    Object.assign(e, { x: plek.x, y: plek.y, tx: plek.x, ty: plek.y, pad: [], onderweg: false });
    e.padDoel = null;
  }
  // Aan het eind van een stuk: een drager staat waar de regel zegt (en zijn poppetje, als het er is, zo dicht mogelijk
  // bij); een kar zoals hierboven.
  function staVervoerderOp(D, v, t) {
    if (!isDrager(v)) return staOp(D, v, t);
    v.tx = t.x;
    v.ty = t.y;
    const e = wezenVan(D, v);
    if (e) staOp(D, e, t);
  }

  // Zijn vel: de huifkar blijft de huifkar (js/begin.js); de ossenkar is leeg, of geladen met wat hij het meest draagt:
  // stammen, stenen, spullen, of anders zakken (gereedschap/pixelart/ossenkar.cjs).
  const LADING_VEL = {
    hout: 'ossenkar-hout', planken: 'ossenkar-hout', steen: 'ossenkar-stenen', klei: 'ossenkar-stenen', kalk: 'ossenkar-stenen',
    ijzer: 'ossenkar-stenen', gereedschap: 'ossenkar-spullen', vaten: 'ossenkar-spullen',
    laken: 'ossenkar-spullen', huiden: 'ossenkar-spullen', leer: 'ossenkar-spullen', riet: 'ossenkar-spullen',
    // de stukken van de wapenmaker (js/soldaten.js)
    speren: 'ossenkar-spullen', pieken: 'ossenkar-spullen', zwaarden: 'ossenkar-spullen', schilden: 'ossenkar-spullen',
    bogen: 'ossenkar-spullen', kruisbogen: 'ossenkar-spullen', harnassen: 'ossenkar-spullen',
  };
  // Een drager draagt wat hij heeft zoals de figuren het kunnen (`e.draagt`, js/sprites.js): tot er dragers met een plank,
  // een stam of een steen zijn (vraag 184, bij Marcel), het hout als bundel, het graan als schoof, en de rest in een mand.
  const DRAAGT = { hout: 'bundel', planken: 'bundel', riet: 'bundel', graan: 'schoof' };
  function zetVel(e, D) {
    let meest = null;
    for (const wat in e.lading || {}) if (e.lading[wat] > 1e-6 && (!meest || e.lading[wat] > e.lading[meest])) meest = wat;
    if (isDrager(e)) {
      const poppetje = wezenVan(D, e);
      if (poppetje) poppetje.draagt = meest ? DRAAGT[meest] || 'mand' : null;
      return;
    }
    if (e.vel === 'huifkar') return;
    e.vel = meest ? LADING_VEL[meest] || 'ossenkar-zakken' : 'ossenkar-leeg';
  }
  T.zetKarVel = (e) => zetVel(e, null);

  const RIJDEN = new Set(['heen', 'terug', 'opslag', 'brengen']);

  // Een drager met een rit is bezig (e.werkt, zoals wie op zijn land werkt, js/veldwerk.js): hij dwaalt niet, praat niet
  // en gaat niet opzij. Zonder rit neemt het ritme van de dag het weer over.
  function zetBezig(D, v) {
    const e = isDrager(v) ? wezenVan(D, v) : null;
    if (!e) return;
    if (v.rit) {
      e.binnen = false;
      const wt = e.werkt;
      if (!wt || wt.soort !== 'vervoer' || wt.x !== v.rit.doel.x || wt.y !== v.rit.doel.y) e.werkt = { soort: 'vervoer', x: v.rit.doel.x, y: v.rit.doel.y, tot: null, rust: false };
    } else if (e.werkt && e.werkt.soort === 'vervoer') T.stopWerk(e);
  }

  // Een stuk van de rit begint op moment t: rijden naar `doel`, of op de plek laden of lossen. Geeft false als er geen weg
  // is.
  function begin(D, e, rit, fase, doel, t, metBeeld) {
    if (RIJDEN.has(fase)) {
      const r = weg(D, e, doel);
      if (!r) return false;
      e.rit = { ...rit, fase, tot: t + r.duur, doel: r.eind };
      if (metBeeld) loopMee(D, e, r, doel);
    } else e.rit = { ...rit, fase, tot: t + IN().laden, doel: { x: e.tx, y: e.ty } };
    zetBezig(D, e);
    return true;
  }
  const deurDoel = (D, g) => ({ ...T.deurVan(D.wereld, g), naast: true });
  // Met beelden loopt het poppetje mee: de kar rijdt de weg van de regel; het poppetje van een drager ook, of, als het niet
  // stond waar de regel hem laat beginnen (het dwaalde terwijl hij niets te dragen had), zijn eigen weg naar hetzelfde doel.
  function loopMee(D, v, r, doel) {
    const e = wezenVan(D, v);
    if (!e) return;
    const pad = e.tx === v.tx && e.ty === v.ty ? r.pad : T.zoekRoute(D.wereld, { x: e.tx, y: e.ty }, doel, { naast: !!doel.naast, kar: !!v.kar });
    if (pad && pad.length) T.geefRoute(e, pad, doel);
  }

  // Welke waren een bouwplaats (wat hij nodig heeft) of een werkplaats (wat hij verwerkt; T.watErIngaat, js/gebouwen.js:
  // de wapenmaker alleen voor wat er gevraagd wordt) gebracht kan willen.
  function watHetVraagt(D, g) {
    if (g.bouw && !g.klaar) return Object.keys(g.bouw.nodig || {});
    return g.klaar ? Object.keys(T.watErIngaat(D, g)).filter((wat) => T.gaatMetVervoer(D, wat)) : [];
  }

  // Wat een bouwplaats of een werkplaats nog van `wat` wil, bovenop wat er is en wat onderweg is; 0 als niets. Een
  // werkplaats vraagt pas als er een vracht bij kan (`lading`: een kar als de helft op is, een drager voor één stuk).
  function vraag(D, g, wat, lading, alle) {
    const B = g.bouw;
    if (B && !g.klaar) {
      // eerst rooien: het hout van de plek gaat er eerst in (bij het egaliseren mag het hout al komen, js/bouwen.js)
      if ((g.wachtOpRooien && !g.egaliseert) || !B.nodig || !B.nodig[wat]) return 0;
      return Math.max(0, B.nodig[wat] - (B.er[wat] || 0) - onderweg(D, g, wat, alle));
    }
    if (!g.klaar) return 0; // (wat erin gaat, gaf watHetVraagt al)
    const rest = IN().voorraadIn - ((g.in && g.in[wat]) || 0) - onderweg(D, g, wat, alle);
    return rest >= Math.min(IN().voorraadIn / 2, lading) ? rest : 0;
  }

  // Wat andere vervoerders al van de stapel van g komen halen: wie erheen gaat of er laadt, neemt mee wat hij nog kan dragen.
  function alGehaald(D, g, e, alle) {
    let n = 0;
    for (const k of alle) {
      const R = k.rit;
      if (k !== e && R && R.plan === 'halen' && R.naar === g && (R.fase === 'heen' || R.fase === 'laden')) n += ladingVan(k) - som(k.lading);
    }
    return n;
  }

  // Wat de kar uit de opslag mag meenemen: van het graan niet wat de boeren apart houden om te zaaien (T.zaaigraanApart,
  // js/akkers.js), zoals de molen het ook niet nam.
  const beschikbaar = (D, wat, t) => Math.max(0, (D.voorraad[wat] || 0) - (wat === 'graan' ? T.zaaigraanApart(D, Math.floor(t)) : 0));

  // Wat de kar of de drager nu gaat doen, of null. Eerst brengen, naar de bouwplaatsen in de volgorde waarin je ze neerzette
  // en dan naar de werkplaatsen, als er genoeg in de opslag ligt voor een goede vracht; anders halen, de grootste stapel
  // (min wat anderen er al komen halen); en is er geen stapel, dan toch brengen wat er is. Een kar bedient, als er meer
  // karren zijn, de gebouwen bij zijn eigen opslag; een drager elk gebouw.
  function kiesRit(D, e, t, alle) {
    let half = null;
    const lading = ladingVan(e);
    const bouwplaatsenEerst = [...D.gebouwen].sort((a, b) => (a.bouw && !a.klaar ? 0 : 1) - (b.bouw && !b.klaar ? 0 : 1));
    const vanMij = (g) => !e.kar || T.karrenVan(D).length < 2 || verantwoordelijk(D, g) === e;
    for (const g of bouwplaatsenEerst) {
      if ((g.karKanNietTot || 0) > t) continue;
      const vraagt = watHetVraagt(D, g);
      if (!vraagt.length || !vanMij(g)) continue;
      for (const wat of vraagt) {
        const wil = vraag(D, g, wat, lading, alle);
        if (wil <= 1e-6) continue;
        const ligt = beschikbaar(D, wat, t);
        const n = Math.min(lading, wil, ligt);
        if (n >= Math.min(lading, wil) - 1e-9 && n > 0) return { plan: 'brengen', naar: g, wat, n };
        if (!half && n >= IN().minstens) half = { plan: 'brengen', naar: g, wat, n };
      }
    }
    let beste = null;
    for (const g of D.gebouwen) {
      if (!g.stapel || (g.karKanNietTot || 0) > t || !vanMij(g)) continue;
      const n = T.stapelVan(g) - alGehaald(D, g, e, alle);
      if (n < IN().minstens) continue;
      if (!beste || n > beste.n) beste = { g, n };
    }
    if (beste) return { plan: 'halen', naar: beste.g };
    return half;
  }

  // Een rit begint: het eerste stuk.
  function beginRit(D, e, rit, t, metBeeld) {
    if (rit.plan === 'halen') return begin(D, e, rit, 'heen', deurDoel(D, rit.naar), t, metBeeld);
    const o = opslagVoor(D, e, rit.naar);
    return !!o && begin(D, e, rit, 'opslag', o, t, metBeeld);
  }

  // Een stuk is af: wat er dan gebeurt, en het volgende stuk.
  function klaarMet(D, e, metBeeld) {
    const R = e.rit;
    const t = R.tot;
    const g = R.naar;
    const erNog = g && D.gebouwen.includes(g);
    staVervoerderOp(D, e, R.doel);
    const verder = (fase, doel) => {
      if (begin(D, e, R, fase, doel, t, metBeeld)) return;
      e.rit = null;
      if (erNog && (fase === 'heen' || fase === 'brengen')) g.karKanNietTot = t + 1; // geen weg erheen: een dag niet
    };
    switch (R.fase) {
      case 'heen':
        return verder('laden');
      case 'laden': {
        // wat erop past, van de stapel (is het gebouw er niet meer, dan is er niets)
        if (erNog && g.stapel) {
          let ruimte = ladingVan(e) - som(e.lading);
          for (const wat of Object.keys(g.stapel)) {
            // een stuk van de wapenmaker alleen heel (js/soldaten.js): een halve speer kan niemand pakken
            const n = T.isStuk(wat) ? Math.floor(Math.min(ruimte, g.stapel[wat]) + 1e-9) : Math.min(ruimte, g.stapel[wat]);
            if (n <= 0) continue;
            e.lading[wat] = (e.lading[wat] || 0) + n;
            g.stapel[wat] -= n;
            if (g.stapel[wat] < 1e-6) delete g.stapel[wat];
            ruimte -= n;
          }
          // een losse stapel van een afgebroken gebouw (js/afbreken.js): is hij leeg, dan is hij weg
          if (g.soort === 'stapel' && !T.stapelVan(g)) D.gebouwen.splice(D.gebouwen.indexOf(g), 1);
        }
        zetVel(e, D);
        const o = opslagVoor(D, e, g);
        return o ? verder('terug', o) : (e.rit = null);
      }
      case 'terug':
        return verder('lossen');
      case 'lossen':
        for (const wat in e.lading) T.wijzigVoorraad(D, wat, e.lading[wat]);
        e.lading = {};
        zetVel(e, D);
        e.rit = null;
        return;
      case 'opslag':
        return verder('inladen');
      case 'inladen': {
        // wat er nu nog ligt (er kan intussen gestookt zijn), tot wat de plaats nog vraagt
        const n = erNog ? Math.min(R.n, beschikbaar(D, R.wat, t)) : 0;
        if (n <= 0) {
          e.rit = null;
          return;
        }
        T.wijzigVoorraad(D, R.wat, -n);
        e.lading[R.wat] = (e.lading[R.wat] || 0) + n;
        R.n = n;
        zetVel(e, D);
        return verder('brengen', deurDoel(D, g));
      }
      case 'brengen':
        return verder('afladen');
      case 'afladen': {
        // in de bouwplaats tot wat hij vraagt, of bij de werkplaats; wat over is (de plaats had het intussen al), blijft
        // op de kar en gaat terug naar de opslag
        const wat = R.wat;
        const heeft = e.lading[wat] || 0;
        let n = 0;
        if (erNog && g.bouw && !g.klaar && g.bouw.nodig) {
          n = Math.min(heeft, Math.max(0, g.bouw.nodig[wat] - (g.bouw.er[wat] || 0)));
          g.bouw.er[wat] = (g.bouw.er[wat] || 0) + n;
        } else if (erNog && g.klaar) {
          n = heeft;
          const i = g.in || (g.in = {});
          i[wat] = (i[wat] || 0) + n;
        }
        e.lading[wat] = heeft - n;
        if (e.lading[wat] < 1e-6) delete e.lading[wat];
        zetVel(e, D);
        e.rit = null;
        // wie het bouwmateriaal bracht waar niemand bouwt, blijft er bouwen (js/bouwen.js)
        if (erNog && isDrager(e) && !som(e.lading)) T.blijftBouwen(D, e.bewoner, g, t);
        return;
      }
      default:
        e.rit = null;
    }
  }

  // Het volgende moment (in dagen) waarop er voor vervoerder v iets gebeurt: het eind van zijn stuk, of wanneer hij weer
  // kijkt of er wat te doen is.
  const volgendMoment = (v) => (v.rit ? v.rit.tot : vrijVanaf(v.klok));

  // Eén stap van vervoerder v, op zijn volgende moment: een stuk is af, of hij kiest wat hij gaat doen. `metBeeld`: de
  // beelden spelen, dus het poppetje krijgt zijn weg.
  function stap(D, v, metBeeld, alle) {
    if (v.rit) {
      v.klok = v.rit.tot;
      klaarMet(D, v, metBeeld);
      return;
    }
    const t = vrijVanaf(v.klok);
    v.klok = t;
    // Nog iets bij zich (een rit die halverwege ophield): eerst naar de opslag.
    if (som(v.lading) > 0) {
      const o = opslagVoor(D, v, null);
      if (o && begin(D, v, { plan: 'halen', naar: null }, 'terug', o, t, metBeeld)) return;
    }
    const rit = kiesRit(D, v, t, alle);
    if (rit && beginRit(D, v, rit, t, metBeeld)) return;
    // geen weg naar die plaats: een dag laat hij hem liggen (en hij kiest meteen opnieuw)
    if (rit) {
      rit.naar.karKanNietTot = t + 1;
      return;
    }
    // Niets te doen: dan wacht een kar bij zijn opslag; een drager gaat zijn gang (het ritme van de dag). Over `rust` kijkt
    // hij weer.
    const thuis = v.kar ? thuisVan(D, v) : null;
    if (thuis && T.afstand({ x: v.tx, y: v.ty }, thuis) > 2 && begin(D, v, { plan: 'halen', naar: null }, 'terug', thuis, t, metBeeld)) return;
    v.klok = t + IN().rust;
  }

  // De karren en de dragers bijwerken tot moment `tot` (in dagen), op één klok: steeds de stap van wie het eerst iets
  // te doen heeft. Zo kiest elk op zijn eigen moment met wat de anderen dan doen, en maakt het niet uit hoe vaak dit
  // gebeurt: elk beeld, of één keer per nacht (de toetsen), komt op hetzelfde uit.
  function werkVervoerBij(D, tot, metBeeld, dragers) {
    const alle = T.karrenVan(D).filter((e) => D.wereld.wezens.includes(e)).concat(dragers.map((p) => vervoerVan(D, p)));
    // Wie (weer) gaat dragen, begint waar het vervoer de vorige keer was bijgewerkt (D.vervoerKlok: overdag het beeld van
    // daarnet, zonder beelden de nacht ervoor, als het dorp de dag verdeelt, T.kiesBouwers), bij zijn deur: wat hij
    // intussen deed, weet de regel niet.
    const vorige = D.vervoerKlok != null ? Math.min(D.vervoerKlok, tot) : tot;
    for (const v of alle) {
      if (!v.lading) v.lading = {};
      if (v.klok == null) v.klok = isDrager(v) ? vorige : tot;
      if (v.rust) {
        const deur = T.deurVanBewoner(D, v.bewoner);
        Object.assign(v, { tx: deur.x, ty: deur.y, klok: Math.max(v.klok, vorige), rust: false });
      }
    }
    const volgend = new Map(alle.map((v) => [v, volgendMoment(v)]));
    for (let veilig = 0; veilig < 20000 && volgend.size; veilig++) {
      let v = null;
      let m = Infinity;
      for (const [k, t] of volgend) {
        if (t < m) {
          m = t;
          v = k;
        }
      }
      if (m > tot) break;
      const naar = v.rit && v.rit.naar;
      stap(D, v, metBeeld, alle);
      // wie bleef bouwen (T.blijftBouwen, js/bouwen.js), draagt niet meer
      if (isDrager(v) && naar && v.bewoner.bouwt === naar) volgend.delete(v);
      else volgend.set(v, volgendMoment(v));
    }
    for (const v of alle) zetBezig(D, v);
    D.vervoerKlok = tot;
  }

  // Wie droeg maar het nu niet doet (hij bouwt, werkt, schuilt): geen rit meer, en als hij weer gaat dragen, begint hij
  // opnieuw (werkVervoerBij). Wat hij nog bij zich had (hij moest vluchten), brengt hij 's nachts thuis (`thuisbrengen`).
  function rustWieNietDraagt(D, dragers, thuisbrengen) {
    const draagt = new Set(dragers);
    for (const p of (D.bewoners && D.bewoners.mensen) || []) {
      const v = p.vervoer;
      if (!v || draagt.has(p)) continue;
      if (!v.rust) {
        Object.assign(v, { rit: null, rust: true });
        zetBezig(D, v);
      }
      if (thuisbrengen && som(v.lading) > 0) {
        for (const wat in v.lading) T.wijzigVoorraad(D, wat, v.lading[wat]);
        v.lading = {};
        zetVel(v, D);
      }
    }
  }

  // Wat de kar doet, voor bij de muis (js/verkennen.js).
  T.karTekst = function (D, e) {
    if (e.vanDeHeer) return T.heerWagenTekst(D, e); // de wagen van de heer (js/heer.js)
    if (!T.karrenVan(D).includes(e)) {
      return D.gebouwen.some((g) => g.soort === 'raadhuis' && g.klaar)
        ? T.t('The covered wagon that brought you here')
        : T.t('The covered wagon: your stores, until the town hall is ready');
    }
    const kar = T.hoofdletter(e.naam);
    const R = e.rit;
    const gebouw = R && R.naar && T.GEBOUWEN[R.naar.soort] ? T.GEBOUWEN[R.naar.soort].naam : null;
    if (R && R.fase === 'heen' && gebouw) return T.t('{kar}, on its way to the stack at the {gebouw}', { kar, gebouw });
    if (R && R.fase === 'laden' && gebouw) return T.t('{kar}, loading at the {gebouw}', { kar, gebouw });
    if (R && R.plan === 'brengen' && gebouw) {
      const vracht = T.hoeveel(Math.round(R.n), R.wat);
      if (R.fase === 'opslag' || R.fase === 'inladen') return T.t('{kar}, fetching {vracht} from the stores for the {gebouw}', { kar, vracht, gebouw });
      return T.t('{kar}, bringing {vracht} to the {gebouw}', { kar, vracht, gebouw });
    }
    const lading = Object.keys(e.lading || {}).filter((wat) => e.lading[wat] >= 0.5).map((wat) => T.hoeveel(Math.round(e.lading[wat]), wat));
    if (lading.length) return T.t('{kar}, bringing {lading} to the stores', { kar, lading: lading.join(', ') });
    if (R && R.fase === 'terug') return T.t('{kar}, on its way back to the stores', { kar });
    return T.t('{kar}, waiting for a stack to fetch', { kar });
  };

  // Wat een drager doet, voor bij de muis (T.overBewonerTekst, js/bewoners.js), of '' als hij niet draagt.
  T.dragerTekst = function (D, p) {
    const v = p.vervoer;
    if (!v || v.rust || !T.dragersVan(D).includes(p)) return '';
    const R = v.rit;
    const gebouw = R && R.naar && T.GEBOUWEN[R.naar.soort] ? T.GEBOUWEN[R.naar.soort].naam : null;
    const vracht = Object.keys(v.lading).filter((wat) => v.lading[wat] > 1e-6).map((wat) => T.hoeveel(Math.max(1, Math.round(v.lading[wat])), wat)).join(', ');
    if (R && R.plan === 'brengen' && gebouw) {
      if (R.fase === 'opslag' || R.fase === 'inladen') return T.t('fetches {vracht} from the stores for the {gebouw}', { vracht: T.hoeveel(Math.max(1, Math.round(R.n)), R.wat), gebouw });
      return T.t('carries {vracht} to the {gebouw}', { vracht, gebouw });
    }
    if (R && (R.fase === 'heen' || R.fase === 'laden') && gebouw) return T.t('goes to fetch what lies at the {gebouw}', { gebouw });
    if (vracht) return T.t('carries {vracht} to the stores', { vracht });
    return T.t('carries what needs carrying');
  };

  // Elk beeld (T.werkDorpBij, js/dorp.js): de karren en de dragers tot nu.
  T.werkKarBij = function (S, D) {
    if (!D.kalender) return;
    const nu = D.kalender.dag;
    const dragers = T.dragersVan(D);
    werkVervoerBij(D, nu, true, dragers);
    rustWieNietDraagt(D, dragers, false);
  };

  // Elke nacht, als eerste (T.tikGebouwenDag, js/gebouwen.js): wat de karren en de dragers gisteren nog deden, tot
  // middernacht. Met beelden is dat al gebeurd; in de toetsen gebeurt het hier.
  T.tikKarDag = function (D, dag) {
    const dragers = T.dragersVan(D);
    werkVervoerBij(D, dag, false, dragers);
    rustWieNietDraagt(D, dragers, true);
  };
})(globalThis.Spel = globalThis.Spel || {});
