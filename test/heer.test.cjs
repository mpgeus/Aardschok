// De heer zonder scherm (js/heer.js): wat hij ziet en dus vraagt, wat iets voor hem waard is, wat
// een betaling tot gevolg heeft, de straffen, zijn brief en zijn komst, en zijn poppetje. Het
// zaaien en de oogst die daarvoor moesten kloppen, staan in test/akkers.test.cjs. Zie
// ontwerp/spel.md, "Sint-Maarten: de heer komt innen" (Marcel koos het op 24 sep 2026) en
// ontwerp/werklijst.md, punt 5.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
// Het spel van vóór de twee bazen (werklijst vraag 106): de heer ontslaat je na twee keer veel te weinig. De twee bazen staan in test/bazen.test.cjs.
T.zetOptie('tweeBazen', 'uit');
const IN = T.HEER_INSTELLINGEN;
// Deze toetsen rekenen met de pacht per akkertegel: vast en makkelijk na te tellen. Een deel van het graan
// in de schuren (de standaard) staat in de toets "een deel van het graan en het goud" verderop.
IN.graan = 'pacht';
// En zonder zijn buitensporigheid (eisMaal; Marcel, 18 okt, B2): die maakt alles even veel groter, en staat in de toets
// "buitensporig" verderop.
const EIS_MAAL = IN.eisMaal;
IN.eisMaal = 1;

// De dag (vanaf het begin van het spel, 1 lentemaand) van een datum, in het eerste of een later jaar.
function dagVan(maand, dagVanMaand, jaar) {
  const m = T.MAANDEN.findIndex((x) => x.naam === maand);
  return (jaar || 0) * T.DAGEN_PER_JAAR + ((m - T.TIJD_START_MAAND + 12) % 12) * T.DAGEN_PER_MAAND + dagVanMaand - 1;
}
const SINT_MAARTEN = dagVan('slachtmaand', 11);

// Een gehucht zonder kaart: een plein (de plek van de marskramer), twee akkers van samen tien
// tegels, en geen weg de kaart op. Zonder weg is er geen poppetje, en staat de heer er meteen.
function maakS() {
  const S = {
    voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0,
    kalender: { dag: 0, snelheid: 1 },
    wereld: {
      wezens: [],
      akkers: [{ x: 0, y: 0, b: 2, h: 3 }, { x: 10, y: 0, b: 1, h: 4 }],
    },
    plek: { marskramer: { x: 5, y: 5 } }, // de plek van het dorp (D.plek, js/wereld.js)
  };
  for (const a of S.wereld.akkers) a.dorp = S; // een veld is van een dorp (T.hoortBij is streng sinds stap 6a2)
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

// Een boer aan wie de heer de schandpaal kan geven (T.isBoer, js/boerderij.js): het hoofd van het gezin op een boerderij
// die er al staat, met zijn poppetje op (x, y). Geeft zijn poppetje; aan de schandpaal heet hij 'bewoner' en zijn nummer.
function boerOp(S, naam, x, y) {
  const B = S.bewoners || (S.bewoners = { mensen: [], volgende: 1 });
  const hoeve = S.gebouwen.find((g) => g.soort === 'boerderij' && !B.mensen.some((q) => q.huis === g));
  const p = { id: B.volgende++, naam, geslacht: 'vrouw', leeftijd: 'volwassen', hoofd: null, gezin: B.mensen.length + 1, huis: hoeve };
  const e = Object.assign(T.maakDorpeling(p.id, x, y), { naam, bewoner: p, dorp: S });
  p.wezen = e;
  B.mensen.push(p);
  S.wereld.wezens.push(e);
  return e;
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
  assert.ok(eis.regels.some((r) => /tiles of field/.test(r.waarom)));
  assert.ok(eis.regels.some((r) => /25 souls/.test(r.waarom)));
  assert.ok(eis.regels.some((r) => /5 × farm/.test(r.waarom)));
});

test('hij vraagt in wat hij ziet: wol bij schapen, eieren bij kippen, hout voor zijn bos', () => {
  const S = maakS();
  S.wereld.akkers = [];
  S.gebouwen.push({ soort: 'schaapskooi', klaar: true }, { soort: 'kippenhok', klaar: true }, { soort: 'houthakker', klaar: true });
  const eis = T.eisVanDeHeer(S);
  assert.deepEqual(eis.per, { wol: 20, eieren: 20, hout: 20 });
});

test('een hut kost niets, en een steiger telt al als huis', () => {
  const S = maakS();
  S.wereld.akkers = [];
  S.gebouwen.push({ soort: 'hut', klaar: true });
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
  S.wereld.akkers = [{ x: 0, y: 0, b: 1, h: 7, dorp: S }]; // 7 × 0,5 = 3,5
  S.heer = T.nieuweHeer();
  S.heer.schuld = 9;
  const eis = T.eisVanDeHeer(S);
  assert.equal(eis.per.graan, 4);
  assert.equal(eis.per.goud, 9);
  assert.ok(eis.regels.some((r) => /still owed/.test(r.waarom)));
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
  assert.match(g.tekst, /everything he asks for/);
});

test('hij telt slecht: tot een tiende te weinig merkt hij niet', () => {
  const S = metHeer();
  const g = T.gevolgVanBetaling(S, geefDeel(S, 0.93));
  assert.ok(g.deel >= 0.9 && g.deel < 1, `deel ${g.deel}`);
  assert.equal(g.straf, null);
  assert.equal(g.schuld, 0);
  assert.match(g.tekst, /counts badly/);
});

