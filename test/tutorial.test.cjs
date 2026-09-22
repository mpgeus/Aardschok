// De tutorial zonder scherm (js/tutorial.js): het spel begint op het erf, de middag speelt van
// begin tot eind zoals een speler hem speelt (en kost de held geen dag), de meester sterft op
// honderd aan zijn laatste spreuk zonder dat het spel eindigt, en een scène overslaan geeft
// dezelfde wereld als hem uitkijken. Zie ontwerp/verhaal.md, "De opening" en "Hij doet zijn
// moestuin, tot hij sterft".
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/leeftijd.js');
require('../js/wereld.js');
require('../tegels/tegels.js');
require('../kaarten/kaarten.js');
require('../js/kaart.js');
require('../js/gebied.js');
require('../js/pad.js');
require('../js/iso.js');
require('../js/spreuken.js');
require('../js/anim.js');
require('../js/verkennen.js');
require('../js/gevecht.js');
require('../js/toveren.js');
require('../js/gesprek.js');
require('../js/gesprekken.js');
require('../js/regie.js');
require('../js/tutorial.js');
const T = globalThis.Toren;

// Zonder scherm doet T.ui niets, behalve dat "Verder" in een scène zichzelf meteen aanklikt.
T.ui = new Proxy({}, {
  get: (_, naam) => (naam === 'toonDialoog' ? (_naam2, _tekst, lijst) => lijst[0].kies() : () => {}),
});
T.sprites = { richtingVan: () => 'Z' };

// Een nieuw spel zoals js/main.js het begint (T.nieuwSpel), maar zonder canvas en camera.
function nieuwSpel() {
  const S = {
    tijd: 0, wind: 0, gebieden: {}, vlaggen: new Set(), gesprekLeeftijd: {}, modus: 'verkennen', gevecht: null,
    overgang: null, bezig: false, spreuk: null, spreukBereik: null, lichten: [], inventaris: new Set(),
    sleutelGebruikt: false, fonteinLeeg: false, sluipen: false, bezocht: new Set(['hal']), naarGebied: null,
    netGeland: null, effecten: [], wachters: [], bereik: null, hover: null, handeling: null, naLopen: null,
    regieCamera: null, spreektMet: null,
  };
  T.S = S;
  T.beginOpHetErf(S);
  return S;
}

// De spellus van js/main.js zonder scherm: na elk beeld krijgen de beloftes de kans om door te gaan.
async function stap(S, seconden) {
  for (let i = 0; i < Math.round(seconden * 60); i++) {
    S.tijd += 1 / 60;
    T.werkAnimatiesBij(S, 1 / 60);
    if (S.naarGebied) T.gaNaarGebied(S, S.naarGebied);
    T.werkLichtenBij(S, 1 / 60);
    T.werkTutorialBij(S);
    if (S.modus === 'verkennen') {
      T.laatDwalen(S, 1 / 60);
      const m = T.zoekOntdekking(S);
      if (m) T.startGevecht(S, m, false);
    }
    if (S.modus === 'overgang' && S.wereld.wezens.every((e) => !e.pad.length)) T.beginGevecht(S);
    for (let k = 0; k < 8; k++) await null;
  }
}

async function wachtOp(S, voorwaarde, seconden, wat) {
  for (let i = 0; i < seconden * 10; i++) {
    if (voorwaarde()) return;
    await stap(S, 0.1);
  }
  assert.fail(`duurde te lang: ${wat}`);
}

// Klikken zoals de speler: het scherm en de klik stellen dezelfde vraag (js/main.js).
function klik(S, doel) {
  const h = S.modus === 'gevecht' ? T.handelingGevecht(S, doel) : T.handelingVerkennen(S, doel);
  assert.ok(h && h.doe && h.kan !== false, `er valt hier iets te doen (${doel.x}, ${doel.y})`);
  h.doe();
  return h;
}

