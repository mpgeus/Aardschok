// De beesten in het bos (js/beesten.js; werklijst vraag 116, stap 1; Marcel, 4 okt: "Ik wil dat er beesten kunnen
// rondlopen in het bos. Wolven etc. Die de houthakker kunnen bedreigen. Rode ogen uit het duister.", en 7 okt: "a ja, b
// ja, c ja"): roedels wolven en groepjes herten, elk met een plek diep in het bos; overdag rusten ze, de wolven lopen 's
// nachts langs de bosrand en de herten grazen er in de schemering; komt er iemand, dan gaan ze weg; een wolf begint geen
// gevecht.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

T.ui = new Proxy({}, { get: () => () => undefined });

// Het eiland waar de beesten spelen: het lege begin van dit nummer heeft bos en herten rond het plein (hij is gekozen
// omdat alle toetsen hieronder erop slagen; op sommige eilanden ligt het hol aan de rand van de kaart, of is er geen hert
// dat een roedel kan halen). Sinds het wild per stuk land komt (vraag 170, stap 6a2, b) woont het anders: tot dan was het
// eiland 7 (en de jager hieronder 1); op 16 okt zijn alle 24 eerste eilanden geprobeerd, en op 14 slaagde alles. Sinds de
// overgang naar het bos om het plein (20 okt, js/maker.js; werklijst Q, vraag 181, d) staat er minder bos bij het dorp, en
// zijn ze opnieuw geprobeerd: op 7 (en 18) slaagt alles, op 14 niet meer (de roedel bij het dorp kreeg minder bos).
const LAND = 7;
// De jager heeft een eiland nodig waar na een jaar jagen een groep onder de twee komt: dat hangt aan hoeveel herten er in
// zijn bereik zijn (50 tegels), en dat verschilt per eiland.
// Sinds 20 okt (de overgang naar het bos) ligt daar geen roedel meer in zijn bereik: de toets met de roedel speelt op LAND.
const JAGERLAND = 2;
// Een paar eilanden voor wat op elk eiland moet gelden. Tot 20 okt was eiland 1 erbij; dat heeft weinig bos, en sinds de
// overgang naar het bos om het plein in zijn eerste stukken geen roedel meer (de wolven gaan naar het bos, Marcel: "D1").
const EILANDEN = [3, 18, LAND];
const grond = require('./grond.cjs');

// Het lege begin op het eiland van `zaad`, zoals een nieuw spel begint, stil en met een vaste worp (test/grond.cjs).
function leegLand(zaad = LAND) {
  const { S } = grond.leegBegin(T, zaad);
  Object.assign(S, { vlaggen: new Set() }, T.schermVelden());
  T.S = S;
  return S;
}

// Een dorp dat de speler bouwde (het proefdorp, test/grond.cjs), met een weide met koeien en schapen: er zijn mensen, een
// werk en vee voor de wolven. Met `opties` meer erbij (zoals `gebouwen: ['jager']`).
function dorp(opties = {}, zaad = LAND) {
  const { S } = grond.proefDorp(T, { zaad, weide: true, ...opties });
  Object.assign(S, { vlaggen: new Set() }, T.schermVelden());
  T.S = S;
  return S;
}

// Het spel zoveel uur laten lopen, zoals de tik het doet als je rondloopt (js/tik.js): het wild in de stukken die open
// gingen, de beesten, en dan het lopen. Een beeld is `stap` seconden van de wereld (een dag is T.DAG_LENGTE seconden).
function uren(S, n, stap = 0.5) {
  const D = S.dorp;
  const beelden = Math.round((n * T.DAG_LENGTE) / 24 / stap);
  for (let k = 0; k < beelden; k++) {
    S.tijd += stap / 10;
    S.wereldTijd += stap;
    S.kalender.dag += stap / T.DAG_LENGTE;
    T.zetWildBij(S, D.wereld);
    T.werkBeestenBij(S, D.wereld);
    T.beweegWezens(S, D.wereld, stap / 10, stap);
  }
}

// Op dit uur van een zomerdag, en de aanvoerder ver weg (in het lege begin staat hij bij de kar, midden op het plein).
function opUur(S, uur, dag = 60) {
  S.kalender.dag = dag + uur / 24;
}

// De groep van deze soort die het dichtst bij het plein woont: het wild is van de wereld, en ligt ook buiten het land van
// het dorp (vraag 170, stap 6a2, b).
const groepVan = (S, soort) => {
  const plein = T.pleinVan(S.dorp);
  const van = T.beestenOp(S.dorp.wereld).filter((g) => g.G.soort === soort);
  return van.sort((a, b) => T.afstand(a.G.thuis, plein) - T.afstand(b.G.thuis, plein))[0];
};
const leiderVan = (g) => g.leden.find((e) => e.leider);

test('elk eiland heeft een roedel wolven en herten, uit het zaad: hetzelfde land geeft dezelfde', () => {
  for (const zaad of EILANDEN) {
    const S = leegLand(zaad);
    const groepen = T.zetWildBij(S, S.dorp.wereld);
    assert.ok(groepen.some((G) => G.soort === 'wolf'), `${zaad}: een roedel`);
    assert.ok(groepen.some((G) => G.soort === 'hert'), `${zaad}: herten`);
    for (const { G, leden } of T.beestenOp(S.dorp.wereld)) {
      const [van, tot] = G.soort === 'wolf' ? T.BEESTEN_INSTELLINGEN.roedel : T.BEESTEN_INSTELLINGEN.kudde;
      assert.ok(leden.length >= van && leden.length <= tot, `${zaad}: ${leden.length} ${G.soort}`);
      assert.equal(leden.filter((e) => e.leider).length, 1, 'één leider');
      assert.ok(T.isBos(S.dorp.wereld, G.thuis.x, G.thuis.y, true), 'het hol ligt in het bos'); // per tegel: ook buiten het vak om het dorp
      assert.ok(G.rand.length >= 1, 'en hij heeft plekken aan de rand');
      for (const p of G.rand) assert.ok(T.zoekRoute(S.dorp.wereld, G.thuis, p, { tot: 0 }).length <= T.BEESTEN_INSTELLINGEN.randLopen);
    }
    const nog = leegLand(zaad);
    T.zetWildBij(nog, nog.dorp.wereld);
    const kort = (S2) => T.beestenOp(S2.dorp.wereld).map(({ G, leden }) => [G.soort, G.thuis, G.rand, leden.map((e) => [e.tx, e.ty, e.vel || e.soort])]);
    assert.deepEqual(kort(nog), kort(S), 'hetzelfde land: dezelfde dieren op dezelfde plek');
  }
});

// Het eerste stuk met bos naast wat bij het begin open is (een stuk is 64 bij 64 tegels), en hoe het daar opengaat: zoals
// als je mensen er komen (w.open, js/wereld.js).
function stukErnaast(S) {
  const w = S.dorp.wereld;
  const open = [...w.open];
  const sx = Math.max(...open.map((n) => n % 64)) + 1;
  for (let sy = Math.min(...open.map((n) => Math.floor(n / 64))); ; sy++) {
    const n = T.stukNummer(sx, sy);
    w.open.add(n);
    let bos = 0;
    const kaart = T.bosInVak(w, { x: sx * T.STUK, y: sy * T.STUK, b: T.STUK, h: T.STUK }, true);
    for (const b of kaart) bos += b;
    w.open.delete(n);
    if (bos >= 2 * T.BEESTEN_INSTELLINGEN.bosPerKudde) return n;
  }
}
const inStuk = (G, n) => Math.floor(G.thuis.x / T.STUK) + 64 * Math.floor(G.thuis.y / T.STUK) === n;
const wildIn = (S, n) => T.beestenOp(S.dorp.wereld).filter(({ G }) => inStuk(G, n)).map(({ G, leden }) => [G.soort, G.thuis, G.rand, leden.length]);

