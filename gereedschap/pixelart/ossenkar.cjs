// De ossenkar van het lege begin (ontwerp/werklijst.md, vraag 152; Marcel, 11 okt: "Een kar met wat spullen en
// 'settlers'", en "Huifkar wordt ossenkar"): een kar op twee hoge wielen, met een os tussen de disselbomen. Hij komt
// aan als huifkar, met een zeil van linnen over wat vier gezinnen meebrengen, en zolang het huis van de schout er niet
// staat, is hij de opslag. Daarna gaat het zeil eraf en haalt hij als ossenkar de grondstoffen op (stap 2): leeg, met
// spullen, met stammen, met stenen of met zakken.
//
// De os is de koe uit vee.cjs met `os` en `juk`; de kar is hier. Ze worden apart getekend, in hetzelfde beeld, zodat er
// een lijn tussen de os en de kar loopt. Lokale assen als bij alle figuren: x naar rechts, y naar voren (naar de os), z
// omhoog. Het anker (het midden van de tegel) ligt halverwege de achterkant van de kar en de snuit van de os, zodat het
// beeld van elke kant zo klein mogelijk is.
//
// Twee houdingen, allebei een lus van acht beelden: staan (de os herkauwt en zwiept met zijn staart) en rijden (de os
// loopt, en de wielen draaien precies zo hard als de kar vooruitgaat: in een rondje een kwartslag, zie WIEL).
//
//   node gereedschap/pixelart/ossenkar.cjs           (de proefplaat: uit/ossenkar-proef.png, en uit/ossenkar-rijden.png)
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const { sdf, ruis3, hash } = K;
const { model, kegel, capsule, ellips, blok, naarRamp } = require('./figuren.cjs');
const { bochtProfiel } = require('./bosvijanden.cjs');
const V = require('./vee.cjs');
const { apng } = require('./apng.cjs');

const TEGEL = K.TEGEL;

// ---------------------------------------------------------------- maten

const HOUDINGEN = {
  staan: { beelden: 8, fps: 5, herhaal: true, os: 'staan' },
  rijden: { beelden: 8, fps: V.LOOP_FPS.os, herhaal: true, os: 'lopen' },
};
// De kar rijdt in het tempo van de os, in tegels per seconde.
const SNELHEID = V.SNELHEID.os;

// Het wiel: in een rondje van de os (acht beelden) rijdt de kar SNELHEID tegels, en draait het wiel een kwartslag, twee
// spaken ver. Zo sluit de lus, en glijdt het wiel niet over de grond: de omtrek is vier keer de weg van een rondje.
const RONDJE = (SNELHEID * TEGEL * HOUDINGEN.rijden.beelden) / HOUDINGEN.rijden.fps; // eenheden per rondje
const WIEL = { r: (4 * RONDJE) / (2 * Math.PI), x: 28.5, dik: 1.6, spaken: 8, draai: Math.PI / 2 };

// De bak: half zo breed en half zo lang, de bovenkant van de vloer en van de zijplanken. Een eenheid is zo'n twee
// centimeter: de bak is 1,8 meter lang en 0,9 breed, de wielen een meter hoog.
const BAK = { b: 22, l: 44, vloer: 31.5, rand: 47 };
// De disselbomen liggen onder de bak en lopen door tot het juk van de os.
const DISSEL = { x: V.JUK.eind[0], z: 28.6 };
// Het zeil: zo ver boven de rand, en half zo lang (een tikje voorbij de bak); de bogen eronder.
const HUIF = { hoog: 31, b: 24.6, l: 46, bogen: [-36, -18, 0, 18, 36] };

// Hoe ver de os voor de as staat (zijn midden, tussen zijn voor- en achterpoten): zijn staart blijft een hand van het
// voorschot af.
const OS_Y = BAK.l + 1 + 36.5 * V.SCHAAL.os + 7;
// Waar het juk van de os de disselbomen vasthoudt, in de maten van de kar.
const JUK = [V.JUK.eind[0] * V.SCHAAL.os, OS_Y + V.JUK.eind[1] * V.SCHAAL.os, V.JUK.eind[2] * V.SCHAAL.os];
// Van de achterkant van de kar tot de snuit van de os; het anker ligt in het midden.
const ACHTER = -BAK.l - 4;
const VOOR = OS_Y + 63 * V.SCHAAL.os;
const MIDDEN = (ACHTER + VOOR) / 2;

