// De bode naar de marskramer (js/bode.js; werklijst vraag 143; Marcel, 9 okt: "soort van brief sturen met een bode", en
// "1. Alleen bij een status 2. Ja vind ik goed idee. 3. Ja, je vraagt om goederen, enkele keer heeft hij iets niet. 4. Ja
// voor nu maar mee beginnen; in de winterperiode of in het donker misschien ook bescherming mee?").
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
T.zetOptie('wieBouwt', 'jij');
T.ui = new Proxy({}, { get: () => () => undefined });
// T.optiesTerug zet nieuwe blokken neer: lees de instellingen dus elke keer opnieuw.
const B = new Proxy({}, { get: (_, k) => T.BODE_INSTELLINGEN[k], set: (_, k, v) => ((T.BODE_INSTELLINGEN[k] = v), true) });

function dagVan(maand, dagVanMaand) {
  for (let d = 0; d < T.DAGEN_PER_JAAR; d++) {
    const x = T.datumVanDag(d);
    if (T.MAANDEN[x.maand].naam === maand && x.dagVanMaand === dagVanMaand) return d;
  }
  throw new Error(maand);
}

// Het ontworpen gehucht, met de kalender op `dag`, stil.
function gehucht(dag) {
  const echt = console.warn;
  const toeval = Math.random;
  let n = 11;
  console.warn = () => {};
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  const S = { kalender: T.nieuweKalender() };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
    Math.random = toeval;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  T.S = S;
  S.kalender.dag = dag;
  T.zetVoorraad(S.dorp, 'goud', 50);
  return S;
}

test('zonder moeilijke tijd stuur je geen bode; met honger wel', () => {
  const S = gehucht(dagVan('zomermaand', 5));
  const D = S.dorp;
  const zonder = T.kanBodeSturen(D);
  assert.equal(zonder.kan, false);
  assert.equal(zonder.zichtbaar, false, 'de knop staat er niet');
  T.zetWet(D, 'rantsoen', 'krap'); // honger
  const met = T.kanBodeSturen(D);
  assert.ok(met.kan, met.reden);
  assert.equal(met.status.id, 'honger');
  assert.equal(met.dagen, B.dagen.gewoon);
});

test('de bode brengt de brief, en de marskramer komt met wat je vroeg, duurder dan anders', () => metGevaar(0, 0, () => {
  const nietBijZich = B.nietBijZich;
  const halfBijZich = B.halfBijZich;
  B.nietBijZich = 0;
  B.halfBijZich = 0;
  try {
    const dag = dagVan('zomermaand', 5);
    const S = gehucht(dag);
    const D = S.dorp;
    T.zetWet(D, 'rantsoen', 'krap');
    assert.equal(T.stuurBode(D, {}).kan, false, 'een lege brief stuur je niet');
    const goud = D.voorraad.goud;
    const r = T.stuurBode(D, { graan: 3, zout: 0 });
    assert.ok(r.kan, r.reden);
    assert.ok(Math.abs(D.voorraad.goud - (goud - B.loon)) < 1e-9, 'de bode krijgt zijn loon uit de kas');
    assert.equal(r.bode.weg.waarom, 'bode', 'hij is de weg op');
    assert.equal(T.kanBodeSturen(D).kan, false, 'één bode tegelijk');
    T.tikBodeDag(D, dag + 1);
    assert.ok(!D.marskramer, 'nog onderweg');
    T.tikBodeDag(D, r.komt);
    const m = D.marskramer;
    assert.ok(m && m.bestelling, 'de marskramer is er, op bestelling');
    assert.deepEqual(T.verkooptNu(D), ['graan']);
    assert.equal(m.heeft.graan, 3);
    assert.equal(m.bestelling.graan.prijs, Math.ceil(B.waren.graan.prijs * B.prijsMaal.gewoon));
    assert.equal(r.bode.weg, undefined, 'de bode is terug');
    const graan = D.voorraad.graan;
    const k = T.koop(D, 'graan', 2);
    assert.ok(k.kan, k.reden);
    assert.equal(D.voorraad.graan, graan + 2 * B.waren.graan.per);
    assert.equal(T.prijsVanHetJaar(D, 'graan', 'verkoopt'), 'duur');
  } finally {
    B.nietBijZich = nietBijZich;
    B.halfBijZich = halfBijZich;
  }
}));

