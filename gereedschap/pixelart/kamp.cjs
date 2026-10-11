// Het kamp van het lege begin (ontwerp/werklijst.md, vraag 152; Marcel, 11 okt: "Tent en afdak"): waar de gezinnen
// slapen tot er hutten zijn. Een tent van linnen op twee palen, met de flappen opzij gebonden, scheerlijnen en haringen
// (van hetzelfde linnen als het zeil van de huifkar, ossenkar.cjs); een afdak van takken op twee gaffels, met huiden
// erover en stro eronder; en het kampvuur: de vuurkuil van de kolenbrander (bosgebied.cjs) met vlammen en een driepoot
// met een ketel.
//
// De tent en het afdak zijn voorwerpen, maar met een open kant: elk in vier richtingen (de opening naar ZO, ZW, NW of
// NO, langs de tegels, zoals de deur van een huis). Het kampvuur is één tekening, in drie standen: het brandt (acht
// beelden), het smeult (de kolen gloeien), of het is uit (koude as). Het model kijkt naar +y: daar is de opening. Het
// anker is het midden van de tegel, op de grond.
//
//   node gereedschap/pixelart/kamp.cjs           (de proefplaat: uit/kamp-proef.png, en uit/kampvuur.png bewegend)
//   node gereedschap/pixelart/kamp.cjs --plein   (het kamp met de huifkar, zoals het op het plein kan staan)
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const { sdf, klem, mix, ruis3, rnd } = K;
const { model, kegel, capsule, ellips, naarRamp } = require('./figuren.cjs');
const Bm = require('./bomen.cjs');
const { vuurkuil } = require('./bosgebied.cjs');
const { apng } = require('./apng.cjs');

// ---------------------------------------------------------------- maten

// Een tent voor een gezin: twee meter lang, anderhalve breed, de nok op 1,4 meter (een eenheid is zo'n twee centimeter).
const TENT = { l: 50, b: 40, nok: 68, zak: 3.5, deur: 0.42, lijn: 26 };
// Het afdak: anderhalve meter breed, de voorkant op 1,2 meter, het dak schuin naar achteren tot de grond.
const AFDAK = { b: 40, voor: 24, achter: -40, hoog: 58 };
// De huiden erop, elk met zijn plek op het dak (u dwars, v langs de helling vanaf de grond), zijn halve maten, hoe ver hij
// boven het dak ligt (de laatste ligt bovenop), en zijn kleur: een koe, een geit, een schaap en een rund.
const HUIDEN = [
  { u: -18, v: 22, a: 23, b: 20, w: 2.2, ramp: 'leer', lo: 1.6, hi: 5.4, pluk: 0.5 },
  { u: 17, v: 25, a: 22, b: 21, w: 3.1, ramp: 'vacht', lo: 0.6, hi: 3.6, pluk: 0.6 },
  { u: -13, v: 60, a: 25, b: 21, w: 4.0, ramp: 'bot', lo: 2.4, hi: 6.0, pluk: 0.9 },
  { u: 20, v: 63, a: 20, b: 20, w: 4.9, ramp: 'jas', lo: 1.4, hi: 5.0, pluk: 0.5 },
];
// Het kampvuur: de kring stenen, de vlammen en de driepoot.
const VUUR = { straal: 19, tongen: 6, hoog: 26, poot: 64, ketel: 20 };
const VUUR_BEELDEN = 8;
const VUUR_FPS = 10;

const RICHTINGEN = ['ZO', 'ZW', 'NW', 'NO'];
const CEL = [224, 160];
const ANKER = [112, 112];
const VUUR_CEL = [80, 112];
const VUUR_ANKER = [40, 88];
const FIG_CEL = [112, 124];
const FIG_ANKER = [56, 110];

// ---------------------------------------------------------------- materialen

const M = { linnen: 0, paal: 1, touw: 2, binnen: 3, stro: 4, deken: 5, huid: 6 };

