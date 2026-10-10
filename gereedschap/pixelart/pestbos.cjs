// De pestbos (ontwerp/werklijst.md, vraag 144, 3; Marcel, 10 okt: "Ja, zo"): een bos stro aan een paal naast de deur van
// een huis met een zieke, zodat het dorp weet dat het daar uit de buurt moet blijven (js/koorts.js, T.pestbossen). Een
// ruwe paal tot de schouder van een dorpeling, met bovenaan een bos stro die eromheen gebonden is en naar onderen
// uitwaaiert, een paar halmen die boven het touw uitsteken, en de paal in een hoopje aarde.
//
// Eén tekening, geen delen, op beelden/pestbos.png (naar-spel.cjs --alleen pestbos), zoals het paaltje (paaltje.cjs): een
// voorwerp draait niet mee. Het model kijkt naar Z: lokaal +y is naar de camera, +x is links in beeld, z omhoog. Het
// anker is het midden van de tegel, op de grond.
//
//   node gereedschap/pixelart/pestbos.cjs    (de proefplaat: uit/pestbos-proef.png)
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const { sdf, klem, ruis3 } = K;
const { model } = require('./figuren.cjs');

// ---------------------------------------------------------------- maten

const CEL = [28, 62];
const ANKER = [14, 54];
// Zo tekent het spel de figuren (dorpelingen-anim.cjs), voor de proefplaat.
const FIG_CEL = [112, 124];
const FIG_ANKER = [56, 110];

const S2 = Math.SQRT1_2;

// De paal, een fractie scheef; de bos hangt om zijn top (`touw`: waar hij vastgebonden is), tot `onder`, en waaiert uit
// tot `wijd`; boven het touw steken de halmen nog `pluim` uit.
const PAAL = { top: 44, half: 1.2, leunX: 1.2, leunY: -0.4 };
const BOS = { touw: 41, onder: 24, smal: 1.9, wijd: 5.6, pluim: 4.5 };

// ---------------------------------------------------------------- materialen

const M = { hout: 0, stro: 1, touw: 2, aarde: 3, kei: 4 };

const materialen = () => {
  const mat = [];
  // Ruw hout, grijsbruin zoals het paaltje, onderaan donkerder.
  mat[M.hout] = { ramp: 'schors', lo: 2.3, hi: 6.6, patroon: (x, y, z) => (z < 6 ? -(6 - z) * 0.1 : 0) };
  // Stro: halmen in de lengte, elk een eigen tint, naar onderen wat donkerder, want daar komt het licht er minder bij.
  mat[M.stro] = {
    ramp: 'stro',
    lo: 2.4,
    hi: 6.8,
    omslag: 0.35,
    patroon: (x, y, z) => {
      const as = paalAs(z);
      const a = Math.atan2(y - as[1], x - as[0]);
      let p = Math.sin(a * 17 + ruis3(a * 2, z * 0.05, 1, 31) * 5) > 0.45 ? -1.3 : 0;
      p += (ruis3(a * 5, z * 0.2, 2, 32) - 0.5) * 1.2;
      if (z < BOS.onder + 4) p -= 0.5;
      return p;
    },
  };
  mat[M.touw] = { ramp: 'schors', lo: 1.6, hi: 4.4 };
  mat[M.aarde] = { ramp: 'aarde', lo: 2.0, hi: 5.8, patroon: (x, y, z) => (ruis3(x * 0.7, y * 0.7, z * 0.6, 21) > 0.62 ? -0.8 : 0) };
  mat[M.kei] = { ramp: 'bot', lo: 1.4, hi: 4.6 };
  return mat;
};

// ---------------------------------------------------------------- de paal

function paalAs(z) {
  const t = klem(z / PAAL.top, 0, 1.2);
  return [PAAL.leunX * t, PAAL.leunY * t, z];
}
function paalDeel() {
  return {
    f: (x, y, z) => {
      const as = paalAs(z);
      const dx = x - as[0];
      const dy = y - as[1];
      // langs de kaart, zoals het paaltje: een afgerond vierkant, een kwartslag gedraaid
      const zij = sdf.doos((dx - dy) * S2, (dx + dy) * S2, 0, PAAL.half, PAAL.half, 1e3, 0.5);
      return Math.max(zij, z - PAAL.top, -z - 2) * 0.9;
    },
    g: [PAAL.leunX / 2, PAAL.leunY / 2, PAAL.top / 2, PAAL.top / 2 + 4],
    m: M.hout,
    deel: 1,
  };
}

