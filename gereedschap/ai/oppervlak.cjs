// De AI op het oppervlak (werklijst vraag 180; Marcels keus na de zevende opdracht: "Ai on surface"; het verslag in
// gereedschap/ai/ai-afwerking.md, "De AI op het oppervlak"). SDXL beschildert een wiel één keer (afwerking.cjs, Route A),
// en die beschildering wordt op het oppervlak van ons model gebakken (pixelart/bakken.cjs): per onderdeel, of per groep
// gelijke onderdelen, de kleur van het oppervlak op zijn afwikkeling, zonder (de helft van) ons licht. Daarna rendert onze
// renderer het wiel met die kleur in elke stand en richting, met zijn eigen licht: wat SDXL schilderde, draait mee.
//
// Twee wielen (--wiel): `c`, wiel C van de stijlproef (19 okt, de eerste keer; met box naar 2× en een gedeeld palet van 48
// kleuren), en `doel`, het wiel naar het doel (hdproef.cjs wielDoel; met detailbehoudend verkleinen en een palet per
// materiaal, doelwiel.cjs: Marcel, 19 okt, "i feel like the filter destroys detail when we scale down"). Gebakken uit de
// SDXL-beelden naar zuidwest stand 0 (de buitenkant) en noordoost stand 0 (de binnenkant), denoise 0,65.
//
//   node gereedschap/ai/oppervlak.cjs [--wiel doel] sdxl          de SDXL-beelden (zuidwest en noordoost) die er nog niet zijn
//   node gereedschap/ai/oppervlak.cjs [--wiel doel] bak           de bak uit de SDXL-beelden
//   node gereedschap/ai/oppervlak.cjs [--wiel doel] render <kant> een richting, acht standen en een volle slag, met de metingen
//   node gereedschap/ai/oppervlak.cjs [--wiel doel] platen        de platen en de metingen samen
//   node gereedschap/ai/oppervlak.cjs [--wiel doel] alles         bak, de acht richtingen tegelijk, platen
'use strict';
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const K = require('../pixelart/kern.cjs');
const O = require('../pixelart/ossenkar.cjs');
const H = require('../pixelart/hdproef.cjs');
const HS = require('../pixelart/hdstijl.cjs');
const S = require('../pixelart/stijl.cjs');
const TX = require('../pixelart/textuur.cjs');
const BK = require('../pixelart/bakken.cjs');
const DW = require('../pixelart/doelwiel.cjs');
const AF = require('./afwerking.cjs');
const A = require('./beeld-ai.cjs');
const E = require('./etiket.cjs');
const { apng } = require('../pixelart/apng.cjs');

const INSTELLING = { ...AF.START, denoise: 0.65 };
const WIELEN = {
  c: { naam: 'wiel C', variant: H.VARIANTEN.C, bron: AF.tagVan(INSTELLING), afwerkingBron: undefined, uit: 'oppervlak', verklein: 'box', lichtMacht: 0.5, ijk: false },
  // het licht er helemaal uit en dan de helderheid per materiaal op die van ons materiaal (bakken.cjs o.ijk): met de helft
  // eruit werd de grote velg in de zon geel
  doel: { naam: 'het wiel naar het doel', variant: H.DOELWIEL, bron: `doel-${AF.tagVan(INSTELLING)}`, afwerkingBron: DW.BRON, uit: 'oppervlak-doel', verklein: 'detail', lichtMacht: 1, ijk: true },
};
const wielNaam = process.argv.includes('--wiel') ? process.argv[process.argv.indexOf('--wiel') + 1] : 'c';
const W = WIELEN[wielNaam];
if (!W) throw new Error(`geen wiel ${wielNaam} (wel: ${Object.keys(WIELEN).join(', ')})`);
const UIT = path.join(A.UIT, W.uit);
const BAKKANTEN = ['ZW', 'NO'];
const MIDDEN = [-O.WIEL.x, 0, O.WIEL.r]; // het linkerwiel (hdproef.cjs ZIJ = -1)
const AS = [1, 0, 0];
const STANDEN = H.STANDEN;
const PALET = 48;
// Hoeveel van ons licht er bij het bakken uit gaat (bakken.cjs lichtMacht): SDXL schildert een vlak in de schaduw al
// donker; alles eruit halen maakte wiel C in de zon fel oranje (19 okt: de helft eruit was beter); per wiel (W.lichtMacht).
const LICHTMACHT = Number(process.env.LICHTMACHT || W.lichtMacht);
const Z = AF.Z;

