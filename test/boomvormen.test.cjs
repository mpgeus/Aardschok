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
      const t = T.sprites.tekeningVan({ vel: 'bomen', id, x, y, soort: 'eik' }).id;
      assert.equal(vel.tiles[t].naam, 'eik');
      gezien.add(t);
    }
  }
  assert.equal(gezien.size, 6);
  // dezelfde tegel, dezelfde tekening; en wat maar één tekening heeft (het boompje), houdt de zijne
  assert.deepEqual(T.sprites.tekeningVan({ vel: 'bomen', id, x: 7, y: 3 }), T.sprites.tekeningVan({ vel: 'bomen', id, x: 7, y: 3 }));
  const boompje = eersteVan('boompje');
  assert.equal(T.sprites.tekeningVan({ vel: 'bomen', id: boompje, x: 7, y: 3 }).id, boompje);
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
  const plan = T.planOpEiland(5);
  const namen = new Set(plan.voorwerpen.map((v) => v.naam));
  for (const soort of ['linde', 'beuk', 'knotwilg']) assert.ok(namen.has(soort), `geen ${soort} op eiland 5`);
  // hetzelfde nummer, hetzelfde land
  const nog = T.planOpEiland(5);
  assert.deepEqual(nog.voorwerpen, plan.voorwerpen);
});

// De bomen in het jaar (vraag 148, stap 2; Marcel, 9 okt: "Ja vegetatie en bomen met seizoenen mee", en "Sneeuw moet ook
// nog op bomen"): per maand een seizoen, en sneeuw op de takken als er sneeuw ligt in de winter; per seizoen een vel met
// dezelfde nummers als het vel van de bomen.
test('de bomen staan in het seizoen van de maand, en in de winter met sneeuw als die ligt', () => {
  const dagIn = (maand) => (maand - T.TIJD_START_MAAND) * T.DAGEN_PER_MAAND + 10;
  const D = { weer: { sneeuw: 0 } };
  const S = { kalender: { dag: 0 }, dorp: D, dorpen: [D] };
  const echt = T.dorpHier;
  T.dorpHier = () => D;
  try {
    const seizoen = (maand) => ((S.kalender.dag = dagIn(maand)), T.boomSeizoen(S));
    assert.equal(seizoen(2), 'lente'); // lentemaand: een spel begint niet kaal
    assert.equal(seizoen(6), 'zomer');
    assert.equal(seizoen(9), 'herfst');
    assert.equal(seizoen(11), 'winter');
    D.weer.sneeuw = 0.5;
    assert.equal(seizoen(11), 'sneeuw');
    assert.equal(seizoen(2), 'lente'); // sneeuw in de lente blijft op de grond
    T.zetOptie('bomenInHetJaar', 'zomer');
    assert.equal(seizoen(11), 'zomer');
    T.zetOptie('bomenInHetJaar', 'mee');
    assert.equal(T.boomSeizoen({}), 'zomer'); // zonder kalender (het gereedschap)
  } finally {
    T.dorpHier = echt;
  }
});

test('een vel per seizoen heeft elke tekening op het nummer van de zomer, en een spar alleen met sneeuw', () => {
  for (const seizoen of ['lente', 'herfst', 'winter', 'sneeuw']) {
    const s = T.TEGELS[`bomen-${seizoen}`];
    assert.ok(s, `geen vel bomen-${seizoen} (npm run tiled bomen-${seizoen})`);
    assert.equal(s.seizoen, seizoen);
    s.tiles.forEach((t, i) => {
      if (!t || !t.cel) return;
      assert.equal(t.naam, vel.tiles[i].naam, `${seizoen} ${i}`);
      assert.equal(t.vorm, vel.tiles[i].vorm, `${seizoen} ${i}`);
    });
    const heeft = (naam) => s.tiles.some((t) => t && t.cel && t.naam === naam);
    assert.ok(heeft('eik') && heeft('beuk') && heeft('meidoorn'), seizoen);
    assert.equal(heeft('den'), seizoen === 'sneeuw', seizoen);
  }
  // in Node laadt geen plaatje, dus blijft een boom in de zomer: een vel dat er nog niet is, laat geen gat
  T.sprites.zetSeizoen('herfst');
  const id = eersteVan('eik');
  assert.equal(T.sprites.tekeningVan({ vel: 'bomen', id, x: 3, y: 4 }).vel, 'bomen');
  T.sprites.zetSeizoen('zomer');
});
