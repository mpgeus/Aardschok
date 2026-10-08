// De beesten in het bos (js/beesten.js; werklijst vraag 116, stap 1; Marcel, 4 okt: "Ik wil dat er beesten kunnen
// rondlopen in het bos. Wolven etc. Die de houthakker kunnen bedreigen. Rode ogen uit het duister.", en 7 okt: "a ja, b
// ja, c ja"): roedels wolven en groepjes herten, elk met een plek diep in het bos; overdag rusten ze, de wolven lopen 's
// nachts langs de bosrand en de herten grazen er in de schemering; komt er iemand, dan gaan ze weg; een wolf begint geen
// gevecht.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

T.ui = new Proxy({}, { get: () => () => undefined });

// Een land van de maker, zoals een nieuw spel begint, stil en met een vaste worp.
function landVanDeMaker(zaad) {
  const echt = console.warn;
  const toeval = Math.random;
  let n = 11;
  console.warn = () => {};
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  const S = { kalender: T.nieuweKalender() };
  const opEiland = T.MAKER_INSTELLINGEN.opEiland;
  T.MAKER_INSTELLINGEN.opEiland = false; // een land van de maker zonder het eiland: deze toetsen gaan over zijn landen (sinds 8 okt maakt een nieuw spel het eiland, vraag 117)
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht', zaad));
  } finally {
    T.MAKER_INSTELLINGEN.opEiland = opEiland;
    console.warn = echt;
    Math.random = toeval;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  T.S = S;
  return S;
}

// Het spel zoveel uur laten lopen, zoals js/main.js het doet als je rondloopt: de beesten, en dan het lopen. Een beeld is
// `stap` seconden van de wereld (een dag is T.DAG_LENGTE seconden).
function uren(S, n, stap = 0.5) {
  const D = S.dorp;
  const beelden = Math.round((n * T.DAG_LENGTE) / 24 / stap);
  for (let k = 0; k < beelden; k++) {
    S.tijd += stap / 10;
    S.wereldTijd += stap;
    S.kalender.dag += stap / T.DAG_LENGTE;
    T.werkBeestenBij(S, D);
    T.beweegWezens(S, D.wereld, stap / 10, stap);
  }
}

// Op dit uur van een zomerdag, en de schout ver weg (de schout van het gehucht staat bij zijn huis, midden in het dorp).
function opUur(S, uur, dag = 60) {
  S.kalender.dag = dag + uur / 24;
}

const groepVan = (S, soort) => T.beestenVan(S.dorp).find((g) => g.G.soort === soort);
const leiderVan = (g) => g.leden.find((e) => e.leider);

test('elk land van de maker heeft een roedel wolven en herten, uit het zaad: hetzelfde land geeft dezelfde', () => {
  for (const zaad of [62707, 73425, 72022]) {
    const S = landVanDeMaker(zaad);
    const groepen = T.zetBeesten(S.dorp);
    assert.ok(groepen.some((G) => G.soort === 'wolf'), `${zaad}: een roedel`);
    assert.ok(groepen.some((G) => G.soort === 'hert'), `${zaad}: herten`);
    for (const { G, leden } of T.beestenVan(S.dorp)) {
      const [van, tot] = G.soort === 'wolf' ? T.BEESTEN_INSTELLINGEN.roedel : T.BEESTEN_INSTELLINGEN.kudde;
      assert.ok(leden.length >= van && leden.length <= tot, `${zaad}: ${leden.length} ${G.soort}`);
      assert.equal(leden.filter((e) => e.leider).length, 1, 'één leider');
      assert.ok(T.isBos(S.dorp.wereld, G.thuis.x, G.thuis.y), 'het hol ligt in het bos');
      assert.ok(G.rand.length >= 1, 'en hij heeft plekken aan de rand');
      for (const p of G.rand) assert.ok(T.zoekRoute(S.dorp.wereld, G.thuis, p, { tot: 0 }).length <= T.BEESTEN_INSTELLINGEN.randLopen);
    }
    const nog = landVanDeMaker(zaad);
    T.zetBeesten(nog.dorp);
    const kort = (S2) => T.beestenVan(S2.dorp).map(({ G, leden }) => [G.soort, G.thuis, G.rand, leden.map((e) => [e.tx, e.ty, e.vel || e.soort])]);
    assert.deepEqual(kort(nog), kort(S), 'hetzelfde land: dezelfde dieren op dezelfde plek');
  }
});

test('de herten: twee hindes en een hert met een gewei dat de groep leidt', () => {
  const S = landVanDeMaker(62707);
  T.zetBeesten(S.dorp);
  const g = groepVan(S, 'hert');
  assert.equal(leiderVan(g).vel, 'hert2');
  for (const e of g.leden) if (!e.leider) assert.ok(['hert0', 'hert1'].includes(e.vel));
  for (const e of g.leden) assert.ok(!e.dier, 'geen vee: de inner telt ze niet, en ze grazen niet op de weide');
  assert.ok(!T.veeVan(S.dorp).some((e) => e.beest));
});

