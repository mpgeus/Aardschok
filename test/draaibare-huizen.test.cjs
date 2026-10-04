// De draaibare huizen (werklijst vraag 124, B; Marcel, 4 okt: "124b Ja dan", en "A ja ... B ja C ja"): een huis van een
// stijl is één huis rondom (gereedschap/pixelart/huis-sdf.cjs, rondom), en zijn vier standen zijn dat huis een kwartslag
// gedraaid (huizen.cjs, STANDEN), getekend door de camera, de zon en het randlicht om het huis te draaien (tekenWereld met
// o.draai in toren.cjs). Deze toetsen kijken naar de bouwer, de tekenaar en het meten zelf, zonder een heel huis te
// renderen; de tekeningen in tegels/ bewaken huizen.test.cjs en bouwstijl.test.cjs.
const test = require('node:test');
const assert = require('node:assert/strict');

const K = require('../gereedschap/pixelart/kern.cjs');
const Tr = require('../gereedschap/pixelart/toren.cjs');
const HS = require('../gereedschap/pixelart/huis-sdf.cjs');
const HZ = require('../gereedschap/pixelart/huizen.cjs');

const STANDEN = ['z', 'o', 'n', 'w'];
// de vormen van de stijl wit, elk met een dak dat hij krijgt
const VORMEN = (() => {
  const S = HZ.STIJLEN.wit;
  return [...S.hut.map((v) => [v, S.dak]), ...S.huis.map((v) => [v, S.dak]), ...S.huis.map((v) => [v.replace('huis', 'steen'), 'leien']), ...S.boerderij.map((v) => [v, S.dak])];
})();
const opgave = (vorm, dak, stand) => HZ.HUIZEN[HZ.stijlNaam('wit', vorm, dak, stand)];
const zijdeVan = (P) => `${P.zijde}${P.kant > 0 ? '+' : '-'}`;

test('de vier standen van een stijl zijn hetzelfde huis: alleen de draai verschilt', () => {
  for (const [vorm, dak] of VORMEN) {
    const z = opgave(vorm, dak, 'z');
    assert.ok(z.rondom, `${vorm}: niet rondom`);
    STANDEN.forEach((stand, k) => {
      const o = opgave(vorm, dak, stand);
      assert.equal(o.draai, k, `${vorm} ${stand}: draai ${o.draai}`);
      const { draai, stijl, ...rest } = o;
      const { draai: d0, stijl: s0, ...rest0 } = z;
      assert.deepEqual(rest, rest0, `${vorm} ${stand}: een ander huis dan zuid`);
      assert.deepEqual({ ...stijl, stand: 'z' }, s0);
    });
  }
});

test('rondom heeft de achterkant en beide gevels ramen, en wat de voorkant heeft', () => {
  for (const [vorm, dak] of VORMEN) {
    const o = opgave(vorm, dak, 'z');
    const H = HS.maten(o.zaad, o);
    // de vier muren van de hoofdvleugel, en wat erin zit
    const kanten = {};
    for (const P of H.stukken.filter((P) => !P.U && P.V.i === 0)) kanten[zijdeVan(P)] = (kanten[zijdeVan(P)] || 0) + P.openingen.length;
    for (const k of ['q-', 'a+', 'a-']) assert.ok(kanten[k] > 0, `${vorm}: niets in de muur ${k} van de hoofdvleugel (${JSON.stringify(kanten)})`);
    // vakwerk wordt getekend op elk stuk dat je van een kant ziet: elk stuk van de hoofdvleugel moet dus zicht hebben
    for (const P of H.stukken.filter((P) => !P.U && P.V.i === 0 && P.s === 0)) assert.ok(P.zicht > 0.3, `${vorm}: muur ${zijdeVan(P)} zie je van geen kant`);
    // luiken aan de ramen achter, als het huis luiken heeft
    if (H.uitbouw.luiken) assert.ok(H.openingen.some((op) => op.raam?.luiken && op.P.kant < 0), `${vorm}: geen luiken achter`);
  }
});

test('de voordeur staat voor, en je ziet hem van zuid en van oost', () => {
  // In de binnenhoek van een T of een L met de vleugel naar voren zie je de muur maar van één kant: dan komt de deur in de
  // gevel van die vleugel, die je van allebei ziet.
  for (const [vorm, dak] of VORMEN) {
    const o = opgave(vorm, dak, 'z');
    const H = HS.maten(o.zaad, o);
    assert.ok(H.deur, `${vorm}: geen voordeur`);
    const P = H.deur.P;
    assert.equal(P.kant, 1, `${vorm}: de deur zit achter`);
    assert.ok(P.N[1] > 0.9, `${vorm}: de deur kijkt niet naar zuid (${P.N})`);
    assert.ok(Math.min(P.zichtPer[0], P.zichtPer[1]) >= 0.6, `${vorm}: de deur zie je niet van zuid en van oost (${P.zichtPer})`);
  }
  // de L en de T: in de gevel van de vleugel
  for (const vorm of ['hut4', 'huis6']) {
    const o = opgave(vorm, 'riet', 'z');
    assert.equal(HS.maten(o.zaad, o).deur.P.V.i, 1, `${vorm}: de deur zit niet in de vleugel`);
  }
});

