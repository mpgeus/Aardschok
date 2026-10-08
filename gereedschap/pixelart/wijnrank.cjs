// De wijnrank (ontwerp/werklijst.md, vraag 136 en 140; Marcel, 8 okt: "Ik wil graag meer detail, dat je de druiven ziet ...
// volle en lege ranken"): één tegel van een rij wijnstokken aan palen en draad, in vier standen, elk in drie varianten
// zodat een rij niet eentonig is:
//
//   kaal  winter: een houten paal, draad, en een kale knoestige stam met een tak langs de draad
//   blad  lente en zomer: groen blad, in lagen als een muur
//   vol   oogstmaand en wijnmaand: blad met grote donkerblauwe druiventrossen die er voor hangen
//   leeg  na het plukken: ijler blad, wat geel, en alleen de stompjes waar de trossen zaten
//
// Eén tegel is een stuk rij van 45 eenheden, over de x-as van de kaart (van linksboven naar rechtsonder in beeld): een paal
// in het midden, twee stokken op een halve tegel van elkaar, en draden die tot de rand van de tegel lopen, zodat een rij
// van meer tegels doorloopt (de stokken staan ook over de rand heen even ver uit elkaar: 22,6 eenheden). Het blad steekt
// een eind over de rand van zijn tegel, dus de cel is breder dan een tegel. De aarde en de schaduw tekent het spel zelf.
//
// Eén vel, `beelden/wijnrank.png` (`node gereedschap/pixelart/wijnrank.cjs --spel`): per stand een rij, per variant een
// kolom, en het anker is het midden van de tegel, op de grond, zoals bij het hol (hol.cjs). Het model kijkt naar 'ZW',
// zodat de rij langs de x-as van de kaart loopt en de kant met de trossen naar de kijker.
//
//   node gereedschap/pixelart/wijnrank.cjs         (de proefplaat: uit/wijnrank-proef.png)
//   node gereedschap/pixelart/wijnrank.cjs --spel  (ook beelden/wijnrank.png en zijn plek in beelden/beschrijving.*; naar-spel.cjs
//   kent hem nog niet, dus draai bij een nieuw vel hem hierna niet zonder --alleen, anders valt de ingang weg)
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const { sdf, klem, ruis3, rnd } = K;
const F = require('./figuren.cjs');

// ---------------------------------------------------------------- maten

const T = K.TEGEL; // de lengte van een stuk rij: een tegel
const PAAL = 46; // hoe hoog de paal staat
const DRADEN = [12, 27]; // de onderste twee draden, op de rij zelf; de bovenste twee hangen aan de dwarsarm
const DWARS = { z: PAAL - 5, y: 6 }; // de dwarsarm met de twee bovenste draden
const STOKKEN = [-T / 4, T / 4]; // waar de stokken staan, langs de rij
const STANDEN = ['kaal', 'blad', 'vol', 'leeg'];
const VARIANTEN = 3;
const ZADEN = [31, 47, 83];
// Het werkbeeld waarin elke cel eerst wordt gerenderd; daarna wordt het vel strak gesneden.
const WERK = [112, 104];
const WERK_ANKER = [56, 80];

// ---------------------------------------------------------------- materialen

const M = { paal: 0, draad: 1, stam: 2, tak: 3, blad: 4, druif: 5, steel: 6 };

// Het blad per stand: vers groen, na de zomer wat donkerder met hier en daar een geel blad, en na het plukken veel geel.
function bladPatroon(stand, zaad) {
  return (x, y, z) => {
    const r = ruis3(x * 0.34, y * 0.34, z * 0.34, zaad + 3);
    const n = ruis3(x * 0.9 + 7, y * 0.9, z * 0.9, zaad + 9);
    if (stand === 'blad') return r > 0.62 ? { ramp: 'gras', plus: 0.5 } : r < 0.26 ? -0.8 : 0;
    if (stand === 'vol') {
      if (r > 0.86) return { ramp: 'stro', stap: 3.2 + n * 1.4 };
      return r > 0.64 ? { ramp: 'gras', plus: 0.2 } : r < 0.28 ? -0.9 : 0;
    }
    // leeg: de meeste bladeren geel, een paar oranje, en wat groen dat nog blijft hangen
    if (r > 0.8) return { ramp: 'herfst', stap: 3 + n * 1.5 };
    if (r > 0.34) return { ramp: 'stro', stap: 2.6 + n * 2.2 + (r - 0.34) * 1.5 };
    return { ramp: 'blad', plus: -0.2 };
  };
}

