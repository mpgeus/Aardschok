// De proefplaat van de hoogte (werklijst vraag 121, d; Marcel, 7 okt: "ik doel ook meer op heuvels in het landschap",
// en "Ja maak de plaat met beide"). Eén stuk land met de twee soorten hoogte naast elkaar:
//
//   - glooiende heuvels: elke hoek van een tegel heeft een hoogte, en de gewone grondtegel wordt over de schuine
//     ruit getrokken, lichter naar de zon (linksboven) en donkerder ervan af. Geen nieuwe kunst.
//   - terrassen: een richel met een rotswand, een beek in een dal met een begroeide wal, en een helling ertussen.
//
// Eén model voor allebei: een tegel heeft vier hoeken met een hoogte (in pixels op het scherm). Delen twee buren hun
// hoek, dan glooit het; verschillen ze, dan staat er een wand, en die zie je alleen aan de zuid- en oostkant (de
// camera kijkt van het zuidoosten). Een helling is een tegel die schuin loopt tussen twee treden.
//
// Het tekent met de echte grond (tegels/rand.png), het huis van de stijl wit, de bomen, de struiken, het graan en een
// dorpeling uit het spel, met een dieptebuffer (wat verder naar voren ligt, gaat voor), zoals het spel het straks zou
// doen. Niets hiervan zit in het spel.
//
//   node gereedschap/pixelart/hoogte-proef.cjs     → gereedschap/pixelart/uit/hoogte/
//     dag-32.png       overdag, met een trede van 32 pixels (een hele tegelhoogte; Marcel koos die boven 16)
//     avond-32.png     's avonds, met licht bij de deuren
//     uitsnede-32.png  de helling en de hoek van de rotswand op 2×
//     akkers-32.png    de akkers die meebollen met de heuvel, op 2×
'use strict';

const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');

const WORTEL = path.join(__dirname, '..', '..');
const UIT = path.join(__dirname, 'uit', 'hoogte');
require(path.join(WORTEL, 'tegels', 'tegels.js'));
const TEGELS = globalThis.Spel.TEGELS;
const BESCHRIJVING = require(path.join(WORTEL, 'beelden', 'beschrijving.json'));

// ---------------------------------------------------------------- het land

const B = 30; // tegels van west naar oost (x)
const H = 22; // van noord naar zuid (y)

// De richel achteraan links: niveau 1, met daarop nog een trede (niveau 2). De beek in een dal (niveau -1).
function niveau(x, y) {
  if (x <= 4 && y <= 3) return 2;
  if (x <= 11 && y <= 7) return 1;
  if (inDeBeek(x, y)) return -1;
  return 0;
}
// De beek loopt langs de tegels, met één bocht: schuin over het raster wordt een wand een trap.
const beekMidden = (x) => (x < 14 ? 18 : 19);
const inDeBeek = (x, y) => Math.abs(y - beekMidden(x)) <= 1;
const isWater = (x, y) => y === beekMidden(x);

// De helling van de richel naar beneden: twee tegels breed (x 7 en 8), twee lang (y 8 en 9).
const isHelling = (x, y) => (x === 7 || x === 8) && (y === 8 || y === 9);

// De glooiing: een grote heuvel met een vlakke top voor het huis, en een kleine bult voorin. Op een hoekpunt (vx, vy).
const HUIS_HEUVEL = { x: 21, y: 8, b: 6, h: 4 }; // de voet van de hut op de heuvel
function glooiing(vx, vy) {
  const r = HUIS_HEUVEL;
  const dx = Math.max(r.x - 0.5 - vx, 0, vx - (r.x + r.b - 0.5));
  const dy = Math.max(r.y - 0.5 - vy, 0, vy - (r.y + r.h - 0.5));
  const d = Math.hypot(dx, dy);
  let h = 150 * (1 - K.glad(0, 9, d)); // Marcel, 7 okt: "hoger"
  const d2 = Math.hypot(vx - 5, vy - 14.5);
  h += 18 * (1 - K.glad(0, 4.2, d2));
  return h;
}