// De cel van een beeld, met het anker; uitgemeten op alle richtingen (de proefplaat zegt het als het niet past).
const CEL = [216, 156];
const ANKER = [108, 116];
// Zo tekent het spel de figuren (dorpelingen-anim.cjs), voor de proefplaat.
const FIG_CEL = [112, 124];
const FIG_ANKER = [56, 110];

// Wat er op de kar ligt. Met het zeil zie je alleen wat er achter uit de opening steekt.
const LADINGEN = ['huif', 'spullen', 'hout', 'stenen', 'zakken', 'leeg'];

// ---------------------------------------------------------------- materialen

const M = { hout: 0, wiel: 1, ijzer: 2, linnen: 3, touw: 4, kist: 5, zak: 6, ton: 7, schors: 8, nerf: 9, steen: 10, deken: 11, ketel: 12, binnen: 13 };

function materialen() {
  const mat = [];
  // Planken: aan de zijkant liggen ze op elkaar, op de vloer naast elkaar.
  mat[M.hout] = {
    ramp: 'hout',
    lo: 1.2,
    hi: 5.6,
    dither: false,
    patroon: (x, y, z, nx, ny, nz) => {
      if (nz > 0.6) return ((x + 40) % 5.5) < 0.6 ? -1.4 : 0;
      if (Math.abs(nx) > 0.6 || Math.abs(ny) > 0.6) return ((z - BAK.vloer + 40) % 5.2) < 0.6 ? -1.4 : (ruis3(x * 0.3, y * 0.3, z * 2, 3) > 0.7 ? -0.5 : 0);
      return 0;
    },
  };
  mat[M.wiel] = { ramp: 'hout', lo: 1.0, hi: 5.0, patroon: (x, y, z) => (ruis3(x, y * 0.5, z * 0.5, 7) > 0.68 ? -0.6 : 0) };
  mat[M.ijzer] = { ramp: 'ijzer', lo: 0.6, hi: 3.6, glans: 1.2 };
  // Linnen, vergeeld en vuil, met lappen van ander goed erop (een bruine en een grijze), plooien tussen de bogen en
  // modder langs de rand.
  const LO = 1.8;
  const HI = 5.2;
  mat[M.linnen] = {
    ramp: 'bot',
    lo: LO,
    hi: HI,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      const zz = z - BAK.rand;
      if (x > 0 && y > 6 && y < 18 && zz > 9 && zz < 18) return naarRamp('jas', stap, [LO, HI], [2.2, 5.4]);
      if (x < 0 && y > -30 && y < -19 && zz > 6 && zz < 14) return naarRamp('pleister', stap, [LO, HI], [0.8, 3.8]);
      if (x > 0 && y < -27 && y > -37 && zz > 17 && zz < 24) return naarRamp('jas', stap, [LO, HI], [1.6, 4.6]);
      let p = Math.sin(y * 0.55 + ruis3(x * 0.1, y * 0.1, z * 0.1, 5) * 4) > 0.8 ? -0.5 : 0;
      p += (ruis3(x * 0.15, y * 0.15, z * 0.15, 4) - 0.5) * 0.8;
      if (zz < 6) p -= 0.6 + (ruis3(x * 0.4, y * 0.4, z, 6) > 0.55 ? 0.5 : 0);
      return p;
    },
  };
  mat[M.touw] = { ramp: 'hout', lo: 2.2, hi: 4.8 };
  mat[M.kist] = { ramp: 'hout', lo: 0.8, hi: 4.4, patroon: (x, y, z, nx, ny, nz) => (nz < 0.6 && ((z + 40) % 4) < 0.5 ? -1 : 0) };
  // Jute: een grof weefsel.
  mat[M.zak] = { ramp: 'jas', lo: 1.8, hi: 6.0, patroon: (x, y, z) => ((Math.floor(x * 1.3) + Math.floor(y * 1.3) + Math.floor(z * 1.3)) % 2 === 0 ? 0.25 : -0.25) };
  mat[M.ton] = { ramp: 'hout', lo: 1.4, hi: 5.4, patroon: (x, y) => (Math.sin(Math.atan2(y, x) * 18) > 0.8 ? -0.7 : 0) };
  mat[M.schors] = {
    ramp: 'schors',
    lo: 1.2,
    hi: 5.4,
    patroon: (x, y, z) => (Math.sin(y * 0.35 + ruis3(x * 0.4, y * 0.08, z * 0.4, 11) * 6) > 0.55 ? -1.1 : 0),
  };
  // Het kopse hout van een stam: licht, waar hij afgezaagd is.
  mat[M.nerf] = { ramp: 'zand', lo: 2.6, hi: 6.2 };
  mat[M.steen] = {
    ramp: 'steen',
    lo: 1.6,
    hi: 5.6,
    patroon: (x, y, z) => (ruis3(x * 0.5, y * 0.5, z * 0.5, 13) > 0.7 ? -0.8 : ruis3(x * 0.9, y * 0.9, z * 0.9, 14) > 0.78 ? 0.5 : 0),
  };
  mat[M.deken] = { ramp: 'rood', lo: 1.4, hi: 5.0, patroon: (x) => (((x + 40) % 6) < 1.2 ? -1.2 : 0) };
  mat[M.ketel] = { ramp: 'ijzer', lo: 0.2, hi: 2.4, glans: 1.4 };
  // het donker in de kar, achter de opening van het zeil
  mat[M.binnen] = { ramp: 'aarde', lo: 0.2, hi: 1.6 };
  return mat;
}

