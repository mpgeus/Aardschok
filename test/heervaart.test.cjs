// De heervaart (js/heervaart.js; werklijst vraag 60, Marcel, 29 sep: "A ja B ja"): in een dorp vraagt de heer op
// 1 hooimaand mannen voor zijn oorlog, of goud. Wie gaat, is terug op 1 herfstmaand, niet allemaal, en wie terugkomt,
// is veteraan en vecht mee als er rovers komen.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp } = require('./grond.cjs');

const berichten = [];
const brieven = [];
T.ui = new Proxy({}, {
  get: (_, naam) => (naam === 'bericht' ? (t) => berichten.push(t) : naam === 'toonBrief' ? (S, soort) => brieven.push(soort) : () => {}),
});
T.anim = { tekst() {}, wacht: () => new Promise(() => {}), loop: () => new Promise(() => {}), uitval: () => new Promise(() => {}) };

// Het proefdorp (test/grond.cjs): zeventien mensen, twee boerderijen en hutten. Met een vast zaad voor het dorp (het kiest
// de oorlog van de heer), stil. Wie er woont, zegt hoeveel weerbare mannen er zijn.
function gehucht() {
  const S = proefDorp(T).S;
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set() });
  S.dorp.lot = Object.assign(S.dorp.lot || {}, { zaad: 7 });
  return S;
}

// Dag 0 is 1 lentemaand van het eerste jaar; zo ver liggen 1 hooimaand en 1 herfstmaand ervan af.
const HOOIMAAND = 4 * T.DAGEN_PER_MAAND;
const HERFSTMAAND = 6 * T.DAGEN_PER_MAAND;
const opDag = (S, dag) => {
  S.kalender.dag = dag;
};

// Een dorp op de ochtend van 1 hooimaand, met de brief van de heer.
function dorpMetBrief() {
  const S = gehucht();
  S.dorp.trede = 'dorp';
  opDag(S, HOOIMAAND);
  T.tikHeervaartDag(S.dorp, HOOIMAAND);
  assert.ok(S.dorp.heervaart && S.dorp.heervaart.vraag, 'de heer vraagt mannen');
  return S;
}

// Wie weg is, haalt de uitgang: zijn poppetje gaat van de kaart (T.werkBewonersBij), zoals na een paar uur lopen.
function naarDeUitgang(S) {
  for (const e of S.dorp.bewoners.vertrekken) {
    e.x = e.tx = e.vertrekt.x;
    e.y = e.ty = e.vertrekt.y;
    e.onderweg = false;
  }
  T.werkBewonersBij(S.dorp);
}

// Zet een instelling even anders, voor één toets.
function met(instellingen, fn) {
  const oud = { ...T.HEERVAART_INSTELLINGEN };
  Object.assign(T.HEERVAART_INSTELLINGEN, instellingen);
  try {
    return fn();
  } finally {
    Object.assign(T.HEERVAART_INSTELLINGEN, oud);
  }
}

test('in een gehucht vraagt de heer geen mannen, in een dorp wel: op 1 hooimaand, een per tien zielen', () => {
  const S = gehucht();
  opDag(S, HOOIMAAND);
  T.tikHeervaartDag(S.dorp, HOOIMAAND);
  assert.equal(S.dorp.heervaart, undefined, 'de proef blijft zoals hij was');

  brieven.length = 0;
  const D = dorpMetBrief().dorp;
  const v = D.heervaart.vraag;
  assert.equal(v.mannen, Math.ceil(D.bevolking / 10));
  assert.equal(v.goud, v.mannen * T.HEERVAART_INSTELLINGEN.goudPerMan);
  // Het lot van de boeren zegt wie er woont: soms zijn er minder weerbare mannen dan hij vraagt. Dan gaat wie er is.
  assert.equal(v.wie.length, Math.min(v.mannen, T.weerbareMannen(D).length));
  assert.ok(v.wie.length > 0);
  assert.deepEqual(brieven, ['heervaart'], 'zijn brief gaat open');
  assert.ok(T.HEERVAART_INSTELLINGEN.oorlogen.includes(v.oorlog));
  // Een dag later vraagt hij niet nog eens.
  T.tikHeervaartDag(D, HOOIMAAND + 1);
  assert.equal(D.heervaart.vraag, v);
});

