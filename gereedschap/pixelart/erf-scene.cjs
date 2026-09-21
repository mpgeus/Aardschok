// Het erf van de toren: de open plek in het bos waar de tovenaar zijn toren erft, zijn eigen
// grond, zoals de boerderij in Stardew Valley — de plek die de speler in de loop van het spel
// opknapt. De toren staat off-centre, met zijn deur naar het erf; daaromheen wat iemand maakt die
// er woont: een moestuin, een put, een schuurtje, een houtstapel met hakblok, de was aan de lijn,
// een bank bij de deur en een laag hek met een poortje. Vanaf het poortje loopt een pad naar het
// dorp, en achter de toren verdwijnt een smal paadje het bos in. Rondom staat het bos dicht genoeg
// dat de rand van de grond nergens als een harde lijn te zien is.
//
// Alles staat in wereldcoördinaten met het midden van de torenvoet als oorsprong: +x is
// rechtsonder in beeld, +y linksonder, z omhoog. Eén tegel is 45,25 eenheden, en een tegel is in
// het spel zo'n 80 cm: de tovenaar van 88 pixels is 1,75 m. Een meter is dus 56,6 eenheden.
//
// De toren en de dingen op het erf gaan door de tekenaar van toren.cjs: één zon over de hele
// scène, dus het schuurtje werpt zijn schaduw over het gras en de toren over het bos. De bomen en
// het kleine groen komen uit bomen.cjs en worden met de kern getekend; hun schaduwen komen daarna
// met slagschaduw, en de schaduw van de toren en het erf valt met een eigen doorgang over hen heen.
//
// erf-export.cjs schrijft dit weg als uit/erf/erf.png, 1920×1080, met de toren en het erf iets
// boven het midden zodat het pad naar het dorp en de moestuin goed in beeld komen; het bos loopt
// aan alle randen door tot buiten het canvas.
'use strict';
const K = require('./kern.cjs');
const Bm = require('./bomen.cjs');
const T = require('./toren.cjs');
const F = require('./figuren.cjs');
const F2 = require('./figuren2.cjs');
const V = require('./voorwerpen.cjs');

const { TEGEL, PXH, RAMP, RAMP_LEN, UIT, VLAG, klem, mix, hash, rnd, ruis2, ruis3, sdf } = K;
const { Wereld, voeg, stelsel, tekenWereld, bouwToren } = T;
const { E, GRAAD, balk, stok, bol, blokDeel, draaiZ, kegelStomp, steenOp, steenStap, houtTex, kans } = T.hulp;

const M = 56.6; // eenheden per meter
const TG = (n) => n * TEGEL; // tegels naar eenheden

// ---------------------------------------------------------------- de plattegrond

const BREED = 1920;
const HOOG = 1080;
const ANKER = [880, 700];
const VELD = { x0: -13.5, y0: -9.5, x1: 14.5, y1: 8.5 };

// waar alles staat, in tegels vanaf de voet van de toren
const PLEK = {
  bank: [2.3, -0.5],
  lantaarn: [-3.0, 1.7],
  put: [3.2, 4.2],
  hout: [5.2, 0.4],
  hakblok: [6.3, 1.7],
  schuur: [7.6, -3.4],
  tuin: { x0: -9.8, y0: -1.9, x1: -5.0, y1: 2.3 },
  lijnPaal: [-6.9, 4.7],
  ton: [1.8, 0.2],
  kist: [5.6, -1.2],
};
// de twee paden, als gebroken lijnen in tegels
const PAD_DORP = [[1.5, 2.0], [-0.3, 3.8], [-2.3, 5.2], [-4.6, 6.3], [-7.4, 7.1], [-10.4, 7.4], [-14.5, 7.2]];
const PAD_BOS = [[2.4, -1.4], [3.2, -3.8], [3.6, -6.4], [3.9, -10.5]];
// het hek loopt om het erf heen, met het poortje waar het dorpspad eruit gaat
const HEK = [[-11.4, 1.0], [-10.2, 3.6], [-8.4, 5.4], [-6.2, 6.5], [-5.2, 6.4], [-3.4, 6.9], [0.2, 7.4], [4.0, 6.8], [7.4, 5.4], [9.8, 3.2], [11.2, 0.4], [11.6, -2.6]];
const POORT = [-5.2, 6.4]; // tussen deze twee punten van het hek zit het poortje
const POORT2 = [-6.2, 6.5];

