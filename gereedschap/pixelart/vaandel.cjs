// Het vaandel van een doel (werklijst K, 2c, D2; ontwerp/beeld.md, "Het vaandel van een doel"; Marcel, 28 okt: "1 ja"):
// een staak met een lange smalle wimpel in de kleur van het dorp (het diepe blauw van de soldaten, de ramp `gewaad`),
// met bij de staak het wapen van het dorp, een gouden korenschoof (beeld.md, "Het wapen van het dorp"), en een gouden knop
// op de staak. Hij staat op de plek waar een open doel naar wijst, en wappert: vier standen (`stand` 0 tot 3) die
// rondgaan. Eén tekening van één kant: de wimpel waait op het scherm naar rechts, waar je ook kijkt.
//
//   node gereedschap/pixelart/vaandel.cjs   (de proefplaat: uit/vaandel-proef.png, de vier standen met een boer ernaast,
//                                            op gras en op het donker van land dat je nog niet kent, en twee keer vergroot)
//   node gereedschap/pixelart/naar-spel.cjs --alleen vaandel   (naar het spel: beelden/vaandel.png, een cel per stand;
//                                            Marcel, 28 okt: "Vaandel goed")
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const { ruis3 } = K;
const { model, kegel, bol } = require('./figuren.cjs');
const Bm = require('./bomen.cjs');

// ---------------------------------------------------------------- de maten (in eenheden van het model, z omhoog)

// stok: hoe hoog de staak boven de grond staat (een boer is zo'n 85: hij steekt er ruim boven uit); lang en hoog: de
// wimpel (hoog bij de staak, naar de punt toe smaller); golf: hoe ver het doek uitslaat aan de punt (dwars), golfOp: hoe
// ver het op en neer gaat (zo zie je het wapperen aan de rand), golfLengte: de lengte van een golf; zak: hoeveel de punt
// doorzakt; wind: waar hij heen waait, in de maten van het model (op het scherm naar rechts).
const V = { stok: 150, dik: 1.7, lang: 80, hoog: 26, punt: 0.16, golf: 4, golfOp: 3.4, golfLengte: 34, zak: 0.1, wind: [-1, 1] };
const STANDEN = 4;

// ---------------------------------------------------------------- materialen

const M = { hout: 0, knop: 1, doek: 2, schoof: 3, band: 4, steen: 5, aarde: 6, zoom: 7, halm: 8 };
function materialen() {
  const mat = [];
  mat[M.hout] = { ramp: 'hout', lo: 1, hi: 4.6, patroon: (x, y, z) => (Math.sin(z * 0.9 + x * 2.6) > 0.86 ? -0.6 : 0) };
  mat[M.knop] = { ramp: 'goud', lo: 2.4, hi: 6.6, glans: 1.6 };
  // het doek: diep blauw met de weefdraad van de wapenrok van de soldaten (heer.cjs), en een zoom die iets donkerder is
  mat[M.doek] = { ramp: 'gewaad', lo: 1.8, hi: 5.6, patroon: (x, y, z) => (Math.sin(x * 1.2 + z * 0.35) > 0.9 ? -0.5 : 0) };
  // de zoom boven en onder: goud, zodat de wimpel ook op het donker van land dat je niet kent te zien is
  mat[M.zoom] = { ramp: 'goud', lo: 2.6, hi: 5.6 };
  mat[M.schoof] = { ramp: 'goud', lo: 3.4, hi: 6.8, glans: 1.1 };
  mat[M.band] = { ramp: 'goud', lo: 1.2, hi: 3 };
  mat[M.halm] = { ramp: 'goud', lo: 2.2, hi: 4.8 };
  mat[M.steen] = { ramp: 'steen', lo: 1.4, hi: 5, patroon: (x, y, z) => (ruis3(x * 0.4, y * 0.4, z * 0.4, 81) - 0.5) * 0.8 };
  mat[M.aarde] = { ramp: 'aarde', lo: 1.2, hi: 3.8, patroon: (x, y, z) => (ruis3(x * 0.5, y * 0.5, 0, 82) - 0.5) * 0.8 };
  return mat;
}

// ---------------------------------------------------------------- het wapen op de wimpel