test('tot twee derde een boete: het tekort komt volgend jaar terug, met de helft erbij', () => {
  const S = metHeer();
  const g = T.gevolgVanBetaling(S, geefDeel(S, 0.8));
  assert.equal(g.straf, 'boete');
  assert.ok(g.boete && !g.soldaten && !g.schandpaal);
  assert.equal(g.schuld, Math.ceil(g.tekort * (1 + IN.boete) - 1e-9));
  assert.match(g.tekst, new RegExp(`${g.schuld} gold`));
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
  assert.match(paal.tekst, /one more year/);
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
  // Wat hij altijd vraagt (12 goud), een deel van wat er nog in de kist ligt (sinds 25 sep telt hij
  // de kist, js/heer.js), en de schuld met de boete.
  const kist = Math.ceil(S.voorraad.goud * IN.deelVanGoud - 1e-9);
  assert.equal(volgendJaar.per.goud, 12 + kist + g.schuld);
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
  assert.deepEqual(T.heerOntevredenheid(S, SINT_MAARTEN + 1).waarom, ["the lord's soldiers billeted here"]);
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
  const aaltje = boerOp(S, 'Alice', 3, 3);
  boerOp(S, 'Gerard', 4, 4);
  const g = T.betaalHeer(S, geefDeel(S, 0.3));
  assert.ok(g.schandpaal);
  assert.ok(S.heer.bezoek && S.heer.bezoek.schandpaal, 'hij wacht op jouw keuze');
  const keuzes = T.schandpaalKeuzes(S);
  assert.deepEqual(keuzes.map((k) => k.wie), ['bewoner1', 'bewoner2', 'aanvoerder']);
  assert.equal(keuzes[0].naam, 'Alice');
  assert.match(keuzes[0].eigenschap, /farmer/);
  const r = T.zetAanDeSchandpaal(S, 'bewoner1');
  assert.equal(r.kan, true);
  // Een gesprek dat wil weten wie er stond, leest de vlag van wie het is.
  assert.ok(T.heeftVlag(S, 'schandpaalBewoner1'), 'het dorp weet het');
  assert.equal(S.heer.bezoek, null, 'daarna gaat de heer');
  // Ze staat op het plein, en na haar dagen mag ze weer naar huis.
  assert.ok(aaltje.moetNaar);
  assert.deepEqual(T.wandelAnker(aaltje, 'gemaaid'), aaltje.moetNaar);
  T.tikHeerDag(S, SINT_MAARTEN + IN.schandpaalDagen);
  assert.equal(aaltje.moetNaar, null);
  // Het dorp is minder tevreden, en dat slijt weg.
  const nu = T.heerOntevredenheid(S, SINT_MAARTEN);
  assert.ok(Math.abs(nu.minder - (IN.soldatenOntevreden + IN.schandpaalKost)) < 1e-9);
  assert.ok(nu.waarom.includes('the pillory'));
  const later = T.heerOntevredenheid(S, SINT_MAARTEN + IN.wrokDagen / 2);
  assert.ok(later.minder < nu.minder);
  assert.ok(!T.heerOntevredenheid(S, SINT_MAARTEN + IN.wrokDagen).waarom.includes('the pillory'));
});

test('de schandpaal kost het dorp evenveel voor elke boer, en wie geen boer is, kan er niet aan', () => {
  // Tot ronde 2 van het snoeien (stap 4) kostte het naar het geloot aanzien van de boer: de weduwe meer dan de
  // woekeraar.
  const S = metHeer();
  boerOp(S, 'Alice', 3, 3);
  boerOp(S, 'Gerard', 4, 4);
  const knecht = boerOp(S, 'Walter', 5, 5);
  knecht.bewoner.hoofd = S.bewoners.mensen[1]; // hij woont bij Gerard in: niet het hoofd, dus geen boer
  knecht.bewoner.huis = S.bewoners.mensen[1].huis;
  const boeren = T.schandpaalKeuzes(S).filter((k) => k.wie !== 'aanvoerder');
  assert.deepEqual(boeren.map((k) => k.naam), ['Alice', 'Gerard']);
  assert.ok(boeren.every((k) => k.kost === IN.schandpaalKost));
});

test('de aanvoerder mag zichzelf aanwijzen: het dorp neemt het niet kwalijk, maar de boete gaat omhoog', () => {
  const S = metHeer();
  T.betaalHeer(S, geefDeel(S, 0.3));
  const schuldVoor = S.heer.schuld;
  const zelf = T.schandpaalKeuzes(S).find((k) => k.wie === 'aanvoerder');
  assert.ok(zelf.boete > 0);
  assert.equal(zelf.kost, 0);
  T.zetAanDeSchandpaal(S, 'aanvoerder');
  assert.equal(S.heer.schuld, schuldVoor + zelf.boete);
  assert.ok(T.heeftVlag(S, 'aanvoerderAanDeSchandpaal'));
  assert.ok(!T.heerOntevredenheid(S, SINT_MAARTEN).waarom.includes('the pillory'));
});

test('twee keer achter elkaar veel te weinig, en je bent je ambt kwijt', () => {
  const S = metHeer();
  const eerste = T.betaalHeer(S, geefDeel(S, 0.3));
  assert.ok(!eerste.ambtKwijt);
  T.zetAanDeSchandpaal(S, 'aanvoerder');
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
  T.zetAanDeSchandpaal(S2, 'aanvoerder');
  S2.kalender.dag = dagVan('slachtmaand', 11, 1);
  T.heerKomt(S2, S2.kalender.dag);
  T.betaalHeer(S2, geefDeel(S2, 1));
  assert.equal(S2.heer.veelTeWeinig, 0);
});