// De hoogte van hoek k (0 noord, 1 oost, 2 zuid, 3 west) van tegel (x, y), in pixels.
const HOEK = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]];
function hoekHoogte(x, y, k, trede) {
  const vx = x + HOEK[k][0];
  const vy = y + HOEK[k][1];
  if (isHelling(x, y)) return (trede * (9.5 - vy)) / 2; // van de richel (y 7,5) naar het maaiveld (y 9,5)
  return niveau(x, y) * trede + glooiing(vx, vy);
}

// Waar een zandpad loopt: de helling af, over de flank naar de deur van de hut op de heuvel, en op de richel naar
// de deur van de hut daar.
const PAD = new Set();
const pad = (x, y) => PAD.add(x + ',' + y);
for (let y = 6; y <= 13; y++) { pad(7, y); pad(8, y); }
for (let x = 9; x <= 23; x++) { pad(x, 13); pad(x, 12); }
const isPad = (x, y) => PAD.has(x + ',' + y);

// De akker op de flank van de heuvel.
const isAkker = (x, y) => (x >= 16 && x <= 21 && y >= 13 && y <= 16) || (x >= 27 && x <= 29 && y >= 4 && y <= 13);
// groen koren op de zuidflank, naar je toe; geploegd op de oostflank, waar je de voren ziet buigen
const akkerStadium = (x, y) => (x >= 27 ? 'geploegd' : 'groen');

// ---------------------------------------------------------------- de vellen

const beelden = new Map();
function beeld(rel) {
  if (!beelden.has(rel)) beelden.set(rel, K.leesPng(path.join(WORTEL, rel)));
  return beelden.get(rel);
}

// De grondtegels uit de terreinset, zoals js/sprites.js ze kiest (grondMetHoeken).
const RAND = TEGELS.rand;
const HOEKNAMEN = ['boven', 'rechts', 'onder', 'links'];
const index = new Map();
RAND.tiles.forEach((t, id) => {
  if (!t || !t.groep) return;
  const s = t.groep === 'vlak' ? `vlak:${t.naam}` : t.groep;
  if (!index.has(s)) index.set(s, []);
  index.get(s).push(id);
});
function grondTegel(hoeken, x, y) {
  const soorten = [...new Set(hoeken)];
  let ids = null;
  if (soorten.length === 1) ids = index.get(`vlak:${soorten[0]}`);
  else if (soorten.length === 2) {
    for (const [a, b] of [soorten, [soorten[1], soorten[0]]]) {
      ids = index.get(`${a} over ${b}: ${HOEKNAMEN.filter((h, i) => hoeken[i] === a).join('+')}`);
      if (ids) break;
    }
  }
  if (!ids) ids = index.get('vlak:gras');
  return ids[(K.hash(x * 7 + 3, y * 13 + 5) >>> 0) % ids.length];
}
function grondSoortVan(x, y) {
  if (isWater(x, y)) return 'water';
  if (isPad(x, y)) return 'zandpad';
  return 'gras';
}
// Een hoek is zandpad als minstens twee van de vier tegels eromheen pad zijn.
function hoekSoort(vx, vy) {
  let n = 0;
  for (const [dx, dy] of [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]]) if (isPad(vx + dx, vy + dy)) n++;
  return n >= 2 ? 'zandpad' : 'gras';
}
function tegelVan(x, y) {
  const soort = grondSoortVan(x, y);
  if (soort === 'water') return grondTegel(['water', 'water', 'water', 'water'], x, y);
  const hoeken = HOEK.map(([dx, dy]) => hoekSoort(x + dx, y + dy));
  return grondTegel(hoeken, x, y);
}

// ---------------------------------------------------------------- het doek, met een dieptebuffer

function maakDoek(b, h) {
  return {
    b,
    h,
    rgb: new Float32Array(b * h * 3),
    diepte: new Float32Array(b * h).fill(-1e9),
    wereld: new Float32Array(b * h * 2), // waar in de wereld de pixel ligt, voor het licht 's avonds
    gezet: new Uint8Array(b * h),
  };
}
function zet(d, px, py, r, g, bl, diepte, wx, wy) {
  if (px < 0 || py < 0 || px >= d.b || py >= d.h) return;
  const i = py * d.b + px;
  if (diepte < d.diepte[i]) return;
  d.diepte[i] = diepte;
  d.rgb[i * 3] = r;
  d.rgb[i * 3 + 1] = g;
  d.rgb[i * 3 + 2] = bl;
  d.wereld[i * 2] = wx;
  d.wereld[i * 2 + 1] = wy;
  d.gezet[i] = 1;
}

