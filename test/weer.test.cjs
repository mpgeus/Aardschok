// Het weer en de statussen met niveaus (js/weer.js, T.OORZAKEN in js/voorvallen.js; werklijst vraag 77, stap 2; Marcel,
// 9 okt: "1. Beiden 2. Ook in beeld 3. Ja kleine beekjes ook, goed idee!"): elke dag zon, wolken, regen of sneeuw uit het
// nummer van het land, droogte en ernstige droogte in het groeiseizoen, wat dat de oogst kost, de beekjes die droogvallen
// en de visser die er minder vangt; en de statussen in de balk en het rapport.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
T.zetOptie('wieBouwt', 'jij');
T.ui = new Proxy({}, { get: () => () => undefined });
const IN = T.WEER_INSTELLINGEN;

function dagVan(maand, dagVanMaand, jaar = 0) {
  for (let d = 0; d < T.DAGEN_PER_JAAR; d++) {
    const x = T.datumVanDag(d);
    if (T.MAANDEN[x.maand].naam === maand && x.dagVanMaand === dagVanMaand) return d + jaar * T.DAGEN_PER_JAAR;
  }
  throw new Error(maand);
}

// Een jaar weer, voor een dorp met dit nummer: de dagen, en het dorp aan het eind.
function jaarWeer(zaad, dagen = T.DAGEN_PER_JAAR) {
  const D = { lot: { zaad }, wereld: {} };
  const uit = [];
  for (let dag = 0; dag < dagen; dag++) {
    T.tikWeerDag(D, dag);
    uit.push(D.weer.vandaag);
  }
  return { D, uit };
}

test('hetzelfde nummer geeft hetzelfde weer, zonder Math.random; een ander nummer ander weer', () => {
  const toeval = Math.random;
  Math.random = () => {
    throw new Error('het weer komt uit het nummer, niet uit Math.random');
  };
  try {
    const a = jaarWeer(5).uit;
    assert.deepEqual(jaarWeer(5).uit, a);
    assert.notDeepEqual(jaarWeer(6).uit, a);
    assert.ok(a.includes('regen') && a.includes('zon') && a.includes('wolken') && a.includes('sneeuw'), 'een jaar heeft van alles');
    const winter = a.filter((w, dag) => T.datumVanDag(dag).seizoen === 'winter' && w === 'regen');
    assert.equal(winter.length, 0, 'in de winter valt sneeuw, geen regen');
  } finally {
    Math.random = toeval;
  }
});

test('lang geen regen in het groeiseizoen is droogte, en erger ernstige droogte; dat kost de oogst, tot het nieuwe jaar', () => {
  const regen = IN.regenKans;
  const nat = IN.blijftNat;
  IN.regenKans = { lente: 0, zomer: 0, herfst: 0, winter: 0 };
  IN.blijftNat = 0;
  try {
    const D = { lot: { zaad: 3 }, wereld: {} };
    const begin = dagVan('zomermaand', 1);
    let dag = begin;
    for (; dag < begin + IN.droogteVanaf - 1; dag++) T.tikWeerDag(D, dag);
    assert.equal(T.droogteNiveau(D), 0, 'nog geen droogte');
    assert.equal(T.droogteFactor(D), 1);
    T.tikWeerDag(D, dag++);
    assert.equal(T.droogteNiveau(D), 1, 'droogte');
    assert.ok(T.droogteFactor(D) < 1, 'het kost de oogst');
    assert.ok(D.weer.beekDroog, 'de beekjes vallen droog');
    for (; D.weer.tekort < IN.ernstigVanaf; dag++) T.tikWeerDag(D, dag);
    assert.equal(T.droogteNiveau(D), 2, 'ernstige droogte');
    const akker = { x: 0, y: 0, b: 1, h: 1 };
    assert.ok(T.oogstPerTegel(akker, null, D) < T.oogstPerTegel(akker, null), 'een akker geeft minder');
    // Regen maakt het goed, en een nieuw jaar begint met een volle oogst.
    IN.blijftNat = 1;
    D.weer.vandaag = 'regen';
    for (let i = 0; i < 20; i++) T.tikWeerDag(D, dag++);
    assert.equal(T.droogteNiveau(D), 0, 'na de regen is de droogte voorbij');
    assert.ok(!D.weer.beekDroog);
    assert.ok(T.droogteFactor(D) < 1, 'wat de droogte kostte, blijft dit jaar');
    T.tikWeerDag(D, dagVan('lentemaand', 1, 1));
    assert.equal(T.droogteFactor(D), 1, 'op 1 lentemaand begint het opnieuw');
  } finally {
    IN.regenKans = regen;
    IN.blijftNat = nat;
  }
});

test('in veertig spellen van vijf jaar is er soms droogte en zelden ernstige droogte', () => {
  let jaren = 0;
  let droog = 0;
  let ernstig = 0;
  for (let zaad = 1; zaad <= 40; zaad++) {
    const D = { lot: { zaad }, wereld: {} };
    for (let jaar = 0; jaar < 5; jaar++) {
      let n = 0;
      for (let d = 0; d < T.DAGEN_PER_JAAR; d++) {
        T.tikWeerDag(D, jaar * T.DAGEN_PER_JAAR + d);
        n = Math.max(n, T.droogteNiveau(D));
      }
      jaren++;
      if (n >= 1) droog++;
      if (n >= 2) ernstig++;
    }
  }
  assert.ok(droog > jaren * 0.2 && droog < jaren * 0.6, `${droog} van ${jaren} jaren met droogte`);
  assert.ok(ernstig > 0 && ernstig < jaren * 0.15, `${ernstig} van ${jaren} jaren met ernstige droogte`);
});