// afstand (in tegels) van een punt tot een gebroken lijn
function totLijn(punten) {
  return (x, y) => {
    let d = 1e9;
    for (let i = 0; i + 1 < punten.length; i++) {
      const [ax, ay] = punten[i];
      const [bx, by] = punten[i + 1];
      const vx = bx - ax;
      const vy = by - ay;
      const t = klem(((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy), 0, 1);
      d = Math.min(d, Math.hypot(x - ax - vx * t, y - ay - vy * t));
    }
    return d;
  };
}
const dDorp = totLijn(PAD_DORP);
const dBos = totLijn(PAD_BOS);

// ---------------------------------------------------------------- de grond

// Gras met de twee paden erdoor, de moestuin, en de plekken die kaal gelopen zijn: rond de deur
// van de toren, bij de put, bij het hakblok en voor het schuurtje.
function grond(S) {
  const t = PLEK.tuin;
  const padBreed = 0.5;
  // het smalle bospaadje: de afstand schalen maakt het pad smaller met dezelfde padBreed
  const pad = (gx, gy) => Math.min(dDorp(gx, gy), dBos(gx, gy) * (padBreed / 0.2));
  const kaal = (gx, gy) => {
    // rond de toren, tot voor de deur
    const r = Math.hypot(gx, gy);
    const deur = Math.hypot(gx - 1.2, gy - 1.9);
    let d = Math.min(r - 2.1 - ruis2(gx * 1.6, gy * 1.6, 51) * 0.5, deur - 1.6);
    d = Math.min(d, Math.hypot(gx - PLEK.put[0], gy - PLEK.put[1]) - 1.3);
    d = Math.min(d, Math.hypot(gx - PLEK.hakblok[0], gy - PLEK.hakblok[1]) - 1.5);
    d = Math.min(d, Math.hypot((gx - PLEK.schuur[0]) / 1.5, gy - (PLEK.schuur[1] + 2.6)) - 1.2);
    return d;
  };
  return Bm.grasVloer({
    pad,
    padBreed,
    extra: (gx, gy, px, py, u, v) => {
      // moestuin: bedden in ruggen en voren, met kluiten
      if (gx > t.x0 && gx < t.x1 && gy > t.y0 && gy < t.y1) {
        const rand = Math.min(gx - t.x0, t.x1 - gx, gy - t.y0, t.y1 - gy);
        if (rand > 0.12) {
          const rij = (gy - t.y0) / 0.52;
          const f = rij - Math.floor(rij);
          UIT.ramp = RAMP.aarde;
          let s = 3.6 + (f < 0.22 ? -1.2 : f < 0.6 ? 0.8 : 0);
          const h = hash(px, py, 61);
          if (h % 9 === 0) s += 0.7;
          else if (h % 11 === 0) s -= 0.8;
          // onkruid tussen de rijen zolang er niemand wiedt
          if (S.onkruid && f > 0.72 && ruis2(gx * 7, gy * 7, 63) > 0.56 && h % 3 !== 0) {
            UIT.ramp = RAMP.gras;
            s = 3 + (h % 2);
          }
          UIT.stap = Math.round(klem(s, 0, 6));
          return;
        }
      }
      // kaal gelopen aarde
      const d = kaal(gx, gy);
      if (d < 0) {
        const rafel = ruis2(gx * 4 + 3, gy * 4, 53) * 0.32;
        if (d < -rafel) {
          UIT.ramp = RAMP.aarde;
          let s = 3.5 + (ruis2(gx * 6, gy * 6, 55) - 0.5) * 1.2;
          const h = hash(px, py, 57);
          if (h % 31 === 0) {
            UIT.ramp = RAMP.steen;
            s = 4.4;
          } else if (h % 23 === 1) s -= 1;
          UIT.stap = Math.round(klem(s, 0, 7));
        }
      }
      // spaanders bij het hakblok
      const hb = Math.hypot(gx - PLEK.hakblok[0], gy - PLEK.hakblok[1]);
      if (hb < 1.7 && hash(px, py, 59) % 23 === 0) {
        UIT.ramp = RAMP.hout;
        UIT.stap = 5;
      }
    },
  });
}

// ---------------------------------------------------------------- materialen van het erf

function materialen(W, S) {
  const oud = S.oud ?? 1;
  W.mat.erfHout = { ramp: 'schors', lo: 1.2, hi: 6.4, rand: 0.8, patroon: (C) => houtTex(C, true) };
  W.mat.erfNieuw = { ramp: 'hout', lo: 1.4, hi: 6.8, rand: 0.8, patroon: (C) => houtTex(C, false) };
  W.mat.erfDak = {
    ramp: 'schors',
    lo: 1,
    hi: 6.2,
    rand: 0.8,
    patroon: (C) => {
      const r = houtTex(C, true);
      if (typeof r === 'object') return r;
      // mos op het noorden van het dak en in de naden
      if (oud && C.nz > 0.3 && ruis2(C.x * 0.06 + 5, C.y * 0.06, 71) > 0.66) return { ramp: 'mos', stap: klem(1 + C.stap * 0.55, 0, 5) };
      return r;
    },
  };
  W.mat.erfSteen = { ramp: 'steen', lo: 1.3, hi: 7.8, rand: 0.7, patroon: (C) => putTex(C) };
  W.mat.erfIjzer = { ramp: 'ijzer', lo: 1, hi: 5.2, rand: 1, glans: 1 };
  W.mat.erfRoest = { ramp: 'herfst', lo: 0.5, hi: 3, rand: 1, patroon: (C) => (hash(C.px, C.py, 4) % 3 === 0 ? { ramp: 'ijzer', stap: C.stap * 0.7 } : 0) };
  W.mat.erfTouw = { ramp: 'stro', lo: 1.4, hi: 6, patroon: (C) => ((C.px + C.py) % 3 === 0 ? -0.9 : 0) };
  W.mat.erfBlok = { ramp: 'schors', lo: 1.4, hi: 6.2, patroon: (C) => blokTex(C) };
  W.mat.erfStam = { ramp: 'schors', lo: 1.4, hi: 6.2, patroon: (C) => stamTex(C) };
  W.mat.erfBlad = {
    ramp: 'blad',
    lo: 1.6,
    hi: 7,
    patroon: (C) => (ruis3(C.x * 0.35, C.y * 0.35, C.z * 0.35, 77) > 0.62 ? 0.8 : hash(C.px, C.py, 78) % 7 === 0 ? -0.8 : 0),
  };
  W.mat.erfKool = {
    ramp: 'den',
    lo: 1.2,
    hi: 6.4,
    patroon: (C) => {
      // nerven vanuit het hart
      const a = Math.atan2(C.y - (C.deel.kool ? C.deel.kool[1] : 0), C.x - (C.deel.kool ? C.deel.kool[0] : 0));
      return Math.sin(a * 7) > 0.75 ? 0.9 : Math.sin(a * 7) < -0.85 ? -0.7 : 0;
    },
  };
  W.mat.erfLamp = { ramp: 'vuur', gloei: (C) => klem(4 + C.kijk * 2.6, 3, 7) };
  // was aan de lijn
  const doek = (ramp, lo, hi) => ({
    ramp,
    lo,
    hi,
    rand: 0.5,
    patroon: (C) => {
      const p = C.deel.doek;
      if (!p) return 0;
      const [u, w] = p.lok(C.x, C.y, C.z);
      // weefsel, en een donkere zoom rondom
      let s = (Math.floor(u * 0.7) + Math.floor(w * 0.7)) % 2 === 0 ? 0.25 : -0.25;
      if (Math.abs(w) > p.hw - 1.4 || Math.abs(u) > p.hl - 1.4) s -= 1;
      return s;
    },
  });
  // het donker binnen het schuurtje en in de putschacht. Stond eerst in bouwSchuurtje, maar dan
  // hangt bouwPut ervan af dat het schuurtje eerder gebouwd is; hier staat het één keer, zodat
  // elk ding op het erf ook los te bouwen is (zie naar-tiled.cjs, het vel "erf").
  W.mat.erfDonker = { ramp: 'inkt', lo: 0.4, hi: 1.8, rand: 0 };
  W.mat.erfLinnen = doek('perkament', 1.8, 7);
  W.mat.erfBlauw = doek('gewaad', 1.4, 6.4);
  W.mat.erfRood = doek('rood', 1.6, 6.8);
}

// stenen op een ronde put: voegen van één pixel, ook op de bolling
function putTex(C) {
  const p = C.deel.put;
  if (!p) return hash(C.px, C.py, 3) % 13 === 0 ? -0.8 : 0;
  const hoek = (x, y) => Math.atan2(y - p[1], x - p[0]);
  const th = hoek(C.x, C.y);
  const ta = hoek(C.x + C.dxv[0], C.y + C.dxv[1]);
  const tb = hoek(C.x + C.dyv[0], C.y + C.dyv[1]);
  const wrap = (a) => (a > Math.PI ? a - 2 * Math.PI : a < -Math.PI ? a + 2 * Math.PI : a);
  const R = p[2];
  const U = th * R;
  const H = C.z * PXH;
  const mU = Math.max(Math.abs(wrap(ta - th)), Math.abs(wrap(tb - th)), 1e-5) * R;
  const mH = Math.max(Math.abs((C.dxv[2] + C.z - C.z) * PXH), Math.abs(C.dyv[2] * PXH), 1e-5);
  if (C.nz > 0.6) return (hash(C.px, C.py, 7) % 11 === 0 ? -0.7 : 0) + 0.3;
  const st = steenOp(U, H, mU, mH, 13, 11, 16, 8);
  let s = steenStap(st, C.stap, C.px, C.py, { zaad: 13 });
  if (H < 9 && ruis2(U * 0.2, H * 0.3, 19) > 0.58) return { ramp: 'mos', stap: klem(1 + C.stap * 0.45, 0, 5) };
  return { stap: s };
}
// brandhout: kopse kant met jaarringen, zijkant met schors
function blokTex(C) {
  const b = C.deel.blok;
  if (!b) return 0;
  const [x, y, z] = b.lok(C.x, C.y, C.z);
  if (Math.abs(C.ny) > 0.55 || Math.abs(C.nx) > 0.55) {
    const rr = Math.hypot(x, z);
    if (rr > b.r - 0.9) return { ramp: 'schors', stap: C.stap - 1 };
    const ring = Math.floor(rr / 1.15) % 2;
    // een spleet vanuit het hart
    const spleet = Math.abs(Math.atan2(z, x) - b.spleet) < 0.1 && rr > 1;
    return { ramp: 'hout', stap: C.stap + 0.6 + (ring ? -0.7 : 0) + (rr < 0.9 || spleet ? -1.2 : 0) };
  }
  return hash(C.px, C.py, 4) % 3 === 0 ? -0.9 : 0;
}
// een stam of hakblok: schors met groeven, jaarringen op de snede
function stamTex(C) {
  const s = C.deel.stam;
  if (C.nz > 0.6 && s) {
    const rr = Math.hypot(C.x - s[0], C.y - s[1]);
    const ring = Math.floor(rr / 2.2) % 2;
    const kerf = Math.abs(Math.sin(Math.atan2(C.y - s[1], C.x - s[0]) * 3 + 1)) > 0.97;
    return { ramp: 'hout', stap: C.stap - 0.2 + (ring ? -0.7 : 0) + (kerf ? -1 : 0) };
  }
  const groef = Math.sin(Math.atan2(C.y - (s ? s[1] : 0), C.x - (s ? s[0] : 0)) * 13 + ruis2(C.z * 0.2, 1, 9) * 3);
  return groef > 0.7 ? -0.9 : groef < -0.85 ? 0.5 : 0;
}

// ---------------------------------------------------------------- het schuurtje

// Een schuurtje van 5 bij 4 tegels: staanders, plankenwanden, een zadeldak van planken met mos,
// een deur die openstaat, een luikje, en een ladder tegen de wand.
function bouwSchuurtje(W, S) {
  const g = W.groep('schuur');
  const [cx, cy] = PLEK.schuur.map(TG);
  const bx = TG(2.5); // halve breedte (x)
  const by = TG(2.0); // halve diepte (y)
  const goot = 1.9 * M;
  const nok = 2.9 * M;
  const p = (x, y, z) => [cx + x, cy + y, z];
  // Het dak: mos volgt de vorm in plaats van toevallige vlekken. Vooral langs de druiplijn (de
  // onderrand, waar het vocht het langst blijft staan) en tegen de nok aan, weinig er middenin
  // op het vlak; en meer aan de kant die van de avondzon af ligt dan aan de zonkant.
  const mosKant = AVONDZON[1] >= 0 ? -1 : 1;
  W.mat.erfSchuurDak = {
    ramp: 'schors',
    lo: 1,
    hi: 6.2,
    rand: 0.8,
    patroon: (C) => {
      const r = houtTex(C, true);
      if (typeof r === 'object') return r;
      if (!S.oud) return r;
      const t = klem((C.z - (goot - 7)) / (nok + 1 - (goot - 7)), 0, 1); // 0 = druiplijn, 1 = nok
      const kant = C.y >= cy ? 1 : -1;
      const zoom = Math.max(klem((0.22 - t) / 0.22, 0, 1), klem((t - 0.82) / 0.18, 0, 1) * 0.85);
      const kans = (kant === mosKant ? 0.62 : 0.2) * (0.06 + 0.94 * zoom * zoom);
      const n2 = ruis2(C.x * 0.11 + 5, (C.z + kant * 40) * 0.13, 71);
      if (n2 < kans) return { ramp: 'mos', stap: klem(1 + C.stap * 0.55, 0, 5) };
      return r;
    },
  };
  let n = 0;
  const hout = (a, b, hb, hd, op, m = 'erfHout', extra = {}) =>
    voeg(g, { ...balk(p(...a), p(...b), hb, hd, op, 0.35), m, deel: 10 + (n++ % 24), toon: (kans(n, 3, 7) - 0.5) * 1.1, zaad: n * 7, ...extra });
  // staanders en onderbalken
  for (const sx of [-1, 0, 1]) {
    for (const sy of [-1, 1]) {
      if (sx === 0 && sy === 1) continue; // daar is de deur
      hout([sx * (bx - 5), sy * (by - 5), -4], [sx * (bx - 5), sy * (by - 5), goot], 5, 5, [1, 0, 0]);
    }
  }
  for (const sy of [-1, 1]) hout([-bx, sy * (by - 5), 5], [bx, sy * (by - 5), 5], 5, 4, [0, 0, 1]);
  for (const sx of [-1, 1]) hout([sx * (bx - 5), -by, 5], [sx * (bx - 5), by, 5], 4.5, 4, [0, 0, 1]);
  // wanden van staande planken: voor (+y) met de deuropening, opzij (+x), en dichte platen achter
  const deurB = 30;
  for (let x = -bx + 6; x < bx - 4; x += 15.5) {
    if (Math.abs(x) < deurB + 6) continue;
    hout([x, by - 1, 0], [x, by - 1, goot - 2 + (kans(x, 1, 5) - 0.5) * 3], 7.4, 1.6, [0, 1, 0], 'erfHout', { naad: 7.4 });
  }
  for (let y = -by + 6; y < by - 4; y += 15.5) {
    hout([bx - 1, y, 0], [bx - 1, y, goot - 2], 7.4, 1.6, [1, 0, 0], 'erfHout', { naad: 7.4 });
  }
  voeg(g, { f: (x, y, z) => sdf.doos(x - cx + bx, y - cy, z - goot / 2, 2, by, goot / 2, 0.4), g: [cx - bx, cy, goot / 2, Math.hypot(by, goot / 2) + 2], m: 'erfHout', deel: 40 });
  voeg(g, { f: (x, y, z) => sdf.doos(x - cx, y - cy + by, z - goot / 2, bx, 2, goot / 2, 0.4), g: [cx, cy - by, goot / 2, Math.hypot(bx, goot / 2) + 2], m: 'erfHout', deel: 41 });
  // de gevel boven de deur en de topgevel aan de x-kant
  hout([-bx, by - 1, goot - 6], [bx, by - 1, goot - 6], 5, 3, [0, 1, 0]);
  voeg(g, {
    f: (x, y, z) => {
      const lx = x - cx;
      const ly = y - cy;
      const lz = z - goot;
      const driehoek = Math.max(lz - (nok - goot) * (1 - Math.abs(ly) / by), -lz);
      return Math.max(driehoek * 0.8, Math.abs(lx) - bx + 1, Math.abs(ly) - by);
    },
    g: [cx, cy, goot + (nok - goot) / 2, Math.hypot(bx, by) + 4],
    m: 'erfHout',
    deel: 42,
  });
  // dak: twee vlakken planken over de nok, met overstek
  for (const sy of [-1, 1]) {
    const hoek = Math.atan2(nok - goot, by);
    for (let x = -bx - 8; x < bx + 6; x += 16) {
      const a = p(x + 8, sy * (by + 9), goot - 7);
      const b = p(x + 8, sy * 1.5, nok + 1);
      voeg(g, { ...balk(a, b, 8, 2.2, [0, 0, 1], 0.3), m: 'erfSchuurDak', deel: 44 + ((x / 16) % 6), toon: (kans(x, sy, 9) - 0.5) * 1.2, zaad: x + sy * 3, naad: 8 });
    }
  }
  hout([-bx - 6, 0, nok + 3], [bx + 6, 0, nok + 3], 3.4, 2.4, [0, 0, 1]);
  // de deur: één blad, half open naar buiten
  const scharnier = p(-deurB, by + 1, 0);
  const hoek = 34 * GRAAD;
  const D = stelsel(scharnier, draaiZ(hoek));
  voeg(g, {
    f: D.veld((x, y, z) => Math.max(sdf.doos(x - deurB * 0.98, y, z - 48, deurB, 1.8, 48, 0.4), -sdf.doos(x - deurB * 0.98, y, z - 82, deurB - 9, 4, 6, 0.3))),
    g: [...D.wereld(deurB, 0, 48), Math.hypot(deurB, 50) + 2],
    m: 'erfHout',
    deel: 50,
    lok: D.lok,
    L: deurB * 2,
    toon: 0.2,
    zaad: 11,
  });
  for (const z of [16, 78]) voeg(g, { ...balk(D.wereld(2, 2.4, z), D.wereld(deurB * 1.9, 2.4, z), 2.4, 1, [0, 1, 0], 0.2), m: 'erfRoest', deel: 51 });
  // het donker van binnen
  voeg(g, { f: (x, y, z) => sdf.doos(x - cx, y - cy + 6, z - goot / 2, bx - 8, by - 8, goot / 2 - 2, 1), g: [cx, cy - 6, goot / 2, Math.hypot(bx, by)], m: 'erfDonker', deel: 52 });
  // een ladder tegen de gevel, rechts van de deur
  const la = p(bx - 24, by + 10, 0);
  const lb = p(bx - 14, by - 2, nok - 10);
  for (const s of [-1, 1]) voeg(g, { ...stok([la[0] + s * 7, la[1], la[2]], [lb[0] + s * 7, lb[1], lb[2]], 1.6), m: 'erfNieuw', deel: 53 });
  for (let t = 0.08; t < 0.95; t += 0.11) {
    const q = [0, 1, 2].map((i) => mix(la[i], lb[i], t));
    voeg(g, { ...stok([q[0] - 7, q[1], q[2]], [q[0] + 7, q[1], q[2]], 1.1), m: 'erfNieuw', deel: 54 });
  }
  return g;
}

// ---------------------------------------------------------------- de put

// Een ronde put van veldsteen met een dakje op twee palen, een windas met slinger, een touw en
// een emmer, en een houten deksel dat half over de put ligt.
function bouwPut(W, S) {
  const g = W.groep('put');
  const [cx, cy] = PLEK.put.map(TG);
  const R = 34;
  const h = 0.85 * M;
  voeg(g, {
    f: (x, y, z) => Math.max(sdf.cilinder(x - cx, y - cy, z, R, -6, h), -sdf.cilinder(x - cx, y - cy, z, R - 9, 6, h + 20)),
    g: [cx, cy, h / 2, R + 6],
    m: 'erfSteen',
    deel: 60,
    put: [cx, cy, R],
  });
  // de donkere schacht
  voeg(g, { f: (x, y, z) => sdf.cilinder(x - cx, y - cy, z, R - 9.5, -40, h - 6), g: [cx, cy, h / 2 - 10, R], m: 'erfDonker', deel: 61 });
  // twee palen en een dakje
  const paalZ = 1.9 * M;
  for (const s of [-1, 1]) voeg(g, { ...balk([cx + s * (R - 4), cy, 0], [cx + s * (R - 4), cy, paalZ], 4, 4, [0, 1, 0], 0.3), m: 'erfHout', deel: 62, toon: 0.2, zaad: 3 });
  for (const s of [-1, 1]) {
    for (let y = -R - 6; y < R + 2; y += 13) {
      voeg(g, {
        ...balk([cx + s * (R + 12), cy + y + 6, paalZ - 2], [cx - s * 2, cy + y + 6, paalZ + 26], 6.4, 1.8, [0, 0, 1], 0.3),
        m: 'erfDak',
        deel: 63,
        toon: (kans(y, s, 3) - 0.5) * 1,
        zaad: y + s,
        naad: 6.4,
      });
    }
  }
  voeg(g, { ...balk([cx, cy - R - 8, paalZ + 27], [cx, cy + R + 8, paalZ + 27], 3, 2.2, [0, 0, 1], 0.3), m: 'erfHout', deel: 64, toon: 0, zaad: 5 });
  // windas: een rol met een slinger, en het touw met de emmer
  const asZ = paalZ - 16;
  voeg(g, { f: (x, y, z) => sdf.cilinder(x - cx, z - asZ, y - cy, 6, -R + 6, R - 6), g: [cx, cy, asZ, R], m: 'erfStam', deel: 65, stam: [cx, cy] });
  voeg(g, { ...stok([cx + R - 2, cy, asZ], [cx + R + 9, cy, asZ], 1.6), m: 'erfIjzer', deel: 66 });
  voeg(g, { ...stok([cx + R + 9, cy, asZ], [cx + R + 9, cy + 13, asZ - 2], 1.6), m: 'erfIjzer', deel: 66 });
  voeg(g, { ...stok([cx + R + 9, cy + 13, asZ - 2], [cx + R + 9, cy + 13, asZ - 13], 1.4), m: 'erfHout', deel: 67 });
  const emmerZ = h + 26;
  voeg(g, { ...stok([cx - 6, cy, asZ - 6], [cx - 6, cy, emmerZ + 12], 0.9), m: 'erfTouw', deel: 68 });
  voeg(g, {
    f: (x, y, z) => Math.max(kegelStomp(x - cx + 6, y - cy, z, emmerZ - 12, emmerZ + 2, 8, 10), -kegelStomp(x - cx + 6, y - cy, z, emmerZ - 9, emmerZ + 6, 6.6, 8.6)),
    g: [cx - 6, cy, emmerZ - 5, 14],
    m: 'erfHout',
    deel: 69,
    toon: 0,
    zaad: 9,
  });
  voeg(g, { f: (x, y, z) => sdf.torus(x - cx + 6, (z - emmerZ - 2) * 1.6, y - cy, 8.4, 1), g: [cx - 6, cy, emmerZ + 1, 11], m: 'erfIjzer', deel: 70 });
  // deksel, half eraf geschoven
  const D = stelsel([cx - 10, cy + 16, h + 1], draaiZ(24));
  for (let u = -R + 4; u < R - 4; u += 12) {
    voeg(g, { ...balk(D.wereld(u, -R + 10, 0), D.wereld(u, R - 14, 0), 5.6, 2, [0, 0, 1], 0.3), m: 'erfHout', deel: 71, toon: (kans(u, 2, 4) - 0.5), zaad: u, naad: 5.6 });
  }
  return g;
}

// ---------------------------------------------------------------- hek en poortje

function bouwHek(W, S) {
  const scheef = S.oud ? 1 : 0;
  let n = 0;
  const paalH = 1 * M;
  // per stuk hek een eigen groep: dan hoeft een schaduwstraal alleen de palen in de buurt te vragen
  for (let i = 0; i + 1 < HEK.length; i++) {
    const [ax, ay] = HEK[i];
    const [bx, by] = HEK[i + 1];
    const poort = ax === POORT[0] && ay === POORT[1];
    if (poort) continue; // daar komt het poortje
    const g = W.groep(`hek-${i}`);
    const lang = Math.hypot(bx - ax, by - ay);
    const stuk = Math.max(1, Math.round(lang / 1.25));
    for (let k = 0; k <= stuk; k++) {
      if (k === stuk && i + 2 < HEK.length) continue; // de volgende paal hoort bij het volgende stuk
      const t = k / stuk;
      const px = TG(mix(ax, bx, t));
      const py = TG(mix(ay, by, t));
      const hel = scheef ? (kans(i, k, 3) - 0.5) * 9 : 0;
      const top = paalH * (0.85 + kans(i, k, 5) * 0.3);
      voeg(g, {
        ...balk([px, py, -5], [px + Math.sin(hel * GRAAD) * top, py + Math.cos(hel * GRAAD) * top * 0.3 - top * 0.3, top], 3.6, 3.6, [1, 0, 0], 0.5),
        m: 'erfHout',
        deel: 80 + (n++ % 12),
        toon: (kans(i, k, 7) - 0.5) * 1.2,
        zaad: i * 13 + k,
      });
    }
    // twee liggers
    for (const [hz, hb] of [[0.78, 3.4], [0.44, 3]]) {
      const zak = scheef ? (kans(i, hz * 10, 11) - 0.3) * 5 : 0;
      voeg(W.groepen[W.groepen.length - 1], {
        ...balk([TG(ax), TG(ay), paalH * hz], [TG(bx), TG(by), paalH * hz - zak], hb, 1.8, [0, 0, 1], 0.3),
        m: 'erfHout',
        deel: 92 + (n++ % 6),
        toon: (kans(i, hz, 9) - 0.5) * 1.2,
        zaad: i * 3 + hz,
      });
    }
  }
  // het poortje: twee stevige palen en een deurtje dat openstaat
  const g = W.groep('poort');
  const mid = [(POORT[0] + POORT2[0]) / 2, (POORT[1] + POORT2[1]) / 2];
  for (const q of [POORT, POORT2]) {
    voeg(g, { ...balk([TG(q[0]), TG(q[1]), -5], [TG(q[0]), TG(q[1]), paalH * 1.25], 4.4, 4.4, [1, 0, 0], 0.5), m: 'erfHout', deel: 100, toon: 0.3, zaad: 21 });
    voeg(g, { ...bol([TG(q[0]), TG(q[1]), paalH * 1.25 + 2], 5), m: 'erfHout', deel: 100, toon: 0.3, zaad: 22 });
  }
  // het deurtje hangt aan de paal bij POORT2 en staat naar het erf toe open
  const scharnier = [TG(POORT2[0]), TG(POORT2[1]), 0];
  const richting = (Math.atan2(POORT[1] - POORT2[1], POORT[0] - POORT2[0]) / GRAAD) + (S.oud ? 42 : 30);
  const D = stelsel(scharnier, draaiZ(richting));
  const breedte = Math.hypot(TG(POORT[0] - POORT2[0]), TG(POORT[1] - POORT2[1])) - 10;
  for (let u = 5; u < breedte; u += 11) {
    voeg(g, { ...balk(D.wereld(u, 0, 8), D.wereld(u, 0, paalH * 1.05), 5, 1.8, [0, 1, 0], 0.3), m: 'erfHout', deel: 101, toon: (kans(u, 1, 3) - 0.5), zaad: u, naad: 5 });
  }
  for (const z of [0.28, 0.82]) voeg(g, { ...balk(D.wereld(3, 3, paalH * z), D.wereld(breedte + 2, 3, paalH * z), 3, 1.6, [0, 1, 0], 0.3), m: 'erfHout', deel: 102, toon: 0.2, zaad: 31 });
  voeg(g, { ...balk(D.wereld(4, 3, paalH * 0.24), D.wereld(breedte, 3, paalH * 0.9), 3, 1.6, [0, 1, 0], 0.3), m: 'erfHout', deel: 103, toon: 0.2, zaad: 33 });
  return g;
}

// ---------------------------------------------------------------- houtstapel en hakblok

function bouwHout(W, S) {
  const g = W.groep('houtstapel');
  const [cx, cy] = PLEK.hout.map(TG);
  const r = 5.6;
  const lang = TG(1.6);
  let n = 0;
  for (let laag = 0; laag < 5; laag++) {
    const aantal = laag === 4 ? 4 : 6;
    for (let i = 0; i < aantal; i++) {
      const x = cx - 34 + i * 12 + (laag % 2) * 6 + (kans(laag, i, 3) - 0.5) * 2;
      const z = 5.4 + laag * 10.4;
      const y0 = cy - lang / 2 + (kans(laag, i, 5) - 0.5) * 8;
      const y1 = cy + lang / 2 + (kans(laag, i, 7) - 0.5) * 8;
      const Bk = stelsel([x, (y0 + y1) / 2, z]);
      voeg(g, {
        f: Bk.veld((lx, ly, lz) => sdf.cilinder(lx, lz, ly, r, -(y1 - y0) / 2, (y1 - y0) / 2)),
        g: [x, (y0 + y1) / 2, z, (y1 - y0) / 2 + r + 1],
        m: 'erfBlok',
        deel: 110 + (n++ % 12),
        blok: { lok: Bk.lok, r, spleet: kans(laag, i, 9) * 6 },
      });
    }
  }
  // een paar planken schuin over de stapel tegen de regen
  for (const s of [-1, 1]) {
    voeg(g, {
      ...balk([cx - 36, cy + s * 12, 58], [cx + 34, cy + s * 12, 55], 9, 1.8, [0, 0, 1], 0.3),
      m: 'erfDak',
      deel: 120 + s,
      toon: -0.3,
      zaad: 41 + s,
      naad: 9,
    });
  }
  // hakblok met bijl, en gekloofd hout ernaast
  const [hx, hy] = PLEK.hakblok.map(TG);
  voeg(g, { f: (x, y, z) => sdf.cilinder(x - hx, y - hy, z, 15, -4, 34), g: [hx, hy, 15, 22], m: 'erfStam', deel: 122, stam: [hx, hy] });
  voeg(g, { ...blokDeel([hx + 2, hy - 2, 38], [5.6, 1.2, 4.2], 34, 22, 200, 0.3), m: 'erfIjzer', deel: 123 });
  voeg(g, { ...stok([hx + 3, hy - 3, 39], [hx + 16, hy - 12, 62], 2), m: 'erfNieuw', deel: 124 });
  for (let i = 0; i < 7; i++) {
    const a = kans(i, 1, 11) * Math.PI * 2;
    const rr = 20 + kans(i, 2, 11) * 26;
    const x = hx + Math.cos(a) * rr;
    const y = hy + Math.sin(a) * rr;
    voeg(g, { ...blokDeel([x, y, 3.4], [10, 4, 3.4], kans(i, 3, 11) * 180, 6, kans(i, 4, 11) * 360, 1), m: 'erfBlok', deel: 130 + i, blok: { lok: (px, py, pz) => [px - x, py - y, pz - 3.4], r: 4, spleet: 0 } });
  }
  return g;
}

// ---------------------------------------------------------------- de was aan de lijn

// Een lijn van de torenmuur naar een paal, met een doorzakkend touw, een stok eronder, en wat
// wasgoed aan knijpers: een laken, een hemd, een broek en twee sokken.
function bouwWas(W, S) {
  const g = W.groep('was');
  const haak = [Math.cos(103 * GRAAD) * 61, Math.sin(103 * GRAAD) * 61, 1.62 * M];
  const [px, py] = PLEK.lijnPaal.map(TG);
  const paalTop = 1.72 * M;
  voeg(g, { ...balk([px, py, -5], [px, py, paalTop], 4, 4, [1, 0, 0], 0.4), m: 'erfHout', deel: 140, toon: 0, zaad: 51 });
  voeg(g, { ...balk([px - 13, py - 2, paalTop - 6], [px + 13, py + 2, paalTop - 6], 2.6, 2.4, [0, 0, 1], 0.3), m: 'erfHout', deel: 141, toon: 0.2, zaad: 52 });
  voeg(g, { ...stok([haak[0], haak[1], haak[2]], [haak[0] + 9, haak[1] + 16, haak[2] + 2], 1.2), m: 'erfIjzer', deel: 142 });
  // het touw in stukjes, met doorhang
  const a = [haak[0] + 9, haak[1] + 16, haak[2] + 2];
  const b = [px, py, paalTop - 4];
  const zak = 16;
  const punt = (t) => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t) - Math.sin(t * Math.PI) * zak];
  for (let i = 0; i < 10; i++) voeg(g, { ...stok(punt(i / 10), punt((i + 1) / 10), 0.8), m: 'erfTouw', deel: 143 });
  // een stok die de lijn omhoog duwt
  const st = punt(0.62);
  voeg(g, { ...stok([st[0] + 6, st[1] + 10, 0], [st[0], st[1], st[2] - 1], 1.8), m: 'erfNieuw', deel: 144 });
  // de was: platte lappen met een golf, elk aan twee knijpers
  const was = [
    [0.13, 'erfLinnen', 30, 34, 1],
    [0.34, 'erfBlauw', 20, 26, 2],
    [0.5, 'erfRood', 13, 17, 3],
    [0.68, 'erfLinnen', 24, 30, 4],
    [0.84, 'erfBlauw', 9, 12, 5],
  ];
  for (const [t, m, hw, hl, zaad] of was) {
    const q = punt(t);
    const dir = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const ux = Math.cos(dir);
    const uy = Math.sin(dir);
    const Dk = stelsel([q[0], q[1], q[2] - hl - 2], draaiZ((dir / GRAAD) % 360));
    const lok = (x, y, z) => Dk.lok(x, y, z);
    voeg(g, {
      f: Dk.veld((x, y, z) => {
        const golf = Math.sin(z * 0.16 + zaad) * 2.6 + Math.sin(x * 0.3 + zaad * 2) * 1.6;
        const d = Math.max(Math.abs(x) - hw, Math.abs(z) - hl);
        // onderkant slingert een beetje
        return Math.max(d, Math.abs(y - golf) - 1.1) * 0.9;
      }),
      g: [q[0], q[1], q[2] - hl - 2, Math.hypot(hw, hl) + 4],
      m,
      deel: 150 + zaad,
      doek: { lok, hw, hl },
    });
    for (const s of [-1, 1]) voeg(g, { ...stok([q[0] + ux * s * hw * 0.7, q[1] + uy * s * hw * 0.7, q[2] + 2], [q[0] + ux * s * hw * 0.7, q[1] + uy * s * hw * 0.7, q[2] - 6], 1.4), m: 'erfNieuw', deel: 160 + zaad });
  }
  return g;
}

