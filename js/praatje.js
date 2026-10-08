// Een praatje (werklijst vraag 120; Marcel, 4 okt: "Het dorp moet echt levendig en realistisch aanvoelen. Mensen die een
// praatje staan te maken als ze even niets te doen hebben etc", en na het bouwen: "geen praatjes forceren. Alleen als
// mensen een reden hebben en elkaar toevallig tegenkomen"). Regels zonder scherm, zoals js/lopen.js; het wolkje tekent
// js/tekenen.js. Toetsen: test/praatje.test.cjs.
//
// Wie vrij is (T.kanPraten), zijn eigen gang gaat en toevallig een bekende treft die ook vrij is, blijft soms staan voor
// een praatje: de een loopt tot naast de ander, en ze draaien naar elkaar toe (e.kijkt, js/sprites.js). Wie langskomt en
// een van hen kent, schuift aan, tot een groepje van vier. Na een kwartier tot een uur gaan ze verder, en dan een uur niet
// weer. Niemand gaat ergens heen om te praten: gebeurt het niet, dan is het zo.
//
// Een bekende is iemand uit een ander huis: een buur of wie op hetzelfde werk werkt (T.kentElkaar). Niet je eigen gezin:
// dat spreek je binnen. Gemeten voor het plan (4 okt): zonder die regel is meer dan de helft van de praatjes een gezin
// voor zijn eigen deur.
//
// Wie erin staat, zegt het poppetje zelf: e.praatje is het groepje, een gewoon ding dat ze delen, met het midden waar
// ze omheen staan (`plek`), tot wanneer het duurt (`tot`, een dag van de kalender) en een getal voor wie er om de beurt
// praat (`zaad`, alleen voor het scherm). Er is geen lijst ernaast: wie van de kaart gaat (hij sterft, hij trekt weg),
// valt er zo vanzelf uit (T.praatjesOp). Het staat in S, dus een bewaard spel heeft het praatje nog.
//
// De regels van het spel veranderen niet: een werkplaats rekent met de looptijd, niet met waar iemand staat
// (T.werkUrenVan, js/bewoners.js). Wie in een praatje staat, is bezig: wie langs wil, loopt om het groepje heen, en pas
// in een smalle doorgang gaat er een even opzij (T.ontwijk, js/lopen.js).
(function (T) {
  'use strict';

  // Alle getallen in één blok, zoals elders (CLAUDE.md); ze staan ook in de werkbank (js/opties.js). Een eerste voorstel
  // van Claude, op Marcels plan (vraag 120).
  T.PRAATJE_INSTELLINGEN = {
    // De spelregel "Praatjes" (js/opties.js): uit is het dorp zoals voor 4 okt.
    aan: true,
    // Zo dichtbij moet een bekende staan, in tegels.
    afstand: 2,
    // Buren: hun huizen staan hooguit zoveel tegels van elkaar. In het gehucht is dat bijna iedereen.
    buren: 20,
    // Hooguit zoveel in een groepje.
    groep: 4,
    // De kans dat ze blijven staan, elke keer dat hij om zich heen kijkt (bij een stap van het dwalen, om de paar
    // seconden), en op een vaste plek: bij de put, op het plein, voor de herberg of de kapel.
    kans: 1 / 3,
    kansOpPlek: 2 / 3,
    // Hoe ver van de put of de deur van de herberg of de kapel een vaste plek nog is, in tegels.
    vastePlek: 3,
    // Hoe lang een praatje duurt, in uren (op 1× is een uur 12,5 seconden).
    duurMin: 0.25,
    duurMax: 1,
    // Daarna zoveel uur geen nieuw praatje, anders staan ze de hele avond.
    rust: 1,
    // Wie langsloopt en doorloopt, kijkt zoveel uur niet weer: zo is het één kans per keer dat hij langskomt.
    doorlopen: 0.25,
  };
  const IN = () => T.PRAATJE_INSTELLINGEN;

  const tegel = (e) => ({ x: e.tx, y: e.ty });
  const loopt = (e) => e.onderweg || e.pad.length > 0;

  // ── Wie vrij is, en wie elkaar kent ──

  // Kan e nu een praatje maken? Wie vrij is: 's ochtends, in de schaft, 's avonds, en overdag wie geen werk heeft. Geen
  // kleuter, niet de schout (dat ben jij, of de schout van een ander dorp), en niet wie bezig is: maaien, op zijn land
  // werken of daarbij helpen (js/veldwerk.js), de schout zoeken, met de militie mee, naar de schandpaal, wegtrekken, net
  // aankomen, een tijd weg, aan zijn eigen hut bouwen, de herbergierster 's avonds, en de raadsman met zijn rapport.
  // `deel` is het deel van de dag (T.dagdeelVan, js/dag.js).
  T.kanPraten = function (S, D, e, deel) {
    if (e.dood || e.binnen || e.dier || e.beest || e.maait || e.werkt || e.opgeroepen || e.zoektSchout || e.moetNaar || e.vertrekt) return false;
    if (e === S.schout || e === D.schout || e === S.spreektMet || e.kant === 'monster') return false;
    if (S.gevecht && D.wereld === S.wereld) return false;
    if (deel === 'nacht') return false;
    const p = T.bewonerVan(D, e);
    if (!p || p.schout || p.komt || p.weg || p.leeftijd === 'kleuter') return false;
    if (deel === 'werk' && !T.vrijeDag(D, D.kalender.dag)) {
      if (p.werk || e.werkAkkers) return false;
      if (p.huis && p.huis.erf && !p.huis.klaar) return false;
      if (T.helpAnker(D, e)) return false;
    }
    if (deel === 'avond' && T.herbergenVan(D).includes(p.huis)) return false;
    if (e.raadsman && T.rapportAnker(D, e)) return false;
    return true;
  };

  // Kennen ze elkaar (twee bewoners)? Wie onder één dak woont, praat binnen. Wie op hetzelfde werk werkt, en buren (hun
  // huizen hooguit `buren` tegels van elkaar), wel.
  T.kentElkaar = function (D, p, q) {
    if (!p || !q || p === q) return false;
    if (p.huis && p.huis === q.huis) return false;
    if (p.werk && p.werk === q.werk) return true;
    return !!(p.huis && q.huis && T.afstand(p.huis, q.huis) <= IN().buren);
  };

  // Staat hij op een vaste plek, waar het vaker gebeurt: op het plein, bij de put, voor de herberg of de kapel?
  T.opVastePlek = opVastePlek;
  function opVastePlek(D, w, x, y) {
    if (T.opHetPlein(w, x, y)) return true;
    const a = IN().vastePlek;
    for (const r of T.plekkenVan(D, 'put')) {
      if (x >= r.x - a && x < r.x + r.b + a && y >= r.y - a && y < r.y + r.h + a) return true;
    }
    for (const g of D.gebouwen || []) {
      if (!g.klaar || (g.soort !== 'herberg' && g.soort !== 'kapel')) continue;
      if (T.afstand(T.deurVan(w, g), { x, y }) <= a) return true;
    }
    return false;
  }
  const kansBij = (D, w, t) => (opVastePlek(D, w, t.x, t.y) ? IN().kansOpPlek : IN().kans);
  // Rust hij nog van zijn vorige praatje, of liep hij net door?
  const rust = (D, e) => e.praatRust > D.kalender.dag;

  // ── De groepjes ──

  // De praatjes op een kaart: elk groepje met wie erin staat, in de volgorde van de kaart.
  T.praatjesOp = function (w) {
    const groepen = new Map();
    for (const e of w.wezens) {
      const g = e.praatje;
      if (!g) continue;
      const l = groepen.get(g);
      if (l) l.push(e);
      else groepen.set(g, [e]);
    }
    return groepen;
  };

  // Staat hij erbij: stil, naast het midden van zijn groepje (of erop)? Dan praat hij mee, en tekent js/tekenen.js om de
  // beurt een wolkje boven hem.
  T.staatErbij = (e) => !!e.praatje && !loopt(e) && T.afstand(tegel(e), e.praatje.plek) <= 1;

  // Hij gaat: het praatje is om, of hij is niet meer vrij. Daarna een tijd geen nieuw.
  function laatGaan(e, dag) {
    e.praatje = null;
    e.kijkt = null;
    e.praatRust = dag + IN().rust / 24;
  }

  // De plekken rond het midden van een groepje, in de volgorde waarin wie erbij komt ze neemt: eerst het midden zelf (als
  // wie er stond, wegging), dan links en rechts op het scherm (op het raster schuin: +x ligt rechtsonder, +y linksonder),
  // zodat je twee mensen van opzij ziet praten; dan de vier rechte buren, en als laatste boven en onder op het scherm.
  const ROND = [[0, 0], [1, -1], [-1, 1], [1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [-1, -1]];

  // e loopt naar een vrije plek naast het midden: de eerste volgens ROND, en bij gelijke stand de dichtste. Dus ook als hij
  // er al schuin achter staat, schuift hij op naar links of rechts, zodat je ze van opzij ziet. Een korte weg, met de
  // anderen als muur, zoals een omweg (js/lopen.js). Lukt het niet, of is het te ver, dan false.
  function naarHetGroepje(w, g, e, leden) {
    const bezet = new Set();
    for (const o of leden) {
      if (o === e) continue;
      const t = o.pad.length ? o.pad[o.pad.length - 1] : tegel(o);
      bezet.add(t.x + ',' + t.y);
    }
    const van = tegel(e);
    const vrij = (x, y) => T.isBegaanbaar(w, x, y, { wezensBlokkeren: true, wie: e });
    let beste = null;
    let score = Infinity;
    ROND.forEach(([dx, dy], i) => {
      const x = g.plek.x + dx;
      const y = g.plek.y + dy;
      if (bezet.has(x + ',' + y) || T.bijDeur(w, x, y) || !vrij(x, y)) return;
      const s = i + T.afstand(van, { x, y }) / 10;
      if (s < score) {
        score = s;
        beste = { x, y };
      }
    });
    if (!beste) return false;
    if (beste.x === van.x && beste.y === van.y) return true;
    const pad = T.zoekPad(van, beste, vrij, (x, y) => T.isVast(w, x, y), { max: 60, wereld: w });
    if (!pad || !pad.length || pad.length > IN().afstand * 3) return false;
    T.geefRoute(e, pad, beste);
    return true;
  }

  // ── Beginnen ──

  // Een stap van het dwalen (T.dwaal, js/verkennen.js): staat hij stil en kijkt hij om zich heen, en staat er een bekende
  // binnen `afstand` tegels die ook vrij is, dan blijven ze staan, of schuift hij aan bij het groepje waar die in staat.
  // Geeft true als hij nu in een praatje staat (dan dwaalt hij niet). `deel`: het deel van de dag.
  T.zoekPraatje = function (S, w, D, e, deel) {
    const I = IN();
    if (!I.aan || !D || !D.kalender || e.praatje || D.wereld !== w) return false;
    if (rust(D, e) || !T.kanPraten(S, D, e, deel)) return false;
    const p = T.bewonerVan(D, e);
    let groepen = null;
    let met = null;
    for (const b of w.wezens) {
      if (b === e || Math.abs(b.tx - e.tx) > I.afstand || Math.abs(b.ty - e.ty) > I.afstand) continue;
      if (b.praatje) {
        groepen = groepen || T.praatjesOp(w);
        if ((groepen.get(b.praatje) || []).length >= I.groep) continue;
      } else if (loopt(b) || rust(D, b)) continue;
      if (!T.kanPraten(S, D, b, deel) || !T.kentElkaar(D, p, T.bewonerVan(D, b))) continue;
      met = b;
      if (b.praatje) break; // liever aansluiten dan een tweede groepje ernaast
    }
    if (!met || Math.random() >= kansBij(D, w, tegel(e))) return false;
    if (!met.praatje) return T.beginPraatje(D, e, met);
    const g = met.praatje;
    if (!naarHetGroepje(w, g, e, groepen.get(g))) return false;
    e.praatje = g;
    return true;
  };

  // Een nieuw praatje tussen e en b: b blijft staan, zijn tegel is het midden, en e loopt tot naast hem, liefst links of
  // rechts op het scherm. False als e er niet kan komen. Ook voor Spel.debug.praatjes('nu') en de toetsen.
  T.beginPraatje = function (D, e, b) {
    const I = IN();
    const dag = D.kalender.dag;
    const g = { plek: tegel(b), tot: dag + (I.duurMin + Math.random() * (I.duurMax - I.duurMin)) / 24, zaad: Math.floor(dag * 977) % 1000 };
    if (!naarHetGroepje(D.wereld, g, e, [b])) return false;
    e.praatje = g;
    b.praatje = g;
    return true;
  };

  // Onderweg (T.ontwijk, js/lopen.js; vraag 119, D): e wil naar de tegel waar `ander` staat of heen stapt. Zijn ze allebei
  // vrij en kennen ze elkaar, dan blijven ze staan voor een praatje in plaats van uit te wijken (Marcel, vraag 120, d). Eén
  // kans per keer dat ze elkaar zo treffen: lopen ze door, dan kijkt e een kwartier niet weer (`doorlopen`). Geeft true
  // als ze nu een praatje maken: ander maakt zijn stap af, en e staat al naast hem of loopt nog naar zijn plek (e.pad).
  T.praatjeOnderweg = function (S, w, e, ander) {
    const I = IN();
    if (!I.aan || e.praatje || ander.praatje) return false;
    const D = (S.dorpen || []).find((d) => d.wereld === w);
    if (!D || !D.kalender) return false;
    const dag = D.kalender.dag;
    // Wie net praatte of net doorliep, kijkt niet; anders gooide hij elk beeld opnieuw zolang hij wacht.
    if (rust(D, e) || rust(D, ander)) return false;
    const deel = T.dagdeelVan(dag, T.isOogstDag(dag));
    if (!T.kanPraten(S, D, e, deel) || !T.kanPraten(S, D, ander, deel)) return false;
    if (!T.kentElkaar(D, T.bewonerVan(D, e), T.bewonerVan(D, ander))) return false;
    if (Math.random() >= kansBij(D, w, tegel(e))) {
      e.praatRust = dag + I.doorlopen / 24;
      return false;
    }
    const weg = e.pad;
    if (!T.beginPraatje(D, e, ander)) return false;
    // Staat hij al goed, dan is zijn weg uit; anders loopt hij nu naar zijn plek naast ander (T.ontwijk: 'verder').
    if (e.pad === weg) {
      e.pad = [];
      e.padDoel = null;
    }
    ander.pad = ander.onderweg ? [ander.pad[0]] : [];
    ander.padDoel = null;
    return true;
  };

  // Wie langsloopt en een van het groepje kent, schuift aan: één kans per keer dat hij langskomt (`doorlopen`). Hij maakt
  // zijn stap af en loopt dan naar een plek naast het midden (T.werkPraatjesBij, het volgende beeld).
  function langskomers(S, w, D, g, leden, deel, dag) {
    const I = IN();
    for (const b of w.wezens) {
      if (leden.length >= I.groep) return;
      if (b.praatje || !loopt(b)) continue;
      if (Math.abs(b.tx - g.plek.x) > I.afstand || Math.abs(b.ty - g.plek.y) > I.afstand) continue;
      if (rust(D, b) || !T.kanPraten(S, D, b, deel)) continue;
      const q = T.bewonerVan(D, b);
      if (!leden.some((e) => T.kentElkaar(D, T.bewonerVan(D, e), q))) continue;
      if (Math.random() >= kansBij(D, w, g.plek)) {
        b.praatRust = dag + I.doorlopen / 24;
        continue;
      }
      b.praatje = g;
      b.pad = b.onderweg ? [b.pad[0]] : [];
      b.padDoel = null;
      leden.push(b);
    }
  }

  // ── Elk beeld ──

  // Elk beeld, voor elk dorp, vóór het dwalen (T.dwaal, js/verkennen.js): wie niet meer vrij is, gaat; is het praatje
  // om, of staan er nog maar één, dan gaat iedereen. Wie er nog niet bij staat (hij komt net, of hij ging even opzij),
  // loopt naar een plek naast het midden. Wie erbij staat, kijkt naar de anderen; en wie langskomt, schuift aan.
  T.werkPraatjesBij = function (S, D) {
    const w = D.wereld;
    if (!w || !D.kalender) return;
    const groepen = T.praatjesOp(w);
    if (!groepen.size) return;
    const I = IN();
    const dag = D.kalender.dag;
    const deel = T.dagdeelVan(dag, T.isOogstDag(dag));
    for (const [g, alle] of groepen) {
      const om = !I.aan || dag >= g.tot;
      let leden = alle.filter((e) => {
        if (!om && T.kanPraten(S, D, e, deel)) return true;
        laatGaan(e, dag);
        return false;
      });
      leden = leden.filter((e) => {
        if (loopt(e) || T.afstand(tegel(e), g.plek) <= 1 || naarHetGroepje(w, g, e, leden)) return true;
        laatGaan(e, dag);
        return false;
      });
      if (leden.length < 2) {
        for (const e of leden) laatGaan(e, dag);
        continue;
      }
      for (const e of leden) {
        if (loopt(e)) continue;
        let x = 0;
        let y = 0;
        for (const o of leden) {
          if (o === e) continue;
          x += o.x;
          y += o.y;
        }
        const k = e.kijkt && typeof e.kijkt === 'object' ? e.kijkt : (e.kijkt = { x: 0, y: 0 });
        k.x = x / (leden.length - 1);
        k.y = y / (leden.length - 1);
      }
      langskomers(S, w, D, g, leden, deel, dag);
    }
  };
})(globalThis.Spel = globalThis.Spel || {});