// Klik tot het lukt. Wim dwaalt door de hal; stapt hij in de weg, dan blijft de held staan, en
// klikt een speler gewoon nog eens.
async function klikTot(S, doel, voorwaarde, seconden, wat) {
  for (let i = 0; i < seconden * 10; i++) {
    if (voorwaarde()) return;
    if (S.modus === 'verkennen' && !S.held.pad.length && !S.held.onderweg && i % 10 === 0) klik(S, typeof doel === 'function' ? doel() : doel);
    await stap(S, 0.1);
  }
  assert.fail(`duurde te lang: ${wat}`);
}

const opWezen = (e) => ({ wezen: e, x: e.tx, y: e.ty });
const opVoorwerp = (v) => ({ voorwerp: v, x: v.x, y: v.y });

// Hoe ver ligt p van de moestuin (0 = erin, 1 = er pal naast)?
function totDeTuin(S, p) {
  const tuin = S.tutorial.erf.voorwerpen.find((v) => v.soort === 'moestuin');
  const [b, h] = tuin.beslaat;
  const dx = Math.max(tuin.x - p.x, 0, p.x - (tuin.x + b - 1));
  const dy = Math.max(tuin.y - p.y, 0, p.y - (tuin.y + h - 1));
  return Math.max(dx, dy);
}

// ---------------------------------------------------------------- het begin

test('het spel begint op het erf, voor de deur van de toren, met de meester in zijn moestuin', () => {
  const S = nieuwSpel();
  const t = S.tutorial;
  const toren = T.gebied(S, 'toren');
  assert.ok(t, 'er is een tutorial');
  assert.equal(S.wereld.buiten, true, 'buiten, niet in de hal');
  assert.equal(S.wereld.gebied, toren.overgangen[0].naar, 'op de kaart waar de buitendeur van de toren heen gaat');
  assert.ok(S.wereld.wezens.includes(S.held));
  assert.ok(!toren.wezens.some((e) => e.soort === 'held'), 'en niet ook nog een held in de hal');
  assert.deepEqual(T.tegelVan(S.held), T.landingIn(S.wereld, 'toren'), 'waar je landt als je de toren uit komt');
  assert.equal(S.held.leeftijd, T.STARTLEEFTIJD);

  assert.equal(t.meester.leeftijd, 97 * 12, 'de meester is zevenennegentig');
  assert.ok(totDeTuin(S, T.tegelVan(t.meester)) <= 1, 'en staat bij zijn moestuin');
  for (const ton of [t.tonOud, t.tonJij]) {
    assert.equal(ton.soort, 'ton');
    assert.equal(totDeTuin(S, ton), 1, 'de tonnen staan tegen de moestuin aan');
    assert.ok(S.wereld.voorwerpen.includes(ton));
  }
  assert.ok(toren.voorwerpen.includes(t.zak), 'de zak zaaigoed ligt in de voorraadkamer');
  assert.equal(T.kamerVan(toren, t.zak.x, t.zak.y).id, 'opslag');
  assert.equal(t.fase, 'aankomst', 'de eerste scène wacht op het titelscherm');
});

// ---------------------------------------------------------------- de hele middag

