'use strict';
// Schrijft de werkfiguren (werkfiguren.cjs: de zaaier, de wieder, de sprokkelaar en de hakker, en hun vrouwen de
// zaaister, de wiedster, de sprokkelaarster en de hakster, en de maaister; werklijst vraag 111, b, en de hakker met zijn
// bijl, vraag 107, f; en voor de oogst de plukker, de binder, de drager en de dorser met hun vrouwen de plukster, de
// binster, de draagster en de dorster, vraag 136 en 140) weg als spelvellen, op dezelfde manier als
// maaier-anim.cjs: per houding één vel (rij per richting, Z ZW W NW N NO O ZO, kolom per beeld) en per figuur een
// <naam>.json ernaast met { naam, cel, anker, snelheid, richtingen, houdingen }, klaar voor naar-spel.cjs. Elk beeld
// wordt in een ruime cel gerenderd en daarna krap uitgesneden; de cel van het vel past om alle beelden van de figuur
// (alle houdingen samen), met een kleine marge, en het anker staat overal op dezelfde plek. Loopt een beeld tegen de
// rand van de ruime cel aan (de maaier deed dat eerst met zijn zeis, zie maaier-anim.cjs), dan meldt het RAND en
// eindigt het met een fout. Een figuur zonder lopen (de maaister) krijgt geen snelheid, zoals maaier.json.
//
//   node gereedschap/pixelart/werkfiguren-anim.cjs                    alle zeventien, en de proefplaat
//   node gereedschap/pixelart/werkfiguren-anim.cjs --oogst            alleen de acht van de oogst, en hun eigen proefplaat
//   node gereedschap/pixelart/werkfiguren-anim.cjs --oogstproef       alleen die proefplaat (uit/werkfiguren-oogst-proef.png)
//   node gereedschap/pixelart/werkfiguren-anim.cjs zaaier zaaister    alleen deze (een proefplaat alleen als alle meegaan)
//   node gereedschap/pixelart/werkfiguren-anim.cjs --proef            alleen de proefplaat (rendert alleen wat erop staat)
//   -> uit/<naam>/animaties/<naam>-<houding>.png       het vel
//   -> uit/<naam>/animaties/<naam>.json                naam, cel, anker, snelheid, houdingen (lopen met `stap`)
//   -> uit/<naam>/animaties/<naam>-<houding>-zo.png    bewegende proef, richting ZO, twee keer vergroot
//   -> uit/werkfiguren-proef.png                        de proefplaat, op 1×
// Daarna: node gereedschap/pixelart/naar-spel.cjs --alleen zaaier,wieder,sprokkelaar,hakker,zaaister,wiedster,sprokkelaarster,maaister,hakster
//   en voor de oogst: --alleen plukker,plukster,binder,binster,drager,draagster,dorser,dorster
// Een figuur per proces tegelijk gaat het snelst (de sprokkelaar en de sprokkelaarster duren het langst).
//
// De proefplaat: per rij drie groepen (Z, ZO, NW). Bovenaan ter vergelijking de gewone boer en boerin (staan, lopen),
// dan per werk een rij voor de man en een voor de vrouw: de maaier en de maaister (drie beelden van het maaien), en de
// zaaier, de wieder, de sprokkelaar en de hakker met hun vrouw (staan, lopen, en drie beelden van het werk). Staan en
// lopen op gras, het werk op de akker (het sprokkelen en het hakken op gras: dat is aan de bosrand).
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const W = require('./werkfiguren.cjs');
const { boer } = require('./dorpelingen.cjs');
const { boerin } = require('./dorpelingen2.cjs');
const Ma = require('./maaier.cjs');

const UIT = path.join(__dirname, 'uit');
fs.mkdirSync(UIT, { recursive: true });
const RUIM = { b: 260, h: 240, anker: [130, 180] }; // de ruime cel om in te renderen (de schoffel reikt ver)
const FIGUREN = Object.keys(W.HOUDINGEN); // zaaier, wieder, sprokkelaar, hakker, de oogstfiguren, en al hun vrouwen
const OOGST = ['plukker', 'plukster', 'binder', 'binster', 'drager', 'draagster', 'dorser', 'dorster'];

const args = process.argv.slice(2);
const alleenProef = args.includes('--proef');
const oogst = args.includes('--oogst');
const oogstProef = args.includes('--oogstproef');
const GEVRAAGD = args.filter((a) => !a.startsWith('--'));
const onbekend = GEVRAAGD.filter((n) => !FIGUREN.includes(n));
if (onbekend.length) {
  console.error(`Onbekende figuur: ${onbekend.join(', ')}. Kies uit: ${FIGUREN.join(', ')}.`);
  process.exit(1);
}
const TE_RENDEREN = alleenProef || oogstProef ? [] : GEVRAAGD.length ? GEVRAAGD : oogst ? OOGST : FIGUREN;

