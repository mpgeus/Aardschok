// De AI op het oppervlak (werklijst vraag 180; Marcels keus na de zevende opdracht: "Ai on surface"; het verslag in
// gereedschap/ai/ai-afwerking.md, "De AI op het oppervlak"). SDXL beschildert wiel D één keer (afwerking.cjs, Route A),
// en die beschildering wordt op het oppervlak van ons model gebakken (pixelart/bakken.cjs): per onderdeel, of per groep
// gelijke onderdelen, de kleur van het oppervlak op zijn afwikkeling, zonder ons licht. Daarna rendert onze renderer het
// wiel met die kleur in elke stand en richting, met zijn eigen licht: wat SDXL schilderde, draait mee.
//
// Gebakken uit de SDXL-beelden van afwerking.cjs (BRON, denoise 0,65): zuidwest stand 0 (de buitenkant) en noordoost stand 0
// (de binnenkant). Daarna gerenderd op 4×, met box naar 2×, een vast palet en een omlijning (zoals A in de stijlproef).
//
//   node gereedschap/ai/oppervlak.cjs sdxl          het SDXL-beeld naar noordoost erbij (afwerking.cjs, dezelfde instellingen)
//   node gereedschap/ai/oppervlak.cjs bak           de bak uit de SDXL-beelden (uit/ai/oppervlak/bak.json)
//   node gereedschap/ai/oppervlak.cjs render <kant> een richting, acht standen en een volle slag (dat doet alles)
//   node gereedschap/ai/oppervlak.cjs platen        de platen en de metingen
//   node gereedschap/ai/oppervlak.cjs alles         bak, de acht richtingen tegelijk, platen
'use strict';
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const K = require('../pixelart/kern.cjs');
const O = require('../pixelart/ossenkar.cjs');
const H = require('../pixelart/hdproef.cjs');
const HS = require('../pixelart/hdstijl.cjs');
const S = require('../pixelart/stijl.cjs');
const BK = require('../pixelart/bakken.cjs');
const AF = require('./afwerking.cjs');
const A = require('./beeld-ai.cjs');
const E = require('./etiket.cjs');
const { apng } = require('../pixelart/apng.cjs');

const UIT = path.join(A.UIT, 'oppervlak');
const BRON = 'd0.65-ip1.00strongstyletransfer-l0.80-z0.60-s180';
const BAKKANTEN = ['ZW', 'NO'];
const VARIANT = H.VARIANTEN.C;
const MIDDEN = [-O.WIEL.x, 0, O.WIEL.r]; // het linkerwiel (hdproef.cjs ZIJ = -1)
const AS = [1, 0, 0];
const STANDEN = H.STANDEN;
const PALET = 48;
// Hoeveel van ons licht er bij het bakken uit gaat (bakken.cjs lichtMacht): SDXL schildert een vlak in de schaduw al
// donker; alles eruit halen maakte het in de zon fel oranje (19 okt: de helft eruit is beter).
const LICHTMACHT = Number(process.env.LICHTMACHT || 0.5);
const Z = AF.Z;

// Het model in een stand, genummerd (bakken.cjs).
const modelIn = (s) => BK.nummer(H.wielModel(VARIANT, STANDEN[s].hoek));
// De groepen: uit het model in rust. Een onderdeel zonder kopieën vouwt rondom: de band om de 90° (zoals de vier stukken
// velg), alles om de naaf om de 45° (zoals de spaken).
const groepVan = BK.groepen(modelIn(0), { as: AS, midden: MIDDEN, vouwAlleen: (d) => (d.deel === 30 ? 4 : 8) });
const basis = H.materialen(H.VARIANTEN.C.st);
// De materialen: hout en ijzer lezen de bak (zonder bak: dezelfde afwerking, voor de render waaruit gebakken wordt).
function materialen(bk) {
  const m = basis.slice();
  for (const i of [O.M.wiel, O.M.ijzer]) m[i] = BK.bakMateriaal(basis[i], bk, groepVan);
  return m;
}
// Een render met de G-buffer, zoals hdstijl.cjs render (de buffers die stijl.cjs gbuffer leest).
function render(kant, s, mat, fijn = 4, vak = null) {
  const m = modelIn(s);
  m.mat = mat;
  const B = vak ? new K.Beeld(vak.b, vak.h, vak.OX, vak.OY) : new K.Beeld(H.CEL[0] * fijn, H.CEL[1] * fijn, H.CEL[2] * fijn, H.CEL[3] * fijn);
  const t0 = process.hrtime.bigint();
  K.tekenModel(B, m, { richting: kant, rust: true, gbuffer: true, fijn });
  K.belicht(B);
  const zl = K.kleurBeeld(B);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  return { b: B.b, h: B.h, ramp: B.ramp, stap: B.stap, diep: B.diep, deel: B.deel, nrm: B.nrm, rust: B.rust, albedo: B.albedo, g: B.g, kleur: B.kleur, zl, ms, model: m, nagels: m.delen.map((d, i) => (require('../pixelart/textuur.cjs').uvVan(d) ? -1 : i)).filter((i) => i >= 0) };
}