// ---------------------------------------------------------------------------------------------
// De dagen: brief, komst, wachten
// ---------------------------------------------------------------------------------------------

test('op 11 oogstmaand komt zijn brief, met wat hij dan zou vragen, en de balk telt de dagen af', () => {
  const S = gehucht();
  const oudeUi = T.ui;
  let getoond = 0;
  T.ui = { toonBrief: () => getoond++ };
  try {
    T.tikHeerDag(S, dagVan('oogstmaand', 10));
    assert.ok(!S.heer.brief);
    assert.equal(T.dagenTotDeHeer(S), null, 'vóór zijn brief telt de balk niet');
    T.tikHeerDag(S, dagVan('oogstmaand', 11));
  } finally {
    T.ui = oudeUi;
  }
  assert.ok(S.heer.brief);
  assert.deepEqual(S.heer.brief.eis.per, T.eisVanDeHeer(S).per);
  assert.ok(T.heeftVlag(S, 'briefVanDeHeer'));
  assert.equal(getoond, 1, 'het venster met de brief gaat open');
  // Ná zijn brief, en vóór het laatste bezoek van de marskramer: dan kun je nog verkopen.
  const marskramer = T.HANDEL_INSTELLINGEN.bezoeken[2];
  assert.ok(dagVan('oogstmaand', 11) < dagVan(marskramer.maand, marskramer.dag));
  // Drie maanden: van 11 oogstmaand tot Sint-Maarten (11 slachtmaand) is 90 dagen.
  S.kalender.dag = dagVan('oogstmaand', 11);
  assert.equal(T.dagenTotDeHeer(S), 3 * T.DAGEN_PER_MAAND);
});