const materialen = (stand, zaad) => {
  const mat = [];
  mat[M.paal] = { ramp: 'hout', lo: 1.2, hi: 5.4, patroon: (x, y, z) => (ruis3(x * 0.25, y * 0.25, z * 0.5, zaad) > 0.7 ? -0.7 : 0) };
  mat[M.draad] = { ramp: 'ijzer', lo: 1.6, hi: 5.4 };
  // de stam: oude, gegroefde schors, met korte streepjes in de lengte
  mat[M.stam] = {
    ramp: 'schors',
    lo: 1,
    hi: 5.2,
    omslag: 0.2,
    patroon: (x, y, z) => {
      const n = ruis3(x * 1.1, y * 1.1, z * 0.25, zaad + 5);
      return n > 0.66 ? 0.8 : n < 0.3 ? -0.9 : 0;
    },
  };
  mat[M.tak] = { ramp: 'schors', lo: 1.6, hi: 5.6, omslag: 0.2, patroon: (x, y, z) => (ruis3(x * 0.8, y * 0.8, z * 0.8, zaad + 6) > 0.62 ? 0.7 : 0) };
  mat[M.blad] = { ramp: 'blad', lo: stand === 'leeg' ? 1.6 : 1.4, hi: stand === 'leeg' ? 6.6 : 6.4, omslag: 0.35, patroon: bladPatroon(stand, zaad) };
  // de druif: diep blauw, met een glanspunt op elke bes en een waas (blauwgrijs) op wat naar boven kijkt
  mat[M.druif] = {
    ramp: 'gewaad',
    lo: 0.0,
    hi: 4.4,
    glans: 3.4,
    glansMacht: 34,
    omslag: 0.15,
    schaduwKracht: 0.5,
    patroon: (x, y, z, nx, ny, nz) => (nz > 0.35 ? 0.35 + nz * 0.5 : 0),
  };
  mat[M.steel] = { ramp: 'blad', lo: 1.2, hi: 4.4 };
  return mat;
};

// ---------------------------------------------------------------- bouwstenen

// Een blad: een dunne schijf (een ellipsoïde, dun in zijn eigen y), gedraaid in het vlak van de muur (alfa) en gekanteld
// (beta), zodat de bladeren elk anders naar het licht kijken in plaats van allemaal vlak naar de kijker.
function blad(c, a, h, alfa, beta, m, deel) {
  const ca = Math.cos(alfa);
  const sa = Math.sin(alfa);
  const cb = Math.cos(beta);
  const sb = Math.sin(beta);
  const dik = 1.0;
  return {
    f: (x, y, z) => {
      const dx = x - c[0];
      const dy = y - c[1];
      const dz = z - c[2];
      // eerst om z (het blad draait in het vlak van de muur), dan om x (het kantelt naar boven of onder)
      const x1 = dx * ca + dy * sa;
      const y1 = -dx * sa + dy * ca;
      const y2 = y1 * cb + dz * sb;
      const z2 = -y1 * sb + dz * cb;
      return sdf.ellipsoide(x1, y2, z2, a, dik, h);
    },
    g: [c[0], c[1], c[2], Math.max(a, h) + 1.5],
    m,
    deel,
  };
}

