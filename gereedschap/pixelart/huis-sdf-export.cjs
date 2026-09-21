'use strict';
// huis-sdf-export.cjs: de vergelijking voor het proefhuis uit afstandsfuncties (huis-sdf.cjs).
//
//   node gereedschap/pixelart/huis-sdf-export.cjs           uit/proefhuis/vergelijk.png
//   node gereedschap/pixelart/huis-sdf-export.cjs knoppen   ook uit/proefhuis/knoppen.png
//
// vergelijk.png: bovenaan op spelmaat een huis zoals het nu uit dorp.cjs komt (dorpshuis, zaad 3,
// 8 × 6 tegels met riet, dezelfde kant op als het proefhuis) en drie zaden van het proefhuis, elk
// met de tovenaar ervoor; onderaan hetzelfde huidige huis en het eerste proefhuis twee keer
// vergroot, om de details te beoordelen. knoppen.png: het eerste proefhuis met alle drie de
// knoppen aan, en telkens met één uit.
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const F = require('./figuren.cjs');
const D = require('./dorp.cjs');
const T = require('./toren.cjs');
const HS = require('./huis-sdf.cjs');
const { VLAG, RAMP, LICHT } = K;

const UIT = path.join(__dirname, 'uit', 'proefhuis');
fs.mkdirSync(UIT, { recursive: true });

// een paneel: het midden van de plattegrond op (OX, OY)
const PB = 580;
const PH = 620;
const OX = 290;
const OY = 480;
const MAAT = [8, 6];
const TOVENAAR = [1.4, 4.8]; // in tegels, voor de lange muur
const NU_ZAAD = 3;
const ZADEN = [1, 2, 3];

function grond(B) {
  const kaart = D.grondKaart({ zaad: 5 });
  K.tekenDozen(B, [K.doos(-40, -40, 44, 44, -16, 0, D.grondTex(kaart, { dor: true }))]);
  return kaart;
}

// Het huis zoals het nu is, precies zoals huizen-proef.cjs het tekent.
function paneelNu(zaad = NU_ZAAD) {
  const B = new K.Beeld(PB, PH, OX, OY);
  const kaart = grond(B);
  const t0 = Date.now();
  const [b, d] = MAAT;
  const g = D.dorpshuis(-b / 2 + 0.5, -d / 2 + 0.5, zaad, { maat: MAAT, dak: 'riet', rook: false });
  D.zetGebouw(B, g);
  const ms = Date.now() - t0;
  D.zetModel(B, F.tovenaar(84), TOVENAAR[0], TOVENAAR[1], 'Z');
  D.grasPollen(B, kaart, { dicht: 0.8 });
  D.zonSchaduw(B, g.vormen, { zon: D.AVONDZON, kracht: 2.6 });
  D.voetSchaduw(B, [g]);
  K.belicht(B, { omgeving: () => 0.2 });
  D.avondlicht(B);
  K.verwarm(B, 1.8);
  K.omlijn(B);
  return { p: K.Plaat.van(K.kwantiseer(B)), ms };
}

// De zon op de grond rond het proefhuis: een harde slagschaduw van het huis en de tovenaar (met
// dezelfde zon als waarmee tekenWereld het huis zelf schaduwt), en de grond langs de voet een
// tint donkerder. Zet ook B.schaduw en B.zon voor avondlicht(), zoals zonSchaduw in dorp.cjs.
function grondZon(B, R, o = {}) {
  const L = o.zon || LICHT;
  const kracht = o.kracht ?? 2.6;
  const modellen = (B.modellen || []).filter((m) => m.schaduw);
  const n = B.b * B.h;
  if (!B.zon) B.zon = new Float32Array(n);
  const schaduw = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    if (!(B.vlag[i] & VLAG.VLOER) || B.ramp[i] < 0 || B.obj[i] !== 0) continue;
    const X = B.pos[i * 3];
    const Y = B.pos[i * 3 + 1];
    const Z = B.pos[i * 3 + 2] + 0.3;
    let raak = false;
    let t = 0.5;
    for (let s = 0; s < 240 && t < 1000; s++) {
      const z = Z + L[2] * t;
      if (z > 480) break;
      const d = R.f(X + L[0] * t, Y + L[1] * t, z);
      if (d < 0.1) {
        raak = true;
        break;
      }
      t += Math.max(d * 0.85, 0.3);
    }
    if (!raak) {
      for (const m of modellen) {
        if (D.modelRaakt(m, [X, Y, Z], L)) {
          raak = true;
          break;
        }
      }
    }
    if (raak) {
      B.stap[i] -= kracht;
      schaduw[i] = 1;
      B.zon[i] = 0;
      B.vlag[i] |= VLAG.GLAD;
    } else B.zon[i] = L[2];
    const dv = R.f(X, Y, 3);
    if (dv < 12) B.stap[i] -= dv < 4 ? 1.8 : dv < 8 ? 1.2 : 0.6;
  }
  B.schaduw = schaduw;
}

// avondlicht zoals in dorp.cjs (die tabel wordt niet geëxporteerd), maar de veldsteen blijft koel:
// op de referentie is de steen grijsblauw en het hout warm, twee temperaturen per huis. En riet
// blijft riet: een oude lap mag in de zon grauw blijven naast het goudstro.
const WARM = {
  mos: ['mos', [1, 2, 3, 4, 5, 5]],
  aarde: ['zand', [0, 0, 1, 2, 3, 4, 5]],
};

