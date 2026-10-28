// De veldslag (vraag 187 en 188, stap 3; js/veldslag.js; ontwerp/scenario.md, 7): skirmish zonder economie. Stap 3a1: een
// kaart is een klein eiland uit een recept (T.KAARTEN, levels/kaarten.js; js/eiland.js), met variatie uit het zaad.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

const ford = (zaad) => {
  const w = T.veldslagWereld('ford', zaad);
  return { w, E: T.eilandVan(w.eiland), R: T.eilandVan(w.eiland).recept };
};
const grond = (w, x, y) => (T.grondOp(w, x, y) || {}).naam;

test('The Ford: een klein eiland met een rivier, twee voorden, een brug, een pas van rotsen en open stroken', () => {
  const { w, E, R } = ford(1);
  assert.deepEqual(w.eiland, { zaad: 1, recept: 'ford' }, 'de wereld draagt het recept');
  assert.equal(R.maat, 96);
  // zee om het land, en het land binnen de rand
  assert.equal(grond(w, R.x0 - 4, Math.round(R.cy)), 'zee');
  const rand = T.kaartGrens(w);
  assert.ok(rand.x <= R.x0 && rand.x + rand.b >= R.x0 + R.maat, 'het land ligt binnen de rand');
  // de rivier: water tussen links en rechts, behalve bij de brug en de voorden
  assert.equal(E.bruggen.length, 1, 'één brug');
  assert.equal(R.voorden.length, 2, 'twee voorden');
  for (const v of R.voorden) {
    assert.equal(grond(w, Math.round(v.x), Math.round(v.y)), 'strand', 'een voorde is zand');
    assert.ok(T.isBegaanbaar(w, Math.round(v.x), Math.round(v.y), {}), 'je loopt door een voorde');
  }
  // tussen de voorden en de brug is de rivier water
  const tussen = { x: Math.round((R.voorden[0].x + R.brug.x) / 2), y: Math.round((R.voorden[0].y + R.brug.y) / 2) };
  const water = [];
  for (let d = -6; d <= 6; d++) water.push(grond(w, tussen.x + d, tussen.y - d));
  assert.ok(water.includes('water'), `water tussen voorde en brug: ${water.join(' ')}`);
  // de rotsen van de pas staan er, en zijn niet te begaan
  assert.ok(R.rotsen.length >= 20, `${R.rotsen.length} rotsen`);
  const gezet = R.rotsen.filter((p) => w.voorwerpen.some((v) => v.soort === 'rots' && v.x === p.x && v.y === p.y));
  assert.ok(gezet.length >= R.rotsen.length * 0.8, `${gezet.length} van de ${R.rotsen.length} rotsen staan`);
  for (const p of gezet) assert.ok(!T.isBegaanbaar(w, p.x, p.y, {}), 'een rots staat in de weg');
  // van de ene strook naar de andere over land, en de stroken zijn open (bijna geen bomen)
  const midden = (st) => ({ x: Math.round(st.hoeken.reduce((s, h) => s + h[0], 0) / 4), y: Math.round(st.hoeken.reduce((s, h) => s + h[1], 0) / 4) });
  const [links, rechts] = R.stroken.map(midden);
  assert.ok(T.zoekRoute(w, links, rechts, {}), 'van links naar rechts');
  for (const st of R.stroken) {
    const m = midden(st);
    let bomen = 0;
    let tegels = 0;
    for (let y = m.y - 5; y <= m.y + 5; y++) {
      for (let x = m.x - 5; x <= m.x + 5; x++) {
        tegels++;
        const v = T.voorwerpOp(w, x, y);
        if (v && T.BOMEN[v.soort]) bomen++;
      }
    }
    assert.ok(bomen <= tegels * 0.08, `de strook is open: ${bomen} bomen op ${tegels} tegels`);
  }
  // de heuvels steken boven het land uit
  for (const h of R.heuvels) assert.ok(T.hoogteOp(w, h.x, h.y) > R.land + 30, `een heuvel: ${T.hoogteOp(w, h.x, h.y)}`);
});

