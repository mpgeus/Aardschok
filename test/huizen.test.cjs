// De huizen van de huizenbouwer in het spel (ronde 4b; ontwerp/beeld.md, "Ronde 4b: de huizen in het
// spel"): het vel tegels/huizen.png uit gereedschap/pixelart/huizen.cjs, en de deur die elk huis
// meebrengt (T.deurVan, js/bewoners.js). Het anker van elk huis bewaakt test/tegelanker.test.cjs, net
// als bij de andere vellen.
const test = require('node:test');
const assert = require('node:assert/strict');

const TEGELS = require('../tegels/tegels.json');
const { HUIZEN } = require('../gereedschap/pixelart/huizen.cjs');

const T = require('./laad.cjs').spel();

const opHetVel = () => TEGELS.huizen.tiles.filter((t) => t && t.naam);

test('elk huis uit huizen.cjs staat op het vel, en er staat niets anders op', () => {
  assert.ok(TEGELS.huizen, 'geen vel "huizen" in tegels.json: draai npm run tiled huizen');
  // Een huis dat in huizen.cjs bijkomt of verandert, staat pas in het spel als het vel opnieuw gemaakt is.
  assert.deepEqual(opHetVel().map((t) => t.naam).sort(), Object.keys(HUIZEN).sort());
});

test('elke opgave ligt vast, ook de uitbouwen', () => {
  // Zonder `uit` kiest het zaad de uitbouwen, en dan zet een nieuwe kans in huis-sdf.cjs stil een
  // ander huis op het vel (werklijst, "Tegelijk: de huizenbouwer", ronde 4).
  for (const [naam, o] of Object.entries(HUIZEN)) {
    assert.ok(o.uit !== undefined, `${naam}: geen uit`);
    assert.ok(Number.isInteger(o.zaad), `${naam}: geen zaad`);
    assert.ok(o.vorm && o.b && o.d && o.lagen && o.nok && o.dak && o.wand, `${naam}: de opgave is niet helemaal uitgeschreven`);
    assert.ok(T.GEBOUWEN[o.gebouw], `${naam}: onbekend gebouw ${o.gebouw}`);
  }
});

// De ramen die je ziet (27 sep, vraag 39): de huizenbouwer geeft ze door, zodat 's avonds de ramen van
// de herberg branden en je de gasten erachter ziet (js/tekenen.js). Elk raam is een lijst ruitjes, en elk
// ruitje zijn omtrek, [x, y, x, y, ...] in pixels vanaf het anker, binnen de tekening zelf.
test('elk huis weet waar zijn ramen zitten, binnen zijn eigen tekening', () => {
  for (const t of opHetVel()) {
    assert.ok(Array.isArray(t.ramen), `${t.naam}: geen ramen`);
    const [links, boven, rechts, onder] = t.doos;
    for (const raam of t.ramen) {
      assert.ok(raam.length >= 1, `${t.naam}: een raam zonder ruitjes`);
      for (const ruit of raam) {
        assert.ok(ruit.length >= 6 && ruit.length % 2 === 0, `${t.naam}: een ruitje heeft geen omtrek`);
        for (let i = 0; i < ruit.length; i += 2) {
          assert.ok(ruit[i] >= -links && ruit[i] <= rechts, `${t.naam}: x ${ruit[i]} buiten de tekening`);
          assert.ok(ruit[i + 1] >= -boven && ruit[i + 1] <= onder, `${t.naam}: y ${ruit[i + 1]} buiten de tekening`);
        }
      }
    }
  }
  const herberg = opHetVel().find((t) => t.naam === 'herberg1');
  assert.ok(herberg.ramen.length >= 3, `de herberg heeft ramen genoeg voor een paar gasten (${herberg.ramen.length})`);
});

test('de deur van elk huis ligt net buiten zijn voet, aan de rand', () => {
  for (const t of opHetVel()) {
    const [b, d] = t.beslaat;
    assert.ok(Array.isArray(t.deur), `${t.naam}: geen deur`);
    const [dx, dy] = t.deur;
    const buiten = dx < 0 || dy < 0 || dx >= b || dy >= d;
    const rand = dx >= -1 && dy >= -1 && dx <= b && dy <= d;
    assert.ok(buiten && rand, `${t.naam}: deur ${dx},${dy} ligt niet net buiten een voet van ${b}×${d}`);
  }
});

test('T.deurVan neemt de deur van de tekening, en anders het midden van de zuidkant', () => {
  const hut = T.opzoekTegelNaam('huizen/hut1');
  const [b, d] = hut.eig.beslaat;
  const [dx, dy] = hut.eig.deur;
  const g = { soort: 'hut', x: 10, y: 20, voet: { b, h: d }, tekening: 'huizen/hut1' };
  assert.deepEqual(T.deurVan(null, g), { x: 10 + dx, y: 20 + dy });
  // een gebouw zonder tekening met een deur: zoals het altijd was
  const oud = { soort: 'huis', x: 10, y: 20, voet: { b: 5, h: 4 }, tekening: 'gebouwen/dorpKlein2' };
  assert.deepEqual(T.deurVan(null, oud), { x: 12, y: 24 });
  const zonder = { soort: 'huis', x: 10, y: 20, voet: { b: 5, h: 4 } };
  assert.deepEqual(T.deurVan(null, zonder), { x: 12, y: 24 });
});

// Ronde 4b van de huizenbouwer (26 sep, achtste sessie; ontwerp/beeld.md, "Ronde 4b: de huizen in het
// spel"): de huizen van het gehucht komen van de huizenbouwer, elk met zijn eigen deur, en niet allemaal
// dezelfde kant op. Voor elke deur moet je kunnen staan: daar gaan de bewoners heen (T.deurVan).
test('de huizen van het gehucht komen van de huizenbouwer, en voor elke deur kun je staan', () => {
  const S = { kalender: T.nieuweKalender() }; // het spel; zijn dorp (S.dorp) komt met de kaart
  const waarschuw = console.warn;
  console.warn = () => {};
  assert.ok(T.beginOpKaart(S, 'gehucht'));
  console.warn = waarschuw;
  const w = S.wereld;
  const huizen = S.dorp.gebouwen.filter((g) => g.tekening && g.tekening.startsWith('huizen/'));
  assert.equal(huizen.length, 10, 'vijf boerderijen, de schout, een huis, twee hutten en de herberg');
  const kanten = new Set();
  for (const g of huizen) {
    const eig = T.opzoekTegelNaam(g.tekening).eig;
    assert.deepEqual([g.voet.b, g.voet.h], eig.beslaat, `${g.tekening}: de voet van de tekening`);
    const deur = T.deurVan(w, g);
    assert.deepEqual(deur, { x: g.x + eig.deur[0], y: g.y + eig.deur[1] }, `${g.tekening}: de deur van de tekening`);
    assert.ok(T.isBegaanbaar(w, deur.x, deur.y), `${g.tekening}: voor de deur kun je staan`);
    kanten.add(eig.deur[0] < 0 ? 'west' : eig.deur[1] < 0 ? 'noord' : eig.deur[0] >= eig.beslaat[0] ? 'oost' : 'zuid');
  }
  assert.ok(kanten.size >= 3, `de deuren wijzen verschillende kanten op (${[...kanten].join(', ')})`);
});