test('het wild komt per stuk land, als het opengaat, uit het nummer van het eiland: hetzelfde stuk, hetzelfde wild (6a2, b)', () => {
  const S = leegLand();
  T.zetWildBij(S, S.dorp.wereld);
  assert.equal(S.dorp.wereld.wildStukken.size, S.dorp.wereld.open.size, 'elk stuk dat open is, kreeg zijn wild');
  const n = stukErnaast(S);
  assert.deepEqual(wildIn(S, n), [], 'een stuk dat niet open is, heeft geen wild');
  S.dorp.wereld.open.add(n);
  T.zetWildBij(S, S.dorp.wereld);
  assert.ok(wildIn(S, n).length, 'gaat het open, dan krijgt het zijn wild');
  assert.ok(wildIn(S, n).length <= T.BEESTEN_INSTELLINGEN.maxRoedels + T.BEESTEN_INSTELLINGEN.maxKuddes, 'niet meer dan per stuk mag');
  // Hetzelfde eiland, een ander spel: hetzelfde wild in hetzelfde stuk, ook als het pas veel later opengaat.
  const nog = leegLand();
  T.zetWildBij(nog, nog.dorp.wereld);
  nog.kalender.dag += 40;
  nog.dorp.wereld.open.add(n);
  T.zetWildBij(nog, nog.dorp.wereld);
  assert.deepEqual(wildIn(nog, n), wildIn(S, n));
});

test('wild ver van iedereen rust: zijn leider zoekt geen weg tot er iemand van een dorp in de buurt komt', () => {
  const S = leegLand();
  const w = S.dorp.wereld;
  T.zetWildBij(S, w);
  const g = groepVan(S, 'hert');
  const ver = T.BEESTEN_INSTELLINGEN.rustVerder;
  // Iedereen van het dorp ver weg: aan de andere kant van het eiland (alleen de afstand telt).
  const mensen = w.wezens.filter((e) => e.dorp);
  const waar = mensen.map((e) => [e.x, e.y, e.tx, e.ty]);
  for (const e of mensen) Object.assign(e, { tx: g.G.thuis.x + 2 * ver, ty: g.G.thuis.y, x: g.G.thuis.x + 2 * ver, y: g.G.thuis.y, pad: [], onderweg: false });
  opUur(S, 12);
  uren(S, 0.2);
  assert.equal(g.G.ver, true, 'niemand in de buurt: hij rust');
  const zon = T.zonVan(S.kalender.dag);
  opUur(S, zon.op);
  uren(S, 0.5);
  assert.ok(g.leden.every((e) => !e.pad.length), 'in de schemering blijft hij liggen');
  mensen.forEach((e, i) => Object.assign(e, { x: waar[i][0], y: waar[i][1], tx: waar[i][2], ty: waar[i][3] }));
  uren(S, 0.1);
  assert.equal(g.G.ver, false, 'er is weer iemand: hij leeft verder');
});

test('de herten: twee hindes en een hert met een gewei dat de groep leidt', () => {
  const S = leegLand();
  T.zetWildBij(S, S.dorp.wereld);
  const g = groepVan(S, 'hert');
  assert.equal(leiderVan(g).vel, 'hert2');
  for (const e of g.leden) if (!e.leider) assert.ok(['hert0', 'hert1'].includes(e.vel));
  for (const e of g.leden) assert.ok(!e.dier, 'geen vee: ze grazen niet op de weide');
  assert.ok(!T.veeVan(S.dorp).some((e) => e.beest));
});

test('overdag rust de roedel bij zijn hol; vanaf zonsondergang loopt hij langs de bosrand, en na zonsopgang terug', () => {
  const S = leegLand();
  // De huifkar blijft waar hij aankwam, bij de aanvoerder, ver weg: in het kamp staat hij op dit eiland tien tegels van het
  // hol, en de roedel schuwt hem zoals een mens (B2b, 13 okt; ontwerp/opmerkingen.md).
  S.dorp.wereld.wezens.find((m) => m.kar).pad = [];
  opUur(S, 12);
  uren(S, 1);
  const g = groepVan(S, 'wolf');
  const thuis = g.G.thuis;
  assert.ok(g.leden.every((e) => T.afstand(T.tegelVan(e), thuis) <= 4), 'overdag bij het hol');
  assert.ok(g.leden.every((e) => e.rust === 'liggen'), 'en ze liggen (zonder vel om te liggen staan ze)');
  // De avond en de nacht: de leider komt bij een plek aan de rand.
  const zon = T.zonVan(S.kalender.dag);
  opUur(S, zon.onder);
  let aanDeRand = false;
  for (let u = 0; u < 8 && !aanDeRand; u++) {
    uren(S, 0.5);
    aanDeRand = g.G.rand.some((p) => T.afstand(T.tegelVan(leiderVan(g)), p) <= 1);
  }
  assert.ok(aanDeRand, 'de leider staat aan de rand');
  // En de anderen lopen achter hem aan.
  uren(S, 0.5);
  assert.ok(g.leden.every((e) => T.afstand(T.tegelVan(e), T.tegelVan(leiderVan(g))) <= 6), 'de roedel blijft bij elkaar');
  // De ochtend: terug naar het hol.
  opUur(S, zon.op + 2, 61);
  uren(S, 3);
  assert.ok(g.leden.every((e) => T.afstand(T.tegelVan(e), thuis) <= 4), 'na zonsopgang weer bij het hol');
});

test('de herten grazen in de schemering aan de bosrand, en liggen de rest van de tijd op hun legerplek', () => {
  const S = leegLand();
  opUur(S, 13);
  uren(S, 1);
  const g = groepVan(S, 'hert');
  assert.ok(g.leden.every((e) => e.rust === 'liggen' && T.afstand(T.tegelVan(e), g.G.thuis) <= 4), 'midden op de dag liggen ze');
  const zon = T.zonVan(S.kalender.dag);
  opUur(S, zon.onder - 1);
  uren(S, 1);
  const l = leiderVan(g);
  assert.ok(g.G.rand.some((p) => T.afstand(T.tegelVan(l), p) <= 1), 'bij zonsondergang aan de rand');
  assert.ok(!T.isBos(S.dorp.wereld, l.tx, l.ty), 'op open grond');
  assert.ok(g.leden.every((e) => e.rust === 'grazen' || e.rust === 'staan'), 'ze grazen, of kijken om zich heen');
});

test('komt er iemand dichtbij, dan gaan ze weg: de herten rennen', () => {
  const S = leegLand();
  const zon = T.zonVan(60);
  opUur(S, zon.onder - 0.5);
  uren(S, 1.5);
  const g = groepVan(S, 'hert');
  const l = leiderVan(g);
  const lt = T.tegelVan(l);
  // De aanvoerder op een vrije tegel, zes tegels van de leider: binnen hoe schuw een hert is (zeven). Aan
  // de kant waar de herten van hem weg kunnen: hun thuis of een plek aan de bosrand ligt dan ver van hem (B2b: op het land
  // van eiland 7 ligt hun thuis vlak bij waar ze grazen).
  let plek = null;
  const vluchtVan = (p) => Math.max(...[g.G.thuis, ...g.G.rand].map((q) => T.afstand(q, p)));
  for (let dy = -6; dy <= 6; dy++) {
    for (let dx = -6; dx <= 6; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== 6 || !T.isBegaanbaar(S.wereld, lt.x + dx, lt.y + dy, { wezensBlokkeren: true })) continue;
      if (g.leden.some((e) => T.afstand(T.tegelVan(e), { x: lt.x + dx, y: lt.y + dy }) < 6)) continue;
      const p = { x: lt.x + dx, y: lt.y + dy };
      if (!plek || vluchtVan(p) > vluchtVan(plek)) plek = p;
    }
  }
  assert.ok(plek, 'een plek voor de aanvoerder');
  Object.assign(S.dorp.aanvoerder, { x: plek.x, y: plek.y, tx: plek.x, ty: plek.y, pad: [], onderweg: false });
  g.G.keek = 0;
  uren(S, 0.05);
  assert.ok(g.G.weg > S.kalender.dag, 'ze gaan weg');
  assert.ok(g.leden.some((e) => e.rent), 'en ze rennen');
  assert.equal(l.snelheid, T.BEESTEN.hert.vlucht);
  const voor = T.afstand(T.tegelVan(l), plek);
  uren(S, 0.5);
  assert.ok(T.afstand(T.tegelVan(l), plek) > voor, 'verder van de aanvoerder');
});