function materialen(o = {}) {
  const mat = [];
  // Hetzelfde linnen als het zeil van de huifkar; een tent van bruin wol (`bruin`) is van een armer gezin.
  const [ramp, LO, HI] = o.bruin ? ['jas', 1.4, 4.8] : ['bot', 1.8, 5.2];
  mat[M.linnen] = {
    ramp,
    lo: LO,
    hi: HI,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      const lap = ruis3(x * 0.075 + 3, y * 0.075, z * 0.075, (o.zaad || 1) * 7) > 0.8;
      if (lap) return naarRamp(o.bruin ? 'bot' : 'jas', stap, [LO, HI], o.bruin ? [1.4, 4.4] : [2.0, 5.2]);
      let p = Math.sin(y * 0.6 + ruis3(x * 0.1, y * 0.1, z * 0.1, 5) * 4) > 0.8 ? -0.5 : 0;
      p += (ruis3(x * 0.15, y * 0.15, z * 0.15, 4) - 0.5) * 0.8;
      if (z < 6) p -= 0.7;
      return p;
    },
  };
  mat[M.paal] = Bm.schorsMat({ zaad: 3, lo: 1.2, hi: 4.8 });
  mat[M.touw] = { ramp: 'hout', lo: 2.2, hi: 4.8 };
  mat[M.binnen] = { ramp: 'aarde', lo: 0.2, hi: 1.6 };
  mat[M.stro] = { ramp: 'stro', lo: 1.6, hi: 5.4, patroon: (x, y) => (Math.sin(x * 1.3 + y * 0.4) > 0.6 ? -0.8 : 0) };
  mat[M.deken] = { ramp: 'rood', lo: 1.4, hi: 5.0, patroon: (x) => (((x + 40) % 6) < 1.2 ? -1.2 : 0) };
  // De huiden op het afdak, elk van een ander dier (HUIDEN): de haren in plukjes.
  HUIDEN.forEach((h, i) => {
    mat[M.huid + i] = { ramp: h.ramp, lo: h.lo, hi: h.hi, patroon: (x, y, z) => (ruis3(x * h.pluk, y * h.pluk, z * h.pluk, 30 + i) > 0.62 ? -0.9 : 0) };
  });
  return mat;
}

// een paal of tak, licht scheef
const stok = (a, b, r, deel) => Bm.tak([a, b], [r, r * 0.85], M.paal, deel, 0);
// een haring in de grond, met een lijn ernaartoe
function lijn(van, naar, deel) {
  return [capsule(van, naar, 0.45, M.touw, deel), kegel([naar[0], naar[1], -1], [naar[0], naar[1], 4], 0.9, 0.6, M.paal, deel)];
}

// ---------------------------------------------------------------- de tent

// tent({ bruin, zaad }): een nokentent, de deur naar +y.
function tent(o = {}) {
  const { l, b, nok, zak, deur } = TENT;
  const d = [];
  const nokOp = (y) => nok - zak * (1 - (y / l) ** 2);
  d.push({
    f: (x, y, z) => {
      const h = nokOp(klem(y, -l, l));
      const t = klem(z / h, 0, 1);
      // het schuine vlak van de nok tot de grond, dat tussen nok en grond een beetje naar binnen zakt
      const vlak = (h * Math.abs(x) + b * z - b * h) / Math.hypot(h, b) + 1.4 * Math.sin(Math.PI * t);
      return Math.max(vlak, -z, Math.abs(y) - l);
    },
    g: [0, 0, nok / 2, Math.hypot(b, l, nok / 2) + 2],
    m: M.linnen,
    deel: 1,
  });
  // de deur: een driehoek in de voorkant, met het donker van de tent erachter
  const deurTop = nok * 0.82;
  d.push({
    f: (x, y, z) => Math.max((Math.abs(x) - b * deur * (1 - z / deurTop)) * 0.9, z - deurTop, -z - 1, l - 7 - y),
    g: [0, l - 2, deurTop / 2, deurTop / 2 + b * deur + 6],
    m: M.binnen,
    uit: true,
  });
  // de flappen, opgerold aan weerskanten van de deur en vastgebonden
  for (const s of [-1, 1]) {
    d.push(capsule([s * b * deur * 1.05, l + 0.8, 2.5], [s * 2.2, l + 0.8, deurTop - 1], 2.1, M.linnen, 2));
    d.push(capsule([s * b * deur * 0.62 + s * 0.6, l + 1.4, deurTop * 0.42 - 1], [s * b * deur * 0.62 + s * 0.6, l + 1.4, deurTop * 0.42 + 1], 2.5, M.touw, 3));
  }
  // de palen en de nokbalk, die er een eindje boven uitsteken
  for (const s of [-1, 1]) d.push(stok([0, s * (l + 0.6), -1], [0, s * (l + 0.6), nok + 5], 1.4, 4));
  d.push(capsule([0, -l - 1.5, nok + 0.6], [0, l + 1.5, nok + 0.6], 1.2, M.paal, 4));
  // scheerlijnen: van de top van elke paal naar voren en naar achteren, en van de zoom opzij
  for (const s of [-1, 1]) d.push(...lijn([0, s * (l + 0.6), nok + 3.5], [0, s * (l + TENT.lijn), 0.5], 5));
  for (const s of [-1, 1]) for (const y of [-l * 0.65, 0, l * 0.65]) d.push(...lijn([s * (b - 1), y, 3], [s * (b + 13), y * 1.05, 0.5], 5));
  // een bundel en een ketel naast de deur
  d.push(capsule([b * 0.62, l + 7, 4], [b * 0.62 + 7, l + 4, 4], 3.6, M.deken, 6));
  d.push(Bm.onderGrond);
  return model(d, materialen(o), Bm.omhul(d));
}

