// De HD-proef met het wagenwiel (werklijst vraag 180; Marcels vierde opdracht in gereedschap/ai/opdracht-comfyui.md, het
// verslag in gereedschap/ai/hd-wielproef.md): waar zit de grens van de kwaliteit, in de materialen, de geometrie, de
// interne resolutie of de pixelverwerking? Het linkerwiel van de ossenkar in drie varianten:
//
//   A  zoals het is: de geometrie, kleuren en materialen van ossenkar.cjs (het hout procedureel);
//   B  dezelfde geometrie, met AI-materialen en hun afwerking (textuur.cjs, kern.cjs `afwerken`): texturen uit SDXL
//      (texturen/hout-grof.png, ijzer-gesmeed.png), de dichtheid en het contrast, reliëf uit de helderheid, holtes en
//      randen uit de afstandsfunctie, warm en koel licht, glans op het ijzer, en klinknagels als versiering op de band;
//   C  de materialen van B op een beter wiel (`wielC`, met onderdelen.cjs): een stevigere band met nagels, een velg in
//      vier stukken met beslag op de naden, taps toelopende afgeschuinde spaken, en een gelaagde naaf. Dezelfde
//      buitenmaat, dikte, plek en as.
//
// En een ladder: van A naar C, bij elke trede één verandering, om te zien welke wat doet.
//
// Op drie interne resoluties (kern.cjs o.fijn: 1, 2 en 4 pixels per eenheid), acht richtingen en negen standen (de acht
// van het lopen en een volle slag).
//
//   node gereedschap/pixelart/hdproef.cjs proef [fijn]       één beeld per variant (snel, om af te stellen)
//   node gereedschap/pixelart/hdproef.cjs alles               rendert alles (parallel, per variant en resolutie) en de platen
//   node gereedschap/pixelart/hdproef.cjs render <fijn> <v>   één variant op één resolutie (dat doet `alles`)
//   node gereedschap/pixelart/hdproef.cjs platen              de platen en de metingen uit wat er gerenderd is
'use strict';
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const K = require('./kern.cjs');
const O = require('./ossenkar.cjs');
const TX = require('./textuur.cjs');
const OD = require('./onderdelen.cjs');
const { model } = require('./figuren.cjs');
const { beweging } = require('./houding.cjs');
const { apng } = require('./apng.cjs');
const E = require('../ai/etiket.cjs');

const UIT = path.join(__dirname, 'uit', 'hdproef');
const ZIJ = -1; // het linkerwiel: naar zuidwest zie je zijn buitenkant, zoals het wiel vooraan op de ChatGPT-wagen
const C = [ZIJ * O.WIEL.x, 0, O.WIEL.r];
const AS = [1, 0, 0];
const STANDEN = [0, 1, 2, 3, 4, 5, 6, 7].map((f) => ({ naam: `stand ${f}`, hoek: O.WIEL.draai * (f / 8) })).concat([{ naam: 'volle slag', hoek: 2 * Math.PI }]);
const CEL = [150, 130, 75, 100]; // b, h, OX, OY op 1×; op N× alles maal N
const RESOLUTIES = [1, 2, 4];
const PALET = 64; // kleuren per ding (B en C), over alle beelden van een resolutie
// De ladder uit twee richtingen: zuidwest (de voorkant van het wiel staat dan van de zon af, zoals de kant van de kar) en
// noordwest (de voorkant in de zon).
const LADDER_KANTEN = ['ZW', 'NW'];

// ---------------------------------------------------------------- de materialen

const T = (naam) => TX.laad(path.join(__dirname, 'texturen', `${naam}.png`));
const TEX = { hout: T('hout'), ijzer: T('ijzer'), houtHd: T('hout-grof'), ijzerHd: T('ijzer-gesmeed') };

// stappen: { tex: 'proef' (de texturen van de derde proef) of 'hd', reliëf, randen (holtes en randen), licht (warm, koel,
// glans), nagels }. Zonder textuur: de materialen van de ossenkar.
function materialen(st) {
  const mat = O.materialen(0);
  if (!st) return mat;
  if (st.tex === 'proef') {
    mat[O.M.wiel] = TX.textuurMateriaal({ textuur: TEX.hout, toon: [150, 92, 54], ramp: 'hout', schaal: 4, lo: 1.0, hi: 5.0 });
    mat[O.M.ijzer] = TX.textuurMateriaal({ textuur: TEX.ijzer, toon: [92, 98, 112], ramp: 'ijzer', schaal: 4, lo: 0.6, hi: 3.6, glans: 1.2 });
    return mat;
  }
  const afw = (hout) => {
    const a = {};
    if (st.reliëf) a.reliëf = 1;
    if (st.randen) {
      a.holtes = hout ? 0.55 : 0.5;
      a.randen = hout ? { licht: 0.35, slijt: [1.22, 1.14, 1.02] } : { licht: 0.35, slijt: [1.2, 1.2, 1.25] };
    }
    if (st.licht) {
      a.warm = hout ? [1.12, 1.0, 0.84] : [1.05, 1.0, 0.94];
      a.koel = hout ? [0.78, 0.84, 1.04] : [0.82, 0.88, 1.06];
      if (!hout) Object.assign(a, { glans: 0.35, glansMacht: 24 });
    }
    return Object.keys(a).length ? a : undefined;
  };
  // omslag (kern.cjs: het licht loopt om, zodat een vlak dat van de zon af staat niet zwart wordt) hoort bij het licht
  const omslag = st.licht ? { omslag: 0.8 } : {};
  mat[O.M.wiel] = TX.textuurMateriaal({
    textuur: TEX.houtHd, toon: [156, 94, 50], contrast: 3, schaal: 1, reliëf: st.reliëf ? 0.14 : 0,
    ramp: 'hout', lo: 1.0, hi: 5.0, ...omslag, afwerking: afw(true),
  });
  mat[O.M.ijzer] = TX.textuurMateriaal({
    textuur: TEX.ijzerHd, toon: [84, 88, 100], contrast: 1.3, schaal: 6, reliëf: st.reliëf ? 0.12 : 0,
    ramp: 'ijzer', lo: 0.6, hi: 3.6, ...(st.licht ? {} : { glans: 1.2 }), ...omslag, afwerking: afw(false),
  });
  return mat;
}