test('zonder rondom bouwt de bouwer zoals altijd: alleen de muren naar de kijker', () => {
  for (const naam of ['huis3', 'huis6', 'boerderij4', 'herberg1']) {
    const o = HZ.HUIZEN[naam];
    const H = HS.maten(o.zaad, o);
    assert.ok(!H.rondom);
    assert.ok(H.stukken.every((P) => P.kant === 1), `${naam}: een muur achter`);
  }
});

// Een kleine wereld die niet symmetrisch is: een doos opzij en een bol erop, zonder patroon.
function kleineWereld(draai) {
  const W = new Tr.Wereld();
  W.mat = { a: { ramp: 'veldsteen', lo: 1, hi: 6 }, b: { ramp: 'stro', lo: 1, hi: 5 } };
  const [dx, dy] = Tr.draaiNaar(draai, [18, -9]);
  const [bx, by] = Tr.draaiNaar(draai, [30, 6]);
  const [hx, hy] = draai % 2 ? [14, 26] : [26, 14];
  Tr.voeg(W.groep('doos'), { f: (x, y, z) => K.sdf.doos(x - dx, y - dy, z - 20, hx, hy, 20, 1), g: [dx, dy, 20, 40], m: 'a', deel: 1 });
  Tr.voeg(W.groep('bol'), { f: (x, y, z) => K.sdf.bol(x - bx, y - by, z - 48, 9), g: [bx, by, 48, 10], m: 'b', deel: 2 });
  return W;
}
const beeld = (W, draai) => {
  const B = new K.Beeld(160, 140, 80, 100);
  Tr.tekenWereld(B, W, draai === undefined ? {} : { draai });
  return B;
};

test('tekenWereld een kwartslag gedraaid is de wereld zelf een kwartslag gedraaid, met de zon op dezelfde plek', () => {
  const nul = beeld(kleineWereld(0), 0);
  assert.deepEqual(nul.ramp, beeld(kleineWereld(0)).ramp, 'met draai 0 precies zoals zonder');
  assert.deepEqual(nul.stap, beeld(kleineWereld(0)).stap);
  for (const k of [1, 2, 3]) {
    const gedraaid = beeld(kleineWereld(0), k);
    const zelf = beeld(kleineWereld(k), 0);
    assert.ok(gedraaid.ramp.some((r) => r >= 0), 'er staat iets in beeld');
    assert.deepEqual(gedraaid.ramp, zelf.ramp, `draai ${k}: een ander beeld`);
    for (let i = 0; i < zelf.stap.length; i++) assert.ok(Math.abs(gedraaid.stap[i] - zelf.stap[i]) < 1e-9, `draai ${k}: ander licht op pixel ${i}`);
    // wat in het beeld komt, staat gedraaid: de plek van elke pixel is die van de gedraaide wereld
    for (let i = 0; i < zelf.ramp.length; i++) {
      if (zelf.ramp[i] < 0) continue;
      for (let c = 0; c < 3; c++) assert.ok(Math.abs(gedraaid.pos[i * 3 + c] - zelf.pos[i * 3 + c]) < 1e-6, `draai ${k}: pixel ${i} ligt ergens anders`);
    }
  }
});

test('de voet en de deur van een stand zijn die van zuid, een kwartslag gedraaid', () => {
  const draaiTegel = (k, [b, d], [dx, dy]) => {
    // het midden van de deurtegel ten opzichte van het midden van de voet, gedraaid, en terug in de nieuwe voet
    const p = Tr.draaiNaar(k, [dx + 0.5 - b / 2, dy + 0.5 - d / 2]);
    const [bk, dk] = k % 2 ? [d, b] : [b, d];
    return [Math.floor(p[0] + bk / 2), Math.floor(p[1] + dk / 2)];
  };
  for (const vorm of ['hut4', 'huis6']) {
    const o = opgave(vorm, 'riet', 'z');
    const W = HS.huis(o.zaad, o);
    const zuid = HZ.meetHuis(W, 0);
    // de deur van zuid ligt aan de zuidkant, net buiten de voet
    assert.equal(zuid.deur[1], zuid.voet[1], `${vorm}: de deur van zuid ligt niet aan de zuidkant`);
    for (const k of [1, 2, 3]) {
      const m = HZ.meetHuis(W, k);
      assert.deepEqual(m.voet, k % 2 ? [zuid.voet[1], zuid.voet[0]] : zuid.voet, `${vorm} draai ${k}: de voet`);
      assert.deepEqual(m.deur, draaiTegel(k, zuid.voet, zuid.deur), `${vorm} draai ${k}: de deur`);
    }
  }
});