function paneelProef(zaad, knoppen = {}) {
  const B = new K.Beeld(PB, PH, OX, OY);
  const kaart = grond(B);
  const t0 = Date.now();
  const W = HS.proefhuis(zaad, { knoppen, b: MAAT[0], d: MAAT[1] });
  const R = T.tekenWereld(B, W);
  const ms = Date.now() - t0;
  B.lichten.push(...W.lichten);
  D.zetModel(B, F.tovenaar(84), TOVENAAR[0], TOVENAAR[1], 'Z');
  D.grasPollen(B, kaart, { dicht: 0.8 });
  grondZon(B, R, { kracht: 2.6 });
  K.belicht(B, { omgeving: () => 0.2 });
  D.avondlicht(B, { warm: WARM });
  K.verwarm(B, 1.8);
  K.omlijn(B);
  return { p: K.Plaat.van(K.kwantiseer(B)), ms };
}

// ---------------------------------------------------------------- letters

// Een klein lettertype van 5 × 7, alleen de letters die de opschriften nodig hebben.
const LETTERS = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.###.'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  1: ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  2: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  3: ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
};
function schrijf(p, tekst, x, y, s = 2) {
  for (const ch of tekst.toUpperCase()) {
    const g = LETTERS[ch] || LETTERS[' '];
    for (let j = 0; j < 7; j++) {
      for (let i = 0; i < 5; i++) {
        if (g[j][i] !== '#') continue;
        for (let dy = 0; dy < s; dy++) for (let dx = 0; dx < s; dx++) p.zet(x + i * s + dx, y + j * s + dy, 'perkament', 5);
      }
    }
    x += 6 * s;
  }
}

function vergroot(p, s) {
  const q = new K.Plaat(p.b * s, p.h * s);
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.b; x++) {
      const k = p.lees(x, y);
      if (!k) continue;
      for (let dy = 0; dy < s; dy++) for (let dx = 0; dx < s; dx++) q.zet(x * s + dx, y * s + dy, k[0], k[1]);
    }
  }
  return q;
}

// ---------------------------------------------------------------- de platen

const STROOK = 26;
const log = (...a) => console.log(...a);

function vergelijk() {
  const panelen = [];
  const nu = paneelNu();
  log(`nu (dorp.cjs, zaad ${NU_ZAAD})`.padEnd(28), `${nu.ms} ms`);
  panelen.push({ ...nu, naam: 'nu' });
  for (const z of ZADEN) {
    const r = paneelProef(z);
    log(`proefhuis zaad ${z}`.padEnd(28), `${r.ms} ms`);
    panelen.push({ ...r, naam: `zaad ${z}` });
  }
  // onderaan: het huis zelf, twee keer vergroot (zonder de lege randen van het paneel)
  const snede = [14, 34, 558, 576];
  const groot = [panelen[0], panelen[1]].map((q) => vergroot(q.p.uitsnede(...snede), 2));
  const b = Math.max(PB * panelen.length, groot[0].b * 2 + 16);
  const h = STROOK + PH + STROOK + groot[0].h;
  const plaat = new K.Plaat(b, h);
  panelen.forEach((q, i) => {
    plaat.plak(q.p, i * PB, STROOK);
    schrijf(plaat, q.naam, i * PB + 8, 6);
  });
  const y2 = STROOK + PH + STROOK;
  plaat.plak(groot[0], 0, y2);
  schrijf(plaat, 'nu x2', 8, y2 - 20);
  plaat.plak(groot[1], groot[0].b + 16, y2);
  schrijf(plaat, 'zaad 1 x2', groot[0].b + 24, y2 - 20);
  fs.writeFileSync(path.join(UIT, 'vergelijk.png'), K.png(plaat, 1, '#0e0a14'));
  log(`vergelijk.png  ${plaat.b}×${plaat.h}`);
}

function knoppen() {
  const varianten = [
    ['alle drie', {}],
    ['zonder scheef', { scheef: false }],
    ['zonder pak', { pak: false }],
    ['zonder speelgoed', { speelgoed: false }],
  ];
  const plaat = new K.Plaat(PB * varianten.length, STROOK + PH);
  varianten.forEach(([naam, kn], i) => {
    const r = paneelProef(ZADEN[0], kn);
    log(naam.padEnd(28), `${r.ms} ms`);
    plaat.plak(r.p, i * PB, STROOK);
    schrijf(plaat, naam, i * PB + 8, 6);
  });
  fs.writeFileSync(path.join(UIT, 'knoppen.png'), K.png(plaat, 1, '#0e0a14'));
  log(`knoppen.png  ${plaat.b}×${plaat.h}`);
}

if (require.main === module) {
  const t0 = Date.now();
  const wat = process.argv[2];
  if (wat === 'alleen') {
    // één proefhuis, om snel te kijken: node huis-sdf-export.cjs alleen <zaad> [x y b h]
    // schrijft het paneel, en een uitsnede twee keer vergroot (standaard het hele huis)
    const z = Number(process.argv[3] || 1);
    const [sx, sy, sb, sh] = process.argv.slice(4, 8).map(Number);
    const r = paneelProef(z);
    fs.writeFileSync(path.join(UIT, `zaad-${z}.png`), K.png(r.p, 1, '#0e0a14'));
    const snede = sb ? r.p.uitsnede(sx, sy, sb, sh) : r.p;
    fs.writeFileSync(path.join(UIT, `zaad-${z}-x2.png`), K.png(snede, 2, '#0e0a14'));
    log(`zaad ${z}: ${r.ms} ms`);
  } else {
    vergelijk();
    if (wat === 'knoppen') knoppen();
  }
  log(`totaal ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}

module.exports = { paneelNu, paneelProef, grondZon };