// ---------------------------------------------------------------- bank, lantaarn, moestuin

function bouwBank(W, S) {
  const g = W.groep('bank');
  const [cx, cy] = PLEK.bank.map(TG);
  const hoek = 58; // met de rug naar de toren
  const D = stelsel([cx, cy, 0], draaiZ(hoek));
  const zit = 0.45 * M;
  for (const s of [-1, 1]) voeg(g, { f: D.veld((x, y, z) => sdf.cilinder(x - s * 28, z - zit / 2, y, 8, -9, 9)), g: [...D.wereld(s * 28, 0, zit / 2), 16], m: 'erfStam', deel: 170, stam: D.wereld(s * 28, 0, 0) });
  for (let u = -10; u <= 10; u += 10) voeg(g, { ...balk(D.wereld(-40, u, zit), D.wereld(40, u, zit), 5, 2.2, [0, 0, 1], 0.3), m: 'erfHout', deel: 171, toon: (kans(u, 1, 3) - 0.5) * 0.8, zaad: 61 + u, naad: 5 });
  // een emmer onder de bank en een omgevallen klomp ernaast
  voeg(g, {
    f: (x, y, z) => Math.max(kegelStomp(x - cx - 26, y - cy + 14, z, 0, 18, 8, 10), -kegelStomp(x - cx - 26, y - cy + 14, z, 3, 22, 6.6, 8.6)),
    g: [cx + 26, cy - 14, 9, 14],
    m: 'erfHout',
    deel: 172,
    toon: -0.2,
    zaad: 63,
  });
  return g;
}