// ---------------------------------------------------------------- de geometrie

const draai = (hoek) => beweging({ as: AS, graden: (-hoek * 180) / Math.PI, om: C });

// A: het wiel van ossenkar.cjs. Zonder textuur precies zoals de kar het bouwt (op zijn hoek); met een textuur in rust
// gebouwd en gedraaid, zodat de textuur vastzit (de derde proef). Met nagels: klinknagels als versiering op de zijkanten
// van de band (de band is het tweede deel van O.wiel) en op de ring van de naaf (het vierde).
function wielA(hoek, st) {
  if (!st) return O.wiel(ZIJ, hoek);
  const delen = O.wiel(ZIJ, 0);
  if (st.nagels) {
    const nagel = { soort: 'nagels', straal: 0.45, hoogte: 0.28, kleur: [150, 150, 160], rand: 0.6 };
    TX.metVersiering(delen[1], [{ ...nagel, aantal: 16, v: [1000 + O.WIEL.r - 0.55, -1000 + O.WIEL.r - 0.55] }]);
    TX.metVersiering(delen[3], [{ ...nagel, aantal: 6, straal: 0.38, v: [ZIJ * 1000 + 1.8] }]);
  }
  return TX.beweeg(delen, draai(hoek));
}

// C: een beter wiel met dezelfde buitenmaat (de band tot WIEL.r), dikte (de band ±1,9, de velg ±1,6), plek en as. In rust
// gebouwd (hoek 0) en gedraaid zoals B. o.forser: de maten binnenin zoals op de ChatGPT-wagen (de pixel art overdrijft ze
// om ze leesbaar te houden): de band, de velg, de spaken en de naaf zo'n anderhalf keer zo fors; de buitenmaat gelijk.
function wielC(s, o = {}) {
  const F = o.forser ? { band: 2.4, velg: 19.0, b0: 3.4, b1: 2.6, d0: 2.4, d1: 2.0, naaf: 1.18 } : { band: 1.7, velg: 20.6, b0: 2.3, b1: 1.6, d0: 1.9, d1: 1.4, naaf: 1 };
  const c = [s * O.WIEL.x, 0, O.WIEL.r];
  const R = O.WIEL.r;
  const M = O.M;
  const D = { band: 30, velg: 31, spaak: 32, naaf: 33, beslag: 34 };
  const d = [];
  // de band: dikker naar binnen (1,7 in plaats van 1,1), met zestien nagels aan elke kant
  d.push(OD.ringStuk({ midden: c, as: AS, r0: R - F.band, r1: R, half: 1.9, afschuin: 0.35, m: M.ijzer, deel: D.band }));
  for (const kant of [-1, 1]) d.push(OD.nagelKring({ midden: c, as: AS, r: R - F.band / 2, aantal: 16, langsAs: kant * 1.9, kant, begin: Math.PI / 16, straal: 0.5, hoogte: 0.3, m: M.ijzer, deel: D.beslag }));
  // de velg: vier stukken van twee spaken, met een naad ertussen (tussen twee spaken in), en een ijzeren plaatje over elke
  // naad aan de buitenkant, met twee nagels
  const r0 = F.velg;
  const r1 = R - F.band - 0.08;
  for (let k = 0; k < 4; k++) {
    const naad = Math.PI / 2 + Math.PI / 8 + (k * Math.PI) / 2;
    const gat = 0.3 / ((r0 + r1) / 2);
    d.push(OD.ringStuk({ midden: c, as: AS, r0, r1, half: 1.6, van: naad + gat / 2, tot: naad + Math.PI / 2 - gat / 2, afschuin: 0.5, m: M.wiel, deel: D.velg }));
    d.push(OD.ringStuk({ midden: c, as: AS, r0: r0 + 0.5, r1: r1 - 0.2, half: 0.22, langsAs: s * 1.75, van: naad - 0.085, tot: naad + 0.085, afschuin: 0.12, m: M.ijzer, deel: D.beslag }));
    for (const rr of [r0 + 1.3, r1 - 1.0]) d.push(OD.nagel(OD.opKring(c, AS, naad, rr, s * 1.97), [s, 0, 0], 0.36, 0.24, M.ijzer, D.beslag));
  }
  // de spaken: taps (breed bij de naaf), afgeschuind, met hun breedte langs de omtrek
  for (let k = 0; k < O.WIEL.spaken; k++) {
    const a = Math.PI / 2 + (k * 2 * Math.PI) / O.WIEL.spaken;
    d.push(OD.balk(OD.opKring(c, AS, a, 4.3 * F.naaf), OD.opKring(c, AS, a, r0 + 0.7), { b0: F.b0, b1: F.b1, d0: F.d0, d1: F.d1, breedteRichting: [0, -Math.sin(a), Math.cos(a)], afschuin: 0.5, m: M.wiel, deel: D.spaak }));
  }
  // de naaf: een ton van hout (in het midden het dikst), twee ijzeren banden erom, een kap aan elke kant, nagels in de
  // buitenste kap, en de moer op de as
  d.push(TX.metUv({
    f: (x, y, z) => {
      const ax = x - c[0];
      const dr = Math.hypot(y - c[1], z - c[2]) - (4.5 * F.naaf - 0.035 * ax * ax);
      const da = Math.abs(ax) - 3.3;
      return Math.min(Math.max(dr, da), 0) + Math.hypot(Math.max(dr, 0), Math.max(da, 0)) - 0.45;
    },
    g: [c[0], c[1], c[2], 6.5],
    m: M.wiel,
    deel: D.naaf,
  }, TX.rond(c, AS, 4.8)));
  for (const kant of [-1, 1]) d.push(OD.ringStuk({ midden: c, as: AS, r0: 4.3 * F.naaf, r1: 5.15 * F.naaf, half: 0.42, langsAs: kant * 2.3, afschuin: 0.18, m: M.ijzer, deel: D.beslag }));
  d.push(OD.ringStuk({ midden: c, as: AS, r0: 0, r1: 3.1 * F.naaf, half: 0.32, langsAs: s * 3.9, afschuin: 0.22, m: M.ijzer, deel: D.beslag }));
  d.push(OD.ringStuk({ midden: c, as: AS, r0: 0, r1: 3.1 * F.naaf, half: 0.15, langsAs: -s * 3.85, afschuin: 0.12, m: M.ijzer, deel: D.beslag }));
  d.push(OD.nagelKring({ midden: c, as: AS, r: 2.25, aantal: 6, langsAs: s * 4.22, kant: s, straal: 0.36, hoogte: 0.24, m: M.ijzer, deel: D.beslag }));
  d.push(OD.ringStuk({ midden: c, as: AS, r0: 0, r1: 1.25, half: 0.2, langsAs: s * 4.4, afschuin: 0.15, m: M.ijzer, deel: D.beslag }));
  return d;
}
function wielCGedraaid(hoek, o) {
  return TX.beweeg(wielC(ZIJ, o), draai(hoek));
}

