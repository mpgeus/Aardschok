// Texturen voor de renderer (werklijst vraag 180; gereedschap/ai/hybride-voorstel.md; de proef met één wagenwiel, Marcel,
// 18 okt: "bouw dit als herbruikbaar materiaalsysteem, niet als een speciale oplossing die uitsluitend voor dit
// wagenwiel werkt"). Een materiaal kan sinds 18 okt een RGB-textuur hebben (`textuurMateriaal`); kern.cjs haalt dan per
// pixel de kleur op de plek van dat punt in de rusthouding van zijn onderdeel, en belicht die zelf. Zonder textuur
// verandert er niets (gelijk.cjs toetst dat).
//
// Drie stukken:
// - een textuur: een PNG met zijn mip-niveaus (elk niveau de helft, het gemiddelde van vier), zodat een fijne textuur op
//   onze kleine sprites niet gaat flikkeren of kartelen;
// - een afwikkeling per onderdeel (`metUv(deel, uv)`): hoe het oppervlak van dát onderdeel plat gaat. `rond` voor wat om een as
//   ligt (een velg, een band, een naaf, een ton), `langs` voor wat langs een as loopt (een spaak, een stok, een poot),
//   `vlak` voor een plank. Een afwikkeling geeft [u, v, omtrekU, omtrekV] in eenheden; is een richting gesloten (`rond`
//   om de as, `langs` om de stok heen), dan staat zijn omtrek erbij, en sluit de textuur rondom precies aan, zonder naad.
//   De afspraak: u is de richting van de nerf (een textuur heeft zijn nerf, zijn strepen, horizontaal);
// - een materiaal (`textuurMateriaal`): welke textuur, hoeveel texels per eenheid, en hoe hij belicht wordt. Zonder
//   afwikkeling op het onderdeel valt het terug op triplanair: drie projecties, gemengd naar de normaal.
'use strict';
const fs = require('fs');
const K = require('./kern.cjs');
const HH = require('./houding.cjs');

// ---------------------------------------------------------------- de textuur en zijn mip-niveaus

function vanRgba(b, h, rgba) {
  const rgb = new Float32Array(b * h * 3);
  for (let i = 0; i < b * h; i++) {
    rgb[i * 3] = rgba[i * 4];
    rgb[i * 3 + 1] = rgba[i * 4 + 1];
    rgb[i * 3 + 2] = rgba[i * 4 + 2];
  }
  return metMips(b, h, rgb);
}
function metMips(b, h, rgb) {
  const mips = [{ b, h, rgb }];
  while (mips[mips.length - 1].b > 1 && mips[mips.length - 1].h > 1) {
    const o = mips[mips.length - 1];
    const nb = o.b >> 1;
    const nh = o.h >> 1;
    const n = new Float32Array(nb * nh * 3);
    for (let y = 0; y < nh; y++) for (let x = 0; x < nb; x++) for (let c = 0; c < 3; c++) {
      const s = (dy, dx) => o.rgb[((y * 2 + dy) * o.b + x * 2 + dx) * 3 + c];
      n[(y * nb + x) * 3 + c] = (s(0, 0) + s(0, 1) + s(1, 0) + s(1, 1)) / 4;
    }
    mips.push({ b: nb, h: nh, rgb: n });
  }
  return { b, h, mips };
}
// Een textuur uit een PNG (RGBA, zoals de tekenstraat ze schrijft), of uit een functie (x, y) → [r, g, b].
const laad = (pad) => {
  const { b, h, rgba } = K.leesPng(fs.readFileSync(pad));
  return vanRgba(b, h, rgba);
};
function maak(b, h, f) {
  const rgba = Buffer.alloc(b * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) rgba.set([...f(x, y).map((v) => Math.max(0, Math.min(255, Math.round(v)))), 255], (y * b + x) * 4);
  return vanRgba(b, h, rgba);
}

