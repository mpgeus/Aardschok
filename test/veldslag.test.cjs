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
// Fight! voor elk leger (de voorbereiding, 3b2): de slag begint in de volgende tik.
const vechten = (S) => S.dorpen.forEach((D, i) => T.geefOpdracht(S, { soort: 'klaar', dorp: i }));

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
    heeft(T.keurScenario({ veldslag: { kaart: 'ford', zaad: 1, legers: [{ soorten: { olifant: 1 } }, {}] } }), 'de soldaat olifant bestaat niet');
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
    // een halve minuut later: iedereen staat er nog, de dag staat stil, en geen dorp met zijn zorgen
    const plekken = mannen.map((e) => `${e.tx},${e.ty}`).join(' ');
    const dag = S.kalender.dag;
    S.kalender.snelheid = 30;
    assert.equal(T.snelheidNu(S), 1, 'geen versneller');
    seconden(S, 30);
    assert.equal(S.kalender.dag, dag, 'de dag staat stil');
    assert.equal(mannen.map((e) => `${e.tx},${e.ty}`).join(' '), plekken, 'iedereen staat op zijn post');
    assert.deepEqual(T.oorzakenNu(A, Math.floor(dag)), [], 'geen statussen van een dorp');
    assert.equal(T.raadNu(A), null, 'geen raad');
    assert.equal(T.doelLinksboven(S, A).tekst, 'Defeat the enemy army.');
    // Fight!: de een is klaar, en de slag wacht op de ander
    assert.ok(T.inVoorbereiding(S), 'twee spelers: eerst de voorbereiding');
    T.geefOpdracht(S, { soort: 'klaar', dorp: 0 });
    seconden(S, 1);
    assert.ok(T.inVoorbereiding(S) && A.strook && B.strook, 'B is nog niet klaar');
    T.geefOpdracht(S, { soort: 'klaar', dorp: 1 });
    seconden(S, 1);
    assert.ok(!T.inVoorbereiding(S) && !A.strook && !B.strook, 'allebei klaar: de slag begint');
    assert.ok(berichten.includes('The battle begins.'));
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
  seconden(S, 50);
  assert.ok(!S.dorp.einde, 'de tijd van de slag loopt nog niet in de voorbereiding');
  vechten(S);
  seconden(S, 50);
  assert.ok(!S.dorp.einde, 'de tijd loopt vanaf Fight!');
  seconden(S, 20, () => !!S.dorp.einde);
  assert.equal(S.dorp.einde.kop, 'A draw');
  assert.equal(S.dorp.einde.gewonnen, false);
  const S2 = slag([{ soorten: { speerman: 3 } }, { soorten: { speerman: 3 } }], 1);
  const [, B] = S2.dorpen;
  T.militieVan(B)[0].dood = true;
  vechten(S2);
  seconden(S2, 70, () => !!S2.dorp.einde);
  assert.equal(S2.dorp.einde.kop, 'Victory');
  assert.ok(/4 of your men are still standing, against 3/.test(S2.dorp.einde.tekst), S2.dorp.einde.tekst);
});