test('een wolf begint geen gevecht, en wie je mannen op hem afstuurt, valt hem aan', () => {
  const S = leegLand();
  T.zetWildBij(S, S.dorp.wereld);
  const wolf = leiderVan(groepVan(S, 'wolf'));
  const hert = leiderVan(groepVan(S, 'hert'));
  // De aanvoerder naast de wolf: een rover die hem ziet, valt hem aan, een wolf niet; en een wolf die niets doet, is geen vijand
  // die de held vanzelf aanvalt (js/gevecht.js).
  Object.assign(S.dorp.aanvoerder, { x: wolf.tx + 1, y: wolf.ty, tx: wolf.tx + 1, ty: wolf.ty, binnen: false });
  assert.equal(T.isVijandig(wolf), false);
  T.werkGevechtBij(S, S.dorp);
  assert.equal(wolf.doelwit, undefined);
  assert.equal(S.dorp.aanvoerder.doelwit, undefined);
  // Links zegt wat het is; rechts, met de held gekozen, valt hem aan (js/kiezen.js; vraag 170, stap 1).
  assert.equal(T.handelingVerkennen(S, { wezen: wolf }).tekst, 'A wolf');
  assert.match(T.handelingSturen(S, { wezen: wolf }, [S.dorp.aanvoerder]).tekst, /Attack the wolf/);
  assert.equal(T.handelingVerkennen(S, { wezen: hert }).tekst, 'A deer');
});

test('bewaren en laden houdt de groepen: hun dieren delen hun groep, en lopen verder', () => {
  const S = leegLand();
  opUur(S, 19);
  uren(S, 0.5);
  const terug = T.leesSpel(T.bewaarSpel(S)).staat;
  const groepen = T.beestenOp(terug.dorp.wereld);
  assert.equal(groepen.length, T.beestenOp(S.dorp.wereld).length);
  for (const { G, leden } of groepen) {
    assert.ok(leden.every((e) => e.groep === G), 'één groep, gedeeld');
    assert.equal(leden.filter((e) => e.leider).length, 1);
  }
  assert.ok(terug.dorp.wereld.wildStukken.size, 'ze komen er na het laden niet nog eens bij');
});

test('de spelregel "Beesten" uit: het bos is leeg', () => {
  const S = leegLand();
  T.zetWildBij(S, S.dorp.wereld);
  assert.ok(S.dorp.wereld.wezens.some((e) => e.beest));
  T.zetOptie('beesten', 'uit');
  try {
    uren(S, 0.1);
    assert.ok(!S.dorp.wereld.wezens.some((e) => e.beest));
    uren(S, 0.1);
    assert.ok(!S.dorp.wereld.wezens.some((e) => e.beest), 'en er komen er geen');
  } finally {
    T.optiesTerug();
  }
  uren(S, 0.1);
  assert.ok(S.dorp.wereld.wezens.some((e) => e.beest), 'weer aan: ze zijn er weer');
});

test('de ogen van de wolf: twee van voren, een van opzij, geen van achteren, in elk beeld van zijn vellen', () => {
  const O = T.OGEN.wolf;
  const f = T.BEELDEN.figuren.wolf;
  for (const [houding, h] of Object.entries(f.houdingen)) {
    assert.equal(O[houding].length, 8, `${houding}: acht richtingen`);
    for (const rij of O[houding]) assert.equal(rij.length, h.beelden, `${houding}: elk beeld`);
  }
  const Z = f.richtingen.indexOf('Z');
  const N = f.richtingen.indexOf('N');
  const W = f.richtingen.indexOf('W');
  assert.equal(O.staan[Z][0].length, 2, 'van voren twee');
  assert.equal(O.staan[N][0].length, 0, 'van achteren geen');
  assert.equal(O.staan[W][0].length, 1, 'van opzij een');
  // Ze zitten in zijn kop: boven zijn voeten, niet verder dan de cel.
  for (const [dx, dy] of O.staan[Z][0]) assert.ok(dy < -5 && Math.abs(dx) < f.houdingen.staan.cel[0]);
});

test('het hert: drie vellen met vijf houdingen, en lopen en rennen zo snel als het spel het laat gaan', () => {
  for (const vel of [...T.BEESTEN.hert.vellen, T.BEESTEN.hert.leider]) {
    const f = T.BEELDEN.figuren[vel];
    assert.ok(f, `${vel} staat in beelden/`);
    assert.deepEqual(Object.keys(f.houdingen).sort(), ['grazen', 'liggen', 'lopen', 'rennen', 'staan']);
    // Anders glijden de voeten (gereedschap/pixelart/wild.cjs, SNELHEID), zoals bij het vee.
    assert.equal(f.houdingen.lopen.snelheid, T.BEESTEN.hert.snelheid);
    assert.equal(f.houdingen.rennen.snelheid, T.BEESTEN.hert.vlucht);
  }
});

// ── Stap 2a, het leven in het bos (Marcel, 7 okt: "d ja, e ja, f ja" en "g ja, h ja, i ja") ──

// De eerste dag van een maand, vanaf vandaag (een nacht van T.tikBeestenDag).
function eersteVan(S, maand) {
  const nu = Math.floor(S.kalender.dag);
  for (let dag = nu; dag <= nu + T.DAGEN_PER_JAAR; dag++) {
    const d = T.datumVanDag(dag);
    if (d.dagVanMaand === 1 && T.MAANDEN[d.maand].naam === maand) return dag;
  }
  return null;
}

// Een stuk kaal maken: elke boom om, en elke stronk en struik eruit (zoals een erf dat gerooid wordt).
function kaal(D, x0, y0, r) {
  const w = D.wereld;
  for (let y = y0 - r; y <= y0 + r; y++) {
    for (let x = x0 - r; x <= x0 + r; x++) {
      T.velBoom(D, x, y);
      T.rooi(D, x, y);
    }
  }
}

const hertenIn = (D) => T.beestenOp(D.wereld).filter((g) => g.G.soort === 'hert').reduce((n, g) => n + g.leden.length, 0);

test('eerst de herten, en een roedel woont alleen waar hij herten kan halen', () => {
  for (const zaad of [1, 3, LAND, 11]) {
    const S = leegLand(zaad);
    const groepen = T.zetWildBij(S, S.dorp.wereld);
    const herten = groepen.filter((G) => G.soort === 'hert');
    for (const G of groepen.filter((x) => x.soort === 'wolf')) {
      assert.ok(herten.some((H) => T.afstand(H.thuis, G.thuis) <= T.BEESTEN_INSTELLINGEN.honger.jaagStraal && T.kanErKomen(S.dorp.wereld, G.thuis, H.thuis)), `${zaad}: herten bij het hol`);
    }
  }
});