const { doosVan, figuurVel } = require('./figuurvel.cjs');

// Eén beeld in de ruime cel. Wat al gerenderd is, wordt onthouden (de proefplaat gebruikt dezelfde beelden).
const gerenderd = new Map();
let klem = false;
function beeld(naam, maak, kant, sleutel) {
  const k = `${naam}|${sleutel}|${kant}`;
  if (gerenderd.has(k)) return gerenderd.get(k);
  const p = K.losRenderen(maak(), { b: RUIM.b, h: RUIM.h, anker: RUIM.anker, richting: kant });
  const d = doosVan(p);
  if (d.x0 <= 0 || d.y0 <= 0 || d.x0 + d.b >= RUIM.b - 1 || d.y0 + d.h >= RUIM.h - 1) {
    console.log(`  RAND ${naam} ${sleutel} ${kant}: ${d.x0}..${d.x0 + d.b - 1}, ${d.y0}..${d.y0 + d.h - 1} in ${RUIM.b}×${RUIM.h}`);
    klem = true;
  }
  const uit = { plaat: p, doos: d };
  gerenderd.set(k, uit);
  return uit;
}
const werkBeeld = (naam, houding, i, kant) => {
  const n = W.HOUDINGEN[naam][houding].beelden;
  return beeld(naam, () => W[naam]({ houding, fase: i / n }), kant, `${houding} ${i}`);
};

// ---------------------------------------------------------------- de vellen

function figuur(naam) {
  const houdingen = W.HOUDINGEN[naam];
  const snelheid = houdingen.lopen ? W.snelheidVan(naam) : undefined; // de pas van de boer of de boerin zelf
  figuurVel(naam, houdingen, (houding, i, kant) => werkBeeld(naam, houding, i, kant), { uit: path.join(UIT, naam, 'animaties'), snelheid, anker: RUIM.anker });
}

for (const naam of TE_RENDEREN) figuur(naam);

// ---------------------------------------------------------------- de proefplaat