// De korenschoof in het vlak van het doek (X langs de wimpel vanaf het midden van de schoof, Y omhoog), vet, want de
// wimpel is maar 26 hoog: boven drie bossen aren die uitwaaieren (de middelste het hoogst), in het midden een donkere band,
// en onder de halmen in strepen, die naar de voet uitwaaieren. Geeft het materiaal, of null.
function schoof(X, Y) {
  const v = X;
  const w = Y;
  if (Math.abs(w + 1.2) < 0.9 && Math.abs(v) < 2.7) return M.band;
  const ellips = (cx, cy, rx, ry) => ((v - cx) / rx) ** 2 + ((w - cy) / ry) ** 2 < 1;
  if (w > -0.6 && (ellips(0, 4.6, 1.9, 4.4) || ellips(-2.7, 3, 1.7, 3.4) || ellips(2.7, 3, 1.7, 3.4))) return M.schoof;
  if (w < -2 && w > -9.5 && Math.abs(v) < 1.8 + Math.max(0, -w - 3) * 0.32) return Math.floor(v * 1.1 + 20) % 2 ? M.halm : M.schoof;
  return null;
}

// ---------------------------------------------------------------- het model

function vaandel(stand = 0) {
  const d = [];
  const top = [0, 0, V.stok];
  // de staak, een beetje taps, met een gouden knop en een punt erop
  d.push(kegel([0, 0, -4], top, V.dik, V.dik * 0.8, M.hout, 1));
  d.push(bol([0, 0, V.stok + 2], 2.8, M.knop, 2));
  d.push(kegel([0, 0, V.stok + 4], [0, 0, V.stok + 10], 1.6, 0.2, M.knop, 2));
  // aan de voet een hoopje aarde en drie stenen, waar hij in de grond is geslagen
  d.push(bol([0, 0, -3], 7, M.aarde, 3));
  for (const [x, y, r] of [[6, 3, 3.2], [-5, 5, 2.8], [2, -6, 3]]) d.push(bol([x, y, 0.5], r, M.steen, 4));
  // de wimpel: s langs de wind (van de staak af), t dwars, v omlaag vanaf zijn bovenkant; hij zakt naar de punt toe door,
  // wordt smaller, en de golf wordt groter naar de punt
  const wl = Math.hypot(V.wind[0], V.wind[1]);
  const wx = V.wind[0] / wl;
  const wy = V.wind[1] / wl;
  const A = [0, 0, V.stok - 2];
  const fase = (stand * 2 * Math.PI) / STANDEN;
  const naarDoek = (x, y, z) => {
    const s = x * wx + y * wy;
    const t = -x * wy + y * wx;
    const v = A[2] - z - V.zak * Math.max(0, s);
    return [s, t, v];
  };
  const hoogte = (s) => V.hoog * (1 - (1 - V.punt) * Math.max(0, Math.min(1, s / V.lang)));
  const golfOp = (s) => V.golfOp * Math.min(1, Math.max(0, s) / V.lang + 0.05) * Math.sin((2 * Math.PI * s) / V.golfLengte - fase + 1.3);
  const golf = (s, v) => V.golf * Math.min(1, Math.max(0, s) / V.lang + 0.1) * Math.sin((2 * Math.PI * s) / V.golfLengte - fase + 0.06 * v);
  d.push({
    f: (x, y, z) => {
      const [s, t, v] = naarDoek(x, y, z);
      const h = hoogte(s);
      // het midden van het doek zakt mee met de punt (hij wordt smaller naar het midden van de staak toe)
      const midden = V.hoog / 2 + golfOp(s);
      const dv = Math.abs(v - midden) - h / 2;
      const dt = (Math.abs(t - golf(s, v)) - 0.55) * 0.7;
      return Math.max(dt, Math.max(V.dik * 0.6 - s, s - V.lang), dv * 0.9);
    },
    g: [A[0] + wx * V.lang * 0.5, A[1] + wy * V.lang * 0.5, A[2] - V.hoog * 0.5 - V.zak * V.lang * 0.5, Math.hypot(V.lang, V.hoog) * 0.5 + V.zak * V.lang + V.golfOp + 6],
    m: (x, y, z) => {
      const [s, , v] = naarDoek(x, y, z);
      const midden = V.hoog / 2 + golfOp(s);
      const schoofM = schoof(s - 13, midden - v);
      if (schoofM != null) return schoofM;
      if (Math.abs(v - midden) > hoogte(s) / 2 - 1.3) return M.zoom;
      return M.doek;
    },
    deel: 5,
  });
  d.push(Bm.onderGrond);
  return model(d, materialen(), Bm.omhul(d));
}