test('soms heeft hij iets niet, of maar de helft', () => metGevaar(0, 0, () => {
  const nietBijZich = B.nietBijZich;
  B.nietBijZich = 1;
  try {
    const dag = dagVan('zomermaand', 5);
    const S = gehucht(dag);
    const D = S.dorp;
    T.zetWet(D, 'rantsoen', 'krap');
    const r = T.stuurBode(D, { graan: 2, ijzer: 4 });
    T.tikBodeDag(D, r.komt);
    assert.deepEqual(T.verkooptNu(D), [], 'hij had niets van wat je vroeg');
  } finally {
    B.nietBijZich = nietBijZich;
  }
}));

// Zet het gevaar onderweg vast, voor een toets.
function metGevaar(rovers, heer, doe) {
  const R = { ...B.rovers };
  const H = { ...B.heer };
  Object.assign(B.rovers, { basis: rovers, perRover: 0, winter: 1, donker: 1, hooguit: 1 });
  Object.assign(B.heer, { basis: heer, perArgwaan: 0 });
  try {
    return doe();
  } finally {
    Object.assign(B.rovers, R);
    Object.assign(B.heer, H);
  }
}

test('in de winter duurt het langer en kost het meer', () => {
  metGevaar(0, 0, () => {
    const dag = dagVan('louwmaand', 5);
    const S = gehucht(dag);
    const D = S.dorp;
    T.zetWet(D, 'rantsoen', 'krap');
    const k = T.kanBodeSturen(D);
    assert.ok(k.winter);
    assert.equal(k.dagen, B.dagen.winter);
    const r = T.stuurBode(D, { graan: 2 });
    assert.ok(r.kan, r.reden);
    T.tikBodeDag(D, r.komt);
    assert.ok(D.marskramer && D.marskramer.bestelling);
    assert.equal(D.marskramer.bestelling.graan.prijs, Math.ceil(B.waren.graan.prijs * B.prijsMaal.winter));
  });
});

test('rovers onderscheppen de bode: zonder mannen erbij is alles weg, en hij is gewond of dood', () => {
  metGevaar(1, 0, () => {
    const dag = dagVan('zomermaand', 5);
    const S = gehucht(dag);
    const D = S.dorp;
    T.zetWet(D, 'rantsoen', 'krap');
    const kracht = B.kracht.bode;
    B.kracht.bode = 0; // alleen kan hij ze niet afslaan
    try {
      const mensen = D.bevolking;
      const r = T.stuurBode(D, { graan: 2 });
      assert.ok(r.kan, r.reden);
      assert.equal(D.bode.onderschept, 'rovers');
      T.tikBodeDag(D, r.komt);
      assert.ok(!D.marskramer, 'geen marskramer');
      assert.equal(D.bode, null);
      const bode = r.bode;
      const dood = !D.bewoners.mensen.includes(bode);
      assert.ok(dood ? D.bevolking === mensen - 1 : bode.gewond && T.blijftThuis(bode, r.komt + 1), 'gewond of dood');
    } finally {
      B.kracht.bode = kracht;
    }
  });
});

