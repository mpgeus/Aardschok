'use strict';
// Het vel van een figuur wegschrijven, zoals het spel het leest (js/sprites.js) en naar-spel.cjs het kopieert: per
// houding één vel (een rij per richting, Z ZW W NW N NO O ZO, een kolom per beeld) en een <naam>.json ernaast met
// { naam, cel, anker, snelheid, richtingen, houdingen }. Elk beeld komt uit een ruime cel en wordt krap uitgesneden; de
// cel van het vel past om alle beelden van de figuur (alle houdingen samen), met een kleine marge, en het anker staat
// overal op dezelfde plek. Voor de werkfiguren (werkfiguren-anim.cjs) en de uiterlijken (uiterlijk-anim.cjs, vraag 145).
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const { apng } = require('./apng.cjs');

const RICHTINGEN = K.KANTEN; // altijd alle acht
const MARGE = 3; // lucht tussen de figuur en de rand van zijn cel, zoals in maaier-anim.cjs

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

// Eén figuur: houdingen = { <houding>: { beelden, fps } }; beeldVan(houding, i, kant) geeft { plaat, doos } in de ruime
// cel met anker o.anker. o: uit (de map), snelheid (van lopen: de pas, zodat de voeten niet glijden), proef (false: geen
// bewegende proef in ZO ernaast).
function figuurVel(naam, houdingen, beeldVan, o) {
  const t0 = Date.now();
  fs.mkdirSync(o.uit, { recursive: true });
  // alles renderen en de reik bijhouden: één cel voor alle houdingen van deze figuur
  let reik = { l: 1, r: 1, b: 1, o: 1 };
  let n = 0;
  for (const [houding, h] of Object.entries(houdingen)) {
    for (const kant of RICHTINGEN) {
      for (let i = 0; i < h.beelden; i++) {
        reik = samen(reik, reikVan(beeldVan(houding, i, kant).doos, o.anker));
        n++;
      }
    }
  }
  const CEL = [reik.l + reik.r + 2 * MARGE, reik.b + reik.o + 2 * MARGE];
  const ANKER = [reik.l + MARGE, reik.b + MARGE];
  const naarCel = (p) => {
    const c = new K.Plaat(CEL[0], CEL[1]);
    c.plak(p, ANKER[0] - o.anker[0], ANKER[1] - o.anker[1]);
    return c;
  };
  const beschrijving = { naam, cel: CEL, anker: ANKER, snelheid: o.snelheid, richtingen: RICHTINGEN, houdingen: {} };
  for (const [houding, h] of Object.entries(houdingen)) {
    const vel = new K.Plaat(CEL[0] * h.beelden, CEL[1] * RICHTINGEN.length);
    const zo = [];
    RICHTINGEN.forEach((kant, r) => {
      for (let i = 0; i < h.beelden; i++) {
        const c = naarCel(beeldVan(houding, i, kant).plaat);
        vel.plak(c, i * CEL[0], r * CEL[1]);
        if (kant === 'ZO') zo.push(c);
      }
    });
    const bestand = `${naam}-${houding}.png`;
    fs.writeFileSync(path.join(o.uit, bestand), K.png(vel, 1));
    const regel = { bestand, beelden: h.beelden, fps: h.fps, herhaal: true };
    // lopen: de pas van de boer zelf, dus dezelfde snelheid en `stap` (tegels per pas, twee passen per cyclus), zoals
    // dorpelingen-anim.cjs hem uitrekent; js/sprites.js leidt de fase uit de afgelegde afstand af, zodat de voet niet glijdt
    if (houding === 'lopen') {
      regel.snelheid = o.snelheid;
      regel.stap = +((o.snelheid * (h.beelden / h.fps)) / 2).toFixed(3);
    }
    beschrijving.houdingen[houding] = regel;
    if (o.proef !== false) fs.writeFileSync(path.join(o.uit, `${naam}-${houding}-zo.png`), apng(zo, { fps: h.fps, schaal: 2, herhaal: 0 }));
  }
  fs.writeFileSync(path.join(o.uit, `${naam}.json`), JSON.stringify(beschrijving, null, 2) + '\n');
  const lijst = Object.entries(houdingen).map(([h, x]) => `${h} ${x.beelden}@${x.fps}`).join(', ');
  console.log(`${naam}: ${n} beelden in ${((Date.now() - t0) / 1000).toFixed(0)}s, cel ${CEL.join('×')}, anker ${ANKER.join(',')} (${lijst})`);
}

module.exports = { RICHTINGEN, MARGE, doosVan, reikVan, samen, figuurVel };
