// De doorkijk zonder scherm (js/doorkijk.js): wie je door een boom of een huis heen ziet, en welk
// voorwerp daarvoor opengaat. Het tekenen zelf (het kijkvenster, het raster) is voor de browser. Zie
// ontwerp/beeld.md, "Doorkijk" (Marcel, 26 sep, vraag 34: "Ja dit is een goede optie" en "Raster ook
// als keuze"). Dat het venster en het raster keuzes zijn, toetst test/opties.test.cjs.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp } = require('./grond.cjs');

// Zonder scherm doet elke aanroep naar T.ui niets.
T.ui = new Proxy({}, { get: () => () => {} });

const standaard = { ...T.DOORKIJK_INSTELLINGEN };
test.afterEach(() => Object.assign(T.DOORKIJK_INSTELLINGEN, standaard));

// Het proefdorp (test/grond.cjs), met alleen de aanvoerder erin (ver weg van het plein); wie er verder nodig is, zet de toets
// er zelf bij. Het plein ligt rond het oude kampvuur: `hart(S)` is een tegel in het midden ervan, en de proef zet de rest
// ten opzichte daarvan neer.
function gehucht() {
  const { S, w } = proefDorp(T);
  S.spreektMet = null;
  S.dorp.aanvoerder = Object.assign(T.maakWezen('aanvoerder', 20, 20), { dorp: S.dorp }); // van het dorp (T.isVanDorp)
  w.wezens = [S.dorp.aanvoerder];
  T.werkMistBij(S, S.dorp); // wie in de mist loopt, zie je ook niet door een boom heen (js/mist.js): de aanvoerder kijkt hier
  return S;
}
const hart = (S) => S.dorp.plek.kamp.vuur;
const naast = (S, dx, dy) => ({ x: hart(S).x + dx, y: hart(S).y + dy });
const erbij = (S, e) => {
  S.wereld.wezens.push(e);
  return e;
};
// Een dorpeling op de tegel (dx, dy) van het hart van het plein.
const dorpelingOp = (S, id, dx, dy) => {
  const t = naast(S, dx, dy);
  return T.maakDorpeling(id, t.x, t.y);
};
// Een eik op het plein (het lege begin heeft er geen: het kamp is gerooid), een tegel naast het hart.
const eikOpHetPlein = (S) => {
  const t = naast(S, 1, 1);
  const eik = { soort: 'eik', x: t.x, y: t.y, vel: 'bomen', id: 0, beslaat: [1, 1] };
  S.wereld.voorwerpen.push(eik);
  return eik;
};
// Een huis vóór het plein, aan de kant van de camera, zoals in de proef van 26 sep.
const huisVoorHetPlein = (S) => ({ soort: 'huis', ...naast(S, 3, 8), vel: 'gebouwen', id: 4, beslaat: [7, 5] });

test('wie je door een boom of een huis heen ziet: wie ertoe doet overal, het plein alleen door een huis', () => {
  const S = gehucht();
  const w = S.wereld;
  const kind = erbij(S, dorpelingOp(S, 3, 0, 0));
  const buiten = erbij(S, T.maakDorpeling(4, 20, 21));
  assert.ok(T.opHetPlein(w, kind.tx, kind.ty) && !T.opHetPlein(w, buiten.tx, buiten.ty), 'de proef staat op en naast het plein');
  const kramer = erbij(S, T.maakMens('marskramer', 21, 20));
  assert.equal(T.zichtbaarDoor(S, S.dorp.aanvoerder), 'alles', 'de aanvoerder altijd');
  assert.equal(T.zichtbaarDoor(S, kramer), 'alles', 'een bezoeker ook, waar hij ook staat');
  assert.equal(T.zichtbaarDoor(S, kind), 'huis', 'wie op het plein staat: alleen door een huis heen');
  assert.equal(T.zichtbaarDoor(S, buiten), null, 'wie ergens anders loopt, verdwijnt erachter');
  S.spreektMet = buiten;
  assert.equal(T.zichtbaarDoor(S, buiten), 'alles', 'wie je spreekt wel');
  T.DOORKIJK_INSTELLINGEN.plein = false;
  assert.equal(T.zichtbaarDoor(S, kind), null, 'alleen wie ertoe doet: dan telt het plein niet mee');
  kramer.binnen = true;
  assert.equal(T.zichtbaarDoor(S, kramer), null, 'wie binnen is, zie je niet door een dak heen');
});

