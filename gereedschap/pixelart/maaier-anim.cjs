'use strict';
// Schrijft de maaislag van de maaier weg als spelvel, in dezelfde vorm als de andere figuren
// (zie dorpelingen-anim.cjs): één vel per houding (rij per richting, kolom per beeld) en een
// <naam>.json ernaast met { naam, cel, anker, richtingen, houdingen }, klaar voor naar-spel.cjs
// om naar beelden/figuren/ te kopiëren (dat gebeurt hier niet — dat is aan een andere stap).
//
// Het model en de houding komen uit maaier.cjs (maaier(fase), MAAIER_BEELDEN, MAAIER_FPS); het
// renderwerk zelf is precies sectie 2 van maaier-proef.cjs (dezelfde ruime cel, dezelfde acht
// richtingen), maar hier wordt elk beeld meteen krap bijgesneden in plaats van in de ruime,
// ongesneden proefcel te blijven staan — dat scheelt flink in bestandsgrootte, en beelden/ gaat
// mee in git. De aanpak (doosVan/reikVan/samen) is dezelfde als animaties-export.cjs gebruikt
// voor de andere figuren; celVoor() daar kiest tussen een gedeelde standaardcel en een grotere,
// maar zo'n standaardcel is er voor de maaier niet (hij is het enige figuur van zijn soort), dus
// hieronder wordt de cel rechtstreeks om alle 8×12 beelden heen gepast, met een kleine marge.
//
// Raakt maaier.cjs, maaier-proef.cjs, graan.cjs en naar-spel.cjs niet aan.
//
//   node gereedschap/pixelart/maaier-anim.cjs
//   -> gereedschap/pixelart/uit/maaier/animaties/maaier-maaien.png     het vel
//   -> gereedschap/pixelart/uit/maaier/animaties/maaier.json           naam, cel, anker, houdingen
//   -> gereedschap/pixelart/uit/maaier/animaties/maaier-maaien-zo.png  bewegende proef, richting ZO
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const Ma = require('./maaier.cjs');
const { apng } = require('./apng.cjs');

const UIT = path.join(__dirname, 'uit', 'maaier', 'animaties');
fs.mkdirSync(UIT, { recursive: true });

// Ruime, ongesneden cel om in te renderen. Begon op de maat van maaier-proef.cjs sectie 2
// (280×230, anker [140,195]), maar daar liep de snijslag (richting Z/ZO, lage fase: het blad
// laag bij de grond) tegen de onderrand aan en werd dus echt afgesneden — dat proefscript
// controleert dat zelf niet. Hier 60px meer ruimte onder het anker (h 230->290, anker gelijk),
// pas na het renderen wordt elk beeld krap uitgesneden; zie CEL/ANKER verderop voor de
// uiteindelijke, veel kleinere maat.
const RUIM = { b: 280, h: 290, anker: [140, 195] };
const RICHTINGEN = K.KANTEN; // ['Z','ZW','W','NW','N','NO','O','ZO'] — altijd alle acht
const MARGE = 3; // lucht tussen de figuur en de rand van zijn cel, zoals celVoor() in animaties-export.cjs

// de krappe doos om alles wat er op de plaat staat (zelfde idee als doosVan in animaties-export.cjs)
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

console.log('Maaier — spelvel (' + new Date().toISOString() + ')');
const t0 = Date.now();