// ---------------------------------------------------------------- de grond, schuin

const LICHT = (() => {
  const l = [-0.75, -0.15, 1];
  const n = Math.hypot(...l);
  return l.map((v) => v / n);
})();
const PX_PER_HOOGTE = 32; // een hoogte van 32 pixels is een tegel hoog
function helderheid(p, q, r) {
  // p, q, r: [wx, wy, hoogte in px]
  const a = [q[0] - p[0], q[1] - p[1], (q[2] - p[2]) / PX_PER_HOOGTE];
  const b = [r[0] - p[0], r[1] - p[1], (r[2] - p[2]) / PX_PER_HOOGTE];
  let n = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  if (n[2] < 0) n = n.map((v) => -v);
  const len = Math.hypot(...n);
  const d = (n[0] * LICHT[0] + n[1] * LICHT[1] + n[2] * LICHT[2]) / len;
  return K.klem(1 + (d / LICHT[2] - 1) * 1.5, 0.5, 1.4);
}

function tekenDriehoek(doek, oog, s, w, t, kleurVan, licht, ophoging = 0) {
  // s: drie schermpunten [sx, sy]; w: drie wereldpunten [wx, wy]; t: drie punten in de tegel [tx, ty]
  const minX = Math.floor(Math.min(s[0][0], s[1][0], s[2][0]));
  const maxX = Math.ceil(Math.max(s[0][0], s[1][0], s[2][0]));
  const minY = Math.floor(Math.min(s[0][1], s[1][1], s[2][1]));
  const maxY = Math.ceil(Math.max(s[0][1], s[1][1], s[2][1]));
  const [ax, ay] = s[0];
  const [bx, by] = s[1];
  const [cx, cy] = s[2];
  const opp = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  if (Math.abs(opp) < 1e-6) return;
  const E = 0.02;
  for (let py = minY; py <= maxY; py++) {
    for (let px = minX; px <= maxX; px++) {
      const qx = px + 0.5;
      const qy = py + 0.5;
      const l0 = ((bx - qx) * (cy - qy) - (by - qy) * (cx - qx)) / opp;
      const l1 = ((cx - qx) * (ay - qy) - (cy - qy) * (ax - qx)) / opp;
      const l2 = 1 - l0 - l1;
      if (l0 < -E || l1 < -E || l2 < -E) continue;
      const tx = l0 * t[0][0] + l1 * t[1][0] + l2 * t[2][0];
      const ty = l0 * t[0][1] + l1 * t[1][1] + l2 * t[2][1];
      const wx = l0 * w[0][0] + l1 * w[1][0] + l2 * w[2][0];
      const wy = l0 * w[0][1] + l1 * w[1][1] + l2 * w[2][1];
      const kleur = kleurVan(tx, ty, wx, wy);
      if (!kleur) continue;
      zet(doek, px - oog.x, py - oog.y, kleur[0] * licht, kleur[1] * licht, kleur[2] * licht, wx + wy + ophoging, wx, wy);
    }
  }
}

// Een pixel uit een grondtegel (64 bij 32, een ruit), de dichtstbijzijnde die niet doorzichtig is.
function monster(id, tx, ty) {
  const vel = beeld(RAND.bestand);
  const kol = RAND.kolommen;
  const ox = (id % kol) * 64;
  const oy = Math.floor(id / kol) * 32;
  let x = K.klem(Math.floor(tx), 0, 63);
  let y = K.klem(Math.floor(ty), 0, 31);
  for (let stap = 0; stap < 6; stap++) {
    const i = ((oy + y) * vel.b + ox + x) * 4;
    if (vel.rgba[i + 3] > 128) return [vel.rgba[i], vel.rgba[i + 1], vel.rgba[i + 2]];
    // naar het midden van de ruit toe
    x += Math.sign(32 - x);
    y += Math.sign(16 - y);
  }
  return null;
}

const scherm = (wx, wy, h) => [(wx - wy) * 32, (wx + wy) * 16 - h];