// ---------------------------------------------------------------- de kar

// Een wiel aan kant s (-1 links, 1 rechts), gedraaid over `hoek` (rijdt de kar vooruit, dan draait de bovenkant mee naar
// voren): een velg met een ijzeren band, een naaf en acht spaken.
function wiel(s, hoek) {
  const c = [s * WIEL.x, 0, WIEL.r];
  const deel = s < 0 ? 2 : 3;
  const d = [];
  d.push({
    f: (x, y, z) => {
      const q = Math.hypot(y - c[1], z - c[2]) - (WIEL.r - 3);
      return Math.max(Math.abs(q) - 2.2, Math.abs(x - c[0]) - WIEL.dik);
    },
    g: [c[0], c[1], c[2], WIEL.r + 1],
    m: M.wiel,
    deel,
  });
  d.push({
    f: (x, y, z) => {
      const q = Math.hypot(y - c[1], z - c[2]) - (WIEL.r - 0.55);
      return Math.max(Math.abs(q) - 0.55, Math.abs(x - c[0]) - WIEL.dik - 0.3);
    },
    g: [c[0], c[1], c[2], WIEL.r + 1],
    m: M.ijzer,
    deel,
  });
  // de naaf, een dikke klos om de as, met een ijzeren ring aan de buitenkant
  d.push({ f: (x, y, z) => sdf.cilinder(y - c[1], z - c[2], x - c[0], 4.6, -3.6, 3.6) - 0.4, g: [c[0], c[1], c[2], 6.5], m: M.wiel, deel });
  d.push({ f: (x, y, z) => sdf.cilinder(y - c[1], z - c[2], x - c[0], 2.6, s < 0 ? -4.6 : 3.2, s < 0 ? -3.2 : 4.6), g: [c[0] + s * 4, c[1], c[2], 4], m: M.ijzer, deel });
  for (let k = 0; k < WIEL.spaken; k++) {
    const a = Math.PI / 2 + (k * 2 * Math.PI) / WIEL.spaken - hoek;
    const binnen = [c[0], c[1] + Math.cos(a) * 4, c[2] + Math.sin(a) * 4];
    const buiten = [c[0], c[1] + Math.cos(a) * (WIEL.r - 4), c[2] + Math.sin(a) * (WIEL.r - 4)];
    d.push(kegel(binnen, buiten, 1.25, 0.9, M.wiel, deel));
  }
  return d;
}