test('wie gaat: mannen, jong of volwassen, nooit een boer of het gezin van de schout, wie geen werk heeft het eerst', () => {
  const S = gehucht();
  const alle = T.weerbareMannen(S.dorp);
  assert.ok(alle.length >= 2, 'het gehucht heeft weerbare mannen');
  for (const p of alle) {
    assert.equal(p.geslacht, 'man');
    assert.ok(p.leeftijd === 'jong' || p.leeftijd === 'volwassen', p.leeftijd);
    assert.ok(!p.schout && !(p.hoofd && p.hoofd.schout), `${p.naam} is van het gezin van de schout`);
  }
  assert.ok(alle.some((p) => T.isBoer(S.dorp, p)), 'een boer is weerbaar: hij helpt tegen de wolven en vecht mee');
  const eersteMetWerk = alle.findIndex((p) => p.werk);
  if (eersteMetWerk >= 0) assert.ok(alle.slice(eersteMetWerk).every((p) => p.werk), 'wie geen werk heeft, staat vooraan');
  // naar de heervaart gaat een boer nooit: zijn boerderij lag dan een half jaar stil
  const vraag = T.vraagHeervaart(S.dorp, Math.floor(S.kalender.dag));
  assert.ok(vraag.wie.length > 0 && vraag.wie.every((p) => !T.isBoer(S.dorp, p)), 'geen boer naar de heervaart');
});

test('sturen: ze lopen de weg af, tellen mee en eten, maar werken nergens, tot 1 herfstmaand', () => {
  const S = dorpMetBrief();
  const v = S.dorp.heervaart.vraag;
  const bevolking = S.dorp.bevolking;
  const handen = T.werkendeHanden(S.dorp);
  const stuur = T.heervaartKeuzes(S.dorp).find((k) => k.actie === 'stuur');
  assert.equal(stuur.kan, true);
  stuur.doe(S);
  assert.equal(S.dorp.heervaart.vraag, null);
  const wie = S.dorp.heervaart.tocht.wie;
  assert.equal(wie.length, v.wie.length);
  assert.equal(T.datumVanDag(S.dorp.heervaart.tocht.terugOp).tekst.startsWith('1 September'), true);
  assert.equal(S.dorp.bevolking, bevolking, 'ze tellen mee: het dorp voedt ze');
  assert.equal(T.werkendeHanden(S.dorp), handen - wie.filter((p) => T.LEEFTIJDEN[p.leeftijd].werkt != null).length);
  T.verdeelHanden(S.dorp);
  for (const p of wie) {
    assert.deepEqual(p.weg, { waarom: 'heervaart' });
    assert.equal(p.werk, null, `${p.naam} werkt niet`);
    assert.ok(S.dorp.bewoners.mensen.includes(p), 'zijn plaats in huis blijft van hem');
    if (p.wezen) assert.ok(p.wezen.vertrekt, `${p.naam} loopt naar de uitgang`);
  }
  // Wie weg is, trekt niet ook nog weg.
  T.wijzigBevolking(S.dorp, -3, 'vertrek');
  for (const p of wie) assert.ok(S.dorp.bewoners.mensen.includes(p), `${p.naam} is weg, en kan dus niet wegtrekken`);
});

