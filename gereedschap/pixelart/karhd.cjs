// De ossenkar in HD (werklijst vraag 180; Marcel, 19 okt: "Ok" op het voorstel: het nieuwe wiel en het handschrift op de
// hele ossenkar, en SDXL alleen op wat groot genoeg is; gereedschap/ai/ai-afwerking.md, "De ossenkar"). Op de
// productiestandaard: 4× gerenderd, een sprite van 2×, met stijl D en het handschrift (stijl.cjs).
//
// Wat erin gaat: de ossenkar van ossenkar.cjs (de wagen van de heer met de buit, zoals de ChatGPT-wagen), onveranderd,
// behalve:
//   - de twee wielen: het wiel naar het doel (hdproef.cjs wielDoel), op de plek van de oude (deel 2 en 3 eruit); zijn
//     soorten onderdelen honderd hoger (130 tot 135), want de buit gebruikt 30 tot 35 ook;
//   - de materialen van hout, ijzer, koper en de rode verf met een textuur (zoals het wiel), met hun eigen licht (lo, hi)
//     en patroon (de naden van de planken, de munten);
//   - de rest (de zakken, het vaantje, de os) houdt de ramp van nu, en krijgt het handschrift via de stap in de ramp
//     (stijl.cjs rampStijl, '~' + rampnaam).
//
//   node gereedschap/pixelart/karhd.cjs proef      zuidwest, stand 0: de proefplaat naast de ChatGPT-wagen en de kar van nu
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const O = require('./ossenkar.cjs');
const H = require('./hdproef.cjs');
const HS = require('./hdstijl.cjs');
const S = require('./stijl.cjs');
const TX = require('./textuur.cjs');
const HH = require('./houding.cjs');
const { model } = require('./figuren.cjs');
const E = require('../ai/etiket.cjs');

const UIT = path.join(__dirname, 'uit', 'karhd');
const FIJN = 4;
const MESSING = 19; // een eigen plek voor het koper van de wielen (M.goud is in de kar het goud van de buit)
const WIELDEEL = 100; // zoveel hoger de soorten onderdelen van het wiel
const SPAAK = 32 + WIELDEEL;
const HOUT = TX.laad(path.join(__dirname, 'texturen', 'hout-grof.png'));

// ---------------------------------------------------------------- de materialen

function materialen(blink = 0) {
  const m = O.materialen(blink);
  const hd = H.materialen(H.DOELWIEL.st);
  const hout = hd[O.M.wiel];
  const ijzer = hd[O.M.ijzer];
  const koper = hd[O.M.goud];
  // hout met textuur, met het licht en het patroon van wat het was (de naden van de planken, de duigen van de ton)
  for (const i of [O.M.hout, O.M.kist, O.M.ton, O.M.touw]) m[i] = { ...hout, lo: m[i].lo, hi: m[i].hi, patroon: m[i].patroon };
  m[O.M.wiel] = hout;
  m[O.M.ijzer] = ijzer;
  m[O.M.ketel] = { ...ijzer, lo: m[O.M.ketel].lo, hi: m[O.M.ketel].hi };
  for (const i of [O.M.goud, O.M.bies, O.M.vaanG]) m[i] = { ...koper, lo: m[i].lo, hi: m[i].hi, patroon: m[i].patroon };
  // rood geverfd hout: de textuur van het hout, getoond naar rood, met de naden van de planken
  m[O.M.verf] = TX.textuurMateriaal({
    textuur: HOUT, toon: [150, 38, 30], contrast: 2, schaal: 1, reliëf: 0.08, ramp: 'rood', lo: m[O.M.verf].lo, hi: m[O.M.verf].hi,
    omslag: 0.8, afwerking: hout.afwerking, patroon: m[O.M.verf].patroon,
  });
  m[MESSING] = koper;
  return m;
}

// ---------------------------------------------------------------- het model

// De twee wielen naar het doel, gedraaid over `hoek` (zoals de kar rijdt), op de plek van de oude.
function wielen(hoek) {
  const d = [];
  for (const s of [-1, 1]) {
    const delen = H.wielDoel(s);
    for (const p of delen) {
      if (p.m === O.M.goud) p.m = MESSING;
      p.deel += WIELDEEL;
    }
    d.push(...TX.beweeg(delen, HH.beweging({ as: [1, 0, 0], graden: (-hoek * 180) / Math.PI, om: [s * O.WIEL.x, 0, O.WIEL.r] })));
  }
  return d;
}
function karModel(o = {}) {
  const k = O.kar({ ...o, hoek: 0 });
  const delen = [...k.delen.filter((d) => d.deel !== 2 && d.deel !== 3), ...wielen(o.hoek || 0)];
  return model(delen, materialen(o.blink || 0), { midden: k.midden, straal: k.straal });
}

