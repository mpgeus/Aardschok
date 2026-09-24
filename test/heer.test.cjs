// De heer zonder scherm (js/heer.js): wat hij ziet en dus vraagt, wat iets voor hem waard is, wat
// een betaling tot gevolg heeft, de straffen, zijn brief en zijn komst, en zijn poppetje. Het
// zaaien en de oogst die daarvoor moesten kloppen, staan in test/akkers.test.cjs. Zie
// ontwerp/spel.md, "Sint-Maarten: de heer komt innen" (Marcel koos het op 24 sep 2026) en
// ontwerp/werklijst.md, punt 5.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/leeftijd.js');
require('../js/tijd.js');
require('../js/wereld.js');
require('../js/voorraad.js');
require('../js/mensen.js');
require('../js/gebouwen.js');
require('../js/behoeften.js');
require('../js/akkers.js');
require('../js/gesprek.js');
require('../js/gesprekken.js');
require('../js/handel.js');
require('../js/heer.js');
const T = globalThis.Toren;
const IN = T.HEER_INSTELLINGEN;

// De dag (vanaf het begin van het spel, 1 lentemaand) van een datum, in het eerste of een later jaar.
function dagVan(maand, dagVanMaand, jaar) {
  const m = T.MAANDEN.findIndex((x) => x.naam === maand);
  return (jaar || 0) * T.DAGEN_PER_JAAR + ((m - T.TIJD_START_MAAND + 12) % 12) * T.DAGEN_PER_MAAND + dagVanMaand - 1;
}
const SINT_MAARTEN = dagVan('slachtmaand', 11);

// Een gehucht zonder kaart: een brink (de plek van de marskramer), twee akkers van samen tien
// tegels, en geen weg de kaart op. Zonder weg is er geen poppetje, en staat de heer er meteen.
function maakS() {
  const S = {
    voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0,
    kalender: { dag: 0, snelheid: 1 }, inventaris: new Set(),
    wereld: {
      marskramer: { x: 5, y: 5 }, overgangen: [], wezens: [],
      akkers: [{ x: 0, y: 0, b: 2, h: 3 }, { x: 10, y: 0, b: 1, h: 4 }],
    },
  };
  return S;
}

// Het gehucht zoals het begint: 25 mensen, vijf boerderijen en een huis.
function gehucht() {
  const S = maakS();
  S.bevolking = 25;
  for (let i = 0; i < 5; i++) S.gebouwen.push({ soort: 'boerderij', klaar: true });
  S.gebouwen.push({ soort: 'huis', klaar: true });
  return S;
}

// Een gehucht waar de heer nu staat te wachten.
function metHeer(S) {
  S = S || gehucht();
  S.kalender.dag = SINT_MAARTEN;
  T.heerKomt(S, SINT_MAARTEN);
  return S;
}

// Geef hem een deel (0..1) van elk goed dat hij vraagt, naar beneden afgerond, en zorg dat je het hebt.
function geefDeel(S, deel) {
  const eis = T.eisVanDeHeer(S);
  const geef = {};
  for (const wat in eis.per) {
    T.zetVoorraad(S, wat, eis.per[wat]);
    geef[wat] = Math.floor(eis.per[wat] * deel);
  }
  return geef;
}

// ---------------------------------------------------------------------------------------------
// Wat hij ziet, en wat dat waard is
// ---------------------------------------------------------------------------------------------

test('hij vraagt naar wat hij ziet: pacht per akkertegel, hoofdgeld per mens, en per gebouw zijn prijs', () => {
  const S = gehucht();
  const eis = T.eisVanDeHeer(S);
  assert.equal(eis.per.graan, Math.ceil(10 * IN.pachtPerAkkertegel));
  // 25 zielen × 0,2 = 5, vijf boerderijen × 1 = 5, en een huis 2.
  assert.equal(eis.per.goud, 5 + 5 + 2);
  assert.deepEqual(eis.volgorde, ['graan', 'goud']);
  assert.ok(eis.regels.some((r) => /akkertegels/.test(r.waarom)));
  assert.ok(eis.regels.some((r) => /25 zielen/.test(r.waarom)));
  assert.ok(eis.regels.some((r) => /5 × boerderij/.test(r.waarom)));
});