// Een kaart van 26 bij 14 met een beek van twee tegels breed en een meer van negen bij negen.
function kaartMetWater() {
  const grond = [];
  for (let y = 0; y < 14; y++) {
    grond.push([]);
    for (let x = 0; x < 26; x++) {
      const beek = x === 3 || x === 4;
      const meer = x >= 15 && x < 24 && y >= 2 && y < 11;
      grond[y].push({ naam: beek || meer ? 'water' : 'gras' });
    }
  }
  return { grond, tegels: grond.map((r) => r.map(() => 'vloer')) };
}

test('een beek valt in de droogte droog, een meer niet; een visser aan een beek vangt dan niets', () => {
  const w = kaartMetWater();
  assert.ok(T.isBeek(w, 3, 5) && T.isBeek(w, 4, 0), 'de beek');
  assert.ok(!T.isBeek(w, 17, 5), 'het meer');
  assert.ok(!T.isBeek(w, 7, 5), 'gras is geen beek');
  const D = { lot: { zaad: 1 }, wereld: w, weer: { vandaag: 'zon', droog: 30, tekort: IN.ernstigVanaf, verlies: 0, beekDroog: true } };
  assert.ok(T.staatDroog(D, 3, 5));
  assert.ok(!T.staatDroog(D, 17, 5));
  const aanDeBeek = { soort: 'visser', x: 5, y: 5, klaar: true };
  const aanBeide = { soort: 'visser', x: 8, y: 5, klaar: true };
  assert.equal(T.visserWater(D, aanDeBeek), 0);
  assert.equal(T.waaromVistHijNiet(D, aanDeBeek), 'de beek staat droog');
  const deel = T.visserWater(D, aanBeide);
  assert.ok(deel > 0 && deel < 1, `${deel}: zijn meer is er nog, zijn beek niet`);
  assert.equal(T.waaromVistHijNiet(D, aanBeide), null);
  // Zonder droogte vangt hij alles.
  D.weer.tekort = 0;
  D.weer.beekDroog = false;
  assert.equal(T.visserWater(D, aanDeBeek), 1);
  assert.equal(T.staatDroog(D, 3, 5), false);
  // De hoeken van een tegel aan de droge beek worden zandpad, voor het tekenen.
  D.weer.beekDroog = true;
  D.weer.tekort = IN.droogteVanaf;
  assert.deepEqual(T.hoekenDroog(D, 2, 5, ['gras', 'water', 'water', 'gras']), ['gras', 'zandpad', 'zandpad', 'gras']);
  assert.equal(T.hoekenDroog(D, 18, 5, ['water', 'water', 'water', 'water']), null, 'het meer blijft water');
});

test('de statussen hebben niveaus: droogte en ernstige droogte, met wat helpt', () => {
  const echt = console.warn;
  console.warn = () => {};
  const S = { kalender: T.nieuweKalender() };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
  }
  const D = S.dorp;
  const dag = dagVan('zomermaand', 10);
  S.kalender.dag = dag;
  D.weer = { vandaag: 'zon', droog: IN.droogteVanaf, tekort: IN.droogteVanaf, verlies: 0.05 };
  let st = T.statussenVan(D, dag).find((s) => s.id === 'droogte');
  assert.equal(st.niveau, 1);
  assert.equal(st.naam, 'Droogte');
  assert.match(st.zin, /^Het is droog, want het heeft al .* dagen niet geregend\.$/);
  assert.match(st.helpt, /5% minder/);
  T.tikStatussenDag(D, dag);
  D.weer.tekort = IN.ernstigVanaf;
  T.tikStatussenDag(D, dag + 3);
  st = T.statussenVan(D, dag + 3).find((s) => s.id === 'droogte');
  assert.equal(st.niveau, 2);
  assert.equal(st.naam, 'Ernstige droogte');
  assert.equal(st.sinds, dag, 'sinds wanneer: het begin van de droogte, niet van het erger worden');
  D.weer.tekort = 0;
  T.tikStatussenDag(D, dag + 4);
  assert.equal(D.statussen.droogte, undefined, 'voorbij');
});

test('met de spelregel "Het weer" op "Altijd zon" is er geen weer, en op "Zonder droogte" kost het niets', () => {
  T.zetOptie('weer', 'uit');
  try {
    const D = { lot: { zaad: 2 }, wereld: {} };
    T.tikWeerDag(D, 40);
    assert.equal(D.weer, undefined);
    assert.equal(T.weerVan(D), null);
    assert.equal(T.droogteFactor(D), 1);
  } finally {
    T.optiesTerug();
  }
  T.zetOptie('weer', 'zonder');
  try {
    const D = { lot: { zaad: 2 }, wereld: {}, weer: { vandaag: 'zon', droog: 40, tekort: 40, verlies: 0.3 } };
    assert.equal(T.droogteNiveau(D), 0);
    assert.equal(T.droogteFactor(D), 1);
  } finally {
    T.optiesTerug();
  }
});