function tekenGrond(doek, oog, trede) {
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < B; x++) {
      const hoogten = [0, 1, 2, 3].map((k) => hoekHoogte(x, y, k, trede));
      const wereld = HOEK.map(([dx, dy]) => [x + dx, y + dy]);
      const s = wereld.map(([wx, wy], k) => scherm(wx, wy, hoogten[k]));
      const tex = [[32, 0], [64, 16], [32, 32], [0, 16]];
      const tegel = tegelVan(x, y);
      const kleurVan = (tx, ty) => monster(tegel, tx, ty);
      const p = wereld.map(([wx, wy], k) => [wx, wy, hoogten[k]]);
      const zak = isWater(x, y) ? 3 : 0; // het water ligt iets onder de oever
      const s2 = s.map(([sx, sy]) => [sx, sy + zak]);
      // twee driehoeken, langs de lijn van noord naar zuid (op het scherm van boven naar onder)
      tekenDriehoek(doek, oog, [s2[0], s2[1], s2[2]], [wereld[0], wereld[1], wereld[2]], [tex[0], tex[1], tex[2]], kleurVan, helderheid(p[0], p[1], p[2]));
      tekenDriehoek(doek, oog, [s2[0], s2[2], s2[3]], [wereld[0], wereld[2], wereld[3]], [tex[0], tex[2], tex[3]], kleurVan, helderheid(p[0], p[2], p[3]));
    }
  }
}

// ---------------------------------------------------------------- de akkers, die meebollen met de heuvel

// Marcel, 7 okt: "Ik wil dat de akkers mee bollen met de heuvel". Het graan wordt eerst plat getekend, zoals het spel
// het nu doet, op een eigen laag; dan wordt die laag net als de grond over de schuine tegels getrokken: elke pixel van
// een tegel vraagt waar hij in de wereld ligt, en neemt het graan dat plat op die plek lag. Zo buigen de rijen mee met
// de heuvel, en het koren dat boven een tegel uitsteekt, komt op de tegel erachter terecht (daarom ook een rand
// tegels rond de akker). De zon valt erop zoals op de grond eronder.
function plattePlaat() {
  const links = scherm(-0.5, H - 0.5, 0)[0] - 64;
  const boven = scherm(-0.5, -0.5, 0)[1] - 128;
  const b = Math.ceil(scherm(B - 0.5, -0.5, 0)[0] - links) + 128;
  const h = Math.ceil(scherm(B - 0.5, H - 0.5, 0)[1] - boven) + 128;
  return { links, boven, b, h, rgba: new Uint8ClampedArray(b * h * 4) };
}
function legPlat(plat, rel, cel, anker, sx, sy) {
  const vel = beeld(rel);
  const [cx, cy, cb, ch] = cel;
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cb; x++) {
      const i = ((cy + y) * vel.b + cx + x) * 4;
      if (vel.rgba[i + 3] < 128) continue;
      const px = Math.round(sx - anker[0] + x - plat.links);
      const py = Math.round(sy - anker[1] + y - plat.boven);
      if (px < 0 || py < 0 || px >= plat.b || py >= plat.h) continue;
      const o = (py * plat.b + px) * 4;
      plat.rgba[o] = vel.rgba[i];
      plat.rgba[o + 1] = vel.rgba[i + 1];
      plat.rgba[o + 2] = vel.rgba[i + 2];
      plat.rgba[o + 3] = 255;
    }
  }
}
function tekenAkkers(doek, oog, trede) {
  const g = BESCHRIJVING.graan;
  const plat = plattePlaat();
  const tegels = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < B; x++) if (isAkker(x, y)) tegels.push([x, y]);
  tegels.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
  for (const laag of ['achter', 'voor']) {
    for (const [x, y] of tegels) {
      const stadium = akkerStadium(x, y);
      const st = g.stadia[stadium];
      const v = K.hash(x, y) % g.varianten;
      const [sx, sy] = scherm(x, y, 0);
      if (st.frames) {
        const kol = laag === 'voor' ? st.frames : 0; // groen en rijp: een achter- en een voorlaag (js/sprites.js, graanLaag)
        legPlat(plat, 'beelden/' + g.bestand, [kol * st.cel[0], st.y0 + v * st.cel[1], st.cel[0], st.cel[1]], st.anker, sx, sy);
      } else if (laag === 'achter') {
        legPlat(plat, 'beelden/' + g.bestand, [v * st.cel[0], st.y0, st.cel[0], st.cel[1]], st.anker, sx, sy);
      }
    }
  }
  const kleurVan = (tx, ty, wx, wy) => {
    const [sx, sy] = scherm(wx, wy, 0);
    const px = Math.floor(sx - plat.links);
    const py = Math.floor(sy - plat.boven);
    if (px < 0 || py < 0 || px >= plat.b || py >= plat.h) return null;
    const o = (py * plat.b + px) * 4;
    return plat.rgba[o + 3] ? [plat.rgba[o], plat.rgba[o + 1], plat.rgba[o + 2]] : null;
  };
  const rond = new Set();
  for (const [x, y] of tegels) for (let dy = -2; dy <= 1; dy++) for (let dx = -2; dx <= 1; dx++) rond.add(x + dx + ',' + (y + dy));
  for (const sleutel of rond) {
    const [x, y] = sleutel.split(',').map(Number);
    if (x < 0 || y < 0 || x >= B || y >= H) continue;
    const hoogten = [0, 1, 2, 3].map((k) => hoekHoogte(x, y, k, trede));
    const wereld = HOEK.map(([dx, dy]) => [x + dx, y + dy]);
    const s = wereld.map(([wx, wy], k) => scherm(wx, wy, hoogten[k]));
    const p = wereld.map(([wx, wy], k) => [wx, wy, hoogten[k]]);
    const t = [[0, 0], [0, 0], [0, 0], [0, 0]];
    tekenDriehoek(doek, oog, [s[0], s[1], s[2]], [wereld[0], wereld[1], wereld[2]], [t[0], t[1], t[2]], kleurVan, helderheid(p[0], p[1], p[2]), 0.01);
    tekenDriehoek(doek, oog, [s[0], s[2], s[3]], [wereld[0], wereld[2], wereld[3]], [t[0], t[2], t[3]], kleurVan, helderheid(p[0], p[2], p[3]), 0.01);
  }
}

