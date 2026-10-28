// De veldheer (vraag 187 en 188, stap 3a3; js/veldheer.js; ontwerp/scenario.md, 7 en 8): de AI van een leger. Hij weet
// alleen wat zijn mannen zien en waar de stroken liggen (Marcel, 28 okt: "1. A"), rukt meteen op ("2. Oke"), en geeft
// opdrachten zoals een klik.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

const slag = (legers, zaad = 1) => {
  const S = T.proefdorp.begin(T.proefdorp.zaad, T.veldslagLevel({ kaart: 'ford', zaad, legers, minuten: 10 }));
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen' }, T.schermVelden());
  S.kalender.snelheid = 1;
  return S;
};
const tot = (S, seconden, stop = () => false) => {
  const eind = S.wereldTijd + seconden;
  while (S.wereldTijd < eind && !stop()) T.wereldTik(S);
};
const twee = { soorten: { speerman: 4, boogschutter: 2 } };
// Zonder scherm, en met de opdrachten die gegeven worden (T.geefOpdracht, js/tik.js) in `gegeven`.
const gegeven = [];
const stil = (f) => {
  const ui = T.ui;
  const geef = T.geefOpdracht;
  T.ui = new Proxy({}, { get: () => () => undefined });
  T.geefOpdracht = (S, o) => {
    gegeven.push(o);
    return geef(S, o);
  };
  gegeven.length = 0;
  try {
    return f();
  } finally {
    T.ui = ui;
    T.geefOpdracht = geef;
  }
};

test('zonder keus speel jij het eerste leger, en heeft het andere een veldheer', () => {
  const L = T.veldslagLevel({ kaart: 'ford', zaad: 1, legers: [twee, twee] });
  assert.deepEqual(L.veldslag.legers.map((l) => l.veldheer), [false, true]);
  const S = stil(() => slag(L.veldslag.legers));
  assert.equal(S.dorpen[0].veldheer, undefined);
  assert.ok(S.dorpen[1].veldheer, 'de vijand heeft een veldheer');
});

test('de veldheer geeft opdrachten zoals een klik, en gaat naar wat hij weet, niet naar wat hij niet ziet', () => {
  stil(() => {
    const S = slag([twee, twee]);
    const [A, B] = S.dorpen;
    // jouw leger staat ergens anders, ver uit zijn zicht
    const R = T.eilandVan(S.wereld.eiland).recept;
    const [hx, hy] = R.naarTegel(0, -0.85).map(Math.round); // de bovenste punt van het land
    for (const e of T.legerVan(A)) Object.assign(e, { x: hx, y: hy, tx: hx, ty: hy, pad: [], onderweg: false });
    delete A.aanvoerder.tocht;
    for (const e of T.militieVan(A)) e.post = { x: hx, y: hy };
    tot(S, 1);
    const bevel = gegeven.find((o) => o.dorp === 1);
    assert.equal(bevel && bevel.soort, 'stuur', 'een opdracht van het andere leger, zoals een klik');
    assert.deepEqual([...bevel.wie].sort(), T.nummersVan(B, T.militieVan(B)).sort(), 'al zijn soldaten');
    // zijn mannen gaan naar jouw strook (die kent hij), niet naar waar je staat
    const strook = R.naarTegel((R.stroken[0].a[0] + R.stroken[0].a[1]) / 2, (R.stroken[0].b[0] + R.stroken[0].b[1]) / 2);
    const post = T.militieVan(B)[0].post;
    assert.equal(B.veldheer.laatst, null, 'hij zag niemand');
    assert.ok(T.afstand(post, { x: strook[0], y: strook[1] }) < T.afstand(post, { x: hx, y: hy }), `naar je strook: ${JSON.stringify(post)}`);
  });
});

test('twee veldheren vechten tot het eind, en hetzelfde zaad geeft dezelfde slag', () => {
  stil(() => {
    const uitslag = (zaad) => {
      const S = slag([{ ...twee, veldheer: true }, { ...twee, veldheer: true }], zaad);
      tot(S, 300, () => !!S.dorp.einde);
      return { einde: S.dorp.einde && S.dorp.einde.kop, tijd: Math.round(S.wereldTijd), over: S.dorpen.map((D) => T.legerVan(D).length) };
    };
    const a = uitslag(1);
    assert.ok(a.einde && a.einde !== 'A draw', `een winnaar: ${JSON.stringify(a)}`);
    assert.ok(a.tijd < 200, `binnen de tijd: ${a.tijd} seconden`);
    assert.deepEqual(uitslag(1), a, 'hetzelfde zaad, dezelfde slag');
  });
});

test('is de held de laatste, dan vecht hij zelf: twee helden wachten niet tot de tijd om is', () => {
  stil(() => {
    const S = slag([{ ...twee, veldheer: true }, { ...twee, veldheer: true }]);
    for (const D of S.dorpen) for (const e of T.militieVan(D)) e.dood = true;
    tot(S, 3);
    const [A, B] = S.dorpen;
    for (const [i, D] of S.dorpen.entries()) {
      const held = D.bewoners.mensen.find((p) => p.aanvoerder).id;
      assert.ok(gegeven.some((o) => o.dorp === i && o.wie.length === 1 && o.wie[0] === held), `de held van leger ${i + 1} krijgt een bevel`);
    }
    tot(S, 300, () => !!S.dorp.einde);
    assert.ok(S.dorp.einde, 'het is uit');
    assert.ok(T.legerVan(A).length + T.legerVan(B).length <= 1, 'een van de helden viel');
  });
});

// Wat de veldheer koopt (3b; Marcel, 28 okt: "2 b"): een van drie mixen uit het zaad, voor zijn punten, en de prijs van
// een soldaat is de waarde van zijn stukken (de militie 1, B1).
test('de prijs van een soldaat is de waarde van zijn stukken, en de militie kost 1', () => {
  assert.equal(T.soldaatPrijs('militie'), 1);
  assert.equal(T.soldaatPrijs('speerman'), 4);
  assert.equal(T.soldaatPrijs('boogschutter'), 2);
  assert.equal(T.soldaatPrijs('zwaardvechter'), 7);
});

test('de veldheer koopt een van drie mixen uit het zaad, voor al zijn punten en niet meer, en hetzelfde lot is hetzelfde leger', () => {
  const kost = (soorten) => Object.entries(soorten).reduce((s, [soort, n]) => s + T.soldaatPrijs(soort) * n, 0);
  const mixen = new Set();
  for (const punten of [20, 40, 100, 200]) {
    for (let lot = 1; lot <= 30; lot++) {
      const k = T.veldheerKoopt(punten, lot);
      mixen.add(k.mix);
      assert.equal(kost(k.soorten), punten, `${punten} punten, lot ${lot}: ${JSON.stringify(k)}`);
      assert.deepEqual(T.veldheerKoopt(punten, lot), k, 'hetzelfde lot, hetzelfde leger');
    }
  }
  assert.deepEqual([...mixen].sort(), Object.keys(T.VELDHEER_INSTELLINGEN.mixen).sort(), 'alle drie de mixen komen voor');
});
