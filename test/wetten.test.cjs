// De wetten (js/wetten.js; werklijst vraag 54, Marcel, 29 sep: "een menu zoals in diplomacy 3, waar je weten kunt
// aannemen", en "A ja B ja"): het rantsoen, vreemden welkom, houtkap in het bos van de heer en de belasting. Elke
// wet heeft een voordeel en een nadeel, hij geldt meteen, en zonder wetten speelt het spel zoals ervoor.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

T.ui = { bericht() {}, plek() {}, toonKalender() {}, toonVoorraad() {}, toonBevolking() {}, toonInventaris() {}, toonArgwaan() {} };

// Het echte gehucht, zoals een nieuw spel begint, stil (zoals in test/treden.test.cjs).
function gehucht() {
  const echt = console.warn;
  console.warn = () => {};
  const S = { kalender: T.nieuweKalender() }; // het spel; zijn dorp (S.dorp) komt met de kaart
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  return S;
}

const bijna = (a, b) => Math.abs(a - b) < 1e-9;
const tevreden = (S, dag = 5) => T.berekenTevredenheid(S.dorp, dag);
// Wat een wet erbij doet, komt bij elk huis erbij, tot 100% (js/wensen.js): voor het dorp het gemiddelde, naar mensen.
const erbijPerHuis = (b, x) => b.wensen.huizen.reduce((n, h) => n + h.mensen * (Math.min(1, h.tevredenheid + x) - h.tevredenheid), 0)
  / b.wensen.huizen.reduce((n, h) => n + h.mensen, 0);

test('zonder wetten staat elke wet op zijn standaard, en speelt het spel zoals ervoor', () => {
  const S = gehucht();
  delete S.dorp.wetten; // een oud spel, van vóór de wetten
  for (const id of Object.keys(T.WETTEN)) assert.equal(T.standVanWet(S.dorp, id), T.WETTEN[id].standaard, id);
  assert.equal(T.etenPerMens(S.dorp), T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag);
  assert.equal(T.gezinDagen(S.dorp), T.GEBOUWEN_INSTELLINGEN.gezinDagen);
  assert.deepEqual(T.maaktUit(S.dorp, T.GEBOUWEN.houthakker), T.GEBOUWEN.houthakker.maakt.uit);
  assert.deepEqual(T.wettenTevredenheid(S.dorp), { erbij: 0, last: [], blij: [] });
  assert.equal(T.houtkapBoete(S.dorp), 0);
});

test('het gehucht heeft vier wetten, in de volgorde van het menu', () => {
  const S = gehucht();
  assert.deepEqual(T.wettenVanNu(S.dorp), ['rantsoen', 'vreemden', 'houtkap', 'belasting']);
  assert.equal(T.wetIsAanUit('rantsoen'), false, 'het rantsoen heeft drie standen');
  assert.equal(T.wetIsAanUit('vreemden'), true);
});

test('een krap rantsoen: ieder eet driekwart, en het dorp is 15% minder tevreden', () => {
  const S = gehucht();
  const voor = tevreden(S);
  assert.equal(T.zetWet(S.dorp, 'rantsoen', 'krap').kan, true);
  assert.equal(T.standVanWet(S.dorp, 'rantsoen'), 'krap');
  assert.ok(bijna(T.etenPerMens(S.dorp), 0.75 * T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag));
  const na = tevreden(S);
  assert.ok(bijna(voor.tevredenheid - na.tevredenheid, 0.15), `${voor.tevredenheid} → ${na.tevredenheid}`);
  assert.ok(na.last.includes('het krappe rantsoen'), na.last.join(', '));
  // Het dorp eet ook echt minder.
  const graan = S.dorp.voorraad.graan;
  const gegeten = T.eetVandaag(S.dorp);
  assert.ok(bijna(gegeten.nodig, S.dorp.bevolking * 0.75 * T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag));
  assert.ok(bijna(graan - S.dorp.voorraad.graan, gegeten.graan));
});

test('een ruim rantsoen: anderhalf keer zoveel eten, en 10% tevredener', () => {
  const S = gehucht();
  const voor = tevreden(S);
  T.zetWet(S.dorp, 'rantsoen', 'ruim');
  assert.ok(bijna(T.etenPerMens(S.dorp), 1.5 * T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag));
  const na = tevreden(S);
  assert.ok(bijna(na.tevredenheid - voor.tevredenheid, erbijPerHuis(voor, 0.1)), `${voor.tevredenheid} → ${na.tevredenheid}`);
  assert.deepEqual(na.blij, ['het ruime rantsoen']);
  // Terug naar gewoon: zoals ervoor.
  T.zetWet(S.dorp, 'rantsoen', 'gewoon');
  assert.ok(bijna(tevreden(S).tevredenheid, voor.tevredenheid));
});