test('in de winter krijgt een roedel honger, en met honger vangt hij een hert uit de dichtste groep; buiten de winter niet', () => {
  const S = leegLand();
  const D = S.dorp;
  T.zetWildBij(S, D.wereld);
  const { G, leden } = groepVan(S, 'wolf');
  const zomer = eersteVan(S, 'hooimaand');
  for (let dag = zomer; dag < zomer + 30; dag++) T.tikBeestenDag(S, D.wereld, dag);
  assert.equal(G.honger, 0, 'in de zomer vindt hij genoeg');
  const voor = hertenIn(D);
  const winter = eersteVan(S, 'wintermaand');
  let dag = winter;
  while (!G.gevangen && dag < winter + 90) T.tikBeestenDag(S, D.wereld, dag++);
  assert.equal(G.gevangen, 1, 'in de winter vangt hij een hert');
  // (een andere roedel kan in die tijd ook een hert vangen)
  const gevangen = T.beestenOp(D.wereld).filter((g) => g.G.soort === 'wolf').reduce((n, g) => n + (g.G.gevangen || 0), 0);
  assert.equal(hertenIn(D), voor - gevangen);
  assert.ok(((dag - winter) * leden.length) / 4 >= T.BEESTEN_INSTELLINGEN.honger.jagenVanaf, 'pas als hij honger heeft');
  assert.equal(G.honger, 0, 'en dan is zijn honger weg');
});

test('in de lente krijgen ze jongen, tot zes; dan splitst de groep, en de helft zoekt een eigen thuis of trekt weg', () => {
  const S = leegLand();
  const D = S.dorp;
  T.zetWildBij(S, D.wereld);
  const G = groepVan(S, 'hert').G;
  const ledenVan = (x) => T.beestenOp(D.wereld).find((g) => g.G === x).leden;
  const voor = ledenVan(G).length;
  const lente = eersteVan(S, 'bloeimaand');
  T.tikBeestenDag(S, D.wereld, lente - 1);
  assert.equal(ledenVan(G).length, voor, 'niet voor hun maand');
  T.tikBeestenDag(S, D.wereld, lente);
  const na = ledenVan(G).length;
  const [van, tot] = T.BEESTEN_INSTELLINGEN.jongen.hert.aantal;
  assert.ok(na >= Math.min(voor + van, T.BEESTEN_INSTELLINGEN.groot) && na <= voor + tot, `twee of drie jongen (${voor} → ${na})`);
  for (const e of ledenVan(G).slice(voor)) assert.ok(T.afstand(T.tegelVan(e), G.thuis) <= 3, 'bij hun legerplek');
  T.tikBeestenDag(S, D.wereld, lente + T.DAGEN_PER_MAAND);
  assert.equal(ledenVan(G).length, na, 'één keer per jaar');
  // Tot de groep zo groot is dat hij splitst.
  // (Andere groepen kunnen in dezelfde lente ook splitsen; het gaat om de helft die uit G kwam.)
  const oud = new Set(T.beestenOp(D.wereld).map((g) => g.G));
  const uitG = () => T.beestenOp(D.wereld).filter((g) => !oud.has(g.G) && g.leden.some((e) => e.uitG));
  for (let k = 0; k < 6 && !uitG().length; k++) {
    for (const e of ledenVan(G)) e.uitG = true;
    T.tikBeestenDag(S, D.wereld, lente, { jongen: true });
  }
  const nieuwe = uitG();
  assert.equal(nieuwe.length, 1, 'gesplitst');
  assert.ok(ledenVan(G).length < T.BEESTEN_INSTELLINGEN.groot);
  const nieuw = nieuwe[0];
  assert.equal(nieuw.G.soort, 'hert');
  assert.ok(nieuw.leden.length >= 2);
  assert.equal(nieuw.leden.filter((e) => e.leider).length, 1);
  assert.equal(nieuw.leden.find((e) => e.leider).vel, 'hert2', 'wie het groepje leidt, krijgt een gewei');
  if (nieuw.G.trektWeg) {
    T.werkBeestenBij(S, D.wereld);
    assert.ok(!D.wereld.wezens.some((e) => e.groep === nieuw.G), 'geen plaats: die helft trekt weg');
  } else {
    for (const { G: ander } of T.beestenOp(D.wereld)) if (ander !== nieuw.G) assert.ok(T.afstand(ander.thuis, nieuw.G.thuis) >= T.BEESTEN_INSTELLINGEN.uitElkaar, 'een eigen thuis');
  }
});

test('een roedel die de winter honger leed, krijgt in de lente geen jongen', () => {
  const S = leegLand();
  const D = S.dorp;
  T.zetWildBij(S, D.wereld);
  const { G, leden } = groepVan(S, 'wolf');
  const voor = leden.length;
  const lente = eersteVan(S, 'grasmaand');
  G.leedOp = lente - 40;
  T.tikBeestenDag(S, D.wereld, lente);
  assert.equal(groepVan(S, 'wolf').leden.length, voor, 'honger geleden: geen jongen');
  T.tikBeestenDag(S, D.wereld, lente + T.DAGEN_PER_JAAR);
  assert.ok(groepVan(S, 'wolf').leden.length > voor, 'een jaar later wel');
});

test('wordt het bos om het hol te dun, dan zoekt de roedel dieper een nieuw; zonder bos trekt hij weg, en het dorp zegt het', () => {
  const S = leegLand();
  const D = S.dorp;
  T.zetWildBij(S, D.wereld);
  const G = groepVan(S, 'wolf').G;
  const oud = { ...G.thuis };
  const gezegd = [];
  const zeg = T.zeg;
  T.zeg = (D2, tekst) => gezegd.push(tekst);
  try {
    const dag = eersteVan(S, 'hooimaand');
    T.tikBeestenDag(S, D.wereld, dag);
    assert.deepEqual(G.thuis, oud, 'zolang het bos er is, blijft het hol');
    kaal(D, oud.x, oud.y, 4);
    T.tikBeestenDag(S, D.wereld, dag + 1);
    assert.notDeepEqual(G.thuis, oud, 'een nieuw hol');
    assert.ok(T.isBos(D.wereld, G.thuis.x, G.thuis.y, true), 'in het bos');
    assert.ok(!G.trektWeg && !gezegd.length);
    kaal(D, G.thuis.x, G.thuis.y, 64); // het bos van zijn stuk (64 bij 64 tegels) is weg
    T.tikBeestenDag(S, D.wereld, dag + 2);
    assert.ok(G.trektWeg);
    assert.ok(gezegd.some((t) => /wolves have moved away/.test(t)), gezegd.join(' | '));
    T.werkBeestenBij(S, D.wereld);
    assert.ok(!D.wereld.wezens.some((e) => e.groep === G), 'de roedel is weg');
  } finally {
    T.zeg = zeg;
  }
});

// ── Stap 2b, de dreiging (Marcel, 7 okt: "a ja", "h ja, i ja") ──

// Een wezen op de dichtste vrije tegel bij een plek.
function zetBij(w, e, p) {
  for (let r = 0; r < 12; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const x = p.x + dx;
        const y = p.y + dy;
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r || !T.isBegaanbaar(w, x, y, { wezensBlokkeren: true })) continue;
        Object.assign(e, { x, y, tx: x, ty: y, pad: [], onderweg: false });
        return { x, y };
      }
    }
  }
  return null;
}

