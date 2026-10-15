// De statussen van het dorp (js/statussen.js; werklijst vraag 77, stap 2; Marcel, 1 okt: "Iets wat begint en eindigt.
// Mogelijk in verschillende niveaus"): honger, eentonig eten, kou, een vol dorp en de rest, met waarom en wat helpt. Tot
// 15 okt stonden ze bij de voorvallen (ronde 3 van het snoeien, ontwerp/snoeien.md).
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp } = require('./grond.cjs');

T.ui = new Proxy({}, { get: () => () => {} });

const WINTER = 10 * T.DAGEN_PER_MAAND + 3; // louwmaand
const ZOMER = 4 * T.DAGEN_PER_MAAND + 3; // hooimaand

// Het proefdorp (test/grond.cjs) waar niets speelt: tevreden, niets te kort, vier soorten eten en plaats in de huizen.
function zonderOorzaak() {
  const S = proefDorp(T, { gebouwen: ['herberg', 'kapel'], weide: true }).S;
  const D = S.dorp;
  D.behoeften.tevredenheid = 0.8;
  D.behoeften.mist = [];
  D.behoeften.last = [];
  D.behoeften.afwisseling = ['graan', 'vlees', 'kaas', 'groente']; // vier soorten: het volle werk (vraag 154)
  D.bevolking = T.telWoonruimte(D) - 4;
  for (const o of Object.keys(T.OORZAKEN)) assert.equal(T.OORZAKEN[o].speelt(D, ZOMER), null, `${o} speelt niet`);
  return S;
}

test('eentonig eten is een status: minder dan vier soorten, en erger met één (vraag 154)', () => {
  const D = zonderOorzaak().dorp;
  const status = () => T.statussenVan(D, ZOMER).find((s) => s.id === 'eentonig') || null;
  assert.equal(status(), null, 'met vier soorten werkt het dorp op volle kracht');
  D.behoeften.afwisseling = ['graan', 'wijn'];
  let s = status();
  assert.equal(s.niveau, 1);
  assert.equal(s.zin, 'The food is plain, for the village eats only grain and wine, and works at 75%.');
  assert.match(s.helpt, /a hunter \[B\] \(meat\)/, 'wat een soort erbij brengt');
  assert.doesNotMatch(s.helpt, /wine/, 'niet wat er al op tafel staat');
  D.behoeften.afwisseling = ['graan'];
  s = status();
  assert.equal(s.niveau, 2);
  assert.equal(s.naam, 'One dish');
  assert.equal(s.zin, 'The village eats one dish, for there is only grain, and it works at 60%.');
});

test('een status speelt als het dorp hem heeft, en zegt waarom', () => {
  const D = zonderOorzaak().dorp;
  const nu = (o, dag = ZOMER) => T.oorzaakNu(D, o, dag);
  assert.equal(nu('honger'), null);

  T.zetWet(D, 'rantsoen', 'krap');
  assert.deepEqual(nu('honger'), { id: 'honger', niveau: 1, naam: 'Hunger', zin: 'There is hunger, for the rations are short.', waarom: 'the rations are short' });
  T.zetWet(D, 'rantsoen', 'gewoon');
  D.behoeften.mist = ['food'];
  assert.equal(nu('honger').zin, 'There is hunger, for there is not enough food.');
  D.behoeften.mist = [];

  D.behoeften.mist = ['firewood for the winter'];
  assert.equal(nu('kou'), null, 'kou is er alleen in de winter');
  D.voorraad.hout = 30;
  D.voorraad.turf = 0;
  assert.equal(nu('kou', WINTER).zin, 'It is cold in the houses, for the logs will not last the winter.');
  D.voorraad.hout = 0;
  // Is het brandhout op, dan is het erger: strenge kou (werklijst vraag 77, stap 2).
  assert.equal(nu('kou', WINTER).zin, 'It is freezing in the houses, for the firewood has run out.');
  assert.equal(nu('kou', WINTER).niveau, 2);
  D.behoeften.mist = [];

  D.bevolking = T.telWoonruimte(D);
  assert.deepEqual(nu('vol'), { id: 'vol', niveau: 1, naam: 'Full', zin: 'The houses are full.', waarom: '' });
  D.bevolking -= 4;

  D.behoeften.tevredenheid = T.STATUSSEN_INSTELLINGEN.onvrede - 0.1;
  D.behoeften.last = ['the tax'];
  assert.equal(nu('onvrede').zin, 'The village is discontented, for it is troubled by the tax.');
});

test('een status houdt bij sinds wanneer hij speelt, met wat helpt', () => {
  const D = zonderOorzaak().dorp;
  D.behoeften.mist = ['food'];
  T.tikStatussenDag(D, ZOMER);
  T.tikStatussenDag(D, ZOMER + 3);
  const s = T.statussenVan(D, ZOMER + 3).find((x) => x.id === 'honger');
  assert.equal(s.sinds, ZOMER, 'sinds de eerste dag');
  assert.ok(s.helpt, 'en wat helpt');
  D.behoeften.mist = [];
  T.tikStatussenDag(D, ZOMER + 4);
  assert.equal(D.statussen.honger, undefined, 'over is over');
});

// Sinds ronde 3 van het snoeien (15 okt) zegt een status het zelf, want het rapport van de raadsman is weg (CLAUDE.md:
// "een bericht zegt het als het begint, erger of minder wordt, of ophoudt").
test('een status zegt het als hij begint, erger of minder wordt, en ophoudt', () => {
  const D = zonderOorzaak().dorp;
  D.statussen = {}; // wat het proefdorp al had, telt niet
  const gezegd = [];
  const zeg = T.zeg;
  T.zeg = (D2, tekst) => gezegd.push(tekst);
  try {
    D.behoeften.mist = ['firewood for the winter'];
    D.voorraad.hout = 30;
    D.voorraad.turf = 0;
    T.tikStatussenDag(D, WINTER);
    assert.deepEqual(gezegd, ['It is cold in the houses, for the logs will not last the winter.'], 'het begin');
    T.tikStatussenDag(D, WINTER + 1);
    assert.equal(gezegd.length, 1, 'zolang het zo blijft, niets');
    D.voorraad.hout = 0;
    T.tikStatussenDag(D, WINTER + 2);
    assert.equal(gezegd[1], 'It is freezing in the houses, for the firewood has run out.', 'erger');
    D.voorraad.hout = 30;
    T.tikStatussenDag(D, WINTER + 3);
    assert.equal(gezegd[2], 'It is no longer freezing in the houses, but it is still cold.', 'minder');
    D.behoeften.mist = [];
    T.tikStatussenDag(D, WINTER + 4);
    assert.equal(gezegd[3], 'It is no longer cold in the houses.', 'over');
  } finally {
    T.zeg = zeg;
  }
});