// ---------------------------------------------------------------- de wanden

// Een wand onder de zuid- of oostrand van tegel (x, y), naar de hoogte van de buur (of tot de voet van het land aan de
// rand van de plaat). Een rotswand op de richel, een begroeide wal langs de beek en aan de rand van de plaat.
function tekenWanden(doek, oog, trede) {
  const VOET = -trede * 2 - 14;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < B; x++) {
      for (const kant of ['zuid', 'oost']) {
        // de rand van deze tegel: twee hoeken, en de hoeken van de buur op dezelfde plek
        const [k1, k2] = kant === 'zuid' ? [3, 2] : [1, 2];
        const nx = kant === 'oost' ? x + 1 : x;
        const ny = kant === 'zuid' ? y + 1 : y;
        const [b1, b2] = kant === 'zuid' ? [0, 1] : [0, 3];
        const boven1 = hoekHoogte(x, y, k1, trede);
        const boven2 = hoekHoogte(x, y, k2, trede);
        const buurErIn = nx < B && ny < H;
        const onder1 = buurErIn ? hoekHoogte(nx, ny, b1, trede) : VOET;
        const onder2 = buurErIn ? hoekHoogte(nx, ny, b2, trede) : VOET;
        if (boven1 - onder1 < 0.5 && boven2 - onder2 < 0.5) continue;
        const soort = !buurErIn ? 'aarde' : niveau(x, y) >= 1 && !isHelling(x, y) && niveau(nx, ny) < niveau(x, y) ? 'rots' : 'wal';
        const p1 = [x + HOEK[k1][0], y + HOEK[k1][1]];
        const p2 = [x + HOEK[k2][0], y + HOEK[k2][1]];
        tekenWand(doek, oog, p1, p2, [boven1, boven2], [onder1, onder2], kant, soort);
      }
    }
  }
}