test('de hele middag speelt van begin tot eind zoals een speler hem speelt, en kost de held geen dag', async () => {
  const S = nieuwSpel();
  const t = S.tutorial;
  const toren = T.gebied(S, 'toren');

  T.startTutorial(S);
  await wachtOp(S, () => t.fase === 'naarMeester' && !t.bezig, 20, 'de meester roept je');

  // Lopen: naar de meester. Daar schiet hij de oude ton in brand: 97 wordt 98.
  await klikTot(S, () => opWezen(t.meester), () => t.fase === 'boodschap', 60, 'naar de meester');
  await wachtOp(S, () => !t.bezig, 20, 'de vuurschicht op de ton');
  assert.equal(t.meester.leeftijd, 98 * 12);
  assert.equal(t.tonOud.soort, 'ton', 'de ton staat er nog, en dat vindt hij grappig');

  // De toren in, naar Wim en de fontein.
  const deur = S.wereld.overgangen.find((o) => o.naar === 'toren');
  await klikTot(S, { x: deur.x, y: deur.y }, () => S.wereld === toren, 60, 'de toren in');
  await wachtOp(S, () => t.wimBinnen && !t.bezig, 20, 'Wim begroet je');
  const fontein = toren.voorwerpen.find((v) => v.soort === 'fontein');
  assert.match(T.handelingVerkennen(S, opVoorwerp(fontein)).tekst, /scheppen voor de meester/);
  await klikTot(S, opVoorwerp(fontein), () => S.inventaris.has('kom'), 30, 'water scheppen');
  assert.equal(S.fonteinLeeg, true, 'het was de laatste slok');
  await wachtOp(S, () => !t.bezig && S.modus === 'verkennen', 20, 'Wim zag het');

  // De deur: wie de voorraadkamer opendoet, wordt gezien, ook gebukt. Een stap terug, de deur
  // dicht, einde beurt: ze zijn je kwijt.
  klik(S, opVoorwerp(t.zak));
  await wachtOp(S, () => S.modus === 'gevecht' && S.gevecht.volgorde[S.gevecht.beurt] === S.held && !S.bezig, 30, 'de slijmkruiper ziet je');
  klik(S, { x: 8, y: 4 });
  await wachtOp(S, () => !S.bezig, 10, 'een stap terug');
  T.deurDicht(S);
  assert.equal(T.deurOp(toren, 9, 4).staat, 'dicht');
  T.eindeBeurt(S);
  await wachtOp(S, () => !S.gevecht && S.modus === 'verkennen' && !t.bezig, 30, 'ze zijn je kwijt, en hij kruipt terug');
  assert.ok(!t.slijm.dood);
  assert.equal(S.held.leeftijd, T.STARTLEEFTIJD, 'ontsnapt zonder beet');

  // Sluipen: gebukt kom je ongezien bij de zak, en weer naar buiten.
  T.wisselSluipen(S);
  let gezien = false;
  await klikTot(S, opVoorwerp(t.zak), () => {
    gezien = gezien || !!S.gevecht;
    return S.inventaris.has('zak');
  }, 60, 'de zak');
  await klikTot(S, { x: 0, y: 5 }, () => {
    gezien = gezien || !!S.gevecht;
    return S.wereld !== toren;
  }, 80, 'weer naar buiten');
  assert.equal(gezien, false, 'gebukt heeft de slijmkruiper je niet gezien');
  T.wisselSluipen(S);

  // Het water en de zak voor de meester: weer zesennegentig. Hij mept de oude ton kapot, dan jij
  // de andere.
  await klikTot(S, () => opWezen(t.meester), () => t.bezig === 'drinken' || t.fase === 'slaan', 60, 'terug naar de meester');
  await wachtOp(S, () => t.fase === 'slaan' && !t.bezig, 30, 'hij drinkt');
  assert.equal(t.meester.leeftijd, 96 * 12);
  assert.equal(t.tonOud.soort, 'puin', 'de meester mepte de oude ton kapot');
  assert.deepEqual([...S.inventaris], []);
  const tip = T.handelingVerkennen(S, opVoorwerp(t.tonJij)).tekst;
  assert.match(tip, /kost niets/);
  await klikTot(S, opVoorwerp(t.tonJij), () => t.fase === 'einde', 30, 'jouw ton');
  assert.equal(t.tonJij.soort, 'puin');

  // Het einde: er komt iets de trap af, hij handelt het af, en sterft bij zijn moestuin.
  await wachtOp(S, () => t.klaar && !t.bezig, 120, 'het einde');
  assert.equal(t.meester.dood, true);
  assert.equal(t.meester.leeftijd, T.EINDLEEFTIJD);
  assert.equal(totDeTuin(S, T.tegelVan(t.meester)), 1, 'hij sterft bij zijn moestuin');
  assert.equal(t.skelet.dood, true);
  assert.equal(S.modus, 'verkennen', 'en het spel gaat door');
  assert.ok(!S.held.dood);
  assert.equal(S.held.leeftijd, T.STARTLEEFTIJD, 'de hele middag kostte de held geen dag');
  assert.ok(T.heeftVlag(S, 'meesterDood'));
  assert.ok(toren.wezens.includes(t.wim), 'Wim is weer naar binnen, naar zijn hal');
  assert.equal(t.wim.dwaalt, true);

  // De slijmkruiper dwaalt meteen weer; wat er op het erf rondloopt pas als je bij de tuin weggaat,
  // en niet terwijl je bij je dode meester staat.
  assert.equal(t.slijm.dwaalt, true);
  const opHetErf = t.vast.filter((v) => t.erf.wezens.includes(v.e));
  assert.ok(opHetErf.length, 'er staat een monster op de kaart (de wolf)');
  await stap(S, 2);
  for (const v of opHetErf) assert.equal(v.e.dwaalt, false, `de ${v.e.naam} wacht nog`);
  await klikTot(S, { x: deur.x, y: deur.y }, () => S.wereld === toren, 60, 'naar binnen');
  await stap(S, 0.2);
  for (const v of opHetErf) assert.equal(v.e.dwaalt, v.dwaalt, `de ${v.e.naam} dwaalt weer zoals voorheen`);
});

