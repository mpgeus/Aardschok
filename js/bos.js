// Het bos: wat er te rooien staat, wie het rooit, en wanneer een bouwplaats die erop wachtte, er ligt (werklijst vraag
// 110, e, met 115; Marcel, 6 okt: "A ja B ja C ja D zo"). Gemeten op vier landen van de maker: met rooien passen er twee à
// drie keer zoveel erven, en een groot deel staat al in de wei.
//
// Een stuk dat gerooid moet worden (de kavel), hoort bij een gebouw dat erop wacht (`wachtOpRooien`): de hut van een gezin
// op zijn erf (js/erven.js), of een werkplaats die een inwoner vroeg waar geen open grond meer was (js/verzoeken.js).
// Zolang telt het gebouw al mee (de hut als huis van het gezin), maar staat het nog niet op de kaart (T.bouwGebouw,
// js/gebouwen.js). Wie het rooit, zegt T.rooitHij: het hoofd van het gezin, of de inwoner die de werkplaats vroeg (zijn
// meester). Hij hakt en rooit met dezelfde bijl en op dezelfde manier als een boer die bos ontgint (js/veldwerk.js), en
// werkt zolang nergens anders (js/bewoners.js). Is het stuk vrij, dan ligt de bouwplaats er de volgende dag; na
// `rooiDagen` (T.ERVEN_INSTELLINGEN, js/erven.js) rooien de buren de rest in één keer (T.tikRooienDag). Wat een boom
// geeft, staat op één plek: T.ONTGINNEN_INSTELLINGEN.houtPerBoom (js/ontginnen.js), wie hem ook omhakt. En het bos is van
// de heer: een stuk met minstens zoveel bomen als een stuk bos bij het ontginnen, kost zijn gunst (T.inHetBosVanDeHeer).
//
//   g.wachtOpRooien  het gebouw wacht nog op het rooien
//   g.kavel          { x, y, b, h }: het stuk dat eerst vrij moet (bij een erf het erf, bij een werkplaats zijn voet met
//                    het looppad eromheen)
//   g.rooienTot      de dag waarop de buren de rest rooien
//   p.rooit          de werkplaats die deze inwoner vroeg en nu rooit (bij een hut volgt het uit het gezin)
//
// Regels zonder scherm, dus te toetsen (test/rooien.test.cjs).
(function (T) {
  'use strict';

  const dagNu = (D) => Math.floor((D.kalender && D.kalender.dag) || 0);

  // De tegels van het vak r ({ x, y, b, h }) waar iets te rooien staat (een boom, een stronk, een struik; T.ontginWerkOp,
  // js/ontginnen.js), rij voor rij, zoals wie rooit ze afwerkt (js/veldwerk.js).
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
    const hout = wat.bomen * T.ONTGINNEN_INSTELLINGEN.houtPerBoom;
    return `${delen.join(' en ')}${hout ? ` (+${hout} hout)` : ''}`;
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
  // (js/erven.js), of de werkplaats die hij vroeg (js/verzoeken.js).
  T.rooitHij = (p) => {
    if (!p) return null;
    if (p.huis && p.huis.wachtOpRooien && !p.hoofd) return p.huis;
    return p.rooit && p.rooit.wachtOpRooien ? p.rooit : null;
  };

  // Wie dit gebouw rooit: het hoofd van het gezin in de hut, of de meester van de werkplaats; null als hij er niet meer
  // is.
  function rooierVan(D, g) {
    if (g.erf) return (D.bewoners && D.bewoners.mensen.find((p) => p.huis === g && !p.hoofd)) || null;
    return g.meester && D.bewoners && D.bewoners.mensen.includes(g.meester) ? g.meester : null;
  }

  // Wat er op deze tegel te rooien staat, in één keer weg: een boom om (het hout naar de schuur) en zijn stronk eruit, of
  // een stronk of een struik eruit (js/ontginnen.js).
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
})(globalThis.Spel = globalThis.Spel || {});
