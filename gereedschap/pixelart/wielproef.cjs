// De proef met één wagenwiel (werklijst vraag 180; Marcels derde opdracht in gereedschap/ai/opdracht-comfyui.md): kan onze
// eigen renderer AI-texturen dragen, zo dat ze in elke kijkrichting en elke stand van het wiel aan het oppervlak
// vastzitten? Het rechterwiel van de ossenkar (`O.wiel`), in vier varianten:
//
//   oud      zoals het nu is: het wiel gebouwd op zijn hoek, het hout procedureel (ruis in de ruimte van de kar);
//   nieuw    de AI-texturen (texturen/hout.png en ijzer.png, uit gereedschap/ai/textuur-ai.cjs), het wiel in rust gebouwd
//            en gedraaid met houding.cjs, zodat elk punt zijn plek in rust houdt (`terug`); de afwikkeling per onderdeel
//            staat op het wiel zelf (`uv`), de dichtheid en de belichting in het materiaal (textuur.cjs);
//   ruit     als nieuw, met een controletextuur van gekleurde vakjes: zo zie je vastzitten, uitrekken en naden;
//   zonderMip als nieuw, zonder mip-niveaus: wat er zonder filtering gebeurt (kartelen, flikkeren);
//   glijdend dezelfde AI-texturen, maar het wiel gebouwd zoals het oude (op zijn hoek, zonder rusthouding): de tegenproef,
//            zelfde textuur en zelfde contrast, alleen zit hij niet vast.
//
// Acht richtingen, en negen standen: de acht beelden van het lopen (een kwartslag per rondje, 11,25 graden per beeld) en
// een volle slag (moet gelijk zijn aan stand 0). Op de maat van het spel (één pixel per eenheid), en voor het oog vergroot.
// Metingen: hoe vast een plek op het oppervlak zijn kleur houdt als het wiel draait (op de zijvlakken, waar het licht bij
// het draaien gelijk blijft), of een volle slag hetzelfde beeld geeft, of het silhouet gelijk is aan dat van het oude wiel,
// en hoeveel er tussen twee standen verspringt.
//
//   node gereedschap/pixelart/wielproef.cjs        alles naar uit/wielproef/
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const O = require('./ossenkar.cjs');
const TX = require('./textuur.cjs');
const { model } = require('./figuren.cjs');
const { beweging, beweegDelen } = require('./houding.cjs');
const { apng } = require('./apng.cjs');
const E = require('../ai/etiket.cjs');

const UIT = path.join(__dirname, 'uit', 'wielproef');
const ZIJ = 1; // het rechterwiel
const C = [ZIJ * O.WIEL.x, 0, O.WIEL.r]; // zijn as
const STANDEN = [0, 1, 2, 3, 4, 5, 6, 7].map((f) => ({ naam: `stand ${f}`, hoek: O.WIEL.draai * (f / 8) })).concat([{ naam: 'volle slag', hoek: 2 * Math.PI }]);
const CEL = [150, 130, 75, 100]; // b, h, OX, OY

const HOUT = TX.laad(path.join(__dirname, 'texturen', 'hout.png'));
const IJZER = TX.laad(path.join(__dirname, 'texturen', 'ijzer.png'));
// De controletextuur: vakjes van 32 texels, de tint verloopt langs u (de nerf), licht en donker wisselen; dunne lijnen.
const RUIT = TX.maak(256, 256, (x, y) => {
  const cu = Math.floor(x / 32), cv = Math.floor(y / 32);
  const h = (cu / 8) * 6;
  const k = [Math.max(0, 1 - Math.abs(h - 0) % 6 * 0.5), Math.max(0, 1 - Math.abs(h - 2)), Math.max(0, 1 - Math.abs(h - 4))].map((v) => 60 + v * 170);
  const licht = (cu + cv) % 2 ? 1 : 0.55;
  const lijn = x % 32 < 2 || y % 32 < 2 ? 0.25 : 1;
  return k.map((v) => v * licht * lijn);
});