function bouwLantaarn(W, S) {
  const g = W.groep('lantaarn');
  const [cx, cy] = PLEK.lantaarn.map(TG);
  const top = 1.95 * M;
  voeg(g, { ...balk([cx, cy, -5], [cx, cy, top], 3.6, 3.6, [1, 0, 0], 0.4), m: 'erfHout', deel: 180, toon: 0.1, zaad: 71 });
  voeg(g, { ...stok([cx, cy, top - 2], [cx + 4, cy + 13, top - 1], 1.2), m: 'erfIjzer', deel: 181 });
  voeg(g, { ...stok([cx + 4, cy + 13, top - 1], [cx + 4, cy + 13, top - 9], 1), m: 'erfIjzer', deel: 181 });
  const m = [cx + 4, cy + 13, top - 20];
  voeg(g, { f: (x, y, z) => kegelStomp(x - m[0], y - m[1], z, m[2] + 7, m[2] + 12, 6, 1.4), g: [m[0], m[1], m[2] + 9, 8], m: 'erfIjzer', deel: 182 });
  voeg(g, { f: (x, y, z) => sdf.doos(x - m[0], y - m[1], z - m[2], 4.2, 4.2, 7.4, 0.4), g: [m[0], m[1], m[2], 10], m: 'erfLamp', deel: 183 });
  voeg(g, { f: (x, y, z) => sdf.doos(x - m[0], y - m[1], z - m[2] - 8, 5, 5, 1, 0.3), g: [m[0], m[1], m[2] - 8, 8], m: 'erfIjzer', deel: 182 });
  for (const [dx, dy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    voeg(g, { ...stok([m[0] + dx * 4.4, m[1] + dy * 4.4, m[2] - 7.4], [m[0] + dx * 4.4, m[1] + dy * 4.4, m[2] + 7.4], 0.7), m: 'erfIjzer', deel: 182 });
  }
  W.lichten.push({ pos: [m[0], m[1], m[2]], r: 150, sterk: 2.4, warm: 1.3, val: 1.3, zacht: 0.55 });
  return g;
}

// De moestuin: kolen in rijen, bonenstaken, prei, een paar stokken met touw, en een schoffel.
function bouwMoestuin(W, S) {
  const t = PLEK.tuin;
  const g = W.groep('moestuin');
  const g2 = W.groep('moestuin2');
  let n = 0;
  // kolen: bollen van blad met een hart
  for (let i = 0; i < 9; i++) {
    const gx = t.x0 + 0.7 + (i % 3) * 1.5 + (kans(i, 1, 3) - 0.5) * 0.2;
    const gy = t.y0 + 0.75 + Math.floor(i / 3) * 0.52;
    const c = [TG(gx), TG(gy), 7];
    const doel = i % 3 === 2 && S.onkruid ? g2 : g;
    voeg(doel, {
      f: (x, y, z) => {
        const dx = x - c[0];
        const dy = y - c[1];
        const dz = z - c[2];
        const bult = ruis3(dx * 0.22, dy * 0.22, dz * 0.22, 80 + i) * 3.4;
        return (sdf.ellipsoide(dx, dy, dz, 11, 11, 9) - bult + 1.6) * 0.7;
      },
      g: [c[0], c[1], c[2], 16],
      m: 'erfKool',
      deel: 190 + (n++ % 8),
      kool: c,
    });
    // een paar losse buitenbladen
    for (let k = 0; k < 3; k++) {
      const a = kans(i, k, 13) * Math.PI * 2;
      voeg(doel, {
        ...blokDeel([c[0] + Math.cos(a) * 11, c[1] + Math.sin(a) * 11, 3], [7, 5, 1.2], (a / GRAAD) % 360, 22, (a / GRAAD + 90) % 360, 1),
        m: 'erfBlad',
        deel: 200 + (n++ % 8),
      });
    }
  }
  // bonenstaken: drie stokken in een punt, met ranken
  for (let i = 0; i < 3; i++) {
    const gx = t.x1 - 0.6 - i * 0.1;
    const gy = t.y0 + 0.9 + i * 1.1;
    const c = [TG(gx), TG(gy), 0];
    const top = [c[0] + 4, c[1] - 2, 1.6 * M];
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + 0.6;
      voeg(g, { ...stok([c[0] + Math.cos(a) * 13, c[1] + Math.sin(a) * 13, -3], top, 1.5), m: 'erfNieuw', deel: 210 + i });
    }
    // ranken en blad
    for (let k = 0; k < 9; k++) {
      const t2 = 0.15 + (k / 9) * 0.8;
      const a = k * 2.1 + i;
      const r = 13 * (1 - t2) + 2;
      const p = [mix(c[0], top[0], t2) + Math.cos(a) * r, mix(c[1], top[1], t2) + Math.sin(a) * r, mix(2, top[2], t2)];
      voeg(g, { ...bol(p, 5.5), m: 'erfBlad', deel: 215 + (k % 5), k: 2 });
    }
  }
  // prei en uien: bosjes smalle bladen
  for (let i = 0; i < 12; i++) {
    const gx = t.x0 + 0.5 + (i % 6) * 0.62;
    const gy = t.y1 - 0.75 - Math.floor(i / 6) * 0.5;
    const c = [TG(gx), TG(gy), 0];
    for (let k = 0; k < 4; k++) {
      const a = kans(i, k, 17) * Math.PI * 2;
      const hoog = 16 + kans(i, k, 19) * 12;
      voeg(g, { ...stok(c, [c[0] + Math.cos(a) * 7, c[1] + Math.sin(a) * 7, hoog], 2.2), m: 'erfBlad', deel: 220 + (i % 6), k: 1.5 });
    }
  }
  // twee stokken met een touwtje ertussen als rijmarkering
  for (const [sx, sy] of [[t.x0 + 0.3, t.y0 + 0.35], [t.x1 - 0.3, t.y0 + 0.35]]) {
    voeg(g, { ...stok([TG(sx), TG(sy), -4], [TG(sx), TG(sy), 26], 1.4), m: 'erfNieuw', deel: 230 });
  }
  voeg(g, { ...stok([TG(t.x0 + 0.3), TG(t.y0 + 0.35), 24], [TG(t.x1 - 0.3), TG(t.y0 + 0.35), 22], 0.6), m: 'erfTouw', deel: 231 });
  // een schoffel die tegen de hoekpaal staat
  const hp = [TG(t.x1 - 0.1), TG(t.y1 + 0.1)];
  voeg(g, { ...stok([hp[0] + 6, hp[1] + 8, 0], [hp[0] - 2, hp[1] - 2, 1.4 * M], 1.6), m: 'erfNieuw', deel: 232 });
  voeg(g, { ...blokDeel([hp[0] + 5, hp[1] + 7, 6], [5, 1, 3.4], 40, 12, 0, 0.3), m: 'erfIjzer', deel: 233 });
  return g;
}