// De bak: een vloer van planken op twee langbomen, zijplanken tussen rongen, een voorschot en een achterschot.
function bak() {
  const d = [];
  const { b, l, vloer, rand } = BAK;
  const zijH = (rand - vloer) / 2;
  d.push(blok([0, 0, vloer - 1.2], [b, l, 1.2], 0.3, M.hout, 1));
  for (const s of [-1, 1]) {
    d.push(blok([s * (b + 0.4), 0, vloer + zijH], [0.9, l, zijH], 0.3, M.hout, 1));
    for (const y of [-l + 2, -14, 14, l - 2]) d.push(blok([s * (b + 1.5), y, vloer + zijH + 1.2], [1.2, 1.3, zijH + 2.4], 0.4, M.hout, 4));
    // de bovenrand, een lat over de zijplanken
    d.push(blok([s * (b + 0.6), 0, rand + 0.4], [1.3, l + 0.6, 0.7], 0.3, M.hout, 4));
  }
  d.push(blok([0, l + 0.2, vloer + zijH], [b + 1.2, 0.9, zijH], 0.3, M.hout, 1));
  d.push(blok([0, -l - 0.2, vloer + zijH - 1.6], [b + 1.2, 0.9, zijH - 1.6], 0.3, M.hout, 1));
  // het blok op de as, en de as zelf
  d.push(blok([0, 0, WIEL.r + 2.2], [b - 1, 3.2, 1.6], 0.4, M.hout, 4));
  d.push(capsule([-WIEL.x - 3, 0, WIEL.r], [WIEL.x + 3, 0, WIEL.r], 2.2, M.hout, 4));
  // de langbomen onder de bak, die vooraan de disselbomen worden, tot aan het juk
  for (const s of [-1, 1]) {
    d.push(blok([s * DISSEL.x, -1, DISSEL.z], [1.9, l + 2, 1.7], 0.6, M.hout, 5));
    d.push(kegel([s * DISSEL.x, l + 0.5, DISSEL.z], [s * JUK[0], JUK[1] - 0.5, JUK[2]], 1.8, 1.25, M.hout, 5));
  }
  // een dwarslat tussen de disselbomen, vlak voor de bak
  d.push(capsule([-DISSEL.x, l + 9, DISSEL.z + 2.4], [DISSEL.x, l + 9, DISSEL.z + 2.4], 1.1, M.hout, 5));
  return d;
}

// Het zeil over de bogen, met de uiteinden samengetrokken, een opening achteraan waar de spullen uit steken, een koord
// langs de onderrand en een koord om de opening.
function huif() {
  const d = [];
  const z0 = BAK.rand;
  const afstand = HUIF.bogen[1] - HUIF.bogen[0];
  const doek = (x, y, z) => {
    const ay = Math.abs(y);
    // tussen de bogen zakt het doek een beetje; aan de uiteinden trekt het koord het samen
    const tussen = ay < HUIF.bogen[HUIF.bogen.length - 1] ? 0.5 - 0.5 * Math.cos((2 * Math.PI * (y - HUIF.bogen[0])) / afstand) : 0;
    let s = 1 - 0.065 * tussen;
    const eind = HUIF.l - 8;
    if (ay > eind) s *= 1 - 0.2 * ((ay - eind) / 8) ** 2;
    const a = HUIF.b * s;
    const c = HUIF.hoog * s;
    const zz = z - z0;
    const e = (Math.hypot(x / a, zz / c) - 1) * a * 0.85;
    return Math.max(e, -(zz + 3), ay - HUIF.l);
  };
  d.push({ f: doek, g: [0, 0, z0 + HUIF.hoog / 2, Math.hypot(HUIF.b, HUIF.l, HUIF.hoog) + 2], m: M.linnen, deel: 6 });
  // de opening achteraan, zo diep als de samengetrokken rand
  const gat = [0, -HUIF.l, z0 + 13];
  d.push({ f: (x, y, z) => sdf.ellipsoide(x - gat[0], y - gat[1], z - gat[2], 8.5, 8, 8.8), g: [gat[0], gat[1], gat[2], 10], uit: true, m: M.binnen });
  // wat erin zit en eruit steekt: een zak, het deksel van een kist, een opgerolde deken
  d.push(ellips([-2.5, -40.5, z0 + 10], [5.5, 4.5, 6.5], M.zak, 8));
  d.push(blok([3.6, -40, z0 + 4.8], [5.6, 3.6, 3.6], 0.5, M.kist, 9));
  d.push(capsule([-6, -41, z0 + 16.5], [6, -41.5, z0 + 17], 3.2, M.deken, 10));
  // het koord om de opening en langs de onderrand
  d.push({
    f: (x, y, z) => {
      const q = Math.hypot(x - gat[0], (z - gat[2]) / 1.04) - 8.7;
      return Math.max(Math.hypot(q, y - (-HUIF.l + 1.6)) - 0.85, -1e3);
    },
    g: [gat[0], -HUIF.l + 1.6, gat[2], 13],
    m: M.touw,
    deel: 7,
  });
  for (const s of [-1, 1]) d.push(capsule([s * (HUIF.b + 0.1), -HUIF.l + 3, z0 - 1.6], [s * (HUIF.b + 0.1), HUIF.l - 3, z0 - 1.6], 0.75, M.touw, 7));
  return d;
}