// Het model in een stand, genummerd (bakken.cjs).
const modelIn = (s) => BK.nummer(H.wielModel(W.variant, STANDEN[s].hoek));
// De groepen: uit het model in rust. Een onderdeel zonder kopieën vouwt rondom: de band om de 90° (zoals de stukken velg),
// alles om de naaf om de 45° (zoals de spaken).
const groepVan = BK.groepen(modelIn(0), { as: AS, midden: MIDDEN, vouwAlleen: (d) => (d.deel === 30 ? 4 : 8) });
const basis = H.materialen(W.variant.st);
// De materialen: hout, ijzer en koper lezen de bak (zonder bak: dezelfde afwerking, voor de render waaruit gebakken wordt).
function materialen(bk) {
  const m = basis.slice();
  for (const i of [O.M.wiel, O.M.ijzer, O.M.goud]) if (m[i] && m[i].textuur) m[i] = BK.bakMateriaal(basis[i], bk, groepVan);
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
  return { b: B.b, h: B.h, ramp: B.ramp, stap: B.stap, diep: B.diep, deel: B.deel, nrm: B.nrm, rust: B.rust, albedo: B.albedo, g: B.g, kleur: B.kleur, zl, ms, model: m, nagels: m.delen.map((d, i) => (TX.uvVan(d) ? -1 : i)).filter((i) => i >= 0) };
}

// ---------------------------------------------------------------- de SDXL-beelden en het bakken