test('hij vraagt in wat hij ziet: wol bij schapen, eieren bij kippen, hout voor zijn bos', () => {
  const S = maakS();
  S.wereld.akkers = [];
  S.gebouwen.push({ soort: 'schaapskooi', klaar: true }, { soort: 'kippenhok', klaar: true }, { soort: 'houthakker', klaar: true });
  const eis = T.eisVanDeHeer(S);
  assert.deepEqual(eis.per, { wol: 20, eieren: 20, hout: 20 });
});

test('een hut kost niets, een verstopplek ziet hij niet, en een steiger telt al als huis', () => {
  const S = maakS();
  S.wereld.akkers = [];
  S.gebouwen.push({ soort: 'hut', klaar: true }, { soort: 'verstopplek', klaar: true });
  assert.deepEqual(T.eisVanDeHeer(S).per, {});
  S.gebouwen.push({ soort: 'huis', klaar: false });
  assert.deepEqual(T.eisVanDeHeer(S).per, { goud: 2 });
  // Een stenen huis maakt hem hebberig.
  S.gebouwen.push({ soort: 'stenenHuis', klaar: true });
  assert.ok(T.eisVanDeHeer(S).per.goud > 2 + 2);
});

test('elke soort gebouw heeft een prijs voor de heer, al is het niets', () => {
  for (const [id, g] of Object.entries(T.GEBOUWEN)) {
    assert.ok(g.heer && typeof g.heer === 'object', `${id} heeft geen heer-prijs`);
    for (const [wat, n] of Object.entries(g.heer)) assert.ok(n > 0, `${id}: ${wat} ${n}`);
  }
});

test('hij rondt naar boven af, en wat je schuldig bleef, komt erbij', () => {
  const S = maakS();
  S.wereld.akkers = [{ x: 0, y: 0, b: 1, h: 7 }]; // 7 × 0,5 = 3,5
  S.heer = T.nieuweHeer();
  S.heer.schuld = 9;
  const eis = T.eisVanDeHeer(S);
  assert.equal(eis.per.graan, 4);
  assert.equal(eis.per.goud, 9);
  assert.ok(eis.regels.some((r) => /schuldig/.test(r.waarom)));
});

test('wat iets voor hem waard is, komt uit de prijzen van de marskramer', () => {
  assert.equal(T.waardeVoorDeHeer('goud'), 1);
  assert.ok(Math.abs(T.waardeVoorDeHeer('graan') - 0.3) < 1e-9); // (4 + 3 + 2) / 3 per 10
  assert.ok(Math.abs(T.waardeVoorDeHeer('wol') - 8 / 15) < 1e-9); // (3 + 2 + 3) / 3 per 5
  assert.equal(T.waardeVoorDeHeer('steen'), IN.waarde.steen); // die koopt de marskramer niet
  assert.equal(T.waardeVoorDeHeer('iets'), IN.waardeAnders);
});

// ---------------------------------------------------------------------------------------------
// Wat een betaling tot gevolg heeft
// ---------------------------------------------------------------------------------------------

test('alles geven: geen straf', () => {
  const S = metHeer();
  const g = T.gevolgVanBetaling(S, geefDeel(S, 1));
  assert.equal(g.kan, true);
  assert.equal(g.deel, 1);
  assert.equal(g.straf, null);
  assert.equal(g.schuld, 0);
  assert.match(g.tekst, /alles wat hij vraagt/);
});

test('hij telt slecht: tot een tiende te weinig merkt hij niet', () => {
  const S = metHeer();
  const g = T.gevolgVanBetaling(S, geefDeel(S, 0.93));
  assert.ok(g.deel >= 0.9 && g.deel < 1, `deel ${g.deel}`);
  assert.equal(g.straf, null);
  assert.equal(g.schuld, 0);
  assert.match(g.tekst, /telt slecht/);
});