test('The Ford: hetzelfde zaad is dezelfde kaart, een ander zaad een andere', () => {
  const a = ford(1).R;
  const b = ford(1).R;
  const c = ford(2).R;
  const vorm = (R) => JSON.stringify({ h: R.heuvels, b: R.bos, v: R.voorden, r: R.rotsen });
  assert.equal(vorm(a), vorm(b), 'hetzelfde zaad');
  assert.notEqual(vorm(a), vorm(c), 'een ander zaad');
});

test('het grote eiland blijft wat het was, en een kaart en het eiland wisselen elkaar af', () => {
  const groot = T.eilandVan(5);
  assert.equal(groot.recept, undefined);
  assert.ok(groot.plekken.length > 5, 'dorpen, een kasteel, een stad');
  const kaart = T.eilandVan({ zaad: 5, recept: 'ford' });
  assert.ok(kaart.recept, 'met een recept is het een kaart');
  assert.equal(kaart.plekken.length, 0, 'een kaart heeft geen dorpsplekken');
  assert.notEqual(T.eilandVan(5), kaart, 'en het eiland van 5 is weer het grote');
  assert.throws(() => T.eilandVan({ zaad: 1, recept: 'nergens' }), /geen kaart nergens/);
});

// Stap 3a2: de veldslag zelf. Twee legers zonder dorp op de kaart, in een linie in hun strook (D1), de dag staat stil en
// de snelheid is 1×, en wie geen mannen meer heeft, verliest; is de tijd om, dan wint wie er de meeste heeft (E2).
const berichten = [];
// Zonder veldheer: hier staan beide legers stil tot de toets ze stuurt (de veldheer toetst test/veldheer.test.cjs).
const slag = (legers, minuten = null) => {
  const zonder = legers.map((l) => ({ ...l, veldheer: false }));
  const S = T.proefdorp.begin(T.proefdorp.zaad, T.veldslagLevel({ kaart: 'ford', zaad: 1, legers: zonder, minuten }));
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen' }, T.schermVelden());
  S.kalender.snelheid = 1;
  berichten.length = 0;
  return S;
};
const seconden = (S, n, stop = () => false) => {
  for (let t = 0; t < n && !stop(); t++) for (let i = 0; i < 1 / T.TIK; i++) T.wereldTik(S);
};
const ids = (D) => D.bewoners.mensen.filter((p) => p.soldaat || p.aanvoerder).map((p) => p.id);