// Een tros: ringen van bessen die van de schouder naar de punt smaller worden, elke ring een halve stap gedraaid, met
// in het midden nog een rij bessen. Eén bes is zo'n 4 pixels breed: dichtbij zijn het echte druiven.
function tros(x, y, ztop, schaal, zaad, deel) {
  const d = [];
  const r = (k) => rnd(zaad, k);
  const ringen = [
    { n: 5, ring: 3.5, dz: 0 },
    { n: 5, ring: 3.6, dz: 3.4 },
    { n: 4, ring: 3.1, dz: 6.7 },
    { n: 3, ring: 2.4, dz: 9.8 },
    { n: 2, ring: 1.5, dz: 12.6 },
  ];
  const bes = 1.9 * schaal;
  let nr = 0;
  const kromming = (r(1) - 0.5) * 0.5; // de tros hangt iets scheef
  ringen.forEach((rg, k) => {
    for (let i = 0; i < rg.n; i++) {
      const hoek = (i / rg.n) * Math.PI * 2 + k * 0.9 + r(10 + k) * 0.6;
      const bx = x + Math.cos(hoek) * rg.ring * schaal + kromming * rg.dz * schaal;
      const by = y + Math.sin(hoek) * rg.ring * schaal * 0.9;
      const bz = ztop - rg.dz * schaal;
      d.push(F.bol([bx, by, bz], bes * (0.92 + r(20 + nr) * 0.16), M.druif, deel + (nr % 3), 1));
      nr += 1;
    }
  });
  // de middelste rij, die de tros vult, en de punt
  for (const [dz, dr] of [[1.8, 2.2], [5.1, 2.1], [8.3, 1.9], [11.2, 1.7]]) {
    d.push(F.bol([x + kromming * dz * schaal, y, ztop - dz * schaal], bes * dr / 2.2, M.druif, deel + (nr++ % 3), 1));
  }
  d.push(F.bol([x + kromming * 15 * schaal, y + 0.3, ztop - 14.8 * schaal], bes * 0.85, M.druif, deel + 1, 1));
  // de steel eraan, tot de draad
  d.push(F.capsule([x, y, ztop + 2], [x + 0.4, y - 2.2, ztop + 9], 0.6, M.steel, deel + 6));
  return d;
}

// ---------------------------------------------------------------- het model