// ---------------------------------------------------------------- de varianten en de ladder

const VOL = { tex: 'hd', reliëf: true, randen: true, licht: true, nagels: true };
const VARIANTEN = {
  A: { naam: 'A: origineel', geo: 'A', st: null },
  B: { naam: 'B: AI-materialen', geo: 'A', st: VOL },
  C: { naam: 'C: geometrie + AI-materialen', geo: 'C', st: VOL },
};
const LADDER = [
  { naam: 'A: origineel', geo: 'A', st: null },
  { naam: '+ AI-textuur (proef 3)', geo: 'A', st: { tex: 'proef' } },
  { naam: '+ grove nerf, contrast', geo: 'A', st: { tex: 'hd' } },
  { naam: '+ reliëf', geo: 'A', st: { tex: 'hd', reliëf: true } },
  { naam: '+ holtes en randen', geo: 'A', st: { tex: 'hd', reliëf: true, randen: true } },
  { naam: '+ warm licht, omslag, glans', geo: 'A', st: { tex: 'hd', reliëf: true, randen: true, licht: true } },
  { naam: '+ nagels = B', geo: 'A', st: VOL },
  { naam: 'C-geometrie, oude materialen', geo: 'C', st: null },
  { naam: 'C-geometrie + B = C', geo: 'C', st: VOL },
  // de pixelverwerking (Marcels punt 4): een binnenlijn waar een onderdeel voor een ander ligt (kern.cjs omlijn, `naad`,
  // gewoon 5 eenheden diepte), en minder kleuren
  { naam: 'C + binnenlijnen, 24 kleuren', geo: 'C', st: VOL, naad: 0.3, palet: 24 },
  // en de maten van de ChatGPT-wagen (binnenin; de buitenmaat gelijk)
  { naam: 'idem, forser (zoals ChatGPT)', geo: 'C', forser: true, st: VOL, naad: 0.3, palet: 24 },
];

function wielModel(v, hoek) {
  const delen = v.geo === 'C' ? wielCGedraaid(hoek, { forser: v.forser }) : wielA(hoek, v.st);
  return model(delen, materialen(v.st), { midden: C, straal: O.WIEL.r + 6 });
}

// Eén beeld: met en zonder omlijning (de omlijning op de doelmaat, bij het verkleinen), de buffers voor de metingen.
// rust: de plek in rust per pixel bewaren (voor de metingen; op 16× is dat 80 MB per beeld, dus uit te zetten).
function render(v, kant, hoek, fijn, rust = true) {
  const B = new K.Beeld(CEL[0] * fijn, CEL[1] * fijn, CEL[2] * fijn, CEL[3] * fijn);
  const t0 = process.hrtime.bigint();
  K.tekenModel(B, wielModel(v, hoek), { richting: kant, rust, fijn });
  K.belicht(B);
  const zonder = K.kleurBeeld(B);
  K.omlijn(B, v.naad ? { naad: v.naad } : {});
  const met = K.kleurBeeld(B);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  return { B, met, zonder, ms };
}

// ---------------------------------------------------------------- beelden: palet, verkleinen, omlijnen

