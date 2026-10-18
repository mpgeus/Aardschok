// Onderdelen voor voertuigen, gereedschap en gebouwen (de HD-proef, werklijst vraag 180; gereedschap/ai/hd-wielproef.md):
// afstandsfuncties met afgeschuinde randen, zodat een rand het licht vangt en een naad donker wordt, en kleine dingen van
// ijzer (klinknagels, beslag). Elk onderdeel is een gewoon deel voor `model` (figuren.cjs): { f, g, m, deel }, met zijn
// afwikkeling ernaast (`TX.metUv`, textuur.cjs) voor een materiaal met een textuur. Geen eigenschappen erbij op het deel
// (dat maakte de renderer twee keer zo traag; textuur.cjs).
//
// Afspraken: een as is een eenheidsvector; `afschuin` is de straal van de ronding op de randen, in eenheden (0,3 tot 0,6
// leest op één pixel per eenheid als een lichte rand); een hoek is in radialen, gemeten zoals `TX.rond` hem meet.
'use strict';
const TX = require('./textuur.cjs');

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const kruis = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const eenh = (a) => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
// Dezelfde twee loodrechte richtingen als textuur.cjs (basisBij), zodat een hoek hier dezelfde is als in `TX.rond`.
function basisBij(as) {
  const a = eenh(as);
  const hulp = Math.abs(a[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
  const e1 = eenh(kruis(hulp, a));
  return [a, e1, kruis(a, e1)];
}
// Een doos met ronde randen, in eigen assen: halve maten hx, hy, hz, ronding r.
function rondeDoos(x, y, z, hx, hy, hz, r) {
  const qx = Math.abs(x) - hx + r;
  const qy = Math.abs(y) - hy + r;
  const qz = Math.abs(z) - hz + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r;
}

// Een stuk van een ring om een as (een velgstuk, een band, een hoepel om een ton): van straal r0 tot r1, `half` aan
// weerszijden langs de as (om `langsAs` heen), van hoek `van` tot `tot` (zonder: rondom). De randen afgeschuind. Bij een
// stuk wordt de afstand langs de omtrek gemeten, op de straal van het punt; goed genoeg voor stukken tot een halve slag.
function ringStuk({ midden, as, r0, r1, half, langsAs = 0, van = null, tot = null, afschuin = 0.4, m, deel }) {
  const [a, e1, e2] = basisBij(as);
  const rm = (r0 + r1) / 2;
  const hr = (r1 - r0) / 2;
  const heel = van === null;
  const mid = heel ? 0 : (van + tot) / 2;
  const span = heel ? 0 : (tot - van) / 2;
  const f = (x, y, z) => {
    const p = sub([x, y, z], midden);
    const pa = dot(p, a) - langsAs;
    const p1 = dot(p, e1);
    const p2 = dot(p, e2);
    const rho = Math.hypot(p1, p2);
    let t = 0;
    if (!heel) {
      let d = Math.atan2(p2, p1) - mid;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      t = Math.abs(d) * rho - span * rho;
    }
    if (heel) return rondeDoos(rho - rm, pa, 0, hr, half, 1e3, afschuin);
    return rondeDoos(rho - rm, pa, t + 1e3, hr, half, 1e3, afschuin);
  };
  // de grensbol: om het hele stuk (een ring) of om de koorde van het stuk
  let g;
  if (heel) g = [midden[0] + a[0] * langsAs, midden[1] + a[1] * langsAs, midden[2] + a[2] * langsAs, Math.hypot(r1, half) + 0.5];
  else {
    const c = [Math.cos(mid), Math.sin(mid)];
    const om = [0, 1, 2].map((k) => midden[k] + a[k] * langsAs + (e1[k] * c[0] + e2[k] * c[1]) * rm);
    g = [...om, Math.hypot(r1 * Math.sin(Math.min(span, Math.PI / 2)) + hr, half) + hr + 1];
  }
  return TX.metUv({ f, g, m, deel }, TX.rond(midden, as, rm));
}

// Een balk van a naar b (een spaak, een dissel, een rong): een doorsnede met ronde randen, breed `b0` bij a en `b1` bij b
// (langs `breedteRichting`, loodrecht op de balk gemaakt), en dik `d0` en `d1` (de derde richting). Taps, afgeschuind.
function balk(a, b, { b0, b1 = b0, d0, d1 = d0, breedteRichting, afschuin = 0.4, m, deel }) {
  const as = sub(b, a);
  const lengte = Math.hypot(as[0], as[1], as[2]);
  const e0 = eenh(as);
  let eb = sub(breedteRichting, e0.map((c) => c * dot(breedteRichting, e0)));
  eb = eenh(eb);
  const ed = kruis(e0, eb);
  const f = (x, y, z) => {
    const p = sub([x, y, z], a);
    const s = dot(p, e0);
    const t = Math.max(0, Math.min(1, s / lengte));
    const hb = (b0 + (b1 - b0) * t) / 2;
    const hd = (d0 + (d1 - d0) * t) / 2;
    // een taps toelopende doos: de afstand in de doorsnede is bij benadering goed, want de helling is klein
    return rondeDoos(s - lengte / 2, dot(p, eb), dot(p, ed), lengte / 2, hb, hd, Math.min(afschuin, hb, hd) * 0.98);
  };
  const g = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, lengte / 2 + Math.max(b0, b1, d0, d1) + 0.5];
  return TX.metUv({ f, g, m, deel }, TX.langs(a, b, Math.max(b0, d0) / 2));
}

// Een klinknagel of spijkerkop op een oppervlak: een bolkapje op punt p, met de normaal n naar buiten, straal r (de voet)
// en hoogte h.
function nagel(p, n, r, h, m, deel) {
  const nn = eenh(n);
  const R = (r * r + h * h) / (2 * h);
  const c = [p[0] - nn[0] * (R - h), p[1] - nn[1] * (R - h), p[2] - nn[2] * (R - h)];
  return {
    f: (x, y, z) => Math.max(Math.hypot(x - c[0], y - c[1], z - c[2]) - R, -((x - p[0]) * nn[0] + (y - p[1]) * nn[1] + (z - p[2]) * nn[2]) - 0.15),
    g: [p[0], p[1], p[2], r + h + 0.3],
    m,
    deel,
  };
}

// Nagels in een kring om een as: `aantal` op straal r, op `langsAs` langs de as, met hun kop naar `kant` (+1 of -1, langs
// de as), te beginnen op hoek `begin`. Eén deel voor de hele kring: het punt wordt om de as teruggedraaid naar de nagel die
// het dichtst bij is, zodat zestien nagels niet zestien keer rekenen.
function nagelKring({ midden, as, r, aantal, langsAs, kant = 1, begin = 0, straal = 0.5, hoogte = 0.3, m, deel }) {
  const [a, e1, e2] = basisBij(as);
  const stap = (2 * Math.PI) / aantal;
  const R = (straal * straal + hoogte * hoogte) / (2 * hoogte);
  const f = (x, y, z) => {
    const p = sub([x, y, z], midden);
    const pa = dot(p, a) - langsAs;
    const p1 = dot(p, e1);
    const p2 = dot(p, e2);
    const h = Math.atan2(p2, p1);
    const k = Math.round((h - begin) / stap);
    const d = h - (begin + k * stap);
    const rho = Math.hypot(p1, p2);
    // in de assen van die ene nagel: langs de straal, langs de omtrek, en langs de as (naar buiten met `kant`)
    const qr = rho * Math.cos(d) - r;
    const qt = rho * Math.sin(d);
    const qa = pa * kant;
    return Math.max(Math.hypot(qr, qt, qa + (R - hoogte)) - R, -qa - 0.15);
  };
  const g = [midden[0] + a[0] * langsAs, midden[1] + a[1] * langsAs, midden[2] + a[2] * langsAs, r + straal + hoogte + 0.5];
  return { f, g, m, deel };
}

// Een punt op een kring om een as (voor wie onderdelen op hoeken zet): hoek h, straal r, langsAs.
function opKring(midden, as, h, r, langsAs = 0) {
  const [a, e1, e2] = basisBij(as);
  return [0, 1, 2].map((j) => midden[j] + a[j] * langsAs + (e1[j] * Math.cos(h) + e2[j] * Math.sin(h)) * r);
}

module.exports = { ringStuk, balk, nagel, nagelKring, opKring, rondeDoos, basisBij };
