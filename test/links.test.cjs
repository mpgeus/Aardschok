// Wijst elke link in het gereedschap naar een bestand dat bestaat?
//
// Dit bestaat omdat er op 22 sep een link naar een map ging ("gereedschap/") in plaats van naar
// een bestand. Dat werkte hier, want de server was net geleerd om bij een map zijn index.html te
// pakken — maar bij Marcel draaide `npm start` nog van daarvóór, en dus kreeg hij "Niet
// gevonden". Een link naar een bestand werkt altijd: met elke server, en ook als je de bladzijde
// los opent.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const WORTEL = path.join(__dirname, '..');
const BLADEN = ['index.html', 'gereedschap/index.html', 'gereedschap/wereld.html',
  'gereedschap/gesprekken.html', 'gereedschap/quests.html'];

// Waar staat deze bladzijde "ten opzichte van"? Een <base href="..."> verzet dat (wereld.html
// doet dat, zodat js/sprites.js zijn vellen vindt), en dan slaan alle relatieve links daarop.
function basisVan(blad, tekst) {
  const m = tekst.match(/<base\s+href="([^"]+)"/i);
  const map = path.dirname(blad);
  return m ? path.normalize(path.join(map, m[1])) : map;
}

test('elke link in het spel en het gereedschap wijst naar een bestand dat bestaat', () => {
  for (const blad of BLADEN) {
    const tekst = fs.readFileSync(path.join(WORTEL, blad), 'utf8');
    const basis = basisVan(blad, tekst);
    for (const m of tekst.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)) {
      const doel = m[1];
      if (/^(https?:|mailto:|#)/.test(doel)) continue;
      const pad = path.normalize(path.join(WORTEL, basis, doel.split(/[?#]/)[0]));
      assert.ok(fs.existsSync(pad), `${blad}: href="${doel}" wijst naar ${path.relative(WORTEL, pad)}, en dat bestaat niet`);
      assert.ok(
        fs.statSync(pad).isFile(),
        `${blad}: href="${doel}" wijst naar een map. Wijs naar het bestand (index.html), want een map opvragen werkt alleen met een server die daar zelf een index bij zoekt`,
      );
    }
  }
});

test('en elk script en elke stijl die die bladzijden laden, staat er ook', () => {
  for (const blad of BLADEN) {
    const tekst = fs.readFileSync(path.join(WORTEL, blad), 'utf8');
    const basis = basisVan(blad, tekst);
    const bronnen = [...tekst.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/gi), ...tekst.matchAll(/<link\b[^>]*\bhref="([^"]+)"/gi)];
    for (const m of bronnen) {
      if (/^https?:/.test(m[1])) continue;
      const pad = path.normalize(path.join(WORTEL, basis, m[1]));
      assert.ok(fs.existsSync(pad), `${blad}: "${m[1]}" wijst naar ${path.relative(WORTEL, pad)}, en dat bestaat niet`);
    }
  }
});