test('tot twee derde een boete: het tekort komt volgend jaar terug, met de helft erbij', () => {
  const S = metHeer();
  const g = T.gevolgVanBetaling(S, geefDeel(S, 0.8));
  assert.equal(g.straf, 'boete');
  assert.ok(g.boete && !g.soldaten && !g.schandpaal);
  assert.equal(g.schuld, Math.ceil(g.tekort * (1 + IN.boete) - 1e-9));
  assert.match(g.tekst, new RegExp(`${g.schuld} goud`));
});

test('tot de helft ook soldaten, daaronder ook de schandpaal, en dat is veel te weinig', () => {
  const S = metHeer();
  const soldaten = T.gevolgVanBetaling(S, geefDeel(S, 0.6));
  assert.equal(soldaten.straf, 'soldaten');
  assert.ok(soldaten.boete && soldaten.soldaten && !soldaten.schandpaal);
  assert.ok(!soldaten.veelTeWeinig);
  const paal = T.gevolgVanBetaling(S, geefDeel(S, 0.3));
  assert.equal(paal.straf, 'schandpaal');
  assert.ok(paal.boete && paal.soldaten && paal.schandpaal);
  assert.ok(paal.veelTeWeinig);
  assert.ok(!paal.ambtKwijt, 'de eerste keer kost het je ambt nog niet');
  assert.match(paal.tekst, /nog een keer/);
});

test('goud neemt hij altijd in de plaats van iets anders: hij ziet alleen geld', () => {
  const S = metHeer();
  const eis = T.eisVanDeHeer(S);
  const graanWaard = Math.ceil(eis.per.graan * T.waardeVoorDeHeer('graan'));
  T.zetVoorraad(S, 'goud', eis.per.goud + graanWaard + 50);
  const g = T.gevolgVanBetaling(S, { graan: 0, goud: 999 });
  assert.equal(g.deel, 1);
  assert.equal(g.straf, null);
  // Hij neemt niet meer goud dan nodig is om alles te dekken.
  assert.equal(g.neemt.goud, eis.per.goud + graanWaard);
});

test('hij neemt nooit meer dan je hebt, en niet meer dan hij vraagt', () => {
  const S = metHeer();
  const eis = T.eisVanDeHeer(S);
  T.zetVoorraad(S, 'graan', 3);
  T.zetVoorraad(S, 'goud', 1000);
  const g = T.gevolgVanBetaling(S, { graan: 500, goud: 0 });
  assert.equal(g.neemt.graan, 3);
  T.zetVoorraad(S, 'graan', 1000);
  assert.equal(T.gevolgVanBetaling(S, { graan: 500 }).neemt.graan, eis.per.graan);
});

test('zonder de heer kan er niet betaald worden', () => {
  const S = gehucht();
  const g = T.gevolgVanBetaling(S, { goud: 5 });
  assert.equal(g.kan, false);
  assert.ok(g.reden);
  assert.equal(T.betaalHeer(S, { goud: 5 }).kan, false);
});

// ---------------------------------------------------------------------------------------------
// Betalen, en de straffen
// ---------------------------------------------------------------------------------------------

test('betalen haalt het uit de voorraad, en daarna gaat hij', () => {
  const S = metHeer();
  const geef = geefDeel(S, 1);
  const g = T.betaalHeer(S, geef);
  assert.equal(g.straf, null);
  assert.equal(S.voorraad.graan, 0);
  assert.equal(S.voorraad.goud, 0);
  assert.equal(S.heer.schuld, 0);
  // Zonder poppetje is hij meteen weg, en zijn vlaggen met hem.
  assert.equal(S.heer.bezoek, null);
  assert.ok(!T.heeftVlag(S, 'heerOpBezoek'));
  assert.equal(S.heer.jaren.length, 1);
  assert.equal(S.heer.jaren[0].jaar, T.datumVanDag(SINT_MAARTEN).jaar);
});

