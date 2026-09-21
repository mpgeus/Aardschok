'use strict';
// huis-sdf-export.cjs: platen van de huizenbouwer uit afstandsfuncties (huis-sdf.cjs).
//
//   node gereedschap/pixelart/huis-sdf-export.cjs vormen    uit/proefhuis/vormen.png
//   node gereedschap/pixelart/huis-sdf-export.cjs een <vorm> <lagen> <zaad> [nok] [sleutel=waarde ...]
//                                                          uit/proefhuis/een.png en een-x2.png
//   node gereedschap/pixelart/huis-sdf-export.cjs           uit/proefhuis/vergelijk.png
//   node gereedschap/pixelart/huis-sdf-export.cjs knoppen   ook uit/proefhuis/knoppen.png
//
// vormen.png: een raster van huizen, rechthoek, L en T (de rijen), elk in één, anderhalf en twee
// lagen (de kolommen), elk met een eigen zaad en de tovenaar ervoor voor de maat. De middelste
// kolom heeft de nok langs y (gespiegeld). De huizen renderen tegelijk, elk in een eigen draad.
//
// vergelijk.png: bovenaan op spelmaat een huis zoals het nu uit dorp.cjs komt (dorpshuis, zaad 3,
// 8 × 6 tegels met riet, dezelfde kant op als het proefhuis) en drie zaden van het proefhuis, elk
// met de tovenaar ervoor; onderaan hetzelfde huidige huis en het eerste proefhuis twee keer
// vergroot, om de details te beoordelen. knoppen.png: het eerste proefhuis met alle drie de
// knoppen aan, en telkens met één uit.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
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

// ---------------------------------------------------------------- een huis naar keuze

// Het kader van een huis op het scherm (pixels, met de oorsprong van de wereld op 0, 0): de voet
// van de muren, de rand van het riet en de nok.
function kaderVan(H) {
  const [e0, e1, e2] = K.EX;
  const [f0, f1, f2] = K.EY;
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  const zie = (x, y, z) => {
    const sx = x * e0 + y * e1 + z * e2;
    const sy = x * f0 + y * f1 + z * f2;
    x0 = Math.min(x0, sx);
    x1 = Math.max(x1, sx);
    y0 = Math.min(y0, sy);
    y1 = Math.max(y1, sy);
  };
  const top = (V) => V.zN + H.dik + H.worstR + 4;
  for (const V of H.vleugels) {
    for (const sa of [-1, 1]) {
      for (const sq of [-1, 1]) {
        zie(...V.wereld(sa * V.ha, sq * V.hq), 0);
        zie(...V.wereld(sa * V.XR, sq * (V.Qe0 + 10)), H.voetZ - 2 * H.dik);
      }
      zie(...V.wereld(sa * V.XR, 0), top(V));
    }
  }
  const S = H.schoorsteen;
  zie(...S.V.wereld(S.a, S.q), S.V.nokZ(S.a) + H.dik + S.hoog + 12);
  // en de tovenaar voor de deur
  const [tx, ty] = HS.voorDeDeur(H, 1.25);
  const X = tx * K.TEGEL;
  const Y = ty * K.TEGEL;
  for (const [dx, dz] of [[-34, 0], [34, 0], [0, 110]]) zie(X + dx * K.EX[0], Y + dx * K.EX[1], dz);
  return { x0, x1, y0, y1, b: x1 - x0, h: y1 - y0 };
}