// Een wezen op een open tegel zo'n `afstand` tegels van `van` (een wezen, of een plek), waar de roedel naartoe kan lopen:
// in het bos dat rond een dorp van de speler ligt, is "tien tegels oostwaarts" niet altijd te bereiken. Geeft de tegel.
function zetOpAfstand(w, e, van, afstand) {
  const bron = van.tx != null ? T.tegelVan(van) : van;
  for (let r = afstand; r <= afstand + 12; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const x = bron.x + dx;
        const y = bron.y + dy;
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r || !T.isBegaanbaar(w, x, y, { wezensBlokkeren: true }) || !T.kanErKomen(w, bron, { x, y })) continue;
        Object.assign(e, { x, y, tx: x, ty: y, pad: [], onderweg: false });
        return { x, y };
      }
    }
  }
  return null;
}

// Wat het dorp zegt (T.zeg), zolang de toets loopt.
function luister(f) {
  const gezegd = [];
  const zeg = T.zeg;
  T.zeg = (D, tekst) => gezegd.push(tekst);
  try {
    f(gezegd);
  } finally {
    T.zeg = zeg;
  }
}

// Een roedel met honger, op een avond in grasmaand om tien uur; de aanvoerder en het dorp binnen, en zonder schapen tenzij
// de toets ze vraagt (een toets zet weg wat hij nodig heeft).
function stouteRoedel(schapen = false) {
  const S = dorp();
  const D = S.dorp;
  T.zetWildBij(S, D.wereld);
  const { G, leden } = groepVan(S, 'wolf');
  G.honger = T.BEESTEN_INSTELLINGEN.dreiging.stout;
  opUur(S, 22);
  for (const p of D.bewoners.mensen) if (p.wezen) p.wezen.binnen = true;
  S.dorp.aanvoerder.binnen = true;
  if (!schapen) T.verliesVee(D, 'schaap', T.veeVan(D).filter((e) => e.dier === 'schaap').length);
  return { S, D, G, leden, leider: leiderVan({ leden }) };
}

const schapenIn = (D) => T.veeVan(D).filter((e) => e.dier === 'schaap').length;

test('een roedel met honger komt in het donker en neemt een schaap; het bericht brengt je erheen, en de status speelt', () => {
  const { S, D, G, leider } = stouteRoedel(true);
  const schaap = T.veeVan(D).find((e) => e.dier === 'schaap');
  assert.ok(zetOpAfstand(D.wereld, schaap, leider, 10), 'een plek voor het schaap');
  assert.ok(T.wolvenStout(S, G), 'honger en donker: stout');
  const voor = schapenIn(D);
  const zeg = T.zeg;
  let plek = null;
  T.zeg = (D2, tekst, soort, p) => {
    if (/sheep from the common/.test(tekst)) plek = p;
  };
  try {
    uren(S, 3);
  } finally {
    T.zeg = zeg;
  }
  assert.ok(plek && Number.isFinite(plek.x), 'het spel zegt het, met de plek');
  assert.equal(schapenIn(D), voor - 1, 'een schaap minder');
  assert.equal(G.honger, 0, 'en zijn honger is weg');
  const status = T.oorzakenNu(D, S.kalender.dag).find((o) => o.id === 'wolven');
  assert.ok(status && /wolves near the village/.test(status.zin), 'de status Wolven');
  assert.equal(T.wolvenBijHetDorp(D, S.kalender.dag + T.BEESTEN_INSTELLINGEN.dreiging.statusDagen + 1), null, 'en die gaat over');
});

test('zonder schapen zoekt hij wie alleen in het donker loopt: gewond, in bed, zonder werk, en daarna beter', () => {
  T.zetOptie('beesten', 'zonderDoden');
  try {
    const { S, D, leider } = stouteRoedel();
    const p = D.bewoners.mensen.find((q) => q.wezen && !q.aanvoerder && q.leeftijd === 'volwassen');
    const e = p.wezen;
    e.binnen = false;
    assert.ok(zetOpAfstand(D.wereld, e, leider, 10), 'een plek voor hem');
    const bevolking = D.bevolking;
    luister((gezegd) => {
      uren(S, 3);
      assert.ok(gezegd.some((t) => t.includes(T.naamVanBewoner(p)) && /bitten by the wolves/.test(t)), gezegd.join(' | '));
    });
    assert.ok(p.gewond && T.blijftThuis(p, S.kalender.dag), 'gewond, in bed');
    assert.equal(D.bevolking, bevolking, 'zonder doden');
    assert.equal(D.beesten.gezien.wat, 'aanval');
    const anker = T.dagAnker(D, e);
    assert.ok(anker && anker.binnen, 'hij blijft binnen');
    const werk = { soort: 'houthakker' };
    p.werk = werk;
    assert.equal(T.werkUrenVan(D, werk, Math.floor(S.kalender.dag) + 1).gewerkt, 0, 'en werkt niet');
    T.geneesVanDeWolven(D, p.thuisTot);
    assert.ok(!p.gewond && !T.blijftThuis(p, S.kalender.dag + 30), 'na zijn dagen in bed is hij beter');
    p.werk = null;
  } finally {
    T.zetOptie('beesten', 'aan');
  }
});

test('met de spelregel aan is wie de wolven aanvallen een enkele keer dood', () => {
  const I = T.BEESTEN_INSTELLINGEN.dreiging;
  const kans = I.doodKans;
  I.doodKans = 1;
  try {
    const { S, D, leider } = stouteRoedel();
    const p = D.bewoners.mensen.find((q) => q.wezen && !q.aanvoerder && q.leeftijd === 'volwassen');
    p.wezen.binnen = false;
    assert.ok(zetOpAfstand(D.wereld, p.wezen, leider, 10), 'een plek voor hem');
    const bevolking = D.bevolking;
    luister((gezegd) => {
      uren(S, 3);
      assert.ok(gezegd.some((t) => /Wolves attacked in the dark/.test(t)), gezegd.join(' | '));
    });
    assert.equal(D.bevolking, bevolking - 1);
    assert.ok(!D.bewoners.mensen.includes(p));
  } finally {
    I.doodKans = kans;
  }
});

test('de aanvoerder draagt in het donker een lantaarn (vraag 171): de roedel valt hem niet aan', () => {
  const { S, D, leden, leider } = stouteRoedel();
  const h = S.dorp.aanvoerder;
  h.binnen = false;
  assert.ok(zetOpAfstand(D.wereld, h, leider, 12), 'een plek voor de aanvoerder');
  assert.ok(T.draagtLicht(D, h), 'buiten in het donker brandt zijn lantaarn');
  assert.ok(T.lichtBronnen(D).some((b) => b.soort === 'drager' && b.x === h.x && b.y === h.y), 'en zijn licht gaat met hem mee');
  uren(S, 1);
  assert.ok(!leider.groep.vecht, 'de roedel vecht niet');
  assert.ok(!leden.some((e) => e.doelwit === h), 'en valt hem niet aan');
});

