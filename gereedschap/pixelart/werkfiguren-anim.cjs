'use strict';
// Schrijft de werkfiguren (werkfiguren.cjs: de zaaier, de wieder en de sprokkelaar; werklijst vraag 111, b) weg als
// spelvellen, op dezelfde manier als maaier-anim.cjs: per houding één vel (rij per richting, Z ZW W NW N NO O ZO, kolom
// per beeld) en per figuur een <naam>.json ernaast met { naam, cel, anker, snelheid, richtingen, houdingen }, klaar voor
// naar-spel.cjs. Elk beeld wordt in een ruime cel gerenderd en daarna krap uitgesneden; de cel van het vel past om alle
// beelden van de figuur (alle houdingen samen), met een kleine marge, en het anker staat overal op dezelfde plek.
// Loopt een beeld tegen de rand van de ruime cel aan (de maaier deed dat eerst met zijn zeis, zie maaier-anim.cjs), dan
// meldt het RAND en eindigt het met een fout.
//
//   node gereedschap/pixelart/werkfiguren-anim.cjs                    alle drie, en de proefplaat
//   node gereedschap/pixelart/werkfiguren-anim.cjs zaaier wieder      alleen deze (een proefplaat alleen als alle drie meegaan)
//   node gereedschap/pixelart/werkfiguren-anim.cjs --proef            alleen de proefplaat (rendert alleen wat erop staat)
//   -> uit/<naam>/animaties/<naam>-<houding>.png       het vel
//   -> uit/<naam>/animaties/<naam>.json                naam, cel, anker, snelheid, houdingen (lopen met `stap`)
//   -> uit/<naam>/animaties/<naam>-<houding>-zo.png    bewegende proef, richting ZO, twee keer vergroot
//   -> uit/werkfiguren-proef.png                        de proefplaat, op 1×
// Daarna: node gereedschap/pixelart/naar-spel.cjs --alleen zaaier,wieder,sprokkelaar
//
// De proefplaat: vier rijen, elk in drie groepen (Z, ZO, NW) van vijf beelden: staan, lopen, en drie beelden van het
// werk. Bovenaan ter vergelijking de gewone boer (staan, lopen) en de maaier (drie beelden van het maaien), daaronder
// de zaaier, de wieder en de sprokkelaar. Staan en lopen op gras, het werk op de akker (de sprokkelaar op gras: hij raapt
// aan de bosrand).
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const W = require('./werkfiguren.cjs');
const { boer } = require('./dorpelingen.cjs');
const Ma = require('./maaier.cjs');
const { apng } = require('./apng.cjs');

const UIT = path.join(__dirname, 'uit');
fs.mkdirSync(UIT, { recursive: true });
const RUIM = { b: 260, h: 240, anker: [130, 180] }; // de ruime cel om in te renderen (de schoffel reikt ver)
const RICHTINGEN = K.KANTEN; // altijd alle acht
const MARGE = 3; // lucht tussen de figuur en de rand van zijn cel, zoals in maaier-anim.cjs
const FIGUREN = Object.keys(W.HOUDINGEN); // zaaier, wieder, sprokkelaar

const args = process.argv.slice(2);
const alleenProef = args.includes('--proef');
const GEVRAAGD = args.filter((a) => !a.startsWith('--'));
const onbekend = GEVRAAGD.filter((n) => !FIGUREN.includes(n));
if (onbekend.length) {
  console.error(`Onbekende figuur: ${onbekend.join(', ')}. Kies uit: ${FIGUREN.join(', ')}.`);
  process.exit(1);
}
const TE_RENDEREN = alleenProef ? [] : GEVRAAGD.length ? GEVRAAGD : FIGUREN;