test('een boete komt het jaar erna terug in wat hij vraagt, en is dan betaald of niet', () => {
  const S = metHeer();
  const g = T.betaalHeer(S, geefDeel(S, 0.8));
  assert.equal(S.heer.schuld, g.schuld);
  const volgendJaar = T.eisVanDeHeer(S);
  assert.equal(volgendJaar.per.goud, 12 + g.schuld);
  // Een jaar later alles betaald: de schuld is weg.
  S.kalender.dag = dagVan('slachtmaand', 11, 1);
  T.heerKomt(S, S.kalender.dag);
  T.betaalHeer(S, geefDeel(S, 1));
  assert.equal(S.heer.schuld, 0);
});

test('soldaten eten mee tot de lente, maken het dorp ontevreden, en gaan dan weer', () => {
  const S = metHeer();
  T.betaalHeer(S, geefDeel(S, 0.6));
  const s = S.heer.soldaten;
  assert.ok(s, 'er zijn soldaten ingekwartierd');
  assert.equal(s.tot, dagVan('lentemaand', 1, 1), 'tot 1 lentemaand van het volgende jaar');
  assert.ok(T.heeftVlag(S, 'soldatenInHuis'));
  assert.deepEqual(T.heerOntevredenheid(S, SINT_MAARTEN + 1).waarom, ['soldaten in huis']);
  // Ze eten elk voor drie.
  T.zetVoorraad(S, 'graan', 100);
  T.tikHeerDag(S, SINT_MAARTEN + 1);
  const perDag = IN.soldaten * IN.soldaatEetAls * T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag;
  assert.ok(Math.abs(S.voorraad.graan - (100 - perDag)) < 1e-9);
  // In de lente gaan ze.
  T.tikHeerDag(S, s.tot);
  assert.equal(S.heer.soldaten, null);
  assert.ok(!T.heeftVlag(S, 'soldatenInHuis'));
  assert.equal(T.heerOntevredenheid(S, s.tot).minder, 0);
});

test('de schandpaal: jij wijst aan wie, en het dorp onthoudt het een tijd', () => {
  const S = metHeer();
  S.wereld.wezens.push(T.maakMens('boer2', 3, 3), T.maakMens('boer3', 4, 4));
  const g = T.betaalHeer(S, geefDeel(S, 0.3));
  assert.ok(g.schandpaal);
  assert.ok(S.heer.bezoek && S.heer.bezoek.schandpaal, 'hij wacht op jouw keuze');
  const keuzes = T.schandpaalKeuzes(S);
  assert.deepEqual(keuzes.map((k) => k.wie), ['boer2', 'boer3', 'schout']);
  assert.equal(keuzes[0].naam, 'Aaltje');
  assert.match(keuzes[0].eigenschap, /weduwe/);
  const r = T.zetAanDeSchandpaal(S, 'boer2');
  assert.equal(r.kan, true);
  assert.ok(T.heeftVlag(S, 'schandpaalBoer2'), 'haar gesprek weet het');
  assert.equal(S.heer.bezoek, null, 'daarna gaat de heer');
  // Ze staat op de brink, en na haar dagen mag ze weer naar huis.
  const aaltje = S.wereld.wezens.find((e) => e.wie === 'boer2');
  assert.ok(aaltje.moetNaar);
  assert.deepEqual(T.wandelAnker(aaltje, 'gemaaid'), aaltje.moetNaar);
  T.tikHeerDag(S, SINT_MAARTEN + IN.schandpaalDagen);
  assert.equal(aaltje.moetNaar, null);
  // Het dorp is minder tevreden, en dat slijt weg.
  const nu = T.heerOntevredenheid(S, SINT_MAARTEN);
  assert.ok(Math.abs(nu.minder - (IN.soldatenOntevreden + T.MENSEN.boer2.schandpaal)) < 1e-9);
  assert.ok(nu.waarom.includes('de schandpaal'));
  const later = T.heerOntevredenheid(S, SINT_MAARTEN + IN.wrokDagen / 2);
  assert.ok(later.minder < nu.minder);
  assert.ok(!T.heerOntevredenheid(S, SINT_MAARTEN + IN.wrokDagen).waarom.includes('de schandpaal'));
});