// ---------------------------------------------------------------- het afdak

// afdak(): een schuin dak van takken met huiden erover, op twee gaffels, open naar +y, met stro eronder.
function afdak(o = {}) {
  const { b, voor, achter, hoog } = AFDAK;
  const d = [];
  // het vlak van het dak: van de dwarspaal (voor, hoog) schuin naar de grond (achter); v langs de helling, w erboven
  const lang = Math.hypot(hoog, voor - achter);
  const ty = (voor - achter) / lang;
  const tz = hoog / lang;
  const opDak = (y) => (hoog * (y - achter)) / (voor - achter);
  const dakPunt = (u, v, w) => [u, achter + v * ty - w * tz, v * tz + w * ty];
  // de gaffels en de dwarspaal
  for (const s of [-1, 1]) {
    d.push(stok([s * b, voor, -1], [s * b * 1.02, voor + 1, hoog + 2], 1.8, 1));
    d.push(stok([s * b * 1.02, voor + 1, hoog - 3], [s * b * 1.02 + s * 2.5, voor + 2, hoog + 5], 1.1, 1));
  }
  d.push(stok([-b - 7, voor + 1, hoog + 1.5], [b + 7, voor + 1.5, hoog + 1], 1.7, 2));
  // de takken van het dak, van de dwarspaal naar achteren op de grond, en dwars erover een paar dunne
  for (let i = 0; i < 6; i++) {
    const x = -b + (i * 2 * b) / 5 + (rnd(i, 1, 5) - 0.5) * 3;
    d.push(stok([x, voor + 5, hoog + 3.5], [x * 1.04, achter - 4, -1], 1.25, 3));
  }
  for (const v of [14, 40, 70]) d.push(stok(dakPunt(-b - 4, v, 1.2), dakPunt(b + 4, v + 2, 1.2), 0.8, 3));
  // de huiden: elk een vel met vier pootjes en een rafelige rand, op elkaar
  HUIDEN.forEach((h, i) => {
    const pootjes = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([su, sv]) => [h.u + su * h.a * 0.92, h.v + sv * h.b * 0.88]);
    d.push({
      f: (x, y, z) => {
        const v = (y - achter) * ty + z * tz;
        const w = -(y - achter) * tz + z * ty;
        const du = (x - h.u) / h.a;
        const dv = (v - h.v) / h.b;
        // een kussenvorm: in het midden van elke kant iets ingesnoerd, met een rafelige rand
        const rand = (Math.pow(Math.abs(du) ** 3 + Math.abs(dv) ** 3, 1 / 3) - 1) * Math.min(h.a, h.b) * 0.8 + (ruis3(x * 0.2, v * 0.2, i, 25) - 0.5) * 2.2;
        let vel = rand;
        for (const [pu, pv] of pootjes) vel = Math.min(vel, Math.hypot((x - pu) / 1.6, (v - pv) / 1) * 3.2 - 3.2);
        return Math.max(vel, Math.abs(w - h.w) - 0.9) * 0.75;
      },
      g: [...dakPunt(h.u, h.v, h.w), Math.hypot(h.a, h.b) + 6],
      m: M.huid + i,
      deel: 10 + i,
    });
  });
  // twee takken over de huiden, die ze vasthouden
  for (const v of [44, 78]) d.push(stok(dakPunt(-b - 2, v, 6.4), dakPunt(b + 2, v - 3, 6.4), 1.1, 4));
  // de zijkanten dicht met een huid, tot onder het dak (van voren zie je het dak bijna op de kant, de zijkant wel), en
  // takken ertegen
  for (const s of [-1, 1]) {
    const x0 = s * (b + 1.6);
    d.push({
      f: (x, y, z) => {
        const top = opDak(y) - 1 + (ruis3(y * 0.15, 0, s, 27) - 0.5) * 3;
        const voorRand = voor - 4 - (1 - z / hoog) * 8 + (ruis3(z * 0.15, 1, s, 28) - 0.5) * 3;
        return Math.max(Math.abs(x - x0) - 0.9, z - top, y - voorRand, achter + 3 - y, -z) * 0.8;
      },
      g: [x0, (voor + achter) / 2, hoog / 2, Math.hypot(voor - achter, hoog) / 2 + 4],
      m: M.huid + (s < 0 ? 2 : 0),
      deel: 14 + (s < 0 ? 0 : 1),
    });
  }
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const y = mix(achter + 10, voor - 2, i / 3);
      d.push(stok([s * (b + 6 - i), y - 4, -1], [s * (b - 1), y + 3, opDak(y) + 2], 0.9, 6));
    }
  }
  // het stro om op te slapen, en een opgerolde deken
  d.push({ f: (x, y, z) => Math.max(sdf.ellipsoide(x, y - (achter + voor) / 2 - 4, z, b - 6, (voor - achter) / 2 - 10, 3), -z), g: [0, 0, 1, b + 4], m: M.stro, deel: 7 });
  d.push(capsule([-b * 0.4, voor - 6, 4], [b * 0.1, voor - 4, 4], 3.6, M.deken, 8));
  d.push(Bm.onderGrond);
  return model(d, materialen(o), Bm.omhul(d));
}