const bronMap = (kant) => path.join(AF.UIT, W.bron, `${kant}-0`);
async function sdxl() {
  const stijl = await AF.stijlUpload(INSTELLING);
  for (const kant of BAKKANTEN) if (!fs.existsSync(path.join(bronMap(kant), 'ai.png'))) await AF.eenBeeld(kant, 0, INSTELLING, stijl, W.bron, W.afwerkingBron);
}
function bakken() {
  fs.mkdirSync(UIT, { recursive: true });
  const zonder = materialen(null);
  const delen = [];
  for (const kant of BAKKANTEN) {
    const m = bronMap(kant);
    if (!fs.existsSync(path.join(m, 'ai.png'))) {
      console.log(`${kant}: geen SDXL-beeld (node gereedschap/ai/oppervlak.cjs --wiel ${wielNaam} sdxl)`);
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
    const binnen = AF.invoer(kant, 0, W.afwerkingBron).binnen;
    const bk = BK.bak(R, ai, R.model, groepVan, { dx: ox, dy: oy, lichtMacht: LICHTMACHT, ijk: W.ijk, binnen: (X, Y) => binnen[Y * ai.b + X] === 1 });
    delen.push(bk);
    console.log(`${kant}: ${bk.kaart.size} texels in ${((Date.now() - t0) / 1000).toFixed(1)} s${bk.factor ? `; helderheid maal ${JSON.stringify(Object.fromEntries(Object.entries(bk.factor).map(([m, f]) => [m, +f.toFixed(2)])))}` : ''}`);
  }
  const bk = BK.voegSamen(delen);
  fs.writeFileSync(path.join(UIT, 'bak.json'), JSON.stringify({ wiel: wielNaam, bron: W.bron, kanten: BAKKANTEN, lichtMacht: LICHTMACHT, dicht: bk.dicht, kaart: [...bk.kaart].map(([s, k]) => [s, k.map((v) => Math.round(v))]) }));
  console.log(`bak: ${bk.kaart.size} texels, ${path.relative(process.cwd(), path.join(UIT, 'bak.json'))}`);
}
function leesBak() {
  const j = JSON.parse(fs.readFileSync(path.join(UIT, 'bak.json')));
  return { dicht: j.dicht, kaart: new Map(j.kaart) };
}

// ---------------------------------------------------------------- de sprite

// Het vaste palet per soort beeld ('B' gebakken, 'U' zonder bak), uit zuidwest en noordoost in stand 0. Wiel C: 48 kleuren
// gedeeld; het wiel naar het doel: een palet per materiaal (doelwiel.cjs).
function paletVan(soort, mat) {
  const pad = path.join(UIT, `palet-${soort}.json`);
  if (W.verklein === 'detail') return DW.paletVast(pad, (k, s) => render(k, s, mat));
  if (fs.existsSync(pad)) return JSON.parse(fs.readFileSync(pad));
  const P = H.paletVan(BAKKANTEN.map((k) => H.verklein(render(k, 0, mat).zl, 2, 'filter')), PALET);
  fs.writeFileSync(pad, JSON.stringify(P));
  return P;
}
const spriteVan = (R, G, P) => (W.verklein === 'detail' ? DW.spriteVan(R, G, P) : H.naarPalet(H.omlijnBeeld(H.naarPalet(H.verklein(R.zl, 2, 'filter'), P)), P));

// ---------------------------------------------------------------- render: een richting

// Acht standen en een volle slag, gebakken (B) en zonder bak (U), met hun metingen (flikkeren enz., hdstijl.cjs meet) op
// de G-buffer van dezelfde geometrie. Voor wiel C ook D van de stijlproef en, naar zuidwest, SDXL per beeld (X).
function renderKant(kant) {
  const ij = HS.leesIjk();
  const matB = materialen(leesBak());
  const matU = basis;
  const PB = paletVan('B', matB);
  const PU = paletVan('U', matU);
  const dir = path.join(UIT, 'gebakken');
  const dirU = path.join(UIT, 'zonder');
  fs.mkdirSync(dir, { recursive: true });
  fs.mkdirSync(dirU, { recursive: true });
  const tijden = [];
  const lijst = [];
  for (let s = 0; s < STANDEN.length; s++) {
    const RB = render(kant, s, matB);
    const RU = render(kant, s, matU);
    tijden.push(RB.ms);
    const G = S.gbuffer(RU, 2);
    const GB = S.gbuffer(RB, 2);
    const beelden = { B: spriteVan(RB, GB, PB), U: spriteVan(RU, G, PU) };
    H.bewaar(path.join(dir, `${kant}-${s}.png`), beelden.B);
    H.bewaar(path.join(dirU, `${kant}-${s}.png`), beelden.U);
    if (wielNaam === 'c') {
      beelden.D = H.lees(path.join(HS.UIT, 'D', `${kant}-${s}.png`));
      if (kant === 'ZW') beelden.X = H.lees(s === 8 ? path.join(AF.UIT, `${W.bron}-opnieuw`, 'ZW-0', 'sprite-detail.png') : path.join(AF.UIT, W.bron, `ZW-${s}`, 'sprite-detail.png'));
    }
    lijst.push({ G, beelden, nagels4: HS.nagelKoppen4(RU), nagels: new Set(RU.nagels) });
  }
  const metingen = Object.fromEntries(Object.keys(lijst[0].beelden).map((k) => [k, HS.meet(lijst, k, ij, kant)]));
  // naar zuidwest ook de maten van stand 0 (tegen het doel)
  const zw = kant === 'ZW' ? Object.fromEntries(Object.entries(lijst[0].beelden).map(([k, r]) => [k, AF.spriteMaten(r, lijst[0].G, lijst[0].nagels)])) : null;
  fs.writeFileSync(path.join(UIT, `meting-${kant}.json`), JSON.stringify({ msPerBeeld: Math.round(tijden.reduce((a, b) => a + b, 0) / tijden.length), metingen, zw }, null, 1));
  console.log(`${kant}: ${Math.round(tijden.reduce((a, b) => a + b, 0) / tijden.length)} ms per beeld; ${Object.entries(metingen).map(([k, m]) => `${k} flikkeren ${m.flikkeren.deel} (${m.flikkeren.n})`).join(', ')}`);
}

// ---------------------------------------------------------------- de platen en de metingen samen

function platen() {
  const ij = HS.leesIjk();
  const lees = (p) => K.leesPng(fs.readFileSync(p));
  const opGrond = (r) => H.alfaSnijMetGrond(r);
  const groot = (r, n) => H.snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, n);
  const van = (soort, kant, s) => {
    if (soort === 'B') return lees(path.join(UIT, 'gebakken', `${kant}-${s}.png`));
    if (soort === 'U') return lees(path.join(UIT, 'zonder', `${kant}-${s}.png`));
    if (soort === 'D') return lees(path.join(HS.UIT, 'D', `${kant}-${s}.png`));
    return lees(path.join(AF.UIT, WIELEN.c.bron, `ZW-${s}`, 'sprite-detail.png'));
  };
  const uVan = {};
  const uitsnede = (kant) => uVan[kant] || (uVan[kant] = H.uitsnede([0, 1, 2, 3, 4, 5, 6, 7].flatMap((s) => [van('B', kant, s), van('U', kant, s), van('D', kant, s)]), 4));
  const knip = (r, kant) => H.alfaSnij(r, uitsnede(kant));
  const per = K.KANTEN.map((kant) => ({ kant, ...JSON.parse(fs.readFileSync(path.join(UIT, `meting-${kant}.json`))) }));
  const soorten = Object.keys(per[0].metingen);
  const samen = {};
  for (const k of soorten) {
    const v = per.map((p) => p.metingen[k]).filter(Boolean);
    const n = v.reduce((t, m) => t + m.flikkeren.n, 0);
    samen[k] = { flikkeren: +(v.reduce((t, m) => t + m.flikkeren.deel * m.flikkeren.n, 0) / n).toFixed(3), glimlichtWissel: +(v.reduce((t, m) => t + m.glimlichtWissel, 0) / v.length).toFixed(3), lijnWissel: +(v.reduce((t, m) => t + m.lijnWissel, 0) / v.length).toFixed(3), volleSlag: +(v.reduce((t, m) => t + m.volleSlag, 0) / v.length).toFixed(2), richtingen: v.length };
  }
  // zuidwest, stand 0, tegen het doel
  const doel = HS.doelOpMaat(ij.hoogte);
  const doelK = H.alfaSnij(doel, H.uitsnede([doel], 4));
  const doel4 = HS.doelOpMaat(ij.hoogte * 4);
  const doel4K = H.alfaSnij(doel4, H.uitsnede([doel4], 16));
  const doelOnt = HS.ontleedWiel(doel);
  const zw = per.find((p) => p.kant === 'ZW').zw;
  const toon = wielNaam === 'c' ? ['D', 'X', 'B'] : ['D', 'U', 'B'];
  const beeld = (k) => van(k, 'ZW', 0);
  const NAAM = { D: 'D van de stijlproef (wiel C)', X: 'SDXL per beeld (wiel C)', U: `${W.naam}, zonder bak`, B: `${W.naam}, SDXL gebakken` };
  const ont = {};
  for (const k of toon) {
    const o = HS.ontleedWiel(knip(beeld(k), 'ZW'));
    ont[k] = { kleur: Object.fromEntries(['hout', 'ijzer'].map((m) => [m, AF.deltaE(o.materiaal[m].gem, doelOnt.materiaal[m].gem)])), contrast: o.stijl.contrast, lijn: Math.round(o.aandeel.lijn * 100), ...(zw[k] || {}) };
  }
  E.bewaar(path.join(UIT, 'vergelijking.png'), [
    [E.met(opGrond(doel4K), 'doel: het ChatGPT-wiel'), ...toon.map((k) => E.met(groot(opGrond(knip(beeld(k), 'ZW')), 4), NAAM[k]))],
    [E.met(opGrond(doelK), 'doel'), ...toon.map((k) => E.met(opGrond(knip(beeld(k), 'ZW')), k))],
    [E.met(groot(opGrond(doelK), 3), 'doel, maal 3'), ...toon.map((k) => E.met(groot(opGrond(knip(beeld(k), 'ZW')), 3), `${NAAM[k]}, maal 3`))],
  ], `De AI op het oppervlak: ${W.naam}`, `Zuidwest, stand 0. Rij 1 op dezelfde zichtbare grootte (onze sprites van 2× maal 4), rij 2 op 1920×1080, rij 3 dat maal 3. Gebakken: de beschildering van SDXL (zuidwest en noordoost, denoise 0,65) op het oppervlak, door onze renderer opnieuw belicht; ${W.verklein === 'detail' ? 'detailbehoudend verkleind, een palet per materiaal' : 'box, 48 kleuren'}.`);
  const rijen = (wielNaam === 'c' ? ['D', 'B'] : ['U', 'B']).map((k) => K.KANTEN.map((kant) => E.met(groot(opGrond(knip(van(k, kant, 0), kant)), 2), `${k === 'B' ? 'gebakken' : k === 'U' ? 'zonder bak' : 'D'} · ${kant}`)));
  E.bewaar(path.join(UIT, 'richtingen.png'), rijen, `Acht richtingen, stand 0: ${W.naam}`, 'Maal 2. Gebakken uit zuidwest (buitenkant) en noordoost (binnenkant).');
  const frames = [0, 1, 2, 3, 4, 5, 6, 7].map((s) => H.naastElkaar(toon.map((k) => groot(opGrond(knip(van(k, 'ZW', s), 'ZW')), 3)), toon.length));
  fs.writeFileSync(path.join(UIT, 'draaien.png'), apng(frames.map((r) => ({ b: r.b, h: r.h, rgba: () => r.rgba })), { fps: 6 }));
  const tijden = per.map((p) => p.msPerBeeld);
  fs.writeFileSync(path.join(UIT, 'metingen.json'), JSON.stringify({ wiel: wielNaam, bron: W.bron, samen, perRichting: per, zuidwest: ont, doelDetail: AF.detailVan(doelK), msPerBeeld: tijden }, null, 1));
  for (const [k, m] of Object.entries(samen)) console.log(k, JSON.stringify(m));
  for (const [k, m] of Object.entries(ont)) console.log(k, 'kleur', JSON.stringify(m.kleur), 'contrast', m.contrast, 'lijn', `${m.lijn}%`, m.detail !== undefined ? `detail ${m.detail} nagels ${m.nagels.zichtbaar}/${m.nagels.koppen}` : '');
  console.log('render ms per beeld', tijden.join(' '));
  console.log(`${path.relative(process.cwd(), UIT)}: vergelijking.png, richtingen.png, draaien.png, metingen.json`);
}