// Wat aan de achterkant hangt: een ketel en een emmer.
function achteraan() {
  const y = -BAK.l - 2.6;
  return [
    ellips([-11, y, 26.5], [4.4, 4.2, 3.7], M.ketel, 20),
    kegel([-11, y, 31], [-11, y + 1.2, 37], 0.5, 0.5, M.ijzer, 20),
    kegel([10, y, 21.5], [10, y, 29], 3.1, 3.7, M.ton, 21),
    kegel([10, y + 0.4, 29.5], [10, y + 1.2, 37], 0.45, 0.45, M.touw, 21),
  ];
}

// Een stam langs de kar, met lichte kopse kanten.
function stam(x, z, r, y0, y1, deel) {
  return {
    f: (px, py, pz) => sdf.cilinder(px - x, pz - z, py, r, y0, y1) - 0.3,
    g: [x, (y0 + y1) / 2, z, Math.hypot(r, (y1 - y0) / 2) + 1],
    m: (px, py) => (Math.min(Math.abs(py - y0), Math.abs(py - y1)) < 0.6 ? M.nerf : M.schors),
    deel,
  };
}

// De lading in de open bak.
function lading(soort) {
  const z = BAK.vloer;
  const d = [];
  if (soort === 'spullen') {
    d.push(blok([-9, 24, z + 6], [9, 8, 6], 0.8, M.kist, 8));
    d.push(blok([-9, 24, z + 6], [9.3, 0.8, 6.3], 0.3, M.ijzer, 8));
    d.push(blok([10, -22, z + 5.5], [8, 7, 5.5], 0.8, M.kist, 9));
    d.push(kegel([10, 18, z], [10, 18, z + 14], 6.4, 6.4, M.ton, 10));
    d.push(ellips([8, 2, z + 8.5], [6.5, 6, 8.5], M.zak, 11));
    d.push(ellips([-8, -4, z + 8], [6.5, 6.5, 8], M.zak, 12));
    d.push(ellips([-7, -27, z + 7.5], [6, 6, 7.5], M.zak, 13));
    d.push(capsule([-15, 38, z + 4.5], [14, 38.5, z + 4.5], 4.2, M.deken, 14));
  } else if (soort === 'hout') {
    const r = 6.4;
    const rij = [[-14, z + r], [0, z + r], [14, z + r], [-7, z + 3 * r - 1], [7, z + 3 * r - 1]];
    rij.forEach(([x, zz], i) => d.push(stam(x, zz, r - (i % 2) * 0.5, -BAK.l - 9 + (i % 3) * 2, BAK.l - 1 - (i % 2) * 3, 8 + i)));
    for (const y of [-22, 22]) for (const p of bochtProfiel([-BAK.b - 1, y, BAK.rand], [0, y, z + 4 * r + 6], [BAK.b + 1, y, BAK.rand], () => 0.8, 6, M.touw, 15)) d.push(p);
  } else if (soort === 'stenen') {
    for (let i = 0; i < 18; i++) {
      const u = hash(i, 3, 152) / 4294967296;
      const v = hash(i, 4, 152) / 4294967296;
      const w = hash(i, 5, 152) / 4294967296;
      const x = (u - 0.5) * 2 * (BAK.b - 6);
      const y = (v - 0.5) * 2 * (BAK.l - 7);
      const hoop = 1 - Math.hypot(x / BAK.b, y / BAK.l);
      const r = 4.6 + 2.4 * w;
      d.push(ellips([x, y, z + r * 0.75 + hoop * 9], [r * 1.15, r, r * 0.8], M.steen, 8 + (i % 6)));
    }
  } else if (soort === 'zakken') {
    for (const [i, y] of [-28, 0, 28].entries()) {
      for (const s of [-1, 1]) d.push(ellips([s * 10.5, y + s * 1.5, z + 6], [9, 12, 6], M.zak, 8 + i * 2 + (s > 0 ? 1 : 0)));
    }
    d.push(ellips([0, -14, z + 16], [9, 12, 6], M.zak, 14));
    d.push(ellips([1, 14, z + 16], [9, 12, 6], M.zak, 15));
  }
  return d;
}