const alfa = (r, i) => r.rgba[i * 4 + 3] >= 128;
function naarPalet(r, P) {
  const uit = { b: r.b, h: r.h, rgba: Buffer.from(r.rgba) };
  const cache = new Map();
  for (let i = 0; i < r.b * r.h; i++) {
    if (!alfa(r, i)) continue;
    const k = (r.rgba[i * 4] << 16) | (r.rgba[i * 4 + 1] << 8) | r.rgba[i * 4 + 2];
    let p = cache.get(k);
    if (!p) {
      let beste = Infinity;
      for (const q of P) {
        const d = (q[0] - r.rgba[i * 4]) ** 2 + (q[1] - r.rgba[i * 4 + 1]) ** 2 + (q[2] - r.rgba[i * 4 + 2]) ** 2;
        if (d < beste) {
          beste = d;
          p = q;
        }
      }
      cache.set(k, p);
    }
    uit.rgba[i * 4] = p[0];
    uit.rgba[i * 4 + 1] = p[1];
    uit.rgba[i * 4 + 2] = p[2];
  }
  return uit;
}
function paletVan(beelden, n) {
  const kleuren = [];
  for (const r of beelden) for (let i = 0; i < r.b * r.h; i += 2) if (alfa(r, i)) kleuren.push([r.rgba[i * 4], r.rgba[i * 4 + 1], r.rgba[i * 4 + 2]]);
  return TX.palet(kleuren, n);
}
// Verkleinen met een hele factor n. 'naast' (nearest neighbour): de pixel in het midden van elk blok. 'filter': het
// gemiddelde van het blok in lineair licht (sRGB eruit en erin), dekkend als minstens de helft dekt, gemiddeld over
// wat dekt; daarna naar het palet van de doelmaat.
const lin = (c) => ((c / 255) <= 0.04045 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4);
const srgb = (l) => Math.round(255 * (l <= 0.0031308 ? 12.92 * l : 1.055 * l ** (1 / 2.4) - 0.055));
function verklein(r, n, soort) {
  const b = Math.floor(r.b / n);
  const h = Math.floor(r.h / n);
  const uit = { b, h, rgba: Buffer.alloc(b * h * 4) };
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
    const o = (y * b + x) * 4;
    if (soort === 'naast') {
      const s = ((y * n + (n >> 1)) * r.b + x * n + (n >> 1)) * 4;
      r.rgba.copy(uit.rgba, o, s, s + 4);
      continue;
    }
    let dek = 0;
    const som = [0, 0, 0];
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const s = ((y * n + j) * r.b + x * n + i) * 4;
      if (r.rgba[s + 3] < 128) continue;
      dek++;
      for (let c = 0; c < 3; c++) som[c] += lin(r.rgba[s + c]);
    }
    if (dek * 2 < n * n) continue;
    for (let c = 0; c < 3; c++) uit.rgba[o + c] = srgb(som[c] / dek);
    uit.rgba[o + 3] = 255;
  }
  return uit;
}
// Een omlijning van één pixel om wat dekt, op de doelmaat (na het verkleinen): de kleur ernaast, donker; aan de lichte
// kant (links en boven) iets minder donker, zoals omlijn in kern.cjs.
function omlijnBeeld(r) {
  const uit = { b: r.b, h: r.h, rgba: Buffer.from(r.rgba) };
  const buren = [[-1, 0, 0.5], [1, 0, 0.3], [0, -1, 0.5], [0, 1, 0.3]];
  for (let y = 0; y < r.h; y++) for (let x = 0; x < r.b; x++) {
    const i = y * r.b + x;
    if (alfa(r, i)) continue;
    for (const [dx, dy, f] of buren) {
      const xx = x - dx;
      const yy = y - dy;
      if (xx < 0 || yy < 0 || xx >= r.b || yy >= r.h || !alfa(r, yy * r.b + xx)) continue;
      const j = (yy * r.b + xx) * 4;
      uit.rgba.set([Math.round(r.rgba[j] * f * 0.6), Math.round(r.rgba[j + 1] * f * 0.6), Math.round(r.rgba[j + 2] * f * 0.6), 255], i * 4);
      break;
    }
  }
  return uit;
}

// ---------------------------------------------------------------- metingen

const verschil = (a, i, b, j) => Math.hypot(a.rgba[i * 4] - b.rgba[j * 4], a.rgba[i * 4 + 1] - b.rgba[j * 4 + 1], a.rgba[i * 4 + 2] - b.rgba[j * 4 + 2]);
// Vastzitten (zoals wielproef.cjs): op de zijvlakken per plek op het wiel (op een halve eenheid) de kleur in elke stand;
// het gemiddelde verschil met het gemiddelde van die plek. De plek los van de renderer uitgerekend (B.pos, terug gedraaid
// over de hoek van de stand). Twee maten: met zonderLicht de kleur van het oppervlak zelf (B.albedo: schuift de textuur
// over het oppervlak?), anders het eindbeeld (flikkert een vaste plek op het wiel, ook door het licht op het reliëf, dat
// meedraait en de zon dus anders vangt?). Laag is vast.
function vastzitten(beelden, rgbas, kant, zonderLicht = false, metSpreiding = false) {
  const h = (K.RICHTING[kant] * Math.PI) / 180;
  const fx = Math.cos(h), fy = Math.sin(h), rx = -fy, ry = fx;
  const plekken = new Map();
  // het vakje: een halve pixel van deze resolutie (op 1× een halve eenheid, zoals wielproef.cjs); een vast vakje van een
  // halve eenheid gaf op 4× vier pixels per vakje, die elk een ander stukje textuur zien, en dan leek een fijnere render
  // minder vast
  const vak = 2 * (beelden[0].b / CEL[0]);
  beelden.forEach((B, s) => {
    const th = STANDEN[s].hoek;
    const c = Math.cos(th), sn = Math.sin(th);
    for (let i = 0; i < B.b * B.h; i++) {
      if (B.ramp[i] < 0 || !(B.vlag[i] & K.VLAG.OMLIJN) || B.vlag[i] & K.VLAG.VAST) continue;
      if (Math.abs(B.nrm[i * 3] * rx + B.nrm[i * 3 + 1] * ry) < 0.9) continue;
      const WX = B.pos[i * 3], WY = B.pos[i * 3 + 1], WZ = B.pos[i * 3 + 2];
      const x = WX * rx + WY * ry, y = WX * fx + WY * fy;
      const dy = y - C[1], dz = WZ - C[2];
      const ry0 = C[1] + dy * c - dz * sn, rz0 = C[2] + dy * sn + dz * c;
      const sleutel = `${Math.round(x * vak)}|${Math.round(ry0 * vak)}|${Math.round(rz0 * vak)}`;
      const k = rgbas[s];
      const kleur = zonderLicht ? (B.albedo && !Number.isNaN(B.albedo[i * 3]) ? [B.albedo[i * 3], B.albedo[i * 3 + 1], B.albedo[i * 3 + 2]] : null) : [k.rgba[i * 4], k.rgba[i * 4 + 1], k.rgba[i * 4 + 2]];
      if (kleur) (plekken.get(sleutel) || plekken.set(sleutel, []).get(sleutel)).push(kleur);
    }
  });
  let som = 0, n = 0;
  const alle = [];
  for (const lijst of plekken.values()) {
    if (lijst.length < 3) continue;
    const m = [0, 1, 2].map((c) => lijst.reduce((s, k) => s + k[c], 0) / lijst.length);
    for (const k of lijst) {
      som += Math.hypot(k[0] - m[0], k[1] - m[1], k[2] - m[2]);
      n++;
      alle.push(k);
    }
  }
  const verschil = som / Math.max(1, n);
  if (!metSpreiding) return +verschil.toFixed(2);
  // de spreiding: hoe ver een kleur gemiddeld van het gemiddelde van alles ligt; schoof de textuur helemaal, dan lag het
  // verschil daar dichtbij. Het deel (verschil / spreiding) is dus los van hoe druk de textuur is: 0 is vast.
  const g = [0, 1, 2].map((c) => alle.reduce((s, k) => s + k[c], 0) / Math.max(1, alle.length));
  const spreiding = alle.reduce((s, k) => s + Math.hypot(k[0] - g[0], k[1] - g[1], k[2] - g[2]), 0) / Math.max(1, alle.length);
  return { verschil: +verschil.toFixed(2), spreiding: +spreiding.toFixed(2), deel: +(verschil / Math.max(1e-9, spreiding)).toFixed(3), n };
}
function gelijkheid(a, b) {
  let zelfde = 0, samen = 0;
  for (let i = 0; i < a.b * a.h; i++) {
    if (!alfa(a, i) && !alfa(b, i)) continue;
    samen++;
    if (alfa(a, i) === alfa(b, i) && verschil(a, i, b, i) < 1) zelfde++;
  }
  return +((zelfde / Math.max(1, samen)) * 100).toFixed(2);
}
function verspringen(rgbas) {
  let som = 0, n = 0;
  for (let s = 1; s < 8; s++) {
    const a = rgbas[s - 1], b = rgbas[s];
    for (let i = 0; i < a.b * a.h; i++) {
      if (!alfa(a, i) || !alfa(b, i)) continue;
      som += verschil(a, i, b, i);
      n++;
    }
  }
  return +(som / Math.max(1, n)).toFixed(2);
}
// ---------------------------------------------------------------- render: één variant op één resolutie

