// De wetten (js/wetten.js; werklijst vraag 54, Marcel, 29 sep: "een menu zoals in diplomacy 3, waar je weten kunt
// aannemen", en "A ja B ja"): het rantsoen en de belasting (sinds ronde 3 van het snoeien, 15 okt; vreemden welkom en
// houtkap in het bos van de heer zijn weg). Elke
// wet heeft een voordeel en een nadeel, hij geldt meteen, en zonder wetten speelt het spel zoals ervoor.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp } = require('./grond.cjs');

T.ui = { bericht() {}, plek() {}, toonKalender() {}, toonVoorraad() {}, toonBevolking() {}, toonInventaris() {} };

// Het proefdorp (test/grond.cjs): twee boerderijen en hutten, zoals een nieuw spel na een dag bouwen is; stil (zoals in
// test/treden.test.cjs).
function gehucht() {
  const S = proefDorp(T).S;
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set() });
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
});

// Sinds 15 okt twee, zoals in Stronghold (ronde 3 van het snoeien; Marcel: "Rantsoen en belasting").
test('het gehucht heeft twee wetten, in de volgorde van het menu: het rantsoen en de belasting', () => {
  const S = gehucht();
  assert.deepEqual(T.wettenVanNu(S.dorp), ['rantsoen', 'belasting']);
  assert.equal(T.wetIsAanUit('rantsoen'), false, 'het rantsoen heeft drie standen');
  assert.equal(T.wetIsAanUit('belasting'), true);
});

test('een krap rantsoen: ieder eet driekwart, en het dorp is 15% minder tevreden', () => {
  const S = gehucht();
  const voor = tevreden(S);
  assert.equal(T.zetWet(S.dorp, 'rantsoen', 'krap').kan, true);
  assert.equal(T.standVanWet(S.dorp, 'rantsoen'), 'krap');
  assert.ok(bijna(T.etenPerMens(S.dorp), 0.75 * T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag));
  const na = tevreden(S);
  assert.ok(bijna(voor.tevredenheid - na.tevredenheid, 0.15), `${voor.tevredenheid} → ${na.tevredenheid}`);
  assert.ok(na.last.includes('the short rations'), na.last.join(', '));
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
  assert.deepEqual(na.blij, ['the generous rations']);
  // Terug naar gewoon: zoals ervoor.
  T.zetWet(S.dorp, 'rantsoen', 'gewoon');
  assert.ok(bijna(tevreden(S).tevredenheid, voor.tevredenheid));
});

test('de belasting: op de eerste van de maand goud in de kist, en wat geen heel goud is, gaat mee', () => {
  const S = gehucht();
  S.dorp.bevolking = 26;
  const voor = tevreden(S).tevredenheid;
  T.zetWet(S.dorp, 'belasting', 'aangenomen');
  assert.ok(bijna(voor - tevreden(S).tevredenheid, 0.1));
  assert.ok(tevreden(S).last.includes('the tax'));
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
  assert.equal(krap[0].tekst, 'everyone eats three quarters as much: 1 grain a day instead of 1.3');
  assert.equal(krap[1].tekst, '15% less content');
  const ruim = T.watDeWetDoet(S.dorp, 'rantsoen', 'ruim');
  assert.deepEqual(ruim.map((r) => r.tekst), ['10% more content', 'everyone eats half as much again: 2 grain a day instead of 1.3']);
  assert.deepEqual(T.watDeWetDoet(S.dorp, 'rantsoen', 'gewoon'), [], 'gewoon doet niets');
  assert.equal(T.watDeWetDoet(S.dorp, 'belasting', 'aangenomen')[0].tekst, '1.3 gold into the chest every month');
});

test('de wetten gaan mee in een bewaard spel', () => {
  const S = gehucht();
  T.zetWet(S.dorp, 'rantsoen', 'krap');
  T.zetWet(S.dorp, 'belasting', 'aangenomen');
  S.dorp.wetten.belastingRest = 0.6;
  const S2 = gehucht();
  assert.equal(T.herstelSpel(S2, T.bewaarSpel(S, { nu: 1790000000000 })).gelukt, true);
  assert.equal(T.standVanWet(S2.dorp, 'rantsoen'), 'krap');
  assert.equal(T.standVanWet(S2.dorp, 'belasting'), 'aangenomen');
  assert.equal(S2.dorp.wetten.belastingRest, 0.6);
});

test('de getallen van de wetten staan in de werkbank', () => {
  const deel = T.WERKBANK.find((d) => d.blok === 'WETTEN_INSTELLINGEN');
  assert.ok(deel, 'de wetten hebben een deel in de werkbank');
  const paden = T.werkbankGetallen(deel).map((g) => g.pad);
  for (const pad of ['rantsoen.krap.eten', 'rantsoen.ruim.tevreden', 'belasting.aangenomen.goud']) {
    assert.ok(paden.includes(`WETTEN_INSTELLINGEN.${pad}`), pad);
  }
  // Wat een wet van de tevredenheid afhaalt, is negatief: de schuif loopt dan tot nul, niet van nul tot één.
  const b = T.werkbankBereik(-0.15);
  assert.ok(b.min < -0.15 && b.max === 0, JSON.stringify(b));
  assert.deepEqual(T.werkbankBereik(0.15), { min: 0, max: -b.min, stap: b.stap });
});