// ---------------------------------------------------------------- tekenen

const CEL = [180, 220];
const ANKER = [60, 200];

function teken(m, cel = CEL, anker = ANKER, kant = 'Z') {
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

// Een plaat met een effen achtergrond uit een ramp (zodat de rij op gras en de rij op het donker naast elkaar kunnen).
function vlak(b, h, ramp, stap) {
  const p = new K.Plaat(b, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) p.zet(x, y, ramp, stap);
  return p;
}

// Het vel voor het spel (naar-spel.cjs --alleen vaandel): de vier standen naast elkaar, een cel per stand, met het anker
// op de grond aan de voet van de staak; js/sprites.js zoekt er een op met S.vaandel(stand).
function vel() {
  const uit = new K.Plaat(CEL[0] * STANDEN, CEL[1]);
  for (let i = 0; i < STANDEN; i++) uit.plak(teken(vaandel(i)), i * CEL[0], 0);
  return uit;
}
// Wat in beelden/beschrijving.json komt: het bestand, de maat van een cel, het anker en hoeveel standen.
const beschrijving = (bestand) => ({ bestand, cel: CEL, anker: ANKER, standen: STANDEN });

// ---------------------------------------------------------------- de proefplaat

// Een boer en de vier standen naast elkaar op ware grootte, eerst op gras, dan op het donker van land dat je niet kent;
// daaronder de rij op gras twee keer vergroot.
function proef() {
  const uit = path.join(__dirname, 'uit');
  fs.mkdirSync(uit, { recursive: true });
  const { boer } = require('./dorpelingen.cjs');
  const FIG = [112, 124];
  const FIG_ANKER = [56, 110];
  const man = K.losRenderen(boer({ houding: 'staan', fase: 0 }), { b: FIG[0], h: FIG[1], anker: FIG_ANKER, richting: 'Z' });
  const stukken = [{ p: man, ay: FIG_ANKER[1] }];
  for (let i = 0; i < STANDEN; i++) stukken.push({ p: teken(vaandel(i)), ay: ANKER[1] });
  const R = 4;
  const GAT = 10;
  let boven = 0;
  let onder = 0;
  const maten = stukken.map((s) => {
    const k = kader(s.p);
    if (k.x0 <= 0 || k.y0 <= 0 || k.x1 >= s.p.b - 1 || k.y1 >= s.p.h - 1) console.log('LET OP: een beeld raakt de rand van zijn cel');
    boven = Math.max(boven, s.ay - k.y0);
    onder = Math.max(onder, k.y1 - s.ay);
    return { ...s, x0: k.x0 - R, b: k.x1 - k.x0 + 1 + 2 * R };
  });
  const H = boven + onder + 1 + 2 * R;
  const B = maten.reduce((n, s) => n + s.b + GAT, 0);
  const rij = (achter) => {
    const p = achter ? vlak(B, H, ...achter) : new K.Plaat(B, H);
    let x = 0;
    for (const s of maten) {
      p.plak(s.p.uitsnede(s.x0, s.ay - boven - R, s.b, H), x, 0);
      x += s.b + GAT;
    }
    return p;
  };
  const gras = rij(null);
  const donker = rij(['inkt', 1]); // zoals land dat je nog niet kent
  const groot = new K.Plaat(B * 2, H * 2);
  for (let y = 0; y < H; y++) {
    for (let i = 0; i < B; i++) {
      const c = gras.lees(i, y);
      if (c) for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) groot.zet(i * 2 + b, y * 2 + a, c[0], c[1]);
    }
  }
  const samen = new K.Plaat(B * 2, H * 2 + 8 + groot.h);
  samen.plak(gras, 0, 0);
  samen.plak(donker, B, 0);
  samen.plak(groot, 0, H + 8);
  fs.writeFileSync(path.join(uit, 'vaandel-proef.png'), K.png(samen, 1, '#5e6a44'));
  console.log(`uit/vaandel-proef.png (${samen.b}×${samen.h})`);
}

if (require.main === module) proef();

module.exports = { vaandel, vel, beschrijving, teken, CEL, ANKER, STANDEN };
