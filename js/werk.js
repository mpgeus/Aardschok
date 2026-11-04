// Het werk verdelen (Marcel, 2 nov: "Een speler moet altijd bezig kunnen zijn zonder dat het spel zonder hem of haar speelt
// als het ware"; 4 nov: "misschien hebben we een indicator nodig van hoeveel er op een specifiek moment wordt geoogst ...
// hoe meer mensen op houthakken, hoe meer je binnenhaalt ... Een boerderij heeft wel een max aantal mensen wat er kan
// werken, eigenlijk ieder gebouw", en op het plan "1. A 2. A 3. Prima, 1 houthakker is bijvoorbeeld max 2 man, en een 2e
// houthakkerij is +2 max"; ontwerp/gameloop.md, "Het werk verdelen").
//
// Jij zet per soort werkplaats hoeveel mensen er werken (D.inzet: { soort: zoveel }), tot het maximum van zijn klare
// gebouwen samen (`handen` in T.GEBOUWEN, per gebouw). T.verdeelHanden (js/gebouwen.js) verdeelt ze over de gebouwen van die
// soort, het eerst gebouwde eerst. Een gebouw dat af komt, krijgt er 1 bij (T.komtKlaar, js/gebouwen.js); meer kies jij. Een
// soort waar je nog niets voor koos, heeft 1 man per gebouw.
// Wie niet werkt, draagt en bouwt mee (js/kar.js, js/bouwen.js): dat is de afweging. Een spel van vóór 4 nov (een dorp
// zonder D.inzet) krijgt alles vol, zoals het toen was. Wat het werk oplevert, per dag nu en vol, zegt T.werkRijen, voor het
// werkpaneel (js/werkpaneel.js, de knop Work en W).
//
// Regels zonder scherm, getoetst in test/werk.test.cjs. Een verandering is een opdracht (`inzet`, js/tik.js).
(function (T) {
  'use strict';

  const handenVan = (soort) => (T.GEBOUWEN[soort] && T.GEBOUWEN[soort].handen) || 0;
  const klareVan = (D, soort) => (D.gebouwen || []).filter((g) => g.soort === soort && g.klaar);

  // Hoeveel er van een soort werkplaats hooguit kunnen werken: het maximum van al zijn klare gebouwen samen.
  T.werkMax = (D, soort) => klareVan(D, soort).length * handenVan(soort);

  // D.inzet, en is die er niet (een spel van vóór 4 nov, of een dorp uit een toets), alles vol, zoals het toen was. (Krijgt
  // een boerderij ooit veel meer handen, kijk dan of dat nog klopt: vol zou dan de dragers en bouwers nemen.)
  T.zorgInzet = function (D) {
    if (!D.inzet) {
      D.inzet = {};
      for (const g of D.gebouwen || []) if (g.klaar && handenVan(g.soort)) D.inzet[g.soort] = T.werkMax(D, g.soort);
    }
    return D.inzet;
  };

  // Hoeveel jij er van een soort wilt, nooit meer dan het maximum; nog niets gekozen, dan 1 per gebouw.
  T.werkInzet = function (D, soort) {
    const n = T.zorgInzet(D)[soort];
    return Math.min(T.werkMax(D, soort), n != null ? n : klareVan(D, soort).length);
  };

  // Zet de inzet van een soort op n (de opdracht `inzet`, js/tik.js), tussen 0 en het maximum; de handen gaan meteen.
  T.zetInzet = function (D, soort, n) {
    if (!handenVan(soort)) return;
    T.zorgInzet(D)[soort] = Math.max(0, Math.min(T.werkMax(D, soort), Math.round(n)));
    T.verdeelHanden(D);
  };

  // Een gebouw komt af (T.komtKlaar): er komt 1 man bij (Marcel: "2. A"), meer kies jij. (Koos je voor die soort nog niets,
  // dan telt hij vanzelf mee: 1 per gebouw.)
  T.werkBijNieuwGebouw = function (D, g) {
    const inzet = T.zorgInzet(D);
    if (!handenVan(g.soort) || inzet[g.soort] == null) return;
    inzet[g.soort] = Math.min(T.werkMax(D, g.soort), inzet[g.soort] + 1);
  };

  // Het hele dorp vol: elke soort op zijn maximum.
  T.werkVol = function (D) {
    const inzet = T.zorgInzet(D);
    for (const g of D.gebouwen || []) if (g.klaar && handenVan(g.soort)) inzet[g.soort] = T.werkMax(D, g.soort);
  };

  // Hoeveel er vandaag werken, en hoeveel er zouden kunnen werken: { werken, handen, vrij }. Wie vrij is, draagt en bouwt
  // mee.
  T.werkTelling = function (D) {
    const handen = T.werkendeHanden(D);
    const werken = (D.gebouwen || []).reduce((n, g) => n + (g.klaar ? g.handen || 0 : 0), 0);
    return { werken, handen, vrij: Math.max(0, handen - werken) };
  };

  // Een rij van het werkpaneel per soort werkplaats die er klaar staat, in de volgorde van T.GEBOUWEN:
  // { soort, n (jouw inzet), bezet (wie er nu werkt), max, perDag, vol, stil }. perDag en vol zijn { waar: zoveel per dag }:
  // wat zijn gebouwen nu maken, en wat ze met alle handen zouden maken, met de afwisseling en het gereedschap van vandaag;
  // een werkplaats die iets omzet, alleen als er genoeg ligt (dat zegt `stil`, de reden van gisteren). Een boerderij maakt
  // niets per dag (haar oogst komt van de akkers): haar rij heeft `oogst`, wat ze dit jaar binnenhaalde, en haar akkers.
  T.werkRijen = function (D) {
    const dag = (D.kalender && D.kalender.dag) || 0;
    const werk = T.werkVanAfwisseling(D);
    const gereedschap = T.gereedschapDekking(D).factor;
    const rijen = [];
    for (const soort of Object.keys(T.GEBOUWEN)) {
      const S = T.GEBOUWEN[soort];
      if (!S.handen) continue;
      const klaar = klareVan(D, soort);
      if (!klaar.length) continue;
      const rij = { soort, n: T.werkInzet(D, soort), bezet: 0, max: klaar.length * S.handen, perDag: {}, vol: {}, stil: null };
      const uit = S.maakt && !S.maakt.keuze ? S.maakt.uit : null;
      for (const g of klaar) {
        rij.bezet += g.handen || 0;
        if (g.tekort) rij.stil = T.t('short of {wat}', { wat: T.waarNaam(g.tekort) });
        else if (g.stilWant) rij.stil = g.stilWant;
        if (!uit) continue;
        const kan = T.stilOp(S, dag) || T.houthakkerZonderBoom(g) ? 0 : werk * gereedschap * T.visserWater(D, g);
        for (const wat in uit) {
          const perHand = (uit[wat] / S.handen) * kan;
          rij.perDag[wat] = (rij.perDag[wat] || 0) + perHand * (g.handen || 0);
          rij.vol[wat] = (rij.vol[wat] || 0) + perHand * S.handen;
        }
      }
      if (T.isBoerderij(klaar[0])) {
        rij.oogst = {};
        for (const g of klaar) for (const [wat, n] of Object.entries(T.gemaaktDoor(D, g, true))) rij.oogst[wat] = (rij.oogst[wat] || 0) + n;
        rij.akkers = klaar.reduce((n, g) => n + T.akkersVanBoerderij(D, g).length, 0);
      }
      rijen.push(rij);
    }
    return rijen;
  };
})(globalThis.Spel = globalThis.Spel || {});
