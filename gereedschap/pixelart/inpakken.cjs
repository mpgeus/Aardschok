// Vellen inpakken (werklijst vraag 114, 2a; Marcel, 4 okt: "1 ja 2 alleen nog de grond"): van een raster van even grote
// cellen naar een vel waarop elke tekening strak gesneden naast de andere ligt, met zijn eigen rechthoek en anker.
//
// Waarom: een browser houdt een vel uitgepakt vast, vier bytes per pixel, ook de lege. In een raster is elke cel zo
// groot als de grootste tekening, dus tegels/gebouwen.png was in de browser 157 MB voor 22 MB aan tekeningen (69 van
// zijn 96 cellen waren leeg), en tegels/bouwfasen.png 271 MB, en 8303 pixels hoog: boven de 8192 die veel videokaarten
// als één beeld aankunnen. Alles samen laadde het spel bijna 900 MB aan vellen; ingepakt is dat zo'n 210.
//
// Wie het gebruikt:
//   naar-tiled.cjs   de vellen met voorwerpen in tegels/ (bomen, begroeiing, gebouwen, erf, tuin, huizen): elke tegel
//                    krijgt in tegels.json zijn eigen `cel` [x, y, b, h] en `anker`. De grond blijft een raster, want
//                    Tiled schildert ermee.
//   bouwfasen.cjs    per gebouw een eigen klein vel met zijn vijf fases (tegels/bouwfasen/<tekening>.png), dat het spel
//                    pas laadt als er zo'n gebouw in aanbouw staat.
//   naar-spel.cjs    de figuren in beelden/figuren/: daar blijft het raster (een rij per kijkrichting, een kolom per
//                    beeld), maar krimpt de cel tot wat er in alle cellen samen staat.
//
// Alles werkt op een beeld { b, h, rgba } (8-bit RGBA, rij na rij, zoals kern.cjs het schrijft en leest), zodat het
// ook op een vel kan dat al op schijf staat. Een tekening verandert niet: alleen waar hij op het vel staat.
'use strict';
const K = require('./kern.cjs');

// Groter laadt niet elke videokaart als één beeld (8303 was het bouwfasenvel; zie hierboven).
const MAX_ZIJDE = 8192;
// Tussen twee tekeningen twee doorzichtige pixels: wie een tekening verkleind tekent (het overzicht, js/main.js), kan
// anders net een pixel van de buurman meenemen.
const TUSSENRUIMTE = 2;
// De breedtes die het inpakken probeert; het neemt de breedte die het vel het minst langgerekt maakt.
const BREEDTES = [256, 512, 1024, 2048, 3072, 4096, 6144, 8192];

const leegBeeld = (b, h) => ({ b, h, rgba: Buffer.alloc(b * h * 4) });

// Waar er binnen de rechthoek [x, y, b, h] van een beeld iets getekend staat: [x0, y0, x1, y1] (x1 en y1 net
// erbuiten), of null als hij leeg is.
function grens(beeld, [rx, ry, rb, rh]) {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -1;
  let y1 = -1;
  for (let y = ry; y < ry + rh; y++) {
    const rij = y * beeld.b;
    for (let x = rx; x < rx + rb; x++) {
      if (!beeld.rgba[(rij + x) * 4 + 3]) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      y1 = y;
    }
  }
  return x1 < 0 ? null : [x0, y0, x1 + 1, y1 + 1];
}

// De rechthoek [x, y, b, h] van `van` op (dx, dy) in `naar`.
function kopieer(van, [x, y, b, h], naar, dx, dy) {
  for (let j = 0; j < h; j++) {
    const bron = ((y + j) * van.b + x) * 4;
    van.rgba.copy(naar.rgba, ((dy + j) * naar.b + dx) * 4, bron, bron + b * 4);
  }
}

