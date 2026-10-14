// De ossenkar (werklijst C; Marcel, 11 okt: "Misschien dat grondstoffen worden opgehaald met een kar?", en op het plan van
// 14 okt: "A2, B2, C1, D2, E2"): wat een gebouw maakt, ligt op een stapel bij zijn deur tot de kar het haalt, en telt pas
// in de voorraad als het in de opslag is (het huis van de schout; tot dat er is, de plek van de kar in het kamp); en wat
// een bouwplaats of een werkplaats nodig heeft, brengt de kar uit de opslag. Dat geldt voor alles behalve het goud
// (`nietMetDeKar` hieronder; stap 3, A2). Wat niet van een gebouw komt, gaat meteen de voorraad in: wat het vee geeft (de
// wol, de melk en de kaas, het vlees van het slachten, de mest; Marcel, 14 okt: "c ja"), het sprokkelhout, en wat de
// marskramer brengt.
//
// De stapel ligt op het gebouw: g.stapel = { hout: 6 }. Een veld legt zijn hout op de stapel van zijn boerderij. Is een
// stapel `stapelVol`, dan maakt het gebouw niets meer (T.ruimteOpStapel, js/gebouwen.js): zo zie je waar het stokt.
//
// Bouwen (stap 2, B2, zoals in The Settlers): je zet neer wanneer je wilt en betaalt alleen wat niet met de kar gaat (het
// goud, T.bouwKosten); wat wel met de kar gaat, is wat de bouwplaats nodig heeft (g.bouw.nodig), en wat er is, ligt in
// g.bouw.er. De bouwers komen zo ver als het hout reikt (T.bouwMateriaalDeel, js/bouwen.js), en wat ze op de plek rooien,
// gaat eerst in het gebouw (T.opStapel). Een werkplaats die iets verwerkt dat met de kar gaat (de timmerman zijn hout),
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
//   D.karren   de karren van het dorp, wezens in w.wezens (de ossenkar, D.begin.kar, zodra het kamp op is; en die van
//              elke schuur, als hij af is)
//   e.thuis    de schuur van de kar (null: het huis van de schout, en tot dat er is de plek van de kar in het kamp);
//              g.kar is de kar van schuur g
//   e.lading   { wat: hoeveel } wat de kar nu draagt
//   e.rit      null, of { plan, fase, naar, wat, n, tot, doel }: `plan` 'halen' (fasen heen, laden, terug, lossen) of
//              'brengen' (opslag, inladen, brengen, afladen); `naar` het gebouw; bij brengen `wat` en hoeveel (`n`); `tot`
//              de dag waarop deze fase klaar is, `doel` waar hij dan staat
//   e.klok     tot welk moment (in dagen) de kar is bijgewerkt
// Regels zonder scherm, dus te toetsen (test/kar.test.cjs).
(function (T) {
  'use strict';

  // Alle getallen in één blok (ook in de werkbank van de spelregels, js/opties.js).
  T.KAR_INSTELLINGEN = {
    // Wat niet met de kar gaat: het goud, dat de schout zelf betaalt. De rest van wat een gebouw maakt of vraagt, gaat
    // met de kar (stap 3, A2; tot dan alleen het hout).
    nietMetDeKar: ['goud'],
    // Zoveel neemt de kar per rit mee. Met de getallen van 14 okt rijdt hij binnen het bouwbereik drie tot vier ritten
    // per dag (een rit van 20 tegels heen is zo'n twee uur), en maakt een houthakker 2 hout per dag: één kar is ruim
    // genoeg voor een gehucht. Wil je hem eerder voelen, dan is dit het getal.
    lading: 8,
    // Zo groot wordt een stapel bij een deur; dan maakt het gebouw niets meer tot de kar komt.
    stapelVol: 16,
    // Een stapel kleiner dan dit laat de kar liggen.
    minstens: 1,
    // Zoveel houdt een werkplaats bij zich van wat hij verwerkt (de timmerman zijn hout); is de helft op, dan brengt de kar
    // bij.
    voorraadIn: 8,
    // Zoveel dagen kost het laden of het lossen (0,01 is drie seconden op 1×, een kwartier in het dorp).
    laden: 0.01,
    // Vindt de kar niets te doen, dan kijkt hij zoveel later weer (een half uur).
    rust: 1 / 48,
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

  // Heeft dit dorp een kar die haalt? Dan ligt wat er gemaakt wordt eerst op een stapel.
  T.karrenVan = (D) => (D && D.karren) || [];
  T.metDeKar = (D) => T.karrenVan(D).length > 0;
  // Gaat deze waar in dit dorp op een stapel?
  T.gaatMetDeKar = (D, wat) => T.metDeKar(D) && !IN().nietMetDeKar.includes(wat);

  // Het gebouw waar wat hier gemaakt of gerooid wordt, op de stapel komt: een veld legt het bij zijn boerderij.
  const stapelGebouw = (g) => (g && T.isVeldSoort(g.soort) ? g.boerderij || null : g);

  // Wat gebouw g maakte, of wat er bij g gerooid werd: op zijn stapel als het met de kar gaat, anders meteen in de
  // voorraad. Een bouwplaats die het nog nodig heeft, neemt het eerst zelf (B2: "wat ze op de plek rooien, gaat eerst in
  // dat gebouw"). Eén weg voor alles wat een gebouw de voorraad in brengt.
  T.opStapel = function (D, g, wat, hoeveel) {
    const bij = stapelGebouw(g);
    if (!(hoeveel > 0)) return;
    if (!bij || !T.gaatMetDeKar(D, wat)) {
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
  T.ruimteOpStapel = (D, g) => (T.metDeKar(D) ? Math.max(0, IN().stapelVol - T.stapelVan(g)) : Infinity);
  // Hoeveel er van `wat` op alle stapels van het dorp ligt (de raad, de balk, de toetsen).
  T.opDeStapels = function (D, wat) {
    let n = 0;
    for (const g of (D && D.gebouwen) || []) if (g.stapel) n += g.stapel[wat] || 0;
    return n;
  };

  // De tegel waar de stapel van g ligt, om hem te tekenen: naast de deur (links of rechts ervan, of erachter), op een
  // tegel waar je kunt staan; de deur zelf blijft vrij.
  T.stapelPlek = function (D, g) {
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
    const metKar = T.bouwenMetHanden(D) && T.metDeKar(D);
    for (const wat in kosten || {}) (metKar && T.gaatMetDeKar(D, wat) ? later : nu)[wat] = kosten[wat];
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

  // Wat er van `wat` naar g onderweg is, op een kar die het al geladen heeft of gaat laden.
  function onderweg(D, g, wat) {
    let n = 0;
    for (const e of T.karrenVan(D)) if (e.rit && e.rit.plan === 'brengen' && e.rit.naar === g && e.rit.wat === wat) n += e.rit.n;
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

  // De bouwplaatsen die vandaag hout krijgen: wat de opslag heeft en wat al op een kar ligt, verdeeld in de volgorde waarin
  // je ze neerzette, zoals de kar ze afgaat (kiesRit). Wie bouwt, gaat 's ochtends ook naar een plaats die nog wacht maar
  // vandaag hout krijgt (T.kiesBouwers, js/bouwen.js): ze bouwen zodra de kar er is.
  T.krijgtVandaagHout = function (D) {
    const krijgt = new Set();
    const ligt = {};
    for (const g of D.gebouwen) {
      const B = g.bouw;
      if (!B || g.klaar || !B.nodig) continue;
      let alles = true;
      for (const wat in B.nodig) {
        const rest = Math.max(0, B.nodig[wat] - (B.er[wat] || 0) - onderweg(D, g, wat));
        if (rest <= 1e-6) continue;
        if (!(wat in ligt)) ligt[wat] = D.voorraad[wat] || 0;
        if (!(ligt[wat] >= IN().minstens)) alles = false;
        ligt[wat] = Math.max(0, ligt[wat] - rest);
      }
      if (alles) krijgt.add(g);
    }
    return krijgt;
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
  T.verwerkVoorraad = (D, g, wat) => (T.gaatMetDeKar(D, wat) ? (g.in && g.in[wat]) || 0 : D.voorraad[wat] || 0);
  T.verwerk = function (D, g, wat, n) {
    if (!T.gaatMetDeKar(D, wat)) {
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
    Object.assign(e, { soort: 'kar', naam, vel, kar: true, zaad: null, snelheid: T.BEGIN_INSTELLINGEN.karSnelheid });
    D.wereld.wezens.push(e);
    return e;
  };

  // De kar gaat aan het werk (T.zetKampOp, js/begin.js): het kamp staat, en wat hij bracht is uitgeladen.
  T.karAanHetWerk = function (D, e) {
    if (!D.karren) D.karren = [];
    if (D.karren.includes(e)) return;
    Object.assign(e, { lading: {}, rit: null, klok: D.kalender ? D.kalender.dag : 0 });
    D.karren.push(e);
  };

  // Elke nacht, als de gebouwen van vandaag af zijn (T.tikGebouwenDag, js/gebouwen.js): een schuur die af is, krijgt zijn
  // kar (stap 4; Marcel: "c ja"), naast zijn deur.
  T.geefSchurenEenKar = function (D) {
    if (!T.metDeKar(D)) return;
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

  // Waar de kar laadt en lost: zijn schuur, of (de eerste kar) het huis van de schout, en tot dat er is de plek van de kar
  // in het kamp. Als tegel, met `naast` als hij naast de deur stopt.
  function thuisVan(D, e) {
    const w = D.wereld;
    if (e.thuis && e.thuis.klaar && D.gebouwen.includes(e.thuis)) return { ...T.deurVan(w, e.thuis), naast: true };
    const huis = D.gebouwen.find((g) => g.klaar && T.GEBOUWEN[g.soort] && T.GEBOUWEN[g.soort].opslag && !T.GEBOUWEN[g.soort].kar);
    if (huis) return { ...T.deurVan(w, huis), naast: true };
    return w.kamp && w.kamp.kar ? { x: w.kamp.kar.x, y: w.kamp.kar.y, naast: false } : null;
  }

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

  // De werktijd van de kar op de dag van moment t, in dagen: { begin, eind }.
  function werktijd(t) {
    const d = T.dagindeling(t);
    const dag = Math.floor(t);
    return { begin: dag + d.werkBegin / 24, eind: dag + d.werkEind / 24 };
  }
  // Het eerste moment vanaf t waarop de kar een rit mag beginnen.
  function vrijVanaf(t) {
    const w = werktijd(t);
    if (t < w.begin) return w.begin;
    if (t < w.eind) return t;
    return werktijd(Math.floor(t) + 1).begin;
  }

  // De weg van de kar naar `doel` ({ x, y, naast }), en hoe lang hij erover doet (in dagen), of null als er geen weg is.
  function weg(D, e, doel) {
    const van = { x: e.tx, y: e.ty };
    const pad = T.zoekRoute(D.wereld, van, doel, { naast: !!doel.naast });
    if (!pad) return null;
    let lengte = 0;
    let vorig = van;
    for (const t of pad) {
      lengte += Math.hypot(t.x - vorig.x, t.y - vorig.y);
      vorig = t;
    }
    const eind = pad.length ? pad[pad.length - 1] : van;
    return { pad, eind: { x: eind.x, y: eind.y }, duur: lengte / (e.snelheid || 1) / T.DAG_LENGTE };
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

  // Zijn vel: de huifkar blijft de huifkar tot het huis van de schout er is (js/begin.js); de ossenkar is leeg, of geladen
  // met wat hij het meest draagt: stammen, stenen, spullen, of anders zakken (gereedschap/pixelart/ossenkar.cjs).
  const LADING_VEL = {
    hout: 'ossenkar-hout', planken: 'ossenkar-hout', steen: 'ossenkar-stenen', klei: 'ossenkar-stenen', kalk: 'ossenkar-stenen',
    ijzer: 'ossenkar-stenen', gereedschap: 'ossenkar-spullen', wapens: 'ossenkar-spullen', vaten: 'ossenkar-spullen',
    laken: 'ossenkar-spullen', huiden: 'ossenkar-spullen', leer: 'ossenkar-spullen', riet: 'ossenkar-spullen',
  };
  function zetVel(e) {
    if (e.vel === 'huifkar') return;
    let meest = null;
    for (const wat in e.lading || {}) if (e.lading[wat] > 1e-6 && (!meest || e.lading[wat] > e.lading[meest])) meest = wat;
    e.vel = meest ? LADING_VEL[meest] || 'ossenkar-zakken' : 'ossenkar-leeg';
  }
  T.zetKarVel = zetVel;

  const RIJDEN = new Set(['heen', 'terug', 'opslag', 'brengen']);

  // Een stuk van de rit begint op moment t: rijden naar `doel`, of op de plek laden of lossen. Geeft false als er geen weg
  // is.
  function begin(D, e, rit, fase, doel, t, metBeeld) {
    if (RIJDEN.has(fase)) {
      const r = weg(D, e, doel);
      if (!r) return false;
      e.rit = { ...rit, fase, tot: t + r.duur, doel: r.eind };
      if (metBeeld && r.pad.length) T.geefRoute(e, r.pad, doel);
      return true;
    }
    e.rit = { ...rit, fase, tot: t + IN().laden, doel: { x: e.tx, y: e.ty } };
    return true;
  }
  const deurDoel = (D, g) => ({ ...T.deurVan(D.wereld, g), naast: true });

  // Welke waren een bouwplaats (wat hij nodig heeft) of een werkplaats (wat hij verwerkt) van de kar kan willen.
  function watHetVraagt(D, g) {
    if (g.bouw && !g.klaar) return Object.keys(g.bouw.nodig || {});
    const soort = T.GEBOUWEN[g.soort];
    return g.klaar && soort && soort.maakt && soort.maakt.in ? Object.keys(soort.maakt.in).filter((wat) => T.gaatMetDeKar(D, wat)) : [];
  }

  // Wat een bouwplaats of een werkplaats nog van `wat` wil, bovenop wat er is en wat onderweg is; 0 als niets.
  function vraag(D, g, wat) {
    const B = g.bouw;
    if (B && !g.klaar) {
      if (g.wachtOpRooien || !B.nodig || !B.nodig[wat]) return 0; // eerst rooien: het hout van de plek gaat er eerst in
      return Math.max(0, B.nodig[wat] - (B.er[wat] || 0) - onderweg(D, g, wat));
    }
    const soort = T.GEBOUWEN[g.soort];
    if (!g.klaar || !soort || !soort.maakt || !soort.maakt.in || !soort.maakt.in[wat]) return 0;
    const rest = IN().voorraadIn - ((g.in && g.in[wat]) || 0) - onderweg(D, g, wat);
    return rest >= IN().voorraadIn / 2 ? rest : 0;
  }

  // Wat de kar uit de opslag mag meenemen: van het graan niet wat de boeren apart houden om te zaaien (T.zaaigraanApart,
  // js/akkers.js), zoals de molen het ook niet nam.
  const beschikbaar = (D, wat, t) => Math.max(0, (D.voorraad[wat] || 0) - (wat === 'graan' ? T.zaaigraanApart(D, Math.floor(t)) : 0));

  // Wat de kar nu gaat doen, of null. Eerst brengen, naar de bouwplaatsen in de volgorde waarin je ze neerzette en dan naar
  // de werkplaatsen, als er genoeg in de opslag ligt voor een goede vracht; anders halen, de grootste stapel; en is er
  // geen stapel, dan toch brengen wat er is.
  function kiesRit(D, e, t) {
    let half = null;
    const bouwplaatsenEerst = [...D.gebouwen].sort((a, b) => (a.bouw && !a.klaar ? 0 : 1) - (b.bouw && !b.klaar ? 0 : 1));
    const vanMij = (g) => T.karrenVan(D).length < 2 || verantwoordelijk(D, g) === e;
    for (const g of bouwplaatsenEerst) {
      if ((g.karKanNietTot || 0) > t || !watHetVraagt(D, g).length || !vanMij(g)) continue;
      for (const wat of watHetVraagt(D, g)) {
        const wil = vraag(D, g, wat);
        if (wil <= 1e-6) continue;
        const ligt = beschikbaar(D, wat, t);
        const n = Math.min(IN().lading, wil, ligt);
        if (n >= Math.min(IN().lading, wil) - 1e-9 && n > 0) return { plan: 'brengen', naar: g, wat, n };
        if (!half && n >= IN().minstens) half = { plan: 'brengen', naar: g, wat, n };
      }
    }
    let beste = null;
    for (const g of D.gebouwen) {
      const n = T.stapelVan(g);
      if (n < IN().minstens || (g.karKanNietTot || 0) > t || !vanMij(g)) continue;
      if (T.karrenVan(D).some((k) => k !== e && k.rit && k.rit.plan === 'halen' && k.rit.naar === g)) continue;
      if (!beste || n > beste.n) beste = { g, n };
    }
    if (beste) return { plan: 'halen', naar: beste.g };
    return half;
  }

  // Een rit begint: het eerste stuk.
  function beginRit(D, e, rit, t, metBeeld) {
    if (rit.plan === 'halen') return begin(D, e, rit, 'heen', deurDoel(D, rit.naar), t, metBeeld);
    const o = thuisVan(D, e);
    return !!o && begin(D, e, rit, 'opslag', o, t, metBeeld);
  }

  // Een stuk is af: wat er dan gebeurt, en het volgende stuk.
  function klaarMet(D, e, metBeeld) {
    const R = e.rit;
    const t = R.tot;
    const g = R.naar;
    const erNog = g && D.gebouwen.includes(g);
    staOp(D, e, R.doel);
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
          let ruimte = IN().lading - som(e.lading);
          for (const wat of Object.keys(g.stapel)) {
            const n = Math.min(ruimte, g.stapel[wat]);
            if (n <= 0) continue;
            e.lading[wat] = (e.lading[wat] || 0) + n;
            g.stapel[wat] -= n;
            if (g.stapel[wat] < 1e-6) delete g.stapel[wat];
            ruimte -= n;
          }
        }
        zetVel(e);
        const o = thuisVan(D, e);
        return o ? verder('terug', o) : (e.rit = null);
      }
      case 'terug':
        return verder('lossen');
      case 'lossen':
        for (const wat in e.lading) T.wijzigVoorraad(D, wat, e.lading[wat]);
        e.lading = {};
        zetVel(e);
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
        zetVel(e);
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
        zetVel(e);
        e.rit = null;
        return;
      }
      default:
        e.rit = null;
    }
  }

  // De kar bijwerken tot moment `tot` (in dagen). `metBeeld`: de beelden spelen, dus het wezen krijgt zijn weg.
  function werkKar(D, e, tot, metBeeld) {
    if (!D.wereld.wezens.includes(e)) return;
    if (e.klok == null) e.klok = tot;
    for (let veilig = 0; veilig < 200; veilig++) {
      if (e.rit) {
        if (e.rit.tot > tot) break;
        e.klok = e.rit.tot;
        klaarMet(D, e, metBeeld);
        continue;
      }
      // Hij heeft niets te doen: vanaf wanneer mag hij, en is er wat?
      const t = vrijVanaf(e.klok);
      if (t > tot) {
        e.klok = tot;
        break;
      }
      e.klok = t;
      // Nog iets op de kar (een rit die halverwege ophield): eerst naar de opslag.
      if (som(e.lading) > 0) {
        const o = thuisVan(D, e);
        if (o && begin(D, e, { plan: 'halen', naar: null }, 'terug', o, t, metBeeld)) continue;
      }
      const rit = kiesRit(D, e, t);
      if (rit && beginRit(D, e, rit, t, metBeeld)) continue;
      // geen weg naar die plaats: een dag laat hij hem liggen
      if (rit) {
        rit.naar.karKanNietTot = t + 1;
        continue;
      }
      // Niets te doen: dan wacht hij bij zijn opslag (de eerste kar rijdt zo van het kamp naar het huis van de schout).
      const thuis = thuisVan(D, e);
      if (thuis && T.afstand({ x: e.tx, y: e.ty }, thuis) > 2 && begin(D, e, { plan: 'halen', naar: null }, 'terug', thuis, t, metBeeld)) continue;
      e.klok = Math.min(tot, t + IN().rust);
      if (e.klok >= tot) break;
    }
  }

  // Wat de kar doet, voor bij de muis (js/verkennen.js).
  T.karTekst = function (D, e) {
    if (!T.karrenVan(D).includes(e)) return T.t('The covered wagon, with everything you brought');
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

  // Elk beeld (T.werkDorpBij, js/dorp.js): de karren tot nu.
  T.werkKarBij = function (S, D) {
    if (!D.kalender) return;
    for (const e of T.karrenVan(D)) werkKar(D, e, D.kalender.dag, true);
  };

  // Elke nacht, als eerste (T.tikGebouwenDag, js/gebouwen.js): wat de karren gisteren nog deden, tot middernacht. Met
  // beelden is dat al gebeurd; in de toetsen gebeurt het hier. Een spel van vóór 14 okt, met het kamp al op, krijgt hier
  // zijn kar aan het werk (zijn lading telde toen al).
  T.tikKarDag = function (D, dag) {
    const B = D.begin;
    if (B && B.kar && B.kamp !== 'onderweg' && !D.karren && D.wereld.wezens.includes(B.kar)) T.karAanHetWerk(D, B.kar);
    for (const e of T.karrenVan(D)) werkKar(D, e, dag, false);
  };
})(globalThis.Spel = globalThis.Spel || {});