function tekenWand(doek, oog, p1, p2, boven, onder, kant, soort) {
  const s1 = scherm(p1[0], p1[1], 0);
  const s2 = scherm(p2[0], p2[1], 0);
  const vanX = Math.min(s1[0], s2[0]);
  const totX = Math.max(s1[0], s2[0]);
  for (let px = Math.floor(vanX); px < Math.ceil(totX); px++) {
    const t = (px + 0.5 - s1[0]) / (s2[0] - s1[0]);
    if (t < 0 || t > 1) continue;
    const wx = p1[0] + (p2[0] - p1[0]) * t;
    const wy = p1[1] + (p2[1] - p1[1]) * t;
    const hb = boven[0] + (boven[1] - boven[0]) * t;
    const ho = onder[0] + (onder[1] - onder[0]) * t;
    if (hb - ho < 0.5) continue;
    const vloer = (wx + wy) * 16;
    for (let py = Math.floor(vloer - hb); py < Math.ceil(vloer - ho); py++) {
      const hier = vloer - (py + 0.5); // de hoogte van deze pixel in de wereld
      const diep = hb - hier; // hoe ver onder de rand
      const u = (kant === 'zuid' ? wx : wy) * 45; // langs de wand, in pixels
      const kleur = wandKleur(soort, u, hier, diep, kant);
      if (!kleur) continue;
      zet(doek, px - oog.x, py - oog.y, kleur[0], kleur[1], kleur[2], wx + wy - 0.001, wx, wy);
    }
  }
}

const hex = (s) => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
const ROTS = [hex('#5b5650'), hex('#77716a'), hex('#948d84'), hex('#b0a89c')];
const AARDE = [hex('#3e2c1e'), hex('#5a3f29'), hex('#735237'), hex('#8a6744')];
const GRAS = [hex('#3d5a26'), hex('#567a33'), hex('#6f9440')];
function wandKleur(soort, u, hier, diep, kant) {
  const zij = kant === 'oost' ? 0.72 : 0.9; // de oostkant ligt verder uit de zon, zoals de muren van een huis
  const ruis = K.ruis2(u * 0.18, hier * 0.18);
  // een rand gras die over de rand hangt, onregelmatig
  const grasDiep = (soort === 'rots' ? 2.5 : 4.5) + 3 * K.ruis2(u * 0.35, 7.3) + (K.hash(Math.floor(u), 91) % 3 === 0 ? 2 : 0);
  if (diep < grasDiep) {
    const g = GRAS[K.klem(Math.floor((1 - diep / grasDiep) * 2.99 + (ruis - 0.5)), 0, 2)];
    return g.map((v) => v * zij);
  }
  if (soort === 'rots') {
    // lagen steen, met voegen en een barst hier en daar
    const laag = Math.floor(hier / 7 + K.ruis2(u * 0.05, 1.7) * 1.2);
    const blok = Math.floor((u + laag * 13) / (10 + (K.hash(laag, 5) % 9)));
    const voeg = (hier / 7 + K.ruis2(u * 0.05, 1.7) * 1.2) % 1 < 0.12 || (u + laag * 13) % (10 + (K.hash(laag, 5) % 9)) < 1;
    let tint = 1 + ((K.hash(blok, laag) % 100) / 100 - 0.5) * 0.25 + (ruis - 0.5) * 0.35;
    if (voeg) tint *= 0.6;
    if (diep > 2 && diep < 4.5) tint *= 0.8; // de schaduw onder de rand
    const i = K.klem(Math.floor(tint * 2.2), 0, 3);
    return ROTS[i].map((v) => v * zij);
  }
  // aarde, met wortels en een steentje
  let tint = 1 + (ruis - 0.5) * 0.5;
  const wortel = Math.abs(Math.sin(u * 0.09 + hier * 0.21 + K.ruis2(u * 0.12, hier * 0.12) * 3)) < 0.05 && diep < 14;
  if (wortel) tint = 0.5;
  if (K.hash(Math.floor(u / 2), Math.floor(hier / 2)) % 61 === 0) return ROTS[2].map((v) => v * zij);
  if (diep > grasDiep && diep < grasDiep + 2) tint *= 0.75;
  const i = K.klem(Math.floor(tint * 2.2), 0, 3);
  return AARDE[i].map((v) => v * zij);
}

// ---------------------------------------------------------------- wat erop staat

// Een stuk uit een vel, met het anker op scherm (sx, sy), op diepte d.
function tekenStuk(doek, oog, rel, cel, anker, sx, sy, d, wx, wy) {
  const vel = beeld(rel);
  const [cx, cy, cb, ch] = cel;
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cb; x++) {
      const i = ((cy + y) * vel.b + cx + x) * 4;
      const a = vel.rgba[i + 3];
      if (a < 128) continue;
      zet(doek, Math.round(sx - anker[0] + x) - oog.x, Math.round(sy - anker[1] + y) - oog.y, vel.rgba[i], vel.rgba[i + 1], vel.rgba[i + 2], d, wx, wy);
    }
  }
}