// kar({ lading, hoek }): het model van de kar zonder os, met de as in de oorsprong. `lading` is een van LADINGEN, `hoek`
// hoe ver de wielen gedraaid zijn.
function kar(o = {}) {
  const soort = o.lading || 'huif';
  const d = [...bak(), ...wiel(-1, o.hoek || 0), ...wiel(1, o.hoek || 0), ...achteraan()];
  if (soort === 'huif') d.push(...huif());
  else d.push(...lading(soort));
  return model(d, materialen(), { midden: [0, 10, 40], straal: 82 });
}

// De os voor de kar, in houding van de kar.
function os(o = {}) {
  const H = HOUDINGEN[o.houding || 'staan'];
  return V.koe({ os: true, juk: true, kleur: o.kleur || 0, houding: H.os, fase: o.fase || 0 });
}

// ---------------------------------------------------------------- tekenen

// Teken de os en de kar in één beeld, om het anker heen, naar richting `kant`. o: { houding, fase, lading, kleur }.
function tekenOssenkar(B, o, kant) {
  const graden = K.RICHTING[kant];
  const a = (graden * Math.PI) / 180;
  const naar = (ly) => ({ gx: (ly * Math.cos(a)) / TEGEL, gy: (ly * Math.sin(a)) / TEGEL });
  const H = HOUDINGEN[o.houding || 'staan'];
  const hoek = o.houding === 'rijden' ? WIEL.draai * (o.fase || 0) : 0;
  K.tekenModel(B, kar({ lading: o.lading, hoek }), { richting: kant, ...naar(-MIDDEN) });
  K.tekenModel(B, os({ houding: o.houding, fase: o.fase, kleur: o.kleur }), { richting: kant, ...naar(OS_Y - MIDDEN) });
  return H;
}

function beeld(o, kant, cel = CEL, anker = ANKER) {
  const B = new K.Beeld(cel[0], cel[1], anker[0], anker[1]);
  tekenOssenkar(B, o, kant);
  K.belicht(B);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}

// de rand van wat er in een beeld staat
function kader(p) {
  let x0 = p.b, x1 = -1, y0 = p.h, y1 = -1;
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.b; x++) {
      if (!p.lees(x, y)) continue;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
  }
  return { x0, x1, y0, y1 };
}

// ---------------------------------------------------------------- de proefplaat

function vergroot(p, n) {
  const uit = new K.Plaat(p.b * n, p.h * n);
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.b; x++) {
      const k = p.lees(x, y);
      if (k) for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) uit.zet(x * n + i, y * n + j, k[0], k[1]);
    }
  }
  return uit;
}

