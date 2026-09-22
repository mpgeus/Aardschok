'use strict';
// huis-sdf-export.cjs: platen van de huizenbouwer uit afstandsfuncties (huis-sdf.cjs).
//
//   node gereedschap/pixelart/huis-sdf-export.cjs materiaal uit/proefhuis/materiaal.png
//   node gereedschap/pixelart/huis-sdf-export.cjs vormen    uit/proefhuis/vormen.png
//   node gereedschap/pixelart/huis-sdf-export.cjs een <vorm> <lagen> <zaad> [nok] [sleutel=waarde ...]
//                                                          uit/proefhuis/een.png en een-x2.png
//   node gereedschap/pixelart/huis-sdf-export.cjs           uit/proefhuis/vergelijk.png
//   node gereedschap/pixelart/huis-sdf-export.cjs knoppen   ook uit/proefhuis/knoppen.png
//
// materiaal.png (ronde 2): de wanden naast elkaar, de daken op een L, twee torens met een plat dak
// en de lap in het riet van dichtbij, en een dorp van zes willekeurige zaden in één beeld. Met
// een <vorm> ... dak=pannen wand=blokhut hout=schors kiest 'een' ook het materiaal.
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
        if (H.plat) zie(...V.wereld(sa * (V.ha + H.uitB + 2), sq * (V.hq + H.uitB + 2)), H.zTop + 6);
        else zie(...V.wereld(sa * V.XR, sq * (V.Qe0 + 10)), H.voetZ - 2 * H.dik);
      }
      if (!H.plat) zie(...V.wereld(sa * V.XR, 0), top(V));
    }
  }
  const S = H.schoorsteen;
  if (S) zie(...S.V.wereld(S.a, S.q), S.V.nokZ(S.a) + H.dik + S.hoog + 12);
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
].map((s) => ({ dak: 'riet', wand: 'vakwerk', ...s })); // ronde 1: alles riet en vakwerk
const LAGEN = { 1: '1 laag', 1.5: '1,5 laag', 2: '2 lagen' };
const opschrift = (s) => `${s.naam}  ${LAGEN[s.lagen]}  nok ${s.nok || 'x'}  zaad ${s.zaad}`;

// ---------------------------------------------------------------- een dorp

// De voetafdruk van een huis in de wereld (eenheden, rond zijn eigen oorsprong), met het dak erbij.
function voetAfdruk(H) {
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  for (const V of H.vleugels) {
    for (const sa of [-1, 1]) {
      for (const sq of [-1, 1]) {
        const [x, y] = V.wereld(sa * V.XR, sq * V.Qe0);
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
      }
    }
  }
  return { x0, x1, y0, y1 };
}