// De hoogte in het midden van een tegel.
const middenHoogte = (x, y, trede) => [0, 1, 2, 3].reduce((s, k) => s + hoekHoogte(x, y, k, trede), 0) / 4;

function tegelUit(vel, naam) {
  const t = TEGELS[vel].tiles.find((t) => t && t.naam === naam);
  if (!t) throw new Error(`${vel}: geen ${naam}`);
  return t;
}

function watErStaat(trede) {
  const lijst = [];
  // een voorwerp uit een vel met cel en anker, op een tegel (het anker op het midden)
  const voorwerp = (vel, naam, x, y) => {
    const t = tegelUit(vel, naam);
    lijst.push({ rel: t.bestand || TEGELS[vel].bestand, cel: t.cel, anker: t.anker, x, y, h: middenHoogte(x, y, trede), d: x + y + 0.45 });
  };
  // een huis: het anker op de achterste tegel van zijn voet
  const huis = (naam, x, y) => {
    const t = tegelUit('huizen', naam);
    const [b, h] = t.beslaat;
    lijst.push({ rel: t.bestand, cel: t.cel, anker: t.anker, x, y, h: middenHoogte(x, y, trede), d: x + b - 1 + y + h - 1 + 0.45 });
  };
  const mens = (naam, x, y, richting) => {
    const f = BESCHRIJVING.figuren[naam];
    const st = f.houdingen.staan;
    const rij = f.richtingen.indexOf(richting);
    lijst.push({ rel: 'beelden/figuren/' + st.bestand, cel: [0, rij * st.cel[1], st.cel[0], st.cel[1]], anker: st.anker, x, y, h: middenHoogte(x, y, trede), d: x + y + 0.5 });
  };

  huis('wit-hut1-riet-z', HUIS_HEUVEL.x, HUIS_HEUVEL.y); // op de vlakke top van de heuvel
  huis('wit-hut3-riet-z', 5, 3); // op de richel
  voorwerp('bomen', 'eik', 2, 1); // op de bovenste trede
  voorwerp('bomen', 'den', 1, 6);
  voorwerp('bomen', 'den', 14, 3);
  voorwerp('bomen', 'berk', 15, 6);
  voorwerp('bomen', 'eik', 27, 15);
  voorwerp('bomen', 'wilg', 11, 16); // aan de beek
  voorwerp('bomen', 'berk', 4, 13); // op de kleine bult
  voorwerp('bomen', 'appelboom', 26, 13);
  voorwerp('bomen', 'boompje', 16, 15);
  voorwerp('begroeiing', 'rots', 10, 2);
  voorwerp('begroeiing', 'kleineRots', 11, 5);
  voorwerp('begroeiing', 'struik', 24, 16);
  voorwerp('begroeiing', 'varen', 6, 16);
  voorwerp('begroeiing', 'hoogGras', 22, 17);
  voorwerp('begroeiing', 'struik', 2, 16);
  mens('dorpeling1', 13, 12, 'Z'); // halverwege de flank
  mens('dorpeling0', 8, 11, 'ZO'); // onder aan de helling
  mens('dorpeling1', 7, 7, 'Z'); // boven op de richel, voor de deur
  mens('dorpeling0', 19, 15, 'ZW'); // op de akker op de flank
  return lijst.sort((a, b) => a.d - b.d);
}

// ---------------------------------------------------------------- 's avonds

const NACHT = [0.3, 0.34, 0.56];
const LAMPEN = [
  [23, 12.6, 4.5], // bij de deur van de hut op de heuvel
  [7, 7.6, 4.5], // bij de deur op de richel
];
function avond(doek) {
  for (let i = 0; i < doek.b * doek.h; i++) {
    if (!doek.gezet[i]) continue;
    const wx = doek.wereld[i * 2];
    const wy = doek.wereld[i * 2 + 1];
    let r = NACHT[0];
    let g = NACHT[1];
    let b = NACHT[2];
    for (const [lx, ly, straal] of LAMPEN) {
      const d = Math.hypot(wx - lx, wy - ly);
      const f = Math.max(0, 1 - d / straal) ** 1.6;
      r += f * 1.05;
      g += f * 0.72;
      b += f * 0.32;
    }
    doek.rgb[i * 3] *= Math.min(1.15, r);
    doek.rgb[i * 3 + 1] *= Math.min(1.1, g);
    doek.rgb[i * 3 + 2] *= Math.min(1, b);
  }
}