// De voorbereiding (3b2; Marcel, 30 okt: "2. A 3. b"): wie je buiten je strook stuurt, loopt tot de rand; niemand valt
// aan, de veldheer wacht, en is de tijd om, dan begint de slag ook zonder Fight!.
test('de voorbereiding: alleen in je strook, de veldheer wacht, en na de tijd begint de slag', () => {
  const ui = T.ui;
  T.ui = new Proxy({}, { get: (_, naam) => (naam === 'bericht' ? (t) => berichten.push(t) : () => {}) });
  try {
    const L = T.veldslagLevel({ kaart: 'ford', zaad: 1, legers: [{ soorten: { speerman: 4, boogschutter: 2 } }, { soorten: { speerman: 4 }, veldheer: true }] });
    const S = T.proefdorp.begin(T.proefdorp.zaad, L);
    Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen' }, T.schermVelden());
    berichten.length = 0;
    const [A, B] = S.dorpen;
    assert.ok(T.inVoorbereiding(S) && A.strook, 'een speler: de voorbereiding');
    for (const e of T.mannenVan(A)) assert.ok(T.inStrook(A, e.tx, e.ty), 'de linie staat in de strook');
    // naar de strook van de vijand: ze lopen tot de rand van de hunne, en elk blijft erin
    const R = T.eilandVan(S.wereld.eiland).recept;
    const [x, y] = R.naarTegel((R.stroken[1].a[0] + R.stroken[1].a[1]) / 2, 0).map(Math.round);
    assert.ok(!T.inStrook(A, x, y));
    const h = T.handelingSturen(S, { wezen: T.militieVan(B)[0] }, T.mannenVan(A), A);
    assert.equal(h.opdracht.soort, 'stuur', 'een klik op een vijand is erheen, geen aanval');
    T.geefOpdracht(S, { soort: 'stuur', dorp: 0, wie: ids(A), naar: { x, y } });
    seconden(S, 1);
    const posten = T.militieVan(A).map((e) => e.post);
    for (const p of posten) assert.ok(T.inStrook(A, p.x, p.y), `post ${p.x},${p.y} in de strook`);
    const s = A.strook;
    const a = (posten[0].x - s.cx - (posten[0].y - s.cy)) / s.half / 2; // dwars over de kaart (js/eiland.js, receptVan)
    assert.ok(a > s.a[1] - 0.1, `tot de rand aan de kant van de vijand (a ${a.toFixed(3)} bij ${A.strook.a[1]})`);
    // de veldheer wacht in zijn linie
    const bij = T.militieVan(B).map((e) => `${e.tx},${e.ty}`).join(' ');
    seconden(S, 30);
    assert.equal(T.militieVan(B).map((e) => `${e.tx},${e.ty}`).join(' '), bij, 'de veldheer staat stil');
    for (const e of T.mannenVan(A)) assert.ok(T.inStrook(A, e.tx, e.ty), `${e.tx},${e.ty} bleef in de strook`);
    // de tijd is om: de slag begint, de strook is weg, en de veldheer rukt op
    seconden(S, T.VELDSLAG_INSTELLINGEN.voorbereiding - 30);
    assert.ok(!T.inVoorbereiding(S) && !A.strook && !B.strook, 'de tijd is om');
    assert.ok(T.slagSeconden(S) >= 0 && T.slagSeconden(S) < 2);
    seconden(S, 5);
    assert.notEqual(T.militieVan(B).map((e) => `${e.tx},${e.ty}`).join(' '), bij, 'de veldheer rukt op');
    // het doel linksboven is dat van de slag, en zonder doel geen trede van een dorp
    assert.equal(T.doelLinksboven(S, A).tekst, 'Defeat the enemy army.');
    S.scenario.doelen.length = 0;
    assert.equal(T.doelLinksboven(S, A), null, 'een leger heeft geen trede');
    // valt de held, dan neemt niemand het over (3b3), en de veldheer vecht door
    const held = B.aanvoerder;
    held.dood = true;
    T.aanvoerderValt(B);
    seconden(S, 3);
    assert.equal(B.aanvoerder, null, 'niemand neemt het over');
    assert.ok(!berichten.some((t) => /takes command|no one to take command/.test(t)), berichten.join(' | '));
    // twee veldheren (de proefbank): geen voorbereiding
    const S2 = T.proefdorp.begin(T.proefdorp.zaad, T.veldslagLevel({ kaart: 'ford', zaad: 1, legers: [{ soorten: { speerman: 2 }, veldheer: true }, { soorten: { speerman: 2 }, veldheer: true }] }));
    assert.ok(!T.inVoorbereiding(S2) && !S2.dorpen[0].strook);
  } finally {
    T.ui = ui;
  }
});