// ---------------------------------------------------------------- het kampvuur

// kampvuur({ stand, fase }): stand 'brandt', 'smeult' of 'uit'.
function kampvuur(o = {}) {
  const stand = o.stand || 'brandt';
  const v = vuurkuil(4, { straal: VUUR.straal });
  const delen = v.delen.filter((p) => p !== Bm.onderGrond);
  const mat = v.mat.slice();
  if (stand === 'uit') {
    // de kolen zijn koud: as en kool
    for (const p of delen) if (p.deel === 9) p.m = 1;
  }
  const hout = mat.push(Bm.schorsMat({ zaad: 9, lo: 1.2, hi: 4.6 })) - 1;
  const ijzer = mat.push({ ramp: 'ijzer', lo: 0.2, hi: 2.4, glans: 1.4 }) - 1;
  const fase = o.fase || 0;
  if (stand === 'brandt') {
    // de tongen: elk een spits uit de kolen, die op en neer gaat en opzij wiegt; onderaan heet, de punt donker
    const vlam = mat.push({ ramp: 'vuur', gloei: (x, y, z) => klem(7.2 - (z / VUUR.hoog) * 4.6, 2.2, 7.4) }) - 1;
    for (let i = 0; i < VUUR.tongen; i++) {
      const a = (i / VUUR.tongen) * Math.PI * 2 + rnd(i, 2, 152) * 0.8;
      const r = i === 0 ? 0 : 4 + rnd(i, 3, 152) * 5;
      const c = [Math.cos(a) * r, Math.sin(a) * r];
      const f = 2 * Math.PI * (fase + rnd(i, 4, 152));
      const h = VUUR.hoog * (i === 0 ? 1 : 0.55 + 0.3 * rnd(i, 5, 152)) * (1 + 0.22 * Math.sin(f) + 0.1 * Math.sin(2 * f + 1));
      const opzij = 2.6 * Math.sin(f + 0.8);
      delen.push(kegel([c[0], c[1], 3], [c[0] + opzij, c[1] + opzij * 0.4, 3 + h], i === 0 ? 5.2 : 3.4, 0.4, vlam, 10 + i));
    }
  }
  // de driepoot met de ketel aan een ketting
  const top = [0, 0, VUUR.poot];
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    delen.push(Bm.tak([[Math.cos(a) * (VUUR.straal + 7), Math.sin(a) * (VUUR.straal + 7), -1], [top[0] - Math.cos(a) * 2, top[1] - Math.sin(a) * 2, top[2] + 3]], [1.4, 1.1], hout, 20, 0));
  }
  delen.push(capsule([0, 0, VUUR.poot - 1], [0, 0, VUUR.ketel + 9], 0.5, ijzer, 21));
  delen.push(ellips([0, 0, VUUR.ketel + 3.5], [6.2, 6.2, 5.4], ijzer, 21));
  delen.push({ f: (x, y, z) => Math.max(sdf.torus(x, y, z - VUUR.ketel - 7.6, 5.4, 0.7), -1e3), g: [0, 0, VUUR.ketel + 7.6, 7], m: ijzer, deel: 21 });
  delen.push(Bm.onderGrond);
  return model(delen, mat, { ...Bm.omhul(delen), lichten: stand === 'uit' ? [] : v.lichten });
}