function rank(stand, variant) {
  const zaad = ZADEN[variant] + STANDEN.indexOf(stand) * 7;
  const r = (...k) => rnd(zaad, ...k);
  const d = [];
  let deel = 1;
  // de paal met zijn dwarsarm, en de draden
  d.push(F.capsule([0, 0, 0], [0, 0, PAAL], 1.55, M.paal, deel++));
  d.push(F.capsule([0, -DWARS.y, DWARS.z], [0, DWARS.y, DWARS.z], 1.0, M.paal, deel++));
  for (const z of DRADEN) d.push(F.capsule([-T / 2, 0, z], [T / 2, 0, z], 0.45, M.draad, deel++));
  for (const y of [-DWARS.y, DWARS.y]) d.push(F.capsule([-T / 2, y, PAAL - 5], [T / 2, y, PAAL - 5], 0.45, M.draad, deel++));

  STOKKEN.forEach((x0, v) => {
    const kant = v === 0 ? -1 : 1; // de tak langs de draad loopt naar de rand van de tegel
    const rv = (k) => r(100 * (v + 1) + k);
    // de stam: knoestig, met een bult bij elke knoop, van de grond tot de onderste draad
    let px = x0;
    let py = 0;
    let pz = 0;
    const stappen = 6;
    for (let i = 1; i <= stappen; i++) {
      const t = i / stappen;
      const nx = x0 + (rv(i) - 0.5) * 3.4 * Math.sin(t * Math.PI) + (stand === 'kaal' ? kant * t * t * 2 : 0);
      const ny = (rv(10 + i) - 0.5) * 2.2 * Math.sin(t * Math.PI);
      const nz = DRADEN[1] * t - 1;
      d.push(F.kegel([px, py, pz], [nx, ny, nz], 1.9 - (i - 1) * 0.12, 1.9 - i * 0.12, M.stam, deel, 1));
      d.push(F.bol([nx, ny, nz], 1.8 - i * 0.1 + rv(20 + i) * 0.4, M.stam, deel, 1));
      px = nx;
      py = ny;
      pz = nz;
    }
    const top = [px, py, pz];
    deel += 1;
    // de tak langs de onderste draad (de draagtak), met een knik, tot over de helft naar de buur
    const bocht = [
      [top[0] + kant * 4.5, 0.4, DRADEN[1] + 0.8],
      [top[0] + kant * 10, -0.3, DRADEN[1] + 0.4],
      [top[0] + kant * (v === 0 ? 11.4 : 11.2), 0.2, DRADEN[1] + 0.9],
    ];
    let vorig = top;
    bocht.forEach((p, i) => {
      d.push(F.kegel(vorig, p, 2.1 - i * 0.45, 2.1 - (i + 1) * 0.45, M.tak, deel, 1));
      vorig = p;
    });
    deel += 1;
    // een jaartak omhoog, vastgebonden aan de bovenste draden, en een paar korte takjes
    const omhoog = [top[0] - kant * 1.5, 0.3, DRADEN[1] + 6];
    d.push(F.capsule([top[0] - kant * 0.5, 0, DRADEN[1]], omhoog, 0.9, M.tak, deel));
    d.push(F.capsule(omhoog, [top[0] - kant * 3.2 + (rv(40) - 0.5) * 2, 0.2, PAAL - 6], 0.7, M.tak, deel));
    const stompjes = stand === 'kaal' ? 2 + (v + variant) % 2 : 1;
    for (let i = 0; i < stompjes; i++) {
      const sx = top[0] + kant * (3.5 + i * 4.6 + rv(50 + i) * 1.6);
      const lengte = 2.2 + rv(60 + i) * 2.8;
      d.push(F.capsule([sx, 0, DRADEN[1] + 0.8], [sx + (rv(70 + i) - 0.5) * 2.6, (rv(80 + i) - 0.5) * 2, DRADEN[1] + 0.8 + lengte], 0.8, M.tak, deel));
    }
    // een bindtouwtje aan elke draad, bij de stok
    d.push(F.bol([top[0] - kant * 0.5, 0.4, DRADEN[1] + 0.6], 1.35, M.tak, deel));
    deel += 1;
  });

  if (stand !== 'kaal') {
    const aantal = stand === 'blad' ? 31 : stand === 'vol' ? 29 : 15;
    const bladDeel = 30;
    STOKKEN.forEach((x0, v) => {
      for (let i = 0; i < aantal; i++) {
        const k = (n) => r(1000 * (v + 1) + 10 * i + n);
        // de bladeren hangen in een muur, dichter bij de draden, en het blad onderin is schaarser
        const z = 16 + Math.pow(k(1), 0.8) * 30;
        const cx = x0 + (k(2) - 0.5) * T * 0.62;
        const cy = (k(3) - 0.5) * 8.4 + (z > 34 ? 1 : 0);
        const a = 4.2 + k(4) * 2.4;
        const h = 3.6 + k(5) * 1.9;
        d.push(blad([cx, cy, z], a, h, (k(6) - 0.5) * 1.0, (k(7) - 0.5) * 1.1, M.blad, bladDeel + (i % 5)));
      }
      // een scheut die boven de bovenste draad uitsteekt, met een paar bladeren
      if (stand !== 'leeg' || v === variant % 2) {
        const sx = x0 + (r(300 + v) - 0.5) * 12;
        d.push(F.capsule([sx, 0, PAAL - 12], [sx + (r(310 + v) - 0.5) * 4, 0.5, PAAL + 3 + r(320 + v) * 3], 0.7, M.steel, 90 + v));
        for (let i = 0; i < 3; i++) {
          d.push(blad([sx + (r(330 + i) - 0.5) * 7, (r(340 + i) - 0.5) * 3, PAAL - 4 + i * 2.6], 3.6 + r(350 + i) * 1.6, 3.2 + r(360 + i), (r(370 + i) - 0.5) * 1.2, (r(380 + i) - 0.5) * 1.2, M.blad, bladDeel + i));
        }
      }
    });
  }

  // De trossen. In "vol" hangen er drie of vier voor het blad; na het plukken blijven er alleen stompjes van de stelen over.
  if (stand === 'vol') {
    const plekken = [
      [STOKKEN[0] - 5.5 + r(400) * 4, 5.2 + r(401) * 1.2, 30.5 - r(402) * 2.2, 1.0 + r(403) * 0.14],
      [STOKKEN[0] + 7.5 + r(404) * 5, 5.6 + r(405) * 1.0, 25.5 - r(406) * 2.4, 0.9 + r(407) * 0.16],
      [STOKKEN[1] - 8 + r(408) * 4, 5.4 + r(409) * 1.2, 29.5 - r(410) * 2.2, 1.0 + r(411) * 0.14],
      [STOKKEN[1] + 4 + r(412) * 4, 5.6 + r(413) * 1.0, 26.5 - r(414) * 2.4, 0.92 + r(415) * 0.16],
    ];
    if (variant === 2) plekken.splice(1, 1);
    plekken.forEach(([x, y, z, schaal], i) => d.push(...tros(x, y, z, schaal, zaad * 10 + i, 50 + i * 3)));
  } else if (stand === 'leeg') {
    // wat er van een tros overblijft: een stukje steel met een paar uitgeknepen bessenstelen
    for (let i = 0; i < 5; i++) {
      const sx = STOKKEN[i % 2] + (r(500 + i) - 0.5) * 14;
      const sz = 28 - r(510 + i) * 4;
      d.push(F.capsule([sx, 3.4, sz + 4], [sx + 0.4, 5.2, sz], 0.55, M.steel, 100 + i));
      if (i % 2 === 0) d.push(F.capsule([sx + 0.4, 5.2, sz], [sx + 1.6, 5.6, sz - 2.6], 0.4, M.steel, 100 + i));
    }
  }
  return F.model(d, materialen(stand, zaad), { midden: [0, 3, 26], straal: Math.hypot(T / 2 + 8, 14, 32) });
}