test('vrijkopen kost het goud en een deel van de gunst van de heer; zonder genoeg goud kan het niet', () => {
  const S = dorpMetBrief();
  const v = S.dorp.heervaart.vraag;
  S.dorp.voorraad.goud = v.goud - 1;
  const arm = T.heervaartKeuzes(S.dorp).find((k) => k.actie === 'vrijkopen');
  assert.equal(arm.kan, false);
  assert.match(arm.waarom, /costs \d+ gold, and you have \d+/);
  assert.equal(T.koopHeervaartAf(S.dorp), false);

  S.dorp.voorraad.goud = v.goud + 5;
  const gunst = S.dorp.bazen ? S.dorp.bazen.gunst : T.BAZEN_INSTELLINGEN.gunstBegin;
  const rijk = T.heervaartKeuzes(S.dorp).find((k) => k.actie === 'vrijkopen');
  assert.equal(rijk.kan, true);
  rijk.doe(S);
  assert.equal(S.dorp.voorraad.goud, 5);
  const verwacht = T.BAZEN_INSTELLINGEN.heervaart.vrijgekocht - v.goud * T.HEERVAART_INSTELLINGEN.gunstPerGoud;
  assert.ok(gunst + verwacht > 0 && gunst + verwacht < 100, 'een som die niet tegen de grenzen van de meter aan zit');
  assert.ok(Math.abs(S.dorp.bazen.gunst - (gunst + verwacht)) < 1e-9, 'de gunst daalt met gunstPerGoud per goud en stijgt met wat zijn goud waard is');
  assert.equal(S.dorp.heervaart.vraag, null);
  assert.equal(S.dorp.heervaart.tocht, null, 'niemand gaat');
  assert.ok(S.dorp.bewoners.mensen.every((p) => !p.weg));
});

test('wie niet kiest, stuurt ze: na een week haalt de heer ze op', () => {
  const S = dorpMetBrief();
  const dag = S.dorp.heervaart.vraag.uiterlijk;
  T.tikHeervaartDag(S.dorp, dag - 1);
  assert.ok(S.dorp.heervaart.vraag, 'hij wacht nog');
  berichten.length = 0;
  T.tikHeervaartDag(S.dorp, dag);
  assert.equal(S.dorp.heervaart.vraag, null);
  assert.ok(S.dorp.heervaart.tocht && S.dorp.heervaart.tocht.wie.length);
  assert.equal(S.dorp.heervaart.laatste.antwoord, 'gehaald');
  assert.ok(berichten.some((b) => /did not answer the lord/.test(b)));
});

test('op 1 herfstmaand komen ze terug als veteraan, over de weg; wie sneuvelde, is een mond minder', () => {
  // Iedereen terug.
  met({ kansNietTerug: 0 }, () => {
    const S = dorpMetBrief();
    T.stuurHeervaart(S.dorp, 'gestuurd');
    naarDeUitgang(S);
    const wie = S.dorp.heervaart.tocht.wie.slice();
    for (const p of wie) assert.equal(p.wezen, null, `${p.naam} is van de kaart`);
    const bevolking = S.dorp.bevolking;
    T.tikHeervaartDag(S.dorp, HERFSTMAAND - 1);
    assert.ok(S.dorp.heervaart.tocht, 'nog niet terug');
    T.tikHeervaartDag(S.dorp, HERFSTMAAND);
    assert.equal(S.dorp.heervaart.tocht, null);
    assert.equal(S.dorp.bevolking, bevolking);
    for (const p of wie) {
      assert.equal(p.weg, undefined);
      assert.equal(p.veteraan, true);
    }
    const komen = S.dorp.bewoners.komen.find((a) => wie.every((p) => a.mensen.includes(p)));
    assert.ok(komen, 'ze komen overdag over de weg binnen');
    assert.match(komen.aankomst.tekst, /The men of the levy come back/);
  });
  // Niemand terug.
  met({ kansNietTerug: 1 }, () => {
    const S = dorpMetBrief();
    T.stuurHeervaart(S.dorp, 'gestuurd');
    const wie = S.dorp.heervaart.tocht.wie.slice();
    const bevolking = S.dorp.bevolking;
    berichten.length = 0;
    T.tikHeervaartDag(S.dorp, HERFSTMAAND);
    assert.equal(S.dorp.bevolking, bevolking - wie.length);
    for (const p of wie) assert.ok(!S.dorp.bewoners.mensen.includes(p));
    assert.ok(berichten.some((b) => /None of the levy comes back/.test(b) && /fell for the lord/.test(b)));
    assert.equal(S.dorp.heervaart.laatste.gesneuveld, wie.length);
  });
});

