// Elke boom anders (werklijst vraag 148, a; Marcel, 9 okt: "Ja goed idee"): een soort heeft op het vel van de bomen meer
// tekeningen, en welke een boom krijgt, zegt zijn tegel (T.sprites.tekeningVan). Met de nieuwe soorten in T.BOMEN
// (js/wereld.js), die de maker legt waar ze passen (ANDERE_BOMEN in js/maker.js), en die overal meetellen.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

const vel = T.TEGELS.bomen;
const eersteVan = (naam) => vel.tiles.findIndex((t) => t && t.naam === naam && !t.vorm);

test('elke boom en struik uit T.BOMEN heeft een tekening, en een boom een vorm per tegel', () => {
  for (const soort of Object.keys(T.BOMEN)) assert.ok(T.opzoekTegelNaam(soort), `${soort} heeft geen tekening (npm run tiled bomen)`);
  // de eik in zijn zes vormen: op een stuk van twintig bij twintig staan ze allemaal, en elke tekening is een eik
  const id = eersteVan('eik');
  const gezien = new Set();
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 20; x++) {
      const t = T.sprites.tekeningVan({ vel: 'bomen', id, x, y, soort: 'eik' });
      assert.equal(vel.tiles[t].naam, 'eik');
      gezien.add(t);
    }
  }
  assert.equal(gezien.size, 6);
  // dezelfde tegel, dezelfde tekening; en wat maar één tekening heeft (het boompje), houdt de zijne
  assert.equal(T.sprites.tekeningVan({ vel: 'bomen', id, x: 7, y: 3 }), T.sprites.tekeningVan({ vel: 'bomen', id, x: 7, y: 3 }));
  const boompje = eersteVan('boompje');
  assert.equal(T.sprites.tekeningVan({ vel: 'bomen', id: boompje, x: 7, y: 3 }), boompje);
});

test('een nieuwe soort telt mee: een beuk is bos, een meidoorn rooi je, een appelboom is van iemand', () => {
  assert.ok(T.isBosBoom('beuk') && T.isBosBoom('groveDen') && T.isBosBoom('knotwilg'));
  assert.ok(!T.isBosBoom('meidoorn') && !T.isBosBoom('appelboom') && !T.isBosBoom('boompje'));
  const w = { tegels: [['vloer', 'vloer', 'vloer']], voorwerpen: [] };
  T.zetVoorwerp(w, { soort: 'beuk', x: 0, y: 0 });
  T.zetVoorwerp(w, { soort: 'meidoorn', x: 1, y: 0 });
  T.zetVoorwerp(w, { soort: 'appelboom', x: 2, y: 0 });
  assert.equal(T.ontginWerkOp(w, 0, 0), 'hakken');
  assert.equal(T.ontginWerkOp(w, 1, 0), 'rooien');
  assert.equal(T.ontginWerkOp(w, 2, 0), null);
  assert.ok(T.isEigenBoom(w.voorwerpen[2]));
});

test('de maker legt de nieuwe soorten, met een vaste keus per tegel: verder ligt alles waar het lag', () => {
  const plan = T.maakGehucht(5);
  const namen = new Set(plan.voorwerpen.map((v) => v.naam));
  for (const soort of ['linde', 'beuk', 'knotwilg']) assert.ok(namen.has(soort), `geen ${soort} op land 5`);
  // hetzelfde nummer, hetzelfde land
  const nog = T.maakGehucht(5);
  assert.deepEqual(nog.voorwerpen, plan.voorwerpen);
});

test('een kaart leest een gid zoals Tiled: een vel dat groeide, valt niet over het vel erna', () => {
  // het ontworpen gehucht heeft de bomen op 601 en de begroeiing op 633, van toen de bomen 32 tegels hadden
  const kaart = T.KAARTEN.gehucht;
  const sets = kaart.tilesets.map((t) => [t.source.split('/').pop(), t.firstgid]);
  const bomen = sets.find(([n]) => n === 'bomen.tsx')[1];
  const begroeiing = sets.find(([n]) => n === 'begroeiing.tsx')[1];
  assert.ok(vel.tiles.length > begroeiing - bomen, 'de bomen hebben nu meer tegels dan er plaats was');
  const S = { kalender: T.nieuweKalender() };
  const echt = console.warn;
  console.warn = () => {};
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
  }
  const w = S.wereld;
  const begroeid = w.voorwerpen.filter((v) => v.vel === 'begroeiing');
  assert.ok(begroeid.length > 0, 'de begroeiing van het gehucht komt nog uit het vel van de begroeiing');
  for (const v of w.voorwerpen.filter((v) => v.vel === 'bomen')) assert.ok(!vel.tiles[v.id].vorm, `${v.soort} op (${v.x}, ${v.y}) is een vorm, geen eerste tekening`);
});