test('vreemden welkom: om de 10 dagen een gezin in plaats van 20, en 5% minder tevreden', () => {
  const zonder = gehucht();
  const met = gehucht();
  // Hetzelfde dorp vóór en na de wet: wie in welk huis woont, is elk spel anders, en de tevredenheid is het gemiddelde
  // van de huizen (js/wensen.js).
  const voorDeWet = tevreden(met).tevredenheid;
  T.zetWet(met.dorp, 'vreemden', 'aangenomen');
  assert.equal(T.gezinDagen(met.dorp), 10);
  assert.ok(bijna(voorDeWet - tevreden(met).tevredenheid, 0.05));
  assert.ok(tevreden(met).last.includes('de vreemden'));
  // Op dag 10 komt er alleen met de wet een gezin: er is plaats, graan genoeg, en het dorp is tevreden genoeg.
  const voor = met.dorp.bevolking;
  T.tikGebouwenDag(zonder.dorp, 10);
  T.tikGebouwenDag(met.dorp, 10);
  assert.equal(zonder.dorp.bevolking, voor, 'zonder de wet wacht het tot dag 20');
  assert.ok(met.dorp.bevolking > voor, `met de wet komt er een gezin (${voor} → ${met.dorp.bevolking})`);
});

test('houtkap: de houthakker hakt twee keer zoveel, en de heer rekent een boete, ook als de wet weer weg is', () => {
  const S = gehucht();
  S.dorp.gebouwen.push({ soort: 'houthakker', x: 0, y: 0, klaar: true, klaarOp: 0, handen: 1, werkte: 1, voorwerp: null });
  // Wat de houthakker erbij doet; wat de mensen sprokkelen (T.sprokkelHout, vraag 74) verandert niet mee.
  const hakt = T.brandhoutErbij(S.dorp) - T.sprokkelHout(S.dorp);
  T.zetWet(S.dorp, 'houtkap', 'aangenomen');
  assert.deepEqual(T.maaktUit(S.dorp, T.GEBOUWEN.houthakker), { hout: 2 * T.GEBOUWEN.houthakker.maakt.uit.hout });
  assert.ok(bijna(T.brandhoutErbij(S.dorp) - T.sprokkelHout(S.dorp), 2 * hakt), 'ook het bericht over de winter rekent ermee');
  // Een boer hakt geen hout: alleen wie in het bos hakt (bos), hakt meer.
  assert.deepEqual(T.maaktUit(S.dorp, T.GEBOUWEN.visser), T.GEBOUWEN.visser.maakt.uit);

  assert.equal(T.houtkapBoete(S.dorp), 0, 'nog niets gekapt');
  T.tikWettenDag(S.dorp, 5);
  assert.equal(T.houtkapBoete(S.dorp), 5);
  // De wet weer afschaffen, vlak voor Sint-Maarten, helpt niet: er is dit jaar gekapt.
  T.zetWet(S.dorp, 'houtkap', 'afgeschaft');
  T.tikWettenDag(S.dorp, 6);
  const eis = T.eisVanDeHeer(S.dorp);
  assert.ok(eis.regels.some((r) => r.wat === 'goud' && r.aantal === 5 && /bomen/.test(r.waarom)), JSON.stringify(eis.regels));
  // Na Sint-Maarten is de boete betaald.
  T.wettenNaSintMaarten(S.dorp);
  assert.equal(T.houtkapBoete(S.dorp), 0);
  assert.ok(!T.eisVanDeHeer(S.dorp).regels.some((r) => /bomen/.test(r.waarom)));
});

test('houtkap zonder houthakker kost niets: dan is er niet gekapt', () => {
  const S = gehucht();
  assert.ok(!S.dorp.gebouwen.some((g) => T.GEBOUWEN[g.soort].bos), 'het gehucht begint zonder houthakker');
  T.zetWet(S.dorp, 'houtkap', 'aangenomen');
  T.tikWettenDag(S.dorp, 5);
  assert.equal(T.houtkapBoete(S.dorp), 0);
});

test('de belasting zonder beurzen per huis: op de eerste van de maand goud in de kist, en wat geen heel goud is, gaat mee', (t) => {
  // Met een beurs per huis is de belasting een tiende van wat de huizen verdienen (test/geld.test.cjs).
  T.zetOptie('geld', 'beurzen');
  t.after(() => T.optiesTerug());
  const S = gehucht();
  S.dorp.bevolking = 26;
  const voor = tevreden(S).tevredenheid;
  T.zetWet(S.dorp, 'belasting', 'aangenomen');
  assert.ok(bijna(voor - tevreden(S).tevredenheid, 0.1));
  assert.ok(tevreden(S).last.includes('de belasting'));
  // Iedereen telt hier als één; dat een hogere stand meer betaalt (T.belastbaar), toetst test/wensen.test.cjs.
  S.dorp.behoeften.standen = null;
  const goud = S.dorp.voorraad.goud;
  T.tikWettenDag(S.dorp, 31); // 2 grasmaand: geen eerste van de maand
  assert.equal(S.dorp.voorraad.goud, goud);
  // 26 mensen maal 0,05 is 1,3 goud per maand: 1, 1, 1 en dan 2 (0,3 + 0,3 + 0,3 + 0,3 is weer een heel goud).
  const erbij = [30, 60, 90, 120].map((dag) => {
    const v = S.dorp.voorraad.goud;
    T.tikWettenDag(S.dorp, dag);
    return S.dorp.voorraad.goud - v;
  });
  assert.deepEqual(erbij, [1, 1, 1, 2]);
});