function materialen(variant) {
  const mat = O.materialen(0);
  if (variant === 'oud') return mat;
  const hout = variant === 'ruit' ? RUIT : HOUT;
  const ijzer = variant === 'ruit' ? RUIT : IJZER;
  const mip = variant !== 'zonderMip';
  // De toon: het hout naar het warme bruin van de ossenkar en de ChatGPT-sprite, het ijzer naar koel donkergrijs.
  const toon = variant === 'ruit' ? {} : { hout: [150, 92, 54], ijzer: [92, 98, 112] };
  mat[O.M.wiel] = TX.textuurMateriaal({ textuur: hout, toon: toon.hout, ramp: 'hout', schaal: 4, lo: 1.0, hi: 5.0, mip });
  mat[O.M.ijzer] = TX.textuurMateriaal({ textuur: ijzer, toon: toon.ijzer, ramp: 'ijzer', schaal: 4, lo: 0.6, hi: 3.6, glans: 1.2, mip });
  return mat;
}

// Het wiel als model. Oud: zoals de kar hem bouwt (de spaken op hun hoek). Nieuw: in rust gebouwd, en gedraaid met
// houding.cjs om zijn as (dezelfde draairichting als het oude wiel: de spaken staan op dezelfde plek).
function wielModel(variant, hoek) {
  const delen = variant === 'oud' || variant === 'glijdend' ? O.wiel(ZIJ, hoek) : beweegDelen(O.wiel(ZIJ, 0), beweging({ as: [1, 0, 0], graden: (-hoek * 180) / Math.PI, om: C }));
  return model(delen, materialen(variant), { midden: C, straal: O.WIEL.r + 6 });
}

function render(variant, kant, hoek) {
  const B = new K.Beeld(CEL[0], CEL[1], CEL[2], CEL[3]);
  K.tekenModel(B, wielModel(variant, hoek), { richting: kant, rust: true });
  K.belicht(B);
  K.omlijn(B);
  return B;
}

// ---------------------------------------------------------------- metingen

const alfa = (r, i) => r.rgba[i * 4 + 3] >= 128;
const verschil = (a, i, b, j) => Math.hypot(a.rgba[i * 4] - b.rgba[j * 4], a.rgba[i * 4 + 1] - b.rgba[j * 4 + 1], a.rgba[i * 4 + 2] - b.rgba[j * 4 + 2]);

// Vastzitten: op de zijvlakken (de normaal langs de as van het wiel, dus gelijk licht in elke stand) per plek op het
// wiel (op een halve eenheid) de kleur in elke stand; het gemiddelde verschil met het gemiddelde van die plek. Laag is vast.
// De plek op het wiel rekent dit zelf uit, los van de renderer: de plek in de wereld (B.pos) terug naar de ruimte van de
// kar (de kijkrichting eruit), en dan terug gedraaid over de hoek van die stand, om de as. Zo meet het voor elke variant
// hetzelfde: draait de kleur met het oppervlak mee, of blijft hij in de ruimte staan?
function vastzitten(beelden, rgbas, kant) {
  const h = (K.RICHTING[kant] * Math.PI) / 180;
  const fx = Math.cos(h), fy = Math.sin(h), rx = -fy, ry = fx;
  const as = [rx, ry, 0];
  const plekken = new Map();
  beelden.forEach((B, s) => {
    const th = STANDEN[s].hoek;
    const c = Math.cos(th), sn = Math.sin(th);
    for (let i = 0; i < B.b * B.h; i++) {
      if (B.ramp[i] < 0 || !(B.vlag[i] & K.VLAG.OMLIJN) || B.vlag[i] & K.VLAG.VAST) continue;
      if (Math.abs(B.nrm[i * 3] * as[0] + B.nrm[i * 3 + 1] * as[1]) < 0.9) continue;
      const WX = B.pos[i * 3], WY = B.pos[i * 3 + 1], WZ = B.pos[i * 3 + 2];
      const x = WX * rx + WY * ry, y = WX * fx + WY * fy;
      const dy = y - C[1], dz = WZ - C[2];
      const ry0 = C[1] + dy * c - dz * sn, rz0 = C[2] + dy * sn + dz * c;
      const sleutel = `${Math.round(x * 2)}|${Math.round(ry0 * 2)}|${Math.round(rz0 * 2)}`;
      const k = rgbas[s];
      (plekken.get(sleutel) || plekken.set(sleutel, []).get(sleutel)).push([k.rgba[i * 4], k.rgba[i * 4 + 1], k.rgba[i * 4 + 2]]);
    }
  });
  let som = 0, n = 0;
  for (const lijst of plekken.values()) {
    if (lijst.length < 3) continue;
    const m = [0, 1, 2].map((c) => lijst.reduce((s, k) => s + k[c], 0) / lijst.length);
    for (const k of lijst) {
      som += Math.hypot(k[0] - m[0], k[1] - m[1], k[2] - m[2]);
      n++;
    }
  }
  return { verschil: +(som / Math.max(1, n)).toFixed(1), plekken: n };
}
// Hoeveel pixels gelijk zijn tussen twee beelden (van wat in een van beide staat), in procent.
function gelijkheid(a, b) {
  let zelfde = 0, samen = 0;
  for (let i = 0; i < a.b * a.h; i++) {
    if (!alfa(a, i) && !alfa(b, i)) continue;
    samen++;
    if (alfa(a, i) === alfa(b, i) && verschil(a, i, b, i) < 1) zelfde++;
  }
  return +((zelfde / Math.max(1, samen)) * 100).toFixed(2);
}
// Het silhouet van twee beelden: hoeveel pixels anders zijn (in of uit), in procent van het wiel.
function silhouetVerschil(a, b) {
  let anders = 0, wiel = 0;
  for (let i = 0; i < a.b * a.h; i++) {
    if (alfa(a, i) || alfa(b, i)) wiel++;
    if (alfa(a, i) !== alfa(b, i)) anders++;
  }
  return +((anders / Math.max(1, wiel)) * 100).toFixed(2);
}
// Verspringen tussen opeenvolgende standen: het gemiddelde kleurverschil per pixel van het wiel. Het wiel draait, dus dit
// is nooit nul; het zegt hoe onrustig het beeld is (fijne textuur die kartelt, geeft meer).
function verspringen(rgbas) {
  let som = 0, n = 0;
  for (let s = 1; s < 8; s++) {
    const a = rgbas[s - 1], b = rgbas[s];
    for (let i = 0; i < a.b * a.h; i++) {
      if (!alfa(a, i) || !alfa(b, i)) continue;
      som += verschil(a, i, b, i);
      n++;
    }
  }
  return +(som / Math.max(1, n)).toFixed(1);
}