// ---------------------------------------------------------------- de bos

// Een kegel van stro om de paal, smal bij het touw en wijd onderaan, met een rafelige onderrand; erboven een pluim van
// halmen die het touw bijeenhoudt.
function bosDeel() {
  const hoog = BOS.touw - BOS.onder;
  return {
    f: (x, y, z) => {
      const as = paalAs(z);
      const dx = x - as[0];
      const dy = y - as[1];
      const r = Math.hypot(dx, dy);
      const a = Math.atan2(dy, dx);
      let d;
      if (z >= BOS.touw) {
        // de pluim: een kort, iets uitwaaierend stuk boven het touw, met een rafelige top
        const t = klem((z - BOS.touw) / BOS.pluim, 0, 1);
        const top = BOS.touw + BOS.pluim * (0.45 + 0.55 * Math.abs(Math.sin(a * 4 + ruis3(a, 0, 0, 41) * 3)));
        d = Math.max(r - (BOS.smal + 0.9 * t), z - top);
      } else {
        // de rok: van smal tot wijd, iets bol, met een onderrand die per halm verschilt
        const t = klem((BOS.touw - z) / hoog, 0, 1);
        const straal = BOS.smal + (BOS.wijd - BOS.smal) * Math.pow(t, 1.25) + Math.sin(a * 5 + 1) * 0.35 * t;
        const rand = BOS.onder + (ruis3(a * 4, 0, 0, 42) - 0.5) * 4.5 + (Math.sin(a * 13 + 2) > 0.35 ? -2.2 : 0.6);
        d = Math.max(r - straal, rand - z);
      }
      return d * 0.8;
    },
    g: [PAAL.leunX, PAAL.leunY, (BOS.onder + BOS.touw + BOS.pluim) / 2, (hoog + BOS.pluim) / 2 + BOS.wijd + 3],
    m: M.stro,
    deel: 2,
  };
}

// Losse halmen: een paar die onder de rok uithangen en een paar die boven het touw uitsteken, zodat de bos rafelig is.
function halmenDeel() {
  const halmen = [];
  for (let i = 0; i < 9; i++) {
    const a = -0.4 + i * 0.42 + Math.sin(i * 2.3) * 0.15;
    const r0 = BOS.wijd - 1.2;
    const z0 = BOS.onder + 3;
    const lang = 4 + 3 * Math.abs(Math.sin(i * 1.7));
    const uit = 0.9 + 0.6 * Math.sin(i * 3.1);
    halmen.push([[Math.cos(a) * r0, Math.sin(a) * r0, z0], [Math.cos(a) * (r0 + uit), Math.sin(a) * (r0 + uit), z0 - lang]]);
  }
  for (let i = 0; i < 6; i++) {
    const a = 0.2 + i * 1.05;
    const r0 = BOS.smal - 0.6;
    const z0 = BOS.touw + 1;
    halmen.push([[Math.cos(a) * r0, Math.sin(a) * r0, z0], [Math.cos(a) * (r0 + 1.4), Math.sin(a) * (r0 + 1.4), z0 + BOS.pluim + 1.5 + Math.sin(i * 2.1)]]);
  }
  return {
    f: (x, y, z) => {
      const as = paalAs(z);
      const px = x - as[0];
      const py = y - as[1];
      let d = 1e9;
      for (const [p, q] of halmen) d = Math.min(d, sdf.capsule(px, py, z, p[0], p[1], p[2], q[0], q[1], q[2], 0.5));
      return d;
    },
    g: [PAAL.leunX, PAAL.leunY, (BOS.onder + BOS.touw) / 2, (BOS.touw - BOS.onder) / 2 + BOS.pluim + BOS.wijd + 6],
    m: M.stro,
    deel: 6,
  };
}

// Het touw om de bos, net onder de pluim.
function touwDeel() {
  return {
    f: (x, y, z) => {
      const as = paalAs(z);
      const r = Math.hypot(x - as[0], y - as[1]);
      return sdf.doos(r - (BOS.smal + 0.35), 0, z - (BOS.touw - 0.4), 0.45, 1e3, 0.7, 0.3) * 0.85;
    },
    g: [PAAL.leunX, PAAL.leunY, BOS.touw, BOS.smal + 3],
    m: M.touw,
    deel: 3,
  };
}

