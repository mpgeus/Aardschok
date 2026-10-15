// De koorts (werklijst vraag 144, 3; Marcel, 9 okt: "Ziekte en brand als status is ook goed"; en als richtlijn, 1 okt:
// "Iets wat begint en eindigt. Mogelijk in verschillende niveaus").
//
// De koorts begint zelf, alleen in de kou of in een vol dorp (de statussen kou en vol, T.OORZAKEN in js/statussen.js),
// met een kleine kans per dag: dan zijn iemand en zijn gezin ziek, en een bericht brengt je naar zijn huis (sinds 15 okt,
// ronde 3 van het snoeien: tot dan was ze een voorval, waarin je koos tussen de put, bier of bidden). Elke nacht
// (T.tikKoortsDag) steekt een zieke soms een ander aan, vaker als het dorp vol is of het koud is. Wie ziek is, ligt een
// week in bed (p.ziek, p.thuisTot: hij werkt niet, T.blijftThuis in js/bewoners.js), en een enkele keer sterft hij, de
// ouden en de kinderen vaker. Wie het had, krijgt het deze keer niet weer. Zolang er iemand ziek is, is het de status
// "Koorts", en erger "Epidemie" als een tiende van het dorp ziek is. De getallen in T.KOORTS_INSTELLINGEN.
(function (T) {
  'use strict';

  T.KOORTS_INSTELLINGEN = {
    // In de kou of in een vol dorp begint de koorts met deze kans per dag, in de winter maal `winter` (Marcel, 15 okt:
    // "Ja", even vaak als het voorval kwam: zo'n 2% per dag, en in de winter dubbel).
    kans: 0.02,
    winter: 2,
    // Bij het begin zijn zoveel mensen ziek: iemand en zijn gezin.
    begin: 3,
    // Elke nacht steekt een zieke met deze kans een ander aan; in een vol dorp (vol of overvol) en in de kou maal deze
    // getallen.
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

  // De koorts van nu staat in D.koorts: { gehad: wie het had (ids), sinds }, of null. Wie ziek is, heeft p.ziek: de dag dat
  // hij beter is.
  T.zieken = (D) => (D.koorts && D.bewoners ? D.bewoners.mensen.filter((p) => p.ziek) : []);
  T.koortsNiveau = function (D) {
    if (!D.koorts) return 0;
    const n = T.zieken(D).length;
    if (!n) return 0;
    return n >= Math.max(IN().epidemieMinstens, IN().epidemie * (D.bevolking || 0)) ? 2 : 1;
  };

  // De pestbos (Marcel, 10 okt: "Ja, zo"; alleen beeld, niets in Spel.S): een bos stro aan een paal naast de deur van elk
  // huis met een zieke, zolang er iemand ziek is (gereedschap/pixelart/pestbos.cjs; js/tekenen.js tekent hem). Hij staat
  // op een tegel naast de deur, langs de muur, waar niets staat; is die er niet, dan op de deurtegel, iets opzij. Geeft
  // [{ g, x, y }].
  T.pestbossen = function (D, w) {
    if (!w) return [];
    const huizen = new Set(T.zieken(D).map((p) => p.huis).filter((g) => g && g.klaar !== false && !g.brand));
    const uit = [];
    for (const g of huizen) {
      const deur = T.deurVan(w, g);
      const v = T.voetVanGebouw(g);
      const inVoet = (x, y) => x >= v.x && x < v.x + v.b && y >= v.y && y < v.y + v.h;
      const tegenDeMuur = (x, y) => !inVoet(x, y) && x >= v.x - 1 && x <= v.x + v.b && y >= v.y - 1 && y <= v.y + v.h;
      const naast = [[1, 0], [-1, 0], [0, 1], [0, -1]]
        .map(([dx, dy]) => ({ x: deur.x + dx, y: deur.y + dy }))
        .find((t) => tegenDeMuur(t.x, t.y) && T.isBegaanbaar(w, t.x, t.y) && !T.voorwerpOp(w, t.x, t.y));
      uit.push(naast ? { g, x: naast.x, y: naast.y } : { g, x: deur.x + 0.4, y: deur.y });
    }
    return uit;
  };

  function wordtZiek(D, p, dag) {
    const K = D.koorts;
    const [van, tot] = IN().ziekDagen;
    const dagen = van + Math.floor(T.vastLot(D, Math.floor(dag), 3000 + p.id) * (tot - van + 1));
    p.ziek = Math.floor(dag) + dagen;
    p.thuisTot = Math.max(p.thuisTot || 0, p.ziek);
    if (!K.gehad.includes(p.id)) K.gehad.push(p.id);
  }

  // Het begin (T.tikKoortsDag, en Spel.debug.koorts('nu')): iemand die hier woont, geloot met een vast lot, en zijn
  // gezin, tot `begin` mensen. Een bericht brengt je naar zijn huis.
  T.beginKoorts = function (D, dag) {
    const kan = D.bewoners.mensen.filter((p) => !p.weg && !p.komt && !p.schout && !(p.hoofd && p.hoofd.schout) && p.wezen && !p.wezen.dood);
    if (!kan.length) return;
    const wie = kan[Math.floor(T.vastLot(D, dag, 3001) * kan.length)];
    D.koorts = { gehad: [], sinds: Math.floor(dag) };
    const gezin = kan.filter((p) => p !== wie && p.gezin === wie.gezin);
    const zieken = [wie, ...gezin].slice(0, IN().begin);
    for (const p of zieken) wordtZiek(D, p, dag);
    const woorden = { wie: T.hoofdletter(T.naamVanBewoner(wie)), n: zieken.length - 1 };
    const tekst = woorden.n ? T.t('Fever! {wie} and {n|one more|# more} are ill in bed.', woorden) : T.t('Fever! {wie} is ill in bed.', woorden);
    T.zeg(D, tekst, 'gevaar', wie.huis ? T.deurVan(D.wereld, wie.huis) : null);
  };

  // Elke nacht (T.tikGebouwenDag, js/gebouwen.js).
  T.tikKoortsDag = function (D, dag) {
    if (!D.bewoners) return;
    const dorp = T.oorzakenNu(D, dag);
    const kou = dorp.some((o) => o.id === 'kou');
    const vol = dorp.some((o) => o.id === 'vol');
    if (!D.koorts) {
      const kans = IN().kans * (T.datumVanDag(dag).seizoen === 'winter' ? IN().winter : 1);
      if ((kou || vol) && T.vastLot(D, dag, 3000) < kans) T.beginKoorts(D, dag);
      return; // aansteken doet ze vanaf morgen
    }
    const K = D.koorts;
    const kans = IN().besmet * (vol ? IN().vol : 1) * (kou ? IN().kou : 1);
    const zieken = T.zieken(D);
    const gezond = D.bewoners.mensen.filter((p) => !p.ziek && !p.weg && !K.gehad.includes(p.id));
    // Wie ziek is, steekt aan, sterft soms, of is beter.
    zieken.forEach((p, i) => {
      if (gezond.length && T.vastLot(D, dag, 3100 + p.id) < kans) {
        const j = Math.floor(T.vastLot(D, dag, 3200 + p.id) * gezond.length);
        wordtZiek(D, gezond.splice(j, 1)[0], dag);
      }
      if (T.vastLot(D, dag, 3300 + p.id + i) < (IN().sterft[p.leeftijd] || IN().sterft.volwassen)) {
        T.wijzigBevolking(D, -1, 'ziekte', T.t('The fever'), [p]);
        return;
      }
      if (dag >= p.ziek) delete p.ziek;
    });
    if (!T.zieken(D).length) {
      const doden = K.gehad.filter((id) => !D.bewoners.mensen.some((p) => p.id === id)).length;
      const woorden = { n: K.gehad.length, ziek: T.telwoord(K.gehad.length), m: doden, dood: T.telwoord(doden) };
      T.zeg(D, doden
        ? T.t('The fever is over. {n|One person was ill|{ziek} people were ill}, and {m|one died|{dood} died}.', woorden)
        : T.t('The fever is over. {n|One person was ill|{ziek} people were ill}.', woorden), doden ? 'gevaar' : 'goed');
      D.koorts = null;
    }
  };

  // In een zin, voor de status: wie er ziek is.
  T.koortsWaarom = function (D) {
    const n = T.zieken(D).length;
    return T.t('{n|one person is ill in bed|{aantal} people are ill in bed}', { n, aantal: T.telwoord(n) });
  };
})(globalThis.Spel = globalThis.Spel || {});