test('een veldslag: de keuring, en twee legers zonder dorp, elk in een linie in zijn strook', () => {
  const ui = T.ui;
  T.ui = new Proxy({}, { get: (_, naam) => (naam === 'bericht' ? (t) => berichten.push(t) : () => {}) });
  try {
    const L = T.veldslagLevel({ kaart: 'ford', zaad: 1, legers: [{ soorten: { speerman: 6, boogschutter: 3 } }, { soorten: { speerman: 6 } }], minuten: 5 });
    assert.deepEqual(T.keurScenario(L), []);
    const heeft = (lijst, stuk) => assert.ok(lijst.some((z) => z.includes(stuk)), `${stuk} in ${JSON.stringify(lijst)}`);
    heeft(T.keurScenario({ veldslag: { kaart: 'nergens', zaad: 1, legers: [{}, {}] } }), 'de kaart nergens is er niet');
    heeft(T.keurScenario({ veldslag: { kaart: 'ford', zaad: 1, legers: [{}] } }), 'minstens twee legers');
    heeft(T.keurScenario({ veldslag: { kaart: 'ford', zaad: 1, legers: [{}, {}, {}] } }), 'is voor 2 spelers');
    heeft(T.keurScenario({ veldslag: { kaart: 'ford', zaad: 1, legers: [{ soorten: { ridder: 1 } }, {}] } }), 'de soldaat ridder bestaat niet');
    const S = slag(L.veldslag.legers, 5);
    const [A, B] = S.dorpen;
    assert.equal(S.dorp, A);
    assert.ok(S.veldslag && A.veldslag && B.veldslag);
    assert.ok(!A.ander && !B.ander, 'twee spelers: geen van beide is een ander dorp (dat is een leger met een veldheer)');
    assert.equal(T.legerVan(A).length, 10, 'negen soldaten en de held');
    assert.equal(T.legerVan(B).length, 7);
    assert.ok(!A.gebouwen.length && !A.begin, 'geen kar en geen kamp');
    // de linie: wie schiet, staat achter wie steekt, en elk heeft zijn post. Voor en achter is langs de richting van de
    // troep (post.richting, naar de vijand): de linie staat schuin op de kaart, dus de afstand tot de vijand zegt het niet.
    const mannen = T.militieVan(A);
    for (const e of mannen) assert.deepEqual([e.tx, e.ty], [e.post.x, e.post.y], 'op zijn post');
    const r = mannen[0].post.richting;
    const voor = (e) => e.tx * r.x + e.ty * r.y;
    const speer = mannen.filter((e) => e.bewoner.soldaat.soort === 'speerman').map(voor);
    const boog = mannen.filter((e) => e.bewoner.soldaat.soort === 'boogschutter').map(voor);
    assert.ok(Math.min(...speer) > Math.max(...boog), `de speren voor: ${speer} tegen ${boog}`);
    assert.ok(voor(A.aanvoerder) < Math.min(...boog), 'de held achter de linie');
    // een minuut later: iedereen staat er nog, de dag staat stil, en geen dorp met zijn zorgen
    const plekken = mannen.map((e) => `${e.tx},${e.ty}`).join(' ');
    const dag = S.kalender.dag;
    S.kalender.snelheid = 30;
    assert.equal(T.snelheidNu(S), 1, 'geen versneller');
    seconden(S, 60);
    assert.equal(S.kalender.dag, dag, 'de dag staat stil');
    assert.equal(mannen.map((e) => `${e.tx},${e.ty}`).join(' '), plekken, 'iedereen staat op zijn post');
    assert.deepEqual(T.oorzakenNu(A, Math.floor(dag)), [], 'geen statussen van een dorp');
    assert.equal(T.raadNu(A), null, 'geen raad');
    assert.equal(T.doelLinksboven(S, A).tekst, 'Defeat the enemy army.');
    // de vijand rukt op: het gevecht, en wie geen mannen meer heeft, verliest
    T.geefOpdracht(S, { soort: 'stuur', dorp: 1, wie: ids(B), naar: T.tegelVan(mannen[0]) });
    seconden(S, 300, () => !!A.einde);
    assert.ok(A.einde && B.einde, 'het is uit, voor elk leger');
    assert.equal(A.einde.reden, 'scenario');
    const [a, b] = [T.legerVan(A).length, T.legerVan(B).length];
    assert.ok(!a || !b, 'een van beide heeft geen mannen meer');
    assert.equal(A.einde.kop, a > b ? 'Victory' : a === b ? 'A draw' : 'Defeat');
    assert.equal(B.einde.kop, b > a ? 'Victory' : a === b ? 'A draw' : 'Defeat');
    assert.equal(A.einde.gewonnen, a > b);
    assert.ok(berichten.some((t) => t.startsWith('The battle was hard')), 'wie viel, viel in een veldslag');
  } finally {
    T.ui = ui;
  }
});