test('de schandpaal kost het dorp zoveel als wie jij kiest: de weduwe meer dan de woekeraar', () => {
  assert.ok(T.MENSEN.boer2.schandpaal > T.MENSEN.boer3.schandpaal);
  for (const id of ['boer1', 'boer2', 'boer3', 'boer4', 'boer5']) {
    assert.ok(T.MENSEN[id].eigenschap, `${id} heeft geen eigenschap`);
    assert.notEqual(T.naamVanMens(id), 'de boer', `${id} heeft geen naam`);
  }
});

test('de schout mag zichzelf aanwijzen: het dorp neemt het niet kwalijk, maar de boete gaat omhoog', () => {
  const S = metHeer();
  T.betaalHeer(S, geefDeel(S, 0.3));
  const schuldVoor = S.heer.schuld;
  const zelf = T.schandpaalKeuzes(S).find((k) => k.wie === 'schout');
  assert.ok(zelf.boete > 0);
  assert.equal(zelf.kost, 0);
  T.zetAanDeSchandpaal(S, 'schout');
  assert.equal(S.heer.schuld, schuldVoor + zelf.boete);
  assert.ok(T.heeftVlag(S, 'schoutAanDeSchandpaal'));
  assert.ok(!T.heerOntevredenheid(S, SINT_MAARTEN).waarom.includes('de schandpaal'));
});

test('twee keer achter elkaar veel te weinig, en je bent je ambt kwijt', () => {
  const S = metHeer();
  const eerste = T.betaalHeer(S, geefDeel(S, 0.3));
  assert.ok(!eerste.ambtKwijt);
  T.zetAanDeSchandpaal(S, 'schout');
  assert.equal(S.heer.veelTeWeinig, 1);
  S.kalender.dag = dagVan('slachtmaand', 11, 1);
  T.heerKomt(S, S.kalender.dag);
  const tweede = T.betaalHeer(S, geefDeel(S, 0.3));
  assert.ok(tweede.ambtKwijt);
  assert.ok(S.einde, 'het spel is uit');
  assert.equal(S.einde.reden, 'ambt');
  // Een jaar ertussen dat wel goed ging, telt opnieuw.
  const S2 = metHeer();
  T.betaalHeer(S2, geefDeel(S2, 0.3));
  T.zetAanDeSchandpaal(S2, 'schout');
  S2.kalender.dag = dagVan('slachtmaand', 11, 1);
  T.heerKomt(S2, S2.kalender.dag);
  T.betaalHeer(S2, geefDeel(S2, 1));
  assert.equal(S2.heer.veelTeWeinig, 0);
});

// ---------------------------------------------------------------------------------------------
// De dagen: brief, komst, wachten
// ---------------------------------------------------------------------------------------------

test('op 1 wijnmaand komt zijn brief, met wat hij dan zou vragen', () => {
  const S = gehucht();
  const oudeUi = T.ui;
  let getoond = 0;
  T.ui = { toonBrief: () => getoond++ };
  try {
    T.tikHeerDag(S, dagVan('herfstmaand', 30));
    assert.ok(!S.heer.brief);
    T.tikHeerDag(S, dagVan('wijnmaand', 1));
  } finally {
    T.ui = oudeUi;
  }
  assert.ok(S.heer.brief);
  assert.deepEqual(S.heer.brief.eis.per, T.eisVanDeHeer(S).per);
  assert.ok(T.heeftVlag(S, 'briefVanDeHeer'));
  assert.equal(getoond, 1, 'het venster met de brief gaat open');
  // Ná zijn brief, en vóór het laatste bezoek van de marskramer: dan kun je nog verkopen.
  const marskramer = T.HANDEL_INSTELLINGEN.bezoeken[2];
  assert.ok(dagVan('wijnmaand', 1) < dagVan(marskramer.maand, marskramer.dag));
});