test('wie aan het bos werkt en een roedel met honger ziet, rent naar huis: hij werkt die dag niet meer, en zijn werkplaats maakte de helft', () => {
  const S = dorp();
  const D = S.dorp;
  T.zetWildBij(S, D.wereld);
  const { G, leden } = groepVan(S, 'wolf');
  const I = T.BEESTEN_INSTELLINGEN;
  const kans = I.dreiging.schrikKans;
  I.dreiging.schrikKans = 1; // per uur een kans: hier altijd
  const leider = leiderVan({ leden });
  opUur(S, 17);
  const plein = T.pleinVan(D);
  zetBij(D.wereld, leider, { x: plein.x + 3, y: plein.y });
  for (const e of leden) if (e !== leider) zetBij(D.wereld, e, { x: plein.x + 6, y: plein.y });
  for (const q of D.bewoners.mensen) if (q.wezen) q.wezen.binnen = true;
  S.dorp.aanvoerder.binnen = true;
  // de ossenkar ook: die staat op het plein, en de roedel kijkt naar wie het dichtst bij een wolf is
  for (const m of D.wereld.wezens) if (!m.dier && !m.beest) m.binnen = true;
  const p = D.bewoners.mensen.find((q) => q.wezen && !q.aanvoerder && q.leeftijd === 'volwassen');
  const e = p.wezen;
  e.binnen = false;
  zetBij(D.wereld, e, { x: plein.x - 2, y: plein.y });
  e.werkt = { soort: 'hakken', x: e.tx, y: e.ty, op: null, tot: null };
  const werk = { soort: 'houthakker', werkte: 1 };
  p.werk = werk;
  T.zetVoorraad(D, 'hout', 10);
  try {
    T.werkBeestenBij(S, D.wereld);
    assert.ok(!T.blijftThuis(p, S.kalender.dag), 'een roedel zonder honger blijft uit het zicht');
    G.honger = I.honger.jagenVanaf;
    G.keek = 0;
    luister((gezegd) => {
      T.werkBeestenBij(S, D.wereld);
      assert.ok(gezegd.some((t) => t.includes(T.naamVanBewoner(p)) && /ran home/.test(t)), gezegd.join(' | '));
    });
  } finally {
    I.dreiging.schrikKans = kans;
  }
  assert.ok(T.blijftThuis(p, S.kalender.dag), 'hij werkt vandaag niet meer');
  assert.ok(!T.blijftThuis(p, Math.floor(S.kalender.dag) + 1), 'morgen weer wel');
  assert.equal(D.voorraad.hout, 10 - T.maaktUit(D, T.GEBOUWEN.houthakker).hout * T.BEESTEN_INSTELLINGEN.dreiging.schrik);
  assert.equal(T.wolvenBijHetDorp(D, S.kalender.dag), '', 'de status: ze zijn gezien');
  p.werk = null;
});

test('een wolf die in een gevecht viel, ligt er de volgende ochtend niet meer', () => {
  const S = leegLand();
  const D = S.dorp;
  T.zetWildBij(S, D.wereld);
  const wolf = groepVan(S, 'wolf').leden[0];
  wolf.dood = true;
  T.tikBeestenDag(S, D.wereld, Math.floor(S.kalender.dag) + 1);
  assert.ok(!D.wereld.wezens.includes(wolf));
});

// ---------------------------------------------------------------------------------------------
// Stap 3a, de jager (Marcel, 7 okt: "Altijd een paar herten over houden. Anders krijgen we geen jonge hertjes meer")
// ---------------------------------------------------------------------------------------------

// Een jager bij het dorp, klaar, in het proefdorp met zijn beesten (test/grond.cjs: de hut staat er af, en op dag 2 gaat er
// iemand werken); jij bouwt, zonder voorvallen. `f` krijgt { S, D, g }.
function metJager(f, zaad = JAGERLAND) {
  const S = dorp({ gebouwen: ['jager'] }, zaad);
  const D = S.dorp;
  T.zetOptie('voorvallen', 'uit');
  try {
    T.zetWildBij(S, D.wereld);
    T.zetVoorraad(D, 'graan', 2000);
    T.zetVoorraad(D, 'hout', 100);
    const g = D.gebouwen.find((x) => x.soort === 'jager');
    assert.ok(g && g.klaar, 'de hut staat');
    f({ S, D, g });
  } finally {
    T.optiesTerug();
  }
}

// Een nacht, zoals het spel hem tikt (js/gebouwen.js).
function nachtVan(S, dag) {
  S.kalender.dag = dag + 0.3;
  S.kalender.stil = [];
  T.tikGebouwenDag(S.dorp, dag);
}

// Hoeveel vlees de jager het dorp gaf: wat T.tikGebouwenDag hem liet maken (T.jagerJaagde krijgt het mee).
function telVlees(f) {
  let n = 0;
  const echt = T.jagerJaagde;
  T.jagerJaagde = (D, g, vlees, ...r) => {
    n += vlees;
    echt(D, g, vlees, ...r);
  };
  try {
    f();
  } finally {
    T.jagerJaagde = echt;
  }
  return n;
}

const binnenBereik = (D, g) => T.beestenOp(D.wereld).filter(({ G }) => T.afstand(T.deurVan(D.wereld, g), G.thuis) <= T.BEESTEN_INSTELLINGEN.jager.straal);

test('de jager schiet klein wild en herten in zijn bereik, laat er altijd twee per groep staan, en dan alleen klein wild', () => metJager(({ S, D, g }) => {
  const J = T.BEESTEN_INSTELLINGEN.jager;
  // Zonder wolven: wat er van de herten verdwijnt, nam de jager.
  D.wereld.wezens = D.wereld.wezens.filter((e) => !(e.groep && e.groep.soort === 'wolf'));
  // Elk groepje drie herten: na een hert per groepje is er geen meer dat hij mag nemen. Vanaf hooimaand, na de jongen
  // van dit jaar (bloeimaand): in een jaar groeit het bos aan met meer herten dan één jager schiet.
  for (const { G, leden } of T.beestenOp(D.wereld)) if (G.soort === 'hert') leden.slice(J.laatStaan + 1).forEach((e) => (D.wereld.wezens = D.wereld.wezens.filter((x) => x !== e)));
  const herten = binnenBereik(D, g).filter(({ G, leden }) => G.soort === 'hert' && leden.length > J.laatStaan);
  assert.ok(herten.length, 'er zijn herten in zijn bereik');
  const voor = new Map(herten.map(({ G, leden }) => [G, leden.length]));
  const al = { vlees: g.gejaagd || 0, herten: (g.gevangen && g.gevangen.hert) || 0 }; // wat hij al deed terwijl de hut klaarkwam
  let dag = eersteVan(S, 'hooimaand');
  const totDag = dag + 300;
  let zonder = null;
  let uitHerten = 0;
  const vlees = telVlees(() => {
    for (; dag < totDag && !zonder; dag++) {
      const had = !g.zonderHerten;
      const v = telVlees(() => nachtVan(S, dag));
      if (had && v > 0) uitHerten += v * (1 - J.kleinWild);
      for (const { G, leden } of binnenBereik(D, g)) {
        if (G.soort === 'hert' && voor.has(G)) assert.ok(leden.length >= Math.min(J.laatStaan, voor.get(G)), 'nooit onder de twee');
      }
      if (g.zonderHerten) zonder = dag;
    }
  });
  assert.ok(g.gevangen && g.gevangen.hert > 0, 'hij schoot herten');
  assert.ok(zonder, 'tot er geen hert meer was dat hij mocht nemen');
  // Elke perDier vlees uit de herten is een hert: wat hij schoot, en wat hij nog op de lat heeft.
  const geschoten = g.gevangen.hert - al.herten;
  assert.ok(Math.abs(al.vlees + uitHerten - (geschoten * J.perDier + g.gejaagd)) < 1e-6, `${uitHerten} vlees uit ${geschoten} herten`);
  assert.ok(g.gejaagd < J.perDier);
  // Dan schiet hij alleen klein wild: hij werkt door, voor de helft van zijn vlees, en het dorp vraagt geen tweede jager.
  const nu = telVlees(() => nachtVan(S, dag++));
  assert.ok(g.handen > 0, 'hij werkt door');
  assert.ok(Math.abs(nu - T.GEBOUWEN.jager.maakt.uit.vlees * J.kleinWild * g.werkte) < 1e-6, `klein wild: ${nu}`);
  assert.equal(T.jagersZonderHerten(D), 1);
  assert.ok(vlees > 0);
}));