test('een veteraan vecht mee als er rovers komen, ook zonder wachthuis, met meer leven dan een wachter', () => {
  const S = met({ kansNietTerug: 0 }, () => {
    const spel = dorpMetBrief();
    T.stuurHeervaart(spel.dorp, 'gestuurd');
    naarDeUitgang(spel);
    T.tikHeervaartDag(spel.dorp, HERFSTMAAND);
    return spel;
  });
  const veteranen = S.dorp.bewoners.mensen.filter((p) => p.veteraan);
  assert.ok(veteranen.length);
  // Ze komen overdag binnen en lopen naar huis; voor de toets staan ze er meteen.
  S.kalender.dag = HERFSTMAAND + 10 / 24;
  T.werkBewonersBij(S.dorp);
  for (const p of veteranen) {
    assert.ok(p.wezen, `${p.naam} heeft weer een poppetje`);
    delete p.komt;
  }
  assert.ok(!S.dorp.gebouwen.some((g) => g.soort === 'wachthuis'), 'er is geen wachthuis');
  S.dorp.rovers = T.nieuweRovers();
  S.dorp.rovers.aanval = { soort: 'wild', dag: Math.floor(S.kalender.dag), fase: 'wacht', aantal: 2, meteen: true };
  berichten.length = 0;
  T.werkRoversBij(S, S.dorp);
  const opgeroepen = S.wereld.wezens.filter((e) => e.opgeroepen);
  assert.equal(opgeroepen.length, veteranen.length);
  for (const e of opgeroepen) {
    assert.equal(e.kant, 'speler');
    assert.equal(e.maxLeven, T.WEZENS.veteraan.leven);
    assert.ok(T.WEZENS.veteraan.leven > T.WEZENS.wachter.leven);
  }
  assert.ok(berichten.some((b) => /The (veteran comes|veterans come) to your side/.test(b)));
});

test('met de spelregel uit vraagt de heer geen mannen, en wie al weg was, komt toch terug', () => {
  met({ aan: false }, () => {
    const S = gehucht();
    S.dorp.trede = 'dorp';
    T.tikHeervaartDag(S.dorp, HOOIMAAND);
    assert.ok(!S.dorp.heervaart || !S.dorp.heervaart.vraag);
  });
  const S = dorpMetBrief();
  T.stuurHeervaart(S.dorp, 'gestuurd');
  met({ aan: false, kansNietTerug: 0 }, () => {
    T.tikHeervaartDag(S.dorp, HERFSTMAAND);
    assert.equal(S.dorp.heervaart.tocht, null);
    assert.ok(S.dorp.bewoners.mensen.every((p) => !p.weg));
  });
});

test('opslaan houdt de vraag, wie er weg is, en de veteranen', () => {
  const S = dorpMetBrief();
  T.stuurHeervaart(S.dorp, 'gestuurd');
  const namen = S.dorp.heervaart.tocht.wie.map((p) => p.naam);
  const S2 = gehucht();
  assert.equal(T.herstelSpel(S2, T.bewaarSpel(S, { nu: 1790000000000 })).gelukt, true);
  assert.deepEqual(S2.dorp.heervaart.tocht.wie.map((p) => p.naam), namen);
  for (const p of S2.dorp.heervaart.tocht.wie) {
    assert.ok(S2.dorp.bewoners.mensen.includes(p), 'de tocht wijst naar dezelfde bewoners, geen kopieën');
    assert.deepEqual(p.weg, { waarom: 'heervaart' });
  }
});