// Waar elke rechthoek { b, h } op een vel komt (null slaat het over): in planken, de hoogste eerst, van links naar
// rechts, tot de plank vol is. Het vel is zo breed als nodig. Altijd dezelfde volgorde, dus hetzelfde vel als er
// niets verandert.
function pakIn(maten) {
  const volgorde = maten
    .map((m, i) => i)
    .filter((i) => maten[i])
    .sort((p, q) => maten[q].h - maten[p].h || maten[q].b - maten[p].b || p - q);
  const breedste = Math.max(1, ...volgorde.map((i) => maten[i].b));
  let beste = null;
  for (const breedte of BREEDTES) {
    if (breedte < breedste) continue;
    const plekken = [];
    let x = 0;
    let y = 0;
    let plank = 0;
    let b = 1;
    for (const i of volgorde) {
      const m = maten[i];
      if (x > 0 && x + m.b > breedte) {
        y += plank + TUSSENRUIMTE;
        x = 0;
        plank = 0;
      }
      plekken[i] = [x, y];
      b = Math.max(b, x + m.b);
      x += m.b + TUSSENRUIMTE;
      plank = Math.max(plank, m.h);
    }
    const h = Math.max(1, y + plank);
    if (!beste || Math.max(b, h) < Math.max(beste.b, beste.h)) beste = { b, h, plekken };
  }
  if (!beste || Math.max(beste.b, beste.h) > MAX_ZIJDE) {
    throw new Error(`inpakken: het vel wordt ${beste ? `${beste.b}×${beste.h}` : 'te breed'}, groter dan ${MAX_ZIJDE}: verdeel de tekeningen over twee vellen`);
  }
  return beste;
}

// Een vel met losse tekeningen inpakken. `tegels` zegt per tegel waar hij in `beeld` staat ({ cel: [x, y, b, h],
// anker: [ax, ay] }, het anker binnen die cel), of null voor een lege plek. Elke tekening wordt strak gesneden; met
// `houdHoogte` alleen links en rechts, en houdt hij de hoogte van zijn cel (voor de wind, zie naar-tiled.cjs).
// Geeft het nieuwe vel, en per tegel zijn nieuwe cel en anker, of null als er niets getekend stond.
function pakVelIn(beeld, tegels, { houdHoogte = false } = {}) {
  const stukken = tegels.map((t) => {
    if (!t) return null;
    const g = grens(beeld, t.cel);
    if (!g) return null;
    const [x0, y0, x1, y1] = houdHoogte ? [g[0], t.cel[1], g[2], t.cel[1] + t.cel[3]] : g;
    return { van: [x0, y0, x1 - x0, y1 - y0], anker: [t.anker[0] - (x0 - t.cel[0]), t.anker[1] - (y0 - t.cel[1])] };
  });
  const plan = pakIn(stukken.map((s) => s && { b: s.van[2], h: s.van[3] }));
  const vel = leegBeeld(plan.b, plan.h);
  const nieuw = stukken.map((s, i) => {
    if (!s) return null;
    const [x, y] = plan.plekken[i];
    kopieer(beeld, s.van, vel, x, y);
    return { cel: [x, y, s.van[2], s.van[3]], anker: s.anker };
  });
  return { beeld: vel, tegels: nieuw };
}

// Een raster van even grote cellen (een figuur: een rij per kijkrichting, een kolom per beeld) laten krimpen tot wat
// er in al zijn cellen samen staat. Het raster blijft, dus het spel snijdt nog altijd kolom maal cel; alleen is de
// cel kleiner, en schuift het anker mee. Een vel dat al gekrompen is, blijft zoals het is.
function krimpRaster(beeld, cel, anker) {
  const [cb, ch] = cel;
  const kolommen = Math.round(beeld.b / cb);
  const rijen = Math.round(beeld.h / ch);
  let u = null;
  for (let r = 0; r < rijen; r++) {
    for (let k = 0; k < kolommen; k++) {
      const g = grens(beeld, [k * cb, r * ch, cb, ch]);
      if (!g) continue;
      const l = [g[0] - k * cb, g[1] - r * ch, g[2] - k * cb, g[3] - r * ch];
      u = u ? [Math.min(u[0], l[0]), Math.min(u[1], l[1]), Math.max(u[2], l[2]), Math.max(u[3], l[3])] : l;
    }
  }
  if (!u || (u[0] === 0 && u[1] === 0 && u[2] === cb && u[3] === ch)) return { beeld, cel, anker, gekrompen: false };
  const nb = u[2] - u[0];
  const nh = u[3] - u[1];
  const vel = leegBeeld(kolommen * nb, rijen * nh);
  for (let r = 0; r < rijen; r++) {
    for (let k = 0; k < kolommen; k++) kopieer(beeld, [k * cb + u[0], r * ch + u[1], nb, nh], vel, k * nb, r * nh);
  }
  return { beeld: vel, cel: [nb, nh], anker: [anker[0] - u[0], anker[1] - u[1]], gekrompen: true };
}

// Een plaat van kern.cjs als beeld.
const beeldVanPlaat = (plaat) => ({ b: plaat.b, h: plaat.h, rgba: plaat.rgba() });

module.exports = { MAX_ZIJDE, grens, kopieer, pakIn, pakVelIn, krimpRaster, beeldVanPlaat, leegBeeld, leesPng: K.leesPng, pngVanBeeld: K.pngVanBeeld };