function bewaar(pad, r) {
  fs.mkdirSync(path.dirname(pad), { recursive: true });
  fs.writeFileSync(pad, K.pngVanBeeld(r));
}
const lees = (pad) => K.leesPng(fs.readFileSync(pad));

function renderVariant(fijn, sleutel) {
  const dir = path.join(UIT, `${fijn}x`);
  if (sleutel === 'ladder') {
    const tijden = [];
    LADDER.forEach((v, i) => {
      for (const kant of LADDER_KANTEN) {
        const beelden = [0, 2].map((s) => render(v, kant, STANDEN[s].hoek, fijn));
        const P = v.st ? paletVan(beelden.map((r) => r.met), v.palet || PALET) : null;
        beelden.forEach((r, j) => {
          bewaar(path.join(dir, `ladder-${i}-${kant}-${j * 2}.png`), P ? naarPalet(r.met, P) : r.met);
          tijden.push(r.ms);
        });
      }
    });
    fs.writeFileSync(path.join(dir, 'ladder.json'), JSON.stringify({ msPerBeeld: tijden.reduce((a, b) => a + b, 0) / tijden.length }));
    return;
  }
  const v = VARIANTEN[sleutel];
  const uitkomst = { variant: sleutel, fijn, ms: [], perRichting: {} };
  const alle = {};
  let maxStraal = 0, as0 = Infinity, as1 = -Infinity;
  for (const kant of K.KANTEN) {
    alle[kant] = STANDEN.map((s) => {
      const r = render(v, kant, s.hoek, fijn);
      uitkomst.ms.push(r.ms);
      // de maat in rust (B.rust: de plek in de rusthouding van het onderdeel; voor A zonder rusthouding is dat de kar)
      const R = r.B.rust;
      if (R) for (let i = 0; i < r.B.b * r.B.h; i++) {
        if (Number.isNaN(R[i * 4])) continue;
        maxStraal = Math.max(maxStraal, Math.hypot(R[i * 4 + 1] - C[1], R[i * 4 + 2] - C[2]));
        as0 = Math.min(as0, R[i * 4] - C[0]);
        as1 = Math.max(as1, R[i * 4] - C[0]);
      }
      return r;
    });
  }
  // één palet over alle beelden van deze variant op deze resolutie (A houdt zijn rampkleuren)
  const palet = v.st ? paletVan(K.KANTEN.flatMap((k) => alle[k].map((r) => r.met)), PALET) : null;
  for (const kant of K.KANTEN) {
    const met = alle[kant].map((r) => (palet ? naarPalet(r.met, palet) : r.met));
    const zonder = alle[kant].map((r) => (palet ? naarPalet(r.zonder, palet) : r.zonder));
    met.forEach((r, s) => bewaar(path.join(dir, sleutel, `${kant}-${s}.png`), r));
    zonder.forEach((r, s) => bewaar(path.join(dir, sleutel, `${kant}-${s}-zl.png`), r));
    uitkomst.perRichting[kant] = {
      vastzitten: vastzitten(alle[kant].slice(0, 8).map((r) => r.B), met.slice(0, 8), kant, false, true),
      schuiven: v.st ? vastzitten(alle[kant].slice(0, 8).map((r) => r.B), met.slice(0, 8), kant, true, true) : null,
      volleSlag: gelijkheid(met[0], met[8]),
      verspringen: verspringen(met),
    };
  }
  if (palet) fs.writeFileSync(path.join(dir, sleutel, 'palet.json'), JSON.stringify(palet));
  const gem = (a) => a.reduce((s, x) => s + x, 0) / a.length;
  const gewogen = (lijst) => +(lijst.reduce((s, m) => s + m.deel * m.n, 0) / Math.max(1, lijst.reduce((s, m) => s + m.n, 0))).toFixed(3);
  const pr = Object.values(uitkomst.perRichting);
  Object.assign(uitkomst, {
    msPerBeeld: +gem(uitkomst.ms).toFixed(0),
    // het deel van de spreiding (0 is vast): op het eindbeeld (ook het licht dat met het wiel meedraait: de schaduw van
    // een spaak, het reliëf) en op de kleur van het oppervlak zelf (schuift de textuur?)
    // gewogen naar het aantal meetpunten: naar Z en N staat het wiel op zijn kant, en zie je van het zijvlak bijna niets
    vastzitten: gewogen(pr.map((p) => p.vastzitten)),
    schuiven: v.st ? gewogen(pr.map((p) => p.schuiven)) : null,
    volleSlag: +gem(pr.map((p) => p.volleSlag)).toFixed(2),
    verspringen: +gem(pr.map((p) => p.verspringen)).toFixed(2),
    maat: { straal: +maxStraal.toFixed(2), as: [+as0.toFixed(2), +as1.toFixed(2)] },
    geheugenPiekMB: Math.round(process.memoryUsage().rss / 1e6),
  });
  delete uitkomst.ms;
  fs.writeFileSync(path.join(dir, `${sleutel}.json`), JSON.stringify(uitkomst, null, 2));
  console.log(`${fijn}x ${sleutel}: ${uitkomst.msPerBeeld} ms per beeld, vastzitten ${uitkomst.vastzitten}, schuiven ${uitkomst.schuiven}, volle slag ${uitkomst.volleSlag}%, straal ${uitkomst.maat.straal}, as ${uitkomst.maat.as}`);
}

