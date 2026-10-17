'use strict';
// De platte tekening van een huis, voor de zichtproef (vraag 176; ontwerp/beeld.md, "Zicht in een dicht dorp"): het huis
// zoals de huizenbouwer het tekent, maar zonder dak en met lage muren, zoals de functionele weergave van Stronghold
// (spatie). Alleen een proef: het spel en zijn tekeningen blijven zoals ze zijn, en alles staat in deze map.
//
//   node gereedschap/zichtproef/plat.cjs [namen]     bijvoorbeeld planken-hut1-spanen-z; zonder namen: die van de proef
//
// Hoe: de snede van de huizenbouwer (renderHuisPlat in gereedschap/pixelart/huizen.cjs; sinds vraag 176, stap 4a staat
// ze daar, en niet meer hier): de muren als een doorsnede, aan de kant van de camera tot de heup en achter laag, en een
// vloer en een randje in het eigen dak. In de proef had de vloer een zacht dambord; nu de rijen van het dak (Marcel, 17
// okt), dus wie dit opnieuw draait, krijgt die. Hier alleen nog in hetzelfde kader gezet als de tekening van het huis in
// tegels/huizen/ (dezelfde maat en hetzelfde anker), zodat de proef het plaatje in het spel kan verwisselen zonder dat het
// huis verschuift.
//
// Uit: plat/<naam>.png, en plat/naast-elkaar.png (de echte tekening links, de platte rechts).
const fs = require('node:fs');
const path = require('node:path');

const PX = path.join(__dirname, '..', 'pixelart');
const K = require(path.join(PX, 'kern.cjs'));
const Hz = require(path.join(PX, 'huizen.cjs'));
const WORTEL = path.join(__dirname, '..', '..');
const UIT = path.join(__dirname, 'plat');

// De tekening van het spel: maat en anker (tegels/tegels.js).
function tegelVan(naam) {
  if (!globalThis.Spel) globalThis.Spel = {};
  if (!globalThis.Spel.TEGELS) require(path.join(WORTEL, 'tegels', 'tegels.js'));
  const t = globalThis.Spel.TEGELS.huizen.tiles.find((x) => x && x.naam === naam);
  if (!t) throw new Error(`geen tekening ${naam}`);
  return t;
}

function renderPlat(naam) {
  const r = Hz.renderHuisPlat(naam);
  const t = tegelVan(naam);
  const [, , cb, ch] = t.cel;
  // allebei met de afspraak van tegels.json: het anker op de achterste voethoek, 16 pixels lager
  const [xa, ya] = [t.anker[0] - r.anker[0], t.anker[1] - r.anker[1]];
  if (xa < 0 || ya < 0 || xa + r.plaat.b > cb || ya + r.plaat.h > ch) throw new Error(`${naam}: de platte valt buiten de tekening van het huis`);
  const plaat = new K.Plaat(cb, ch);
  plaat.plak(r.plaat, xa, ya);
  return { naam, plaat, ms: r.ms };
}

// De echte en de platte naast elkaar, voor het oog.
function naastElkaar(namen) {
  const paren = namen.map((n) => [K.leesPng(fs.readFileSync(path.join(WORTEL, 'tegels', 'huizen', `${n}.png`))), K.leesPng(fs.readFileSync(path.join(UIT, `${n}.png`)))]);
  const b = paren.reduce((s, [a, p]) => s + a.b + p.b + 24, 0);
  const h = Math.max(...paren.map(([a]) => a.h));
  const rgba = Buffer.alloc(b * h * 4);
  for (let i = 0; i < b * h; i++) rgba.set([238, 230, 214, 255], i * 4);
  let x = 0;
  for (const beeld of paren.flat()) {
    for (let y = 0; y < beeld.h; y++) {
      for (let c = 0; c < beeld.b; c++) {
        const j = (y * beeld.b + c) * 4;
        if (beeld.rgba[j + 3] < 128) continue;
        beeld.rgba.copy(rgba, ((y + h - beeld.h) * b + x + c) * 4, j, j + 4);
      }
    }
    x += beeld.b + 12;
  }
  fs.writeFileSync(path.join(UIT, 'naast-elkaar.png'), K.pngVanBeeld({ b, h, rgba }));
}

module.exports = { renderPlat };

if (require.main === module) {
  const namen = process.argv.slice(2);
  if (!namen.length) namen.push(...require('./dorp.cjs').tekeningen());
  fs.mkdirSync(UIT, { recursive: true });
  for (const n of namen) {
    const r = renderPlat(n);
    fs.writeFileSync(path.join(UIT, `${n}.png`), K.png(r.plaat, 1));
    console.log(`${n}: ${r.plaat.b}×${r.plaat.h}, ${(r.ms / 1000).toFixed(1)} s`);
  }
  naastElkaar(namen);
}