async function alles() {
  bakken();
  for (const f of ['palet-B.json', 'palet-U.json']) if (fs.existsSync(path.join(UIT, f))) fs.unlinkSync(path.join(UIT, f));
  paletVan('B', materialen(leesBak()));
  paletVan('U', basis);
  await Promise.all(K.KANTEN.map((kant) => new Promise((ok, mis) => execFile(process.execPath, [__filename, '--wiel', wielNaam, 'render', kant], { maxBuffer: 1e7 }, (e, uit, fout) => {
    process.stdout.write(uit);
    if (e) return mis(new Error(fout || e.message));
    ok();
  }))));
  platen();
}

async function main() {
  const args = process.argv.slice(2).filter((a, i, l) => a !== '--wiel' && l[i - 1] !== '--wiel');
  const [wat, a1] = args;
  if (wat === 'sdxl') return sdxl();
  if (wat === 'bak') return bakken();
  if (wat === 'render') return renderKant(a1);
  if (wat === 'platen') return platen();
  if (wat === 'alles') return alles();
  console.log('node gereedschap/ai/oppervlak.cjs [--wiel c|doel] sdxl | bak | render <kant> | platen | alles');
}

module.exports = { bakken, leesBak, materialen, render, spriteVan, paletVan, groepVan, UIT, WIELEN };

if (require.main === module) main().catch((e) => {
  console.error(e.stack || e.message);
  process.exit(1);
});