test('de meester sterft op honderd aan zijn laatste spreuk: eerst valt het skelet, dan hij, en het spel gaat door', async () => {
  const S = nieuwSpel();
  const t = S.tutorial;
  // Zoals na het water: zesennegentig, en jij sloeg zojuist de tweede ton kapot.
  t.fase = 'slaan';
  t.meester.leeftijd = 96 * 12;
  t.tonOud.soort = 'puin';
  t.tonJij.soort = 'puin';
  T.zetInGebied(S, S.held, S.wereld.gebied, t.tonJij.x - 1, t.tonJij.y);

  // Wie was er al dood toen de meester zijn honderdste jaar betaalde?
  let skeletAlDood = null;
  const echt = T.verouder;
  T.verouder = (S2, maanden, klap, wezen) => {
    if (wezen === t.meester && wezen.leeftijd + maanden >= T.EINDLEEFTIJD) skeletAlDood = t.skelet.dood;
    return echt(S2, maanden, klap, wezen);
  };
  try {
    await wachtOp(S, () => t.klaar && !t.bezig, 120, 'het einde');
  } finally {
    T.verouder = echt;
  }
  assert.equal(skeletAlDood, true, 'de schicht raakt eerst, pas dan kost hij zijn jaar');
  assert.equal(t.meester.dood, true);
  assert.equal(t.meester.leeftijd, T.EINDLEEFTIJD);
  assert.equal(totDeTuin(S, T.tegelVan(t.meester)), 1);
  assert.equal(S.modus, 'verkennen');
  assert.ok(!S.held.dood);
  assert.equal(S.held.leeftijd, T.STARTLEEFTIJD);
});

// ---------------------------------------------------------------- overslaan

// Wat na een scène vast moet liggen, of je hem nu uitkeek of oversloeg.
function stand(S) {
  const t = S.tutorial;
  const plek = (e) => (e ? `${e.tx},${e.ty}${e.dood ? ' dood' : ''}` : '-');
  const gebiedVan = (e) => Object.keys(S.gebieden).find((g) => S.gebieden[g].wezens.includes(e)) || '-';
  return {
    fase: t.fase, klaar: t.klaar, gebied: S.wereld.gebied, modus: S.modus,
    held: plek(S.held), heldLeeftijd: S.held.leeftijd,
    meester: plek(t.meester), meesterLeeftijd: t.meester.leeftijd,
    wim: `${gebiedVan(t.wim)} ${plek(t.wim)} ${t.wim.dwaalt}`,
    skelet: t.skelet ? `${plek(t.skelet)} leven ${t.skelet.leven}` : '-',
    slijm: plek(t.slijm),
    tonnen: [t.tonOud.soort, t.tonJij.soort],
    spullen: [...S.inventaris].sort(),
    vlaggen: [...S.vlaggen].sort(),
    fonteinLeeg: S.fonteinLeeg,
  };
}