test('een roedel die groter is dan drie, verliest elke vijf dagen een wolf aan de jager; zonder herten schiet hij verder alleen klein wild', () => metJager(({ S, D, g }) => {
  const J = T.BEESTEN_INSTELLINGEN.jager;
  // Een roedel van zes in zijn bereik, en geen herten die hij mag nemen.
  const roedel = () => binnenBereik(D, g).find(({ G }) => G.soort === 'wolf');
  assert.ok(roedel(), 'een roedel in zijn bereik');
  let dag = T.GEBOUWEN.jager.bouwtijd + 2;
  // Jongen tot zes (zonder te splitsen: dat doet een groep pas bij `groot`).
  const groot = T.BEESTEN_INSTELLINGEN.groot;
  T.BEESTEN_INSTELLINGEN.groot = 99;
  try {
    while (roedel().leden.length < 6) T.tikBeestenDag(S, D.wereld, dag, { jongen: true });
  } finally {
    T.BEESTEN_INSTELLINGEN.groot = groot;
  }
  while (roedel().leden.length > 6) {
    const weg = roedel().leden.filter((x) => !x.leider).pop();
    D.wereld.wezens = D.wereld.wezens.filter((e) => e !== weg);
  }
  for (const { G, leden } of T.beestenOp(D.wereld)) if (G.soort === 'hert') leden.slice(J.laatStaan).forEach((e) => (D.wereld.wezens = D.wereld.wezens.filter((x) => x !== e)));
  const dagen = [];
  let vlees;
  let werkte = 0;
  luister((gezegd) => {
    vlees = telVlees(() => {
      for (let n = 0; n < 30; n++, dag++) {
        const voor = roedel().leden.length;
        nachtVan(S, dag);
        werkte += g.werkte;
        if (roedel().leden.length < voor) dagen.push(dag);
      }
    });
    assert.ok(gezegd.some((z) => /The hunter shot a wolf/.test(z)), 'het dorp zegt het');
  });
  assert.equal(roedel().leden.length, J.hooguit, 'de roedel is weer klein');
  assert.equal(dagen.length, 6 - J.hooguit);
  for (let i = 1; i < dagen.length; i++) assert.ok(dagen[i] - dagen[i - 1] >= J.wolfDagen, 'een per vijf dagen');
  assert.ok(roedel().leden.some((e) => e.leider), 'de leider blijft');
  assert.equal(g.gevangen.wolf, 6 - J.hooguit);
  assert.ok(Math.abs(vlees - werkte * T.GEBOUWEN.jager.maakt.uit.vlees * J.kleinWild) < 1e-6, `alleen klein wild, geen vlees van de wolven (${vlees})`);
}, LAND)); // op LAND ligt een roedel in zijn bereik (JAGERLAND heeft de herten)

test('zonder beesten (een dorp waar ze nog niet gezet zijn, of de spelregel uit) maakt de jager zijn vlees zoals altijd', () => {
  for (const regel of ['aan', 'uit']) {
    const S = leegLand();
    T.zetOptie('beesten', regel);
    try {
      if (regel === 'aan') S.dorp.wereld.wildStukken = new Set(); // een kaart waar nog geen wild gezet is
      const g = { soort: 'jager', klaar: true, x: 40, y: 40 };
      assert.equal(T.jagersZonderHerten(S.dorp), 0);
      const uit = { vlees: 1, huiden: 1 };
      assert.equal(T.watDeJagerSchiet(S.dorp, g, uit), uit, 'het vlees blijft');
      T.jagerJaagde(S.dorp, g, 1, 10);
      assert.equal(g.gevangen, undefined);
    } finally {
      T.optiesTerug();
    }
  }
});

test('overdag loert de jager in het bos op zijn groep, net buiten waar ze schuw worden, en gaat dan terug naar zijn hut', () => metJager(({ S, D, g }) => {
  const J = T.BEESTEN_INSTELLINGEN.jager;
  const p = D.bewoners.mensen.find((m) => m.werk === g);
  assert.ok(p && p.wezen, 'iemand werkt er');
  const e = p.wezen;
  nachtVan(S, T.GEBOUWEN.jager.bouwtijd + 2);
  assert.ok(g.wild, 'hij heeft wild');
  // Op een zomerdag om acht uur, van zijn hut, tot zes uur 's avonds: zijn werk en het lopen, zoals js/main.js het doet.
  const dag = eersteVan(S, 'hooimaand');
  S.kalender.dag = dag + 8 / 24;
  const deur = T.deurVan(D.wereld, g);
  zetBij(D.wereld, e, deur);
  const stap = 0.5;
  let loerde = null;
  let thuis = false;
  for (let k = 0; k < (10 * T.DAG_LENGTE) / 24 / stap && !thuis; k++) {
    S.wereldTijd += stap;
    S.kalender.dag += stap / T.DAG_LENGTE;
    T.werkBeestenBij(S, D.wereld);
    T.werkVeldwerkBij(S, D);
    T.beweegWezens(S, D.wereld, stap / 10, stap);
    if (e.werkt && e.werkt.soort === 'loeren' && e.werkt.tot != null && !loerde) {
      const groep = T.beestenOp(D.wereld).find(({ G }) => G.thuis.x === g.wild.x && G.thuis.y === g.wild.y);
      loerde = T.afstand({ x: e.tx, y: e.ty }, T.tegelVan(groep.leden.find((x) => x.leider)));
    }
    if (loerde != null && e.werkt && e.werkt.soort === 'naarHuis' && !e.pad.length) thuis = true;
    if (loerde != null && !e.werkt && T.afstand(deur, { x: e.tx, y: e.ty }) <= 1) thuis = true;
  }
  assert.ok(loerde != null, 'hij loerde');
  assert.ok(loerde >= T.BEESTEN_INSTELLINGEN.schuw.hert && loerde <= J.loerAfstand + 5, `op ${loerde} tegels`);
  assert.ok(thuis, 'en ging terug naar zijn hut');
}));

// ---------------------------------------------------------------------------------------------
// Stap 3c, om hulp roepen (Marcel, 7 okt: "even noteren dat mensen ook om hulp roepen", en "C. Ja goed idee")
// ---------------------------------------------------------------------------------------------

// Een roedel met honger valt iemand aan die alleen in het donker loopt; geeft { S, D, G, p, e, gezegd } zodra hij om
// hulp roept.
function aanval() {
  const { S, D, G, leider } = stouteRoedel();
  const p = D.bewoners.mensen.find((q) => q.wezen && !q.aanvoerder && q.leeftijd === 'volwassen');
  const e = p.wezen;
  e.binnen = false;
  assert.ok(zetOpAfstand(D.wereld, e, leider, 10), 'een plek voor hem');
  const gezegd = [];
  luister((z) => {
    for (let k = 0; k < 400 && !G.aanval; k++) uren(S, 0.05);
    gezegd.push(...z);
  });
  assert.ok(G.aanval, 'de roedel valt aan');
  return { S, D, G, p, e, gezegd };
}

test('wie de wolven aanvallen, roept om hulp: het dorp zegt het, hij blijft staan, en zonder hulp bijt de roedel na een kwartier', () => {
  const { S, D, G, p, e, gezegd } = aanval();
  assert.ok(gezegd.some((t) => t.includes(T.naamVanBewoner(p)) && /calls for help/.test(t)), gezegd.join(' | '));
  assert.ok(e.roeptOmHulp && e.moetNaar, 'hij staat en roept');
  assert.ok(!p.gewond, 'nog niet gebeten');
  luister((z) => {
    uren(S, T.BEESTEN_INSTELLINGEN.hulp.uren + 0.05);
    assert.ok(z.some((t) => /bitten by the wolves|Wolves attacked/.test(t)), z.join(' | '));
  });
  assert.equal(G.aanval, null);
  assert.ok(!e.roeptOmHulp && !e.moetNaar);
});

