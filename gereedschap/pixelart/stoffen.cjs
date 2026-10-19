// De stoffen in code: vacht, jute en schors als textuur, voor een materiaal dat nu één vlakke kleur heeft (werklijst vraag
// 180; Marcel, 19 okt: "Beginnen we met stap 1", een rijker begin voor de eigen pijplijn: gereedschap/ai/ai-afwerking.md).
// SDXL neemt bij het overschilderen grotendeels het detail van onze render over: een gladde os kwam glad terug. Met een
// vacht, het weefsel van een zak en de groeven van schors in onze eigen render heeft SDXL iets om op voort te schilderen.
// Uit ruis (kern.cjs ruis3), op de plek in rust, dus het zit vast aan het oppervlak en beweegt mee.
//
//   STOFFEN[naam](kleur)      een textuur (x, y, z, nx, ny, nz, deel) → [r, g, b] rond kleur [r, g, b], voor een materiaal
//                             met die naam (de namen van huisstijl.cjs: lijf, kop, poot, staart, oor, zak, schors)
//   verrijk(mat, namen, kleurVan)   de materialen van een model, met een stof waar die er is en het materiaal geen
//                                   textuur heeft
'use strict';
const K = require('./kern.cjs');

const klem = (v) => Math.max(0, Math.min(255, v));
const maal = (kleur, f, warm = 0) => [klem(kleur[0] * f + warm * 10), klem(kleur[1] * f), klem(kleur[2] * f - warm * 10)];

// Vacht: haren in de looprichting (langs het lijf, y; op een poot omlaag, z), fijne korrel, en grote vlekken iets donkerder
// of warmer. De poten zijn deel 3 tot 6 van de koe (vee.cjs koe).
function vacht(kleur) {
  return (x, y, z, nx, ny, nz, deel) => {
    const poot = deel && deel.deel >= 3 && deel.deel <= 6;
    const [a, b, c] = poot ? [x * 1.8, z * 0.35, y * 1.8] : [x * 1.8, y * 0.35, z * 1.8];
    const haar = K.ruis3(a, b, c, 11);
    const korrel = K.ruis3(x * 5, y * 5, z * 5, 12);
    const vlek = K.ruis3(x * 0.12, y * 0.12, z * 0.12, 13);
    return maal(kleur, 0.8 + 0.22 * haar + 0.1 * korrel - 0.08 * vlek, vlek - 0.5);
  };
}
// Jute: een grof weefsel (kruislings) en plooien.
function jute(kleur) {
  return (x, y, z) => {
    const draad = Math.abs(Math.sin(x * 4.5 + z * 0.7)) * Math.abs(Math.sin(y * 4.5 - z * 0.7));
    const korrel = K.ruis3(x * 3.5, y * 3.5, z * 3.5, 21);
    const plooi = K.ruis3(x * 0.45, y * 0.45, z * 0.45, 22);
    return maal(kleur, 0.78 + 0.16 * draad + 0.12 * korrel + 0.18 * (plooi - 0.5));
  };
}
// Schors: diepe groeven in de lengte van de stam (een stam ligt langs y, ossenkar.cjs stam), en ruwe plekken.
function schors(kleur) {
  return (x, y, z) => {
    const groef = K.ruis3(x * 2.2, y * 0.22, z * 2.2, 31);
    const ruw = K.ruis3(x * 4, y * 1.2, z * 4, 32);
    return maal(kleur, groef < 0.38 ? 0.55 : 0.85 + 0.2 * ruw);
  };
}

const STOFFEN = { lijf: vacht, kop: vacht, poot: vacht, staart: vacht, oor: vacht, zak: jute, schors };

function verrijk(mat, namen, kleurVan) {
  return mat.map((m, i) => (m && !m.textuur && STOFFEN[namen[i]] ? { ...m, textuur: STOFFEN[namen[i]](kleurVan(m)) } : m));
}

module.exports = { STOFFEN, verrijk, vacht, jute, schors };