test('een wet die niet bestaat, of een stand die hij niet heeft, gaat niet', () => {
  const S = gehucht();
  assert.equal(T.zetWet(S.dorp, 'avondklok', 'aangenomen').kan, false);
  assert.equal(T.zetWet(S.dorp, 'rantsoen', 'aangenomen').kan, false);
  assert.equal(T.standVanWet(S.dorp, 'rantsoen'), 'gewoon');
});

test('wat een wet doet, in woorden, met de getallen van nu: eerst wat goed is, dan wat het kost', () => {
  const S = gehucht();
  S.dorp.bevolking = 26;
  const krap = T.watDeWetDoet(S.dorp, 'rantsoen', 'krap');
  assert.deepEqual(krap.map((r) => r.goed), [true, false]);
  assert.equal(krap[0].tekst, 'ieder eet driekwart: 1 graan per dag in plaats van 1,3');
  assert.equal(krap[1].tekst, '15% minder tevreden');
  const ruim = T.watDeWetDoet(S.dorp, 'rantsoen', 'ruim');
  assert.deepEqual(ruim.map((r) => r.tekst), ['10% tevredener', 'ieder eet anderhalf keer zoveel: 2 graan per dag in plaats van 1,3']);
  assert.deepEqual(T.watDeWetDoet(S.dorp, 'rantsoen', 'gewoon'), [], 'gewoon doet niets');
  assert.equal(T.watDeWetDoet(S.dorp, 'vreemden', 'aangenomen')[0].tekst, 'twee keer zo vaak een nieuw gezin: om de 10 dagen in plaats van 20');
  assert.match(T.watDeWetDoet(S.dorp, 'houtkap', 'aangenomen')[0].tekst, /twee keer zoveel hout \(er is nog geen houthakker\)/);
  assert.equal(T.watDeWetDoet(S.dorp, 'belasting', 'aangenomen')[0].tekst, 'elke maand 10 procent van wat de huizen verdienen in de kas');
  T.zetOptie('geld', 'beurzen');
  try {
    assert.equal(T.watDeWetDoet(S.dorp, 'belasting', 'aangenomen')[0].tekst, 'elke maand 1,3 goud in de kist');
  } finally {
    T.optiesTerug();
  }
});

test('de wetten gaan mee in een bewaard spel', () => {
  const S = gehucht();
  T.zetWet(S.dorp, 'rantsoen', 'krap');
  T.zetWet(S.dorp, 'belasting', 'aangenomen');
  S.dorp.wetten.gekapt = true;
  S.dorp.wetten.belastingRest = 0.6;
  const S2 = gehucht();
  assert.equal(T.herstelSpel(S2, T.bewaarSpel(S, { nu: 1790000000000 })).gelukt, true);
  assert.equal(T.standVanWet(S2.dorp, 'rantsoen'), 'krap');
  assert.equal(T.standVanWet(S2.dorp, 'belasting'), 'aangenomen');
  assert.equal(T.standVanWet(S2.dorp, 'vreemden'), 'afgeschaft');
  assert.equal(T.houtkapBoete(S2.dorp), 5);
  assert.equal(S2.dorp.wetten.belastingRest, 0.6);
});

test('de getallen van de wetten staan in de werkbank', () => {
  const deel = T.WERKBANK.find((d) => d.blok === 'WETTEN_INSTELLINGEN');
  assert.ok(deel, 'de wetten hebben een deel in de werkbank');
  const paden = T.werkbankGetallen(deel).map((g) => g.pad);
  for (const pad of ['rantsoen.krap.eten', 'rantsoen.ruim.tevreden', 'vreemden.aangenomen.gezinnen', 'houtkap.aangenomen.boete', 'belasting.aangenomen.goud']) {
    assert.ok(paden.includes(`WETTEN_INSTELLINGEN.${pad}`), pad);
  }
  // Wat een wet van de tevredenheid afhaalt, is negatief: de schuif loopt dan tot nul, niet van nul tot één.
  const b = T.werkbankBereik(-0.15);
  assert.ok(b.min < -0.15 && b.max === 0, JSON.stringify(b));
  assert.deepEqual(T.werkbankBereik(0.15), { min: 0, max: -b.min, stap: b.stap });
});