// ---------------------------------------------------------------- de aarde

function hoop() {
  const delen = [];
  delen.push({
    f: (x, y, z) => {
      const d = sdf.ellipsoide(x, y - 0.3, z + 0.4, 4.8, 4.2, 2.2) + (ruis3(x * 0.55, y * 0.55, z * 0.5, 9) - 0.5) * 1.1;
      return Math.max(d, -z - 0.2);
    },
    g: [0, 0, 1, 7],
    m: M.aarde,
    deel: 4,
  });
  for (const [cx, cy, s] of [[3.8, 2.0, 0.8], [-3.1, 3.0, 0.7]]) {
    delen.push({ f: (x, y, z) => sdf.ellipsoide(x - cx, y - cy, z - s * 0.3, s * 1.3, s * 1.1, s * 0.8), g: [cx, cy, s * 0.3, s * 1.6], m: M.kei, deel: 5 });
  }
  return delen;
}

// ---------------------------------------------------------------- het model en het vel

function pestbos() {
  const delen = [paalDeel(), bosDeel(), halmenDeel(), touwDeel(), ...hoop()];
  return model(delen, materialen(), { midden: [0, 0, 24], straal: 32 });
}

function vel() {
  const B = new K.Beeld(CEL[0], CEL[1], ANKER[0], ANKER[1]);
  K.tekenModel(B, pestbos(), { richting: 'Z' });
  K.belicht(B);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}

// Wat in beelden/beschrijving.json komt (naar-spel.cjs): het bestand, de maat van de cel en het anker.
function beschrijving(bestand) {
  return { bestand, cel: CEL, anker: ANKER };
}

// ---------------------------------------------------------------- de proefplaat

// Een boer naast de pestbos, zoals het spel ze tekent, drie keer vergroot; ernaast de bos alleen, zes keer. Zegt ook
// hoeveel pixels de tekening van de rand van zijn cel afblijft.
function proef() {
  const cel = vel();
  const { boer } = require('./dorpelingen.cjs');
  const figuur = K.losRenderen(boer({ houding: 'staan', fase: 0 }), { b: FIG_CEL[0], h: FIG_CEL[1], anker: FIG_ANKER, richting: 'Z' });
  const stuk = new K.Plaat(160, 130);
  const legOp = (p, anker, gx, gy) => stuk.plak(p, 80 + (gx - gy) * 32 - anker[0], 112 + (gx + gy) * 16 - anker[1]);
  legOp(cel, ANKER, 0, 0);
  legOp(figuur, FIG_ANKER, 1, 0);
  const vergroot = (p, n) => {
    const uit = new K.Plaat(p.b * n, p.h * n);
    for (let y = 0; y < p.h; y++) {
      for (let x = 0; x < p.b; x++) {
        const k = p.lees(x, y);
        if (k) for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) uit.zet(x * n + i, y * n + j, k[0], k[1]);
      }
    }
    return uit;
  };
  const links = vergroot(stuk, 3);
  const groot = vergroot(cel, 6);
  const plaat = new K.Plaat(links.b + 24 + groot.b + 12, Math.max(links.h, groot.h + 24));
  plaat.plak(links, 0, 0);
  plaat.plak(groot, links.b + 24, 12);
  const uit = path.join(__dirname, 'uit');
  fs.mkdirSync(uit, { recursive: true });
  fs.writeFileSync(path.join(uit, 'pestbos-proef.png'), K.png(plaat, 1, '#5e6a44'));
  let [x0, x1, y0, y1] = [cel.b, -1, cel.h, -1];
  for (let y = 0; y < cel.h; y++) {
    for (let x = 0; x < cel.b; x++) {
      if (!cel.lees(x, y)) continue;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
  }
  const r = { boven: y0, links: x0, rechts: cel.b - 1 - x1, onder: cel.h - 1 - y1 };
  console.log(`uit/pestbos-proef.png (${plaat.b}×${plaat.h}); cel ${CEL.join('×')}, anker ${ANKER.join(',')}, ruimte ${JSON.stringify(r)}`);
  if (Math.min(r.boven, r.links, r.rechts, r.onder) < 1) console.log('LET OP: de tekening raakt de rand van zijn cel');
}

module.exports = { pestbos, vel, beschrijving, proef, CEL, ANKER };

if (require.main === module) proef();