// Een rij huizen op één stuk grond, elk met een eigen zaad en dus een eigen vorm, maat, lagen en
// materiaal (kiesHuis en maten), om en om een eind naar voren en naar achteren zoals huizen langs
// een weg, met een zandpad ervoor. Eén beeld, zodat je ziet of een dorp gevarieerd oogt; de
// tovenaar staat voor de deur van het tweede huis.
function paneelDorp(zaden, o = {}) {
  const t0 = Date.now();
  const TG = K.TEGEL;
  const SQ = Math.SQRT1_2;
  const huizen = zaden.map((z) => {
    const spec = HS.kiesHuis(z);
    const H = HS.maten(z, spec);
    return { spec, H, kd: kaderVan(H), vo: voetAfdruk(H) };
  });
  // van links naar rechts in beeld: een stap Dx (px) naar rechts is (D, -D) / 2√½ in de wereld
  const botst = (a, X, Y, b, X2, Y2, m) => a.x0 + X < b.x1 + X2 + m && b.x0 + X2 < a.x1 + X + m && a.y0 + Y < b.y1 + Y2 + m && b.y0 + Y2 < a.y1 + Y + m;
  let Dx = 0;
  huizen.forEach((hu, i) => {
    const diep = (i % 2 ? 1.4 : -1.4) * TG;
    if (i) Dx += ((huizen[i - 1].kd.b + hu.kd.b) / 2) * 0.5;
    for (;;) {
      hu.X = Dx / (2 * SQ) + diep;
      hu.Y = -Dx / (2 * SQ) + diep;
      if (huizen.slice(0, i).every((h2) => !botst(hu.vo, hu.X, hu.Y, h2.vo, h2.X, h2.Y, TG * 0.4))) break;
      Dx += 6;
    }
    hu.sx = Dx;
    hu.sy = diep * SQ;
  });
  // de rij rond de oorsprong, anders loopt hij van de grond af (die is 84 tegels breed)
  const mid = Dx / 2;
  for (const hu of huizen) {
    hu.X -= mid / (2 * SQ);
    hu.Y += mid / (2 * SQ);
    hu.sx -= mid;
  }
  const x0 = Math.min(...huizen.map((h) => h.sx + h.kd.x0));
  const x1 = Math.max(...huizen.map((h) => h.sx + h.kd.x1));
  const y0 = Math.min(...huizen.map((h) => h.sy + h.kd.y0));
  const y1 = Math.max(...huizen.map((h) => h.sy + h.kd.y1));
  const b = Math.ceil(x1 - x0 + 40);
  const h = Math.ceil(y1 - y0 + 130);
  const B = new K.Beeld(b, h, Math.round(20 - x0), Math.round(30 - y0));
  // het pad: een eind voor de voorste huizen langs
  const voor = Math.max(...huizen.map((hu) => (hu.vo.x1 + hu.X + hu.vo.y1 + hu.Y) / 2)) / TG + 0.9;
  const kaart = D_grond(B, { paden: [{ punten: [[voor - 30, voor + 30], [voor + 2, voor - 2], [voor + 30, voor - 30]], breed: 1.7 }] });
  const Rs = [];
  for (const hu of huizen) {
    const W = HS.huis(hu.spec.zaad, hu.spec);
    Rs.push(T.tekenWereld(B, W, { plek: [hu.X, hu.Y] }));
    for (const l of W.lichten) B.lichten.push({ ...l, pos: [l.pos[0] + hu.X, l.pos[1] + hu.Y, l.pos[2]] });
  }
  const msHuis = Date.now() - t0;
  const hu = huizen[Math.min(1, huizen.length - 1)];
  const [tx, ty] = HS.voorDeDeur(hu.H, 1.25);
  D.zetModel(B, F.tovenaar(84), tx + hu.X / TG, ty + hu.Y / TG, 'Z');
  D.grasPollen(B, kaart, { dicht: 0.8 });
  grondZon(B, { f: (x, y, z) => Math.min(...Rs.map((R) => R.f(x, y, z))) }, { kracht: 2.6 });
  K.belicht(B, { omgeving: () => 0.2 });
  D.avondlicht(B, { warm: WARM });
  K.verwarm(B, 1.8);
  K.omlijn(B);
  const extra = huizen.map((hu) => ({ zaad: hu.spec.zaad, x: hu.sx + B.OX, vorm: hu.spec.vorm, lagen: hu.spec.lagen, dak: hu.H.dak, wand: hu.H.wandLagen.map((l) => l.join(' en ')).join(', '), hout: hu.H.hout }));
  return { p: K.Plaat.van(K.kwantiseer(B)), ms: msHuis, msTotaal: Date.now() - t0, extra };
}
// de grond, met paden erop
function D_grond(B, o = {}) {
  const kaart = D.grondKaart({ zaad: 5, ...o });
  K.tekenDozen(B, [K.doos(-40, -40, 44, 44, -16, 0, D.grondTex(kaart, { dor: true }))]);
  return kaart;
}