// de krappe doos om alles wat er op de plaat staat (zoals doosVan in maaier-anim.cjs)
function doosVan(plaat) {
  let x0 = plaat.b, x1 = 0, y0 = plaat.h, y1 = 0;
  for (let y = 0; y < plaat.h; y++) {
    for (let x = 0; x < plaat.b; x++) {
      if (plaat.px[(y * plaat.b + x) * 2] < 0) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  return x1 < x0 ? { x0: 0, y0: 0, b: 1, h: 1 } : { x0, y0, b: x1 - x0 + 1, h: y1 - y0 + 1 };
}
// hoever een doos vanaf het anker reikt: links, rechts, boven, onder
const reikVan = (d, anker) => ({ l: anker[0] - d.x0, r: d.x0 + d.b - anker[0], b: anker[1] - d.y0, o: d.y0 + d.h - anker[1] });
const samen = (a, b) => ({ l: Math.max(a.l, b.l), r: Math.max(a.r, b.r), b: Math.max(a.b, b.b), o: Math.max(a.o, b.o) });

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
  const t0 = Date.now();
  const UIT_ANIM = path.join(UIT, naam, 'animaties');
  fs.mkdirSync(UIT_ANIM, { recursive: true });
  const houdingen = W.HOUDINGEN[naam];
  // alles renderen en de reik bijhouden: één cel voor alle houdingen van deze figuur
  let reik = { l: 1, r: 1, b: 1, o: 1 };
  let n = 0;
  for (const [houding, h] of Object.entries(houdingen)) {
    for (const kant of RICHTINGEN) {
      for (let i = 0; i < h.beelden; i++) {
        reik = samen(reik, reikVan(werkBeeld(naam, houding, i, kant).doos, RUIM.anker));
        n++;
      }
    }
  }
  const CEL = [reik.l + reik.r + 2 * MARGE, reik.b + reik.o + 2 * MARGE];
  const ANKER = [reik.l + MARGE, reik.b + MARGE];
  const naarCel = (p) => {
    const c = new K.Plaat(CEL[0], CEL[1]);
    c.plak(p, ANKER[0] - RUIM.anker[0], ANKER[1] - RUIM.anker[1]);
    return c;
  };
  const beschrijving = { naam, cel: CEL, anker: ANKER, snelheid: W.SNELHEID, richtingen: RICHTINGEN, houdingen: {} };
  for (const [houding, h] of Object.entries(houdingen)) {
    const vel = new K.Plaat(CEL[0] * h.beelden, CEL[1] * RICHTINGEN.length);
    const zo = [];
    RICHTINGEN.forEach((kant, r) => {
      for (let i = 0; i < h.beelden; i++) {
        const c = naarCel(werkBeeld(naam, houding, i, kant).plaat);
        vel.plak(c, i * CEL[0], r * CEL[1]);
        if (kant === 'ZO') zo.push(c);
      }
    });
    const bestand = `${naam}-${houding}.png`;
    fs.writeFileSync(path.join(UIT_ANIM, bestand), K.png(vel, 1));
    const regel = { bestand, beelden: h.beelden, fps: h.fps, herhaal: true };
    // lopen: de pas van de boer zelf, dus dezelfde snelheid en `stap` (tegels per pas, twee passen per cyclus), zoals
    // dorpelingen-anim.cjs hem uitrekent; js/sprites.js leidt de fase uit de afgelegde afstand af, zodat de voet niet glijdt
    if (houding === 'lopen') {
      regel.snelheid = W.SNELHEID;
      regel.stap = +((W.SNELHEID * (h.beelden / h.fps)) / 2).toFixed(3);
    }
    beschrijving.houdingen[houding] = regel;
    fs.writeFileSync(path.join(UIT_ANIM, `${naam}-${houding}-zo.png`), apng(zo, { fps: h.fps, schaal: 2, herhaal: 0 }));
  }
  fs.writeFileSync(path.join(UIT_ANIM, `${naam}.json`), JSON.stringify(beschrijving, null, 2) + '\n');
  const lijst = Object.entries(houdingen).map(([h, o]) => `${h} ${o.beelden}@${o.fps}`).join(', ');
  console.log(`${naam}: ${n} beelden in ${((Date.now() - t0) / 1000).toFixed(0)}s, cel ${CEL.join('×')}, anker ${ANKER.join(',')} (${lijst})`);
}

for (const naam of TE_RENDEREN) figuur(naam);

// ---------------------------------------------------------------- de proefplaat

// Per rij: wie, en per richting vijf beelden (staan, lopen, drie van het werk). De gewone boer en de maaier komen uit
// hun eigen bouwfuncties, met de cel van de rest; zo staan ze op dezelfde schaal.
const KANTEN_PROEF = ['Z', 'ZO', 'NW'];
const BOER = { houding: 'staan', fase: 0 };
const RIJEN = [
  {
    werkGrond: 'aarde',
    beelden: (kant) => [
      beeld('boer', () => boer(BOER), kant, 'staan 0'),
      beeld('boer', () => boer({ houding: 'lopen', fase: 2 / 8 }), kant, 'lopen 2'),
      ...[1, 4, 8].map((i) => beeld('maaier', () => Ma.maaier(i / Ma.MAAIER_BEELDEN), kant, `maaien ${i}`)),
    ],
  },
  { naam: 'zaaier', werk: 'zaaien', fasen: [0, 5, 7], werkGrond: 'aarde' },
  { naam: 'wieder', werk: 'wieden', fasen: [0, 3, 7], werkGrond: 'aarde' },
  { naam: 'sprokkelaar', werk: 'rapen', fasen: [5, 9, 12], werkGrond: 'gras' },
];
function proefplaat() {
  const t0 = Date.now();
  const RAND = 3; // rond elk beeld
  const GAT = 4; // tussen twee beelden
  const GROEPGAT = 14; // tussen twee richtingen
  const RIJGAT = 6;
  // per rij en richting: de vijf beelden, en welke grond eronder komt
  const rijen = RIJEN.map((rij) =>
    KANTEN_PROEF.map((kant) =>
      rij.beelden
        ? rij.beelden(kant).map((b, i) => ({ ...b, grond: i < 2 ? 'gras' : rij.werkGrond }))
        : [
            { ...werkBeeld(rij.naam, 'staan', 0, kant), grond: 'gras' },
            { ...werkBeeld(rij.naam, 'lopen', 2, kant), grond: 'gras' },
            ...rij.fasen.map((i) => ({ ...werkBeeld(rij.naam, rij.werk, i, kant), grond: rij.werkGrond })),
          ],
    ),
  );
  // de hoogte per rij (alles op één voetlijn), de breedte per vak (de drie werkbeelden van een richting delen één breedte)
  const maten = rijen.map((groepen) => {
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
      const werk = vak(g.slice(2));
      return [vak([g[0]]), vak([g[1]]), werk, werk, werk];
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
  fs.writeFileSync(path.join(UIT, 'werkfiguren-proef.png'), K.png(plaat, 1, '#20261a'));
  console.log(`werkfiguren-proef.png: ${B}×${H} op 1×, in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
if (alleenProef || FIGUREN.every((n) => TE_RENDEREN.includes(n))) proefplaat();

if (klem) process.exitCode = 1;
