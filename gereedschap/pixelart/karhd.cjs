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
//   node gereedschap/pixelart/karhd.cjs gpt        de pixels van de ChatGPT-wagen op de kar (geprojecteerd, zoals het wiel in
//                                                  gereedschap/ai/oppervlak.cjs --wiel gpt): de plaat uit/karhd/gpt.png
//   node gereedschap/pixelart/karhd.cjs meester    SDXL schildert de kar op onze render, per checkpoint (CHECKPOINTS, met
//                                                  komma's), met de ChatGPT-wagen als stijlplaat, geprojecteerd:
//                                                  uit/karhd/meester/proef.png
//   node gereedschap/pixelart/karhd.cjs eigen      de eigen pijplijn: zonder stijlplaat, de huisstijl en een zin per materiaal
//                                                  per gebied (gereedschap/ai/huisstijl.cjs): uit/karhd/meester/eigen.png
//   node gereedschap/pixelart/karhd.cjs hand       ons handschrift over de eigen pijplijn (het rijke begin, denoise 0,65,
//                                                  zonder SDXL opnieuw): uit/karhd/meester/handschrift.png
//   node gereedschap/pixelart/karhd.cjs rijker     rijker schilderwerk: schilderwoorden, een tweede beurt in tegels,
//                                                  plaatselijk contrast: uit/karhd/meester/rijker.png
//   node gereedschap/pixelart/karhd.cjs zinnen     W5 met de zinnen van eerder en met de betere zinnen per materiaal:
//                                                  uit/karhd/meester/zinnen.png
//   node gereedschap/pixelart/karhd.cjs spec       de stijlspecificatie (ontwerp/stijlspecificatie.md): de zinnen eruit, H4,
//                                                  op 4× en 2× naast ChatGPT: uit/karhd/meester/spec.png
//   node gereedschap/pixelart/karhd.cjs checkpoint FaeTastic en Cor Epica naast elkaar, met dezelfde instellingen als spec:
//                                                  uit/karhd/meester/checkpoints.png
//   node gereedschap/pixelart/karhd.cjs ernie      ERNIE-Image-Turbo, met en zonder de pixelart-LoRA voor ERNIE (VARIANT):
//                                                  uit/karhd/meester/ernie.png
//   node gereedschap/pixelart/karhd.cjs concept    de ossenkar eerst van de AI, zoals de speerman (gereedschap/ai/vrij.cjs):
//                                                  vrij, onze diepte zacht, de kar uit Marcels plaat als stijl:
//                                                  uit/karhd/vrij/ossenkar-1.png
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
const { model, blok } = require('./figuren.cjs');
const OD = require('./onderdelen.cjs');
const V = require('./vee.cjs');
const E = require('../ai/etiket.cjs');

const UIT = path.join(__dirname, 'uit', 'karhd');
const FIJN = 4;
const MESSING = 19; // een eigen plek voor het koper van de wielen (M.goud is in de kar het goud van de buit)
const EMBLEEM = 20; // de leeuw van de heer op de wanden (wapen.cjs), een eigen materiaal en dus een eigen gebied
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
  m[EMBLEEM] = { ...koper, lo: m[O.M.goud].lo, hi: m[O.M.goud].hi };
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
// De vorm naar de ChatGPT-wagen (Marcel, 19 okt: "Ja proefplaat"; op het voorste wiel uitgelijnd waren de bak en de wanden
// al zo groot, uit/karhd/randen.png): de rongen dikker en van donker hout met drie ijzeren banden, een gele onderrand langs
// de zijwanden, en de disselbomen van de bak tot het juk een dikke vierkante balk. En de os forser (vee.cjs o.bouw).
const VORM = { rong: 3.6, band: 4.1, onderrand: true, dissel: [4.4, 4.0], leeuwen: true };
const OS_BOUW = { breed: 1.2, diep: 1.25, poot: 1.35, hals: 1.25, kop: 1.15 };
function vormNaarDoel(delen) {
  const { b, l, vloer, rand } = O.BAK;
  const uit = [];
  for (const d of delen) {
    const g = d.g || [0, 0, 0, 0];
    // de rongen: in de wagen van de heer rood geverfd (deel 4, verf)
    if (d.deel === 4 && d.m === O.M.verf) {
      // van net onder de vloer tot boven de bovenrand, zoals de rong in ossenkar.cjs bak
      const z0 = vloer - 1.2;
      const z1 = rand + 3.6;
      uit.push(OD.balk([g[0], g[1], z0], [g[0], g[1], z1], { b0: VORM.rong, d0: VORM.rong, breedteRichting: [1, 0, 0], afschuin: 0.3, m: O.M.hout, deel: 4 }));
      for (const z of [z0 + 1.6, (z0 + z1) / 2, z1 - 1.6]) uit.push(OD.balk([g[0], g[1], z - 0.5], [g[0], g[1], z + 0.5], { b0: VORM.band, d0: VORM.band, breedteRichting: [1, 0, 0], afschuin: 0.15, m: O.M.ijzer, deel: 4 }));
      continue;
    }
    // de disselbomen van de bak tot het juk (deel 5, vóór de bak en opzij)
    if (d.deel === 5 && g[1] > l + 12 && Math.abs(g[0]) > 5) {
      const s = Math.sign(g[0]);
      uit.push(OD.balk([s * O.DISSEL.x, l + 0.5, O.DISSEL.z], [s * O.JUK[0], O.JUK[1] - 0.5, O.JUK[2]], { b0: VORM.dissel[0], d0: VORM.dissel[1], breedteRichting: [0, 0, 1], afschuin: 0.4, m: O.M.hout, deel: 5 }));
      continue;
    }
    uit.push(d);
  }
  if (VORM.onderrand) for (const s of [-1, 1]) uit.push(blok([s * (b + 0.6), 0, vloer + 0.5], [1.3, l + 0.6, 0.7], 0.3, O.M.bies, 4));
  // de leeuw van de heer op het voorste en het achterste vak van elke zijwand (de buitenkant: ossenkar.cjs bak, de wand op
  // b + 0,4, half 0,9 dik), de kop naar voren (zoals bij ChatGPT)
  if (VORM.leeuwen) {
    const WP = require('./wapen.cjs');
    for (const s of [-1, 1]) for (const y of [28, -28]) uit.push(WP.leeuw({ midden: [s * (b + 0.4 + 0.9), y, vloer + (rand - vloer) / 2], normaal: [s, 0, 0], hoog: 11, m: EMBLEEM, deel: 60, naarLinks: [0, 1, 0] }));
  }
  return uit;
}
function karModel(o = {}) {
  const k = O.kar({ ...o, hoek: 0 });
  const delen = [...vormNaarDoel(k.delen.filter((d) => d.deel !== 2 && d.deel !== 3)), ...wielen(o.hoek || 0)];
  return model(delen, materialen(o.blink || 0), { midden: k.midden, straal: k.straal });
}
const osModel = (o = {}) => O.os({ houding: o.houding, fase: o.fase, kleur: o.kleur, bouw: OS_BOUW });