// ---------------------------------------------------------------- tekenen

function rankCel(stand, variant) {
  const B = new K.Beeld(WERK[0], WERK[1], WERK_ANKER[0], WERK_ANKER[1]);
  K.tekenModel(B, rank(stand, variant), { richting: 'ZW' });
  K.belicht(B);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}

// Hoeveel pixels een tekening van de rand van zijn cel afblijft.
function ruimte(p) {
  let x0 = p.b;
  let x1 = -1;
  let y0 = p.h;
  let y1 = -1;
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.b; x++) {
      if (!p.lees(x, y)) continue;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
  }
  return { boven: y0, links: x0, rechts: p.b - 1 - x1, onder: p.h - 1 - y1, x0, x1, y0, y1 };
}

function snij(p, x0, y0, b, h) {
  const uit = new K.Plaat(b, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < b; x++) {
      const k = p.lees(x0 + x, y0 + y);
      if (k) uit.zet(x, y, k[0], k[1]);
    }
  }
  return uit;
}

// Alle twaalf cellen op het werkbeeld, dan één gezamenlijke snede: alle cellen even groot, met hetzelfde anker.
let ONTHOUD = null;
function cellen() {
  if (ONTHOUD) return ONTHOUD;
  const ruw = STANDEN.map((stand) => Array.from({ length: VARIANTEN }, (_, v) => rankCel(stand, v)));
  let x0 = 1e9;
  let y0 = 1e9;
  let x1 = -1;
  let y1 = -1;
  for (const rij of ruw) {
    for (const p of rij) {
      const m = ruimte(p);
      x0 = Math.min(x0, m.x0);
      y0 = Math.min(y0, m.y0);
      x1 = Math.max(x1, m.x1);
      y1 = Math.max(y1, m.y1);
    }
  }
  // een pixel lucht rondom, en de breedte even, zodat het anker op een heel getal valt
  x0 -= 1;
  y0 -= 1;
  x1 += 1;
  y1 += 1;
  const b = x1 - x0 + 1;
  const h = y1 - y0 + 1;
  ONTHOUD = { rijen: ruw.map((rij) => rij.map((p) => snij(p, x0, y0, b, h))), cel: [b, h], anker: [WERK_ANKER[0] - x0, WERK_ANKER[1] - y0] };
  return ONTHOUD;
}