test('op Sint-Maarten komt hij zelf, en wacht hij op je terwijl de tijd op 1× doorloopt (sinds de dag, 26 sep)', () => {
  const S = gehucht();
  S.kalender.snelheid = 30;
  S.kalender.dag = SINT_MAARTEN;
  // Je eigen dorp (js/dorp.js): dan zie je hem op 1× komen.
  T.tikHeerDag(S, SINT_MAARTEN);
  assert.ok(T.heerWacht(S));
  assert.ok(T.heeftVlag(S, 'heerOpBezoek'));
  assert.equal(S.kalender.snelheid, 1, 'wie op 30× speelde, ziet hem op 1× komen; de tijd staat niet stil');
  assert.equal(S.heer.bezoek.wachtTot, SINT_MAARTEN + T.HEER_INSTELLINGEN.wachtDagen, 'zijn wachtdagen tellen');
  T.betaalHeer(S, geefDeel(S, 1));
  assert.equal(S.kalender.snelheid, 1, 'na het betalen loopt de tijd door zoals hij liep');
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

test('komt hij zelf halen en moet er iemand aan de schandpaal, dan wijst hij zelf een boer aan', () => {
  const S = gehucht();
  boerOp(S, 'Alice', 3, 3);
  boerOp(S, 'Gerard', 4, 4);
  S.kalender.dag = SINT_MAARTEN;
  T.tikHeerDag(S, SINT_MAARTEN);
  T.tikHeerDag(S, SINT_MAARTEN + IN.wachtDagen); // niets in de voorraad
  assert.ok(T.heerOntevredenheid(S, S.kalender.dag).waarom.includes('the pillory'), 'een boer staat aan de paal');
  assert.equal(S.heer.wrok.length, 1);
  assert.notEqual(S.heer.wrok[0].wie, 'aanvoerder');
  assert.equal(S.heer.bezoek, null);
});

// ── Buitensporig, betalen of weigeren (Marcel, 18 okt: B2 "Met exhorbitante eisen", en D2: weigeren is zijn leger) ──

test('buitensporig: hij vraagt eisMaal keer wat hij ziet, maar de schuld van vorig jaar zoals ze was', () => {
  const S = gehucht();
  IN.eisMaal = EIS_MAAL;
  try {
    const eis = T.eisVanDeHeer(S);
    // Tien akkertegels pacht, en 25 zielen hoofdgeld, elk maal eisMaal.
    assert.equal(eis.regels.find((r) => r.wat === 'graan').aantal, Math.ceil(10 * IN.pachtPerAkkertegel * EIS_MAAL));
    assert.equal(eis.regels.find((r) => /poll tax/.test(r.waarom)).aantal, Math.ceil(25 * IN.hoofdgeldPerMens * EIS_MAAL));
    // Per gebouw zijn prijs maal eisMaal, zoals het bouwmenu het zegt (T.heerVraagtVoor).
    for (const id of Object.keys(T.GEBOUWEN)) {
      const prijs = T.GEBOUWEN[id].heer;
      if (!prijs) assert.equal(T.heerVraagtVoor(id), null, id);
      else for (const wat in prijs) assert.equal(T.heerVraagtVoor(id)[wat], Math.ceil(prijs[wat] * EIS_MAAL - 1e-9), id);
    }
    S.heer = T.nieuweHeer();
    S.heer.schuld = 7;
    assert.equal(T.eisVanDeHeer(S).per.goud, eis.per.goud + 7, 'de schuld telt hij niet nog eens maal eisMaal');
  } finally {
    IN.eisMaal = 1;
  }
});

test('betalen: hij neemt van alles wat hij vraagt zoveel als er is, en goud in de plaats van wat ontbreekt', () => {
  const S = metHeer();
  const eis = T.eisVanDeHeer(S);
  T.zetVoorraad(S, 'graan', eis.per.graan - 2);
  T.zetVoorraad(S, 'goud', eis.per.goud + 10);
  const g = T.betaalHeer(S, T.alWatHijVraagt(S));
  assert.ok(g.kan && !T.heerWacht(S));
  assert.equal(S.voorraad.graan, 0);
  assert.equal(S.voorraad.goud, 10 - 1, 'twee graan in goud: 0,6, naar boven 1');
});

test('weigeren: hij gaat, en als het donker wordt, komt zijn leger, en dat is het eind', () => {
  const S = metHeer();
  assert.equal(T.weigerHeer(maakS()).kan, false, 'wie er niet is, weiger je niet');
  S.kalender.dag = SINT_MAARTEN + 10 / 24; // tien uur 's ochtends
  T.zetVoorraad(S, 'graan', 50);
  assert.ok(T.weigerHeer(S).kan);
  assert.ok(!T.heerWacht(S), 'hij gaat');
  assert.equal(S.voorraad.graan, 50, 'hij nam niets');
  assert.ok(S.heer.jaren[0].geweigerd);
  // Een schemering na zonsondergang, als de dorpelingen nog op hun erf zijn (zo zie je ze vluchten); tot 20 okt bij het
  // slapen, als iedereen binnen was.
  const donker = SINT_MAARTEN + (T.dagindeling(SINT_MAARTEN).zon.onder + T.DAG_INSTELLINGEN.schemerUren) / 24;
  assert.ok(Math.abs(S.heer.leger.komt - donker) < 1e-9, 'zijn leger komt als het donker wordt');
  assert.ok(T.uurVanDag(donker) < T.dagindeling(SINT_MAARTEN).slapen, 'voor iedereen naar bed gaat');
  S.kalender.dag = donker - 0.01;
  T.werkHeerBij(S);
  assert.ok(!S.einde, 'nog niet');
  S.kalender.dag = donker;
  T.werkHeerBij(S);
  assert.equal(S.einde.reden, 'leger');
  // 's Nachts geweigerd: dan komt het meteen.
  const S2 = metHeer();
  S2.kalender.dag = SINT_MAARTEN + 23 / 24;
  T.weigerHeer(S2);
  assert.equal(S2.heer.leger.komt, S2.kalender.dag);
  // Zonder de tik van de beelden (een toets) komt het de dag erna.
  const S3 = metHeer();
  T.weigerHeer(S3);
  T.tikHeerDag(S3, SINT_MAARTEN + 1);
  assert.equal(S3.einde.reden, 'leger');
});

test('in de demo eindigt het spel ook als je betaalt: als hij weg is, met je waren; in het volle spel speelt het door', () => {
  const geefAlles = (S) => {
    const eis = T.eisVanDeHeer(S);
    for (const wat in eis.per) T.zetVoorraad(S, wat, eis.per[wat]);
    return T.betaalHeer(S, T.alWatHijVraagt(S));
  };
  const S = metHeer();
  assert.ok(geefAlles(S).kan);
  assert.ok(!S.einde, 'in het volle spel speelt het door');
  // De demo: de scène van het betalen, zoals de trigger van het demojaar die zet als hij komt (levels/demojaar.js).
  const demo = (D) => T.doeGevolg(null, D, { scene: 'betalen' });
  const S2 = metHeer();
  demo(S2);
  geefAlles(S2);
  assert.equal(S2.einde && S2.einde.reden, 'betaald', 'zonder poppetje is hij meteen weg, en is de demo uit');
  const S3 = metHeer();
  demo(S3);
  T.weigerHeer(S3);
  assert.ok(!S3.einde, 'wie weigert, wacht op zijn leger');
  T.tikHeerDag(S3, SINT_MAARTEN + 1);
  assert.equal(S3.einde.reden, 'leger');
  assert.ok(T.eindRegels(S3).some((r) => /refused the lord/.test(r)), 'het eindscherm zegt dat je hem weigerde');
});

test('waar geen plein is (het oude spel), komt hij nooit', () => {
  const S = gehucht();
  S.plek.marskramer = null;
  for (let dag = 0; dag < T.DAGEN_PER_JAAR; dag++) T.tikHeerDag(S, dag);
  assert.ok(!S.heer);
});

test('het vooruitzicht: zaaien kost alleen wat volgend jaar akker wordt, en de melk scheelt graan', () => {
  const S = gehucht();
  S.kalender.dag = SINT_MAARTEN;
  const perMens = T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag;
  const kaal = T.heerVooruitzicht(S, null);
  assert.equal(kaal.zaaien, 10 * T.ZAAIGRAAN_PER_TEGEL);
  assert.equal(kaal.melk, 0);
  assert.ok(Math.abs(kaal.eten - 25 * perMens * kaal.dagen) < 1e-9);
  // Het eerste veld (2×3) wordt volgend jaar weide: dat zaai je niet.
  const [veld] = S.wereld.akkers;
  veld.plan = 'weide';
  assert.equal(T.heerVooruitzicht(S, null).zaaien, 4 * T.ZAAIGRAAN_PER_TEGEL);
  // Staat er nu een koe op een weide, dan drinkt het dorp van grasmaand tot de oogst haar melk: 90
  // dagen, elke dag melk voor vijf mensen. Dat graan eet het niet, en kaas telt apart.
  veld.bestemming = 'weide';
  S.wereld.wezens.push(T.zetOpWeide(Object.assign(T.maakDier('koe', 0, 0, 1), { dorp: S }), veld)); // een koe van dit dorp (T.hoortBij)
  T.zetVoorraad(S, 'kaas', 7);
  const v = T.heerVooruitzicht(S, null);
  const melk = 90 * T.VEE_INSTELLINGEN.melkVoorMensen * perMens;
  assert.ok(Math.abs(v.melk - melk) < 1e-9, `${v.melk}`);
  assert.ok(Math.abs(v.eten - (25 * perMens * v.dagen - melk)) < 1e-9);
  assert.equal(v.kaas, 7);
  assert.ok(Math.abs(v.over - (v.na - v.eten - v.zaaien)) < 1e-9);
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

test('zijn poppetje komt over de weg met twee soldaten, en op het plein wacht hij', () => {
  const S = gehucht();
  S.plek.uitgang = { x: 9, y: 5 }; // de weg de wereld in van het dorp (D.plek, js/wereld.js)
  S.kalender.dag = SINT_MAARTEN;
  T.tikHeerDag(S, SINT_MAARTEN);
  assert.ok(!S.heer.bezoek.staat, 'hij moet nog lopen');
  T.werkHeerBij(S);
  assert.ok(!S.heer.bezoek.wezens, 'om middernacht wacht hij nog: hij komt overdag (js/dag.js)');
  S.kalender.dag += 10 / 24;
  T.werkHeerBij(S);
  const [heer, s1, s2] = S.heer.bezoek.wezens;
  assert.equal(heer.wie, 'heer');
  assert.equal(s1.wie, 'soldaat');
  assert.equal(s2.wie, 'soldaat');
  assert.deepEqual([heer.tx, heer.ty], [9, 5], 'hij komt binnen over de weg');
  assert.deepEqual([heer.thuis.x, heer.thuis.y], [5, 5], 'en loopt naar het plein');
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
  const knoop = T.gesprekKnoop(S, S, 'heer', 'welkom');
  assert.ok(knoop.keuzes.some((k) => k.doe && k.doe.heer));
  const oudeUi = T.ui;
  let geopend = 0;
  T.ui = { openHeer: () => geopend++ };
  try {
    T.doeGevolg(S, S, { heer: true });
  } finally {
    T.ui = oudeUi;
  }
  assert.equal(geopend, 1);
  T.zetVlag(S, 'heerBetaald');
  assert.ok(!T.gesprekKnoop(S, S, 'heer', 'welkom').keuzes.some((k) => k.doe && k.doe.heer));
});

test('de schandpaal komt er de eerste keer, blijft staan, en wie gestraft wordt, staat ervoor', () => {
  const S = metHeer();
  S.plek.uitgang = { x: 9, y: 5 }; // de weg de wereld in van het dorp (D.plek, js/wereld.js)
  const aaltje = boerOp(S, 'Alice', 3, 3);
  assert.equal(S.heer.paal, null, 'nog geen paal');
  T.betaalHeer(S, geefDeel(S, 0.3));
  T.zetAanDeSchandpaal(S, 'bewoner1');
  const palen = () => (S.wereld.voorwerpen || []).filter((v) => v.soort === 'schandpaal');
  assert.deepEqual(S.heer.paal, { x: 7, y: 5 }, 'twee tegels rechts van het plein');
  assert.deepEqual(palen(), [{ soort: 'schandpaal', x: 7, y: 5 }]);
  assert.deepEqual(aaltje.moetNaar, { x: 8, y: 6, straal: 0 }, 'vóór de paal, in beeld recht eronder');
  // Haar straf is voorbij: zij mag naar huis, de paal blijft.
  aaltje.tx = aaltje.x = 8;
  aaltje.ty = aaltje.y = 6;
  T.werkHeerBij(S);
  T.tikHeerDag(S, SINT_MAARTEN + IN.schandpaalDagen + 1);
  assert.equal(aaltje.moetNaar, null);
  assert.equal(palen().length, 1);
  // Een tweede keer: dezelfde paal, geen tweede.
  assert.deepEqual(T.zetSchandpaalNeer(S), { x: 7, y: 5 });
  assert.equal(palen().length, 1);
});

test('wie zichzelf aan de schandpaal zet, zet hem er ook neer', () => {
  const S = metHeer();
  T.betaalHeer(S, geefDeel(S, 0.3));
  T.zetAanDeSchandpaal(S, 'aanvoerder');
  assert.deepEqual(S.heer.paal, { x: 7, y: 5 });
});

test('de schandpaal komt niet in een akker of waar de heer staat, en beslaat zijn tegel', () => {
  const S = maakS();
  const w = S.wereld;
  w.b = 14;
  w.h = 12;
  w.tegels = Array.from({ length: w.h }, () => new Array(w.b).fill('gras'));
  w.voorwerpen = [];
  // Een akker precies op de plek die hij het liefst neemt (twee tegels rechts van het plein).
  w.akkers = [{ x: 6, y: 4, b: 3, h: 3 }];
  const inAkker = (x, y) => x >= 6 && x < 9 && y >= 4 && y < 7;
  const p = T.plekVoorDeSchandpaal(S);
  assert.ok(!inAkker(p.x, p.y) && !inAkker(p.x + 1, p.y + 1), `niet in de akker: ${p.x},${p.y}`);
  assert.ok(!(p.x === 5 && p.y === 5), 'niet waar de heer staat');
  S.heer = T.nieuweHeer();
  T.zetSchandpaalNeer(S);
  assert.ok(!T.isBegaanbaar(w, p.x, p.y), 'op de paal kun je niet staan');
  assert.ok(T.isBegaanbaar(w, p.x + 1, p.y + 1), 'ervoor wel');
});

test('de dagen aan de schandpaal tellen pas als hij er staat (drie dagen zijn op 1× maar zeven seconden)', () => {
  const S = metHeer();
  S.plek.uitgang = { x: 9, y: 5 }; // de weg de wereld in van het dorp (D.plek, js/wereld.js)
  const aaltje = boerOp(S, 'Alice', 3, 3);
  T.betaalHeer(S, geefDeel(S, 0.3));
  T.zetAanDeSchandpaal(S, 'bewoner1');
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

test('wie aan de schandpaal staat, staat met zijn rug naar de paal, en zolang is de paal bezet', () => {
  const S = metHeer();
  S.plek.uitgang = { x: 9, y: 5 }; // de weg de wereld in van het dorp (D.plek, js/wereld.js)
  const aaltje = boerOp(S, 'Alice', 3, 3);
  T.betaalHeer(S, geefDeel(S, 0.3));
  T.zetAanDeSchandpaal(S, 'bewoner1');
  T.werkHeerBij(S);
  assert.equal(T.aanDePaal(S), null, 'ze is er nog niet: de paal is leeg');
  assert.ok(!aaltje.kijkt, 'onderweg kijkt ze waar ze heen loopt');
  // Nog een stap onderweg naar de tegel vóór de paal: nog niet bezet, want de ketting hangt dan
  // aan iemand die nog loopt.
  aaltje.tx = 8;
  aaltje.ty = 6;
  aaltje.x = 7.5;
  aaltje.y = 5.5;
  T.werkHeerBij(S);
  assert.equal(T.aanDePaal(S), null);
  // Ze staat er: met haar rug naar de paal, dus in beeld naar voren (Z, js/sprites.js).
  aaltje.x = 8;
  aaltje.y = 6;
  assert.equal(T.aanDePaal(S), aaltje);
  assert.equal(aaltje.kijkt, 'Z');
  // Haar dagen zijn om: ze kijkt weer waar ze heen loopt, en de paal is leeg.
  T.tikHeerDag(S, S.kalender.dag + IN.schandpaalDagen);
  assert.equal(T.aanDePaal(S), null);
  assert.equal(aaltje.kijkt, null);
});

test('de schandpaal heeft kunst: leeg, bezet en het halsijzer, en een nek voor elk vel dat eraan kan', () => {
  const t = T.BEELDEN.schandpaal;
  assert.ok(t, 'draai node gereedschap/pixelart/naar-spel.cjs --alleen schandpaal');
  assert.deepEqual(t.delen, ['leeg', 'bezet', 'halsijzer']);
  // Aan de paal kunnen de boeren (T.isBoer, js/boerderij.js), op het vel van hun lijf (boer, boerin). Komt er een vel
  // bij, zet het dan in FIGUREN in gereedschap/pixelart/schandpaal.cjs, zodat zijn nek gemeten wordt. Een uiterlijk (ook
  // in andere kleren) heeft de nek van zijn lijf (T.sprites.nekHoogte).
  for (const vel of ['boer', 'boerin']) assert.ok(Number.isFinite(t.nek[vel]), `de nek van ${vel} is niet gemeten`);
});

// ---------------------------------------------------------------------------------------------
// De opties in de Spelregels (js/opties.js; Marcel, 24 sep): de regels volgen ze
// ---------------------------------------------------------------------------------------------

// Zet instellingen van de heer zolang de toets loopt, en daarna weer terug.
function metHeerInstelling(zet, fn) {
  const was = {};
  for (const k in zet) {
    was[k] = IN[k];
    IN[k] = zet[k];
  }
  try {
    fn();
  } finally {
    Object.assign(IN, was);
  }
}

test('een deel van het graan en het goud: hij rekent op wat er ligt, in de schuren en in de kist', () => {
  metHeerInstelling({ graan: 'deel' }, () => {
    const S = gehucht();
    T.zetVoorraad(S, 'graan', 100);
    T.zetVoorraad(S, 'goud', 40);
    const eis = T.eisVanDeHeer(S);
    assert.equal(eis.per.graan, Math.ceil(100 * IN.deelVanGraan - 1e-9));
    // De 12 goud die hij altijd vraagt, en een deel van wat er in de kist ligt.
    assert.equal(eis.per.goud, 12 + Math.ceil(40 * IN.deelVanGoud - 1e-9));
    assert.ok(eis.regels.some((r) => /grain in your barns/.test(r.waarom)));
    assert.ok(eis.regels.some((r) => /gold in your chest/.test(r.waarom)));
    assert.ok(!eis.regels.some((r) => /inner|toeslag/.test(r.waarom)), 'niets meer op naam van zijn inner');
    // Telt de kist niet, dan vraagt hij er niets voor.
    metHeerInstelling({ kist: false }, () => assert.equal(T.eisVanDeHeer(S).per.goud, 12));
    // Toen hij kwam, telde hij de kist: wat je daarna uitgeeft, haalt zijn eis niet omlaag.
    S.kalender.dag = SINT_MAARTEN;
    T.heerKomt(S, SINT_MAARTEN);
    const komt = T.eisVanDeHeer(S).per.goud;
    T.zetVoorraad(S, 'goud', 0);
    assert.equal(T.eisVanDeHeer(S).per.goud, komt);
  });
});

test('betalen in "graan en goud": de pacht in graan, wat hij verder ziet in goud', () => {
  metHeerInstelling({ betalenIn: 'graanEnGoud' }, () => {
    const S = gehucht();
    S.gebouwen.push({ soort: 'schaapskooi', klaar: true });
    const eis = T.eisVanDeHeer(S);
    assert.equal(eis.per.wol, undefined);
    assert.equal(eis.per.graan, 5);
    // 20 wol × 8/15 = 10,7, naar boven 11, bij de 12 goud die hij al vroeg.
    assert.equal(eis.per.goud, 12 + 11);
    assert.ok(eis.regels.some((r) => /instead of 20 wool/.test(r.waarom)));
  });
});

test('betalen in "alleen goud": ook de pacht rekent hij om', () => {
  metHeerInstelling({ betalenIn: 'alleenGoud' }, () => {
    const S = gehucht();
    const eis = T.eisVanDeHeer(S);
    assert.deepEqual(Object.keys(eis.per), ['goud']);
    assert.equal(eis.per.goud, 12 + Math.ceil(5 * 0.3));
  });
});

test('hij telt precies: elk tekort telt, en veel te weinig is minder dan een derde', () => {
  metHeerInstelling({
    straffen: [{ vanaf: 1, straf: null }, { vanaf: 2 / 3, straf: 'boete' }, { vanaf: 1 / 3, straf: 'soldaten' }, { vanaf: 0, straf: 'schandpaal' }],
    veelTeWeinig: 1 / 3,
  }, () => {
    const S = metHeer();
    assert.equal(T.gevolgVanBetaling(S, geefDeel(S, 0.95)).straf, 'boete', 'ook een klein tekort telt');
    assert.equal(T.gevolgVanBetaling(S, geefDeel(S, 0.5)).straf, 'soldaten');
    const weinig = T.gevolgVanBetaling(S, geefDeel(S, 0.2));
    assert.equal(weinig.straf, 'schandpaal');
    assert.ok(weinig.veelTeWeinig);
  });
});

test('steeds zwaarder: niet hoeveel telt, maar hoe vaak achter elkaar, tot je ambt', () => {
  metHeerInstelling({ telWijze: 'hoeVaak', ambtKwijtNa: 4 }, () => {
    const S = gehucht();
    boerOp(S, 'Gerard', 4, 4);
    const verwacht = ['boete', 'soldaten', 'schandpaal'];
    for (let jaar = 0; jaar < 3; jaar++) {
      S.kalender.dag = dagVan('slachtmaand', 11, jaar);
      T.heerKomt(S, S.kalender.dag);
      // Een klein tekort is genoeg: hoeveel doet er niet toe.
      const g = T.betaalHeer(S, geefDeel(S, 0.95));
      assert.equal(g.straf, verwacht[jaar], `jaar ${jaar + 1}`);
      assert.match(g.tekst, new RegExp(['first year', 'two years running', 'three years running'][jaar]));
      if (g.schandpaal) T.zetAanDeSchandpaal(S, 'bewoner1');
    }
    S.kalender.dag = dagVan('slachtmaand', 11, 3);
    T.heerKomt(S, S.kalender.dag);
    const vierde = T.betaalHeer(S, geefDeel(S, 0.95));
    assert.ok(vierde.ambtKwijt, 'de vierde keer kost je je ambt');
    assert.ok(S.einde);
    // Een jaar alles betalen zet de teller terug.
    const S2 = gehucht();
    S2.kalender.dag = SINT_MAARTEN;
    T.heerKomt(S2, SINT_MAARTEN);
    T.betaalHeer(S2, geefDeel(S2, 0.95));
    S2.kalender.dag = dagVan('slachtmaand', 11, 1);
    T.heerKomt(S2, S2.kalender.dag);
    T.betaalHeer(S2, geefDeel(S2, 1));
    assert.equal(S2.heer.tekortJaren, 0);
  });
});

test('mag de aanvoerder zichzelf niet aanwijzen, dan staat hij niet in het lijstje', () => {
  metHeerInstelling({ aanvoerderMagZelf: false }, () => {
    const S = metHeer();
    boerOp(S, 'Alice', 3, 3);
    T.betaalHeer(S, geefDeel(S, 0.3));
    assert.deepEqual(T.schandpaalKeuzes(S).map((k) => k.wie), ['bewoner1']);
    assert.equal(T.zetAanDeSchandpaal(S, 'aanvoerder').kan, false);
  });
});

// ---------------------------------------------------------------------------------------------
// Sint-Maarten in de wereld: zijn leger en zijn wagen (werklijst E, stap 4; Marcel, 20 okt: "A1 B1 C1"). De scène erbij
// (de camera, de banden, de zinnen) staat in test/regie.test.cjs.
// ---------------------------------------------------------------------------------------------

const { heerOpHetPlein } = require('./grond.cjs');

// Weiger hem op het proefdorp, en laat de wereld tikken van het donker tot het eind. Geeft het dorp, zijn leger, hoeveel
// tikken het duurde en hoeveel mensen er vóór waren.
function weigerTotHetEind() {
  const P = heerOpHetPlein(T);
  const { S, D } = P;
  const mensen = D.bewoners.mensen.length;
  assert.ok(T.weigerHeer(D).kan);
  S.kalender.dag = D.heer.leger.komt; // de middag voorbij: het donker
  let n = 0;
  for (; !D.einde && n < 60 * 120; n++) P.tik();
  return { ...P, L: D.heer.leger, n, mensen };
}

test('weigeren: als het donker wordt, komt zijn leger met fakkels over de weg, het dorp vlucht, en bij het plein is het het eind', () => {
  const { D, plein, L, n, mensen } = weigerTotHetEind();
  assert.equal(D.einde && D.einde.reden, 'leger');
  assert.equal(L.wezens.length, IN.leger.mannen, 'het hele leger kwam de kaart op, een voor een');
  assert.ok(L.wezens.some((e) => T.afstand(T.tegelVan(e), plein) <= IN.leger.bijHetPlein), 'de eerste is bij het plein');
  assert.ok(n > 60 * 10, `ze lopen over de weg: ${(n / 60).toFixed(1)} s`);
  // Er wordt niet gevochten: ze zijn geen vijand, en niemand viel.
  assert.ok(!L.wezens.some((e) => T.isVijandVan(D, e)));
  assert.equal(D.bewoners.mensen.length, mensen, 'niemand viel');
  // Wie buiten was, vluchtte naar het town hall.
  const schuilen = D.bewoners.mensen.filter((p) => p.schuilt).length;
  assert.ok(schuilen >= D.bewoners.mensen.length / 2, `${schuilen} van ${D.bewoners.mensen.length} schuilen`);
  // Elk draagt licht in het donker: zijn fakkel (tot die getekend is, de lantaarn).
  for (const e of L.wezens) assert.ok(T.draagtLicht(D, e));
});

test('zijn leger loopt op elke computer gelijk (lockstep: het toeval komt uit het zaad)', () => {
  const a = weigerTotHetEind();
  const b = weigerTotHetEind();
  assert.equal(a.n, b.n);
  assert.deepEqual(a.L.wezens.map(T.tegelVan), b.L.wezens.map(T.tegelVan));
});

test('zijn wagen staat leeg op het plein; betaal je, dan dragen zijn soldaten wat hij nam erheen, en rijdt hij ermee weg', () => {
  const { D, b, plein, tik } = heerOpHetPlein(T);
  const wagen = b.wagen;
  assert.ok(b.wezens.includes(wagen) && D.wereld.wezens.includes(wagen), 'hij bracht hem mee');
  tik(60 * 20);
  assert.ok(T.afstand(T.tegelVan(wagen), plein) <= IN.wagen.links + 1 && !wagen.pad.length, 'hij staat bij hem op het plein');
  assert.equal(wagen.vel, 'ossenkar-leeg');
  assert.match(T.karTekst(D, wagen), /Empty, for now/);
  assert.ok(!T.isVanDorp(D, wagen), 'de wagen is niet van het dorp: hij kijkt niet door je mist');
  T.zetVoorraad(D, 'graan', 200);
  T.zetVoorraad(D, 'goud', 50);
  const g = T.betaalHeer(D, T.alWatHijVraagt(D));
  assert.equal(b.laden && b.laden.fase, 'heen');
  assert.ok(!b.weg, 'eerst laden, dan gaan');
  const voorraad = T.deVoorraad(D);
  let n = 0;
  for (; b.laden && b.laden.fase === 'heen' && n < 60 * 100; n++) tik();
  const mannen = b.wezens.filter((e) => e.wie === 'soldaat');
  assert.equal(mannen.length, IN.soldaten);
  // In de tik dat ze omkeren, zetten ze al hun eerste stap terug.
  assert.ok(mannen.every((e) => T.afstand(T.tegelVan(e), voorraad) <= 2), 'ze haalden het bij je voorraad');
  for (; b.laden && n < 60 * 200; n++) tik();
  assert.ok(b.weg, 'en dan gaat hij');
  assert.deepEqual(wagen.lading, g.neemt);
  assert.notEqual(wagen.vel, 'ossenkar-leeg', 'zijn vel zegt wat erop ligt');
  assert.match(T.karTekst(D, wagen), /loaded with/);
  assert.ok(!D.einde, 'in het volle spel speelt het door');
  for (; D.heer.bezoek && n < 60 * 400; n++) tik();
  assert.equal(D.heer.bezoek, null, 'hij is de kaart af, met zijn wagen');
  assert.ok(!D.wereld.wezens.includes(wagen));
});

test('in de demo is betalen het eind als zijn wagen een eind de weg op is, en overslaan is het meteen', () => {
  // Het demojaar (levels/demojaar.js): zijn trigger zet de scène van het betalen, de seconde nadat de heer kwam.
  const { S, D, b, plein, tik } = heerOpHetPlein(T);
  assert.deepEqual(T.startScenario(S, T.LEVELS.demojaar), []);
  T.zetVoorraad(D, 'graan', 200);
  T.betaalHeer(D, T.alWatHijVraagt(D));
  let n = 0;
  for (; !D.einde && n < 60 * 300; n++) tik();
  assert.equal(D.scene, 'betalen');
  assert.equal(D.einde && D.einde.reden, 'betaald');
  assert.ok(D.heer.bezoek, 'hij is nog op de kaart: het beeld wordt zwart terwijl hij wegrijdt');
  assert.ok(T.afstand(T.tegelVan(b.wagen), plein) >= IN.wagen.demoWegNa);
  // Overslaan (een klik of Esc in de scène, js/regie.js) is meteen het eind.
  const P = heerOpHetPlein(T);
  T.doeGevolg(P.S, P.D, { scene: 'betalen' });
  T.betaalHeer(P.D, T.alWatHijVraagt(P.D));
  T.eindVanSintMaarten(P.D);
  assert.equal(P.D.einde && P.D.einde.reden, 'betaald');
  // In het volle spel is er na betalen niets over te slaan.
  const V = heerOpHetPlein(T);
  T.betaalHeer(V.D, T.alWatHijVraagt(V.D));
  T.eindVanSintMaarten(V.D);
  assert.ok(!V.D.einde);
});