// Per rij en per richting de beelden, met hun grond, en welke beelden samen één breedte delen (vakken: hoeveel beelden
// per vak, van links naar rechts; de werkbeelden van een richting delen er één, zodat je ziet hoe ver het werk reikt).
// De gewone boer en boerin en de maaier komen uit hun eigen bouwfuncties; zo staan ze op dezelfde schaal.
const KANTEN_PROEF = ['Z', 'ZO', 'NW'];
const MAAIEN = [1, 4, 8];
const gewoneBoer = (wie, maak) => (kant) => [
  { ...beeld(wie, () => maak({ houding: 'staan', fase: 0 }), kant, 'staan 0'), grond: 'gras' },
  { ...beeld(wie, () => maak({ houding: 'lopen', fase: 2 / 8 }), kant, 'lopen 2'), grond: 'gras' },
];
const werkRij = (naam, werk, fasen, grond) => (kant) => [
  { ...werkBeeld(naam, 'staan', 0, kant), grond: 'gras' },
  { ...werkBeeld(naam, 'lopen', 2, kant), grond: 'gras' },
  ...fasen.map((i) => ({ ...werkBeeld(naam, werk, i, kant), grond })),
];
const RIJEN = [
  { beelden: (kant) => [...gewoneBoer('boer', boer)(kant), ...gewoneBoer('boerin', boerin)(kant)], vakken: [1, 1, 1, 1] },
  { beelden: (kant) => MAAIEN.map((i) => ({ ...beeld('maaier', () => Ma.maaier(i / Ma.MAAIER_BEELDEN), kant, `maaien ${i}`), grond: 'aarde' })), vakken: [3] },
  { beelden: (kant) => MAAIEN.map((i) => ({ ...werkBeeld('maaister', 'maaien', i, kant), grond: 'aarde' })), vakken: [3] },
  { beelden: werkRij('zaaier', 'zaaien', [0, 5, 7], 'aarde'), vakken: [1, 1, 3] },
  { beelden: werkRij('zaaister', 'zaaien', [0, 5, 7], 'aarde'), vakken: [1, 1, 3] },
  { beelden: werkRij('wieder', 'wieden', [0, 3, 7], 'aarde'), vakken: [1, 1, 3] },
  { beelden: werkRij('wiedster', 'wieden', [0, 3, 7], 'aarde'), vakken: [1, 1, 3] },
  { beelden: werkRij('sprokkelaar', 'rapen', [5, 9, 12], 'gras'), vakken: [1, 1, 3] },
  { beelden: werkRij('sprokkelaarster', 'rapen', [5, 9, 12], 'gras'), vakken: [1, 1, 3] },
  { beelden: werkRij('hakker', 'hakken', [0, 3, 4], 'gras'), vakken: [1, 1, 3] },
  { beelden: werkRij('hakster', 'hakken', [0, 3, 4], 'gras'), vakken: [1, 1, 3] },
];
function proefplaat(RIJEN, KANTEN_PROEF, bestand = 'werkfiguren-proef.png') {
  const t0 = Date.now();
  const RAND = 3; // rond elk beeld
  const GAT = 4; // tussen twee beelden
  const GROEPGAT = 14; // tussen twee richtingen
  const RIJGAT = 6;
  // per rij en richting de beelden met hun grond
  const rijen = RIJEN.map((rij) => KANTEN_PROEF.map((kant) => rij.beelden(kant)));
  // de hoogte per rij (alles op één voetlijn), de breedte per vak
  const maten = rijen.map((groepen, r) => {
    let y0 = Infinity, y1 = -Infinity;
    for (const g of groepen) for (const b of g) {
      y0 = Math.min(y0, b.doos.y0);
      y1 = Math.max(y1, b.doos.y0 + b.doos.h);
    }
    const vakken = groepen.map((g) => {
      const vak = (lijst) => {
        const x0 = Math.min(...lijst.map((b) => b.doos.x0));
        const x1 = Math.max(...lijst.map((b) => b.doos.x0 + b.doos.b));
        return { x0: x0 - RAND, b: x1 - x0 + 2 * RAND };
      };
      const uit = [];
      let i = 0;
      for (const n of RIJEN[r].vakken) {
        const v = vak(g.slice(i, i + n));
        for (let k = 0; k < n; k++) uit.push(v);
        i += n;
      }
      return uit;
    });
    const breed = vakken.reduce((s, v) => s + v.reduce((t, x) => t + x.b, 0) + GAT * (v.length - 1), 0) + GROEPGAT * (vakken.length - 1);
    return { y0: y0 - RAND, h: y1 - y0 + 2 * RAND, vakken, breed };
  });
  const B = Math.max(...maten.map((m) => m.breed));
  const H = maten.reduce((s, m) => s + m.h, 0) + RIJGAT * (maten.length - 1);
  const plaat = new K.Plaat(B, H);
  const GROND = { gras: ['gras', 4], aarde: ['aarde', 3] };
  let y = 0;
  rijen.forEach((groepen, r) => {
    const m = maten[r];
    let x = 0;
    groepen.forEach((g, gi) => {
      g.forEach((b, i) => {
        const vak = m.vakken[gi][i];
        const [ramp, stap] = GROND[b.grond];
        for (let j = 0; j < m.h; j++) for (let k = 0; k < vak.b; k++) plaat.zet(x + k, y + j, ramp, stap);
        plaat.plak(b.plaat.uitsnede(vak.x0, m.y0, vak.b, m.h), x, y);
        x += vak.b + GAT;
      });
      x += GROEPGAT - GAT;
    });
    y += m.h + RIJGAT;
  });
  fs.writeFileSync(path.join(UIT, bestand), K.png(plaat, 1, '#20261a'));
  console.log(`${bestand}: ${B}×${H} op 1×, in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
// De proefplaat van de oogst: een rij per werk, en per rij vier groepen: de man van schuin voren en van achteren, en zijn
// vrouw van voren en van schuin voren. Per groep staan, lopen en twee beelden van het werk (de drager heeft er twee van
// het lopen: hij werkt alleen door te lopen).
const KANTEN_OOGST = ['m:ZO', 'm:NW', 'v:Z', 'v:ZO'];
const oogstRij = (man, vrouw, werk, fasen, grond) => ({
  beelden: (sleutel) => {
    const [wie, kant] = sleutel.split(':');
    return werkRij(wie === 'm' ? man : vrouw, werk, fasen, grond)(kant);
  },
  vakken: [1, 1, 2],
});
const RIJEN_OOGST = [
  oogstRij('plukker', 'plukster', 'plukken', [4, 9], 'gras'),
  oogstRij('binder', 'binster', 'binden', [2, 6], 'aarde'),
  oogstRij('drager', 'draagster', 'lopen', [5, 7], 'gras'),
  oogstRij('dorser', 'dorster', 'dorsen', [4, 6], 'aarde'),
];
if (alleenProef || FIGUREN.every((n) => TE_RENDEREN.includes(n))) proefplaat(RIJEN, KANTEN_PROEF);
if (oogst || oogstProef || OOGST.every((n) => TE_RENDEREN.includes(n))) proefplaat(RIJEN_OOGST, KANTEN_OOGST, 'werkfiguren-oogst-proef.png');

if (klem) process.exitCode = 1;