// Een draad die panelen rendert: een huis ({ spec, o }) of een dorp ({ dorp: zaden, o }).
if (!isMainThread && workerData === 'huis') {
  parentPort.on('message', ({ i, spec, o, dorp }) => {
    const r = dorp ? paneelDorp(dorp, o) : paneelHuis(spec, o);
    parentPort.postMessage({ i, b: r.p.b, h: r.p.h, px: r.p.px, ms: r.ms, msTotaal: r.msTotaal, extra: r.extra });
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
        uit[m.i] = { p, ms: m.ms, msTotaal: m.msTotaal, extra: m.extra };
        log(`${taken[m.i].naam || opschrift(taken[m.i].spec)}`.padEnd(52), `${(m.ms / 1000).toFixed(1)} s (paneel ${(m.msTotaal / 1000).toFixed(1)} s)`);
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

// ---------------------------------------------------------------- materiaal.png

// Ronde 2: (a) de wanden naast elkaar, op hetzelfde huis met riet; (b) de daken op een L, zodat je
// de kil en de schild ziet; (c) twee torens met een plat dak, en de lap in het riet van dichtbij;
// (d) een rij van zes huizen met willekeurige zaden.
const WANDPLAAT = [
  ['vakwerk', { wand: 'vakwerk' }],
  ['vlechtwerk met leem', { wand: 'vlecht' }],
  ['planken grijs', { wand: 'planken', hout: 'schors' }],
  ['planken bruin', { wand: 'planken', hout: 'hout' }],
  ['blokhut', { wand: 'blokhut' }],
  ['veldsteen', { wand: 'veldsteen' }],
].map(([naam, w], i) => ({ naam, spec: { zaad: 31 + i, vorm: 'rechthoek', b: 7, d: 5, lagen: 1, dak: 'riet', ...w } }));
const DAKPLAAT = ['riet', 'spanen', 'leien', 'pannen'].map((dak, i) => ({ naam: dak, spec: { zaad: 41 + i, vorm: 'L', b: 8, d: 5, b2: 4, d2: 7, lagen: 1, dak, wand: 'vakwerk' } }));
const TORENPLAAT = [
  { naam: 'wachttoren, kantelen', spec: { zaad: 51, dak: 'plat', lagen: 3, b: 4, d: 4 } },
  { naam: 'borstwering', spec: { zaad: 52, dak: 'plat', lagen: 2, b: 5, d: 4, kantelen: false } },
];
const DORPZADEN = [101, 102, 103, 104, 105, 106];

// waar het midden van de lap in het riet in beeld valt, vanaf de oorsprong van het huis
function lapOpScherm(H) {
  const L = H.lap;
  if (!L) return null;
  const V = L.V;
  const q = V.voetQ(L.a) - L.h * Math.cos(H.helling);
  const [x, y] = V.wereld(L.a, q);
  const z = V.voetZ(L.a) + L.h * Math.sin(H.helling) + H.dik;
  return [x * K.EX[0] + y * K.EX[1] + z * K.EX[2], x * K.EY[0] + y * K.EY[1] + z * K.EY[2]];
}

async function materiaal() {
  const t0 = Date.now();
  const maat = (lijst, extraB, extraH) => {
    const kd = lijst.map((t) => kaderVan(HS.maten(t.spec.zaad, t.spec)));
    return [Math.ceil(Math.max(...kd.map((k) => k.b)) + extraB), Math.ceil(Math.max(...kd.map((k) => k.h)) + extraH)];
  };
  const [wb, wh] = maat(WANDPLAAT, 16, 70);
  const [db, dh] = maat(DAKPLAAT, 16, 70);
  const [tb, th] = maat(TORENPLAAT, 30, 70);
  const taken = [
    ...WANDPLAAT.map((t) => ({ ...t, o: { b: wb, h: wh, onder: 36 } })),
    ...DAKPLAAT.map((t) => ({ ...t, o: { b: db, h: dh, onder: 36 } })),
    ...TORENPLAAT.map((t) => ({ ...t, o: { b: tb, h: th, onder: 36 } })),
    { naam: 'dorp, zaden ' + DORPZADEN.join(' '), dorp: DORPZADEN, o: {} },
  ];
  // het dorp duurt het langst (zes huizen achter elkaar): dat eerst
  const volgorde = [taken.length - 1, ...taken.slice(0, -1).map((_, i) => i)];
  const draden = Math.max(2, Math.min(13, os.cpus().length - 2));
  const r = await renderAlle(volgorde.map((i) => taken[i]), draden);
  const platen = [];
  volgorde.forEach((i, j) => (platen[i] = r[j]));
  const [wand, dak, toren, dorp] = [platen.slice(0, 6), platen.slice(6, 10), platen.slice(10, 12), platen[12]];

  // de lap van dichtbij: uit het paneel met riet, twee keer vergroot
  const rietT = DAKPLAAT[0];
  const Hr = HS.maten(rietT.spec.zaad, rietT.spec);
  const kd = kaderVan(Hr);
  const lap = lapOpScherm(Hr);
  const OX = Math.round(db / 2 - (kd.x0 + kd.x1) / 2);
  const OY = Math.round(dh - 36 - kd.y1);
  const lb = 2 * tb - 20;
  const lh = Math.round(lb * 0.5);
  const lapGroot = lap ? vergroot(dak[0].p.uitsnede(Math.round(OX + lap[0] - lb / 4), Math.round(OY + lap[1] - lh / 4), Math.round(lb / 2), Math.round(lh / 2)), 2) : null;

  // de plaat: bovenaan links de wanden (drie bij twee), rechts de torens en de lap; daaronder de
  // daken; onderaan het dorp
  const S = STROOK;
  const bovenB = 3 * wb + 2 * tb + 16;
  const bovenH = Math.max(2 * (S + wh), S + th + S + (lapGroot ? lapGroot.h : 0));
  const B = Math.max(bovenB, 4 * db, dorp.p.b);
  const Hh = S + bovenH + S + S + dh + S + S + dorp.p.h;
  const plaat = new K.Plaat(B, Hh);
  let y = 0;
  schrijf(plaat, 'a  wanden, zelfde huis met riet', 8, y + 6);
  schrijf(plaat, 'c  plat dak, alleen op steen', 3 * wb + 24, y + 6);
  y += S;
  wand.forEach((q, i) => {
    const x = (i % 3) * wb;
    const yy = y + Math.floor(i / 3) * (S + wh);
    plaat.plak(q.p, x, yy + S);
    schrijf(plaat, WANDPLAAT[i].naam, x + 8, yy + 6);
  });
  toren.forEach((q, i) => {
    const x = 3 * wb + 16 + i * tb;
    plaat.plak(q.p, x, y + S);
    schrijf(plaat, TORENPLAAT[i].naam, x + 8, y + 6);
  });
  if (lapGroot) {
    const x = 3 * wb + 16;
    const yy = y + S + th;
    schrijf(plaat, 'de lap in het riet, x2', x + 8, yy + 6);
    plaat.plak(lapGroot, x, yy + S);
  }
  y += bovenH + S;
  schrijf(plaat, 'b  daken, op een L met kil en schild', 8, y + 6);
  y += S;
  dak.forEach((q, i) => {
    plaat.plak(q.p, i * db, y + S);
    schrijf(plaat, DAKPLAAT[i].naam, i * db + 8, y + 6);
  });
  y += S + dh;
  schrijf(plaat, 'd  zes willekeurige zaden', 8, y + 6);
  y += S;
  plaat.plak(dorp.p, 0, y + S);
  for (const e of dorp.extra) schrijf(plaat, `zaad ${e.zaad}`, Math.round(e.x) - 40, y + 6);
  fs.writeFileSync(path.join(UIT, 'materiaal.png'), K.png(plaat, 1, '#0e0a14'));
  log(`materiaal.png  ${plaat.b}×${plaat.h}, ${draden} draden, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  for (const e of dorp.extra) log(`  zaad ${e.zaad}: ${e.vorm} ${e.lagen} laag, ${e.dak}, ${e.wand}, ${e.hout}`);
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
  } else if (wat === 'materiaal') {
    materiaal().then(() => log(`totaal ${((Date.now() - t0) / 1000).toFixed(1)} s`));
  } else if (wat === 'een') {
    // één huis naar keuze: een <vorm> <lagen> <zaad> [nok] [sleutel=waarde ...]; schrijft het
    // paneel en het huis twee keer vergroot. snede=x,y,b,h kiest een uitsnede voor het vergrote.
    const [vorm = 'rechthoek', lagen = '1', zaad = '1', nok = 'x', ...rest] = process.argv.slice(3);
    const spec = { vorm, lagen: Number(lagen), zaad: Number(zaad), nok };
    let snede = null;
    for (const kv of rest) {
      const [k, v] = kv.split('=');
      if (k === 'snede') snede = v.split(',').map(Number);
      else if (k === 'wand' && v.includes(',')) spec.wand = v.split(',');
      else spec[k] = k === 'voor' || k === 'kantelen' ? v !== 'false' : Number.isNaN(Number(v)) ? v : Number(v);
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
  if (wat !== 'vormen' && wat !== 'materiaal') log(`totaal ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}

module.exports = { paneelNu, paneelProef, paneelHuis, kaderVan, grondZon };