test('achter een huis vóór het plein gaat het huis open; achter een eik alleen voor wie ertoe doet', () => {
  const S = gehucht();
  const huis = huisVoorHetPlein(S);
  const eik = eikOpHetPlein(S);
  assert.ok(T.isGebouw(huis) && !T.isGebouw(eik), 'een huis beslaat meer dan één tegel, een eik niet');
  const achterHuis = erbij(S, dorpelingOp(S, 3, 1, 5));
  const achterEik = erbij(S, T.maakDorpeling(5, eik.x - 2, eik.y - 2));
  assert.ok(T.opHetPlein(S.wereld, achterHuis.tx, achterHuis.ty) && T.opHetPlein(S.wereld, achterEik.tx, achterEik.ty));
  T.werkDoorkijkBij(S, 1, [huis, eik]);
  assert.equal(huis.doorkijk, 1, 'het huis gaat open');
  assert.ok(huis.kijkgat.includes(achterHuis), 'voor wie op het plein erachter staat');
  assert.equal(eik.doorkijk, 0, 'de eik niet: dan zat hij vol gaten zolang de kinderen spelen');
  S.spreektMet = achterEik;
  T.werkDoorkijkBij(S, 1, [huis, eik]);
  assert.equal(eik.doorkijk, 1, 'maar wie je spreekt, zie je ook door een boom heen');
  assert.deepEqual(eik.kijkgat, [achterEik]);
  // Met "alleen wie ertoe doet" blijft het huis dicht voor wie op het plein speelt.
  S.spreektMet = null;
  T.DOORKIJK_INSTELLINGEN.plein = false;
  T.werkDoorkijkBij(S, 1, [huis]);
  assert.equal(huis.doorkijk, 0);
});

test('wie vóór het huis staat, laat het dicht; wie erachter staat, laat het in `tijd` seconden open en weer dicht', () => {
  const S = gehucht();
  const huis = huisVoorHetPlein(S);
  const e = erbij(S, dorpelingOp(S, 3, 1, 5));
  const t = T.DOORKIJK_INSTELLINGEN.tijd;
  T.werkDoorkijkBij(S, t / 2, [huis]);
  assert.ok(Math.abs(huis.doorkijk - 0.5) < 1e-9, 'halverwege open');
  T.werkDoorkijkBij(S, t, [huis]);
  assert.equal(huis.doorkijk, 1);
  // Hij loopt om het huis heen naar de voorkant: het huis gaat dicht, en het kijkgat weet nog even
  // wie erachter stond, zodat het vloeiend dichtgaat.
  e.x = e.tx = hart(S).x + 4;
  e.y = e.ty = hart(S).y + 14;
  assert.ok(T.staatVoorGebouw(e.tx, e.ty, huis));
  T.werkDoorkijkBij(S, t / 2, [huis]);
  assert.ok(huis.doorkijk > 0 && huis.doorkijk < 1, 'halverwege dicht');
  assert.deepEqual(huis.kijkgat, [e]);
  T.werkDoorkijkBij(S, t, [huis]);
  assert.equal(huis.doorkijk, 0);
});

// Op een feest staat het hele dorp op het plein, en kreeg het dak van een huis ervoor een gat voor elk van hen (Marcel,
// 10 okt: "Ja akkoord", op een feest alleen wie ertoe doet). Wie je zoekt met een voorval, zie je altijd.
test('wie op het plein staat, zie je door een huis heen; met de spelregel niet', () => {
  const { S } = proefDorp(T);
  T.werkMistBij(S, S.dorp); // het plein kijkt (js/mist.js)
  const dag = Math.floor(S.kalender.dag) + 1;
  S.kalender.dag = dag + 11 / 24;
  const kind = dorpelingOp(S, 3, 0, 0);
  assert.ok(T.opHetPlein(S.wereld, kind.tx, kind.ty));
  assert.equal(T.zichtbaarDoor(S, kind), 'huis', 'het plein, door een huis heen');
  T.zetOptie('doorkijkPlein', 'wieErToeDoet');
  assert.equal(T.zichtbaarDoor(S, kind), null, 'alleen wie ertoe doet');
  T.zetOptie('doorkijkPlein', 'ookHetPlein');
});

// Staan er meer hoge voorwerpen voor iemand, dan komt zijn kijkgat één keer, na het voorste in de volgorde van tekenen,
// en zo ver open als het verst openstaande (js/tekenen.js, voorsteKijkgaten; 13 okt: in een bos tekenden 20 tot 30 bomen
// elk beeld hetzelfde gat om de aanvoerder).
test('één kijkgat per wezen, na het voorste voorwerp dat hem bedekt', () => {
  const aanvoerder = { soort: 'aanvoerder' };
  const kind = { soort: 'dorpeling' };
  const achter = { kijkgat: [aanvoerder], doorkijk: 1 };
  const midden = { kijkgat: [aanvoerder, kind], doorkijk: 1 };
  const voor = { kijkgat: [aanvoerder], doorkijk: 0.4 }; // gaat net open
  const dicht = { kijkgat: [kind], doorkijk: 0 }; // was dicht: telt niet
  const volgorde = [achter, midden, dicht, voor].map((v) => ({ voorwerp: v }));
  volgorde.splice(1, 0, { f: () => {} }); // een wezen of iets anders zonder voorwerp
  const gaten = new Map();
  T.voorsteKijkgaten(volgorde, gaten);
  assert.deepEqual([...gaten.keys()], [voor, midden], 'alleen het voorste voor elk wezen');
  assert.deepEqual(gaten.get(voor), [{ e: aanvoerder, sterkte: 1 }], 'zo open als het verst openstaande');
  assert.deepEqual(gaten.get(midden), [{ e: kind, sterkte: 1 }]);
});