// ---------------------------------------------------------------- de plaat

function maakPlaat(trede, nacht) {
  // het scherm van het hele land: van de westhoek tot de oosthoek, en boven ruimte voor bomen en huizen
  const links = scherm(-0.5, H - 0.5, 0)[0];
  const rechts = scherm(B - 0.5, -0.5, 0)[0];
  const oog = { x: Math.floor(links) - 24, y: Math.floor(scherm(-0.5, -0.5, 0)[1] - 260) };
  const breed = Math.ceil(rechts - links) + 48;
  const hoog = Math.ceil(scherm(B - 0.5, H - 0.5, 0)[1] + trede * 2 + 40 - oog.y);
  const doek = maakDoek(breed, hoog);
  tekenGrond(doek, oog, trede);
  tekenWanden(doek, oog, trede);
  tekenAkkers(doek, oog, trede);
  for (const s of watErStaat(trede)) {
    const [sx, sy] = scherm(s.x, s.y, s.h);
    tekenStuk(doek, oog, s.rel, s.cel, s.anker, sx, sy, s.d, s.x, s.y);
  }
  if (nacht) avond(doek);
  return { doek, oog };
}

function naarPng(doek, achtergrond, uitsnede, schaal = 1) {
  const u = uitsnede || { x: 0, y: 0, b: doek.b, h: doek.h };
  const b = u.b * schaal;
  const h = u.h * schaal;
  const rgba = Buffer.alloc(b * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < b; x++) {
      const i = (u.y + Math.floor(y / schaal)) * doek.b + u.x + Math.floor(x / schaal);
      const o = (y * b + x) * 4;
      const kleur = doek.gezet[i] ? [doek.rgb[i * 3], doek.rgb[i * 3 + 1], doek.rgb[i * 3 + 2]] : achtergrond;
      rgba[o] = K.klem(Math.round(kleur[0]), 0, 255);
      rgba[o + 1] = K.klem(Math.round(kleur[1]), 0, 255);
      rgba[o + 2] = K.klem(Math.round(kleur[2]), 0, 255);
      rgba[o + 3] = 255;
    }
  }
  return K.pngVanBeeld({ b, h, rgba });
}

function main() {
  fs.mkdirSync(UIT, { recursive: true });
  const t0 = Date.now();
  for (const trede of [32]) { // Marcel, 7 okt: "a ja 32" (16 was naast de huizen een streepje)
    const { doek, oog } = maakPlaat(trede, false);
    fs.writeFileSync(path.join(UIT, `dag-${trede}.png`), naarPng(doek, [24, 20, 30]));
    // de helling en de hoek van de rotswand, op 2×
    const [hx, hy] = scherm(8, 8.5, trede / 2);
    const uitsnede = { x: Math.round(hx - oog.x - 260), y: Math.round(hy - oog.y - 230), b: 520, h: 340 };
    fs.writeFileSync(path.join(UIT, `uitsnede-${trede}.png`), naarPng(doek, [24, 20, 30], uitsnede, 2));
    // de akkers op de flanken van de heuvel, op 2×
    const [ax, ay] = scherm(24, 13, glooiing(24, 13));
    const akkers = { x: Math.round(ax - oog.x - 300), y: Math.round(ay - oog.y - 140), b: 520, h: 300 };
    fs.writeFileSync(path.join(UIT, `akkers-${trede}.png`), naarPng(doek, [24, 20, 30], akkers, 2));
    console.log(`dag-${trede}.png ${doek.b}×${doek.h}`);
  }
  const { doek } = maakPlaat(32, true);
  fs.writeFileSync(path.join(UIT, 'avond-32.png'), naarPng(doek, [10, 10, 18]));
  console.log(`avond-32.png, klaar in ${((Date.now() - t0) / 1000).toFixed(1)} s, in ${path.relative(WORTEL, UIT)}`);
}

main();