// Monsteren op (u, v) in texels van niveau 0, op mip-niveau `niveau` (mag een breuk zijn: dan gemengd), herhalend,
// bilineair.
function opNiveau(T, u, v, n) {
  const L = T.mips[Math.max(0, Math.min(n, T.mips.length - 1))];
  const s = T.b / L.b;
  const x = u / s - 0.5;
  const y = v / s - 0.5;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const w = (a, m) => ((a % m) + m) % m;
  const p = (xx, yy, c) => L.rgb[(w(yy, L.h) * L.b + w(xx, L.b)) * 3 + c];
  const uit = [0, 0, 0];
  for (let c = 0; c < 3; c++) {
    uit[c] = (p(x0, y0, c) * (1 - fx) + p(x0 + 1, y0, c) * fx) * (1 - fy) + (p(x0, y0 + 1, c) * (1 - fx) + p(x0 + 1, y0 + 1, c) * fx) * fy;
  }
  return uit;
}
function monster(T, u, v, niveau) {
  const n0 = Math.floor(niveau);
  const t = niveau - n0;
  const a = opNiveau(T, u, v, n0);
  if (t < 0.01) return a;
  const b = opNiveau(T, u, v, n0 + 1);
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

// De hoogte uit de helderheid (een AI-textuur heeft geen eigen hoogtekaart; de HD-proef, `gereedschap/ai/hd-wielproef.md`):
// het verschil met het gemiddelde in de buurt (mip-niveau `grof`), gedeeld door de spreiding, zodat 1 een gewone nerf is.
// Licht is hoog, donker (de groef, de scheur) diep. Een textuur als de andere, met [h, h, h].
function hoogteVan(T, grof = 4) {
  const L0 = T.mips[0];
  const n = L0.b * L0.h;
  const lum = (k) => 0.3 * k[0] + 0.59 * k[1] + 0.11 * k[2];
  const h = new Float32Array(n);
  let som2 = 0;
  for (let y = 0; y < L0.h; y++) for (let x = 0; x < L0.b; x++) {
    const i = y * L0.b + x;
    const v = lum([L0.rgb[i * 3], L0.rgb[i * 3 + 1], L0.rgb[i * 3 + 2]]) - lum(opNiveau(T, x + 0.5, y + 0.5, grof));
    h[i] = v;
    som2 += v * v;
  }
  const sd = Math.sqrt(som2 / n) || 1;
  const rgb = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) rgb[i * 3] = rgb[i * 3 + 1] = rgb[i * 3 + 2] = h[i] / sd;
  return metMips(L0.b, L0.h, rgb);
}

// ---------------------------------------------------------------- naast het onderdeel: afwikkeling en versiering