// ---------------------------------------------------------------- de scène

// [naam, zaad, gx, gy, voet, sterkte] — de bomen om de open plek heen, dicht op de rand en dunner
// naar binnen, met een appelboom bij de moestuin.
const BOMEN = [
  // achterrand (naar boven in beeld)
  ['den', 1, -11.5, -8.4, 16, 1.5],
  ['herfstEik', 4, -7.0, -7.6, 22, 1.5],
  ['den', 5, -7.6, -8.8, 16, 1.5],
  ['eik', 2, -3.4, -8.2, 22, 1.5],
  ['den', 2, 0.6, -8.6, 16, 1.5],
  ['berk', 1, 4.6, -8.8, 12, 1.4],
  ['herfstEik', 1, 8.4, -8.4, 22, 1.5],
  ['den', 3, 12.2, -8.2, 16, 1.5],
  ['dodeBoom', 2, -5.6, -6.4, 18, 1.3],
  ['den', 6, 10.4, -6.2, 16, 1.5],
  ['berk', 4, -9.8, -6.0, 12, 1.4],
  // rechterrand (rechtsboven)
  ['eik', 3, 13.4, -4.6, 22, 1.5],
  ['den', 4, 13.0, -1.0, 16, 1.5],
  ['eik', 8, 13.2, 2.6, 22, 1.5],
  ['berk', 2, 11.6, 5.2, 12, 1.4],
  ['den', 7, 13.6, 6.6, 16, 1.5],
  // voorrand (naar beneden in beeld)
  ['eik', 4, 8.6, 7.8, 22, 1.5],
  ['den', 8, 4.6, 8.0, 16, 1.5],
  ['berk', 5, 1.4, 8.2, 12, 1.4],
  ['eik', 9, -2.6, 8.0, 22, 1.5],
  ['den', 9, -6.4, 7.8, 16, 1.5],
  ['eik', 5, -10.4, 7.0, 22, 1.5],
  // linkerrand (linksboven)
  ['den', 10, -12.6, 4.4, 16, 1.5],
  ['berk', 6, -12.4, 1.2, 12, 1.4],
  ['eik', 6, -12.8, -2.4, 22, 1.5],
  ['den', 11, -12.2, -5.6, 16, 1.5],
  ['wilg', 1, -11.0, 5.8, 20, 1.4],
  // in de open plek: een appelboom bij de moestuin en een oude eik bij het bospaadje
  ['appelboom', 1, -8.0, 4.2, 18, 1.3],
  ['eik', 7, 6.4, -6.6, 22, 1.5],
];
const KLEIN = [
  ['struik', 1, -10.6, -7.0, 20, 1.1],
  ['struik', 4, -1.4, -7.4, 20, 1.1],
  ['bessenStruik', 2, 2.6, -7.6, 18, 1.1],
  ['struik', 3, 10.0, -7.4, 20, 1.1],
  ['bessenStruik', 5, 12.2, -3.0, 18, 1.1],
  ['struik', 6, 12.4, 4.2, 20, 1.1],
  ['struik', 7, 6.8, 7.4, 20, 1.1],
  ['bessenStruik', 8, -0.6, 7.6, 18, 1.1],
  ['struik', 9, -8.4, 7.2, 20, 1.1],
  ['struik', 10, -12.0, 2.8, 20, 1.1],
  ['struik', 11, -12.4, -4.2, 20, 1.1],
  ['varen', 1, -9.2, -6.6, 0],
  ['varen', 2, -4.4, -7.2, 0],
  ['varen', 3, 5.2, -7.4, 0],
  ['varen', 4, 11.4, -5.6, 0],
  ['varen', 5, 11.8, 1.4, 0],
  ['varen', 6, 3.0, 7.8, 0],
  ['varen', 7, -4.8, 7.6, 0],
  ['varen', 8, -11.6, -1.0, 0],
  ['paddenstoelen', 1, -6.8, -7.0, 0],
  ['paddenstoelen', 2, 9.0, -6.0, 0],
  ['paddenstoelen', 3, -11.0, 0.2, 0],
  ['boomstronk', 1, 1.8, -6.6, 16, 1.1],
  ['boomstronk', 2, -10.2, 5.0, 16, 1.1],
  ['rots', 1, 10.8, 6.0, 22, 1.1],
  ['rots', 2, -12.0, -7.6, 22, 1.1],
  ['kleineRots', 3, 8.2, 5.6, 10, 1],
  ['kleineRots', 4, -9.6, 6.2, 10, 1],
  ['kleineRots', 5, 2.2, -5.4, 10, 1],
  ['grasPol', 1, -2.0, 6.6, 0],
  ['grasPol', 2, 7.6, 3.8, 0],
  ['grasPol', 3, -7.0, -3.4, 0],
  ['grasPol', 4, 9.4, 1.6, 0],
  ['grasPol', 5, -3.6, -4.6, 0],
  ['grasPol', 6, 5.0, 5.4, 0],
  ['hoogGras', 1, 10.2, -2.4, 0],
  ['hoogGras', 2, -11.2, 6.6, 0],
  ['hoogGras', 3, 1.0, -4.4, 0],
  ['bloemen', 1, -4.4, 4.6, 0],
  ['bloemen', 2, 6.6, 6.4, 0],
  ['bloemen', 3, -9.0, 2.8, 0],
  ['bloemen', 4, 2.8, 1.6, 0],
];
// een extra rand precies op de grens van de open plek (VELD): laag struikgewas, varens en
// graspollen die de kieren tussen de bomen bij de grond dichtvullen, aan alle vier de kanten, zodat
// de rechte rand van de grasdoos nergens nog als lijn te zien is (zie ook nevel() in erf()).
const RAND = [
  ['struik', 12, -13.0, -8.8, 18, 1.1],
  ['hoogGras', 4, -12.6, -9.2, 0],
  ['struik', 13, 13.9, -8.9, 18, 1.1],
  ['grasPol', 7, 14.2, -7.0, 0],
  ['struik', 14, 14.2, 7.9, 18, 1.1],
  ['hoogGras', 5, 13.9, 6.3, 0],
  ['grasPol', 8, 12.8, 8.3, 0],
  ['bloemen', 5, 10.5, 8.3, 0],
  ['struik', 15, -13.1, 7.9, 18, 1.1],
  ['varen', 9, -12.7, 6.4, 0],
  ['grasPol', 9, -11.0, 8.3, 0],
  ['paddenstoelen', 4, -8.0, -8.7, 0],
  ['hoogGras', 6, 6.3, -8.9, 0],
  ['bloemen', 6, -1.0, -8.9, 0],
  ['varen', 10, 2.6, 8.4, 0],
  ['struik', 16, -4.4, -8.6, 18, 1.1],
];

