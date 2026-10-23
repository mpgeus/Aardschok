// De kolonist (werklijst B, 1f; Marcel, 12 okt: "a1, b1, c1, d ja"): een speler in code die het lege begin (js/begin.js)
// speelt zoals een mens, met de handelingen van het bouwmenu: T.plaatsGebouw voor een gebouw, en T.legVeld voor een veld
// (de twee klikken, js/main.js). De speeltest (speler.js, de speler `kolonist`) en de toets (test/begin.test.cjs) laden
// allebei dit bestand, zodat ze dezelfde keuzes maken (a1). Elke dag één keer T.kolonistDag(D, dag): hij loopt zijn
// regels af, op volgorde, en doet wat er nu kan (d ja):
//   1. het raadhuis, bij het kampvuur;
//   2. een boerderij, en zolang de akkers nog gezaaid worden (T.isNazaaitijd) akkers erbij, tot al het zaaigraan uit de
//      kar erop past;
//   3. een houthakker, als het hout laag wordt (onder `houtLaag`, of het haalt de winter niet);
//   4. hutten, tot elk gezin in het kamp een woning heeft, af of in aanbouw (een boerderij en een wijnboerderij zijn ook
//      een woning); en dan, als er een houthakker is, een zagerij (vraag 157: een dorp bouw je van planken), zodat de
//      speeltest de keten van stammen tot planken meet (C, stap 6);
//   5. een jager, als het spel zegt dat het eten niet haalt: het haalt de winter niet (het bericht dat het spel dan geeft,
//      raadt zelf een jager aan), of er is honger (de status in de balk); hooguit één per `jagerNa` dagen (Marcel, 12 okt:
//      "a ja");
//   6. na de oogst (van `naDeOogst` tot `naDePluk`): haalt het eten de winter niet, dan een tweede veld. Een akker wordt
//      pas in de lente gezaaid, dus een wijngaard, die het gezin nog in wijnmaand plukt; en die hoort bij een
//      wijnboerderij (vraag 155): eerst die, en als ze er staat, de wijngaard erbij;
//   7. eet het dorp eentonig (de status in de balk, vraag 154), dan wat het spel zegt dat een soort erbij brengt
//      (T.watHelptAanAfwisseling, js/raad.js), het eerste dat één gebouw is (een jager, een moestuin, een kippenhok, een
//      visser); hooguit één van een soort per `afwisselingNa` dagen. De wijn doet regel 6.
//   7b. als er een zagerij is en iedereen een woning heeft, een schuur richting de rotsen (werklijst C, stap 6; Marcel, 15
//      okt: "Ja, bij de rotsen"): zo meet de speeltest een kar naast de dragers (het begin heeft er geen, vraag 184), en
//      komen de rotsen binnen bereik; is de schuur af, dan een steengroeve erbij, zodat die kar een eigen stapel heeft;
//   7c. de soldaten (vraag 159): als er een zagerij is, iedereen een woning heeft en de schuur van 7b er staat (of er geen
//      rotsen zijn), een wachthuis en een wapenmaker, en zijn die af, `speermannen` speermannen in het wachthuis (speer en
//      schild, van planken): zo toetst de speeltest de hele keten, van de zagerij via de dragers en de wapenmaker tot de soldaat;
//   8. wordt er niets anders gebouwd (geen bouwplaats en geen weg in aanleg), dan een weg (werklijst C, stap 5, f; Marcel,
//      14 okt: "f ja"): van de opslag (het raadhuis of een schuur) naar een gebouw waar de ossenkar heen rijdt
//      (een werkplaats, een boerderij, een schuur), het dichtste eerst, één per dag, zodat de speeltest meet wat een weg
//      doet. Hij neemt een weg die er al ligt mee (T.planWeg, js/wegen.js), dus het wordt een net.
//   9. wacht hij op goud en is de marskramer er, dan verkoopt hij hem wat de winter niet nodig heeft, tot hij het goud heeft
//      (werklijst C, stap 6; Marcel, 15 okt: "Kolonist verkoopt"): eerst hout boven `houtHouden` en wat de bouwplaatsen
//      nog vragen, dan graan boven het zaaigraan, zolang het dorp de winter haalt; met T.verkoop, zoals de knop in het
//      venster (js/handel.js). Zonder verkopen was na de zagerij het goud op, en kwam de schuur er pas na een jaar.
// Wat hij deed, geeft hij terug: [{ soort, gelukt, reden, tekst, instantie }], zonder scherm, dus ook in een toets; en wat
// hij wil maar nog niet kan betalen, met `wacht` (dan morgen weer). Hij rekent niet vooruit en wacht niet op het juiste
// moment; hij doet wat er vandaag kan, zoals een speler die elke ochtend kijkt wat er nodig is.
(function (T) {
  'use strict';

  const IN = {
    houtLaag: 20, // onder zoveel hout een houthakker
    houtHouden: 40, // als hij hout verkoopt, houdt hij zoveel boven wat de bouwplaatsen nog vragen
    // Van 1 herfstmaand (na de oogst) tot 1 slachtmaand (na de pluk) kijkt hij of het eten de winter haalt; daarna
    // draagt een wijngaard pas volgend jaar.
    naDeOogst: 180,
    naDePluk: 240,
    jagerNa: 30, // een nieuwe jager pas zoveel dagen nadat de vorige af was
    afwisselingNa: 20, // voor de afwisseling een tweede van een soort pas zoveel dagen nadat de vorige af was
    waaromNa: 30, // waarom er geen plek is, zoekt hij zo vaak opnieuw uit
    speermannen: 2, // zoveel speermannen vraagt hij in het wachthuis (regel 7c)
    // De maten die hij voor een veld probeert, de grootste eerst (T.BOERDERIJ_INSTELLINGEN: 12 tot 40 tegels).
    veldMaten: [[8, 5], [5, 8], [6, 6], [7, 5], [5, 7], [6, 5], [5, 6], [8, 4], [4, 8], [7, 4], [4, 7], [6, 4], [4, 6], [5, 4], [4, 5], [4, 4], [6, 2], [4, 3], [3, 4]],
  };
  T.KOLONIST = IN;

  const isWoning = (g) => !!(T.GEBOUWEN[g.soort] && T.GEBOUWEN[g.soort].woning) || T.isBoerderij(g);
  const inHuis = (D, g) => D.bewoners.mensen.filter((p) => p.huis === g);
  const boerderijen = (D) => D.gebouwen.filter((g) => g.soort === 'boerderij');
  // Het hart van zijn dorp: het kampvuur op het plein (het blijft een plek, ook als het uit is).
  const hart = (D) => D.plek.kamp.vuur;

  // Een gebouw neerzetten zoals de speler het met het bouwmenu doet: waar het past, zo dicht mogelijk bij `bij`, op open
  // grond of anders waar het minst te rooien is (T.plekVoor, js/bouwen.js; zo zocht de bouwer van de speeltest ook).
  function bouw(D, soort, bij, waarom) {
    if (!T.inBouwmenu(D, soort)) return { soort, gelukt: false, reden: 'niet in het bouwmenu', tekst: `wil een ${soort} bouwen (${waarom}), maar hij staat niet in het bouwmenu` };
    const kosten = T.GEBOUWEN[soort].kosten;
    // Het hout dat de bouwplaatsen nog gebracht moeten krijgen, is al vergeven (js/kar.js; werklijst C, stap 2): hij bouwt
    // met wat er dan over is, ook al betaal je het hout pas als het gebracht wordt.
    const vrij = (wat) => (D.voorraad[wat] || 0) - (T.gaatMetVervoer(D, wat) ? T.nogTeBrengen(D, wat) : 0);
    const mist = Object.keys(kosten).filter((wat) => vrij(wat) < kosten[wat]);
    if (mist.length) {
      return { soort, gelukt: false, wacht: true, reden: `wacht op ${mist.join(' en ')}`, tekst: `wil een ${soort} bouwen (${waarom}), maar wacht op ${mist.join(' en ')}` };
    }
    const plek = T.plekVoor(D, soort, bij);
    if (!plek) {
      const waaromNiet = waaromGeenPlek(D, soort);
      return { soort, gelukt: false, reden: `geen plek (${waaromNiet})`, tekst: `vindt geen plek voor een ${soort} (${waarom}): ${waaromNiet}` };
    }
    const u = T.plaatsGebouw(D, soort, plek.x, plek.y);
    return { soort, gelukt: u.gelukt, reden: u.reden || null, instantie: u.instantie || null,
      tekst: u.gelukt ? `bouwt een ${soort} (${waarom})${plek.rooien ? ', waar eerst gerooid wordt' : ''}` : `wil een ${soort} bouwen (${waarom}), maar: ${u.reden}` };
  }

  // Waarom er binnen het bouwbereik nergens een `soort` past: de twee redenen die het spel het vaakst geeft (zoals de muis
  // ze zegt, T.waaromPastHetNiet), over elke plek in het vak van het bereik, met rooien en zonder wie er staat. Een keer per
  // `waaromNa` dagen per soort, want het kost een halve seconde; het is voor de speeltest, die zo zelf zegt wat er klemt.
  const WAAROM = new WeakMap();
  function waaromGeenPlek(D, soort) {
    const dag = Math.floor(D.kalender ? D.kalender.dag : 0);
    const bij = WAAROM.get(D) || {};
    WAAROM.set(D, bij);
    if (bij[soort] && dag - bij[soort].dag < IN.waaromNa) return bij[soort].tekst;
    const B = T.bouwBereikVan(D);
    const voet = T.gebouwVoet(soort, T.volgendeTekening(D, soort)) || T.GEBOUWEN[soort].voet;
    const tel = new Map();
    for (let y = B.y0; y < B.y0 + B.h; y++) {
      for (let x = B.x0; x < B.x0 + B.b; x++) {
        if (!T.inBouwBereik(D, x, y)) continue;
        const r = T.waaromPastHetNiet(D, soort, x, y, null, T.kavelVan(D, x, y, voet), false) || 'past';
        tel.set(r, (tel.get(r) || 0) + 1);
      }
    }
    const tekst = [...tel].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([r, n]) => `${n}× "${r}"`).join(', ');
    bij[soort] = { dag, tekst };
    return tekst;
  }

  // Een veld bij boerderij `g`, zoals de speler het trekt: de grootste maat die past en niet groter is dan `tegels`, waar
  // het minst te rooien is, en dan het dichtst bij de boerderij. Geeft de rechthoek, of null.
  function veldPlek(D, soort, g, tegels) {
    const I = T.BOERDERIJ_INSTELLINGEN;
    const voet = T.voetVanGebouw(g);
    const ver = I.veldAfstand;
    const midden = { x: voet.x + voet.b / 2, y: voet.y + voet.h / 2 };
    const tot = Math.min(I.veldMax, Math.max(I.veldMin, tegels));
    for (const [b, h] of IN.veldMaten) {
      if (b * h > tot) continue;
      let beste = null;
      for (let y = voet.y - ver - h; y <= voet.y + voet.h + ver; y++) {
        for (let x = voet.x - ver - b; x <= voet.x + voet.b + ver; x++) {
          const r = { x, y, b, h };
          if (T.waaromPastVeldNiet(D, soort, r) || T.boerderijVoorVeld(D, soort, r).boerderij !== g) continue;
          const rooien = T.teRooienOp(D, r).length;
          const d = Math.hypot(x + b / 2 - midden.x, y + h / 2 - midden.y);
          if (!beste || rooien < beste.rooien || (rooien === beste.rooien && d < beste.d)) beste = { r, rooien, d };
        }
      }
      if (beste) return beste.r;
    }
    return null;
  }

  function legVeld(D, soort, g, tegels, waarom) {
    const r = veldPlek(D, soort, g, tegels);
    if (!r) return { soort, gelukt: false, reden: 'geen plek', tekst: `vindt geen plek voor een ${soort} bij de ${g.soort} (${waarom})` };
    const u = T.legVeld(D, soort, r);
    return { soort, gelukt: u.gelukt, reden: u.reden || null, instantie: u.instantie || null,
      tekst: u.gelukt ? `legt een ${soort} van ${r.b} bij ${r.h} (${waarom})` : `wil een ${soort} leggen (${waarom}), maar: ${u.reden}` };
  }

  // Hoeveel akkertegels er zijn, of komen (in aanleg).
  function akkerTegels(D) {
    let n = 0;
    for (const a of D.wereld.akkers || []) if (a.boerderij) n += a.b * a.h;
    for (const v of D.gebouwen) if (v.soort === 'akker') n += v.voet.b * v.voet.h;
    return n;
  }

  // De gezinnen in het kamp die nog geen woning hebben: wie in een tent woont, min de woningen waar nog niemand woont (af,
  // of in aanbouw); in elk daarvan trekt een gezin (T.verhuisUitHetKamp, js/begin.js).
  function zonderWoning(D) {
    const inHetKamp = T.kampTenten(D).filter((t) => inHuis(D, t).length).length;
    const leeg = D.gebouwen.filter((g) => isWoning(g) && !inHuis(D, g).length).length;
    return inHetKamp - leeg;
  }

  // De rotsen het dichtst bij het hart waar een steengroeve bij kan (`bij` van de steengroeve in js/gebouwen.js: zoveel
  // rotsen binnen zijn straal), ring na ring over het vak van de kaart; of null. Eén keer per dorp: rotsen lopen niet weg.
  const ROTSEN = new WeakMap();
  const GROEVE = new WeakMap(); // de dag waarop hij bij de schuur geen plek voor een steengroeve vond
  function rotsenBij(D) {
    if (ROTSEN.has(D)) return ROTSEN.get(D);
    const w = D.wereld;
    const vak = T.kaartVak(w);
    const { straal, minstens } = T.GEBOUWEN.steengroeve.bij;
    const h = hart(D);
    let gevonden = null;
    for (let r = 0; !gevonden && r < Math.max(vak.b, vak.h); r++) {
      for (let dy = -r; dy <= r && !gevonden; dy++) {
        const rand = Math.abs(dy) === r;
        for (let dx = -r; dx <= r; dx += rand ? 1 : 2 * r) {
          const x = h.x + dx;
          const y = h.y + dy;
          if (x < vak.x || y < vak.y || x >= vak.x + vak.b || y >= vak.y + vak.h) continue;
          if (!T.NATUUR.rotsen.telt(w, x, y, T.voorwerpOp(w, x, y)) || T.natuurBij(w, 'rotsen', { x, y, b: 1, h: 1 }, straal) < minstens) continue;
          gevonden = { x, y };
          break;
        }
      }
    }
    ROTSEN.set(D, gevonden);
    return gevonden;
  }

  // Regel 9: haalt het dorp de winter nog met `n` minder `wat` (hout of graan)? Even uitrekenen met minder in de opslag, en
  // het weer terug.
  function haaltMetMinder(D, wat, n, dag) {
    const oud = D.voorraad[wat] || 0;
    D.voorraad[wat] = oud - n;
    const haalt = (wat === 'hout' ? T.houtVoorDeWinter(D, dag) : T.etenVoorDeWinter(D, dag)).haalt;
    D.voorraad[wat] = oud;
    return haalt;
  }
  // Pak voor pak verkopen tot er `nodig` goud is: wat er over is (hout boven `houtHouden` en wat de bouwplaatsen nog
  // vragen, graan boven het zaaigraan), zolang de winter het haalt en hij het wil hebben (T.kanVerkopen).
  function verkoopVoorGoud(D, dag, nodig, waarom) {
    const verkocht = {};
    let goud = 0;
    for (const wat of ['hout', 'graan']) {
      const per = T.HANDEL_INSTELLINGEN.koopt[wat].per;
      while ((D.voorraad.goud || 0) < nodig) {
        const over = (D.voorraad[wat] || 0) - (wat === 'hout' ? T.nogTeBrengen(D, 'hout') + IN.houtHouden : T.zaaigraanApart(D, dag));
        if (over < per || !T.kanVerkopen(D, wat, 1).kan || !haaltMetMinder(D, wat, per, dag)) break;
        goud += T.verkoop(D, wat, 1).opbrengst;
        verkocht[wat] = (verkocht[wat] || 0) + per;
      }
    }
    if (!goud) return null;
    const wat = Object.entries(verkocht).map(([w, n]) => `${n} ${w}`).join(' en ');
    return { soort: 'verkoop', gelukt: true, reden: null, tekst: `verkoopt ${wat} aan de marskramer, voor ${goud} goud (${waarom})` };
  }

  // Een gebouw waar de ossenkar heen rijdt: wat iets maakt (een werkplaats), een boerderij, en een schuur met een eigen kar.
  const doorDeKar = (g) => g.klaar && (T.isBoerderij(g) || !!(T.GEBOUWEN[g.soort] && (T.GEBOUWEN[g.soort].maakt || T.GEBOUWEN[g.soort].kar)));
  const isOpslag = (g) => g.klaar && !!(T.GEBOUWEN[g.soort] && T.GEBOUWEN[g.soort].opslag);
  // Een tegel bij de deur van g waar een weg kan liggen (de deur zelf, of een tegel ernaast), of null.
  function wegPlekBij(D, g) {
    const d = T.deurVan(D.wereld, g);
    for (const [dx, dy] of [[0, 0], [0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      if (!T.waaromGeenWegOp(D, d.x + dx, d.y + dy)) return { x: d.x + dx, y: d.y + dy };
    }
    return null;
  }
  // Regel 8: de weg van de dichtste opslag naar het dichtste gebouw waar de kar heen rijdt en nog geen weg ligt.
  function wegVoorDeKar(D) {
    const opslagen = D.gebouwen.filter(isOpslag);
    const keus = [];
    for (const g of D.gebouwen) {
      if (!doorDeKar(g) || (isOpslag(g) && !T.GEBOUWEN[g.soort].kar)) continue;
      const a = wegPlekBij(D, g);
      const o = opslagen.filter((x) => x !== g).map((x) => ({ x, b: wegPlekBij(D, x) })).filter((x) => x.b)
        .sort((p, q) => T.afstand(p.b, a || p.b) - T.afstand(q.b, a || q.b))[0];
      if (!a || !o) continue;
      const plan = T.planWeg(D, o.b, a);
      if (!plan.reden) keus.push({ g, van: o.b, naar: a, n: plan.nieuw.length, d: T.afstand(o.b, a) });
    }
    const k = keus.sort((p, q) => p.d - q.d)[0];
    if (!k) return null;
    const u = T.legWeg(D, k.van, k.naar);
    return { soort: 'weg', gelukt: u.gelukt, reden: u.reden || null, instantie: u.weg || null,
      tekst: u.gelukt ? `legt een weg van ${k.n} tegels naar de ${k.g.soort} (voor de ossenkar)` : `wil een weg naar de ${k.g.soort}, maar: ${u.reden}` };
  }

  T.kolonistDag = function (D, dag) {
    if (!D.begin || D.begin.kamp === 'onderweg') return [];
    const daden = [];
    const doe = (u) => daden.push(u);
    const heeft = (soort) => D.gebouwen.some((g) => g.soort === soort);

    // 1. Het raadhuis: de eerste opslag, met zijn eigen bouwbereik.
    if (!heeft('raadhuis')) doe(bouw(D, 'raadhuis', hart(D), 'je huis en de eerste opslag'));

    // 2. Een boerderij, en akkers tot al het zaaigraan uit de kar erop past, zolang ze dit voorjaar nog gezaaid worden.
    if (!boerderijen(D).length) doe(bouw(D, 'boerderij', hart(D), 'het eten'));
    const eerste = boerderijen(D)[0];
    const zaaigraan = T.BEGIN_INSTELLINGEN.kar.zaaigraan / T.ZAAIGRAAN_PER_TEGEL;
    if (eerste && T.isNazaaitijd(dag)) {
      const nog = zaaigraan - akkerTegels(D);
      if (nog >= T.BOERDERIJ_INSTELLINGEN.veldMin) doe(legVeld(D, 'akker', eerste, nog, `voor ${zaaigraan} zaaigraan`));
    }

    // 3. Een houthakker, als het hout laag wordt.
    if (!heeft('houthakker') && ((D.voorraad.hout || 0) - T.nogTeBrengen(D, 'hout') < IN.houtLaag || !T.houtVoorDeWinter(D, dag).haalt)) {
      doe(bouw(D, 'houthakker', hart(D), 'het hout wordt laag'));
    }

    // 4. Hutten, tot elk gezin in het kamp een woning heeft.
    for (let n = zonderWoning(D); n > 0; n--) {
      const u = bouw(D, 'hut', hart(D), 'voor een gezin in het kamp');
      doe(u);
      if (!u.gelukt) break;
    }

    // 4b. Een zagerij, als iedereen een woning heeft en er een houthakker is.
    if (!heeft('zagerij') && heeft('houthakker') && zonderWoning(D) === 0) doe(bouw(D, 'zagerij', hart(D), 'planken voor het dorp'));

    // 5. Een jager, als het spel zegt dat het eten niet haalt; hooguit één per `jagerNa` dagen.
    const etenHaaltNiet = T.watDeWinterNietHaalt(D, dag).includes('eten') || !!T.OORZAKEN.honger.speelt(D, dag);
    const jagers = D.gebouwen.filter((g) => g.soort === 'jager');
    if (etenHaaltNiet && jagers.every((g) => g.klaar && g.klaarOp <= dag - IN.jagerNa)) doe(bouw(D, 'jager', hart(D), 'het eten haalt het niet'));

    // 6. Na de oogst: haalt het eten de winter niet, dan een wijnboerderij, en daarna een wijngaard erbij.
    const inJaar = dag % T.DAGEN_PER_JAAR;
    if (inJaar >= IN.naDeOogst && inJaar < IN.naDePluk && !T.etenVoorDeWinter(D, dag).haalt) {
      const wijn = D.gebouwen.find((g) => g.soort === 'wijnboerderij');
      if (!wijn) doe(bouw(D, 'wijnboerderij', hart(D), 'voor een wijngaard: het eten haalt de winter niet'));
      else if (!D.gebouwen.some((g) => g.soort === 'wijngaard' && g.boerderij === wijn) && !(D.wereld.wijngaarden || []).some((v) => v.boerderij === wijn)) {
        doe(legVeld(D, 'wijngaard', wijn, T.BOERDERIJ_INSTELLINGEN.veldMax, 'het eten haalt de winter niet'));
      }
    }

    // 7. De afwisseling: eet het dorp eentonig, dan wat een soort erbij brengt.
    if (T.OORZAKEN.eentonig.speelt(D, dag)) {
      const h = T.watHelptAanAfwisseling(D).find((x) => ['jager', 'moestuin', 'kippenhok', 'visser'].includes(x.bouw));
      const al = h ? D.gebouwen.filter((g) => g.soort === h.bouw) : [];
      if (h && al.every((g) => g.klaar && g.klaarOp <= dag - IN.afwisselingNa)) doe(bouw(D, h.bouw, hart(D), `voor ${h.soort}: het dorp eet eentonig`));
    }

    // 7b. Een schuur richting de rotsen, en als hij af is een steengroeve erbij.
    const rotsen = heeft('zagerij') && zonderWoning(D) === 0 ? rotsenBij(D) : null;
    if (rotsen && !heeft('schuur')) doe(bouw(D, 'schuur', rotsen, 'richting de rotsen: een tweede kar'));
    // (liggen de rotsen ook voor de schuur te ver, dan zoekt hij pas na `waaromNa` dagen opnieuw een plek)
    const schuur = D.gebouwen.find((g) => g.soort === 'schuur' && g.klaar);
    const groeve = GROEVE.get(D);
    if (rotsen && schuur && !heeft('steengroeve') && !(groeve != null && dag - groeve < IN.waaromNa)) {
      const u = bouw(D, 'steengroeve', { x: schuur.x, y: schuur.y }, 'steen, voor de kar van de schuur');
      if (!u.gelukt && !u.wacht) GROEVE.set(D, dag);
      doe(u);
    }

    // 7c. De soldaten: een wachthuis en een wapenmaker, en zijn die af, speermannen.
    if (heeft('zagerij') && zonderWoning(D) === 0 && (heeft('schuur') || !rotsen)) {
      if (!heeft('wachthuis')) doe(bouw(D, 'wachthuis', hart(D), 'soldaten tegen de rovers'));
      else if (!heeft('wapenmaker')) doe(bouw(D, 'wapenmaker', hart(D), 'speren en schilden voor het wachthuis'));
      const wachthuis = D.gebouwen.find((g) => g.soort === 'wachthuis' && g.klaar);
      const nu = wachthuis ? (wachthuis.soldaten || {}).speerman || 0 : 0;
      if (wachthuis && D.gebouwen.some((g) => g.soort === 'wapenmaker' && g.klaar) && nu < IN.speermannen) {
        T.zetSoldaten(D, wachthuis, 'speerman', IN.speermannen - nu);
        doe({ soort: 'soldaten', gelukt: true, reden: null, tekst: `vraagt ${IN.speermannen} speermannen in het wachthuis` });
      }
    }

    // 8. Een weg voor de ossenkar, als er niets anders gebouwd wordt.
    if (!D.gebouwen.some((g) => g.bouw && !g.klaar) && !(D.wegwerk || []).length) {
      const u = wegVoorDeKar(D);
      if (u) doe(u);
    }

    // 9. Wacht hij op goud, en is de marskramer er, dan verkoopt hij wat de winter niet nodig heeft.
    const opGoud = daden.filter((d) => d.wacht && /goud/.test(d.reden)).sort((a, b) => (T.GEBOUWEN[b.soort].kosten.goud || 0) - (T.GEBOUWEN[a.soort].kosten.goud || 0))[0];
    if (opGoud && T.kanHandelen(D)) {
      const u = verkoopVoorGoud(D, dag, T.GEBOUWEN[opGoud.soort].kosten.goud, `voor een ${opGoud.soort}`);
      if (u) doe(u);
    }
    return daden;
  };
})(globalThis.Spel = globalThis.Spel || {});