// ---------------------------------------------------------------- proef: één beeld per variant, om af te stellen

function proef(fijn = 2) {
  fs.mkdirSync(UIT, { recursive: true });
  const kant = process.argv[4] || 'ZW';
  const beelden = LADDER.map((v) => render(v, kant, 0, fijn));
  const u = uitsnede(beelden.map((r) => r.met));
  const rij = beelden.map(({ met, ms }, i) => E.met(snij(met, u, Math.max(1, 8 / fijn)), `${i}: ${LADDER[i].naam} (${ms.toFixed(0)} ms)`));
  E.bewaar(path.join(UIT, `proef-${fijn}x.png`), [rij.slice(0, 5), rij.slice(5)], `De ladder op ${fijn}×`, 'Zuidwest, stand 0.');
  console.log(`uit/hdproef/proef-${fijn}x.png`);
}

// ---------------------------------------------------------------- platen

const GROND = [70, 82, 56];
function snij(r, u, Z = 1, grond = GROND) {
  const uit = { b: u.b * Z, h: u.h * Z, rgba: Buffer.alloc(u.b * Z * u.h * Z * 4) };
  for (let y = 0; y < uit.h; y++) for (let x = 0; x < uit.b; x++) {
    const sx = u.x0 + Math.floor(x / Z), sy = u.y0 + Math.floor(y / Z);
    const s = (sy * r.b + sx) * 4;
    const d = (y * uit.b + x) * 4;
    if (sx >= 0 && sy >= 0 && sx < r.b && sy < r.h && r.rgba[s + 3] >= 128) r.rgba.copy(uit.rgba, d, s, s + 4);
    else uit.rgba.set([...grond, 255], d);
  }
  return uit;
}
function uitsnede(beelden, rand = 2) {
  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
  for (const r of beelden) for (let y = 0; y < r.h; y++) for (let x = 0; x < r.b; x++) if (alfa(r, y * r.b + x)) {
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  return { x0: x0 - rand, y0: y0 - rand, b: x1 - x0 + 1 + 2 * rand, h: y1 - y0 + 1 + 2 * rand };
}
const maal = (u, n) => ({ x0: u.x0 * n, y0: u.y0 * n, b: u.b * n, h: u.h * n });

function platen() {
  const pad = (fijn, v, kant, s, zl = false) => path.join(UIT, `${fijn}x`, v, `${kant}-${s}${zl ? '-zl' : ''}.png`);
  const meting = {};
  for (const f of RESOLUTIES) for (const v of Object.keys(VARIANTEN)) meting[`${v}${f}`] = JSON.parse(fs.readFileSync(path.join(UIT, `${f}x`, `${v}.json`)));
  // een uitsnede per richting op 1×, over alle varianten en standen; op N× maal N (zo staat alles op dezelfde plek)
  const uCache = {};
  const uVan = (kant) => uCache[kant] || (uCache[kant] = uitsnede(Object.keys(VARIANTEN).flatMap((v) => STANDEN.map((_, s) => lees(pad(1, v, kant, s)))), 3));
  const u1 = uVan('ZW');
  const palet = (f, v) => (v === 'A' ? null : JSON.parse(fs.readFileSync(path.join(UIT, `${f}x`, v, 'palet.json'))));
  // 1. native: elke resolutie op zijn eigen pixels (1×: zo groot als hij is, 2× en 4× groter), zuidwest, stand 0
  const NAAM = { A: 'A: origineel', B: 'B: AI-materialen', C: 'C: geometrie + materialen' };
  E.bewaar(path.join(UIT, '1-native.png'), Object.keys(VARIANTEN).map((v) => RESOLUTIES.map((f) => E.met(snij(lees(pad(f, v, 'ZW', 0)), maal(u1, f), 1), `${NAAM[v]} · ${f}× (${u1.b * f}×${u1.h * f})`))),
    'Native: elke interne resolutie op zijn eigen pixels', 'Zuidwest, stand 0. Per rij een variant, per kolom 1×, 2× en 4× (een pixel van het beeld is een pixel van deze plaat).');
  // 2. spelmaat: dezelfde fysieke grootte. Op een scherm van 1920×1080 tekent het spel elke spritepixel nu als 2×2
  // (js/main.js, zoomVenster); op 4K (de tussenbuffer maal 2) als 4×4. Wat een resolutie daar wordt:
  //   1080p: 1× maal 2 (zoals nu); 2× maal 1 (een HD-sprite, op halve zoom getekend); 4× naar 2× verkleind (naast en
  //          gefilterd), maal 1;
  //   en een sprite van de huidige maat uit een fijnere render: 2× en 4× naar 1× (naast en gefilterd), maal 2.
  const groot = (r, n) => snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, n);
  const mp = (r, f, v) => (palet(f, v) ? naarPalet(r, palet(f, v)) : r);
  const gefilterd = (f, v, kant, s, n) => omlijnBeeld(mp(verklein(alfaSnij(lees(pad(f, v, kant, s, true)), maal(u1, f)), n, 'filter'), f / n, v));
  const naast = (f, v, kant, s, n) => verklein(alfaSnij(lees(pad(f, v, kant, s)), maal(u1, f)), n, 'naast');
  const rijen1080 = Object.keys(VARIANTEN).map((v) => [
    E.met(groot(alfaSnijMetGrond(alfaSnij(lees(pad(1, v, 'ZW', 0)), u1)), 2), `${v} 1× nu`),
    E.met(groot(alfaSnijMetGrond(gefilterd(2, v, 'ZW', 0, 2)), 2), '2→1 filter'),
    E.met(groot(alfaSnijMetGrond(naast(2, v, 'ZW', 0, 2)), 2), '2→1 naast'),
    E.met(groot(alfaSnijMetGrond(gefilterd(4, v, 'ZW', 0, 4)), 2), '4→1 filter'),
    E.met(alfaSnijMetGrond(alfaSnij(lees(pad(2, v, 'ZW', 0)), maal(u1, 2))), `${v} 2× HD`),
    E.met(alfaSnijMetGrond(gefilterd(4, v, 'ZW', 0, 2)), '4→2 filter'),
    E.met(alfaSnijMetGrond(naast(4, v, 'ZW', 0, 2)), '4→2 naast'),
  ]);
  // het wiel zelf (zonder de rand van de uitsnede) is zo hoog op 1×
  const wielHoogte = u1.h - 6;
  const ref = referentie(wielHoogte * 2);
  if (ref) rijen1080.push([E.met(ref, 'doel (ChatGPT)')]);
  E.bewaar(path.join(UIT, '2-spelmaat-1080p.png'), rijen1080,
    'Spelmaat op 1920×1080: alles even groot op het scherm', 'Een spritepixel is nu 2×2 schermpixels. Links de sprite van nu (uit 1×, 2× of 4×), rechts een HD-sprite (2 pixels per eenheid). naast: nearest neighbour; filter: gemiddeld in lineair licht, palet, omlijning op de doelmaat.');
  const rijen4k = Object.keys(VARIANTEN).map((v) => RESOLUTIES.map((f) => E.met(groot(alfaSnijMetGrond(alfaSnij(lees(pad(f, v, 'ZW', 0)), maal(u1, f))), 4 / f), `${v} · ${f}×, ×${4 / f}`)));
  const ref4 = referentie(wielHoogte * 4);
  if (ref4) rijen4k.push([E.met(ref4, 'doel: ChatGPT')]);
  E.bewaar(path.join(UIT, '2-spelmaat-4k.png'), rijen4k, 'Spelmaat op een 4K-scherm: alles even groot op het scherm', 'Op 4K tekent het spel een spritepixel als 4×4: dan is 4× native (een pixel per schermpixel) de grens van wat het scherm kan tonen.');
  // 3. acht richtingen: per variant, op 2× (native) en op 1× (×2)
  for (const f of [1, 2]) {
    E.bewaar(path.join(UIT, `3-richtingen-${f}x.png`), Object.keys(VARIANTEN).map((v) => K.KANTEN.map((k) => E.met(groot(alfaSnijMetGrond(alfaSnij(lees(pad(f, v, k, 0)), maal(uVan(k), f))), 2 / f), `${v} · ${k}`))),
      `Acht richtingen op ${f}×, stand 0, op de spelmaat van 1080p`, 'Per rij een variant.');
  }
  // 4. bewegend: het draaien naar zuidwest en naar zuid, per variant, op 1× (×2) en 2× (×1), naast elkaar in één beeld
  for (const kant of ['ZW', 'Z']) {
    const frames = [];
    for (let s = 0; s < 8; s++) {
      const delen = [];
      for (const v of Object.keys(VARIANTEN)) for (const f of [1, 2, 4]) {
        const r = alfaSnijMetGrond(alfaSnij(lees(pad(f, v, kant, s)), maal(uVan(kant), f)));
        delen.push(groot(r, 4 / f));
      }
      frames.push(naastElkaar(delen, 3));
    }
    fs.writeFileSync(path.join(UIT, `4-draaien-${kant}.png`), apng(frames.map((r) => ({ b: r.b, h: r.h, rgba: () => r.rgba })), { fps: 6 }));
  }
  // De ladder: elke trede op 1× (×4), 2× (×2) en 4× (×1)
  for (const kant of LADDER_KANTEN) {
    const uL = uitsnede(LADDER.map((_, i) => lees(path.join(UIT, '1x', `ladder-${i}-${kant}-0.png`))), 3);
    E.bewaar(path.join(UIT, `0-ladder-${kant}.png`), LADDER.map((v, i) => RESOLUTIES.map((f) => E.met(groot(alfaSnijMetGrond(alfaSnij(lees(path.join(UIT, `${f}x`, `ladder-${i}-${kant}-0.png`)), maal(uL, f))), 4 / f), f === 1 ? `${i}. ${v.naam} · 1×` : `${f}×`))),
      `De ladder naar ${kant}: van A naar C, bij elke trede één verandering`, 'Stand 0; per rij 1×, 2× en 4×, alles even groot (zoals op 4K).');
  }
  // De metingen bij elkaar
  const atlas = {};
  for (const f of RESOLUTIES) {
    const b = u1.b * f, h = u1.h * f;
    atlas[`${f}x`] = { sprite: `${b}×${h}`, bytesPerBeeld: b * h * 4, beeldenPerWiel: 64, MBPerWiel: +((b * h * 4 * 64) / 1e6).toFixed(2) };
  }
  const stijl = stijlmaten(pad);
  fs.writeFileSync(path.join(UIT, 'metingen.json'), JSON.stringify({ meting, atlas, stijl }, null, 2));
  for (const [k, m] of Object.entries(stijl)) console.log(`${k}: ${JSON.stringify(m)}`);
  for (const [k, m] of Object.entries(meting)) console.log(`${k}: ${m.msPerBeeld} ms, vastzitten ${m.vastzitten}, volle slag ${m.volleSlag}%, verspringen ${m.verspringen}, straal ${m.maat.straal}, as ${m.maat.as}`);
}
// Een uitsnede met doorzichtige rand (voor verkleinen en omlijnen), en daarna op de grond.
function alfaSnij(r, u) {
  const uit = { b: u.b, h: u.h, rgba: Buffer.alloc(u.b * u.h * 4) };
  for (let y = 0; y < u.h; y++) for (let x = 0; x < u.b; x++) {
    const sx = u.x0 + x, sy = u.y0 + y;
    if (sx < 0 || sy < 0 || sx >= r.b || sy >= r.h) continue;
    r.rgba.copy(uit.rgba, (y * u.b + x) * 4, (sy * r.b + sx) * 4, (sy * r.b + sx) * 4 + 4);
  }
  return uit;
}
const alfaSnijMetGrond = (r) => snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, 1);
function naastElkaar(lijst, per) {
  const rijen = [];
  for (let i = 0; i < lijst.length; i += per) rijen.push(lijst.slice(i, i + per));
  const b = Math.max(...rijen.map((r) => r.reduce((s, x) => s + x.b + 4, 0)));
  const h = rijen.reduce((s, r) => s + Math.max(...r.map((x) => x.h)) + 4, 0);
  const uit = { b, h, rgba: Buffer.alloc(b * h * 4) };
  for (let i = 0; i < b * h; i++) uit.rgba.set([24, 24, 28, 255], i * 4);
  let y = 0;
  for (const rij of rijen) {
    let x = 0;
    for (const r of rij) {
      for (let j = 0; j < r.h; j++) r.rgba.copy(uit.rgba, ((y + j) * b + x) * 4, j * r.b * 4, (j + 1) * r.b * 4);
      x += r.b + 4;
    }
    y += Math.max(...rij.map((r) => r.h)) + 4;
  }
  return uit;
}
// Het doel: het wiel vooraan op de ChatGPT-wagen (uit/ai/hand/wagen-zw.png.png, niet in git), verkleind (gefilterd) tot
// het wiel zo hoog is als het onze op de plaat: zo staan ze op dezelfde fysieke grootte.
function referentie(hoogte) {
  const bron = path.join(__dirname, 'uit', 'ai', 'hand', 'wagen-zw.png.png');
  if (!fs.existsSync(bron)) return null;
  const A = require('../ai/beeld-ai.cjs');
  const r = A.leesPng(fs.readFileSync(bron));
  const s = refWiel(r);
  const n = Math.max(1, Math.round(REF_HOOGTE / hoogte));
  return alfaSnijMetGrond(verklein(s, n, 'filter'));
}