// ---------------------------------------------------------------- de platen

function uitsnede(beelden) {
  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
  for (const r of beelden) for (let y = 0; y < r.h; y++) for (let x = 0; x < r.b; x++) if (alfa(r, y * r.b + x)) {
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  return { x0: x0 - 2, y0: y0 - 2, b: x1 - x0 + 5, h: y1 - y0 + 5 };
}
function snij(r, u, Z = 1, grond = [70, 82, 56]) {
  const uit = { b: u.b * Z, h: u.h * Z, rgba: Buffer.alloc(u.b * Z * u.h * Z * 4) };
  for (let y = 0; y < uit.h; y++) for (let x = 0; x < uit.b; x++) {
    const sx = u.x0 + Math.floor(x / Z), sy = u.y0 + Math.floor(y / Z);
    const s = (sy * r.b + sx) * 4;
    const d = (y * uit.b + x) * 4;
    if (sx >= 0 && sy >= 0 && sx < r.b && sy < r.h && r.rgba[s + 3] >= 128) r.rgba.copy(uit.rgba, d, s, s + 4);
    else uit.rgba.set([...grond, 255], d);
  }
  return uit;
}

function main() {
  fs.mkdirSync(UIT, { recursive: true });
  const t0 = Date.now();
  const VARIANTEN = ['oud', 'glijdend', 'nieuw', 'ruit', 'zonderMip'];
  const NAAM = { oud: 'oud (procedureel hout)', glijdend: 'AI-texturen zonder rusthouding (glijdend)', nieuw: 'nieuw (AI-texturen)', ruit: 'controle (ruitjes)', zonderMip: 'nieuw, zonder mip-niveaus' };
  // Eerst alles renderen; dan per variant één palet over alle richtingen en standen.
  const B = {};
  for (const v of VARIANTEN) {
    B[v] = {};
    for (const kant of K.KANTEN) B[v][kant] = STANDEN.map((s) => render(v, kant, s.hoek));
  }
  const R = {};
  for (const v of VARIANTEN) {
    let palet = null;
    if (v !== 'oud') {
      const kleuren = [];
      for (const kant of K.KANTEN) for (const b of B[v][kant]) {
        if (!b.kleur) continue;
        for (let i = 0; i < b.b * b.h; i += 3) if (b.vlag[i] & K.VLAG.RGB && b.ramp[i] >= 0) kleuren.push([b.kleur[i * 4], b.kleur[i * 4 + 1], b.kleur[i * 4 + 2]]);
      }
      palet = TX.palet(kleuren, 48);
    }
    R[v] = {};
    for (const kant of K.KANTEN) R[v][kant] = B[v][kant].map((b) => K.kleurBeeld(b, { palet }));
  }
  // Metingen.
  const meting = {};
  for (const v of VARIANTEN) {
    const m = { vastzitten: [], volleSlag: [], verspringen: [], silhouetTegenOud: [] };
    for (const kant of K.KANTEN) {
      m.vastzitten.push(vastzitten(B[v][kant].slice(0, 8), R[v][kant].slice(0, 8), kant).verschil);
      m.volleSlag.push(gelijkheid(R[v][kant][0], R[v][kant][8]));
      m.verspringen.push(verspringen(R[v][kant]));
      m.silhouetTegenOud.push(Math.max(...R[v][kant].slice(0, 8).map((r, s) => silhouetVerschil(r, R.oud[kant][s]))));
    }
    const gem = (a) => +(a.reduce((s, x) => s + x, 0) / a.length).toFixed(2);
    meting[v] = { vastzitten: gem(m.vastzitten), volleSlagGelijk: gem(m.volleSlag), verspringen: gem(m.verspringen), silhouetVerschilMaxTegenOud: Math.max(...m.silhouetTegenOud), perRichting: m };
  }
  fs.writeFileSync(path.join(UIT, 'metingen.json'), JSON.stringify(meting, null, 2));
  // De platen: alle richtingen in stand 0, en alle standen naar zuidwest; vergroot (×3) en op de maat van het spel (×1).
  const u = uitsnede(VARIANTEN.flatMap((v) => K.KANTEN.flatMap((k) => R[v][k])));
  const rij = (v, lijst, Z, etiket) => lijst.map((r, i) => E.met(snij(r, u, Z), etiket(i)));
  E.bewaar(path.join(UIT, 'richtingen.png'), VARIANTEN.map((v) => rij(v, K.KANTEN.map((k) => R[v][k][0]), 3, (i) => (i === 0 ? `${NAAM[v]} · ${K.KANTEN[i]}` : K.KANTEN[i]))),
    'Het wagenwiel uit acht richtingen (stand 0), drie keer vergroot', 'Per rij een variant; dezelfde afwikkeling en hetzelfde palet in elke richting.');
  E.bewaar(path.join(UIT, 'standen.png'), VARIANTEN.map((v) => rij(v, R[v].ZW, 3, (i) => (i === 0 ? `${NAAM[v]} · ${STANDEN[i].naam}` : STANDEN[i].naam))),
    'Het wagenwiel naar zuidwest, in negen standen (11,25° per stand, en een volle slag), drie keer vergroot', 'Een textuur die vastzit, draait met de spaken mee; de volle slag moet gelijk zijn aan stand 0.');
  E.bewaar(path.join(UIT, 'spelmaat.png'), VARIANTEN.map((v) => rij(v, K.KANTEN.map((k) => R[v][k][0]).concat(R[v].ZW.slice(1, 8)), 1, (i) => (i === 0 ? v : ''))),
    'Op de maat van het spel (één pixel per eenheid): acht richtingen, dan zeven standen naar zuidwest', 'Zo groot staat het wiel in het spel; de AI-textuur moet het hier waarmaken.');
  // Bewegend: het draaien naar zuidwest, per variant, drie keer vergroot.
  for (const v of VARIANTEN) {
    const platen = R[v].ZW.slice(0, 8).map((r) => {
      const s = snij(r, u, 3);
      return { b: s.b, h: s.h, rgba: () => s.rgba };
    });
    fs.writeFileSync(path.join(UIT, `draaien-${v}.png`), apng(platen, { fps: 6 }));
  }
  console.log(`${((Date.now() - t0) / 1000).toFixed(0)} s, ${VARIANTEN.length * 8 * STANDEN.length} beelden`);
  for (const v of VARIANTEN) {
    const m = meting[v];
    console.log(`${v}: vastzitten ${m.vastzitten} (kleurverschil op dezelfde plek, lager is vaster), volle slag ${m.volleSlagGelijk}% gelijk, verspringen ${m.verspringen}, silhouet tegen oud hooguit ${m.silhouetVerschilMaxTegenOud}% anders`);
  }
}

main();