test('met mannen erbij slaan ze de rovers af: de marskramer komt, en er kan er een sneuvelen', () => {
  metGevaar(1, 0, () => {
    const dag = dagVan('zomermaand', 5);
    const S = gehucht(dag);
    const D = S.dorp;
    T.zetWet(D, 'rantsoen', 'krap');
    const A = { ...B.afgeslagen };
    Object.assign(B.afgeslagen, { dood: 1, gewond: 0, roverDood: 1 });
    const K = { ...B.kracht };
    B.kracht.man = 1000; // ze winnen zeker
    D.rovers = T.nieuweRovers();
    D.rovers.bende = [{ id: 999, naam: 'Gijs' }, { id: 998, naam: 'Kobus' }];
    try {
      const weerbaar = T.weerbareMannen(D).length;
      assert.ok(weerbaar >= 3, `${weerbaar} weerbare mannen`);
      assert.match(T.bodeGevaarTekst(D, 2), /slaan ze de rovers in \d+ van de 100 keer af/);
      const goud = D.voorraad.goud;
      const r = T.stuurBode(D, { graan: 2 }, 2);
      assert.ok(r.kan, r.reden);
      assert.equal(r.begeleiders.length, 2);
      assert.ok(Math.abs(D.voorraad.goud - (goud - 3 * B.loon)) < 1e-9, 'drie lonen');
      const mensen = D.bevolking;
      T.tikBodeDag(D, r.komt);
      assert.ok(D.marskramer && D.marskramer.bestelling, 'ze sloegen ze af: de marskramer komt');
      assert.equal(D.bevolking, mensen - 2, 'de twee mannen sneuvelden (dood op 1)');
      assert.ok(D.bewoners.mensen.includes(r.bode), 'de bode zelf vocht niet');
      assert.equal(D.rovers.bende.length, 1, 'een rover van de bende sneuvelde');
    } finally {
      Object.assign(B.afgeslagen, A);
      Object.assign(B.kracht, K);
    }
  });
});

test('de mannen van de heer nemen de brief mee: geen marskramer, en de heer weet het', () => {
  metGevaar(0, 1, () => {
    const dag = dagVan('zomermaand', 5);
    const S = gehucht(dag);
    const D = S.dorp;
    T.zetWet(D, 'rantsoen', 'krap');
    D.inner = D.inner || T.nieuweInner();
    const argwaan = D.inner.argwaan;
    const gunst = T.bazenNu(D).gunst;
    const r = T.stuurBode(D, { graan: 2 }, 1);
    assert.equal(D.bode.onderschept, 'heer');
    T.tikBodeDag(D, r.komt);
    assert.ok(!D.marskramer);
    assert.ok(D.inner.argwaan > argwaan, 'de argwaan gaat omhoog');
    assert.ok(T.bazenNu(D).gunst < gunst, 'de gunst omlaag');
    assert.ok(D.bewoners.mensen.includes(r.bode) && !r.bode.gewond, 'niemand gewond');
  });
});

test('het gevaar groeit met de bende, de winter en het donker', () => {
  const S = gehucht(dagVan('zomermaand', 5));
  const D = S.dorp;
  const leeg = T.bodeGevaar(D, false, false).rovers;
  D.rovers = T.nieuweRovers();
  D.rovers.bende = [{ id: 1 }, { id: 2 }, { id: 3 }];
  const bende = T.bodeGevaar(D, false, false).rovers;
  assert.ok(bende > leeg);
  assert.ok(T.bodeGevaar(D, true, true).rovers > bende);
  assert.ok(T.bodeGevaar(D, true, true).rovers <= B.rovers.hooguit);
});

test('met de spelregel "De bode" op Nee kan het niet', () => {
  T.zetOptie('bode', 'uit');
  try {
    const S = gehucht(dagVan('zomermaand', 5));
    T.zetWet(S.dorp, 'rantsoen', 'krap');
    assert.equal(T.kanBodeSturen(S.dorp).kan, false);
  } finally {
    T.optiesTerug();
    T.zetOptie('wieBouwt', 'jij');
  }
});

test('valt de vaste ronde op een dag dat hij op bestelling er nog is, dan komt die ronde na hem (Marcel: "optie 1")', () => {
  const nietBijZich = B.nietBijZich;
  B.nietBijZich = 0;
  try {
    const begin = dagVan('hooimaand', 3);
    const S = gehucht(begin);
    const D = S.dorp;
    T.marskramerOpBestelling(D, { graan: 2 }, begin, false);
    assert.ok(D.marskramer.bestelling);
    let dag = begin + 1;
    for (; D.marskramer && D.marskramer.bestelling; dag++) T.tikHandelDag(D, dag);
    const m = D.marskramer;
    assert.ok(m && !m.bestelling, 'zijn vaste ronde is er, op de dag dat de bestelde ging');
    assert.equal(m.bezoek, 1, 'de ronde van de zomer');
    assert.ok(dag - 1 > dagVan('hooimaand', 5), 'later dan anders');
    assert.equal(D.marskramerDaarna, undefined);
  } finally {
    B.nietBijZich = nietBijZich;
  }
});