// alle 8 richtingen × 12 beelden renderen in de ruime cel, meteen krap uitsnijden, en de reik tot
// nu toe bijhouden zodat er straks één cel voor alle beelden gekozen kan worden. Meteen ook
// controleren of een beeld al tegen de rand van de ruime cel aankwam (RUIM is zelf al fors, dus
// dat zou op een echte afknijping wijzen) — zelfde controle als dorpelingen-anim.cjs/
// bosvijanden-anim.cjs met hun "RAND"-melding doen.
let reik = { l: 1, r: 1, b: 1, o: 1 };
let klem = false;
const stukkenPerKant = {}; // richting -> [{ plaat, dx, dy }], dx/dy = uitsnede t.o.v. RUIM.anker
for (const kant of RICHTINGEN) {
  const stukken = [];
  for (let i = 0; i < Ma.MAAIER_BEELDEN; i++) {
    const fase = i / Ma.MAAIER_BEELDEN;
    const p = K.losRenderen(Ma.maaier(fase), { b: RUIM.b, h: RUIM.h, anker: RUIM.anker, richting: kant });
    const d = doosVan(p);
    if (d.x0 <= 0 || d.y0 <= 0 || d.x0 + d.b >= RUIM.b - 1 || d.y0 + d.h >= RUIM.h - 1) {
      console.log(`  RAND maaier maaien beeld ${i} ${kant}: ${d.x0}..${d.x0 + d.b - 1}, ${d.y0}..${d.y0 + d.h - 1} in ${RUIM.b}×${RUIM.h}`);
      klem = true;
    }
    reik = samen(reik, reikVan(d, RUIM.anker));
    stukken.push({ plaat: p.uitsnede(d.x0, d.y0, d.b, d.h), dx: d.x0 - RUIM.anker[0], dy: d.y0 - RUIM.anker[1] });
  }
  stukkenPerKant[kant] = stukken;
}
const renderDuur = (Date.now() - t0) / 1000;
console.log(`  (${RICHTINGEN.length} richtingen × ${Ma.MAAIER_BEELDEN} beelden gerenderd in ${renderDuur.toFixed(1)}s)`);

// één gedeelde cel voor alle beelden, met het anker op dezelfde relatieve plek overal
const CEL = [reik.l + reik.r + 2 * MARGE, reik.b + reik.o + 2 * MARGE];
const ANKER = [reik.l + MARGE, reik.b + MARGE];

// elk stukje op zijn plek in een cel van die gedeelde maat
function naarCel(s) {
  const p = new K.Plaat(CEL[0], CEL[1]);
  p.plak(s.plaat, ANKER[0] + s.dx, ANKER[1] + s.dy);
  return p;
}
const cellenPerKant = {};
for (const kant of RICHTINGEN) cellenPerKant[kant] = stukkenPerKant[kant].map(naarCel);

// het vel: rij per richting (volgorde K.KANTEN), kolom per beeld
const vel = new K.Plaat(CEL[0] * Ma.MAAIER_BEELDEN, CEL[1] * RICHTINGEN.length);
RICHTINGEN.forEach((kant, r) => {
  cellenPerKant[kant].forEach((p, i) => vel.plak(p, i * CEL[0], r * CEL[1]));
});
const velBuf = K.png(vel, 1);
fs.writeFileSync(path.join(UIT, 'maaier-maaien.png'), velBuf);
console.log(`  maaier-maaien.png: ${vel.b}×${vel.h} (cel ${CEL[0]}×${CEL[1]}, anker ${ANKER.join(',')}), ${(velBuf.length / 1024).toFixed(0)} kB`);

// de json ernaast — geen "snelheid": deze houding is geen loopbeweging, dat veld is hier niet van
// toepassing (zie regel.snelheid/stap bij "lopen" in dorpelingen-anim.cjs).
const beschrijving = {
  naam: 'maaier',
  cel: CEL,
  anker: ANKER,
  richtingen: RICHTINGEN,
  houdingen: {
    maaien: { bestand: 'maaier-maaien.png', beelden: Ma.MAAIER_BEELDEN, fps: Ma.MAAIER_FPS, herhaal: true },
  },
};
fs.writeFileSync(path.join(UIT, 'maaier.json'), JSON.stringify(beschrijving, null, 2) + '\n');
console.log('  maaier.json geschreven');

// ter controle: een bewegende PNG van de maaislag, richting ZO (herhalend, dus vaste duur per
// beeld op MAAIER_FPS — geen laatste-beeld-langer-truc nodig zoals bij een eenmalige houding)
const apngBuf = apng(cellenPerKant.ZO, { fps: Ma.MAAIER_FPS, schaal: 2, herhaal: 0 });
fs.writeFileSync(path.join(UIT, 'maaier-maaien-zo.png'), apngBuf);
console.log(`  maaier-maaien-zo.png: ${(apngBuf.length / 1024).toFixed(0)} kB`);

console.log(`klaar in ${((Date.now() - t0) / 1000).toFixed(1)}s, in ${UIT}`);
if (klem) process.exitCode = 1;