// ---------------------------------------------------------------- het erf als losse tegels
//
// Dezelfde plaatsing, maar dan per ding: hoeveel tegels zijn voet inneemt, of je erdoorheen kunt,
// welke bouwer hem maakt, en hoe ruim het vlak moet zijn om hem los te renderen. naar-tiled.cjs
// maakt hier tegels/erf.png en tegels/toren.png van (voor Tiled én voor het spel), erf-kaart.cjs
// zet ze neer op kaarten/erf.tmj. Zo staat de plaatsing op één plek: verzet je hier de put, dan
// schuift hij mee in de plaat, in de editor en in het spel.
//
// voet = [x0, y0, breed, diep] in tegels vanaf de voet van de toren. (x0, y0) is de achterste
// hoek: de tegel die je in Tiled aanklikt, en waar het spel het ding op inplant bij het sorteren.
const rondTuin = (i) => Math.round([PLEK.tuin.x0, PLEK.tuin.y0][i]);
const TOREN_TEGELS = [
  // De toren staat in een vel voor zich: hij is veel hoger dan al het andere op het erf, en in één
  // gedeelde cel zou elke bank en elke lantaarn zevenhonderd pixels lucht meekrijgen. Later komen
  // de drie staten (krakkemikkig, half, hersteld) er als tweede en derde tegel bij.
  //
  // `voet: null` betekent: opmeten. De toren wordt dikker gemaakt (hij moet om zijn eigen hal van
  // 9×7 passen, zie ontwerp/wereld.md), en dan hoort zijn voetafdruk hier niet als getal te staan
  // maar uit het model zelf te komen. naar-tiled.cjs meet hem en schrijft hem in tegels.json, en
  // erf-kaart.cjs zet de toren daarmee op de kaart. Ook het vlak groeit dan vanzelf mee.
  { naam: 'toren', voet: null, vast: true, bouw: null },
];
const ERF_TEGELS = [
  { naam: 'schuurtje', voet: [5, -5, 5, 4], vast: true, bouw: bouwSchuurtje, vlak: [560, 560] },
  // Een tegel is te krap: met zijn dakje op twee palen en de overstek is de put zo'n twee bij
  // twee tegels breed (R = 34 eenheden voor de schacht, het dak steekt tot R + 12 uit).
  { naam: 'put', voet: [3, 4, 2, 2], vast: true, bouw: bouwPut, vlak: [320, 360] },
  { naam: 'houtstapel', voet: [4, 0, 2, 2], vast: true, bouw: bouwHout, vlak: [420, 400] },
  // De waslijn hangt aan de torenmuur en loopt naar zijn paal: hij staat op de tegel van de paal,
  // en je loopt er gewoon onderdoor (dus niet vast).
  { naam: 'waslijn', voet: [Math.round(PLEK.lijnPaal[0]), Math.round(PLEK.lijnPaal[1]), 1, 1], vast: false, bouw: bouwWas, vlak: [860, 560] },
  { naam: 'moestuin', voet: [rondTuin(0), rondTuin(1), 5, 5], vast: true, bouw: bouwMoestuin, vlak: [640, 560] },
  { naam: 'bank', voet: [Math.round(PLEK.bank[0]), Math.round(PLEK.bank[1]), 1, 1], vast: true, bouw: bouwBank, vlak: [300, 300] },
  { naam: 'lantaarn', voet: [Math.round(PLEK.lantaarn[0]), Math.round(PLEK.lantaarn[1]), 1, 1], vast: false, bouw: bouwLantaarn, vlak: [260, 320] },
];
// Welke kant de deur van de toren op kijkt, als richting vanaf het midden van de toren. Zie de
// kale plek in grond(): die is om (1.2, 1.9) heen gelopen, want daar wordt gelopen. Het is met
// opzet een richting en geen tegel: hoe ver de deur van het midden af ligt, hangt af van hoe dik
// de toren is, en die wordt om zijn eigen hal heen gebouwd (zie ontwerp/wereld.md). erf-kaart.cjs
// loopt vanaf het midden deze kant op tot hij de voet uit is; dáár staat hij voor de deur.
const DEURKANT = [1.2, 1.9];