// Op ware grootte: bovenaan de twee ossen los naast een boer, dan de huifkar van vijf kanten, dan de ossenkar met elke
// lading. Daarnaast de rijdende huifkar als bewegend beeld (ossenkar-rijden.png, twee keer vergroot).
function proef() {
  const uit = path.join(__dirname, 'uit');
  fs.mkdirSync(uit, { recursive: true });
  const { boer } = require('./dorpelingen.cjs');
  const man = { p: K.losRenderen(boer({ houding: 'staan', fase: 0 }), { b: FIG_CEL[0], h: FIG_CEL[1], anker: FIG_ANKER, richting: 'Z' }), ay: FIG_ANKER[1] };
  const losOs = (kleur) => ({ p: K.losRenderen(os({ houding: 'staan', fase: 0.1, kleur }), { b: 150, h: 130, anker: [75, 92], richting: 'ZO' }), ay: 92 });
  const kar = (o, kant) => ({ p: beeld(o, kant), ay: ANKER[1] });
  const rijen = [
    [man, losOs(0), losOs(1), { p: K.losRenderen(V.koe({ houding: 'staan', fase: 0.1 }), { b: 150, h: 130, anker: [75, 92], richting: 'ZO' }), ay: 92 }],
    [man, kar({ lading: 'huif' }, 'ZO'), kar({ lading: 'huif' }, 'Z'), kar({ lading: 'huif' }, 'ZW')],
    [kar({ lading: 'huif' }, 'W'), kar({ lading: 'huif' }, 'NO'), kar({ lading: 'huif', houding: 'rijden', fase: 0.5 }, 'O')],
    [kar({ lading: 'spullen' }, 'ZO'), kar({ lading: 'hout' }, 'ZO'), kar({ lading: 'stenen' }, 'ZO')],
    [kar({ lading: 'zakken' }, 'ZO'), kar({ lading: 'leeg' }, 'ZO'), kar({ lading: 'hout', kleur: 1 }, 'ZW')],
  ];
  const RAND = 3;
  const GAT = 6;
  let past = true;
  const maten = rijen.map((rij) => {
    let boven = 0;
    let onder = 0;
    const stukken = rij.map((s) => {
      const k = kader(s.p);
      if (k.x0 <= 0 || k.y0 <= 0 || k.x1 >= s.p.b - 1 || k.y1 >= s.p.h - 1) past = false;
      boven = Math.max(boven, s.ay - k.y0);
      onder = Math.max(onder, k.y1 - s.ay);
      return { ...s, x0: k.x0 - RAND, b: k.x1 - k.x0 + 1 + 2 * RAND };
    });
    return { stukken, boven: boven + RAND, onder: onder + RAND };
  });
  const breed = Math.max(...maten.map((r) => r.stukken.reduce((som, s) => som + s.b + GAT, 0)));
  const hoog = maten.reduce((som, r) => som + r.boven + r.onder + 1, 0) + GAT * (maten.length - 1);
  const plaat = new K.Plaat(breed, hoog);
  let y = 0;
  for (const r of maten) {
    let x = 0;
    for (const s of r.stukken) {
      plaat.plak(s.p.uitsnede(s.x0, s.ay - r.boven, s.b, r.boven + r.onder + 1), x, y);
      x += s.b + GAT;
    }
    y += r.boven + r.onder + 1 + GAT;
  }
  fs.writeFileSync(path.join(uit, 'ossenkar-proef.png'), K.png(plaat, 1, '#5e6a44'));
  console.log(`uit/ossenkar-proef.png (${plaat.b}×${plaat.h}); cel ${CEL.join('×')}, anker ${ANKER.join(',')}`);
  if (!past) console.log('LET OP: een beeld raakt de rand van zijn cel');
  // de rijdende huifkar, met de grond eronder als kleur, twee keer vergroot
  const H = HOUDINGEN.rijden;
  const beelden = [];
  for (let i = 0; i < H.beelden; i++) beelden.push(vergroot(beeld({ lading: 'huif', houding: 'rijden', fase: i / H.beelden }, 'ZW'), 2));
  fs.writeFileSync(path.join(uit, 'ossenkar-rijden.png'), apng(beelden, { fps: H.fps, achtergrond: '#5e6a44' }));
  console.log(`uit/ossenkar-rijden.png (${H.beelden} beelden, ${H.fps} per seconde)`);
}

module.exports = { kar, os, tekenOssenkar, beeld, HOUDINGEN, LADINGEN, SNELHEID, WIEL, BAK, HUIF, OS_Y, MIDDEN, CEL, ANKER };

if (require.main === module) proef();