// ---------------------------------------------------------------- het vel

function vel() {
  const { rijen, cel } = cellen();
  const plaat = new K.Plaat(cel[0] * VARIANTEN, cel[1] * STANDEN.length);
  rijen.forEach((rij, s) => rij.forEach((p, v) => plaat.plak(p, v * cel[0], s * cel[1])));
  return plaat;
}

// Wat in beelden/beschrijving.json komt: het bestand, de maat van een cel en het anker, de standen (de rijen, van boven) en
// het aantal varianten (de kolommen).
function beschrijving(bestand) {
  const { cel, anker } = cellen();
  return { bestand, cel, anker, standen: STANDEN, varianten: VARIANTEN };
}

// ---------------------------------------------------------------- de proefplaat

function vergroot(p, n) {
  const uit = new K.Plaat(p.b * n, p.h * n);
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.b; x++) {
      const k = p.lees(x, y);
      if (!k) continue;
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) uit.zet(x * n + i, y * n + j, k[0], k[1]);
    }
  }
  return uit;
}

// Boven een stuk wijngaard zoals het spel het tekent (drie rijen van vier tegels, elk met zijn eigen stand en variant, van
// achter naar voor, op het anker van zijn tegel), onder de vier standen van één variant, alles twee keer vergroot.
function proef() {
  const { rijen, cel, anker } = cellen();
  const plein = new K.Plaat(280, 185);
  const OX = 150;
  const OY = 62;
  const legOp = (p, gx, gy) => plein.plak(p, OX + (gx - gy) * 32 - anker[0], OY + (gx + gy) * 16 - anker[1]);
  const volgorde = [];
  for (let gy = 0; gy < 5; gy += 2) for (let gx = 0; gx < 4; gx++) volgorde.push([gx, gy]);
  volgorde.sort((p, q) => p[0] + p[1] - (q[0] + q[1]));
  for (const [gx, gy] of volgorde) {
    // de rijen lopen langs x: elke rij (gy) heeft een stand, en de varianten wisselen langs de rij
    const stand = [2, 1, 3][gy / 2];
    const variant = (gx * 2 + gy * 3 + 1) % VARIANTEN;
    legOp(rijen[stand][variant], gx, gy);
  }
  const links = vergroot(plein, 2);
  // de vier standen naast elkaar, in de eerste variant, twee keer
  const stuk = new K.Plaat((cel[0] + 4) * 4, cel[1]);
  STANDEN.forEach((_, s) => stuk.plak(rijen[s][0], s * (cel[0] + 4), 0));
  const groot = vergroot(stuk, 2);
  const plaat = new K.Plaat(Math.max(links.b, groot.b), links.h + 8 + groot.h);
  plaat.plak(links, 0, 0);
  plaat.plak(groot, 0, links.h + 8);
  const uit = path.join(__dirname, 'uit');
  fs.mkdirSync(uit, { recursive: true });
  fs.writeFileSync(path.join(uit, 'wijnrank-proef.png'), K.png(plaat, 1, '#6b8a3e'));
  console.log(`uit/wijnrank-proef.png (${plaat.b}×${plaat.h}); cel ${cel.join('×')}, anker ${anker.join(',')}`);
  return plaat;
}

module.exports = { rank, rankCel, vel, beschrijving, proef, cellen, STANDEN, VARIANTEN };

if (require.main === module) {
  const t0 = Date.now();
  proef();
  if (process.argv.includes('--spel')) {
    // naar het spel: het vel in beelden/, en zijn plek in beelden/beschrijving.json en .js (zoals naar-spel.cjs dat doet)
    const BEELDEN = path.join(__dirname, '..', '..', 'beelden');
    fs.writeFileSync(path.join(BEELDEN, 'wijnrank.png'), K.png(vel(), 1));
    require('./beschrijving-zet.cjs').zetInBeschrijving('wijnrank', beschrijving('wijnrank.png'));
    console.log('beelden/wijnrank.png en beschrijving.* bijgewerkt');
  }
  console.log(`klaar in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}
