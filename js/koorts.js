// De koorts (werklijst vraag 144, 3; Marcel, 9 okt: "Ziekte en brand als status is ook goed"; en als richtlijn, 1 okt:
// "Iets wat begint en eindigt. Mogelijk in verschillende niveaus").
//
// Het voorval "de koorts" (js/voorvallen.js, vaker in de kou en in een vol dorp) is het begin: wie het zegt en zijn gezin
// zijn ziek. Elke nacht (T.tikKoortsDag) steekt een zieke soms een ander aan, vaker als het dorp vol is of het koud is;
// wat je antwoordde (doe.koorts: de put schoonmaken, bier in plaats van water, of bidden), maakt dat minder. Wie ziek is,
// ligt een week in bed (p.ziek, p.thuisTot: hij werkt niet, T.blijftThuis in js/bewoners.js), en een enkele keer sterft
// hij, de ouden en de kinderen vaker. Wie het had, krijgt het deze keer niet weer. Zolang er iemand ziek is, is het de
// status "Koorts" (T.OORZAKEN), en erger "Epidemie" als een tiende van het dorp ziek is. De spelregel "Koorts"; de
// getallen in T.KOORTS_INSTELLINGEN.
(function (T) {
  'use strict';

  T.KOORTS_INSTELLINGEN = {
    // Verspreidt de koorts zich (de spelregel "Koorts")? Anders is het voorval wat het was: een kans op een dode.
    aan: true,
    // Bij het begin zijn zoveel mensen ziek: wie het zegt en zijn gezin.
    begin: 3,
    // Elke nacht steekt een zieke met deze kans een ander aan; in een vol dorp (vol of overvol) en in de kou maal deze
    // getallen. Wat je deed (doe.koorts, in procenten), maakt het zoveel keer zo groot: 50 is half zo vaak.
    besmet: 0.12,
    vol: 1.5,
    kou: 1.5,
    // Zo lang is iemand ziek (van, tot, in dagen), en de kans per dag dat hij sterft: een volwassene, een kind of een oude.
    ziekDagen: [5, 9],
    sterft: { volwassen: 0.004, jong: 0.004, kind: 0.012, kleuter: 0.012, oud: 0.025 },
    // Een epidemie: zoveel van het dorp is ziek, en minstens zoveel mensen.
    epidemie: 0.1,
    epidemieMinstens: 5,
  };
  const IN = () => T.KOORTS_INSTELLINGEN;

  // De koorts van nu staat in D.koorts: { gehad: wie het had (ids), maat: wat je deed, sinds }, of null. Wie ziek is, heeft
  // p.ziek: de dag dat hij beter is.
  T.zieken = (D) => (D.koorts && D.bewoners ? D.bewoners.mensen.filter((p) => p.ziek) : []);
  T.koortsNiveau = function (D) {
    if (!IN().aan || !D.koorts) return 0;
    const n = T.zieken(D).length;
    if (!n) return 0;
    return n >= Math.max(IN().epidemieMinstens, IN().epidemie * (D.bevolking || 0)) ? 2 : 1;
  };

  function wordtZiek(D, p, dag) {
    const K = D.koorts;
    const [van, tot] = IN().ziekDagen;
    const dagen = van + Math.floor(T.vastLot(D, Math.floor(dag), 3000 + p.id) * (tot - van + 1));
    p.ziek = Math.floor(dag) + dagen;
    p.thuisTot = Math.max(p.thuisTot || 0, p.ziek);
    if (!K.gehad.includes(p.id)) K.gehad.push(p.id);
  }

  // Het begin (T.tikKoortsDag, als het voorval begint): wie het zegt en zijn gezin.
  function begin(D, L, dag) {
    D.koorts = { gehad: [], maat: 1, sinds: Math.floor(dag) };
    const wie = L.ander || L.wie;
    const gezin = D.bewoners.mensen.filter((p) => p !== wie && wie && p.gezin === wie.gezin && !p.weg);
    for (const p of [wie, ...gezin].filter(Boolean).slice(0, IN().begin)) wordtZiek(D, p, dag);
  }

  // Wat je deed (doe.koorts, in procenten: 50 is half zo vaak aansteken).
  T.koortsMaatregel = function (D, procent) {
    const L = D.voorvallen && D.voorvallen.lopend;
    if (L) L.koortsMaat = procent / 100;
    if (D.koorts) D.koorts.maat = procent / 100;
  };

  // Elke nacht (T.tikGebouwenDag, js/gebouwen.js, na de voorvallen).
  T.tikKoortsDag = function (D, dag) {
    if (!IN().aan || !D.bewoners) return;
    const L = D.voorvallen && D.voorvallen.lopend;
    if (L && L.id === 'ziekte' && !L.koortsBegon) {
      L.koortsBegon = true;
      begin(D, L, dag);
      if (L.koortsMaat != null) D.koorts.maat = L.koortsMaat;
      return; // aansteken doet ze vanaf morgen
    }
    const K = D.koorts;
    if (!K) return;
    const dorp = T.oorzakenNu(D, dag);
    const kans = IN().besmet * K.maat * (dorp.some((o) => o.id === 'vol') ? IN().vol : 1) * (dorp.some((o) => o.id === 'kou') ? IN().kou : 1);
    const zieken = T.zieken(D);
    const gezond = D.bewoners.mensen.filter((p) => !p.ziek && !p.weg && !K.gehad.includes(p.id));
    // Wie ziek is, steekt aan, sterft soms, of is beter.
    zieken.forEach((p, i) => {
      if (gezond.length && T.vastLot(D, dag, 3100 + p.id) < kans) {
        const j = Math.floor(T.vastLot(D, dag, 3200 + p.id) * gezond.length);
        wordtZiek(D, gezond.splice(j, 1)[0], dag);
      }
      if (T.vastLot(D, dag, 3300 + p.id + i) < (IN().sterft[p.leeftijd] || IN().sterft.volwassen)) {
        T.wijzigBevolking(D, -1, 'ziekte', 'De koorts', [p]);
        return;
      }
      if (dag >= p.ziek) delete p.ziek;
    });
    if (!T.zieken(D).length) {
      const doden = K.gehad.filter((id) => !D.bewoners.mensen.some((p) => p.id === id)).length;
      T.zeg(D, `De koorts is voorbij. ${T.hoofdletter(T.telwoord(K.gehad.length))} ${K.gehad.length === 1 ? 'was' : 'waren'} ziek${doden ? `, en ${T.telwoord(doden)} ${doden === 1 ? 'stierf' : 'stierven'}` : ''}.`, doden ? 'gevaar' : 'goed');
      D.koorts = null;
    }
  };

  // In een zin, voor de status: wie er ziek is.
  T.koortsWaarom = function (D) {
    const n = T.zieken(D).length;
    return `${T.telwoord(n)} ${n === 1 ? 'mens ligt' : 'mensen liggen'} ziek in bed`;
  };
})(globalThis.Spel = globalThis.Spel || {});