// Wat bij een onderdeel hoort, hangt ernaast, niet eraan: een eigenschap `uv` op het onderdeel gaf het in V8 een andere
// vorm, en dan werd de rekenlus over de onderdelen (bouwSdf in kern.cjs) twee keer zo traag, ook voor elk model dat erna
// kwam (gemeten op 18 okt: de ossenkar van 2,0 naar 4,7 s per beeld, de heer van 0,7 naar 1,8). metUv(deel, uv) zet de
// afwikkeling en geeft het deel terug, uvVan(deel) leest hem; metVersiering(deel, lijst) zet wat er op het oppervlak zit
// (klinknagels, zie `versier`); beweeg(delen, B) is beweegDelen uit houding.cjs, met alles mee naar het bewogen deel
// (dat is een nieuw object).
const AAN = new WeakMap();
const bij = (deel) => AAN.get(deel) || AAN.set(deel, {}).get(deel);
function metUv(deel, uv) {
  bij(deel).uv = uv;
  return deel;
}
function metVersiering(deel, lijst) {
  bij(deel).versiering = lijst;
  return deel;
}
const uvVan = (deel) => (deel && AAN.has(deel) ? AAN.get(deel).uv : undefined);
const versieringVan = (deel) => (deel && AAN.has(deel) ? AAN.get(deel).versiering : undefined);
function beweeg(delen, B) {
  const nieuw = HH.beweegDelen(delen, B);
  nieuw.forEach((d, i) => {
    const a = AAN.get(delen[i]);
    if (a) AAN.set(d, a);
  });
  return nieuw;
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const kruis = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const eenh = (a) => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
// Twee loodrechte richtingen bij een as.
function basisBij(as) {
  const a = eenh(as);
  const hulp = Math.abs(a[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
  const e1 = eenh(kruis(hulp, a));
  return [a, e1, kruis(a, e1)];
}

// Rond om een as door `midden` (een velg, een band, een naaf, een ton): u langs de omtrek op straal `r` (de nerf loopt
// rondom), v over de breedte (langs de as) of, op een zijvlak (de normaal langs de as), naar buiten. De omtrek 2πr gaat
// mee, zodat de textuur rondom sluit.
function rond(midden, as, r) {
  const [a, e1, e2] = basisBij(as);
  const omtrek = 2 * Math.PI * r;
  return (x, y, z, nx, ny, nz) => {
    const p = sub([x, y, z], midden);
    const hoek = Math.atan2(dot(p, e2), dot(p, e1));
    const u = ((hoek / (2 * Math.PI)) + 1) % 1 * omtrek;
    const langsAs = dot(p, a);
    const zij = Math.abs(nx * a[0] + ny * a[1] + nz * a[2]) > 0.6;
    const straal = Math.hypot(dot(p, e1), dot(p, e2));
    return [u, zij ? straal + 1000 * Math.sign(langsAs) : langsAs, omtrek];
  };
}
// Langs een as van a naar b (een spaak, een stok, een poot): u langs de as (de nerf loopt in de lengte), v om de as heen,
// op straal `r`; de omtrek om de stok gaat mee.
function langs(a, b, r) {
  const as = sub(b, a);
  const [e0, e1, e2] = basisBij(as);
  const omtrek = 2 * Math.PI * r;
  return (x, y, z) => {
    const p = sub([x, y, z], a);
    const hoek = Math.atan2(dot(p, e2), dot(p, e1));
    return [dot(p, e0), ((hoek / (2 * Math.PI)) + 1) % 1 * omtrek, undefined, omtrek];
  };
}
// Een vlak (een plank): u en v langs twee richtingen.
function vlak(eu, ev, oorsprong = [0, 0, 0]) {
  return (x, y, z) => {
    const p = sub([x, y, z], oorsprong);
    return [dot(p, eu), dot(p, ev)];
  };
}

// ---------------------------------------------------------------- het materiaal

// Een materiaal met een textuur. o: { textuur (laad of maak), ramp (voor de omlijning: de donkerste tint van deze ramp,
// zoals nu), schaal (texels per eenheid), lo, hi (zoals elk materiaal: het licht schuift de stap daartussen; de kleur
// wordt de textuur maal dat licht), glans, ... }. kern.cjs roept `textuur(x, y, z, nx, ny, nz, deel, kijk, fijn)` aan
// met het punt en de normaal in de rusthouding van het onderdeel (en de interne resolutie, kern.cjs o.fijn), en krijgt
// [r, g, b].
//
// De afwerking (sinds 18 okt, de HD-proef; alles optioneel, zonder blijft het materiaal zoals het was):
// - o.contrast: de variatie van de textuur om zijn gemiddelde maal dit (een foto is vlak naast pixel art);
// - o.reliëf: de diepte van de hoogte uit de helderheid (`hoogteVan`), in eenheden: dan heeft het materiaal ook
//   `hoogte(x, y, z, nx, ny, nz, deel, fijn)`, en buigt kern.cjs de normaal ermee (o.afwerking.reliëf);
// - o.afwerking: wat kern.cjs met het licht doet (textuurPixel daar): reliëf, holtes, randen, warm en koel, glans;
// - de versiering van het onderdeel (`metVersiering`): klinknagels op het oppervlak, met hun eigen kleur en hoogte.
function textuurMateriaal(o) {
  // o.toon: [r, g, b], de kleur waar het gemiddelde van de textuur heen schuift (per kanaal vermenigvuldigd): zo past een
  // AI-textuur in de kleuren van de rest van de kunst, met zijn nerf en zijn variatie (18 okt: het eerste hout was te
  // donker en te grijs naast het warme hout van de ossenkar).
  const T0 = o.toon ? getoond(o.textuur, o.toon) : o.textuur;
  const T = o.contrast ? metContrast(T0, o.contrast) : T0;
  const HT = o.reliëf ? hoogteVan(T) : null;
  const schaal = o.schaal || 4;
  // De sprite is zo'n één pixel per eenheid: een texel per pixel is niveau 0 bij schaal 1. Een schuin vlak ziet meer
  // texels per pixel: dan een niveau hoger, naar hoe schuin.
  // o.mip === false: altijd het fijnste niveau (alleen om te laten zien wat de mip-niveaus doen tegen kartelen). Met
  // fijn (de interne resolutie) is een pixel 1/fijn eenheid: zoveel minder texels per pixel.
  const niveauVan = (kijk, fijn = 1) => (o.mip === false ? 0 : Math.max(0, Math.log2(Math.max(1, schaal / fijn)) + Math.log2(1 / Math.max(0.35, kijk)) * 0.5));
  // Een textuur op het punt: langs de afwikkeling van het onderdeel, of triplanair.
  // Een gesloten richting (omtrek): zoveel hele textuurbreedtes rondom als het dichtst bij de schaal ligt, zodat de naad
  // verdwijnt. Past er nog geen halve textuur rondom (een spaak, een stok), dan gespiegeld: heen en terug over de omtrek,
  // op de gewone schaal. (Tot 18 okt werd daar een hele textuur in geperst, bij een spaak 74 texels per eenheid in plaats
  // van 4, en dat ruiste.)
  const rondom = (w, omtrek, maat) => {
    if (!omtrek) return w * schaal;
    const n = Math.round((omtrek * schaal) / maat);
    if (n >= 1) return w * ((n * maat) / omtrek);
    const t = ((w % omtrek) + omtrek) % omtrek;
    return (omtrek / 2 - Math.abs(t - omtrek / 2)) * schaal;
  };
  function bemonster(X, x, y, z, nx, ny, nz, deel, niveau) {
    const uv = uvVan(deel);
    if (uv) {
      const [u, v, omtrekU, omtrekV] = uv(x, y, z, nx, ny, nz);
      return monster(X, rondom(u, omtrekU, X.b), rondom(v, omtrekV, X.h), niveau);
    }
    // Triplanair: drie projecties, gemengd naar de normaal (scherp gemengd, zodat er weinig vegen ontstaan).
    const w = [Math.abs(nx) ** 4, Math.abs(ny) ** 4, Math.abs(nz) ** 4];
    const s = w[0] + w[1] + w[2] || 1;
    const a = monster(X, y * schaal, z * schaal, niveau);
    const b = monster(X, x * schaal, z * schaal, niveau);
    const c = monster(X, x * schaal, y * schaal, niveau);
    return [0, 1, 2].map((k) => (a[k] * w[0] + b[k] * w[1] + c[k] * w[2]) / s);
  }
  const mat = {
    lo: 1,
    hi: 5,
    ...o,
    textuur: (x, y, z, nx, ny, nz, deel, kijk, fijn) => {
      const kleur = bemonster(T, x, y, z, nx, ny, nz, deel, niveauVan(kijk, fijn));
      const lijst = versieringVan(deel);
      return lijst ? versier(lijst, kleur, null, x, y, z, nx, ny, nz, deel, fijn) : kleur;
    },
  };
  if (HT) {
    mat.hoogte = (x, y, z, nx, ny, nz, deel, fijn) => {
      const h = bemonster(HT, x, y, z, nx, ny, nz, deel, niveauVan(1, fijn))[0] * o.reliëf;
      const lijst = versieringVan(deel);
      return lijst ? versier(lijst, null, h, x, y, z, nx, ny, nz, deel, fijn) : h;
    };
  }
  return mat;
}

// De variatie om het gemiddelde (van de hele textuur) maal k: een foto van hout is vlak naast pixel art.
function metContrast(T, k) {
  const m = T.mips[T.mips.length - 1].rgb;
  return { b: T.b, h: T.h, mips: T.mips.map((L) => ({ b: L.b, h: L.h, rgb: L.rgb.map((v, i) => Math.max(0, m[i % 3] + (v - m[i % 3]) * k)) })) };
}

// Versiering op het oppervlak van een onderdeel, langs zijn afwikkeling (zodat hij meedraait): nu klinknagels. Een
// item: { soort: 'nagels', aantal (rondom, bij een gesloten u) of afstand (in eenheden langs u), v: [v, ...] (de rijen),
// straal, hoogte (de bolling, in eenheden), kleur: [r, g, b], rand (hoe donker de rand eromheen, 0 tot 1) }. Met `kleur`
// geeft hij de kleur, met `h` de hoogte. De rand is zacht over een halve pixel (1/fijn eenheid is een pixel), zodat een
// nagel van een pixel niet flikkert.
function versier(lijst, kleur, h, x, y, z, nx, ny, nz, deel, fijn = 1) {
  const uv = uvVan(deel);
  if (!uv) return kleur || h;
  const [u, v, omtrekU] = uv(x, y, z, nx, ny, nz);
  const zacht = 0.5 / fijn;
  for (const it of lijst) {
    if (it.soort !== 'nagels') continue;
    const afstand = it.aantal && omtrekU ? omtrekU / it.aantal : it.afstand;
    const du = u - Math.round(u / afstand) * afstand;
    for (const v0 of it.v) {
      const d = Math.hypot(du, v - v0);
      const dekking = Math.max(0, Math.min(1, (it.straal - d) / zacht + 0.5));
      if (dekking <= 0) continue;
      if (h !== null) {
        const bol = Math.sqrt(Math.max(0, 1 - (d / it.straal) ** 2));
        h += (it.hoogte ?? 0.3) * bol * dekking;
      } else {
        // de kop, met een donkere rand: zacht naar de rand toe
        const randje = Math.max(0, Math.min(1, (d - it.straal * 0.62) / (it.straal * 0.38)));
        const k = it.kleur.map((c) => c * (1 - (it.rand ?? 0.55) * randje));
        kleur = kleur.map((c, j) => c + (k[j] - c) * dekking);
      }
    }
  }
  return h !== null ? h : kleur;
}

// De textuur met zijn gemiddelde op `doel` (het laatste mip-niveau is het gemiddelde).
function getoond(T, doel) {
  const m = T.mips[T.mips.length - 1].rgb;
  const f = [0, 1, 2].map((c) => doel[c] / Math.max(1, m[c]));
  return { b: T.b, h: T.h, mips: T.mips.map((L) => ({ b: L.b, h: L.h, rgb: L.rgb.map((v, i) => v * f[i % 3]) })) };
}

// ---------------------------------------------------------------- een palet per ding

// Kleuren tot `n` met median cut (vast, zonder toeval). Eén palet voor alle beelden van één ding (alle richtingen, alle
// standen): dan verspringt een kleur niet tussen twee beelden.
function palet(kleuren, n) {
  let dozen = [kleuren];
  while (dozen.length < n) {
    dozen.sort((a, c) => c.length - a.length);
    const d = dozen.shift();
    if (d.length < 2) {
      dozen.push(d);
      break;
    }
    const as = [0, 1, 2].map((j) => {
      let lo = Infinity, hi = -Infinity;
      for (const k of d) { if (k[j] < lo) lo = k[j]; if (k[j] > hi) hi = k[j]; }
      return hi - lo;
    });
    const j = as.indexOf(Math.max(...as));
    d.sort((a, c) => a[j] - c[j]);
    dozen.push(d.slice(0, d.length >> 1), d.slice(d.length >> 1));
  }
  return dozen.filter((d) => d.length).map((d) => [0, 1, 2].map((j) => Math.round(d.reduce((s, k) => s + k[j], 0) / d.length)));
}

module.exports = { laad, maak, monster, rond, langs, vlak, metUv, uvVan, metVersiering, beweeg, textuurMateriaal, hoogteVan, palet };