// Het erf tekenen. o.staat: 'verwaarloosd' (zoals hij hem erft) of 'opgeknapt'.
function erf(o = {}) {
  const log = o.log || (() => {});
  const S = { oud: o.staat !== 'opgeknapt', onkruid: o.staat !== 'opgeknapt' };
  const B = new K.Beeld(o.b || BREED, o.h || HOOG, ...(o.anker || ANKER));
  const t0 = Date.now();

  // --- de grond
  K.tekenDozen(B, [K.doos(VELD.x0, VELD.y0, VELD.x1, VELD.y1, -16, 0, grond(S))]);
  log(`grond ${((Date.now() - t0) / 1000).toFixed(1)} s`);

  // --- de toren en alles wat op het erf staat, in één wereld: één zon over alles
  const W = new Wereld();
  materialen(W, S);
  const ST = { ...T.STATEN[o.toren || 'krakkemikkig'], schuur: null };
  const Wt = bouwToren(ST);
  W.groepen.push(...Wt.groepen);
  Object.assign(W.mat, Wt.mat);
  W.lichten.push(...Wt.lichten);
  // een warm schijnsel uit de kier van de deur
  const deur = ST.OPN[0];
  W.lichten.push({ pos: [Math.cos(deur.phi * GRAAD) * 54, Math.sin(deur.phi * GRAAD) * 54, E(60)], r: 90, sterk: 1.8, warm: 1.4, val: 1.5, zacht: 0.6 });
  bouwSchuurtje(W, S);
  bouwPut(W, S);
  bouwHek(W, S);
  bouwHout(W, S);
  bouwWas(W, S);
  bouwBank(W, S);
  bouwLantaarn(W, S);
  bouwMoestuin(W, S);
  const t1 = Date.now();
  const R = tekenWereld(B, W);
  log(`toren en erf ${((Date.now() - t1) / 1000).toFixed(1)} s`);

  // --- bomen, struiken en klein groen, met de kern getekend
  const t2 = Date.now();
  const gezet = [];
  for (const [naam, zaad, gx, gy, voet, sterkte] of [...BOMEN, ...KLEIN, ...RAND]) {
    gezet.push({ ...Bm.zetBuiten(B, Bm[naam](zaad), gx, gy), naam, voet, sterkte });
  }
  log(`bomen ${((Date.now() - t2) / 1000).toFixed(1)} s`);

  // --- losse voorwerpen en de mensen
  const t3 = Date.now();
  const zetK = (model, gx, gy, richting, extra = {}) => {
    const obj = B.volgendObj;
    K.tekenModel(B, model, { gx, gy, richting });
    gezet.push({ model, gx, gy, obj, richting, voet: extra.voet ?? 10, sterkte: extra.sterkte ?? 1.1 });
  };
  zetK(V.ton(), PLEK.ton[0], PLEK.ton[1], 'ZO', { voet: 14 });
  zetK(V.kist(), PLEK.kist[0], PLEK.kist[1], 'ZO', { voet: 14 });
  zetK(V.zak(2), PLEK.tuin.x1 + 0.5, PLEK.tuin.y1 + 0.35, 'ZO', { voet: 12 });
  zetK(F.tovenaar(84), 0.6, 1.6, 44, { voet: 15, sterkte: 1.2 });
  zetK(F2.wim({ houding: 'vegen', fase: 0.45 }), -1.3, 3.4, 30, { voet: 14, sterkte: 1.2 });
  log(`voorwerpen en mensen ${((Date.now() - t3) / 1000).toFixed(1)} s`);

  // --- schaduwen: eerst de harde avondschaduw van de toren, het erf en de bomen samen (zet ook
  // B.zon/B.schaduw voor avondlicht) — een lage zon met een lange reikwijdte, zodat de toren echt
  // over het gras trekt in plaats van alleen zijn eigen voet te donkeren — dan de herfstEik
  // dempen, dan de zachte contactschaduw (de donkere plek om de voet) van elk los ding erbovenop
  const t4 = Date.now();
  avondSchaduw(B, R, gezet, { kracht: 2.8, reik: 1000 });
  dempHerfst(B, gezet);
  for (const g of gezet) Bm.slagschaduw(B, g.model, { gx: g.gx, gy: g.gy, richting: g.richting, obj: g.obj, voet: g.voet, sterkte: (g.sterkte ?? 1) * 0.4 });
  log(`schaduwen ${((Date.now() - t4) / 1000).toFixed(1)} s`);

  // --- avondlicht: laag en warm, schemerig onder de bomen, de kruinen nog in de zon
  const bos = (gx, gy) => {
    const rand = Math.min(gx - VELD.x0, VELD.x1 - gx, gy - VELD.y0, VELD.y1 - gy);
    return klem((3.4 - rand) / 3.4, 0, 1);
  };
  K.belicht(B, {
    omgeving: (X, Y, Z, px, py, i) => {
      const hoog = klem((Z * PXH - 40) / 220, 0, 1);
      const nz = B.nrm[i * 3 + 2];
      return 0.16 + 0.22 * nz + hoog * 0.2 - 0.75 * bos(X / TEGEL, Y / TEGEL) * (1 - hoog * 0.8);
    },
  });
  // warm waar de avondzon raakt (steen→bot, mos→gras, gras zelf een stap lichter, ...), koel in
  // de schaduw (gras/mos→den, riet/aarde→schors), en een warme rand op de zonkant van de kronen
  avondlicht(B);
  boomrand(B);
  K.verwarm(B, 1.5);
  // nevel: dooft de rand van de open plek naar alle kanten weg in het bos, in plaats van de
  // rechte rand van de grasdoos tegen het niets
  nevel(B, {
    diepte: (X, Y) => Math.min(X / TEGEL - VELD.x0, VELD.x1 - X / TEGEL, Y / TEGEL - VELD.y0, VELD.y1 - Y / TEGEL),
    van: 3,
    tot: -4,
    mid: 3.6,
    sterkte: 0.6,
  });
  K.omlijn(B);
  const p = K.Plaat.van(K.kwantiseer(B));
  const masker = new Uint8Array(B.b * B.h);
  for (let i = 0; i < masker.length; i++) masker[i] = B.obj[i] > 0 ? 1 : 0;
  Bm.ontspikkel(p, undefined, masker);
  log(`totaal ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  return o.debug ? { p, B, gezet, R } : p;
}

// ---------------------------------------------------------------- avondlicht (zoals dorp.cjs)
//
// dorp.cjs (dorpsplein) lost twee dingen op die het erf ook had: een platte rand van de grond in
// het niets, en vlak, ondramatisch licht. Beide lossen ze op met een tweede, lagere zon (AVONDZON,
// naast K.LICHT dat de vormen zelf modelleert) die een harde eigen schaduw werpt (avondSchaduw,
// hieronder, naar het voorbeeld van hun zonSchaduw), een warm/koel herkleuring op die schaduw
// (avondlicht) en een nevel die met de afstand naar een middentint kruipt (nevel). dorp.cjs zelf
// blijft ongemoeid (een andere agent bouwt hem net opnieuw); dit is een eigen kopie, aangepast aan
// het erf: nevel meet hier de afstand tot de rand van de open plek (naar alle kanten), niet de
// diepte in de kijkrichting, want het erf is een besloten plek, geen dorp dat de zichtlijn uitloopt.
// Lager dan de eerste versie (was z = 0.5): een echte lage avondzon, voor lange slagschaduwen en
// een erf dat in twee grote vlakken uiteenvalt, licht en schaduw, in plaats van vlak middaglicht.
const AVONDZON = (() => {
  const v = [-0.3, 0.6, 0.32];
  const l = Math.hypot(...v);
  return v.map((x) => x / l);
})();

// steen→bot, mos→gras, riet→stro, aarde→zand, gras→zichzelf maar lichter: in de zon. gras/mos→den,
// riet/aarde→schors: in de schaduw, en een tint donkerder dan de eerste versie. Steeds naar de
// tint met dezelfde lichtheid (de vorm blijft gelijk), maar met meer sprong tussen licht en
// schaduw dan dorp.cjs gebruikt, want het erf is klein en moet het verschil in temperatuur dragen
// zonder de vele gebouwen die het dorp heeft.
const NAAR_WARM = {
  steen: ['bot', [1, 2, 2, 3, 4, 5, 6, 7, 7]],
  mos: ['gras', [1, 2, 3, 4, 5, 5]],
  riet: ['stro', [1, 2, 2, 3, 4, 5, 6]],
  aarde: ['zand', [1, 2, 3, 4, 5, 6, 7]],
  gras: ['gras', [1, 2, 3, 4, 5, 6, 7, 7]],
};
const NAAR_KOEL = {
  gras: ['den', [0, 0, 1, 2, 3, 4, 4, 5]],
  mos: ['den', [0, 0, 1, 2, 3, 4]],
  riet: ['schors', [0, 0, 1, 1, 2, 3, 4]],
  aarde: ['schors', [0, 0, 1, 1, 2, 3, 4]],
};
function avondlicht(B, o = {}) {
  if (!B.zon) return;
  const warm = new Map(Object.entries(o.warm ?? NAAR_WARM).map(([van, [naar, tabel]]) => [RAMP[van], [RAMP[naar], tabel]]));
  const koel = new Map(Object.entries(o.koel ?? NAAR_KOEL).map(([van, [naar, tabel]]) => [RAMP[van], [RAMP[naar], tabel]]));
  const drempel = o.drempel ?? 0.3;
  for (let i = 0; i < B.b * B.h; i++) {
    const r = B.ramp[i];
    if (r < 0 || B.vlag[i] & (VLAG.GLOEI | VLAG.VAST)) continue;
    const zonnig = B.zon[i] > drempel;
    const kaart = zonnig ? warm.get(r) : B.schaduw && B.schaduw[i] ? koel.get(r) : null;
    if (!kaart) continue;
    const s = B.stap[i];
    const heel = klem(Math.round(s), 0, kaart[1].length - 1);
    B.ramp[i] = kaart[0];
    B.stap[i] = kaart[1][heel] + (s - Math.round(s));
  }
}

// Een warme kus op de zonkant van de kronen: niet de hele boom omkleuren (dat wast alles uit),
// alleen de lichtste bulten — de plekken die de eigen belichting al als hoogste bult koos — een
// stap feller, precies zoals de allerlaatste lage zon over een boomtop schuurt. Na avondlicht(),
// zodat het op de uiteindelijke stap werkt.
function boomrand(B, o = {}) {
  const drempelZon = o.drempelZon ?? 0.5;
  const ramps = new Set([RAMP.blad, RAMP.den, RAMP.herfst].map((r) => r));
  for (let i = 0; i < B.b * B.h; i++) {
    const r = B.ramp[i];
    if (!ramps.has(r) || !(B.zon[i] > drempelZon)) continue;
    const top = RAMP_LEN[r] - 1;
    if (B.stap[i] < top - 1.1) continue;
    B.stap[i] = Math.min(top + 0.6, B.stap[i] + 1);
  }
}

// De herfstEik dempen: de rampen goud en rood (fel geel en fel rood tussen de bladeren) vallen
// terug tot het rustigere herfst-oranje, en een deel van de kroon — ruis in de wereld, dus geen
// twee bomen gelijk, en geen harde vlekken — keert terug naar gewoon blad-groen. Dat geeft een
// kroon die half is omgeslagen in plaats van in de fik, en minder verzadigd. Werkt alleen op de
// herfstEik-bomen zelf (via hun object-nummer in gezet), na avondSchaduw (dat zet B.zon/B.schaduw)
// en vóór avondlicht/boomrand, zodat die daarna nog gewoon op het resultaat werken.
function dempHerfst(B, gezet) {
  const eigen = new Set();
  for (const g of gezet) if (g.naam === 'herfstEik') eigen.add(g.obj);
  if (!eigen.size) return;
  const [goud, rood, herfst, blad] = [RAMP.goud, RAMP.rood, RAMP.herfst, RAMP.blad];
  for (let i = 0; i < B.b * B.h; i++) {
    if (!eigen.has(B.obj[i])) continue;
    const r = B.ramp[i];
    if (r !== goud && r !== rood && r !== herfst) continue;
    const X = B.pos[i * 3];
    const Y = B.pos[i * 3 + 1];
    const Z = B.pos[i * 3 + 2];
    const n = ruis3(X * 0.045, Y * 0.045, Z * 0.06, 401);
    const s = B.stap[i];
    if (n > 0.5) {
      B.ramp[i] = blad;
      B.stap[i] = klem(Math.round((s * (RAMP_LEN[blad] - 1)) / (RAMP_LEN[r] - 1)), 0, RAMP_LEN[blad] - 1);
    } else if (r !== herfst) {
      B.ramp[i] = herfst;
      B.stap[i] = klem(Math.round((s * (RAMP_LEN[herfst] - 1)) / (RAMP_LEN[r] - 1)) - 1, 0, RAMP_LEN[herfst] - 1);
    } else {
      B.stap[i] = klem(s - 0.6, 0, RAMP_LEN[herfst] - 1);
    }
  }
}

// Nevel: kruipt de stap naar een middentint, o.diepte(X,Y,Z) → 0 (dichtbij, scherp) .. groter
// (veraf, mist). Standaard (zoals dorp.cjs) de diepte in de kijkrichting; het erf geeft er zelf
// de afstand tot de rand van het erf aan mee, zodat alle vier de zijden vervagen, niet alleen de
// achterkant.
function nevel(B, o = {}) {
  const diepte = o.diepte || ((X, Y) => (X + Y) / TEGEL);
  const van = o.van ?? 0;
  const tot = o.tot ?? -40;
  const mid = o.mid ?? 4;
  const sterkte = o.sterkte ?? 0.65;
  for (let i = 0; i < B.b * B.h; i++) {
    if (B.ramp[i] < 0 || B.vlag[i] & VLAG.GLOEI) continue;
    const d = diepte(B.pos[i * 3], B.pos[i * 3 + 1], B.pos[i * 3 + 2]);
    const t = klem((van - d) / (van - tot), 0, 1);
    if (t <= 0) continue;
    const f = t * sterkte;
    B.stap[i] = B.stap[i] * (1 - f) + mid * f;
  }
}

// Raakt een straal vanaf wereldpunt (X, Y, Z) in richting L een geplaatst boom/voorwerp-model?
// Zelfde opzet als modelRaakt in dorp.cjs: bol om het model eerst (goedkoop), dan pas de sdf.
function boomRaakt(g, X, Y, Z, L) {
  const graden = typeof g.richting === 'number' ? g.richting : K.RICHTING[g.richting || 'Z'];
  const hoek = (graden * Math.PI) / 180;
  const fx = Math.cos(hoek);
  const fy = Math.sin(hoek);
  const rx = -fy;
  const ry = fx;
  const Ox = g.gx * TEGEL;
  const Oy = g.gy * TEGEL;
  const Oz = g.z || 0;
  const dx0 = X - Ox;
  const dy0 = Y - Oy;
  const lx0 = dx0 * rx + dy0 * ry;
  const ly0 = dx0 * fx + dy0 * fy;
  const lz0 = Z - Oz;
  const lvx = L[0] * rx + L[1] * ry;
  const lvy = L[0] * fx + L[1] * fy;
  const lvz = L[2];
  const model = g.model;
  const [mx, my, mz] = model.midden;
  const R2 = model.straal;
  const ox = lx0 - mx;
  const oy = ly0 - my;
  const oz = lz0 - mz;
  const b = ox * lvx + oy * lvy + oz * lvz;
  const c = ox * ox + oy * oy + oz * oz - R2 * R2;
  const disc = b * b - c;
  if (disc < 0) return false;
  const w = Math.sqrt(disc);
  let t = Math.max(0.3, -b - w);
  const eind = -b + w;
  for (let i = 0; i < 90 && t < eind; i++) {
    const d = model.sdf(lx0 + lvx * t, ly0 + lvy * t, lz0 + lvz * t);
    if (d < 0.15) return true;
    t += Math.max(d * 0.8, 0.35);
  }
  return false;
}

// De harde avondschaduw: voor elke pixel die de avondzon zou kunnen zien, een straal naar de zon
// door de toren en het erf (R.f, het veld van tekenWereld) en langs de bomen/voorwerpen die
// dichtbij genoeg staan om hem te kunnen raken. Zet B.zon (hoe recht in de zon) en B.schaduw
// (hard, 0/1), die avondlicht() nodig heeft, en donkert de schaduw meteen wat harder dan het
// zachte omgevingslicht. Vervangt de oude schaduwVanWereld.
function avondSchaduw(B, R, gezet, o = {}) {
  const L = AVONDZON;
  const kracht = o.kracht ?? 2.3;
  const reik = o.reik ?? 260; // langste schaduw die de toren nog werpt, in eenheden
  const n = B.b * B.h;
  B.zon = new Float32Array(n);
  B.schaduw = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (B.ramp[i] < 0 || B.vlag[i] & (VLAG.GLOEI | VLAG.VAST)) continue;
    const nx = B.nrm[i * 3];
    const ny = B.nrm[i * 3 + 1];
    const nz = B.nrm[i * 3 + 2];
    const nL = nx * L[0] + ny * L[1] + nz * L[2];
    if (nL <= 0.05) continue; // die kant ligt toch al van de zon af
    const X = B.pos[i * 3] + nx * 0.7;
    const Y = B.pos[i * 3 + 1] + ny * 0.7;
    const Z = B.pos[i * 3 + 2] + nz * 0.7;
    let raak = false;
    let t = 1;
    for (let s = 0; s < 130 && t < reik; s++) {
      const d = R.f(X + L[0] * t, Y + L[1] * t, Z + L[2] * t);
      if (d < 0.15) {
        raak = true;
        break;
      }
      t += Math.max(d * 0.85, 1);
    }
    if (!raak) {
      for (const g of gezet) {
        const gx = g.gx * TEGEL;
        const gy = g.gy * TEGEL;
        const dx = gx - X;
        const dy = gy - Y;
        const langs = dx * L[0] + dy * L[1];
        if (langs < -6 || langs > reik + g.model.straal) continue;
        const bij = Math.hypot(dx - L[0] * langs, dy - L[1] * langs);
        if (bij > g.model.straal + 4) continue;
        if (boomRaakt(g, X, Y, Z, L)) {
          raak = true;
          break;
        }
      }
    }
    if (raak) {
      B.schaduw[i] = 1;
      B.stap[i] -= Math.abs(nz) < 0.3 ? kracht / 2 : kracht;
      B.vlag[i] |= VLAG.GLAD;
    } else {
      B.zon[i] = nL;
    }
  }
}

// De plaatsing en de bouwers staan er los bij, zodat erf-kaart.cjs er kaarten/erf.tmj uit kan
// maken en naar-tiled.cjs elk ding op het erf ook los kan renderen (als tegel voor Tiled én voor
// het spel). Wie hier iets verzet, verzet het meteen ook in het spel: er is maar één plaatsing.
module.exports = {
  erf, BREED, HOOG, ANKER, VELD, PLEK, PAD_DORP, PAD_BOS,
  BOMEN, KLEIN, RAND, HEK, POORT, POORT2,
  TOREN_TEGELS, ERF_TEGELS, DEURKANT,
  materialen,
  bouwSchuurtje, bouwPut, bouwHek, bouwHout, bouwWas, bouwBank, bouwLantaarn, bouwMoestuin,
};