test('de hinderlaag op je kaart: bij de uitgang houden de rovers hem aan, en komt de schout niet, dan loopt het af', () => {
  const opDeKaart = B.opDeKaart;
  B.opDeKaart = 1;
  try {
    metGevaar(1, 0, () => {
      const dag = dagVan('zomermaand', 5);
      const S = gehucht(dag + 0.5);
      const D = S.dorp;
      T.zetWet(D, 'rantsoen', 'krap');
      const r = T.stuurBode(D, { graan: 2 }, 1);
      assert.ok(r.kan, r.reden);
      assert.ok(D.bode.hinderlaag, 'op de kaart');
      assert.equal(D.rovers.aanval.soort, 'hinderlaag');
      const bode = r.bode.wezen;
      assert.ok(bode, 'de bode loopt op de kaart');
      // Ver van de uitgang wachten ze nog.
      T.werkRoversBij(S, D);
      const uitgang = T.wegInEnUit(D.wereld);
      if (T.afstand(uitgang, { x: bode.tx, y: bode.ty }) > B.hinderlaag.afstand) assert.equal(D.rovers.aanval.fase, 'wacht');
      // Bij de uitgang staan ze er.
      for (const e of [bode, r.begeleiders[0].wezen]) {
        e.pad = [];
        e.onderweg = null;
        e.tx = e.x = uitgang.x;
        e.ty = e.y = uitgang.y - 3;
      }
      T.werkRoversBij(S, D);
      const A = D.rovers.aanval;
      assert.equal(A.fase, 'roven');
      assert.ok(A.rovers.length >= B.rovers.aanvallers, 'de rovers staan op de kaart');
      assert.ok(bode.aangehouden, 'de bode staat stil');
      assert.ok(r.begeleiders[0].wezen.opgeroepen, 'wie meegaat, vecht aan jouw kant');
      assert.deepEqual(T.dagAnker(D, bode), { x: bode.aangehouden.x, y: bode.aangehouden.y, straal: 0 });
      // De tijd is om, en de schout kwam niet: het lot beslist.
      S.kalender.dag += (B.hinderlaag.uren + 0.1) / 24;
      T.werkRoversBij(S, D);
      assert.equal(D.rovers.aanval && D.rovers.aanval.fase, 'weg', 'ze gaan weg');
      assert.ok(!bode.aangehouden);
      assert.ok(!D.bode || !D.bode.onderschept, 'beroofd (geen bode meer) of afgeslagen (de weg is vrij)');
      if (D.bode) assert.match(D.bode.aanval, /sloegen ze af/);
    });
  } finally {
    B.opDeKaart = opDeKaart;
  }
});

test('de schout verslaat de rovers van de hinderlaag: de bode gaat verder', () => {
  const opDeKaart = B.opDeKaart;
  B.opDeKaart = 1;
  try {
    metGevaar(1, 0, () => {
      const dag = dagVan('zomermaand', 5);
      const S = gehucht(dag + 0.5);
      const D = S.dorp;
      T.zetWet(D, 'rantsoen', 'krap');
      const r = T.stuurBode(D, { graan: 2 });
      const bode = r.bode.wezen;
      const uitgang = T.wegInEnUit(D.wereld);
      bode.pad = [];
      bode.onderweg = null;
      bode.tx = bode.x = uitgang.x;
      bode.ty = bode.y = uitgang.y - 3;
      T.werkRoversBij(S, D);
      const A = D.rovers.aanval;
      for (const e of A.rovers) e.dood = true; // het gevecht in beurten
      T.naGevecht(D);
      assert.equal(D.rovers.aanval, null);
      assert.ok(D.bode && !D.bode.onderschept && !D.bode.hinderlaag);
      assert.ok(!bode.aangehouden);
      T.tikBodeDag(D, D.bode.komt);
      assert.ok(D.marskramer && D.marskramer.bestelling, 'de marskramer komt');
    });
  } finally {
    B.opDeKaart = opDeKaart;
  }
});