// ---------------------------------------------------------------- bakken

const bronMap = (kant) => path.join(AF.UIT, BRON, `${kant}-0`);
function bakken() {
  fs.mkdirSync(UIT, { recursive: true });
  const zonder = materialen(null);
  const delen = [];
  for (const kant of BAKKANTEN) {
    const m = bronMap(kant);
    if (!fs.existsSync(path.join(m, 'ai.png'))) {
      console.log(`${kant}: geen SDXL-beeld (node gereedschap/ai/oppervlak.cjs sdxl)`);
      continue;
    }
    const inst = JSON.parse(fs.readFileSync(path.join(m, 'instellingen.json')));
    const [ox, oy] = inst.plek;
    const u = inst.uitsnede;
    // de render op de maat van het doek: 16× (een spritepixel van 2× is 8 doekpixels), alleen het vak van het wiel
    const vak = { b: u.b * Z, h: u.h * Z, OX: H.CEL[2] * 16 - u.x0 * Z, OY: H.CEL[3] * 16 - u.y0 * Z };
    const t0 = Date.now();
    const R = render(kant, 0, zonder, 16, vak);
    const ai = A.leesPng(fs.readFileSync(path.join(m, 'ai.png')));
    const binnen = AF.invoer(kant, 0).binnen;
    const bk = BK.bak(R, ai, R.model, groepVan, { dx: ox, dy: oy, lichtMacht: LICHTMACHT, binnen: (X, Y) => binnen[Y * ai.b + X] === 1 });
    delen.push(bk);
    console.log(`${kant}: ${bk.kaart.size} texels in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  }
  const bk = BK.voegSamen(delen);
  fs.writeFileSync(path.join(UIT, 'bak.json'), JSON.stringify({ bron: BRON, kanten: BAKKANTEN, dicht: bk.dicht, kaart: [...bk.kaart].map(([s, k]) => [s, k.map((v) => Math.round(v))]) }));
  console.log(`bak: ${bk.kaart.size} texels, uit/ai/oppervlak/bak.json`);
}
function leesBak() {
  const j = JSON.parse(fs.readFileSync(path.join(UIT, 'bak.json')));
  return { dicht: j.dicht, kaart: new Map(j.kaart) };
}

// ---------------------------------------------------------------- render: een richting

// Het vaste palet: uit zuidwest en noordoost in stand 0 (zoals A in de stijlproef: één palet voor het ding).
function paletVan(mat) {
  const pad = path.join(UIT, 'palet.json');
  if (fs.existsSync(pad)) return JSON.parse(fs.readFileSync(pad));
  const beelden = BAKKANTEN.map((k) => H.verklein(render(k, 0, mat).zl, 2, 'filter'));
  const P = H.paletVan(beelden, PALET);
  fs.writeFileSync(pad, JSON.stringify(P));
  return P;
}
const naarSprite = (R, P) => H.naarPalet(H.omlijnBeeld(H.naarPalet(H.verklein(R.zl, 2, 'filter'), P)), P);

function renderKant(kant) {
  const mat = materialen(leesBak());
  const P = paletVan(mat);
  const dir = path.join(UIT, 'gebakken');
  fs.mkdirSync(dir, { recursive: true });
  const tijden = [];
  for (let s = 0; s < STANDEN.length; s++) {
    const R = render(kant, s, mat);
    tijden.push(R.ms);
    H.bewaar(path.join(dir, `${kant}-${s}.png`), naarSprite(R, P));
  }
  fs.writeFileSync(path.join(dir, `${kant}.json`), JSON.stringify({ msPerBeeld: Math.round(tijden.reduce((a, b) => a + b, 0) / tijden.length) }));
  console.log(`${kant}: ${Math.round(tijden.reduce((a, b) => a + b, 0) / tijden.length)} ms per beeld`);
}

// ---------------------------------------------------------------- de platen en de metingen

function platen() {
  const ij = HS.leesIjk();
  const lees = (p) => K.leesPng(fs.readFileSync(p));
  const opGrond = (r) => H.alfaSnijMetGrond(r);
  const groot = (r, n) => H.snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, n);
  const Dvan = (kant, s) => lees(path.join(HS.UIT, 'D', `${kant}-${s}.png`));
  const Bvan = (kant, s) => lees(path.join(UIT, 'gebakken', `${kant}-${s}.png`));
  const Xvan = (s) => lees(s === 8 ? path.join(AF.UIT, `${BRON}-opnieuw`, 'ZW-0', 'sprite-detail.png') : path.join(AF.UIT, BRON, `ZW-${s}`, 'sprite-detail.png'));
  const uVan = {};
  const uitsnede = (kant) => uVan[kant] || (uVan[kant] = H.uitsnede([0, 1, 2, 3, 4, 5, 6, 7].flatMap((s) => [Dvan(kant, s), Bvan(kant, s)]), 4));
  const knip = (r, kant) => H.alfaSnij(r, uitsnede(kant));
  // de G-buffer per stand (van de gewone render: de geometrie is dezelfde) voor de metingen
  const metingen = {};
  const lijsten = {};
  for (const kant of K.KANTEN) {
    const lijst = [];
    for (let s = 0; s < STANDEN.length; s++) {
      const R = HS.render(kant, s, s === 0 || s === 4 ? kant === 'ZW' : false);
      const G = S.gbuffer(R, 2, ij.stijlen.kunst);
      const beelden = { D: Dvan(kant, s), B: Bvan(kant, s) };
      if (kant === 'ZW') beelden.X = Xvan(s);
      lijst.push({ G, beelden, nagels4: HS.nagelKoppen4(R), nagels: new Set(R.nagels) });
    }
    lijsten[kant] = lijst;
    metingen[kant] = Object.fromEntries(Object.keys(lijst[0].beelden).map((k) => [k, HS.meet(lijst, k, ij, kant)]));
    console.log(kant, Object.entries(metingen[kant]).map(([k, m]) => `${k} flikkeren ${m.flikkeren.deel} (${m.flikkeren.n})`).join(', '));
  }
  // samen: flikkeren gewogen naar het aantal plekken
  const samen = {};
  for (const k of ['D', 'B', 'X']) {
    const v = K.KANTEN.map((kant) => metingen[kant][k]).filter(Boolean);
    const n = v.reduce((t, m) => t + m.flikkeren.n, 0);
    samen[k] = { flikkeren: +(v.reduce((t, m) => t + m.flikkeren.deel * m.flikkeren.n, 0) / n).toFixed(3), glimlichtWissel: +(v.reduce((t, m) => t + m.glimlichtWissel, 0) / v.length).toFixed(3), lijnWissel: +(v.reduce((t, m) => t + m.lijnWissel, 0) / v.length).toFixed(3), volleSlag: +(v.reduce((t, m) => t + m.volleSlag, 0) / v.length).toFixed(2), richtingen: v.length };
  }
  // de beelden naar zuidwest in stand 0, tegen het doel
  const { G, nagels } = lijsten.ZW[0];
  const doel = HS.doelOpMaat(ij.hoogte);
  const doelK = H.alfaSnij(doel, H.uitsnede([doel], 4));
  const doel4 = HS.doelOpMaat(ij.hoogte * 4);
  const doel4K = H.alfaSnij(doel4, H.uitsnede([doel4], 16));
  const per = {};
  const doelOnt = HS.ontleedWiel(doel);
  for (const [k, r] of Object.entries(lijsten.ZW[0].beelden)) {
    const ont = HS.ontleedWiel(knip(r, 'ZW'));
    per[k] = { kleur: Object.fromEntries(['hout', 'ijzer'].map((m) => [m, AF.deltaE(ont.materiaal[m].gem, doelOnt.materiaal[m].gem)])), ...AF.spriteMaten(r, G, nagels), ont };
  }
  const NAAM = { D: 'A: procedureel (wiel D)', X: 'B: SDXL per beeld (0,65, detail)', B: 'E: SDXL op het oppervlak gebakken' };
  const ZW0 = lijsten.ZW[0].beelden;
  E.bewaar(path.join(UIT, 'vergelijking.png'), [
    [E.met(opGrond(doel4K), 'doel: het ChatGPT-wiel'), ...['D', 'X', 'B'].map((k) => E.met(groot(opGrond(knip(ZW0[k], 'ZW')), 4), NAAM[k]))],
    [E.met(opGrond(doelK), 'doel'), ...['D', 'X', 'B'].map((k) => E.met(opGrond(knip(ZW0[k], 'ZW')), k === 'D' ? 'A' : k === 'X' ? 'B' : 'E'))],
    [E.met(groot(opGrond(doelK), 3), 'doel, maal 3'), ...['D', 'X', 'B'].map((k) => E.met(groot(opGrond(knip(ZW0[k], 'ZW')), 3), `${NAAM[k]}, maal 3`))],
  ], 'De AI op het oppervlak: het doel, D, SDXL per beeld en SDXL gebakken', 'Zuidwest, stand 0. Rij 1 op dezelfde zichtbare grootte (onze sprites van 2× maal 4), rij 2 op 1920×1080, rij 3 dat maal 3. E: de beschildering van SDXL (zuidwest en noordoost, denoise 0,65) op het oppervlak gebakken en door onze renderer opnieuw belicht.');
  E.bewaar(path.join(UIT, 'richtingen.png'), ['D', 'B'].map((k) => K.KANTEN.map((kant) => E.met(groot(opGrond(knip(lijsten[kant][0].beelden[k], kant)), 2), `${k === 'D' ? 'A' : 'E'} · ${kant}`))),
    'Acht richtingen, stand 0: D en gebakken', 'Maal 2. Gebakken uit zuidwest (buitenkant) en noordoost (binnenkant).');
  const frames = [0, 1, 2, 3, 4, 5, 6, 7].map((s) => H.naastElkaar(['D', 'X', 'B'].map((k) => groot(opGrond(knip(lijsten.ZW[s].beelden[k], 'ZW')), 3)), 3));
  fs.writeFileSync(path.join(UIT, 'draaien.png'), apng(frames.map((r) => ({ b: r.b, h: r.h, rgba: () => r.rgba })), { fps: 6 }));
  const tijden = K.KANTEN.map((kant) => JSON.parse(fs.readFileSync(path.join(UIT, 'gebakken', `${kant}.json`))).msPerBeeld);
  fs.writeFileSync(path.join(UIT, 'metingen.json'), JSON.stringify({ bron: BRON, samen, perRichting: metingen, zuidwest: per, doelDetail: AF.detailVan(doelK), msPerBeeld: tijden }, null, 1));
  for (const [k, m] of Object.entries(samen)) console.log(k, JSON.stringify(m));
  for (const [k, m] of Object.entries(per)) console.log(k, 'kleur', JSON.stringify(m.kleur), 'herkend', JSON.stringify(m.herkend), 'detail', m.detail, 'nagels', `${m.nagels.zichtbaar}/${m.nagels.koppen}`, 'contrast', m.ont.stijl.contrast, 'lijn', Math.round(m.ont.aandeel.lijn * 100) + '%');
  console.log('render ms per beeld', tijden.join(' '));
  console.log('uit/ai/oppervlak/vergelijking.png, richtingen.png, draaien.png, metingen.json');
}

async function alles() {
  bakken();
  for (const f of ['palet.json']) if (fs.existsSync(path.join(UIT, f))) fs.unlinkSync(path.join(UIT, f));
  paletVan(materialen(leesBak()));
  await Promise.all(K.KANTEN.map((kant) => new Promise((ok, mis) => execFile(process.execPath, [__filename, 'render', kant], { maxBuffer: 1e7 }, (e, uit, fout) => {
    process.stdout.write(uit);
    if (e) return mis(new Error(fout || e.message));
    ok();
  }))));
  platen();
}

async function main() {
  const [wat, a1] = process.argv.slice(2);
  if (wat === 'sdxl') {
    const inst = JSON.parse(fs.readFileSync(path.join(bronMap('ZW'), 'instellingen.json'))).instellingen;
    return AF.eenBeeld('NO', 0, inst, await AF.stijlUpload(inst), BRON);
  }
  if (wat === 'bak') return bakken();
  if (wat === 'render') return renderKant(a1);
  if (wat === 'platen') return platen();
  if (wat === 'alles') return alles();
  console.log('node gereedschap/ai/oppervlak.cjs sdxl | bak | render <kant> | platen | alles');
}

module.exports = { bakken, leesBak, materialen, render, naarSprite, paletVan, groepVan, UIT };

if (require.main === module) main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});