test('komt er een buur, dan vluchten de wolven; komt de aanvoerder, dan vecht de roedel met hem', () => {
  {
    const { S, D, G, p, e } = aanval();
    const buur = D.bewoners.mensen.find((q) => q !== p && q.wezen && !q.aanvoerder && q.leeftijd === 'volwassen').wezen;
    buur.binnen = false;
    zetBij(D.wereld, buur, T.tegelVan(e));
    luister((z) => {
      uren(S, 0.05);
      assert.ok(z.some((t) => /came to help .*, and the wolves have fled/.test(t)), z.join(' | '));
    });
    assert.equal(G.aanval, null);
    assert.ok(G.weg > S.kalender.dag, 'ze vluchten');
    assert.ok(!p.gewond);
  }
  {
    const { S, D, G, e } = aanval();
    S.dorp.aanvoerder.binnen = false;
    zetBij(D.wereld, S.dorp.aanvoerder, { x: e.tx + T.BEESTEN_INSTELLINGEN.hulp.man, y: e.ty });
    uren(S, 0.05);
    assert.equal(G.vecht, true, 'de roedel vecht (js/gevecht.js)');
    assert.equal(G.aanval, null);
  }
});

// ---------------------------------------------------------------------------------------------
// Stap 3b, het hol op de kaart (Marcel, 7 okt: "een kuil onder een omgevallen boom, met botten ervoor")
// ---------------------------------------------------------------------------------------------

test('elke roedel heeft een hol op de kaart naast zijn thuis, vast, en zijn plekken blijven te bereiken', () => {
  for (const zaad of EILANDEN) {
    const S = leegLand(zaad);
    const D = S.dorp;
    const w = D.wereld;
    T.zetWildBij(S, D.wereld);
    const roedels = T.beestenOp(D.wereld).filter(({ G }) => G.soort === 'wolf');
    assert.ok(roedels.length, `${zaad}: roedels`);
    for (const { G } of roedels) {
      const hol = T.holVan(D.wereld, G);
      assert.ok(hol, `${zaad}: een hol`);
      assert.ok(w.voorwerpen.includes(hol), 'op de kaart');
      assert.ok(T.afstand(hol, G.thuis) <= 3 && T.afstand(hol, G.thuis) > 0, `${zaad}: naast het thuis, niet erop`);
      assert.ok(T.isVast(w, hol.x, hol.y), 'je loopt er niet overheen');
      assert.ok(!T.isVast(w, G.thuis.x, G.thuis.y), 'het thuis zelf blijft vrij');
      assert.ok(T.kanErKomen(w, G.thuis, G.rand[0]) && G.rand.every((p) => T.kanErKomen(w, G.thuis, p)), 'de rand is te bereiken');
      assert.ok(T.zoekRoute(w, G.rand[0], G.thuis, { tot: 0 }), 'en er is een weg naar het thuis');
    }
    assert.equal(w.voorwerpen.filter((v) => v.soort === 'hol').length, roedels.length, 'een hol per roedel, en niet voor de herten');
  }
});

test('verhuist een roedel, dan gaat zijn hol mee; trekt hij weg, dan verdwijnt het', () => {
  // Op sommige eilanden is er na het kappen geen bos meer dicht genoeg, en trekt de roedel meteen weg: LAND heeft bos om te
  // verhuizen.
  const S = leegLand();
  const D = S.dorp;
  T.zetWildBij(S, D.wereld);
  const G = groepVan(S, 'wolf').G;
  const oud = { ...G.thuis };
  const dag = eersteVan(S, 'hooimaand');
  kaal(D, oud.x, oud.y, 4);
  const zeg = T.zeg;
  T.zeg = () => {};
  try {
    T.tikBeestenDag(S, D.wereld, dag);
    assert.notDeepEqual(G.thuis, oud, 'een nieuw thuis');
    const hol = T.holVan(D.wereld, G);
    assert.ok(hol && T.afstand(hol, G.thuis) <= 3, 'het hol staat nu bij het nieuwe thuis');
    assert.equal(D.wereld.voorwerpen.filter((v) => v.groep === G).length, 1, 'het oude is weg');
    kaal(D, T.kaartVak(D.wereld).x + 50, T.kaartVak(D.wereld).y + 50, 60);
    T.tikBeestenDag(S, D.wereld, dag + 1);
    assert.ok(G.trektWeg);
    assert.ok(!T.holVan(D.wereld, G), 'de roedel trekt weg, het hol ook');
  } finally {
    T.zeg = zeg;
  }
});

test('een nieuwe roedel (de helft die splitst) krijgt een eigen hol, en een roedel die verslagen is laat het niet achter', () => {
  const IN = T.BEESTEN_INSTELLINGEN;
  const { plaatsPerRoedel, uitElkaar } = IN;
  Object.assign(IN, { plaatsPerRoedel: 50, uitElkaar: 6 }); // plaats genoeg in het bos, zodat de helft een eigen thuis vindt
  try {
    const S = leegLand();
    const D = S.dorp;
    T.zetWildBij(S, D.wereld);
    const w = D.wereld;
    const G = groepVan(S, 'wolf').G;
    const lente = eersteVan(S, 'bloeimaand');
    const oud = new Set(T.beestenOp(D.wereld).map((g) => g.G));
    for (let k = 0; k < 8 && T.beestenOp(D.wereld).every((g) => oud.has(g.G) || g.G.soort !== 'wolf'); k++) T.tikBeestenDag(S, D.wereld, lente, { jongen: true });
    const nieuwe = T.beestenOp(D.wereld).filter((g) => !oud.has(g.G) && g.G.soort === 'wolf' && !g.G.trektWeg);
    assert.ok(nieuwe.length, 'de roedel splitste');
    for (const { G: nieuw } of nieuwe) {
      const hol = T.holVan(D.wereld, nieuw);
      assert.ok(hol && T.afstand(hol, nieuw.thuis) <= 3, 'een eigen hol bij zijn eigen thuis');
      assert.notEqual(hol, T.holVan(D.wereld, G));
    }
    // Verslagen: geen dier meer van de groep.
    w.wezens = w.wezens.filter((e) => e.groep !== G);
    T.tikBeestenDag(S, D.wereld, lente + 1);
    assert.ok(!T.holVan(D.wereld, G), 'zonder roedel geen hol');
  } finally {
    Object.assign(IN, { plaatsPerRoedel, uitElkaar });
  }
});

test('het hol blijft na opslaan en laden bij zijn roedel', () => {
  const S = leegLand();
  T.zetWildBij(S, S.dorp.wereld);
  const terug = T.leesSpel(T.bewaarSpel(S)).staat;
  const D = terug.dorp;
  const hol = D.wereld.voorwerpen.find((v) => v.soort === 'hol');
  assert.ok(hol, 'het hol is er nog');
  assert.ok(D.wereld.wezens.some((e) => e.groep === hol.groep), 'en nog van dezelfde roedel als zijn wolven');
});

test('met de spelregel "Beesten" uit is het hol weg', () => {
  const S = leegLand();
  const D = S.dorp;
  T.zetWildBij(S, D.wereld);
  assert.ok(D.wereld.voorwerpen.some((v) => v.soort === 'hol'));
  T.zetOptie('beesten', 'uit');
  try {
    uren(S, 0.1);
    assert.ok(!D.wereld.voorwerpen.some((v) => v.soort === 'hol'), 'geen hol zonder wolven');
  } finally {
    T.optiesTerug();
  }
  uren(S, 0.1);
  assert.ok(D.wereld.voorwerpen.some((v) => v.soort === 'hol'), 'weer aan: het hol is er weer');
});