test('een veldslag met een tijd: is die om, dan wint wie de meeste mannen heeft, en evenveel is gelijk', () => {
  const S = slag([{ soorten: { speerman: 3 } }, { soorten: { speerman: 3 } }], 1);
  seconden(S, 70, () => !!S.dorp.einde);
  assert.equal(S.dorp.einde.kop, 'A draw');
  assert.equal(S.dorp.einde.gewonnen, false);
  const S2 = slag([{ soorten: { speerman: 3 } }, { soorten: { speerman: 3 } }], 1);
  const [, B] = S2.dorpen;
  T.militieVan(B)[0].dood = true;
  seconden(S2, 70, () => !!S2.dorp.einde);
  assert.equal(S2.dorp.einde.kop, 'Victory');
  assert.ok(/4 of your men are still standing, against 3/.test(S2.dorp.einde.tekst), S2.dorp.einde.tekst);
});

// Samen (lockstep; Marcel, 28 okt: "Vergeet niet dat dit ook in multiplayer allemaal moet werken"): twee computers met
// hetzelfde begin en dezelfde opdrachten, maar de een speelt leger A en de ander leger B (S.dorp, wat het scherm speelt).
// De wereld moet op beide letter voor letter gelijk lopen, en elk leger krijgt op beide zijn eigen uitslag. Met twee
// spelers die elkaar tegemoet gaan, en met twee veldheren (js/veldheer.js) waar elke computer naar een ander leger kijkt.
test('samen: twee computers die elk een ander leger spelen, lopen letter voor letter gelijk tot de uitslag', () => {
  const ui = T.ui;
  T.ui = new Proxy({}, { get: () => () => undefined });
  try {
    const staat = (S) => {
      const d = S.dorp;
      S.dorp = S.dorpen[0];
      const s = T.bewaarSpel(S, { nu: 0 });
      S.dorp = d;
      return s;
    };
    for (const veldheer of [false, true]) {
      const legers = [{ soorten: { speerman: 4, boogschutter: 2 }, veldheer }, { soorten: { speerman: 4, boogschutter: 2 }, veldheer }];
      const computers = [0, 1].map((speelt) => {
        const S = T.proefdorp.begin(T.proefdorp.zaad, T.veldslagLevel({ kaart: 'ford', zaad: 3, legers, minuten: 5 }));
        Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen' }, T.schermVelden());
        S.kalender.snelheid = 1;
        S.dorp = S.dorpen[speelt];
        return S;
      });
      const R = T.eilandVan(computers[0].wereld.eiland).recept;
      const strook = (i) => R.naarTegel((R.stroken[i].a[0] + R.stroken[i].a[1]) / 2, (R.stroken[i].b[0] + R.stroken[i].b[1]) / 2).map(Math.round);
      for (let tik = 0; tik < 5 * 60 / T.TIK && !computers.every((S) => S.dorpen.every((D) => D.einde)); tik++) {
        // twee spelers: A valt aan, B houdt stand; de opdracht komt op beide computers in dezelfde tik (de lijn)
        if (!veldheer && tik === 30) {
          const [x, y] = strook(1);
          for (const S of computers) T.geefOpdracht(S, { soort: 'stuur', dorp: 0, wie: T.nummersVan(S.dorpen[0], T.legerVan(S.dorpen[0])), naar: { x, y } });
        }
        for (const S of computers) T.wereldTik(S);
        if (tik % 600 === 0) assert.equal(staat(computers[1]), staat(computers[0]), `gelijk in tik ${tik}`);
      }
      const [een, twee] = computers;
      assert.equal(staat(twee), staat(een), 'gelijk tot het eind');
      for (const S of computers) {
        const [A, B] = S.dorpen;
        assert.ok(A.einde && B.einde, `het is uit voor elk leger (${veldheer ? 'veldheren' : 'spelers'})`);
        assert.notEqual(A.einde.kop, 'A draw', `iemand won: ${A.einde.tekst} (${veldheer ? 'veldheren' : 'spelers'}, ${Math.round(S.wereldTijd)} s)`);
        assert.equal(A.einde.gewonnen, !B.einde.gewonnen, 'de een wint, de ander niet');
      }
    }
  } finally {
    T.ui = ui;
  }
});