// Een huis op een stuk grond, met de tovenaar voor de deur. o.b, o.h: de maat van het paneel,
// o.onder: hoeveel ruimte er onder de voet van het huis blijft.
function paneelHuis(spec, o = {}) {
  const t0 = Date.now();
  const H = HS.maten(spec.zaad, spec);
  const kd = kaderVan(H);
  const b = o.b ?? Math.ceil(kd.b + 80);
  const h = o.h ?? Math.ceil(kd.h + 120);
  const onder = o.onder ?? 70;
  const OX = Math.round(b / 2 - (kd.x0 + kd.x1) / 2);
  const OY = Math.round(h - onder - kd.y1);
  const B = new K.Beeld(b, h, OX, OY);
  const kaart = grond(B);
  const W = HS.huis(spec.zaad, spec);
  const R = T.tekenWereld(B, W);
  const msHuis = Date.now() - t0;
  B.lichten.push(...W.lichten);
  const [tx, ty] = HS.voorDeDeur(W.H, 1.25);
  D.zetModel(B, F.tovenaar(84), tx, ty, 'Z');
  D.grasPollen(B, kaart, { dicht: 0.8 });
  grondZon(B, R, { kracht: 2.6 });
  K.belicht(B, { omgeving: () => 0.2 });
  D.avondlicht(B, { warm: WARM });
  K.verwarm(B, 1.8);
  K.omlijn(B);
  return { p: K.Plaat.van(K.kwantiseer(B)), ms: msHuis, msTotaal: Date.now() - t0, kd };
}

// De huizen op vormen.png: per rij een plattegrond, per kolom een aantal lagen. Maten in tegels
// (ontwerp/wereld.md: een gewoon huis is 6 × 8, een herberg met twee lagen 7 × 9).
const VORMEN = [
  { naam: 'rechthoek 8x6', vorm: 'rechthoek', lagen: 1, zaad: 1, b: 8, d: 6 },
  { naam: 'rechthoek 8x6', vorm: 'rechthoek', lagen: 1.5, zaad: 2, b: 8, d: 6, nok: 'y' },
  { naam: 'rechthoek 9x7', vorm: 'rechthoek', lagen: 2, zaad: 3, b: 9, d: 7 },
  { naam: 'L 10x10', vorm: 'L', lagen: 1, zaad: 4, b: 10, d: 6, b2: 6, d2: 10 },
  { naam: 'L 10x10 smal andersom', vorm: 'L', lagen: 1.5, zaad: 5, b: 10, d: 6, b2: 5, d2: 10, kant: 1, nok: 'y' },
  { naam: 'L 10x10', vorm: 'L', lagen: 2, zaad: 6, b: 10, d: 6, b2: 6, d2: 10 },
  { naam: 'T 11x10', vorm: 'T', lagen: 1, zaad: 7, b: 11, d: 6, b2: 5, p2: 4 },
  { naam: 'T 11x10 gelijk', vorm: 'T', lagen: 1.5, zaad: 8, b: 11, d: 6, b2: 6, p2: 4, nok: 'y' },
  { naam: 'T 12x10', vorm: 'T', lagen: 2, zaad: 9, b: 12, d: 6, b2: 5, p2: 4 },
];
const LAGEN = { 1: '1 laag', 1.5: '1,5 laag', 2: '2 lagen' };
const opschrift = (s) => `${s.naam}  ${LAGEN[s.lagen]}  nok ${s.nok || 'x'}  zaad ${s.zaad}`;

// Een draad die huizen rendert: krijgt { spec, o }, geeft de plaat terug.
if (!isMainThread && workerData === 'huis') {
  parentPort.on('message', ({ i, spec, o }) => {
    const r = paneelHuis(spec, o);
    parentPort.postMessage({ i, b: r.p.b, h: r.p.h, px: r.p.px, ms: r.ms, msTotaal: r.msTotaal });
  });
}

function renderAlle(taken, draden) {
  return new Promise((klaar, fout) => {
    const uit = new Array(taken.length);
    let volgende = 0;
    let gedaan = 0;
    const werkers = [];
    const geef = (w) => {
      if (volgende >= taken.length) return;
      const i = volgende++;
      w.postMessage({ i, ...taken[i] });
    };
    for (let n = 0; n < Math.min(draden, taken.length); n++) {
      const w = new Worker(__filename, { workerData: 'huis' });
      w.on('error', fout);
      w.on('message', (m) => {
        const p = new K.Plaat(m.b, m.h);
        p.px = m.px;
        uit[m.i] = { p, ms: m.ms, msTotaal: m.msTotaal };
        log(`${opschrift(taken[m.i].spec)}`.padEnd(52), `${(m.ms / 1000).toFixed(1)} s (paneel ${(m.msTotaal / 1000).toFixed(1)} s)`);
        if (++gedaan === taken.length) {
          for (const x of werkers) x.terminate();
          klaar(uit);
        } else geef(w);
      });
      werkers.push(w);
      geef(w);
    }
  });
}