// Na de slag (3b3; Marcel, 30 okt: "4. A"): Again is dezelfde slag, en Lobby houdt de keuzes.
test('na de slag: Again speelt dezelfde slag, en Lobby houdt de keuzes', () => {
  const ui = T.ui;
  T.ui = new Proxy({}, { get: () => () => undefined });
  try {
    const L = T.veldslagLevel({ kaart: 'ford', zaad: 7, punten: 40, minuten: 5, legers: [{ soorten: { speerman: 6, boogschutter: 3 } }, { veldheer: true }] });
    const S = T.proefdorp.begin(T.proefdorp.zaad, L);
    const leger = (D) => D.bewoners.mensen.filter((p) => p.soldaat).map((p) => p.soldaat.soort).sort().join(' ');
    const nogEens = T.veldslagNogEens(S);
    assert.deepEqual(T.keurScenario(nogEens), []);
    assert.deepEqual(nogEens, L, 'hetzelfde level');
    const S2 = T.proefdorp.begin(T.proefdorp.zaad, nogEens);
    assert.equal(leger(S2.dorpen[1]), leger(S.dorpen[1]), 'de veldheer koopt weer hetzelfde');
    assert.ok(T.inVoorbereiding(S2), 'weer met de voorbereiding');
    assert.deepEqual(T.veldslagKeuzes(S), { kaart: 'ford', zaad: 7, punten: 40, minuten: 5, koop: { speerman: 6, boogschutter: 3 } });
    const S3 = T.proefdorp.begin(T.proefdorp.zaad, T.veldslagLevel({ kaart: 'ford', zaad: 7, legers: [{ soorten: { speerman: 2 } }, { soorten: { speerman: 2 } }] }));
    assert.equal(T.veldslagKeuzes(S3).minuten, 0, 'zonder tijd');
  } finally {
    T.ui = ui;
  }
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
        // twee spelers: allebei Fight!, dan valt A aan en houdt B stand; de opdracht komt op beide computers in dezelfde
        // tik (de lijn)
        if (!veldheer && tik === 1) for (const S of computers) vechten(S);
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

// De lobby (3b): het level heeft de punten van elke kant; een veldheer zonder soorten koopt bij het begin, en de keuring
// kijkt na dat een speler niet meer kocht dan hij had.
test('een veldslag met punten: de veldheer koopt bij het begin, en een speler koopt niet meer dan hij heeft', () => {
  const ui = T.ui;
  T.ui = new Proxy({}, { get: () => () => undefined });
  try {
    const heeft = (lijst, stuk) => assert.ok(lijst.some((z) => z.includes(stuk)), `${stuk} in ${JSON.stringify(lijst)}`);
    const L = T.veldslagLevel({ kaart: 'ford', zaad: 4, punten: 40, legers: [{ soorten: { speerman: 7, boogschutter: 4 } }, { veldheer: true }] });
    assert.deepEqual(T.keurScenario(L), []);
    heeft(T.keurScenario(T.veldslagLevel({ kaart: 'ford', zaad: 4, punten: 40, legers: [{ soorten: { zwaardvechter: 6 } }, { veldheer: true }] })), 'kost 42 punten, meer dan 40');
    heeft(T.keurScenario(T.veldslagLevel({ kaart: 'ford', zaad: 4, legers: [{ soorten: { speerman: 1 } }, { veldheer: true }] })), 'geen veldheer met punten');
    const S = T.proefdorp.begin(T.proefdorp.zaad, L);
    const [A, B] = S.dorpen;
    assert.equal(T.legerVan(A).length, 12, 'elf soldaten en de held');
    assert.ok(B.veldheer.mix, `hij koos een mix: ${B.veldheer.mix}`);
    const kost = B.bewoners.mensen.filter((p) => p.soldaat).reduce((s, p) => s + T.soldaatPrijs(p.soldaat.soort), 0);
    assert.equal(kost, 40, 'voor al zijn punten');
    const S2 = T.proefdorp.begin(T.proefdorp.zaad, L);
    assert.deepEqual(S2.dorpen[1].bewoners.mensen.filter((p) => p.soldaat).map((p) => p.soldaat.soort), B.bewoners.mensen.filter((p) => p.soldaat).map((p) => p.soldaat.soort), 'hetzelfde zaad, hetzelfde leger');
  } finally {
    T.ui = ui;
  }
});

// De generaals (3d; scenario.md, 7; Marcel, 2 nov: "1 ja, 2 ja, 3 alleen skirmish"): de held van een leger is een
// generaal met het wapen van zijn soort, en wie in zijn kring staat, slaat harder en vangt meer af.
test('de generaals: de held van een leger vecht met zijn wapen, en zijn kring maakt zijn mannen sterker', () => {
  const ui = T.ui;
  T.ui = new Proxy({}, { get: () => () => undefined });
  try {
    const G = T.VELDSLAG_INSTELLINGEN.generaal;
    const heeft = (lijst, stuk) => assert.ok(lijst.some((z) => z.includes(stuk)), `${stuk} in ${JSON.stringify(lijst)}`);
    const L = T.veldslagLevel({ kaart: 'ford', zaad: 4, legers: [{ soorten: { speerman: 8, boogschutter: 4 }, generaal: 'agnes' }, { soorten: { speerman: 8 } }] });
    assert.deepEqual(T.keurScenario(L), []);
    heeft(T.keurScenario(T.veldslagLevel({ kaart: 'ford', zaad: 4, legers: [{ soorten: { speerman: 1 }, generaal: 'arthur' }, { soorten: { speerman: 1 } }] })), 'de generaal arthur bestaat niet');
    const S = T.proefdorp.begin(T.proefdorp.zaad, L);
    const [A, B] = S.dorpen;
    const generaals = S.dorpen.map((D) => T.bewonerVan(D, T.generaalVan(D)).generaal);
    // Dame Agnes, met de piek van een piekenier; de ander krijgt er een uit het zaad
    const agnes = T.generaalVan(A);
    assert.equal(agnes, A.aanvoerder);
    const p = T.bewonerVan(A, agnes);
    assert.deepEqual([p.generaal, p.wapen, p.geslacht], ['agnes', 'piekenier', 'vrouw']);
    assert.deepEqual(T.stukkenVan(agnes), ['piek', 'harnas']);
    assert.equal(T.slagVan(agnes).wapen, 'piek');
    assert.equal(T.manTekst(A, agnes), 'Dame Agnes · general');
    assert.ok(T.kringTekst('agnes').includes('of her'), T.kringTekst('agnes'));
    assert.equal(T.bewonerVan(B, T.generaalVan(B)).generaal, T.generaalUitZaad(4, 1), 'zonder keus een uit het zaad');
    assert.equal(T.generaalUitZaad(4, 1), T.generaalUitZaad(4, 1), 'op elke computer dezelfde');
    // bij het begin staat ze achter haar mannen, op geen van hun plekken, en de linie in haar kring
    const mannen = T.militieVan(A);
    assert.ok(mannen.every((e) => e.tx !== agnes.tx || e.ty !== agnes.ty), 'niet op de plek van een man');
    assert.ok(mannen.filter((e) => T.inKring(e)).length >= mannen.length - 1, `${mannen.filter((e) => T.inKring(e)).length} van ${mannen.length} in de kring`);
    // in de kring: harder slaan en een harnas extra (maar niet tegen een bout), zij zelf niet; erbuiten niet
    const man = mannen.find((e) => e.bewoner.soldaat.soort === 'speerman');
    const zet = (e, x, y) => Object.assign(e, { x, y, tx: x, ty: y, pad: [] });
    const kruisboog = { bewoner: { soldaat: { soort: 'kruisboogschutter' } } };
    zet(man, agnes.x + G.kring, agnes.y);
    assert.ok(T.inKring(man) && !T.inKring(agnes));
    assert.equal(T.kracht(man), G.schade);
    assert.equal(T.vangtAf(man), T.SOLDATEN_INSTELLINGEN.bescherming.harnas + G.harnas, 'zijn harnas en een extra');
    assert.equal(T.vangtAf(man, kruisboog), 0, 'een bout gaat erdoorheen');
    zet(man, agnes.x + G.kring + 1, agnes.y);
    assert.ok(!T.inKring(man));
    assert.equal(T.kracht(man), 1);
    assert.equal(T.vangtAf(man), T.SOLDATEN_INSTELLINGEN.bescherming.harnas);
    // de man van de ander staat niet in haar kring, ook niet naast haar
    const vijand = T.militieVan(B)[0];
    zet(vijand, agnes.x + 1, agnes.y);
    assert.ok(T.afstand(vijand, T.generaalVan(B)) > G.kring && !T.inKring(vijand), 'alleen de kring van zijn eigen generaal');
    // valt ze, dan is de kring weg, en vecht de rest door
    zet(man, agnes.x + 1, agnes.y);
    assert.ok(T.inKring(man));
    T.valt(S, B, agnes, vijand);
    assert.equal(T.generaalVan(A), null);
    assert.ok(!T.inKring(man) && T.kracht(man) === 1);
    assert.ok(T.legerVan(A).length > 0, 'de rest staat nog');
    // Again speelt met dezelfde generaals, en Lobby houdt de jouwe
    assert.equal(T.veldslagKeuzes(S).generaal, 'agnes');
    const S2 = T.proefdorp.begin(T.proefdorp.zaad, T.veldslagNogEens(S));
    assert.deepEqual(S2.dorpen.map((D) => T.bewonerVan(D, T.generaalVan(D)).generaal), generaals);
    // in een dorp is de held geen generaal: geen kring
    const dorp = T.proefdorp.begin(T.proefdorp.zaad);
    assert.equal(T.generaalVan(dorp.dorp), null);
    assert.ok(T.militieVan(dorp.dorp).every((e) => !T.inKring(e)));
  } finally {
    T.ui = ui;
  }
});

// De schildpad (Marcel, 2 nov: "misschien kunnen de swordsmen hun schilden gebruiken als turtle tegen een regen van
// pijlen", en "1. Ja gaat open wanneer vijand in de buurt komt. Eerste 2 seconden een stormloop vanuit de schildpad").
test('de schildpad: gedekt tegen pijlen maar niet tegen bouten, traag, slaat niet, en gaat open met een stormloop', () => {
  const ui = T.ui;
  T.ui = new Proxy({}, { get: (_, naam) => (naam === 'bericht' ? (t) => berichten.push(t) : () => {}) });
  try {
    const Z = T.KIEZEN_INSTELLINGEN.schildpad;
    const S = slag([{ soorten: { zwaardvechter: 2, speerman: 2, boogschutter: 2 } }, { soorten: { boogschutter: 2 } }]);
    vechten(S);
    seconden(S, 1);
    const [A, B] = S.dorpen;
    const mannen = T.militieVan(A);
    const zet = (e, x, y) => Object.assign(e, { x, y, tx: x, ty: y, pad: [] });
    const [v1, v2] = T.militieVan(B);
    for (const v of [v1, v2]) zet(v, v.tx + 40, v.ty); // de vijand ver weg
    // zonder schild geen schildpad: wie alleen bogen heeft, blijft een Line
    const bogen = mannen.filter((e) => e.bewoner.soldaat.soort === 'boogschutter');
    T.geefOpdracht(S, { soort: 'formatie', dorp: 0, wie: T.nummersVan(A, bogen), formatie: 'schildpad' });
    seconden(S, 1);
    assert.ok(bogen.every((e) => !e.formatie), 'zonder schild geen schildpad');
    // met de zwaardvechters erbij: één troep, de schilden aan de buitenkant, en iedereen gedekt
    T.geefOpdracht(S, { soort: 'formatie', dorp: 0, wie: T.nummersVan(A, mannen), formatie: 'schildpad' });
    seconden(S, 4);
    assert.ok(mannen.every((e) => e.formatie === 'schildpad'), mannen.map((e) => e.formatie).join(' '));
    assert.equal(new Set(mannen.map((e) => e.troep)).size, 1, 'één troep');
    assert.ok(mannen.every((e) => T.gedektInSchildpad(e)), 'iedereen staat naast een schild');
    // tegen een pijl een schild extra, tegen een bout niets, tegen een klap zoals altijd; en half zo snel
    const speer = mannen.find((e) => e.bewoner.soldaat.soort === 'speerman');
    const bout = { bewoner: { soldaat: { soort: 'kruisboogschutter' } } };
    const harnas = T.SOLDATEN_INSTELLINGEN.bescherming.harnas + (T.inKring(speer) ? T.VELDSLAG_INSTELLINGEN.generaal.harnas : 0); // en de kring van zijn generaal
    assert.equal(T.vangtAf(speer, v1), harnas + Z.pijl);
    assert.equal(T.vangtAf(speer, bout), 0);
    assert.equal(T.vangtAf(speer), harnas);
    assert.equal(T.snelheidVan(speer), T.KIEZEN_INSTELLINGEN.loopt * Z.traag);
    // een vijand op vijf tegels: ze slaan niet, en blijven een schildpad
    const voor = mannen.reduce((a, b) => (a.tx > b.tx ? a : b));
    zet(v1, voor.tx + Z.open + 2, voor.ty);
    seconden(S, 1);
    assert.ok(mannen.every((e) => e.formatie === 'schildpad' && !e.doelwit), 'in de schildpad slaat niemand');
    // dichterbij dan `open`: de schildpad gaat open, en ze stormen op hem af
    zet(v1, voor.tx + Z.open, voor.ty);
    T.wereldTik(S);
    assert.ok(mannen.every((e) => !e.formatie && !e.troep), 'een Line');
    assert.ok(mannen.every((e) => e.storm), 'de stormloop');
    assert.equal(T.formatieTempo(speer), Z.storm);
    assert.ok(mannen.every((e) => e.post && T.afstand(e.post, T.tegelVan(v1)) <= 3), 'samen in een Line op de vijand af (Marcel: "1. B")');
    seconden(S, Z.stormloop + 1);
    assert.ok(mannen.every((e) => !e.storm), 'na de stormloop gewoon');
  } finally {
    T.ui = ui;
  }
});

// De lichte ruiter (Marcel, 2 nov: "een vlotte soldaat te paard naast de knight. een lichtere variant dus", en "2. A").
test('de lichte ruiter: een speer en een paard, 10 punten, sneller dan de ridder en met minder leven', () => {
  const ui = T.ui;
  T.ui = new Proxy({}, { get: () => () => undefined });
  try {
    const IN = T.SOLDATEN_INSTELLINGEN;
    assert.deepEqual(T.SOLDAAT_SOORTEN.ruiter.stukken, ['speer', 'paard']);
    assert.equal(T.soldaatPrijs('ruiter'), 10);
    assert.equal(T.soortNaam('ruiter'), 'horseman');
    assert.equal(T.SOLDAAT_SOORTEN.ruiter.leent, 'ridder', 'tot hij een eigen figuur heeft');
    const S = slag([{ soorten: { ruiter: 1, ridder: 1, zwaardvechter: 1 } }, { soorten: { speerman: 1 } }]);
    const van = (soort) => T.militieVan(S.dorpen[0]).find((e) => e.bewoner.soldaat.soort === soort);
    const [r, k, z] = [van('ruiter'), van('ridder'), van('zwaardvechter')];
    assert.equal(T.snelheidVan(r), T.KIEZEN_INSTELLINGEN.loopt * IN.ruiter.snelheid);
    assert.equal(T.snelheidVan(k), T.KIEZEN_INSTELLINGEN.loopt * IN.ridder.snelheid);
    assert.ok(T.snelheidVan(r) > T.snelheidVan(k), 'vlotter dan de ridder');
    assert.equal(T.levenAlsMan(r).max, IN.leven.ruiter);
    assert.ok(T.levenAlsMan(r).max < T.levenAlsMan(k).max, 'minder leven dan de ridder');
    assert.ok(!T.heeftSchild(k) && T.heeftSchild(z), 'te paard houdt de ridder zijn schild bij zich: geen schildpad');
  } finally {
    T.ui = ui;
  }
});

// Een schutter in een gevecht van dichtbij (Marcel, 2 nov: "Boogschutter kan niet wegkomen uit melee combat; tenzij ze
// sneller zijn; dan kun je 'kiten'; maar er zit wel een attack delay op, nadat ze verplaatsen", en "1. A": een mes).
test('een schutter komt niet weg van wie even snel is en vecht met zijn mes, ontloopt wie trager is, en schiet pas na stilstaan', () => {
  const ui = T.ui;
  T.ui = new Proxy({}, { get: () => () => undefined });
  const snelheidVan = T.snelheidVan;
  // een slag met een militieman van A bij een boogschutter van B, die op zijn post staat (anders loopt hij erheen)
  const naastElkaar = (afstand = 1) => {
    const S = slag([{ soorten: { militie: 1 } }, { soorten: { boogschutter: 1 } }]);
    vechten(S);
    seconden(S, 1);
    const [A, B] = S.dorpen;
    const [m] = T.militieVan(A);
    const [b] = T.militieVan(B);
    Object.assign(m, { x: b.tx - afstand, y: b.ty, tx: b.tx - afstand, ty: b.ty, pad: [], onderweg: false });
    for (const e of [m, b]) Object.assign(e, { leven: T.levenAlsMan(e).max, maxLeven: T.levenAlsMan(e).max });
    return { S, m, b };
  };
  try {
    // even snel: hij blijft staan en steekt met zijn mes
    {
      const { S, m, b } = naastElkaar();
      const plek = `${b.tx},${b.ty}`;
      const leven = T.levenAlsMan(m).max;
      assert.equal(m.leven, leven);
      seconden(S, 3);
      assert.equal(`${b.tx},${b.ty}`, plek, 'hij komt niet weg');
      assert.ok(m.leven > 0 && m.leven < leven, `het mes raakt: ${m.leven} van ${leven}`);
    }
    // is hij sneller dan wie naast hem staat, dan stapt hij opzij (kiten)
    {
      const { S, m, b } = naastElkaar();
      T.snelheidVan = (e) => (e === m ? 1 : snelheidVan(e));
      const plek = `${b.tx},${b.ty}`;
      seconden(S, 1);
      assert.notEqual(`${b.tx},${b.ty}`, plek, 'hij stapt opzij');
      T.snelheidVan = snelheidVan;
    }
    // na het lopen legt hij pas aan als hij naLopen seconden stilstaat
    {
      const { S, b } = naastElkaar(5);
      const t0 = S.wereldTijd;
      Object.assign(b, { bewoog: t0, aanleg: null, slagKlaar: 0 });
      for (let i = 0; i < Math.floor((T.GEVECHT_INSTELLINGEN.naLopen * 0.5) / T.TIK); i++) T.wereldTik(S);
      assert.equal(b.aanleg, null, 'net gelopen: nog niet');
      seconden(S, T.GEVECHT_INSTELLINGEN.naLopen + 1);
      assert.ok(b.aanleg != null || b.slagKlaar > t0 + T.GEVECHT_INSTELLINGEN.naLopen, 'daarna wel');
    }
    assert.deepEqual(T.mesSlag().schade, T.SOLDATEN_INSTELLINGEN.wapens.mes.schade);
  } finally {
    T.snelheidVan = snelheidVan;
    T.ui = ui;
  }
});

// Pijlen die missen, en de formatie Loose (Marcel, 2 nov: "Boogschutters raken niet altijd, pijlen vallen naast
// vijanden. 30%?", "Missers raken de buurman", "Minder: 15 %" voor de kruisboog, en "ze krijgen een spreidingstactiek").
test('een pijl mist soms en valt naast zijn doel: dan raakt hij een vijand die daar staat, nooit een eigen man; Loose staat gespreid', () => {
  const ui = T.ui;
  T.ui = new Proxy({}, { get: () => () => undefined });
  try {
    const W = T.SOLDATEN_INSTELLINGEN.wapens;
    assert.equal(W.boog.mis, 0.3);
    assert.equal(W.kruisboog.mis, 0.25);
    const S = slag([{ soorten: { boogschutter: 1, militie: 1 } }, { soorten: { militie: 2 } }]);
    const [A, B] = S.dorpen;
    const b = T.militieVan(A).find((e) => e.bewoner.soldaat.soort === 'boogschutter');
    const eigen = T.militieVan(A).find((e) => e !== b);
    const [doel, buur] = T.militieVan(B);
    const zet = (e, x, y) => Object.assign(e, { x, y, tx: x, ty: y, pad: [] });
    const p = { x: b.tx + 5, y: b.ty };
    zet(doel, p.x, p.y);
    zet(buur, p.x + 1, p.y);
    zet(eigen, p.x - 1, p.y);
    const altijd = { ...T.slagVan(b), mis: 1 };
    const geraakt = new Map();
    for (let i = 0; i < 200; i++) {
      const { doel: t, raakt } = T.waarRaaktHij(A, b, doel, altijd);
      assert.equal(T.afstand(t, p), 1, 'naast zijn doel');
      geraakt.set(raakt, (geraakt.get(raakt) || 0) + 1);
    }
    assert.ok(!geraakt.has(doel), 'een misser raakt zijn doel niet');
    assert.ok(!geraakt.has(eigen), 'en nooit een eigen man');
    assert.ok(geraakt.get(buur) > 10 && geraakt.get(null) > 100, `de buurman soms, meestal het gras: ${geraakt.get(buur)} en ${geraakt.get(null)}`);
    assert.equal(T.waarRaaktHij(A, b, doel, { ...altijd, mis: 0 }).raakt, doel, 'zonder missen raakt hij');
    // Loose: een Line met een lege tegel tussen elk twee mannen
    const S2 = slag([{ soorten: { speerman: 6 } }, { soorten: { speerman: 1 } }]);
    vechten(S2);
    const [A2] = S2.dorpen;
    const mannen = T.militieVan(A2);
    T.geefOpdracht(S2, { soort: 'formatie', dorp: 0, wie: T.nummersVan(A2, mannen), formatie: 'los' });
    seconden(S2, 6);
    assert.ok(mannen.every((e) => e.formatie === 'los'));
    for (const e of mannen) for (const f of mannen) if (e !== f) assert.ok(T.afstand(e.post, f.post) >= 2, 'een tegel ertussen');
  } finally {
    T.ui = ui;
  }
});