// De kar en de os in één beeld (zoals ossenkar.cjs tekenOssenkar), met de G-buffer. Een onderdeel heet daarna
// obj × 1000 + zijn nummer (de kar is obj 1, de os 2), zodat de kar en de os niet hetzelfde nummer hebben.
function render(o, kant, fijn = FIJN) {
  const B = new K.Beeld(O.CEL[0] * fijn, O.CEL[1] * fijn, O.ANKER[0] * fijn, O.ANKER[1] * fijn);
  const a = (K.RICHTING[kant] * Math.PI) / 180;
  const naar = (ly) => ({ gx: (ly * Math.cos(a)) / K.TEGEL, gy: (ly * Math.sin(a)) / K.TEGEL });
  const hoek = o.houding === 'lopen' ? O.WIEL.draai * (o.fase || 0) : 0;
  const km = karModel({ ...o, hoek });
  const om = O.os({ houding: o.houding, fase: o.fase, kleur: o.kleur });
  const t0 = process.hrtime.bigint();
  K.tekenModel(B, km, { richting: kant, ...naar(-O.MIDDEN), rust: true, gbuffer: true, fijn });
  K.tekenModel(B, om, { richting: kant, ...naar(O.OS_Y - O.MIDDEN), rust: true, gbuffer: true, fijn });
  K.belicht(B);
  const zl = K.kleurBeeld(B);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  for (let i = 0; i < B.b * B.h; i++) if (B.rust && !Number.isNaN(B.rust[i * 4])) B.rust[i * 4 + 3] += B.obj[i] * 1000;
  // de nagels: de onderdelen van het wiel zonder afwikkeling (nagel en nagelKring van onderdelen.cjs)
  const nagels = km.delen.map((d, i) => (d.deel >= 130 && !TX.uvVan(d) ? 1000 + i : -1)).filter((i) => i >= 0);
  return { b: B.b, h: B.h, ramp: B.ramp, stap: B.stap, diep: B.diep, deel: B.deel, nrm: B.nrm, rust: B.rust, albedo: B.albedo, g: B.g, kleur: B.kleur, zl, ms, nagels, delen: km.delen.length + om.delen.length };
}

// ---------------------------------------------------------------- de stijl

// Stijl D met het handschrift (zoals doelwiel.cjs stijlVoor hand) voor wat een textuur heeft (hout, ijzer, koper, rood), en
// de ramp van nu (rampStijl) voor de rest; geijkt op zuidwest in twee standen.
function stijlVoor(Rs) {
  const ij = HS.leesIjk();
  const stijl = JSON.parse(JSON.stringify(ij.stijlen.doel));
  const ijzer = stijl.materialen.ijzer;
  const goud = K.RAMP_RGB[K.RAMP.goud].slice(0, 6);
  stijl.materialen.goud = { ...ijzer, reeks: goud, verdeling: S.verdeling(goud.length), lijn: [40, 20, 8], textuur: 0.3, glans: 1.0 };
  const rood = K.RAMP_RGB[K.RAMP.rood].map((k) => [...k]);
  stijl.materialen.rood = { ...stijl.materialen.hout, reeks: rood, verdeling: S.verdeling(rood.length), lijn: rood[0].map((c) => Math.round(c * 0.55)) };
  stijl.detailsWinnen = true;
  stijl.nagelLicht = true;
  stijl.binnenlijnen = { ...stijl.binnenlijnen, naden: true, om: [SPAAK] };
  stijl.materialen.hout.nerf = { ...stijl.materialen.hout.nerf, afstand: 1.3, breedte: 0.5, gat: 0.35, lengte: 4, stap: -3 };
  stijl.materialen.rood.nerf = { ...stijl.materialen.hout.nerf, stap: -1 };
  // de ramps zonder textuur die in deze beelden staan
  const met = (R) => ({ ...stijl, details: new Set(R.nagels) });
  const Gs = Rs.map((R) => S.gbuffer(R, FIJN / 2, met(R)));
  for (const G of Gs) for (let o = 0; o < G.b * G.h; o++) {
    if (!G.dek[o] || !G.kaal[o]) continue;
    const naam = K.RAMP_NAMEN[G.mat[o]];
    if (!stijl.materialen[`~${naam}`]) stijl.materialen[`~${naam}`] = S.rampStijl(naam);
  }
  S.kalibreer(Gs, met(Rs[0]), ij.verdeling, HS.VARIANTEN.D.st);
  return stijl;
}
function gestileerd(R, stijl) {
  const st = { ...stijl, details: new Set(R.nagels) };
  return S.stileer(S.gbuffer(R, FIJN / 2, st), st, HS.VARIANTEN.D.st);
}