// ---------------------------------------------------------------- tekenen

function teken(m, cel, anker, kant) {
  const B = new K.Beeld(cel[0], cel[1], anker[0], anker[1]);
  K.tekenModel(B, m, { richting: kant });
  K.belicht(B);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}

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

// ---------------------------------------------------------------- de proefplaat

// Op ware grootte: de tent (linnen en bruin) en het afdak in de vier richtingen, het kampvuur in zijn drie standen, en
// een boer ernaast; daaronder het kamp zoals het op het plein kan staan, twee keer vergroot.
function proef() {
  const uit = path.join(__dirname, 'uit');
  fs.mkdirSync(uit, { recursive: true });
  const { boer } = require('./dorpelingen.cjs');
  const man = { p: K.losRenderen(boer({ houding: 'staan', fase: 0 }), { b: FIG_CEL[0], h: FIG_CEL[1], anker: FIG_ANKER, richting: 'Z' }), ay: FIG_ANKER[1] };
  const vuur = (stand, fase = 0) => ({ p: teken(kampvuur({ stand, fase }), VUUR_CEL, VUUR_ANKER, 'Z'), ay: VUUR_ANKER[1] });
  const stuk = (m, kant) => ({ p: teken(m, CEL, ANKER, kant), ay: ANKER[1] });
  const rijen = [
    [man, ...RICHTINGEN.map((k) => stuk(tent(), k))],
    [man, stuk(tent({ bruin: true, zaad: 2 }), 'ZW'), stuk(tent({ bruin: true, zaad: 2 }), 'NO')],
    [man, ...RICHTINGEN.map((k) => stuk(afdak(), k))],
    [man, vuur('brandt', 0), vuur('brandt', 0.375), vuur('smeult'), vuur('uit')],
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
  fs.writeFileSync(path.join(uit, 'kamp-proef.png'), K.png(plaat, 1, '#5e6a44'));
  console.log(`uit/kamp-proef.png (${plaat.b}×${plaat.h})`);
  if (!past) console.log('LET OP: een beeld raakt de rand van zijn cel');
  const beelden = [];
  for (let i = 0; i < VUUR_BEELDEN; i++) beelden.push(vergroot(teken(kampvuur({ stand: 'brandt', fase: i / VUUR_BEELDEN }), VUUR_CEL, VUUR_ANKER, 'Z'), 3));
  fs.writeFileSync(path.join(uit, 'kampvuur.png'), apng(beelden, { fps: VUUR_FPS, achtergrond: '#5e6a44' }));
  console.log(`uit/kampvuur.png (${VUUR_BEELDEN} beelden, ${VUUR_FPS} per seconde)`);
}

// Het kamp zoals het op het plein kan staan, twee keer vergroot (uit/kamp-plein.png): het vuur in het midden, de tenten
// en de afdakken eromheen met hun opening ernaartoe, de huifkar ernaast, en een gezin bij het vuur. Alleen om te kijken:
// waar het in het spel staat, beslist het spel.
function plein() {
  const O = require('./ossenkar.cjs');
  const { boer } = require('./dorpelingen.cjs');
  const { boerin, jongen, meisje, kleuter } = require('./dorpelingen2.cjs');
  const stukken = [];
  const zet = (gx, gy, p, anker) => stukken.push({ gx, gy, p, anker });
  // wie bij het vuur staat, kijkt ernaar
  const naarVuur = (gx, gy) => {
    const graden = ((Math.atan2(-gy, -gx) * 180) / Math.PI + 360) % 360;
    return K.KANTEN.reduce((beste, k) => {
      const a = Math.abs(((K.RICHTING[k] - graden + 540) % 360) - 180);
      return a < beste[1] ? [k, a] : beste;
    }, ['Z', 1e9])[0];
  };
  const mens = (maak, gx, gy) => zet(gx, gy, K.losRenderen(maak({ houding: 'staan', fase: 0 }), { b: FIG_CEL[0], h: FIG_CEL[1], anker: FIG_ANKER, richting: naarVuur(gx, gy) }), FIG_ANKER);
  zet(0, 0, teken(kampvuur({ stand: 'brandt', fase: 0.25 }), VUUR_CEL, VUUR_ANKER, 'Z'), VUUR_ANKER);
  zet(-4.6, -0.4, teken(tent(), CEL, ANKER, 'ZO'), ANKER);
  zet(0.2, -4.8, teken(tent({ bruin: true, zaad: 2 }), CEL, ANKER, 'ZW'), ANKER);
  zet(4.2, 0.6, teken(afdak(), CEL, ANKER, 'NW'), ANKER);
  zet(-0.6, 4.4, teken(afdak(), CEL, ANKER, 'NO'), ANKER);
  zet(5.6, -2.6, O.beeld({ lading: 'huif' }, 'ZW'), O.ANKER);
  mens(boer, -1.3, 1.2);
  mens(boerin, 1.4, -0.9);
  mens(jongen, 0.5, -2.0);
  mens(meisje, -1.8, -0.5);
  mens(kleuter, 1.9, 0.4);
  // van achter naar voren
  stukken.sort((a, b) => a.gx + a.gy - (b.gx + b.gy));
  const scherm = (s) => [Math.round((s.gx - s.gy) * 32) - s.anker[0], Math.round((s.gx + s.gy) * 16) - s.anker[1]];
  let [x0, y0, x1, y1] = [1e9, 1e9, -1e9, -1e9];
  for (const s of stukken) {
    const [x, y] = scherm(s);
    const k = kader(s.p);
    x0 = Math.min(x0, x + k.x0);
    y0 = Math.min(y0, y + k.y0);
    x1 = Math.max(x1, x + k.x1);
    y1 = Math.max(y1, y + k.y1);
  }
  const R = 10;
  const plaat = new K.Plaat(x1 - x0 + 1 + 2 * R, y1 - y0 + 1 + 2 * R);
  for (const s of stukken) {
    const [x, y] = scherm(s);
    plaat.plak(s.p, x - x0 + R, y - y0 + R);
  }
  const uit = path.join(__dirname, 'uit');
  fs.writeFileSync(path.join(uit, 'kamp-plein.png'), K.png(vergroot(plaat, 2), 1, '#5e6a44'));
  console.log(`uit/kamp-plein.png (${plaat.b * 2}×${plaat.h * 2})`);
}

module.exports = { tent, afdak, kampvuur, teken, plein, RICHTINGEN, CEL, ANKER, VUUR_CEL, VUUR_ANKER, VUUR_BEELDEN, VUUR_FPS };

if (require.main === module) {
  if (process.argv.includes('--plein')) plein();
  else proef();
}