// Het wiel uit de ChatGPT-wagen: de uitsnede, het magenta doorzichtig; met alleenWiel ook wat geen wiel is (de rode bak
// erachter, binnen de ellips van het wiel) doorzichtig, voor de stijlmaten. Het wiel is daar REF_HOOGTE pixels hoog.
const REF_HOOGTE = 420;
function refWiel(r, alleenWiel = false) {
  const u = { x0: 955, y0: 385, b: 350, h: 440 };
  const s = alfaSnij(r, u);
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.b; x++) {
    const i = y * s.b + x;
    const [R, G, B] = [s.rgba[i * 4], s.rgba[i * 4 + 1], s.rgba[i * 4 + 2]];
    let weg = R > 200 && B > 200 && G < 90;
    if (alleenWiel) {
      const ex = (x - 172) / 165;
      const ey = (y - 220) / 210;
      weg = weg || ex * ex + ey * ey > 1 || (R > 1.7 * G && R > 1.7 * B && R > 90) || (R > 170 && G > 130 && B < 70);
    }
    s.rgba[i * 4 + 3] = weg ? 0 : 255;
  }
  return s;
}

// De stijlmaten (stijlmaat.cjs) van de varianten naar zuidwest, stand 0: native op 1× en 2×, en op de spelmaat van 1080p
// (1× uit 1×; 2× als HD-sprite), en van het doel, op de hoogte van het wiel op 2×.
function stijlmaten(pad) {
  const { stijlmaat } = require('./stijlmaat.cjs');
  const uit = {};
  for (const v of Object.keys(VARIANTEN)) for (const f of RESOLUTIES) uit[`${v} ${f}×`] = stijlmaat(lees(pad(f, v, 'ZW', 0)));
  const bron = path.join(__dirname, 'uit', 'ai', 'hand', 'wagen-zw.png.png');
  if (fs.existsSync(bron)) {
    const A = require('../ai/beeld-ai.cjs');
    const w = refWiel(A.leesPng(fs.readFileSync(bron)), true);
    for (const f of [1, 2, 4]) {
      const doel = 52 * f;
      uit[`doel (ChatGPT) op ${f}×`] = stijlmaat(verklein(w, Math.max(1, Math.round(REF_HOOGTE / doel)), 'filter'));
    }
  }
  return uit;
}