test('op Sint-Maarten komt hij zelf, en staat de tijd stil tot je bij hem bent geweest', () => {
  const S = gehucht();
  S.kalender.snelheid = 3;
  S.kalender.dag = SINT_MAARTEN;
  T.tikHeerDag(S, SINT_MAARTEN);
  assert.ok(T.heerWacht(S));
  assert.ok(T.heeftVlag(S, 'heerOpBezoek'));
  assert.equal(S.kalender.snelheid, 0, 'de tijd staat stil');
  assert.equal(S.heer.snelheidVoorWachten, 1, 'hij kwam op 1× (van 3× teruggezet), en zo gaat het straks verder');
  T.betaalHeer(S, geefDeel(S, 1));
  assert.equal(S.kalender.snelheid, 1, 'na het betalen loopt de tijd weer');
});

test('wie hem vorig jaar wat schuldig bleef, hoort het van hem (vlag voor zijn gesprek)', () => {
  const S = gehucht();
  S.heer = T.nieuweHeer();
  S.heer.schuld = 5;
  T.heerKomt(S, SINT_MAARTEN);
  assert.ok(T.heeftVlag(S, 'heerSchuld'));
});

test('kom je niet, dan neemt hij het na zijn wachtdagen zelf, en goud in de plaats van wat ontbreekt', () => {
  const S = gehucht();
  S.kalender.dag = SINT_MAARTEN;
  T.tikHeerDag(S, SINT_MAARTEN);
  const eis = T.eisVanDeHeer(S);
  T.zetVoorraad(S, 'graan', eis.per.graan - 2);
  T.zetVoorraad(S, 'goud', eis.per.goud + 10);
  T.tikHeerDag(S, SINT_MAARTEN + IN.wachtDagen - 1);
  assert.ok(T.heerWacht(S), 'hij wacht nog');
  T.tikHeerDag(S, SINT_MAARTEN + IN.wachtDagen);
  assert.ok(!T.heerWacht(S), 'hij heeft het zelf genomen');
  assert.equal(S.voorraad.graan, 0);
  // Twee graan te weinig, en dat in goud: 2 × 0,3 = 0,6, naar boven 1.
  assert.equal(S.voorraad.goud, 10 - 1);
  assert.equal(S.heer.jaren[0].straf, null);
});

test('komt hij zelf halen en moet er iemand aan de schandpaal, dan wijst hij zelf: wie het dorp het meest raakt', () => {
  const S = gehucht();
  S.wereld.wezens.push(T.maakMens('boer2', 3, 3), T.maakMens('boer3', 4, 4));
  S.kalender.dag = SINT_MAARTEN;
  T.tikHeerDag(S, SINT_MAARTEN);
  T.tikHeerDag(S, SINT_MAARTEN + IN.wachtDagen); // niets in de voorraad
  assert.ok(T.heeftVlag(S, 'schandpaalBoer2'), 'de weduwe');
  assert.equal(S.heer.bezoek, null);
});

test('waar geen brink is (het oude spel), komt hij nooit', () => {
  const S = gehucht();
  S.wereld.marskramer = null;
  for (let dag = 0; dag < T.DAGEN_PER_JAAR; dag++) T.tikHeerDag(S, dag);
  assert.ok(!S.heer);
});

test('elk jaar opnieuw: brief, Sint-Maarten, en weer weg', () => {
  const S = gehucht();
  for (let dag = 1; dag < 2 * T.DAGEN_PER_JAAR; dag++) {
    S.kalender.dag = dag;
    T.tikHeerDag(S, dag);
    if (T.heerWacht(S)) T.betaalHeer(S, geefDeel(S, 1));
  }
  assert.equal(S.heer.jaren.length, 2);
});

// ---------------------------------------------------------------------------------------------
// Zijn poppetje, en zijn gesprek
// ---------------------------------------------------------------------------------------------