async function vormen() {
  // eerst alle kaders, zodat elk paneel even groot is en elk huis op dezelfde voetlijn staat
  const kaders = VORMEN.map((s) => kaderVan(HS.maten(s.zaad, s)));
  const kolommen = 3;
  const cb = Math.ceil(Math.max(...kaders.map((k) => k.b)) + 24);
  const ch = Math.ceil(Math.max(...kaders.map((k) => k.h)) + 90);
  const taken = VORMEN.map((spec) => ({ spec, o: { b: cb, h: ch, onder: 44 } }));
  const draden = Math.max(2, Math.min(9, os.cpus().length - 2));
  const t0 = Date.now();
  const platen = await renderAlle(taken, draden);
  const rijen = Math.ceil(VORMEN.length / kolommen);
  const plaat = new K.Plaat(cb * kolommen, (STROOK + ch) * rijen);
  platen.forEach((q, i) => {
    const x = (i % kolommen) * cb;
    const y = Math.floor(i / kolommen) * (STROOK + ch);
    plaat.plak(q.p, x, y + STROOK);
    schrijf(plaat, opschrift(VORMEN[i]), x + 8, y + 6);
  });
  fs.writeFileSync(path.join(UIT, 'vormen.png'), K.png(plaat, 1, '#0e0a14'));
  const ms = platen.map((q) => q.ms);
  log(`vormen.png  ${plaat.b}×${plaat.h}, ${draden} draden, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  log(`een huis: ${(Math.min(...ms) / 1000).toFixed(1)} tot ${(Math.max(...ms) / 1000).toFixed(1)} s, gemiddeld ${(ms.reduce((a, b) => a + b, 0) / ms.length / 1000).toFixed(1)} s`);
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
  J: ['..###', '....#', '....#', '....#', '#...#', '#...#', '.###.'],
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
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  0: ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  1: ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  2: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  3: ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
  4: ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  5: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  6: ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'],
  7: ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  8: ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  9: ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
  ',': ['.....', '.....', '.....', '.....', '.....', '..#..', '.#...'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.....', '..#..'],
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

if (isMainThread && require.main === module) {
  const t0 = Date.now();
  const wat = process.argv[2];
  if (wat === 'vormen') {
    vormen().then(() => log(`totaal ${((Date.now() - t0) / 1000).toFixed(1)} s`));
  } else if (wat === 'een') {
    // één huis naar keuze: een <vorm> <lagen> <zaad> [nok] [sleutel=waarde ...]; schrijft het
    // paneel en het huis twee keer vergroot. snede=x,y,b,h kiest een uitsnede voor het vergrote.
    const [vorm = 'rechthoek', lagen = '1', zaad = '1', nok = 'x', ...rest] = process.argv.slice(3);
    const spec = { vorm, lagen: Number(lagen), zaad: Number(zaad), nok };
    let snede = null;
    for (const kv of rest) {
      const [k, v] = kv.split('=');
      if (k === 'snede') snede = v.split(',').map(Number);
      else spec[k] = k === 'voor' ? v !== 'false' : Number(v);
    }
    const r = paneelHuis(spec);
    fs.writeFileSync(path.join(UIT, 'een.png'), K.png(r.p, 1, '#0e0a14'));
    const s = snede ? r.p.uitsnede(...snede) : r.p;
    fs.writeFileSync(path.join(UIT, 'een-x2.png'), K.png(s, 2, '#0e0a14'));
    log(`${opschrift({ naam: vorm, ...spec })}: huis ${(r.ms / 1000).toFixed(1)} s, paneel ${(r.msTotaal / 1000).toFixed(1)} s, ${r.p.b}×${r.p.h}`);
  } else if (wat === 'alleen') {
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
  if (wat !== 'vormen') log(`totaal ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}

module.exports = { paneelNu, paneelProef, paneelHuis, kaderVan, grondZon };