// ---------------------------------------------------------------- de proefplaat

// Het ChatGPT-beeld (de wagen naar zuidwest) op onze maat: het wiel is daar 420 pixels hoog, bij ons op 2× zo'n 100.
const BRON = path.join(__dirname, 'uit', 'ai', 'hand', 'wagen-zw.png.png');
function doelWagen(hoogteWiel) {
  if (!fs.existsSync(BRON)) return null;
  const A = require('../ai/beeld-ai.cjs');
  const r = A.leesPng(fs.readFileSync(BRON));
  const f = H.REF_HOOGTE / hoogteWiel;
  const b = Math.floor(r.b / f), h = Math.floor(r.h / f);
  const uit = { b, h, rgba: Buffer.alloc(b * h * 4) };
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
    const s = (Math.floor((y + 0.5) * f) * r.b + Math.floor((x + 0.5) * f)) * 4;
    const [R, G, B] = [r.rgba[s], r.rgba[s + 1], r.rgba[s + 2]];
    const magenta = R > 90 && B > 90 && G < 0.6 * Math.min(R, B);
    if (!magenta) uit.rgba.set([R, G, B, 255], (y * b + x) * 4);
  }
  return uit;
}
function proef() {
  fs.mkdirSync(UIT, { recursive: true });
  const o = { lading: 'buit', bak: 'heer', wind: [0, -1], blink: 0 };
  const Rs = [render(o, 'ZW'), render({ ...o, houding: 'lopen', fase: 0.5 }, 'ZW')];
  const stijl = stijlVoor(Rs);
  fs.writeFileSync(path.join(UIT, 'stijl.json'), JSON.stringify(stijl));
  const hd = gestileerd(Rs[0], stijl);
  H.bewaar(path.join(UIT, 'ZW-0.png'), hd);
  // de kar van nu (1×, in het spel maal 2) en het doel op dezelfde maat
  const nu = O.beeld(o, 'ZW');
  const nuR = { b: nu.b, h: nu.h, rgba: nu.rgba(null) };
  const ij = HS.leesIjk();
  const doel = doelWagen(ij.hoogte);
  const opGrond = (r) => H.alfaSnijMetGrond(r);
  const groot = (r, n) => H.snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, n);
  const knip = (r) => H.alfaSnij(r, H.uitsnede([r], 4));
  const rij1 = [E.met(opGrond(knip(nuR)), 'de kar van nu (1×)'), E.met(opGrond(knip(hd)), 'de kar in HD (2×)')];
  if (doel) rij1.unshift(E.met(opGrond(knip(doel)), 'de ChatGPT-wagen, op onze maat'));
  const rij2 = [E.met(groot(opGrond(knip(nuR)), 2), 'de kar van nu, in het spel (maal 2)'), E.met(opGrond(knip(hd)), 'de kar in HD, in het spel (één op één)')];
  if (doel) rij2.unshift(E.met(opGrond(knip(doel)), 'ChatGPT, op dezelfde maat'));
  const rij3 = [E.met(groot(opGrond(knip(hd)), 3), 'de kar in HD, maal 3')];
  if (doel) rij3.unshift(E.met(groot(opGrond(knip(doel)), 3), 'ChatGPT, maal 3'));
  E.bewaar(path.join(UIT, 'proef.png'), [rij2, rij3], 'De ossenkar in HD: het nieuwe wiel en het handschrift',
    `Zuidwest, stand 0, de wagen van de heer met de buit. Rij 1 zoals een scherm van 1920×1080 het toont; rij 2 maal 3. Nog zonder SDXL. ${Rs[0].delen} onderdelen, ${(Rs[0].ms / 1000).toFixed(1)} s per beeld op 4×.`);
  const ont = { doel: doel ? HS.ontleedWiel(knip(doel)) : null, hd: HS.ontleedWiel(knip(hd)) };
  console.log(`render ${(Rs[0].ms / 1000).toFixed(1)} s, ${Rs[0].delen} onderdelen; ramps zonder textuur: ${Object.keys(stijl.materialen).filter((k) => k.startsWith('~')).join(', ')}`);
  for (const [k, x] of Object.entries(ont)) if (x) console.log(k, 'lijn', Math.round(x.aandeel.lijn * 100) + '%', 'contrast', x.stijl.contrast, 'kleuren', x.stijl.kleuren, 'warmte', x.stijl.warmte);
  console.log('uit/karhd/proef.png');
}

const [wat] = require.main === module ? process.argv.slice(2) : ['geladen'];
if (wat === 'proef') proef();
else if (wat !== 'geladen') console.log('node gereedschap/pixelart/karhd.cjs proef');

module.exports = { materialen, karModel, render, stijlVoor, gestileerd, doelWagen, MESSING, UIT };
