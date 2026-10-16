// De wijngaard (werklijst vraag 136; Marcel, 8 okt: "Ik wil graag meer detail, dat je de druiven
// ziet. Dat je de boeren ziet plukken, volle en lege ranken", "Ja dat lijkt mij in orde" op het plan, en "Alles telt pas
// als het binnen is").
//
// Een wijngaard hoort bij een wijnboerderij (T.GEBOUWEN.wijnboerderij: een gewoon huis met een gezin, zoals de boerderij,
// vraag 155; Marcel, 12 okt: "ik wil tóch een apart wijnboerderij gebouw"). Je legt hem zelf, als veld naast haar (vraag
// 152, 1e; js/boerderij.js): hij staat in D.wereld.wijngaarden, als rechthoek met zijn `boerderij`. De ranken staan als
// voorwerpen (`wijnrank`, met `boerderij` het gebouw), in rijen langs de x-as met
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

  // Is dit een wijnboerderij: een boerderij die haar gezin laat plukken (T.GEBOUWEN.wijnboerderij, js/boerderij.js)?
  T.isWijnboerderij = (g) => !!g && g.soort === 'wijnboerderij';

  // Zet de ranken van wijnboerderij g op de kaart, in rijen op rechthoek r: het veld dat je legde (js/boerderij.js).
  T.zetRanken = function (D, g, r) {
    const w = D.wereld;
    for (let dy = 0; dy < r.h; dy += IN().rijOm) {
      for (let dx = 0; dx < r.b; dx++) {
        const x = r.x + dx;
        const y = r.y + dy;
        if (!T.opKaart(w, x, y) || T.voorwerpOp(w, x, y)) continue;
        T.zetVoorwerp(w, { soort: 'wijnrank', x, y, boerderij: g, variant: T.akkerVariant(x, y, IN().varianten), geplukt: null });
      }
    }
    T.kaartVeranderd(w, { x1: r.x, y1: r.y, x2: r.x + r.b - 1, y2: r.y + r.h - 1 });
  };

  // Ligt deze tegel in een wijngaard die je legde? Daar bouw je niet (T.waaromNietOpDezeGrond, js/gebouwen.js). Geeft de
  // wijnboerderij, of null.
  T.wijngaardOp = function (D, x, y) {
    const veld = ((D.wereld && D.wereld.wijngaarden) || []).find((r) => x >= r.x && x < r.x + r.b && y >= r.y && y < r.y + r.h);
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

  // Is het pluktijd voor deze wijnboerderij (klaar, en in de maand van de pluk)?
  T.isPluktijd = (g, dag) => !!g && g.klaar && IN().pluk.includes(maandNaam(dag));

  // De volle ranken die nog geplukt moeten worden.
  T.volleRanken = (D, g, dag) => T.rankenVan(D, g).filter((v) => T.rankStand(v, dag) === 'vol');

  // De wijn van zoveel ranken is binnen, bij wijnboerderij `bij`: daar ligt hij tot de ossenkar hem haalt (js/kar.js;
  // werklijst C, stap 3), zonder kar meteen in de voorraad.
  T.wijnBinnen = function (D, ranken, bij) {
    if (ranken > 0) T.opStapel(D, bij || null, 'wijn', ranken * IN().wijnPerRank);
  };

  // Een rank is geplukt.
  T.plukRank = function (v, dag) {
    v.geplukt = jaarVan(dag);
  };

  // Elke nacht (T.tikGebouwenDag, js/gebouwen.js): wat er nog in de manden zit, is mee naar huis (binnen), en of het gezin
  // morgen plukt (`g.plukt`): in pluktijd, zolang er volle ranken zijn.
  T.tikWijngaardDag = function (D, dag) {
    for (const g of D.gebouwen || []) {
      if (!T.isWijnboerderij(g)) continue;
      for (const e of (D.wereld && D.wereld.wezens) || []) {
        if (!(e.mand > 0) || !T.hoortBij(D, e)) continue;
        const p = T.bewonerVan(D, e);
        if (!p || p.huis !== g) continue;
        T.wijnBinnen(D, e.mand, g);
        e.mand = 0;
        if (e.draagt === 'mand') e.draagt = null;
      }
      const morgen = Math.floor(dag) + 1;
      g.plukt = T.isPluktijd(g, morgen) && T.volleRanken(D, g, morgen).length > 0;
    }
  };

  // Haalt de wijn het jaar na de pluk? (werklijst vraag 136; Marcel, 10 okt: "Laten we vooruitkijken doen".) Zoals het
  // hout de winter (T.houtVoorDeWinter, js/behoeften.js), met dezelfde regel (T.haaltDeWinter): wat er bij de eerstvolgende
  // pluk nog ligt, plus wat de wijnboerderijen dan plukken, min wat de heer ervoor wil, tegen wat het dorp ervan eet (zijn
  // deel van de maaltijd, T.maaltijdDeel in js/behoeften.js; vraag 154; tot 16 okt dronken de ambachtslieden er ook van,
  // een wens van hun stand, js/wensen.js), een jaar lang. Wat het tot de pluk eet, komt uit wat er nu ligt; dat maakt
  // geen nieuwe wijngaard meer goed. Een wijngaard die de bouwers nog planten, telt mee met de ranken die er straks staan. De raad
  // (js/raad.js, `wijn`) zegt het als er een wijnboerderij is en de wijn het jaar niet haalt: er moet een wijngaard bij
  // (vraag 155; tot ronde 2 van het snoeien vroeg het dorp dan een wijnboerderij erbij, een verzoek). Geeft wat
  // T.haaltDeWinter geeft, met `tot` (de dagen tot de pluk), `pluk` en `drinken` (per dag).
  T.wijnNaDePluk = function (D, dag) {
    const { tot } = T.periodeVanaf(dag, (d) => IN().pluk.includes(maandNaam(d)));
    const drinken = T.maaltijdDeel(D, 'wijn');
    const pluktijd = Math.floor(dag) + tot;
    let pluk = 0;
    for (const g of D.gebouwen || []) {
      if (!T.isWijnboerderij(g)) continue;
      const inAanleg = D.gebouwen.filter((v) => v.soort === 'wijngaard' && v.boerderij === g);
      const ranken = T.volleRanken(D, g, pluktijd).length + inAanleg.reduce((n, v) => n + rankenOp(v.voet), 0);
      const heer = T.GEBOUWEN[g.soort].heer;
      pluk += ranken * IN().wijnPerRank - ((heer && heer.wijn) || 0);
    }
    const over = Math.max(0, ((D.voorraad && D.voorraad.wijn) || 0) - drinken * tot);
    const v = T.haaltDeWinter({ voorraad: over + pluk, perWinterdag: drinken, winter: T.DAGEN_PER_JAAR });
    return Object.assign(v, { tot, pluk, drinken });
  };

  // Zoveel ranken zet T.zetRanken op een leeg stuk van deze maat { b, h }.
  const rankenOp = (maat) => Math.ceil(maat.h / IN().rijOm) * maat.b;

  // Wie plukt er bij deze boerderij met een wijngaard: wie er woont en zou kunnen werken (js/bewoners.js, T.LEEFTIJDEN).
  T.plukkersVan = (D, g) => ((D.bewoners && D.bewoners.mensen) || []).filter((p) => p.huis === g && p.wezen && !p.weg && T.LEEFTIJDEN[p.leeftijd] && T.LEEFTIJDEN[p.leeftijd].werkt != null);
})(globalThis.Spel = globalThis.Spel || {});