test('zijn poppetje komt over de weg met twee soldaten, en op de brink wacht hij', () => {
  const S = gehucht();
  S.wereld.overgangen = [{ x: 9, y: 5, naar: 'wereld' }];
  S.kalender.dag = SINT_MAARTEN;
  T.tikHeerDag(S, SINT_MAARTEN);
  assert.ok(!S.heer.bezoek.staat, 'hij moet nog lopen');
  T.werkHeerBij(S);
  const [heer, s1, s2] = S.heer.bezoek.wezens;
  assert.equal(heer.wie, 'heer');
  assert.equal(s1.wie, 'soldaat');
  assert.equal(s2.wie, 'soldaat');
  assert.deepEqual([heer.tx, heer.ty], [9, 5], 'hij komt binnen over de weg');
  assert.deepEqual([heer.thuis.x, heer.thuis.y], [5, 5], 'en loopt naar de brink');
  heer.tx = heer.x = 5;
  heer.ty = heer.y = 5;
  T.werkHeerBij(S);
  assert.ok(S.heer.bezoek.staat);
  assert.equal(S.heer.bezoek.wachtTot, SINT_MAARTEN + IN.wachtDagen);
  // Betaald met soldaten: de soldaten blijven, de heer loopt weg.
  T.betaalHeer(S, geefDeel(S, 0.6));
  assert.deepEqual(S.heer.soldaten.wezens, [s1, s2]);
  assert.deepEqual([heer.thuis.x, heer.thuis.y], [9, 5]);
  heer.tx = heer.x = 9;
  T.werkHeerBij(S);
  assert.equal(S.heer.bezoek, null);
  assert.equal(S.wereld.wezens.indexOf(heer), -1);
  assert.ok(S.wereld.wezens.includes(s1), 'de soldaten zijn er nog');
  // In de lente lopen ook zij weg.
  T.tikHeerDag(S, S.heer.soldaten.tot);
  for (const s of [s1, s2]) {
    s.tx = s.x = 9;
    s.ty = s.y = 5;
  }
  T.werkHeerBij(S);
  assert.equal(S.heer.soldaten, null);
  assert.equal(S.wereld.wezens.indexOf(s1), -1);
});

test('zijn gesprek opent het betalen, en na het betalen niet meer', () => {
  const S = metHeer();
  const knoop = T.gesprekKnoop(S, 'heer', 'welkom');
  assert.ok(knoop.keuzes.some((k) => k.doe && k.doe.heer));
  const oudeUi = T.ui;
  let geopend = 0;
  T.ui = { openHeer: () => geopend++ };
  try {
    T.doeGevolg(S, { heer: true });
  } finally {
    T.ui = oudeUi;
  }
  assert.equal(geopend, 1);
  T.zetVlag(S, 'heerBetaald');
  assert.ok(!T.gesprekKnoop(S, 'heer', 'welkom').keuzes.some((k) => k.doe && k.doe.heer));
});

test('de dagen aan de schandpaal tellen pas als hij er staat (drie dagen zijn op 1× maar zeven seconden)', () => {
  const S = metHeer();
  S.wereld.overgangen = [{ x: 9, y: 5, naar: 'wereld' }];
  const aaltje = T.maakMens('boer2', 3, 3);
  S.wereld.wezens.push(aaltje);
  T.betaalHeer(S, geefDeel(S, 0.3));
  T.zetAanDeSchandpaal(S, 'boer2');
  const paal = aaltje.moetNaar;
  assert.ok(paal);
  // Ze is er nog niet: haar dagen tellen niet.
  T.tikHeerDag(S, SINT_MAARTEN + IN.schandpaalDagen + 1);
  assert.deepEqual(aaltje.moetNaar, paal);
  // Ze staat er: nu wel.
  aaltje.tx = aaltje.x = paal.x;
  aaltje.ty = aaltje.y = paal.y;
  S.kalender.dag = SINT_MAARTEN + 5;
  T.werkHeerBij(S);
  T.tikHeerDag(S, SINT_MAARTEN + 5 + IN.schandpaalDagen - 1);
  assert.deepEqual(aaltje.moetNaar, paal, 'nog niet genoeg dagen');
  T.tikHeerDag(S, SINT_MAARTEN + 5 + IN.schandpaalDagen);
  assert.equal(aaltje.moetNaar, null, 'haar dagen zijn om: ze mag naar huis');
});
