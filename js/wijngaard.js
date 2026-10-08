// De wijngaard van de wijnboerderij (werklijst vraag 136; Marcel, 8 okt: "Ik wil graag meer detail, dat je de druiven
// ziet. Dat je de boeren ziet plukken, volle en lege ranken", "Ja dat lijkt mij in orde" op het plan, en "Alles telt pas
// als het binnen is").
//
// De wijnboerderij (T.GEBOUWEN.wijnboerderij) is een huis met ernaast een wijngaard, binnen één voet: het huis is vast
// (muur), de wijngaard niet. Daarin staan de ranken als voorwerpen (`wijnrank`, met `wijnboerderij` het gebouw), in rijen
// langs de x-as met een pad ertussen, zodat je ertussen loopt en wie plukt naast zijn rank staat. Een rank staat erbij
// naar de maand (T.rankStand): kaal in de winter, blad in de lente en de zomer, vol met trossen van oogstmaand tot de pluk,
// en leeg als hij geplukt is (`v.geplukt`: het jaar waarin) of de pluk voorbij is.
//
// De pluk is in wijnmaand (`alleenIn` van de soort, T.stilOp in js/gebouwen.js): dan plukt het gezin dat er woont
// (`g.plukt`, elke nacht gezet door T.tikWijngaardDag; zolang werken ze nergens anders, kanWerken in js/bewoners.js) rank
// voor rank met een mand (het werk staat in js/veldwerk.js, `pluk`), en een volle mand brengt het naar het huis. Dan pas
// is de wijn binnen (T.wijnBinnen): wijnPerRank per rank. Wat 's avonds nog in de mand zit, gaat mee naar huis (de nacht).
// Een rank die de pluk niet haalt, levert niets.
(function (T) {
  'use strict';

  T.WIJNGAARD_INSTELLINGEN = {
    // Het stuk van de voet (10 bij 8) waar de ranken staan: rechts van het huis, de tekening van gereedschap/pixelart/dorp2.cjs.
    stuk: { x: 5, y: 0, b: 5, h: 8 },
    // Om de zoveel tegels een rij ranken; ertussen het pad.
    rijOm: 2,
    // Zoveel wijn per geplukte rank (20 ranken: 300 wijn in een jaar, wat de wijnboerderij eerst in wijnmaand per dag maakte).
    wijnPerRank: 15,
    // Zo lang plukt hij aan een rank, in uren.
    plukUren: 1,
    // Zoveel ranken gaan er in een mand; dan brengt hij hem naar het huis.
    mand: 4,
    // Hoe een rank erbij staat, per maand (wat er niet staat, is leeg).
    kaal: ['wintermaand', 'louwmaand', 'sprokkelmaand', 'lentemaand'],
    blad: ['grasmaand', 'bloeimaand', 'zomermaand', 'hooimaand'],
    vol: ['oogstmaand', 'herfstmaand', 'wijnmaand'],
    // Zoveel varianten heeft elke stand op het vel (beelden/wijnrank.png).
    varianten: 3,
  };
  const IN = () => T.WIJNGAARD_INSTELLINGEN;

  const jaarVan = (dag) => Math.floor(dag / T.DAGEN_PER_JAAR);
  const maandNaam = (dag) => T.MAANDEN[T.datumVanDag(dag).maand].naam;

  // De ranken van een wijnboerderij.
  T.rankenVan = (D, g) => ((D.wereld && D.wereld.voorwerpen) || []).filter((v) => v.soort === 'wijnrank' && v.wijnboerderij === g);

  // Zet de ranken van een wijnboerderij op de kaart (vanuit zetGebouwVoorwerp in js/gebouwen.js), in rijen op het stuk.
  T.zetRanken = function (D, g) {
    const w = D.wereld;
    const s = IN().stuk;
    for (let dy = 0; dy < s.h; dy += IN().rijOm) {
      for (let dx = 0; dx < s.b; dx++) {
        const x = g.x + s.x + dx;
        const y = g.y + s.y + dy;
        if (!w.tegels[y] || w.tegels[y][x] === undefined || T.voorwerpOp(w, x, y)) continue;
        T.zetVoorwerp(w, { soort: 'wijnrank', x, y, wijnboerderij: g, variant: T.akkerVariant(x, y, IN().varianten), geplukt: null });
      }
    }
    T.kaartVeranderd(w);
  };

  // Ligt deze tegel in de voet van een wijnboerderij, en niet in het huis? Dan is het de wijngaard: daar bouw je niet
  // (T.waaromNietOpDezeGrond, js/erven.js). Geeft de wijnboerderij, of null.
  T.wijngaardOp = function (D, x, y) {
    for (const g of D.gebouwen || []) {
      if (g.soort !== 'wijnboerderij' || !g.voet) continue;
      if (x >= g.x && x < g.x + g.voet.b && y >= g.y && y < g.y + g.voet.h) return g;
    }
    return null;
  };

  // Hoe een rank erbij staat op deze dag: 'kaal', 'blad', 'vol' of 'leeg'.
  T.rankStand = function (v, dag) {
    const m = maandNaam(dag);
    if (IN().kaal.includes(m)) return 'kaal';
    if (IN().blad.includes(m)) return 'blad';
    if (IN().vol.includes(m)) return v.geplukt === jaarVan(dag) ? 'leeg' : 'vol';
    return 'leeg';
  };

  // Is het pluktijd voor deze wijnboerderij (klaar, en in de maand van de pluk)?
  T.isPluktijd = (g, dag) => !!g && g.klaar && !T.stilOp(T.GEBOUWEN[g.soort], dag);

  // De volle ranken die nog geplukt moeten worden.
  T.volleRanken = (D, g, dag) => T.rankenVan(D, g).filter((v) => T.rankStand(v, dag) === 'vol');

  // De wijn van zoveel ranken is binnen: hij komt in de voorraad.
  T.wijnBinnen = function (D, ranken) {
    if (ranken > 0) T.wijzigVoorraad(D, 'wijn', ranken * IN().wijnPerRank);
  };

  // Een rank is geplukt.
  T.plukRank = function (v, dag) {
    v.geplukt = jaarVan(dag);
  };

  // Elke nacht (T.tikGebouwenDag, js/gebouwen.js): wat er nog in de manden zit, is mee naar huis (binnen), en of het gezin
  // morgen plukt (`g.plukt`): in pluktijd, zolang er volle ranken zijn.
  T.tikWijngaardDag = function (D, dag) {
    for (const g of D.gebouwen || []) {
      if (g.soort !== 'wijnboerderij') continue;
      for (const e of (D.wereld && D.wereld.wezens) || []) {
        if (!(e.mand > 0)) continue;
        const p = T.bewonerVan(D, e);
        if (!p || p.huis !== g) continue;
        T.wijnBinnen(D, e.mand);
        e.mand = 0;
        if (e.draagt === 'mand') e.draagt = null;
      }
      const morgen = Math.floor(dag) + 1;
      g.plukt = T.isPluktijd(g, morgen) && T.volleRanken(D, g, morgen).length > 0;
    }
  };

  // Wie plukt er bij deze wijnboerderij: wie er woont en zou kunnen werken (js/bewoners.js, T.LEEFTIJDEN).
  T.plukkersVan = (D, g) => ((D.bewoners && D.bewoners.mensen) || []).filter((p) => p.huis === g && p.wezen && !p.weg && T.LEEFTIJDEN[p.leeftijd] && T.LEEFTIJDEN[p.leeftijd].werkt != null);
})(globalThis.Spel = globalThis.Spel || {});