// ---------------------------------------------------------------- alles, parallel

async function alles() {
  const taken = [];
  for (const f of [4, 2, 1]) for (const v of [...Object.keys(VARIANTEN), 'ladder']) taken.push([f, v]);
  const t0 = Date.now();
  const tegelijk = 6;
  let i = 0;
  const loop = async () => {
    while (i < taken.length) {
      const [f, v] = taken[i++];
      await new Promise((ok, mis) => execFile(process.execPath, [__filename, 'render', String(f), v], { maxBuffer: 1e7 }, (e, uit, fout) => {
        process.stdout.write(uit);
        if (e) return mis(new Error(fout || e.message));
        ok();
      }));
    }
  };
  await Promise.all(Array.from({ length: tegelijk }, loop));
  console.log(`gerenderd in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  platen();
}

const [wat, a1, a2] = require.main === module ? process.argv.slice(2) : ['geladen'];
if (wat === 'geladen');
else if (wat === 'proef') proef(Number(a1) || 2);
else if (wat === 'render') renderVariant(Number(a1), a2);
else if (wat === 'platen') platen();
else if (wat === 'alles') alles().catch((e) => { console.error(e.message); process.exit(1); });
else console.log('node gereedschap/pixelart/hdproef.cjs proef [fijn] | alles | render <fijn> <A|B|C|ladder> | platen');

module.exports = {
  wielC, materialen, VARIANTEN, LADDER, STANDEN, CEL, renderEen: render, snij, uitsnede, vastzitten,
  verklein, omlijnBeeld, naarPalet, paletVan, alfaSnij, alfaSnijMetGrond, naastElkaar, referentie, bewaar, lees, lin, srgb,
};
