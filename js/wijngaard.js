// De wijngaard (werklijst vraag 136; Marcel, 8 okt: "Ik wil graag meer detail, dat je de druiven
// ziet. Dat je de boeren ziet plukken, volle en lege ranken", "Ja dat lijkt mij in orde" op het plan, en "Alles telt pas
// als het binnen is").
//
// Een wijngaard hoort bij een boerderij. In het lege begin leg je hem zelf, als veld bij een boerderij, die daarmee een
// wijnboer is (vraag 152, 1e; js/boerderij.js): hij staat in D.wereld.wijngaarden, als rechthoek met zijn `boerderij`. In
// het gehucht dat er al was, is het de wijnboerderij (T.GEBOUWEN.wijnboerderij): een huis met ernaast een wijngaard, binnen
// één voet; het huis is vast (muur), de wijngaard niet. Welke boerderij een wijngaard heeft, zegt T.veldVan
// (js/boerderij.js). De ranken staan als voorwerpen (`wijnrank`, met `boerderij` het gebouw), in rijen langs de x-as met
// een pad ertussen, zodat je ertussen loopt en wie plukt naast zijn rank staat. Een rank staat erbij
// naar de maand (T.rankStand): kaal in de winter, blad in de lente en de zomer, vol met trossen van oogstmaand tot de pluk,
// en leeg als hij geplukt is (`v.geplukt`: het jaar waarin) of de pluk voorbij is.
//
// De pluk is in wijnmaand (`pluk` hieronder): dan plukt het gezin dat er woont
// (`g.plukt`, elke nacht gezet door T.tikWijngaardDag; zolang werken ze nergens anders, kanWerken in js/bewoners.js) rank
// voor rank met een mand (het werk staat in js/veldwerk.js, `pluk`), en een volle mand brengt het naar het huis. Dan pas
// is de wijn binnen (T.wijnBinnen): wijnPerRank per rank. Wat 's avonds nog in de mand zit, gaat mee naar huis (de nacht).
// Een rank die de pluk niet haalt, levert niets.
(function (T) {
  'use strict';

  T.WIJNGAARD_INSTELLINGEN = {
    // Het stuk van de voet van de wijnboerderij (10 bij 8) waar de ranken staan: rechts van het huis, de tekening van
    // gereedschap/pixelart/dorp2.cjs.
    stuk: { x: 5, y: 0, b: 5, h: 8 },
    // Om de zoveel tegels een rij ranken; ertussen het pad.
    rijOm: 2,
    // Zoveel wijn per geplukte rank (20 ranken: 300 wijn in een jaar, wat de wijnboerderij eerst in wijnmaand per dag maakte).
    wijnPerRank: 15,
    // De maanden van de pluk (dezelfde als `alleenIn` van de wijnboerderij, T.GEBOUWEN.wijnboerderij).
    pluk: ['wijnmaand'],
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

  // De ranken van de wijngaard van boerderij g.
  T.rankenVan = (D, g) => ((D.wereld && D.wereld.voorwerpen) || []).filter((v) => v.soort === 'wijnrank' && v.boerderij === g);

  // Heeft deze boerderij een wijngaard (een wijnboerderij, of een boerderij die er een kreeg, js/boerderij.js)?
  T.heeftWijngaard = (g) => T.veldVan(g) === 'wijngaard';

  // Zet de ranken van boerderij g op de kaart, in rijen op rechthoek r: bij de wijnboerderij het stuk van haar voet
  // (vanuit zetGebouwVoorwerp in js/gebouwen.js), bij een wijngaard die je legde het veld (js/boerderij.js).
  T.zetRanken = function (D, g, r = { x: g.x + IN().stuk.x, y: g.y + IN().stuk.y, b: IN().stuk.b, h: IN().stuk.h }) {
    const w = D.wereld;
    for (let dy = 0; dy < r.h; dy += IN().rijOm) {
      for (let dx = 0; dx < r.b; dx++) {
        const x = r.x + dx;
        const y = r.y + dy;
        if (!w.tegels[y] || w.tegels[y][x] === undefined || T.voorwerpOp(w, x, y)) continue;
        T.zetVoorwerp(w, { soort: 'wijnrank', x, y, boerderij: g, variant: T.akkerVariant(x, y, IN().varianten), geplukt: null });
      }
    }
    T.kaartVeranderd(w);
  };

  // Ligt deze tegel in een wijngaard: in de voet van een wijnboerderij (en niet in het huis), of in een wijngaard die je
  // legde? Daar bouw je niet (T.waaromNietOpDezeGrond, js/gebouwen.js). Geeft de boerderij, of null.
  T.wijngaardOp = function (D, x, y) {
    const binnen = (r) => x >= r.x && x < r.x + r.b && y >= r.y && y < r.y + r.h;
    for (const g of D.gebouwen || []) {
      if (g.soort === 'wijnboerderij' && g.voet && binnen({ x: g.x, y: g.y, b: g.voet.b, h: g.voet.h })) return g;
    }
    const veld = ((D.wereld && D.wereld.wijngaarden) || []).find(binnen);
    return veld ? veld.boerderij : null;
  };

  // Hoe een rank erbij staat op deze dag: 'kaal', 'blad', 'vol' of 'leeg'.
  T.rankStand = function (v, dag) {
    const m = maandNaam(dag);
    if (IN().kaal.includes(m)) return 'kaal';
    if (IN().blad.includes(m)) return 'blad';
    if (IN().vol.includes(m)) return v.geplukt === jaarVan(dag) ? 'leeg' : 'vol';
    return 'leeg';
  };

  // Is het pluktijd voor deze boerderij met een wijngaard (klaar, en in de maand van de pluk)?
  T.isPluktijd = (g, dag) => !!g && g.klaar && IN().pluk.includes(maandNaam(dag));

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
      if (!T.heeftWijngaard(g)) continue;
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

  // Haalt de wijn het jaar na de pluk? (werklijst vraag 136; Marcel, 10 okt: "Laten we vooruitkijken doen".) Zoals het
  // hout de winter (T.houtVoorDeWinter, js/behoeften.js), met dezelfde regel (T.haaltDeWinter): wat er bij de eerstvolgende
  // pluk nog ligt, plus wat de wijnboerderijen dan plukken, min wat de heer ervoor wil, tegen wat de huizen die wijn
  // willen per dag drinken, een jaar lang. Wat ze tot de pluk drinken, komt uit wat er nu ligt; dat maakt geen nieuwe
  // wijnboerderij meer goed. Tot ronde 2 van het snoeien (12 okt) vroeg het dorp dan een wijnboerderij erbij (een
  // verzoek, js/verzoeken.js); nu vraagt niemand het meer, en slaapt dit tot we weten hoe de wijnboerderij wordt (werklijst,
  // vraag 155). Geeft wat T.haaltDeWinter geeft, met `tot` (de dagen tot de pluk), `pluk`
  // en `drinken` (per dag).
  T.wijnNaDePluk = function (D, dag) {
    const { tot } = T.periodeVanaf(dag, (d) => IN().pluk.includes(maandNaam(d)));
    const drinken = wijnDrinkers(D) * (T.WENSEN_INSTELLINGEN.perMens.wijn || 0);
    const pluktijd = Math.floor(dag) + tot;
    let pluk = 0;
    for (const g of D.gebouwen || []) {
      if (!T.heeftWijngaard(g)) continue;
      // Een wijnboerderij die nog niet op de kaart staat, heeft nog geen ranken: dan zoveel als er straks staan.
      const nogNiet = g.soort === 'wijnboerderij' && !T.rankenVan(D, g).length;
      const ranken = nogNiet ? rankenPerWijngaard() : T.volleRanken(D, g, pluktijd).length;
      const heer = T.GEBOUWEN[g.soort].heer;
      pluk += ranken * IN().wijnPerRank - ((heer && heer.wijn) || 0);
    }
    const over = Math.max(0, ((D.voorraad && D.voorraad.wijn) || 0) - drinken * tot);
    const v = T.haaltDeWinter({ voorraad: over + pluk, perWinterdag: drinken, winter: T.DAGEN_PER_JAAR });
    return Object.assign(v, { tot, pluk, drinken });
  };

  // Wie wijn wil: de mensen van de laagste stand die het wil, en van de standen erboven (T.mensenVanStand, js/wensen.js).
  function wijnDrinkers(D) {
    const stand = Object.keys(T.STANDEN).find((s) => !T.STANDEN[s].los && T.wensenVanStand(s).includes('wijn'));
    return stand ? T.mensenVanStand(D, stand) : 0;
  }

  // Zoveel ranken zet T.zetRanken op een leeg stuk.
  const rankenPerWijngaard = () => Math.ceil(IN().stuk.h / IN().rijOm) * IN().stuk.b;

  // Wie plukt er bij deze boerderij met een wijngaard: wie er woont en zou kunnen werken (js/bewoners.js, T.LEEFTIJDEN).
  T.plukkersVan = (D, g) => ((D.bewoners && D.bewoners.mensen) || []).filter((p) => p.huis === g && p.wezen && !p.weg && T.LEEFTIJDEN[p.leeftijd] && T.LEEFTIJDEN[p.leeftijd].werkt != null);
})(globalThis.Spel = globalThis.Spel || {});
