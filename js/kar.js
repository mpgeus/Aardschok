// De ossenkar (werklijst C; Marcel, 11 okt: "Misschien dat grondstoffen worden opgehaald met een kar?", en op het plan van
// 14 okt: "A2, B2, C1, D2, E2"): wat een gebouw maakt, ligt op een stapel bij zijn deur tot de kar het haalt, en telt pas
// in de voorraad als het in de opslag is (het huis van de schout; tot dat er is, de plek van de kar in het kamp). Stap 1
// is het hout: van de houthakker, en wat de bouwers rooien; de rest komt in stap 3 (`waren` hieronder).
//
// De stapel ligt op het gebouw: g.stapel = { hout: 6 }. Een veld legt zijn hout op de stapel van zijn boerderij. Is een
// stapel `stapelVol`, dan maakt het gebouw niets meer (T.ruimteOpStapel, js/gebouwen.js): zo zie je waar het stokt.
//
// De kar rijdt zelf, zonder hand (C1), in de werktijd van het dorp (T.dagindeling, js/dag.js): naar de grootste stapel,
// laden, terug naar de dichtste opslag, lossen. Een rit is een regel op de klok van de kalender, niet op de beelden: elk
// stuk ervan heeft een begin en een eind (in dagen), uit de lengte van de weg en het tempo van de os. Elk beeld
// (T.werkKarBij) en elke nacht (T.tikKarDag) werken de kar bij tot nu; de beelden geven het wezen zijn weg, zodat je hem
// ziet rijden, en staat hij aan het eind van een stuk nog niet waar hij moet zijn (iemand stond in de weg), dan staat hij
// er. Zo komt er met of zonder beelden hetzelfde uit (de toetsen spelen zonder), zoals bij het meebouwen (js/bouwen.js).
//
//   D.karren   de karren van het dorp, wezens in w.wezens (stap 1: de ossenkar, D.begin.kar, zodra het kamp op is)
//   e.lading   { wat: hoeveel } wat de kar nu draagt
//   e.rit      null, of { fase: 'heen' | 'laden' | 'terug' | 'lossen', naar: het gebouw van de stapel, tot: de dag
//              waarop deze fase klaar is, doel: { x, y } waar hij dan staat }
//   e.klok     tot welk moment (in dagen) de kar is bijgewerkt
// Regels zonder scherm, dus te toetsen (test/kar.test.cjs).
(function (T) {
  'use strict';

  // Alle getallen in één blok (ook in de werkbank van de spelregels, js/opties.js).
  T.KAR_INSTELLINGEN = {
    // Wat met de kar gaat (stap 1: het hout; stap 3, A2: alles wat een gebouw maakt).
    waren: ['hout'],
    // Zoveel neemt de kar per rit mee. Met de getallen van 14 okt rijdt hij binnen het bouwbereik drie tot vier ritten
    // per dag (een rit van 20 tegels heen is zo'n twee uur), en maakt een houthakker 2 hout per dag: één kar is ruim genoeg voor een gehucht. Wil je hem eerder voelen,
    // dan is dit het getal.
    lading: 8,
    // Zo groot wordt een stapel bij een deur; dan maakt het gebouw niets meer tot de kar komt.
    stapelVol: 16,
    // Een stapel kleiner dan dit laat de kar liggen.
    minstens: 1,
    // Zoveel dagen kost het laden of het lossen (0,01 is drie seconden op 1×, een kwartier in het dorp).
    laden: 0.01,
    // Vindt de kar niets te doen, dan kijkt hij zoveel later weer (een half uur).
    rust: 1 / 48,
  };
  const IN = () => T.KAR_INSTELLINGEN;

  // ---------------------------------------------------------------------------------------------
  // De stapels
  // ---------------------------------------------------------------------------------------------

  // Heeft dit dorp een kar die haalt? Dan ligt wat er gemaakt wordt eerst op een stapel.
  T.karrenVan = (D) => (D && D.karren) || [];
  T.metDeKar = (D) => T.karrenVan(D).length > 0;
  // Gaat deze waar in dit dorp op een stapel?
  T.gaatMetDeKar = (D, wat) => T.metDeKar(D) && IN().waren.includes(wat);

  // Het gebouw waar wat hier gemaakt of gerooid wordt, op de stapel komt: een veld legt het bij zijn boerderij.
  const stapelGebouw = (g) => (g && T.isVeldSoort(g.soort) ? g.boerderij || null : g);

  // Wat gebouw g maakte, of wat er bij g gerooid werd: op zijn stapel als het met de kar gaat, anders meteen in de
  // voorraad. Eén weg voor alles wat een gebouw de voorraad in brengt.
  T.opStapel = function (D, g, wat, hoeveel) {
    const bij = stapelGebouw(g);
    if (!(hoeveel > 0)) return;
    if (!bij || !T.gaatMetDeKar(D, wat)) {
      T.wijzigVoorraad(D, wat, hoeveel);
      return;
    }
    const s = bij.stapel || (bij.stapel = {});
    s[wat] = (s[wat] || 0) + hoeveel;
  };

  // Hoeveel er op de stapel van g ligt, alles samen.
  T.stapelVan = (g) => {
    let n = 0;
    if (g && g.stapel) for (const wat in g.stapel) n += g.stapel[wat];
    return n;
  };
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
  // meest van ligt.
  T.stapelsOp = function (D) {
    const uit = [];
    for (const g of (D && D.gebouwen) || []) {
      const n = T.stapelVan(g);
      if (n < 0.5) continue;
      let wat = null;
      for (const k in g.stapel) if (!wat || g.stapel[k] > g.stapel[wat]) wat = k;
      uit.push({ ...T.stapelPlek(D, g), wat, hoeveel: n, vol: n / IN().stapelVol, g });
    }
    return uit;
  };

  // ---------------------------------------------------------------------------------------------
  // De kar
  // ---------------------------------------------------------------------------------------------

  // De kar gaat aan het werk (T.zetKampOp, js/begin.js): het kamp staat, en wat hij bracht is uitgeladen.
  T.karAanHetWerk = function (D, e) {
    if (!D.karren) D.karren = [];
    if (D.karren.includes(e)) return;
    Object.assign(e, { lading: {}, rit: null, klok: D.kalender ? D.kalender.dag : 0 });
    D.karren.push(e);
  };

  // De opslagen van het dorp, als tegels waar de kar lost: de deur van elk gebouw met `opslag` dat af is (het huis van de
  // schout), en zolang er geen is, de plek van de kar in het kamp.
  function opslagen(D) {
    const w = D.wereld;
    const uit = [];
    for (const g of D.gebouwen) {
      if (g.klaar && T.GEBOUWEN[g.soort] && T.GEBOUWEN[g.soort].opslag) uit.push({ ...T.deurVan(w, g), naast: true });
    }
    if (!uit.length && w.kamp && w.kamp.kar) uit.push({ x: w.kamp.kar.x, y: w.kamp.kar.y, naast: false });
    return uit;
  }
  const dichtsteOpslag = (D, bij) => {
    let beste = null;
    for (const o of opslagen(D)) if (!beste || T.afstand(o, bij) < T.afstand(beste, bij)) beste = o;
    return beste;
  };

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
  // speelden er geen beelden, dan staat hij er nu.
  function staOp(e, t) {
    if (e.tx === t.x && e.ty === t.y && !e.onderweg) {
      e.pad = [];
      return;
    }
    Object.assign(e, { x: t.x, y: t.y, tx: t.x, ty: t.y, pad: [], onderweg: false });
    e.padDoel = null;
  }

  // Zijn vel: de huifkar blijft de huifkar tot het huis van de schout er is (js/begin.js); de ossenkar is leeg of
  // geladen.
  function zetVel(e) {
    if (e.vel === 'huifkar') return;
    e.vel = T.stapelVan({ stapel: e.lading }) > 0 ? 'ossenkar-hout' : 'ossenkar-leeg';
  }
  T.zetKarVel = zetVel;

  // Een stuk van de rit begint op moment t: met een weg ('heen', 'terug') of op de plek ('laden', 'lossen').
  function begin(D, e, fase, naar, doel, t, metBeeld) {
    if (fase === 'heen' || fase === 'terug') {
      const r = weg(D, e, doel);
      if (!r) return false;
      e.rit = { fase, naar, tot: t + r.duur, doel: r.eind };
      if (metBeeld && r.pad.length) T.geefRoute(e, r.pad, doel);
      return true;
    }
    e.rit = { fase, naar, tot: t + IN().laden, doel: { x: e.tx, y: e.ty } };
    return true;
  }

  // De grootste stapel die de kar kan halen (en waar geen andere kar al heen rijdt), of null.
  function kiesStapel(D, e, t) {
    let beste = null;
    for (const g of D.gebouwen) {
      const n = T.stapelVan(g);
      if (n < IN().minstens || (g.karKanNietTot || 0) > t) continue;
      if (T.karrenVan(D).some((k) => k !== e && k.rit && k.rit.naar === g)) continue;
      if (!beste || n > beste.n) beste = { g, n };
    }
    return beste && beste.g;
  }

  // Een stuk is af: wat er dan gebeurt, en het volgende stuk.
  function klaarMet(D, e, metBeeld) {
    const R = e.rit;
    const t = R.tot;
    staOp(e, R.doel);
    if (R.fase === 'heen') {
      begin(D, e, 'laden', R.naar, null, t, metBeeld);
      return;
    }
    if (R.fase === 'laden') {
      // wat erop past, van de stapel (is het gebouw er niet meer, dan is er niets)
      const g = R.naar;
      if (D.gebouwen.includes(g) && g.stapel) {
        let ruimte = IN().lading - T.stapelVan({ stapel: e.lading });
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
      if (!naarDeOpslag(D, e, t, metBeeld)) e.rit = null;
      return;
    }
    if (R.fase === 'terug') {
      begin(D, e, 'lossen', null, null, t, metBeeld);
      return;
    }
    // lossen: het telt in de voorraad
    for (const wat in e.lading) T.wijzigVoorraad(D, wat, e.lading[wat]);
    e.lading = {};
    zetVel(e);
    e.rit = null;
  }

  function naarDeOpslag(D, e, t, metBeeld) {
    const o = dichtsteOpslag(D, { x: e.tx, y: e.ty });
    return !!o && begin(D, e, 'terug', null, o, t, metBeeld);
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
      if (T.stapelVan({ stapel: e.lading }) > 0 && naarDeOpslag(D, e, t, metBeeld)) continue;
      const g = kiesStapel(D, e, t);
      if (g && begin(D, e, 'heen', g, { ...T.deurVan(D.wereld, g), naast: true }, t, metBeeld)) continue;
      // geen weg naar die stapel: een dag laat hij hem liggen
      if (g) g.karKanNietTot = t + 1;
      else e.klok = Math.min(tot, t + IN().rust);
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
    const lading = Object.keys(e.lading || {}).filter((wat) => e.lading[wat] >= 0.5).map((wat) => T.hoeveel(Math.round(e.lading[wat]), wat));
    if (lading.length) return T.t('{kar}, bringing {lading} to the stores', { kar, lading: lading.join(', ') });
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