// Twee keer dezelfde begintoestand; de ene keer kijk je de scène helemaal uit, de andere keer
// sla je hem over (Escape, zo vaak als nodig: het einde heeft hoofdstukken).
async function uitkijkenEnOverslaan(zetKlaar, naam) {
  const eind = [];
  const duur = [];
  for (const overslaan of [false, true]) {
    const S = nieuwSpel();
    zetKlaar(S);
    let klaar = null;
    T.speelTutorialScene(S, naam).then(() => {
      klaar = stand(S);
    });
    for (let i = 0; i < 60 * 180 && !klaar; i++) {
      if (overslaan) T.regie.overslaan();
      await stap(S, 1 / 60);
    }
    assert.ok(klaar, `de scène ${naam} liep af`);
    eind.push(klaar);
    duur.push(S.tijd);
  }
  // Uitkijken kost echt speltijd (lopen, toveren, wachten); overslaan bijna niets.
  assert.ok(duur[0] > duur[1] + 0.5, `uitgekeken duurde ${duur[0].toFixed(1)} s, overgeslagen ${duur[1].toFixed(1)} s`);
  return eind;
}

const naastDeMeester = (S) => {
  const m = S.tutorial.meester;
  T.zetInGebied(S, S.held, S.wereld.gebied, m.tx - 1, m.ty + 1);
};

const SCENES = {
  roepen: () => {},
  ton: (S) => {
    S.tutorial.fase = 'naarMeester';
    naastDeMeester(S);
  },
  drinken: (S) => {
    const t = S.tutorial;
    t.fase = 'boodschap';
    t.meester.leeftijd = 98 * 12;
    t.geschept = true;
    S.fonteinLeeg = true;
    S.inventaris.add('kom');
    S.inventaris.add('zak');
    naastDeMeester(S);
  },
  terugkruipen: (S) => {
    const t = S.tutorial;
    t.fase = 'boodschap';
    T.gaNaarGebied(S, 'toren');
    T.zetInGebied(S, S.held, 'toren', 8, 4);
    T.zetInGebied(S, t.slijm, 'toren', 10, 4);
  },
  einde: (S) => {
    const t = S.tutorial;
    t.fase = 'einde';
    t.meester.leeftijd = 96 * 12;
    t.tonOud.soort = 'puin';
    t.tonJij.soort = 'puin';
    T.zetInGebied(S, S.held, S.wereld.gebied, t.tonJij.x - 1, t.tonJij.y);
  },
};

for (const [naam, zetKlaar] of Object.entries(SCENES)) {
  test(`de scène "${naam}" overslaan geeft dezelfde wereld als hem uitkijken`, async () => {
    const [uitgekeken, overgeslagen] = await uitkijkenEnOverslaan(zetKlaar, naam);
    assert.deepEqual(overgeslagen, uitgekeken);
  });
}

test('na het overslaan van het einde is de meester net zo dood als na het uitkijken, en het spel loopt door', async () => {
  const [, overgeslagen] = await uitkijkenEnOverslaan(SCENES.einde, 'einde');
  assert.match(overgeslagen.meester, /dood$/);
  assert.equal(overgeslagen.meesterLeeftijd, T.EINDLEEFTIJD);
  assert.equal(overgeslagen.fase, 'klaar');
  assert.equal(overgeslagen.modus, 'verkennen');
  assert.equal(overgeslagen.heldLeeftijd, T.STARTLEEFTIJD);
});
