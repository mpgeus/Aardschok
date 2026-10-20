// De regie van de scènes op Sint-Maarten (js/regie.js; werklijst E, stap 4): welke scène er speelt, en wat ze toont (waar
// de camera kijkt, de zin onderin, hoe snel de tijd loopt), komen uit wat de wereld nu is. Het scherm zelf (de banden,
// de zin, het zwart, overslaan met een klik of Esc) bekijkt Marcel in de browser. Het leger en de wagen in de wereld staan
// in test/heer.test.cjs.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { heerOpHetPlein } = require('./grond.cjs');
const IN = T.REGIE_INSTELLINGEN;

test('geen scène zolang de heer wacht; weigeren is er een, en na het eind begint er geen meer', () => {
  const { D } = heerOpHetPlein(T);
  assert.equal(T.welkeScene(D), null);
  T.weigerHeer(D);
  assert.equal(T.welkeScene(D), 'weigeren');
  T.eindVanSintMaarten(D); // overslaan
  assert.equal(D.einde && D.einde.reden, 'leger', 'overslaan is meteen het eind');
  assert.equal(T.welkeScene(D), null);
});

test('weigeren: de camera kijkt hem na, dan valt de nacht (de tijd snel), dan volgt hij de kop van zijn leger (1×)', () => {
  const { S, D, plein, tik } = heerOpHetPlein(T);
  T.weigerHeer(D);
  const R = { soort: T.welkeScene(D), t: 0 };
  let s = T.regieShot(D, R);
  const heer = D.heer.bezoek.wezens[0];
  assert.equal(s.stap, 'gaat');
  assert.deepEqual(s.volg, { x: heer.x, y: heer.y });
  assert.equal(s.snelheid, 1);
  assert.match(s.zin, /leaves/);
  R.t = IN.nakijken;
  s = T.regieShot(D, R);
  assert.equal(s.stap, 'nacht');
  assert.deepEqual(s.volg, plein);
  assert.ok(T.SNELHEDEN.includes(s.snelheid) && s.snelheid > 1, 'een stand van de versneller');
  // Het donker: zijn leger komt, en de wereld zet de tijd op 1×, zoals bij de heer zelf (T.naarGewoneSnelheid).
  T.zetSnelheid(S, s.snelheid);
  S.kalender.dag = D.heer.leger.komt;
  tik();
  assert.equal(S.kalender.snelheid, 1);
  s = T.regieShot(D, R);
  const kop = T.legerVanDeHeer(D)[0];
  assert.equal(s.stap, 'leger');
  assert.deepEqual(s.volg, { x: kop.x, y: kop.y });
  assert.equal(s.snelheid, 1);
});

test('betalen is alleen in de demo een scène: ze halen het (de tijd wat sneller), brengen het, en hij rijdt weg', () => {
  const { D, b } = heerOpHetPlein(T);
  T.zetVoorraad(D, 'graan', 200);
  T.betaalHeer(D, T.alWatHijVraagt(D));
  assert.equal(T.welkeScene(D), null, 'in het volle spel gaat het spel gewoon door');
  T.DEMO_INSTELLINGEN.aan = true;
  try {
    assert.equal(T.welkeScene(D), 'betalen');
    const R = { soort: 'betalen', t: 0 };
    let s = T.regieShot(D, R);
    assert.equal(s.stap, 'halen');
    assert.equal(s.snelheid, IN.halen);
    // De camera kijkt tussen de wagen en je voorraad in, zodat je ze ziet gaan en komen.
    const v = T.deVoorraad(D);
    assert.deepEqual(s.volg, { x: (b.wagen.x + v.x) / 2, y: (b.wagen.y + v.y) / 2 });
    b.laden.fase = 'terug';
    s = T.regieShot(D, R);
    assert.equal(s.stap, 'brengen');
    assert.equal(s.snelheid, 1);
    b.laden = null;
    b.weg = true;
    s = T.regieShot(D, R);
    assert.equal(s.stap, 'weg');
    assert.deepEqual(s.volg, { x: b.wagen.x, y: b.wagen.y });
  } finally {
    T.DEMO_INSTELLINGEN.aan = false;
  }
});