// De kar en de os in één beeld (zoals ossenkar.cjs tekenOssenkar), met de G-buffer. Een onderdeel heet daarna
// obj × 1000 + zijn nummer (de kar is obj 1, de os 2), zodat de kar en de os niet hetzelfde nummer hebben.
function render(o, kant, fijn = FIJN) {
  const B = new K.Beeld(O.CEL[0] * fijn, O.CEL[1] * fijn, O.ANKER[0] * fijn, O.ANKER[1] * fijn);
  const a = (K.RICHTING[kant] * Math.PI) / 180;
  const naar = (ly) => ({ gx: (ly * Math.cos(a)) / K.TEGEL, gy: (ly * Math.sin(a)) / K.TEGEL });
  const hoek = o.houding === 'lopen' ? O.WIEL.draai * (o.fase || 0) : 0;
  const km = karModel({ ...o, hoek });
  const om = osModel(o);
  // o.mat, o.osMat: andere materialen (de pixels van ChatGPT, hieronder)
  if (o.mat) km.mat = o.mat;
  if (o.osMat) om.mat = o.osMat;
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


// ---------------------------------------------------------------- de pixels van ChatGPT op de kar

// Marcel, 19 okt: "Naar de kar" (de vorm naar de ChatGPT-wagen, dan zijn pixels erop, met de projectie van het wiel). Op het
// voorste wiel uitgelijnd blijken de bak, de wanden en de hoekpalen al ongeveer zo groot als bij ChatGPT; daarom eerst de
// pixels op de kar zoals hij is, om te zien waar de vorm nog niet past.
//   1. de render naar zuidwest op 8× (ons wiel dan ongeveer zo groot als dat van ChatGPT, 420 pixels);
//   2. het ChatGPT-beeld erop, uitgelijnd op het voorste wiel (hdstijl.cjs ellipsVan: het midden, en de grootte uit de
//      covariantie), met de naaste pixel; het magenta eromheen doorzichtig;
//   3. per ding (de kar, de os: elk in zijn eigen rust) een projectie (bakken.cjs projectie, o.welke), en elk materiaal leest
//      die (projectieMateriaal, ook de materialen zonder textuur). Wat ChatGPT niet liet zien: de kar en de os zijn links en
//      rechts gelijk (spiegelen), een wiel ook rondom (om de 45°).
const FGPT = 8;
// het licht zachter op wat geprojecteerd wordt (bakken.cjs projectieMateriaal o.zacht, kern.cjs mat.zacht): ChatGPT
// schildert zijn eigen licht al, en schildert de poten onder de os licht, waar ons licht een derde is
const ZACHT = 0.4;
const O_KAR = { lading: 'buit', bak: 'heer', wind: [0, -1], blink: 0 };
function legWagen(R) {
  const A = require('../ai/beeld-ai.cjs');
  const g = A.leesPng(fs.readFileSync(BRON));
  const km = karModel({ ...O_KAR, hoek: 0 });
  const om = osModel({});
  const ding = (i) => (R.ramp[i] < 0 || Number.isNaN(R.rust[i * 4]) ? null : Math.floor(R.rust[i * 4 + 3] / 1000));
  const onderdeel = (v) => {
    const obj = Math.floor(v / 1000);
    return (obj === 1 ? km : om).delen[Math.round(v - obj * 1000)];
  };
  // ons voorste wiel: de onderdelen van het wiel, aan de kant met de meeste pixels
  const tel = { '-1': 0, 1: 0 };
  const wielVan = (i) => ding(i) === 1 && onderdeel(R.rust[i * 4 + 3]).deel >= 30 + WIELDEEL && onderdeel(R.rust[i * 4 + 3]).deel < 40 + WIELDEEL;
  for (let i = 0; i < R.b * R.h; i++) if (wielVan(i)) tel[R.rust[i * 4] < 0 ? -1 : 1]++;
  const voor = tel['-1'] > tel[1] ? -1 : 1;
  const masker = { b: R.b, h: R.h, rgba: Buffer.alloc(R.b * R.h * 4) };
  for (let i = 0; i < R.b * R.h; i++) if (wielVan(i) && Math.sign(R.rust[i * 4]) === voor) masker.rgba[i * 4 + 3] = 255;
  const eo = HS.ellipsVan(masker);
  const eg = HS.ellipsVan(HS.doelWiel());
  const det = (e) => e.xx * e.yy - e.xy * e.xy;
  const schaal = (det(eo) / det(eg)) ** 0.25;
  // het midden van het ChatGPT-wiel in het hele beeld (de uitsnede van hdproef.cjs refWiel begint op 955, 385)
  const gx = eg.cx + 955;
  const gy = eg.cy + 385;
  const magenta = (j) => g.rgba[j] > 90 && g.rgba[j + 2] > 90 && g.rgba[j + 1] < 0.6 * Math.min(g.rgba[j], g.rgba[j + 2]);
  // een pixel van ons naar ChatGPT; e: een extra schaal en verschuiving om (cx, cy) (de os, hieronder)
  const naar = (x, y, e = null) => {
    const [px, py] = e ? [e.cx + (x - e.cx) * e.sx + e.dx, e.cy + (y - e.cy) * e.sy + e.dy] : [x, y];
    return [Math.round(gx + (px - eo.cx) / schaal), Math.round(gy + (py - eo.cy) / schaal)];
  };
  const dekt = ([X, Y]) => X >= 0 && Y >= 0 && X < g.b && Y < g.h && !magenta((Y * g.b + X) * 4);
  const vul = (e, welke) => {
    const beeld = { b: R.b, h: R.h, rgba: Buffer.alloc(R.b * R.h * 4) };
    for (let y = 0; y < R.h; y++) for (let x = 0; x < R.b; x++) {
      if (!welke(y * R.b + x)) continue;
      const P = naar(x, y, e);
      if (!dekt(P)) continue;
      const j = (P[1] * g.b + P[0]) * 4;
      beeld.rgba.set([g.rgba[j], g.rgba[j + 1], g.rgba[j + 2], 255], (y * R.b + x) * 4);
    }
    return beeld;
  };
  // De os apart: ChatGPT tekent zijn os niet in hetzelfde perspectief als de kar (op het wiel uitgelijnd valt de rug samen,
  // maar staan zijn hoeven zo'n 5 eenheden hoger, en ons onderbeen viel op zijn hoef en de achtergrond). Een eigen schaal
  // (sx, sy) en verschuiving om het midden van onze os, waarbij wat dekt het best samenvalt (gemeten waar onze kar niet
  // voor de os staat).
  let n = 0, sx = 0, sy = 0, x0 = R.b, x1 = 0, y0 = R.h, y1 = 0;
  for (let i = 0; i < R.b * R.h; i++) if (ding(i) === 2) {
    const x = i % R.b;
    const y = (i - x) / R.b;
    n++; sx += x; sy += y;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  const rand = Math.round(0.08 * (x1 - x0));
  const proef = [];
  for (let y = Math.max(0, y0 - rand); y <= Math.min(R.h - 1, y1 + rand); y += 2) for (let x = Math.max(0, x0 - rand); x <= Math.min(R.b - 1, x1 + rand); x += 2) {
    const i = y * R.b + x;
    if (ding(i) === 1) continue;
    proef.push([x, y, ding(i) === 2]);
  }
  const score = (e) => {
    let beide = 0, een = 0;
    for (const [x, y, o] of proef) {
      const d = dekt(naar(x, y, e));
      if (o || d) { een++; if (o && d) beide++; }
    }
    return beide / een;
  };
  let os = { e: { cx: sx / n, cy: sy / n, sx: 1, sy: 1, dx: 0, dy: 0 } };
  os.sc = score(os.e);
  const begin = os.sc;
  const stappen = { sy: [0.04, 0.01], sx: [0.04, 0.01], dy: [8, 2], dx: [8, 2] };
  for (let ronde = 0; ronde < 3; ronde++) for (const [k, ds] of Object.entries(stappen)) for (const dd of ds) for (const r of [-1, 1]) {
    for (;;) {
      const e = { ...os.e, [k]: os.e[k] + r * dd };
      const sc = score(e);
      if (sc <= os.sc) break;
      os = { e, sc };
    }
  }
  const beeld = vul(null, (i) => ding(i) !== 2);
  const beeldOs = vul(os.e, (i) => ding(i) === 2);
  const osLigging = { ...Object.fromEntries(['sx', 'sy', 'dx', 'dy'].map((k) => [k, +os.e[k].toFixed(3)])), samen: [+begin.toFixed(3), +os.sc.toFixed(3)] };
  return { beeld, beeldOs, gpt: vul(null, () => true), km, om, ding, onderdeel, schaal, voor, osLigging };
}
// de kopieën: spiegelen (x → -x, de kar en de os zijn links en rechts gelijk), en een wiel rondom om de 45°
const spiegelX = (p) => [-p[0], p[1], p[2]];
const wielDraai = (k) => (p, deel) => {
  if (!(deel.deel >= 30 + WIELDEEL && deel.deel < 40 + WIELDEEL)) return null;
  const a = (k * Math.PI) / 4;
  const dy = p[1];
  const dz = p[2] - O.WIEL.r;
  return [p[0], Math.cos(a) * dy - Math.sin(a) * dz, O.WIEL.r + Math.sin(a) * dy + Math.cos(a) * dz];
};
// de soort van een onderdeel voor de projectie: zijn materiaal en zijn soort (deel)
const soortVan = (d) => `${d.m}|${d.deel}`;
const KOPIEEN_KAR = [spiegelX, ...[1, 2, 3, 4, 5, 6, 7].flatMap((k) => [wielDraai(k), (p, d) => { const q = wielDraai(k)(p, d); return q && spiegelX(q); }])];
// De render waaruit geprojecteerd wordt: dezelfde materialen zonder beeld (alles met een textuur: anders is het licht van een
// materiaal zonder textuur de stap in zijn ramp, en werden de os en de zakken zwart), en per pixel het ding en het onderdeel.
// rijk: de stoffen in code erop (stoffen.cjs: vacht, jute, schors), voor een rijker begin van SDXL, en ook als eigen kleur
// waar SDXL niet bij kwam.
function bakRender(kant, fijn, rijk = false) {
  const BK = require('./bakken.cjs');
  const km = karModel({ ...O_KAR, hoek: 0 });
  const om = osModel({});
  if (rijk) {
    const ST = require('./stoffen.cjs');
    km.mat = ST.verrijk(km.mat, NAAM_KAR, rampKleur);
    om.mat = ST.verrijk(om.mat, NAAM_OS, rampKleur);
  }
  const R = render({ ...O_KAR, mat: km.mat.map((m) => m && BK.projectieMateriaal(m, null, { zacht: ZACHT })), osMat: om.mat.map((m) => m && BK.projectieMateriaal(m, null, { zacht: ZACHT })) }, kant, fijn);
  const ding = (i) => (R.ramp[i] < 0 || Number.isNaN(R.rust[i * 4]) ? null : Math.floor(R.rust[i * 4 + 3] / 1000));
  const onderdeel = (v) => {
    const obj = Math.floor(v / 1000);
    return (obj === 1 ? km : om).delen[Math.round(v - obj * 1000)];
  };
  return { R, km, om, ding, onderdeel };
}
// Een beeld dat op de render ligt (een pixel van het beeld is een pixel van R), op de kar en de os geprojecteerd: de
// materialen die het lezen. beeldOs: een eigen beeld voor de os (ChatGPT, apart gelegd), anders hetzelfde.
function projecteer(BR, beeld, beeldOs = beeld) {
  const BK = require('./bakken.cjs');
  const SM = require('./stijlmaat.cjs');
  const paars = (k) => k[2] > k[1] + 8 && k[0] > k[1] + 8;
  const opties = (obj) => ({
    welke: (i) => BR.ding(i) === obj,
    sleutel: (v) => soortVan(BR.onderdeel(v)),
    binnen: (X, Y) => (obj === 2 ? beeldOs : beeld).rgba[(Y * beeld.b + X) * 4 + 3] >= 128,
    // op de os ook geen rood van de bak (waar zijn romp voor de bak van ChatGPT ligt)
    soort: (k) => SM.soortVan(k[0], k[1], k[2]) !== 'anders' && !paars(k) && !(obj === 2 && k[0] > 60 && k[0] > 1.8 * k[1] && k[0] > 1.8 * k[2]),
  });
  const prKar = BK.projectie(BR.R, beeld, opties(1));
  const prOs = BK.projectie(BR.R, beeldOs, opties(2));
  const mat = BR.km.mat.map((m) => (m ? BK.projectieMateriaal(m, prKar, { kopieen: KOPIEEN_KAR, sleutelVan: soortVan, zacht: ZACHT }) : m));
  const osMat = BR.om.mat.map((m) => (m ? BK.projectieMateriaal(m, prOs, { kopieen: [spiegelX], sleutelVan: soortVan, zacht: ZACHT }) : m));
  return { mat, osMat };
}
function projectieWagen() {
  const t0 = Date.now();
  const BR = bakRender('ZW', FGPT);
  const L = legWagen(BR.R);
  const { mat, osMat } = projecteer(BR, L.beeld, L.beeldOs);
  console.log(`gelegd (schaal ${L.schaal.toFixed(3)}, voorste wiel ${L.voor}; de os apart: ${JSON.stringify(L.osLigging)}) in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  return { mat, osMat, beeld: L.gpt };
}

// ---------------------------------------------------------------- een meesterbeeld met SDXL (de eigen pijplijn)

// Marcel, 19 okt: "We moeten zelf een betrouwbare pipeline hebben om te bouwen. Ik wil niet steeds gpt moeten gebruiken"
// (gereedschap/ai/ai-afwerking.md, "Een eigen pijplijn"). SDXL schildert lokaal (ComfyUI, afwerking.cjs werkstroom: img2img
// binnen ons silhouet, ControlNet lijnen en diepte, IP-Adapter met de stijlplaat) op onze eigen render, één op één: een
// pixel van het doek is een pixel van de render. Het beeld ligt dus vanzelf op het model, zonder uitlijnen, en gaat met
// dezelfde projectie op de kar en de os. De stijlplaat is de ChatGPT-wagen die er al is (geen nieuwe ChatGPT).
const FMEESTER = 6; // de kar op het doek zo'n 1100 bij 850 pixels
const MEESTER = { denoise: 0.65 };
const PROMPT_KAR = 'HD pixel art game sprite of a medieval lord\'s ox cart, strategy game asset, red painted wooden wagon with golden lion ' +
  'emblems on the side panels, heavy dark wooden corner posts with iron bands and rivets, yellow trim, two big spoked wooden wheels ' +
  'with iron tyres, loaded with burlap sacks, an open treasure chest full of gold coins, a wooden barrel, a red sack, a log, a small ' +
  'red and yellow banner on a pole, pulled by a cream colored ox with horns in a leather and brass harness collar, rich hand-painted ' +
  'detail, warm light from the top left, crisp dark outlines';
const NEG_KAR = 'blurry, smooth gradients, photo, 3d render, plastic, deformed, extra wheels, extra legs, text, watermark, signature, ' +
  'ground, grass, shadow on the ground, background objects, frame, border';
const MEESTER_UIT = path.join(UIT, 'meester');
// De kleur van een materiaal: een lichte toon van zijn ramp (voor het woord van een vacht, en de stoffen).
function rampKleur(mat) {
  const r = mat && K.RAMP_RGB[K.RAMP[mat.ramp]];
  return r ? r[Math.floor(r.length * 0.6)] : [128, 128, 128];
}
// De naam van elk materiaal (voor de zin per materiaal, huisstijl.cjs): de kar uit ossenkar.cjs M, de os uit vee.cjs.
const NAAM_KAR = Object.assign(Object.fromEntries(Object.entries(O.M).map(([n, i]) => [i, n])), { [MESSING]: 'messing', [EMBLEEM]: 'embleem' });
const NAAM_OS = Object.fromEntries(Object.entries(V.koeMaterialen(V.OS_KLEUREN[0], true).M).map(([n, i]) => [i, n]));
// De gebieden: per zin (huisstijl.cjs zinVoor) de pixels van het doek met een materiaal dat die zin heeft. Een vacht krijgt
// het woord voor de kleur van zijn materiaal.
// groepen: de groepen en het wapen (huisstijl.cjs groepVoor), anders een gebied per materiaal. Een groep krijgt de kleur
// van zijn hoofdmateriaal (de meeste pixels), en voor een dier zijn soort (de os, uit het model) en de materialen erin.
const SOORT_OS = 'ox';
function gebiedenVan(BR, ox, oy, b, h, groepen = true) {
  const HU = require('../ai/huisstijl.cjs');
  const per = new Map(); // sleutel → { pixels, tel: Map(materiaal → aantal), namen, obj }
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
    const i = (y + oy) * BR.R.b + x + ox;
    if (x + ox >= BR.R.b || y + oy >= BR.R.h) continue;
    const obj = BR.ding(i);
    if (!obj) continue;
    const d = BR.onderdeel(BR.R.rust[i * 4 + 3]);
    // een onderdeel kan zijn materiaal per plek kiezen (de stam: schors, en nerf aan de kopse kanten; ossenkar.cjs stam):
    // dan op de plek in rust. (Tot 19 okt viel de stam zo buiten elk gebied, en schilderde SDXL hem blauw.)
    const mi = typeof d.m === 'function' ? d.m(BR.R.rust[i * 4], BR.R.rust[i * 4 + 1], BR.R.rust[i * 4 + 2]) : d.m;
    const naam = (obj === 1 ? NAAM_KAR : NAAM_OS)[mi];
    const sleutel = groepen ? HU.groepVoor(naam) : naam;
    if (!sleutel) continue;
    const g = per.get(sleutel) || per.set(sleutel, { pixels: [], tel: new Map(), namen: new Set(), obj }).get(sleutel);
    g.pixels.push(y * b + x);
    g.namen.add(naam);
    const mat = (obj === 1 ? BR.km : BR.om).mat[mi];
    g.tel.set(mat, (g.tel.get(mat) || 0) + 1);
  }
  const min = b * h * 0.002; // te kleine gebieden (een nagel, een oog) niet: die doet de rest
  const uit = [];
  for (const [sleutel, g] of per) {
    if (g.pixels.length < min) continue;
    const hoofd = [...g.tel].sort((p, q) => q[1] - p[1])[0][0];
    const info = { soort: g.obj === 2 ? SOORT_OS : null, namen: g.namen };
    const tekst = groepen ? HU.GROEPZIN[sleutel](rampKleur(hoofd), info) : HU.zinVoor(sleutel, rampKleur(hoofd));
    if (tekst) uit.push({ tekst, pixels: g.pixels });
  }
  return uit;
}
// extra: { lora, tag, rijk, denoise, schilder, checkpoint } (de pixelart-LoRA, een achtervoegsel voor de map, de stoffen in
// het begin, een andere denoise, de schilderwoorden, een ander checkpoint dan de huisstijl)
async function meester(kant, checkpoint, eigen = false, extra = {}) {
  const AF = require('../ai/afwerking.cjs');
  const A = require('../ai/beeld-ai.cjs');
  const DK = require('../ai/doek.cjs');
  const HU = require('../ai/huisstijl.cjs');
  const BR = bakRender(kant, FMEESTER, !!extra.rijk);
  const R = BR.R;
  // de uitsnede: wat dekt, met een rand, op veelvouden van 64 (SDXL)
  let x0 = R.b, x1 = 0, y0 = R.h, y1 = 0;
  for (let i = 0; i < R.b * R.h; i++) if (R.ramp[i] >= 0) {
    const x = i % R.b;
    const y = (i - x) / R.b;
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  const b = Math.ceil((x1 - x0 + 1 + 32) / 64) * 64;
  const h = Math.ceil((y1 - y0 + 1 + 32) / 64) * 64;
  const ox = Math.max(0, Math.floor((x0 + x1 - b) / 2));
  const oy = Math.max(0, Math.floor((y0 + y1 - h) / 2));
  const knip = (r, leeg) => {
    const uit = { b, h, rgba: Buffer.alloc(b * h * 4) };
    for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
      const X = x + ox, Y = y + oy;
      const i = (y * b + x) * 4;
      if (X >= R.b || Y >= R.h) { uit.rgba.set([...leeg, 255], i); continue; }
      r.rgba.copy(uit.rgba, i, (Y * R.b + X) * 4, (Y * R.b + X) * 4 + 4);
      uit.rgba[i + 3] = 255;
    }
    return uit;
  };
  const dekt = (X, Y) => X >= 0 && Y >= 0 && X < R.b && Y < R.h && R.ramp[Y * R.b + X] >= 0;
  const init = knip(R.zl, [255, 0, 255]);
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) if (!dekt(x + ox, y + oy)) init.rgba.set([255, 0, 255, 255], (y * b + x) * 4);
  // het masker: het silhouet, vier pixels ruimer
  const masker = { b, h, rgba: Buffer.alloc(b * h * 4) };
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
    let in4 = false;
    for (let dy = -4; dy <= 4 && !in4; dy++) for (let dx = -4; dx <= 4 && !in4; dx++) in4 = dekt(x + ox + dx, y + oy + dy);
    masker.rgba.set(in4 ? [255, 255, 255, 255] : [0, 0, 0, 255], (y * b + x) * 4);
  }
  const lijnen = knip(S.lijnenVan(R), [0, 0, 0]);
  const diepte = knip(S.diepteVan(R), [0, 0, 0]);
  if (eigen) checkpoint = extra.ernie ? 'ernie-image-turbo' : extra.checkpoint || HU.HUISSTIJL.checkpoint;
  const tag = (checkpoint || 'sdxl-base').replace(/\.safetensors$/, '').replace(/[^A-Za-z0-9-]+/g, '-') + (eigen ? '-eigen' : '') + (extra.tag ? `-${extra.tag}` : '');
  const map = path.join(MEESTER_UIT, tag);
  fs.mkdirSync(map, { recursive: true });
  // eigen: de huisstijl, geen stijlplaat, en per gebied de zin van zijn materiaal; anders de ChatGPT-wagen als stijlplaat
  const namen = eigen
    ? {
      positief: [extra.lora && extra.lora.woorden, HU.HUISSTIJL.zin, extra.schilder && HU.SCHILDER.zin].filter(Boolean).join(', '),
      negatief: [HU.HUISSTIJL.negatief, extra.schilder && HU.SCHILDER.negatief].filter(Boolean).join(', '),
    }
    : { positief: PROMPT_KAR, negatief: NEG_KAR, stijl: await A.upload('aardschok-meester-stijl.png', fs.readFileSync(BRON), 'image/png') };
  for (const [k, r] of Object.entries({ init, masker, lijnen, diepte })) {
    const data = K.pngVanBeeld(r);
    fs.writeFileSync(path.join(map, `${kant}-${k}.png`), data);
    namen[k] = await A.upload(`aardschok-meester-${kant}-${k}.png`, data, 'image/png');
  }
  let gebieden = [];
  if (eigen) {
    gebieden = gebiedenVan(BR, ox, oy, b, h);
    namen.gebieden = [];
    const kaart = { b, h, rgba: Buffer.alloc(b * h * 4) };
    for (const [k, g] of gebieden.entries()) {
      const mk = { b, h, rgba: Buffer.alloc(b * h * 4) };
      for (let i = 0; i < b * h; i++) mk.rgba.set([0, 0, 0, 255], i * 4);
      const kl = [(k * 97) % 255, (k * 57 + 80) % 255, (k * 151 + 40) % 255];
      for (const p of g.pixels) {
        mk.rgba.set([255, 255, 255, 255], p * 4);
        kaart.rgba.set([...kl, 255], p * 4);
      }
      const data = K.pngVanBeeld(mk);
      namen.gebieden.push({ masker: await A.upload(`aardschok-meester-${kant}-gebied-${k}.png`, data, 'image/png'), tekst: g.tekst });
    }
    H.bewaar(path.join(map, `${kant}-gebieden.png`), kaart);
  }
  const o = eigen ? { ...AF.START, ...HU.HUISSTIJL.instellingen, checkpoint, lora: extra.lora, ...(extra.denoise ? { denoise: extra.denoise } : {}), ...(extra.schilder ? { cfg: HU.SCHILDER.cfg } : {}) } : { ...AF.START, ...MEESTER, checkpoint };
  // extra.ernie: ERNIE-Image-Turbo in plaats van SDXL (afwerking.cjs werkstroomErnie: zonder ControlNet, cfg 1)
  const stroom = extra.ernie ? AF.werkstroomErnie(namen, { lora: extra.lora, ...(extra.denoise ? { denoise: extra.denoise } : {}) }) : AF.werkstroom(namen, o);
  const t0 = Date.now();
  const png = await DK.maak(b, h).voerUit(stroom);
  const tijd = (Date.now() - t0) / 1000;
  fs.writeFileSync(path.join(map, `${kant}-ai.png`), png);
  fs.writeFileSync(path.join(map, `${kant}-instellingen.json`), JSON.stringify({ kant, checkpoint: checkpoint || AF.MODELLEN.checkpoint, fijn: FMEESTER, doek: [b, h], plek: [ox, oy], instellingen: o, positief: namen.positief, negatief: namen.negatief, stijlplaat: eigen ? 'geen' : 'gereedschap/pixelart/uit/ai/hand/wagen-zw.png.png', gebieden: gebieden.map((g) => ({ tekst: g.tekst, pixels: g.pixels.length })), seconden: +tijd.toFixed(1), wanneer: new Date().toISOString() }, null, 1));
  const ai = A.leesPng(png);
  console.log(`${tag} ${kant}: ${tijd.toFixed(0)} s, doek ${b}×${h}`);
  return { BR, beeld: opRender(R, ai, ox, oy), ai, tag, tijd, ox, oy, b, h, gebieden, namen, o };
}

// Een meesterbeeld van de eigen pijplijn: van eerder als het er al is (zonder SDXL opnieuw; OPNIEUW=1 om toch te
// schilderen), anders nieuw.
async function meesterOfTerug(kant, extra) {
  const HU = require('../ai/huisstijl.cjs');
  const A = require('../ai/beeld-ai.cjs');
  const tag = `${(extra.checkpoint || HU.HUISSTIJL.checkpoint).replace(/\.safetensors$/, '').replace(/[^A-Za-z0-9-]+/g, '-')}-eigen-${extra.tag}`;
  const map = path.join(MEESTER_UIT, tag);
  if (process.env.OPNIEUW || !fs.existsSync(path.join(map, `${kant}-ai.png`))) return meester(kant, null, true, extra);
  const inst = JSON.parse(fs.readFileSync(path.join(map, `${kant}-instellingen.json`)));
  const BR = bakRender(kant, inst.fijn, !!extra.rijk);
  const ai = A.leesPng(fs.readFileSync(path.join(map, `${kant}-ai.png`)));
  const [ox, oy] = inst.plek;
  const [b, h] = inst.doek;
  console.log(`${tag} ${kant}: van eerder`);
  return { BR, beeld: opRender(BR.R, ai, ox, oy), ai, tag, tijd: inst.seconden, ox, oy, b, h, gebieden: gebiedenVan(BR, ox, oy, b, h), namen: { positief: inst.positief, negatief: inst.negatief }, o: inst.instellingen };
}

// Een tweede schilderbeurt (Marcel, 19 okt: rijker schilderwerk): het meesterbeeld twee keer zo groot (bilineair), en
// SDXL schildert het zacht over (denoise 0,4) in tegels van 1024 die elkaar overlappen (zo past het op de 1080 Ti), met
// dezelfde gebieden, lijnen en diepte (die twee keer zo groot, de naaste). De tegels gaan zacht in elkaar over, en het
// geheel gaat terug naar de maat van de render (box 2×2): de streken blijven als rijkere textuur.
async function tweedeBeurt(m, kant) {
  const AF = require('../ai/afwerking.cjs');
  const A = require('../ai/beeld-ai.cjs');
  const DK = require('../ai/doek.cjs');
  const { b, h } = m;
  const B2 = b * 2, H2 = h * 2;
  const T = 1024, OVER = 256;
  const map = path.join(MEESTER_UIT, `${m.tag}-tweede`);
  fs.mkdirSync(map, { recursive: true });
  const lees = (n) => K.leesPng(fs.readFileSync(path.join(MEESTER_UIT, m.tag, `${kant}-${n}.png`)));
  const twee = (r, glad) => {
    const uit = { b: r.b * 2, h: r.h * 2, rgba: Buffer.alloc(r.b * r.h * 16) };
    for (let y = 0; y < uit.h; y++) for (let x = 0; x < uit.b; x++) {
      const i = (y * uit.b + x) * 4;
      if (!glad) { r.rgba.copy(uit.rgba, i, ((y >> 1) * r.b + (x >> 1)) * 4, ((y >> 1) * r.b + (x >> 1)) * 4 + 4); continue; }
      const fx = Math.max(0, Math.min(r.b - 1.001, (x + 0.5) / 2 - 0.5)), fy = Math.max(0, Math.min(r.h - 1.001, (y + 0.5) / 2 - 0.5));
      const x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
      for (let c = 0; c < 4; c++) {
        const p = (xx, yy) => r.rgba[(yy * r.b + xx) * 4 + c];
        uit.rgba[i + c] = Math.round(p(x0, y0) * (1 - tx) * (1 - ty) + p(x0 + 1, y0) * tx * (1 - ty) + p(x0, y0 + 1) * (1 - tx) * ty + p(x0 + 1, y0 + 1) * tx * ty);
      }
    }
    return uit;
  };
  const init = twee(m.ai, true);
  const [masker, lijnen, diepte] = ['masker', 'lijnen', 'diepte'].map((n) => twee(lees(n), false));
  // de gebieden twee keer zo groot
  const gebied = m.gebieden.map((g) => {
    const vol = new Uint8Array(B2 * H2);
    for (const p of g.pixels) {
      const x = p % b, y = (p - x) / b;
      vol[(2 * y) * B2 + 2 * x] = vol[(2 * y) * B2 + 2 * x + 1] = vol[(2 * y + 1) * B2 + 2 * x] = vol[(2 * y + 1) * B2 + 2 * x + 1] = 1;
    }
    return { tekst: g.tekst, vol };
  });
  const plekken = (L) => {
    if (L <= T) return [0];
    const n = Math.ceil((L - OVER) / (T - OVER));
    return Array.from({ length: n }, (_, k) => Math.round((k * (L - T)) / (n - 1)));
  };
  const som = new Float32Array(B2 * H2 * 3);
  const gew = new Float32Array(B2 * H2);
  const knip = (r, x0, y0) => {
    const uit = { b: T, h: T, rgba: Buffer.alloc(T * T * 4) };
    for (let y = 0; y < T; y++) r.rgba.copy(uit.rgba, y * T * 4, ((y0 + y) * r.b + x0) * 4, ((y0 + y) * r.b + x0 + T) * 4);
    return uit;
  };
  const o = { ...m.o, denoise: 0.4 };
  let tijd = 0, nT = 0;
  for (const y0 of plekken(H2)) for (const x0 of plekken(B2)) {
    // een tegel zonder iets van de kar of de os: overslaan
    let iets = false;
    for (let y = y0; y < y0 + T && !iets; y += 8) for (let x = x0; x < x0 + T && !iets; x += 8) iets = masker.rgba[(y * B2 + x) * 4] > 0;
    if (!iets) continue;
    const namen = { positief: m.namen.positief, negatief: m.namen.negatief, gebieden: [] };
    for (const [k, r] of Object.entries({ init: knip(init, x0, y0), masker: knip(masker, x0, y0), lijnen: knip(lijnen, x0, y0), diepte: knip(diepte, x0, y0) })) {
      namen[k] = await A.upload(`aardschok-tweede-${k}.png`, K.pngVanBeeld(r), 'image/png');
    }
    for (const [k, g] of gebied.entries()) {
      const mk = { b: T, h: T, rgba: Buffer.alloc(T * T * 4) };
      let n = 0;
      for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
        const aan = g.vol[(y0 + y) * B2 + x0 + x];
        n += aan;
        mk.rgba.set(aan ? [255, 255, 255, 255] : [0, 0, 0, 255], (y * T + x) * 4);
      }
      if (n >= T * T * 0.002) namen.gebieden.push({ masker: await A.upload(`aardschok-tweede-gebied-${k}.png`, K.pngVanBeeld(mk), 'image/png'), tekst: g.tekst });
    }
    const t0 = Date.now();
    const ai = A.leesPng(await DK.maak(T, T).voerUit(AF.werkstroom(namen, o)));
    tijd += (Date.now() - t0) / 1000;
    nT++;
    // zacht in elkaar over: het gewicht loopt op over de overlap, behalve aan de rand van het geheel
    const R0 = OVER / 2;
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
      const wx = (x0 > 0 ? Math.min(1, (x + 0.5) / R0) : 1) * (x0 + T < B2 ? Math.min(1, (T - x - 0.5) / R0) : 1);
      const wy = (y0 > 0 ? Math.min(1, (y + 0.5) / R0) : 1) * (y0 + T < H2 ? Math.min(1, (T - y - 0.5) / R0) : 1);
      const w = wx * wy;
      const j = (y0 + y) * B2 + x0 + x;
      for (let c = 0; c < 3; c++) som[j * 3 + c] += ai.rgba[(y * T + x) * 4 + c] * w;
      gew[j] += w;
    }
  }
  const groot = { b: B2, h: H2, rgba: Buffer.alloc(B2 * H2 * 4) };
  for (let j = 0; j < B2 * H2; j++) {
    const k = gew[j] > 0 ? [0, 1, 2].map((c) => Math.round(som[j * 3 + c] / gew[j])) : [init.rgba[j * 4], init.rgba[j * 4 + 1], init.rgba[j * 4 + 2]];
    groot.rgba.set([...k, 255], j * 4);
  }
  fs.writeFileSync(path.join(map, `${kant}-groot.png`), K.pngVanBeeld(groot));
  // terug naar de maat van de render: box 2×2
  const terug = { b, h, rgba: Buffer.alloc(b * h * 4) };
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
    for (let c = 0; c < 3; c++) {
      let s = 0;
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) s += groot.rgba[((2 * y + dy) * B2 + 2 * x + dx) * 4 + c];
      terug.rgba[(y * b + x) * 4 + c] = Math.round(s / 4);
    }
    terug.rgba[(y * b + x) * 4 + 3] = 255;
  }
  fs.writeFileSync(path.join(map, `${kant}-ai.png`), K.pngVanBeeld(terug));
  console.log(`tweede beurt ${kant}: ${nT} tegels, ${tijd.toFixed(0)} s`);
  return { BR: m.BR, beeld: opRender(m.BR.R, terug, m.ox, m.oy), tag: `${m.tag}-tweede`, tijd };
}

// Plaatselijk contrast (in onze eigen code): de helderheid verder van haar omgeving (een vierkant van 2·straal+1), met de
// tint gelijk; op de render van 4×, vóór het verkleinen.
function plaatselijkContrast(r, straal = 6, kracht = 0.7) {
  const { b, h } = r;
  const L = new Float32Array(b * h);
  for (let i = 0; i < b * h; i++) L[i] = S.lum([r.rgba[i * 4], r.rgba[i * 4 + 1], r.rgba[i * 4 + 2]]);
  const vervaag = (bron, langsX) => {
    const uit = new Float32Array(b * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
      let s = 0, n = 0;
      for (let d = -straal; d <= straal; d++) {
        const xx = langsX ? x + d : x, yy = langsX ? y : y + d;
        if (xx < 0 || yy < 0 || xx >= b || yy >= h || r.rgba[(yy * b + xx) * 4 + 3] < 128) continue;
        s += bron[yy * b + xx]; n++;
      }
      uit[y * b + x] = n ? s / n : bron[y * b + x];
    }
    return uit;
  };
  const om = vervaag(vervaag(L, true), false);
  const uit = { b, h, rgba: Buffer.from(r.rgba) };
  for (let i = 0; i < b * h; i++) {
    if (r.rgba[i * 4 + 3] < 128 || L[i] <= 0) continue;
    const f = Math.max(0, L[i] + kracht * (L[i] - om[i])) / L[i];
    for (let c = 0; c < 3; c++) uit.rgba[i * 4 + c] = Math.max(0, Math.min(255, Math.round(r.rgba[i * 4 + c] * f)));
  }
  return uit;
}
// Het beeld van het doek terug op de render: op zijn plek, alleen binnen ons silhouet.
function opRender(R, ai, ox, oy) {
  const beeld = { b: R.b, h: R.h, rgba: Buffer.alloc(R.b * R.h * 4) };
  for (let y = 0; y < ai.h; y++) for (let x = 0; x < ai.b; x++) {
    const X = x + ox, Y = y + oy;
    if (X < 0 || Y < 0 || X >= R.b || Y >= R.h || R.ramp[Y * R.b + X] < 0) continue;
    const j = (y * ai.b + x) * 4;
    beeld.rgba.set([ai.rgba[j], ai.rgba[j + 1], ai.rgba[j + 2], 255], (Y * R.b + X) * 4);
  }
  return beeld;
}
// Een meesterbeeld van eerder terug (zonder SDXL opnieuw): de render van toen (dezelfde fijnheid, met of zonder de stoffen)
// en het beeld op zijn plek (uit instellingen.json).
function meesterTerug(tag, kant, rijk) {
  const A = require('../ai/beeld-ai.cjs');
  const map = path.join(MEESTER_UIT, tag);
  const inst = JSON.parse(fs.readFileSync(path.join(map, `${kant}-instellingen.json`)));
  const BR = bakRender(kant, inst.fijn, rijk);
  const ai = A.leesPng(fs.readFileSync(path.join(map, `${kant}-ai.png`)));
  return { BR, beeld: opRender(BR.R, ai, inst.plek[0], inst.plek[1]) };
}

// ---------------------------------------------------------------- ons handschrift over het geschilderde beeld

// Marcel, 19 okt: "Handschrift proberen maar". Wat ChatGPT op spelmaat vooral heeft: een sterke donkere omlijning en veel
// contrast. Ons handschrift (stijl.cjs stileer, de stijl van het wiel naar het doel met de naden en de lijnen om de spaken)
// over de geprojecteerde kar, met de kleur van de render in plaats van de reeksen (renderKleur, voor elke ramp).
function handschriftStijl() {
  const stijl = JSON.parse(JSON.stringify(HS.leesIjk().stijlen.doel));
  stijl.materialen = {};
  for (const naam of K.RAMP_NAMEN) if (naam) stijl.materialen[naam] = stijl.materialen[`~${naam}`] = { ...S.rampStijl(naam), renderKleur: true };
  stijl.detailsWinnen = true;
  stijl.binnenlijnen = { ...stijl.binnenlijnen, naden: true, om: [SPAAK] };
  return stijl;
}
// Drie manieren: H1 het handschrift zelf (de kleur van de render per spritepixel gemiddeld, met de lijnen), H2 de
// geschilderde pixels (de naaste) met de lijnen en de omlijning van H1 erover, H3 dat met meer contrast.
function handschrift(R, stijl, o = {}) {
  const st = { ...stijl, details: new Set(R.nagels) };
  const G = S.gbuffer(R, FIJN / 2, st);
  // de os als iets zonder textuur (G.kaal): alleen een lijn waar iets ervoor ligt, geen naden en geen lijnen tussen zijn
  // delen (de bollen van zijn lijf werden anders een lappenpop, zoals eerder; code.md, "Het handschrift op wat geen textuur
  // heeft")
  for (let o = 0; o < G.b * G.h; o++) if (G.dek[o] && Math.floor(G.stuk[o] / 1000) === 2) G.kaal[o] = 1;
  const h1 = S.stileer(G, st, HS.VARIANTEN.D.st);
  const zl4 = { b: R.zl.b, h: R.zl.h, rgba: Buffer.from(R.zl.rgba) };
  // o.contrast: plaatselijk contrast op de render van 4× (true: kracht 0,7; een getal: die kracht)
  const naast = H.verklein(o.contrast ? plaatselijkContrast(zl4, 6, o.contrast === true ? 0.7 : o.contrast) : zl4, 2, 'naast');
  const h2 = { b: h1.b, h: h1.h, rgba: Buffer.from(h1.rgba) };
  const h3 = { b: h1.b, h: h1.h, rgba: Buffer.from(h1.rgba) };
  // contrast: om de middelste helderheid van wat dekt, met de tint gelijk
  let som = 0, n = 0;
  for (let o = 0; o < h1.b * h1.h; o++) if (G.dek[o]) { som += S.lum([naast.rgba[o * 4], naast.rgba[o * 4 + 1], naast.rgba[o * 4 + 2]]); n++; }
  const mid = som / Math.max(1, n);
  for (let o = 0; o < h1.b * h1.h; o++) {
    if (!G.dek[o] || h1.toon[o] === -1) continue; // een lijn of de omlijning: die van H1
    const k = [naast.rgba[o * 4], naast.rgba[o * 4 + 1], naast.rgba[o * 4 + 2]];
    h2.rgba.set([...k, 255], o * 4);
    const l = S.lum(k);
    const f = l > 0 ? Math.max(0, mid + (l - mid) * 1.3) / l : 1;
    h3.rgba.set([...k.map((c) => Math.max(0, Math.min(255, Math.round(c * f)))), 255], o * 4);
  }
  // H4 (o.spec, de stijlspecificatie; huisstijl.cjs HUISSTIJL.spec): minder verscherping, warm licht en koelere schaduw uit
  // ons eigen licht (G.licht: dezelfde lichtrichting voor elk ding), het donkerste opgetild, de binnenlijnen half naar de
  // kleur eronder (dunner en zachter dan de omlijning, die van H1 blijft)
  let h4 = null;
  if (o.spec) {
    const sp = o.spec;
    const n4 = H.verklein(plaatselijkContrast(zl4, 6, sp.contrast), 2, 'naast');
    h4 = { b: h1.b, h: h1.h, rgba: Buffer.from(h1.rgba) };
    for (let p = 0; p < h1.b * h1.h; p++) {
      if (!G.dek[p]) continue;
      const t = Math.max(0, Math.min(1, (G.licht[p] - sp.licht[0]) / (sp.licht[1] - sp.licht[0])));
      let k = [0, 1, 2].map((c) => n4.rgba[p * 4 + c] * (sp.koel[c] + (sp.warm[c] - sp.koel[c]) * t));
      k = k.map((c) => sp.vloer + c * (1 - sp.vloer / 255));
      if (h1.toon[p] === -1) k = k.map((c, i) => c * (1 - sp.binnenZacht) + h1.rgba[p * 4 + i] * sp.binnenZacht);
      h4.rgba.set([...k.map((c) => Math.max(0, Math.min(255, Math.round(c)))), 255], p * 4);
    }
  }
  return { naast: H.omlijnBeeld(naast), h1, h2, h3, h4 };
}
async function handProef() {
  const tag = 'civitai-faetastic-SDXLFaetastic-v24-eigen-rijk';
  const { BR, beeld } = meesterTerug(tag, 'ZW', true);
  const { mat, osMat } = projecteer(BR, beeld);
  const stijl = handschriftStijl();
  const groot = (r, n) => H.snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, n);
  const knip = (r) => H.alfaSnijMetGrond(H.alfaSnij(r, H.uitsnede([r], 4)));
  const KANTEN = ['ZW', 'ZO', 'NW'];
  const NAAM = { naast: 'zonder handschrift', h1: 'H1: ons handschrift', h2: 'H2: geschilderd, met onze lijnen', h3: 'H3: H2 met meer contrast' };
  const rijen = { naast: [], h1: [], h2: [], h3: [] };
  for (const k of KANTEN) {
    const v = handschrift(render({ ...O_KAR, mat, osMat }, k, FIJN), stijl);
    for (const [s, r] of Object.entries(v)) {
      H.bewaar(path.join(MEESTER_UIT, tag, `hand-${s}-${k}.png`), r);
      rijen[s].push(E.met(groot(knip(r), 2), `${NAAM[s]} · ${k}`));
    }
  }
  E.bewaar(path.join(MEESTER_UIT, 'handschrift.png'), [
    KANTEN.map((k) => E.met(groot(knip(H.lees(path.join(UIT, `gpt-${k}.png`))), 2), `ter vergelijking: de pixels van ChatGPT · ${k}`)),
    rijen.naast, rijen.h1, rijen.h2, rijen.h3,
  ], 'Ons handschrift over de eigen pijplijn', 'Het rijke begin, denoise 0,65 (FaeTastic, zonder referentie), geprojecteerd. H1: ons handschrift (stijl.cjs, de kleur van de render per spritepixel); H2: de geschilderde pixels met onze lijnen en omlijning; H3: H2 met 1,3 keer het contrast. Maal 2 (spelmaat 2×).');
  console.log('uit/karhd/meester/handschrift.png');
}


// De proef: per checkpoint het meesterbeeld naar zuidwest, geprojecteerd, in drie beelden op spelmaat, naast de kar met de
// pixels van ChatGPT (gpt-ZW.png enz., uit `karhd.cjs gpt`).
const CHECKPOINTS = (process.env.CHECKPOINTS || 'sd_xl_base_1.0.safetensors').split(',');
async function meesterProef() {
  const zl = (R) => ({ b: R.zl.b, h: R.zl.h, rgba: Buffer.from(R.zl.rgba) });
  const sprite = (R) => H.omlijnBeeld(H.verklein(zl(R), 2, 'naast'));
  const groot = (r, n) => H.snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, n);
  const knip = (r) => H.alfaSnijMetGrond(H.alfaSnij(r, H.uitsnede([r], 4)));
  const rijen = [['ZW', 'ZO', 'NW'].map((k) => E.met(groot(knip(H.lees(path.join(UIT, `gpt-${k}.png`))), 2), `de pixels van ChatGPT · ${k}`))];
  for (const ck of CHECKPOINTS) {
    const m = await meester('ZW', ck === 'sd_xl_base_1.0.safetensors' ? undefined : ck);
    const { mat, osMat } = projecteer(m.BR, m.beeld);
    const rij = [E.met(knip(H.verklein(m.beeld, 3, 'naast')), `${m.tag}: het meesterbeeld (${m.tijd.toFixed(0)} s)`)];
    for (const k of ['ZW', 'ZO', 'NW']) {
      const r = sprite(render({ ...O_KAR, mat, osMat }, k, FIJN));
      H.bewaar(path.join(MEESTER_UIT, m.tag, `sprite-${k}.png`), r);
      rij.push(E.met(groot(knip(r), 2), `${m.tag} · ${k}`));
    }
    rijen.push(rij);
  }
  E.bewaar(path.join(MEESTER_UIT, 'proef.png'), rijen, 'De eigen pijplijn: SDXL schildert de kar', 'Per checkpoint: SDXL schildert op onze render naar zuidwest (img2img, denoise 0,65, ControlNet lijnen en diepte, IP-Adapter met de ChatGPT-wagen als stijlplaat, seed 180), en dat wordt geprojecteerd. Maal 2 (spelmaat 2×). Bovenaan de kar met de pixels van ChatGPT.');
  console.log('uit/karhd/meester/proef.png');
}

function gpt() {
  fs.mkdirSync(UIT, { recursive: true });
  const { mat, osMat, beeld } = projectieWagen();
  const zl = (R) => ({ b: R.zl.b, h: R.zl.h, rgba: Buffer.from(R.zl.rgba) });
  const sprite = (R) => H.omlijnBeeld(H.verklein(zl(R), 2, 'naast'));
  const groot = (r, n) => H.snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, n);
  const knip = (r) => H.alfaSnijMetGrond(H.alfaSnij(r, H.uitsnede([r], 4)));
  // het ChatGPT-beeld op spelmaat: zoals het op onze render van 8× ligt, met de naaste naar 2×
  const doel = H.omlijnBeeld(H.verklein(beeld, 4, 'naast'));
  const rij = [];
  const rij4 = [];
  for (const [kant, extra] of [['ZW', {}], ['ZW', { houding: 'lopen', fase: 0.5 }], ['ZO', {}], ['NW', {}]]) {
    const R = render({ ...O_KAR, ...extra, mat, osMat }, kant, FIJN);
    const naam = `${kant}${extra.houding ? ', lopend' : ''}`;
    H.bewaar(path.join(UIT, `gpt-${kant}${extra.houding ? '-lopen' : ''}.png`), sprite(R));
    rij.push(E.met(groot(knip(sprite(R)), 2), `${naam} · 2× (spelmaat)`));
    if (kant === 'ZW' && !extra.houding) rij4.push(E.met(knip(zl(R)), 'ZW · 4×'));
    console.log(naam, `${(R.ms / 1000).toFixed(0)} s`);
  }
  const nu = H.lees(path.join(UIT, 'ZW-0.png'));
  E.bewaar(path.join(UIT, 'gpt.png'), [
    [E.met(groot(knip(doel), 2), 'ChatGPT, op spelmaat'), E.met(groot(knip(nu), 2), 'de HD-kar van eerder (stijl D, zonder ChatGPT)'), rij[0]],
    rij.slice(1),
    [E.met(knip(H.verklein(beeld, 2, 'naast')), 'ChatGPT · 4×'), ...rij4],
  ], 'De pixels van de ChatGPT-wagen op de kar', 'De vorm naar de ChatGPT-wagen (de os forser, de dissel en de rongen dikker, een onderrand), uitgelijnd op het voorste wiel, de os apart. Rij 1 en 2 maal 2 (spelmaat 2×), rij 3 op 4×. Wat ChatGPT niet liet zien: gespiegeld, of het wiel gedraaid; anders onze eigen kleur.');
  console.log('uit/karhd/gpt.png');
}

module.exports = { materialen, karModel, osModel, render, stijlVoor, gestileerd, doelWagen, legWagen, projectieWagen, FGPT, O_KAR, MESSING, UIT, handschrift, handschriftStijl, plaatselijkContrast, opRender, buurverschil, ZACHT, FMEESTER };

// De eigen pijplijn naast de kar met de pixels van ChatGPT en naast FaeTastic met de ChatGPT-wagen als stijlplaat (beide
// ter vergelijking, uit eerdere runs: gpt-*.png, meester/civitai-faetastic-SDXLFaetastic-v24/sprite-*.png).
async function eigenProef() {
  const zl = (R) => ({ b: R.zl.b, h: R.zl.h, rgba: Buffer.from(R.zl.rgba) });
  const sprite = (R) => H.omlijnBeeld(H.verklein(zl(R), 2, 'naast'));
  const groot = (r, n) => H.snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, n);
  const knip = (r) => H.alfaSnijMetGrond(H.alfaSnij(r, H.uitsnede([r], 4)));
  const HU = require('../ai/huisstijl.cjs');
  const KANTEN = ['ZW', 'ZO', 'NW'];
  // de varianten (VARIANT: alleen deze, met komma's): zes groepen zonder en met de pixelart-LoRA
  const ALLE = {
    groepen: { naam: 'zes groepen', tag: 'groepen' },
    lora: { naam: `zes groepen, PixelArtRedmond ${HU.LORA.kracht}`, tag: 'lora', lora: HU.LORA },
    // stap 1 (Marcel, 19 okt: "Beginnen we met stap 1"): een rijker begin, en SDXL meer laten schilderen
    rijk: { naam: 'rijk begin, denoise 0,65', tag: 'rijk', rijk: true },
    rijk75: { naam: 'rijk begin, denoise 0,75', tag: 'rijk75', rijk: true, denoise: 0.75 },
    rijkLora: { naam: 'rijk begin, denoise 0,75, PixelArtRedmond 0,35', tag: 'rijk75-lora35', rijk: true, denoise: 0.75, lora: { ...HU.LORA, kracht: 0.35 } },
  };
  const kies = (process.env.VARIANT || 'rijk,rijk75,rijkLora').split(',');
  const rijen = [KANTEN.map((k) => E.met(groot(knip(H.lees(path.join(UIT, `gpt-${k}.png`))), 2), `ter vergelijking: de pixels van ChatGPT · ${k}`))];
  // de vorige proef (zes groepen, een glad begin), als hij er is
  const vorige = path.join(MEESTER_UIT, 'civitai-faetastic-SDXLFaetastic-v24-eigen-groepen');
  if (fs.existsSync(path.join(vorige, 'sprite-ZW.png'))) rijen.push(KANTEN.map((k) => E.met(groot(knip(H.lees(path.join(vorige, `sprite-${k}.png`))), 2), `zes groepen, glad begin (vorige proef) · ${k}`)));
  const onder = [];
  let beginGetoond = false;
  for (const v of kies.map((k) => ALLE[k])) {
    const m = await meester('ZW', null, true, v);
    const { mat, osMat } = projecteer(m.BR, m.beeld);
    rijen.push(KANTEN.map((k) => {
      const r = sprite(render({ ...O_KAR, mat, osMat }, k, FIJN));
      H.bewaar(path.join(MEESTER_UIT, m.tag, `sprite-${k}.png`), r);
      return E.met(groot(knip(r), 2), `${v.naam} · ${k}`);
    }));
    onder.push(E.met(knip(H.verklein(m.beeld, 3, 'naast')), `${v.naam}: het meesterbeeld (${m.tijd.toFixed(0)} s)`));
    if (v.rijk && !beginGetoond) {
      beginGetoond = true;
      const init = H.lees(path.join(MEESTER_UIT, m.tag, 'ZW-init.png'));
      for (let i = 0; i < init.b * init.h; i++) if (init.rgba[i * 4] === 255 && init.rgba[i * 4 + 1] === 0 && init.rgba[i * 4 + 2] === 255) init.rgba[i * 4 + 3] = 0;
      onder.unshift(E.met(knip(H.verklein(init, 3, 'naast')), 'het rijke begin: onze render met de stoffen'));
    }
  }
  rijen.push(onder);
  E.bewaar(path.join(MEESTER_UIT, 'eigen.png'), rijen, 'De eigen pijplijn: zonder referentie', 'FaeTastic, zonder stijlplaat: de huisstijl, en per gebied (uit onze render) de zin van zijn groep (huisstijl.cjs); de leeuw van de heer zelf getekend (wapen.cjs). Het rijke begin: vacht, jute en schors in onze render (stoffen.cjs). SDXL schildert op onze render naar zuidwest, en dat wordt geprojecteerd. Maal 2 (spelmaat 2×).');
  console.log('uit/karhd/meester/eigen.png');
}

// De drie wegen naar rijker schilderwerk, elk met ons handschrift H3 erover, naast de vorige H3 en ChatGPT, met het
// verschil tussen buurpixels (op spelmaat; ChatGPT 73, wij 45 op 19 okt).
function buurverschil(r) {
  let n = 0, d = 0;
  for (let y = 1; y < r.h; y++) for (let x = 1; x < r.b; x++) {
    const a = (y * r.b + x) * 4;
    if (r.rgba[a + 3] < 128) continue;
    for (const j of [a - 4, a - r.b * 4]) {
      if (r.rgba[j + 3] < 128) continue;
      d += Math.abs(r.rgba[a] - r.rgba[j]) + Math.abs(r.rgba[a + 1] - r.rgba[j + 1]) + Math.abs(r.rgba[a + 2] - r.rgba[j + 2]);
      n++;
    }
  }
  return +(d / Math.max(1, n)).toFixed(1);
}
async function rijkerProef() {
  const KANTEN = ['ZW', 'ZO', 'NW'];
  const stijl = handschriftStijl();
  const groot = (r, n) => H.snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, n);
  const knip = (r) => H.alfaSnijMetGrond(H.alfaSnij(r, H.uitsnede([r], 4)));
  const gpt = H.lees(path.join(UIT, 'gpt-ZW.png'));
  const vorige = path.join(MEESTER_UIT, 'civitai-faetastic-SDXLFaetastic-v24-eigen-rijk');
  const maten = { 'ChatGPT': buurverschil(gpt), 'H3 van eerder': buurverschil(H.lees(path.join(vorige, 'hand-h3-ZW.png'))) };
  const rijen = [
    KANTEN.map((k) => E.met(groot(knip(H.lees(path.join(UIT, `gpt-${k}.png`))), 2), `ter vergelijking: de pixels van ChatGPT · ${k}`)),
    KANTEN.map((k) => E.met(groot(knip(H.lees(path.join(vorige, `hand-h3-${k}.png`))), 2), `H3 van eerder · ${k}`)),
  ];
  const rij = async (naam, mat, osMat, o = {}) => {
    const r = [];
    for (const k of KANTEN) {
      const s = handschrift(render({ ...O_KAR, mat, osMat }, k, FIJN), stijl, o).h3;
      if (k === 'ZW') maten[naam] = buurverschil(s);
      r.push(E.met(groot(knip(s), 2), `${naam} · ${k}`));
    }
    rijen.push(r);
  };
  const m1 = await meesterOfTerug('ZW', { rijk: true, schilder: true, tag: 'schilder' });
  const p1 = projecteer(m1.BR, m1.beeld);
  await rij('W1: schilderwoorden, cfg 7', p1.mat, p1.osMat);
  // de tweede beurt (W2, W3) maakte het op deze maat gladder (buurverschil 46,6) en kostte 25 minuten: alleen met TWEEDE=1
  const onder = [E.met(knip(H.verklein(m1.beeld, 3, 'naast')), `W1: het meesterbeeld (${m1.tijd.toFixed(0)} s)`)];
  if (process.env.TWEEDE) {
    const m2 = await tweedeBeurt(m1, 'ZW');
    const p2 = projecteer(m2.BR, m2.beeld);
    await rij('W2: W1 met een tweede beurt', p2.mat, p2.osMat);
    await rij('W3: W2 met plaatselijk contrast', p2.mat, p2.osMat, { contrast: true });
    onder.push(E.met(knip(H.verklein(m2.beeld, 3, 'naast')), `W2: na de tweede beurt (${m2.tijd.toFixed(0)} s)`));
  }
  // W1 met plaatselijk contrast, op twee sterktes (zonder de tweede beurt)
  await rij('W4: W1 met plaatselijk contrast 0,7', p1.mat, p1.osMat, { contrast: 0.7 });
  await rij('W5: W1 met plaatselijk contrast 1,0', p1.mat, p1.osMat, { contrast: 1.0 });
  rijen.push(onder);
  fs.writeFileSync(path.join(MEESTER_UIT, 'rijker.json'), JSON.stringify({ buurverschil: maten }, null, 1));
  E.bewaar(path.join(MEESTER_UIT, 'rijker.png'), rijen, 'Rijker schilderwerk: drie wegen', `Het rijke begin (FaeTastic, zonder referentie), elk met ons handschrift H3. W1: schilderwoorden en cfg 7; W4 en W5: W1 met plaatselijk contrast in onze code (0,7 en 1,0). (Een tweede beurt op dubbel formaat in tegels maakte het gladder: TWEEDE=1.) Verschil tussen buurpixels naar zuidwest: ${Object.entries(maten).map(([k, v]) => `${k} ${v}`).join(', ')}. Maal 2 (spelmaat 2×).`);
  console.log(JSON.stringify(maten));
  console.log('uit/karhd/meester/rijker.png');
}

// De betere zinnen (Marcel, 19 okt: "Ja proberen"): W5 met de zinnen van eerder (het meesterbeeld van eerder, zonder SDXL
// opnieuw) naast W5 met de betere zinnen (huisstijl.cjs GROEPZIN), elk met ons handschrift H3 en plaatselijk contrast 1,0.
async function zinnenProef() {
  const HU = require('../ai/huisstijl.cjs');
  const KANTEN = ['ZW', 'ZO', 'NW'];
  const stijl = handschriftStijl();
  const groot = (r, n) => H.snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, n);
  const knip = (r) => H.alfaSnijMetGrond(H.alfaSnij(r, H.uitsnede([r], 4)));
  const P = HU.HUISSTIJL.pijplijn;
  const maten = { ChatGPT: buurverschil(H.lees(path.join(UIT, 'gpt-ZW.png'))) };
  const rijen = [KANTEN.map((k) => E.met(groot(knip(H.lees(path.join(UIT, `gpt-${k}.png`))), 2), `ter vergelijking: de pixels van ChatGPT · ${k}`))];
  const rij = (naam, m) => {
    const { mat, osMat } = projecteer(m.BR, m.beeld);
    rijen.push(KANTEN.map((k) => {
      const s = handschrift(render({ ...O_KAR, mat, osMat }, k, FIJN), stijl, { contrast: P.contrast })[P.handschrift];
      H.bewaar(path.join(MEESTER_UIT, m.tag, `w5-${k}.png`), s);
      if (k === 'ZW') maten[naam] = buurverschil(s);
      return E.met(groot(knip(s), 2), `${naam} · ${k}`);
    }));
  };
  const m0 = await meesterOfTerug('ZW', { rijk: P.rijk, schilder: P.schilder, tag: 'schilder' });
  rij('W5, de zinnen van eerder', m0);
  const m1 = await meester('ZW', null, true, { rijk: P.rijk, schilder: P.schilder, tag: 'zinnen' });
  rij('W5, de betere zinnen', m1);
  rijen.push([E.met(knip(H.verklein(m0.beeld, 3, 'naast')), 'het meesterbeeld, de zinnen van eerder'), E.met(knip(H.verklein(m1.beeld, 3, 'naast')), `het meesterbeeld, de betere zinnen (${m1.tijd.toFixed(0)} s)`)]);
  fs.writeFileSync(path.join(MEESTER_UIT, 'zinnen.json'), JSON.stringify({ buurverschil: maten, zinnen: m1.gebieden.map((g) => ({ tekst: g.tekst, pixels: g.pixels.length })), positief: m1.namen.positief, negatief: m1.namen.negatief }, null, 1));
  E.bewaar(path.join(MEESTER_UIT, 'zinnen.png'), rijen, 'De betere zinnen per materiaal', `W5 (het rijke begin, de schilderwoorden, ons handschrift H3, plaatselijk contrast 1,0), met de zinnen van eerder en met de betere zinnen (huisstijl.cjs: kleur uit het model, oppervlak, licht, slijtage; schors en de bies apart; geen brood). Buurverschil naar zuidwest: ${Object.entries(maten).map(([k, v]) => `${k} ${v}`).join(', ')}. Maal 2 (spelmaat 2×).`);
  console.log(JSON.stringify(maten));
  console.log('uit/karhd/meester/zinnen.png');
}

// De stijlspecificatie (Marcel, 19 okt: "Ja proef draaien maar"; ontwerp/stijlspecificatie.md): SDXL met de zinnen uit de
// specificatie, het rijke begin met de vacht als streken, en H4. Vergeleken met de ChatGPT-wagen op 4× en op spelmaat (2×),
// zoals de specificatie vraagt, naast W5.
async function specProef() {
  const HU = require('../ai/huisstijl.cjs');
  const KANTEN = ['ZW', 'ZO', 'NW'];
  const stijl = handschriftStijl();
  const groot = (r, n) => H.snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, n);
  const knip = (r) => H.alfaSnijMetGrond(H.alfaSnij(r, H.uitsnede([r], 4)));
  // TAG: een eigen map (de tweede ronde: spec2), met de vorige ronde (spec) ernaast
  const tag = process.env.TAG || 'spec';
  const m = await meester('ZW', null, true, { rijk: true, schilder: true, tag });
  const { mat, osMat } = projecteer(m.BR, m.beeld);
  const ij = HS.leesIjk();
  const gpt2 = doelWagen(ij.hoogte);
  const gpt4 = doelWagen(ij.hoogte * 2);
  const vorigePad = tag === 'spec' ? path.join(MEESTER_UIT, 'civitai-faetastic-SDXLFaetastic-v24-eigen-schilder', 'w5-ZW.png') : path.join(MEESTER_UIT, 'civitai-faetastic-SDXLFaetastic-v24-eigen-spec', 'h4-ZW.png');
  const vorigeNaam = tag === 'spec' ? 'W5 van eerder' : 'H4, de eerste ronde';
  const w5 = H.lees(vorigePad);
  const sprites = {};
  let vier = null;
  for (const k of KANTEN) {
    const R = render({ ...O_KAR, mat, osMat }, k, FIJN);
    const v = handschrift(R, stijl, { spec: HU.HUISSTIJL.spec });
    sprites[k] = v.h4;
    H.bewaar(path.join(MEESTER_UIT, m.tag, `h4-${k}.png`), v.h4);
    if (k === 'ZW') vier = plaatselijkContrast({ b: R.zl.b, h: R.zl.h, rgba: Buffer.from(R.zl.rgba) }, 6, HU.HUISSTIJL.spec.contrast);
  }
  H.bewaar(path.join(MEESTER_UIT, m.tag, 'vier-ZW.png'), vier);
  const maten = { ChatGPT: buurverschil(gpt2), [vorigeNaam]: buurverschil(w5), [tag === 'spec' ? 'H4' : 'H4, deze ronde']: buurverschil(sprites.ZW) };
  E.bewaar(path.join(MEESTER_UIT, `${tag}.png`), [
    [E.met(knip(gpt4), 'ChatGPT op 4× (de maat van onze render)'), E.met(knip(vier), 'onze render op 4× (zonder het handschrift)')],
    [E.met(groot(knip(gpt2), 2), 'ChatGPT op spelmaat (2×), maal 2'), E.met(groot(knip(sprites.ZW), 2), `H4 (${tag}) · ZW, maal 2`), E.met(groot(knip(w5), 2), `${vorigeNaam} · ZW, maal 2`)],
    [E.met(groot(knip(sprites.ZO), 2), 'H4 · ZO, maal 2'), E.met(groot(knip(sprites.NW), 2), 'H4 · NW, maal 2'), E.met(knip(H.verklein(m.beeld, 3, 'naast')), `het meesterbeeld (${m.tijd.toFixed(0)} s)`)],
  ], 'De stijlspecificatie in de eigen pijplijn', `SDXL (FaeTastic, zonder referentie) met de zinnen uit de specificatie, het rijke begin met de vacht als streken, en H4: plaatselijk contrast 0,6, warm licht en koelere schaduw uit ons licht, geen zwart, zachtere binnenlijnen. Rij 1 op 4×, rij 2 en 3 op spelmaat maal 2. Buurverschil (een maat voor dichtheid, niet voor kwaliteit): ${Object.entries(maten).map(([k, v]) => `${k} ${v}`).join(', ')}.`);
  fs.writeFileSync(path.join(MEESTER_UIT, `${tag}.json`), JSON.stringify({ buurverschil: maten, zinnen: m.gebieden.map((g) => ({ tekst: g.tekst, pixels: g.pixels.length })), positief: m.namen.positief, negatief: m.namen.negatief }, null, 1));
  console.log(JSON.stringify(maten));
  console.log(`uit/karhd/meester/${tag}.png`);
}

// Twee checkpoints naast elkaar (Marcel, 19 okt: Cor Epica, "ok, staat erin"): precies de instellingen en zinnen van de
// laatste proef (karhd.cjs spec: de huisstijl, het rijke begin, de schilderwoorden, H4), alleen het checkpoint anders.
// FaeTastic van eerder (meesterOfTerug), Cor Epica nieuw. Op 4× en op spelmaat naast ChatGPT.
async function checkpointProef() {
  const HU = require('../ai/huisstijl.cjs');
  const KANTEN = ['ZW', 'ZO', 'NW'];
  const stijl = handschriftStijl();
  const groot = (r, n) => H.snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, n);
  const knip = (r) => H.alfaSnijMetGrond(H.alfaSnij(r, H.uitsnede([r], 4)));
  const ij = HS.leesIjk();
  const gpt2 = doelWagen(ij.hoogte);
  const gpt4 = doelWagen(ij.hoogte * 2);
  const maten = { ChatGPT: buurverschil(gpt2) };
  const rijen = [[E.met(knip(gpt4), 'ChatGPT op 4×'), E.met(groot(knip(gpt2), 2), 'ChatGPT op spelmaat (2×), maal 2')]];
  const onder = [];
  for (const [naam, ck] of [['FaeTastic', HU.CHECKPOINTS.faetastic], ['Cor Epica', HU.CHECKPOINTS.corepica]]) {
    const m = await meesterOfTerug('ZW', { rijk: true, schilder: true, tag: 'spec', checkpoint: ck });
    const { mat, osMat } = projecteer(m.BR, m.beeld);
    const rij = [];
    for (const k of KANTEN) {
      const R = render({ ...O_KAR, mat, osMat }, k, FIJN);
      const s = handschrift(R, stijl, { spec: HU.HUISSTIJL.spec }).h4;
      H.bewaar(path.join(MEESTER_UIT, m.tag, `h4-${k}.png`), s);
      if (k === 'ZW') {
        maten[naam] = buurverschil(s);
        rij.push(E.met(knip(plaatselijkContrast({ b: R.zl.b, h: R.zl.h, rgba: Buffer.from(R.zl.rgba) }, 6, HU.HUISSTIJL.spec.contrast)), `${naam} op 4× · ZW`));
      }
      rij.push(E.met(groot(knip(s), 2), `${naam} · ${k}, maal 2`));
    }
    rijen.push(rij);
    onder.push(E.met(knip(H.verklein(m.beeld, 3, 'naast')), `${naam}: het meesterbeeld (${(+m.tijd).toFixed(0)} s)`));
  }
  rijen.push(onder);
  fs.writeFileSync(path.join(MEESTER_UIT, 'checkpoints.json'), JSON.stringify({ buurverschil: maten }, null, 1));
  E.bewaar(path.join(MEESTER_UIT, 'checkpoints.png'), rijen, 'Twee checkpoints: FaeTastic en Cor Epica', `Dezelfde instellingen en zinnen (de stijlspecificatie, karhd.cjs spec: het rijke begin, de schilderwoorden, H4), alleen het checkpoint anders. Op 4× en op spelmaat maal 2. Buurverschil (dichtheid, geen kwaliteit): ${Object.entries(maten).map(([k, v]) => `${k} ${v}`).join(', ')}.`);
  console.log(JSON.stringify(maten));
  console.log('uit/karhd/meester/checkpoints.png');
}

// ERNIE-Image-Turbo (Marcel, 19 okt: "Verplaats maar en download maar alvast"): dezelfde gebieden en zinnen, met en zonder
// de pixelart-LoRA voor ERNIE, naast ChatGPT en de laatste FaeTastic (spec2), met H4 erover.
// De ossenkar eerst van de AI (Marcel, 20 okt, bij de speerman: "Huj, maar waarom konden we dit niet met de os en kar
// doen?", en: "Eerst de os en kar zo"): SDXL vrij, van ons model alleen de diepte, en de linker ossenkar uit zijn plaat
// (ontwerp/voorbeelden/stijlplaat-kar.png) als stijl op 0,6, zoals de gekozen speerman (gereedschap/ai/vrij.cjs).
const CONCEPT_KAR = {
  positief: 'medieval ox cart, a cream-colored ox with horns in a leather harness with brass fittings pulling a two-wheeled ' +
    'red painted wooden cart with golden lion emblems on the side panels, iron-banded corner posts, big spoked wooden wheels ' +
    'with iron tyres, loaded with burlap sacks, a barrel, clay jugs and a chest of gold coins, a small red banner with a golden ' +
    'lion, seen from above at a three-quarter angle, high-definition hand-painted pixel art game sprite, premium medieval ' +
    'strategy game asset, stylized realism, rich tactile materials, warm directional light from the upper left, crisp ' +
    'silhouette, plain light grey background',
  negatief: 'photo, photorealism, 3d render, plastic, blurry, deformed, extra legs, four wheels, extra wheels, horse, people, ' +
    'soldier, driver, text, watermark, signature, frame, border, ground, grass, scenery, cropped',
  ipSterktes: [0.6],
  zaden: [11, 22, 33, 44],
};
async function conceptProef() {
  const V = require('../ai/vrij.cjs');
  await V.vrijeRonde(render({ ...O_KAR }, 'ZW', FMEESTER), {
    naam: 'ossenkar',
    map: path.join(UIT, 'vrij', 'ronde-1'),
    plaat: path.join(UIT, 'vrij', 'ossenkar-1.png'),
    titel: 'De ossenkar eerst van de AI',
    stijl: path.join(__dirname, '..', '..', 'ontwerp', 'voorbeelden', 'stijlplaat-kar.png'),
    ...CONCEPT_KAR,
  });
}

async function ernieProef() {
  const HU = require('../ai/huisstijl.cjs');
  const KANTEN = ['ZW', 'ZO', 'NW'];
  const stijl = handschriftStijl();
  const groot = (r, n) => H.snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, n);
  const knip = (r) => H.alfaSnijMetGrond(H.alfaSnij(r, H.uitsnede([r], 4)));
  const ij = HS.leesIjk();
  const gpt2 = doelWagen(ij.hoogte);
  const maten = { ChatGPT: buurverschil(gpt2) };
  const rijen = [[E.met(knip(doelWagen(ij.hoogte * 2)), 'ChatGPT op 4×'), E.met(groot(knip(gpt2), 2), 'ChatGPT op spelmaat (2×), maal 2')]];
  const fae = path.join(MEESTER_UIT, 'civitai-faetastic-SDXLFaetastic-v24-eigen-spec2', 'h4-ZW.png');
  if (fs.existsSync(fae)) {
    rijen[0].push(E.met(groot(knip(H.lees(fae)), 2), 'FaeTastic (spec2) · ZW, maal 2'));
    maten.FaeTastic = buurverschil(H.lees(fae));
  }
  const onder = [];
  const varianten = (process.env.VARIANT || 'zonder,lora').split(',');
  for (const v of varianten) {
    const naam = v === 'lora' ? `ERNIE met de pixelart-LoRA (${HU.LORA_ERNIE.kracht})` : 'ERNIE zonder LoRA';
    const m = await meester('ZW', null, true, { rijk: true, schilder: true, ernie: true, tag: v === 'lora' ? 'lora' : 'zonder', lora: v === 'lora' ? HU.LORA_ERNIE : undefined });
    const { mat, osMat } = projecteer(m.BR, m.beeld);
    const rij = [];
    for (const k of KANTEN) {
      const R = render({ ...O_KAR, mat, osMat }, k, FIJN);
      const s = handschrift(R, stijl, { spec: HU.HUISSTIJL.spec }).h4;
      H.bewaar(path.join(MEESTER_UIT, m.tag, `h4-${k}.png`), s);
      if (k === 'ZW') {
        maten[naam] = buurverschil(s);
        rij.push(E.met(knip(plaatselijkContrast({ b: R.zl.b, h: R.zl.h, rgba: Buffer.from(R.zl.rgba) }, 6, HU.HUISSTIJL.spec.contrast)), `${naam} op 4× · ZW`));
      }
      rij.push(E.met(groot(knip(s), 2), `${naam} · ${k}, maal 2`));
    }
    rijen.push(rij);
    onder.push(E.met(knip(H.verklein(m.beeld, 3, 'naast')), `${naam}: het meesterbeeld (${m.tijd.toFixed(0)} s)`));
  }
  rijen.push(onder);
  fs.writeFileSync(path.join(MEESTER_UIT, 'ernie.json'), JSON.stringify({ buurverschil: maten }, null, 1));
  E.bewaar(path.join(MEESTER_UIT, 'ernie.png'), rijen, 'ERNIE-Image-Turbo in de eigen pijplijn', `ERNIE-Image-Turbo (fp8 bij het laden, 8 stappen, cfg 1, denoise 0,65, zonder ControlNet), dezelfde gebieden en zinnen als FaeTastic (spec2), met H4 erover. Op 4× en op spelmaat maal 2. Buurverschil (dichtheid, geen kwaliteit): ${Object.entries(maten).map(([k, w]) => `${k} ${w}`).join(', ')}.`);
  console.log(JSON.stringify(maten));
  console.log('uit/karhd/meester/ernie.png');
}

const [wat] = require.main === module ? process.argv.slice(2) : ['geladen'];
if (wat === 'proef') proef();
else if (wat === 'gpt') gpt();
else if (wat === 'meester') meesterProef().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
else if (wat === 'eigen') eigenProef().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
else if (wat === 'hand') handProef().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
else if (wat === 'rijker') rijkerProef().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
else if (wat === 'zinnen') zinnenProef().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
else if (wat === 'spec') specProef().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
else if (wat === 'concept') conceptProef().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
else if (wat === 'checkpoint') checkpointProef().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
else if (wat === 'ernie') ernieProef().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
else if (wat !== 'geladen') console.log('node gereedschap/pixelart/karhd.cjs proef | gpt | meester (CHECKPOINTS=a.safetensors,b.safetensors)');