test('overdag rust de roedel bij zijn hol; vanaf zonsondergang loopt hij langs de bosrand, en na zonsopgang terug', () => {
  const S = landVanDeMaker(62707);
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
  const S = landVanDeMaker(62707);
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

test('komt er iemand dichtbij, dan gaan ze weg: de herten rennen; wie sluipt, komt dichterbij', () => {
  const S = landVanDeMaker(62707);
  const zon = T.zonVan(60);
  opUur(S, zon.onder - 0.5);
  uren(S, 1.5);
  const g = groepVan(S, 'hert');
  const l = leiderVan(g);
  const lt = T.tegelVan(l);
  // De schout op een vrije tegel, zes tegels van de leider: binnen hoe schuw een hert is (zeven), maar sluipend niet.
  let plek = null;
  for (let dy = -6; dy <= 6 && !plek; dy++) {
    for (let dx = -6; dx <= 6 && !plek; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== 6 || !T.isBegaanbaar(S.wereld, lt.x + dx, lt.y + dy, { wezensBlokkeren: true })) continue;
      if (g.leden.some((e) => T.afstand(T.tegelVan(e), { x: lt.x + dx, y: lt.y + dy }) < 6)) continue;
      plek = { x: lt.x + dx, y: lt.y + dy };
    }
  }
  assert.ok(plek, 'een plek voor de schout');
  Object.assign(S.schout, { x: plek.x, y: plek.y, tx: plek.x, ty: plek.y, pad: [], onderweg: false });
  S.sluipen = true;
  g.G.keek = 0;
  uren(S, 0.05);
  assert.ok(!(g.G.weg > S.kalender.dag), 'wie sluipt, zien ze niet zo snel');
  S.sluipen = false;
  g.G.keek = 0;
  uren(S, 0.05);
  assert.ok(g.G.weg > S.kalender.dag, 'nu wel: ze gaan weg');
  assert.ok(g.leden.some((e) => e.rent), 'en ze rennen');
  assert.equal(l.snelheid, T.BEESTEN.hert.vlucht);
  const voor = T.afstand(T.tegelVan(l), plek);
  uren(S, 0.5);
  assert.ok(T.afstand(T.tegelVan(l), plek) > voor, 'verder van de schout');
});

test('een wolf begint geen gevecht, en wie hem aanklikt, kan hem aanvallen; een hert is geen getuige', () => {
  const S = landVanDeMaker(62707);
  T.zetBeesten(S.dorp);
  const wolf = leiderVan(groepVan(S, 'wolf'));
  const hert = leiderVan(groepVan(S, 'hert'));
  // De schout naast de wolf: een monster dat hem ziet, begint een gevecht, een wolf niet.
  Object.assign(S.schout, { x: wolf.tx + 1, y: wolf.ty, tx: wolf.tx + 1, ty: wolf.ty });
  assert.equal(T.zoekOntdekking(S), null);
  assert.match(T.handelingVerkennen(S, { wezen: wolf }).tekst, /De wolf aanvallen/);
  assert.equal(T.handelingVerkennen(S, { wezen: hert }).tekst, 'Een hert');
  // Een hert vlak bij de schout ziet hem iets verstoppen, maar vertelt het niemand.
  Object.assign(S.schout, { x: hert.tx + 1, y: hert.ty, tx: hert.tx + 1, ty: hert.ty });
  assert.ok(!T.getuigenVan(S.dorp, null).includes(hert));
});

test('bewaren en laden houdt de groepen: hun dieren delen hun groep, en lopen verder', () => {
  const S = landVanDeMaker(73425);
  opUur(S, 19);
  uren(S, 0.5);
  const terug = T.leesSpel(T.bewaarSpel(S)).staat;
  const groepen = T.beestenVan(terug.dorp);
  assert.equal(groepen.length, T.beestenVan(S.dorp).length);
  for (const { G, leden } of groepen) {
    assert.ok(leden.every((e) => e.groep === G), 'één groep, gedeeld');
    assert.equal(leden.filter((e) => e.leider).length, 1);
  }
  assert.ok(terug.dorp.beesten.gezet, 'ze komen er na het laden niet nog eens bij');
});

test('de spelregel "Beesten" uit: het bos is leeg', () => {
  const S = landVanDeMaker(62707);
  T.zetBeesten(S.dorp);
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
  for (let y = Math.max(0, y0 - r); y <= Math.min(w.tegels.length - 1, y0 + r); y++) {
    for (let x = Math.max(0, x0 - r); x <= Math.min(w.tegels[0].length - 1, x0 + r); x++) {
      T.velBoom(D, x, y);
      T.rooi(D, x, y);
    }
  }
}

const hertenIn = (D) => T.beestenVan(D).filter((g) => g.G.soort === 'hert').reduce((n, g) => n + g.leden.length, 0);

test('eerst de herten, en een roedel woont alleen waar hij herten kan halen', () => {
  for (const zaad of [62707, 73425, 72022, 11]) {
    const S = landVanDeMaker(zaad);
    const groepen = T.zetBeesten(S.dorp);
    const herten = groepen.filter((G) => G.soort === 'hert');
    for (const G of groepen.filter((x) => x.soort === 'wolf')) {
      assert.ok(herten.some((H) => T.afstand(H.thuis, G.thuis) <= T.BEESTEN_INSTELLINGEN.honger.jaagStraal && T.kanErKomen(S.dorp.wereld, G.thuis, H.thuis)), `${zaad}: herten bij het hol`);
    }
  }
});

test('in de winter krijgt een roedel honger, en met honger vangt hij een hert uit de dichtste groep; buiten de winter niet', () => {
  const S = landVanDeMaker(62707);
  const D = S.dorp;
  T.zetBeesten(D);
  const { G, leden } = groepVan(S, 'wolf');
  const zomer = eersteVan(S, 'hooimaand');
  for (let dag = zomer; dag < zomer + 30; dag++) T.tikBeestenDag(D, dag);
  assert.equal(G.honger, 0, 'in de zomer vindt hij genoeg');
  const voor = hertenIn(D);
  const winter = eersteVan(S, 'wintermaand');
  let dag = winter;
  while (!G.gevangen && dag < winter + 90) T.tikBeestenDag(D, dag++);
  assert.equal(G.gevangen, 1, 'in de winter vangt hij een hert');
  assert.equal(hertenIn(D), voor - 1);
  assert.ok(((dag - winter) * leden.length) / 4 >= T.BEESTEN_INSTELLINGEN.honger.jagenVanaf, 'pas als hij honger heeft');
  assert.equal(G.honger, 0, 'en dan is zijn honger weg');
});

test('in de lente krijgen ze jongen, tot zes; dan splitst de groep, en de helft zoekt een eigen thuis of trekt weg', () => {
  const S = landVanDeMaker(72022);
  const D = S.dorp;
  T.zetBeesten(D);
  const G = groepVan(S, 'hert').G;
  const ledenVan = (x) => T.beestenVan(D).find((g) => g.G === x).leden;
  const voor = ledenVan(G).length;
  const lente = eersteVan(S, 'bloeimaand');
  T.tikBeestenDag(D, lente - 1);
  assert.equal(ledenVan(G).length, voor, 'niet voor hun maand');
  T.tikBeestenDag(D, lente);
  const na = ledenVan(G).length;
  const [van, tot] = T.BEESTEN_INSTELLINGEN.jongen.hert.aantal;
  assert.ok(na >= Math.min(voor + van, T.BEESTEN_INSTELLINGEN.groot) && na <= voor + tot, `twee of drie jongen (${voor} → ${na})`);
  for (const e of ledenVan(G).slice(voor)) assert.ok(T.afstand(T.tegelVan(e), G.thuis) <= 3, 'bij hun legerplek');
  T.tikBeestenDag(D, lente + T.DAGEN_PER_MAAND);
  assert.equal(ledenVan(G).length, na, 'één keer per jaar');
  // Tot de groep zo groot is dat hij splitst.
  // (Andere groepen kunnen in dezelfde lente ook splitsen; het gaat om de helft die uit G kwam.)
  const oud = new Set(T.beestenVan(D).map((g) => g.G));
  const uitG = () => T.beestenVan(D).filter((g) => !oud.has(g.G) && g.leden.some((e) => e.uitG));
  for (let k = 0; k < 6 && !uitG().length; k++) {
    for (const e of ledenVan(G)) e.uitG = true;
    T.tikBeestenDag(D, lente, { jongen: true });
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
    T.werkBeestenBij(S, D);
    assert.ok(!D.wereld.wezens.some((e) => e.groep === nieuw.G), 'geen plaats: die helft trekt weg');
  } else {
    for (const { G: ander } of T.beestenVan(D)) if (ander !== nieuw.G) assert.ok(T.afstand(ander.thuis, nieuw.G.thuis) >= T.BEESTEN_INSTELLINGEN.uitElkaar, 'een eigen thuis');
  }
});

test('een roedel die de winter honger leed, krijgt in de lente geen jongen', () => {
  const S = landVanDeMaker(62707);
  const D = S.dorp;
  T.zetBeesten(D);
  const { G, leden } = groepVan(S, 'wolf');
  const voor = leden.length;
  const lente = eersteVan(S, 'grasmaand');
  G.leedOp = lente - 40;
  T.tikBeestenDag(D, lente);
  assert.equal(groepVan(S, 'wolf').leden.length, voor, 'honger geleden: geen jongen');
  T.tikBeestenDag(D, lente + T.DAGEN_PER_JAAR);
  assert.ok(groepVan(S, 'wolf').leden.length > voor, 'een jaar later wel');
});

test('wordt het bos om het hol te dun, dan zoekt de roedel dieper een nieuw; zonder bos trekt hij weg, en het dorp zegt het', () => {
  const S = landVanDeMaker(73425); // op 62707 ligt het hol sinds de grote gebouwen (vraag 114, stap 3) aan de rand van de kaart, zonder ander bos dichtbij
  const D = S.dorp;
  T.zetBeesten(D);
  const G = groepVan(S, 'wolf').G;
  const oud = { ...G.thuis };
  const gezegd = [];
  const zeg = T.zeg;
  T.zeg = (D2, tekst) => gezegd.push(tekst);
  try {
    const dag = eersteVan(S, 'hooimaand');
    T.tikBeestenDag(D, dag);
    assert.deepEqual(G.thuis, oud, 'zolang het bos er is, blijft het hol');
    kaal(D, oud.x, oud.y, 4);
    T.tikBeestenDag(D, dag + 1);
    assert.notDeepEqual(G.thuis, oud, 'een nieuw hol');
    assert.ok(T.isBos(D.wereld, G.thuis.x, G.thuis.y, true), 'in het bos');
    assert.ok(!G.trektWeg && !gezegd.length);
    kaal(D, 50, 50, 60);
    T.tikBeestenDag(D, dag + 2);
    assert.ok(G.trektWeg);
    assert.ok(gezegd.some((t) => /wolven zijn weggetrokken/.test(t)), gezegd.join(' | '));
    T.werkBeestenBij(S, D);
    assert.ok(!D.wereld.wezens.some((e) => e.beest), 'het bos is leeg');
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

// Een roedel met honger, op een avond in grasmaand om tien uur; de schout en het dorp binnen, en een hek om de schapen
// (een toets zet weg wat hij nodig heeft).
function stouteRoedel() {
  const S = landVanDeMaker(62707);
  const D = S.dorp;
  T.zetBeesten(D);
  const { G, leden } = groepVan(S, 'wolf');
  G.honger = T.BEESTEN_INSTELLINGEN.dreiging.stout;
  opUur(S, 22);
  for (const p of D.bewoners.mensen) if (p.wezen) p.wezen.binnen = true;
  S.schout.binnen = true;
  T.hekOmDeSchapen(D);
  return { S, D, G, leden, leider: leiderVan({ leden }) };
}

const schapenIn = (D) => T.veeVan(D).filter((e) => e.dier === 'schaap').length;

test('een roedel met honger komt in het donker en neemt een schaap; de herder zegt het de ochtend erna, en de status speelt', () => {
  const { S, D, G, leider } = stouteRoedel();
  D.beesten.hek = false;
  const schaap = T.veeVan(D).find((e) => e.dier === 'schaap');
  zetBij(D.wereld, schaap, { x: leider.tx + 10, y: leider.ty });
  assert.ok(T.wolvenStout(D, G), 'honger en donker: stout');
  const voor = schapenIn(D);
  const toen = S.kalender.dag;
  luister((gezegd) => {
    uren(S, 3);
    assert.ok(gezegd.some((t) => /schaap van de meent/.test(t)), gezegd.join(' | '));
  });
  assert.equal(schapenIn(D), voor - 1, 'een schaap minder');
  assert.equal(G.honger, 0, 'en zijn honger is weg');
  const L = D.voorvallen.lopend;
  assert.equal(L.id, 'wolven');
  assert.deepEqual(L.vlaggen, ['wolvenNamenSchaap']);
  assert.ok(T.heeftVlag(D, 'wolvenNamenSchaap'), 'de echte antwoorden');
  assert.ok(L.vanaf > toen && T.uurVanDag(L.vanaf) >= T.VOORVALLEN_INSTELLINGEN.zoektVanaf, 'de ochtend erna');
  const status = T.oorzakenNu(D, S.kalender.dag).find((o) => o.id === 'wolven');
  assert.ok(status && /wolven bij het dorp/.test(status.zin), 'de status Wolven');
  assert.equal(T.wolvenBijHetDorp(D, S.kalender.dag + T.BEESTEN_INSTELLINGEN.dreiging.statusDagen + 1), null, 'en die gaat over');
  // Met beesten in het bos komt het voorval niet zomaar (js/voorvallen.js).
  assert.equal(T.voorvalKan(D, 'wolven', 10 * T.DAGEN_PER_MAAND + 3), null);
});

test('met een hek om de schapen zoekt hij wie alleen in het donker loopt: gewond, in bed, zonder werk, en daarna beter', () => {
  T.zetOptie('beesten', 'zonderDoden');
  try {
    const { S, D, leider } = stouteRoedel();
    const voor = schapenIn(D);
    const p = D.bewoners.mensen.find((q) => q.wezen && !q.schout && q.leeftijd === 'volwassen');
    const e = p.wezen;
    e.binnen = false;
    zetBij(D.wereld, e, { x: leider.tx + 10, y: leider.ty });
    const bevolking = D.bevolking;
    luister((gezegd) => {
      uren(S, 3);
      assert.ok(gezegd.some((t) => t.includes(T.naamVanBewoner(p)) && /gebeten/.test(t)), gezegd.join(' | '));
    });
    assert.equal(schapenIn(D), voor, 'de schapen achter het hek');
    assert.ok(p.gewond && T.blijftThuis(p, S.kalender.dag), 'gewond, in bed');
    assert.equal(D.bevolking, bevolking, 'zonder doden');
    assert.equal(D.beesten.gezien.wat, 'aanval');
    const anker = T.dagAnker(D, e);
    assert.ok(anker && anker.binnen, 'hij blijft binnen');
    const werk = { soort: 'houthakker' };
    p.werk = werk;
    assert.equal(T.werkUrenVan(D, werk, Math.floor(S.kalender.dag) + 1).gewerkt, 0, 'en werkt niet');
    T.tikBeestenDag(D, p.thuisTot);
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
    const p = D.bewoners.mensen.find((q) => q.wezen && !q.schout && q.leeftijd === 'volwassen');
    p.wezen.binnen = false;
    zetBij(D.wereld, p.wezen, { x: leider.tx + 10, y: leider.ty });
    const bevolking = D.bevolking;
    luister((gezegd) => {
      uren(S, 3);
      assert.ok(gezegd.some((t) => /In het donker vielen de wolven aan/.test(t)), gezegd.join(' | '));
    });
    assert.equal(D.bevolking, bevolking - 1);
    assert.ok(!D.bewoners.mensen.includes(p));
  } finally {
    I.doodKans = kans;
  }
});

test('bij de schout met zijn lantaarn blijft de roedel aan de rand van het licht; wie sluipt, valt hij aan', () => {
  const { S, D, leden, leider } = stouteRoedel();
  S.schout.binnen = false;
  zetBij(D.wereld, S.schout, { x: leider.tx + 12, y: leider.ty });
  assert.ok(T.draagtLantaarn(D));
  const r = T.ZIEN_INSTELLINGEN.lantaarn.straal;
  let dichtst = Infinity;
  for (let k = 0; k < 20; k++) {
    uren(S, 0.1);
    for (const e of leden) dichtst = Math.min(dichtst, Math.hypot(e.x - S.schout.x, e.y - S.schout.y));
  }
  assert.ok(dichtst > r, `niet in het licht (${dichtst.toFixed(1)} tegels)`);
  assert.ok(dichtst < r + 4, `maar aan de rand ervan (${dichtst.toFixed(1)} tegels)`);
  assert.equal(S.modus, 'verkennen');
  S.sluipen = true;
  S.schout.lantaarnUit = true;
  uren(S, 1);
  assert.equal(S.modus, 'overgang', 'zonder licht valt hij aan: een gevecht');
});

test('wie aan het bos werkt en een roedel met honger ziet, rent naar huis: hij werkt die dag niet meer, en zijn werkplaats maakte de helft', () => {
  const S = landVanDeMaker(62707);
  const D = S.dorp;
  T.zetBeesten(D);
  const { G, leden } = groepVan(S, 'wolf');
  const I = T.BEESTEN_INSTELLINGEN;
  const kans = I.dreiging.schrikKans;
  I.dreiging.schrikKans = 1; // per uur een kans: hier altijd
  const leider = leiderVan({ leden });
  opUur(S, 17);
  const plein = T.pleinVan(D.wereld);
  zetBij(D.wereld, leider, { x: plein.x + 3, y: plein.y });
  for (const e of leden) if (e !== leider) zetBij(D.wereld, e, { x: plein.x + 6, y: plein.y });
  for (const q of D.bewoners.mensen) if (q.wezen) q.wezen.binnen = true;
  S.schout.binnen = true;
  const p = D.bewoners.mensen.find((q) => q.wezen && !q.schout && q.leeftijd === 'volwassen');
  const e = p.wezen;
  e.binnen = false;
  zetBij(D.wereld, e, { x: plein.x - 2, y: plein.y });
  e.werkt = { soort: 'hakken', x: e.tx, y: e.ty, op: null, tot: null };
  const werk = { soort: 'houthakker', werkte: 1 };
  p.werk = werk;
  T.zetVoorraad(D, 'hout', 10);
  try {
    T.werkBeestenBij(S, D);
    assert.ok(!T.blijftThuis(p, S.kalender.dag), 'een roedel zonder honger blijft uit het zicht');
    G.honger = I.honger.jagenVanaf;
    G.keek = 0;
    luister((gezegd) => {
      T.werkBeestenBij(S, D);
      assert.ok(gezegd.some((t) => t.includes(T.naamVanBewoner(p)) && /rende naar huis/.test(t)), gezegd.join(' | '));
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

test('een jacht neemt de roedel die het schaap nam wolven af, en een hek houdt hem bij de schapen weg', () => {
  const { S, D, G } = stouteRoedel();
  D.beesten.hek = false;
  const voor = groepVan(S, 'wolf').leden.length;
  D.beesten.roedel = G;
  luister(() => T.voorvalGevolg(D, { wolven: -1 }));
  assert.equal(groepVan(S, 'wolf').leden.length, voor - 1);
  T.voorvalGevolg(D, { hek: true });
  assert.ok(D.beesten.hek);
  const schaap = T.veeVan(D).find((e) => e.dier === 'schaap');
  zetBij(D.wereld, schaap, { x: leiderVan(groepVan(S, 'wolf')).tx + 6, y: leiderVan(groepVan(S, 'wolf')).ty });
  const schapen = schapenIn(D);
  uren(S, 2);
  assert.equal(schapenIn(D), schapen, 'achter het hek');
});

test('een wolf die in een gevecht viel, ligt er de volgende ochtend niet meer', () => {
  const S = landVanDeMaker(62707);
  const D = S.dorp;
  T.zetBeesten(D);
  const wolf = groepVan(S, 'wolf').leden[0];
  wolf.dood = true;
  T.tikBeestenDag(D, Math.floor(S.kalender.dag) + 1);
  assert.ok(!D.wereld.wezens.includes(wolf));
});

// ---------------------------------------------------------------------------------------------
// Stap 3a, de jager (Marcel, 7 okt: "Altijd een paar herten over houden. Anders krijgen we geen jonge hertjes meer")
// ---------------------------------------------------------------------------------------------

// Een jager bij het dorp, klaar, op een land van de maker met zijn beesten; jij bouwt, zonder voorvallen, en het werk telt
// in handen (alleen de nachten tikken, dus niemand loopt naar zijn werk). `f` krijgt { S, D, g }.
function metJager(zaad, f) {
  const S = landVanDeMaker(zaad);
  const D = S.dorp;
  const uren = T.BEWONERS_INSTELLINGEN.werkInUren;
  T.zetOptie('wieBouwt', 'jij');
  T.zetOptie('voorvallen', 'uit');
  T.BEWONERS_INSTELLINGEN.werkInUren = false;
  try {
    T.zetBeesten(D);
    const huis = D.gebouwen.find((g) => g.huis === 'schout');
    const plek = T.plekVoor(D, 'jager', T.deurVan(D.wereld, huis));
    const u = T.plaatsGebouw(D, 'jager', plek.x, plek.y);
    assert.ok(u.gelukt, u.reden);
    T.zetVoorraad(D, 'graan', 2000);
    T.zetVoorraad(D, 'hout', 100);
    for (let d = 1; d <= T.GEBOUWEN.jager.bouwtijd + 1; d++) nachtVan(S, d);
    assert.ok(u.instantie.klaar, 'de hut staat');
    f({ S, D, g: u.instantie });
  } finally {
    T.BEWONERS_INSTELLINGEN.werkInUren = uren;
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

const binnenBereik = (D, g) => T.beestenVan(D).filter(({ G }) => T.afstand(T.deurVan(D.wereld, g), G.thuis) <= T.BEESTEN_INSTELLINGEN.jager.straal);

test('de jager schiet klein wild en herten in zijn bereik, laat er altijd twee per groep staan, en dan alleen klein wild', () => metJager(72022, ({ S, D, g }) => {
  const J = T.BEESTEN_INSTELLINGEN.jager;
  // Zonder wolven: wat er van de herten verdwijnt, nam de jager.
  D.wereld.wezens = D.wereld.wezens.filter((e) => !(e.groep && e.groep.soort === 'wolf'));
  // Elk groepje drie herten: na een hert per groepje is er geen meer dat hij mag nemen. Vanaf hooimaand, na de jongen
  // van dit jaar (bloeimaand): in een jaar groeit het bos aan met meer herten dan één jager schiet.
  for (const { G, leden } of T.beestenVan(D)) if (G.soort === 'hert') leden.slice(J.laatStaan + 1).forEach((e) => (D.wereld.wezens = D.wereld.wezens.filter((x) => x !== e)));
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
  assert.ok(!T.watTeBouwen(D).some((x) => x.soort === 'jager'), 'geen tweede jager');
  assert.ok(vlees > 0);
}));

test('een roedel die groter is dan drie, verliest elke vijf dagen een wolf aan de jager; zonder herten schiet hij verder alleen klein wild', () => metJager(72022, ({ S, D, g }) => {
  const J = T.BEESTEN_INSTELLINGEN.jager;
  // Een roedel van zes in zijn bereik, en geen herten die hij mag nemen.
  const roedel = () => binnenBereik(D, g).find(({ G }) => G.soort === 'wolf');
  assert.ok(roedel(), 'een roedel in zijn bereik');
  let dag = T.GEBOUWEN.jager.bouwtijd + 2;
  // Jongen tot zes (zonder te splitsen: dat doet een groep pas bij `groot`).
  const groot = T.BEESTEN_INSTELLINGEN.groot;
  T.BEESTEN_INSTELLINGEN.groot = 99;
  try {
    while (roedel().leden.length < 6) T.tikBeestenDag(D, dag, { jongen: true });
  } finally {
    T.BEESTEN_INSTELLINGEN.groot = groot;
  }
  while (roedel().leden.length > 6) {
    const weg = roedel().leden.filter((x) => !x.leider).pop();
    D.wereld.wezens = D.wereld.wezens.filter((e) => e !== weg);
  }
  for (const { G, leden } of T.beestenVan(D)) if (G.soort === 'hert') leden.slice(J.laatStaan).forEach((e) => (D.wereld.wezens = D.wereld.wezens.filter((x) => x !== e)));
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
    assert.ok(gezegd.some((z) => /De jager schoot een wolf/.test(z)), 'het dorp zegt het');
  });
  assert.equal(roedel().leden.length, J.hooguit, 'de roedel is weer klein');
  assert.equal(dagen.length, 6 - J.hooguit);
  for (let i = 1; i < dagen.length; i++) assert.ok(dagen[i] - dagen[i - 1] >= J.wolfDagen, 'een per vijf dagen');
  assert.ok(roedel().leden.some((e) => e.leider), 'de leider blijft');
  assert.equal(g.gevangen.wolf, 6 - J.hooguit);
  assert.ok(Math.abs(vlees - werkte * T.GEBOUWEN.jager.maakt.uit.vlees * J.kleinWild) < 1e-6, `alleen klein wild, geen vlees van de wolven (${vlees})`);
}));

test('zonder beesten (het ontworpen gehucht, of de spelregel uit) maakt de jager zijn vlees zoals altijd', () => {
  for (const regel of ['aan', 'uit']) {
    const S = landVanDeMaker(62707);
    T.zetOptie('beesten', regel);
    try {
      if (regel === 'aan') delete S.dorp.beesten; // zoals het ontworpen gehucht: geen beesten gezet
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

test('overdag loert de jager in het bos op zijn groep, net buiten waar ze schuw worden, en gaat dan terug naar zijn hut', () => metJager(72022, ({ S, D, g }) => {
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
    T.werkBeestenBij(S, D);
    T.werkVeldwerkBij(S, D);
    T.beweegWezens(S, D.wereld, stap / 10, stap);
    if (e.werkt && e.werkt.soort === 'loeren' && e.werkt.tot != null && !loerde) {
      const groep = T.beestenVan(D).find(({ G }) => G.thuis.x === g.wild.x && G.thuis.y === g.wild.y);
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
// Stap 3b, de jacht te voet (Marcel, 7 okt: "Ja dat is goed")
// ---------------------------------------------------------------------------------------------

// Een jacht op de roedel die een schaap nam, op een zomerochtend; zonder militie gaan er twee weerbare mannen mee.
function jacht() {
  const S = landVanDeMaker(62707);
  const D = S.dorp;
  T.zetBeesten(D);
  const roedel = groepVan(S, 'wolf');
  D.beesten.roedel = roedel.G;
  opUur(S, 9);
  let J;
  luister((gezegd) => {
    J = T.beginJacht(D, S.kalender.dag);
    assert.ok(gezegd.some((z) => /De jacht op de wolven: .* gaan met je mee/.test(z)), gezegd.join(' / '));
  });
  return { S, D, J, roedel };
}

test('een jacht te voet: de mannen lopen met de schout mee, en bij de roedel begint een gevecht in beurten', () => {
  const { S, D, J, roedel } = jacht();
  assert.equal(J.roedel, roedel.G);
  assert.equal(J.mannen.length, T.BEESTEN_INSTELLINGEN.jacht.mannen, 'twee weerbare mannen');
  for (const e of J.mannen) assert.ok(e.opgeroepen && e.kant === 'speler', `${e.naam} gaat mee`);
  assert.deepEqual(T.holVanDeJacht(D), roedel.G.thuis, 'het hol ligt in goud op de grond');
  // De schout loopt naar het hol, de mannen naast hem; binnen negen tegels van een wolf begint het gevecht.
  const leider = leiderVan(roedel);
  const plek = zetBij(D.wereld, S.schout, { x: leider.tx + T.BEESTEN_INSTELLINGEN.jacht.bij, y: leider.ty });
  for (const e of J.mannen) zetBij(D.wereld, e, plek);
  T.werkBeestenBij(S, D);
  assert.equal(S.modus, 'overgang', 'het gevecht begint');
  T.beginGevecht(S);
  for (const e of J.mannen) assert.ok(S.gevecht.volgorde.includes(e), `${e.naam} vecht mee`);
  assert.ok(S.gevecht.monsters.some((m) => m.groep === roedel.G), 'tegen de roedel');
  // Een wolf valt, de rest is gevlucht: de jacht is voorbij, en de mannen gaan naar huis.
  S.gevecht.monsters.find((m) => m.groep === roedel.G).dood = true;
  luister((gezegd) => {
    T.eindeGevecht(S, 'kwijt');
    assert.ok(gezegd.some((z) => /een wolf minder, de rest is gevlucht/.test(z)), gezegd.join(' / '));
  });
  assert.ok(roedel.G.weg > S.kalender.dag, 'de rest vlucht naar het hol');
  assert.equal(D.beesten.jacht, null);
  assert.equal(T.holVanDeJacht(D), null);
  for (const e of J.mannen) assert.ok(!e.opgeroepen && e.kant === 'neutraal', `${e.naam} gaat naar huis`);
});

test('gaat de schout niet binnen twee dagen, dan gaan de mannen zonder hem: de roedel verliest twee wolven', () => {
  const { S, D, J, roedel } = jacht();
  const voor = roedel.leden.length;
  S.kalender.dag = J.tot - 0.1;
  T.werkBeestenBij(S, D);
  assert.ok(D.beesten.jacht, 'nog niet');
  S.kalender.dag = J.tot;
  luister((gezegd) => {
    T.werkBeestenBij(S, D);
    assert.ok(gezegd.some((z) => /zonder je/.test(z)), gezegd.join(' / '));
  });
  assert.equal(D.beesten.jacht, null);
  assert.equal(D.wereld.wezens.filter((e) => e.groep === roedel.G).length, Math.max(0, voor - T.BEESTEN_INSTELLINGEN.jacht.zonderJou));
  for (const e of J.mannen) assert.ok(!e.opgeroepen);
});

test('het voorval "wolven": "Een jacht" is een jacht te voet, en het venster zegt wat het vraagt', () => {
  const S = landVanDeMaker(62707);
  const D = S.dorp;
  T.zetBeesten(D);
  D.beesten.roedel = groepVan(S, 'wolf').G;
  const keuze = T.GESPREKKEN.wolven.knopen.begin.keuzes.find((k) => /jacht/.test(k.zeg) && k.als && k.als.vlag === 'wolvenNamenSchaap');
  assert.ok(keuze.doe.jacht);
  assert.match(T.prijsVanKeuze(D, keuze.doe).tekst, /de mannen gaan met je mee naar de wolven/);
  luister(() => T.voorvalGevolg(D, keuze.doe));
  assert.ok(D.beesten.jacht, 'de jacht loopt');
});

// ---------------------------------------------------------------------------------------------
// Stap 3c, om hulp roepen (Marcel, 7 okt: "even noteren dat mensen ook om hulp roepen", en "C. Ja goed idee")
// ---------------------------------------------------------------------------------------------

// Een roedel met honger valt iemand aan die alleen in het donker loopt; geeft { S, D, G, p, e, gezegd } zodra hij om
// hulp roept.
function aanval() {
  const { S, D, G, leider } = stouteRoedel();
  const p = D.bewoners.mensen.find((q) => q.wezen && !q.schout && q.leeftijd === 'volwassen');
  const e = p.wezen;
  e.binnen = false;
  zetBij(D.wereld, e, { x: leider.tx + 10, y: leider.ty });
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
  assert.ok(gezegd.some((t) => t.includes(T.naamVanBewoner(p)) && /roept om hulp/.test(t)), gezegd.join(' | '));
  assert.ok(e.roeptOmHulp && e.moetNaar, 'hij staat en roept');
  assert.ok(!p.gewond, 'nog niet gebeten');
  luister((z) => {
    uren(S, T.BEESTEN_INSTELLINGEN.hulp.uren + 0.05);
    assert.ok(z.some((t) => /gebeten|vielen de wolven aan/.test(t)), z.join(' | '));
  });
  assert.equal(G.aanval, null);
  assert.ok(!e.roeptOmHulp && !e.moetNaar);
});

test('komt er een buur, dan vluchten de wolven; komt de schout, dan is het een gevecht in beurten', () => {
  {
    const { S, D, G, p, e } = aanval();
    const buur = D.bewoners.mensen.find((q) => q !== p && q.wezen && !q.schout && q.leeftijd === 'volwassen').wezen;
    buur.binnen = false;
    zetBij(D.wereld, buur, T.tegelVan(e));
    luister((z) => {
      uren(S, 0.05);
      assert.ok(z.some((t) => /te hulp, en de wolven zijn gevlucht/.test(t)), z.join(' | '));
    });
    assert.equal(G.aanval, null);
    assert.ok(G.weg > S.kalender.dag, 'ze vluchten');
    assert.ok(!p.gewond);
  }
  {
    const { S, D, G, e } = aanval();
    S.schout.binnen = false;
    zetBij(D.wereld, S.schout, { x: e.tx + T.BEESTEN_INSTELLINGEN.hulp.schout, y: e.ty });
    uren(S, 0.05);
    assert.equal(S.modus, 'overgang', 'het gevecht begint');
    assert.equal(G.aanval, null);
  }
});

// ---------------------------------------------------------------------------------------------
// Stap 3d, het hek op de kaart (Marcel, 7 okt: "D ja allebei")
// ---------------------------------------------------------------------------------------------

test('een hek om de schapen staat om de meent, met een hekje in elke zijde, en de meent blijft te bereiken', () => {
  for (const zaad of [62707, 73425, 72022]) {
    const S = landVanDeMaker(zaad);
    const D = S.dorp;
    const w = D.wereld;
    const m = w.meenten[0];
    const binnen = { x: m.x + Math.floor(m.b / 2), y: m.y + Math.floor(m.h / 2) };
    const plein = T.pleinVan(w);
    T.hekOmDeSchapen(D);
    const hek = w.voorwerpen.filter((v) => v.hek);
    assert.ok(hek.length >= m.b + m.h, `${zaad}: een hek (${hek.length} stukken)`);
    for (const v of hek) {
      const opRand = v.x === m.x || v.y === m.y || v.x === m.x + m.b - 1 || v.y === m.y + m.h - 1;
      assert.ok(opRand, `${zaad}: op de rand van de meent`);
    }
    const hekjes = hek.filter((v) => v.soort.startsWith('hekje'));
    assert.ok(hekjes.length >= 2, `${zaad}: hekjes om door te lopen`);
    assert.ok(hekjes.every((v) => !T.isVast(w, v.x, v.y)), 'door een hekje loop je');
    assert.ok(T.kanErKomen(w, plein, binnen), `${zaad}: de meent blijft te bereiken`);
    for (const e of T.veeVan(D)) assert.ok(T.kanErKomen(w, plein, T.tegelVan(e)), `${zaad}: geen dier opgesloten`);
  }
});

// ---------------------------------------------------------------------------------------------
// Stap 3b, het hol op de kaart (Marcel, 7 okt: "een kuil onder een omgevallen boom, met botten ervoor")
// ---------------------------------------------------------------------------------------------

test('elke roedel heeft een hol op de kaart naast zijn thuis, vast, en zijn plekken blijven te bereiken', () => {
  for (const zaad of [62707, 73425, 72022]) {
    const S = landVanDeMaker(zaad);
    const D = S.dorp;
    const w = D.wereld;
    T.zetBeesten(D);
    const roedels = T.beestenVan(D).filter(({ G }) => G.soort === 'wolf');
    assert.ok(roedels.length, `${zaad}: roedels`);
    for (const { G } of roedels) {
      const hol = T.holVan(D, G);
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
  // Land 73425: sinds het eiland van 8 okt woont de roedel daar aan de rand van het land, met bos om te verhuizen (op 62707
  // is er na het kappen geen bos meer dicht genoeg, en trekt hij meteen weg).
  const S = landVanDeMaker(73425);
  const D = S.dorp;
  T.zetBeesten(D);
  const G = groepVan(S, 'wolf').G;
  const oud = { ...G.thuis };
  const dag = eersteVan(S, 'hooimaand');
  kaal(D, oud.x, oud.y, 4);
  const zeg = T.zeg;
  T.zeg = () => {};
  try {
    T.tikBeestenDag(D, dag);
    assert.notDeepEqual(G.thuis, oud, 'een nieuw thuis');
    const hol = T.holVan(D, G);
    assert.ok(hol && T.afstand(hol, G.thuis) <= 3, 'het hol staat nu bij het nieuwe thuis');
    assert.equal(D.wereld.voorwerpen.filter((v) => v.groep === G).length, 1, 'het oude is weg');
    kaal(D, 50, 50, 60);
    T.tikBeestenDag(D, dag + 1);
    assert.ok(G.trektWeg);
    assert.ok(!T.holVan(D, G), 'de roedel trekt weg, het hol ook');
  } finally {
    T.zeg = zeg;
  }
});

test('een nieuwe roedel (de helft die splitst) krijgt een eigen hol, en een roedel die verslagen is laat het niet achter', () => {
  const IN = T.BEESTEN_INSTELLINGEN;
  const { plaatsPerRoedel, uitElkaar } = IN;
  Object.assign(IN, { plaatsPerRoedel: 50, uitElkaar: 6 }); // plaats genoeg in het bos, zodat de helft een eigen thuis vindt
  try {
    const S = landVanDeMaker(62707);
    const D = S.dorp;
    T.zetBeesten(D);
    const w = D.wereld;
    const G = groepVan(S, 'wolf').G;
    const lente = eersteVan(S, 'bloeimaand');
    const oud = new Set(T.beestenVan(D).map((g) => g.G));
    for (let k = 0; k < 8 && T.beestenVan(D).every((g) => oud.has(g.G) || g.G.soort !== 'wolf'); k++) T.tikBeestenDag(D, lente, { jongen: true });
    const nieuwe = T.beestenVan(D).filter((g) => !oud.has(g.G) && g.G.soort === 'wolf' && !g.G.trektWeg);
    assert.ok(nieuwe.length, 'de roedel splitste');
    for (const { G: nieuw } of nieuwe) {
      const hol = T.holVan(D, nieuw);
      assert.ok(hol && T.afstand(hol, nieuw.thuis) <= 3, 'een eigen hol bij zijn eigen thuis');
      assert.notEqual(hol, T.holVan(D, G));
    }
    // Verslagen: geen dier meer van de groep.
    w.wezens = w.wezens.filter((e) => e.groep !== G);
    T.tikBeestenDag(D, lente + 1);
    assert.ok(!T.holVan(D, G), 'zonder roedel geen hol');
  } finally {
    Object.assign(IN, { plaatsPerRoedel, uitElkaar });
  }
});

test('het hol blijft na opslaan en laden bij zijn roedel', () => {
  const S = landVanDeMaker(62707);
  T.zetBeesten(S.dorp);
  const terug = T.leesSpel(T.bewaarSpel(S)).staat;
  const D = terug.dorp;
  const hol = D.wereld.voorwerpen.find((v) => v.soort === 'hol');
  assert.ok(hol, 'het hol is er nog');
  assert.ok(D.wereld.wezens.some((e) => e.groep === hol.groep), 'en nog van dezelfde roedel als zijn wolven');
});

test('met de spelregel "Beesten" uit is het hol weg', () => {
  const S = landVanDeMaker(62707);
  const D = S.dorp;
  T.zetBeesten(D);
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
